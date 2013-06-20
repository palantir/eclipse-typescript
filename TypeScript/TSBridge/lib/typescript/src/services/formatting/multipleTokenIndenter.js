var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var MultipleTokenIndenter = (function (_super) {
            __extends(MultipleTokenIndenter, _super);
            function MultipleTokenIndenter(textSpan, sourceUnit, snapshot, indentFirstToken, options) {
                _super.call(this, textSpan, sourceUnit, snapshot, indentFirstToken, options);
                this._edits = [];
            }
            MultipleTokenIndenter.prototype.indentToken = function (token, indentationAmount, commentIndentationAmount) {
                if (token.fullWidth() === 0) {
                    return;
                }

                if (this.parent().hasSkippedOrMissingTokenChild()) {
                    return;
                }

                var tokenSpan = new TypeScript.TextSpan(this.position() + token.leadingTriviaWidth(), token.width());
                if (!this.textSpan().containsTextSpan(tokenSpan)) {
                    return;
                }

                var indentationString = TypeScript.Indentation.indentationString(indentationAmount, this.options);

                var commentIndentationString = TypeScript.Indentation.indentationString(commentIndentationAmount, this.options);

                this.recordIndentationEditsForToken(token, indentationString, commentIndentationString);
            };

            MultipleTokenIndenter.prototype.edits = function () {
                return this._edits;
            };

            MultipleTokenIndenter.prototype.recordEdit = function (position, length, replaceWith) {
                this._edits.push(new Formatting.TextEditInfo(position, length, replaceWith));
            };

            MultipleTokenIndenter.prototype.recordIndentationEditsForToken = function (token, indentationString, commentIndentationString) {
                var position = this.position();
                var indentNextTokenOrTrivia = true;
                var leadingWhiteSpace = "";

                var triviaList = token.leadingTrivia();
                if (triviaList) {
                    for (var i = 0, length = triviaList.count(); i < length; i++) {
                        var trivia = triviaList.syntaxTriviaAt(i);

                        switch (trivia.kind()) {
                            case TypeScript.SyntaxKind.MultiLineCommentTrivia:
                                this.recordIndentationEditsForMultiLineComment(trivia, position, commentIndentationString, leadingWhiteSpace, !indentNextTokenOrTrivia);
                                indentNextTokenOrTrivia = false;
                                leadingWhiteSpace = "";
                                break;

                            case TypeScript.SyntaxKind.SingleLineCommentTrivia:
                            case TypeScript.SyntaxKind.SkippedTokenTrivia:
                                if (indentNextTokenOrTrivia) {
                                    this.recordIndentationEditsForSingleLineOrSkippedText(trivia, position, commentIndentationString);
                                    indentNextTokenOrTrivia = false;
                                }
                                break;

                            case TypeScript.SyntaxKind.WhitespaceTrivia:
                                var nextTriviaIsComment = triviaList.count() > i + 1 && triviaList.syntaxTriviaAt(i + 1).isComment();
                                if (indentNextTokenOrTrivia) {
                                    this.recordIndentationEditsForWhitespace(trivia, position, nextTriviaIsComment ? commentIndentationString : indentationString);
                                    indentNextTokenOrTrivia = false;
                                }
                                leadingWhiteSpace += trivia.fullText();
                                break;

                            case TypeScript.SyntaxKind.NewLineTrivia:
                                indentNextTokenOrTrivia = true;
                                leadingWhiteSpace = "";
                                break;

                            default:
                                throw TypeScript.Errors.invalidOperation();
                        }

                        position += trivia.fullWidth();
                    }
                }

                if (token.kind() !== TypeScript.SyntaxKind.EndOfFileToken && indentNextTokenOrTrivia) {
                    if (indentationString.length > 0) {
                        this.recordEdit(position, 0, indentationString);
                    }
                }
            };

            MultipleTokenIndenter.prototype.recordIndentationEditsForSingleLineOrSkippedText = function (trivia, fullStart, indentationString) {
                if (indentationString.length > 0) {
                    this.recordEdit(fullStart, 0, indentationString);
                }
            };

            MultipleTokenIndenter.prototype.recordIndentationEditsForWhitespace = function (trivia, fullStart, indentationString) {
                var text = trivia.fullText();

                if (indentationString === text) {
                    return;
                }

                this.recordEdit(fullStart, text.length, indentationString);
            };

            MultipleTokenIndenter.prototype.recordIndentationEditsForMultiLineComment = function (trivia, fullStart, indentationString, leadingWhiteSpace, firstLineAlreadyIndented) {
                var position = fullStart;
                var segments = TypeScript.Syntax.splitMultiLineCommentTriviaIntoMultipleLines(trivia);

                if (segments.length <= 1) {
                    if (!firstLineAlreadyIndented) {
                        this.recordIndentationEditsForSingleLineOrSkippedText(trivia, fullStart, indentationString);
                    }
                    return;
                }

                var whiteSpaceColumnsInFirstSegment = TypeScript.Indentation.columnForPositionInString(leadingWhiteSpace, leadingWhiteSpace.length, this.options);

                var indentationColumns = TypeScript.Indentation.columnForPositionInString(indentationString, indentationString.length, this.options);
                var startIndex = 0;
                if (firstLineAlreadyIndented) {
                    startIndex = 1;
                    position += segments[0].length;
                }
                for (var i = startIndex; i < segments.length; i++) {
                    var segment = segments[i];
                    this.recordIndentationEditsForSegment(segment, position, indentationColumns, whiteSpaceColumnsInFirstSegment);
                    position += segment.length;
                }
            };

            MultipleTokenIndenter.prototype.recordIndentationEditsForSegment = function (segment, fullStart, indentationColumns, whiteSpaceColumnsInFirstSegment) {
                var firstNonWhitespacePosition = TypeScript.Indentation.firstNonWhitespacePosition(segment);
                var leadingWhiteSpaceColumns = TypeScript.Indentation.columnForPositionInString(segment, firstNonWhitespacePosition, this.options);
                var deltaFromFirstSegment = leadingWhiteSpaceColumns - whiteSpaceColumnsInFirstSegment;
                var finalColumns = indentationColumns + deltaFromFirstSegment;
                if (finalColumns < 0) {
                    finalColumns = 0;
                }
                var indentationString = TypeScript.Indentation.indentationString(finalColumns, this.options);

                if (firstNonWhitespacePosition < segment.length && TypeScript.CharacterInfo.isLineTerminator(segment.charCodeAt(firstNonWhitespacePosition))) {
                    return;
                }

                if (indentationString === segment.substring(0, firstNonWhitespacePosition)) {
                    return;
                }

                this.recordEdit(fullStart, firstNonWhitespacePosition, indentationString);
            };
            return MultipleTokenIndenter;
        })(Formatting.IndentationTrackingWalker);
        Formatting.MultipleTokenIndenter = MultipleTokenIndenter;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
