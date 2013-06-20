var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var FormattingManager = (function () {
            function FormattingManager(syntaxTree, snapshot, rulesProvider, editorOptions) {
                this.syntaxTree = syntaxTree;
                this.snapshot = snapshot;
                this.rulesProvider = rulesProvider;
                this.options = new FormattingOptions(!editorOptions.ConvertTabsToSpaces, editorOptions.TabSize, editorOptions.IndentSize, editorOptions.NewLineCharacter);
            }
            FormattingManager.prototype.formatSelection = function (minChar, limChar) {
                var span = TypeScript.TextSpan.fromBounds(minChar, limChar);
                return this.formatSpan(span, Formatting.FormattingRequestKind.FormatSelection);
            };

            FormattingManager.prototype.formatDocument = function (minChar, limChar) {
                var span = TypeScript.TextSpan.fromBounds(minChar, limChar);
                return this.formatSpan(span, Formatting.FormattingRequestKind.FormatDocument);
            };

            FormattingManager.prototype.formatOnPaste = function (minChar, limChar) {
                var span = TypeScript.TextSpan.fromBounds(minChar, limChar);
                return this.formatSpan(span, Formatting.FormattingRequestKind.FormatOnPaste);
            };

            FormattingManager.prototype.formatOnSemicolon = function (caretPosition) {
                var sourceUnit = this.syntaxTree.sourceUnit();
                var semicolonPositionedToken = sourceUnit.findToken(caretPosition - 1);

                if (semicolonPositionedToken.kind() === TypeScript.SyntaxKind.SemicolonToken) {
                    var current = semicolonPositionedToken;
                    while (current.parent() !== null && current.parent().end() === semicolonPositionedToken.end() && current.parent().kind() !== TypeScript.SyntaxKind.List) {
                        current = current.parent();
                    }

                    var span = new TypeScript.TextSpan(current.fullStart(), current.fullWidth());

                    return this.formatSpan(span, Formatting.FormattingRequestKind.FormatOnSemicolon);
                }

                return [];
            };

            FormattingManager.prototype.formatOnClosingCurlyBrace = function (caretPosition) {
                var sourceUnit = this.syntaxTree.sourceUnit();
                var closeBracePositionedToken = sourceUnit.findToken(caretPosition - 1);

                if (closeBracePositionedToken.kind() === TypeScript.SyntaxKind.CloseBraceToken) {
                    var current = closeBracePositionedToken;
                    while (current.parent() !== null && current.parent().end() === closeBracePositionedToken.end() && current.parent().kind() !== TypeScript.SyntaxKind.List) {
                        current = current.parent();
                    }

                    var span = new TypeScript.TextSpan(current.fullStart(), current.fullWidth());

                    return this.formatSpan(span, Formatting.FormattingRequestKind.FormatOnClosingCurlyBrace);
                }

                return [];
            };

            FormattingManager.prototype.formatOnEnter = function (caretPosition) {
                var lineNumber = this.snapshot.getLineNumberFromPosition(caretPosition);

                if (lineNumber > 0) {
                    var prevLine = this.snapshot.getLineFromLineNumber(lineNumber - 1);
                    var currentLine = this.snapshot.getLineFromLineNumber(lineNumber);
                    var span = TypeScript.TextSpan.fromBounds(prevLine.startPosition(), currentLine.endPosition());

                    return this.formatSpan(span, Formatting.FormattingRequestKind.FormatOnEnter);
                }

                return [];
            };

            FormattingManager.prototype.formatSpan = function (span, formattingRequestKind) {
                var startLine = this.snapshot.getLineFromPosition(span.start());
                span = TypeScript.TextSpan.fromBounds(startLine.startPosition(), span.end());

                var result = [];

                var formattingEdits = Formatting.Formatter.getEdits(span, this.syntaxTree.sourceUnit(), this.options, true, this.snapshot, this.rulesProvider, formattingRequestKind);

                formattingEdits.forEach(function (item) {
                    var edit = new Services.TextEdit(item.position, item.position + item.length, item.replaceWith);
                    result.push(edit);
                });

                return result;
            };
            return FormattingManager;
        })();
        Formatting.FormattingManager = FormattingManager;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
