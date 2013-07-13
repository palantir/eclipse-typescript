var TypeScript;
(function (TypeScript) {
    (function (Indentation) {
        function columnForEndOfToken(token, syntaxInformationMap, options) {
            return columnForStartOfToken(token, syntaxInformationMap, options) + token.width();
        }
        Indentation.columnForEndOfToken = columnForEndOfToken;

        function columnForStartOfToken(token, syntaxInformationMap, options) {
            var firstTokenInLine = syntaxInformationMap.firstTokenInLineContainingToken(token);
            var leadingTextInReverse = [];

            var current = token;
            while (current !== firstTokenInLine) {
                current = syntaxInformationMap.previousToken(current);

                if (current === firstTokenInLine) {
                    leadingTextInReverse.push(current.trailingTrivia().fullText());
                    leadingTextInReverse.push(current.text());
                } else {
                    leadingTextInReverse.push(current.fullText());
                }
            }

            collectLeadingTriviaTextToStartOfLine(firstTokenInLine, leadingTextInReverse);

            return columnForLeadingTextInReverse(leadingTextInReverse, options);
        }
        Indentation.columnForStartOfToken = columnForStartOfToken;

        function columnForStartOfFirstTokenInLineContainingToken(token, syntaxInformationMap, options) {
            var firstTokenInLine = syntaxInformationMap.firstTokenInLineContainingToken(token);
            var leadingTextInReverse = [];

            collectLeadingTriviaTextToStartOfLine(firstTokenInLine, leadingTextInReverse);

            return columnForLeadingTextInReverse(leadingTextInReverse, options);
        }
        Indentation.columnForStartOfFirstTokenInLineContainingToken = columnForStartOfFirstTokenInLineContainingToken;

        function collectLeadingTriviaTextToStartOfLine(firstTokenInLine, leadingTextInReverse) {
            var leadingTrivia = firstTokenInLine.leadingTrivia();

            for (var i = leadingTrivia.count() - 1; i >= 0; i--) {
                var trivia = leadingTrivia.syntaxTriviaAt(i);
                if (trivia.kind() === TypeScript.SyntaxKind.NewLineTrivia) {
                    break;
                }

                if (trivia.kind() === TypeScript.SyntaxKind.MultiLineCommentTrivia) {
                    var lineSegments = TypeScript.Syntax.splitMultiLineCommentTriviaIntoMultipleLines(trivia);
                    leadingTextInReverse.push(TypeScript.ArrayUtilities.last(lineSegments));

                    if (lineSegments.length > 0) {
                        break;
                    }
                }

                leadingTextInReverse.push(trivia.fullText());
            }
        }

        function columnForLeadingTextInReverse(leadingTextInReverse, options) {
            var column = 0;

            for (var i = leadingTextInReverse.length - 1; i >= 0; i--) {
                var text = leadingTextInReverse[i];
                column = columnForPositionInStringWorker(text, text.length, column, options);
            }

            return column;
        }

        function columnForPositionInString(input, position, options) {
            return columnForPositionInStringWorker(input, position, 0, options);
        }
        Indentation.columnForPositionInString = columnForPositionInString;

        function columnForPositionInStringWorker(input, position, startColumn, options) {
            var column = startColumn;
            var spacesPerTab = options.spacesPerTab;

            for (var j = 0; j < position; j++) {
                var ch = input.charCodeAt(j);

                if (ch === TypeScript.CharacterCodes.tab) {
                    column += spacesPerTab - column % spacesPerTab;
                } else {
                    column++;
                }
            }

            return column;
        }

        function indentationString(column, options) {
            var numberOfTabs = 0;
            var numberOfSpaces = TypeScript.MathPrototype.max(0, column);

            if (options.useTabs) {
                numberOfTabs = Math.floor(column / options.spacesPerTab);
                numberOfSpaces -= numberOfTabs * options.spacesPerTab;
            }

            return TypeScript.StringUtilities.repeat('\t', numberOfTabs) + TypeScript.StringUtilities.repeat(' ', numberOfSpaces);
        }
        Indentation.indentationString = indentationString;

        function indentationTrivia(column, options) {
            return TypeScript.Syntax.whitespace(this.indentationString(column, options));
        }
        Indentation.indentationTrivia = indentationTrivia;

        function firstNonWhitespacePosition(value) {
            for (var i = 0; i < value.length; i++) {
                var ch = value.charCodeAt(i);
                if (!TypeScript.CharacterInfo.isWhitespace(ch)) {
                    return i;
                }
            }

            return value.length;
        }
        Indentation.firstNonWhitespacePosition = firstNonWhitespacePosition;
    })(TypeScript.Indentation || (TypeScript.Indentation = {}));
    var Indentation = TypeScript.Indentation;
})(TypeScript || (TypeScript = {}));
