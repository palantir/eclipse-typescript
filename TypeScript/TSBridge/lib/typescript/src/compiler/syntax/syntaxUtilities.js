var TypeScript;
(function (TypeScript) {
    var SyntaxUtilities = (function () {
        function SyntaxUtilities() {
        }
        SyntaxUtilities.isAngleBracket = function (positionedElement) {
            var element = positionedElement.element();
            var parent = positionedElement.parentElement();
            if (parent !== null && (element.kind() === TypeScript.SyntaxKind.LessThanToken || element.kind() === TypeScript.SyntaxKind.GreaterThanToken)) {
                switch (parent.kind()) {
                    case TypeScript.SyntaxKind.TypeArgumentList:
                    case TypeScript.SyntaxKind.TypeParameterList:
                    case TypeScript.SyntaxKind.CastExpression:
                        return true;
                }
            }

            return false;
        };

        SyntaxUtilities.getToken = function (list, kind) {
            for (var i = 0, n = list.childCount(); i < n; i++) {
                var token = list.childAt(i);
                if (token.tokenKind === kind) {
                    return token;
                }
            }

            return null;
        };

        SyntaxUtilities.containsToken = function (list, kind) {
            return SyntaxUtilities.getToken(list, kind) !== null;
        };

        SyntaxUtilities.hasExportKeyword = function (moduleElement) {
            switch (moduleElement.kind()) {
                case TypeScript.SyntaxKind.ModuleDeclaration:
                case TypeScript.SyntaxKind.ClassDeclaration:
                case TypeScript.SyntaxKind.FunctionDeclaration:
                case TypeScript.SyntaxKind.VariableStatement:
                case TypeScript.SyntaxKind.EnumDeclaration:
                case TypeScript.SyntaxKind.InterfaceDeclaration:
                    return SyntaxUtilities.containsToken((moduleElement).modifiers, TypeScript.SyntaxKind.ExportKeyword);
            }

            return false;
        };

        SyntaxUtilities.isAmbientDeclarationSyntax = function (positionNode) {
            if (!positionNode) {
                return false;
            }

            var node = positionNode.node();
            switch (node.kind()) {
                case TypeScript.SyntaxKind.ModuleDeclaration:
                case TypeScript.SyntaxKind.ClassDeclaration:
                case TypeScript.SyntaxKind.FunctionDeclaration:
                case TypeScript.SyntaxKind.VariableStatement:
                case TypeScript.SyntaxKind.EnumDeclaration:
                    if (SyntaxUtilities.containsToken((node).modifiers, TypeScript.SyntaxKind.DeclareKeyword)) {
                        return true;
                    }

                case TypeScript.SyntaxKind.ImportDeclaration:
                case TypeScript.SyntaxKind.ConstructorDeclaration:
                case TypeScript.SyntaxKind.MemberFunctionDeclaration:
                case TypeScript.SyntaxKind.GetMemberAccessorDeclaration:
                case TypeScript.SyntaxKind.SetMemberAccessorDeclaration:
                case TypeScript.SyntaxKind.MemberVariableDeclaration:
                    if (node.isClassElement() || node.isModuleElement()) {
                        return SyntaxUtilities.isAmbientDeclarationSyntax(positionNode.containingNode());
                    }

                case TypeScript.SyntaxKind.EnumElement:
                    return SyntaxUtilities.isAmbientDeclarationSyntax(positionNode.containingNode().containingNode());

                default:
                    return SyntaxUtilities.isAmbientDeclarationSyntax(positionNode.containingNode());
            }
        };
        return SyntaxUtilities;
    })();
    TypeScript.SyntaxUtilities = SyntaxUtilities;
})(TypeScript || (TypeScript = {}));
