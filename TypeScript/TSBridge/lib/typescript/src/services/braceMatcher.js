var Services;
(function (Services) {
    var BraceMatcher = (function () {
        function BraceMatcher() {
        }
        BraceMatcher.getMatchSpans = function (syntaxTree, position) {
            var result = [];

            var currentToken = syntaxTree.sourceUnit().findToken(position);

            BraceMatcher.getMatchingCloseBrace(currentToken, position, result);
            BraceMatcher.getMatchingOpenBrace(currentToken, position, result);

            return result;
        };

        BraceMatcher.getMatchingCloseBrace = function (currentToken, position, result) {
            if (currentToken.start() === position) {
                var closingBraceKind = BraceMatcher.getMatchingCloseBraceTokenKind(currentToken);
                if (closingBraceKind !== null) {
                    var parentElement = currentToken.parentElement();
                    var currentPosition = currentToken.parent().fullStart();
                    for (var i = 0, n = parentElement.childCount(); i < n; i++) {
                        var element = parentElement.childAt(i);
                        if (element !== null && element.fullWidth() > 0) {
                            if (element.kind() === closingBraceKind) {
                                var range1 = new TypeScript.TextSpan(position, currentToken.token().width());
                                var range2 = new TypeScript.TextSpan(currentPosition + element.leadingTriviaWidth(), element.width());
                                result.push(range1, range2);
                                break;
                            }

                            currentPosition += element.fullWidth();
                        }
                    }
                }
            }
        };

        BraceMatcher.getMatchingOpenBrace = function (currentToken, position, result) {
            if (currentToken.fullStart() === position) {
                currentToken = currentToken.previousToken();
            }

            if (currentToken !== null && currentToken.start() === (position - 1)) {
                var openBraceKind = BraceMatcher.getMatchingOpenBraceTokenKind(currentToken);
                if (openBraceKind !== null) {
                    var parentElement = currentToken.parentElement();
                    var currentPosition = currentToken.parent().fullStart() + parentElement.fullWidth();
                    for (var i = parentElement.childCount() - 1; i >= 0; i--) {
                        var element = parentElement.childAt(i);
                        if (element !== null && element.fullWidth() > 0) {
                            if (element.kind() === openBraceKind) {
                                var range1 = new TypeScript.TextSpan(position - 1, currentToken.token().width());
                                var range2 = new TypeScript.TextSpan(currentPosition - element.trailingTriviaWidth() - element.width(), element.width());
                                result.push(range1, range2);
                                break;
                            }

                            currentPosition -= element.fullWidth();
                        }
                    }
                }
            }
        };

        BraceMatcher.getMatchingCloseBraceTokenKind = function (positionedElement) {
            var element = positionedElement !== null && positionedElement.element();
            switch (element.kind()) {
                case TypeScript.SyntaxKind.OpenBraceToken:
                    return TypeScript.SyntaxKind.CloseBraceToken;
                case TypeScript.SyntaxKind.OpenParenToken:
                    return TypeScript.SyntaxKind.CloseParenToken;
                case TypeScript.SyntaxKind.OpenBracketToken:
                    return TypeScript.SyntaxKind.CloseBracketToken;
                case TypeScript.SyntaxKind.LessThanToken:
                    return TypeScript.SyntaxUtilities.isAngleBracket(positionedElement) ? TypeScript.SyntaxKind.GreaterThanToken : null;
            }
            return null;
        };

        BraceMatcher.getMatchingOpenBraceTokenKind = function (positionedElement) {
            var element = positionedElement !== null && positionedElement.element();
            switch (element.kind()) {
                case TypeScript.SyntaxKind.CloseBraceToken:
                    return TypeScript.SyntaxKind.OpenBraceToken;
                case TypeScript.SyntaxKind.CloseParenToken:
                    return TypeScript.SyntaxKind.OpenParenToken;
                case TypeScript.SyntaxKind.CloseBracketToken:
                    return TypeScript.SyntaxKind.OpenBracketToken;
                case TypeScript.SyntaxKind.GreaterThanToken:
                    return TypeScript.SyntaxUtilities.isAngleBracket(positionedElement) ? TypeScript.SyntaxKind.LessThanToken : null;
            }
            return null;
        };
        return BraceMatcher;
    })();
    Services.BraceMatcher = BraceMatcher;
})(Services || (Services = {}));
