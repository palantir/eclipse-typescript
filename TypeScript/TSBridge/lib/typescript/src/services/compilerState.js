var Services;
(function (Services) {
    var HostCacheEntry = (function () {
        function HostCacheEntry(fileName, host, version, isOpen) {
            this.fileName = fileName;
            this.host = host;
            this.version = version;
            this.isOpen = isOpen;
            this._sourceText = null;
        }
        HostCacheEntry.prototype.getScriptSnapshot = function () {
            if (this._sourceText === null) {
                this._sourceText = this.host.getScriptSnapshot(this.fileName);
            }

            return this._sourceText;
        };
        return HostCacheEntry;
    })();
    Services.HostCacheEntry = HostCacheEntry;

    var HostCache = (function () {
        function HostCache(host) {
            this.host = host;
            this.map = new TypeScript.StringHashTable();

            var fileNames = this.host.getScriptFileNames();
            for (var i = 0, n = fileNames.length; i < n; i++) {
                var fileName = fileNames[i];
                this.map.add(fileName, new HostCacheEntry(fileName, this.host, this.host.getScriptVersion(fileName), this.host.getScriptIsOpen(fileName)));
            }
        }
        HostCache.prototype.contains = function (fileName) {
            return this.map.lookup(fileName) !== null;
        };

        HostCache.prototype.getFileNames = function () {
            return this.map.getAllKeys();
        };

        HostCache.prototype.getVersion = function (fileName) {
            return this.map.lookup(fileName).version;
        };

        HostCache.prototype.isOpen = function (fileName) {
            return this.map.lookup(fileName).isOpen;
        };

        HostCache.prototype.getScriptSnapshot = function (fileName) {
            return this.map.lookup(fileName).getScriptSnapshot();
        };
        return HostCache;
    })();
    Services.HostCache = HostCache;

    var CompilerState = (function () {
        function CompilerState(host) {
            this.host = host;
            this.compiler = null;
            this.hostCache = null;
            this._compilationSettings = null;
            this.logger = this.host;

            this.diagnostics = new Services.CompilerDiagnostics(host);
        }
        CompilerState.prototype.compilationSettings = function () {
            return this._compilationSettings;
        };

        CompilerState.prototype.getFileNames = function () {
            return this.compiler.fileNameToDocument.getAllKeys();
        };

        CompilerState.prototype.getScript = function (fileName) {
            return this.compiler.getDocument(fileName).script;
        };

        CompilerState.prototype.getScripts = function () {
            return this.compiler.getScripts();
        };

        CompilerState.prototype.getScriptVersion = function (fileName) {
            return this.hostCache.getVersion(fileName);
        };

        CompilerState.prototype.getSemanticInfoChain = function () {
            return this.compiler.semanticInfoChain;
        };

        CompilerState.prototype.addCompilerUnit = function (compiler, fileName) {
            compiler.addSourceUnit(fileName, this.hostCache.getScriptSnapshot(fileName), ByteOrderMark.None, this.hostCache.getVersion(fileName), this.hostCache.isOpen(fileName));
        };

        CompilerState.prototype.getHostCompilationSettings = function () {
            var settings = this.host.getCompilationSettings();
            if (settings !== null) {
                return settings;
            }

            settings = new TypeScript.CompilationSettings();
            settings.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;

            return settings;
        };

        CompilerState.prototype.createCompiler = function () {
            this.logger.log("Initializing compiler");

            this._compilationSettings = new TypeScript.CompilationSettings();

            Services.copyDataObject(this.compilationSettings(), this.getHostCompilationSettings());
            this.compiler = new TypeScript.TypeScriptCompiler(this.logger, this.compilationSettings());

            var fileNames = this.host.getScriptFileNames();
            for (var i = 0, n = fileNames.length; i < n; i++) {
                this.addCompilerUnit(this.compiler, fileNames[i]);
            }

            this.compiler.pullTypeCheck();
        };

        CompilerState.prototype.minimalRefresh = function () {
            this.hostCache = new HostCache(this.host);
        };

        CompilerState.prototype.refresh = function () {
            this.hostCache = new HostCache(this.host);

            if (!this.fullRefresh()) {
                this.partialRefresh();
            }
        };

        CompilerState.prototype.fullRefresh = function () {
            if (this.compiler == null) {
                this.logger.log("Creating new compiler instance because there is no currently active instance");
                this.createCompiler();
                return true;
            }

            var fileNames = this.compiler.fileNameToDocument.getAllKeys();
            for (var unitIndex = 0, len = fileNames.length; unitIndex < len; unitIndex++) {
                var fileName = fileNames[unitIndex];

                if (!this.hostCache.contains(fileName)) {
                    this.logger.log("Creating new compiler instance because of unit is not part of program anymore: " + unitIndex + "-" + fileName);
                    this.createCompiler();
                    return true;
                }
            }

            return false;
        };

        CompilerState.prototype.partialRefresh = function () {
            this.logger.log("Updating files...");

            var fileAdded = false;

            var fileNames = this.host.getScriptFileNames();
            for (var i = 0, n = fileNames.length; i < n; i++) {
                var fileName = fileNames[i];

                if (this.compiler.getDocument(fileName)) {
                    this.updateCompilerUnit(this.compiler, fileName);
                } else {
                    this.addCompilerUnit(this.compiler, fileName);
                    fileAdded = true;
                }
            }

            if (fileAdded) {
                this.compiler.pullTypeCheck();
            }
        };

        CompilerState.prototype.getDocument = function (fileName) {
            return this.compiler.getDocument(fileName);
        };

        CompilerState.prototype.getSyntacticDiagnostics = function (fileName) {
            return this.compiler.getSyntacticDiagnostics(fileName);
        };

        CompilerState.prototype.getSemanticDiagnostics = function (fileName) {
            return this.compiler.getSemanticDiagnostics(fileName);
        };

        CompilerState.prototype.getEmitOutput = function (fileName) {
            var result = new Services.EmitOutput();

            var syntacticDiagnostics = this.compiler.getSyntacticDiagnostics(fileName);
            if (this.containErrors(syntacticDiagnostics)) {
                return result;
            }

            this.compiler.getSemanticDiagnostics(fileName);

            var emitterIOHost = {
                writeFile: function (fileName, contents, writeByteOrderMark) {
                    var outputFile = new Services.EmitOutputTextWriter(fileName, writeByteOrderMark);
                    outputFile.Write(contents);
                    result.outputFiles.push(outputFile);
                },
                directoryExists: function (fileName) {
                    return true;
                },
                fileExists: function (fileName) {
                    return false;
                },
                resolvePath: function (fileName) {
                    return fileName;
                }
            };

            var diagnostics;

            diagnostics = this.compiler.parseEmitOption(emitterIOHost) || [];
            result.diagnostics = result.diagnostics.concat(diagnostics);
            if (this.containErrors(diagnostics)) {
                return result;
            }

            diagnostics = this.compiler.emitUnit(fileName, emitterIOHost) || [];
            result.diagnostics = result.diagnostics.concat(diagnostics);
            if (this.containErrors(diagnostics)) {
                return result;
            }

            if (this.shouldEmitDeclarations(fileName)) {
                diagnostics = this.compiler.emitUnitDeclarations(fileName) || [];
                result.diagnostics = result.diagnostics.concat(diagnostics);
            }

            return result;
        };

        CompilerState.prototype.shouldEmitDeclarations = function (fileName) {
            var semanticDiagnostics = this.compiler.getSemanticDiagnostics(fileName);
            if (this.containErrors(semanticDiagnostics)) {
                return false;
            }

            return true;
        };

        CompilerState.prototype.containErrors = function (diagnostics) {
            if (diagnostics && diagnostics.length > 0) {
                for (var i = 0; i < diagnostics.length; i++) {
                    var diagnosticInfo = TypeScript.getDiagnosticInfoFromCode(diagnostics[i].diagnosticCode());
                    if (diagnosticInfo.category === TypeScript.DiagnosticCategory.Error) {
                        return true;
                    }
                }
            }

            return false;
        };

        CompilerState.prototype.getScriptTextChangeRangeSinceVersion = function (fileName, lastKnownVersion) {
            var currentVersion = this.hostCache.getVersion(fileName);
            if (lastKnownVersion === currentVersion) {
                return TypeScript.TextChangeRange.unchanged;
            }

            var scriptSnapshot = this.hostCache.getScriptSnapshot(fileName);
            return scriptSnapshot.getTextChangeRangeSinceVersion(lastKnownVersion);
        };

        CompilerState.prototype.getScriptSnapshot = function (fileName) {
            return this.hostCache.getScriptSnapshot(fileName);
        };

        CompilerState.prototype.getDeclarationSymbolInformation = function (path, document) {
            return this.compiler.pullGetDeclarationSymbolInformation(path, document);
        };

        CompilerState.prototype.getSymbolInformationFromPath = function (path, document) {
            return this.compiler.pullGetSymbolInformationFromPath(path, document);
        };

        CompilerState.prototype.getCallInformationFromPath = function (path, document) {
            return this.compiler.pullGetCallInformationFromPath(path, document);
        };

        CompilerState.prototype.getVisibleMemberSymbolsFromPath = function (path, document) {
            return this.compiler.pullGetVisibleMemberSymbolsFromPath(path, document);
        };

        CompilerState.prototype.getVisibleSymbolsFromPath = function (path, document) {
            return this.compiler.pullGetVisibleSymbolsFromPath(path, document);
        };

        CompilerState.prototype.geContextualMembersFromPath = function (path, document) {
            return this.compiler.pullGetContextualMembersFromPath(path, document);
        };

        CompilerState.prototype.getTopLevelDeclarations = function (fileName) {
            return this.compiler.getTopLevelDeclarations(fileName);
        };

        CompilerState.prototype.updateCompilerUnit = function (compiler, fileName) {
            var document = this.compiler.getDocument(fileName);

            var version = this.hostCache.getVersion(fileName);
            var isOpen = this.hostCache.isOpen(fileName);
            if (document.version === version && document.isOpen === isOpen) {
                return;
            }

            var textChangeRange = this.getScriptTextChangeRangeSinceVersion(fileName, document.version);
            compiler.updateSourceUnit(fileName, this.hostCache.getScriptSnapshot(fileName), version, isOpen, textChangeRange);
        };

        CompilerState.prototype.getDocCommentsOfDecl = function (decl) {
            var ast = this.compiler.semanticInfoChain.getASTForDecl(decl);
            if (ast && (ast.nodeType != TypeScript.NodeType.ModuleDeclaration || decl.getKind() != TypeScript.PullElementKind.Variable)) {
                return ast.getDocComments();
            }

            return [];
        };

        CompilerState.prototype.getDocCommentArray = function (symbol) {
            var docComments = [];
            if (!symbol) {
                return docComments;
            }

            var isParameter = symbol.getKind() == TypeScript.PullElementKind.Parameter;
            var decls = symbol.getDeclarations();
            for (var i = 0; i < decls.length; i++) {
                if (isParameter && decls[i].getKind() == TypeScript.PullElementKind.Property) {
                    continue;
                }
                docComments = docComments.concat(this.getDocCommentsOfDecl(decls[i]));
            }
            return docComments;
        };

        CompilerState.getDefaultConstructorSymbolForDocComments = function (classSymbol) {
            if (classSymbol.getHasDefaultConstructor()) {
                var extendedTypes = classSymbol.getExtendedTypes();
                if (extendedTypes.length) {
                    return CompilerState.getDefaultConstructorSymbolForDocComments(extendedTypes[0]);
                }
            }

            return classSymbol.getType().getConstructSignatures()[0];
        };

        CompilerState.prototype.getDocComments = function (symbol, useConstructorAsClass) {
            if (!symbol) {
                return "";
            }
            var decls = symbol.getDeclarations();
            if (useConstructorAsClass && decls.length && decls[0].getKind() == TypeScript.PullElementKind.ConstructorMethod) {
                var classDecl = decls[0].getParentDecl();
                return TypeScript.Comment.getDocCommentText(this.getDocCommentsOfDecl(classDecl));
            }

            if (symbol.docComments === null) {
                var docComments = "";
                if (!useConstructorAsClass && symbol.getKind() == TypeScript.PullElementKind.ConstructSignature && decls.length && decls[0].getKind() == TypeScript.PullElementKind.Class) {
                    var classSymbol = (symbol).getReturnType();
                    var extendedTypes = classSymbol.getExtendedTypes();
                    if (extendedTypes.length) {
                        docComments = this.getDocComments((extendedTypes[0]).getConstructorMethod());
                    } else {
                        docComments = "";
                    }
                } else if (symbol.getKind() == TypeScript.PullElementKind.Parameter) {
                    var parameterComments = [];
                    var funcContainerList = symbol.findIncomingLinks(function (link) {
                        return link.kind == TypeScript.SymbolLinkKind.Parameter;
                    });
                    for (var i = 0; i < funcContainerList.length; i++) {
                        var funcContainer = funcContainerList[i].start;
                        var funcDocComments = this.getDocCommentArray(funcContainer);
                        var paramComment = TypeScript.Comment.getParameterDocCommentText(symbol.getDisplayName(), funcDocComments);
                        if (paramComment != "") {
                            parameterComments.push(paramComment);
                        }
                    }
                    var paramSelfComment = TypeScript.Comment.getDocCommentText(this.getDocCommentArray(symbol));
                    if (paramSelfComment != "") {
                        parameterComments.push(paramSelfComment);
                    }
                    docComments = parameterComments.join("\n");
                } else {
                    var getSymbolComments = true;
                    if (symbol.getKind() == TypeScript.PullElementKind.FunctionType) {
                        var declarationList = symbol.findIncomingLinks(function (link) {
                            return link.kind == TypeScript.SymbolLinkKind.TypedAs;
                        });
                        if (declarationList.length > 0) {
                            docComments = this.getDocComments(declarationList[0].start);
                            getSymbolComments = false;
                        }
                    }
                    if (getSymbolComments) {
                        docComments = TypeScript.Comment.getDocCommentText(this.getDocCommentArray(symbol));
                        if (docComments == "") {
                            if (symbol.getKind() == TypeScript.PullElementKind.CallSignature) {
                                var callList = symbol.findIncomingLinks(function (link) {
                                    return link.kind == TypeScript.SymbolLinkKind.CallSignature;
                                });
                                if (callList.length == 1) {
                                    var callTypeSymbol = callList[0].start;
                                    if (callTypeSymbol.getCallSignatures().length == 1) {
                                        docComments = this.getDocComments(callTypeSymbol);
                                    }
                                }
                            }
                        }
                    }
                }
                symbol.docComments = docComments;
            }

            return symbol.docComments;
        };
        return CompilerState;
    })();
    Services.CompilerState = CompilerState;
})(Services || (Services = {}));
