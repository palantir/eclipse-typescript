var TypeScript;
(function (TypeScript) {
    var Diagnostic = (function () {
        function Diagnostic(fileName, start, length, diagnosticCode, arguments) {
            if (typeof arguments === "undefined") { arguments = null; }
            this._diagnosticCode = diagnosticCode;
            this._arguments = (arguments && arguments.length > 0) ? arguments : null;
            this._fileName = fileName;
            this._originalStart = this._start = start;
            this._length = length;
        }
        Diagnostic.prototype.toJSON = function (key) {
            var result = {};
            result.start = this.start();
            result.length = this.length();

            result.diagnosticCode = TypeScript.DiagnosticCode[this.diagnosticCode()];

            var arguments = (this).arguments();
            if (arguments && arguments.length > 0) {
                result.arguments = arguments;
            }

            return result;
        };

        Diagnostic.prototype.fileName = function () {
            return this._fileName;
        };

        Diagnostic.prototype.start = function () {
            return this._start;
        };

        Diagnostic.prototype.length = function () {
            return this._length;
        };

        Diagnostic.prototype.diagnosticCode = function () {
            return this._diagnosticCode;
        };

        Diagnostic.prototype.arguments = function () {
            return this._arguments;
        };

        Diagnostic.prototype.text = function () {
            return TypeScript.getDiagnosticText(this._diagnosticCode, this._arguments);
        };

        Diagnostic.prototype.message = function () {
            return TypeScript.getDiagnosticMessage(this._diagnosticCode, this._arguments);
        };

        Diagnostic.prototype.adjustOffset = function (pos) {
            this._start = this._originalStart + pos;
        };

        Diagnostic.prototype.additionalLocations = function () {
            return [];
        };

        Diagnostic.equals = function (diagnostic1, diagnostic2) {
            return diagnostic1._fileName === diagnostic2._fileName && diagnostic1._start === diagnostic2._start && diagnostic1._length === diagnostic2._length && diagnostic1._diagnosticCode === diagnostic2._diagnosticCode && TypeScript.ArrayUtilities.sequenceEquals(diagnostic1._arguments, diagnostic2._arguments, function (v1, v2) {
                return v1 === v2;
            });
        };
        return Diagnostic;
    })();
    TypeScript.Diagnostic = Diagnostic;

    function getLargestIndex(diagnostic) {
        var largest = -1;
        var stringComponents = diagnostic.split("_");

        for (var i = 0; i < stringComponents.length; i++) {
            var val = parseInt(stringComponents[i]);
            if (!isNaN(val) && val > largest) {
                largest = val;
            }
        }

        return largest;
    }

    function getDiagnosticInfoFromCode(diagnosticCode) {
        var diagnosticName = TypeScript.DiagnosticCode[diagnosticCode];
        return TypeScript.diagnosticMessages[diagnosticName];
    }
    TypeScript.getDiagnosticInfoFromCode = getDiagnosticInfoFromCode;

    function getDiagnosticText(diagnosticCode, args) {
        var diagnosticName = TypeScript.DiagnosticCode[diagnosticCode];

        var diagnostic = TypeScript.diagnosticMessages[diagnosticName];

        var actualCount = args ? args.length : 0;
        if (!diagnostic) {
            throw new Error("Invalid diagnostic");
        } else {
            var expectedCount = 1 + getLargestIndex(diagnosticName);

            if (expectedCount !== actualCount) {
                throw new Error("Expected " + expectedCount + " arguments to diagnostic, got " + actualCount + " instead");
            }
        }

        var diagnosticMessageText = diagnostic.message.replace(/{({(\d+)})?TB}/g, function (match, p1, num) {
            var tabChar = "\t";
            var result = tabChar;
            if (num && args[num]) {
                for (var i = 1; i < args[num]; i++) {
                    result += tabChar;
                }
            }

            return result;
        });

        diagnosticMessageText = diagnosticMessageText.replace(/{(\d+)}/g, function (match, num) {
            return typeof args[num] !== 'undefined' ? args[num] : match;
        });

        diagnosticMessageText = diagnosticMessageText.replace(/{(NL)}/g, function (match) {
            return "\r\n";
        });

        return diagnosticMessageText;
    }
    TypeScript.getDiagnosticText = getDiagnosticText;

    function getDiagnosticMessage(diagnosticCode, args) {
        var diagnostic = getDiagnosticInfoFromCode(diagnosticCode);
        var diagnosticMessageText = getDiagnosticText(diagnosticCode, args);

        var message;
        if (diagnostic.category === TypeScript.DiagnosticCategory.Error) {
            message = getDiagnosticText(TypeScript.DiagnosticCode.error_TS_0__1, [diagnostic.code, diagnosticMessageText]);
        } else if (diagnostic.category === TypeScript.DiagnosticCategory.Warning) {
            message = getDiagnosticText(TypeScript.DiagnosticCode.warning_TS_0__1, [diagnostic.code, diagnosticMessageText]);
        } else {
            message = diagnosticMessageText;
        }

        return message;
    }
    TypeScript.getDiagnosticMessage = getDiagnosticMessage;
})(TypeScript || (TypeScript = {}));
