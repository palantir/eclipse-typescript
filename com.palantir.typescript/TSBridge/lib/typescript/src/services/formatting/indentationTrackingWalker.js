var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var IndentationTrackingWalker = (function (_super) {
            __extends(IndentationTrackingWalker, _super);
            function IndentationTrackingWalker(textSpan, sourceUnit, snapshot, indentFirstToken, options) {
                _super.call(this);
                this.options = options;
                this._position = 0;
                this._parent = null;

                this._indentationNodeContextPool = new Formatting.IndentationNodeContextPool();

                this._textSpan = textSpan;
                this._snapshot = snapshot;
                this._parent = this._indentationNodeContextPool.getNode(null, sourceUnit, 0, 0, 0);

                this._lastTriviaWasNewLine = indentFirstToken;
            }
            IndentationTrackingWalker.prototype.position = function () {
                return this._position;
            };

            IndentationTrackingWalker.prototype.parent = function () {
                return this._parent;
            };

            IndentationTrackingWalker.prototype.textSpan = function () {
                return this._textSpan;
            };

            IndentationTrackingWalker.prototype.snapshot = function () {
                return this._snapshot;
            };

            IndentationTrackingWalker.prototype.indentationNodeContextPool = function () {
                return this._indentationNodeContextPool;
            };

            IndentationTrackingWalker.prototype.forceIndentNextToken = function (tokenStart) {
                this._lastTriviaWasNewLine = true;
                this.forceRecomputeIndentationOfParent(tokenStart, true);
            };

            IndentationTrackingWalker.prototype.forceSkipIndentingNextToken = function (tokenStart) {
                this._lastTriviaWasNewLine = false;
                this.forceRecomputeIndentationOfParent(tokenStart, false);
            };

            IndentationTrackingWalker.prototype.indentToken = function (token, indentationAmount, commentIndentationAmount) {
                throw TypeScript.Errors.abstract();
            };

            IndentationTrackingWalker.prototype.visitTokenInSpan = function (token) {
                if (this._lastTriviaWasNewLine) {
                    var indentationAmount = this.getTokenIndentationAmount(token);
                    var commentIndentationAmount = this.getCommentIndentationAmount(token);

                    this.indentToken(token, indentationAmount, commentIndentationAmount);
                }
            };

            IndentationTrackingWalker.prototype.visitToken = function (token) {
                var tokenSpan = new TypeScript.TextSpan(this._position, token.fullWidth());

                if (tokenSpan.intersectsWithTextSpan(this._textSpan)) {
                    this.visitTokenInSpan(token);

                    var trivia = token.trailingTrivia();
                    this._lastTriviaWasNewLine = token.hasTrailingNewLine() && trivia.syntaxTriviaAt(trivia.count() - 1).kind() == TypeScript.SyntaxKind.NewLineTrivia;
                }

                this._position += token.fullWidth();
            };

            IndentationTrackingWalker.prototype.visitNode = function (node) {
                var nodeSpan = new TypeScript.TextSpan(this._position, node.fullWidth());

                if (nodeSpan.intersectsWithTextSpan(this._textSpan)) {
                    var indentation = this.getNodeIndentation(node);

                    var currentParent = this._parent;
                    this._parent = this._indentationNodeContextPool.getNode(currentParent, node, this._position, indentation.indentationAmount, indentation.indentationAmountDelta);

                    node.accept(this);

                    this._indentationNodeContextPool.releaseNode(this._parent);
                    this._parent = currentParent;
                } else {
                    this._position += node.fullWidth();
                }
            };

            IndentationTrackingWalker.prototype.getTokenIndentationAmount = function (token) {
                if (this._parent.node().firstToken() === token || token.kind() === TypeScript.SyntaxKind.OpenBraceToken || token.kind() === TypeScript.SyntaxKind.CloseBraceToken || token.kind() === TypeScript.SyntaxKind.OpenBracketToken || token.kind() === TypeScript.SyntaxKind.CloseBracketToken || (token.kind() === TypeScript.SyntaxKind.WhileKeyword && this._parent.node().kind() == TypeScript.SyntaxKind.DoStatement)) {
                    return this._parent.indentationAmount();
                }

                return (this._parent.indentationAmount() + this._parent.childIndentationAmountDelta());
            };

            IndentationTrackingWalker.prototype.getCommentIndentationAmount = function (token) {
                if (token.kind() === TypeScript.SyntaxKind.CloseBraceToken || token.kind() === TypeScript.SyntaxKind.CloseBracketToken) {
                    return (this._parent.indentationAmount() + this._parent.childIndentationAmountDelta());
                }
                return this._parent.indentationAmount();
            };

            IndentationTrackingWalker.prototype.getNodeIndentation = function (node, newLineInsertedByFormatting) {
                var parent = this._parent.node();

                var parentIndentationAmount;
                if (this._textSpan.containsPosition(this._parent.start())) {
                    parentIndentationAmount = this._parent.indentationAmount();
                } else {
                    var line = this._snapshot.getLineFromPosition(this._parent.start()).getText();
                    var firstNonWhiteSpacePosition = TypeScript.Indentation.firstNonWhitespacePosition(line);
                    parentIndentationAmount = TypeScript.Indentation.columnForPositionInString(line, firstNonWhiteSpacePosition, this.options);
                }
                var parentIndentationAmountDelta = this._parent.childIndentationAmountDelta();

                var indentationAmount;

                var indentationAmountDelta;

                switch (node.kind()) {
                    default:
                        indentationAmount = (parentIndentationAmount + parentIndentationAmountDelta);
                        indentationAmountDelta = 0;
                        break;

                    case TypeScript.SyntaxKind.ClassDeclaration:
                    case TypeScript.SyntaxKind.ModuleDeclaration:
                    case TypeScript.SyntaxKind.ObjectType:
                    case TypeScript.SyntaxKind.EnumDeclaration:
                    case TypeScript.SyntaxKind.SwitchStatement:
                    case TypeScript.SyntaxKind.ObjectLiteralExpression:
                    case TypeScript.SyntaxKind.ConstructorDeclaration:
                    case TypeScript.SyntaxKind.FunctionDeclaration:
                    case TypeScript.SyntaxKind.FunctionExpression:
                    case TypeScript.SyntaxKind.MemberFunctionDeclaration:
                    case TypeScript.SyntaxKind.GetMemberAccessorDeclaration:
                    case TypeScript.SyntaxKind.SetMemberAccessorDeclaration:
                    case TypeScript.SyntaxKind.CatchClause:

                    case TypeScript.SyntaxKind.ArrayLiteralExpression:
                    case TypeScript.SyntaxKind.ArrayType:
                    case TypeScript.SyntaxKind.ElementAccessExpression:
                    case TypeScript.SyntaxKind.IndexSignature:

                    case TypeScript.SyntaxKind.ForStatement:
                    case TypeScript.SyntaxKind.ForInStatement:
                    case TypeScript.SyntaxKind.WhileStatement:
                    case TypeScript.SyntaxKind.DoStatement:
                    case TypeScript.SyntaxKind.WithStatement:
                    case TypeScript.SyntaxKind.CaseSwitchClause:
                    case TypeScript.SyntaxKind.DefaultSwitchClause:
                    case TypeScript.SyntaxKind.ReturnStatement:
                    case TypeScript.SyntaxKind.ThrowStatement:
                    case TypeScript.SyntaxKind.SimpleArrowFunctionExpression:
                    case TypeScript.SyntaxKind.ParenthesizedArrowFunctionExpression:
                    case TypeScript.SyntaxKind.VariableDeclaration:
                    case TypeScript.SyntaxKind.ExportAssignment:

                    case TypeScript.SyntaxKind.InvocationExpression:
                    case TypeScript.SyntaxKind.ObjectCreationExpression:
                    case TypeScript.SyntaxKind.CallSignature:
                    case TypeScript.SyntaxKind.ConstructSignature:
                        indentationAmount = (parentIndentationAmount + parentIndentationAmountDelta);
                        indentationAmountDelta = this.options.indentSpaces;
                        break;

                    case TypeScript.SyntaxKind.IfStatement:
                        if (parent.kind() === TypeScript.SyntaxKind.ElseClause && !(parent).elseKeyword.hasTrailingNewLine() && !(node).ifKeyword.hasLeadingNewLine()) {
                            indentationAmount = parentIndentationAmount;
                        } else {
                            indentationAmount = (parentIndentationAmount + parentIndentationAmountDelta);
                        }
                        indentationAmountDelta = this.options.indentSpaces;
                        break;

                    case TypeScript.SyntaxKind.ElseClause:
                        indentationAmount = parentIndentationAmount;
                        indentationAmountDelta = this.options.indentSpaces;
                        break;

                    case TypeScript.SyntaxKind.Block:
                        switch (parent.kind()) {
                            case TypeScript.SyntaxKind.SourceUnit:
                            case TypeScript.SyntaxKind.ModuleDeclaration:
                            case TypeScript.SyntaxKind.Block:
                            case TypeScript.SyntaxKind.CaseSwitchClause:
                            case TypeScript.SyntaxKind.DefaultSwitchClause:
                                indentationAmount = parentIndentationAmount + parentIndentationAmountDelta;
                                break;

                            default:
                                indentationAmount = parentIndentationAmount;
                                break;
                        }

                        indentationAmountDelta = this.options.indentSpaces;
                        break;
                }

                if (parent) {
                    if (!newLineInsertedByFormatting) {
                        var parentStartLine = this._snapshot.getLineNumberFromPosition(this._parent.start());
                        var currentNodeStartLine = this._snapshot.getLineNumberFromPosition(this._position + node.leadingTriviaWidth());
                        if (parentStartLine === currentNodeStartLine || newLineInsertedByFormatting === false) {
                            indentationAmount = parentIndentationAmount;
                            indentationAmountDelta = Math.min(this.options.indentSpaces, parentIndentationAmountDelta + indentationAmountDelta);
                        }
                    }
                }

                return {
                    indentationAmount: indentationAmount,
                    indentationAmountDelta: indentationAmountDelta
                };
            };

            IndentationTrackingWalker.prototype.forceRecomputeIndentationOfParent = function (tokenStart, newLineAdded) {
                var parent = this._parent;
                if (parent.fullStart() === tokenStart) {
                    var indentation = this.getNodeIndentation(parent.node(), newLineAdded);
                    parent.update(parent.parent(), parent.node(), parent.fullStart(), indentation.indentationAmount, indentation.indentationAmountDelta);
                }
            };
            return IndentationTrackingWalker;
        })(TypeScript.SyntaxWalker);
        Formatting.IndentationTrackingWalker = IndentationTrackingWalker;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
