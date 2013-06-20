var TypeScript;
(function (TypeScript) {
    (function (Syntax) {
        var SyntaxTrivia = (function () {
            function SyntaxTrivia(kind, textOrToken) {
                this._kind = kind;
                this._textOrToken = textOrToken;
            }
            SyntaxTrivia.prototype.toJSON = function (key) {
                var result = {};
                result.kind = TypeScript.SyntaxKind[this._kind];

                if (this.isSkippedToken()) {
                    result.skippedToken = this._textOrToken;
                } else {
                    result.text = this._textOrToken;
                }
                return result;
            };

            SyntaxTrivia.prototype.kind = function () {
                return this._kind;
            };

            SyntaxTrivia.prototype.fullWidth = function () {
                return this.fullText().length;
            };

            SyntaxTrivia.prototype.fullText = function () {
                return this.isSkippedToken() ? this.skippedToken().fullText() : this._textOrToken;
            };

            SyntaxTrivia.prototype.isWhitespace = function () {
                return this.kind() === TypeScript.SyntaxKind.WhitespaceTrivia;
            };

            SyntaxTrivia.prototype.isComment = function () {
                return this.kind() === TypeScript.SyntaxKind.SingleLineCommentTrivia || this.kind() === TypeScript.SyntaxKind.MultiLineCommentTrivia;
            };

            SyntaxTrivia.prototype.isNewLine = function () {
                return this.kind() === TypeScript.SyntaxKind.NewLineTrivia;
            };

            SyntaxTrivia.prototype.isSkippedToken = function () {
                return this.kind() === TypeScript.SyntaxKind.SkippedTokenTrivia;
            };

            SyntaxTrivia.prototype.skippedToken = function () {
                TypeScript.Debug.assert(this.isSkippedToken());
                return this._textOrToken;
            };

            SyntaxTrivia.prototype.collectTextElements = function (elements) {
                elements.push(this.fullText());
            };
            return SyntaxTrivia;
        })();

        function trivia(kind, text) {
            return new SyntaxTrivia(kind, text);
        }
        Syntax.trivia = trivia;

        function skippedTokenTrivia(token) {
            TypeScript.Debug.assert(!token.hasLeadingTrivia());
            TypeScript.Debug.assert(!token.hasTrailingTrivia());
            TypeScript.Debug.assert(token.fullWidth() > 0);
            return new SyntaxTrivia(TypeScript.SyntaxKind.SkippedTokenTrivia, token);
        }
        Syntax.skippedTokenTrivia = skippedTokenTrivia;

        function spaces(count) {
            return trivia(TypeScript.SyntaxKind.WhitespaceTrivia, TypeScript.StringUtilities.repeat(" ", count));
        }
        Syntax.spaces = spaces;

        function whitespace(text) {
            return trivia(TypeScript.SyntaxKind.WhitespaceTrivia, text);
        }
        Syntax.whitespace = whitespace;

        function multiLineComment(text) {
            return trivia(TypeScript.SyntaxKind.MultiLineCommentTrivia, text);
        }
        Syntax.multiLineComment = multiLineComment;

        function singleLineComment(text) {
            return trivia(TypeScript.SyntaxKind.SingleLineCommentTrivia, text);
        }
        Syntax.singleLineComment = singleLineComment;

        Syntax.spaceTrivia = spaces(1);
        Syntax.lineFeedTrivia = trivia(TypeScript.SyntaxKind.NewLineTrivia, "\n");
        Syntax.carriageReturnTrivia = trivia(TypeScript.SyntaxKind.NewLineTrivia, "\r");
        Syntax.carriageReturnLineFeedTrivia = trivia(TypeScript.SyntaxKind.NewLineTrivia, "\r\n");

        function splitMultiLineCommentTriviaIntoMultipleLines(trivia) {
            var result = [];

            var triviaText = trivia.fullText();
            var currentIndex = 0;

            for (var i = 0; i < triviaText.length; i++) {
                var ch = triviaText.charCodeAt(i);

                var isCarriageReturnLineFeed = false;
                switch (ch) {
                    case TypeScript.CharacterCodes.carriageReturn:
                        if (i < triviaText.length - 1 && triviaText.charCodeAt(i + 1) === TypeScript.CharacterCodes.lineFeed) {
                            i++;
                        }

                    case TypeScript.CharacterCodes.lineFeed:
                    case TypeScript.CharacterCodes.paragraphSeparator:
                    case TypeScript.CharacterCodes.lineSeparator:
                        result.push(triviaText.substring(currentIndex, i + 1));

                        currentIndex = i + 1;
                        continue;
                }
            }

            result.push(triviaText.substring(currentIndex));
            return result;
        }
        Syntax.splitMultiLineCommentTriviaIntoMultipleLines = splitMultiLineCommentTriviaIntoMultipleLines;
    })(TypeScript.Syntax || (TypeScript.Syntax = {}));
    var Syntax = TypeScript.Syntax;
})(TypeScript || (TypeScript = {}));
