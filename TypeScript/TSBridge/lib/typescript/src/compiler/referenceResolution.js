var TypeScript;
(function (TypeScript) {
    var SourceUnit = (function () {
        function SourceUnit(path, fileInformation) {
            this.path = path;
            this.fileInformation = fileInformation;
            this.referencedFiles = null;
            this.lineStarts = null;
        }
        SourceUnit.prototype.getText = function (start, end) {
            return this.fileInformation.contents().substring(start, end);
        };

        SourceUnit.prototype.getLength = function () {
            return this.fileInformation.contents().length;
        };

        SourceUnit.prototype.getLineStartPositions = function () {
            if (this.lineStarts === null) {
                this.lineStarts = TypeScript.LineMap.fromString(this.fileInformation.contents()).lineStarts();
            }

            return this.lineStarts;
        };

        SourceUnit.prototype.getTextChangeRangeSinceVersion = function (scriptVersion) {
            throw TypeScript.Errors.notYetImplemented();
        };
        return SourceUnit;
    })();
    TypeScript.SourceUnit = SourceUnit;

    var CompilationEnvironment = (function () {
        function CompilationEnvironment(compilationSettings, ioHost) {
            this.compilationSettings = compilationSettings;
            this.ioHost = ioHost;
            this.code = [];
            this.inputFileNameToOutputFileName = new TypeScript.StringHashTable();
        }
        CompilationEnvironment.prototype.getSourceUnit = function (path) {
            var normalizedPath = TypeScript.switchToForwardSlashes(path.toUpperCase());
            for (var i = 0, n = this.code.length; i < n; i++) {
                var sourceUnit = this.code[i];
                var soruceUnitNormalizedPath = TypeScript.switchToForwardSlashes(sourceUnit.path.toUpperCase());
                if (normalizedPath === soruceUnitNormalizedPath) {
                    return sourceUnit;
                }
            }

            return null;
        };
        return CompilationEnvironment;
    })();
    TypeScript.CompilationEnvironment = CompilationEnvironment;

    var CodeResolver = (function () {
        function CodeResolver(environment) {
            this.environment = environment;
            this.visited = {};
        }
        CodeResolver.prototype.resolveCode = function (referencePath, parentPath, performSearch, resolutionDispatcher) {
            var resolvedFile = { fileInformation: null, path: referencePath };

            var ioHost = this.environment.ioHost;

            var isRelativePath = TypeScript.isRelative(referencePath);
            var isRootedPath = isRelativePath ? false : TypeScript.isRooted(referencePath);
            var normalizedPath = isRelativePath ? ioHost.resolvePath(parentPath + "/" + referencePath) : (isRootedPath || !parentPath || performSearch ? referencePath : parentPath + "/" + referencePath);

            if (!TypeScript.isTSFile(normalizedPath)) {
                normalizedPath += ".ts";
            }

            normalizedPath = TypeScript.switchToForwardSlashes(TypeScript.stripQuotes(normalizedPath));
            var absoluteModuleID = this.environment.compilationSettings.useCaseSensitiveFileResolution ? normalizedPath : normalizedPath.toLocaleUpperCase();

            if (!this.visited[absoluteModuleID]) {
                if (isRelativePath || isRootedPath || !performSearch) {
                    try  {
                        TypeScript.CompilerDiagnostics.debugPrint("   Reading code from " + normalizedPath);

                        try  {
                            resolvedFile.fileInformation = ioHost.readFile(normalizedPath);
                        } catch (err1) {
                            if (TypeScript.isTSFile(normalizedPath)) {
                                normalizedPath = TypeScript.changePathToDTS(normalizedPath);
                                TypeScript.CompilerDiagnostics.debugPrint("   Reading code from " + normalizedPath);
                                resolvedFile.fileInformation = ioHost.readFile(normalizedPath);
                            }
                        }
                        TypeScript.CompilerDiagnostics.debugPrint("   Found code at " + normalizedPath);

                        resolvedFile.path = normalizedPath;
                        this.visited[absoluteModuleID] = true;
                    } catch (err4) {
                        TypeScript.CompilerDiagnostics.debugPrint("   Did not find code for " + referencePath);

                        return false;
                    }
                } else {
                    resolvedFile = ioHost.findFile(parentPath, normalizedPath);

                    if (!resolvedFile) {
                        if (TypeScript.isTSFile(normalizedPath)) {
                            normalizedPath = TypeScript.changePathToDTS(normalizedPath);
                            resolvedFile = ioHost.findFile(parentPath, normalizedPath);
                        }
                    }

                    if (resolvedFile) {
                        resolvedFile.path = TypeScript.switchToForwardSlashes(TypeScript.stripQuotes(resolvedFile.path));
                        TypeScript.CompilerDiagnostics.debugPrint(referencePath + " resolved to: " + resolvedFile.path);
                        resolvedFile.fileInformation = resolvedFile.fileInformation;
                        this.visited[absoluteModuleID] = true;
                    } else {
                        TypeScript.CompilerDiagnostics.debugPrint("Could not find " + referencePath);
                    }
                }

                if (resolvedFile && resolvedFile.fileInformation !== null) {
                    var rootDir = ioHost.dirName(resolvedFile.path);
                    var sourceUnit = new SourceUnit(resolvedFile.path, resolvedFile.fileInformation);
                    var preProcessedFileInfo = TypeScript.preProcessFile(resolvedFile.path, sourceUnit, this.environment.compilationSettings);
                    var resolvedFilePath = ioHost.resolvePath(resolvedFile.path);
                    var resolutionResult;

                    sourceUnit.referencedFiles = preProcessedFileInfo.referencedFiles;

                    for (var i = 0; i < preProcessedFileInfo.referencedFiles.length; i++) {
                        var fileReference = preProcessedFileInfo.referencedFiles[i];

                        normalizedPath = TypeScript.isRooted(fileReference.path) ? fileReference.path : rootDir + "/" + fileReference.path;
                        normalizedPath = ioHost.resolvePath(normalizedPath);

                        if (resolvedFilePath === normalizedPath) {
                            resolutionDispatcher.errorReporter.addDiagnostic(new TypeScript.Diagnostic(normalizedPath, fileReference.position, fileReference.length, TypeScript.DiagnosticCode.A_file_cannot_have_a_reference_itself, null));
                            continue;
                        }

                        resolutionResult = this.resolveCode(fileReference.path, rootDir, false, resolutionDispatcher);

                        if (!resolutionResult) {
                            resolutionDispatcher.errorReporter.addDiagnostic(new TypeScript.Diagnostic(resolvedFilePath, fileReference.position, fileReference.length, TypeScript.DiagnosticCode.Cannot_resolve_referenced_file___0_, [fileReference.path]));
                        }
                    }

                    for (var i = 0; i < preProcessedFileInfo.importedFiles.length; i++) {
                        var fileImport = preProcessedFileInfo.importedFiles[i];

                        resolutionResult = this.resolveCode(fileImport.path, rootDir, true, resolutionDispatcher);

                        if (!resolutionResult) {
                            resolutionDispatcher.errorReporter.addDiagnostic(new TypeScript.Diagnostic(resolvedFilePath, fileImport.position, fileImport.length, TypeScript.DiagnosticCode.Cannot_resolve_imported_file___0_, [fileImport.path]));
                        }
                    }

                    resolutionDispatcher.postResolution(sourceUnit.path, sourceUnit);
                }
            }
            return true;
        };
        return CodeResolver;
    })();
    TypeScript.CodeResolver = CodeResolver;
})(TypeScript || (TypeScript = {}));
