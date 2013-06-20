var TypeScript;
(function (TypeScript) {
    var SyntaxWalker = (function () {
        function SyntaxWalker() {
        }
        SyntaxWalker.prototype.visitToken = function (token) {
        };

        SyntaxWalker.prototype.visitNode = function (node) {
            node.accept(this);
        };

        SyntaxWalker.prototype.visitNodeOrToken = function (nodeOrToken) {
            if (nodeOrToken.isToken()) {
                this.visitToken(nodeOrToken);
            } else {
                this.visitNode(nodeOrToken);
            }
        };

        SyntaxWalker.prototype.visitOptionalToken = function (token) {
            if (token === null) {
                return;
            }

            this.visitToken(token);
        };

        SyntaxWalker.prototype.visitOptionalNode = function (node) {
            if (node === null) {
                return;
            }

            this.visitNode(node);
        };

        SyntaxWalker.prototype.visitOptionalNodeOrToken = function (nodeOrToken) {
            if (nodeOrToken === null) {
                return;
            }

            this.visitNodeOrToken(nodeOrToken);
        };

        SyntaxWalker.prototype.visitList = function (list) {
            for (var i = 0, n = list.childCount(); i < n; i++) {
                this.visitNodeOrToken(list.childAt(i));
            }
        };

        SyntaxWalker.prototype.visitSeparatedList = function (list) {
            for (var i = 0, n = list.childCount(); i < n; i++) {
                var item = list.childAt(i);
                this.visitNodeOrToken(item);
            }
        };

        SyntaxWalker.prototype.visitSourceUnit = function (node) {
            this.visitList(node.moduleElements);
            this.visitToken(node.endOfFileToken);
        };

        SyntaxWalker.prototype.visitExternalModuleReference = function (node) {
            this.visitToken(node.moduleOrRequireKeyword);
            this.visitToken(node.openParenToken);
            this.visitToken(node.stringLiteral);
            this.visitToken(node.closeParenToken);
        };

        SyntaxWalker.prototype.visitModuleNameModuleReference = function (node) {
            this.visitNodeOrToken(node.moduleName);
        };

        SyntaxWalker.prototype.visitImportDeclaration = function (node) {
            this.visitToken(node.importKeyword);
            this.visitToken(node.identifier);
            this.visitToken(node.equalsToken);
            this.visitNode(node.moduleReference);
            this.visitToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitExportAssignment = function (node) {
            this.visitToken(node.exportKeyword);
            this.visitToken(node.equalsToken);
            this.visitToken(node.identifier);
            this.visitToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitClassDeclaration = function (node) {
            this.visitList(node.modifiers);
            this.visitToken(node.classKeyword);
            this.visitToken(node.identifier);
            this.visitOptionalNode(node.typeParameterList);
            this.visitList(node.heritageClauses);
            this.visitToken(node.openBraceToken);
            this.visitList(node.classElements);
            this.visitToken(node.closeBraceToken);
        };

        SyntaxWalker.prototype.visitInterfaceDeclaration = function (node) {
            this.visitList(node.modifiers);
            this.visitToken(node.interfaceKeyword);
            this.visitToken(node.identifier);
            this.visitOptionalNode(node.typeParameterList);
            this.visitList(node.heritageClauses);
            this.visitNode(node.body);
        };

        SyntaxWalker.prototype.visitHeritageClause = function (node) {
            this.visitToken(node.extendsOrImplementsKeyword);
            this.visitSeparatedList(node.typeNames);
        };

        SyntaxWalker.prototype.visitModuleDeclaration = function (node) {
            this.visitList(node.modifiers);
            this.visitToken(node.moduleKeyword);
            this.visitOptionalNodeOrToken(node.moduleName);
            this.visitOptionalToken(node.stringLiteral);
            this.visitToken(node.openBraceToken);
            this.visitList(node.moduleElements);
            this.visitToken(node.closeBraceToken);
        };

        SyntaxWalker.prototype.visitFunctionDeclaration = function (node) {
            this.visitList(node.modifiers);
            this.visitToken(node.functionKeyword);
            this.visitToken(node.identifier);
            this.visitNode(node.callSignature);
            this.visitOptionalNode(node.block);
            this.visitOptionalToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitVariableStatement = function (node) {
            this.visitList(node.modifiers);
            this.visitNode(node.variableDeclaration);
            this.visitToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitVariableDeclaration = function (node) {
            this.visitToken(node.varKeyword);
            this.visitSeparatedList(node.variableDeclarators);
        };

        SyntaxWalker.prototype.visitVariableDeclarator = function (node) {
            this.visitToken(node.identifier);
            this.visitOptionalNode(node.typeAnnotation);
            this.visitOptionalNode(node.equalsValueClause);
        };

        SyntaxWalker.prototype.visitEqualsValueClause = function (node) {
            this.visitToken(node.equalsToken);
            this.visitNodeOrToken(node.value);
        };

        SyntaxWalker.prototype.visitPrefixUnaryExpression = function (node) {
            this.visitToken(node.operatorToken);
            this.visitNodeOrToken(node.operand);
        };

        SyntaxWalker.prototype.visitArrayLiteralExpression = function (node) {
            this.visitToken(node.openBracketToken);
            this.visitSeparatedList(node.expressions);
            this.visitToken(node.closeBracketToken);
        };

        SyntaxWalker.prototype.visitOmittedExpression = function (node) {
        };

        SyntaxWalker.prototype.visitParenthesizedExpression = function (node) {
            this.visitToken(node.openParenToken);
            this.visitNodeOrToken(node.expression);
            this.visitToken(node.closeParenToken);
        };

        SyntaxWalker.prototype.visitSimpleArrowFunctionExpression = function (node) {
            this.visitToken(node.identifier);
            this.visitToken(node.equalsGreaterThanToken);
            this.visitNodeOrToken(node.body);
        };

        SyntaxWalker.prototype.visitParenthesizedArrowFunctionExpression = function (node) {
            this.visitNode(node.callSignature);
            this.visitToken(node.equalsGreaterThanToken);
            this.visitNodeOrToken(node.body);
        };

        SyntaxWalker.prototype.visitQualifiedName = function (node) {
            this.visitNodeOrToken(node.left);
            this.visitToken(node.dotToken);
            this.visitToken(node.right);
        };

        SyntaxWalker.prototype.visitTypeArgumentList = function (node) {
            this.visitToken(node.lessThanToken);
            this.visitSeparatedList(node.typeArguments);
            this.visitToken(node.greaterThanToken);
        };

        SyntaxWalker.prototype.visitConstructorType = function (node) {
            this.visitToken(node.newKeyword);
            this.visitOptionalNode(node.typeParameterList);
            this.visitNode(node.parameterList);
            this.visitToken(node.equalsGreaterThanToken);
            this.visitNodeOrToken(node.type);
        };

        SyntaxWalker.prototype.visitFunctionType = function (node) {
            this.visitOptionalNode(node.typeParameterList);
            this.visitNode(node.parameterList);
            this.visitToken(node.equalsGreaterThanToken);
            this.visitNodeOrToken(node.type);
        };

        SyntaxWalker.prototype.visitObjectType = function (node) {
            this.visitToken(node.openBraceToken);
            this.visitSeparatedList(node.typeMembers);
            this.visitToken(node.closeBraceToken);
        };

        SyntaxWalker.prototype.visitArrayType = function (node) {
            this.visitNodeOrToken(node.type);
            this.visitToken(node.openBracketToken);
            this.visitToken(node.closeBracketToken);
        };

        SyntaxWalker.prototype.visitGenericType = function (node) {
            this.visitNodeOrToken(node.name);
            this.visitNode(node.typeArgumentList);
        };

        SyntaxWalker.prototype.visitTypeAnnotation = function (node) {
            this.visitToken(node.colonToken);
            this.visitNodeOrToken(node.type);
        };

        SyntaxWalker.prototype.visitBlock = function (node) {
            this.visitToken(node.openBraceToken);
            this.visitList(node.statements);
            this.visitToken(node.closeBraceToken);
        };

        SyntaxWalker.prototype.visitParameter = function (node) {
            this.visitOptionalToken(node.dotDotDotToken);
            this.visitOptionalToken(node.publicOrPrivateKeyword);
            this.visitToken(node.identifier);
            this.visitOptionalToken(node.questionToken);
            this.visitOptionalNode(node.typeAnnotation);
            this.visitOptionalNode(node.equalsValueClause);
        };

        SyntaxWalker.prototype.visitMemberAccessExpression = function (node) {
            this.visitNodeOrToken(node.expression);
            this.visitToken(node.dotToken);
            this.visitToken(node.name);
        };

        SyntaxWalker.prototype.visitPostfixUnaryExpression = function (node) {
            this.visitNodeOrToken(node.operand);
            this.visitToken(node.operatorToken);
        };

        SyntaxWalker.prototype.visitElementAccessExpression = function (node) {
            this.visitNodeOrToken(node.expression);
            this.visitToken(node.openBracketToken);
            this.visitNodeOrToken(node.argumentExpression);
            this.visitToken(node.closeBracketToken);
        };

        SyntaxWalker.prototype.visitInvocationExpression = function (node) {
            this.visitNodeOrToken(node.expression);
            this.visitNode(node.argumentList);
        };

        SyntaxWalker.prototype.visitArgumentList = function (node) {
            this.visitOptionalNode(node.typeArgumentList);
            this.visitToken(node.openParenToken);
            this.visitSeparatedList(node.arguments);
            this.visitToken(node.closeParenToken);
        };

        SyntaxWalker.prototype.visitBinaryExpression = function (node) {
            this.visitNodeOrToken(node.left);
            this.visitToken(node.operatorToken);
            this.visitNodeOrToken(node.right);
        };

        SyntaxWalker.prototype.visitConditionalExpression = function (node) {
            this.visitNodeOrToken(node.condition);
            this.visitToken(node.questionToken);
            this.visitNodeOrToken(node.whenTrue);
            this.visitToken(node.colonToken);
            this.visitNodeOrToken(node.whenFalse);
        };

        SyntaxWalker.prototype.visitConstructSignature = function (node) {
            this.visitToken(node.newKeyword);
            this.visitNode(node.callSignature);
        };

        SyntaxWalker.prototype.visitMethodSignature = function (node) {
            this.visitToken(node.propertyName);
            this.visitOptionalToken(node.questionToken);
            this.visitNode(node.callSignature);
        };

        SyntaxWalker.prototype.visitIndexSignature = function (node) {
            this.visitToken(node.openBracketToken);
            this.visitNode(node.parameter);
            this.visitToken(node.closeBracketToken);
            this.visitOptionalNode(node.typeAnnotation);
        };

        SyntaxWalker.prototype.visitPropertySignature = function (node) {
            this.visitToken(node.propertyName);
            this.visitOptionalToken(node.questionToken);
            this.visitOptionalNode(node.typeAnnotation);
        };

        SyntaxWalker.prototype.visitCallSignature = function (node) {
            this.visitOptionalNode(node.typeParameterList);
            this.visitNode(node.parameterList);
            this.visitOptionalNode(node.typeAnnotation);
        };

        SyntaxWalker.prototype.visitParameterList = function (node) {
            this.visitToken(node.openParenToken);
            this.visitSeparatedList(node.parameters);
            this.visitToken(node.closeParenToken);
        };

        SyntaxWalker.prototype.visitTypeParameterList = function (node) {
            this.visitToken(node.lessThanToken);
            this.visitSeparatedList(node.typeParameters);
            this.visitToken(node.greaterThanToken);
        };

        SyntaxWalker.prototype.visitTypeParameter = function (node) {
            this.visitToken(node.identifier);
            this.visitOptionalNode(node.constraint);
        };

        SyntaxWalker.prototype.visitConstraint = function (node) {
            this.visitToken(node.extendsKeyword);
            this.visitNodeOrToken(node.type);
        };

        SyntaxWalker.prototype.visitElseClause = function (node) {
            this.visitToken(node.elseKeyword);
            this.visitNodeOrToken(node.statement);
        };

        SyntaxWalker.prototype.visitIfStatement = function (node) {
            this.visitToken(node.ifKeyword);
            this.visitToken(node.openParenToken);
            this.visitNodeOrToken(node.condition);
            this.visitToken(node.closeParenToken);
            this.visitNodeOrToken(node.statement);
            this.visitOptionalNode(node.elseClause);
        };

        SyntaxWalker.prototype.visitExpressionStatement = function (node) {
            this.visitNodeOrToken(node.expression);
            this.visitToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitConstructorDeclaration = function (node) {
            this.visitToken(node.constructorKeyword);
            this.visitNode(node.parameterList);
            this.visitOptionalNode(node.block);
            this.visitOptionalToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitMemberFunctionDeclaration = function (node) {
            this.visitList(node.modifiers);
            this.visitToken(node.propertyName);
            this.visitNode(node.callSignature);
            this.visitOptionalNode(node.block);
            this.visitOptionalToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitGetMemberAccessorDeclaration = function (node) {
            this.visitList(node.modifiers);
            this.visitToken(node.getKeyword);
            this.visitToken(node.propertyName);
            this.visitNode(node.parameterList);
            this.visitOptionalNode(node.typeAnnotation);
            this.visitNode(node.block);
        };

        SyntaxWalker.prototype.visitSetMemberAccessorDeclaration = function (node) {
            this.visitList(node.modifiers);
            this.visitToken(node.setKeyword);
            this.visitToken(node.propertyName);
            this.visitNode(node.parameterList);
            this.visitNode(node.block);
        };

        SyntaxWalker.prototype.visitMemberVariableDeclaration = function (node) {
            this.visitList(node.modifiers);
            this.visitNode(node.variableDeclarator);
            this.visitToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitThrowStatement = function (node) {
            this.visitToken(node.throwKeyword);
            this.visitNodeOrToken(node.expression);
            this.visitToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitReturnStatement = function (node) {
            this.visitToken(node.returnKeyword);
            this.visitOptionalNodeOrToken(node.expression);
            this.visitToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitObjectCreationExpression = function (node) {
            this.visitToken(node.newKeyword);
            this.visitNodeOrToken(node.expression);
            this.visitOptionalNode(node.argumentList);
        };

        SyntaxWalker.prototype.visitSwitchStatement = function (node) {
            this.visitToken(node.switchKeyword);
            this.visitToken(node.openParenToken);
            this.visitNodeOrToken(node.expression);
            this.visitToken(node.closeParenToken);
            this.visitToken(node.openBraceToken);
            this.visitList(node.switchClauses);
            this.visitToken(node.closeBraceToken);
        };

        SyntaxWalker.prototype.visitCaseSwitchClause = function (node) {
            this.visitToken(node.caseKeyword);
            this.visitNodeOrToken(node.expression);
            this.visitToken(node.colonToken);
            this.visitList(node.statements);
        };

        SyntaxWalker.prototype.visitDefaultSwitchClause = function (node) {
            this.visitToken(node.defaultKeyword);
            this.visitToken(node.colonToken);
            this.visitList(node.statements);
        };

        SyntaxWalker.prototype.visitBreakStatement = function (node) {
            this.visitToken(node.breakKeyword);
            this.visitOptionalToken(node.identifier);
            this.visitToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitContinueStatement = function (node) {
            this.visitToken(node.continueKeyword);
            this.visitOptionalToken(node.identifier);
            this.visitToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitForStatement = function (node) {
            this.visitToken(node.forKeyword);
            this.visitToken(node.openParenToken);
            this.visitOptionalNode(node.variableDeclaration);
            this.visitOptionalNodeOrToken(node.initializer);
            this.visitToken(node.firstSemicolonToken);
            this.visitOptionalNodeOrToken(node.condition);
            this.visitToken(node.secondSemicolonToken);
            this.visitOptionalNodeOrToken(node.incrementor);
            this.visitToken(node.closeParenToken);
            this.visitNodeOrToken(node.statement);
        };

        SyntaxWalker.prototype.visitForInStatement = function (node) {
            this.visitToken(node.forKeyword);
            this.visitToken(node.openParenToken);
            this.visitOptionalNode(node.variableDeclaration);
            this.visitOptionalNodeOrToken(node.left);
            this.visitToken(node.inKeyword);
            this.visitNodeOrToken(node.expression);
            this.visitToken(node.closeParenToken);
            this.visitNodeOrToken(node.statement);
        };

        SyntaxWalker.prototype.visitWhileStatement = function (node) {
            this.visitToken(node.whileKeyword);
            this.visitToken(node.openParenToken);
            this.visitNodeOrToken(node.condition);
            this.visitToken(node.closeParenToken);
            this.visitNodeOrToken(node.statement);
        };

        SyntaxWalker.prototype.visitWithStatement = function (node) {
            this.visitToken(node.withKeyword);
            this.visitToken(node.openParenToken);
            this.visitNodeOrToken(node.condition);
            this.visitToken(node.closeParenToken);
            this.visitNodeOrToken(node.statement);
        };

        SyntaxWalker.prototype.visitEnumDeclaration = function (node) {
            this.visitList(node.modifiers);
            this.visitToken(node.enumKeyword);
            this.visitToken(node.identifier);
            this.visitToken(node.openBraceToken);
            this.visitSeparatedList(node.enumElements);
            this.visitToken(node.closeBraceToken);
        };

        SyntaxWalker.prototype.visitEnumElement = function (node) {
            this.visitToken(node.propertyName);
            this.visitOptionalNode(node.equalsValueClause);
        };

        SyntaxWalker.prototype.visitCastExpression = function (node) {
            this.visitToken(node.lessThanToken);
            this.visitNodeOrToken(node.type);
            this.visitToken(node.greaterThanToken);
            this.visitNodeOrToken(node.expression);
        };

        SyntaxWalker.prototype.visitObjectLiteralExpression = function (node) {
            this.visitToken(node.openBraceToken);
            this.visitSeparatedList(node.propertyAssignments);
            this.visitToken(node.closeBraceToken);
        };

        SyntaxWalker.prototype.visitSimplePropertyAssignment = function (node) {
            this.visitToken(node.propertyName);
            this.visitToken(node.colonToken);
            this.visitNodeOrToken(node.expression);
        };

        SyntaxWalker.prototype.visitFunctionPropertyAssignment = function (node) {
            this.visitToken(node.propertyName);
            this.visitNode(node.callSignature);
            this.visitNode(node.block);
        };

        SyntaxWalker.prototype.visitGetAccessorPropertyAssignment = function (node) {
            this.visitToken(node.getKeyword);
            this.visitToken(node.propertyName);
            this.visitToken(node.openParenToken);
            this.visitToken(node.closeParenToken);
            this.visitOptionalNode(node.typeAnnotation);
            this.visitNode(node.block);
        };

        SyntaxWalker.prototype.visitSetAccessorPropertyAssignment = function (node) {
            this.visitToken(node.setKeyword);
            this.visitToken(node.propertyName);
            this.visitToken(node.openParenToken);
            this.visitNode(node.parameter);
            this.visitToken(node.closeParenToken);
            this.visitNode(node.block);
        };

        SyntaxWalker.prototype.visitFunctionExpression = function (node) {
            this.visitToken(node.functionKeyword);
            this.visitOptionalToken(node.identifier);
            this.visitNode(node.callSignature);
            this.visitNode(node.block);
        };

        SyntaxWalker.prototype.visitEmptyStatement = function (node) {
            this.visitToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitTryStatement = function (node) {
            this.visitToken(node.tryKeyword);
            this.visitNode(node.block);
            this.visitOptionalNode(node.catchClause);
            this.visitOptionalNode(node.finallyClause);
        };

        SyntaxWalker.prototype.visitCatchClause = function (node) {
            this.visitToken(node.catchKeyword);
            this.visitToken(node.openParenToken);
            this.visitToken(node.identifier);
            this.visitOptionalNode(node.typeAnnotation);
            this.visitToken(node.closeParenToken);
            this.visitNode(node.block);
        };

        SyntaxWalker.prototype.visitFinallyClause = function (node) {
            this.visitToken(node.finallyKeyword);
            this.visitNode(node.block);
        };

        SyntaxWalker.prototype.visitLabeledStatement = function (node) {
            this.visitToken(node.identifier);
            this.visitToken(node.colonToken);
            this.visitNodeOrToken(node.statement);
        };

        SyntaxWalker.prototype.visitDoStatement = function (node) {
            this.visitToken(node.doKeyword);
            this.visitNodeOrToken(node.statement);
            this.visitToken(node.whileKeyword);
            this.visitToken(node.openParenToken);
            this.visitNodeOrToken(node.condition);
            this.visitToken(node.closeParenToken);
            this.visitToken(node.semicolonToken);
        };

        SyntaxWalker.prototype.visitTypeOfExpression = function (node) {
            this.visitToken(node.typeOfKeyword);
            this.visitNodeOrToken(node.expression);
        };

        SyntaxWalker.prototype.visitDeleteExpression = function (node) {
            this.visitToken(node.deleteKeyword);
            this.visitNodeOrToken(node.expression);
        };

        SyntaxWalker.prototype.visitVoidExpression = function (node) {
            this.visitToken(node.voidKeyword);
            this.visitNodeOrToken(node.expression);
        };

        SyntaxWalker.prototype.visitDebuggerStatement = function (node) {
            this.visitToken(node.debuggerKeyword);
            this.visitToken(node.semicolonToken);
        };
        return SyntaxWalker;
    })();
    TypeScript.SyntaxWalker = SyntaxWalker;
})(TypeScript || (TypeScript = {}));
