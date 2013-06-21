var TypeScript;
(function (TypeScript) {
    (function (SyntaxKind) {
        SyntaxKind[SyntaxKind["None"] = 0] = "None";
        SyntaxKind[SyntaxKind["List"] = 1] = "List";
        SyntaxKind[SyntaxKind["SeparatedList"] = 2] = "SeparatedList";
        SyntaxKind[SyntaxKind["TriviaList"] = 3] = "TriviaList";

        SyntaxKind[SyntaxKind["WhitespaceTrivia"] = 4] = "WhitespaceTrivia";
        SyntaxKind[SyntaxKind["NewLineTrivia"] = 5] = "NewLineTrivia";
        SyntaxKind[SyntaxKind["MultiLineCommentTrivia"] = 6] = "MultiLineCommentTrivia";
        SyntaxKind[SyntaxKind["SingleLineCommentTrivia"] = 7] = "SingleLineCommentTrivia";
        SyntaxKind[SyntaxKind["SkippedTokenTrivia"] = 8] = "SkippedTokenTrivia";

        SyntaxKind[SyntaxKind["ErrorToken"] = 9] = "ErrorToken";
        SyntaxKind[SyntaxKind["EndOfFileToken"] = 10] = "EndOfFileToken";

        SyntaxKind[SyntaxKind["IdentifierName"] = 11] = "IdentifierName";

        SyntaxKind[SyntaxKind["RegularExpressionLiteral"] = 12] = "RegularExpressionLiteral";
        SyntaxKind[SyntaxKind["NumericLiteral"] = 13] = "NumericLiteral";
        SyntaxKind[SyntaxKind["StringLiteral"] = 14] = "StringLiteral";

        SyntaxKind[SyntaxKind["BreakKeyword"] = 15] = "BreakKeyword";
        SyntaxKind[SyntaxKind["CaseKeyword"] = 16] = "CaseKeyword";
        SyntaxKind[SyntaxKind["CatchKeyword"] = 17] = "CatchKeyword";
        SyntaxKind[SyntaxKind["ContinueKeyword"] = 18] = "ContinueKeyword";
        SyntaxKind[SyntaxKind["DebuggerKeyword"] = 19] = "DebuggerKeyword";
        SyntaxKind[SyntaxKind["DefaultKeyword"] = 20] = "DefaultKeyword";
        SyntaxKind[SyntaxKind["DeleteKeyword"] = 21] = "DeleteKeyword";
        SyntaxKind[SyntaxKind["DoKeyword"] = 22] = "DoKeyword";
        SyntaxKind[SyntaxKind["ElseKeyword"] = 23] = "ElseKeyword";
        SyntaxKind[SyntaxKind["FalseKeyword"] = 24] = "FalseKeyword";
        SyntaxKind[SyntaxKind["FinallyKeyword"] = 25] = "FinallyKeyword";
        SyntaxKind[SyntaxKind["ForKeyword"] = 26] = "ForKeyword";
        SyntaxKind[SyntaxKind["FunctionKeyword"] = 27] = "FunctionKeyword";
        SyntaxKind[SyntaxKind["IfKeyword"] = 28] = "IfKeyword";
        SyntaxKind[SyntaxKind["InKeyword"] = 29] = "InKeyword";
        SyntaxKind[SyntaxKind["InstanceOfKeyword"] = 30] = "InstanceOfKeyword";
        SyntaxKind[SyntaxKind["NewKeyword"] = 31] = "NewKeyword";
        SyntaxKind[SyntaxKind["NullKeyword"] = 32] = "NullKeyword";
        SyntaxKind[SyntaxKind["ReturnKeyword"] = 33] = "ReturnKeyword";
        SyntaxKind[SyntaxKind["SwitchKeyword"] = 34] = "SwitchKeyword";
        SyntaxKind[SyntaxKind["ThisKeyword"] = 35] = "ThisKeyword";
        SyntaxKind[SyntaxKind["ThrowKeyword"] = 36] = "ThrowKeyword";
        SyntaxKind[SyntaxKind["TrueKeyword"] = 37] = "TrueKeyword";
        SyntaxKind[SyntaxKind["TryKeyword"] = 38] = "TryKeyword";
        SyntaxKind[SyntaxKind["TypeOfKeyword"] = 39] = "TypeOfKeyword";
        SyntaxKind[SyntaxKind["VarKeyword"] = 40] = "VarKeyword";
        SyntaxKind[SyntaxKind["VoidKeyword"] = 41] = "VoidKeyword";
        SyntaxKind[SyntaxKind["WhileKeyword"] = 42] = "WhileKeyword";
        SyntaxKind[SyntaxKind["WithKeyword"] = 43] = "WithKeyword";

        SyntaxKind[SyntaxKind["ClassKeyword"] = 44] = "ClassKeyword";
        SyntaxKind[SyntaxKind["ConstKeyword"] = 45] = "ConstKeyword";
        SyntaxKind[SyntaxKind["EnumKeyword"] = 46] = "EnumKeyword";
        SyntaxKind[SyntaxKind["ExportKeyword"] = 47] = "ExportKeyword";
        SyntaxKind[SyntaxKind["ExtendsKeyword"] = 48] = "ExtendsKeyword";
        SyntaxKind[SyntaxKind["ImportKeyword"] = 49] = "ImportKeyword";
        SyntaxKind[SyntaxKind["SuperKeyword"] = 50] = "SuperKeyword";

        SyntaxKind[SyntaxKind["ImplementsKeyword"] = 51] = "ImplementsKeyword";
        SyntaxKind[SyntaxKind["InterfaceKeyword"] = 52] = "InterfaceKeyword";
        SyntaxKind[SyntaxKind["LetKeyword"] = 53] = "LetKeyword";
        SyntaxKind[SyntaxKind["PackageKeyword"] = 54] = "PackageKeyword";
        SyntaxKind[SyntaxKind["PrivateKeyword"] = 55] = "PrivateKeyword";
        SyntaxKind[SyntaxKind["ProtectedKeyword"] = 56] = "ProtectedKeyword";
        SyntaxKind[SyntaxKind["PublicKeyword"] = 57] = "PublicKeyword";
        SyntaxKind[SyntaxKind["StaticKeyword"] = 58] = "StaticKeyword";
        SyntaxKind[SyntaxKind["YieldKeyword"] = 59] = "YieldKeyword";

        SyntaxKind[SyntaxKind["AnyKeyword"] = 60] = "AnyKeyword";
        SyntaxKind[SyntaxKind["BooleanKeyword"] = 61] = "BooleanKeyword";
        SyntaxKind[SyntaxKind["BoolKeyword"] = 62] = "BoolKeyword";
        SyntaxKind[SyntaxKind["ConstructorKeyword"] = 63] = "ConstructorKeyword";
        SyntaxKind[SyntaxKind["DeclareKeyword"] = 64] = "DeclareKeyword";
        SyntaxKind[SyntaxKind["GetKeyword"] = 65] = "GetKeyword";
        SyntaxKind[SyntaxKind["ModuleKeyword"] = 66] = "ModuleKeyword";
        SyntaxKind[SyntaxKind["RequireKeyword"] = 67] = "RequireKeyword";
        SyntaxKind[SyntaxKind["NumberKeyword"] = 68] = "NumberKeyword";
        SyntaxKind[SyntaxKind["SetKeyword"] = 69] = "SetKeyword";
        SyntaxKind[SyntaxKind["StringKeyword"] = 70] = "StringKeyword";

        SyntaxKind[SyntaxKind["OpenBraceToken"] = 71] = "OpenBraceToken";
        SyntaxKind[SyntaxKind["CloseBraceToken"] = 72] = "CloseBraceToken";
        SyntaxKind[SyntaxKind["OpenParenToken"] = 73] = "OpenParenToken";
        SyntaxKind[SyntaxKind["CloseParenToken"] = 74] = "CloseParenToken";
        SyntaxKind[SyntaxKind["OpenBracketToken"] = 75] = "OpenBracketToken";
        SyntaxKind[SyntaxKind["CloseBracketToken"] = 76] = "CloseBracketToken";
        SyntaxKind[SyntaxKind["DotToken"] = 77] = "DotToken";
        SyntaxKind[SyntaxKind["DotDotDotToken"] = 78] = "DotDotDotToken";
        SyntaxKind[SyntaxKind["SemicolonToken"] = 79] = "SemicolonToken";
        SyntaxKind[SyntaxKind["CommaToken"] = 80] = "CommaToken";
        SyntaxKind[SyntaxKind["LessThanToken"] = 81] = "LessThanToken";
        SyntaxKind[SyntaxKind["GreaterThanToken"] = 82] = "GreaterThanToken";
        SyntaxKind[SyntaxKind["LessThanEqualsToken"] = 83] = "LessThanEqualsToken";
        SyntaxKind[SyntaxKind["GreaterThanEqualsToken"] = 84] = "GreaterThanEqualsToken";
        SyntaxKind[SyntaxKind["EqualsEqualsToken"] = 85] = "EqualsEqualsToken";
        SyntaxKind[SyntaxKind["EqualsGreaterThanToken"] = 86] = "EqualsGreaterThanToken";
        SyntaxKind[SyntaxKind["ExclamationEqualsToken"] = 87] = "ExclamationEqualsToken";
        SyntaxKind[SyntaxKind["EqualsEqualsEqualsToken"] = 88] = "EqualsEqualsEqualsToken";
        SyntaxKind[SyntaxKind["ExclamationEqualsEqualsToken"] = 89] = "ExclamationEqualsEqualsToken";
        SyntaxKind[SyntaxKind["PlusToken"] = 90] = "PlusToken";
        SyntaxKind[SyntaxKind["MinusToken"] = 91] = "MinusToken";
        SyntaxKind[SyntaxKind["AsteriskToken"] = 92] = "AsteriskToken";
        SyntaxKind[SyntaxKind["PercentToken"] = 93] = "PercentToken";
        SyntaxKind[SyntaxKind["PlusPlusToken"] = 94] = "PlusPlusToken";
        SyntaxKind[SyntaxKind["MinusMinusToken"] = 95] = "MinusMinusToken";
        SyntaxKind[SyntaxKind["LessThanLessThanToken"] = 96] = "LessThanLessThanToken";
        SyntaxKind[SyntaxKind["GreaterThanGreaterThanToken"] = 97] = "GreaterThanGreaterThanToken";
        SyntaxKind[SyntaxKind["GreaterThanGreaterThanGreaterThanToken"] = 98] = "GreaterThanGreaterThanGreaterThanToken";
        SyntaxKind[SyntaxKind["AmpersandToken"] = 99] = "AmpersandToken";
        SyntaxKind[SyntaxKind["BarToken"] = 100] = "BarToken";
        SyntaxKind[SyntaxKind["CaretToken"] = 101] = "CaretToken";
        SyntaxKind[SyntaxKind["ExclamationToken"] = 102] = "ExclamationToken";
        SyntaxKind[SyntaxKind["TildeToken"] = 103] = "TildeToken";
        SyntaxKind[SyntaxKind["AmpersandAmpersandToken"] = 104] = "AmpersandAmpersandToken";
        SyntaxKind[SyntaxKind["BarBarToken"] = 105] = "BarBarToken";
        SyntaxKind[SyntaxKind["QuestionToken"] = 106] = "QuestionToken";
        SyntaxKind[SyntaxKind["ColonToken"] = 107] = "ColonToken";
        SyntaxKind[SyntaxKind["EqualsToken"] = 108] = "EqualsToken";
        SyntaxKind[SyntaxKind["PlusEqualsToken"] = 109] = "PlusEqualsToken";
        SyntaxKind[SyntaxKind["MinusEqualsToken"] = 110] = "MinusEqualsToken";
        SyntaxKind[SyntaxKind["AsteriskEqualsToken"] = 111] = "AsteriskEqualsToken";
        SyntaxKind[SyntaxKind["PercentEqualsToken"] = 112] = "PercentEqualsToken";
        SyntaxKind[SyntaxKind["LessThanLessThanEqualsToken"] = 113] = "LessThanLessThanEqualsToken";
        SyntaxKind[SyntaxKind["GreaterThanGreaterThanEqualsToken"] = 114] = "GreaterThanGreaterThanEqualsToken";
        SyntaxKind[SyntaxKind["GreaterThanGreaterThanGreaterThanEqualsToken"] = 115] = "GreaterThanGreaterThanGreaterThanEqualsToken";
        SyntaxKind[SyntaxKind["AmpersandEqualsToken"] = 116] = "AmpersandEqualsToken";
        SyntaxKind[SyntaxKind["BarEqualsToken"] = 117] = "BarEqualsToken";
        SyntaxKind[SyntaxKind["CaretEqualsToken"] = 118] = "CaretEqualsToken";
        SyntaxKind[SyntaxKind["SlashToken"] = 119] = "SlashToken";
        SyntaxKind[SyntaxKind["SlashEqualsToken"] = 120] = "SlashEqualsToken";

        SyntaxKind[SyntaxKind["SourceUnit"] = 121] = "SourceUnit";

        SyntaxKind[SyntaxKind["QualifiedName"] = 122] = "QualifiedName";

        SyntaxKind[SyntaxKind["ObjectType"] = 123] = "ObjectType";
        SyntaxKind[SyntaxKind["FunctionType"] = 124] = "FunctionType";
        SyntaxKind[SyntaxKind["ArrayType"] = 125] = "ArrayType";
        SyntaxKind[SyntaxKind["ConstructorType"] = 126] = "ConstructorType";
        SyntaxKind[SyntaxKind["GenericType"] = 127] = "GenericType";

        SyntaxKind[SyntaxKind["InterfaceDeclaration"] = 128] = "InterfaceDeclaration";
        SyntaxKind[SyntaxKind["FunctionDeclaration"] = 129] = "FunctionDeclaration";
        SyntaxKind[SyntaxKind["ModuleDeclaration"] = 130] = "ModuleDeclaration";
        SyntaxKind[SyntaxKind["ClassDeclaration"] = 131] = "ClassDeclaration";
        SyntaxKind[SyntaxKind["EnumDeclaration"] = 132] = "EnumDeclaration";
        SyntaxKind[SyntaxKind["ImportDeclaration"] = 133] = "ImportDeclaration";
        SyntaxKind[SyntaxKind["ExportAssignment"] = 134] = "ExportAssignment";

        SyntaxKind[SyntaxKind["MemberFunctionDeclaration"] = 135] = "MemberFunctionDeclaration";
        SyntaxKind[SyntaxKind["MemberVariableDeclaration"] = 136] = "MemberVariableDeclaration";
        SyntaxKind[SyntaxKind["ConstructorDeclaration"] = 137] = "ConstructorDeclaration";
        SyntaxKind[SyntaxKind["GetMemberAccessorDeclaration"] = 138] = "GetMemberAccessorDeclaration";
        SyntaxKind[SyntaxKind["SetMemberAccessorDeclaration"] = 139] = "SetMemberAccessorDeclaration";

        SyntaxKind[SyntaxKind["PropertySignature"] = 140] = "PropertySignature";
        SyntaxKind[SyntaxKind["CallSignature"] = 141] = "CallSignature";
        SyntaxKind[SyntaxKind["ConstructSignature"] = 142] = "ConstructSignature";
        SyntaxKind[SyntaxKind["IndexSignature"] = 143] = "IndexSignature";
        SyntaxKind[SyntaxKind["MethodSignature"] = 144] = "MethodSignature";

        SyntaxKind[SyntaxKind["Block"] = 145] = "Block";
        SyntaxKind[SyntaxKind["IfStatement"] = 146] = "IfStatement";
        SyntaxKind[SyntaxKind["VariableStatement"] = 147] = "VariableStatement";
        SyntaxKind[SyntaxKind["ExpressionStatement"] = 148] = "ExpressionStatement";
        SyntaxKind[SyntaxKind["ReturnStatement"] = 149] = "ReturnStatement";
        SyntaxKind[SyntaxKind["SwitchStatement"] = 150] = "SwitchStatement";
        SyntaxKind[SyntaxKind["BreakStatement"] = 151] = "BreakStatement";
        SyntaxKind[SyntaxKind["ContinueStatement"] = 152] = "ContinueStatement";
        SyntaxKind[SyntaxKind["ForStatement"] = 153] = "ForStatement";
        SyntaxKind[SyntaxKind["ForInStatement"] = 154] = "ForInStatement";
        SyntaxKind[SyntaxKind["EmptyStatement"] = 155] = "EmptyStatement";
        SyntaxKind[SyntaxKind["ThrowStatement"] = 156] = "ThrowStatement";
        SyntaxKind[SyntaxKind["WhileStatement"] = 157] = "WhileStatement";
        SyntaxKind[SyntaxKind["TryStatement"] = 158] = "TryStatement";
        SyntaxKind[SyntaxKind["LabeledStatement"] = 159] = "LabeledStatement";
        SyntaxKind[SyntaxKind["DoStatement"] = 160] = "DoStatement";
        SyntaxKind[SyntaxKind["DebuggerStatement"] = 161] = "DebuggerStatement";
        SyntaxKind[SyntaxKind["WithStatement"] = 162] = "WithStatement";

        SyntaxKind[SyntaxKind["PlusExpression"] = 163] = "PlusExpression";
        SyntaxKind[SyntaxKind["NegateExpression"] = 164] = "NegateExpression";
        SyntaxKind[SyntaxKind["BitwiseNotExpression"] = 165] = "BitwiseNotExpression";
        SyntaxKind[SyntaxKind["LogicalNotExpression"] = 166] = "LogicalNotExpression";
        SyntaxKind[SyntaxKind["PreIncrementExpression"] = 167] = "PreIncrementExpression";
        SyntaxKind[SyntaxKind["PreDecrementExpression"] = 168] = "PreDecrementExpression";
        SyntaxKind[SyntaxKind["DeleteExpression"] = 169] = "DeleteExpression";
        SyntaxKind[SyntaxKind["TypeOfExpression"] = 170] = "TypeOfExpression";
        SyntaxKind[SyntaxKind["VoidExpression"] = 171] = "VoidExpression";
        SyntaxKind[SyntaxKind["CommaExpression"] = 172] = "CommaExpression";
        SyntaxKind[SyntaxKind["AssignmentExpression"] = 173] = "AssignmentExpression";
        SyntaxKind[SyntaxKind["AddAssignmentExpression"] = 174] = "AddAssignmentExpression";
        SyntaxKind[SyntaxKind["SubtractAssignmentExpression"] = 175] = "SubtractAssignmentExpression";
        SyntaxKind[SyntaxKind["MultiplyAssignmentExpression"] = 176] = "MultiplyAssignmentExpression";
        SyntaxKind[SyntaxKind["DivideAssignmentExpression"] = 177] = "DivideAssignmentExpression";
        SyntaxKind[SyntaxKind["ModuloAssignmentExpression"] = 178] = "ModuloAssignmentExpression";
        SyntaxKind[SyntaxKind["AndAssignmentExpression"] = 179] = "AndAssignmentExpression";
        SyntaxKind[SyntaxKind["ExclusiveOrAssignmentExpression"] = 180] = "ExclusiveOrAssignmentExpression";
        SyntaxKind[SyntaxKind["OrAssignmentExpression"] = 181] = "OrAssignmentExpression";
        SyntaxKind[SyntaxKind["LeftShiftAssignmentExpression"] = 182] = "LeftShiftAssignmentExpression";
        SyntaxKind[SyntaxKind["SignedRightShiftAssignmentExpression"] = 183] = "SignedRightShiftAssignmentExpression";
        SyntaxKind[SyntaxKind["UnsignedRightShiftAssignmentExpression"] = 184] = "UnsignedRightShiftAssignmentExpression";
        SyntaxKind[SyntaxKind["ConditionalExpression"] = 185] = "ConditionalExpression";
        SyntaxKind[SyntaxKind["LogicalOrExpression"] = 186] = "LogicalOrExpression";
        SyntaxKind[SyntaxKind["LogicalAndExpression"] = 187] = "LogicalAndExpression";
        SyntaxKind[SyntaxKind["BitwiseOrExpression"] = 188] = "BitwiseOrExpression";
        SyntaxKind[SyntaxKind["BitwiseExclusiveOrExpression"] = 189] = "BitwiseExclusiveOrExpression";
        SyntaxKind[SyntaxKind["BitwiseAndExpression"] = 190] = "BitwiseAndExpression";
        SyntaxKind[SyntaxKind["EqualsWithTypeConversionExpression"] = 191] = "EqualsWithTypeConversionExpression";
        SyntaxKind[SyntaxKind["NotEqualsWithTypeConversionExpression"] = 192] = "NotEqualsWithTypeConversionExpression";
        SyntaxKind[SyntaxKind["EqualsExpression"] = 193] = "EqualsExpression";
        SyntaxKind[SyntaxKind["NotEqualsExpression"] = 194] = "NotEqualsExpression";
        SyntaxKind[SyntaxKind["LessThanExpression"] = 195] = "LessThanExpression";
        SyntaxKind[SyntaxKind["GreaterThanExpression"] = 196] = "GreaterThanExpression";
        SyntaxKind[SyntaxKind["LessThanOrEqualExpression"] = 197] = "LessThanOrEqualExpression";
        SyntaxKind[SyntaxKind["GreaterThanOrEqualExpression"] = 198] = "GreaterThanOrEqualExpression";
        SyntaxKind[SyntaxKind["InstanceOfExpression"] = 199] = "InstanceOfExpression";
        SyntaxKind[SyntaxKind["InExpression"] = 200] = "InExpression";
        SyntaxKind[SyntaxKind["LeftShiftExpression"] = 201] = "LeftShiftExpression";
        SyntaxKind[SyntaxKind["SignedRightShiftExpression"] = 202] = "SignedRightShiftExpression";
        SyntaxKind[SyntaxKind["UnsignedRightShiftExpression"] = 203] = "UnsignedRightShiftExpression";
        SyntaxKind[SyntaxKind["MultiplyExpression"] = 204] = "MultiplyExpression";
        SyntaxKind[SyntaxKind["DivideExpression"] = 205] = "DivideExpression";
        SyntaxKind[SyntaxKind["ModuloExpression"] = 206] = "ModuloExpression";
        SyntaxKind[SyntaxKind["AddExpression"] = 207] = "AddExpression";
        SyntaxKind[SyntaxKind["SubtractExpression"] = 208] = "SubtractExpression";
        SyntaxKind[SyntaxKind["PostIncrementExpression"] = 209] = "PostIncrementExpression";
        SyntaxKind[SyntaxKind["PostDecrementExpression"] = 210] = "PostDecrementExpression";
        SyntaxKind[SyntaxKind["MemberAccessExpression"] = 211] = "MemberAccessExpression";
        SyntaxKind[SyntaxKind["InvocationExpression"] = 212] = "InvocationExpression";
        SyntaxKind[SyntaxKind["ArrayLiteralExpression"] = 213] = "ArrayLiteralExpression";
        SyntaxKind[SyntaxKind["ObjectLiteralExpression"] = 214] = "ObjectLiteralExpression";
        SyntaxKind[SyntaxKind["ObjectCreationExpression"] = 215] = "ObjectCreationExpression";
        SyntaxKind[SyntaxKind["ParenthesizedExpression"] = 216] = "ParenthesizedExpression";
        SyntaxKind[SyntaxKind["ParenthesizedArrowFunctionExpression"] = 217] = "ParenthesizedArrowFunctionExpression";
        SyntaxKind[SyntaxKind["SimpleArrowFunctionExpression"] = 218] = "SimpleArrowFunctionExpression";
        SyntaxKind[SyntaxKind["CastExpression"] = 219] = "CastExpression";
        SyntaxKind[SyntaxKind["ElementAccessExpression"] = 220] = "ElementAccessExpression";
        SyntaxKind[SyntaxKind["FunctionExpression"] = 221] = "FunctionExpression";
        SyntaxKind[SyntaxKind["OmittedExpression"] = 222] = "OmittedExpression";

        SyntaxKind[SyntaxKind["VariableDeclaration"] = 223] = "VariableDeclaration";
        SyntaxKind[SyntaxKind["VariableDeclarator"] = 224] = "VariableDeclarator";

        SyntaxKind[SyntaxKind["ArgumentList"] = 225] = "ArgumentList";
        SyntaxKind[SyntaxKind["ParameterList"] = 226] = "ParameterList";
        SyntaxKind[SyntaxKind["TypeArgumentList"] = 227] = "TypeArgumentList";
        SyntaxKind[SyntaxKind["TypeParameterList"] = 228] = "TypeParameterList";

        SyntaxKind[SyntaxKind["HeritageClause"] = 229] = "HeritageClause";
        SyntaxKind[SyntaxKind["EqualsValueClause"] = 230] = "EqualsValueClause";
        SyntaxKind[SyntaxKind["CaseSwitchClause"] = 231] = "CaseSwitchClause";
        SyntaxKind[SyntaxKind["DefaultSwitchClause"] = 232] = "DefaultSwitchClause";
        SyntaxKind[SyntaxKind["ElseClause"] = 233] = "ElseClause";
        SyntaxKind[SyntaxKind["CatchClause"] = 234] = "CatchClause";
        SyntaxKind[SyntaxKind["FinallyClause"] = 235] = "FinallyClause";

        SyntaxKind[SyntaxKind["TypeParameter"] = 236] = "TypeParameter";
        SyntaxKind[SyntaxKind["Constraint"] = 237] = "Constraint";

        SyntaxKind[SyntaxKind["SimplePropertyAssignment"] = 238] = "SimplePropertyAssignment";
        SyntaxKind[SyntaxKind["GetAccessorPropertyAssignment"] = 239] = "GetAccessorPropertyAssignment";
        SyntaxKind[SyntaxKind["SetAccessorPropertyAssignment"] = 240] = "SetAccessorPropertyAssignment";
        SyntaxKind[SyntaxKind["FunctionPropertyAssignment"] = 241] = "FunctionPropertyAssignment";

        SyntaxKind[SyntaxKind["Parameter"] = 242] = "Parameter";
        SyntaxKind[SyntaxKind["EnumElement"] = 243] = "EnumElement";
        SyntaxKind[SyntaxKind["TypeAnnotation"] = 244] = "TypeAnnotation";
        SyntaxKind[SyntaxKind["ExternalModuleReference"] = 245] = "ExternalModuleReference";
        SyntaxKind[SyntaxKind["ModuleNameModuleReference"] = 246] = "ModuleNameModuleReference";

        SyntaxKind[SyntaxKind["FirstStandardKeyword"] = SyntaxKind.BreakKeyword] = "FirstStandardKeyword";
        SyntaxKind[SyntaxKind["LastStandardKeyword"] = SyntaxKind.WithKeyword] = "LastStandardKeyword";

        SyntaxKind[SyntaxKind["FirstFutureReservedKeyword"] = SyntaxKind.ClassKeyword] = "FirstFutureReservedKeyword";
        SyntaxKind[SyntaxKind["LastFutureReservedKeyword"] = SyntaxKind.SuperKeyword] = "LastFutureReservedKeyword";

        SyntaxKind[SyntaxKind["FirstFutureReservedStrictKeyword"] = SyntaxKind.ImplementsKeyword] = "FirstFutureReservedStrictKeyword";
        SyntaxKind[SyntaxKind["LastFutureReservedStrictKeyword"] = SyntaxKind.YieldKeyword] = "LastFutureReservedStrictKeyword";

        SyntaxKind[SyntaxKind["FirstTypeScriptKeyword"] = SyntaxKind.AnyKeyword] = "FirstTypeScriptKeyword";
        SyntaxKind[SyntaxKind["LastTypeScriptKeyword"] = SyntaxKind.StringKeyword] = "LastTypeScriptKeyword";

        SyntaxKind[SyntaxKind["FirstKeyword"] = SyntaxKind.FirstStandardKeyword] = "FirstKeyword";
        SyntaxKind[SyntaxKind["LastKeyword"] = SyntaxKind.LastTypeScriptKeyword] = "LastKeyword";

        SyntaxKind[SyntaxKind["FirstToken"] = SyntaxKind.ErrorToken] = "FirstToken";
        SyntaxKind[SyntaxKind["LastToken"] = SyntaxKind.SlashEqualsToken] = "LastToken";

        SyntaxKind[SyntaxKind["FirstPunctuation"] = SyntaxKind.OpenBraceToken] = "FirstPunctuation";
        SyntaxKind[SyntaxKind["LastPunctuation"] = SyntaxKind.SlashEqualsToken] = "LastPunctuation";

        SyntaxKind[SyntaxKind["FirstFixedWidth"] = SyntaxKind.FirstKeyword] = "FirstFixedWidth";
        SyntaxKind[SyntaxKind["LastFixedWidth"] = SyntaxKind.LastPunctuation] = "LastFixedWidth";
    })(TypeScript.SyntaxKind || (TypeScript.SyntaxKind = {}));
    var SyntaxKind = TypeScript.SyntaxKind;
})(TypeScript || (TypeScript = {}));
