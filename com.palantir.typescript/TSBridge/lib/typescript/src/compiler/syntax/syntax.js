var TypeScript;
(function (TypeScript) {
    (function (Syntax) {
        function emptySourceUnit() {
            return TypeScript.Syntax.normalModeFactory.sourceUnit(TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.EndOfFileToken, { text: "" }));
        }
        Syntax.emptySourceUnit = emptySourceUnit;

        function getStandaloneExpression(positionedToken) {
            var token = positionedToken.token();
            if (positionedToken !== null && positionedToken.kind() === TypeScript.SyntaxKind.IdentifierName) {
                var parentPositionedNode = positionedToken.containingNode();
                var parentNode = parentPositionedNode.node();

                if (parentNode.kind() === TypeScript.SyntaxKind.QualifiedName && (parentNode).right === token) {
                    return parentPositionedNode;
                } else if (parentNode.kind() === TypeScript.SyntaxKind.MemberAccessExpression && (parentNode).name === token) {
                    return parentPositionedNode;
                }
            }

            return positionedToken;
        }
        Syntax.getStandaloneExpression = getStandaloneExpression;

        function isInModuleOrTypeContext(positionedToken) {
            if (positionedToken !== null) {
                var positionedNodeOrToken = TypeScript.Syntax.getStandaloneExpression(positionedToken);
                var parent = positionedNodeOrToken.containingNode();

                if (parent !== null) {
                    switch (parent.kind()) {
                        case TypeScript.SyntaxKind.ModuleNameModuleReference:
                            return true;
                        case TypeScript.SyntaxKind.QualifiedName:
                            return true;
                        default:
                            return isInTypeOnlyContext(positionedToken);
                    }
                }
            }

            return false;
        }
        Syntax.isInModuleOrTypeContext = isInModuleOrTypeContext;

        function isInTypeOnlyContext(positionedToken) {
            var positionedNodeOrToken = TypeScript.Syntax.getStandaloneExpression(positionedToken);
            var positionedParent = positionedNodeOrToken.containingNode();

            var parent = positionedParent.node();
            var nodeOrToken = positionedNodeOrToken.nodeOrToken();

            if (parent !== null) {
                switch (parent.kind()) {
                    case TypeScript.SyntaxKind.ArrayType:
                        return (parent).type === nodeOrToken;
                    case TypeScript.SyntaxKind.CastExpression:
                        return (parent).type === nodeOrToken;
                    case TypeScript.SyntaxKind.TypeAnnotation:
                    case TypeScript.SyntaxKind.HeritageClause:
                    case TypeScript.SyntaxKind.TypeArgumentList:
                        return true;
                }
            }

            return false;
        }
        Syntax.isInTypeOnlyContext = isInTypeOnlyContext;

        function childOffset(parent, child) {
            var offset = 0;
            for (var i = 0, n = parent.childCount(); i < n; i++) {
                var current = parent.childAt(i);
                if (current === child) {
                    return offset;
                }

                if (current !== null) {
                    offset += current.fullWidth();
                }
            }

            throw TypeScript.Errors.invalidOperation();
        }
        Syntax.childOffset = childOffset;

        function childOffsetAt(parent, index) {
            var offset = 0;
            for (var i = 0; i < index; i++) {
                var current = parent.childAt(i);
                if (current !== null) {
                    offset += current.fullWidth();
                }
            }

            return offset;
        }
        Syntax.childOffsetAt = childOffsetAt;

        function childIndex(parent, child) {
            for (var i = 0, n = parent.childCount(); i < n; i++) {
                var current = parent.childAt(i);
                if (current === child) {
                    return i;
                }
            }

            throw TypeScript.Errors.invalidOperation();
        }
        Syntax.childIndex = childIndex;

        function nodeStructuralEquals(node1, node2) {
            if (node1 === null) {
                return node2 === null;
            }

            return node1.structuralEquals(node2);
        }
        Syntax.nodeStructuralEquals = nodeStructuralEquals;

        function nodeOrTokenStructuralEquals(node1, node2) {
            if (node1 === node2) {
                return true;
            }

            if (node1 === null || node2 === null) {
                return false;
            }

            if (node1.isToken()) {
                return node2.isToken() ? tokenStructuralEquals(node1, node2) : false;
            }

            return node2.isNode() ? nodeStructuralEquals(node1, node2) : false;
        }
        Syntax.nodeOrTokenStructuralEquals = nodeOrTokenStructuralEquals;

        function tokenStructuralEquals(token1, token2) {
            if (token1 === token2) {
                return true;
            }

            if (token1 === null || token2 === null) {
                return false;
            }

            return token1.kind() === token2.kind() && token1.width() === token2.width() && token1.fullWidth() === token2.fullWidth() && token1.text() === token2.text() && TypeScript.Syntax.triviaListStructuralEquals(token1.leadingTrivia(), token2.leadingTrivia()) && TypeScript.Syntax.triviaListStructuralEquals(token1.trailingTrivia(), token2.trailingTrivia());
        }
        Syntax.tokenStructuralEquals = tokenStructuralEquals;

        function triviaListStructuralEquals(triviaList1, triviaList2) {
            if (triviaList1.count() !== triviaList2.count()) {
                return false;
            }

            for (var i = 0, n = triviaList1.count(); i < n; i++) {
                if (!TypeScript.Syntax.triviaStructuralEquals(triviaList1.syntaxTriviaAt(i), triviaList2.syntaxTriviaAt(i))) {
                    return false;
                }
            }

            return true;
        }
        Syntax.triviaListStructuralEquals = triviaListStructuralEquals;

        function triviaStructuralEquals(trivia1, trivia2) {
            return trivia1.kind() === trivia2.kind() && trivia1.fullWidth() === trivia2.fullWidth() && trivia1.fullText() === trivia2.fullText();
        }
        Syntax.triviaStructuralEquals = triviaStructuralEquals;

        function listStructuralEquals(list1, list2) {
            if (list1.childCount() !== list2.childCount()) {
                return false;
            }

            for (var i = 0, n = list1.childCount(); i < n; i++) {
                var child1 = list1.childAt(i);
                var child2 = list2.childAt(i);

                if (!TypeScript.Syntax.nodeOrTokenStructuralEquals(child1, child2)) {
                    return false;
                }
            }

            return true;
        }
        Syntax.listStructuralEquals = listStructuralEquals;

        function separatedListStructuralEquals(list1, list2) {
            if (list1.childCount() !== list2.childCount()) {
                return false;
            }

            for (var i = 0, n = list1.childCount(); i < n; i++) {
                var element1 = list1.childAt(i);
                var element2 = list2.childAt(i);
                if (!TypeScript.Syntax.nodeOrTokenStructuralEquals(element1, element2)) {
                    return false;
                }
            }

            return true;
        }
        Syntax.separatedListStructuralEquals = separatedListStructuralEquals;

        function elementStructuralEquals(element1, element2) {
            if (element1 === element2) {
                return true;
            }

            if (element1 === null || element2 === null) {
                return false;
            }

            if (element2.kind() !== element2.kind()) {
                return false;
            }

            if (element1.isToken()) {
                return tokenStructuralEquals(element1, element2);
            } else if (element1.isNode()) {
                return nodeStructuralEquals(element1, element2);
            } else if (element1.isList()) {
                return listStructuralEquals(element1, element2);
            } else if (element1.isSeparatedList()) {
                return separatedListStructuralEquals(element1, element2);
            }

            throw TypeScript.Errors.invalidOperation();
        }
        Syntax.elementStructuralEquals = elementStructuralEquals;

        function identifierName(text, info) {
            if (typeof info === "undefined") { info = null; }
            return Syntax.identifier(text);
        }
        Syntax.identifierName = identifierName;

        function trueExpression() {
            return TypeScript.Syntax.token(TypeScript.SyntaxKind.TrueKeyword);
        }
        Syntax.trueExpression = trueExpression;

        function falseExpression() {
            return TypeScript.Syntax.token(TypeScript.SyntaxKind.FalseKeyword);
        }
        Syntax.falseExpression = falseExpression;

        function numericLiteralExpression(text) {
            return TypeScript.Syntax.token(TypeScript.SyntaxKind.NumericLiteral, { text: text });
        }
        Syntax.numericLiteralExpression = numericLiteralExpression;

        function stringLiteralExpression(text) {
            return TypeScript.Syntax.token(TypeScript.SyntaxKind.StringLiteral, { text: text });
        }
        Syntax.stringLiteralExpression = stringLiteralExpression;

        function isSuperInvocationExpression(node) {
            return node.kind() === TypeScript.SyntaxKind.InvocationExpression && (node).expression.kind() === TypeScript.SyntaxKind.SuperKeyword;
        }
        Syntax.isSuperInvocationExpression = isSuperInvocationExpression;

        function isSuperInvocationExpressionStatement(node) {
            return node.kind() === TypeScript.SyntaxKind.ExpressionStatement && isSuperInvocationExpression((node).expression);
        }
        Syntax.isSuperInvocationExpressionStatement = isSuperInvocationExpressionStatement;

        function isSuperMemberAccessExpression(node) {
            return node.kind() === TypeScript.SyntaxKind.MemberAccessExpression && (node).expression.kind() === TypeScript.SyntaxKind.SuperKeyword;
        }
        Syntax.isSuperMemberAccessExpression = isSuperMemberAccessExpression;

        function isSuperMemberAccessInvocationExpression(node) {
            return node.kind() === TypeScript.SyntaxKind.InvocationExpression && isSuperMemberAccessExpression((node).expression);
        }
        Syntax.isSuperMemberAccessInvocationExpression = isSuperMemberAccessInvocationExpression;

        function assignmentExpression(left, token, right) {
            return TypeScript.Syntax.normalModeFactory.binaryExpression(TypeScript.SyntaxKind.AssignmentExpression, left, token, right);
        }
        Syntax.assignmentExpression = assignmentExpression;

        function nodeHasSkippedOrMissingTokens(node) {
            for (var i = 0; i < node.childCount(); i++) {
                var child = node.childAt(i);
                if (child !== null && child.isToken()) {
                    var token = child;

                    if (token.hasSkippedToken() || (token.width() === 0 && token.kind() !== TypeScript.SyntaxKind.EndOfFileToken)) {
                        return true;
                    }
                }
            }
            return false;
        }
        Syntax.nodeHasSkippedOrMissingTokens = nodeHasSkippedOrMissingTokens;

        function isUnterminatedStringLiteral(token) {
            if (token && token.kind() === TypeScript.SyntaxKind.StringLiteral) {
                var text = token.text();
                return text.length < 2 || text.charCodeAt(text.length - 1) !== text.charCodeAt(0);
            }

            return false;
        }
        Syntax.isUnterminatedStringLiteral = isUnterminatedStringLiteral;

        function isUnterminatedMultilineCommentTrivia(trivia) {
            if (trivia && trivia.kind() === TypeScript.SyntaxKind.MultiLineCommentTrivia) {
                var text = trivia.fullText();
                return text.length < 4 || text.substring(text.length - 2) !== "*/";
            }
            return false;
        }
        Syntax.isUnterminatedMultilineCommentTrivia = isUnterminatedMultilineCommentTrivia;

        function isEntirelyInsideCommentTrivia(trivia, fullStart, position) {
            if (trivia && trivia.isComment() && position > fullStart) {
                var end = fullStart + trivia.fullWidth();
                if (position < end) {
                    return true;
                } else if (position === end) {
                    return trivia.kind() === TypeScript.SyntaxKind.SingleLineCommentTrivia || isUnterminatedMultilineCommentTrivia(trivia);
                }
            }

            return false;
        }
        Syntax.isEntirelyInsideCommentTrivia = isEntirelyInsideCommentTrivia;

        function isEntirelyInsideComment(sourceUnit, position) {
            var positionedToken = sourceUnit.findToken(position);
            var fullStart = positionedToken.fullStart();
            var triviaList = null;
            var lastTriviaBeforeToken = null;

            if (positionedToken.kind() === TypeScript.SyntaxKind.EndOfFileToken) {
                if (positionedToken.token().hasLeadingTrivia()) {
                    triviaList = positionedToken.token().leadingTrivia();
                } else {
                    positionedToken = positionedToken.previousToken();
                    if (positionedToken) {
                        if (positionedToken && positionedToken.token().hasTrailingTrivia()) {
                            triviaList = positionedToken.token().trailingTrivia();
                            fullStart = positionedToken.end();
                        }
                    }
                }
            } else {
                if (position <= (fullStart + positionedToken.token().leadingTriviaWidth())) {
                    triviaList = positionedToken.token().leadingTrivia();
                } else if (position >= (fullStart + positionedToken.token().width())) {
                    triviaList = positionedToken.token().trailingTrivia();
                    fullStart = positionedToken.end();
                }
            }

            if (triviaList) {
                for (var i = 0, n = triviaList.count(); i < n; i++) {
                    var trivia = triviaList.syntaxTriviaAt(i);
                    if (position <= fullStart) {
                        break;
                    } else if (position <= fullStart + trivia.fullWidth() && trivia.isComment()) {
                        lastTriviaBeforeToken = trivia;
                        break;
                    }

                    fullStart += trivia.fullWidth();
                }
            }

            return lastTriviaBeforeToken && isEntirelyInsideCommentTrivia(lastTriviaBeforeToken, fullStart, position);
        }
        Syntax.isEntirelyInsideComment = isEntirelyInsideComment;

        function isEntirelyInStringOrRegularExpressionLiteral(sourceUnit, position) {
            var positionedToken = sourceUnit.findToken(position);

            if (positionedToken) {
                if (positionedToken.kind() === TypeScript.SyntaxKind.EndOfFileToken) {
                    positionedToken = positionedToken.previousToken();
                    return positionedToken && positionedToken.token().trailingTriviaWidth() === 0 && isUnterminatedStringLiteral(positionedToken.token());
                } else if (position > positionedToken.start()) {
                    return (position < positionedToken.end() && (positionedToken.kind() === TypeScript.SyntaxKind.StringLiteral || positionedToken.kind() === TypeScript.SyntaxKind.RegularExpressionLiteral)) || (position <= positionedToken.end() && isUnterminatedStringLiteral(positionedToken.token()));
                }
            }

            return false;
        }
        Syntax.isEntirelyInStringOrRegularExpressionLiteral = isEntirelyInStringOrRegularExpressionLiteral;

        function findSkippedTokenInTriviaList(positionedToken, position, lookInLeadingTriviaList) {
            var triviaList = null;
            var fullStart;

            if (lookInLeadingTriviaList) {
                triviaList = positionedToken.token().leadingTrivia();
                fullStart = positionedToken.fullStart();
            } else {
                triviaList = positionedToken.token().trailingTrivia();
                fullStart = positionedToken.end();
            }

            if (triviaList && triviaList.hasSkippedToken()) {
                for (var i = 0, n = triviaList.count(); i < n; i++) {
                    var trivia = triviaList.syntaxTriviaAt(i);
                    var triviaWidth = trivia.fullWidth();

                    if (trivia.isSkippedToken() && position >= fullStart && position <= fullStart + triviaWidth) {
                        return new TypeScript.PositionedSkippedToken(positionedToken, trivia.skippedToken(), fullStart);
                    }

                    fullStart += triviaWidth;
                }
            }

            return null;
        }

        function findSkippedTokenInLeadingTriviaList(positionedToken, position) {
            return findSkippedTokenInTriviaList(positionedToken, position, true);
        }
        Syntax.findSkippedTokenInLeadingTriviaList = findSkippedTokenInLeadingTriviaList;

        function findSkippedTokenInTrailingTriviaList(positionedToken, position) {
            return findSkippedTokenInTriviaList(positionedToken, position, false);
        }
        Syntax.findSkippedTokenInTrailingTriviaList = findSkippedTokenInTrailingTriviaList;

        function findSkippedTokenInPositionedToken(positionedToken, position) {
            var positionInLeadingTriviaList = (position < positionedToken.start());
            return findSkippedTokenInTriviaList(positionedToken, position, positionInLeadingTriviaList);
        }
        Syntax.findSkippedTokenInPositionedToken = findSkippedTokenInPositionedToken;

        function getAncestorOfKind(positionedToken, kind) {
            while (positionedToken && positionedToken.parent()) {
                if (positionedToken.parent().kind() === kind) {
                    return positionedToken.parent();
                }

                positionedToken = positionedToken.parent();
            }

            return null;
        }
        Syntax.getAncestorOfKind = getAncestorOfKind;

        function hasAncestorOfKind(positionedToken, kind) {
            return TypeScript.Syntax.getAncestorOfKind(positionedToken, kind) !== null;
        }
        Syntax.hasAncestorOfKind = hasAncestorOfKind;
    })(TypeScript.Syntax || (TypeScript.Syntax = {}));
    var Syntax = TypeScript.Syntax;
})(TypeScript || (TypeScript = {}));
