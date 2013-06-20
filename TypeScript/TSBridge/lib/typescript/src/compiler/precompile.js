var TypeScript;
(function (TypeScript) {
    var CompilationSettings = (function () {
        function CompilationSettings() {
            this.propagateConstants = false;
            this.minWhitespace = false;
            this.emitComments = false;
            this.watch = false;
            this.exec = false;
            this.resolve = true;
            this.disallowBool = false;
            this.allowAutomaticSemicolonInsertion = true;
            this.allowModuleKeywordInExternalModuleReference = true;
            this.useDefaultLib = true;
            this.codeGenTarget = TypeScript.LanguageVersion.EcmaScript3;
            this.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
            this.outputOption = "";
            this.mapSourceFiles = false;
            this.emitFullSourceMapPath = false;
            this.generateDeclarationFiles = false;
            this.useCaseSensitiveFileResolution = false;
            this.gatherDiagnostics = false;
            this.updateTC = false;
        }
        return CompilationSettings;
    })();
    TypeScript.CompilationSettings = CompilationSettings;

    function getFileReferenceFromReferencePath(comment) {
        var referencesRegEx = /^(\/\/\/\s*<reference\s+path=)('|")(.+?)\2\s*(static=('|")(.+?)\2\s*)*\/>/gim;
        var match = referencesRegEx.exec(comment);

        if (match) {
            var path = TypeScript.normalizePath(match[3]);
            var adjustedPath = TypeScript.normalizePath(path);

            var isResident = match.length >= 7 && match[6] === "true";
            if (isResident) {
                TypeScript.CompilerDiagnostics.debugPrint(path + " is resident");
            }
            return {
                line: 0,
                character: 0,
                position: 0,
                length: 0,
                path: TypeScript.switchToForwardSlashes(adjustedPath),
                isResident: isResident
            };
        } else {
            return null;
        }
    }

    function getImplicitImport(comment) {
        var implicitImportRegEx = /^(\/\/\/\s*<implicit-import\s*)*\/>/gim;
        var match = implicitImportRegEx.exec(comment);

        if (match) {
            return true;
        }

        return false;
    }
    TypeScript.getImplicitImport = getImplicitImport;

    function getReferencedFiles(fileName, sourceText) {
        var preProcessInfo = preProcessFile(fileName, sourceText, null, false);
        return preProcessInfo.referencedFiles;
    }
    TypeScript.getReferencedFiles = getReferencedFiles;

    var scannerWindow = TypeScript.ArrayUtilities.createArray(2048, 0);
    var scannerDiagnostics = [];

    function processImports(lineMap, scanner, token, importedFiles) {
        var position = 0;
        var lineChar = { line: -1, character: -1 };

        while (token.tokenKind !== TypeScript.SyntaxKind.EndOfFileToken) {
            if (token.tokenKind === TypeScript.SyntaxKind.ImportKeyword) {
                var importStart = position + token.leadingTriviaWidth();
                token = scanner.scan(scannerDiagnostics, false);

                if (TypeScript.SyntaxFacts.isIdentifierNameOrAnyKeyword(token)) {
                    token = scanner.scan(scannerDiagnostics, false);

                    if (token.tokenKind === TypeScript.SyntaxKind.EqualsToken) {
                        token = scanner.scan(scannerDiagnostics, false);

                        if (token.tokenKind === TypeScript.SyntaxKind.ModuleKeyword || token.tokenKind === TypeScript.SyntaxKind.RequireKeyword) {
                            token = scanner.scan(scannerDiagnostics, false);

                            if (token.tokenKind === TypeScript.SyntaxKind.OpenParenToken) {
                                var afterOpenParenPosition = scanner.absoluteIndex();
                                token = scanner.scan(scannerDiagnostics, false);

                                lineMap.fillLineAndCharacterFromPosition(importStart, lineChar);

                                if (token.tokenKind === TypeScript.SyntaxKind.StringLiteral) {
                                    var ref = {
                                        line: lineChar.line,
                                        character: lineChar.character,
                                        position: afterOpenParenPosition + token.leadingTriviaWidth(),
                                        length: token.width(),
                                        path: TypeScript.stripQuotes(TypeScript.switchToForwardSlashes(token.text())),
                                        isResident: false
                                    };
                                    importedFiles.push(ref);
                                }
                            }
                        }
                    }
                }
            }

            position = scanner.absoluteIndex();
            token = scanner.scan(scannerDiagnostics, false);
        }
    }

    function processTripleSlashDirectives(lineMap, firstToken, settings, referencedFiles) {
        var leadingTrivia = firstToken.leadingTrivia();

        var position = 0;
        var lineChar = { line: -1, character: -1 };
        var noDefaultLib = false;

        for (var i = 0, n = leadingTrivia.count(); i < n; i++) {
            var trivia = leadingTrivia.syntaxTriviaAt(i);

            if (trivia.kind() === TypeScript.SyntaxKind.SingleLineCommentTrivia) {
                var triviaText = trivia.fullText();
                var referencedCode = getFileReferenceFromReferencePath(triviaText);

                if (referencedCode) {
                    lineMap.fillLineAndCharacterFromPosition(position, lineChar);
                    referencedCode.position = position;
                    referencedCode.length = trivia.fullWidth();
                    referencedCode.line = lineChar.line;
                    referencedCode.character = lineChar.character;

                    referencedFiles.push(referencedCode);
                }

                if (settings) {
                    var isNoDefaultLibRegex = /^(\/\/\/\s*<reference\s+no-default-lib=)('|")(.+?)\2\s*\/>/gim;
                    var isNoDefaultLibMatch = isNoDefaultLibRegex.exec(triviaText);
                    if (isNoDefaultLibMatch) {
                        noDefaultLib = (isNoDefaultLibMatch[3] === "true");
                    }
                }
            }

            position += trivia.fullWidth();
        }

        return { noDefaultLib: noDefaultLib };
    }

    function preProcessFile(fileName, sourceText, settings, readImportFiles) {
        if (typeof readImportFiles === "undefined") { readImportFiles = true; }
        settings = settings || new CompilationSettings();
        var text = TypeScript.SimpleText.fromScriptSnapshot(sourceText);
        var scanner = new TypeScript.Scanner(fileName, text, settings.codeGenTarget, scannerWindow);

        var firstToken = scanner.scan(scannerDiagnostics, false);

        var importedFiles = [];
        if (readImportFiles) {
            processImports(text.lineMap(), scanner, firstToken, importedFiles);
        }

        var referencedFiles = [];
        var properties = processTripleSlashDirectives(text.lineMap(), firstToken, settings, referencedFiles);

        scannerDiagnostics.length = 0;
        return { settings: settings, referencedFiles: referencedFiles, importedFiles: importedFiles, isLibFile: properties.noDefaultLib };
    }
    TypeScript.preProcessFile = preProcessFile;

    function getParseOptions(settings) {
        return new TypeScript.ParseOptions(settings.allowAutomaticSemicolonInsertion, settings.allowModuleKeywordInExternalModuleReference);
    }
    TypeScript.getParseOptions = getParseOptions;
})(TypeScript || (TypeScript = {}));
