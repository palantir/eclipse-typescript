var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
function switchToForwardSlashes(path) {
    return path.replace(/\\/g, "/");
}

function filePath(fullPath) {
    fullPath = switchToForwardSlashes(fullPath);
    var components = fullPath.split("/");
    var path = components.slice(0, components.length - 1);
    return path.join("/") + "/";
}

var typescriptServiceFileName = filePath(IO.getExecutingFilePath()) + "typescriptServices.js";
var typescriptServiceFile = IO.readFile(typescriptServiceFileName).contents();
if (typeof ActiveXObject === "function") {
    eval(typescriptServiceFile);
} else if (typeof require === "function") {
    var vm = require('vm');
    vm.runInThisContext(typescriptServiceFile, 'typescriptServices.js');
} else {
    throw new Error('Unknown context');
}

var Harness;
(function (Harness) {
    Harness.userSpecifiedroot = "";
    var global = Function("return this").call(null);

    (function (Assert) {
        var assert = Harness.Assert;
        Assert.bugIds = [];
        Assert.throwAssertError = function (error) {
            throw error;
        };

        function bug(id) {
            if (Assert.bugIds.indexOf(id) < 0) {
                Assert.bugIds.push(id);
            }
        }
        Assert.bug = bug;

        function bugs(content) {
            var bugs = content.match(/\bbug (\d+)/i);
            if (bugs) {
                bugs.forEach(function (bug) {
                    return assert.bug(bug);
                });
            }
        }
        Assert.bugs = bugs;

        function is(result, msg) {
            if (!result) {
                Assert.throwAssertError(new Error(msg || "Expected true, got false."));
            }
        }
        Assert.is = is;

        function arrayLengthIs(arr, length) {
            if (arr.length != length) {
                var actual = '';
                arr.forEach(function (n) {
                    return actual = actual + '\n      ' + n.toString();
                });
                Assert.throwAssertError(new Error('Expected array to have ' + length + ' elements. Found ' + arr.length + '. Actual elements were:' + actual));
            }
        }
        Assert.arrayLengthIs = arrayLengthIs;

        function equal(actual, expected) {
            if (actual !== expected) {
                Assert.throwAssertError(new Error("Expected " + actual + " to equal " + expected));
            }
        }
        Assert.equal = equal;

        function notEqual(actual, expected) {
            if (actual === expected) {
                Assert.throwAssertError(new Error("Expected " + actual + " to *not* equal " + expected));
            }
        }
        Assert.notEqual = notEqual;

        function notNull(result) {
            if (result === null) {
                Assert.throwAssertError(new Error("Expected " + result + " to *not* be null"));
            }
        }
        Assert.notNull = notNull;

        function compilerWarning(result, line, column, desc) {
            if (!result.isErrorAt(line, column, desc)) {
                var actual = '';
                result.errors.forEach(function (err) {
                    actual = actual + '\n     ' + err.toString();
                });

                Assert.throwAssertError(new Error("Expected compiler warning at (" + line + ", " + column + "): " + desc + "\nActual errors follow: " + actual));
            }
        }
        Assert.compilerWarning = compilerWarning;

        function noDiff(text1, text2) {
            text1 = text1.replace(/^\s+|\s+$/g, "").replace(/\r\n?/g, "\n");
            text2 = text2.replace(/^\s+|\s+$/g, "").replace(/\r\n?/g, "\n");

            if (text1 !== text2) {
                var errorString = "";
                var text1Lines = text1.split(/\n/);
                var text2Lines = text2.split(/\n/);
                for (var i = 0; i < text1Lines.length; i++) {
                    if (text1Lines[i] !== text2Lines[i]) {
                        errorString += "Difference at line " + (i + 1) + ":\n";
                        errorString += "                  Left File: " + text1Lines[i] + "\n";
                        errorString += "                 Right File: " + text2Lines[i] + "\n\n";
                    }
                }
                Assert.throwAssertError(new Error(errorString));
            }
        }
        Assert.noDiff = noDiff;

        function arrayContains(arr, contains) {
            var found;

            for (var i = 0; i < contains.length; i++) {
                found = false;

                for (var j = 0; j < arr.length; j++) {
                    if (arr[j] === contains[i]) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    Assert.throwAssertError(new Error("Expected array to contain \"" + contains[i] + "\""));
                }
            }
        }
        Assert.arrayContains = arrayContains;

        function arrayContainsOnce(arr, filter) {
            var foundCount = 0;

            for (var i = 0; i < arr.length; i++) {
                if (filter(arr[i])) {
                    foundCount++;
                }
            }

            if (foundCount !== 1) {
                Assert.throwAssertError(new Error("Expected array to match element only once (instead of " + foundCount + " times)"));
            }
        }
        Assert.arrayContainsOnce = arrayContainsOnce;
    })(Harness.Assert || (Harness.Assert = {}));
    var Assert = Harness.Assert;

    var assert = Harness.Assert;

    function splitContentByNewlines(content) {
        var lines = content.split('\r\n');
        if (lines.length === 1) {
            lines = content.split('\n');
        }
        return lines;
    }
    Harness.splitContentByNewlines = splitContentByNewlines;

    function readFile(path) {
        var fullPath = path;
        if (path.indexOf('/') !== 0) {
            fullPath = Harness.userSpecifiedroot + path;
        }

        var content = IO.readFile(fullPath);
        if (content === null) {
            throw new Error("failed to read file at: '" + fullPath + "'");
        }

        return content;
    }
    Harness.readFile = readFile;

    var Logger = (function () {
        function Logger() {
        }
        Logger.prototype.start = function (fileName, priority) {
        };
        Logger.prototype.end = function (fileName) {
        };
        Logger.prototype.scenarioStart = function (scenario) {
        };
        Logger.prototype.scenarioEnd = function (scenario, error) {
        };
        Logger.prototype.testStart = function (test) {
        };
        Logger.prototype.pass = function (test) {
        };
        Logger.prototype.bug = function (test) {
        };
        Logger.prototype.fail = function (test) {
        };
        Logger.prototype.error = function (test, error) {
        };
        Logger.prototype.comment = function (comment) {
        };
        Logger.prototype.verify = function (test, passed, actual, expected, message) {
        };
        return Logger;
    })();
    Harness.Logger = Logger;

    var loggers = [];
    function registerLogger(logger) {
        loggers.push(logger);
    }
    Harness.registerLogger = registerLogger;
    function emitLog(field) {
        var params = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            params[_i] = arguments[_i + 1];
        }
        for (var i = 0; i < loggers.length; i++) {
            if (typeof loggers[i][field] === 'function') {
                loggers[i][field].apply(loggers[i], params);
            }
        }
    }
    Harness.emitLog = emitLog;

    var Runnable = (function () {
        function Runnable(description, block) {
            this.description = description;
            this.block = block;
            this.error = null;
            this.passed = null;
            this.bugs = [];
            this.children = [];
        }
        Runnable.prototype.addChild = function (child) {
            this.children.push(child);
        };

        Runnable.prototype.call = function (fn, done) {
            var isAsync = true;

            try  {
                if (fn.length === 0) {
                    fn();
                    done();

                    return false;
                } else {
                    Runnable.pushGlobalErrorHandler(done);

                    fn(function () {
                        isAsync = false;
                        Runnable.popGlobalErrorHandler();
                        done();
                    });

                    return isAsync;
                }
            } catch (e) {
                done(e);

                return false;
            }
        };

        Runnable.prototype.run = function (done) {
        };

        Runnable.prototype.runBlock = function (done) {
            return this.call(this.block, done);
        };

        Runnable.prototype.runChild = function (index, done) {
            var that = this;
            return this.call((function (done) {
                return that.children[index].run(done);
            }), done);
        };

        Runnable.pushGlobalErrorHandler = function (done) {
            Runnable.errorHandlerStack.push(function (e) {
                done(e);
            });
        };

        Runnable.popGlobalErrorHandler = function () {
            Runnable.errorHandlerStack.pop();
        };

        Runnable.handleError = function (e) {
            if (Runnable.errorHandlerStack.length === 0) {
                IO.printLine('Global error: ' + e);
            } else {
                Runnable.errorHandlerStack[Runnable.errorHandlerStack.length - 1](e);
            }
        };
        Runnable.currentStack = [];

        Runnable.errorHandlerStack = [];
        return Runnable;
    })();
    Harness.Runnable = Runnable;
    var TestCase = (function (_super) {
        __extends(TestCase, _super);
        function TestCase(description, block) {
            _super.call(this, description, block);
            this.description = description;
            this.block = block;
        }
        TestCase.prototype.addChild = function (child) {
            throw new Error("Testcases may not be nested inside other testcases");
        };

        TestCase.prototype.run = function (done) {
            var that = this;

            Runnable.currentStack.push(this);

            emitLog('testStart', { desc: this.description });

            if (this.block) {
                var async = this.runBlock(function (e) {
                    if (e) {
                        that.passed = false;
                        that.error = e;
                        emitLog('error', { desc: this.description, pass: false }, e);
                    } else {
                        that.passed = true;

                        emitLog('pass', { desc: this.description, pass: true });
                    }

                    Runnable.currentStack.pop();

                    done();
                });
            }
        };
        return TestCase;
    })(Runnable);
    Harness.TestCase = TestCase;

    var Scenario = (function (_super) {
        __extends(Scenario, _super);
        function Scenario(description, block) {
            _super.call(this, description, block);
            this.description = description;
            this.block = block;
        }
        Scenario.prototype.run = function (done) {
            var that = this;

            Runnable.currentStack.push(this);

            emitLog('scenarioStart', { desc: this.description });

            var async = this.runBlock(function (e) {
                Runnable.currentStack.pop();
                if (e) {
                    that.passed = false;
                    that.error = e;
                    var metadata = { id: undefined, desc: this.description, pass: false, bugs: assert.bugIds };

                    assert.bugIds.forEach(function (desc) {
                        return emitLog('bug', metadata, desc);
                    });
                    emitLog('scenarioEnd', metadata, e);
                    done();
                } else {
                    that.passed = true;
                    that.runChildren(done);
                }
            });
        };

        Scenario.prototype.runChildren = function (done, index) {
            if (typeof index === "undefined") { index = 0; }
            var that = this;
            var async = false;

            for (; index < this.children.length; index++) {
                async = this.runChild(index, function (e) {
                    that.passed = that.passed && that.children[index].passed;

                    if (async)
                        that.runChildren(done, index + 1);
                });

                if (async)
                    return;
            }

            var metadata = { id: undefined, desc: this.description, pass: this.passed, bugs: assert.bugIds };

            assert.bugIds.forEach(function (desc) {
                return emitLog('bug', metadata, desc);
            });
            emitLog('scenarioEnd', metadata);

            done();
        };
        return Scenario;
    })(Runnable);
    Harness.Scenario = Scenario;

    var Run = (function (_super) {
        __extends(Run, _super);
        function Run() {
            _super.call(this, 'Test Run', null);
        }
        Run.prototype.run = function () {
            emitLog('start');
            this.runChildren();
        };

        Run.prototype.runChildren = function (index) {
            if (typeof index === "undefined") { index = 0; }
            var async = false;
            var that = this;

            for (; index < this.children.length; index++) {
                assert.bugIds = [];

                async = this.runChild(index, function (e) {
                    if (async) {
                        that.runChildren(index + 1);
                    }
                });

                if (async) {
                    return;
                }
            }

            Perf.runBenchmarks();
            emitLog('end');
        };
        return Run;
    })(Runnable);
    Harness.Run = Run;

    (function (Perf) {
        (function (Clock) {
            Clock.now;
            Clock.resolution;

            if (typeof WScript !== "undefined" && typeof global['WScript'].InitializeProjection !== "undefined") {
                global['WScript'].InitializeProjection();

                Clock.now = function () {
                    return TestUtilities.QueryPerformanceCounter();
                };

                Clock.resolution = TestUtilities.QueryPerformanceFrequency();
            } else {
                Clock.now = function () {
                    return Date.now();
                };

                Clock.resolution = 1000;
            }
        })(Perf.Clock || (Perf.Clock = {}));
        var Clock = Perf.Clock;

        var Timer = (function () {
            function Timer() {
                this.time = 0;
            }
            Timer.prototype.start = function () {
                this.time = 0;
                this.startTime = Clock.now();
            };

            Timer.prototype.end = function () {
                this.time = (Clock.now() - this.startTime) / Clock.resolution * 1000;
            };
            return Timer;
        })();
        Perf.Timer = Timer;

        var Dataset = (function () {
            function Dataset() {
                this.data = [];
            }
            Dataset.prototype.add = function (value) {
                this.data.push(value);
            };

            Dataset.prototype.mean = function () {
                var sum = 0;
                for (var i = 0; i < this.data.length; i++) {
                    sum += this.data[i];
                }

                return sum / this.data.length;
            };

            Dataset.prototype.min = function () {
                var min = this.data[0];

                for (var i = 1; i < this.data.length; i++) {
                    if (this.data[i] < min) {
                        min = this.data[i];
                    }
                }

                return min;
            };

            Dataset.prototype.max = function () {
                var max = this.data[0];

                for (var i = 1; i < this.data.length; i++) {
                    if (this.data[i] > max) {
                        max = this.data[i];
                    }
                }

                return max;
            };

            Dataset.prototype.stdDev = function () {
                var sampleMean = this.mean();
                var sumOfSquares = 0;
                for (var i = 0; i < this.data.length; i++) {
                    sumOfSquares += Math.pow(this.data[i] - sampleMean, 2);
                }

                return Math.sqrt(sumOfSquares / this.data.length);
            };
            return Dataset;
        })();
        Perf.Dataset = Dataset;

        var Benchmark = (function () {
            function Benchmark() {
                this.iterations = 10;
                this.description = "";
                this.results = {};
            }
            Benchmark.prototype.bench = function (subBench) {
            };
            Benchmark.prototype.before = function () {
            };
            Benchmark.prototype.beforeEach = function () {
            };
            Benchmark.prototype.after = function () {
            };
            Benchmark.prototype.afterEach = function () {
            };

            Benchmark.prototype.addTimingFor = function (name, timing) {
                this.results[name] = this.results[name] || new Dataset();
                this.results[name].add(timing);
            };
            return Benchmark;
        })();
        Perf.Benchmark = Benchmark;

        Perf.benchmarks = [];

        var timeFunction;

        timeFunction = function (benchmark, description, name, f) {
            if (typeof description === "undefined") { description = benchmark.description; }
            if (typeof name === "undefined") { name = ''; }
            if (typeof f === "undefined") { f = benchmark.bench; }
            var t = new Timer();
            t.start();

            var subBenchmark = function (name, f) {
                timeFunction(benchmark, description, name, f);
            };

            f.call(benchmark, subBenchmark);

            t.end();

            benchmark.addTimingFor(name, t.time);
        };

        function runBenchmarks() {
            for (var i = 0; i < Perf.benchmarks.length; i++) {
                var b = new Perf.benchmarks[i]();

                var t = new Timer();
                b.before();
                for (var j = 0; j < b.iterations; j++) {
                    b.beforeEach();
                    timeFunction(b);
                    b.afterEach();
                }
                b.after();

                for (var prop in b.results) {
                    var description = b.description + (prop ? ": " + prop : '');

                    Harness.emitLog('testStart', { desc: description });

                    Harness.emitLog('pass', {
                        desc: description,
                        pass: true,
                        perfResults: {
                            mean: b.results[prop].mean(),
                            min: b.results[prop].min(),
                            max: b.results[prop].max(),
                            stdDev: b.results[prop].stdDev(),
                            trials: b.results[prop].data
                        }
                    });
                }
            }
        }
        Perf.runBenchmarks = runBenchmarks;

        function addBenchmark(BenchmarkClass) {
            Perf.benchmarks.push(BenchmarkClass);
        }
        Perf.addBenchmark = addBenchmark;
    })(Harness.Perf || (Harness.Perf = {}));
    var Perf = Harness.Perf;

    (function (Compiler) {
        var WriterAggregator = (function () {
            function WriterAggregator() {
                this.lines = [];
                this.currentLine = "";
            }
            WriterAggregator.prototype.Write = function (str) {
                this.currentLine += str;
            };

            WriterAggregator.prototype.WriteLine = function (str) {
                this.lines.push(this.currentLine + str);
                this.currentLine = "";
            };

            WriterAggregator.prototype.Close = function () {
                if (this.currentLine.length > 0) {
                    this.lines.push(this.currentLine);
                }
                this.currentLine = "";
            };

            WriterAggregator.prototype.reset = function () {
                this.lines = [];
                this.currentLine = "";
            };
            return WriterAggregator;
        })();
        Compiler.WriterAggregator = WriterAggregator;

        var EmitterIOHost = (function () {
            function EmitterIOHost() {
                this.fileCollection = {};
            }
            EmitterIOHost.prototype.writeFile = function (s, contents, writeByteOrderMark) {
                var writer;
                if (this.fileCollection[s]) {
                    writer = this.fileCollection[s];
                } else {
                    writer = new Harness.Compiler.WriterAggregator();
                    this.fileCollection[s] = writer;
                }

                writer.Write(contents);
                writer.Close();
            };

            EmitterIOHost.prototype.directoryExists = function (s) {
                return false;
            };
            EmitterIOHost.prototype.fileExists = function (s) {
                return typeof this.fileCollection[s] !== 'undefined';
            };
            EmitterIOHost.prototype.resolvePath = function (s) {
                return s;
            };

            EmitterIOHost.prototype.reset = function () {
                this.fileCollection = {};
            };

            EmitterIOHost.prototype.toArray = function () {
                var result = [];

                for (var p in this.fileCollection) {
                    if (this.fileCollection.hasOwnProperty(p)) {
                        var current = this.fileCollection[p];
                        if (current.lines.length > 0) {
                            if (p !== '0.js') {
                                current.lines.unshift('////[' + p + ']');
                            }
                            result.push({ fileName: p, file: this.fileCollection[p] });
                        }
                    }
                }
                return result;
            };
            return EmitterIOHost;
        })();
        Compiler.EmitterIOHost = EmitterIOHost;

        var libFolder = global['WScript'] ? TypeScript.filePath(global['WScript'].ScriptFullName) : (__dirname + '/');

        Compiler.libText = IO ? IO.readFile(libFolder + "lib.d.ts").contents() : '';
        Compiler.libTextMinimal = IO ? IO.readFile(libFolder + "../../tests/minimal.lib.d.ts").contents() : '';

        var stdout = new EmitterIOHost();
        var stderr = new WriterAggregator();

        function makeDefaultCompilerForTest(useMinimalDefaultLib) {
            if (typeof useMinimalDefaultLib === "undefined") { useMinimalDefaultLib = true; }
            var compiler = new TypeScript.TypeScriptCompiler();
            compiler.settings.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;
            compiler.settings.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
            var diagnostic = compiler.parseEmitOption(stdout);
            if (diagnostic) {
                throw new Error(diagnostic.message());
            }

            var libCode = useMinimalDefaultLib ? Compiler.libTextMinimal : Compiler.libText;
            compiler.addSourceUnit("lib.d.ts", TypeScript.ScriptSnapshot.fromString(libCode), ByteOrderMark.None, 0, false);

            compiler.pullTypeCheck();

            return compiler;
        }
        Compiler.makeDefaultCompilerForTest = makeDefaultCompilerForTest;

        function recreate(compilerInstance, useMinimalDefaultLib) {
            if (typeof useMinimalDefaultLib === "undefined") { useMinimalDefaultLib = true; }
            if (compilerInstance === CompilerInstance.RunTime) {
                runTimeCompiler = makeDefaultCompilerForTest(useMinimalDefaultLib);
            } else {
                designTimeCompiler = makeDefaultCompilerForTest(useMinimalDefaultLib);
            }
        }
        Compiler.recreate = recreate;

        var designTimeCompiler;
        designTimeCompiler = makeDefaultCompilerForTest();

        var runTimeCompiler;
        runTimeCompiler = makeDefaultCompilerForTest();

        (function (CompilerInstance) {
            CompilerInstance[CompilerInstance["DesignTime"] = 0] = "DesignTime";

            CompilerInstance[CompilerInstance["RunTime"] = 1] = "RunTime";
        })(Compiler.CompilerInstance || (Compiler.CompilerInstance = {}));
        var CompilerInstance = Compiler.CompilerInstance;

        function getCompiler(compilerInstance) {
            return compilerInstance === CompilerInstance.RunTime ? runTimeCompiler : designTimeCompiler;
        }
        Compiler.getCompiler = getCompiler;

        var needsFullTypeCheck = true;

        function compile(compilerInstance, code, filename) {
            var compiler = getCompiler(compilerInstance);

            if (needsFullTypeCheck) {
                compiler.pullTypeCheck();
                needsFullTypeCheck = false;
            }

            if (code && filename) {
                if (compiler.fileNameToDocument.lookup(filename)) {
                    compiler.updateSourceUnit(filename, TypeScript.ScriptSnapshot.fromString(""), 0, true, null);
                    compiler.updateSourceUnit(filename, TypeScript.ScriptSnapshot.fromString(code), 0, true, null);
                } else {
                    throw new Error("Tried to update a file that doesn't already exist");
                }
            }
        }
        Compiler.compile = compile;

        function getAllFilesInCompiler(compilerInstance) {
            var compiler = getCompiler(compilerInstance);
            return compiler.fileNameToDocument.getAllKeys();
        }
        Compiler.getAllFilesInCompiler = getAllFilesInCompiler;

        function getDocumentFromCompiler(compilerInstance, documentName) {
            var compiler = getCompiler(compilerInstance);
            return compiler.getDocument(documentName);
        }
        Compiler.getDocumentFromCompiler = getDocumentFromCompiler;

        function getTypeInfoAtPosition(compilerInstance, targetPosition, document) {
            var compiler = getCompiler(compilerInstance);
            return compiler.pullGetTypeInfoAtPosition(targetPosition, document);
        }
        Compiler.getTypeInfoAtPosition = getTypeInfoAtPosition;

        var Type = (function () {
            function Type(type, code, identifier) {
                this.type = type;
                this.code = code;
                this.identifier = identifier;
            }
            Type.prototype.normalizeToArray = function (arg) {
                if ((Array.isArray && Array.isArray(arg)) || arg instanceof Array)
                    return arg;

                return [arg];
            };

            Type.prototype.compilesOk = function (testCode) {
                var errors = null;
                compileString(testCode, '0.ts', function (compilerResult) {
                    errors = compilerResult.errors;
                });

                return errors.length === 0;
            };

            Type.prototype.isSubtypeOf = function (other) {
                var testCode = 'class __test1__ {\n';
                testCode += '    public test() {\n';
                testCode += '        ' + other.code + ';\n';
                testCode += '        return ' + other.identifier + ';\n';
                testCode += '    }\n';
                testCode += '}\n';
                testCode += 'class __test2__ extends __test1__ {\n';
                testCode += '    public test() {\n';
                testCode += '        ' + this.code + ';\n';
                testCode += '        return ' + other.identifier + ';\n';
                testCode += '    }\n';
                testCode += '}\n';

                return this.compilesOk(testCode);
            };

            Type.prototype.assertSubtypeOf = function (others) {
                others = this.normalizeToArray(others);

                for (var i = 0; i < others.length; i++) {
                    if (!this.isSubtypeOf(others[i])) {
                        throw new Error("Expected " + this.type + " to be a subtype of " + others[i].type);
                    }
                }
            };

            Type.prototype.assertNotSubtypeOf = function (others) {
                others = this.normalizeToArray(others);

                for (var i = 0; i < others.length; i++) {
                    if (this.isSubtypeOf(others[i])) {
                        throw new Error("Expected " + this.type + " to be a subtype of " + others[i].type);
                    }
                }
            };

            Type.prototype.isAssignmentCompatibleWith = function (other) {
                var thisValName = '__val__' + this.identifier;
                var otherValName = '__val__' + other.identifier;
                var testCode = 'module __test1__ {\n';
                testCode += '    export ' + this.code + ';\n';
                testCode += '    export var ' + thisValName + ' = ' + this.identifier + ';\n';
                testCode += '}\n';

                testCode += 'module __test2__ {\n';
                testCode += '    export ' + other.code + ';\n';
                testCode += '    export var ' + otherValName + ' = ' + other.identifier + ';\n';
                testCode += '}\n';

                testCode += '__test2__.' + otherValName + ' = __test1__.' + thisValName;

                return this.compilesOk(testCode);
            };

            Type.prototype.assertAssignmentCompatibleWith = function (others) {
                others = this.normalizeToArray(others);

                for (var i = 0; i < others.length; i++) {
                    var other = others[i];

                    if (!this.isAssignmentCompatibleWith(other)) {
                        throw new Error("Expected " + this.type + " to be assignment compatible with " + other.type);
                    }
                }
            };

            Type.prototype.assertNotAssignmentCompatibleWith = function (others) {
                others = this.normalizeToArray(others);

                for (var i = 0; i < others.length; i++) {
                    var other = others[i];

                    if (this.isAssignmentCompatibleWith(other)) {
                        throw new Error("Expected " + this.type + " to not be assignment compatible with " + other.type);
                    }
                }
            };

            Type.prototype.assertThisCanBeAssignedTo = function (desc, these, notThese) {
                var _this = this;
                Harness.it(desc + " is assignable to ", function () {
                    _this.assertAssignmentCompatibleWith(these);
                });

                Harness.it(desc + " not assignable to ", function () {
                    _this.assertNotAssignmentCompatibleWith(notThese);
                });
            };
            return Type;
        })();
        Compiler.Type = Type;

        var TypeFactory = (function () {
            function TypeFactory() {
                this.any = this.get('var x : any', 'x');
                this.number = this.get('var x : number', 'x');
                this.string = this.get('var x : string', 'x');
                this.boolean = this.get('var x : boolean', 'x');
            }
            TypeFactory.prototype.get = function (code, target) {
                var targetIdentifier = '';
                var targetPosition = -1;
                if (typeof target === "string") {
                    targetIdentifier = target;
                    targetPosition = code.indexOf(target);
                } else if (typeof target === "number") {
                    targetPosition = target;
                } else {
                    throw new Error("Expected string or number not " + (typeof target));
                }

                var errors = null;
                compileString(code, 'test.ts', function (compilerResult) {
                    errors = compilerResult.errors;
                });

                if (errors.length > 0)
                    throw new Error("Type definition contains errors: " + errors.join(","));

                var matchingIdentifiers = [];

                var fileNames = getAllFilesInCompiler(CompilerInstance.RunTime);
                for (var m = 0; m < fileNames.length; m++) {
                    var document2 = getDocumentFromCompiler(CompilerInstance.RunTime, fileNames[m]);
                    if (document2.fileName !== 'lib.d.ts') {
                        if (targetPosition > -1) {
                            var tyInfo = getTypeInfoAtPosition(CompilerInstance.RunTime, targetPosition, document2);
                            var name = this.getTypeInfoName(tyInfo.ast);
                            var foundValue = new Type(tyInfo.symbol.getTypeName(), code, name);
                            if (!matchingIdentifiers.some(function (value) {
                                return (value.identifier === foundValue.identifier) && (value.code === foundValue.code) && (value.type === foundValue.type);
                            })) {
                                matchingIdentifiers.push(foundValue);
                            }
                        } else {
                            for (var pos = 0; pos < code.length; pos++) {
                                tyInfo = getTypeInfoAtPosition(CompilerInstance.RunTime, targetPosition, document2);
                                name = this.getTypeInfoName(tyInfo.ast);
                                if (name === targetIdentifier) {
                                    foundValue = new Type(tyInfo.symbol.getTypeName(), code, targetIdentifier);
                                    if (!matchingIdentifiers.some(function (value) {
                                        return (value.identifier === foundValue.identifier) && (value.code === foundValue.code) && (value.type === foundValue.type);
                                    })) {
                                        matchingIdentifiers.push(foundValue);
                                    }
                                }
                            }
                        }
                    }
                }

                if (matchingIdentifiers.length === 0) {
                    if (targetPosition > -1) {
                        throw new Error("Could not find an identifier at position " + targetPosition);
                    } else {
                        throw new Error("Could not find an identifier " + targetIdentifier + " in any known scopes");
                    }
                } else if (matchingIdentifiers.length > 1) {
                    throw new Error("Found multiple matching identifiers for " + target);
                } else {
                    return matchingIdentifiers[0];
                }
            };

            TypeFactory.prototype.getTypeInfoName = function (ast) {
                var name = '';

                var a = ast;
                name = (a.id) ? (a.id.actualText) : (a.name) ? a.name.actualText : (a.text) ? a.text : '';

                return name;
            };

            TypeFactory.prototype.isOfType = function (expr, expectedType) {
                var actualType = this.get('var _v_a_r_ = ' + expr, '_v_a_r_');

                Harness.it('Expression "' + expr + '" is of type "' + expectedType + '"', function () {
                    assert.equal(actualType.type, expectedType);
                });
            };
            return TypeFactory;
        })();
        Compiler.TypeFactory = TypeFactory;

        var CompilerResult = (function () {
            function CompilerResult(fileResults, errorLines, scripts) {
                this.fileResults = fileResults;
                this.scripts = scripts;
                var lines = [];
                fileResults.forEach(function (v) {
                    return lines = lines.concat(v.file.lines);
                });
                this.code = lines.join("\r\n");

                this.errors = [];

                for (var i = 0; i < errorLines.length; i++) {
                    var match = errorLines[i].match(/([^\(]*)\((\d+),(\d+)\):\s+((.*[\s\r\n]*.*)+)\s*$/);
                    if (match) {
                        this.errors.push(new CompilerError(match[1], parseFloat(match[2]), parseFloat(match[3]), match[4]));
                    } else {
                        WScript.Echo("non-match on: " + errorLines[i]);
                    }
                }
            }
            CompilerResult.prototype.isErrorAt = function (line, column, message) {
                for (var i = 0; i < this.errors.length; i++) {
                    if (this.errors[i].line === line && this.errors[i].column === column && this.errors[i].message === message)
                        return true;
                }

                return false;
            };
            return CompilerResult;
        })();
        Compiler.CompilerResult = CompilerResult;

        var CompilerError = (function () {
            function CompilerError(file, line, column, message) {
                this.file = file;
                this.line = line;
                this.column = column;
                this.message = message;
            }
            CompilerError.prototype.toString = function () {
                return this.file + "(" + this.line + "," + this.column + "): " + this.message;
            };
            return CompilerError;
        })();
        Compiler.CompilerError = CompilerError;

        function reset(compilerInstance) {
            stdout.reset();
            stderr.reset();

            var files = getAllFilesInCompiler(compilerInstance);

            for (var i = 0; i < files.length; i++) {
                var fname = files[i];
                if (fname !== 'lib.d.ts') {
                    updateUnit(compilerInstance, '', fname);
                }
            }
        }
        Compiler.reset = reset;

        function addUnit(compilerInstance, code, unitName, isDeclareFile, references) {
            var compiler = getCompiler(compilerInstance);
            var script = null;
            var uName = unitName || '0' + (isDeclareFile ? '.d.ts' : '.ts');

            var fileNames = getAllFilesInCompiler(compilerInstance);
            for (var i = 0; i < fileNames.length; i++) {
                if (fileNames[i] === uName) {
                    updateUnit(compilerInstance, code, uName);
                    script = getDocumentFromCompiler(compilerInstance, fileNames[i]).script;
                }
            }

            if (!script) {
                var document = compiler.addSourceUnit(uName, TypeScript.ScriptSnapshot.fromString(code), ByteOrderMark.None, 0, true, references);
                script = document.script;
                needsFullTypeCheck = true;
            }

            return script;
        }
        Compiler.addUnit = addUnit;

        function updateUnit(compilerInstance, code, unitName) {
            var compiler = getCompiler(compilerInstance);
            compiler.updateSourceUnit(unitName, TypeScript.ScriptSnapshot.fromString(code), 0, true, null);
        }
        Compiler.updateUnit = updateUnit;

        function compileFile(compilerInstance, path, callback, settingsCallback, context, references) {
            var compiler = getCompiler(compilerInstance);
            path = switchToForwardSlashes(path);
            var fileName = path.match(/[^\/]*$/)[0];
            var code = Harness.readFile(path).contents();

            compileUnit(compilerInstance, code, fileName, callback, settingsCallback, context, references);
        }
        Compiler.compileFile = compileFile;

        function saveCompilerSettings(compilerInstance) {
            var compiler = getCompiler(compilerInstance);

            function clone(source, target) {
                for (var prop in source) {
                    target[prop] = source[prop];
                }
            }

            var oldCompilerSettings = new TypeScript.CompilationSettings();
            clone(compiler.settings, oldCompilerSettings);
            var oldEmitSettings = new TypeScript.EmitOptions(compiler.settings);
            clone(compiler.emitOptions, oldEmitSettings);

            return function () {
                compiler.settings = oldCompilerSettings;
                compiler.emitOptions = oldEmitSettings;
            };
        }
        Compiler.saveCompilerSettings = saveCompilerSettings;

        function compileUnit(compilerInstance, code, fileName, callback, settingsCallback, context, references) {
            var compiler = getCompiler(compilerInstance);

            var restoreSavedCompilerSettings = saveCompilerSettings(compilerInstance);

            if (settingsCallback) {
                settingsCallback(compiler.settings);
                compiler.emitOptions = new TypeScript.EmitOptions(compiler.settings);
            }

            try  {
                compileStringForCommonJSAndAMD(code, fileName, callback, compilerInstance, context, references);
            } finally {
                if (settingsCallback) {
                    restoreSavedCompilerSettings();
                }
            }
        }
        Compiler.compileUnit = compileUnit;

        function compileUnits(compilerInstance, units, callback, settingsCallback) {
            var compiler = getCompiler(compilerInstance);
            var lastUnit = units[units.length - 1];
            var unitName = switchToForwardSlashes(lastUnit.name).match(/[^\/]*$/)[0];

            var dependencies = units.slice(0, units.length - 1);
            var compilationContext = Harness.Compiler.defineCompilationContextForTest(unitName, dependencies);

            compileUnit(compilerInstance, lastUnit.content, unitName, callback, settingsCallback, compilationContext, lastUnit.references);
        }
        Compiler.compileUnits = compileUnits;

        function emitAll(compilerInstance, ioHost) {
            var compiler = getCompiler(compilerInstance);
            return compiler.emitAll(ioHost);
        }
        Compiler.emitAll = emitAll;

        function emitCurrentCompilerContentsAsAMD(compilerInstance) {
            var compiler = getCompiler(compilerInstance);
            var oldModuleType = compiler.settings.moduleGenTarget;
            compiler.settings.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;

            stdout.reset();
            stderr.reset();
            compiler.emitAll(stdout);
            var result = new CompilerResult(stdout.toArray(), stderr.lines, null);

            compiler.settings.moduleGenTarget = oldModuleType;
            return result;
        }
        Compiler.emitCurrentCompilerContentsAsAMD = emitCurrentCompilerContentsAsAMD;

        function reportCompilationErrors(compilerInstance, uNames, errAggregator) {
            var compiler = getCompiler(compilerInstance);
            var us = [];
            if (uNames && uNames.length > 0) {
                us = uNames;
            } else {
                var files = getAllFilesInCompiler(compilerInstance);
                files.forEach(function (file) {
                    if (file !== 'lib.d.ts') {
                        us.push(file);
                    }
                });
            }

            var errorTarget = (typeof errAggregator == "undefined") ? stderr : errAggregator;
            var errorReporter = {
                addDiagnostic: function (diagnostic) {
                    if (diagnostic.fileName()) {
                        var document = getDocumentFromCompiler(compilerInstance, diagnostic.fileName());
                        var lineCol = { line: -1, character: -1 };
                        document.lineMap.fillLineAndCharacterFromPosition(diagnostic.start(), lineCol);

                        errorTarget.Write(diagnostic.fileName() + "(" + (lineCol.line + 1) + "," + (lineCol.character + 1) + "): ");
                    }

                    errorTarget.WriteLine(diagnostic.message());
                }
            };

            us.forEach(function (u) {
                var syntacticDiagnostics = compiler.getSyntacticDiagnostics(u);
                compiler.reportDiagnostics(syntacticDiagnostics, errorReporter);

                var semanticDiagnostics = compiler.getSemanticDiagnostics(u);
                compiler.reportDiagnostics(semanticDiagnostics, errorReporter);
            });

            var emitDiagnostics = emitAll(compilerInstance, stdout);
            compiler.reportDiagnostics(emitDiagnostics, errorReporter);

            var emitDeclarationsDiagnostics = compiler.emitAllDeclarations();
            compiler.reportDiagnostics(emitDeclarationsDiagnostics, errorReporter);

            return errorTarget.lines;
        }
        Compiler.reportCompilationErrors = reportCompilationErrors;

        function compileString(code, unitName, callback, compilerInstance, context, references) {
            if (typeof compilerInstance === "undefined") { compilerInstance = CompilerInstance.RunTime; }
            var compiler = getCompiler(compilerInstance);
            var scripts = [];

            reset(compilerInstance);

            if (context) {
                context.preCompile();
            }

            var isDeclareFile = TypeScript.isDTSFile(unitName);

            var uName = context ? unitName : isDeclareFile ? '0.d.ts' : '0.ts';
            scripts.push(addUnit(compilerInstance, code, uName, isDeclareFile, references));
            compile(compilerInstance);

            reportCompilationErrors(compilerInstance, [uName]);

            if (context) {
                context.postCompile();
            }

            callback(new CompilerResult(stdout.toArray(), stderr.lines, scripts));
        }
        Compiler.compileString = compileString;

        function compileStringForCommonJSAndAMD(code, unitName, callback, compilerInstance, context, references) {
            if (typeof compilerInstance === "undefined") { compilerInstance = CompilerInstance.RunTime; }
            var compiler = getCompiler(compilerInstance);
            var scripts = [];

            reset(compilerInstance);

            if (context) {
                context.preCompile();
            }

            var isDeclareFile = TypeScript.isDTSFile(unitName);

            var uName = context ? unitName : isDeclareFile ? '0.d.ts' : '0.ts';
            scripts.push(addUnit(compilerInstance, code, uName, isDeclareFile, references));
            compile(compilerInstance);

            reportCompilationErrors(compilerInstance, [uName]);
            var commonJSResult = new CompilerResult(stdout.toArray(), stderr.lines, scripts);
            var amdCompilerResult = emitCurrentCompilerContentsAsAMD(Harness.Compiler.CompilerInstance.RunTime);

            if (context) {
                context.postCompile();
            }

            callback({
                commonJSResult: commonJSResult,
                amdResult: amdCompilerResult
            });
        }
        Compiler.compileStringForCommonJSAndAMD = compileStringForCommonJSAndAMD;

        function defineCompilationContextForTest(fileName, dependencies) {
            if (dependencies.length === 0) {
                return null;
            } else {
                var addedFiles = [];
                var precompile = function () {
                    dependencies.forEach(function (dep) {
                        addUnit(CompilerInstance.RunTime, dep.content, dep.name, TypeScript.isDTSFile(dep.name));
                        addedFiles.push(dep.name);
                    });
                };
                var postcompile = function () {
                    addedFiles.forEach(function (file) {
                        updateUnit(CompilerInstance.RunTime, '', file);
                    });
                };
                var context = {
                    preCompile: precompile,
                    postCompile: postcompile
                };
                return context;
            }
        }
        Compiler.defineCompilationContextForTest = defineCompilationContextForTest;

        function setCompilerSettings(tcSettings, compilerInstance) {
            var compiler = getCompiler(compilerInstance);
            tcSettings.forEach(function (item) {
                var idx = Harness.Compiler.supportedFlags.filter(function (x) {
                    return x.flag === item.flag.toLowerCase();
                });
                if (idx && idx.length != 1) {
                    throw new Error('Unsupported flag \'' + item.flag + '\'');
                }

                idx[0].setFlag(compiler.settings, item.value);
            });
            compiler.emitOptions = new TypeScript.EmitOptions(compiler.settings);
        }
        Compiler.setCompilerSettings = setCompilerSettings;

        Compiler.supportedFlags = [
            { flag: 'comments', setFlag: function (x, value) {
                    x.emitComments = value.toLowerCase() === 'true' ? true : false;
                } },
            { flag: 'declaration', setFlag: function (x, value) {
                    x.generateDeclarationFiles = value.toLowerCase() === 'true' ? true : false;
                } },
            {
                flag: 'module',
                setFlag: function (x, value) {
                    switch (value.toLowerCase()) {
                        case 'amd':
                            x.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
                            break;
                        default:
                        case 'commonjs':
                            x.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
                            break;
                    }
                }
            },
            { flag: 'nolib', setFlag: function (x, value) {
                    x.useDefaultLib = value.toLowerCase() === 'true' ? true : false;
                } },
            { flag: 'sourcemap', setFlag: function (x, value) {
                    x.mapSourceFiles = value.toLowerCase() === 'true' ? true : false;
                } },
            { flag: 'target', setFlag: function (x, value) {
                    x.codeGenTarget = value.toLowerCase() === 'es3' ? TypeScript.LanguageVersion.EcmaScript3 : TypeScript.LanguageVersion.EcmaScript5;
                } },
            { flag: 'out', setFlag: function (x, value) {
                    x.outputOption = value;
                } },
            { flag: 'filename', setFlag: function (x, value) {
                    ;
                } }
        ];
    })(Harness.Compiler || (Harness.Compiler = {}));
    var Compiler = Harness.Compiler;

    (function (TestCaseParser) {
        var optionRegex = /^[\/]{2}\s*@(\w+):\s*(\S*)/gm;

        var fileMetadataNames = ["filename", "comments", "declaration", "module", "nolib", "sourcemap", "target", "out"];

        function extractCompilerSettings(content) {
            var opts = [];

            var match;
            while ((match = optionRegex.exec(content)) != null) {
                opts.push({ flag: match[1], value: match[2] });
            }

            return opts;
        }

        function makeUnitsFromTest(code, fileName) {
            var settings = extractCompilerSettings(code);

            var files = [];

            var lines = Harness.splitContentByNewlines(code);

            var currentFileContent = null;
            var currentFileOptions = {};
            var currentFileName = null;
            var refs = [];

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var isTripleSlashReference = /[\/]{3}\s*<reference path/.test(line);
                var testMetaData = optionRegex.exec(line);

                if (isTripleSlashReference) {
                    var isRef = line.match(/reference\spath='(\w*_?\w*\.?d?\.ts)'/);
                    if (isRef) {
                        var ref = {
                            line: 0,
                            character: 0,
                            position: 0,
                            length: 0,
                            path: isRef[1],
                            isResident: false
                        };

                        refs.push(ref);
                    }
                } else if (testMetaData) {
                    optionRegex.lastIndex = 0;
                    var fileNameIndex = fileMetadataNames.indexOf(testMetaData[1].toLowerCase());
                    if (fileNameIndex === -1) {
                        throw new Error('Unrecognized metadata name "' + testMetaData[1] + '". Available file metadata names are: ' + fileMetadataNames.join(', '));
                    } else if (fileNameIndex === 0) {
                        currentFileOptions[testMetaData[1]] = testMetaData[2];
                    } else {
                        continue;
                    }

                    if (currentFileName) {
                        var newTestFile = {
                            content: currentFileContent,
                            name: currentFileName,
                            fileOptions: currentFileOptions,
                            originalFilePath: fileName,
                            references: refs
                        };
                        files.push(newTestFile);

                        currentFileContent = null;
                        currentFileOptions = {};
                        currentFileName = testMetaData[2];
                        refs = [];
                    } else {
                        currentFileName = testMetaData[2];
                    }
                } else {
                    if (currentFileContent === null) {
                        currentFileContent = '';
                    } else {
                        currentFileContent = currentFileContent + '\n';
                    }
                    currentFileContent = currentFileContent + line;
                }
            }

            currentFileName = files.length > 0 ? currentFileName : '0.ts';

            var newTestFile2 = {
                content: currentFileContent || '',
                name: currentFileName,
                fileOptions: currentFileOptions,
                originalFilePath: fileName,
                references: refs
            };
            files.push(newTestFile2);

            return { settings: settings, testUnitData: files };
        }
        TestCaseParser.makeUnitsFromTest = makeUnitsFromTest;
    })(Harness.TestCaseParser || (Harness.TestCaseParser = {}));
    var TestCaseParser = Harness.TestCaseParser;

    var ScriptInfo = (function () {
        function ScriptInfo(fileName, content, isOpen) {
            if (typeof isOpen === "undefined") { isOpen = true; }
            this.fileName = fileName;
            this.content = content;
            this.isOpen = isOpen;
            this.version = 1;
            this.editRanges = [];
            this.lineMap = null;
            this.setContent(content);
        }
        ScriptInfo.prototype.setContent = function (content) {
            this.content = content;
            this.lineMap = TypeScript.LineMap.fromString(content);
        };

        ScriptInfo.prototype.updateContent = function (content) {
            this.editRanges = [];
            this.setContent(content);
            this.version++;
        };

        ScriptInfo.prototype.editContent = function (minChar, limChar, newText) {
            var prefix = this.content.substring(0, minChar);
            var middle = newText;
            var suffix = this.content.substring(limChar);
            this.setContent(prefix + middle + suffix);

            this.editRanges.push({
                length: this.content.length,
                textChangeRange: new TypeScript.TextChangeRange(TypeScript.TextSpan.fromBounds(minChar, limChar), newText.length)
            });

            this.version++;
        };

        ScriptInfo.prototype.getTextChangeRangeBetweenVersions = function (startVersion, endVersion) {
            if (startVersion === endVersion) {
                return TypeScript.TextChangeRange.unchanged;
            }

            var initialEditRangeIndex = this.editRanges.length - (this.version - startVersion);
            var lastEditRangeIndex = this.editRanges.length - (this.version - endVersion);

            var entries = this.editRanges.slice(initialEditRangeIndex, lastEditRangeIndex);
            return TypeScript.TextChangeRange.collapseChangesAcrossMultipleVersions(entries.map(function (e) {
                return e.textChangeRange;
            }));
        };
        return ScriptInfo;
    })();
    Harness.ScriptInfo = ScriptInfo;

    var ScriptSnapshotShim = (function () {
        function ScriptSnapshotShim(scriptInfo) {
            this.scriptInfo = scriptInfo;
            this.lineMap = null;
            this.textSnapshot = scriptInfo.content;
            this.version = scriptInfo.version;
        }
        ScriptSnapshotShim.prototype.getText = function (start, end) {
            return this.textSnapshot.substring(start, end);
        };

        ScriptSnapshotShim.prototype.getLength = function () {
            return this.textSnapshot.length;
        };

        ScriptSnapshotShim.prototype.getLineStartPositions = function () {
            if (this.lineMap === null) {
                this.lineMap = TypeScript.LineMap.fromString(this.textSnapshot);
            }

            return JSON2.stringify(this.lineMap.lineStarts());
        };

        ScriptSnapshotShim.prototype.getTextChangeRangeSinceVersion = function (scriptVersion) {
            var range = this.scriptInfo.getTextChangeRangeBetweenVersions(scriptVersion, this.version);
            if (range === null) {
                return null;
            }

            return JSON2.stringify({ span: { start: range.span().start(), length: range.span().length() }, newLength: range.newLength() });
        };
        return ScriptSnapshotShim;
    })();

    var TypeScriptLS = (function () {
        function TypeScriptLS() {
            this.ls = null;
            this.fileNameToScript = new TypeScript.StringHashTable();
        }
        TypeScriptLS.prototype.addDefaultLibrary = function () {
            this.addScript("lib.d.ts", Harness.Compiler.libText);
        };

        TypeScriptLS.prototype.addFile = function (fileName) {
            var code = readFile(fileName).contents();
            this.addScript(fileName, code);
        };

        TypeScriptLS.prototype.removeFile = function (fileName) {
            this.fileNameToScript.remove(fileName);
        };

        TypeScriptLS.prototype.getScriptInfo = function (fileName) {
            return this.fileNameToScript.lookup(fileName);
        };

        TypeScriptLS.prototype.addScript = function (fileName, content) {
            var script = new ScriptInfo(fileName, content);
            this.fileNameToScript.add(fileName, script);
        };

        TypeScriptLS.prototype.updateScript = function (fileName, content) {
            var script = this.getScriptInfo(fileName);
            if (script !== null) {
                script.updateContent(content);
                return;
            }

            this.addScript(fileName, content);
        };

        TypeScriptLS.prototype.editScript = function (fileName, minChar, limChar, newText) {
            var script = this.getScriptInfo(fileName);
            if (script !== null) {
                script.editContent(minChar, limChar, newText);
                return;
            }

            throw new Error("No script with name '" + name + "'");
        };

        TypeScriptLS.prototype.information = function () {
            return false;
        };
        TypeScriptLS.prototype.debug = function () {
            return true;
        };
        TypeScriptLS.prototype.warning = function () {
            return true;
        };
        TypeScriptLS.prototype.error = function () {
            return true;
        };
        TypeScriptLS.prototype.fatal = function () {
            return true;
        };

        TypeScriptLS.prototype.log = function (s) {
        };

        TypeScriptLS.prototype.getCompilationSettings = function () {
            return "";
        };

        TypeScriptLS.prototype.getScriptFileNames = function () {
            return JSON2.stringify(this.fileNameToScript.getAllKeys());
        };

        TypeScriptLS.prototype.getScriptSnapshot = function (fileName) {
            return new ScriptSnapshotShim(this.getScriptInfo(fileName));
        };

        TypeScriptLS.prototype.getScriptVersion = function (fileName) {
            return this.getScriptInfo(fileName).version;
        };

        TypeScriptLS.prototype.getScriptIsOpen = function (fileName) {
            return this.getScriptInfo(fileName).isOpen;
        };

        TypeScriptLS.prototype.getDiagnosticsObject = function () {
            return new LanguageServicesDiagnostics("");
        };

        TypeScriptLS.prototype.getLanguageService = function () {
            var ls = new Services.TypeScriptServicesFactory().createLanguageServiceShim(this);
            ls.refresh(true);
            this.ls = ls;
            return ls;
        };

        TypeScriptLS.prototype.parseSourceText = function (fileName, sourceText) {
            var compilationSettings = new TypeScript.CompilationSettings();
            var parseOptions = TypeScript.getParseOptions(compilationSettings);
            return TypeScript.SyntaxTreeToAstVisitor.visit(TypeScript.Parser.parse(fileName, TypeScript.SimpleText.fromScriptSnapshot(sourceText), TypeScript.isDTSFile(fileName), TypeScript.LanguageVersion.EcmaScript5, parseOptions), fileName, compilationSettings);
        };

        TypeScriptLS.prototype.parseFile = function (fileName) {
            var sourceText = TypeScript.ScriptSnapshot.fromString(IO.readFile(fileName).contents());
            return this.parseSourceText(fileName, sourceText);
        };

        TypeScriptLS.prototype.lineColToPosition = function (fileName, line, col) {
            var script = this.fileNameToScript.lookup(fileName);
            assert.notNull(script);
            assert.is(line >= 1);
            assert.is(col >= 1);

            return script.lineMap.getPosition(line - 1, col - 1);
        };

        TypeScriptLS.prototype.positionToZeroBasedLineCol = function (fileName, position) {
            var script = this.fileNameToScript.lookup(fileName);
            assert.notNull(script);

            var result = script.lineMap.getLineAndCharacterFromPosition(position);

            assert.is(result.line() >= 0);
            assert.is(result.character() >= 0);
            return { line: result.line(), character: result.character() };
        };

        TypeScriptLS.prototype.checkEdits = function (sourceFileName, baselineFileName, edits) {
            var script = readFile(sourceFileName);
            var formattedScript = this.applyEdits(script.contents(), edits);
            var baseline = readFile(baselineFileName).contents();

            assert.noDiff(formattedScript, baseline);
            assert.equal(formattedScript, baseline);
        };

        TypeScriptLS.prototype.applyEdits = function (content, edits) {
            var result = content;
            edits = this.normalizeEdits(edits);

            for (var i = edits.length - 1; i >= 0; i--) {
                var edit = edits[i];
                var prefix = result.substring(0, edit.minChar);
                var middle = edit.text;
                var suffix = result.substring(edit.limChar);
                result = prefix + middle + suffix;
            }
            return result;
        };

        TypeScriptLS.prototype.normalizeEdits = function (edits) {
            var result = [];

            function mapEdits(edits) {
                var result = [];
                for (var i = 0; i < edits.length; i++) {
                    result.push({ edit: edits[i], index: i });
                }
                return result;
            }

            var temp = mapEdits(edits).sort(function (a, b) {
                var result = a.edit.minChar - b.edit.minChar;
                if (result === 0)
                    result = a.index - b.index;
                return result;
            });

            var current = 0;
            var next = 1;
            while (current < temp.length) {
                var currentEdit = temp[current].edit;

                if (next >= temp.length) {
                    result.push(currentEdit);
                    current++;
                    continue;
                }
                var nextEdit = temp[next].edit;

                var gap = nextEdit.minChar - currentEdit.limChar;

                if (gap >= 0) {
                    result.push(currentEdit);
                    current = next;
                    next++;
                    continue;
                }

                if (currentEdit.limChar >= nextEdit.limChar) {
                    next++;
                    continue;
                } else {
                    throw new Error("Trying to apply overlapping edits");
                }
            }

            return result;
        };
        return TypeScriptLS;
    })();
    Harness.TypeScriptLS = TypeScriptLS;

    var LanguageServicesDiagnostics = (function () {
        function LanguageServicesDiagnostics(destination) {
            this.destination = destination;
        }
        LanguageServicesDiagnostics.prototype.log = function (content) {
        };
        return LanguageServicesDiagnostics;
    })();
    Harness.LanguageServicesDiagnostics = LanguageServicesDiagnostics;

    function describe(description, block) {
        var newScenario = new Scenario(description, block);

        if (Runnable.currentStack.length === 0) {
            Runnable.currentStack.push(currentRun);
        }

        Runnable.currentStack[Runnable.currentStack.length - 1].addChild(newScenario);
    }
    Harness.describe = describe;

    function it(description, block) {
        var testCase = new TestCase(description, block);
        Runnable.currentStack[Runnable.currentStack.length - 1].addChild(testCase);
    }
    Harness.it = it;

    function run() {
        if (typeof process !== "undefined") {
            process.on('uncaughtException', Runnable.handleError);
        }

        Baseline.reset();
        currentRun.run();
    }
    Harness.run = run;

    (function (Runner) {
        function runCollateral(path, callback) {
            path = switchToForwardSlashes(path);
            runString(Compiler.CompilerInstance.RunTime, Harness.readFile(path).contents(), path.match(/[^\/]*$/)[0], callback);
        }
        Runner.runCollateral = runCollateral;

        function runJSString(code, callback) {
            var dangerNames = ['Array'];

            var globalBackup = {};
            var n = null;
            for (n in dangerNames) {
                globalBackup[dangerNames[n]] = global[dangerNames[n]];
            }

            try  {
                var res = eval(code);

                for (n in dangerNames) {
                    global[dangerNames[n]] = globalBackup[dangerNames[n]];
                }

                callback(null, res);
            } catch (e) {
                for (n in dangerNames) {
                    global[dangerNames[n]] = globalBackup[dangerNames[n]];
                }

                callback(e, null);
            }
        }
        Runner.runJSString = runJSString;

        function runString(compilerInstance, code, unitName, callback) {
            Compiler.compileString(code, unitName, function (res) {
                runJSString(res.code, callback);
            });
        }
        Runner.runString = runString;
    })(Harness.Runner || (Harness.Runner = {}));
    var Runner = Harness.Runner;

    (function (Baseline) {
        var htmlBaselineReport = new Diff.HtmlBaselineReport('baseline-report.html');

        var firstRun = true;

        function localPath(fileName) {
            return Harness.userSpecifiedroot + 'tests/baselines/local/' + fileName;
        }

        function referencePath(fileName) {
            return Harness.userSpecifiedroot + 'tests/baselines/reference/' + fileName;
        }

        function reset() {
            htmlBaselineReport.reset();
        }
        Baseline.reset = reset;

        function generateActual(actualFilename, generateContent) {
            IO.createDirectory(IO.dirName(IO.dirName(actualFilename)));
            IO.createDirectory(IO.dirName(actualFilename));

            if (IO.fileExists(actualFilename)) {
                IO.deleteFile(actualFilename);
            }

            var actual = generateContent();

            if (actual === undefined) {
                throw new Error('The generated content was "undefined". Return "null" if no baselining is required."');
            }

            if (actual !== null) {
                IO.writeFile(actualFilename, actual, false);
            }

            return actual;
        }

        function compareToBaseline(actual, relativeFilename, opts) {
            if (actual === undefined) {
                return;
            }

            var refFilename = referencePath(relativeFilename);

            if (actual === null) {
                actual = '<no content>';
            }

            var expected = '<no content>';
            if (IO.fileExists(refFilename)) {
                expected = IO.readFile(refFilename).contents();
            }

            var lineEndingSensitive = opts && opts.LineEndingSensitive;

            if (!lineEndingSensitive) {
                expected = expected.replace(/\r\n?/g, '\n');
                actual = actual.replace(/\r\n?/g, '\n');
            }

            return { expected: expected, actual: actual };
        }

        function writeComparison(expected, actual, relativeFilename, actualFilename, descriptionForDescribe) {
            if (expected != actual) {
                var errMsg = 'The baseline file ' + relativeFilename + ' has changed. Please refer to baseline-report.html and ';
                errMsg += 'either fix the regression (if unintended) or run nmake baseline-accept (if intended).';

                var refFilename = referencePath(relativeFilename);
                htmlBaselineReport.addDifference(descriptionForDescribe, actualFilename, refFilename, expected, actual, true);

                throw new Error(errMsg);
            }
        }

        function runBaseline(descriptionForDescribe, relativeFilename, generateContent, runImmediately, opts) {
            if (typeof runImmediately === "undefined") { runImmediately = false; }
            var actual = undefined;
            var actualFilename = localPath(relativeFilename);

            if (runImmediately) {
                actual = generateActual(actualFilename, generateContent);
                var comparison = compareToBaseline(actual, relativeFilename, opts);
                writeComparison(comparison.expected, comparison.actual, relativeFilename, actualFilename, descriptionForDescribe);
            } else {
                Harness.describe(descriptionForDescribe, function () {
                    var actual;

                    Harness.it('Can generate the content without error', function () {
                        actual = generateActual(actualFilename, generateContent);
                    });

                    Harness.it('Matches the baseline file', function () {
                        var comparison = compareToBaseline(actual, relativeFilename, opts);
                        writeComparison(comparison.expected, comparison.actual, relativeFilename, actualFilename, descriptionForDescribe);
                    });
                });
            }
        }
        Baseline.runBaseline = runBaseline;
    })(Harness.Baseline || (Harness.Baseline = {}));
    var Baseline = Harness.Baseline;

    if (Error)
        (Error).stackTraceLimit = 100;

    var currentRun = new Run();

    global.describe = describe;
    global.run = run;
    global.it = it;
    global.assert = Harness.Assert;
})(Harness || (Harness = {}));
