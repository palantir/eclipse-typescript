var Services;
(function (Services) {
    var CompilerDiagnostics = (function () {
        function CompilerDiagnostics(host) {
            this.host = host;
            this.openEditTag = "<Edit>";
            this.closeEditTag = "<Edit/>";
        }
        CompilerDiagnostics.prototype.isLoggingEdits = function () {
            return (this.host.getDiagnosticsObject() !== null);
        };
        return CompilerDiagnostics;
    })();
    Services.CompilerDiagnostics = CompilerDiagnostics;

    var DiagnosticService = (function () {
        function DiagnosticService(internal, host) {
            this.internal = internal;
            this.diagnostics = host.getDiagnosticsObject();
        }
        DiagnosticService.prototype.writeFile = function (content) {
            this.diagnostics.log(content);
        };

        DiagnosticService.prototype.refresh = function () {
            this.writeFile("refresh: " + "\n");
            this.internal.refresh();
        };

        DiagnosticService.prototype.getSyntacticDiagnostics = function (fileName) {
            var args = "fileName: " + this.stringify(fileName);
            var result = this.internal.getSyntacticDiagnostics(fileName);

            this.writeFile("getSyntacticDiagnostics: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getSemanticDiagnostics = function (fileName) {
            var args = "fileName: " + this.stringify(fileName);
            var result = this.internal.getSemanticDiagnostics(fileName);

            this.writeFile("getSemanticDiagnostics: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getCompletionsAtPosition = function (fileName, pos, isMemberCompletion) {
            var args = "fileName: " + this.stringify(fileName) + " pos: " + this.stringify(pos) + " isMemberCompletion: " + this.stringify(isMemberCompletion);
            var result = this.internal.getCompletionsAtPosition(fileName, pos, isMemberCompletion);

            this.writeFile("getCompletionsAtPosition: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getTypeAtPosition = function (fileName, pos) {
            var args = "fileName: " + this.stringify(fileName) + " pos: " + this.stringify(pos);
            var result = this.internal.getTypeAtPosition(fileName, pos);

            this.writeFile("getTypeAtPosition: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getNameOrDottedNameSpan = function (fileName, startPos, endPos) {
            var args = "fileName: " + this.stringify(fileName) + " startPos: " + this.stringify(startPos) + " endPos: " + this.stringify(endPos);
            var result = this.internal.getNameOrDottedNameSpan(fileName, startPos, endPos);

            this.writeFile("getNameOrDottedNameSpan: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getBreakpointStatementAtPosition = function (fileName, pos) {
            var args = "fileName: " + this.stringify(fileName) + " pos: " + this.stringify(pos);
            var result = this.internal.getBreakpointStatementAtPosition(fileName, pos);

            this.writeFile("getBreakpointStatementAtPosition: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getSignatureAtPosition = function (fileName, pos) {
            var args = "fileName: " + this.stringify(fileName) + " pos: " + this.stringify(pos);
            var result = this.internal.getSignatureAtPosition(fileName, pos);

            this.writeFile("getSignatureAtPosition: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getDefinitionAtPosition = function (fileName, pos) {
            var args = "fileName: " + this.stringify(fileName) + " pos: " + this.stringify(pos);
            var result = this.internal.getDefinitionAtPosition(fileName, pos);

            this.writeFile("getDefinitionAtPosition: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getReferencesAtPosition = function (fileName, pos) {
            var args = "fileName: " + this.stringify(fileName) + " pos: " + this.stringify(pos);
            var result = this.internal.getReferencesAtPosition(fileName, pos);

            this.writeFile("getReferencesAtPosition: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getOccurrencesAtPosition = function (fileName, pos) {
            var args = "fileName: " + this.stringify(fileName) + " pos: " + this.stringify(pos);
            var result = this.internal.getOccurrencesAtPosition(fileName, pos);

            this.writeFile("getOccurrencesAtPosition: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getImplementorsAtPosition = function (fileName, pos) {
            var args = "fileName: " + this.stringify(fileName) + " pos: " + this.stringify(pos);
            var result = this.internal.getImplementorsAtPosition(fileName, pos);

            this.writeFile("getImplementorsAtPosition: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getNavigateToItems = function (searchValue) {
            var args = "searchValue: " + this.stringify(searchValue);
            var result = this.internal.getNavigateToItems(searchValue);

            this.writeFile("getNavigateToItems: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getScriptLexicalStructure = function (fileName) {
            var args = "fileName: " + this.stringify(fileName);
            var result = this.internal.getScriptLexicalStructure(fileName);

            this.writeFile("getScriptLexicalStructure: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getOutliningRegions = function (fileName) {
            var args = "fileName: " + this.stringify(fileName);
            var result = this.internal.getOutliningRegions(fileName);

            this.writeFile("getOutliningRegions: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getFormattingEditsForRange = function (fileName, minChar, limChar, options) {
            var args = "fileName: " + this.stringify(fileName) + " minChar: " + this.stringify(minChar) + " limChar: " + this.stringify(limChar) + " options: " + this.stringify(options);
            var result = this.internal.getFormattingEditsForRange(fileName, minChar, limChar, options);

            this.writeFile("getFormattingEditsForRange: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getFormattingEditsForDocument = function (fileName, minChar, limChar, options) {
            var args = "fileName: " + this.stringify(fileName) + " minChar: " + this.stringify(minChar) + " limChar: " + this.stringify(limChar) + " options: " + this.stringify(options);
            var result = this.internal.getFormattingEditsForDocument(fileName, minChar, limChar, options);

            this.writeFile("getFormattingEditsForDocument: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getFormattingEditsOnPaste = function (fileName, minChar, limChar, options) {
            var args = "fileName: " + this.stringify(fileName) + " minChar: " + this.stringify(minChar) + " limChar: " + this.stringify(limChar) + " options: " + this.stringify(options);
            var result = this.internal.getFormattingEditsOnPaste(fileName, minChar, limChar, options);

            this.writeFile("getFormattingEditsOnPaste: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getFormattingEditsAfterKeystroke = function (fileName, position, key, options) {
            var args = "fileName: " + this.stringify(fileName) + " position: " + this.stringify(position) + " key: " + this.stringify(key) + " options: " + this.stringify(options);
            var result = this.internal.getFormattingEditsAfterKeystroke(fileName, position, key, options);

            this.writeFile("getFormattingEditsAfterKeystroke: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getBraceMatchingAtPosition = function (fileName, position) {
            var args = "fileName: " + this.stringify(fileName) + " position: " + this.stringify(position);
            var result = this.internal.getBraceMatchingAtPosition(fileName, position);

            this.writeFile("getBraceMatchingAtPosition: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getIndentationAtPosition = function (fileName, position, options) {
            var args = "fileName: " + this.stringify(fileName) + " position: " + this.stringify(position) + " options: " + this.stringify(options);
            var result = this.internal.getIndentationAtPosition(fileName, position, options);

            this.writeFile("getIndentationAtPosition: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getEmitOutput = function (fileName) {
            var args = "fileName: " + this.stringify(fileName);
            var result = this.internal.getEmitOutput(fileName);

            this.writeFile("getEmitOutput: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.getSyntaxTree = function (fileName) {
            var args = "fileName: " + this.stringify(fileName);
            var result = this.internal.getSyntaxTree(fileName);

            this.writeFile("getSyntaxTree: " + args + " result: " + this.stringify(result) + "\n");

            return result;
        };

        DiagnosticService.prototype.stringify = function (object) {
            var returnString = "";

            if (typeof object === 'string') {
                returnString = "\"" + object.toString().replace("\n", "\\n") + "\"";
            } else if (typeof object === 'number') {
                returnString = object.toString();
            } else if (typeof object === 'boolean') {
                returnString = object;
            } else if (typeof object !== 'function') {
                var properties = [];

                for (var key in object) {
                    if (object.hasOwnProperty(key) && typeof object[key] !== 'function') {
                        properties.push(key);
                    }
                }

                for (var i = 0; i < properties.length; i++) {
                    key = properties[i];
                    properties[i] = (typeof object[key] !== 'undefined' ? key + ": " + this.stringify(object[key]) : this.stringify(key));
                }

                returnString = "{ " + properties.toString() + " }";
            }

            return returnString;
        };
        return DiagnosticService;
    })();
    Services.DiagnosticService = DiagnosticService;
})(Services || (Services = {}));
