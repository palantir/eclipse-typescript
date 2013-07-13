var TypeScript;
(function (TypeScript) {
    (function (SyntaxFacts) {
        var textToKeywordKind = {
            "any": TypeScript.SyntaxKind.AnyKeyword,
            "bool": TypeScript.SyntaxKind.BoolKeyword,
            "boolean": TypeScript.SyntaxKind.BooleanKeyword,
            "break": TypeScript.SyntaxKind.BreakKeyword,
            "case": TypeScript.SyntaxKind.CaseKeyword,
            "catch": TypeScript.SyntaxKind.CatchKeyword,
            "class": TypeScript.SyntaxKind.ClassKeyword,
            "continue": TypeScript.SyntaxKind.ContinueKeyword,
            "const": TypeScript.SyntaxKind.ConstKeyword,
            "constructor": TypeScript.SyntaxKind.ConstructorKeyword,
            "debugger": TypeScript.SyntaxKind.DebuggerKeyword,
            "declare": TypeScript.SyntaxKind.DeclareKeyword,
            "default": TypeScript.SyntaxKind.DefaultKeyword,
            "delete": TypeScript.SyntaxKind.DeleteKeyword,
            "do": TypeScript.SyntaxKind.DoKeyword,
            "else": TypeScript.SyntaxKind.ElseKeyword,
            "enum": TypeScript.SyntaxKind.EnumKeyword,
            "export": TypeScript.SyntaxKind.ExportKeyword,
            "extends": TypeScript.SyntaxKind.ExtendsKeyword,
            "false": TypeScript.SyntaxKind.FalseKeyword,
            "finally": TypeScript.SyntaxKind.FinallyKeyword,
            "for": TypeScript.SyntaxKind.ForKeyword,
            "function": TypeScript.SyntaxKind.FunctionKeyword,
            "get": TypeScript.SyntaxKind.GetKeyword,
            "if": TypeScript.SyntaxKind.IfKeyword,
            "implements": TypeScript.SyntaxKind.ImplementsKeyword,
            "import": TypeScript.SyntaxKind.ImportKeyword,
            "in": TypeScript.SyntaxKind.InKeyword,
            "instanceof": TypeScript.SyntaxKind.InstanceOfKeyword,
            "interface": TypeScript.SyntaxKind.InterfaceKeyword,
            "let": TypeScript.SyntaxKind.LetKeyword,
            "module": TypeScript.SyntaxKind.ModuleKeyword,
            "new": TypeScript.SyntaxKind.NewKeyword,
            "null": TypeScript.SyntaxKind.NullKeyword,
            "number": TypeScript.SyntaxKind.NumberKeyword,
            "package": TypeScript.SyntaxKind.PackageKeyword,
            "private": TypeScript.SyntaxKind.PrivateKeyword,
            "protected": TypeScript.SyntaxKind.ProtectedKeyword,
            "public": TypeScript.SyntaxKind.PublicKeyword,
            "require": TypeScript.SyntaxKind.RequireKeyword,
            "return": TypeScript.SyntaxKind.ReturnKeyword,
            "set": TypeScript.SyntaxKind.SetKeyword,
            "static": TypeScript.SyntaxKind.StaticKeyword,
            "string": TypeScript.SyntaxKind.StringKeyword,
            "super": TypeScript.SyntaxKind.SuperKeyword,
            "switch": TypeScript.SyntaxKind.SwitchKeyword,
            "this": TypeScript.SyntaxKind.ThisKeyword,
            "throw": TypeScript.SyntaxKind.ThrowKeyword,
            "true": TypeScript.SyntaxKind.TrueKeyword,
            "try": TypeScript.SyntaxKind.TryKeyword,
            "typeof": TypeScript.SyntaxKind.TypeOfKeyword,
            "var": TypeScript.SyntaxKind.VarKeyword,
            "void": TypeScript.SyntaxKind.VoidKeyword,
            "while": TypeScript.SyntaxKind.WhileKeyword,
            "with": TypeScript.SyntaxKind.WithKeyword,
            "yield": TypeScript.SyntaxKind.YieldKeyword,
            "{": TypeScript.SyntaxKind.OpenBraceToken,
            "}": TypeScript.SyntaxKind.CloseBraceToken,
            "(": TypeScript.SyntaxKind.OpenParenToken,
            ")": TypeScript.SyntaxKind.CloseParenToken,
            "[": TypeScript.SyntaxKind.OpenBracketToken,
            "]": TypeScript.SyntaxKind.CloseBracketToken,
            ".": TypeScript.SyntaxKind.DotToken,
            "...": TypeScript.SyntaxKind.DotDotDotToken,
            ";": TypeScript.SyntaxKind.SemicolonToken,
            ",": TypeScript.SyntaxKind.CommaToken,
            "<": TypeScript.SyntaxKind.LessThanToken,
            ">": TypeScript.SyntaxKind.GreaterThanToken,
            "<=": TypeScript.SyntaxKind.LessThanEqualsToken,
            ">=": TypeScript.SyntaxKind.GreaterThanEqualsToken,
            "==": TypeScript.SyntaxKind.EqualsEqualsToken,
            "=>": TypeScript.SyntaxKind.EqualsGreaterThanToken,
            "!=": TypeScript.SyntaxKind.ExclamationEqualsToken,
            "===": TypeScript.SyntaxKind.EqualsEqualsEqualsToken,
            "!==": TypeScript.SyntaxKind.ExclamationEqualsEqualsToken,
            "+": TypeScript.SyntaxKind.PlusToken,
            "-": TypeScript.SyntaxKind.MinusToken,
            "*": TypeScript.SyntaxKind.AsteriskToken,
            "%": TypeScript.SyntaxKind.PercentToken,
            "++": TypeScript.SyntaxKind.PlusPlusToken,
            "--": TypeScript.SyntaxKind.MinusMinusToken,
            "<<": TypeScript.SyntaxKind.LessThanLessThanToken,
            ">>": TypeScript.SyntaxKind.GreaterThanGreaterThanToken,
            ">>>": TypeScript.SyntaxKind.GreaterThanGreaterThanGreaterThanToken,
            "&": TypeScript.SyntaxKind.AmpersandToken,
            "|": TypeScript.SyntaxKind.BarToken,
            "^": TypeScript.SyntaxKind.CaretToken,
            "!": TypeScript.SyntaxKind.ExclamationToken,
            "~": TypeScript.SyntaxKind.TildeToken,
            "&&": TypeScript.SyntaxKind.AmpersandAmpersandToken,
            "||": TypeScript.SyntaxKind.BarBarToken,
            "?": TypeScript.SyntaxKind.QuestionToken,
            ":": TypeScript.SyntaxKind.ColonToken,
            "=": TypeScript.SyntaxKind.EqualsToken,
            "+=": TypeScript.SyntaxKind.PlusEqualsToken,
            "-=": TypeScript.SyntaxKind.MinusEqualsToken,
            "*=": TypeScript.SyntaxKind.AsteriskEqualsToken,
            "%=": TypeScript.SyntaxKind.PercentEqualsToken,
            "<<=": TypeScript.SyntaxKind.LessThanLessThanEqualsToken,
            ">>=": TypeScript.SyntaxKind.GreaterThanGreaterThanEqualsToken,
            ">>>=": TypeScript.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
            "&=": TypeScript.SyntaxKind.AmpersandEqualsToken,
            "|=": TypeScript.SyntaxKind.BarEqualsToken,
            "^=": TypeScript.SyntaxKind.CaretEqualsToken,
            "/": TypeScript.SyntaxKind.SlashToken,
            "/=": TypeScript.SyntaxKind.SlashEqualsToken
        };

        var kindToText = [];

        for (var name in textToKeywordKind) {
            if (textToKeywordKind.hasOwnProperty(name)) {
                kindToText[textToKeywordKind[name]] = name;
            }
        }

        kindToText[TypeScript.SyntaxKind.ConstructorKeyword] = "constructor";

        function getTokenKind(text) {
            if (textToKeywordKind.hasOwnProperty(text)) {
                return textToKeywordKind[text];
            }

            return TypeScript.SyntaxKind.None;
        }
        SyntaxFacts.getTokenKind = getTokenKind;

        function getText(kind) {
            var result = kindToText[kind];
            return result !== undefined ? result : null;
        }
        SyntaxFacts.getText = getText;

        function isTokenKind(kind) {
            return kind >= TypeScript.SyntaxKind.FirstToken && kind <= TypeScript.SyntaxKind.LastToken;
        }
        SyntaxFacts.isTokenKind = isTokenKind;

        function isAnyKeyword(kind) {
            return kind >= TypeScript.SyntaxKind.FirstKeyword && kind <= TypeScript.SyntaxKind.LastKeyword;
        }
        SyntaxFacts.isAnyKeyword = isAnyKeyword;

        function isStandardKeyword(kind) {
            return kind >= TypeScript.SyntaxKind.FirstStandardKeyword && kind <= TypeScript.SyntaxKind.LastStandardKeyword;
        }
        SyntaxFacts.isStandardKeyword = isStandardKeyword;

        function isFutureReservedKeyword(kind) {
            return kind >= TypeScript.SyntaxKind.FirstFutureReservedKeyword && kind <= TypeScript.SyntaxKind.LastFutureReservedKeyword;
        }
        SyntaxFacts.isFutureReservedKeyword = isFutureReservedKeyword;

        function isFutureReservedStrictKeyword(kind) {
            return kind >= TypeScript.SyntaxKind.FirstFutureReservedStrictKeyword && kind <= TypeScript.SyntaxKind.LastFutureReservedStrictKeyword;
        }
        SyntaxFacts.isFutureReservedStrictKeyword = isFutureReservedStrictKeyword;

        function isAnyPunctuation(kind) {
            return kind >= TypeScript.SyntaxKind.FirstPunctuation && kind <= TypeScript.SyntaxKind.LastPunctuation;
        }
        SyntaxFacts.isAnyPunctuation = isAnyPunctuation;

        function isPrefixUnaryExpressionOperatorToken(tokenKind) {
            return getPrefixUnaryExpressionFromOperatorToken(tokenKind) !== TypeScript.SyntaxKind.None;
        }
        SyntaxFacts.isPrefixUnaryExpressionOperatorToken = isPrefixUnaryExpressionOperatorToken;

        function isBinaryExpressionOperatorToken(tokenKind) {
            return getBinaryExpressionFromOperatorToken(tokenKind) !== TypeScript.SyntaxKind.None;
        }
        SyntaxFacts.isBinaryExpressionOperatorToken = isBinaryExpressionOperatorToken;

        function getPrefixUnaryExpressionFromOperatorToken(tokenKind) {
            switch (tokenKind) {
                case TypeScript.SyntaxKind.PlusToken:
                    return TypeScript.SyntaxKind.PlusExpression;
                case TypeScript.SyntaxKind.MinusToken:
                    return TypeScript.SyntaxKind.NegateExpression;
                case TypeScript.SyntaxKind.TildeToken:
                    return TypeScript.SyntaxKind.BitwiseNotExpression;
                case TypeScript.SyntaxKind.ExclamationToken:
                    return TypeScript.SyntaxKind.LogicalNotExpression;
                case TypeScript.SyntaxKind.PlusPlusToken:
                    return TypeScript.SyntaxKind.PreIncrementExpression;
                case TypeScript.SyntaxKind.MinusMinusToken:
                    return TypeScript.SyntaxKind.PreDecrementExpression;

                default:
                    return TypeScript.SyntaxKind.None;
            }
        }
        SyntaxFacts.getPrefixUnaryExpressionFromOperatorToken = getPrefixUnaryExpressionFromOperatorToken;

        function getPostfixUnaryExpressionFromOperatorToken(tokenKind) {
            switch (tokenKind) {
                case TypeScript.SyntaxKind.PlusPlusToken:
                    return TypeScript.SyntaxKind.PostIncrementExpression;
                case TypeScript.SyntaxKind.MinusMinusToken:
                    return TypeScript.SyntaxKind.PostDecrementExpression;
                default:
                    return TypeScript.SyntaxKind.None;
            }
        }
        SyntaxFacts.getPostfixUnaryExpressionFromOperatorToken = getPostfixUnaryExpressionFromOperatorToken;

        function getBinaryExpressionFromOperatorToken(tokenKind) {
            switch (tokenKind) {
                case TypeScript.SyntaxKind.AsteriskToken:
                    return TypeScript.SyntaxKind.MultiplyExpression;

                case TypeScript.SyntaxKind.SlashToken:
                    return TypeScript.SyntaxKind.DivideExpression;

                case TypeScript.SyntaxKind.PercentToken:
                    return TypeScript.SyntaxKind.ModuloExpression;

                case TypeScript.SyntaxKind.PlusToken:
                    return TypeScript.SyntaxKind.AddExpression;

                case TypeScript.SyntaxKind.MinusToken:
                    return TypeScript.SyntaxKind.SubtractExpression;

                case TypeScript.SyntaxKind.LessThanLessThanToken:
                    return TypeScript.SyntaxKind.LeftShiftExpression;

                case TypeScript.SyntaxKind.GreaterThanGreaterThanToken:
                    return TypeScript.SyntaxKind.SignedRightShiftExpression;

                case TypeScript.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                    return TypeScript.SyntaxKind.UnsignedRightShiftExpression;

                case TypeScript.SyntaxKind.LessThanToken:
                    return TypeScript.SyntaxKind.LessThanExpression;

                case TypeScript.SyntaxKind.GreaterThanToken:
                    return TypeScript.SyntaxKind.GreaterThanExpression;

                case TypeScript.SyntaxKind.LessThanEqualsToken:
                    return TypeScript.SyntaxKind.LessThanOrEqualExpression;

                case TypeScript.SyntaxKind.GreaterThanEqualsToken:
                    return TypeScript.SyntaxKind.GreaterThanOrEqualExpression;

                case TypeScript.SyntaxKind.InstanceOfKeyword:
                    return TypeScript.SyntaxKind.InstanceOfExpression;

                case TypeScript.SyntaxKind.InKeyword:
                    return TypeScript.SyntaxKind.InExpression;

                case TypeScript.SyntaxKind.EqualsEqualsToken:
                    return TypeScript.SyntaxKind.EqualsWithTypeConversionExpression;

                case TypeScript.SyntaxKind.ExclamationEqualsToken:
                    return TypeScript.SyntaxKind.NotEqualsWithTypeConversionExpression;

                case TypeScript.SyntaxKind.EqualsEqualsEqualsToken:
                    return TypeScript.SyntaxKind.EqualsExpression;

                case TypeScript.SyntaxKind.ExclamationEqualsEqualsToken:
                    return TypeScript.SyntaxKind.NotEqualsExpression;

                case TypeScript.SyntaxKind.AmpersandToken:
                    return TypeScript.SyntaxKind.BitwiseAndExpression;

                case TypeScript.SyntaxKind.CaretToken:
                    return TypeScript.SyntaxKind.BitwiseExclusiveOrExpression;

                case TypeScript.SyntaxKind.BarToken:
                    return TypeScript.SyntaxKind.BitwiseOrExpression;

                case TypeScript.SyntaxKind.AmpersandAmpersandToken:
                    return TypeScript.SyntaxKind.LogicalAndExpression;

                case TypeScript.SyntaxKind.BarBarToken:
                    return TypeScript.SyntaxKind.LogicalOrExpression;

                case TypeScript.SyntaxKind.BarEqualsToken:
                    return TypeScript.SyntaxKind.OrAssignmentExpression;

                case TypeScript.SyntaxKind.AmpersandEqualsToken:
                    return TypeScript.SyntaxKind.AndAssignmentExpression;

                case TypeScript.SyntaxKind.CaretEqualsToken:
                    return TypeScript.SyntaxKind.ExclusiveOrAssignmentExpression;

                case TypeScript.SyntaxKind.LessThanLessThanEqualsToken:
                    return TypeScript.SyntaxKind.LeftShiftAssignmentExpression;

                case TypeScript.SyntaxKind.GreaterThanGreaterThanEqualsToken:
                    return TypeScript.SyntaxKind.SignedRightShiftAssignmentExpression;

                case TypeScript.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
                    return TypeScript.SyntaxKind.UnsignedRightShiftAssignmentExpression;

                case TypeScript.SyntaxKind.PlusEqualsToken:
                    return TypeScript.SyntaxKind.AddAssignmentExpression;

                case TypeScript.SyntaxKind.MinusEqualsToken:
                    return TypeScript.SyntaxKind.SubtractAssignmentExpression;

                case TypeScript.SyntaxKind.AsteriskEqualsToken:
                    return TypeScript.SyntaxKind.MultiplyAssignmentExpression;

                case TypeScript.SyntaxKind.SlashEqualsToken:
                    return TypeScript.SyntaxKind.DivideAssignmentExpression;

                case TypeScript.SyntaxKind.PercentEqualsToken:
                    return TypeScript.SyntaxKind.ModuloAssignmentExpression;

                case TypeScript.SyntaxKind.EqualsToken:
                    return TypeScript.SyntaxKind.AssignmentExpression;

                case TypeScript.SyntaxKind.CommaToken:
                    return TypeScript.SyntaxKind.CommaExpression;

                default:
                    return TypeScript.SyntaxKind.None;
            }
        }
        SyntaxFacts.getBinaryExpressionFromOperatorToken = getBinaryExpressionFromOperatorToken;

        function isAnyDivideToken(kind) {
            switch (kind) {
                case TypeScript.SyntaxKind.SlashToken:
                case TypeScript.SyntaxKind.SlashEqualsToken:
                    return true;
                default:
                    return false;
            }
        }
        SyntaxFacts.isAnyDivideToken = isAnyDivideToken;

        function isAnyDivideOrRegularExpressionToken(kind) {
            switch (kind) {
                case TypeScript.SyntaxKind.SlashToken:
                case TypeScript.SyntaxKind.SlashEqualsToken:
                case TypeScript.SyntaxKind.RegularExpressionLiteral:
                    return true;
                default:
                    return false;
            }
        }
        SyntaxFacts.isAnyDivideOrRegularExpressionToken = isAnyDivideOrRegularExpressionToken;

        function isParserGenerated(kind) {
            switch (kind) {
                case TypeScript.SyntaxKind.GreaterThanGreaterThanToken:
                case TypeScript.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                case TypeScript.SyntaxKind.GreaterThanEqualsToken:
                case TypeScript.SyntaxKind.GreaterThanGreaterThanEqualsToken:
                case TypeScript.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
                    return true;
                default:
                    return false;
            }
        }
        SyntaxFacts.isParserGenerated = isParserGenerated;

        function isAnyBinaryExpression(kind) {
            switch (kind) {
                case TypeScript.SyntaxKind.CommaExpression:
                case TypeScript.SyntaxKind.AssignmentExpression:
                case TypeScript.SyntaxKind.AddAssignmentExpression:
                case TypeScript.SyntaxKind.SubtractAssignmentExpression:
                case TypeScript.SyntaxKind.MultiplyAssignmentExpression:
                case TypeScript.SyntaxKind.DivideAssignmentExpression:
                case TypeScript.SyntaxKind.ModuloAssignmentExpression:
                case TypeScript.SyntaxKind.AndAssignmentExpression:
                case TypeScript.SyntaxKind.ExclusiveOrAssignmentExpression:
                case TypeScript.SyntaxKind.OrAssignmentExpression:
                case TypeScript.SyntaxKind.LeftShiftAssignmentExpression:
                case TypeScript.SyntaxKind.SignedRightShiftAssignmentExpression:
                case TypeScript.SyntaxKind.UnsignedRightShiftAssignmentExpression:
                case TypeScript.SyntaxKind.LogicalOrExpression:
                case TypeScript.SyntaxKind.LogicalAndExpression:
                case TypeScript.SyntaxKind.BitwiseOrExpression:
                case TypeScript.SyntaxKind.BitwiseExclusiveOrExpression:
                case TypeScript.SyntaxKind.BitwiseAndExpression:
                case TypeScript.SyntaxKind.EqualsWithTypeConversionExpression:
                case TypeScript.SyntaxKind.NotEqualsWithTypeConversionExpression:
                case TypeScript.SyntaxKind.EqualsExpression:
                case TypeScript.SyntaxKind.NotEqualsExpression:
                case TypeScript.SyntaxKind.LessThanExpression:
                case TypeScript.SyntaxKind.GreaterThanExpression:
                case TypeScript.SyntaxKind.LessThanOrEqualExpression:
                case TypeScript.SyntaxKind.GreaterThanOrEqualExpression:
                case TypeScript.SyntaxKind.InstanceOfExpression:
                case TypeScript.SyntaxKind.InExpression:
                case TypeScript.SyntaxKind.LeftShiftExpression:
                case TypeScript.SyntaxKind.SignedRightShiftExpression:
                case TypeScript.SyntaxKind.UnsignedRightShiftExpression:
                case TypeScript.SyntaxKind.MultiplyExpression:
                case TypeScript.SyntaxKind.DivideExpression:
                case TypeScript.SyntaxKind.ModuloExpression:
                case TypeScript.SyntaxKind.AddExpression:
                case TypeScript.SyntaxKind.SubtractExpression:
                    return true;
            }

            return false;
        }
        SyntaxFacts.isAnyBinaryExpression = isAnyBinaryExpression;
    })(TypeScript.SyntaxFacts || (TypeScript.SyntaxFacts = {}));
    var SyntaxFacts = TypeScript.SyntaxFacts;
})(TypeScript || (TypeScript = {}));
