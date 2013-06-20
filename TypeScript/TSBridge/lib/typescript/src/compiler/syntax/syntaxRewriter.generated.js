var TypeScript;
(function (TypeScript) {
    var SyntaxRewriter = (function () {
        function SyntaxRewriter() {
        }
        SyntaxRewriter.prototype.visitToken = function (token) {
            return token;
        };

        SyntaxRewriter.prototype.visitNode = function (node) {
            return node.accept(this);
        };

        SyntaxRewriter.prototype.visitNodeOrToken = function (node) {
            return node.isToken() ? this.visitToken(node) : this.visitNode(node);
        };

        SyntaxRewriter.prototype.visitList = function (list) {
            var newItems = null;

            for (var i = 0, n = list.childCount(); i < n; i++) {
                var item = list.childAt(i);
                var newItem = this.visitNodeOrToken(item);

                if (item !== newItem && newItems === null) {
                    newItems = [];
                    for (var j = 0; j < i; j++) {
                        newItems.push(list.childAt(j));
                    }
                }

                if (newItems) {
                    newItems.push(newItem);
                }
            }

            return newItems === null ? list : TypeScript.Syntax.list(newItems);
        };

        SyntaxRewriter.prototype.visitSeparatedList = function (list) {
            var newItems = null;

            for (var i = 0, n = list.childCount(); i < n; i++) {
                var item = list.childAt(i);
                var newItem = item.isToken() ? this.visitToken(item) : this.visitNode(item);

                if (item !== newItem && newItems === null) {
                    newItems = [];
                    for (var j = 0; j < i; j++) {
                        newItems.push(list.childAt(j));
                    }
                }

                if (newItems) {
                    newItems.push(newItem);
                }
            }

            return newItems === null ? list : TypeScript.Syntax.separatedList(newItems);
        };

        SyntaxRewriter.prototype.visitSourceUnit = function (node) {
            return node.update(this.visitList(node.moduleElements), this.visitToken(node.endOfFileToken));
        };

        SyntaxRewriter.prototype.visitExternalModuleReference = function (node) {
            return node.update(this.visitToken(node.moduleOrRequireKeyword), this.visitToken(node.openParenToken), this.visitToken(node.stringLiteral), this.visitToken(node.closeParenToken));
        };

        SyntaxRewriter.prototype.visitModuleNameModuleReference = function (node) {
            return node.update(this.visitNodeOrToken(node.moduleName));
        };

        SyntaxRewriter.prototype.visitImportDeclaration = function (node) {
            return node.update(this.visitToken(node.importKeyword), this.visitToken(node.identifier), this.visitToken(node.equalsToken), this.visitNode(node.moduleReference), this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitExportAssignment = function (node) {
            return node.update(this.visitToken(node.exportKeyword), this.visitToken(node.equalsToken), this.visitToken(node.identifier), this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitClassDeclaration = function (node) {
            return node.update(this.visitList(node.modifiers), this.visitToken(node.classKeyword), this.visitToken(node.identifier), node.typeParameterList === null ? null : this.visitNode(node.typeParameterList), this.visitList(node.heritageClauses), this.visitToken(node.openBraceToken), this.visitList(node.classElements), this.visitToken(node.closeBraceToken));
        };

        SyntaxRewriter.prototype.visitInterfaceDeclaration = function (node) {
            return node.update(this.visitList(node.modifiers), this.visitToken(node.interfaceKeyword), this.visitToken(node.identifier), node.typeParameterList === null ? null : this.visitNode(node.typeParameterList), this.visitList(node.heritageClauses), this.visitNode(node.body));
        };

        SyntaxRewriter.prototype.visitHeritageClause = function (node) {
            return node.update(this.visitToken(node.extendsOrImplementsKeyword), this.visitSeparatedList(node.typeNames));
        };

        SyntaxRewriter.prototype.visitModuleDeclaration = function (node) {
            return node.update(this.visitList(node.modifiers), this.visitToken(node.moduleKeyword), node.moduleName === null ? null : this.visitNodeOrToken(node.moduleName), node.stringLiteral === null ? null : this.visitToken(node.stringLiteral), this.visitToken(node.openBraceToken), this.visitList(node.moduleElements), this.visitToken(node.closeBraceToken));
        };

        SyntaxRewriter.prototype.visitFunctionDeclaration = function (node) {
            return node.update(this.visitList(node.modifiers), this.visitToken(node.functionKeyword), this.visitToken(node.identifier), this.visitNode(node.callSignature), node.block === null ? null : this.visitNode(node.block), node.semicolonToken === null ? null : this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitVariableStatement = function (node) {
            return node.update(this.visitList(node.modifiers), this.visitNode(node.variableDeclaration), this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitVariableDeclaration = function (node) {
            return node.update(this.visitToken(node.varKeyword), this.visitSeparatedList(node.variableDeclarators));
        };

        SyntaxRewriter.prototype.visitVariableDeclarator = function (node) {
            return node.update(this.visitToken(node.identifier), node.typeAnnotation === null ? null : this.visitNode(node.typeAnnotation), node.equalsValueClause === null ? null : this.visitNode(node.equalsValueClause));
        };

        SyntaxRewriter.prototype.visitEqualsValueClause = function (node) {
            return node.update(this.visitToken(node.equalsToken), this.visitNodeOrToken(node.value));
        };

        SyntaxRewriter.prototype.visitPrefixUnaryExpression = function (node) {
            return node.update(node.kind(), this.visitToken(node.operatorToken), this.visitNodeOrToken(node.operand));
        };

        SyntaxRewriter.prototype.visitArrayLiteralExpression = function (node) {
            return node.update(this.visitToken(node.openBracketToken), this.visitSeparatedList(node.expressions), this.visitToken(node.closeBracketToken));
        };

        SyntaxRewriter.prototype.visitOmittedExpression = function (node) {
            return node;
        };

        SyntaxRewriter.prototype.visitParenthesizedExpression = function (node) {
            return node.update(this.visitToken(node.openParenToken), this.visitNodeOrToken(node.expression), this.visitToken(node.closeParenToken));
        };

        SyntaxRewriter.prototype.visitSimpleArrowFunctionExpression = function (node) {
            return node.update(this.visitToken(node.identifier), this.visitToken(node.equalsGreaterThanToken), this.visitNodeOrToken(node.body));
        };

        SyntaxRewriter.prototype.visitParenthesizedArrowFunctionExpression = function (node) {
            return node.update(this.visitNode(node.callSignature), this.visitToken(node.equalsGreaterThanToken), this.visitNodeOrToken(node.body));
        };

        SyntaxRewriter.prototype.visitQualifiedName = function (node) {
            return node.update(this.visitNodeOrToken(node.left), this.visitToken(node.dotToken), this.visitToken(node.right));
        };

        SyntaxRewriter.prototype.visitTypeArgumentList = function (node) {
            return node.update(this.visitToken(node.lessThanToken), this.visitSeparatedList(node.typeArguments), this.visitToken(node.greaterThanToken));
        };

        SyntaxRewriter.prototype.visitConstructorType = function (node) {
            return node.update(this.visitToken(node.newKeyword), node.typeParameterList === null ? null : this.visitNode(node.typeParameterList), this.visitNode(node.parameterList), this.visitToken(node.equalsGreaterThanToken), this.visitNodeOrToken(node.type));
        };

        SyntaxRewriter.prototype.visitFunctionType = function (node) {
            return node.update(node.typeParameterList === null ? null : this.visitNode(node.typeParameterList), this.visitNode(node.parameterList), this.visitToken(node.equalsGreaterThanToken), this.visitNodeOrToken(node.type));
        };

        SyntaxRewriter.prototype.visitObjectType = function (node) {
            return node.update(this.visitToken(node.openBraceToken), this.visitSeparatedList(node.typeMembers), this.visitToken(node.closeBraceToken));
        };

        SyntaxRewriter.prototype.visitArrayType = function (node) {
            return node.update(this.visitNodeOrToken(node.type), this.visitToken(node.openBracketToken), this.visitToken(node.closeBracketToken));
        };

        SyntaxRewriter.prototype.visitGenericType = function (node) {
            return node.update(this.visitNodeOrToken(node.name), this.visitNode(node.typeArgumentList));
        };

        SyntaxRewriter.prototype.visitTypeAnnotation = function (node) {
            return node.update(this.visitToken(node.colonToken), this.visitNodeOrToken(node.type));
        };

        SyntaxRewriter.prototype.visitBlock = function (node) {
            return node.update(this.visitToken(node.openBraceToken), this.visitList(node.statements), this.visitToken(node.closeBraceToken));
        };

        SyntaxRewriter.prototype.visitParameter = function (node) {
            return node.update(node.dotDotDotToken === null ? null : this.visitToken(node.dotDotDotToken), node.publicOrPrivateKeyword === null ? null : this.visitToken(node.publicOrPrivateKeyword), this.visitToken(node.identifier), node.questionToken === null ? null : this.visitToken(node.questionToken), node.typeAnnotation === null ? null : this.visitNode(node.typeAnnotation), node.equalsValueClause === null ? null : this.visitNode(node.equalsValueClause));
        };

        SyntaxRewriter.prototype.visitMemberAccessExpression = function (node) {
            return node.update(this.visitNodeOrToken(node.expression), this.visitToken(node.dotToken), this.visitToken(node.name));
        };

        SyntaxRewriter.prototype.visitPostfixUnaryExpression = function (node) {
            return node.update(node.kind(), this.visitNodeOrToken(node.operand), this.visitToken(node.operatorToken));
        };

        SyntaxRewriter.prototype.visitElementAccessExpression = function (node) {
            return node.update(this.visitNodeOrToken(node.expression), this.visitToken(node.openBracketToken), this.visitNodeOrToken(node.argumentExpression), this.visitToken(node.closeBracketToken));
        };

        SyntaxRewriter.prototype.visitInvocationExpression = function (node) {
            return node.update(this.visitNodeOrToken(node.expression), this.visitNode(node.argumentList));
        };

        SyntaxRewriter.prototype.visitArgumentList = function (node) {
            return node.update(node.typeArgumentList === null ? null : this.visitNode(node.typeArgumentList), this.visitToken(node.openParenToken), this.visitSeparatedList(node.arguments), this.visitToken(node.closeParenToken));
        };

        SyntaxRewriter.prototype.visitBinaryExpression = function (node) {
            return node.update(node.kind(), this.visitNodeOrToken(node.left), this.visitToken(node.operatorToken), this.visitNodeOrToken(node.right));
        };

        SyntaxRewriter.prototype.visitConditionalExpression = function (node) {
            return node.update(this.visitNodeOrToken(node.condition), this.visitToken(node.questionToken), this.visitNodeOrToken(node.whenTrue), this.visitToken(node.colonToken), this.visitNodeOrToken(node.whenFalse));
        };

        SyntaxRewriter.prototype.visitConstructSignature = function (node) {
            return node.update(this.visitToken(node.newKeyword), this.visitNode(node.callSignature));
        };

        SyntaxRewriter.prototype.visitMethodSignature = function (node) {
            return node.update(this.visitToken(node.propertyName), node.questionToken === null ? null : this.visitToken(node.questionToken), this.visitNode(node.callSignature));
        };

        SyntaxRewriter.prototype.visitIndexSignature = function (node) {
            return node.update(this.visitToken(node.openBracketToken), this.visitNode(node.parameter), this.visitToken(node.closeBracketToken), node.typeAnnotation === null ? null : this.visitNode(node.typeAnnotation));
        };

        SyntaxRewriter.prototype.visitPropertySignature = function (node) {
            return node.update(this.visitToken(node.propertyName), node.questionToken === null ? null : this.visitToken(node.questionToken), node.typeAnnotation === null ? null : this.visitNode(node.typeAnnotation));
        };

        SyntaxRewriter.prototype.visitCallSignature = function (node) {
            return node.update(node.typeParameterList === null ? null : this.visitNode(node.typeParameterList), this.visitNode(node.parameterList), node.typeAnnotation === null ? null : this.visitNode(node.typeAnnotation));
        };

        SyntaxRewriter.prototype.visitParameterList = function (node) {
            return node.update(this.visitToken(node.openParenToken), this.visitSeparatedList(node.parameters), this.visitToken(node.closeParenToken));
        };

        SyntaxRewriter.prototype.visitTypeParameterList = function (node) {
            return node.update(this.visitToken(node.lessThanToken), this.visitSeparatedList(node.typeParameters), this.visitToken(node.greaterThanToken));
        };

        SyntaxRewriter.prototype.visitTypeParameter = function (node) {
            return node.update(this.visitToken(node.identifier), node.constraint === null ? null : this.visitNode(node.constraint));
        };

        SyntaxRewriter.prototype.visitConstraint = function (node) {
            return node.update(this.visitToken(node.extendsKeyword), this.visitNodeOrToken(node.type));
        };

        SyntaxRewriter.prototype.visitElseClause = function (node) {
            return node.update(this.visitToken(node.elseKeyword), this.visitNodeOrToken(node.statement));
        };

        SyntaxRewriter.prototype.visitIfStatement = function (node) {
            return node.update(this.visitToken(node.ifKeyword), this.visitToken(node.openParenToken), this.visitNodeOrToken(node.condition), this.visitToken(node.closeParenToken), this.visitNodeOrToken(node.statement), node.elseClause === null ? null : this.visitNode(node.elseClause));
        };

        SyntaxRewriter.prototype.visitExpressionStatement = function (node) {
            return node.update(this.visitNodeOrToken(node.expression), this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitConstructorDeclaration = function (node) {
            return node.update(this.visitToken(node.constructorKeyword), this.visitNode(node.parameterList), node.block === null ? null : this.visitNode(node.block), node.semicolonToken === null ? null : this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitMemberFunctionDeclaration = function (node) {
            return node.update(this.visitList(node.modifiers), this.visitToken(node.propertyName), this.visitNode(node.callSignature), node.block === null ? null : this.visitNode(node.block), node.semicolonToken === null ? null : this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitGetMemberAccessorDeclaration = function (node) {
            return node.update(this.visitList(node.modifiers), this.visitToken(node.getKeyword), this.visitToken(node.propertyName), this.visitNode(node.parameterList), node.typeAnnotation === null ? null : this.visitNode(node.typeAnnotation), this.visitNode(node.block));
        };

        SyntaxRewriter.prototype.visitSetMemberAccessorDeclaration = function (node) {
            return node.update(this.visitList(node.modifiers), this.visitToken(node.setKeyword), this.visitToken(node.propertyName), this.visitNode(node.parameterList), this.visitNode(node.block));
        };

        SyntaxRewriter.prototype.visitMemberVariableDeclaration = function (node) {
            return node.update(this.visitList(node.modifiers), this.visitNode(node.variableDeclarator), this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitThrowStatement = function (node) {
            return node.update(this.visitToken(node.throwKeyword), this.visitNodeOrToken(node.expression), this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitReturnStatement = function (node) {
            return node.update(this.visitToken(node.returnKeyword), node.expression === null ? null : this.visitNodeOrToken(node.expression), this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitObjectCreationExpression = function (node) {
            return node.update(this.visitToken(node.newKeyword), this.visitNodeOrToken(node.expression), node.argumentList === null ? null : this.visitNode(node.argumentList));
        };

        SyntaxRewriter.prototype.visitSwitchStatement = function (node) {
            return node.update(this.visitToken(node.switchKeyword), this.visitToken(node.openParenToken), this.visitNodeOrToken(node.expression), this.visitToken(node.closeParenToken), this.visitToken(node.openBraceToken), this.visitList(node.switchClauses), this.visitToken(node.closeBraceToken));
        };

        SyntaxRewriter.prototype.visitCaseSwitchClause = function (node) {
            return node.update(this.visitToken(node.caseKeyword), this.visitNodeOrToken(node.expression), this.visitToken(node.colonToken), this.visitList(node.statements));
        };

        SyntaxRewriter.prototype.visitDefaultSwitchClause = function (node) {
            return node.update(this.visitToken(node.defaultKeyword), this.visitToken(node.colonToken), this.visitList(node.statements));
        };

        SyntaxRewriter.prototype.visitBreakStatement = function (node) {
            return node.update(this.visitToken(node.breakKeyword), node.identifier === null ? null : this.visitToken(node.identifier), this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitContinueStatement = function (node) {
            return node.update(this.visitToken(node.continueKeyword), node.identifier === null ? null : this.visitToken(node.identifier), this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitForStatement = function (node) {
            return node.update(this.visitToken(node.forKeyword), this.visitToken(node.openParenToken), node.variableDeclaration === null ? null : this.visitNode(node.variableDeclaration), node.initializer === null ? null : this.visitNodeOrToken(node.initializer), this.visitToken(node.firstSemicolonToken), node.condition === null ? null : this.visitNodeOrToken(node.condition), this.visitToken(node.secondSemicolonToken), node.incrementor === null ? null : this.visitNodeOrToken(node.incrementor), this.visitToken(node.closeParenToken), this.visitNodeOrToken(node.statement));
        };

        SyntaxRewriter.prototype.visitForInStatement = function (node) {
            return node.update(this.visitToken(node.forKeyword), this.visitToken(node.openParenToken), node.variableDeclaration === null ? null : this.visitNode(node.variableDeclaration), node.left === null ? null : this.visitNodeOrToken(node.left), this.visitToken(node.inKeyword), this.visitNodeOrToken(node.expression), this.visitToken(node.closeParenToken), this.visitNodeOrToken(node.statement));
        };

        SyntaxRewriter.prototype.visitWhileStatement = function (node) {
            return node.update(this.visitToken(node.whileKeyword), this.visitToken(node.openParenToken), this.visitNodeOrToken(node.condition), this.visitToken(node.closeParenToken), this.visitNodeOrToken(node.statement));
        };

        SyntaxRewriter.prototype.visitWithStatement = function (node) {
            return node.update(this.visitToken(node.withKeyword), this.visitToken(node.openParenToken), this.visitNodeOrToken(node.condition), this.visitToken(node.closeParenToken), this.visitNodeOrToken(node.statement));
        };

        SyntaxRewriter.prototype.visitEnumDeclaration = function (node) {
            return node.update(this.visitList(node.modifiers), this.visitToken(node.enumKeyword), this.visitToken(node.identifier), this.visitToken(node.openBraceToken), this.visitSeparatedList(node.enumElements), this.visitToken(node.closeBraceToken));
        };

        SyntaxRewriter.prototype.visitEnumElement = function (node) {
            return node.update(this.visitToken(node.propertyName), node.equalsValueClause === null ? null : this.visitNode(node.equalsValueClause));
        };

        SyntaxRewriter.prototype.visitCastExpression = function (node) {
            return node.update(this.visitToken(node.lessThanToken), this.visitNodeOrToken(node.type), this.visitToken(node.greaterThanToken), this.visitNodeOrToken(node.expression));
        };

        SyntaxRewriter.prototype.visitObjectLiteralExpression = function (node) {
            return node.update(this.visitToken(node.openBraceToken), this.visitSeparatedList(node.propertyAssignments), this.visitToken(node.closeBraceToken));
        };

        SyntaxRewriter.prototype.visitSimplePropertyAssignment = function (node) {
            return node.update(this.visitToken(node.propertyName), this.visitToken(node.colonToken), this.visitNodeOrToken(node.expression));
        };

        SyntaxRewriter.prototype.visitFunctionPropertyAssignment = function (node) {
            return node.update(this.visitToken(node.propertyName), this.visitNode(node.callSignature), this.visitNode(node.block));
        };

        SyntaxRewriter.prototype.visitGetAccessorPropertyAssignment = function (node) {
            return node.update(this.visitToken(node.getKeyword), this.visitToken(node.propertyName), this.visitToken(node.openParenToken), this.visitToken(node.closeParenToken), node.typeAnnotation === null ? null : this.visitNode(node.typeAnnotation), this.visitNode(node.block));
        };

        SyntaxRewriter.prototype.visitSetAccessorPropertyAssignment = function (node) {
            return node.update(this.visitToken(node.setKeyword), this.visitToken(node.propertyName), this.visitToken(node.openParenToken), this.visitNode(node.parameter), this.visitToken(node.closeParenToken), this.visitNode(node.block));
        };

        SyntaxRewriter.prototype.visitFunctionExpression = function (node) {
            return node.update(this.visitToken(node.functionKeyword), node.identifier === null ? null : this.visitToken(node.identifier), this.visitNode(node.callSignature), this.visitNode(node.block));
        };

        SyntaxRewriter.prototype.visitEmptyStatement = function (node) {
            return node.update(this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitTryStatement = function (node) {
            return node.update(this.visitToken(node.tryKeyword), this.visitNode(node.block), node.catchClause === null ? null : this.visitNode(node.catchClause), node.finallyClause === null ? null : this.visitNode(node.finallyClause));
        };

        SyntaxRewriter.prototype.visitCatchClause = function (node) {
            return node.update(this.visitToken(node.catchKeyword), this.visitToken(node.openParenToken), this.visitToken(node.identifier), node.typeAnnotation === null ? null : this.visitNode(node.typeAnnotation), this.visitToken(node.closeParenToken), this.visitNode(node.block));
        };

        SyntaxRewriter.prototype.visitFinallyClause = function (node) {
            return node.update(this.visitToken(node.finallyKeyword), this.visitNode(node.block));
        };

        SyntaxRewriter.prototype.visitLabeledStatement = function (node) {
            return node.update(this.visitToken(node.identifier), this.visitToken(node.colonToken), this.visitNodeOrToken(node.statement));
        };

        SyntaxRewriter.prototype.visitDoStatement = function (node) {
            return node.update(this.visitToken(node.doKeyword), this.visitNodeOrToken(node.statement), this.visitToken(node.whileKeyword), this.visitToken(node.openParenToken), this.visitNodeOrToken(node.condition), this.visitToken(node.closeParenToken), this.visitToken(node.semicolonToken));
        };

        SyntaxRewriter.prototype.visitTypeOfExpression = function (node) {
            return node.update(this.visitToken(node.typeOfKeyword), this.visitNodeOrToken(node.expression));
        };

        SyntaxRewriter.prototype.visitDeleteExpression = function (node) {
            return node.update(this.visitToken(node.deleteKeyword), this.visitNodeOrToken(node.expression));
        };

        SyntaxRewriter.prototype.visitVoidExpression = function (node) {
            return node.update(this.visitToken(node.voidKeyword), this.visitNodeOrToken(node.expression));
        };

        SyntaxRewriter.prototype.visitDebuggerStatement = function (node) {
            return node.update(this.visitToken(node.debuggerKeyword), this.visitToken(node.semicolonToken));
        };
        return SyntaxRewriter;
    })();
    TypeScript.SyntaxRewriter = SyntaxRewriter;
})(TypeScript || (TypeScript = {}));
