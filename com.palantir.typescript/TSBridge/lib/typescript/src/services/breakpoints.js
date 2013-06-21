var Services;
(function (Services) {
    (function (Breakpoints) {
        function createBreakpointSpanInfo(parentElement) {
            var childElements = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                childElements[_i] = arguments[_i + 1];
            }
            if (!parentElement) {
                return null;
            }

            if (childElements.length == 0) {
                return new Services.SpanInfo(parentElement.start(), parentElement.end());
            }

            var start;
            var end;
            for (var i = 0; i < childElements.length; i++) {
                var element = childElements[i];
                if (element) {
                    if (start == undefined) {
                        start = parentElement.childStart(element);
                    }
                    end = parentElement.childEnd(element);
                }
            }

            return new Services.SpanInfo(start, end);
        }

        function createBreakpointSpanInfoWithLimChar(startElement, limChar) {
            return new Services.SpanInfo(startElement.start(), limChar);
        }

        var BreakpointResolver = (function () {
            function BreakpointResolver(posLine, lineMap) {
                this.posLine = posLine;
                this.lineMap = lineMap;
            }
            BreakpointResolver.prototype.breakpointSpanOfToken = function (positionedToken) {
                switch (positionedToken.token().tokenKind) {
                    case TypeScript.SyntaxKind.OpenBraceToken:
                        return this.breakpointSpanOfOpenBrace(positionedToken);

                    case TypeScript.SyntaxKind.CloseBraceToken:
                        return this.breakpointSpanOfCloseBrace(positionedToken);

                    case TypeScript.SyntaxKind.CommaToken:
                        return this.breakpointSpanOfComma(positionedToken);

                    case TypeScript.SyntaxKind.SemicolonToken:
                    case TypeScript.SyntaxKind.EndOfFileToken:
                        return this.breakpointSpanIfStartsOnSameLine(positionedToken.previousToken());

                    case TypeScript.SyntaxKind.CloseParenToken:
                        return this.breakpointSpanOfCloseParen(positionedToken);

                    case TypeScript.SyntaxKind.DoKeyword:
                        var parentElement = positionedToken.parent();
                        if (parentElement && parentElement.kind() == TypeScript.SyntaxKind.DoStatement) {
                            return this.breakpointSpanIfStartsOnSameLine(positionedToken.nextToken());
                        }
                        break;
                }

                return this.breakpointSpanOfContainingNode(positionedToken);
            };

            BreakpointResolver.prototype.breakpointSpanOfOpenBrace = function (openBraceToken) {
                var container = openBraceToken.containingNode();
                if (container) {
                    var originalContainer = container;
                    if (container && container.kind() == TypeScript.SyntaxKind.Block) {
                        container = container.containingNode();
                        if (!container) {
                            container = originalContainer;
                        }
                    }

                    switch (container.kind()) {
                        case TypeScript.SyntaxKind.Block:
                            if (!this.canHaveBreakpointInBlock(container)) {
                                return null();
                            }
                            return this.breakpointSpanOfFirstStatementInBlock(container);
                            break;

                        case TypeScript.SyntaxKind.ModuleDeclaration:
                        case TypeScript.SyntaxKind.ClassDeclaration:
                        case TypeScript.SyntaxKind.FunctionDeclaration:
                        case TypeScript.SyntaxKind.ConstructorDeclaration:
                        case TypeScript.SyntaxKind.MemberFunctionDeclaration:
                        case TypeScript.SyntaxKind.GetMemberAccessorDeclaration:
                        case TypeScript.SyntaxKind.SetMemberAccessorDeclaration:
                        case TypeScript.SyntaxKind.FunctionExpression:
                            if (!this.canHaveBreakpointInDeclaration(container)) {
                                return null;
                            }
                            if (this.posLine != this.lineMap.getLineNumberFromPosition(container.start())) {
                                return this.breakpointSpanOfFirstChildOfSyntaxList(this.getSyntaxListOfDeclarationWithElements(container));
                            } else {
                                return this.breakpointSpanOf(container);
                            }

                        case TypeScript.SyntaxKind.EnumDeclaration:
                            if (!this.canHaveBreakpointInDeclaration(container)) {
                                return null;
                            }
                            if (this.posLine != this.lineMap.getLineNumberFromPosition(container.start())) {
                                return this.breakpointSpanOfFirstEnumElement(container);
                            } else {
                                return this.breakpointSpanOf(container);
                            }

                        case TypeScript.SyntaxKind.IfStatement:
                        case TypeScript.SyntaxKind.ForInStatement:
                        case TypeScript.SyntaxKind.WhileStatement:
                        case TypeScript.SyntaxKind.CatchClause:
                            if (this.posLine != this.lineMap.getLineNumberFromPosition(container.start())) {
                                return this.breakpointSpanOfFirstStatementInBlock(originalContainer);
                            } else {
                                return this.breakpointSpanOf(container);
                            }

                        case TypeScript.SyntaxKind.DoStatement:
                            return this.breakpointSpanOfFirstStatementInBlock(originalContainer);

                        case TypeScript.SyntaxKind.ForStatement:
                            if (this.posLine != this.lineMap.getLineNumberFromPosition(container.start())) {
                                return this.breakpointSpanOfFirstStatementInBlock(originalContainer);
                            } else {
                                return this.breakpointSpanOf(openBraceToken.previousToken());
                            }

                        case TypeScript.SyntaxKind.ElseClause:
                        case TypeScript.SyntaxKind.CaseSwitchClause:
                        case TypeScript.SyntaxKind.DefaultSwitchClause:
                        case TypeScript.SyntaxKind.WithStatement:
                        case TypeScript.SyntaxKind.TryStatement:
                        case TypeScript.SyntaxKind.FinallyClause:
                            return this.breakpointSpanOfFirstStatementInBlock(originalContainer);

                        case TypeScript.SyntaxKind.SwitchStatement:
                            if (this.posLine != this.lineMap.getLineNumberFromPosition(container.start())) {
                                return this.breakpointSpanOfFirstStatementOfFirstCaseClause(container);
                            } else {
                                return this.breakpointSpanOf(container);
                            }
                    }
                }

                return null;
            };

            BreakpointResolver.prototype.breakpointSpanOfCloseBrace = function (closeBraceToken) {
                var container = closeBraceToken.containingNode();
                if (container) {
                    var originalContainer = container;
                    if (container.kind() == TypeScript.SyntaxKind.Block) {
                        container = container.containingNode();
                        if (!container) {
                            container = originalContainer;
                        }
                    }

                    switch (container.kind()) {
                        case TypeScript.SyntaxKind.Block:
                            if (!this.canHaveBreakpointInBlock(container)) {
                                return null();
                            }
                            return this.breakpointSpanOfLastStatementInBlock(container);
                            break;

                        case TypeScript.SyntaxKind.ModuleDeclaration:
                            if (!this.canHaveBreakpointInDeclaration(container)) {
                                return null;
                            }
                            var moduleSyntax = container.node();
                            if (moduleSyntax.moduleElements && moduleSyntax.moduleElements.childCount() > 0) {
                                return createBreakpointSpanInfo(closeBraceToken);
                            } else {
                                return null;
                            }

                        case TypeScript.SyntaxKind.ClassDeclaration:
                        case TypeScript.SyntaxKind.FunctionDeclaration:
                        case TypeScript.SyntaxKind.ConstructorDeclaration:
                        case TypeScript.SyntaxKind.MemberFunctionDeclaration:
                        case TypeScript.SyntaxKind.GetMemberAccessorDeclaration:
                        case TypeScript.SyntaxKind.SetMemberAccessorDeclaration:
                        case TypeScript.SyntaxKind.FunctionExpression:
                            if (!this.canHaveBreakpointInDeclaration(container)) {
                                return null;
                            }
                            return createBreakpointSpanInfo(closeBraceToken);

                        case TypeScript.SyntaxKind.EnumDeclaration:
                            if (!this.canHaveBreakpointInDeclaration(container)) {
                                return null;
                            }
                            return createBreakpointSpanInfo(closeBraceToken);

                        case TypeScript.SyntaxKind.IfStatement:
                        case TypeScript.SyntaxKind.ElseClause:
                        case TypeScript.SyntaxKind.ForInStatement:
                        case TypeScript.SyntaxKind.ForStatement:
                        case TypeScript.SyntaxKind.WhileStatement:
                        case TypeScript.SyntaxKind.DoStatement:
                        case TypeScript.SyntaxKind.CaseSwitchClause:
                        case TypeScript.SyntaxKind.DefaultSwitchClause:
                        case TypeScript.SyntaxKind.WithStatement:
                        case TypeScript.SyntaxKind.TryStatement:
                        case TypeScript.SyntaxKind.CatchClause:
                        case TypeScript.SyntaxKind.FinallyClause:
                            return this.breakpointSpanOfLastStatementInBlock(originalContainer);

                        case TypeScript.SyntaxKind.SwitchStatement:
                            return this.breakpointSpanOfLastStatementOfLastCaseClause(container);
                    }
                }

                return null;
            };

            BreakpointResolver.prototype.breakpointSpanOfComma = function (commaToken) {
                var commaParent = commaToken.parent();
                if (commaParent && commaParent.element().isSeparatedList()) {
                    var grandParent = commaParent.parent();
                    if (grandParent) {
                        switch (grandParent.kind()) {
                            case TypeScript.SyntaxKind.VariableDeclaration:
                            case TypeScript.SyntaxKind.EnumDeclaration:
                            case TypeScript.SyntaxKind.ParameterList:
                                var index = commaParent.childIndex(commaToken.token());

                                if (index > 0) {
                                    var child = commaParent.childAt(index - 1);
                                    return this.breakpointSpanOf(child);
                                }

                                if (grandParent.kind() == TypeScript.SyntaxKind.EnumDeclaration) {
                                    return null;
                                }
                                break;
                        }
                    }
                }

                return this.breakpointSpanOfContainingNode(commaToken);
            };

            BreakpointResolver.prototype.breakpointSpanOfCloseParen = function (closeParenToken) {
                var closeParenParent = closeParenToken.parent();
                if (closeParenParent) {
                    switch (closeParenParent.kind()) {
                        case TypeScript.SyntaxKind.ForStatement:
                        case TypeScript.SyntaxKind.ParameterList:
                            return this.breakpointSpanOf(closeParenToken.previousToken());
                    }
                }

                return this.breakpointSpanOfContainingNode(closeParenToken);
            };

            BreakpointResolver.prototype.canHaveBreakpointInBlock = function (blockNode) {
                if (!blockNode || TypeScript.SyntaxUtilities.isAmbientDeclarationSyntax(blockNode)) {
                    return false;
                }

                var blockSyntax = blockNode.node();
                return blockSyntax.statements && blockSyntax.statements.childCount() != 0;
            };

            BreakpointResolver.prototype.breakpointSpanOfFirstStatementInBlock = function (blockNode) {
                if (!blockNode) {
                    return null;
                }

                var blockSyntax = blockNode.node();
                var statementsNode = blockNode.getPositionedChild(blockSyntax.statements);
                if (!statementsNode || statementsNode.childCount() == 0) {
                    return null;
                }

                var firstStatement = statementsNode.childAt(0);
                if (firstStatement && firstStatement.kind() == TypeScript.SyntaxKind.Block) {
                    if (this.canHaveBreakpointInBlock(firstStatement)) {
                        return this.breakpointSpanOfFirstStatementInBlock(firstStatement);
                    }
                    return null;
                } else {
                    return this.breakpointSpanOf(firstStatement);
                }
            };

            BreakpointResolver.prototype.breakpointSpanOfLastStatementInBlock = function (blockNode) {
                if (!blockNode) {
                    return null;
                }

                var blockSyntax = blockNode.node();
                var statementsNode = blockNode.getPositionedChild(blockSyntax.statements);
                if (!statementsNode || statementsNode.childCount() == 0) {
                    return null;
                }

                var lastStatement = statementsNode.childAt(statementsNode.childCount() - 1);
                if (lastStatement && lastStatement.kind() == TypeScript.SyntaxKind.Block) {
                    if (this.canHaveBreakpointInBlock(lastStatement)) {
                        return this.breakpointSpanOfLastStatementInBlock(lastStatement);
                    }
                    return null;
                } else {
                    return this.breakpointSpanOf(lastStatement);
                }
            };

            BreakpointResolver.prototype.breakpointSpanOfFirstChildOfSyntaxList = function (positionedList) {
                if (!positionedList) {
                    return null;
                }

                var listSyntax = positionedList.list();
                if (listSyntax.childCount() == 0) {
                    return null;
                }

                var firstStatement = positionedList.childAt(0);
                if (firstStatement && firstStatement.kind() == TypeScript.SyntaxKind.Block) {
                    if (this.canHaveBreakpointInBlock(firstStatement)) {
                        return this.breakpointSpanOfFirstStatementInBlock(firstStatement);
                    }

                    return null;
                } else {
                    return this.breakpointSpanOf(firstStatement);
                }
            };

            BreakpointResolver.prototype.breakpointSpanOfLastChildOfSyntaxList = function (positionedList) {
                if (!positionedList) {
                    return null;
                }

                var listSyntax = positionedList.list();
                if (listSyntax.childCount() == 0) {
                    return null;
                }
                var lastStatement = positionedList.childAt(0);
                if (lastStatement && lastStatement.kind() == TypeScript.SyntaxKind.Block) {
                    if (this.canHaveBreakpointInBlock(lastStatement)) {
                        return this.breakpointSpanOfLastStatementInBlock(lastStatement);
                    }
                    return null;
                } else {
                    return this.breakpointSpanOf(lastStatement);
                }
            };

            BreakpointResolver.prototype.breakpointSpanOfNode = function (positionedNode) {
                var node = positionedNode.node();
                switch (node.kind()) {
                    case TypeScript.SyntaxKind.ModuleDeclaration:
                    case TypeScript.SyntaxKind.ClassDeclaration:
                    case TypeScript.SyntaxKind.FunctionDeclaration:
                    case TypeScript.SyntaxKind.ConstructorDeclaration:
                    case TypeScript.SyntaxKind.MemberFunctionDeclaration:
                    case TypeScript.SyntaxKind.GetMemberAccessorDeclaration:
                    case TypeScript.SyntaxKind.SetMemberAccessorDeclaration:
                        return this.breakpointSpanOfDeclarationWithElements(positionedNode);

                    case TypeScript.SyntaxKind.VariableDeclarator:
                        return this.breakpointSpanOfVariableDeclarator(positionedNode);

                    case TypeScript.SyntaxKind.VariableDeclaration:
                        return this.breakpointSpanOfVariableDeclaration(positionedNode);

                    case TypeScript.SyntaxKind.VariableStatement:
                        return this.breakpointSpanOfVariableStatement(positionedNode);

                    case TypeScript.SyntaxKind.Parameter:
                        return this.breakpointSpanOfParameter(positionedNode);

                    case TypeScript.SyntaxKind.MemberVariableDeclaration:
                        return this.breakpointSpanOfMemberVariableDeclaration(positionedNode);

                    case TypeScript.SyntaxKind.ImportDeclaration:
                        return this.breakpointSpanOfImportDeclaration(positionedNode);

                    case TypeScript.SyntaxKind.EnumDeclaration:
                        return this.breakpointSpanOfEnumDeclaration(positionedNode);

                    case TypeScript.SyntaxKind.EnumElement:
                        return this.breakpointSpanOfEnumElement(positionedNode);

                    case TypeScript.SyntaxKind.IfStatement:
                        return this.breakpointSpanOfIfStatement(positionedNode);
                    case TypeScript.SyntaxKind.ElseClause:
                        return this.breakpointSpanOfElseClause(positionedNode);
                    case TypeScript.SyntaxKind.ForInStatement:
                        return this.breakpointSpanOfForInStatement(positionedNode);
                    case TypeScript.SyntaxKind.ForStatement:
                        return this.breakpointSpanOfForStatement(positionedNode);
                    case TypeScript.SyntaxKind.WhileStatement:
                        return this.breakpointSpanOfWhileStatement(positionedNode);
                    case TypeScript.SyntaxKind.DoStatement:
                        return this.breakpointSpanOfDoStatement(positionedNode);
                    case TypeScript.SyntaxKind.SwitchStatement:
                        return this.breakpointSpanOfSwitchStatement(positionedNode);
                    case TypeScript.SyntaxKind.CaseSwitchClause:
                        return this.breakpointSpanOfCaseSwitchClause(positionedNode);
                    case TypeScript.SyntaxKind.DefaultSwitchClause:
                        return this.breakpointSpanOfDefaultSwitchClause(positionedNode);
                    case TypeScript.SyntaxKind.WithStatement:
                        return this.breakpointSpanOfWithStatement(positionedNode);
                    case TypeScript.SyntaxKind.TryStatement:
                        return this.breakpointSpanOfTryStatement(positionedNode);
                    case TypeScript.SyntaxKind.CatchClause:
                        return this.breakpointSpanOfCatchClause(positionedNode);
                    case TypeScript.SyntaxKind.FinallyClause:
                        return this.breakpointSpanOfFinallyClause(positionedNode);

                    default:
                        if (node.isStatement()) {
                            return this.breakpointSpanOfStatement(positionedNode);
                        } else {
                            return this.breakpointOfExpression(positionedNode);
                        }
                }
            };

            BreakpointResolver.prototype.isInitializerOfForStatement = function (expressionNode) {
                if (!expressionNode) {
                    return false;
                }

                var expressionParent = expressionNode.parent();
                if (expressionParent && expressionParent.kind() == TypeScript.SyntaxKind.ForStatement) {
                    var expression = expressionNode.element();
                    var forStatement = expressionParent.element();
                    var initializer = expressionParent.getPositionedChild(forStatement.initializer);
                    return initializer && initializer.element() == expression;
                } else if (expressionParent && expressionParent.kind() == TypeScript.SyntaxKind.CommaExpression) {
                    return this.isInitializerOfForStatement(expressionParent);
                }

                return false;
            };

            BreakpointResolver.prototype.isConditionOfForStatement = function (expressionNode) {
                if (!expressionNode) {
                    return false;
                }

                var expressionParent = expressionNode.parent();
                if (expressionParent && expressionParent.kind() == TypeScript.SyntaxKind.ForStatement) {
                    var expression = expressionNode.element();
                    var forStatement = expressionParent.element();
                    var condition = expressionParent.getPositionedChild(forStatement.condition);
                    return condition && condition.element() == expression;
                } else if (expressionParent && expressionParent.kind() == TypeScript.SyntaxKind.CommaExpression) {
                    return this.isConditionOfForStatement(expressionParent);
                }

                return false;
            };

            BreakpointResolver.prototype.isIncrememtorOfForStatement = function (expressionNode) {
                if (!expressionNode) {
                    return false;
                }

                var expressionParent = expressionNode.parent();
                if (expressionParent && expressionParent.kind() == TypeScript.SyntaxKind.ForStatement) {
                    var expression = expressionNode.element();
                    var forStatement = expressionParent.element();
                    var incrementor = expressionParent.getPositionedChild(forStatement.incrementor);
                    return incrementor && incrementor.element() == expression;
                } else if (expressionParent && expressionParent.kind() == TypeScript.SyntaxKind.CommaExpression) {
                    return this.isIncrememtorOfForStatement(expressionParent);
                }

                return false;
            };

            BreakpointResolver.prototype.breakpointOfLeftOfCommaExpression = function (commaExpressionNode) {
                var commaExpression = commaExpressionNode.node();
                return this.breakpointSpanOf(commaExpressionNode.getPositionedChild(commaExpression.left));
            };

            BreakpointResolver.prototype.breakpointOfExpression = function (expressionNode) {
                if (this.isInitializerOfForStatement(expressionNode) || this.isConditionOfForStatement(expressionNode) || this.isIncrememtorOfForStatement(expressionNode)) {
                    if (expressionNode.kind() == TypeScript.SyntaxKind.CommaExpression) {
                        return this.breakpointOfLeftOfCommaExpression(expressionNode);
                    }
                    return createBreakpointSpanInfo(expressionNode);
                }

                if (expressionNode.kind() == TypeScript.SyntaxKind.ExportAssignment) {
                    var exportAssignmentSyntax = expressionNode.node();
                    return createBreakpointSpanInfo(expressionNode, exportAssignmentSyntax.exportKeyword, exportAssignmentSyntax.equalsToken, exportAssignmentSyntax.identifier);
                }

                return this.breakpointSpanOfContainingNode(expressionNode);
            };

            BreakpointResolver.prototype.breakpointSpanOfStatement = function (statementNode) {
                var statement = statementNode.node();
                if (statement.kind() == TypeScript.SyntaxKind.EmptyStatement) {
                    return null;
                }

                var containingNode = statementNode.containingNode();
                if (containingNode && containingNode.node().isStatement()) {
                    var useNodeForBreakpoint = false;
                    switch (containingNode.kind()) {
                        case TypeScript.SyntaxKind.ModuleDeclaration:
                        case TypeScript.SyntaxKind.ClassDeclaration:
                        case TypeScript.SyntaxKind.FunctionDeclaration:
                        case TypeScript.SyntaxKind.ConstructorDeclaration:
                        case TypeScript.SyntaxKind.MemberFunctionDeclaration:
                        case TypeScript.SyntaxKind.GetMemberAccessorDeclaration:
                        case TypeScript.SyntaxKind.SetMemberAccessorDeclaration:
                        case TypeScript.SyntaxKind.Block:

                        case TypeScript.SyntaxKind.IfStatement:
                        case TypeScript.SyntaxKind.ElseClause:
                        case TypeScript.SyntaxKind.ForInStatement:
                        case TypeScript.SyntaxKind.ForStatement:
                        case TypeScript.SyntaxKind.WhileStatement:
                        case TypeScript.SyntaxKind.DoStatement:
                        case TypeScript.SyntaxKind.SwitchStatement:
                        case TypeScript.SyntaxKind.CaseSwitchClause:
                        case TypeScript.SyntaxKind.DefaultSwitchClause:
                        case TypeScript.SyntaxKind.WithStatement:
                        case TypeScript.SyntaxKind.TryStatement:
                        case TypeScript.SyntaxKind.CatchClause:
                        case TypeScript.SyntaxKind.FinallyClause:
                        case TypeScript.SyntaxKind.Block:
                            useNodeForBreakpoint = true;
                    }

                    if (!useNodeForBreakpoint) {
                        return this.breakpointSpanOfContainingNode(statementNode);
                    }
                }

                switch (statement.kind()) {
                    case TypeScript.SyntaxKind.ExpressionStatement:
                        var expressionSyntax = statement;
                        return createBreakpointSpanInfo(statementNode.getPositionedChild(expressionSyntax.expression));

                    case TypeScript.SyntaxKind.ReturnStatement:
                        var returnStatementSyntax = statement;
                        return createBreakpointSpanInfo(statementNode, returnStatementSyntax.returnKeyword, returnStatementSyntax.expression);

                    case TypeScript.SyntaxKind.ThrowStatement:
                        var throwStatementSyntax = statement;
                        return createBreakpointSpanInfo(statementNode, throwStatementSyntax.throwKeyword, throwStatementSyntax.expression);

                    case TypeScript.SyntaxKind.BreakStatement:
                        var breakStatementSyntax = statement;
                        return createBreakpointSpanInfo(statementNode, breakStatementSyntax.breakKeyword, breakStatementSyntax.identifier);

                    case TypeScript.SyntaxKind.ContinueStatement:
                        var continueStatementSyntax = statement;
                        return createBreakpointSpanInfo(statementNode, continueStatementSyntax.continueKeyword, continueStatementSyntax.identifier);

                    case TypeScript.SyntaxKind.DebuggerStatement:
                        var debuggerStatementSyntax = statement;
                        return createBreakpointSpanInfo(statementNode.getPositionedChild(debuggerStatementSyntax.debuggerKeyword));

                    case TypeScript.SyntaxKind.LabeledStatement:
                        var labeledStatementSyntax = statement;
                        return this.breakpointSpanOf(statementNode.getPositionedChild(labeledStatementSyntax.statement));
                }

                return null;
            };

            BreakpointResolver.prototype.getSyntaxListOfDeclarationWithElements = function (positionedNode) {
                var node = positionedNode.node();
                var elementsList;
                var block;
                switch (node.kind()) {
                    case TypeScript.SyntaxKind.ModuleDeclaration:
                        elementsList = (node).moduleElements;
                        break;

                    case TypeScript.SyntaxKind.ClassDeclaration:
                        elementsList = (node).classElements;
                        break;

                    case TypeScript.SyntaxKind.FunctionDeclaration:
                        block = (node).block;
                        break;

                    case TypeScript.SyntaxKind.ConstructorDeclaration:
                        block = (node).block;
                        break;

                    case TypeScript.SyntaxKind.MemberFunctionDeclaration:
                        block = (node).block;
                        break;

                    case TypeScript.SyntaxKind.GetMemberAccessorDeclaration:
                        block = (node).block;
                        break;

                    case TypeScript.SyntaxKind.SetMemberAccessorDeclaration:
                        block = (node).block;
                        break;

                    case TypeScript.SyntaxKind.FunctionExpression:
                        block = (node).block;
                        break;

                    default:
                        throw TypeScript.Errors.argument('positionNode', 'unknown node kind in getSyntaxListOfDeclarationWithElements');
                }

                var parentElement = positionedNode;
                if (block) {
                    parentElement = positionedNode.getPositionedChild(block);
                    elementsList = block.statements;
                }

                return parentElement.getPositionedChild(elementsList);
            };

            BreakpointResolver.prototype.canHaveBreakpointInDeclaration = function (positionedNode) {
                return positionedNode && !TypeScript.SyntaxUtilities.isAmbientDeclarationSyntax(positionedNode);
            };

            BreakpointResolver.prototype.breakpointSpanOfDeclarationWithElements = function (positionedNode) {
                if (!this.canHaveBreakpointInDeclaration(positionedNode)) {
                    return null;
                }

                var node = positionedNode.node();
                var moduleSyntax = positionedNode.node();
                if ((node.isModuleElement() && positionedNode.containingNode().kind() != TypeScript.SyntaxKind.SourceUnit) || node.isClassElement() || (moduleSyntax.kind() == TypeScript.SyntaxKind.ModuleDeclaration && moduleSyntax.moduleName && moduleSyntax.moduleName.kind() == TypeScript.SyntaxKind.QualifiedName)) {
                    return createBreakpointSpanInfo(positionedNode);
                } else {
                    return this.breakpointSpanOfFirstChildOfSyntaxList(this.getSyntaxListOfDeclarationWithElements(positionedNode));
                }
            };

            BreakpointResolver.prototype.canHaveBreakpointInVariableDeclarator = function (varDeclaratorNode) {
                if (!varDeclaratorNode || TypeScript.SyntaxUtilities.isAmbientDeclarationSyntax(varDeclaratorNode)) {
                    return false;
                }

                var varDeclaratorSyntax = varDeclaratorNode.node();
                return !!varDeclaratorSyntax.equalsValueClause;
            };

            BreakpointResolver.prototype.breakpointSpanOfVariableDeclarator = function (varDeclaratorNode) {
                if (!this.canHaveBreakpointInVariableDeclarator(varDeclaratorNode)) {
                    return null;
                }

                var container = varDeclaratorNode.containingNode();
                if (container && container.kind() == TypeScript.SyntaxKind.VariableDeclaration) {
                    var parentDeclaratorsList = varDeclaratorNode.parent();

                    if (parentDeclaratorsList && parentDeclaratorsList.list().childAt(0) == varDeclaratorNode.node()) {
                        return this.breakpointSpanOfVariableDeclaration(container);
                    }

                    if (this.canHaveBreakpointInVariableDeclarator(varDeclaratorNode)) {
                        return createBreakpointSpanInfo(varDeclaratorNode);
                    } else {
                        return null;
                    }
                } else if (container) {
                    return this.breakpointSpanOfMemberVariableDeclaration(container);
                }

                return null;
            };

            BreakpointResolver.prototype.canHaveBreakpointInVariableDeclaration = function (varDeclarationNode) {
                if (!varDeclarationNode || TypeScript.SyntaxUtilities.isAmbientDeclarationSyntax(varDeclarationNode)) {
                    return false;
                }

                var varDeclarationSyntax = varDeclarationNode.node();
                var containerChildren = varDeclarationNode.getPositionedChild(varDeclarationSyntax.variableDeclarators);
                if (!containerChildren || containerChildren.childCount() == 0) {
                    return false;
                }

                var child = containerChildren.childAt(0);
                if (child && child.element().isNode()) {
                    return this.canHaveBreakpointInVariableDeclarator(containerChildren.childAt(0));
                }

                return false;
            };

            BreakpointResolver.prototype.breakpointSpanOfVariableDeclaration = function (varDeclarationNode) {
                if (!this.canHaveBreakpointInDeclaration(varDeclarationNode)) {
                    return null;
                }

                var container = varDeclarationNode.containingNode();
                var varDeclarationSyntax = varDeclarationNode.node();
                var varDeclarators = varDeclarationNode.getPositionedChild(varDeclarationSyntax.variableDeclarators);
                var varDeclaratorsCount = varDeclarators.childCount();

                if (container && container.kind() == TypeScript.SyntaxKind.VariableStatement) {
                    return this.breakpointSpanOfVariableStatement(container);
                }

                if (this.canHaveBreakpointInVariableDeclaration(varDeclarationNode)) {
                    return createBreakpointSpanInfoWithLimChar(varDeclarationNode, varDeclarators.childEndAt(0));
                } else {
                    return null;
                }
            };

            BreakpointResolver.prototype.canHaveBreakpointInVariableStatement = function (varStatementNode) {
                if (!varStatementNode || TypeScript.SyntaxUtilities.isAmbientDeclarationSyntax(varStatementNode)) {
                    return false;
                }

                var variableStatement = varStatementNode.node();
                return this.canHaveBreakpointInVariableDeclaration(varStatementNode.getPositionedChild(variableStatement.variableDeclaration));
            };

            BreakpointResolver.prototype.breakpointSpanOfVariableStatement = function (varStatementNode) {
                if (!this.canHaveBreakpointInVariableStatement(varStatementNode)) {
                    return null;
                }

                var variableStatement = varStatementNode.node();
                var variableDeclaration = varStatementNode.getPositionedChild(variableStatement.variableDeclaration);
                var varDeclarationSyntax = variableDeclaration.node();
                var varDeclarators = variableDeclaration.getPositionedChild(varDeclarationSyntax.variableDeclarators);
                return createBreakpointSpanInfoWithLimChar(varStatementNode, varDeclarators.childEndAt(0));
            };

            BreakpointResolver.prototype.breakpointSpanOfParameter = function (parameterNode) {
                if (TypeScript.SyntaxUtilities.isAmbientDeclarationSyntax(parameterNode)) {
                    return null;
                }

                var parameterSyntax = parameterNode.node();
                if (parameterSyntax.dotDotDotToken || parameterSyntax.equalsValueClause || parameterSyntax.publicOrPrivateKeyword) {
                    return createBreakpointSpanInfo(parameterNode);
                } else {
                    return null;
                }
            };

            BreakpointResolver.prototype.breakpointSpanOfMemberVariableDeclaration = function (memberVarDeclarationNode) {
                if (TypeScript.SyntaxUtilities.isAmbientDeclarationSyntax(memberVarDeclarationNode)) {
                    return null;
                }

                var memberVariableDeclaration = memberVarDeclarationNode.node();
                if (this.canHaveBreakpointInVariableDeclarator(memberVarDeclarationNode.getPositionedChild(memberVariableDeclaration.variableDeclarator))) {
                    return createBreakpointSpanInfo(memberVarDeclarationNode);
                } else {
                    return null;
                }
            };

            BreakpointResolver.prototype.breakpointSpanOfImportDeclaration = function (importDeclarationNode) {
                if (TypeScript.SyntaxUtilities.isAmbientDeclarationSyntax(importDeclarationNode)) {
                    return null;
                }

                var importSyntax = importDeclarationNode.node();
                return createBreakpointSpanInfo(importDeclarationNode, importSyntax.importKeyword, importSyntax.identifier, importSyntax.equalsToken, importSyntax.moduleReference);
            };

            BreakpointResolver.prototype.breakpointSpanOfEnumDeclaration = function (enumDeclarationNode) {
                if (!this.canHaveBreakpointInDeclaration(enumDeclarationNode)) {
                    return null;
                }

                return createBreakpointSpanInfo(enumDeclarationNode);
            };

            BreakpointResolver.prototype.breakpointSpanOfFirstEnumElement = function (enumDeclarationNode) {
                var enumDeclarationSyntax = enumDeclarationNode.node();
                var enumElements = enumDeclarationNode.getPositionedChild(enumDeclarationSyntax.enumElements);
                if (enumElements && enumElements.childCount()) {
                    return this.breakpointSpanOf(enumElements.childAt(0));
                }

                return null;
            };

            BreakpointResolver.prototype.breakpointSpanOfEnumElement = function (enumElementNode) {
                if (TypeScript.SyntaxUtilities.isAmbientDeclarationSyntax(enumElementNode)) {
                    return null;
                }

                return createBreakpointSpanInfo(enumElementNode);
            };

            BreakpointResolver.prototype.breakpointSpanOfIfStatement = function (ifStatementNode) {
                var ifStatement = ifStatementNode.node();
                return createBreakpointSpanInfo(ifStatementNode, ifStatement.ifKeyword, ifStatement.openParenToken, ifStatement.condition, ifStatement.closeParenToken);
            };

            BreakpointResolver.prototype.breakpointSpanOfElseClause = function (elseClauseNode) {
                var elseClause = elseClauseNode.node();
                return this.breakpointSpanOf(elseClauseNode.getPositionedChild(elseClause.statement));
            };

            BreakpointResolver.prototype.breakpointSpanOfForInStatement = function (forInStatementNode) {
                var forInStatement = forInStatementNode.node();
                return createBreakpointSpanInfo(forInStatementNode, forInStatement.forKeyword, forInStatement.openParenToken, forInStatement.variableDeclaration, forInStatement.left, forInStatement.inKeyword, forInStatement.expression, forInStatement.closeParenToken);
            };

            BreakpointResolver.prototype.breakpointSpanOfForStatement = function (forStatementNode) {
                var forStatement = forStatementNode.node();
                return this.breakpointSpanOf(forStatementNode.getPositionedChild(forStatement.variableDeclaration ? forStatement.variableDeclaration : forStatement.initializer));
            };

            BreakpointResolver.prototype.breakpointSpanOfWhileStatement = function (whileStatementNode) {
                var whileStatement = whileStatementNode.node();
                return createBreakpointSpanInfo(whileStatementNode, whileStatement.whileKeyword, whileStatement.openParenToken, whileStatement.condition, whileStatement.closeParenToken);
            };

            BreakpointResolver.prototype.breakpointSpanOfDoStatement = function (doStatementNode) {
                var doStatement = doStatementNode.node();
                return createBreakpointSpanInfo(doStatementNode, doStatement.whileKeyword, doStatement.openParenToken, doStatement.condition, doStatement.closeParenToken);
            };

            BreakpointResolver.prototype.breakpointSpanOfSwitchStatement = function (switchStatementNode) {
                var switchStatement = switchStatementNode.node();
                return createBreakpointSpanInfo(switchStatementNode, switchStatement.switchKeyword, switchStatement.openParenToken, switchStatement.expression, switchStatement.closeParenToken);
            };

            BreakpointResolver.prototype.breakpointSpanOfFirstStatementOfFirstCaseClause = function (switchStatementNode) {
                var switchStatement = switchStatementNode.node();
                if (switchStatement.switchClauses && switchStatement.switchClauses.childCount() == 0) {
                    return null;
                }

                var switchClauses = switchStatementNode.getPositionedChild(switchStatement.switchClauses);
                if (switchClauses.childCount() == 0) {
                    return null;
                }

                var firstCaseClause = switchClauses.childAt(0);
                var statements = null;
                if (firstCaseClause && firstCaseClause.kind() == TypeScript.SyntaxKind.CaseSwitchClause) {
                    var caseClause = firstCaseClause.node();
                    statements = caseClause.statements;
                } else if (firstCaseClause && firstCaseClause.kind() == TypeScript.SyntaxKind.DefaultSwitchClause) {
                    var defaultClause = firstCaseClause.node();
                    statements = defaultClause.statements;
                } else {
                    return null;
                }

                return this.breakpointSpanOfFirstChildOfSyntaxList(firstCaseClause.getPositionedChild(statements));
            };

            BreakpointResolver.prototype.breakpointSpanOfLastStatementOfLastCaseClause = function (switchStatementNode) {
                var switchStatement = switchStatementNode.node();
                if (switchStatement.switchClauses && switchStatement.switchClauses.childCount() == 0) {
                    return null;
                }

                var switchClauses = switchStatementNode.getPositionedChild(switchStatement.switchClauses);
                if (switchClauses.childCount() == 0) {
                    return null;
                }

                var lastClauseNode = switchClauses.childAt(switchClauses.childCount() - 1);
                var statements = null;
                if (lastClauseNode && lastClauseNode.kind() == TypeScript.SyntaxKind.CaseSwitchClause) {
                    var caseClause = lastClauseNode.node();
                    statements = caseClause.statements;
                } else if (lastClauseNode && lastClauseNode.kind() == TypeScript.SyntaxKind.DefaultSwitchClause) {
                    var defaultClause = lastClauseNode.node();
                    statements = defaultClause.statements;
                } else {
                    return null;
                }

                return this.breakpointSpanOfLastChildOfSyntaxList(lastClauseNode.getPositionedChild(statements));
            };

            BreakpointResolver.prototype.breakpointSpanOfCaseSwitchClause = function (caseClauseNode) {
                var caseSwitchClause = caseClauseNode.node();
                return this.breakpointSpanOfFirstChildOfSyntaxList(caseClauseNode.getPositionedChild(caseSwitchClause.statements));
            };

            BreakpointResolver.prototype.breakpointSpanOfDefaultSwitchClause = function (defaultSwithClauseNode) {
                var defaultSwitchClause = defaultSwithClauseNode.node();
                return this.breakpointSpanOfFirstChildOfSyntaxList(defaultSwithClauseNode.getPositionedChild(defaultSwitchClause.statements));
            };

            BreakpointResolver.prototype.breakpointSpanOfWithStatement = function (withStatementNode) {
                var withStatement = withStatementNode.node();
                return this.breakpointSpanOf(withStatementNode.getPositionedChild(withStatement.statement));
            };

            BreakpointResolver.prototype.breakpointSpanOfTryStatement = function (tryStatementNode) {
                var tryStatement = tryStatementNode.node();
                return this.breakpointSpanOfFirstStatementInBlock(tryStatementNode.getPositionedChild(tryStatement.block));
            };

            BreakpointResolver.prototype.breakpointSpanOfCatchClause = function (catchClauseNode) {
                var catchClause = catchClauseNode.node();
                return createBreakpointSpanInfo(catchClauseNode, catchClause.catchKeyword, catchClause.openParenToken, catchClause.identifier, catchClause.typeAnnotation, catchClause.closeParenToken);
            };

            BreakpointResolver.prototype.breakpointSpanOfFinallyClause = function (finallyClauseNode) {
                var finallyClause = finallyClauseNode.node();
                return this.breakpointSpanOfFirstStatementInBlock(finallyClauseNode.getPositionedChild(finallyClause.block));
            };

            BreakpointResolver.prototype.breakpointSpanOfContainingNode = function (positionedElement) {
                return this.breakpointSpanOf(positionedElement.containingNode());
            };

            BreakpointResolver.prototype.breakpointSpanIfStartsOnSameLine = function (positionedElement) {
                if (positionedElement && this.posLine == this.lineMap.getLineNumberFromPosition(positionedElement.start())) {
                    return this.breakpointSpanOf(positionedElement);
                }

                return null;
            };

            BreakpointResolver.prototype.breakpointSpanOf = function (positionedElement) {
                if (!positionedElement) {
                    return null;
                }

                for (var containingNode = positionedElement.containingNode(); containingNode != null; containingNode = containingNode.containingNode()) {
                    if (containingNode.kind() == TypeScript.SyntaxKind.TypeAnnotation) {
                        return this.breakpointSpanIfStartsOnSameLine(containingNode);
                    }
                }

                var element = positionedElement.element();

                if (element.isNode()) {
                    return this.breakpointSpanOfNode(positionedElement);
                }

                if (element.isToken()) {
                    return this.breakpointSpanOfToken(positionedElement);
                }

                return this.breakpointSpanOfContainingNode(positionedElement);
            };
            return BreakpointResolver;
        })();

        function getBreakpointLocation(syntaxTree, askedPos) {
            if (TypeScript.isDTSFile(syntaxTree.fileName())) {
                return null;
            }

            var sourceUnit = syntaxTree.sourceUnit();
            var positionedToken = sourceUnit.findToken(askedPos);

            var lineMap = syntaxTree.lineMap();
            var posLine = lineMap.getLineNumberFromPosition(askedPos);
            var tokenStartLine = lineMap.getLineNumberFromPosition(positionedToken.start());
            if (posLine < tokenStartLine) {
                return null;
            }

            var breakpointResolver = new BreakpointResolver(posLine, lineMap);
            return breakpointResolver.breakpointSpanOf(positionedToken);
        }
        Breakpoints.getBreakpointLocation = getBreakpointLocation;
    })(Services.Breakpoints || (Services.Breakpoints = {}));
    var Breakpoints = Services.Breakpoints;
})(Services || (Services = {}));
