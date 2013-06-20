var TypeScript;
(function (TypeScript) {
    (function (CompilerDiagnostics) {
        CompilerDiagnostics.debug = false;

        CompilerDiagnostics.diagnosticWriter = null;

        CompilerDiagnostics.analysisPass = 0;

        function Alert(output) {
            if (CompilerDiagnostics.diagnosticWriter) {
                CompilerDiagnostics.diagnosticWriter.Alert(output);
            }
        }
        CompilerDiagnostics.Alert = Alert;

        function debugPrint(s) {
            if (CompilerDiagnostics.debug) {
                Alert(s);
            }
        }
        CompilerDiagnostics.debugPrint = debugPrint;

        function assert(condition, s) {
            if (CompilerDiagnostics.debug) {
                if (!condition) {
                    Alert(s);
                }
            }
        }
        CompilerDiagnostics.assert = assert;
    })(TypeScript.CompilerDiagnostics || (TypeScript.CompilerDiagnostics = {}));
    var CompilerDiagnostics = TypeScript.CompilerDiagnostics;

    var NullLogger = (function () {
        function NullLogger() {
        }
        NullLogger.prototype.information = function () {
            return false;
        };
        NullLogger.prototype.debug = function () {
            return false;
        };
        NullLogger.prototype.warning = function () {
            return false;
        };
        NullLogger.prototype.error = function () {
            return false;
        };
        NullLogger.prototype.fatal = function () {
            return false;
        };
        NullLogger.prototype.log = function (s) {
        };
        return NullLogger;
    })();
    TypeScript.NullLogger = NullLogger;

    function timeFunction(logger, funcDescription, func) {
        var start = (new Date()).getTime();
        var result = func();
        var end = (new Date()).getTime();
        logger.log(funcDescription + " completed in " + (end - start) + " msec");
        return result;
    }
    TypeScript.timeFunction = timeFunction;
})(TypeScript || (TypeScript = {}));
