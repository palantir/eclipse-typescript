var Services;
(function (Services) {
    var SignatureInfoHelpers = (function () {
        function SignatureInfoHelpers() {
        }
        SignatureInfoHelpers.isInPartiallyWrittenTypeArgumentList = function (syntaxTree, position) {
            var token = syntaxTree.sourceUnit().findTokenOnLeft(position, true);

            if (token && TypeScript.Syntax.hasAncestorOfKind(token, TypeScript.SyntaxKind.TypeParameterList)) {
                return null;
            }

            var stack = 0;
            var argumentIndex = 0;

            whileLoop:
            while (token) {
                switch (token.kind()) {
                    case TypeScript.SyntaxKind.LessThanToken:
                        if (stack === 0) {
                            var lessThanToken = token;
                            token = token.previousToken(true);
                            if (!token || token.kind() !== TypeScript.SyntaxKind.IdentifierName) {
                                break whileLoop;
                            }

                            return {
                                genericIdentifer: token,
                                lessThanToken: lessThanToken,
                                argumentIndex: argumentIndex
                            };
                        } else if (stack < 0) {
                            break whileLoop;
                        } else {
                            stack--;
                        }

                        break;

                    case TypeScript.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                        stack++;

                    case TypeScript.SyntaxKind.GreaterThanToken:
                        stack++;
                        break;

                    case TypeScript.SyntaxKind.CommaToken:
                        if (stack == 0) {
                            argumentIndex++;
                        }

                        break;

                    case TypeScript.SyntaxKind.CloseBraceToken:
                        var unmatchedOpenBraceTokens = 0;

                        token = SignatureInfoHelpers.moveBackUpTillMatchingTokenKind(token, TypeScript.SyntaxKind.CloseBraceToken, TypeScript.SyntaxKind.OpenBraceToken);
                        if (!token) {
                            break whileLoop;
                        }

                        break;

                    case TypeScript.SyntaxKind.EqualsGreaterThanToken:
                        token = token.previousToken(true);

                        if (token && token.kind() === TypeScript.SyntaxKind.CloseParenToken) {
                            token = SignatureInfoHelpers.moveBackUpTillMatchingTokenKind(token, TypeScript.SyntaxKind.CloseParenToken, TypeScript.SyntaxKind.OpenParenToken);

                            if (token && token.kind() === TypeScript.SyntaxKind.GreaterThanToken) {
                                token = SignatureInfoHelpers.moveBackUpTillMatchingTokenKind(token, TypeScript.SyntaxKind.GreaterThanToken, TypeScript.SyntaxKind.LessThanToken);
                            }

                            if (token && token.kind() === TypeScript.SyntaxKind.NewKeyword) {
                                token = token.previousToken(true);
                            }

                            if (!token) {
                                break whileLoop;
                            }
                        } else {
                            break whileLoop;
                        }

                        break;

                    case TypeScript.SyntaxKind.IdentifierName:
                    case TypeScript.SyntaxKind.AnyKeyword:
                    case TypeScript.SyntaxKind.NumberKeyword:
                    case TypeScript.SyntaxKind.StringKeyword:
                    case TypeScript.SyntaxKind.VoidKeyword:
                    case TypeScript.SyntaxKind.BooleanKeyword:
                    case TypeScript.SyntaxKind.BoolKeyword:
                    case TypeScript.SyntaxKind.DotToken:
                    case TypeScript.SyntaxKind.OpenBracketToken:
                    case TypeScript.SyntaxKind.CloseBracketToken:
                        break;

                    default:
                        break whileLoop;
                }

                token = token.previousToken(true);
            }

            return null;
        };

        SignatureInfoHelpers.getSignatureInfoFromSignatureSymbol = function (symbol, signatures, enclosingScopeSymbol, compilerState) {
            var signatureGroup = [];

            var hasOverloads = signatures.length > 1;

            for (var i = 0, n = signatures.length; i < n; i++) {
                var signature = signatures[i];

                if (hasOverloads && signature.isDefinition()) {
                    continue;
                }

                var signatureGroupInfo = new Services.FormalSignatureItemInfo();
                var paramIndexInfo = [];
                var functionName = signature.getScopedNameEx(enclosingScopeSymbol).toString();
                if (!functionName) {
                    functionName = symbol.getDisplayName();
                }

                var signatureMemberName = signature.getSignatureTypeNameEx(functionName, false, false, enclosingScopeSymbol, true, true);
                signatureGroupInfo.signatureInfo = TypeScript.MemberName.memberNameToString(signatureMemberName, paramIndexInfo);
                signatureGroupInfo.docComment = compilerState.getDocComments(signature);

                var parameterMarkerIndex = 0;

                if (signature.isGeneric()) {
                    var typeParameters = signature.getTypeParameters();
                    for (var j = 0, m = typeParameters.length; j < m; j++) {
                        var typeParameter = typeParameters[j];
                        var signatureTypeParameterInfo = new Services.FormalTypeParameterInfo();
                        signatureTypeParameterInfo.name = typeParameter.getDisplayName();
                        signatureTypeParameterInfo.docComment = compilerState.getDocComments(typeParameter);
                        signatureTypeParameterInfo.minChar = paramIndexInfo[2 * parameterMarkerIndex];
                        signatureTypeParameterInfo.limChar = paramIndexInfo[2 * parameterMarkerIndex + 1];
                        parameterMarkerIndex++;
                        signatureGroupInfo.typeParameters.push(signatureTypeParameterInfo);
                    }
                }

                var parameters = signature.getParameters();
                for (var j = 0, m = parameters.length; j < m; j++) {
                    var parameter = parameters[j];
                    var signatureParameterInfo = new Services.FormalParameterInfo();
                    signatureParameterInfo.isVariable = signature.hasVariableParamList() && (j === parameters.length - 1);
                    signatureParameterInfo.name = parameter.getDisplayName();
                    signatureParameterInfo.docComment = compilerState.getDocComments(parameter);
                    signatureParameterInfo.minChar = paramIndexInfo[2 * parameterMarkerIndex];
                    signatureParameterInfo.limChar = paramIndexInfo[2 * parameterMarkerIndex + 1];
                    parameterMarkerIndex++;
                    signatureGroupInfo.parameters.push(signatureParameterInfo);
                }

                signatureGroup.push(signatureGroupInfo);
            }

            return signatureGroup;
        };

        SignatureInfoHelpers.getSignatureInfoFromGenericSymbol = function (symbol, enclosingScopeSymbol, compilerState) {
            var signatureGroupInfo = new Services.FormalSignatureItemInfo();

            var paramIndexInfo = [];
            var symbolName = symbol.getScopedNameEx(enclosingScopeSymbol, true, false, true);

            signatureGroupInfo.signatureInfo = TypeScript.MemberName.memberNameToString(symbolName, paramIndexInfo);
            signatureGroupInfo.docComment = compilerState.getDocComments(symbol);

            var parameterMarkerIndex = 0;

            var typeSymbol = symbol.getType();

            var typeParameters = typeSymbol.getTypeParameters();
            for (var i = 0, n = typeParameters.length; i < n; i++) {
                var typeParameter = typeParameters[i];
                var signatureTypeParameterInfo = new Services.FormalTypeParameterInfo();
                signatureTypeParameterInfo.name = typeParameter.getDisplayName();
                signatureTypeParameterInfo.docComment = compilerState.getDocComments(typeParameter);
                signatureTypeParameterInfo.minChar = paramIndexInfo[2 * i];
                signatureTypeParameterInfo.limChar = paramIndexInfo[2 * i + 1];
                signatureGroupInfo.typeParameters.push(signatureTypeParameterInfo);
            }

            return [signatureGroupInfo];
        };

        SignatureInfoHelpers.getActualSignatureInfoFromCallExpression = function (ast, caretPosition, typeParameterInformation) {
            if (!ast) {
                return null;
            }

            var result = new Services.ActualSignatureInfo();

            var parameterMinChar = caretPosition;
            var parameterLimChar = caretPosition;

            if (ast.typeArguments) {
                parameterMinChar = Math.min(ast.typeArguments.minChar);
                parameterLimChar = Math.max(Math.max(ast.typeArguments.minChar, ast.typeArguments.limChar + ast.typeArguments.trailingTriviaWidth));
            }

            if (ast.arguments) {
                parameterMinChar = Math.min(parameterMinChar, ast.arguments.minChar);
                parameterLimChar = Math.max(parameterLimChar, Math.max(ast.arguments.minChar, ast.arguments.limChar + ast.arguments.trailingTriviaWidth));
            }

            result.parameterMinChar = parameterMinChar;
            result.parameterLimChar = parameterLimChar;
            result.currentParameterIsTypeParameter = false;
            result.currentParameter = -1;

            if (typeParameterInformation) {
                result.currentParameterIsTypeParameter = true;
                result.currentParameter = typeParameterInformation.argumentIndex;
            } else if (ast.arguments && ast.arguments.members) {
                result.currentParameter = 0;
                for (var index = 0; index < ast.arguments.members.length; index++) {
                    if (caretPosition > ast.arguments.members[index].limChar + ast.arguments.members[index].trailingTriviaWidth) {
                        result.currentParameter++;
                    }
                }
            }

            return result;
        };

        SignatureInfoHelpers.getActualSignatureInfoFromPartiallyWritenGenericExpression = function (caretPosition, typeParameterInformation) {
            var result = new Services.ActualSignatureInfo();

            result.parameterMinChar = typeParameterInformation.lessThanToken.start();
            result.parameterLimChar = Math.max(typeParameterInformation.lessThanToken.fullEnd(), caretPosition);
            result.currentParameterIsTypeParameter = true;
            result.currentParameter = typeParameterInformation.argumentIndex;

            return result;
        };

        SignatureInfoHelpers.isSignatureHelpBlocker = function (sourceUnit, position) {
            return TypeScript.Syntax.isEntirelyInsideComment(sourceUnit, position);
        };

        SignatureInfoHelpers.isTargetOfObjectCreationExpression = function (positionedToken) {
            var positionedParent = TypeScript.Syntax.getAncestorOfKind(positionedToken, TypeScript.SyntaxKind.ObjectCreationExpression);
            if (positionedParent) {
                var objectCreationExpression = positionedParent.element();
                var expressionRelativeStart = objectCreationExpression.newKeyword.fullWidth();
                var tokenRelativeStart = positionedToken.fullStart() - positionedParent.fullStart();
                return tokenRelativeStart >= expressionRelativeStart && tokenRelativeStart <= (expressionRelativeStart + objectCreationExpression.expression.fullWidth());
            }

            return false;
        };

        SignatureInfoHelpers.moveBackUpTillMatchingTokenKind = function (token, tokenKind, matchingTokenKind) {
            if (!token || token.kind() !== tokenKind) {
                throw TypeScript.Errors.invalidOperation();
            }

            token = token.previousToken(true);

            var stack = 0;

            while (token) {
                if (token.kind() === matchingTokenKind) {
                    if (stack === 0) {
                        return token;
                    } else if (stack < 0) {
                        break;
                    } else {
                        stack--;
                    }
                } else if (token.kind() === tokenKind) {
                    stack++;
                }

                token = token.previousToken(true);
            }

            return null;
        };
        return SignatureInfoHelpers;
    })();
    Services.SignatureInfoHelpers = SignatureInfoHelpers;
})(Services || (Services = {}));
