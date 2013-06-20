var TypeScript;
(function (TypeScript) {
    (function (SyntaxFacts) {
        function isDirectivePrologueElement(node) {
            if (node.kind() === TypeScript.SyntaxKind.ExpressionStatement) {
                var expressionStatement = node;
                var expression = expressionStatement.expression;

                if (expression.kind() === TypeScript.SyntaxKind.StringLiteral) {
                    return true;
                }
            }

            return false;
        }
        SyntaxFacts.isDirectivePrologueElement = isDirectivePrologueElement;

        function isUseStrictDirective(node) {
            var expressionStatement = node;
            var stringLiteral = expressionStatement.expression;

            var text = stringLiteral.text();
            return text === '"use strict"' || text === "'use strict'";
        }
        SyntaxFacts.isUseStrictDirective = isUseStrictDirective;

        function isIdentifierNameOrAnyKeyword(token) {
            var tokenKind = token.tokenKind;
            return tokenKind === TypeScript.SyntaxKind.IdentifierName || TypeScript.SyntaxFacts.isAnyKeyword(tokenKind);
        }
        SyntaxFacts.isIdentifierNameOrAnyKeyword = isIdentifierNameOrAnyKeyword;
    })(TypeScript.SyntaxFacts || (TypeScript.SyntaxFacts = {}));
    var SyntaxFacts = TypeScript.SyntaxFacts;
})(TypeScript || (TypeScript = {}));
