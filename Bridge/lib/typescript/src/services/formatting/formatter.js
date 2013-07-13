var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var Formatter = (function (_super) {
            __extends(Formatter, _super);
            function Formatter(textSpan, sourceUnit, indentFirstToken, options, snapshot, rulesProvider, formattingRequestKind) {
                _super.call(this, textSpan, sourceUnit, snapshot, indentFirstToken, options);
                this.previousTokenSpan = null;
                this.previousTokenParent = null;
                this.scriptHasErrors = false;

                this.previousTokenParent = this.parent().clone(this.indentationNodeContextPool());

                this.rulesProvider = rulesProvider;
                this.formattingRequestKind = formattingRequestKind;
                this.formattingContext = new Formatting.FormattingContext(this.snapshot(), this.formattingRequestKind);
            }
            Formatter.getEdits = function (textSpan, sourceUnit, options, indentFirstToken, snapshot, rulesProvider, formattingRequestKind) {
                var walker = new Formatter(textSpan, sourceUnit, indentFirstToken, options, snapshot, rulesProvider, formattingRequestKind);
                sourceUnit.accept(walker);
                return walker.edits();
            };

            Formatter.prototype.visitTokenInSpan = function (token) {
                if (token.fullWidth() !== 0) {
                    var tokenSpan = new TypeScript.TextSpan(this.position() + token.leadingTriviaWidth(), token.width());
                    if (this.textSpan().containsTextSpan(tokenSpan)) {
                        this.processToken(token);
                    }
                }

                _super.prototype.visitTokenInSpan.call(this, token);
            };

            Formatter.prototype.processToken = function (token) {
                var position = this.position();

                if (token.leadingTriviaWidth() !== 0) {
                    this.processTrivia(token.leadingTrivia(), position);
                    position += token.leadingTriviaWidth();
                }

                if (token.kind() !== TypeScript.SyntaxKind.EndOfFileToken) {
                    var currentTokenSpan = new Formatting.TokenSpan(token.kind(), position, token.width());
                    if (this.previousTokenSpan && !this.parent().hasSkippedOrMissingTokenChild()) {
                        this.formatPair(this.previousTokenSpan, this.previousTokenParent, currentTokenSpan, this.parent());
                    }
                    this.previousTokenSpan = currentTokenSpan;
                    if (this.previousTokenParent) {
                        this.indentationNodeContextPool().releaseNode(this.previousTokenParent, true);
                    }
                    this.previousTokenParent = this.parent().clone(this.indentationNodeContextPool());
                    position += token.width();

                    if (token.trailingTriviaWidth() !== 0) {
                        this.processTrivia(token.trailingTrivia(), position);
                    }
                }
            };

            Formatter.prototype.processTrivia = function (triviaList, fullStart) {
                var position = fullStart;

                for (var i = 0, n = triviaList.count(); i < n; i++) {
                    var trivia = triviaList.syntaxTriviaAt(i);

                    if (trivia.isComment() || trivia.isSkippedToken()) {
                        var currentTokenSpan = new Formatting.TokenSpan(trivia.kind(), position, trivia.fullWidth());
                        if (this.previousTokenSpan && trivia.isComment()) {
                            this.formatPair(this.previousTokenSpan, this.previousTokenParent, currentTokenSpan, this.parent());
                        }
                        this.previousTokenSpan = currentTokenSpan;
                        if (this.previousTokenParent) {
                            this.indentationNodeContextPool().releaseNode(this.previousTokenParent, true);
                        }
                        this.previousTokenParent = this.parent().clone(this.indentationNodeContextPool());
                    }

                    position += trivia.fullWidth();
                }
            };

            Formatter.prototype.findCommonParents = function (parent1, parent2) {
                var shallowParent;
                var shallowParentDepth;
                var deepParent;
                var deepParentDepth;

                if (parent1.depth() < parent2.depth()) {
                    shallowParent = parent1;
                    shallowParentDepth = parent1.depth();
                    deepParent = parent2;
                    deepParentDepth = parent2.depth();
                } else {
                    shallowParent = parent2;
                    shallowParentDepth = parent2.depth();
                    deepParent = parent1;
                    deepParentDepth = parent1.depth();
                }

                TypeScript.Debug.assert(shallowParentDepth >= 0, "Expected shallowParentDepth >= 0");
                TypeScript.Debug.assert(deepParentDepth >= 0, "Expected deepParentDepth >= 0");
                TypeScript.Debug.assert(deepParentDepth >= shallowParentDepth, "Expected deepParentDepth >= shallowParentDepth");

                while (deepParentDepth > shallowParentDepth) {
                    deepParent = deepParent.parent();
                    deepParentDepth--;
                }

                TypeScript.Debug.assert(deepParentDepth === shallowParentDepth, "Expected deepParentDepth === shallowParentDepth");

                while (deepParent.node() && shallowParent.node()) {
                    if (deepParent.node() === shallowParent.node()) {
                        return deepParent;
                    }
                    deepParent = deepParent.parent();
                    shallowParent = shallowParent.parent();
                }

                throw TypeScript.Errors.invalidOperation();
            };

            Formatter.prototype.formatPair = function (t1, t1Parent, t2, t2Parent) {
                var token1Line = this.getLineNumber(t1);
                var token2Line = this.getLineNumber(t2);

                var commonParent = this.findCommonParents(t1Parent, t2Parent);

                this.formattingContext.updateContext(t1, t1Parent, t2, t2Parent, commonParent);

                var rule = this.rulesProvider.getRulesMap().GetRule(this.formattingContext);

                if (rule != null) {
                    this.RecordRuleEdits(rule, t1, t2);

                    if ((rule.Operation.Action == Formatting.RuleAction.Space || rule.Operation.Action == Formatting.RuleAction.Delete) && token1Line != token2Line) {
                        this.forceSkipIndentingNextToken(t2.start());
                    }

                    if (rule.Operation.Action == Formatting.RuleAction.NewLine && token1Line == token2Line) {
                        this.forceIndentNextToken(t2.start());
                    }
                }

                if (token1Line != token2Line) {
                    this.TrimWhitespaceInLineRange(t1, token1Line, token2Line - 1);
                }
            };

            Formatter.prototype.getLineNumber = function (token) {
                return this.snapshot().getLineNumberFromPosition(token.start());
            };

            Formatter.prototype.TrimWhitespaceInLineRange = function (token, startLine, endLine) {
                for (var lineNumber = startLine; lineNumber <= endLine; ++lineNumber) {
                    var line = this.snapshot().getLineFromLineNumber(lineNumber);

                    this.TrimWhitespace2(token, line);
                }
            };

            Formatter.prototype.TrimWhitespace = function (token) {
                var line = this.snapshot().getLineFromPosition(token.start());
                this.TrimWhitespace2(token, line);
            };

            Formatter.prototype.TrimWhitespace2 = function (token, line) {
                if ((token.kind() == TypeScript.SyntaxKind.MultiLineCommentTrivia || token.kind() == TypeScript.SyntaxKind.SingleLineCommentTrivia) && token.start() <= line.endPosition() && token.end() >= line.endPosition())
                    return;

                var text = line.getText();
                var index = 0;

                for (index = text.length - 1; index >= 0; --index) {
                    if (!TypeScript.CharacterInfo.isWhitespace(text.charCodeAt(index))) {
                        break;
                    }
                }

                ++index;

                if (index < text.length) {
                    this.recordEdit(line.startPosition() + index, line.length() - index, "");
                }
            };

            Formatter.prototype.RecordRuleEdits = function (rule, t1, t2) {
                if (rule.Operation.Action == Formatting.RuleAction.Ignore) {
                    return;
                }

                var betweenSpan;

                switch (rule.Operation.Action) {
                    case Formatting.RuleAction.Delete:
                         {
                            betweenSpan = new TypeScript.TextSpan(t1.end(), t2.start() - t1.end());

                            if (betweenSpan.length() > 0) {
                                this.recordEdit(betweenSpan.start(), betweenSpan.length(), "");
                                return;
                            }
                        }
                        break;

                    case Formatting.RuleAction.NewLine:
                         {
                            if (rule.Flag == Formatting.RuleFlags.CanDeleteNewLines) {
                                betweenSpan = new TypeScript.TextSpan(t1.end(), t1.start() - t1.end());
                            } else {
                                var lengthBetween;
                                if (this.getLineNumber(t1) == this.getLineNumber(t2)) {
                                    lengthBetween = t2.start() - t1.end();
                                } else {
                                    lengthBetween = this.snapshot().getLineFromPosition(t1.end()).endIncludingLineBreakPosition() - t1.end();
                                }

                                betweenSpan = new TypeScript.TextSpan(t1.end(), Math.max(0, lengthBetween));
                            }

                            var doEdit = false;
                            var betweenText = this.snapshot().getText(betweenSpan);

                            var lineFeedLoc = betweenText.indexOf(this.options.newLineCharacter);
                            if (lineFeedLoc < 0) {
                                doEdit = true;
                            } else {
                                lineFeedLoc = betweenText.indexOf(this.options.newLineCharacter, lineFeedLoc + 1);
                                if (lineFeedLoc >= 0) {
                                    doEdit = true;
                                }
                            }

                            if (doEdit) {
                                this.recordEdit(betweenSpan.start(), betweenSpan.length(), this.options.newLineCharacter);
                                return;
                            }
                        }
                        break;

                    case Formatting.RuleAction.Space:
                         {
                            if (rule.Flag == Formatting.RuleFlags.CanDeleteNewLines) {
                                betweenSpan = new TypeScript.TextSpan(t1.end(), t2.start() - t1.end());
                            } else {
                                if (this.getLineNumber(t1) == this.getLineNumber(t2)) {
                                    lengthBetween = t2.start() - t1.end();
                                } else {
                                    lengthBetween = this.snapshot().getLineFromPosition(t1.end()).endPosition() - t1.end();
                                }

                                betweenSpan = new TypeScript.TextSpan(t1.end(), Math.max(0, lengthBetween));
                            }

                            if (betweenSpan.length() > 1 || this.snapshot().getText(betweenSpan) != " ") {
                                this.recordEdit(betweenSpan.start(), betweenSpan.length(), " ");
                                return;
                            }
                        }
                        break;
                }
            };
            return Formatter;
        })(Formatting.MultipleTokenIndenter);
        Formatting.Formatter = Formatter;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
