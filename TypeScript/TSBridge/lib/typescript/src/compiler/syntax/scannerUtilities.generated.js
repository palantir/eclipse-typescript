var TypeScript;
(function (TypeScript) {
    var ScannerUtilities = (function () {
        function ScannerUtilities() {
        }
        ScannerUtilities.identifierKind = function (array, startIndex, length) {
            switch (length) {
                case 2:
                    switch (array[startIndex]) {
                        case TypeScript.CharacterCodes.d:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.o) ? TypeScript.SyntaxKind.DoKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.i:
                            switch (array[startIndex + 1]) {
                                case TypeScript.CharacterCodes.f:
                                    return TypeScript.SyntaxKind.IfKeyword;
                                case TypeScript.CharacterCodes.n:
                                    return TypeScript.SyntaxKind.InKeyword;
                                default:
                                    return TypeScript.SyntaxKind.IdentifierName;
                            }

                        default:
                            return TypeScript.SyntaxKind.IdentifierName;
                    }

                case 3:
                    switch (array[startIndex]) {
                        case TypeScript.CharacterCodes.f:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.o && array[startIndex + 2] === TypeScript.CharacterCodes.r) ? TypeScript.SyntaxKind.ForKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.n:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.e && array[startIndex + 2] === TypeScript.CharacterCodes.w) ? TypeScript.SyntaxKind.NewKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.t:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.r && array[startIndex + 2] === TypeScript.CharacterCodes.y) ? TypeScript.SyntaxKind.TryKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.v:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.a && array[startIndex + 2] === TypeScript.CharacterCodes.r) ? TypeScript.SyntaxKind.VarKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.l:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.e && array[startIndex + 2] === TypeScript.CharacterCodes.t) ? TypeScript.SyntaxKind.LetKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.a:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.n && array[startIndex + 2] === TypeScript.CharacterCodes.y) ? TypeScript.SyntaxKind.AnyKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.g:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.e && array[startIndex + 2] === TypeScript.CharacterCodes.t) ? TypeScript.SyntaxKind.GetKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.s:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.e && array[startIndex + 2] === TypeScript.CharacterCodes.t) ? TypeScript.SyntaxKind.SetKeyword : TypeScript.SyntaxKind.IdentifierName;
                        default:
                            return TypeScript.SyntaxKind.IdentifierName;
                    }

                case 4:
                    switch (array[startIndex]) {
                        case TypeScript.CharacterCodes.c:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.a && array[startIndex + 2] === TypeScript.CharacterCodes.s && array[startIndex + 3] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.CaseKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.e:
                            switch (array[startIndex + 1]) {
                                case TypeScript.CharacterCodes.l:
                                    return (array[startIndex + 2] === TypeScript.CharacterCodes.s && array[startIndex + 3] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.ElseKeyword : TypeScript.SyntaxKind.IdentifierName;
                                case TypeScript.CharacterCodes.n:
                                    return (array[startIndex + 2] === TypeScript.CharacterCodes.u && array[startIndex + 3] === TypeScript.CharacterCodes.m) ? TypeScript.SyntaxKind.EnumKeyword : TypeScript.SyntaxKind.IdentifierName;
                                default:
                                    return TypeScript.SyntaxKind.IdentifierName;
                            }

                        case TypeScript.CharacterCodes.n:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.u && array[startIndex + 2] === TypeScript.CharacterCodes.l && array[startIndex + 3] === TypeScript.CharacterCodes.l) ? TypeScript.SyntaxKind.NullKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.t:
                            switch (array[startIndex + 1]) {
                                case TypeScript.CharacterCodes.h:
                                    return (array[startIndex + 2] === TypeScript.CharacterCodes.i && array[startIndex + 3] === TypeScript.CharacterCodes.s) ? TypeScript.SyntaxKind.ThisKeyword : TypeScript.SyntaxKind.IdentifierName;
                                case TypeScript.CharacterCodes.r:
                                    return (array[startIndex + 2] === TypeScript.CharacterCodes.u && array[startIndex + 3] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.TrueKeyword : TypeScript.SyntaxKind.IdentifierName;
                                default:
                                    return TypeScript.SyntaxKind.IdentifierName;
                            }

                        case TypeScript.CharacterCodes.v:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.o && array[startIndex + 2] === TypeScript.CharacterCodes.i && array[startIndex + 3] === TypeScript.CharacterCodes.d) ? TypeScript.SyntaxKind.VoidKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.w:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.i && array[startIndex + 2] === TypeScript.CharacterCodes.t && array[startIndex + 3] === TypeScript.CharacterCodes.h) ? TypeScript.SyntaxKind.WithKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.b:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.o && array[startIndex + 2] === TypeScript.CharacterCodes.o && array[startIndex + 3] === TypeScript.CharacterCodes.l) ? TypeScript.SyntaxKind.BoolKeyword : TypeScript.SyntaxKind.IdentifierName;
                        default:
                            return TypeScript.SyntaxKind.IdentifierName;
                    }

                case 5:
                    switch (array[startIndex]) {
                        case TypeScript.CharacterCodes.b:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.r && array[startIndex + 2] === TypeScript.CharacterCodes.e && array[startIndex + 3] === TypeScript.CharacterCodes.a && array[startIndex + 4] === TypeScript.CharacterCodes.k) ? TypeScript.SyntaxKind.BreakKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.c:
                            switch (array[startIndex + 1]) {
                                case TypeScript.CharacterCodes.a:
                                    return (array[startIndex + 2] === TypeScript.CharacterCodes.t && array[startIndex + 3] === TypeScript.CharacterCodes.c && array[startIndex + 4] === TypeScript.CharacterCodes.h) ? TypeScript.SyntaxKind.CatchKeyword : TypeScript.SyntaxKind.IdentifierName;
                                case TypeScript.CharacterCodes.l:
                                    return (array[startIndex + 2] === TypeScript.CharacterCodes.a && array[startIndex + 3] === TypeScript.CharacterCodes.s && array[startIndex + 4] === TypeScript.CharacterCodes.s) ? TypeScript.SyntaxKind.ClassKeyword : TypeScript.SyntaxKind.IdentifierName;
                                case TypeScript.CharacterCodes.o:
                                    return (array[startIndex + 2] === TypeScript.CharacterCodes.n && array[startIndex + 3] === TypeScript.CharacterCodes.s && array[startIndex + 4] === TypeScript.CharacterCodes.t) ? TypeScript.SyntaxKind.ConstKeyword : TypeScript.SyntaxKind.IdentifierName;
                                default:
                                    return TypeScript.SyntaxKind.IdentifierName;
                            }

                        case TypeScript.CharacterCodes.f:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.a && array[startIndex + 2] === TypeScript.CharacterCodes.l && array[startIndex + 3] === TypeScript.CharacterCodes.s && array[startIndex + 4] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.FalseKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.t:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.h && array[startIndex + 2] === TypeScript.CharacterCodes.r && array[startIndex + 3] === TypeScript.CharacterCodes.o && array[startIndex + 4] === TypeScript.CharacterCodes.w) ? TypeScript.SyntaxKind.ThrowKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.w:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.h && array[startIndex + 2] === TypeScript.CharacterCodes.i && array[startIndex + 3] === TypeScript.CharacterCodes.l && array[startIndex + 4] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.WhileKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.s:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.u && array[startIndex + 2] === TypeScript.CharacterCodes.p && array[startIndex + 3] === TypeScript.CharacterCodes.e && array[startIndex + 4] === TypeScript.CharacterCodes.r) ? TypeScript.SyntaxKind.SuperKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.y:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.i && array[startIndex + 2] === TypeScript.CharacterCodes.e && array[startIndex + 3] === TypeScript.CharacterCodes.l && array[startIndex + 4] === TypeScript.CharacterCodes.d) ? TypeScript.SyntaxKind.YieldKeyword : TypeScript.SyntaxKind.IdentifierName;
                        default:
                            return TypeScript.SyntaxKind.IdentifierName;
                    }

                case 6:
                    switch (array[startIndex]) {
                        case TypeScript.CharacterCodes.d:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.e && array[startIndex + 2] === TypeScript.CharacterCodes.l && array[startIndex + 3] === TypeScript.CharacterCodes.e && array[startIndex + 4] === TypeScript.CharacterCodes.t && array[startIndex + 5] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.DeleteKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.r:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.e && array[startIndex + 2] === TypeScript.CharacterCodes.t && array[startIndex + 3] === TypeScript.CharacterCodes.u && array[startIndex + 4] === TypeScript.CharacterCodes.r && array[startIndex + 5] === TypeScript.CharacterCodes.n) ? TypeScript.SyntaxKind.ReturnKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.s:
                            switch (array[startIndex + 1]) {
                                case TypeScript.CharacterCodes.w:
                                    return (array[startIndex + 2] === TypeScript.CharacterCodes.i && array[startIndex + 3] === TypeScript.CharacterCodes.t && array[startIndex + 4] === TypeScript.CharacterCodes.c && array[startIndex + 5] === TypeScript.CharacterCodes.h) ? TypeScript.SyntaxKind.SwitchKeyword : TypeScript.SyntaxKind.IdentifierName;
                                case TypeScript.CharacterCodes.t:
                                    switch (array[startIndex + 2]) {
                                        case TypeScript.CharacterCodes.a:
                                            return (array[startIndex + 3] === TypeScript.CharacterCodes.t && array[startIndex + 4] === TypeScript.CharacterCodes.i && array[startIndex + 5] === TypeScript.CharacterCodes.c) ? TypeScript.SyntaxKind.StaticKeyword : TypeScript.SyntaxKind.IdentifierName;
                                        case TypeScript.CharacterCodes.r:
                                            return (array[startIndex + 3] === TypeScript.CharacterCodes.i && array[startIndex + 4] === TypeScript.CharacterCodes.n && array[startIndex + 5] === TypeScript.CharacterCodes.g) ? TypeScript.SyntaxKind.StringKeyword : TypeScript.SyntaxKind.IdentifierName;
                                        default:
                                            return TypeScript.SyntaxKind.IdentifierName;
                                    }

                                default:
                                    return TypeScript.SyntaxKind.IdentifierName;
                            }

                        case TypeScript.CharacterCodes.t:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.y && array[startIndex + 2] === TypeScript.CharacterCodes.p && array[startIndex + 3] === TypeScript.CharacterCodes.e && array[startIndex + 4] === TypeScript.CharacterCodes.o && array[startIndex + 5] === TypeScript.CharacterCodes.f) ? TypeScript.SyntaxKind.TypeOfKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.e:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.x && array[startIndex + 2] === TypeScript.CharacterCodes.p && array[startIndex + 3] === TypeScript.CharacterCodes.o && array[startIndex + 4] === TypeScript.CharacterCodes.r && array[startIndex + 5] === TypeScript.CharacterCodes.t) ? TypeScript.SyntaxKind.ExportKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.i:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.m && array[startIndex + 2] === TypeScript.CharacterCodes.p && array[startIndex + 3] === TypeScript.CharacterCodes.o && array[startIndex + 4] === TypeScript.CharacterCodes.r && array[startIndex + 5] === TypeScript.CharacterCodes.t) ? TypeScript.SyntaxKind.ImportKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.p:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.u && array[startIndex + 2] === TypeScript.CharacterCodes.b && array[startIndex + 3] === TypeScript.CharacterCodes.l && array[startIndex + 4] === TypeScript.CharacterCodes.i && array[startIndex + 5] === TypeScript.CharacterCodes.c) ? TypeScript.SyntaxKind.PublicKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.m:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.o && array[startIndex + 2] === TypeScript.CharacterCodes.d && array[startIndex + 3] === TypeScript.CharacterCodes.u && array[startIndex + 4] === TypeScript.CharacterCodes.l && array[startIndex + 5] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.ModuleKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.n:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.u && array[startIndex + 2] === TypeScript.CharacterCodes.m && array[startIndex + 3] === TypeScript.CharacterCodes.b && array[startIndex + 4] === TypeScript.CharacterCodes.e && array[startIndex + 5] === TypeScript.CharacterCodes.r) ? TypeScript.SyntaxKind.NumberKeyword : TypeScript.SyntaxKind.IdentifierName;
                        default:
                            return TypeScript.SyntaxKind.IdentifierName;
                    }

                case 7:
                    switch (array[startIndex]) {
                        case TypeScript.CharacterCodes.d:
                            switch (array[startIndex + 1]) {
                                case TypeScript.CharacterCodes.e:
                                    switch (array[startIndex + 2]) {
                                        case TypeScript.CharacterCodes.f:
                                            return (array[startIndex + 3] === TypeScript.CharacterCodes.a && array[startIndex + 4] === TypeScript.CharacterCodes.u && array[startIndex + 5] === TypeScript.CharacterCodes.l && array[startIndex + 6] === TypeScript.CharacterCodes.t) ? TypeScript.SyntaxKind.DefaultKeyword : TypeScript.SyntaxKind.IdentifierName;
                                        case TypeScript.CharacterCodes.c:
                                            return (array[startIndex + 3] === TypeScript.CharacterCodes.l && array[startIndex + 4] === TypeScript.CharacterCodes.a && array[startIndex + 5] === TypeScript.CharacterCodes.r && array[startIndex + 6] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.DeclareKeyword : TypeScript.SyntaxKind.IdentifierName;
                                        default:
                                            return TypeScript.SyntaxKind.IdentifierName;
                                    }

                                default:
                                    return TypeScript.SyntaxKind.IdentifierName;
                            }

                        case TypeScript.CharacterCodes.f:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.i && array[startIndex + 2] === TypeScript.CharacterCodes.n && array[startIndex + 3] === TypeScript.CharacterCodes.a && array[startIndex + 4] === TypeScript.CharacterCodes.l && array[startIndex + 5] === TypeScript.CharacterCodes.l && array[startIndex + 6] === TypeScript.CharacterCodes.y) ? TypeScript.SyntaxKind.FinallyKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.e:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.x && array[startIndex + 2] === TypeScript.CharacterCodes.t && array[startIndex + 3] === TypeScript.CharacterCodes.e && array[startIndex + 4] === TypeScript.CharacterCodes.n && array[startIndex + 5] === TypeScript.CharacterCodes.d && array[startIndex + 6] === TypeScript.CharacterCodes.s) ? TypeScript.SyntaxKind.ExtendsKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.p:
                            switch (array[startIndex + 1]) {
                                case TypeScript.CharacterCodes.a:
                                    return (array[startIndex + 2] === TypeScript.CharacterCodes.c && array[startIndex + 3] === TypeScript.CharacterCodes.k && array[startIndex + 4] === TypeScript.CharacterCodes.a && array[startIndex + 5] === TypeScript.CharacterCodes.g && array[startIndex + 6] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.PackageKeyword : TypeScript.SyntaxKind.IdentifierName;
                                case TypeScript.CharacterCodes.r:
                                    return (array[startIndex + 2] === TypeScript.CharacterCodes.i && array[startIndex + 3] === TypeScript.CharacterCodes.v && array[startIndex + 4] === TypeScript.CharacterCodes.a && array[startIndex + 5] === TypeScript.CharacterCodes.t && array[startIndex + 6] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.PrivateKeyword : TypeScript.SyntaxKind.IdentifierName;
                                default:
                                    return TypeScript.SyntaxKind.IdentifierName;
                            }

                        case TypeScript.CharacterCodes.b:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.o && array[startIndex + 2] === TypeScript.CharacterCodes.o && array[startIndex + 3] === TypeScript.CharacterCodes.l && array[startIndex + 4] === TypeScript.CharacterCodes.e && array[startIndex + 5] === TypeScript.CharacterCodes.a && array[startIndex + 6] === TypeScript.CharacterCodes.n) ? TypeScript.SyntaxKind.BooleanKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.r:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.e && array[startIndex + 2] === TypeScript.CharacterCodes.q && array[startIndex + 3] === TypeScript.CharacterCodes.u && array[startIndex + 4] === TypeScript.CharacterCodes.i && array[startIndex + 5] === TypeScript.CharacterCodes.r && array[startIndex + 6] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.RequireKeyword : TypeScript.SyntaxKind.IdentifierName;
                        default:
                            return TypeScript.SyntaxKind.IdentifierName;
                    }

                case 8:
                    switch (array[startIndex]) {
                        case TypeScript.CharacterCodes.c:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.o && array[startIndex + 2] === TypeScript.CharacterCodes.n && array[startIndex + 3] === TypeScript.CharacterCodes.t && array[startIndex + 4] === TypeScript.CharacterCodes.i && array[startIndex + 5] === TypeScript.CharacterCodes.n && array[startIndex + 6] === TypeScript.CharacterCodes.u && array[startIndex + 7] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.ContinueKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.d:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.e && array[startIndex + 2] === TypeScript.CharacterCodes.b && array[startIndex + 3] === TypeScript.CharacterCodes.u && array[startIndex + 4] === TypeScript.CharacterCodes.g && array[startIndex + 5] === TypeScript.CharacterCodes.g && array[startIndex + 6] === TypeScript.CharacterCodes.e && array[startIndex + 7] === TypeScript.CharacterCodes.r) ? TypeScript.SyntaxKind.DebuggerKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.f:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.u && array[startIndex + 2] === TypeScript.CharacterCodes.n && array[startIndex + 3] === TypeScript.CharacterCodes.c && array[startIndex + 4] === TypeScript.CharacterCodes.t && array[startIndex + 5] === TypeScript.CharacterCodes.i && array[startIndex + 6] === TypeScript.CharacterCodes.o && array[startIndex + 7] === TypeScript.CharacterCodes.n) ? TypeScript.SyntaxKind.FunctionKeyword : TypeScript.SyntaxKind.IdentifierName;
                        default:
                            return TypeScript.SyntaxKind.IdentifierName;
                    }

                case 9:
                    switch (array[startIndex]) {
                        case TypeScript.CharacterCodes.i:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.n && array[startIndex + 2] === TypeScript.CharacterCodes.t && array[startIndex + 3] === TypeScript.CharacterCodes.e && array[startIndex + 4] === TypeScript.CharacterCodes.r && array[startIndex + 5] === TypeScript.CharacterCodes.f && array[startIndex + 6] === TypeScript.CharacterCodes.a && array[startIndex + 7] === TypeScript.CharacterCodes.c && array[startIndex + 8] === TypeScript.CharacterCodes.e) ? TypeScript.SyntaxKind.InterfaceKeyword : TypeScript.SyntaxKind.IdentifierName;
                        case TypeScript.CharacterCodes.p:
                            return (array[startIndex + 1] === TypeScript.CharacterCodes.r && array[startIndex + 2] === TypeScript.CharacterCodes.o && array[startIndex + 3] === TypeScript.CharacterCodes.t && array[startIndex + 4] === TypeScript.CharacterCodes.e && array[startIndex + 5] === TypeScript.CharacterCodes.c && array[startIndex + 6] === TypeScript.CharacterCodes.t && array[startIndex + 7] === TypeScript.CharacterCodes.e && array[startIndex + 8] === TypeScript.CharacterCodes.d) ? TypeScript.SyntaxKind.ProtectedKeyword : TypeScript.SyntaxKind.IdentifierName;
                        default:
                            return TypeScript.SyntaxKind.IdentifierName;
                    }

                case 10:
                    switch (array[startIndex]) {
                        case TypeScript.CharacterCodes.i:
                            switch (array[startIndex + 1]) {
                                case TypeScript.CharacterCodes.n:
                                    return (array[startIndex + 2] === TypeScript.CharacterCodes.s && array[startIndex + 3] === TypeScript.CharacterCodes.t && array[startIndex + 4] === TypeScript.CharacterCodes.a && array[startIndex + 5] === TypeScript.CharacterCodes.n && array[startIndex + 6] === TypeScript.CharacterCodes.c && array[startIndex + 7] === TypeScript.CharacterCodes.e && array[startIndex + 8] === TypeScript.CharacterCodes.o && array[startIndex + 9] === TypeScript.CharacterCodes.f) ? TypeScript.SyntaxKind.InstanceOfKeyword : TypeScript.SyntaxKind.IdentifierName;
                                case TypeScript.CharacterCodes.m:
                                    return (array[startIndex + 2] === TypeScript.CharacterCodes.p && array[startIndex + 3] === TypeScript.CharacterCodes.l && array[startIndex + 4] === TypeScript.CharacterCodes.e && array[startIndex + 5] === TypeScript.CharacterCodes.m && array[startIndex + 6] === TypeScript.CharacterCodes.e && array[startIndex + 7] === TypeScript.CharacterCodes.n && array[startIndex + 8] === TypeScript.CharacterCodes.t && array[startIndex + 9] === TypeScript.CharacterCodes.s) ? TypeScript.SyntaxKind.ImplementsKeyword : TypeScript.SyntaxKind.IdentifierName;
                                default:
                                    return TypeScript.SyntaxKind.IdentifierName;
                            }

                        default:
                            return TypeScript.SyntaxKind.IdentifierName;
                    }

                case 11:
                    return (array[startIndex] === TypeScript.CharacterCodes.c && array[startIndex + 1] === TypeScript.CharacterCodes.o && array[startIndex + 2] === TypeScript.CharacterCodes.n && array[startIndex + 3] === TypeScript.CharacterCodes.s && array[startIndex + 4] === TypeScript.CharacterCodes.t && array[startIndex + 5] === TypeScript.CharacterCodes.r && array[startIndex + 6] === TypeScript.CharacterCodes.u && array[startIndex + 7] === TypeScript.CharacterCodes.c && array[startIndex + 8] === TypeScript.CharacterCodes.t && array[startIndex + 9] === TypeScript.CharacterCodes.o && array[startIndex + 10] === TypeScript.CharacterCodes.r) ? TypeScript.SyntaxKind.ConstructorKeyword : TypeScript.SyntaxKind.IdentifierName;
                default:
                    return TypeScript.SyntaxKind.IdentifierName;
            }
        };
        return ScannerUtilities;
    })();
    TypeScript.ScannerUtilities = ScannerUtilities;
})(TypeScript || (TypeScript = {}));
