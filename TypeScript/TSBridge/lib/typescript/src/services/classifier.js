var Services;
(function (Services) {
    (function (EndOfLineState) {
        EndOfLineState[EndOfLineState["Start"] = 0] = "Start";
        EndOfLineState[EndOfLineState["InMultiLineCommentTrivia"] = 1] = "InMultiLineCommentTrivia";
        EndOfLineState[EndOfLineState["InSingleQuoteStringLiteral"] = 2] = "InSingleQuoteStringLiteral";
        EndOfLineState[EndOfLineState["InDoubleQuoteStringLiteral"] = 3] = "InDoubleQuoteStringLiteral";
    })(Services.EndOfLineState || (Services.EndOfLineState = {}));
    var EndOfLineState = Services.EndOfLineState;

    (function (TokenClass) {
        TokenClass[TokenClass["Punctuation"] = 0] = "Punctuation";
        TokenClass[TokenClass["Keyword"] = 1] = "Keyword";
        TokenClass[TokenClass["Operator"] = 2] = "Operator";
        TokenClass[TokenClass["Comment"] = 3] = "Comment";
        TokenClass[TokenClass["Whitespace"] = 4] = "Whitespace";
        TokenClass[TokenClass["Identifier"] = 5] = "Identifier";
        TokenClass[TokenClass["NumberLiteral"] = 6] = "NumberLiteral";
        TokenClass[TokenClass["StringLiteral"] = 7] = "StringLiteral";
        TokenClass[TokenClass["RegExpLiteral"] = 8] = "RegExpLiteral";
    })(Services.TokenClass || (Services.TokenClass = {}));
    var TokenClass = Services.TokenClass;

    var noRegexTable = [];
    noRegexTable[TypeScript.SyntaxKind.IdentifierName] = true;
    noRegexTable[TypeScript.SyntaxKind.StringLiteral] = true;
    noRegexTable[TypeScript.SyntaxKind.NumericLiteral] = true;
    noRegexTable[TypeScript.SyntaxKind.RegularExpressionLiteral] = true;
    noRegexTable[TypeScript.SyntaxKind.ThisKeyword] = true;
    noRegexTable[TypeScript.SyntaxKind.PlusPlusToken] = true;
    noRegexTable[TypeScript.SyntaxKind.MinusMinusToken] = true;
    noRegexTable[TypeScript.SyntaxKind.CloseParenToken] = true;
    noRegexTable[TypeScript.SyntaxKind.CloseBracketToken] = true;
    noRegexTable[TypeScript.SyntaxKind.CloseBraceToken] = true;
    noRegexTable[TypeScript.SyntaxKind.TrueKeyword] = true;
    noRegexTable[TypeScript.SyntaxKind.FalseKeyword] = true;

    var Classifier = (function () {
        function Classifier(host) {
            this.host = host;
            this.characterWindow = TypeScript.ArrayUtilities.createArray(2048, 0);
            this.diagnostics = [];
        }
        Classifier.prototype.getClassificationsForLine = function (text, lexState) {
            var offset = 0;
            if (lexState !== EndOfLineState.Start) {
                if (lexState === EndOfLineState.InDoubleQuoteStringLiteral) {
                    text = '"\\\n' + text;
                } else if (lexState === EndOfLineState.InSingleQuoteStringLiteral) {
                    text = "'\\\n" + text;
                } else if (lexState === EndOfLineState.InMultiLineCommentTrivia) {
                    text = "/*\n" + text;
                }

                offset = 3;
            }

            var result = new ClassificationResult();
            this.scanner = new TypeScript.Scanner("", TypeScript.SimpleText.fromString(text), TypeScript.LanguageVersion.EcmaScript5, this.characterWindow);

            var lastTokenKind = TypeScript.SyntaxKind.None;

            while (this.scanner.absoluteIndex() < text.length) {
                this.diagnostics.length = 0;
                var token = this.scanner.scan(this.diagnostics, !noRegexTable[lastTokenKind]);
                lastTokenKind = token.tokenKind;

                this.processToken(text, offset, token, result);
            }

            return result;
        };

        Classifier.prototype.processToken = function (text, offset, token, result) {
            this.processTriviaList(text, offset, token.leadingTrivia(), result);
            this.addResult(text, offset, result, token.width(), token.tokenKind);
            this.processTriviaList(text, offset, token.trailingTrivia(), result);

            if (this.scanner.absoluteIndex() >= text.length) {
                if (this.diagnostics.length > 0) {
                    if (this.diagnostics[this.diagnostics.length - 1].diagnosticCode() === TypeScript.DiagnosticCode._StarSlash__expected) {
                        result.finalLexState = EndOfLineState.InMultiLineCommentTrivia;
                        return;
                    }
                }

                if (token.tokenKind === TypeScript.SyntaxKind.StringLiteral) {
                    var tokenText = token.text();
                    if (tokenText.length > 0 && tokenText.charCodeAt(tokenText.length - 1) === TypeScript.CharacterCodes.backslash) {
                        var quoteChar = tokenText.charCodeAt(0);
                        result.finalLexState = quoteChar === TypeScript.CharacterCodes.doubleQuote ? EndOfLineState.InDoubleQuoteStringLiteral : EndOfLineState.InSingleQuoteStringLiteral;
                        return;
                    }
                }
            }
        };

        Classifier.prototype.processTriviaList = function (text, offset, triviaList, result) {
            for (var i = 0, n = triviaList.count(); i < n; i++) {
                var trivia = triviaList.syntaxTriviaAt(i);
                this.addResult(text, offset, result, trivia.fullWidth(), trivia.kind());
            }
        };

        Classifier.prototype.addResult = function (text, offset, result, length, kind) {
            if (length > 0) {
                if (result.entries.length === 0) {
                    length -= offset;
                }

                result.entries.push(new ClassificationInfo(length, this.classFromKind(kind)));
            }
        };

        Classifier.prototype.classFromKind = function (kind) {
            if (TypeScript.SyntaxFacts.isAnyKeyword(kind)) {
                return TokenClass.Keyword;
            } else if (TypeScript.SyntaxFacts.isBinaryExpressionOperatorToken(kind) || TypeScript.SyntaxFacts.isPrefixUnaryExpressionOperatorToken(kind)) {
                return TokenClass.Operator;
            } else if (TypeScript.SyntaxFacts.isAnyPunctuation(kind)) {
                return TokenClass.Punctuation;
            }

            switch (kind) {
                case TypeScript.SyntaxKind.WhitespaceTrivia:
                    return TokenClass.Whitespace;
                case TypeScript.SyntaxKind.MultiLineCommentTrivia:
                case TypeScript.SyntaxKind.SingleLineCommentTrivia:
                    return TokenClass.Comment;
                case TypeScript.SyntaxKind.NumericLiteral:
                    return TokenClass.NumberLiteral;
                case TypeScript.SyntaxKind.StringLiteral:
                    return TokenClass.StringLiteral;
                case TypeScript.SyntaxKind.RegularExpressionLiteral:
                    return TokenClass.RegExpLiteral;
                case TypeScript.SyntaxKind.IdentifierName:
                default:
                    return TokenClass.Identifier;
            }
        };
        return Classifier;
    })();
    Services.Classifier = Classifier;

    var ClassificationResult = (function () {
        function ClassificationResult() {
            this.finalLexState = EndOfLineState.Start;
            this.entries = [];
        }
        return ClassificationResult;
    })();
    Services.ClassificationResult = ClassificationResult;

    var ClassificationInfo = (function () {
        function ClassificationInfo(length, classification) {
            this.length = length;
            this.classification = classification;
        }
        return ClassificationInfo;
    })();
    Services.ClassificationInfo = ClassificationInfo;
})(Services || (Services = {}));
