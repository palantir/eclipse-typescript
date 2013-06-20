var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        (function (Shared) {
            var TokenRangeAccess = (function () {
                function TokenRangeAccess(from, to, except) {
                    this.tokens = [];
                    for (var token = from; token <= to; token++) {
                        if (except.indexOf(token) < 0) {
                            this.tokens.push(token);
                        }
                    }
                }
                TokenRangeAccess.prototype.GetTokens = function () {
                    return this.tokens;
                };

                TokenRangeAccess.prototype.Contains = function (token) {
                    return this.tokens.indexOf(token) >= 0;
                };

                TokenRangeAccess.prototype.toString = function () {
                    return "[tokenRangeStart=" + TypeScript.SyntaxKind[this.tokens[0]] + "," + "tokenRangeEnd=" + TypeScript.SyntaxKind[this.tokens[this.tokens.length - 1]] + "]";
                };
                return TokenRangeAccess;
            })();
            Shared.TokenRangeAccess = TokenRangeAccess;

            var TokenValuesAccess = (function () {
                function TokenValuesAccess(tks) {
                    this.tokens = tks && tks.length ? tks : [];
                }
                TokenValuesAccess.prototype.GetTokens = function () {
                    return this.tokens;
                };

                TokenValuesAccess.prototype.Contains = function (token) {
                    return this.tokens.indexOf(token) >= 0;
                };
                return TokenValuesAccess;
            })();
            Shared.TokenValuesAccess = TokenValuesAccess;

            var TokenSingleValueAccess = (function () {
                function TokenSingleValueAccess(token) {
                    this.token = token;
                }
                TokenSingleValueAccess.prototype.GetTokens = function () {
                    return [this.token];
                };

                TokenSingleValueAccess.prototype.Contains = function (tokenValue) {
                    return tokenValue == this.token;
                };

                TokenSingleValueAccess.prototype.toString = function () {
                    return "[singleTokenKind=" + TypeScript.SyntaxKind[this.token] + "]";
                };
                return TokenSingleValueAccess;
            })();
            Shared.TokenSingleValueAccess = TokenSingleValueAccess;

            var TokenAllAccess = (function () {
                function TokenAllAccess() {
                }
                TokenAllAccess.prototype.GetTokens = function () {
                    var result = [];
                    for (var token = TypeScript.SyntaxKind.FirstToken; token <= TypeScript.SyntaxKind.LastToken; token++) {
                        result.push(token);
                    }
                    return result;
                };

                TokenAllAccess.prototype.Contains = function (tokenValue) {
                    return true;
                };

                TokenAllAccess.prototype.toString = function () {
                    return "[allTokens]";
                };
                return TokenAllAccess;
            })();
            Shared.TokenAllAccess = TokenAllAccess;

            var TokenRange = (function () {
                function TokenRange(tokenAccess) {
                    this.tokenAccess = tokenAccess;
                }
                TokenRange.FromToken = function (token) {
                    return new TokenRange(new TokenSingleValueAccess(token));
                };

                TokenRange.FromTokens = function (tokens) {
                    return new TokenRange(new TokenValuesAccess(tokens));
                };

                TokenRange.FromRange = function (f, to, except) {
                    if (typeof except === "undefined") { except = []; }
                    return new TokenRange(new TokenRangeAccess(f, to, except));
                };

                TokenRange.AllTokens = function () {
                    return new TokenRange(new TokenAllAccess());
                };

                TokenRange.prototype.GetTokens = function () {
                    return this.tokenAccess.GetTokens();
                };

                TokenRange.prototype.Contains = function (token) {
                    return this.tokenAccess.Contains(token);
                };

                TokenRange.prototype.toString = function () {
                    return this.tokenAccess.toString();
                };

                TokenRange.Any = TokenRange.AllTokens();
                TokenRange.Keywords = TokenRange.FromRange(TypeScript.SyntaxKind.FirstKeyword, TypeScript.SyntaxKind.LastKeyword);
                TokenRange.Operators = TokenRange.FromRange(TypeScript.SyntaxKind.SemicolonToken, TypeScript.SyntaxKind.SlashEqualsToken);
                TokenRange.BinaryOperators = TokenRange.FromRange(TypeScript.SyntaxKind.LessThanToken, TypeScript.SyntaxKind.SlashEqualsToken);
                TokenRange.BinaryKeywordOperators = TokenRange.FromTokens([TypeScript.SyntaxKind.InKeyword, TypeScript.SyntaxKind.InstanceOfKeyword]);
                TokenRange.ReservedKeywords = TokenRange.FromRange(TypeScript.SyntaxKind.FirstFutureReservedStrictKeyword, TypeScript.SyntaxKind.LastFutureReservedStrictKeyword);
                TokenRange.UnaryPrefixOperators = TokenRange.FromTokens([TypeScript.SyntaxKind.PlusPlusToken, TypeScript.SyntaxKind.MinusMinusToken, TypeScript.SyntaxKind.TildeToken, TypeScript.SyntaxKind.ExclamationToken]);
                TokenRange.UnaryPrefixExpressions = TokenRange.FromTokens([TypeScript.SyntaxKind.NumericLiteral, TypeScript.SyntaxKind.IdentifierName, TypeScript.SyntaxKind.OpenParenToken, TypeScript.SyntaxKind.OpenBracketToken, TypeScript.SyntaxKind.OpenBraceToken, TypeScript.SyntaxKind.ThisKeyword, TypeScript.SyntaxKind.NewKeyword]);
                TokenRange.UnaryPreincrementExpressions = TokenRange.FromTokens([TypeScript.SyntaxKind.IdentifierName, TypeScript.SyntaxKind.OpenParenToken, TypeScript.SyntaxKind.ThisKeyword, TypeScript.SyntaxKind.NewKeyword]);
                TokenRange.UnaryPostincrementExpressions = TokenRange.FromTokens([TypeScript.SyntaxKind.IdentifierName, TypeScript.SyntaxKind.CloseParenToken, TypeScript.SyntaxKind.CloseBracketToken, TypeScript.SyntaxKind.NewKeyword]);
                TokenRange.UnaryPredecrementExpressions = TokenRange.FromTokens([TypeScript.SyntaxKind.IdentifierName, TypeScript.SyntaxKind.OpenParenToken, TypeScript.SyntaxKind.ThisKeyword, TypeScript.SyntaxKind.NewKeyword]);
                TokenRange.UnaryPostdecrementExpressions = TokenRange.FromTokens([TypeScript.SyntaxKind.IdentifierName, TypeScript.SyntaxKind.CloseParenToken, TypeScript.SyntaxKind.CloseBracketToken, TypeScript.SyntaxKind.NewKeyword]);
                TokenRange.Comments = TokenRange.FromTokens([TypeScript.SyntaxKind.SingleLineCommentTrivia, TypeScript.SyntaxKind.MultiLineCommentTrivia]);
                TokenRange.TypeNames = TokenRange.FromTokens([TypeScript.SyntaxKind.IdentifierName, TypeScript.SyntaxKind.NumberKeyword, TypeScript.SyntaxKind.StringKeyword, TypeScript.SyntaxKind.BooleanKeyword, TypeScript.SyntaxKind.BoolKeyword, TypeScript.SyntaxKind.VoidKeyword, TypeScript.SyntaxKind.AnyKeyword]);
                return TokenRange;
            })();
            Shared.TokenRange = TokenRange;
        })(Formatting.Shared || (Formatting.Shared = {}));
        var Shared = Formatting.Shared;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
