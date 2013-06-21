var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var SyntaxDedenter = (function (_super) {
        __extends(SyntaxDedenter, _super);
        function SyntaxDedenter(dedentFirstToken, dedentationAmount, minimumIndent, options) {
            _super.call(this);
            this.dedentationAmount = dedentationAmount;
            this.minimumIndent = minimumIndent;
            this.options = options;
            this.lastTriviaWasNewLine = dedentFirstToken;
        }
        SyntaxDedenter.prototype.abort = function () {
            this.lastTriviaWasNewLine = false;
            this.dedentationAmount = 0;
        };

        SyntaxDedenter.prototype.isAborted = function () {
            return this.dedentationAmount === 0;
        };

        SyntaxDedenter.prototype.visitToken = function (token) {
            if (token.width() === 0) {
                return token;
            }

            var result = token;
            if (this.lastTriviaWasNewLine) {
                result = token.withLeadingTrivia(this.dedentTriviaList(token.leadingTrivia()));
            }

            if (this.isAborted()) {
                return token;
            }

            this.lastTriviaWasNewLine = token.hasTrailingNewLine();
            return result;
        };

        SyntaxDedenter.prototype.dedentTriviaList = function (triviaList) {
            var result = [];
            var dedentNextWhitespace = true;

            for (var i = 0, n = triviaList.count(); i < n && !this.isAborted(); i++) {
                var trivia = triviaList.syntaxTriviaAt(i);

                var dedentThisTrivia = dedentNextWhitespace;
                dedentNextWhitespace = false;

                if (dedentThisTrivia) {
                    if (trivia.kind() === TypeScript.SyntaxKind.WhitespaceTrivia) {
                        var hasFollowingNewLine = (i < triviaList.count() - 1) && triviaList.syntaxTriviaAt(i + 1).kind() === TypeScript.SyntaxKind.NewLineTrivia;
                        result.push(this.dedentWhitespace(trivia, hasFollowingNewLine));
                        continue;
                    } else if (trivia.kind() !== TypeScript.SyntaxKind.NewLineTrivia) {
                        this.abort();
                        break;
                    }
                }

                if (trivia.kind() === TypeScript.SyntaxKind.MultiLineCommentTrivia) {
                    result.push(this.dedentMultiLineComment(trivia));
                    continue;
                }

                result.push(trivia);
                if (trivia.kind() === TypeScript.SyntaxKind.NewLineTrivia) {
                    dedentNextWhitespace = true;
                }
            }

            if (dedentNextWhitespace) {
                this.abort();
            }

            if (this.isAborted()) {
                return triviaList;
            }

            return TypeScript.Syntax.triviaList(result);
        };

        SyntaxDedenter.prototype.dedentSegment = function (segment, hasFollowingNewLineTrivia) {
            var firstNonWhitespacePosition = TypeScript.Indentation.firstNonWhitespacePosition(segment);

            if (firstNonWhitespacePosition === segment.length) {
                if (hasFollowingNewLineTrivia) {
                    return "";
                }
            } else if (TypeScript.CharacterInfo.isLineTerminator(segment.charCodeAt(firstNonWhitespacePosition))) {
                return segment.substring(firstNonWhitespacePosition);
            }

            var firstNonWhitespaceColumn = TypeScript.Indentation.columnForPositionInString(segment, firstNonWhitespacePosition, this.options);

            var newFirstNonWhitespaceColumn = TypeScript.MathPrototype.min(firstNonWhitespaceColumn, TypeScript.MathPrototype.max(firstNonWhitespaceColumn - this.dedentationAmount, this.minimumIndent));

            if (newFirstNonWhitespaceColumn === firstNonWhitespaceColumn) {
                this.abort();
                return segment;
            }

            this.dedentationAmount = firstNonWhitespaceColumn - newFirstNonWhitespaceColumn;
            TypeScript.Debug.assert(this.dedentationAmount >= 0);

            var indentationString = TypeScript.Indentation.indentationString(newFirstNonWhitespaceColumn, this.options);

            return indentationString + segment.substring(firstNonWhitespacePosition);
        };

        SyntaxDedenter.prototype.dedentWhitespace = function (trivia, hasFollowingNewLineTrivia) {
            var newIndentation = this.dedentSegment(trivia.fullText(), hasFollowingNewLineTrivia);
            return TypeScript.Syntax.whitespace(newIndentation);
        };

        SyntaxDedenter.prototype.dedentMultiLineComment = function (trivia) {
            var segments = TypeScript.Syntax.splitMultiLineCommentTriviaIntoMultipleLines(trivia);
            if (segments.length === 1) {
                return trivia;
            }

            for (var i = 1; i < segments.length; i++) {
                var segment = segments[i];
                segments[i] = this.dedentSegment(segment, false);
            }

            var result = segments.join("");

            return TypeScript.Syntax.multiLineComment(result);
        };

        SyntaxDedenter.dedentNode = function (node, dedentFirstToken, dedentAmount, minimumIndent, options) {
            var dedenter = new SyntaxDedenter(dedentFirstToken, dedentAmount, minimumIndent, options);
            var result = node.accept(dedenter);

            if (dedenter.isAborted()) {
                return node;
            }

            return result;
        };
        return SyntaxDedenter;
    })(TypeScript.SyntaxRewriter);
    TypeScript.SyntaxDedenter = SyntaxDedenter;
})(TypeScript || (TypeScript = {}));
