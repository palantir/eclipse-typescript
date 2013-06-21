var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Services;
(function (Services) {
    var ShimBase = (function () {
        function ShimBase(factory) {
            this.factory = factory;
            factory.registerShim(this);
        }
        ShimBase.prototype.dispose = function (dummy) {
            this.factory.unregisterShim(this);
        };
        return ShimBase;
    })();
    Services.ShimBase = ShimBase;

    var ScriptSnapshotShimAdapter = (function () {
        function ScriptSnapshotShimAdapter(scriptSnapshotShim) {
            this.scriptSnapshotShim = scriptSnapshotShim;
            this.lineStartPositions = null;
        }
        ScriptSnapshotShimAdapter.prototype.getText = function (start, end) {
            return this.scriptSnapshotShim.getText(start, end);
        };

        ScriptSnapshotShimAdapter.prototype.getLength = function () {
            return this.scriptSnapshotShim.getLength();
        };

        ScriptSnapshotShimAdapter.prototype.getLineStartPositions = function () {
            if (this.lineStartPositions == null) {
                this.lineStartPositions = JSON.parse(this.scriptSnapshotShim.getLineStartPositions());
            }

            return this.lineStartPositions;
        };

        ScriptSnapshotShimAdapter.prototype.getTextChangeRangeSinceVersion = function (scriptVersion) {
            var encoded = this.scriptSnapshotShim.getTextChangeRangeSinceVersion(scriptVersion);
            if (encoded == null) {
                return null;
            }

            var decoded = JSON.parse(encoded);
            return new TypeScript.TextChangeRange(new TypeScript.TextSpan(decoded.span.start, decoded.span.length), decoded.newLength);
        };
        return ScriptSnapshotShimAdapter;
    })();

    var LanguageServiceShimHostAdapter = (function () {
        function LanguageServiceShimHostAdapter(shimHost) {
            this.shimHost = shimHost;
        }
        LanguageServiceShimHostAdapter.prototype.information = function () {
            return this.shimHost.information();
        };

        LanguageServiceShimHostAdapter.prototype.debug = function () {
            return this.shimHost.debug();
        };

        LanguageServiceShimHostAdapter.prototype.warning = function () {
            return this.shimHost.warning();
        };

        LanguageServiceShimHostAdapter.prototype.error = function () {
            return this.shimHost.error();
        };

        LanguageServiceShimHostAdapter.prototype.fatal = function () {
            return this.shimHost.fatal();
        };

        LanguageServiceShimHostAdapter.prototype.log = function (s) {
            this.shimHost.log(s);
        };

        LanguageServiceShimHostAdapter.prototype.getCompilationSettings = function () {
            var settingsJson = this.shimHost.getCompilationSettings();
            if (settingsJson == null || settingsJson == "") {
                return null;
            }
            var settings = JSON.parse(settingsJson);
            return settings;
        };

        LanguageServiceShimHostAdapter.prototype.getScriptFileNames = function () {
            var encoded = this.shimHost.getScriptFileNames();
            return JSON.parse(encoded);
        };

        LanguageServiceShimHostAdapter.prototype.getScriptSnapshot = function (fileName) {
            return new ScriptSnapshotShimAdapter(this.shimHost.getScriptSnapshot(fileName));
        };

        LanguageServiceShimHostAdapter.prototype.getScriptVersion = function (fileName) {
            return this.shimHost.getScriptVersion(fileName);
        };

        LanguageServiceShimHostAdapter.prototype.getScriptIsOpen = function (fileName) {
            return this.shimHost.getScriptIsOpen(fileName);
        };

        LanguageServiceShimHostAdapter.prototype.getDiagnosticsObject = function () {
            return this.shimHost.getDiagnosticsObject();
        };
        return LanguageServiceShimHostAdapter;
    })();
    Services.LanguageServiceShimHostAdapter = LanguageServiceShimHostAdapter;

    function simpleForwardCall(logger, actionDescription, action) {
        logger.log(actionDescription);
        var start = Date.now();
        var result = action();
        var end = Date.now();
        logger.log(actionDescription + " completed in " + (end - start) + " msec");
        if (typeof (result) === "string") {
            var str = result;
            if (str.length > 128) {
                str = str.substring(0, 128) + "...";
            }
            logger.log("  result.length=" + str.length + ", result='" + JSON.stringify(str) + "'");
        }
        return result;
    }
    Services.simpleForwardCall = simpleForwardCall;

    function forwardJSONCall(logger, actionDescription, action) {
        try  {
            var result = simpleForwardCall(logger, actionDescription, action);
            return JSON.stringify({ result: result });
        } catch (err) {
            Services.logInternalError(logger, err);

            return JSON.stringify({ error: err });
        }
    }
    Services.forwardJSONCall = forwardJSONCall;

    var LanguageServiceShim = (function (_super) {
        __extends(LanguageServiceShim, _super);
        function LanguageServiceShim(factory, host, languageService) {
            _super.call(this, factory);
            this.host = host;
            this.languageService = languageService;
            this.logger = this.host;
        }
        LanguageServiceShim.prototype.forwardJSONCall = function (actionDescription, action) {
            return Services.forwardJSONCall(this.logger, actionDescription, action);
        };

        LanguageServiceShim.prototype.dispose = function (dummy) {
            this.logger.log("dispose()");
            this.languageService = null;
            this.logger = null;

            _super.prototype.dispose.call(this, dummy);
        };

        LanguageServiceShim.prototype.refresh = function (throwOnError) {
            var _this = this;
            this.forwardJSONCall("refresh(" + throwOnError + ")", function () {
                _this.languageService.refresh();
                return null;
            });
        };

        LanguageServiceShim.realizeDiagnosticCategory = function (category) {
            switch (category) {
                case TypeScript.DiagnosticCategory.Error:
                    return Services.DiagnosticCategory.error;
                case TypeScript.DiagnosticCategory.Warning:
                    return Services.DiagnosticCategory.warning;
                case TypeScript.DiagnosticCategory.Message:
                    return Services.DiagnosticCategory.message;
                default:
                    return Services.DiagnosticCategory.none;
            }
        };

        LanguageServiceShim.realizeDiagnostic = function (diagnostic) {
            return {
                message: diagnostic.text(),
                start: diagnostic.start(),
                length: diagnostic.length(),
                category: LanguageServiceShim.realizeDiagnosticCategory(TypeScript.getDiagnosticInfoFromCode(diagnostic.diagnosticCode()).category)
            };
        };

        LanguageServiceShim.prototype.getSyntacticDiagnostics = function (fileName) {
            var _this = this;
            return this.forwardJSONCall("getSyntacticDiagnostics(\"" + fileName + "\")", function () {
                var errors = _this.languageService.getSyntacticDiagnostics(fileName);
                return errors.map(LanguageServiceShim.realizeDiagnostic);
            });
        };

        LanguageServiceShim.prototype.getSemanticDiagnostics = function (fileName) {
            var _this = this;
            return this.forwardJSONCall("getSemanticDiagnostics(\"" + fileName + "\")", function () {
                var errors = _this.languageService.getSemanticDiagnostics(fileName);
                return errors.map(LanguageServiceShim.realizeDiagnostic);
            });
        };

        LanguageServiceShim.prototype.getTypeAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getTypeAtPosition(\"" + fileName + "\", " + position + ")", function () {
                var typeInfo = _this.languageService.getTypeAtPosition(fileName, position);
                return typeInfo;
            });
        };

        LanguageServiceShim.prototype.getNameOrDottedNameSpan = function (fileName, startPos, endPos) {
            var _this = this;
            return this.forwardJSONCall("getNameOrDottedNameSpan(\"" + fileName + "\", " + startPos + ", " + endPos + ")", function () {
                var spanInfo = _this.languageService.getNameOrDottedNameSpan(fileName, startPos, endPos);
                return spanInfo;
            });
        };

        LanguageServiceShim.prototype.getBreakpointStatementAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getBreakpointStatementAtPosition(\"" + fileName + "\", " + position + ")", function () {
                var spanInfo = _this.languageService.getBreakpointStatementAtPosition(fileName, position);
                return spanInfo;
            });
        };

        LanguageServiceShim.prototype.getSignatureAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getSignatureAtPosition(\"" + fileName + "\", " + position + ")", function () {
                var signatureInfo = _this.languageService.getSignatureAtPosition(fileName, position);
                return signatureInfo;
            });
        };

        LanguageServiceShim.prototype.getDefinitionAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getDefinitionAtPosition(\"" + fileName + "\", " + position + ")", function () {
                return _this.languageService.getDefinitionAtPosition(fileName, position);
            });
        };

        LanguageServiceShim.prototype.getBraceMatchingAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getBraceMatchingAtPosition(\"" + fileName + "\", " + position + ")", function () {
                var textRanges = _this.languageService.getBraceMatchingAtPosition(fileName, position);
                return textRanges;
            });
        };

        LanguageServiceShim.prototype.getIndentationAtPosition = function (fileName, position, options) {
            var _this = this;
            return this.forwardJSONCall("getIndentationAtPosition(\"" + fileName + "\", " + position + ")", function () {
                var localOptions = JSON.parse(options);
                var columnOffset = _this.languageService.getIndentationAtPosition(fileName, position, localOptions);
                return { value: columnOffset };
            });
        };

        LanguageServiceShim.prototype.getReferencesAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getReferencesAtPosition(\"" + fileName + "\", " + position + ")", function () {
                return _this.languageService.getReferencesAtPosition(fileName, position);
            });
        };

        LanguageServiceShim.prototype.getOccurrencesAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getOccurrencesAtPosition(\"" + fileName + "\", " + position + ")", function () {
                return _this.languageService.getOccurrencesAtPosition(fileName, position);
            });
        };

        LanguageServiceShim.prototype.getImplementorsAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getImplementorsAtPosition(\"" + fileName + "\", " + position + ")", function () {
                return _this.languageService.getImplementorsAtPosition(fileName, position);
            });
        };

        LanguageServiceShim.prototype.getCompletionsAtPosition = function (fileName, position, isMemberCompletion) {
            var _this = this;
            return this.forwardJSONCall("getCompletionsAtPosition(\"" + fileName + "\", " + position + ", " + isMemberCompletion + ")", function () {
                var completion = _this.languageService.getCompletionsAtPosition(fileName, position, isMemberCompletion);
                return completion;
            });
        };

        LanguageServiceShim.prototype.getFormattingEditsForRange = function (fileName, minChar, limChar, options) {
            var _this = this;
            return this.forwardJSONCall("getFormattingEditsForRange(\"" + fileName + "\", " + minChar + ", " + limChar + ")", function () {
                var localOptions = JSON.parse(options);
                var edits = _this.languageService.getFormattingEditsForRange(fileName, minChar, limChar, localOptions);
                return edits;
            });
        };

        LanguageServiceShim.prototype.getFormattingEditsForDocument = function (fileName, minChar, limChar, options) {
            var _this = this;
            return this.forwardJSONCall("getFormattingEditsForDocument(\"" + fileName + "\", " + minChar + ", " + limChar + ")", function () {
                var localOptions = JSON.parse(options);
                var edits = _this.languageService.getFormattingEditsForDocument(fileName, minChar, limChar, localOptions);
                return edits;
            });
        };

        LanguageServiceShim.prototype.getFormattingEditsOnPaste = function (fileName, minChar, limChar, options) {
            var _this = this;
            return this.forwardJSONCall("getFormattingEditsOnPaste(\"" + fileName + "\", " + minChar + ", " + limChar + ")", function () {
                var localOptions = JSON.parse(options);
                var edits = _this.languageService.getFormattingEditsOnPaste(fileName, minChar, limChar, localOptions);
                return edits;
            });
        };

        LanguageServiceShim.prototype.getFormattingEditsAfterKeystroke = function (fileName, position, key, options) {
            var _this = this;
            return this.forwardJSONCall("getFormattingEditsAfterKeystroke(\"" + fileName + "\", " + position + ", \"" + key + "\")", function () {
                var localOptions = JSON.parse(options);
                var edits = _this.languageService.getFormattingEditsAfterKeystroke(fileName, position, key, localOptions);
                return edits;
            });
        };

        LanguageServiceShim.prototype.getNavigateToItems = function (searchValue) {
            var _this = this;
            return this.forwardJSONCall("getNavigateToItems(\"" + searchValue + "\")", function () {
                var items = _this.languageService.getNavigateToItems(searchValue);
                var result = _this._navigateToItemsToString(items);
                return result;
            });
        };

        LanguageServiceShim.prototype.getScriptLexicalStructure = function (fileName) {
            var _this = this;
            return this.forwardJSONCall("getScriptLexicalStructure(\"" + fileName + "\")", function () {
                var items = _this.languageService.getScriptLexicalStructure(fileName);
                var result = _this._navigateToItemsToString(items);
                return result;
            });
        };

        LanguageServiceShim.prototype.getOutliningRegions = function (fileName) {
            var _this = this;
            return this.forwardJSONCall("getOutliningRegions(\"" + fileName + "\")", function () {
                var items = _this.languageService.getOutliningRegions(fileName);
                return items;
            });
        };

        LanguageServiceShim.prototype.getEmitOutput = function (fileName) {
            var _this = this;
            return this.forwardJSONCall("getEmitOutput(\"" + fileName + "\")", function () {
                var output = _this.languageService.getEmitOutput(fileName);
                return output;
            });
        };

        LanguageServiceShim.prototype._navigateToItemsToString = function (items) {
            var result = [];

            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                result.push({
                    name: item.name,
                    kind: item.kind,
                    kindModifiers: item.kindModifiers,
                    containerName: item.containerName,
                    containerKind: item.containerKind,
                    matchKind: item.matchKind,
                    fileName: item.fileName,
                    minChar: item.minChar,
                    limChar: item.limChar
                });
            }

            return result;
        };
        return LanguageServiceShim;
    })(ShimBase);
    Services.LanguageServiceShim = LanguageServiceShim;

    var ClassifierShim = (function (_super) {
        __extends(ClassifierShim, _super);
        function ClassifierShim(factory, host) {
            _super.call(this, factory);
            this.host = host;
            this.classifier = new Services.Classifier(this.host);
        }
        ClassifierShim.prototype.getClassificationsForLine = function (text, lexState) {
            var classification = this.classifier.getClassificationsForLine(text, lexState);
            var items = classification.entries;
            var result = "";
            for (var i = 0; i < items.length; i++) {
                result += items[i].length + "\n";
                result += items[i].classification + "\n";
            }
            result += classification.finalLexState;
            return result;
        };
        return ClassifierShim;
    })(ShimBase);
    Services.ClassifierShim = ClassifierShim;

    var CoreServicesShim = (function (_super) {
        __extends(CoreServicesShim, _super);
        function CoreServicesShim(factory, host) {
            _super.call(this, factory);
            this.host = host;
            this.logger = this.host.logger;
            this.services = new Services.CoreServices(this.host);
        }
        CoreServicesShim.prototype.forwardJSONCall = function (actionDescription, action) {
            return Services.forwardJSONCall(this.logger, actionDescription, action);
        };

        CoreServicesShim.prototype.getPreProcessedFileInfo = function (fileName, sourceText) {
            var _this = this;
            return this.forwardJSONCall("getPreProcessedFileInfo(\"" + fileName + "\")", function () {
                var result = _this.services.getPreProcessedFileInfo(fileName, sourceText);
                return result;
            });
        };

        CoreServicesShim.prototype.getDefaultCompilationSettings = function () {
            var _this = this;
            return this.forwardJSONCall("getDefaultCompilationSettings()", function () {
                var result = _this.services.getDefaultCompilationSettings();
                return result;
            });
        };

        CoreServicesShim.prototype.dumpMemory = function (dummy) {
            var _this = this;
            return this.forwardJSONCall("dumpMemory()", function () {
                return _this.services.dumpMemory();
            });
        };

        CoreServicesShim.prototype.getMemoryInfo = function (dummy) {
            var _this = this;
            return this.forwardJSONCall("getMemoryInfo()", function () {
                var result = _this.services.getMemoryInfo();
                return result;
            });
        };
        return CoreServicesShim;
    })(ShimBase);
    Services.CoreServicesShim = CoreServicesShim;
})(Services || (Services = {}));
