var Services;
(function (Services) {
    var FindReferenceHelpers = (function () {
        function FindReferenceHelpers() {
        }
        FindReferenceHelpers.getCorrectASTForReferencedSymbolName = function (matchingAST, symbolName) {
            if (matchingAST.nodeType == TypeScript.NodeType.MemberAccessExpression) {
                var binaryExpression = matchingAST;
                var identifierOperand1 = binaryExpression.operand1;
                var identifierOperand2 = binaryExpression.operand2;
                if (identifierOperand1.actualText === symbolName) {
                    return binaryExpression.operand1;
                } else if (identifierOperand2.actualText === symbolName) {
                    return binaryExpression.operand2;
                }
            }
            return matchingAST;
        };

        FindReferenceHelpers.compareSymbolsForLexicalIdentity = function (firstSymbol, secondSymbol) {
            if (firstSymbol.getKind() === secondSymbol.getKind()) {
                return firstSymbol === secondSymbol;
            } else {
                switch (firstSymbol.getKind()) {
                    case TypeScript.PullElementKind.Class: {
                        return this.checkSymbolsForDeclarationEquality(firstSymbol, secondSymbol);
                    }
                    case TypeScript.PullElementKind.Property: {
                        if (firstSymbol.isAccessor()) {
                            var getterSymbol = (firstSymbol).getGetter();
                            var setterSymbol = (firstSymbol).getSetter();

                            if (getterSymbol && getterSymbol === secondSymbol) {
                                return true;
                            }

                            if (setterSymbol && setterSymbol === secondSymbol) {
                                return true;
                            }
                        }
                        return false;
                    }
                    case TypeScript.PullElementKind.Function: {
                        if (secondSymbol.isAccessor()) {
                            var getterSymbol = (secondSymbol).getGetter();
                            var setterSymbol = (secondSymbol).getSetter();

                            if (getterSymbol && getterSymbol === firstSymbol) {
                                return true;
                            }

                            if (setterSymbol && setterSymbol === firstSymbol) {
                                return true;
                            }
                        }
                        return false;
                    }
                    case TypeScript.PullElementKind.ConstructorMethod: {
                        return this.checkSymbolsForDeclarationEquality(firstSymbol, secondSymbol);
                    }
                }
            }

            return firstSymbol === secondSymbol;
        };

        FindReferenceHelpers.checkSymbolsForDeclarationEquality = function (firstSymbol, secondSymbol) {
            var firstSymbolDeclarations = firstSymbol.getDeclarations();
            var secondSymbolDeclarations = secondSymbol.getDeclarations();
            for (var i = 0, iLen = firstSymbolDeclarations.length; i < iLen; i++) {
                for (var j = 0, jLen = secondSymbolDeclarations.length; j < jLen; j++) {
                    if (this.declarationsAreSameOrParents(firstSymbolDeclarations[i], secondSymbolDeclarations[j])) {
                        return true;
                    }
                }
            }
            return false;
        };

        FindReferenceHelpers.declarationsAreSameOrParents = function (firstDecl, secondDecl) {
            var firstParent = firstDecl.getParentDecl();
            var secondParent = secondDecl.getParentDecl();
            if (firstDecl === secondDecl || firstDecl === secondParent || firstParent === secondDecl || firstParent === secondParent) {
                return true;
            }
            return false;
        };
        return FindReferenceHelpers;
    })();
    Services.FindReferenceHelpers = FindReferenceHelpers;
})(Services || (Services = {}));
