var Services;
(function (Services) {
    var Indenter = (function () {
        function Indenter() {
        }
        Indenter.getIndentation = function (node, soruceText, position, editorOptions) {
            var indentation = 0;
            var currentToken = node.findToken(position);
            var currentNode = currentToken;

            if (currentToken.token().kind() === TypeScript.SyntaxKind.EndOfFileToken) {
                currentNode = currentToken.previousToken();
            } else if (Indenter.belongsToBracket(soruceText, currentToken, position)) {
                currentNode = currentToken.parent();
            }

            if (currentNode === null) {
                return indentation;
            }

            if (currentNode.kind() === TypeScript.SyntaxKind.StringLiteral || currentNode.kind() === TypeScript.SyntaxKind.RegularExpressionLiteral) {
                return indentation;
            }

            var currentElement = currentNode.element();
            var parent = currentNode.parent();

            while (parent !== null) {
                if (parent.fullStart() !== currentNode.fullStart()) {
                    if (Indenter.isInContainerNode(parent.element(), currentElement)) {
                        indentation += editorOptions.IndentSize;
                    } else {
                        var listIndentation = Indenter.getCustomListIndentation(parent.element(), currentElement);
                        if (listIndentation !== -1) {
                            return indentation + listIndentation;
                        }
                    }
                }
                currentNode = parent;
                currentElement = parent.element();
                parent = parent.parent();
            }

            return indentation;
        };

        Indenter.belongsToBracket = function (sourceText, token, position) {
            switch (token.token().kind()) {
                case TypeScript.SyntaxKind.OpenBraceToken:
                case TypeScript.SyntaxKind.CloseBraceToken:
                case TypeScript.SyntaxKind.OpenParenToken:
                case TypeScript.SyntaxKind.CloseParenToken:
                case TypeScript.SyntaxKind.OpenBracketToken:
                case TypeScript.SyntaxKind.CloseBracketToken:
                    if (position < token.start()) {
                        var text = sourceText.getText(position, token.start());
                        for (var i = 0; i < text.length; i++) {
                            if (TypeScript.CharacterInfo.isLineTerminator(text.charCodeAt(i))) {
                                return false;
                            }
                        }
                    }
                    return true;
            }
            return false;
        };

        Indenter.isInContainerNode = function (parent, element) {
            switch (parent.kind()) {
                case TypeScript.SyntaxKind.ClassDeclaration:
                case TypeScript.SyntaxKind.ModuleDeclaration:
                case TypeScript.SyntaxKind.EnumDeclaration:
                case TypeScript.SyntaxKind.ImportDeclaration:
                case TypeScript.SyntaxKind.Block:
                case TypeScript.SyntaxKind.SwitchStatement:
                case TypeScript.SyntaxKind.CaseSwitchClause:
                case TypeScript.SyntaxKind.DefaultSwitchClause:
                    return true;

                case TypeScript.SyntaxKind.ObjectType:
                    return true;

                case TypeScript.SyntaxKind.InterfaceDeclaration:
                    return element.kind() !== TypeScript.SyntaxKind.ObjectType;

                case TypeScript.SyntaxKind.FunctionDeclaration:
                case TypeScript.SyntaxKind.MemberFunctionDeclaration:
                case TypeScript.SyntaxKind.GetMemberAccessorDeclaration:
                case TypeScript.SyntaxKind.SetMemberAccessorDeclaration:
                case TypeScript.SyntaxKind.GetAccessorPropertyAssignment:
                case TypeScript.SyntaxKind.SetAccessorPropertyAssignment:
                case TypeScript.SyntaxKind.FunctionExpression:
                case TypeScript.SyntaxKind.CatchClause:
                case TypeScript.SyntaxKind.FinallyClause:
                case TypeScript.SyntaxKind.FunctionDeclaration:
                case TypeScript.SyntaxKind.ConstructorDeclaration:
                case TypeScript.SyntaxKind.ForStatement:
                case TypeScript.SyntaxKind.ForInStatement:
                case TypeScript.SyntaxKind.WhileStatement:
                case TypeScript.SyntaxKind.DoStatement:
                case TypeScript.SyntaxKind.WithStatement:
                case TypeScript.SyntaxKind.IfStatement:
                case TypeScript.SyntaxKind.ElseClause:
                    return element.kind() !== TypeScript.SyntaxKind.Block;

                case TypeScript.SyntaxKind.TryStatement:
                    return false;
                default:
                    return parent.isNode() && (parent).isStatement();
            }
        };

        Indenter.getCustomListIndentation = function (list, element) {
            switch (list.kind()) {
                case TypeScript.SyntaxKind.SeparatedList:
                    for (var i = 0, n = list.childCount(); i < n; i++) {
                        var child = list.childAt(i);
                        if (child !== null && child === element)
                            return Indenter.getListItemIndentation(list, i - 1);
                    }
                    break;

                case TypeScript.SyntaxKind.ArgumentList:
                    var argumentList = list;
                    var arguments = argumentList.arguments;
                    if (arguments !== null && argumentList.closeParenToken === element) {
                        return Indenter.getListItemIndentation(arguments, arguments.childCount() - 1);
                    }
                    break;

                case TypeScript.SyntaxKind.ParameterList:
                    var parameterList = list;
                    var parameters = parameterList.parameters;
                    if (parameters !== null && parameterList.closeParenToken === element) {
                        return Indenter.getListItemIndentation(parameters, parameters.childCount() - 1);
                    }
                    break;

                case TypeScript.SyntaxKind.TypeArgumentList:
                    var typeArgumentList = list;
                    var typeArguments = typeArgumentList.typeArguments;
                    if (typeArguments !== null && typeArgumentList.greaterThanToken === element) {
                        return Indenter.getListItemIndentation(typeArguments, typeArguments.childCount() - 1);
                    }
                    break;

                case TypeScript.SyntaxKind.TypeParameterList:
                    var typeParameterList = list;
                    var typeParameters = typeParameterList.typeParameters;
                    if (typeParameters !== null && typeParameterList.greaterThanToken === element) {
                        return Indenter.getListItemIndentation(typeParameters, typeParameters.childCount() - 1);
                    }
                    break;
            }
            return -1;
        };

        Indenter.getListItemIndentation = function (list, elementIndex) {
            for (var i = elementIndex; i > 0; i--) {
                var child = list.childAt(i);
                var previousChild = list.childAt(i - 1);
                if ((child !== null && child.leadingTrivia().hasNewLine()) || (previousChild !== null && previousChild.trailingTrivia().hasNewLine())) {
                    return child.leadingTriviaWidth();
                }
            }
            return -1;
        };
        return Indenter;
    })();
    Services.Indenter = Indenter;
})(Services || (Services = {}));
