var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var SyntaxIndenter = (function (_super) {
        __extends(SyntaxIndenter, _super);
        function SyntaxIndenter(indentFirstToken, indentationAmount, options) {
            _super.call(this);
            this.indentationAmount = indentationAmount;
            this.options = options;
            this.lastTriviaWasNewLine = indentFirstToken;
            this.indentationTrivia = TypeScript.Indentation.indentationTrivia(this.indentationAmount, this.options);
        }
        SyntaxIndenter.prototype.visitToken = function (token) {
            if (token.width() === 0) {
                return token;
            }

            var result = token;
            if (this.lastTriviaWasNewLine) {
                result = token.withLeadingTrivia(this.indentTriviaList(token.leadingTrivia()));
            }

            this.lastTriviaWasNewLine = token.hasTrailingNewLine();
            return result;
        };

        SyntaxIndenter.prototype.indentTriviaList = function (triviaList) {
            var result = [];

            var indentNextTrivia = true;
            for (var i = 0, n = triviaList.count(); i < n; i++) {
                var trivia = triviaList.syntaxTriviaAt(i);

                var indentThisTrivia = indentNextTrivia;
                indentNextTrivia = false;

                switch (trivia.kind()) {
                    case TypeScript.SyntaxKind.MultiLineCommentTrivia:
                        this.indentMultiLineComment(trivia, indentThisTrivia, result);
                        continue;

                    case TypeScript.SyntaxKind.SingleLineCommentTrivia:
                    case TypeScript.SyntaxKind.SkippedTokenTrivia:
                        this.indentSingleLineOrSkippedText(trivia, indentThisTrivia, result);
                        continue;

                    case TypeScript.SyntaxKind.WhitespaceTrivia:
                        this.indentWhitespace(trivia, indentThisTrivia, result);
                        continue;

                    case TypeScript.SyntaxKind.NewLineTrivia:
                        result.push(trivia);
                        indentNextTrivia = true;
                        continue;

                    default:
                        throw TypeScript.Errors.invalidOperation();
                }
            }

            if (indentNextTrivia) {
                result.push(this.indentationTrivia);
            }

            return TypeScript.Syntax.triviaList(result);
        };

        SyntaxIndenter.prototype.indentSegment = function (segment) {
            var firstNonWhitespacePosition = TypeScript.Indentation.firstNonWhitespacePosition(segment);

            if (firstNonWhitespacePosition < segment.length && TypeScript.CharacterInfo.isLineTerminator(segment.charCodeAt(firstNonWhitespacePosition))) {
                return segment;
            }

            var firstNonWhitespaceColumn = TypeScript.Indentation.columnForPositionInString(segment, firstNonWhitespacePosition, this.options);

            var newFirstNonWhitespaceColumn = firstNonWhitespaceColumn + this.indentationAmount;

            var indentationString = TypeScript.Indentation.indentationString(newFirstNonWhitespaceColumn, this.options);

            return indentationString + segment.substring(firstNonWhitespacePosition);
        };

        SyntaxIndenter.prototype.indentWhitespace = function (trivia, indentThisTrivia, result) {
            if (!indentThisTrivia) {
                result.push(trivia);
                return;
            }

            var newIndentation = this.indentSegment(trivia.fullText());
            result.push(TypeScript.Syntax.whitespace(newIndentation));
        };

        SyntaxIndenter.prototype.indentSingleLineOrSkippedText = function (trivia, indentThisTrivia, result) {
            if (indentThisTrivia) {
                result.push(this.indentationTrivia);
            }

            result.push(trivia);
        };

        SyntaxIndenter.prototype.indentMultiLineComment = function (trivia, indentThisTrivia, result) {
            if (indentThisTrivia) {
                result.push(this.indentationTrivia);
            }

            var segments = TypeScript.Syntax.splitMultiLineCommentTriviaIntoMultipleLines(trivia);

            for (var i = 1; i < segments.length; i++) {
                segments[i] = this.indentSegment(segments[i]);
            }

            var newText = segments.join("");
            result.push(TypeScript.Syntax.multiLineComment(newText));
        };

        SyntaxIndenter.indentNode = function (node, indentFirstToken, indentAmount, options) {
            var indenter = new SyntaxIndenter(indentFirstToken, indentAmount, options);
            return node.accept(indenter);
        };

        SyntaxIndenter.indentNodes = function (nodes, indentFirstToken, indentAmount, options) {
            var indenter = new SyntaxIndenter(indentFirstToken, indentAmount, options);
            var result = TypeScript.ArrayUtilities.select(nodes, function (n) {
                return n.accept(indenter);
            });

            return result;
        };
        return SyntaxIndenter;
    })(TypeScript.SyntaxRewriter);
    TypeScript.SyntaxIndenter = SyntaxIndenter;
})(TypeScript || (TypeScript = {}));
