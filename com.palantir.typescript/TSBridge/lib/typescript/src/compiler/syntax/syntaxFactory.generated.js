var TypeScript;
(function (TypeScript) {
    (function (Syntax) {
        var NormalModeFactory = (function () {
            function NormalModeFactory() {
            }
            NormalModeFactory.prototype.sourceUnit = function (moduleElements, endOfFileToken) {
                return new TypeScript.SourceUnitSyntax(moduleElements, endOfFileToken, false);
            };
            NormalModeFactory.prototype.externalModuleReference = function (moduleOrRequireKeyword, openParenToken, stringLiteral, closeParenToken) {
                return new TypeScript.ExternalModuleReferenceSyntax(moduleOrRequireKeyword, openParenToken, stringLiteral, closeParenToken, false);
            };
            NormalModeFactory.prototype.moduleNameModuleReference = function (moduleName) {
                return new TypeScript.ModuleNameModuleReferenceSyntax(moduleName, false);
            };
            NormalModeFactory.prototype.importDeclaration = function (importKeyword, identifier, equalsToken, moduleReference, semicolonToken) {
                return new TypeScript.ImportDeclarationSyntax(importKeyword, identifier, equalsToken, moduleReference, semicolonToken, false);
            };
            NormalModeFactory.prototype.exportAssignment = function (exportKeyword, equalsToken, identifier, semicolonToken) {
                return new TypeScript.ExportAssignmentSyntax(exportKeyword, equalsToken, identifier, semicolonToken, false);
            };
            NormalModeFactory.prototype.classDeclaration = function (modifiers, classKeyword, identifier, typeParameterList, heritageClauses, openBraceToken, classElements, closeBraceToken) {
                return new TypeScript.ClassDeclarationSyntax(modifiers, classKeyword, identifier, typeParameterList, heritageClauses, openBraceToken, classElements, closeBraceToken, false);
            };
            NormalModeFactory.prototype.interfaceDeclaration = function (modifiers, interfaceKeyword, identifier, typeParameterList, heritageClauses, body) {
                return new TypeScript.InterfaceDeclarationSyntax(modifiers, interfaceKeyword, identifier, typeParameterList, heritageClauses, body, false);
            };
            NormalModeFactory.prototype.heritageClause = function (extendsOrImplementsKeyword, typeNames) {
                return new TypeScript.HeritageClauseSyntax(extendsOrImplementsKeyword, typeNames, false);
            };
            NormalModeFactory.prototype.moduleDeclaration = function (modifiers, moduleKeyword, moduleName, stringLiteral, openBraceToken, moduleElements, closeBraceToken) {
                return new TypeScript.ModuleDeclarationSyntax(modifiers, moduleKeyword, moduleName, stringLiteral, openBraceToken, moduleElements, closeBraceToken, false);
            };
            NormalModeFactory.prototype.functionDeclaration = function (modifiers, functionKeyword, identifier, callSignature, block, semicolonToken) {
                return new TypeScript.FunctionDeclarationSyntax(modifiers, functionKeyword, identifier, callSignature, block, semicolonToken, false);
            };
            NormalModeFactory.prototype.variableStatement = function (modifiers, variableDeclaration, semicolonToken) {
                return new TypeScript.VariableStatementSyntax(modifiers, variableDeclaration, semicolonToken, false);
            };
            NormalModeFactory.prototype.variableDeclaration = function (varKeyword, variableDeclarators) {
                return new TypeScript.VariableDeclarationSyntax(varKeyword, variableDeclarators, false);
            };
            NormalModeFactory.prototype.variableDeclarator = function (identifier, typeAnnotation, equalsValueClause) {
                return new TypeScript.VariableDeclaratorSyntax(identifier, typeAnnotation, equalsValueClause, false);
            };
            NormalModeFactory.prototype.equalsValueClause = function (equalsToken, value) {
                return new TypeScript.EqualsValueClauseSyntax(equalsToken, value, false);
            };
            NormalModeFactory.prototype.prefixUnaryExpression = function (kind, operatorToken, operand) {
                return new TypeScript.PrefixUnaryExpressionSyntax(kind, operatorToken, operand, false);
            };
            NormalModeFactory.prototype.arrayLiteralExpression = function (openBracketToken, expressions, closeBracketToken) {
                return new TypeScript.ArrayLiteralExpressionSyntax(openBracketToken, expressions, closeBracketToken, false);
            };
            NormalModeFactory.prototype.omittedExpression = function () {
                return new TypeScript.OmittedExpressionSyntax(false);
            };
            NormalModeFactory.prototype.parenthesizedExpression = function (openParenToken, expression, closeParenToken) {
                return new TypeScript.ParenthesizedExpressionSyntax(openParenToken, expression, closeParenToken, false);
            };
            NormalModeFactory.prototype.simpleArrowFunctionExpression = function (identifier, equalsGreaterThanToken, body) {
                return new TypeScript.SimpleArrowFunctionExpressionSyntax(identifier, equalsGreaterThanToken, body, false);
            };
            NormalModeFactory.prototype.parenthesizedArrowFunctionExpression = function (callSignature, equalsGreaterThanToken, body) {
                return new TypeScript.ParenthesizedArrowFunctionExpressionSyntax(callSignature, equalsGreaterThanToken, body, false);
            };
            NormalModeFactory.prototype.qualifiedName = function (left, dotToken, right) {
                return new TypeScript.QualifiedNameSyntax(left, dotToken, right, false);
            };
            NormalModeFactory.prototype.typeArgumentList = function (lessThanToken, typeArguments, greaterThanToken) {
                return new TypeScript.TypeArgumentListSyntax(lessThanToken, typeArguments, greaterThanToken, false);
            };
            NormalModeFactory.prototype.constructorType = function (newKeyword, typeParameterList, parameterList, equalsGreaterThanToken, type) {
                return new TypeScript.ConstructorTypeSyntax(newKeyword, typeParameterList, parameterList, equalsGreaterThanToken, type, false);
            };
            NormalModeFactory.prototype.functionType = function (typeParameterList, parameterList, equalsGreaterThanToken, type) {
                return new TypeScript.FunctionTypeSyntax(typeParameterList, parameterList, equalsGreaterThanToken, type, false);
            };
            NormalModeFactory.prototype.objectType = function (openBraceToken, typeMembers, closeBraceToken) {
                return new TypeScript.ObjectTypeSyntax(openBraceToken, typeMembers, closeBraceToken, false);
            };
            NormalModeFactory.prototype.arrayType = function (type, openBracketToken, closeBracketToken) {
                return new TypeScript.ArrayTypeSyntax(type, openBracketToken, closeBracketToken, false);
            };
            NormalModeFactory.prototype.genericType = function (name, typeArgumentList) {
                return new TypeScript.GenericTypeSyntax(name, typeArgumentList, false);
            };
            NormalModeFactory.prototype.typeAnnotation = function (colonToken, type) {
                return new TypeScript.TypeAnnotationSyntax(colonToken, type, false);
            };
            NormalModeFactory.prototype.block = function (openBraceToken, statements, closeBraceToken) {
                return new TypeScript.BlockSyntax(openBraceToken, statements, closeBraceToken, false);
            };
            NormalModeFactory.prototype.parameter = function (dotDotDotToken, publicOrPrivateKeyword, identifier, questionToken, typeAnnotation, equalsValueClause) {
                return new TypeScript.ParameterSyntax(dotDotDotToken, publicOrPrivateKeyword, identifier, questionToken, typeAnnotation, equalsValueClause, false);
            };
            NormalModeFactory.prototype.memberAccessExpression = function (expression, dotToken, name) {
                return new TypeScript.MemberAccessExpressionSyntax(expression, dotToken, name, false);
            };
            NormalModeFactory.prototype.postfixUnaryExpression = function (kind, operand, operatorToken) {
                return new TypeScript.PostfixUnaryExpressionSyntax(kind, operand, operatorToken, false);
            };
            NormalModeFactory.prototype.elementAccessExpression = function (expression, openBracketToken, argumentExpression, closeBracketToken) {
                return new TypeScript.ElementAccessExpressionSyntax(expression, openBracketToken, argumentExpression, closeBracketToken, false);
            };
            NormalModeFactory.prototype.invocationExpression = function (expression, argumentList) {
                return new TypeScript.InvocationExpressionSyntax(expression, argumentList, false);
            };
            NormalModeFactory.prototype.argumentList = function (typeArgumentList, openParenToken, _arguments, closeParenToken) {
                return new TypeScript.ArgumentListSyntax(typeArgumentList, openParenToken, _arguments, closeParenToken, false);
            };
            NormalModeFactory.prototype.binaryExpression = function (kind, left, operatorToken, right) {
                return new TypeScript.BinaryExpressionSyntax(kind, left, operatorToken, right, false);
            };
            NormalModeFactory.prototype.conditionalExpression = function (condition, questionToken, whenTrue, colonToken, whenFalse) {
                return new TypeScript.ConditionalExpressionSyntax(condition, questionToken, whenTrue, colonToken, whenFalse, false);
            };
            NormalModeFactory.prototype.constructSignature = function (newKeyword, callSignature) {
                return new TypeScript.ConstructSignatureSyntax(newKeyword, callSignature, false);
            };
            NormalModeFactory.prototype.methodSignature = function (propertyName, questionToken, callSignature) {
                return new TypeScript.MethodSignatureSyntax(propertyName, questionToken, callSignature, false);
            };
            NormalModeFactory.prototype.indexSignature = function (openBracketToken, parameter, closeBracketToken, typeAnnotation) {
                return new TypeScript.IndexSignatureSyntax(openBracketToken, parameter, closeBracketToken, typeAnnotation, false);
            };
            NormalModeFactory.prototype.propertySignature = function (propertyName, questionToken, typeAnnotation) {
                return new TypeScript.PropertySignatureSyntax(propertyName, questionToken, typeAnnotation, false);
            };
            NormalModeFactory.prototype.callSignature = function (typeParameterList, parameterList, typeAnnotation) {
                return new TypeScript.CallSignatureSyntax(typeParameterList, parameterList, typeAnnotation, false);
            };
            NormalModeFactory.prototype.parameterList = function (openParenToken, parameters, closeParenToken) {
                return new TypeScript.ParameterListSyntax(openParenToken, parameters, closeParenToken, false);
            };
            NormalModeFactory.prototype.typeParameterList = function (lessThanToken, typeParameters, greaterThanToken) {
                return new TypeScript.TypeParameterListSyntax(lessThanToken, typeParameters, greaterThanToken, false);
            };
            NormalModeFactory.prototype.typeParameter = function (identifier, constraint) {
                return new TypeScript.TypeParameterSyntax(identifier, constraint, false);
            };
            NormalModeFactory.prototype.constraint = function (extendsKeyword, type) {
                return new TypeScript.ConstraintSyntax(extendsKeyword, type, false);
            };
            NormalModeFactory.prototype.elseClause = function (elseKeyword, statement) {
                return new TypeScript.ElseClauseSyntax(elseKeyword, statement, false);
            };
            NormalModeFactory.prototype.ifStatement = function (ifKeyword, openParenToken, condition, closeParenToken, statement, elseClause) {
                return new TypeScript.IfStatementSyntax(ifKeyword, openParenToken, condition, closeParenToken, statement, elseClause, false);
            };
            NormalModeFactory.prototype.expressionStatement = function (expression, semicolonToken) {
                return new TypeScript.ExpressionStatementSyntax(expression, semicolonToken, false);
            };
            NormalModeFactory.prototype.constructorDeclaration = function (constructorKeyword, parameterList, block, semicolonToken) {
                return new TypeScript.ConstructorDeclarationSyntax(constructorKeyword, parameterList, block, semicolonToken, false);
            };
            NormalModeFactory.prototype.memberFunctionDeclaration = function (modifiers, propertyName, callSignature, block, semicolonToken) {
                return new TypeScript.MemberFunctionDeclarationSyntax(modifiers, propertyName, callSignature, block, semicolonToken, false);
            };
            NormalModeFactory.prototype.getMemberAccessorDeclaration = function (modifiers, getKeyword, propertyName, parameterList, typeAnnotation, block) {
                return new TypeScript.GetMemberAccessorDeclarationSyntax(modifiers, getKeyword, propertyName, parameterList, typeAnnotation, block, false);
            };
            NormalModeFactory.prototype.setMemberAccessorDeclaration = function (modifiers, setKeyword, propertyName, parameterList, block) {
                return new TypeScript.SetMemberAccessorDeclarationSyntax(modifiers, setKeyword, propertyName, parameterList, block, false);
            };
            NormalModeFactory.prototype.memberVariableDeclaration = function (modifiers, variableDeclarator, semicolonToken) {
                return new TypeScript.MemberVariableDeclarationSyntax(modifiers, variableDeclarator, semicolonToken, false);
            };
            NormalModeFactory.prototype.throwStatement = function (throwKeyword, expression, semicolonToken) {
                return new TypeScript.ThrowStatementSyntax(throwKeyword, expression, semicolonToken, false);
            };
            NormalModeFactory.prototype.returnStatement = function (returnKeyword, expression, semicolonToken) {
                return new TypeScript.ReturnStatementSyntax(returnKeyword, expression, semicolonToken, false);
            };
            NormalModeFactory.prototype.objectCreationExpression = function (newKeyword, expression, argumentList) {
                return new TypeScript.ObjectCreationExpressionSyntax(newKeyword, expression, argumentList, false);
            };
            NormalModeFactory.prototype.switchStatement = function (switchKeyword, openParenToken, expression, closeParenToken, openBraceToken, switchClauses, closeBraceToken) {
                return new TypeScript.SwitchStatementSyntax(switchKeyword, openParenToken, expression, closeParenToken, openBraceToken, switchClauses, closeBraceToken, false);
            };
            NormalModeFactory.prototype.caseSwitchClause = function (caseKeyword, expression, colonToken, statements) {
                return new TypeScript.CaseSwitchClauseSyntax(caseKeyword, expression, colonToken, statements, false);
            };
            NormalModeFactory.prototype.defaultSwitchClause = function (defaultKeyword, colonToken, statements) {
                return new TypeScript.DefaultSwitchClauseSyntax(defaultKeyword, colonToken, statements, false);
            };
            NormalModeFactory.prototype.breakStatement = function (breakKeyword, identifier, semicolonToken) {
                return new TypeScript.BreakStatementSyntax(breakKeyword, identifier, semicolonToken, false);
            };
            NormalModeFactory.prototype.continueStatement = function (continueKeyword, identifier, semicolonToken) {
                return new TypeScript.ContinueStatementSyntax(continueKeyword, identifier, semicolonToken, false);
            };
            NormalModeFactory.prototype.forStatement = function (forKeyword, openParenToken, variableDeclaration, initializer, firstSemicolonToken, condition, secondSemicolonToken, incrementor, closeParenToken, statement) {
                return new TypeScript.ForStatementSyntax(forKeyword, openParenToken, variableDeclaration, initializer, firstSemicolonToken, condition, secondSemicolonToken, incrementor, closeParenToken, statement, false);
            };
            NormalModeFactory.prototype.forInStatement = function (forKeyword, openParenToken, variableDeclaration, left, inKeyword, expression, closeParenToken, statement) {
                return new TypeScript.ForInStatementSyntax(forKeyword, openParenToken, variableDeclaration, left, inKeyword, expression, closeParenToken, statement, false);
            };
            NormalModeFactory.prototype.whileStatement = function (whileKeyword, openParenToken, condition, closeParenToken, statement) {
                return new TypeScript.WhileStatementSyntax(whileKeyword, openParenToken, condition, closeParenToken, statement, false);
            };
            NormalModeFactory.prototype.withStatement = function (withKeyword, openParenToken, condition, closeParenToken, statement) {
                return new TypeScript.WithStatementSyntax(withKeyword, openParenToken, condition, closeParenToken, statement, false);
            };
            NormalModeFactory.prototype.enumDeclaration = function (modifiers, enumKeyword, identifier, openBraceToken, enumElements, closeBraceToken) {
                return new TypeScript.EnumDeclarationSyntax(modifiers, enumKeyword, identifier, openBraceToken, enumElements, closeBraceToken, false);
            };
            NormalModeFactory.prototype.enumElement = function (propertyName, equalsValueClause) {
                return new TypeScript.EnumElementSyntax(propertyName, equalsValueClause, false);
            };
            NormalModeFactory.prototype.castExpression = function (lessThanToken, type, greaterThanToken, expression) {
                return new TypeScript.CastExpressionSyntax(lessThanToken, type, greaterThanToken, expression, false);
            };
            NormalModeFactory.prototype.objectLiteralExpression = function (openBraceToken, propertyAssignments, closeBraceToken) {
                return new TypeScript.ObjectLiteralExpressionSyntax(openBraceToken, propertyAssignments, closeBraceToken, false);
            };
            NormalModeFactory.prototype.simplePropertyAssignment = function (propertyName, colonToken, expression) {
                return new TypeScript.SimplePropertyAssignmentSyntax(propertyName, colonToken, expression, false);
            };
            NormalModeFactory.prototype.functionPropertyAssignment = function (propertyName, callSignature, block) {
                return new TypeScript.FunctionPropertyAssignmentSyntax(propertyName, callSignature, block, false);
            };
            NormalModeFactory.prototype.getAccessorPropertyAssignment = function (getKeyword, propertyName, openParenToken, closeParenToken, typeAnnotation, block) {
                return new TypeScript.GetAccessorPropertyAssignmentSyntax(getKeyword, propertyName, openParenToken, closeParenToken, typeAnnotation, block, false);
            };
            NormalModeFactory.prototype.setAccessorPropertyAssignment = function (setKeyword, propertyName, openParenToken, parameter, closeParenToken, block) {
                return new TypeScript.SetAccessorPropertyAssignmentSyntax(setKeyword, propertyName, openParenToken, parameter, closeParenToken, block, false);
            };
            NormalModeFactory.prototype.functionExpression = function (functionKeyword, identifier, callSignature, block) {
                return new TypeScript.FunctionExpressionSyntax(functionKeyword, identifier, callSignature, block, false);
            };
            NormalModeFactory.prototype.emptyStatement = function (semicolonToken) {
                return new TypeScript.EmptyStatementSyntax(semicolonToken, false);
            };
            NormalModeFactory.prototype.tryStatement = function (tryKeyword, block, catchClause, finallyClause) {
                return new TypeScript.TryStatementSyntax(tryKeyword, block, catchClause, finallyClause, false);
            };
            NormalModeFactory.prototype.catchClause = function (catchKeyword, openParenToken, identifier, typeAnnotation, closeParenToken, block) {
                return new TypeScript.CatchClauseSyntax(catchKeyword, openParenToken, identifier, typeAnnotation, closeParenToken, block, false);
            };
            NormalModeFactory.prototype.finallyClause = function (finallyKeyword, block) {
                return new TypeScript.FinallyClauseSyntax(finallyKeyword, block, false);
            };
            NormalModeFactory.prototype.labeledStatement = function (identifier, colonToken, statement) {
                return new TypeScript.LabeledStatementSyntax(identifier, colonToken, statement, false);
            };
            NormalModeFactory.prototype.doStatement = function (doKeyword, statement, whileKeyword, openParenToken, condition, closeParenToken, semicolonToken) {
                return new TypeScript.DoStatementSyntax(doKeyword, statement, whileKeyword, openParenToken, condition, closeParenToken, semicolonToken, false);
            };
            NormalModeFactory.prototype.typeOfExpression = function (typeOfKeyword, expression) {
                return new TypeScript.TypeOfExpressionSyntax(typeOfKeyword, expression, false);
            };
            NormalModeFactory.prototype.deleteExpression = function (deleteKeyword, expression) {
                return new TypeScript.DeleteExpressionSyntax(deleteKeyword, expression, false);
            };
            NormalModeFactory.prototype.voidExpression = function (voidKeyword, expression) {
                return new TypeScript.VoidExpressionSyntax(voidKeyword, expression, false);
            };
            NormalModeFactory.prototype.debuggerStatement = function (debuggerKeyword, semicolonToken) {
                return new TypeScript.DebuggerStatementSyntax(debuggerKeyword, semicolonToken, false);
            };
            return NormalModeFactory;
        })();
        Syntax.NormalModeFactory = NormalModeFactory;

        var StrictModeFactory = (function () {
            function StrictModeFactory() {
            }
            StrictModeFactory.prototype.sourceUnit = function (moduleElements, endOfFileToken) {
                return new TypeScript.SourceUnitSyntax(moduleElements, endOfFileToken, true);
            };
            StrictModeFactory.prototype.externalModuleReference = function (moduleOrRequireKeyword, openParenToken, stringLiteral, closeParenToken) {
                return new TypeScript.ExternalModuleReferenceSyntax(moduleOrRequireKeyword, openParenToken, stringLiteral, closeParenToken, true);
            };
            StrictModeFactory.prototype.moduleNameModuleReference = function (moduleName) {
                return new TypeScript.ModuleNameModuleReferenceSyntax(moduleName, true);
            };
            StrictModeFactory.prototype.importDeclaration = function (importKeyword, identifier, equalsToken, moduleReference, semicolonToken) {
                return new TypeScript.ImportDeclarationSyntax(importKeyword, identifier, equalsToken, moduleReference, semicolonToken, true);
            };
            StrictModeFactory.prototype.exportAssignment = function (exportKeyword, equalsToken, identifier, semicolonToken) {
                return new TypeScript.ExportAssignmentSyntax(exportKeyword, equalsToken, identifier, semicolonToken, true);
            };
            StrictModeFactory.prototype.classDeclaration = function (modifiers, classKeyword, identifier, typeParameterList, heritageClauses, openBraceToken, classElements, closeBraceToken) {
                return new TypeScript.ClassDeclarationSyntax(modifiers, classKeyword, identifier, typeParameterList, heritageClauses, openBraceToken, classElements, closeBraceToken, true);
            };
            StrictModeFactory.prototype.interfaceDeclaration = function (modifiers, interfaceKeyword, identifier, typeParameterList, heritageClauses, body) {
                return new TypeScript.InterfaceDeclarationSyntax(modifiers, interfaceKeyword, identifier, typeParameterList, heritageClauses, body, true);
            };
            StrictModeFactory.prototype.heritageClause = function (extendsOrImplementsKeyword, typeNames) {
                return new TypeScript.HeritageClauseSyntax(extendsOrImplementsKeyword, typeNames, true);
            };
            StrictModeFactory.prototype.moduleDeclaration = function (modifiers, moduleKeyword, moduleName, stringLiteral, openBraceToken, moduleElements, closeBraceToken) {
                return new TypeScript.ModuleDeclarationSyntax(modifiers, moduleKeyword, moduleName, stringLiteral, openBraceToken, moduleElements, closeBraceToken, true);
            };
            StrictModeFactory.prototype.functionDeclaration = function (modifiers, functionKeyword, identifier, callSignature, block, semicolonToken) {
                return new TypeScript.FunctionDeclarationSyntax(modifiers, functionKeyword, identifier, callSignature, block, semicolonToken, true);
            };
            StrictModeFactory.prototype.variableStatement = function (modifiers, variableDeclaration, semicolonToken) {
                return new TypeScript.VariableStatementSyntax(modifiers, variableDeclaration, semicolonToken, true);
            };
            StrictModeFactory.prototype.variableDeclaration = function (varKeyword, variableDeclarators) {
                return new TypeScript.VariableDeclarationSyntax(varKeyword, variableDeclarators, true);
            };
            StrictModeFactory.prototype.variableDeclarator = function (identifier, typeAnnotation, equalsValueClause) {
                return new TypeScript.VariableDeclaratorSyntax(identifier, typeAnnotation, equalsValueClause, true);
            };
            StrictModeFactory.prototype.equalsValueClause = function (equalsToken, value) {
                return new TypeScript.EqualsValueClauseSyntax(equalsToken, value, true);
            };
            StrictModeFactory.prototype.prefixUnaryExpression = function (kind, operatorToken, operand) {
                return new TypeScript.PrefixUnaryExpressionSyntax(kind, operatorToken, operand, true);
            };
            StrictModeFactory.prototype.arrayLiteralExpression = function (openBracketToken, expressions, closeBracketToken) {
                return new TypeScript.ArrayLiteralExpressionSyntax(openBracketToken, expressions, closeBracketToken, true);
            };
            StrictModeFactory.prototype.omittedExpression = function () {
                return new TypeScript.OmittedExpressionSyntax(true);
            };
            StrictModeFactory.prototype.parenthesizedExpression = function (openParenToken, expression, closeParenToken) {
                return new TypeScript.ParenthesizedExpressionSyntax(openParenToken, expression, closeParenToken, true);
            };
            StrictModeFactory.prototype.simpleArrowFunctionExpression = function (identifier, equalsGreaterThanToken, body) {
                return new TypeScript.SimpleArrowFunctionExpressionSyntax(identifier, equalsGreaterThanToken, body, true);
            };
            StrictModeFactory.prototype.parenthesizedArrowFunctionExpression = function (callSignature, equalsGreaterThanToken, body) {
                return new TypeScript.ParenthesizedArrowFunctionExpressionSyntax(callSignature, equalsGreaterThanToken, body, true);
            };
            StrictModeFactory.prototype.qualifiedName = function (left, dotToken, right) {
                return new TypeScript.QualifiedNameSyntax(left, dotToken, right, true);
            };
            StrictModeFactory.prototype.typeArgumentList = function (lessThanToken, typeArguments, greaterThanToken) {
                return new TypeScript.TypeArgumentListSyntax(lessThanToken, typeArguments, greaterThanToken, true);
            };
            StrictModeFactory.prototype.constructorType = function (newKeyword, typeParameterList, parameterList, equalsGreaterThanToken, type) {
                return new TypeScript.ConstructorTypeSyntax(newKeyword, typeParameterList, parameterList, equalsGreaterThanToken, type, true);
            };
            StrictModeFactory.prototype.functionType = function (typeParameterList, parameterList, equalsGreaterThanToken, type) {
                return new TypeScript.FunctionTypeSyntax(typeParameterList, parameterList, equalsGreaterThanToken, type, true);
            };
            StrictModeFactory.prototype.objectType = function (openBraceToken, typeMembers, closeBraceToken) {
                return new TypeScript.ObjectTypeSyntax(openBraceToken, typeMembers, closeBraceToken, true);
            };
            StrictModeFactory.prototype.arrayType = function (type, openBracketToken, closeBracketToken) {
                return new TypeScript.ArrayTypeSyntax(type, openBracketToken, closeBracketToken, true);
            };
            StrictModeFactory.prototype.genericType = function (name, typeArgumentList) {
                return new TypeScript.GenericTypeSyntax(name, typeArgumentList, true);
            };
            StrictModeFactory.prototype.typeAnnotation = function (colonToken, type) {
                return new TypeScript.TypeAnnotationSyntax(colonToken, type, true);
            };
            StrictModeFactory.prototype.block = function (openBraceToken, statements, closeBraceToken) {
                return new TypeScript.BlockSyntax(openBraceToken, statements, closeBraceToken, true);
            };
            StrictModeFactory.prototype.parameter = function (dotDotDotToken, publicOrPrivateKeyword, identifier, questionToken, typeAnnotation, equalsValueClause) {
                return new TypeScript.ParameterSyntax(dotDotDotToken, publicOrPrivateKeyword, identifier, questionToken, typeAnnotation, equalsValueClause, true);
            };
            StrictModeFactory.prototype.memberAccessExpression = function (expression, dotToken, name) {
                return new TypeScript.MemberAccessExpressionSyntax(expression, dotToken, name, true);
            };
            StrictModeFactory.prototype.postfixUnaryExpression = function (kind, operand, operatorToken) {
                return new TypeScript.PostfixUnaryExpressionSyntax(kind, operand, operatorToken, true);
            };
            StrictModeFactory.prototype.elementAccessExpression = function (expression, openBracketToken, argumentExpression, closeBracketToken) {
                return new TypeScript.ElementAccessExpressionSyntax(expression, openBracketToken, argumentExpression, closeBracketToken, true);
            };
            StrictModeFactory.prototype.invocationExpression = function (expression, argumentList) {
                return new TypeScript.InvocationExpressionSyntax(expression, argumentList, true);
            };
            StrictModeFactory.prototype.argumentList = function (typeArgumentList, openParenToken, _arguments, closeParenToken) {
                return new TypeScript.ArgumentListSyntax(typeArgumentList, openParenToken, _arguments, closeParenToken, true);
            };
            StrictModeFactory.prototype.binaryExpression = function (kind, left, operatorToken, right) {
                return new TypeScript.BinaryExpressionSyntax(kind, left, operatorToken, right, true);
            };
            StrictModeFactory.prototype.conditionalExpression = function (condition, questionToken, whenTrue, colonToken, whenFalse) {
                return new TypeScript.ConditionalExpressionSyntax(condition, questionToken, whenTrue, colonToken, whenFalse, true);
            };
            StrictModeFactory.prototype.constructSignature = function (newKeyword, callSignature) {
                return new TypeScript.ConstructSignatureSyntax(newKeyword, callSignature, true);
            };
            StrictModeFactory.prototype.methodSignature = function (propertyName, questionToken, callSignature) {
                return new TypeScript.MethodSignatureSyntax(propertyName, questionToken, callSignature, true);
            };
            StrictModeFactory.prototype.indexSignature = function (openBracketToken, parameter, closeBracketToken, typeAnnotation) {
                return new TypeScript.IndexSignatureSyntax(openBracketToken, parameter, closeBracketToken, typeAnnotation, true);
            };
            StrictModeFactory.prototype.propertySignature = function (propertyName, questionToken, typeAnnotation) {
                return new TypeScript.PropertySignatureSyntax(propertyName, questionToken, typeAnnotation, true);
            };
            StrictModeFactory.prototype.callSignature = function (typeParameterList, parameterList, typeAnnotation) {
                return new TypeScript.CallSignatureSyntax(typeParameterList, parameterList, typeAnnotation, true);
            };
            StrictModeFactory.prototype.parameterList = function (openParenToken, parameters, closeParenToken) {
                return new TypeScript.ParameterListSyntax(openParenToken, parameters, closeParenToken, true);
            };
            StrictModeFactory.prototype.typeParameterList = function (lessThanToken, typeParameters, greaterThanToken) {
                return new TypeScript.TypeParameterListSyntax(lessThanToken, typeParameters, greaterThanToken, true);
            };
            StrictModeFactory.prototype.typeParameter = function (identifier, constraint) {
                return new TypeScript.TypeParameterSyntax(identifier, constraint, true);
            };
            StrictModeFactory.prototype.constraint = function (extendsKeyword, type) {
                return new TypeScript.ConstraintSyntax(extendsKeyword, type, true);
            };
            StrictModeFactory.prototype.elseClause = function (elseKeyword, statement) {
                return new TypeScript.ElseClauseSyntax(elseKeyword, statement, true);
            };
            StrictModeFactory.prototype.ifStatement = function (ifKeyword, openParenToken, condition, closeParenToken, statement, elseClause) {
                return new TypeScript.IfStatementSyntax(ifKeyword, openParenToken, condition, closeParenToken, statement, elseClause, true);
            };
            StrictModeFactory.prototype.expressionStatement = function (expression, semicolonToken) {
                return new TypeScript.ExpressionStatementSyntax(expression, semicolonToken, true);
            };
            StrictModeFactory.prototype.constructorDeclaration = function (constructorKeyword, parameterList, block, semicolonToken) {
                return new TypeScript.ConstructorDeclarationSyntax(constructorKeyword, parameterList, block, semicolonToken, true);
            };
            StrictModeFactory.prototype.memberFunctionDeclaration = function (modifiers, propertyName, callSignature, block, semicolonToken) {
                return new TypeScript.MemberFunctionDeclarationSyntax(modifiers, propertyName, callSignature, block, semicolonToken, true);
            };
            StrictModeFactory.prototype.getMemberAccessorDeclaration = function (modifiers, getKeyword, propertyName, parameterList, typeAnnotation, block) {
                return new TypeScript.GetMemberAccessorDeclarationSyntax(modifiers, getKeyword, propertyName, parameterList, typeAnnotation, block, true);
            };
            StrictModeFactory.prototype.setMemberAccessorDeclaration = function (modifiers, setKeyword, propertyName, parameterList, block) {
                return new TypeScript.SetMemberAccessorDeclarationSyntax(modifiers, setKeyword, propertyName, parameterList, block, true);
            };
            StrictModeFactory.prototype.memberVariableDeclaration = function (modifiers, variableDeclarator, semicolonToken) {
                return new TypeScript.MemberVariableDeclarationSyntax(modifiers, variableDeclarator, semicolonToken, true);
            };
            StrictModeFactory.prototype.throwStatement = function (throwKeyword, expression, semicolonToken) {
                return new TypeScript.ThrowStatementSyntax(throwKeyword, expression, semicolonToken, true);
            };
            StrictModeFactory.prototype.returnStatement = function (returnKeyword, expression, semicolonToken) {
                return new TypeScript.ReturnStatementSyntax(returnKeyword, expression, semicolonToken, true);
            };
            StrictModeFactory.prototype.objectCreationExpression = function (newKeyword, expression, argumentList) {
                return new TypeScript.ObjectCreationExpressionSyntax(newKeyword, expression, argumentList, true);
            };
            StrictModeFactory.prototype.switchStatement = function (switchKeyword, openParenToken, expression, closeParenToken, openBraceToken, switchClauses, closeBraceToken) {
                return new TypeScript.SwitchStatementSyntax(switchKeyword, openParenToken, expression, closeParenToken, openBraceToken, switchClauses, closeBraceToken, true);
            };
            StrictModeFactory.prototype.caseSwitchClause = function (caseKeyword, expression, colonToken, statements) {
                return new TypeScript.CaseSwitchClauseSyntax(caseKeyword, expression, colonToken, statements, true);
            };
            StrictModeFactory.prototype.defaultSwitchClause = function (defaultKeyword, colonToken, statements) {
                return new TypeScript.DefaultSwitchClauseSyntax(defaultKeyword, colonToken, statements, true);
            };
            StrictModeFactory.prototype.breakStatement = function (breakKeyword, identifier, semicolonToken) {
                return new TypeScript.BreakStatementSyntax(breakKeyword, identifier, semicolonToken, true);
            };
            StrictModeFactory.prototype.continueStatement = function (continueKeyword, identifier, semicolonToken) {
                return new TypeScript.ContinueStatementSyntax(continueKeyword, identifier, semicolonToken, true);
            };
            StrictModeFactory.prototype.forStatement = function (forKeyword, openParenToken, variableDeclaration, initializer, firstSemicolonToken, condition, secondSemicolonToken, incrementor, closeParenToken, statement) {
                return new TypeScript.ForStatementSyntax(forKeyword, openParenToken, variableDeclaration, initializer, firstSemicolonToken, condition, secondSemicolonToken, incrementor, closeParenToken, statement, true);
            };
            StrictModeFactory.prototype.forInStatement = function (forKeyword, openParenToken, variableDeclaration, left, inKeyword, expression, closeParenToken, statement) {
                return new TypeScript.ForInStatementSyntax(forKeyword, openParenToken, variableDeclaration, left, inKeyword, expression, closeParenToken, statement, true);
            };
            StrictModeFactory.prototype.whileStatement = function (whileKeyword, openParenToken, condition, closeParenToken, statement) {
                return new TypeScript.WhileStatementSyntax(whileKeyword, openParenToken, condition, closeParenToken, statement, true);
            };
            StrictModeFactory.prototype.withStatement = function (withKeyword, openParenToken, condition, closeParenToken, statement) {
                return new TypeScript.WithStatementSyntax(withKeyword, openParenToken, condition, closeParenToken, statement, true);
            };
            StrictModeFactory.prototype.enumDeclaration = function (modifiers, enumKeyword, identifier, openBraceToken, enumElements, closeBraceToken) {
                return new TypeScript.EnumDeclarationSyntax(modifiers, enumKeyword, identifier, openBraceToken, enumElements, closeBraceToken, true);
            };
            StrictModeFactory.prototype.enumElement = function (propertyName, equalsValueClause) {
                return new TypeScript.EnumElementSyntax(propertyName, equalsValueClause, true);
            };
            StrictModeFactory.prototype.castExpression = function (lessThanToken, type, greaterThanToken, expression) {
                return new TypeScript.CastExpressionSyntax(lessThanToken, type, greaterThanToken, expression, true);
            };
            StrictModeFactory.prototype.objectLiteralExpression = function (openBraceToken, propertyAssignments, closeBraceToken) {
                return new TypeScript.ObjectLiteralExpressionSyntax(openBraceToken, propertyAssignments, closeBraceToken, true);
            };
            StrictModeFactory.prototype.simplePropertyAssignment = function (propertyName, colonToken, expression) {
                return new TypeScript.SimplePropertyAssignmentSyntax(propertyName, colonToken, expression, true);
            };
            StrictModeFactory.prototype.functionPropertyAssignment = function (propertyName, callSignature, block) {
                return new TypeScript.FunctionPropertyAssignmentSyntax(propertyName, callSignature, block, true);
            };
            StrictModeFactory.prototype.getAccessorPropertyAssignment = function (getKeyword, propertyName, openParenToken, closeParenToken, typeAnnotation, block) {
                return new TypeScript.GetAccessorPropertyAssignmentSyntax(getKeyword, propertyName, openParenToken, closeParenToken, typeAnnotation, block, true);
            };
            StrictModeFactory.prototype.setAccessorPropertyAssignment = function (setKeyword, propertyName, openParenToken, parameter, closeParenToken, block) {
                return new TypeScript.SetAccessorPropertyAssignmentSyntax(setKeyword, propertyName, openParenToken, parameter, closeParenToken, block, true);
            };
            StrictModeFactory.prototype.functionExpression = function (functionKeyword, identifier, callSignature, block) {
                return new TypeScript.FunctionExpressionSyntax(functionKeyword, identifier, callSignature, block, true);
            };
            StrictModeFactory.prototype.emptyStatement = function (semicolonToken) {
                return new TypeScript.EmptyStatementSyntax(semicolonToken, true);
            };
            StrictModeFactory.prototype.tryStatement = function (tryKeyword, block, catchClause, finallyClause) {
                return new TypeScript.TryStatementSyntax(tryKeyword, block, catchClause, finallyClause, true);
            };
            StrictModeFactory.prototype.catchClause = function (catchKeyword, openParenToken, identifier, typeAnnotation, closeParenToken, block) {
                return new TypeScript.CatchClauseSyntax(catchKeyword, openParenToken, identifier, typeAnnotation, closeParenToken, block, true);
            };
            StrictModeFactory.prototype.finallyClause = function (finallyKeyword, block) {
                return new TypeScript.FinallyClauseSyntax(finallyKeyword, block, true);
            };
            StrictModeFactory.prototype.labeledStatement = function (identifier, colonToken, statement) {
                return new TypeScript.LabeledStatementSyntax(identifier, colonToken, statement, true);
            };
            StrictModeFactory.prototype.doStatement = function (doKeyword, statement, whileKeyword, openParenToken, condition, closeParenToken, semicolonToken) {
                return new TypeScript.DoStatementSyntax(doKeyword, statement, whileKeyword, openParenToken, condition, closeParenToken, semicolonToken, true);
            };
            StrictModeFactory.prototype.typeOfExpression = function (typeOfKeyword, expression) {
                return new TypeScript.TypeOfExpressionSyntax(typeOfKeyword, expression, true);
            };
            StrictModeFactory.prototype.deleteExpression = function (deleteKeyword, expression) {
                return new TypeScript.DeleteExpressionSyntax(deleteKeyword, expression, true);
            };
            StrictModeFactory.prototype.voidExpression = function (voidKeyword, expression) {
                return new TypeScript.VoidExpressionSyntax(voidKeyword, expression, true);
            };
            StrictModeFactory.prototype.debuggerStatement = function (debuggerKeyword, semicolonToken) {
                return new TypeScript.DebuggerStatementSyntax(debuggerKeyword, semicolonToken, true);
            };
            return StrictModeFactory;
        })();
        Syntax.StrictModeFactory = StrictModeFactory;

        Syntax.normalModeFactory = new NormalModeFactory();
        Syntax.strictModeFactory = new StrictModeFactory();
    })(TypeScript.Syntax || (TypeScript.Syntax = {}));
    var Syntax = TypeScript.Syntax;
})(TypeScript || (TypeScript = {}));
