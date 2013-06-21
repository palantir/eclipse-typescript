var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var Rules = (function () {
            function Rules() {
                this.IgnoreBeforeComment = new Formatting.Rule(Formatting.RuleDescriptor.create4(Formatting.Shared.TokenRange.Any, Formatting.Shared.TokenRange.Comments), Formatting.RuleOperation.create1(Formatting.RuleAction.Ignore));
                this.IgnoreAfterLineComment = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.SingleLineCommentTrivia, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create1(Formatting.RuleAction.Ignore));

                this.NoSpaceBeforeSemicolon = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.SemicolonToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));
                this.NoSpaceBeforeColon = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.ColonToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotBinaryOpContext), Formatting.RuleAction.Delete));
                this.NoSpaceBeforeQMark = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.QuestionToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotBinaryOpContext), Formatting.RuleAction.Delete));
                this.SpaceAfterColon = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.ColonToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotBinaryOpContext), Formatting.RuleAction.Space));
                this.SpaceAfterQMark = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.QuestionToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotBinaryOpContext), Formatting.RuleAction.Space));
                this.SpaceAfterSemicolon = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.SemicolonToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Space));

                this.NewLineAfterCloseBrace = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.CloseBraceToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsMultilineChildParentContext), Formatting.RuleAction.NewLine));
                this.SpaceAfterCloseBrace = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.CloseBraceToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsAfterCodeBlockContext), Formatting.RuleAction.Space));

                this.SpaceBetweenCloseBraceAndElse = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.CloseBraceToken, TypeScript.SyntaxKind.ElseKeyword), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Space));
                this.SpaceBetweenCloseBraceAndWhile = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.CloseBraceToken, TypeScript.SyntaxKind.WhileKeyword), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Space));
                this.NoSpaceAfterCloseBrace = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.CloseBraceToken, Formatting.Shared.TokenRange.FromTokens([TypeScript.SyntaxKind.CloseParenToken, TypeScript.SyntaxKind.CloseBracketToken, TypeScript.SyntaxKind.CommaToken, TypeScript.SyntaxKind.SemicolonToken])), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));

                this.NoSpaceBeforeDot = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.DotToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));
                this.NoSpaceAfterDot = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.DotToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));
                this.NoSpaceBeforeOpenBracket = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.OpenBracketToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));
                this.NoSpaceAfterOpenBracket = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.OpenBracketToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));
                this.NoSpaceBeforeCloseBracket = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.CloseBracketToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));
                this.NoSpaceAfterCloseBracket = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.CloseBracketToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));

                this.SpaceAfterOpenBrace = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.OpenBraceToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSingleLineBlockContext), Formatting.RuleAction.Space));
                this.SpaceBeforeCloseBrace = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.CloseBraceToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSingleLineBlockContext), Formatting.RuleAction.Space));
                this.NoSpaceBetweenEmptyBraceBrackets = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.OpenBraceToken, TypeScript.SyntaxKind.CloseBraceToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsObjectContext), Formatting.RuleAction.Delete));

                this.NewLineAfterOpenBraceInBlockContext = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.OpenBraceToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsMultilineBlockContext), Formatting.RuleAction.NewLine));

                this.NewLineBeforeCloseBraceInBlockContext = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.CloseBraceToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsMultilineBlockContext), Formatting.RuleAction.NewLine));

                this.NoSpaceAfterUnaryPrefixOperator = new Formatting.Rule(Formatting.RuleDescriptor.create4(Formatting.Shared.TokenRange.UnaryPrefixOperators, Formatting.Shared.TokenRange.UnaryPrefixExpressions), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotBinaryOpContext), Formatting.RuleAction.Delete));
                this.NoSpaceAfterUnaryPreincrementOperator = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.PlusPlusToken, Formatting.Shared.TokenRange.UnaryPreincrementExpressions), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));
                this.NoSpaceAfterUnaryPredecrementOperator = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.MinusMinusToken, Formatting.Shared.TokenRange.UnaryPredecrementExpressions), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));
                this.NoSpaceBeforeUnaryPostincrementOperator = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.UnaryPostincrementExpressions, TypeScript.SyntaxKind.PlusPlusToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));
                this.NoSpaceBeforeUnaryPostdecrementOperator = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.UnaryPostdecrementExpressions, TypeScript.SyntaxKind.MinusMinusToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));

                this.SpaceAfterPostincrementWhenFollowedByAdd = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.PlusPlusToken, TypeScript.SyntaxKind.PlusToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), Formatting.RuleAction.Space));
                this.SpaceAfterAddWhenFollowedByUnaryPlus = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.PlusToken, TypeScript.SyntaxKind.PlusToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), Formatting.RuleAction.Space));
                this.SpaceAfterAddWhenFollowedByPreincrement = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.PlusToken, TypeScript.SyntaxKind.PlusPlusToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), Formatting.RuleAction.Space));
                this.SpaceAfterPostdecrementWhenFollowedBySubtract = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.MinusMinusToken, TypeScript.SyntaxKind.MinusToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), Formatting.RuleAction.Space));
                this.SpaceAfterSubtractWhenFollowedByUnaryMinus = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.MinusToken, TypeScript.SyntaxKind.MinusToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), Formatting.RuleAction.Space));
                this.SpaceAfterSubtractWhenFollowedByPredecrement = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.MinusToken, TypeScript.SyntaxKind.MinusMinusToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), Formatting.RuleAction.Space));

                this.NoSpaceBeforeComma = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.CommaToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));

                this.SpaceAfterCertainKeywords = new Formatting.Rule(Formatting.RuleDescriptor.create4(Formatting.Shared.TokenRange.FromTokens([TypeScript.SyntaxKind.VarKeyword, TypeScript.SyntaxKind.ThrowKeyword, TypeScript.SyntaxKind.NewKeyword, TypeScript.SyntaxKind.DeleteKeyword, TypeScript.SyntaxKind.ReturnKeyword, TypeScript.SyntaxKind.VoidKeyword, TypeScript.SyntaxKind.TypeOfKeyword]), Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Space));
                this.NoSpaceBeforeOpenParenInFuncCall = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.OpenParenToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsFunctionCallOrNewContext), Formatting.RuleAction.Delete));
                this.SpaceAfterFunctionInFuncDecl = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.FunctionKeyword, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsFunctionDeclContext), Formatting.RuleAction.Space));
                this.NoSpaceBeforeOpenParenInFuncDecl = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.OpenParenToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsFunctionOrGetSetDeclContext), Formatting.RuleAction.Delete));

                this.SpaceBetweenStatements = new Formatting.Rule(Formatting.RuleDescriptor.create4(Formatting.Shared.TokenRange.FromTokens([TypeScript.SyntaxKind.CloseParenToken, TypeScript.SyntaxKind.DoKeyword, TypeScript.SyntaxKind.ElseKeyword, TypeScript.SyntaxKind.CaseKeyword]), Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotForContext), Formatting.RuleAction.Space));

                this.SpaceAfterTryFinally = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.FromTokens([TypeScript.SyntaxKind.TryKeyword, TypeScript.SyntaxKind.FinallyKeyword]), TypeScript.SyntaxKind.OpenBraceToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Space));

                this.SpaceAfterGetSetInMember = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.IdentifierName, TypeScript.SyntaxKind.IdentifierName), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsGetSetMemberContext), Formatting.RuleAction.Space));

                this.SpaceBeforeBinaryKeywordOperator = new Formatting.Rule(Formatting.RuleDescriptor.create4(Formatting.Shared.TokenRange.Any, Formatting.Shared.TokenRange.BinaryKeywordOperators), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), Formatting.RuleAction.Space));
                this.SpaceAfterBinaryKeywordOperator = new Formatting.Rule(Formatting.RuleDescriptor.create4(Formatting.Shared.TokenRange.BinaryKeywordOperators, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), Formatting.RuleAction.Space));

                this.NoSpaceAfterConstructor = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.ConstructorKeyword, TypeScript.SyntaxKind.OpenParenToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));

                this.NoSpaceAfterModuleImport = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.FromTokens([TypeScript.SyntaxKind.ModuleKeyword, TypeScript.SyntaxKind.RequireKeyword]), TypeScript.SyntaxKind.OpenParenToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));

                this.SpaceAfterCertainTypeScriptKeywords = new Formatting.Rule(Formatting.RuleDescriptor.create4(Formatting.Shared.TokenRange.FromTokens([TypeScript.SyntaxKind.ClassKeyword, TypeScript.SyntaxKind.DeclareKeyword, TypeScript.SyntaxKind.EnumKeyword, TypeScript.SyntaxKind.ExportKeyword, TypeScript.SyntaxKind.ExtendsKeyword, TypeScript.SyntaxKind.GetKeyword, TypeScript.SyntaxKind.ImplementsKeyword, TypeScript.SyntaxKind.ImportKeyword, TypeScript.SyntaxKind.InterfaceKeyword, TypeScript.SyntaxKind.ModuleKeyword, TypeScript.SyntaxKind.PrivateKeyword, TypeScript.SyntaxKind.PublicKeyword, TypeScript.SyntaxKind.SetKeyword, TypeScript.SyntaxKind.StaticKeyword]), Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Space));
                this.SpaceBeforeCertainTypeScriptKeywords = new Formatting.Rule(Formatting.RuleDescriptor.create4(Formatting.Shared.TokenRange.Any, Formatting.Shared.TokenRange.FromTokens([TypeScript.SyntaxKind.ExtendsKeyword, TypeScript.SyntaxKind.ImplementsKeyword])), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Space));

                this.SpaceAfterModuleName = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.StringLiteral, TypeScript.SyntaxKind.OpenBraceToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsModuleDeclContext), Formatting.RuleAction.Space));

                this.SpaceAfterArrow = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.EqualsGreaterThanToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Space));

                this.NoSpaceAfterEllipsis = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.DotDotDotToken, TypeScript.SyntaxKind.IdentifierName), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));
                this.NoSpaceAfterOptionalParameters = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.QuestionToken, Formatting.Shared.TokenRange.FromTokens([TypeScript.SyntaxKind.CloseParenToken, TypeScript.SyntaxKind.CommaToken])), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotBinaryOpContext), Formatting.RuleAction.Delete));

                this.NoSpaceBeforeOpenAngularBracket = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.TypeNames, TypeScript.SyntaxKind.LessThanToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsTypeArgumentOrParameterContext), Formatting.RuleAction.Delete));
                this.NoSpaceBetweenCloseParenAndAngularBracket = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.CloseParenToken, TypeScript.SyntaxKind.LessThanToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsTypeArgumentOrParameterContext), Formatting.RuleAction.Delete));
                this.NoSpaceAfterOpenAngularBracket = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.LessThanToken, Formatting.Shared.TokenRange.TypeNames), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsTypeArgumentOrParameterContext), Formatting.RuleAction.Delete));
                this.NoSpaceBeforeCloseAngularBracket = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.GreaterThanToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsTypeArgumentOrParameterContext), Formatting.RuleAction.Delete));
                this.NoSpaceAfterCloseAngularBracket = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.GreaterThanToken, Formatting.Shared.TokenRange.FromTokens([TypeScript.SyntaxKind.OpenParenToken, TypeScript.SyntaxKind.OpenBracketToken, TypeScript.SyntaxKind.GreaterThanToken, TypeScript.SyntaxKind.CommaToken])), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsTypeArgumentOrParameterContext), Formatting.RuleAction.Delete));

                this.NoSpaceBetweenEmptyInterfaceBraceBrackets = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.OpenBraceToken, TypeScript.SyntaxKind.CloseBraceToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsObjectTypeContext), Formatting.RuleAction.Delete));

                this.HighPriorityCommonRules = [
                    this.IgnoreBeforeComment,
                    this.IgnoreAfterLineComment,
                    this.NoSpaceBeforeSemicolon,
                    this.NoSpaceBeforeColon,
                    this.SpaceAfterColon,
                    this.NoSpaceBeforeQMark,
                    this.SpaceAfterQMark,
                    this.NewLineAfterCloseBrace,
                    this.NoSpaceBeforeDot,
                    this.NoSpaceAfterDot,
                    this.NoSpaceAfterUnaryPrefixOperator,
                    this.NoSpaceAfterUnaryPreincrementOperator,
                    this.NoSpaceAfterUnaryPredecrementOperator,
                    this.NoSpaceBeforeUnaryPostincrementOperator,
                    this.NoSpaceBeforeUnaryPostdecrementOperator,
                    this.SpaceAfterPostincrementWhenFollowedByAdd,
                    this.SpaceAfterAddWhenFollowedByUnaryPlus,
                    this.SpaceAfterAddWhenFollowedByPreincrement,
                    this.SpaceAfterPostdecrementWhenFollowedBySubtract,
                    this.SpaceAfterSubtractWhenFollowedByUnaryMinus,
                    this.SpaceAfterSubtractWhenFollowedByPredecrement,
                    this.NoSpaceAfterCloseBrace,
                    this.SpaceAfterOpenBrace,
                    this.SpaceBeforeCloseBrace,
                    this.NewLineBeforeCloseBraceInBlockContext,
                    this.SpaceAfterCloseBrace,
                    this.SpaceBetweenCloseBraceAndElse,
                    this.SpaceBetweenCloseBraceAndWhile,
                    this.NoSpaceBetweenEmptyBraceBrackets,
                    this.SpaceAfterFunctionInFuncDecl,
                    this.NewLineAfterOpenBraceInBlockContext,
                    this.SpaceAfterGetSetInMember,
                    this.SpaceAfterCertainKeywords,
                    this.NoSpaceBeforeOpenParenInFuncCall,
                    this.SpaceBeforeBinaryKeywordOperator,
                    this.SpaceAfterBinaryKeywordOperator,
                    this.NoSpaceAfterConstructor,
                    this.NoSpaceAfterModuleImport,
                    this.SpaceAfterCertainTypeScriptKeywords,
                    this.SpaceBeforeCertainTypeScriptKeywords,
                    this.SpaceAfterModuleName,
                    this.SpaceAfterArrow,
                    this.NoSpaceAfterEllipsis,
                    this.NoSpaceAfterOptionalParameters,
                    this.NoSpaceBetweenEmptyInterfaceBraceBrackets,
                    this.NoSpaceBeforeOpenAngularBracket,
                    this.NoSpaceBetweenCloseParenAndAngularBracket,
                    this.NoSpaceAfterOpenAngularBracket,
                    this.NoSpaceBeforeCloseAngularBracket,
                    this.NoSpaceAfterCloseAngularBracket
                ];

                this.LowPriorityCommonRules = [
                    this.NoSpaceBeforeComma,
                    this.NoSpaceBeforeOpenBracket,
                    this.NoSpaceAfterOpenBracket,
                    this.NoSpaceBeforeCloseBracket,
                    this.NoSpaceAfterCloseBracket,
                    this.SpaceAfterSemicolon,
                    this.NoSpaceBeforeOpenParenInFuncDecl,
                    this.SpaceBetweenStatements,
                    this.SpaceAfterTryFinally
                ];

                this.SpaceAfterComma = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.CommaToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Space));
                this.NoSpaceAfterComma = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.CommaToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));

                this.SpaceBeforeBinaryOperator = new Formatting.Rule(Formatting.RuleDescriptor.create4(Formatting.Shared.TokenRange.Any, Formatting.Shared.TokenRange.BinaryOperators), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), Formatting.RuleAction.Space));
                this.SpaceAfterBinaryOperator = new Formatting.Rule(Formatting.RuleDescriptor.create4(Formatting.Shared.TokenRange.BinaryOperators, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), Formatting.RuleAction.Space));
                this.NoSpaceBeforeBinaryOperator = new Formatting.Rule(Formatting.RuleDescriptor.create4(Formatting.Shared.TokenRange.Any, Formatting.Shared.TokenRange.BinaryOperators), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), Formatting.RuleAction.Delete));
                this.NoSpaceAfterBinaryOperator = new Formatting.Rule(Formatting.RuleDescriptor.create4(Formatting.Shared.TokenRange.BinaryOperators, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), Formatting.RuleAction.Delete));

                this.SpaceAfterKeywordInControl = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Keywords, TypeScript.SyntaxKind.OpenParenToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsControlDeclContext), Formatting.RuleAction.Space));
                this.NoSpaceAfterKeywordInControl = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Keywords, TypeScript.SyntaxKind.OpenParenToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsControlDeclContext), Formatting.RuleAction.Delete));

                this.FunctionOpenBraceLeftTokenRange = Formatting.Shared.TokenRange.Any;
                this.FunctionOpenBraceLeftTokenRange_Js = Formatting.Shared.TokenRange.FromTokens([TypeScript.SyntaxKind.CloseParenToken, TypeScript.SyntaxKind.SingleLineCommentTrivia]);
                this.SpaceBeforeOpenBraceInFunction = new Formatting.Rule(Formatting.RuleDescriptor.create2(this.FunctionOpenBraceLeftTokenRange, TypeScript.SyntaxKind.OpenBraceToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsFunctionDeclContext, Rules.IsNotFormatOnEnter, Rules.IsSameLineTokenOrMultilineBlockContext), Formatting.RuleAction.Space), Formatting.RuleFlags.CanDeleteNewLines);
                this.NewLineBeforeOpenBraceInFunction = new Formatting.Rule(Formatting.RuleDescriptor.create2(this.FunctionOpenBraceLeftTokenRange, TypeScript.SyntaxKind.OpenBraceToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsFunctionDeclContext, Rules.IsMultilineBlockContext), Formatting.RuleAction.NewLine), Formatting.RuleFlags.CanDeleteNewLines);

                this.TypeScriptOpenBraceLeftTokenRange = Formatting.Shared.TokenRange.FromTokens([TypeScript.SyntaxKind.IdentifierName, TypeScript.SyntaxKind.SingleLineCommentTrivia]);
                this.SpaceBeforeOpenBraceInTypeScriptDeclWithBlock = new Formatting.Rule(Formatting.RuleDescriptor.create2(this.TypeScriptOpenBraceLeftTokenRange, TypeScript.SyntaxKind.OpenBraceToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsTypeScriptDeclWithBlockContext, Rules.IsNotFormatOnEnter, Rules.IsSameLineTokenOrMultilineBlockContext), Formatting.RuleAction.Space), Formatting.RuleFlags.CanDeleteNewLines);
                this.NewLineBeforeOpenBraceInTypeScriptDeclWithBlock = new Formatting.Rule(Formatting.RuleDescriptor.create2(this.TypeScriptOpenBraceLeftTokenRange, TypeScript.SyntaxKind.OpenBraceToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsTypeScriptDeclWithBlockContext, Rules.IsMultilineBlockContext), Formatting.RuleAction.NewLine), Formatting.RuleFlags.CanDeleteNewLines);

                this.ControlOpenBraceLeftTokenRange = Formatting.Shared.TokenRange.FromTokens([TypeScript.SyntaxKind.CloseParenToken, TypeScript.SyntaxKind.SingleLineCommentTrivia, TypeScript.SyntaxKind.DoKeyword, TypeScript.SyntaxKind.TryKeyword, TypeScript.SyntaxKind.FinallyKeyword, TypeScript.SyntaxKind.ElseKeyword]);
                this.SpaceBeforeOpenBraceInControl = new Formatting.Rule(Formatting.RuleDescriptor.create2(this.ControlOpenBraceLeftTokenRange, TypeScript.SyntaxKind.OpenBraceToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsControlDeclContext, Rules.IsNotFormatOnEnter, Rules.IsSameLineTokenOrMultilineBlockContext), Formatting.RuleAction.Space), Formatting.RuleFlags.CanDeleteNewLines);
                this.NewLineBeforeOpenBraceInControl = new Formatting.Rule(Formatting.RuleDescriptor.create2(this.ControlOpenBraceLeftTokenRange, TypeScript.SyntaxKind.OpenBraceToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsControlDeclContext, Rules.IsMultilineBlockContext), Formatting.RuleAction.NewLine), Formatting.RuleFlags.CanDeleteNewLines);

                this.SpaceAfterSemicolonInFor = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.SemicolonToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsForContext), Formatting.RuleAction.Space));
                this.NoSpaceAfterSemicolonInFor = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.SemicolonToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsForContext), Formatting.RuleAction.Delete));

                this.SpaceAfterOpenParen = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.OpenParenToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Space));
                this.SpaceBeforeCloseParen = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.CloseParenToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Space));
                this.NoSpaceBetweenParens = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.OpenParenToken, TypeScript.SyntaxKind.CloseParenToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));
                this.NoSpaceAfterOpenParen = new Formatting.Rule(Formatting.RuleDescriptor.create3(TypeScript.SyntaxKind.OpenParenToken, Formatting.Shared.TokenRange.Any), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));
                this.NoSpaceBeforeCloseParen = new Formatting.Rule(Formatting.RuleDescriptor.create2(Formatting.Shared.TokenRange.Any, TypeScript.SyntaxKind.CloseParenToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsSameLineTokenContext), Formatting.RuleAction.Delete));

                this.SpaceAfterAnonymousFunctionKeyword = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.FunctionKeyword, TypeScript.SyntaxKind.OpenParenToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsFunctionDeclContext), Formatting.RuleAction.Space));
                this.NoSpaceAfterAnonymousFunctionKeyword = new Formatting.Rule(Formatting.RuleDescriptor.create1(TypeScript.SyntaxKind.FunctionKeyword, TypeScript.SyntaxKind.OpenParenToken), Formatting.RuleOperation.create2(new Formatting.RuleOperationContext(Rules.IsFunctionDeclContext), Formatting.RuleAction.Delete));
            }
            Rules.prototype.getRuleName = function (rule) {
                var o = this;
                for (var name in o) {
                    if (o[name] === rule) {
                        return name;
                    }
                }
                throw new Error("Unknown rule");
            };

            Rules.IsForContext = function (context) {
                return context.contextNode.kind() === TypeScript.SyntaxKind.ForStatement;
            };

            Rules.IsNotForContext = function (context) {
                return !Rules.IsForContext(context);
            };

            Rules.IsBinaryOpContext = function (context) {
                switch (context.contextNode.kind()) {
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
                    case TypeScript.SyntaxKind.ConditionalExpression:
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

                    case TypeScript.SyntaxKind.ImportDeclaration:

                    case TypeScript.SyntaxKind.VariableDeclarator:
                    case TypeScript.SyntaxKind.EqualsValueClause:
                        return context.currentTokenSpan.kind() === TypeScript.SyntaxKind.EqualsToken || context.nextTokenSpan.kind() === TypeScript.SyntaxKind.EqualsToken;

                    case TypeScript.SyntaxKind.ForInStatement:
                        return context.currentTokenSpan.kind() === TypeScript.SyntaxKind.InKeyword || context.nextTokenSpan.kind() === TypeScript.SyntaxKind.InKeyword;
                }
                return false;
            };

            Rules.IsNotBinaryOpContext = function (context) {
                return !Rules.IsBinaryOpContext(context);
            };

            Rules.IsBlockContext = function (context) {
                if (Rules.IsTypeScriptDeclWithBlockContext(context) || Rules.IsFunctionDeclContext(context)) {
                    return true;
                }

                switch (context.contextNode.kind()) {
                    case TypeScript.SyntaxKind.Block:
                    case TypeScript.SyntaxKind.SwitchStatement:
                    case TypeScript.SyntaxKind.ObjectLiteralExpression:
                        return true;
                }

                return false;
            };

            Rules.IsSingleLineBlockContext = function (context) {
                if (!Rules.IsBlockContext(context))
                    return false;
                return Rules.IsSingleLineContext(context);
            };

            Rules.IsMultilineBlockContext = function (context) {
                if (!Rules.IsBlockContext(context))
                    return false;

                return !Rules.IsSingleLineContext(context);
            };

            Rules.IsSingleLineContext = function (context) {
                var node = context.contextNode;
                var toReturn;

                if (node.kind() === TypeScript.SyntaxKind.ObjectType && node.parent().kind() === TypeScript.SyntaxKind.InterfaceDeclaration) {
                    context.contextNode = node.parent();
                    toReturn = context.ContextNodeAllOnSameLine();
                    context.contextNode = node;
                } else if (node.kind() === TypeScript.SyntaxKind.Block) {
                    context.contextNode = node.parent();
                    if (this.IsFunctionDeclContext(context)) {
                        toReturn = context.ContextNodeAllOnSameLine();
                    }
                    context.contextNode = node;
                }

                return (toReturn === undefined) ? context.ContextNodeAllOnSameLine() : toReturn;
            };

            Rules.IsFunctionDeclContext = function (context) {
                switch (context.contextNode.kind()) {
                    case TypeScript.SyntaxKind.FunctionDeclaration:
                    case TypeScript.SyntaxKind.MemberFunctionDeclaration:
                    case TypeScript.SyntaxKind.GetMemberAccessorDeclaration:
                    case TypeScript.SyntaxKind.SetMemberAccessorDeclaration:
                    case TypeScript.SyntaxKind.MethodSignature:
                    case TypeScript.SyntaxKind.CallSignature:
                    case TypeScript.SyntaxKind.FunctionExpression:
                    case TypeScript.SyntaxKind.ConstructorDeclaration:
                    case TypeScript.SyntaxKind.SimpleArrowFunctionExpression:
                    case TypeScript.SyntaxKind.ParenthesizedArrowFunctionExpression:
                        return true;
                }

                return false;
            };

            Rules.IsTypeScriptDeclWithBlockContext = function (context) {
                switch (context.contextNode.kind()) {
                    case TypeScript.SyntaxKind.ClassDeclaration:
                    case TypeScript.SyntaxKind.EnumDeclaration:
                    case TypeScript.SyntaxKind.InterfaceDeclaration:
                    case TypeScript.SyntaxKind.ObjectType:
                    case TypeScript.SyntaxKind.ModuleDeclaration:
                        return true;
                }

                return false;
            };

            Rules.IsControlDeclContext = function (context) {
                switch (context.contextNode.kind()) {
                    case TypeScript.SyntaxKind.IfStatement:
                    case TypeScript.SyntaxKind.SwitchStatement:
                    case TypeScript.SyntaxKind.ForStatement:
                    case TypeScript.SyntaxKind.ForInStatement:
                    case TypeScript.SyntaxKind.WhileStatement:
                    case TypeScript.SyntaxKind.TryStatement:
                    case TypeScript.SyntaxKind.DoStatement:
                    case TypeScript.SyntaxKind.WithStatement:
                    case TypeScript.SyntaxKind.ElseClause:
                    case TypeScript.SyntaxKind.CatchClause:
                    case TypeScript.SyntaxKind.FinallyClause:
                        return true;

                    default:
                        return false;
                }
            };

            Rules.IsObjectContext = function (context) {
                return context.contextNode.kind() === TypeScript.SyntaxKind.ObjectLiteralExpression;
            };

            Rules.IsFunctionCallContext = function (context) {
                return context.contextNode.kind() === TypeScript.SyntaxKind.InvocationExpression;
            };

            Rules.IsNewContext = function (context) {
                return context.contextNode.kind() === TypeScript.SyntaxKind.ObjectCreationExpression;
            };

            Rules.IsFunctionCallOrNewContext = function (context) {
                return Rules.IsFunctionCallContext(context) || Rules.IsNewContext(context);
            };

            Rules.IsSameLineTokenContext = function (context) {
                return context.TokensAreOnSameLine();
            };

            Rules.IsCodeBlockContext = function (context) {
                switch (context.contextNode.kind()) {
                    case TypeScript.SyntaxKind.ClassDeclaration:
                    case TypeScript.SyntaxKind.ModuleDeclaration:
                    case TypeScript.SyntaxKind.EnumDeclaration:
                    case TypeScript.SyntaxKind.Block:
                    case TypeScript.SyntaxKind.SwitchStatement:
                        return true;
                }
                return false;
            };

            Rules.IsAfterCodeBlockContext = function (context) {
                switch (context.currentTokenParent.kind()) {
                    case TypeScript.SyntaxKind.ClassDeclaration:
                    case TypeScript.SyntaxKind.ModuleDeclaration:
                    case TypeScript.SyntaxKind.EnumDeclaration:
                    case TypeScript.SyntaxKind.Block:
                    case TypeScript.SyntaxKind.SwitchStatement:
                        return true;
                }
                return false;
            };

            Rules.IsMultilineChildParentContext = function (context) {
                return false;
            };

            Rules.IsNotFormatOnEnter = function (context) {
                return context.formattingRequestKind != Formatting.FormattingRequestKind.FormatOnEnter;
            };

            Rules.IsSameLineTokenOrMultilineBlockContext = function (context) {
                return context.TokensAreOnSameLine() || Rules.IsMultilineBlockContext(context);
            };

            Rules.IsFunctionOrGetSetDeclContext = function (context) {
                return Rules.IsFunctionDeclContext(context) || Rules.IsGetSetMemberContext(context);
            };

            Rules.IsGetSetMemberContext = function (context) {
                switch (context.contextNode.kind()) {
                    case TypeScript.SyntaxKind.GetAccessorPropertyAssignment:
                    case TypeScript.SyntaxKind.GetMemberAccessorDeclaration:
                    case TypeScript.SyntaxKind.SetAccessorPropertyAssignment:
                    case TypeScript.SyntaxKind.SetMemberAccessorDeclaration:
                        return true;
                }

                return false;
            };

            Rules.IsModuleDeclContext = function (context) {
                return context.contextNode.kind() === TypeScript.SyntaxKind.ModuleDeclaration;
            };

            Rules.IsObjectTypeContext = function (context) {
                return context.contextNode.kind() === TypeScript.SyntaxKind.ObjectType && context.contextNode.parent().kind() !== TypeScript.SyntaxKind.InterfaceDeclaration;
            };

            Rules.IsTypeArgumentOrParameter = function (tokenKind, parentKind) {
                return ((tokenKind === TypeScript.SyntaxKind.LessThanToken || tokenKind === TypeScript.SyntaxKind.GreaterThanToken) && (parentKind === TypeScript.SyntaxKind.TypeParameterList || parentKind === TypeScript.SyntaxKind.TypeArgumentList));
            };

            Rules.IsTypeArgumentOrParameterContext = function (context) {
                return Rules.IsTypeArgumentOrParameter(context.currentTokenSpan.kind(), context.currentTokenParent.kind()) || Rules.IsTypeArgumentOrParameter(context.nextTokenSpan.kind(), context.nextTokenParent.kind());
            };
            return Rules;
        })();
        Formatting.Rules = Rules;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
