var TypeScript;
(function (TypeScript) {
    var ReferenceResolutionResult = (function () {
        function ReferenceResolutionResult() {
            this.resolvedFiles = [];
            this.diagnostics = [];
            this.seenNoDefaultLibTag = false;
        }
        return ReferenceResolutionResult;
    })();
    TypeScript.ReferenceResolutionResult = ReferenceResolutionResult;

    var ReferenceLocation = (function () {
        function ReferenceLocation(filePath, position, length, isImported) {
            this.filePath = filePath;
            this.position = position;
            this.length = length;
            this.isImported = isImported;
        }
        return ReferenceLocation;
    })();

    var ReferenceResolver = (function () {
        function ReferenceResolver(inputFileNames, host, settings) {
            this.inputFileNames = inputFileNames;
            this.host = host;
            this.settings = settings;
            this.visited = {};
        }
        ReferenceResolver.resolve = function (inputFileNames, host, settings) {
            var resolver = new ReferenceResolver(inputFileNames, host, settings);
            return resolver.resolveInputFiles();
        };

        ReferenceResolver.prototype.resolveInputFiles = function () {
            var result = new ReferenceResolutionResult();

            if (!this.inputFileNames || this.inputFileNames.length <= 0) {
                return result;
            }

            var referenceLocation = new ReferenceLocation(null, 0, 0, false);
            for (var i = 0, n = this.inputFileNames.length; i < n; i++) {
                this.resolveIncludedFile(this.inputFileNames[i], referenceLocation, result);
            }

            return result;
        };

        ReferenceResolver.prototype.resolveIncludedFile = function (path, referenceLocation, resolutionResult) {
            var normalizedPath = this.getNormalizedFilePath(path, referenceLocation.filePath);

            if (this.isSameFile(normalizedPath, referenceLocation.filePath)) {
                if (!referenceLocation.isImported) {
                    resolutionResult.diagnostics.push(new TypeScript.Diagnostic(referenceLocation.filePath, referenceLocation.position, referenceLocation.length, TypeScript.DiagnosticCode.A_file_cannot_have_a_reference_to_itself, null));
                }

                return normalizedPath;
            }

            if (!TypeScript.isTSFile(normalizedPath) && !TypeScript.isDTSFile(normalizedPath)) {
                var dtsFile = normalizedPath + ".d.ts";
                var tsFile = normalizedPath + ".ts";

                if (this.host.fileExists(dtsFile)) {
                    normalizedPath = dtsFile;
                } else {
                    normalizedPath = tsFile;
                }
            }

            if (!this.host.fileExists(normalizedPath)) {
                if (!referenceLocation.isImported) {
                    resolutionResult.diagnostics.push(new TypeScript.Diagnostic(referenceLocation.filePath, referenceLocation.position, referenceLocation.length, TypeScript.DiagnosticCode.Cannot_resolve_referenced_file___0_, [path]));
                }

                return normalizedPath;
            }

            return this.resolveFile(normalizedPath, resolutionResult);
        };

        ReferenceResolver.prototype.resolveImportedFile = function (path, referenceLocation, resolutionResult) {
            var isRelativePath = TypeScript.isRelative(path);
            var isRootedPath = isRelativePath ? false : TypeScript.isRooted(path);

            if (isRelativePath || isRootedPath) {
                return this.resolveIncludedFile(path, referenceLocation, resolutionResult);
            } else {
                var parentDirectory = this.host.getParentDirectory(referenceLocation.filePath);
                var searchFilePath = null;
                var dtsFileName = path + ".d.ts";
                var tsFilePath = path + ".ts";

                do {
                    var currentFilePath = this.host.resolveRelativePath(dtsFileName, parentDirectory);
                    if (this.host.fileExists(currentFilePath)) {
                        searchFilePath = currentFilePath;
                        break;
                    }

                    currentFilePath = this.host.resolveRelativePath(tsFilePath, parentDirectory);
                    if (this.host.fileExists(currentFilePath)) {
                        searchFilePath = currentFilePath;
                        break;
                    }

                    parentDirectory = this.host.getParentDirectory(parentDirectory);
                } while(parentDirectory);

                if (!searchFilePath) {
                    return path;
                }

                return this.resolveFile(searchFilePath, resolutionResult);
            }
        };

        ReferenceResolver.prototype.resolveFile = function (normalizedPath, resolutionResult) {
            if (!this.isVisited(normalizedPath)) {
                this.recordVisitedFile(normalizedPath);

                var preprocessedFileInformation = TypeScript.preProcessFile(normalizedPath, this.host.getScriptSnapshot(normalizedPath), this.settings);

                if (preprocessedFileInformation.isLibFile) {
                    resolutionResult.seenNoDefaultLibTag = true;
                }

                var normalizedReferencePaths = [];
                for (var i = 0, n = preprocessedFileInformation.referencedFiles.length; i < n; i++) {
                    var fileReference = preprocessedFileInformation.referencedFiles[i];
                    var currentReferenceLocation = new ReferenceLocation(normalizedPath, fileReference.position, fileReference.length, false);
                    var normalizedReferencePath = this.resolveIncludedFile(fileReference.path, currentReferenceLocation, resolutionResult);
                    normalizedReferencePaths.push(normalizedReferencePath);
                }

                var normalizedImportPaths = [];
                for (var i = 0; i < preprocessedFileInformation.importedFiles.length; i++) {
                    var fileImport = preprocessedFileInformation.importedFiles[i];
                    var currentReferenceLocation = new ReferenceLocation(normalizedPath, fileImport.position, fileImport.length, true);
                    var normalizedImportPath = this.resolveImportedFile(fileImport.path, currentReferenceLocation, resolutionResult);
                    normalizedImportPaths.push(normalizedImportPath);
                }

                resolutionResult.resolvedFiles.push({
                    path: normalizedPath,
                    referencedFiles: normalizedReferencePaths,
                    importedFiles: normalizedImportPaths
                });
            }

            return normalizedPath;
        };

        ReferenceResolver.prototype.getNormalizedFilePath = function (path, parentFilePath) {
            var parentFileDirectory = parentFilePath ? this.host.getParentDirectory(parentFilePath) : "";
            var normalizedPath = this.host.resolveRelativePath(path, parentFileDirectory);
            return normalizedPath;
        };

        ReferenceResolver.prototype.getUniqueFileId = function (filePath) {
            return this.settings.useCaseSensitiveFileResolution ? filePath : filePath.toLocaleUpperCase();
        };

        ReferenceResolver.prototype.recordVisitedFile = function (filePath) {
            this.visited[this.getUniqueFileId(filePath)] = true;
        };

        ReferenceResolver.prototype.isVisited = function (filePath) {
            return this.visited[this.getUniqueFileId(filePath)];
        };

        ReferenceResolver.prototype.isSameFile = function (filePath1, filePath2) {
            if (!filePath1 || !filePath2) {
                return false;
            }

            if (this.settings.useCaseSensitiveFileResolution) {
                return filePath1 === filePath2;
            } else {
                return filePath1.toLocaleUpperCase() === filePath2.toLocaleUpperCase();
            }
        };
        return ReferenceResolver;
    })();
    TypeScript.ReferenceResolver = ReferenceResolver;
})(TypeScript || (TypeScript = {}));
