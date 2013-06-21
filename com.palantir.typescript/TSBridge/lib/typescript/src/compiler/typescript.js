var TypeScript;
(function (TypeScript) {
    var Document = (function () {
        function Document(fileName, compilationSettings, scriptSnapshot, byteOrderMark, version, isOpen, syntaxTree) {
            this.fileName = fileName;
            this.compilationSettings = compilationSettings;
            this.scriptSnapshot = scriptSnapshot;
            this.byteOrderMark = byteOrderMark;
            this.version = version;
            this.isOpen = isOpen;
            this._diagnostics = null;
            this._syntaxTree = null;
            this._bloomFilter = null;
            if (isOpen) {
                this._syntaxTree = syntaxTree;
            } else {
                this._diagnostics = syntaxTree.diagnostics();
            }

            var identifiers = new TypeScript.BlockIntrinsics();

            var identifierWalker = new TypeScript.IdentifierWalker(identifiers);
            syntaxTree.sourceUnit().accept(identifierWalker);

            var identifierCount = 0;
            for (var name in identifiers) {
                identifierCount++;
            }
            this._bloomFilter = new TypeScript.BloomFilter(identifierCount);
            this._bloomFilter.addKeys(identifiers);

            this.lineMap = syntaxTree.lineMap();
            this.script = TypeScript.SyntaxTreeToAstVisitor.visit(syntaxTree, fileName, compilationSettings);
        }
        Document.prototype.diagnostics = function () {
            if (this._diagnostics === null) {
                this._diagnostics = this._syntaxTree.diagnostics();
            }

            return this._diagnostics;
        };

        Document.prototype.syntaxTree = function () {
            if (this._syntaxTree) {
                return this._syntaxTree;
            }

            return TypeScript.Parser.parse(this.fileName, TypeScript.SimpleText.fromScriptSnapshot(this.scriptSnapshot), TypeScript.isDTSFile(this.fileName), this.compilationSettings.codeGenTarget, TypeScript.getParseOptions(this.compilationSettings));
        };

        Document.prototype.bloomFilter = function () {
            return this._bloomFilter;
        };

        Document.prototype.update = function (scriptSnapshot, version, isOpen, textChangeRange, settings) {
            var oldScript = this.script;
            var oldSyntaxTree = this._syntaxTree;

            var text = TypeScript.SimpleText.fromScriptSnapshot(scriptSnapshot);

            var newSyntaxTree = textChangeRange === null || oldSyntaxTree === null ? TypeScript.Parser.parse(this.fileName, text, TypeScript.isDTSFile(this.fileName), settings.codeGenTarget, TypeScript.getParseOptions(this.compilationSettings)) : TypeScript.Parser.incrementalParse(oldSyntaxTree, textChangeRange, text);

            return new Document(this.fileName, this.compilationSettings, scriptSnapshot, this.byteOrderMark, version, isOpen, newSyntaxTree);
        };

        Document.create = function (fileName, scriptSnapshot, byteOrderMark, version, isOpen, referencedFiles, compilationSettings) {
            var syntaxTree = TypeScript.Parser.parse(fileName, TypeScript.SimpleText.fromScriptSnapshot(scriptSnapshot), TypeScript.isDTSFile(fileName), compilationSettings.codeGenTarget, TypeScript.getParseOptions(compilationSettings));

            var document = new Document(fileName, compilationSettings, scriptSnapshot, byteOrderMark, version, isOpen, syntaxTree);
            document.script.referencedFiles = referencedFiles;

            return document;
        };
        return Document;
    })();
    TypeScript.Document = Document;

    var TypeScriptCompiler = (function () {
        function TypeScriptCompiler(logger, settings, diagnosticMessages) {
            if (typeof logger === "undefined") { logger = new TypeScript.NullLogger(); }
            if (typeof settings === "undefined") { settings = new TypeScript.CompilationSettings(); }
            if (typeof diagnosticMessages === "undefined") { diagnosticMessages = null; }
            this.logger = logger;
            this.settings = settings;
            this.diagnosticMessages = diagnosticMessages;
            this.pullTypeChecker = null;
            this.semanticInfoChain = null;
            this.fileNameToDocument = new TypeScript.StringHashTable();
            this.emitOptions = new TypeScript.EmitOptions(this.settings);

            if (this.diagnosticMessages) {
                TypeScript.diagnosticMessages = this.diagnosticMessages;
            }
        }
        TypeScriptCompiler.prototype.getDocument = function (fileName) {
            return this.fileNameToDocument.lookup(fileName);
        };

        TypeScriptCompiler.prototype.timeFunction = function (funcDescription, func) {
            return TypeScript.timeFunction(this.logger, funcDescription, func);
        };

        TypeScriptCompiler.prototype.addSourceUnit = function (fileName, scriptSnapshot, byteOrderMark, version, isOpen, referencedFiles) {
            if (typeof referencedFiles === "undefined") { referencedFiles = []; }
            var _this = this;
            return this.timeFunction("addSourceUnit(" + fileName + ")", function () {
                var document = Document.create(fileName, scriptSnapshot, byteOrderMark, version, isOpen, referencedFiles, _this.emitOptions.compilationSettings);
                _this.fileNameToDocument.addOrUpdate(fileName, document);

                return document;
            });
        };

        TypeScriptCompiler.prototype.updateSourceUnit = function (fileName, scriptSnapshot, version, isOpen, textChangeRange) {
            var _this = this;
            return this.timeFunction("pullUpdateUnit(" + fileName + ")", function () {
                var document = _this.getDocument(fileName);
                var updatedDocument = document.update(scriptSnapshot, version, isOpen, textChangeRange, _this.settings);

                _this.fileNameToDocument.addOrUpdate(fileName, updatedDocument);

                _this.pullUpdateScript(document, updatedDocument);

                return updatedDocument;
            });
        };

        TypeScriptCompiler.prototype.isDynamicModuleCompilation = function () {
            var fileNames = this.fileNameToDocument.getAllKeys();
            for (var i = 0, n = fileNames.length; i < n; i++) {
                var document = this.getDocument(fileNames[i]);
                var script = document.script;
                if (!script.isDeclareFile && script.topLevelMod !== null) {
                    return true;
                }
            }
            return false;
        };

        TypeScriptCompiler.prototype.updateCommonDirectoryPath = function () {
            var commonComponents = [];
            var commonComponentsLength = -1;

            var fileNames = this.fileNameToDocument.getAllKeys();
            for (var i = 0, len = fileNames.length; i < len; i++) {
                var fileName = fileNames[i];
                var document = this.getDocument(fileNames[i]);
                var script = document.script;

                if (!script.isDeclareFile) {
                    var fileComponents = TypeScript.filePathComponents(fileName);
                    if (commonComponentsLength === -1) {
                        commonComponents = fileComponents;
                        commonComponentsLength = commonComponents.length;
                    } else {
                        var updatedPath = false;
                        for (var j = 0; j < commonComponentsLength && j < fileComponents.length; j++) {
                            if (commonComponents[j] !== fileComponents[j]) {
                                commonComponentsLength = j;
                                updatedPath = true;

                                if (j === 0) {
                                    return new TypeScript.Diagnostic(null, 0, 0, TypeScript.DiagnosticCode.Cannot_find_the_common_subdirectory_path_for_the_input_files, null);
                                }

                                break;
                            }
                        }

                        if (!updatedPath && fileComponents.length < commonComponentsLength) {
                            commonComponentsLength = fileComponents.length;
                        }
                    }
                }
            }

            this.emitOptions.commonDirectoryPath = commonComponents.slice(0, commonComponentsLength).join("/") + "/";
            if (this.emitOptions.compilationSettings.outputOption.charAt(this.emitOptions.compilationSettings.outputOption.length - 1) !== "/") {
                this.emitOptions.compilationSettings.outputOption += "/";
            }

            return null;
        };

        TypeScriptCompiler.prototype.parseEmitOption = function (ioHost) {
            this.emitOptions.ioHost = ioHost;
            if (this.emitOptions.compilationSettings.outputOption === "") {
                this.emitOptions.outputMany = true;
                this.emitOptions.commonDirectoryPath = "";
                return null;
            }

            this.emitOptions.compilationSettings.outputOption = TypeScript.switchToForwardSlashes(this.emitOptions.ioHost.resolvePath(this.emitOptions.compilationSettings.outputOption));

            if (this.emitOptions.ioHost.directoryExists(this.emitOptions.compilationSettings.outputOption)) {
                this.emitOptions.outputMany = true;
            } else if (this.emitOptions.ioHost.fileExists(this.emitOptions.compilationSettings.outputOption)) {
                this.emitOptions.outputMany = false;
            } else {
                this.emitOptions.outputMany = !TypeScript.isJSFile(this.emitOptions.compilationSettings.outputOption);
            }

            if (this.isDynamicModuleCompilation() && !this.emitOptions.outputMany) {
                return new TypeScript.Diagnostic(null, 0, 0, TypeScript.DiagnosticCode.Cannot_compile_dynamic_modules_when_emitting_into_single_file, null);
            }

            if (this.emitOptions.outputMany) {
                return this.updateCommonDirectoryPath();
            }

            return null;
        };

        TypeScriptCompiler.prototype.getScripts = function () {
            var result = [];
            var fileNames = this.fileNameToDocument.getAllKeys();

            for (var i = 0, n = fileNames.length; i < n; i++) {
                var document = this.getDocument(fileNames[i]);
                result.push(document.script);
            }

            return result;
        };

        TypeScriptCompiler.prototype.writeByteOrderMarkForDocument = function (document) {
            if (this.emitOptions.outputMany) {
                return document.byteOrderMark !== ByteOrderMark.None;
            } else {
                var fileNames = this.fileNameToDocument.getAllKeys();

                for (var i = 0, n = fileNames.length; i < n; i++) {
                    var document = this.getDocument(fileNames[i]);
                    if (document.byteOrderMark !== ByteOrderMark.None) {
                        return true;
                    }
                }

                return false;
            }
        };

        TypeScriptCompiler.mapToDTSFileName = function (fileName, wholeFileNameReplaced) {
            return TypeScript.getDeclareFilePath(fileName);
        };

        TypeScriptCompiler.prototype.canEmitDeclarations = function (script) {
            if (!this.settings.generateDeclarationFiles) {
                return false;
            }

            if (!!script && (script.isDeclareFile || script.moduleElements === null)) {
                return false;
            }

            return true;
        };

        TypeScriptCompiler.prototype.emitDeclarations = function (document, declarationEmitter) {
            var script = document.script;
            if (this.canEmitDeclarations(script)) {
                if (!declarationEmitter) {
                    var declareFileName = this.emitOptions.mapOutputFileName(document.fileName, TypeScriptCompiler.mapToDTSFileName);
                    declarationEmitter = new TypeScript.DeclarationEmitter(declareFileName, this.semanticInfoChain, this.emitOptions, document.byteOrderMark !== ByteOrderMark.None);
                }

                declarationEmitter.fileName = document.fileName;
                declarationEmitter.emitDeclarations(script);
            }

            return declarationEmitter;
        };

        TypeScriptCompiler.prototype.emitAllDeclarations = function () {
            if (this.canEmitDeclarations()) {
                var sharedEmitter = null;
                var fileNames = this.fileNameToDocument.getAllKeys();

                for (var i = 0, n = fileNames.length; i < n; i++) {
                    var fileName = fileNames[i];

                    try  {
                        var document = this.getDocument(fileNames[i]);

                        if (this.emitOptions.outputMany) {
                            var singleEmitter = this.emitDeclarations(document);
                            if (singleEmitter) {
                                singleEmitter.close();
                            }
                        } else {
                            sharedEmitter = this.emitDeclarations(document, sharedEmitter);
                        }
                    } catch (ex1) {
                        return TypeScript.Emitter.handleEmitterError(fileName, ex1);
                    }
                }

                if (sharedEmitter) {
                    try  {
                        sharedEmitter.close();
                    } catch (ex2) {
                        return TypeScript.Emitter.handleEmitterError(sharedEmitter.fileName, ex2);
                    }
                }
            }

            return [];
        };

        TypeScriptCompiler.prototype.emitUnitDeclarations = function (fileName) {
            if (this.canEmitDeclarations()) {
                if (this.emitOptions.outputMany) {
                    try  {
                        var document = this.getDocument(fileName);
                        var emitter = this.emitDeclarations(document);
                        if (emitter) {
                            emitter.close();
                        }
                    } catch (ex1) {
                        return TypeScript.Emitter.handleEmitterError(fileName, ex1);
                    }
                } else {
                    return this.emitAllDeclarations();
                }
            }

            return [];
        };

        TypeScriptCompiler.mapToFileNameExtension = function (extension, fileName, wholeFileNameReplaced) {
            if (wholeFileNameReplaced) {
                return fileName;
            } else {
                var splitFname = fileName.split(".");
                splitFname.pop();
                return splitFname.join(".") + extension;
            }
        };

        TypeScriptCompiler.mapToJSFileName = function (fileName, wholeFileNameReplaced) {
            return TypeScriptCompiler.mapToFileNameExtension(".js", fileName, wholeFileNameReplaced);
        };

        TypeScriptCompiler.prototype.emit = function (document, inputOutputMapper, emitter) {
            var script = document.script;
            if (!script.isDeclareFile) {
                var typeScriptFileName = document.fileName;
                if (!emitter) {
                    var javaScriptFileName = this.emitOptions.mapOutputFileName(typeScriptFileName, TypeScriptCompiler.mapToJSFileName);
                    var outFile = this.createFile(javaScriptFileName, this.writeByteOrderMarkForDocument(document));

                    emitter = new TypeScript.Emitter(javaScriptFileName, outFile, this.emitOptions, this.semanticInfoChain);

                    if (this.settings.mapSourceFiles) {
                        var sourceMapFileName = javaScriptFileName + TypeScript.SourceMapper.MapFileExtension;
                        emitter.setSourceMappings(new TypeScript.SourceMapper(typeScriptFileName, javaScriptFileName, sourceMapFileName, outFile, this.createFile(sourceMapFileName, false), this.settings.emitFullSourceMapPath));
                    }

                    if (inputOutputMapper) {
                        inputOutputMapper(typeScriptFileName, javaScriptFileName);
                    }
                } else if (this.settings.mapSourceFiles) {
                    emitter.setSourceMappings(new TypeScript.SourceMapper(typeScriptFileName, emitter.emittingFileName, emitter.sourceMapper.sourceMapFileName, emitter.outfile, emitter.sourceMapper.sourceMapOut, this.settings.emitFullSourceMapPath));
                }

                emitter.setDocument(document);
                emitter.emitJavascript(script, false);
            }

            return emitter;
        };

        TypeScriptCompiler.prototype.emitAll = function (ioHost, inputOutputMapper) {
            var optionsDiagnostic = this.parseEmitOption(ioHost);
            if (optionsDiagnostic) {
                return [optionsDiagnostic];
            }

            var startEmitTime = (new Date()).getTime();

            var fileNames = this.fileNameToDocument.getAllKeys();
            var sharedEmitter = null;

            for (var i = 0, n = fileNames.length; i < n; i++) {
                var fileName = fileNames[i];

                var document = this.getDocument(fileName);

                try  {
                    if (this.emitOptions.outputMany) {
                        var singleEmitter = this.emit(document, inputOutputMapper);

                        if (singleEmitter) {
                            singleEmitter.emitSourceMapsAndClose();
                        }
                    } else {
                        sharedEmitter = this.emit(document, inputOutputMapper, sharedEmitter);
                    }
                } catch (ex1) {
                    return TypeScript.Emitter.handleEmitterError(fileName, ex1);
                }
            }

            this.logger.log("Emit: " + ((new Date()).getTime() - startEmitTime));

            if (sharedEmitter) {
                try  {
                    sharedEmitter.emitSourceMapsAndClose();
                } catch (ex2) {
                    return TypeScript.Emitter.handleEmitterError(sharedEmitter.document.fileName, ex2);
                }
            }

            return [];
        };

        TypeScriptCompiler.prototype.emitUnit = function (fileName, ioHost, inputOutputMapper) {
            var optionsDiagnostic = this.parseEmitOption(ioHost);
            if (optionsDiagnostic) {
                return [optionsDiagnostic];
            }

            if (this.emitOptions.outputMany) {
                var document = this.getDocument(fileName);
                try  {
                    var emitter = this.emit(document, inputOutputMapper);

                    if (emitter) {
                        emitter.emitSourceMapsAndClose();
                    }
                } catch (ex1) {
                    return TypeScript.Emitter.handleEmitterError(fileName, ex1);
                }

                return [];
            } else {
                return this.emitAll(ioHost, inputOutputMapper);
            }
        };

        TypeScriptCompiler.prototype.createFile = function (fileName, writeByteOrderMark) {
            return new TypeScript.TextWriter(this.emitOptions.ioHost, fileName, writeByteOrderMark);
        };

        TypeScriptCompiler.prototype.pullResolveFile = function (fileName) {
            if (!this.pullTypeChecker) {
                return false;
            }

            var unit = this.semanticInfoChain.getUnit(fileName);

            if (!unit) {
                return false;
            }

            this.pullTypeChecker.setUnit(fileName);
            this.pullTypeChecker.resolver.resolveBoundDecls(unit.getTopLevelDecls()[0], new TypeScript.PullTypeResolutionContext());

            return true;
        };

        TypeScriptCompiler.prototype.getSyntacticDiagnostics = function (fileName) {
            return this.getDocument(fileName).diagnostics();
        };

        TypeScriptCompiler.prototype.getSyntaxTree = function (fileName) {
            return this.getDocument(fileName).syntaxTree();
        };
        TypeScriptCompiler.prototype.getScript = function (fileName) {
            return this.getDocument(fileName).script;
        };

        TypeScriptCompiler.prototype.getSemanticDiagnostics = function (fileName) {
            var errors = [];

            var unit = this.semanticInfoChain.getUnit(fileName);

            if (unit) {
                var document = this.getDocument(fileName);
                var script = document.script;

                if (script) {
                    this.pullTypeChecker.typeCheckScript(script, fileName, this);

                    unit.getDiagnostics(errors);
                }
            }

            return errors;
        };

        TypeScriptCompiler.prototype.pullTypeCheck = function () {
            var _this = this;
            return this.timeFunction("pullTypeCheck()", function () {
                _this.semanticInfoChain = new TypeScript.SemanticInfoChain();
                _this.pullTypeChecker = new TypeScript.PullTypeChecker(_this.settings, _this.semanticInfoChain);

                var declCollectionContext = null;
                var i, n;

                var createDeclsStartTime = new Date().getTime();

                var fileNames = _this.fileNameToDocument.getAllKeys();
                for (var i = 0, n = fileNames.length; i < n; i++) {
                    var fileName = fileNames[i];
                    var document = _this.getDocument(fileName);
                    var semanticInfo = new TypeScript.SemanticInfo(fileName);

                    declCollectionContext = new TypeScript.DeclCollectionContext(semanticInfo);
                    declCollectionContext.scriptName = fileName;

                    TypeScript.getAstWalkerFactory().walk(document.script, TypeScript.preCollectDecls, TypeScript.postCollectDecls, null, declCollectionContext);

                    semanticInfo.addTopLevelDecl(declCollectionContext.getParent());

                    _this.semanticInfoChain.addUnit(semanticInfo);
                }

                var createDeclsEndTime = new Date().getTime();

                var bindStartTime = new Date().getTime();

                var binder = new TypeScript.PullSymbolBinder(_this.settings, _this.semanticInfoChain);

                for (var i = 1; i < _this.semanticInfoChain.units.length; i++) {
                    binder.bindDeclsForUnit(_this.semanticInfoChain.units[i].getPath());
                }

                var bindEndTime = new Date().getTime();

                var findErrorsStartTime = new Date().getTime();

                for (var i = 0, n = fileNames.length; i < n; i++) {
                    fileName = fileNames[i];

                    _this.logger.log("Type checking " + fileName);
                    _this.pullTypeChecker.typeCheckScript(_this.getDocument(fileName).script, fileName, _this);
                }

                var findErrorsEndTime = new Date().getTime();

                _this.logger.log("Decl creation: " + (createDeclsEndTime - createDeclsStartTime));
                _this.logger.log("Binding: " + (bindEndTime - bindStartTime));
                _this.logger.log("    Time in findSymbol: " + TypeScript.time_in_findSymbol);
                _this.logger.log("Find errors: " + (findErrorsEndTime - findErrorsStartTime));
                _this.logger.log("Number of symbols created: " + TypeScript.pullSymbolID);
                _this.logger.log("Number of specialized types created: " + TypeScript.nSpecializationsCreated);
                _this.logger.log("Number of specialized signatures created: " + TypeScript.nSpecializedSignaturesCreated);
            });
        };

        TypeScriptCompiler.prototype.pullUpdateScript = function (oldDocument, newDocument) {
            var _this = this;
            this.timeFunction("pullUpdateScript: ", function () {
                var oldScript = oldDocument.script;
                var newScript = newDocument.script;

                var newScriptSemanticInfo = new TypeScript.SemanticInfo(oldDocument.fileName);
                var oldScriptSemanticInfo = _this.semanticInfoChain.getUnit(oldDocument.fileName);

                TypeScript.lastBoundPullDeclId = TypeScript.pullDeclID;
                TypeScript.lastBoundPullSymbolID = TypeScript.pullSymbolID;

                var declCollectionContext = new TypeScript.DeclCollectionContext(newScriptSemanticInfo);

                declCollectionContext.scriptName = oldDocument.fileName;

                TypeScript.getAstWalkerFactory().walk(newScript, TypeScript.preCollectDecls, TypeScript.postCollectDecls, null, declCollectionContext);

                var oldTopLevelDecl = oldScriptSemanticInfo.getTopLevelDecls()[0];
                var newTopLevelDecl = declCollectionContext.getParent();

                newScriptSemanticInfo.addTopLevelDecl(newTopLevelDecl);

                var diffStartTime = new Date().getTime();
                var diffResults = TypeScript.PullDeclDiffer.diffDecls(oldTopLevelDecl, oldScriptSemanticInfo, newTopLevelDecl, newScriptSemanticInfo);

                var diffEndTime = new Date().getTime();
                _this.logger.log("Update Script - Diff time: " + (diffEndTime - diffStartTime));

                _this.semanticInfoChain.updateUnit(oldScriptSemanticInfo, newScriptSemanticInfo);

                var innerBindStartTime = new Date().getTime();

                var topLevelDecls = newScriptSemanticInfo.getTopLevelDecls();

                _this.semanticInfoChain.update(oldDocument.fileName);

                var binder = new TypeScript.PullSymbolBinder(_this.settings, _this.semanticInfoChain);
                binder.setUnit(oldDocument.fileName);

                for (var i = 0; i < topLevelDecls.length; i++) {
                    binder.bindDeclToPullSymbol(topLevelDecls[i], true);
                }

                var innerBindEndTime = new Date().getTime();

                _this.logger.log("Update Script - Inner bind time: " + (innerBindEndTime - innerBindStartTime));
                if (diffResults.length) {
                    var graphUpdater = new TypeScript.PullSymbolGraphUpdater(_this.semanticInfoChain);
                    var diff;

                    var traceStartTime = new Date().getTime();
                    for (var i = 0; i < diffResults.length; i++) {
                        diff = diffResults[i];

                        if (diff.kind === TypeScript.PullDeclEdit.DeclRemoved) {
                            graphUpdater.removeDecl(diff.oldDecl);
                        } else if (diff.kind === TypeScript.PullDeclEdit.DeclAdded) {
                            graphUpdater.addDecl(diff.newDecl);
                            graphUpdater.invalidateType(diff.oldDecl.getSymbol());
                        } else {
                            graphUpdater.invalidateType(diff.newDecl.getSymbol());
                        }
                    }

                    var traceEndTime = new Date().getTime();

                    _this.logger.log("Update Script - Trace time: " + (traceEndTime - traceStartTime));
                    _this.logger.log("Update Script - Number of diffs: " + diffResults.length);
                }
            });
        };

        TypeScriptCompiler.prototype.getSymbolOfDeclaration = function (decl) {
            if (!decl) {
                return null;
            }
            var ast = this.pullTypeChecker.resolver.getASTForDecl(decl);
            if (!ast) {
                return null;
            }
            var enlosingDecl = this.pullTypeChecker.resolver.getEnclosingDecl(decl);
            if (ast.nodeType === TypeScript.NodeType.Member) {
                return this.getSymbolOfDeclaration(enlosingDecl);
            }
            var resolutionContext = new TypeScript.PullTypeResolutionContext();
            return this.pullTypeChecker.resolver.resolveAST(ast, false, enlosingDecl, resolutionContext).symbol;
        };

        TypeScriptCompiler.prototype.resolvePosition = function (pos, document) {
            var declStack = [];
            var resultASTs = [];
            var script = document.script;
            var scriptName = document.fileName;

            var semanticInfo = this.semanticInfoChain.getUnit(scriptName);
            var lastDeclAST = null;
            var foundAST = null;
            var symbol = null;
            var candidateSignature = null;
            var callSignatures = null;

            var lambdaAST = null;
            var declarationInitASTs = [];
            var objectLitAST = null;
            var asgAST = null;
            var typeAssertionASTs = [];
            var resolutionContext = new TypeScript.PullTypeResolutionContext();
            var inTypeReference = false;
            var enclosingDecl = null;
            var isConstructorCall = false;

            var pre = function (cur, parent) {
                if (TypeScript.isValidAstNode(cur)) {
                    if (pos >= cur.minChar && pos <= cur.limChar) {
                        var previous = resultASTs[resultASTs.length - 1];

                        if (previous === undefined || (cur.minChar >= previous.minChar && cur.limChar <= previous.limChar)) {
                            var decl = semanticInfo.getDeclForAST(cur);

                            if (decl) {
                                declStack[declStack.length] = decl;
                                lastDeclAST = cur;
                            }

                            if (cur.nodeType === TypeScript.NodeType.FunctionDeclaration && TypeScript.hasFlag((cur).getFunctionFlags(), TypeScript.FunctionFlags.IsFunctionExpression)) {
                                lambdaAST = cur;
                            } else if (cur.nodeType === TypeScript.NodeType.VariableDeclarator) {
                                declarationInitASTs[declarationInitASTs.length] = cur;
                            } else if (cur.nodeType === TypeScript.NodeType.ObjectLiteralExpression) {
                                objectLitAST = cur;
                            } else if (cur.nodeType === TypeScript.NodeType.CastExpression) {
                                typeAssertionASTs[typeAssertionASTs.length] = cur;
                            } else if (cur.nodeType === TypeScript.NodeType.AssignmentExpression) {
                                asgAST = cur;
                            } else if (cur.nodeType === TypeScript.NodeType.TypeRef) {
                                inTypeReference = true;
                            }

                            resultASTs[resultASTs.length] = cur;
                        }
                    }
                }
                return cur;
            };

            TypeScript.getAstWalkerFactory().walk(script, pre);

            if (resultASTs.length) {
                this.pullTypeChecker.setUnit(scriptName);

                foundAST = resultASTs[resultASTs.length - 1];

                if (foundAST.nodeType === TypeScript.NodeType.Name && resultASTs.length > 1) {
                    var previousAST = resultASTs[resultASTs.length - 2];
                    switch (previousAST.nodeType) {
                        case TypeScript.NodeType.InterfaceDeclaration:
                        case TypeScript.NodeType.ClassDeclaration:
                        case TypeScript.NodeType.ModuleDeclaration:
                            if (foundAST === (previousAST).name) {
                                foundAST = previousAST;
                            }
                            break;

                        case TypeScript.NodeType.VariableDeclarator:
                            if (foundAST === (previousAST).id) {
                                foundAST = previousAST;
                            }
                            break;

                        case TypeScript.NodeType.FunctionDeclaration:
                            if (foundAST === (previousAST).name) {
                                foundAST = previousAST;
                            }
                            break;
                    }
                }

                var funcDecl = null;
                if (lastDeclAST === foundAST) {
                    symbol = declStack[declStack.length - 1].getSymbol();
                    this.pullTypeChecker.resolver.resolveDeclaredSymbol(symbol, null, resolutionContext);
                    enclosingDecl = declStack[declStack.length - 1].getParentDecl();
                    if (foundAST.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                        funcDecl = foundAST;
                    }
                } else {
                    for (var i = declStack.length - 1; i >= 0; i--) {
                        if (!(declStack[i].getKind() & (TypeScript.PullElementKind.Variable | TypeScript.PullElementKind.Parameter))) {
                            enclosingDecl = declStack[i];
                            break;
                        }
                    }

                    var callExpression = null;
                    if ((foundAST.nodeType === TypeScript.NodeType.SuperExpression || foundAST.nodeType === TypeScript.NodeType.ThisExpression || foundAST.nodeType === TypeScript.NodeType.Name) && resultASTs.length > 1) {
                        for (var i = resultASTs.length - 2; i >= 0; i--) {
                            if (resultASTs[i].nodeType === TypeScript.NodeType.MemberAccessExpression && (resultASTs[i]).operand2 === resultASTs[i + 1]) {
                                foundAST = resultASTs[i];
                            } else if ((resultASTs[i].nodeType === TypeScript.NodeType.InvocationExpression || resultASTs[i].nodeType === TypeScript.NodeType.ObjectCreationExpression) && (resultASTs[i]).target === resultASTs[i + 1]) {
                                callExpression = resultASTs[i];
                                break;
                            } else if (resultASTs[i].nodeType === TypeScript.NodeType.FunctionDeclaration && (resultASTs[i]).name === resultASTs[i + 1]) {
                                funcDecl = resultASTs[i];
                                break;
                            } else {
                                break;
                            }
                        }
                    }

                    if (foundAST.nodeType === TypeScript.NodeType.List) {
                        for (var i = 0; i < (foundAST).members.length; i++) {
                            if ((foundAST).members[i].minChar > pos) {
                                foundAST = (foundAST).members[i];
                                break;
                            }
                        }
                    }

                    resolutionContext.resolvingTypeReference = inTypeReference;

                    var inContextuallyTypedAssignment = false;

                    if (declarationInitASTs.length) {
                        var assigningAST;

                        for (var i = 0; i < declarationInitASTs.length; i++) {
                            assigningAST = declarationInitASTs[i];
                            inContextuallyTypedAssignment = (assigningAST !== null) && (assigningAST.typeExpr !== null);

                            this.pullTypeChecker.resolver.resolveAST(assigningAST, false, null, resolutionContext);
                            var varSymbolAndDiagnostics = this.semanticInfoChain.getSymbolAndDiagnosticsForAST(assigningAST, scriptName);
                            var varSymbol = varSymbolAndDiagnostics && varSymbolAndDiagnostics.symbol;

                            if (varSymbol && inContextuallyTypedAssignment) {
                                var contextualType = varSymbol.getType();
                                resolutionContext.pushContextualType(contextualType, false, null);
                            }

                            if (assigningAST.init) {
                                this.pullTypeChecker.resolver.resolveAST(assigningAST.init, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                            }
                        }
                    }

                    if (typeAssertionASTs.length) {
                        for (var i = 0; i < typeAssertionASTs.length; i++) {
                            this.pullTypeChecker.resolver.resolveAST(typeAssertionASTs[i], inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                        }
                    }

                    if (asgAST) {
                        this.pullTypeChecker.resolver.resolveAST(asgAST, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                    }

                    if (objectLitAST) {
                        this.pullTypeChecker.resolver.resolveAST(objectLitAST, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                    }

                    if (lambdaAST) {
                        this.pullTypeChecker.resolver.resolveAST(lambdaAST, true, enclosingDecl, resolutionContext);
                        enclosingDecl = semanticInfo.getDeclForAST(lambdaAST);
                    }

                    symbol = this.pullTypeChecker.resolver.resolveAST(foundAST, inContextuallyTypedAssignment, enclosingDecl, resolutionContext).symbol;
                    if (callExpression) {
                        var isPropertyOrVar = symbol.getKind() === TypeScript.PullElementKind.Property || symbol.getKind() === TypeScript.PullElementKind.Variable;
                        var typeSymbol = symbol.getType();
                        if (isPropertyOrVar) {
                            isPropertyOrVar = (typeSymbol.getKind() !== TypeScript.PullElementKind.Interface && typeSymbol.getKind() !== TypeScript.PullElementKind.ObjectType) || typeSymbol.getName() === "";
                        }

                        if (!isPropertyOrVar) {
                            isConstructorCall = foundAST.nodeType === TypeScript.NodeType.SuperExpression || callExpression.nodeType === TypeScript.NodeType.ObjectCreationExpression;

                            if (foundAST.nodeType === TypeScript.NodeType.SuperExpression) {
                                if (symbol.getKind() === TypeScript.PullElementKind.Class) {
                                    callSignatures = (symbol).getConstructorMethod().getType().getConstructSignatures();
                                }
                            } else {
                                callSignatures = callExpression.nodeType === TypeScript.NodeType.InvocationExpression ? typeSymbol.getCallSignatures() : typeSymbol.getConstructSignatures();
                            }

                            var callResolutionResults = new TypeScript.PullAdditionalCallResolutionData();
                            if (callExpression.nodeType === TypeScript.NodeType.InvocationExpression) {
                                this.pullTypeChecker.resolver.resolveCallExpression(callExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext, callResolutionResults);
                            } else {
                                this.pullTypeChecker.resolver.resolveNewExpression(callExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext, callResolutionResults);
                            }

                            if (callResolutionResults.candidateSignature) {
                                candidateSignature = callResolutionResults.candidateSignature;
                            }
                            if (callResolutionResults.targetSymbol && callResolutionResults.targetSymbol.getName() !== "") {
                                symbol = callResolutionResults.targetSymbol;
                            }
                            foundAST = callExpression;
                        }
                    }
                }

                if (funcDecl) {
                    if (symbol && symbol.getKind() !== TypeScript.PullElementKind.Property) {
                        var signatureInfo = TypeScript.PullHelpers.getSignatureForFuncDecl(funcDecl, this.semanticInfoChain.getUnit(scriptName));
                        candidateSignature = signatureInfo.signature;
                        callSignatures = signatureInfo.allSignatures;
                    }
                } else if (!callSignatures && symbol && (symbol.getKind() === TypeScript.PullElementKind.Method || symbol.getKind() === TypeScript.PullElementKind.Function)) {
                    var typeSym = symbol.getType();
                    if (typeSym) {
                        callSignatures = typeSym.getCallSignatures();
                    }
                }
            }

            var enclosingScopeSymbol = this.getSymbolOfDeclaration(enclosingDecl);

            return {
                symbol: symbol,
                ast: foundAST,
                enclosingScopeSymbol: enclosingScopeSymbol,
                candidateSignature: candidateSignature,
                callSignatures: callSignatures,
                isConstructorCall: isConstructorCall
            };
        };

        TypeScriptCompiler.prototype.extractResolutionContextFromPath = function (path, document) {
            var script = document.script;
            var scriptName = document.fileName;

            var semanticInfo = this.semanticInfoChain.getUnit(scriptName);
            var enclosingDecl = null;
            var enclosingDeclAST = null;
            var inContextuallyTypedAssignment = false;

            var resolutionContext = new TypeScript.PullTypeResolutionContext();
            resolutionContext.resolveAggressively = true;

            if (path.count() === 0) {
                return null;
            }

            this.pullTypeChecker.setUnit(semanticInfo.getPath());

            for (var i = 0, n = path.count(); i < n; i++) {
                var current = path.asts[i];

                switch (current.nodeType) {
                    case TypeScript.NodeType.FunctionDeclaration:
                        if (TypeScript.hasFlag((current).getFunctionFlags(), TypeScript.FunctionFlags.IsFunctionExpression)) {
                            this.pullTypeChecker.resolver.resolveAST((current), true, enclosingDecl, resolutionContext);
                        }

                        break;

                    case TypeScript.NodeType.VariableDeclarator:
                        var assigningAST = current;
                        inContextuallyTypedAssignment = (assigningAST.typeExpr !== null);

                        this.pullTypeChecker.resolver.resolveAST(assigningAST, false, null, resolutionContext);
                        var varSymbolAndDiagnostics = this.semanticInfoChain.getSymbolAndDiagnosticsForAST(assigningAST, scriptName);
                        var varSymbol = varSymbolAndDiagnostics && varSymbolAndDiagnostics.symbol;

                        var contextualType = null;
                        if (varSymbol && inContextuallyTypedAssignment) {
                            contextualType = varSymbol.getType();
                        }

                        resolutionContext.pushContextualType(contextualType, false, null);

                        if (assigningAST.init) {
                            this.pullTypeChecker.resolver.resolveAST(assigningAST.init, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                        }

                        break;

                    case TypeScript.NodeType.InvocationExpression:
                    case TypeScript.NodeType.ObjectCreationExpression:
                        var isNew = current.nodeType === TypeScript.NodeType.ObjectCreationExpression;
                        var callExpression = current;
                        var contextualType = null;

                        if ((i + 1 < n) && callExpression.arguments === path.asts[i + 1]) {
                            var callResolutionResults = new TypeScript.PullAdditionalCallResolutionData();
                            if (isNew) {
                                this.pullTypeChecker.resolver.resolveNewExpression(callExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext, callResolutionResults);
                            } else {
                                this.pullTypeChecker.resolver.resolveCallExpression(callExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext, callResolutionResults);
                            }

                            if (callResolutionResults.actualParametersContextTypeSymbols) {
                                var argExpression = (path.asts[i + 1] && path.asts[i + 1].nodeType === TypeScript.NodeType.List) ? path.asts[i + 2] : path.asts[i + 1];
                                if (argExpression) {
                                    for (var j = 0, m = callExpression.arguments.members.length; j < m; j++) {
                                        if (callExpression.arguments.members[j] === argExpression) {
                                            var callContextualType = callResolutionResults.actualParametersContextTypeSymbols[j];
                                            if (callContextualType) {
                                                contextualType = callContextualType;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (isNew) {
                                this.pullTypeChecker.resolver.resolveNewExpression(callExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                            } else {
                                this.pullTypeChecker.resolver.resolveCallExpression(callExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                            }
                        }

                        resolutionContext.pushContextualType(contextualType, false, null);

                        break;

                    case TypeScript.NodeType.ArrayLiteralExpression:
                        this.pullTypeChecker.resolver.resolveAST(current, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);

                        var contextualType = null;
                        var currentContextualType = resolutionContext.getContextualType();
                        if (currentContextualType && currentContextualType.isArray()) {
                            contextualType = currentContextualType.getElementType();
                        }

                        resolutionContext.pushContextualType(contextualType, false, null);

                        break;

                    case TypeScript.NodeType.ObjectLiteralExpression:
                        var objectLiteralExpression = current;
                        var objectLiteralResolutionContext = new TypeScript.PullAdditionalObjectLiteralResolutionData();
                        this.pullTypeChecker.resolver.resolveObjectLiteralExpression(objectLiteralExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext, objectLiteralResolutionContext);

                        var memeberAST = (path.asts[i + 1] && path.asts[i + 1].nodeType === TypeScript.NodeType.List) ? path.asts[i + 2] : path.asts[i + 1];
                        if (memeberAST) {
                            var contextualType = null;
                            var memberDecls = objectLiteralExpression.operand;
                            if (memberDecls && objectLiteralResolutionContext.membersContextTypeSymbols) {
                                for (var j = 0, m = memberDecls.members.length; j < m; j++) {
                                    if (memberDecls.members[j] === memeberAST) {
                                        var memberContextualType = objectLiteralResolutionContext.membersContextTypeSymbols[j];
                                        if (memberContextualType) {
                                            contextualType = memberContextualType;
                                            break;
                                        }
                                    }
                                }
                            }

                            resolutionContext.pushContextualType(contextualType, false, null);
                        }

                        break;

                    case TypeScript.NodeType.AssignmentExpression:
                        var assignmentExpression = current;
                        var contextualType = null;

                        if (path.asts[i + 1] && path.asts[i + 1] === assignmentExpression.operand2) {
                            var leftType = this.pullTypeChecker.resolver.resolveAST(assignmentExpression.operand1, inContextuallyTypedAssignment, enclosingDecl, resolutionContext).symbol.getType();
                            if (leftType) {
                                inContextuallyTypedAssignment = true;
                                contextualType = leftType;
                            }
                        }

                        resolutionContext.pushContextualType(contextualType, false, null);

                        break;

                    case TypeScript.NodeType.CastExpression:
                        var castExpression = current;
                        var contextualType = null;

                        if (i + 1 < n && path.asts[i + 1] === castExpression.castTerm) {
                            resolutionContext.resolvingTypeReference = true;
                        }

                        var typeSymbol = this.pullTypeChecker.resolver.resolveTypeAssertionExpression(castExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext).symbol;

                        if (typeSymbol) {
                            inContextuallyTypedAssignment = true;
                            contextualType = typeSymbol;
                        }

                        resolutionContext.pushContextualType(contextualType, false, null);

                        break;

                    case TypeScript.NodeType.ReturnStatement:
                        var returnStatement = current;
                        var contextualType = null;

                        if (enclosingDecl && (enclosingDecl.getKind() & TypeScript.PullElementKind.SomeFunction)) {
                            var functionDeclaration = enclosingDeclAST;
                            if (functionDeclaration.returnTypeAnnotation) {
                                var currentResolvingTypeReference = resolutionContext.resolvingTypeReference;
                                resolutionContext.resolvingTypeReference = true;
                                var returnTypeSymbol = this.pullTypeChecker.resolver.resolveTypeReference(functionDeclaration.returnTypeAnnotation, enclosingDecl, resolutionContext).symbol;
                                resolutionContext.resolvingTypeReference = currentResolvingTypeReference;
                                if (returnTypeSymbol) {
                                    inContextuallyTypedAssignment = true;
                                    contextualType = returnTypeSymbol;
                                }
                            } else {
                                var currentContextualType = resolutionContext.getContextualType();
                                if (currentContextualType && currentContextualType.isFunction()) {
                                    var currentContextualTypeSignatureSymbol = currentContextualType.getDeclarations()[0].getSignatureSymbol();
                                    var currentContextualTypeReturnTypeSymbol = currentContextualTypeSignatureSymbol.getReturnType();
                                    if (currentContextualTypeReturnTypeSymbol) {
                                        inContextuallyTypedAssignment = true;
                                        contextualType = currentContextualTypeReturnTypeSymbol;
                                    }
                                }
                            }
                        }

                        resolutionContext.pushContextualType(contextualType, false, null);

                        break;

                    case TypeScript.NodeType.TypeRef:
                    case TypeScript.NodeType.TypeParameter:
                        resolutionContext.resolvingTypeReference = true;
                        break;
                }

                var decl = semanticInfo.getDeclForAST(current);
                if (decl && !(decl.getKind() & (TypeScript.PullElementKind.Variable | TypeScript.PullElementKind.Parameter | TypeScript.PullElementKind.TypeParameter))) {
                    enclosingDecl = decl;
                    enclosingDeclAST = current;
                }
            }

            if (path.isNameOfInterface() || path.isInClassImplementsList() || path.isInInterfaceExtendsList()) {
                resolutionContext.resolvingTypeReference = true;
            }

            if (path.ast().nodeType === TypeScript.NodeType.Name && path.count() > 1) {
                for (var i = path.count() - 1; i >= 0; i--) {
                    if (path.asts[path.top - 1].nodeType === TypeScript.NodeType.MemberAccessExpression && (path.asts[path.top - 1]).operand2 === path.asts[path.top]) {
                        path.pop();
                    } else {
                        break;
                    }
                }
            }

            return {
                ast: path.ast(),
                enclosingDecl: enclosingDecl,
                resolutionContext: resolutionContext,
                inContextuallyTypedAssignment: inContextuallyTypedAssignment
            };
        };

        TypeScriptCompiler.prototype.pullGetSymbolInformationFromPath = function (path, document) {
            var context = this.extractResolutionContextFromPath(path, document);
            if (!context) {
                return null;
            }

            var symbolAndDiagnostics = this.pullTypeChecker.resolver.resolveAST(path.ast(), context.inContextuallyTypedAssignment, context.enclosingDecl, context.resolutionContext);
            var symbol = symbolAndDiagnostics && symbolAndDiagnostics.symbol;

            return {
                symbol: symbol,
                ast: path.ast(),
                enclosingScopeSymbol: this.getSymbolOfDeclaration(context.enclosingDecl)
            };
        };

        TypeScriptCompiler.prototype.pullGetDeclarationSymbolInformation = function (path, document) {
            var script = document.script;
            var scriptName = document.fileName;

            var ast = path.ast();

            if (ast.nodeType !== TypeScript.NodeType.ClassDeclaration && ast.nodeType !== TypeScript.NodeType.InterfaceDeclaration && ast.nodeType !== TypeScript.NodeType.ModuleDeclaration && ast.nodeType !== TypeScript.NodeType.FunctionDeclaration && ast.nodeType !== TypeScript.NodeType.VariableDeclarator) {
                return null;
            }

            var context = this.extractResolutionContextFromPath(path, document);
            if (!context) {
                return null;
            }

            var semanticInfo = this.semanticInfoChain.getUnit(scriptName);
            var decl = semanticInfo.getDeclForAST(ast);
            var symbol = (decl.getKind() & TypeScript.PullElementKind.SomeSignature) ? decl.getSignatureSymbol() : decl.getSymbol();
            this.pullTypeChecker.resolver.resolveDeclaredSymbol(symbol, null, context.resolutionContext);

            return {
                symbol: symbol,
                ast: path.ast(),
                enclosingScopeSymbol: this.getSymbolOfDeclaration(context.enclosingDecl)
            };
        };

        TypeScriptCompiler.prototype.pullGetCallInformationFromPath = function (path, document) {
            if (path.ast().nodeType !== TypeScript.NodeType.InvocationExpression && path.ast().nodeType !== TypeScript.NodeType.ObjectCreationExpression) {
                return null;
            }

            var isNew = (path.ast().nodeType === TypeScript.NodeType.ObjectCreationExpression);

            var context = this.extractResolutionContextFromPath(path, document);
            if (!context) {
                return null;
            }

            var callResolutionResults = new TypeScript.PullAdditionalCallResolutionData();

            if (isNew) {
                this.pullTypeChecker.resolver.resolveNewExpression(path.ast(), context.inContextuallyTypedAssignment, context.enclosingDecl, context.resolutionContext, callResolutionResults);
            } else {
                this.pullTypeChecker.resolver.resolveCallExpression(path.ast(), context.inContextuallyTypedAssignment, context.enclosingDecl, context.resolutionContext, callResolutionResults);
            }

            return {
                targetSymbol: callResolutionResults.targetSymbol,
                resolvedSignatures: callResolutionResults.resolvedSignatures,
                candidateSignature: callResolutionResults.candidateSignature,
                ast: path.ast(),
                enclosingScopeSymbol: this.getSymbolOfDeclaration(context.enclosingDecl),
                isConstructorCall: isNew
            };
        };

        TypeScriptCompiler.prototype.pullGetVisibleMemberSymbolsFromPath = function (path, document) {
            var context = this.extractResolutionContextFromPath(path, document);
            if (!context) {
                return null;
            }

            var symbols = this.pullTypeChecker.resolver.getVisibleMembersFromExpression(path.ast(), context.enclosingDecl, context.resolutionContext);
            if (!symbols) {
                return null;
            }

            return {
                symbols: symbols,
                enclosingScopeSymbol: this.getSymbolOfDeclaration(context.enclosingDecl)
            };
        };

        TypeScriptCompiler.prototype.pullGetVisibleSymbolsFromPath = function (path, document) {
            var context = this.extractResolutionContextFromPath(path, document);
            if (!context) {
                return null;
            }

            var symbols = this.pullTypeChecker.resolver.getVisibleSymbols(context.enclosingDecl, context.resolutionContext);
            if (!symbols) {
                return null;
            }

            return {
                symbols: symbols,
                enclosingScopeSymbol: this.getSymbolOfDeclaration(context.enclosingDecl)
            };
        };

        TypeScriptCompiler.prototype.pullGetContextualMembersFromPath = function (path, document) {
            if (path.ast().nodeType !== TypeScript.NodeType.ObjectLiteralExpression) {
                return null;
            }

            var context = this.extractResolutionContextFromPath(path, document);
            if (!context) {
                return null;
            }

            var members = this.pullTypeChecker.resolver.getVisibleContextSymbols(context.enclosingDecl, context.resolutionContext);

            return {
                symbols: members,
                enclosingScopeSymbol: this.getSymbolOfDeclaration(context.enclosingDecl)
            };
        };

        TypeScriptCompiler.prototype.pullGetTypeInfoAtPosition = function (pos, document) {
            var _this = this;
            return this.timeFunction("pullGetTypeInfoAtPosition for pos " + pos + ":", function () {
                return _this.resolvePosition(pos, document);
            });
        };

        TypeScriptCompiler.prototype.getTopLevelDeclarations = function (scriptName) {
            this.pullResolveFile(scriptName);

            var unit = this.semanticInfoChain.getUnit(scriptName);

            if (!unit) {
                return null;
            }

            return unit.getTopLevelDecls();
        };

        TypeScriptCompiler.prototype.reportDiagnostics = function (errors, errorReporter) {
            for (var i = 0; i < errors.length; i++) {
                errorReporter.addDiagnostic(errors[i]);
            }
        };
        return TypeScriptCompiler;
    })();
    TypeScript.TypeScriptCompiler = TypeScriptCompiler;
})(TypeScript || (TypeScript = {}));
