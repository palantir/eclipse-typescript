var TypeScript;
(function (TypeScript) {
    function stripQuotes(str) {
        return str.replace(/"/g, "").replace(/'/g, "");
    }
    TypeScript.stripQuotes = stripQuotes;

    function isSingleQuoted(str) {
        return str.indexOf("'") !== -1;
    }
    TypeScript.isSingleQuoted = isSingleQuoted;

    function isQuoted(str) {
        return str.indexOf("\"") !== -1 || isSingleQuoted(str);
    }
    TypeScript.isQuoted = isQuoted;

    function quoteStr(str) {
        return "\"" + str + "\"";
    }
    TypeScript.quoteStr = quoteStr;

    function swapQuotes(str) {
        if (str.indexOf("\"") !== -1) {
            str = str.replace("\"", "'");
            str = str.replace("\"", "'");
        } else {
            str = str.replace("'", "\"");
            str = str.replace("'", "\"");
        }

        return str;
    }
    TypeScript.swapQuotes = swapQuotes;

    function switchToForwardSlashes(path) {
        return path.replace(/\\/g, "/");
    }
    TypeScript.switchToForwardSlashes = switchToForwardSlashes;

    function trimModName(modName) {
        if (modName.length > 5 && modName.substring(modName.length - 5, modName.length) === ".d.ts") {
            return modName.substring(0, modName.length - 5);
        }
        if (modName.length > 3 && modName.substring(modName.length - 3, modName.length) === ".ts") {
            return modName.substring(0, modName.length - 3);
        }

        if (modName.length > 3 && modName.substring(modName.length - 3, modName.length) === ".js") {
            return modName.substring(0, modName.length - 3);
        }

        return modName;
    }
    TypeScript.trimModName = trimModName;

    function getDeclareFilePath(fname) {
        return isTSFile(fname) ? changePathToDTS(fname) : changePathToDTS(fname);
    }
    TypeScript.getDeclareFilePath = getDeclareFilePath;

    function isFileOfExtension(fname, ext) {
        var invariantFname = fname.toLocaleUpperCase();
        var invariantExt = ext.toLocaleUpperCase();
        var extLength = invariantExt.length;
        return invariantFname.length > extLength && invariantFname.substring(invariantFname.length - extLength, invariantFname.length) === invariantExt;
    }

    function isJSFile(fname) {
        return isFileOfExtension(fname, ".js");
    }
    TypeScript.isJSFile = isJSFile;

    function isTSFile(fname) {
        return isFileOfExtension(fname, ".ts");
    }
    TypeScript.isTSFile = isTSFile;

    function isDTSFile(fname) {
        return isFileOfExtension(fname, ".d.ts");
    }
    TypeScript.isDTSFile = isDTSFile;

    function getPrettyName(modPath, quote, treatAsFileName) {
        if (typeof quote === "undefined") { quote = true; }
        if (typeof treatAsFileName === "undefined") { treatAsFileName = false; }
        var modName = treatAsFileName ? switchToForwardSlashes(modPath) : trimModName(stripQuotes(modPath));
        var components = this.getPathComponents(modName);
        return components.length ? (quote ? quoteStr(components[components.length - 1]) : components[components.length - 1]) : modPath;
    }
    TypeScript.getPrettyName = getPrettyName;

    function getPathComponents(path) {
        return path.split("/");
    }
    TypeScript.getPathComponents = getPathComponents;

    function getRelativePathToFixedPath(fixedModFilePath, absoluteModPath) {
        absoluteModPath = switchToForwardSlashes(absoluteModPath);

        var modComponents = this.getPathComponents(absoluteModPath);
        var fixedModComponents = this.getPathComponents(fixedModFilePath);

        var joinStartIndex = 0;
        for (; joinStartIndex < modComponents.length && joinStartIndex < fixedModComponents.length; joinStartIndex++) {
            if (fixedModComponents[joinStartIndex] !== modComponents[joinStartIndex]) {
                break;
            }
        }

        if (joinStartIndex !== 0) {
            var relativePath = "";
            var relativePathComponents = modComponents.slice(joinStartIndex, modComponents.length);
            for (; joinStartIndex < fixedModComponents.length; joinStartIndex++) {
                if (fixedModComponents[joinStartIndex] !== "") {
                    relativePath = relativePath + "../";
                }
            }

            return relativePath + relativePathComponents.join("/");
        }

        return absoluteModPath;
    }
    TypeScript.getRelativePathToFixedPath = getRelativePathToFixedPath;

    function quoteBaseName(modPath) {
        var modName = trimModName(stripQuotes(modPath));
        var path = getRootFilePath(modName);
        if (path === "") {
            return modPath;
        } else {
            var components = modName.split(path);
            var fileIndex = components.length > 1 ? 1 : 0;
            return quoteStr(components[fileIndex]);
        }
    }
    TypeScript.quoteBaseName = quoteBaseName;

    function changePathToDTS(modPath) {
        return trimModName(stripQuotes(modPath)) + ".d.ts";
    }
    TypeScript.changePathToDTS = changePathToDTS;

    function isRelative(path) {
        return path.charAt(0) === ".";
    }
    TypeScript.isRelative = isRelative;
    function isRooted(path) {
        return path.charAt(0) === "\\" || path.charAt(0) === "/" || (path.indexOf(":\\") !== -1) || (path.indexOf(":/") !== -1);
    }
    TypeScript.isRooted = isRooted;

    function getRootFilePath(outFname) {
        if (outFname === "") {
            return outFname;
        } else {
            var isPath = outFname.indexOf("/") !== -1;
            return isPath ? filePath(outFname) : "";
        }
    }
    TypeScript.getRootFilePath = getRootFilePath;

    function filePathComponents(fullPath) {
        fullPath = switchToForwardSlashes(fullPath);
        var components = getPathComponents(fullPath);
        return components.slice(0, components.length - 1);
    }
    TypeScript.filePathComponents = filePathComponents;

    function filePath(fullPath) {
        var path = filePathComponents(fullPath);
        return path.join("/") + "/";
    }
    TypeScript.filePath = filePath;

    function normalizePath(path) {
        if (/^\\\\[^\\]/.test(path)) {
            path = "file:" + path;
        }
        var parts = this.getPathComponents(switchToForwardSlashes(path));
        var normalizedParts = [];

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part === ".") {
                continue;
            }

            if (normalizedParts.length > 0 && TypeScript.ArrayUtilities.last(normalizedParts) !== ".." && part === "..") {
                normalizedParts.pop();
                continue;
            }

            normalizedParts.push(part);
        }

        return normalizedParts.join("/");
    }
    TypeScript.normalizePath = normalizePath;
})(TypeScript || (TypeScript = {}));
