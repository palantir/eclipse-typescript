var ByteOrderMark;
(function (ByteOrderMark) {
    ByteOrderMark[ByteOrderMark["None"] = 0] = "None";
    ByteOrderMark[ByteOrderMark["Utf8"] = 1] = "Utf8";
    ByteOrderMark[ByteOrderMark["Utf16BigEndian"] = 2] = "Utf16BigEndian";
    ByteOrderMark[ByteOrderMark["Utf16LittleEndian"] = 3] = "Utf16LittleEndian";
})(ByteOrderMark || (ByteOrderMark = {}));

var FileInformation = (function () {
    function FileInformation(contents, byteOrderMark) {
        this._contents = contents;
        this._byteOrderMark = byteOrderMark;
    }
    FileInformation.prototype.contents = function () {
        return this._contents;
    };

    FileInformation.prototype.byteOrderMark = function () {
        return this._byteOrderMark;
    };
    return FileInformation;
})();

var Environment = (function () {
    function getWindowsScriptHostEnvironment() {
        try  {
            var fso = new ActiveXObject("Scripting.FileSystemObject");
        } catch (e) {
            return null;
        }

        var streamObjectPool = [];

        function getStreamObject() {
            if (streamObjectPool.length > 0) {
                return streamObjectPool.pop();
            } else {
                return new ActiveXObject("ADODB.Stream");
            }
        }

        function releaseStreamObject(obj) {
            streamObjectPool.push(obj);
        }

        var args = [];
        for (var i = 0; i < WScript.Arguments.length; i++) {
            args[i] = WScript.Arguments.Item(i);
        }

        return {
            currentDirectory: function () {
                return (WScript).CreateObject("WScript.Shell").CurrentDirectory;
            },
            readFile: function (path) {
                try  {
                    var streamObj = getStreamObject();
                    streamObj.Open();
                    streamObj.Type = 2;

                    streamObj.Charset = 'x-ansi';

                    streamObj.LoadFromFile(path);
                    var bomChar = streamObj.ReadText(2);

                    streamObj.Position = 0;

                    var byteOrderMark = ByteOrderMark.None;

                    if (bomChar.charCodeAt(0) === 0xFE && bomChar.charCodeAt(1) === 0xFF) {
                        streamObj.Charset = 'unicode';
                        byteOrderMark = ByteOrderMark.Utf16BigEndian;
                    } else if (bomChar.charCodeAt(0) === 0xFF && bomChar.charCodeAt(1) === 0xFE) {
                        streamObj.Charset = 'unicode';
                        byteOrderMark = ByteOrderMark.Utf16LittleEndian;
                    } else if (bomChar.charCodeAt(0) === 0xEF && bomChar.charCodeAt(1) === 0xBB) {
                        streamObj.Charset = 'utf-8';
                        byteOrderMark = ByteOrderMark.Utf8;
                    } else {
                        streamObj.Charset = 'utf-8';
                    }

                    var contents = streamObj.ReadText(-1);
                    streamObj.Close();
                    releaseStreamObject(streamObj);
                    return new FileInformation(contents, byteOrderMark);
                } catch (err) {
                    throw new Error("Error reading file \"" + path + "\": " + err.message);
                }
            },
            writeFile: function (path, contents, writeByteOrderMark) {
                var textStream = getStreamObject();
                textStream.Charset = 'utf-8';
                textStream.Open();
                textStream.WriteText(contents, 0);

                if (!writeByteOrderMark) {
                    textStream.Position = 3;
                } else {
                    textStream.Position = 0;
                }

                var fileStream = getStreamObject();
                fileStream.Type = 1;
                fileStream.Open();

                textStream.CopyTo(fileStream);

                fileStream.Flush();
                fileStream.SaveToFile(path, 2);
                fileStream.Close();

                textStream.Flush();
                textStream.Close();
            },
            fileExists: function (path) {
                return fso.FileExists(path);
            },
            deleteFile: function (path) {
                if (fso.FileExists(path)) {
                    fso.DeleteFile(path, true);
                }
            },
            directoryExists: function (path) {
                return fso.FolderExists(path);
            },
            listFiles: function (path, spec, options) {
                options = options || {};
                function filesInFolder(folder, root) {
                    var paths = [];
                    var fc;

                    if (options.recursive) {
                        fc = new Enumerator(folder.subfolders);

                        for (; !fc.atEnd(); fc.moveNext()) {
                            paths = paths.concat(filesInFolder(fc.item(), root + "\\" + fc.item().Name));
                        }
                    }

                    fc = new Enumerator(folder.files);

                    for (; !fc.atEnd(); fc.moveNext()) {
                        if (!spec || fc.item().Name.match(spec)) {
                            paths.push(root + "\\" + fc.item().Name);
                        }
                    }

                    return paths;
                }

                var folder = fso.GetFolder(path);
                var paths = [];

                return filesInFolder(folder, path);
            },
            arguments: args,
            standardOut: WScript.StdOut
        };
    }
    ;

    function getNodeEnvironment() {
        var _fs = require('fs');
        var _path = require('path');
        var _module = require('module');

        return {
            currentDirectory: function () {
                return (process).cwd();
            },
            readFile: function (file) {
                var buffer = _fs.readFileSync(file);
                switch (buffer[0]) {
                    case 0xFE:
                        if (buffer[1] === 0xFF) {
                            var i = 0;
                            while ((i + 1) < buffer.length) {
                                var temp = buffer[i];
                                buffer[i] = buffer[i + 1];
                                buffer[i + 1] = temp;
                                i += 2;
                            }
                            return new FileInformation(buffer.toString("ucs2", 2), ByteOrderMark.Utf16BigEndian);
                        }
                        break;
                    case 0xFF:
                        if (buffer[1] === 0xFE) {
                            return new FileInformation(buffer.toString("ucs2", 2), ByteOrderMark.Utf16LittleEndian);
                        }
                        break;
                    case 0xEF:
                        if (buffer[1] === 0xBB) {
                            return new FileInformation(buffer.toString("utf8", 3), ByteOrderMark.Utf8);
                        }
                }

                return new FileInformation(buffer.toString("utf8", 0), ByteOrderMark.None);
            },
            writeFile: function (path, contents, writeByteOrderMark) {
                function mkdirRecursiveSync(path) {
                    var stats = _fs.statSync(path);
                    if (stats.isFile()) {
                        throw "\"" + path + "\" exists but isn't a directory.";
                    } else if (stats.isDirectory()) {
                        return;
                    } else {
                        mkdirRecursiveSync(_path.dirname(path));
                        _fs.mkdirSync(path, 0775);
                    }
                }
                mkdirRecursiveSync(_path.dirname(path));

                if (writeByteOrderMark) {
                    contents = '\uFEFF' + contents;
                }
                _fs.writeFileSync(path, contents, "utf8");
            },
            fileExists: function (path) {
                return _fs.existsSync(path);
            },
            deleteFile: function (path) {
                try  {
                    _fs.unlinkSync(path);
                } catch (e) {
                }
            },
            directoryExists: function (path) {
                return _fs.existsSync(path) && _fs.statSync(path).isDirectory();
            },
            listFiles: function dir(path, spec, options) {
                options = options || {};

                function filesInFolder(folder) {
                    var paths = [];

                    var files = _fs.readdirSync(folder);
                    for (var i = 0; i < files.length; i++) {
                        var stat = _fs.statSync(folder + "\\" + files[i]);
                        if (options.recursive && stat.isDirectory()) {
                            paths = paths.concat(filesInFolder(folder + "\\" + files[i]));
                        } else if (stat.isFile() && (!spec || files[i].match(spec))) {
                            paths.push(folder + "\\" + files[i]);
                        }
                    }

                    return paths;
                }

                return filesInFolder(path);
            },
            arguments: process.argv.slice(2),
            standardOut: {
                Write: function (str) {
                    process.stdout.write(str);
                },
                WriteLine: function (str) {
                    process.stdout.write(str + '\n');
                },
                Close: function () {
                }
            }
        };
    }
    ;

    if (typeof WScript !== "undefined" && typeof ActiveXObject === "function") {
        return getWindowsScriptHostEnvironment();
    } else if (typeof module !== 'undefined' && module.exports) {
        return getNodeEnvironment();
    } else {
        return null;
    }
})();
