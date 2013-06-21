var Services;
(function (Services) {
    var CompletionHelpers = (function () {
        function CompletionHelpers() {
        }
        CompletionHelpers.filterContextualMembersList = function (contextualMemberSymbols, existingMembers) {
            if (!existingMembers || !existingMembers.symbols || existingMembers.symbols.length === 0) {
                return contextualMemberSymbols;
            }

            var existingMemberSymbols = existingMembers.symbols;
            var existingMemberNames = {};
            for (var i = 0, n = existingMemberSymbols.length; i < n; i++) {
                existingMemberNames[TypeScript.stripQuotes(existingMemberSymbols[i].getDisplayName())] = true;
            }

            var filteredMembers = [];
            for (var j = 0, m = contextualMemberSymbols.length; j < m; j++) {
                var contextualMemberSymbol = contextualMemberSymbols[j];
                if (!existingMemberNames[TypeScript.stripQuotes(contextualMemberSymbol.getDisplayName())]) {
                    filteredMembers.push(contextualMemberSymbol);
                }
            }

            return filteredMembers;
        };

        CompletionHelpers.isRightOfDot = function (path, position) {
            return (path.count() >= 1 && path.asts[path.top].nodeType === TypeScript.NodeType.MemberAccessExpression && (path.asts[path.top]).operand1.limChar < position) || (path.count() >= 2 && path.asts[path.top].nodeType === TypeScript.NodeType.Name && path.asts[path.top - 1].nodeType === TypeScript.NodeType.MemberAccessExpression && (path.asts[path.top - 1]).operand2 === path.asts[path.top]);
        };

        CompletionHelpers.isCompletionListBlocker = function (sourceUnit, position) {
            return TypeScript.Syntax.isEntirelyInsideComment(sourceUnit, position) || TypeScript.Syntax.isEntirelyInStringOrRegularExpressionLiteral(sourceUnit, position) || CompletionHelpers.isIdentifierDefinitionLocation(sourceUnit, position) || CompletionHelpers.isRightOfIllegalDot(sourceUnit, position);
        };

        CompletionHelpers.getContaingingObjectLiteralApplicableForCompletion = function (sourceUnit, position) {
            var previousToken = CompletionHelpers.getNonIdentifierCompleteTokenOnLeft(sourceUnit, position);

            if (previousToken) {
                var parent = previousToken.parent();

                switch (previousToken.kind()) {
                    case TypeScript.SyntaxKind.OpenBraceToken:
                    case TypeScript.SyntaxKind.CommaToken:
                        if (parent && parent.kind() === TypeScript.SyntaxKind.SeparatedList) {
                            parent = parent.parent();
                        }

                        if (parent && parent.kind() === TypeScript.SyntaxKind.ObjectLiteralExpression) {
                            return parent;
                        }

                        break;
                }
            }

            return null;
        };

        CompletionHelpers.isIdentifierDefinitionLocation = function (sourceUnit, position) {
            var positionedToken = CompletionHelpers.getNonIdentifierCompleteTokenOnLeft(sourceUnit, position);

            if (positionedToken) {
                var containingNodeKind = positionedToken.containingNode() && positionedToken.containingNode().kind();
                switch (positionedToken.kind()) {
                    case TypeScript.SyntaxKind.CommaToken:
                        return containingNodeKind === TypeScript.SyntaxKind.ParameterList || containingNodeKind === TypeScript.SyntaxKind.VariableDeclaration;

                    case TypeScript.SyntaxKind.OpenParenToken:
                        return containingNodeKind === TypeScript.SyntaxKind.ParameterList || containingNodeKind === TypeScript.SyntaxKind.CatchClause;

                    case TypeScript.SyntaxKind.PublicKeyword:
                    case TypeScript.SyntaxKind.PrivateKeyword:
                    case TypeScript.SyntaxKind.StaticKeyword:
                    case TypeScript.SyntaxKind.DotDotDotToken:
                        return containingNodeKind === TypeScript.SyntaxKind.Parameter;

                    case TypeScript.SyntaxKind.ClassKeyword:
                    case TypeScript.SyntaxKind.ModuleKeyword:
                    case TypeScript.SyntaxKind.EnumKeyword:
                    case TypeScript.SyntaxKind.InterfaceKeyword:
                    case TypeScript.SyntaxKind.FunctionKeyword:
                    case TypeScript.SyntaxKind.VarKeyword:
                    case TypeScript.SyntaxKind.GetKeyword:
                    case TypeScript.SyntaxKind.SetKeyword:
                        return true;
                }

                switch (positionedToken.token().text()) {
                    case "class":
                    case "interface":
                    case "enum":
                    case "module":
                        return true;
                }
            }

            return false;
        };

        CompletionHelpers.getNonIdentifierCompleteTokenOnLeft = function (sourceUnit, position) {
            var positionedToken = sourceUnit.findCompleteTokenOnLeft(position, true);

            if (positionedToken && position === positionedToken.end() && positionedToken.kind() == TypeScript.SyntaxKind.EndOfFileToken) {
                positionedToken = positionedToken.previousToken(true);
            }

            if (positionedToken && position === positionedToken.end() && positionedToken.kind() === TypeScript.SyntaxKind.IdentifierName) {
                positionedToken = positionedToken.previousToken(true);
            }

            return positionedToken;
        };

        CompletionHelpers.isRightOfIllegalDot = function (sourceUnit, position) {
            var positionedToken = CompletionHelpers.getNonIdentifierCompleteTokenOnLeft(sourceUnit, position);

            if (positionedToken) {
                switch (positionedToken.kind()) {
                    case TypeScript.SyntaxKind.DotToken:
                        var leftOfDotPositionedToken = positionedToken.previousToken(true);
                        return leftOfDotPositionedToken && leftOfDotPositionedToken.kind() === TypeScript.SyntaxKind.NumericLiteral;

                    case TypeScript.SyntaxKind.NumericLiteral:
                        var text = positionedToken.token().text();
                        return text.charAt(text.length - 1) === ".";
                }
            }

            return false;
        };

        CompletionHelpers.getValidCompletionEntryDisplayName = function (symbol, languageVersion) {
            var displayName = symbol.getDisplayName();

            if (displayName && displayName.length > 0) {
                var firstChar = displayName.charCodeAt(0);
                if (firstChar === TypeScript.CharacterCodes.singleQuote || firstChar === TypeScript.CharacterCodes.doubleQuote) {
                    displayName = TypeScript.stripQuotes(displayName);

                    if (TypeScript.Scanner.isValidIdentifier(TypeScript.SimpleText.fromString(displayName), languageVersion)) {
                        return displayName;
                    }
                } else {
                    return displayName;
                }
            }

            return null;
        };
        return CompletionHelpers;
    })();
    Services.CompletionHelpers = CompletionHelpers;
})(Services || (Services = {}));
