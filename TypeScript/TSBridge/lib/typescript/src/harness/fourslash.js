var FourSlash;
(function (FourSlash) {
    var assert = Harness.Assert;

    var fileMetadataNames = ['Filename'];
    var globalMetadataNames = ['Module', 'Target', 'BaselineFile'];

    FourSlash.currentTestState = null;

    var TestState = (function () {
        function TestState(testData) {
            this.testData = testData;
            this.languageServiceShimHost = null;
            this.languageService = null;
            this.currentCaretPosition = 0;
            this.lastKnownMarker = "";
            this.activeFile = null;
            this.enableFormatting = true;
            this.formatCodeOptions = null;
            this.languageServiceShimHost = new Harness.TypeScriptLS();

            for (var i = 0; i < testData.files.length; i++) {
                this.languageServiceShimHost.addScript(testData.files[i].fileName, testData.files[i].content);
            }

            this.languageServiceShimHost.addScript('lib.d.ts', Harness.Compiler.libTextMinimal);

            this.languageService = this.languageServiceShimHost.getLanguageService().languageService;
            var compilerState = (this.languageService).compilerState;
            this.compiler = (compilerState).compiler;

            this.formatCodeOptions = new Services.FormatCodeOptions();

            this.openFile(0);
        }
        TestState.prototype.goToMarker = function (name) {
            if (typeof name === "undefined") { name = ''; }
            var marker = this.getMarkerByName(name);
            if (this.activeFile.fileName !== marker.fileName) {
                this.openFile(marker.fileName);
            }

            var scriptSnapshot = this.languageServiceShimHost.getScriptSnapshot(marker.fileName);
            if (marker.position === -1 || marker.position > scriptSnapshot.getLength()) {
                throw new Error('Marker "' + name + '" has been invalidated by unrecoverable edits to the file.');
            }
            this.lastKnownMarker = name;
            this.currentCaretPosition = marker.position;
        };

        TestState.prototype.goToPosition = function (pos) {
            this.currentCaretPosition = pos;
        };

        TestState.prototype.moveCaretRight = function (count) {
            if (typeof count === "undefined") { count = 1; }
            this.currentCaretPosition += count;
            this.currentCaretPosition = Math.min(this.currentCaretPosition, this.languageServiceShimHost.getScriptSnapshot(this.activeFile.fileName).getLength());
        };

        TestState.prototype.openFile = function (indexOrName) {
            var fileToOpen = this.findFile(indexOrName);
            this.activeFile = fileToOpen;
        };

        TestState.prototype.verifyErrorExistsBetweenMarkers = function (startMarkerName, endMarkerName, negative) {
            var startMarker = this.getMarkerByName(startMarkerName);
            var endMarker = this.getMarkerByName(endMarkerName);
            var predicate = function (errorMinChar, errorLimChar, startPos, endPos) {
                return ((errorMinChar === startPos) && (errorLimChar === endPos)) ? true : false;
            };

            var exists = this.anyErrorInRange(predicate, startMarker, endMarker);

            if (exists !== negative) {
                this.printErrorLog(negative, this.getAllDiagnostics());
                throw new Error("Failure between markers: " + startMarkerName + ", " + endMarkerName);
            }
        };

        TestState.prototype.getDiagnostics = function (fileName) {
            var syntacticErrors = this.languageService.getSyntacticDiagnostics(fileName);
            var semanticErrors = this.languageService.getSemanticDiagnostics(fileName);

            var diagnostics = [];
            diagnostics.push.apply(diagnostics, syntacticErrors);
            diagnostics.push.apply(diagnostics, semanticErrors);

            return diagnostics;
        };

        TestState.prototype.getAllDiagnostics = function () {
            var diagnostics = [];

            var fileNames = JSON2.parse(this.languageServiceShimHost.getScriptFileNames());
            for (var i = 0, n = fileNames.length; i < n; i++) {
                diagnostics.push.apply(this.getDiagnostics(fileNames[i]));
            }

            return diagnostics;
        };

        TestState.prototype.verifyErrorExistsAfterMarker = function (markerName, negative, after) {
            var marker = this.getMarkerByName(markerName);
            var predicate;

            if (after) {
                predicate = function (errorMinChar, errorLimChar, startPos, endPos) {
                    return ((errorMinChar >= startPos) && (errorLimChar >= startPos)) ? true : false;
                };
            } else {
                predicate = function (errorMinChar, errorLimChar, startPos, endPos) {
                    return ((errorMinChar <= startPos) && (errorLimChar <= startPos)) ? true : false;
                };
            }

            var exists = this.anyErrorInRange(predicate, marker);
            var diagnostics = this.getAllDiagnostics();

            if (exists !== negative) {
                this.printErrorLog(negative, diagnostics);
                throw new Error("Failure at marker: " + markerName);
            }
        };

        TestState.prototype.anyErrorInRange = function (predicate, startMarker, endMarker) {
            var errors = this.getDiagnostics(startMarker.fileName);
            var exists = false;

            var startPos = startMarker.position;
            if (endMarker !== undefined) {
                var endPos = endMarker.position;
            }

            errors.forEach(function (error) {
                if (predicate(error.start(), error.start() + error.length(), startPos, endPos)) {
                    exists = true;
                }
            });

            return exists;
        };

        TestState.prototype.printErrorLog = function (expectErrors, errors) {
            if (expectErrors) {
                IO.printLine("Expected error not found.  Error list is:");
            } else {
                IO.printLine("Unexpected error(s) found.  Error list is:");
            }

            errors.forEach(function (error) {
                IO.printLine("  minChar: " + error.start() + ", limChar: " + (error.start() + error.length()) + ", message: " + error.message() + "\n");
            });
        };

        TestState.prototype.verifyNumberOfErrorsInCurrentFile = function (expected) {
            var errors = this.getDiagnostics(this.activeFile.fileName);
            var actual = errors.length;
            if (actual !== expected) {
                var errorMsg = "Actual number of errors (" + actual + ") does not match expected number (" + expected + ")";
                IO.printLine(errorMsg);
                throw new Error(errorMsg);
            }
        };

        TestState.prototype.verifyMemberListContains = function (symbol, type, docComment, fullSymbolName, kind) {
            var members = this.getMemberListAtCaret();

            if (members) {
                this.assertItemInCompletionList(members.entries, symbol, type, docComment, fullSymbolName, kind);
            } else {
                throw new Error("Expected a member list, but none was provided");
            }
        };

        TestState.prototype.verifyMemberListCount = function (expectedCount, negative) {
            var members = this.getMemberListAtCaret();

            if (members) {
                var match = members.entries.length === expectedCount;

                if ((!match && !negative) || (match && negative)) {
                    throw new Error("Member list count was " + members.entries.length + ". Expected " + expectedCount);
                }
            } else if (expectedCount) {
                throw new Error("Member list count was 0. Expected " + expectedCount);
            }
        };

        TestState.prototype.verifyMemberListDoesNotContain = function (symbol) {
            var members = this.getMemberListAtCaret();
            if (members.entries.filter(function (e) {
                return e.name === symbol;
            }).length !== 0) {
                throw new Error('Member list did contain ' + symbol);
            }
        };

        TestState.prototype.verifyCompletionListItemsCountIsGreaterThan = function (count) {
            var completions = this.getCompletionListAtCaret();
            var itemsCount = completions.entries.length;

            if (itemsCount <= count) {
                throw new Error('Expected completion list items count to be greater than ' + count + ', but is actually ' + itemsCount);
            }
        };

        TestState.prototype.verifyMemberListIsEmpty = function (negative) {
            var members = this.getMemberListAtCaret();
            if ((!members || members.entries.length === 0) && negative) {
                throw new Error("Member list is empty at Caret");
            } else if ((members && members.entries.length !== 0) && !negative) {
                var errorMsg = "\n" + "Member List contains: [" + members.entries[0].name;
                for (var i = 1; i < members.entries.length; i++) {
                    errorMsg += ", " + members.entries[i].name;
                }
                errorMsg += "]\n";

                IO.printLine(errorMsg);
                throw new Error("Member list is not empty at Caret");
            }
        };

        TestState.prototype.verifyCompletionListIsEmpty = function (negative) {
            var completions = this.getCompletionListAtCaret();
            if ((!completions || completions.entries.length === 0) && negative) {
                throw new Error("Completion list is empty at Caret");
            } else if ((completions && completions.entries.length !== 0) && !negative) {
                var errorMsg = "\n" + "Completion List contains: [" + completions.entries[0].name;
                for (var i = 1; i < completions.entries.length; i++) {
                    errorMsg += ", " + completions.entries[i].name;
                }
                errorMsg += "]\n";

                IO.printLine(errorMsg);
                throw new Error("Completion list is not empty at Caret");
            }
        };

        TestState.prototype.verifyCompletionListContains = function (symbol, type, docComment, fullSymbolName, kind) {
            var completions = this.getCompletionListAtCaret();
            this.assertItemInCompletionList(completions.entries, symbol, type, docComment, fullSymbolName, kind);
        };

        TestState.prototype.verifyCompletionListDoesNotContain = function (symbol) {
            var completions = this.getCompletionListAtCaret();
            if (completions.entries.filter(function (e) {
                return e.name === symbol;
            }).length !== 0) {
                throw new Error('Completion list did contain ' + symbol);
            }
        };

        TestState.prototype.verifyReferencesCountIs = function (count, localFilesOnly) {
            if (typeof localFilesOnly === "undefined") { localFilesOnly = true; }
            var references = this.getReferencesAtCaret();
            var referencesCount = 0;

            if (localFilesOnly) {
                var localFiles = this.testData.files.map(function (file) {
                    return file.fileName;
                });

                references.forEach(function (entry) {
                    if (localFiles.some(function (filename) {
                        return filename === entry.fileName;
                    })) {
                        ++referencesCount;
                    }
                });
            } else {
                referencesCount = references.length;
            }

            if (referencesCount !== count) {
                var condition = localFilesOnly ? "excluding libs" : "including libs";
                throw new Error("Expected references count (" + condition + ") to be " + count + ", but is actually " + references.length);
            }
        };

        TestState.prototype.getMemberListAtCaret = function () {
            return this.languageService.getCompletionsAtPosition(this.activeFile.fileName, this.currentCaretPosition, true);
        };

        TestState.prototype.getCompletionListAtCaret = function () {
            return this.languageService.getCompletionsAtPosition(this.activeFile.fileName, this.currentCaretPosition, false);
        };

        TestState.prototype.getReferencesAtCaret = function () {
            return this.languageService.getReferencesAtPosition(this.activeFile.fileName, this.currentCaretPosition);
        };

        TestState.prototype.verifyQuickInfo = function (negative, expectedTypeName, docComment, symbolName, kind) {
            var actualQuickInfo = this.languageService.getTypeAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            var actualQuickInfoMemberName = actualQuickInfo ? actualQuickInfo.memberName.toString() : "";
            var actualQuickInfoDocComment = actualQuickInfo ? actualQuickInfo.docComment : "";
            var actualQuickInfoSymbolName = actualQuickInfo ? actualQuickInfo.fullSymbolName : "";
            var actualQuickInfoKind = actualQuickInfo ? actualQuickInfo.kind : "";
            if (negative) {
                if (expectedTypeName !== undefined) {
                    assert.notEqual(actualQuickInfoMemberName, expectedTypeName);
                }
                if (docComment != undefined) {
                    assert.notEqual(actualQuickInfoDocComment, docComment);
                }
                if (symbolName !== undefined) {
                    assert.notEqual(actualQuickInfoSymbolName, symbolName);
                }
                if (kind !== undefined) {
                    assert.notEqual(actualQuickInfoKind, kind);
                }
            } else {
                if (expectedTypeName !== undefined) {
                    assert.equal(actualQuickInfoMemberName, expectedTypeName);
                }
                if (docComment != undefined) {
                    assert.equal(actualQuickInfoDocComment, docComment);
                }
                if (symbolName !== undefined) {
                    assert.equal(actualQuickInfoSymbolName, symbolName);
                }
                if (kind !== undefined) {
                    assert.equal(actualQuickInfoKind, kind);
                }
            }
        };

        TestState.prototype.verifyQuickInfoExists = function (negative) {
            var actualQuickInfo = this.languageService.getTypeAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            if (negative) {
                if (actualQuickInfo) {
                    throw new Error('verifyQuickInfoExists failed. Expected quick info NOT to exist');
                }
            } else {
                if (!actualQuickInfo) {
                    throw new Error('verifyQuickInfoExists failed. Expected quick info to exist');
                }
            }
        };

        TestState.prototype.verifyCurrentSignatureHelpIs = function (expected) {
            var help = this.getActiveSignatureHelp();
            assert.equal(help.signatureInfo, expected);
        };

        TestState.prototype.verifyCurrentParameterIsVariable = function (isVariable) {
            var activeParameter = this.getActiveParameter();
            assert.notNull(activeParameter.parameter);
            assert.equal(isVariable, activeParameter.parameter.isVariable);
        };

        TestState.prototype.verifyCurrentParameterHelpName = function (name) {
            var activeParameter = this.getActiveParameter();
            var activeParameterName = activeParameter.parameter ? activeParameter.parameter.name : activeParameter.typeParameter.name;
            assert.equal(activeParameterName, name);
        };

        TestState.prototype.verifyCurrentParameterSpanIs = function (parameter) {
            var activeSignature = this.getActiveSignatureHelp();
            var activeParameter = this.getActiveParameter();
            var activeParameterMinChar = activeParameter.parameter ? activeParameter.parameter.minChar : activeParameter.typeParameter.minChar;
            var activeParameterLimChar = activeParameter.parameter ? activeParameter.parameter.limChar : activeParameter.typeParameter.limChar;
            assert.equal(activeSignature.signatureInfo.substring(activeParameterMinChar, activeParameterLimChar), parameter);
        };

        TestState.prototype.verifyCurrentParameterHelpDocComment = function (docComment) {
            var activeParameter = this.getActiveParameter();
            var activeParameterDocComment = activeParameter.parameter ? activeParameter.parameter.docComment : activeParameter.typeParameter.docComment;
            assert.equal(activeParameterDocComment, docComment);
        };

        TestState.prototype.verifyCurrentSignatureHelpParameterCount = function (expectedCount) {
            assert.equal(this.getActiveSignatureHelp().parameters.length, expectedCount);
        };

        TestState.prototype.verifyCurrentSignatureHelpTypeParameterCount = function (expectedCount) {
            assert.equal(this.getActiveSignatureHelp().typeParameters.length, expectedCount);
        };

        TestState.prototype.verifyCurrentSignatureHelpDocComment = function (docComment) {
            var actualDocComment = this.getActiveSignatureHelp().docComment;
            assert.equal(actualDocComment, docComment);
        };

        TestState.prototype.verifySignatureHelpCount = function (expected) {
            var help = this.languageService.getSignatureAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            var actual = help && help.formal ? help.formal.length : 0;
            assert.equal(actual, expected);
        };

        TestState.prototype.verifySignatureHelpPresent = function (shouldBePresent) {
            if (typeof shouldBePresent === "undefined") { shouldBePresent = true; }
            var actual = this.languageService.getSignatureAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            if (shouldBePresent) {
                if (!actual) {
                    throw new Error("Expected signature help to be present, but it wasn't");
                }
            } else {
                if (actual) {
                    throw new Error("Expected no signature help, but got '" + JSON2.stringify(actual) + "'");
                }
            }
        };

        TestState.prototype.getFormalParameter = function () {
            var help = this.languageService.getSignatureAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            return help.formal;
        };

        TestState.prototype.getActiveSignatureHelp = function () {
            var help = this.languageService.getSignatureAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            var activeFormal = help.activeFormal;

            if (activeFormal === -1) {
                activeFormal = 0;
            }

            return help.formal[activeFormal];
        };

        TestState.prototype.getActiveParameter = function () {
            var currentSig = this.getActiveSignatureHelp();
            var help = this.languageService.getSignatureAtPosition(this.activeFile.fileName, this.currentCaretPosition);

            var currentParam = help.actual.currentParameter;
            if (currentParam === -1)
                currentParam = 0;

            if (help.actual.currentParameterIsTypeParameter) {
                return {
                    parameter: null,
                    typeParameter: currentSig.typeParameters[currentParam]
                };
            } else {
                return {
                    parameter: currentSig.parameters[currentParam],
                    typeParameter: null
                };
            }
        };

        TestState.prototype.getBreakpointStatementLocation = function (pos) {
            var spanInfo = this.languageService.getBreakpointStatementAtPosition(this.activeFile.fileName, pos);
            var resultString = "\n**Pos: " + pos + " SpanInfo: " + JSON2.stringify(spanInfo) + "\n** Statement: ";
            if (spanInfo !== null) {
                resultString = resultString + this.activeFile.content.substr(spanInfo.minChar, spanInfo.limChar - spanInfo.minChar);
            }
            return resultString;
        };

        TestState.prototype.baselineCurrentFileBreakpointLocations = function () {
            var _this = this;
            Harness.Baseline.runBaseline("Breakpoint Locations for " + this.activeFile.fileName, this.testData.globalOptions['BaselineFile'], function () {
                var fileLength = _this.languageServiceShimHost.getScriptSnapshot(_this.activeFile.fileName).getLength();
                var resultString = "";
                for (var pos = 0; pos < fileLength; pos++) {
                    resultString = resultString + _this.getBreakpointStatementLocation(pos);
                }
                return resultString;
            }, true);
        };

        TestState.prototype.printBreakpointLocation = function (pos) {
            IO.printLine(this.getBreakpointStatementLocation(pos));
        };

        TestState.prototype.printBreakpointAtCurrentLocation = function () {
            this.printBreakpointLocation(this.currentCaretPosition);
        };

        TestState.prototype.printCurrentParameterHelp = function () {
            var help = this.languageService.getSignatureAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            IO.printLine(JSON2.stringify(help));
        };

        TestState.prototype.printCurrentQuickInfo = function () {
            var quickInfo = this.languageService.getTypeAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            IO.printLine(JSON2.stringify(quickInfo));
        };

        TestState.prototype.printErrorList = function () {
            var syntacticErrors = this.languageService.getSyntacticDiagnostics(this.activeFile.fileName);
            var semanticErrors = this.languageService.getSemanticDiagnostics(this.activeFile.fileName);
            var errorList = syntacticErrors.concat(semanticErrors);
            IO.printLine('Error list (' + errorList.length + ' errors)');

            if (errorList.length) {
                errorList.forEach(function (err) {
                    IO.printLine("start: " + err.start() + ", length: " + err.length() + ", message: " + err.message());
                });
            }
        };

        TestState.prototype.printCurrentFileState = function (makeWhitespaceVisible, makeCaretVisible) {
            if (typeof makeWhitespaceVisible === "undefined") { makeWhitespaceVisible = false; }
            if (typeof makeCaretVisible === "undefined") { makeCaretVisible = true; }
            for (var i = 0; i < this.testData.files.length; i++) {
                var file = this.testData.files[i];
                var active = (this.activeFile === file);

                IO.printLine('=== Script (' + file.fileName + ') ' + (active ? '(active, cursor at |)' : '') + ' ===');
                var snapshot = this.languageServiceShimHost.getScriptSnapshot(file.fileName);
                var content = snapshot.getText(0, snapshot.getLength());
                if (active) {
                    content = content.substr(0, this.currentCaretPosition) + (makeCaretVisible ? '|' : "") + content.substr(this.currentCaretPosition);
                }
                if (makeWhitespaceVisible) {
                    content = TestState.makeWhitespaceVisible(content);
                }
                IO.printLine(content);
            }
        };

        TestState.prototype.printCurrentSignatureHelp = function () {
            var sigHelp = this.getActiveSignatureHelp();
            IO.printLine(JSON2.stringify(sigHelp));
        };

        TestState.prototype.printMemberListMembers = function () {
            var members = this.getMemberListAtCaret();
            IO.printLine(JSON2.stringify(members));
        };

        TestState.prototype.printCompletionListMembers = function () {
            var completions = this.getCompletionListAtCaret();
            IO.printLine(JSON2.stringify(completions));
        };

        TestState.prototype.deleteChar = function (count) {
            if (typeof count === "undefined") { count = 1; }
            var offset = this.currentCaretPosition;
            var ch = "";

            for (var i = 0; i < count; i++) {
                this.languageServiceShimHost.editScript(this.activeFile.fileName, offset, offset + 1, ch);
                this.updateMarkersForEdit(this.activeFile.fileName, offset, offset + 1, ch);

                if (this.enableFormatting) {
                    var edits = this.languageService.getFormattingEditsAfterKeystroke(this.activeFile.fileName, offset, ch, this.formatCodeOptions);
                    offset += this.applyEdits(this.activeFile.fileName, edits);
                }
            }

            this.currentCaretPosition = offset;

            this.fixCaretPosition();
            this.checkPostEditInvariants();
        };

        TestState.prototype.replace = function (start, length, text) {
            this.languageServiceShimHost.editScript(this.activeFile.fileName, start, start + length, text);
            this.updateMarkersForEdit(this.activeFile.fileName, start, start + length, text);

            this.checkPostEditInvariants();
        };

        TestState.prototype.deleteCharBehindMarker = function (count) {
            if (typeof count === "undefined") { count = 1; }
            var offset = this.currentCaretPosition;
            var ch = "";

            for (var i = 0; i < count; i++) {
                offset--;

                this.languageServiceShimHost.editScript(this.activeFile.fileName, offset, offset + 1, ch);
                this.updateMarkersForEdit(this.activeFile.fileName, offset, offset + 1, ch);

                if (this.enableFormatting) {
                    var edits = this.languageService.getFormattingEditsAfterKeystroke(this.activeFile.fileName, offset, ch, this.formatCodeOptions);
                    offset += this.applyEdits(this.activeFile.fileName, edits);
                }
            }

            this.currentCaretPosition = offset;

            this.fixCaretPosition();

            this.checkPostEditInvariants();
        };

        TestState.prototype.type = function (text) {
            var offset = this.currentCaretPosition;
            for (var i = 0; i < text.length; i++) {
                var ch = text.charAt(i);
                this.languageServiceShimHost.editScript(this.activeFile.fileName, offset, offset, ch);
                this.updateMarkersForEdit(this.activeFile.fileName, offset, offset, ch);
                offset++;

                if (this.enableFormatting) {
                    var edits = this.languageService.getFormattingEditsAfterKeystroke(this.activeFile.fileName, offset, ch, this.formatCodeOptions);
                    offset += this.applyEdits(this.activeFile.fileName, edits);
                }
            }

            this.currentCaretPosition = offset;

            this.fixCaretPosition();

            this.checkPostEditInvariants();
        };

        TestState.prototype.paste = function (text) {
            var start = this.currentCaretPosition;
            var offset = this.currentCaretPosition;
            this.languageServiceShimHost.editScript(this.activeFile.fileName, offset, offset, text);
            this.updateMarkersForEdit(this.activeFile.fileName, offset, offset, text);
            offset += text.length;

            if (this.enableFormatting) {
                var edits = this.languageService.getFormattingEditsOnPaste(this.activeFile.fileName, start, offset, this.formatCodeOptions);
                offset += this.applyEdits(this.activeFile.fileName, edits);
            }

            this.currentCaretPosition = offset;
            this.fixCaretPosition();

            this.checkPostEditInvariants();
        };

        TestState.prototype.checkPostEditInvariants = function () {
            var incrSyntaxErrs = JSON2.stringify(this.languageService.getSyntacticDiagnostics(this.activeFile.fileName));

            var compilationSettings = new TypeScript.CompilationSettings();
            var parseOptions = TypeScript.getParseOptions(compilationSettings);
            var snapshot = this.languageServiceShimHost.getScriptSnapshot(this.activeFile.fileName);
            var content = snapshot.getText(0, snapshot.getLength());
            var refSyntaxTree = TypeScript.Parser.parse(this.activeFile.fileName, TypeScript.SimpleText.fromString(content), TypeScript.isDTSFile(this.activeFile.fileName), TypeScript.LanguageVersion.EcmaScript5, parseOptions);
            var fullSyntaxErrs = JSON2.stringify(refSyntaxTree.diagnostics());
            var refAST = TypeScript.SyntaxTreeToAstVisitor.visit(refSyntaxTree, this.activeFile.fileName, compilationSettings);
            var compiler = new TypeScript.TypeScriptCompiler();

            compiler.addSourceUnit('lib.d.ts', TypeScript.ScriptSnapshot.fromString(Harness.Compiler.libTextMinimal), ByteOrderMark.None, 0, true);
            compiler.addSourceUnit(this.activeFile.fileName, TypeScript.ScriptSnapshot.fromString(content), ByteOrderMark.None, 0, true);

            compiler.pullTypeCheck();
            var refSemanticErrs = JSON2.stringify(compiler.getSemanticDiagnostics(this.activeFile.fileName));
            var incrSemanticErrs = JSON2.stringify(this.languageService.getSemanticDiagnostics(this.activeFile.fileName));

            if (!refSyntaxTree.structuralEquals(this.compiler.getSyntaxTree(this.activeFile.fileName))) {
                throw new Error('Incrementally-parsed and full-parsed syntax trees were not equal');
            }

            if (!TypeScript.structuralEqualsIncludingPosition(refAST, this.compiler.getScript(this.activeFile.fileName))) {
                throw new Error('Incrementally-parsed and full-parsed ASTs were not equal');
            }

            if (incrSyntaxErrs !== fullSyntaxErrs) {
                throw new Error('Mismatched incremental/full syntactic errors.\n=== Incremental errors ===\n' + incrSyntaxErrs + '\n=== Full Errors ===\n' + fullSyntaxErrs);
            }

            if (incrSemanticErrs !== refSemanticErrs) {
                throw new Error('Mismatched incremental/full semantic errors.\n=== Incremental errors ===\n' + incrSemanticErrs + '\n=== Full Errors ===\n' + refSemanticErrs);
            }
        };

        TestState.prototype.fixCaretPosition = function () {
            if (this.currentCaretPosition > 0) {
                var ch = this.languageServiceShimHost.getScriptSnapshot(this.activeFile.fileName).getText(this.currentCaretPosition - 1, this.currentCaretPosition);
                if (ch === '\r') {
                    this.currentCaretPosition--;
                }
            }
            ;
        };

        TestState.prototype.applyEdits = function (fileName, edits) {
            var runningOffset = 0;
            for (var j = 0; j < edits.length; j++) {
                this.languageServiceShimHost.editScript(fileName, edits[j].minChar + runningOffset, edits[j].limChar + runningOffset, edits[j].text);
                this.updateMarkersForEdit(fileName, edits[j].minChar + runningOffset, edits[j].limChar + runningOffset, edits[j].text);
                var change = (edits[j].minChar - edits[j].limChar) + edits[j].text.length;
                runningOffset += change;
            }
            return runningOffset;
        };

        TestState.prototype.formatDocument = function () {
            var edits = this.languageService.getFormattingEditsForDocument(this.activeFile.fileName, 0, this.languageServiceShimHost.getScriptSnapshot(this.activeFile.fileName).getLength(), this.formatCodeOptions);
            this.currentCaretPosition += this.applyEdits(this.activeFile.fileName, edits);
            this.fixCaretPosition();
        };

        TestState.prototype.formatSelection = function (start, end) {
            var edits = this.languageService.getFormattingEditsForRange(this.activeFile.fileName, start, end, this.formatCodeOptions);
            this.currentCaretPosition += this.applyEdits(this.activeFile.fileName, edits);
            this.fixCaretPosition();
        };

        TestState.prototype.updateMarkersForEdit = function (fileName, minChar, limChar, text) {
            for (var i = 0; i < this.testData.markers.length; i++) {
                var marker = this.testData.markers[i];
                if (marker.fileName === fileName) {
                    if (marker.position > minChar) {
                        if (marker.position < limChar) {
                            marker.position = -1;
                        } else {
                            marker.position += (minChar - limChar) + text.length;
                        }
                    }
                }
            }
        };

        TestState.prototype.goToBOF = function () {
            this.currentCaretPosition = 0;
        };

        TestState.prototype.goToEOF = function () {
            this.currentCaretPosition = this.languageServiceShimHost.getScriptSnapshot(this.activeFile.fileName).getLength();
        };

        TestState.prototype.goToDefinition = function (definitionIndex) {
            this.languageService.refresh();

            var definitions = this.languageService.getDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            if (!definitions || !definitions.length) {
                throw new Error('goToDefinition failed - expected to at least one defintion location but got 0');
            }

            if (definitionIndex >= definitions.length) {
                throw new Error('goToDefinition failed - definitionIndex value (' + definitionIndex + ') exceeds definition list size (' + definitions.length + ')');
            }

            var definition = definitions[definitionIndex];
            this.openFile(definition.fileName);
            this.currentCaretPosition = definition.minChar;
        };

        TestState.prototype.getMarkers = function () {
            return this.testData.markers.slice(0);
        };

        TestState.prototype.getRanges = function () {
            return this.testData.ranges.slice(0);
        };

        TestState.prototype.verifyCaretAtMarker = function (markerName) {
            if (typeof markerName === "undefined") { markerName = ''; }
            var pos = this.getMarkerByName(markerName);
            if (pos.fileName !== this.activeFile.fileName) {
                throw new Error('verifyCaretAtMarker failed - expected to be in file "' + pos.fileName + '", but was in file "' + this.activeFile.fileName + '"');
            }
            if (pos.position !== this.currentCaretPosition) {
                throw new Error('verifyCaretAtMarker failed - expected to be at marker "/*' + markerName + '*/, but was at position ' + this.currentCaretPosition + '(' + this.getLineColStringAtCaret() + ')');
            }
        };

        TestState.prototype.getIndentation = function (fileName, position) {
            return this.languageService.getIndentationAtPosition(fileName, position, this.formatCodeOptions);
        };

        TestState.prototype.verifyIndentationAtCurrentPosition = function (numberOfSpaces) {
            var actual = this.getIndentation(this.activeFile.fileName, this.currentCaretPosition);
            if (actual != numberOfSpaces) {
                throw new Error('verifyIndentationAtCurrentPosition failed - expected: ' + numberOfSpaces + ', actual: ' + actual);
            }
        };

        TestState.prototype.verifyIndentationAtPosition = function (fileName, position, numberOfSpaces) {
            var actual = this.getIndentation(fileName, position);
            if (actual !== numberOfSpaces) {
                throw new Error('verifyIndentationAtPosition failed - expected: ' + numberOfSpaces + ', actual: ' + actual);
            }
        };

        TestState.prototype.verifyCurrentLineContent = function (text) {
            var actual = this.getCurrentLineContent();
            if (actual !== text) {
                throw new Error('verifyCurrentLineContent\n' + '\tExpected: "' + text + '"\n' + '\t  Actual: "' + actual + '"');
            }
        };

        TestState.prototype.verifyCurrentFileContent = function (text) {
            var actual = this.getCurrentFileContent();
            var replaceNewlines = function (str) {
                return str.replace(/\r\n/g, "\n");
            };
            if (replaceNewlines(actual) !== replaceNewlines(text)) {
                throw new Error('verifyCurrentLineContent\n' + '\tExpected: "' + text + '"\n' + '\t  Actual: "' + actual + '"');
            }
        };

        TestState.prototype.verifyTextAtCaretIs = function (text) {
            var actual = this.languageServiceShimHost.getScriptSnapshot(this.activeFile.fileName).getText(this.currentCaretPosition, this.currentCaretPosition + text.length);
            if (actual !== text) {
                throw new Error('verifyTextAtCaretIs\n' + '\tExpected: "' + text + '"\n' + '\t  Actual: "' + actual + '"');
            }
        };

        TestState.prototype.verifyCurrentNameOrDottedNameSpanText = function (text) {
            var span = this.languageService.getNameOrDottedNameSpan(this.activeFile.fileName, this.currentCaretPosition, this.currentCaretPosition);
            if (span === null) {
                throw new Error('verifyCurrentNameOrDottedNameSpanText\n' + '\tExpected: "' + text + '"\n' + '\t  Actual: null');
            }

            var actual = this.languageServiceShimHost.getScriptSnapshot(this.activeFile.fileName).getText(span.minChar, span.limChar);
            if (actual !== text) {
                throw new Error('verifyCurrentNameOrDottedNameSpanText\n' + '\tExpected: "' + text + '"\n' + '\t  Actual: "' + actual + '"');
            }
        };

        TestState.prototype.getNameOrDottedNameSpan = function (pos) {
            var spanInfo = this.languageService.getNameOrDottedNameSpan(this.activeFile.fileName, pos, pos);
            var resultString = "\n**Pos: " + pos + " SpanInfo: " + JSON2.stringify(spanInfo) + "\n** Statement: ";
            if (spanInfo !== null) {
                resultString = resultString + this.languageServiceShimHost.getScriptSnapshot(this.activeFile.fileName).getText(spanInfo.minChar, spanInfo.limChar);
            }
            return resultString;
        };

        TestState.prototype.baselineCurrentFileNameOrDottedNameSpans = function () {
            var _this = this;
            Harness.Baseline.runBaseline("Name OrDottedNameSpans for " + this.activeFile.fileName, this.testData.globalOptions['BaselineFile'], function () {
                var fileLength = _this.languageServiceShimHost.getScriptSnapshot(_this.activeFile.fileName).getLength();
                var resultString = "";
                for (var pos = 0; pos < fileLength; pos++) {
                    resultString = resultString + _this.getNameOrDottedNameSpan(pos);
                }
                return resultString;
            }, true);
        };

        TestState.prototype.printNameOrDottedNameSpans = function (pos) {
            IO.printLine(this.getNameOrDottedNameSpan(pos));
        };

        TestState.prototype.verifyOutliningSpans = function (spans) {
            var actual = this.languageService.getOutliningRegions(this.activeFile.fileName);

            if (actual.length !== spans.length) {
                throw new Error('verifyOutliningSpans failed - expected total spans to be ' + spans.length + ', but was ' + actual.length);
            }

            for (var i = 0; i < spans.length; i++) {
                var expectedSpan = spans[i];
                var actualSpan = actual[i];
                if (expectedSpan.start !== actualSpan.start() || expectedSpan.end !== actualSpan.end()) {
                    throw new Error('verifyOutliningSpans failed - span ' + (i + 1) + ' expected: (' + expectedSpan.start + ',' + expectedSpan.end + '),  actual: (' + actualSpan.start() + ',' + actualSpan.end() + ')');
                }
            }
        };

        TestState.prototype.verifyMatchingBracePosition = function (bracePosition, expectedMatchPosition) {
            var actual = this.languageService.getBraceMatchingAtPosition(this.activeFile.fileName, bracePosition);

            if (actual.length !== 2) {
                throw new Error('verifyMatchingBracePosition failed - expected result to contain 2 spans, but it had ' + actual.length);
            }

            var actualMatchPosition = -1;
            if (bracePosition >= actual[0].start() && bracePosition <= actual[0].end()) {
                actualMatchPosition = actual[1].start();
            } else if (bracePosition >= actual[1].start() && bracePosition <= actual[1].end()) {
                actualMatchPosition = actual[0].start();
            } else {
                throw new Error('verifyMatchingBracePosition failed - could not find the brace position: ' + bracePosition + ' in the returned list: (' + actual[0].start() + ',' + actual[0].end() + ') and (' + actual[1].start() + ',' + actual[1].end() + ')');
            }

            if (actualMatchPosition !== expectedMatchPosition) {
                throw new Error('verifyMatchingBracePosition failed - expected: ' + actualMatchPosition + ',  actual: ' + expectedMatchPosition);
            }
        };

        TestState.prototype.verifyNoMatchingBracePosition = function (bracePosition) {
            var actual = this.languageService.getBraceMatchingAtPosition(this.activeFile.fileName, bracePosition);

            if (actual.length !== 0) {
                throw new Error('verifyNoMatchingBracePosition failed - expected: 0 spans, actual: ' + actual.length);
            }
        };

        TestState.prototype.verifyTypesAgainstFullCheckAtPositions = function (positions) {
            var referenceLanguageServiceShimHost = new Harness.TypeScriptLS();
            var referenceLanguageServiceShim = referenceLanguageServiceShimHost.getLanguageService();
            var referenceLanguageService = referenceLanguageServiceShim.languageService;

            for (var i = 0; i < this.testData.files.length; i++) {
                var file = this.testData.files[i];

                var snapshot = this.languageServiceShimHost.getScriptSnapshot(file.fileName);
                var content = snapshot.getText(0, snapshot.getLength());
                referenceLanguageServiceShimHost.addScript(this.testData.files[i].fileName, content);
            }
            referenceLanguageServiceShim.refresh(true);

            for (i = 0; i < positions.length; i++) {
                var nameOf = function (type) {
                    return type ? type.fullSymbolName : '(none)';
                };

                var pullName, refName;
                var anyFailed = false;

                var errMsg = '';

                try  {
                    var pullType = this.languageService.getTypeAtPosition(this.activeFile.fileName, positions[i]);
                    pullName = nameOf(pullType);
                } catch (err1) {
                    errMsg = 'Failed to get pull type check. Exception: ' + err1 + '\r\n';
                    if (err1.stack)
                        errMsg = errMsg + err1.stack;
                    pullName = '(failed)';
                    anyFailed = true;
                }

                try  {
                    var referenceType = referenceLanguageService.getTypeAtPosition(this.activeFile.fileName, positions[i]);
                    refName = nameOf(referenceType);
                } catch (err2) {
                    errMsg = 'Failed to get full type check. Exception: ' + err2 + '\r\n';
                    if (err2.stack)
                        errMsg = errMsg + err2.stack;
                    refName = '(failed)';
                    anyFailed = true;
                }

                var failure = anyFailed || (refName !== pullName);
                if (failure) {
                    snapshot = this.languageServiceShimHost.getScriptSnapshot(this.activeFile.fileName);
                    content = snapshot.getText(0, snapshot.getLength());
                    var textAtPosition = content.substr(positions[i], 10);
                    var positionDescription = 'Position ' + positions[i] + ' ("' + textAtPosition + '"...)';

                    if (anyFailed) {
                        throw new Error('Exception thrown in language service for ' + positionDescription + '\r\n' + errMsg);
                    } else if (refName !== pullName) {
                        throw new Error('Pull/Full disagreement failed at ' + positionDescription + ' - expected full typecheck type "' + refName + '" to equal pull type "' + pullName + '".');
                    }
                }
            }
        };

        TestState.prototype.verifyNavigationItemsCount = function (expected) {
            var items = this.languageService.getScriptLexicalStructure(this.activeFile.fileName);
            var actual = (items && items.length) || 0;
            if (expected != actual) {
                throw new Error('verifyNavigationItemsCount failed - found: ' + actual + ' navigation items, expected: ' + expected + '.');
            }
        };

        TestState.prototype.verifyNavigationItemsListContains = function (name, kind, fileName, parentName) {
            var items = this.languageService.getScriptLexicalStructure(this.activeFile.fileName);

            if (!items || items.length === 0) {
                throw new Error('verifyNavigationItemsListContains failed - found 0 navigation items, expected at least one.');
            }

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item && item.name === name && item.kind === kind && item.fileName === fileName) {
                    return;
                }
            }

            var missingItem = { name: name, kind: kind, fileName: fileName, parentName: parentName };
            throw new Error('verifyNavigationItemsListContains failed - could not find the item: ' + JSON.stringify(missingItem) + ' in the returned list: (' + JSON.stringify(items) + ')');
        };

        TestState.prototype.verifyOccurancesAtPositionListContains = function (fileName, start, end, isWriteAccess) {
            var occurances = this.languageService.getOccurrencesAtPosition(this.activeFile.fileName, this.currentCaretPosition);

            if (!occurances || occurances.length === 0) {
                throw new Error('verifyOccurancesAtPositionListContains failed - found 0 references, expected at least one.');
            }

            for (var i = 0; i < occurances.length; i++) {
                var occurance = occurances[i];
                if (occurance && occurance.fileName === fileName && occurance.minChar === start && occurance.limChar === end) {
                    if (typeof isWriteAccess !== "undefined" && occurance.isWriteAccess !== isWriteAccess) {
                        throw new Error('verifyOccurancesAtPositionListContains failed - item isWriteAccess value doe not match, actual: ' + occurance.isWriteAccess + ', expected: ' + isWriteAccess + '.');
                    }
                    return;
                }
            }

            var missingItem = { fileName: fileName, start: start, end: end, isWriteAccess: isWriteAccess };
            throw new Error('verifyOccurancesAtPositionListContains failed - could not find the item: ' + JSON.stringify(missingItem) + ' in the returned list: (' + JSON.stringify(occurances) + ')');
        };

        TestState.prototype.getBOF = function () {
            return 0;
        };

        TestState.prototype.getEOF = function () {
            return this.languageServiceShimHost.getScriptSnapshot(this.activeFile.fileName).getLength();
        };

        TestState.prototype.getCurrentLineContent = function () {
            var line = this.getCurrentCaretFilePosition().line;

            var pos = this.languageServiceShimHost.lineColToPosition(this.activeFile.fileName, line, 1);

            var snapshot = this.languageServiceShimHost.getScriptSnapshot(this.activeFile.fileName);
            var text = snapshot.getText(pos, snapshot.getLength());

            var newlinePos = text.indexOf('\n');
            if (newlinePos === -1) {
                return text;
            } else {
                if (text.charAt(newlinePos - 1) === '\r') {
                    newlinePos--;
                }
                return text.substr(0, newlinePos);
            }
        };

        TestState.prototype.getCurrentFileContent = function () {
            var snapshot = this.languageServiceShimHost.getScriptSnapshot(this.activeFile.fileName);
            return snapshot.getText(0, snapshot.getLength());
        };

        TestState.prototype.getCurrentCaretFilePosition = function () {
            var result = this.languageServiceShimHost.positionToZeroBasedLineCol(this.activeFile.fileName, this.currentCaretPosition);
            if (result.line >= 0) {
                result.line++;
            }

            if (result.character >= 0) {
                result.character++;
            }

            return result;
        };

        TestState.prototype.assertItemInCompletionList = function (completionList, name, type, docComment, fullSymbolName, kind) {
            var items = completionList.map(function (element) {
                return {
                    name: element.name,
                    type: element.type,
                    docComment: element.docComment,
                    fullSymbolName: element.fullSymbolName,
                    kind: element.kind
                };
            });

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.name == name) {
                    if (docComment != undefined) {
                        assert.equal(item.docComment, docComment);
                    }
                    if (type !== undefined) {
                        assert.equal(item.type, type);
                    }
                    if (fullSymbolName !== undefined) {
                        assert.equal(item.fullSymbolName, fullSymbolName);
                    }
                    if (kind !== undefined) {
                        assert.equal(item.kind, kind);
                    }
                    return;
                }
            }

            var getItemString = function (item) {
                if (docComment === undefined && type === undefined && fullSymbolName === undefined && kind === undefined) {
                    return item.name;
                }

                var returnString = "\n{ name: " + item.name;
                if (type !== undefined) {
                    returnString += ",type: " + item.type;
                }
                if (docComment != undefined) {
                    returnString += ",docComment: " + item.docComment;
                }
                if (fullSymbolName !== undefined) {
                    returnString += ",fullSymbolName: " + item.fullSymbolName;
                }
                if (kind !== undefined) {
                    returnString += ",kind: " + item.kind;
                }
                returnString += " }";

                return returnString;
            };

            var itemsDigest = items.slice(0, 10);
            var itemsString = items.map(function (elem) {
                return getItemString(elem);
            }).join(",");
            if (items.length > 10) {
                itemsString += ', ...';
            }
            throw new Error("Marker: " + FourSlash.currentTestState.lastKnownMarker + "\n" + 'Expected "' + getItemString({ name: name, type: type, docComment: docComment, fullSymbolName: fullSymbolName, kind: kind }) + '" to be in list [' + itemsString + ']');
        };

        TestState.prototype.findFile = function (indexOrName) {
            var result = null;
            if (typeof indexOrName === 'number') {
                var index = indexOrName;
                if (index >= this.testData.files.length) {
                    throw new Error('File index (' + index + ') in openFile was out of range. There are only ' + this.testData.files.length + ' files in this test.');
                } else {
                    result = this.testData.files[index];
                }
            } else if (typeof indexOrName === 'string') {
                var name = indexOrName;
                var availableNames = [];
                var foundIt = false;
                for (var i = 0; i < this.testData.files.length; i++) {
                    var fn = this.testData.files[i].fileName;
                    if (fn) {
                        if (fn === name) {
                            result = this.testData.files[i];
                            foundIt = true;
                            break;
                        }
                        availableNames.push(fn);
                    }
                }

                if (!foundIt) {
                    throw new Error('No test file named "' + name + '" exists. Available file names are:' + availableNames.join(', '));
                }
            } else {
                throw new Error('Unknown argument type');
            }

            return result;
        };

        TestState.prototype.getCurrentLineNumberZeroBased = function () {
            return this.getCurrentLineNumberOneBased() - 1;
        };

        TestState.prototype.getCurrentLineNumberOneBased = function () {
            return this.languageServiceShimHost.positionToZeroBasedLineCol(this.activeFile.fileName, this.currentCaretPosition).line + 1;
        };

        TestState.prototype.getLineColStringAtCaret = function () {
            var pos = this.languageServiceShimHost.positionToZeroBasedLineCol(this.activeFile.fileName, this.currentCaretPosition);
            return 'line ' + (pos.line + 1) + ', col ' + pos.character;
        };

        TestState.prototype.getMarkerByName = function (markerName) {
            var markerPos = this.testData.markerPositions[markerName];
            if (markerPos === undefined) {
                var markerNames = [];
                for (var m in this.testData.markerPositions)
                    markerNames.push(m);
                throw new Error('Unknown marker "' + markerName + '" Available markers: ' + markerNames.map(function (m) {
                    return '"' + m + '"';
                }).join(', '));
            } else {
                return markerPos;
            }
        };

        TestState.makeWhitespaceVisible = function (text) {
            return text.replace(/ /g, '\u00B7').replace(/\r/g, '\u00B6').replace(/\n/g, '\u2193\n').replace(/\t/g, '\u2192\   ');
        };
        return TestState;
    })();
    FourSlash.TestState = TestState;

    var fsOutput = new Harness.Compiler.WriterAggregator();
    var fsErrors = new Harness.Compiler.WriterAggregator();
    function runFourSlashTest(fileName) {
        var content = IO.readFile(fileName);
        runFourSlashTestContent(content.contents(), fileName);
    }
    FourSlash.runFourSlashTest = runFourSlashTest;

    function runFourSlashTestContent(content, fileName) {
        var testData = parseTestData(content);

        assert.bugs(content);

        FourSlash.currentTestState = new TestState(testData);
        var oldThrowAssertError = assert.throwAssertError;
        assert.throwAssertError = function (error) {
            error.message = "Marker: " + FourSlash.currentTestState.lastKnownMarker + "\n" + error.message;
            throw error;
        };

        var mockFilename = 'test_input.ts';

        var result = '';
        var tsFn = './tests/cases/fourslash/fourslash.ts';

        fsOutput.reset();
        fsErrors.reset();

        Harness.Compiler.addUnit(Harness.Compiler.CompilerInstance.RunTime, IO.readFile(tsFn).contents(), tsFn);
        Harness.Compiler.addUnit(Harness.Compiler.CompilerInstance.RunTime, content, mockFilename);
        Harness.Compiler.compile(Harness.Compiler.CompilerInstance.RunTime, content, mockFilename);

        var emitterIOHost = {
            writeFile: function (path, contents, writeByteOrderMark) {
                return fsOutput.Write(contents);
            },
            directoryExists: function (s) {
                return false;
            },
            fileExists: function (s) {
                return true;
            },
            resolvePath: function (s) {
                return s;
            }
        };

        Harness.Compiler.emitAll(Harness.Compiler.CompilerInstance.RunTime, emitterIOHost);
        fsOutput.Close();
        fsErrors.Close();

        if (fsErrors.lines.length > 0) {
            throw new Error('Error compiling ' + fileName + ': ' + fsErrors.lines.join('\r\n'));
        }

        result = fsOutput.lines.join('\r\n');

        try  {
            eval(result);
        } catch (err) {
            throw err;
        } finally {
            assert.throwAssertError = oldThrowAssertError;
        }
    }
    FourSlash.runFourSlashTestContent = runFourSlashTestContent;

    function chompLeadingSpace(content) {
        var lines = content.split("\n");
        for (var i = 0; i < lines.length; i++) {
            if ((lines[i].length !== 0) && (lines[i].charAt(0) !== ' ')) {
                return content;
            }
        }

        return lines.map(function (s) {
            return s.substr(1);
        }).join('\n');
    }

    function parseTestData(contents) {
        var optionRegex = /^\s*@(\w+): (.*)\s*/;

        var files = [];

        var opts = {};

        var makeDefaultFilename = function () {
            return 'file_' + files.length + '.ts';
        };

        var lines = contents.split('\n');

        var markerMap = {};
        var markers = [];
        var ranges = [];

        var currentFileContent = null;
        var currentFileName = makeDefaultFilename();
        var currentFileOptions = {};

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var lineLength = line.length;

            if (lineLength > 0 && line.charAt(lineLength - 1) === '\r') {
                line = line.substr(0, lineLength - 1);
            }

            if (line.substr(0, 4) === '////') {
                if (currentFileContent === null) {
                    currentFileContent = '';
                } else {
                    currentFileContent = currentFileContent + '\n';
                }

                currentFileContent = currentFileContent + line.substr(4);
            } else if (line.substr(0, 2) === '//') {
                var match = optionRegex.exec(line.substr(2));
                if (match) {
                    var globalNameIndex = globalMetadataNames.indexOf(match[1]);
                    var fileNameIndex = fileMetadataNames.indexOf(match[1]);
                    if (globalNameIndex === -1) {
                        if (fileNameIndex === -1) {
                            throw new Error('Unrecognized metadata name "' + match[1] + '". Available global metadata names are: ' + globalMetadataNames.join(', ') + '; file metadata names are: ' + fileMetadataNames.join(', '));
                        } else {
                            currentFileOptions[match[1]] = match[2];
                        }
                    } else {
                        opts[match[1]] = match[2];
                    }
                }
            } else {
                if (currentFileContent) {
                    var file = parseFileContent(currentFileContent, currentFileName, markerMap, markers, ranges);
                    file.fileOptions = currentFileOptions;

                    files.push(file);

                    currentFileContent = null;
                    currentFileOptions = {};
                    currentFileName = makeDefaultFilename();
                }
            }
        }

        return {
            markerPositions: markerMap,
            markers: markers,
            globalOptions: opts,
            files: files,
            ranges: ranges
        };
    }

    var State;
    (function (State) {
        State[State["none"] = 0] = "none";
        State[State["inSlashStarMarker"] = 1] = "inSlashStarMarker";

        State[State["inObjectMarker"] = 2] = "inObjectMarker";
    })(State || (State = {}));

    function reportError(fileName, line, col, message) {
        var errorMessage = fileName + "(" + line + "," + col + "): " + message;
        throw new Error(errorMessage);
    }

    function recordObjectMarker(fileName, location, text, markerMap, markers) {
        var markerValue = undefined;
        try  {
            markerValue = JSON2.parse("{ " + text + " }");
        } catch (e) {
            reportError(fileName, location.sourceLine, location.sourceColumn, "Unable to parse marker text " + e.message);
        }

        if (markerValue === undefined) {
            reportError(fileName, location.sourceLine, location.sourceColumn, "Object markers can not be empty");
            return null;
        }

        var marker = {
            fileName: fileName,
            position: location.position,
            data: markerValue
        };

        if (markerValue.name) {
            markerMap[markerValue.name] = marker;
        }

        markers.push(marker);

        return marker;
    }

    function recordMarker(fileName, location, name, markerMap, markers) {
        var marker = {
            fileName: fileName,
            position: location.position
        };

        if (markerMap[name] !== undefined) {
            var message = "Marker '" + name + "' is duplicated in the source file contents.";
            reportError(marker.fileName, location.sourceLine, location.sourceColumn, message);
            return null;
        } else {
            markerMap[name] = marker;
            markers.push(marker);
            return marker;
        }
    }

    function parseFileContent(content, fileName, markerMap, markers, ranges) {
        content = chompLeadingSpace(content);

        var validMarkerChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$1234567890_';

        var output = "";

        var openMarker = null;

        var openRanges = [];

        var localRanges = [];

        var lastNormalCharPosition = 0;

        var difference = 0;

        var state = State.none;

        var line = 1;
        var column = 1;

        var flush = function (lastSafeCharIndex) {
            if (lastSafeCharIndex === undefined) {
                output = output + content.substr(lastNormalCharPosition);
            } else {
                output = output + content.substr(lastNormalCharPosition, lastSafeCharIndex - lastNormalCharPosition);
            }
        };

        if (content.length > 0) {
            var previousChar = content.charAt(0);
            for (var i = 1; i < content.length; i++) {
                var currentChar = content.charAt(i);
                switch (state) {
                    case State.none:
                        if (previousChar === "[" && currentChar === "|") {
                            openRanges.push({
                                position: (i - 1) - difference,
                                sourcePosition: i - 1,
                                sourceLine: line,
                                sourceColumn: column
                            });

                            flush(i - 1);
                            lastNormalCharPosition = i + 1;
                            difference += 2;
                        } else if (previousChar === "|" && currentChar === "]") {
                            var rangeStart = openRanges.pop();
                            if (!rangeStart) {
                                reportError(fileName, line, column, "Found range end with no matching start.");
                            }

                            var range = {
                                fileName: fileName,
                                start: rangeStart.position,
                                end: (i - 1) - difference,
                                marker: rangeStart.marker
                            };
                            localRanges.push(range);

                            flush(i - 1);
                            lastNormalCharPosition = i + 1;
                            difference += 2;
                        } else if (previousChar === "/" && currentChar === "*") {
                            state = State.inSlashStarMarker;
                            openMarker = {
                                position: (i - 1) - difference,
                                sourcePosition: i - 1,
                                sourceLine: line,
                                sourceColumn: column
                            };
                        } else if (previousChar === "{" && currentChar === "|") {
                            state = State.inObjectMarker;
                            openMarker = {
                                position: (i - 1) - difference,
                                sourcePosition: i - 1,
                                sourceLine: line,
                                sourceColumn: column
                            };
                            flush(i - 1);
                        }
                        break;

                    case State.inObjectMarker:
                        if (previousChar === "|" && currentChar === "}") {
                            var objectMarkerNameText = content.substring(openMarker.sourcePosition + 2, i - 1).trim();
                            var marker = recordObjectMarker(fileName, openMarker, objectMarkerNameText, markerMap, markers);

                            if (openRanges.length > 0) {
                                openRanges[openRanges.length - 1].marker = marker;
                            }

                            lastNormalCharPosition = i + 1;
                            difference += i + 1 - openMarker.sourcePosition;

                            openMarker = null;
                            state = State.none;
                        }
                        break;

                    case State.inSlashStarMarker:
                        if (previousChar === "*" && currentChar === "/") {
                            var markerNameText = content.substring(openMarker.sourcePosition + 2, i - 1).trim();
                            var marker = recordMarker(fileName, openMarker, markerNameText, markerMap, markers);

                            if (openRanges.length > 0) {
                                openRanges[openRanges.length - 1].marker = marker;
                            }

                            flush(openMarker.sourcePosition);
                            lastNormalCharPosition = i + 1;
                            difference += i + 1 - openMarker.sourcePosition;

                            openMarker = null;
                            state = State.none;
                        } else if (validMarkerChars.indexOf(currentChar) < 0) {
                            if (currentChar === '*' && i < content.length - 1 && content.charAt(i + 1) === '/') {
                            } else {
                                flush(i);
                                lastNormalCharPosition = i;
                                openMarker = null;

                                state = State.none;
                            }
                        }
                        break;
                }

                if (currentChar === '\n' && previousChar === '\r') {
                    continue;
                } else if (currentChar === '\n' || currentChar === '\r') {
                    line++;
                    column = 1;
                    continue;
                }

                column++;
                previousChar = currentChar;
            }
        }

        flush(undefined);

        if (openRanges.length > 0) {
            var openRange = openRanges[0];
            reportError(fileName, openRange.sourceLine, openRange.sourceColumn, "Unterminated range.");
        }

        if (openMarker !== null) {
            reportError(fileName, openMarker.sourceLine, openMarker.sourceColumn, "Unterminated marker.");
        }

        localRanges = localRanges.sort(function (a, b) {
            return a.start < b.start ? -1 : 1;
        });
        localRanges.forEach(function (r) {
            ranges.push(r);
        });

        return {
            content: output,
            fileOptions: {},
            version: 0,
            fileName: fileName
        };
    }
})(FourSlash || (FourSlash = {}));
