var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var SourceUnitSyntax = (function (_super) {
        __extends(SourceUnitSyntax, _super);
        function SourceUnitSyntax(moduleElements, endOfFileToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.moduleElements = moduleElements;
            this.endOfFileToken = endOfFileToken;
        }
        SourceUnitSyntax.prototype.accept = function (visitor) {
            return visitor.visitSourceUnit(this);
        };

        SourceUnitSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.SourceUnit;
        };

        SourceUnitSyntax.prototype.childCount = function () {
            return 2;
        };

        SourceUnitSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.moduleElements;
                case 1:
                    return this.endOfFileToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        SourceUnitSyntax.prototype.update = function (moduleElements, endOfFileToken) {
            if (this.moduleElements === moduleElements && this.endOfFileToken === endOfFileToken) {
                return this;
            }

            return new SourceUnitSyntax(moduleElements, endOfFileToken, this.parsedInStrictMode());
        };

        SourceUnitSyntax.create = function (endOfFileToken) {
            return new SourceUnitSyntax(TypeScript.Syntax.emptyList, endOfFileToken, false);
        };

        SourceUnitSyntax.create1 = function (endOfFileToken) {
            return new SourceUnitSyntax(TypeScript.Syntax.emptyList, endOfFileToken, false);
        };

        SourceUnitSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        SourceUnitSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        SourceUnitSyntax.prototype.withModuleElements = function (moduleElements) {
            return this.update(moduleElements, this.endOfFileToken);
        };

        SourceUnitSyntax.prototype.withModuleElement = function (moduleElement) {
            return this.withModuleElements(TypeScript.Syntax.list([moduleElement]));
        };

        SourceUnitSyntax.prototype.withEndOfFileToken = function (endOfFileToken) {
            return this.update(this.moduleElements, endOfFileToken);
        };

        SourceUnitSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.moduleElements.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return SourceUnitSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.SourceUnitSyntax = SourceUnitSyntax;

    var ModuleReferenceSyntax = (function (_super) {
        __extends(ModuleReferenceSyntax, _super);
        function ModuleReferenceSyntax(parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
        }
        ModuleReferenceSyntax.prototype.isModuleReference = function () {
            return true;
        };

        ModuleReferenceSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ModuleReferenceSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ModuleReferenceSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ModuleReferenceSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ModuleReferenceSyntax = ModuleReferenceSyntax;

    var ExternalModuleReferenceSyntax = (function (_super) {
        __extends(ExternalModuleReferenceSyntax, _super);
        function ExternalModuleReferenceSyntax(moduleOrRequireKeyword, openParenToken, stringLiteral, closeParenToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.moduleOrRequireKeyword = moduleOrRequireKeyword;
            this.openParenToken = openParenToken;
            this.stringLiteral = stringLiteral;
            this.closeParenToken = closeParenToken;
        }
        ExternalModuleReferenceSyntax.prototype.accept = function (visitor) {
            return visitor.visitExternalModuleReference(this);
        };

        ExternalModuleReferenceSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ExternalModuleReference;
        };

        ExternalModuleReferenceSyntax.prototype.childCount = function () {
            return 4;
        };

        ExternalModuleReferenceSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.moduleOrRequireKeyword;
                case 1:
                    return this.openParenToken;
                case 2:
                    return this.stringLiteral;
                case 3:
                    return this.closeParenToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ExternalModuleReferenceSyntax.prototype.update = function (moduleOrRequireKeyword, openParenToken, stringLiteral, closeParenToken) {
            if (this.moduleOrRequireKeyword === moduleOrRequireKeyword && this.openParenToken === openParenToken && this.stringLiteral === stringLiteral && this.closeParenToken === closeParenToken) {
                return this;
            }

            return new ExternalModuleReferenceSyntax(moduleOrRequireKeyword, openParenToken, stringLiteral, closeParenToken, this.parsedInStrictMode());
        };

        ExternalModuleReferenceSyntax.create1 = function (moduleOrRequireKeyword, stringLiteral) {
            return new ExternalModuleReferenceSyntax(moduleOrRequireKeyword, TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), stringLiteral, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), false);
        };

        ExternalModuleReferenceSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ExternalModuleReferenceSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ExternalModuleReferenceSyntax.prototype.withModuleOrRequireKeyword = function (moduleOrRequireKeyword) {
            return this.update(moduleOrRequireKeyword, this.openParenToken, this.stringLiteral, this.closeParenToken);
        };

        ExternalModuleReferenceSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(this.moduleOrRequireKeyword, openParenToken, this.stringLiteral, this.closeParenToken);
        };

        ExternalModuleReferenceSyntax.prototype.withStringLiteral = function (stringLiteral) {
            return this.update(this.moduleOrRequireKeyword, this.openParenToken, stringLiteral, this.closeParenToken);
        };

        ExternalModuleReferenceSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.moduleOrRequireKeyword, this.openParenToken, this.stringLiteral, closeParenToken);
        };

        ExternalModuleReferenceSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ExternalModuleReferenceSyntax;
    })(ModuleReferenceSyntax);
    TypeScript.ExternalModuleReferenceSyntax = ExternalModuleReferenceSyntax;

    var ModuleNameModuleReferenceSyntax = (function (_super) {
        __extends(ModuleNameModuleReferenceSyntax, _super);
        function ModuleNameModuleReferenceSyntax(moduleName, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.moduleName = moduleName;
        }
        ModuleNameModuleReferenceSyntax.prototype.accept = function (visitor) {
            return visitor.visitModuleNameModuleReference(this);
        };

        ModuleNameModuleReferenceSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ModuleNameModuleReference;
        };

        ModuleNameModuleReferenceSyntax.prototype.childCount = function () {
            return 1;
        };

        ModuleNameModuleReferenceSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.moduleName;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ModuleNameModuleReferenceSyntax.prototype.update = function (moduleName) {
            if (this.moduleName === moduleName) {
                return this;
            }

            return new ModuleNameModuleReferenceSyntax(moduleName, this.parsedInStrictMode());
        };

        ModuleNameModuleReferenceSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ModuleNameModuleReferenceSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ModuleNameModuleReferenceSyntax.prototype.withModuleName = function (moduleName) {
            return this.update(moduleName);
        };

        ModuleNameModuleReferenceSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ModuleNameModuleReferenceSyntax;
    })(ModuleReferenceSyntax);
    TypeScript.ModuleNameModuleReferenceSyntax = ModuleNameModuleReferenceSyntax;

    var ImportDeclarationSyntax = (function (_super) {
        __extends(ImportDeclarationSyntax, _super);
        function ImportDeclarationSyntax(importKeyword, identifier, equalsToken, moduleReference, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.importKeyword = importKeyword;
            this.identifier = identifier;
            this.equalsToken = equalsToken;
            this.moduleReference = moduleReference;
            this.semicolonToken = semicolonToken;
        }
        ImportDeclarationSyntax.prototype.accept = function (visitor) {
            return visitor.visitImportDeclaration(this);
        };

        ImportDeclarationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ImportDeclaration;
        };

        ImportDeclarationSyntax.prototype.childCount = function () {
            return 5;
        };

        ImportDeclarationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.importKeyword;
                case 1:
                    return this.identifier;
                case 2:
                    return this.equalsToken;
                case 3:
                    return this.moduleReference;
                case 4:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ImportDeclarationSyntax.prototype.isModuleElement = function () {
            return true;
        };

        ImportDeclarationSyntax.prototype.update = function (importKeyword, identifier, equalsToken, moduleReference, semicolonToken) {
            if (this.importKeyword === importKeyword && this.identifier === identifier && this.equalsToken === equalsToken && this.moduleReference === moduleReference && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ImportDeclarationSyntax(importKeyword, identifier, equalsToken, moduleReference, semicolonToken, this.parsedInStrictMode());
        };

        ImportDeclarationSyntax.create1 = function (identifier, moduleReference) {
            return new ImportDeclarationSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.ImportKeyword), identifier, TypeScript.Syntax.token(TypeScript.SyntaxKind.EqualsToken), moduleReference, TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), false);
        };

        ImportDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ImportDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ImportDeclarationSyntax.prototype.withImportKeyword = function (importKeyword) {
            return this.update(importKeyword, this.identifier, this.equalsToken, this.moduleReference, this.semicolonToken);
        };

        ImportDeclarationSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(this.importKeyword, identifier, this.equalsToken, this.moduleReference, this.semicolonToken);
        };

        ImportDeclarationSyntax.prototype.withEqualsToken = function (equalsToken) {
            return this.update(this.importKeyword, this.identifier, equalsToken, this.moduleReference, this.semicolonToken);
        };

        ImportDeclarationSyntax.prototype.withModuleReference = function (moduleReference) {
            return this.update(this.importKeyword, this.identifier, this.equalsToken, moduleReference, this.semicolonToken);
        };

        ImportDeclarationSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.importKeyword, this.identifier, this.equalsToken, this.moduleReference, semicolonToken);
        };

        ImportDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ImportDeclarationSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ImportDeclarationSyntax = ImportDeclarationSyntax;

    var ExportAssignmentSyntax = (function (_super) {
        __extends(ExportAssignmentSyntax, _super);
        function ExportAssignmentSyntax(exportKeyword, equalsToken, identifier, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.exportKeyword = exportKeyword;
            this.equalsToken = equalsToken;
            this.identifier = identifier;
            this.semicolonToken = semicolonToken;
        }
        ExportAssignmentSyntax.prototype.accept = function (visitor) {
            return visitor.visitExportAssignment(this);
        };

        ExportAssignmentSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ExportAssignment;
        };

        ExportAssignmentSyntax.prototype.childCount = function () {
            return 4;
        };

        ExportAssignmentSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.exportKeyword;
                case 1:
                    return this.equalsToken;
                case 2:
                    return this.identifier;
                case 3:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ExportAssignmentSyntax.prototype.isModuleElement = function () {
            return true;
        };

        ExportAssignmentSyntax.prototype.update = function (exportKeyword, equalsToken, identifier, semicolonToken) {
            if (this.exportKeyword === exportKeyword && this.equalsToken === equalsToken && this.identifier === identifier && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ExportAssignmentSyntax(exportKeyword, equalsToken, identifier, semicolonToken, this.parsedInStrictMode());
        };

        ExportAssignmentSyntax.create1 = function (identifier) {
            return new ExportAssignmentSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.ExportKeyword), TypeScript.Syntax.token(TypeScript.SyntaxKind.EqualsToken), identifier, TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), false);
        };

        ExportAssignmentSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ExportAssignmentSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ExportAssignmentSyntax.prototype.withExportKeyword = function (exportKeyword) {
            return this.update(exportKeyword, this.equalsToken, this.identifier, this.semicolonToken);
        };

        ExportAssignmentSyntax.prototype.withEqualsToken = function (equalsToken) {
            return this.update(this.exportKeyword, equalsToken, this.identifier, this.semicolonToken);
        };

        ExportAssignmentSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(this.exportKeyword, this.equalsToken, identifier, this.semicolonToken);
        };

        ExportAssignmentSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.exportKeyword, this.equalsToken, this.identifier, semicolonToken);
        };

        ExportAssignmentSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ExportAssignmentSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ExportAssignmentSyntax = ExportAssignmentSyntax;

    var ClassDeclarationSyntax = (function (_super) {
        __extends(ClassDeclarationSyntax, _super);
        function ClassDeclarationSyntax(modifiers, classKeyword, identifier, typeParameterList, heritageClauses, openBraceToken, classElements, closeBraceToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.modifiers = modifiers;
            this.classKeyword = classKeyword;
            this.identifier = identifier;
            this.typeParameterList = typeParameterList;
            this.heritageClauses = heritageClauses;
            this.openBraceToken = openBraceToken;
            this.classElements = classElements;
            this.closeBraceToken = closeBraceToken;
        }
        ClassDeclarationSyntax.prototype.accept = function (visitor) {
            return visitor.visitClassDeclaration(this);
        };

        ClassDeclarationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ClassDeclaration;
        };

        ClassDeclarationSyntax.prototype.childCount = function () {
            return 8;
        };

        ClassDeclarationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.modifiers;
                case 1:
                    return this.classKeyword;
                case 2:
                    return this.identifier;
                case 3:
                    return this.typeParameterList;
                case 4:
                    return this.heritageClauses;
                case 5:
                    return this.openBraceToken;
                case 6:
                    return this.classElements;
                case 7:
                    return this.closeBraceToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ClassDeclarationSyntax.prototype.isModuleElement = function () {
            return true;
        };

        ClassDeclarationSyntax.prototype.update = function (modifiers, classKeyword, identifier, typeParameterList, heritageClauses, openBraceToken, classElements, closeBraceToken) {
            if (this.modifiers === modifiers && this.classKeyword === classKeyword && this.identifier === identifier && this.typeParameterList === typeParameterList && this.heritageClauses === heritageClauses && this.openBraceToken === openBraceToken && this.classElements === classElements && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new ClassDeclarationSyntax(modifiers, classKeyword, identifier, typeParameterList, heritageClauses, openBraceToken, classElements, closeBraceToken, this.parsedInStrictMode());
        };

        ClassDeclarationSyntax.create = function (classKeyword, identifier, openBraceToken, closeBraceToken) {
            return new ClassDeclarationSyntax(TypeScript.Syntax.emptyList, classKeyword, identifier, null, TypeScript.Syntax.emptyList, openBraceToken, TypeScript.Syntax.emptyList, closeBraceToken, false);
        };

        ClassDeclarationSyntax.create1 = function (identifier) {
            return new ClassDeclarationSyntax(TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.ClassKeyword), identifier, null, TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenBraceToken), TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseBraceToken), false);
        };

        ClassDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ClassDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ClassDeclarationSyntax.prototype.withModifiers = function (modifiers) {
            return this.update(modifiers, this.classKeyword, this.identifier, this.typeParameterList, this.heritageClauses, this.openBraceToken, this.classElements, this.closeBraceToken);
        };

        ClassDeclarationSyntax.prototype.withModifier = function (modifier) {
            return this.withModifiers(TypeScript.Syntax.list([modifier]));
        };

        ClassDeclarationSyntax.prototype.withClassKeyword = function (classKeyword) {
            return this.update(this.modifiers, classKeyword, this.identifier, this.typeParameterList, this.heritageClauses, this.openBraceToken, this.classElements, this.closeBraceToken);
        };

        ClassDeclarationSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(this.modifiers, this.classKeyword, identifier, this.typeParameterList, this.heritageClauses, this.openBraceToken, this.classElements, this.closeBraceToken);
        };

        ClassDeclarationSyntax.prototype.withTypeParameterList = function (typeParameterList) {
            return this.update(this.modifiers, this.classKeyword, this.identifier, typeParameterList, this.heritageClauses, this.openBraceToken, this.classElements, this.closeBraceToken);
        };

        ClassDeclarationSyntax.prototype.withHeritageClauses = function (heritageClauses) {
            return this.update(this.modifiers, this.classKeyword, this.identifier, this.typeParameterList, heritageClauses, this.openBraceToken, this.classElements, this.closeBraceToken);
        };

        ClassDeclarationSyntax.prototype.withHeritageClause = function (heritageClause) {
            return this.withHeritageClauses(TypeScript.Syntax.list([heritageClause]));
        };

        ClassDeclarationSyntax.prototype.withOpenBraceToken = function (openBraceToken) {
            return this.update(this.modifiers, this.classKeyword, this.identifier, this.typeParameterList, this.heritageClauses, openBraceToken, this.classElements, this.closeBraceToken);
        };

        ClassDeclarationSyntax.prototype.withClassElements = function (classElements) {
            return this.update(this.modifiers, this.classKeyword, this.identifier, this.typeParameterList, this.heritageClauses, this.openBraceToken, classElements, this.closeBraceToken);
        };

        ClassDeclarationSyntax.prototype.withClassElement = function (classElement) {
            return this.withClassElements(TypeScript.Syntax.list([classElement]));
        };

        ClassDeclarationSyntax.prototype.withCloseBraceToken = function (closeBraceToken) {
            return this.update(this.modifiers, this.classKeyword, this.identifier, this.typeParameterList, this.heritageClauses, this.openBraceToken, this.classElements, closeBraceToken);
        };

        ClassDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ClassDeclarationSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ClassDeclarationSyntax = ClassDeclarationSyntax;

    var InterfaceDeclarationSyntax = (function (_super) {
        __extends(InterfaceDeclarationSyntax, _super);
        function InterfaceDeclarationSyntax(modifiers, interfaceKeyword, identifier, typeParameterList, heritageClauses, body, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.modifiers = modifiers;
            this.interfaceKeyword = interfaceKeyword;
            this.identifier = identifier;
            this.typeParameterList = typeParameterList;
            this.heritageClauses = heritageClauses;
            this.body = body;
        }
        InterfaceDeclarationSyntax.prototype.accept = function (visitor) {
            return visitor.visitInterfaceDeclaration(this);
        };

        InterfaceDeclarationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.InterfaceDeclaration;
        };

        InterfaceDeclarationSyntax.prototype.childCount = function () {
            return 6;
        };

        InterfaceDeclarationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.modifiers;
                case 1:
                    return this.interfaceKeyword;
                case 2:
                    return this.identifier;
                case 3:
                    return this.typeParameterList;
                case 4:
                    return this.heritageClauses;
                case 5:
                    return this.body;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        InterfaceDeclarationSyntax.prototype.isModuleElement = function () {
            return true;
        };

        InterfaceDeclarationSyntax.prototype.update = function (modifiers, interfaceKeyword, identifier, typeParameterList, heritageClauses, body) {
            if (this.modifiers === modifiers && this.interfaceKeyword === interfaceKeyword && this.identifier === identifier && this.typeParameterList === typeParameterList && this.heritageClauses === heritageClauses && this.body === body) {
                return this;
            }

            return new InterfaceDeclarationSyntax(modifiers, interfaceKeyword, identifier, typeParameterList, heritageClauses, body, this.parsedInStrictMode());
        };

        InterfaceDeclarationSyntax.create = function (interfaceKeyword, identifier, body) {
            return new InterfaceDeclarationSyntax(TypeScript.Syntax.emptyList, interfaceKeyword, identifier, null, TypeScript.Syntax.emptyList, body, false);
        };

        InterfaceDeclarationSyntax.create1 = function (identifier) {
            return new InterfaceDeclarationSyntax(TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.InterfaceKeyword), identifier, null, TypeScript.Syntax.emptyList, ObjectTypeSyntax.create1(), false);
        };

        InterfaceDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        InterfaceDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        InterfaceDeclarationSyntax.prototype.withModifiers = function (modifiers) {
            return this.update(modifiers, this.interfaceKeyword, this.identifier, this.typeParameterList, this.heritageClauses, this.body);
        };

        InterfaceDeclarationSyntax.prototype.withModifier = function (modifier) {
            return this.withModifiers(TypeScript.Syntax.list([modifier]));
        };

        InterfaceDeclarationSyntax.prototype.withInterfaceKeyword = function (interfaceKeyword) {
            return this.update(this.modifiers, interfaceKeyword, this.identifier, this.typeParameterList, this.heritageClauses, this.body);
        };

        InterfaceDeclarationSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(this.modifiers, this.interfaceKeyword, identifier, this.typeParameterList, this.heritageClauses, this.body);
        };

        InterfaceDeclarationSyntax.prototype.withTypeParameterList = function (typeParameterList) {
            return this.update(this.modifiers, this.interfaceKeyword, this.identifier, typeParameterList, this.heritageClauses, this.body);
        };

        InterfaceDeclarationSyntax.prototype.withHeritageClauses = function (heritageClauses) {
            return this.update(this.modifiers, this.interfaceKeyword, this.identifier, this.typeParameterList, heritageClauses, this.body);
        };

        InterfaceDeclarationSyntax.prototype.withHeritageClause = function (heritageClause) {
            return this.withHeritageClauses(TypeScript.Syntax.list([heritageClause]));
        };

        InterfaceDeclarationSyntax.prototype.withBody = function (body) {
            return this.update(this.modifiers, this.interfaceKeyword, this.identifier, this.typeParameterList, this.heritageClauses, body);
        };

        InterfaceDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return InterfaceDeclarationSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.InterfaceDeclarationSyntax = InterfaceDeclarationSyntax;

    var HeritageClauseSyntax = (function (_super) {
        __extends(HeritageClauseSyntax, _super);
        function HeritageClauseSyntax(extendsOrImplementsKeyword, typeNames, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.extendsOrImplementsKeyword = extendsOrImplementsKeyword;
            this.typeNames = typeNames;
        }
        HeritageClauseSyntax.prototype.accept = function (visitor) {
            return visitor.visitHeritageClause(this);
        };

        HeritageClauseSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.HeritageClause;
        };

        HeritageClauseSyntax.prototype.childCount = function () {
            return 2;
        };

        HeritageClauseSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.extendsOrImplementsKeyword;
                case 1:
                    return this.typeNames;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        HeritageClauseSyntax.prototype.update = function (extendsOrImplementsKeyword, typeNames) {
            if (this.extendsOrImplementsKeyword === extendsOrImplementsKeyword && this.typeNames === typeNames) {
                return this;
            }

            return new HeritageClauseSyntax(extendsOrImplementsKeyword, typeNames, this.parsedInStrictMode());
        };

        HeritageClauseSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        HeritageClauseSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        HeritageClauseSyntax.prototype.withExtendsOrImplementsKeyword = function (extendsOrImplementsKeyword) {
            return this.update(extendsOrImplementsKeyword, this.typeNames);
        };

        HeritageClauseSyntax.prototype.withTypeNames = function (typeNames) {
            return this.update(this.extendsOrImplementsKeyword, typeNames);
        };

        HeritageClauseSyntax.prototype.withTypeName = function (typeName) {
            return this.withTypeNames(TypeScript.Syntax.separatedList([typeName]));
        };

        HeritageClauseSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return HeritageClauseSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.HeritageClauseSyntax = HeritageClauseSyntax;

    var ModuleDeclarationSyntax = (function (_super) {
        __extends(ModuleDeclarationSyntax, _super);
        function ModuleDeclarationSyntax(modifiers, moduleKeyword, moduleName, stringLiteral, openBraceToken, moduleElements, closeBraceToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.modifiers = modifiers;
            this.moduleKeyword = moduleKeyword;
            this.moduleName = moduleName;
            this.stringLiteral = stringLiteral;
            this.openBraceToken = openBraceToken;
            this.moduleElements = moduleElements;
            this.closeBraceToken = closeBraceToken;
        }
        ModuleDeclarationSyntax.prototype.accept = function (visitor) {
            return visitor.visitModuleDeclaration(this);
        };

        ModuleDeclarationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ModuleDeclaration;
        };

        ModuleDeclarationSyntax.prototype.childCount = function () {
            return 7;
        };

        ModuleDeclarationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.modifiers;
                case 1:
                    return this.moduleKeyword;
                case 2:
                    return this.moduleName;
                case 3:
                    return this.stringLiteral;
                case 4:
                    return this.openBraceToken;
                case 5:
                    return this.moduleElements;
                case 6:
                    return this.closeBraceToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ModuleDeclarationSyntax.prototype.isModuleElement = function () {
            return true;
        };

        ModuleDeclarationSyntax.prototype.update = function (modifiers, moduleKeyword, moduleName, stringLiteral, openBraceToken, moduleElements, closeBraceToken) {
            if (this.modifiers === modifiers && this.moduleKeyword === moduleKeyword && this.moduleName === moduleName && this.stringLiteral === stringLiteral && this.openBraceToken === openBraceToken && this.moduleElements === moduleElements && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new ModuleDeclarationSyntax(modifiers, moduleKeyword, moduleName, stringLiteral, openBraceToken, moduleElements, closeBraceToken, this.parsedInStrictMode());
        };

        ModuleDeclarationSyntax.create = function (moduleKeyword, openBraceToken, closeBraceToken) {
            return new ModuleDeclarationSyntax(TypeScript.Syntax.emptyList, moduleKeyword, null, null, openBraceToken, TypeScript.Syntax.emptyList, closeBraceToken, false);
        };

        ModuleDeclarationSyntax.create1 = function () {
            return new ModuleDeclarationSyntax(TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.ModuleKeyword), null, null, TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenBraceToken), TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseBraceToken), false);
        };

        ModuleDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ModuleDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ModuleDeclarationSyntax.prototype.withModifiers = function (modifiers) {
            return this.update(modifiers, this.moduleKeyword, this.moduleName, this.stringLiteral, this.openBraceToken, this.moduleElements, this.closeBraceToken);
        };

        ModuleDeclarationSyntax.prototype.withModifier = function (modifier) {
            return this.withModifiers(TypeScript.Syntax.list([modifier]));
        };

        ModuleDeclarationSyntax.prototype.withModuleKeyword = function (moduleKeyword) {
            return this.update(this.modifiers, moduleKeyword, this.moduleName, this.stringLiteral, this.openBraceToken, this.moduleElements, this.closeBraceToken);
        };

        ModuleDeclarationSyntax.prototype.withModuleName = function (moduleName) {
            return this.update(this.modifiers, this.moduleKeyword, moduleName, this.stringLiteral, this.openBraceToken, this.moduleElements, this.closeBraceToken);
        };

        ModuleDeclarationSyntax.prototype.withStringLiteral = function (stringLiteral) {
            return this.update(this.modifiers, this.moduleKeyword, this.moduleName, stringLiteral, this.openBraceToken, this.moduleElements, this.closeBraceToken);
        };

        ModuleDeclarationSyntax.prototype.withOpenBraceToken = function (openBraceToken) {
            return this.update(this.modifiers, this.moduleKeyword, this.moduleName, this.stringLiteral, openBraceToken, this.moduleElements, this.closeBraceToken);
        };

        ModuleDeclarationSyntax.prototype.withModuleElements = function (moduleElements) {
            return this.update(this.modifiers, this.moduleKeyword, this.moduleName, this.stringLiteral, this.openBraceToken, moduleElements, this.closeBraceToken);
        };

        ModuleDeclarationSyntax.prototype.withModuleElement = function (moduleElement) {
            return this.withModuleElements(TypeScript.Syntax.list([moduleElement]));
        };

        ModuleDeclarationSyntax.prototype.withCloseBraceToken = function (closeBraceToken) {
            return this.update(this.modifiers, this.moduleKeyword, this.moduleName, this.stringLiteral, this.openBraceToken, this.moduleElements, closeBraceToken);
        };

        ModuleDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ModuleDeclarationSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ModuleDeclarationSyntax = ModuleDeclarationSyntax;

    var FunctionDeclarationSyntax = (function (_super) {
        __extends(FunctionDeclarationSyntax, _super);
        function FunctionDeclarationSyntax(modifiers, functionKeyword, identifier, callSignature, block, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.modifiers = modifiers;
            this.functionKeyword = functionKeyword;
            this.identifier = identifier;
            this.callSignature = callSignature;
            this.block = block;
            this.semicolonToken = semicolonToken;
        }
        FunctionDeclarationSyntax.prototype.accept = function (visitor) {
            return visitor.visitFunctionDeclaration(this);
        };

        FunctionDeclarationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.FunctionDeclaration;
        };

        FunctionDeclarationSyntax.prototype.childCount = function () {
            return 6;
        };

        FunctionDeclarationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.modifiers;
                case 1:
                    return this.functionKeyword;
                case 2:
                    return this.identifier;
                case 3:
                    return this.callSignature;
                case 4:
                    return this.block;
                case 5:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        FunctionDeclarationSyntax.prototype.isStatement = function () {
            return true;
        };

        FunctionDeclarationSyntax.prototype.isModuleElement = function () {
            return true;
        };

        FunctionDeclarationSyntax.prototype.update = function (modifiers, functionKeyword, identifier, callSignature, block, semicolonToken) {
            if (this.modifiers === modifiers && this.functionKeyword === functionKeyword && this.identifier === identifier && this.callSignature === callSignature && this.block === block && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new FunctionDeclarationSyntax(modifiers, functionKeyword, identifier, callSignature, block, semicolonToken, this.parsedInStrictMode());
        };

        FunctionDeclarationSyntax.create = function (functionKeyword, identifier, callSignature) {
            return new FunctionDeclarationSyntax(TypeScript.Syntax.emptyList, functionKeyword, identifier, callSignature, null, null, false);
        };

        FunctionDeclarationSyntax.create1 = function (identifier) {
            return new FunctionDeclarationSyntax(TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.FunctionKeyword), identifier, CallSignatureSyntax.create1(), null, null, false);
        };

        FunctionDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        FunctionDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        FunctionDeclarationSyntax.prototype.withModifiers = function (modifiers) {
            return this.update(modifiers, this.functionKeyword, this.identifier, this.callSignature, this.block, this.semicolonToken);
        };

        FunctionDeclarationSyntax.prototype.withModifier = function (modifier) {
            return this.withModifiers(TypeScript.Syntax.list([modifier]));
        };

        FunctionDeclarationSyntax.prototype.withFunctionKeyword = function (functionKeyword) {
            return this.update(this.modifiers, functionKeyword, this.identifier, this.callSignature, this.block, this.semicolonToken);
        };

        FunctionDeclarationSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(this.modifiers, this.functionKeyword, identifier, this.callSignature, this.block, this.semicolonToken);
        };

        FunctionDeclarationSyntax.prototype.withCallSignature = function (callSignature) {
            return this.update(this.modifiers, this.functionKeyword, this.identifier, callSignature, this.block, this.semicolonToken);
        };

        FunctionDeclarationSyntax.prototype.withBlock = function (block) {
            return this.update(this.modifiers, this.functionKeyword, this.identifier, this.callSignature, block, this.semicolonToken);
        };

        FunctionDeclarationSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.modifiers, this.functionKeyword, this.identifier, this.callSignature, this.block, semicolonToken);
        };

        FunctionDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.modifiers.isTypeScriptSpecific()) {
                return true;
            }
            if (this.callSignature.isTypeScriptSpecific()) {
                return true;
            }
            if (this.block !== null && this.block.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return FunctionDeclarationSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.FunctionDeclarationSyntax = FunctionDeclarationSyntax;

    var VariableStatementSyntax = (function (_super) {
        __extends(VariableStatementSyntax, _super);
        function VariableStatementSyntax(modifiers, variableDeclaration, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.modifiers = modifiers;
            this.variableDeclaration = variableDeclaration;
            this.semicolonToken = semicolonToken;
        }
        VariableStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitVariableStatement(this);
        };

        VariableStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.VariableStatement;
        };

        VariableStatementSyntax.prototype.childCount = function () {
            return 3;
        };

        VariableStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.modifiers;
                case 1:
                    return this.variableDeclaration;
                case 2:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        VariableStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        VariableStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        VariableStatementSyntax.prototype.update = function (modifiers, variableDeclaration, semicolonToken) {
            if (this.modifiers === modifiers && this.variableDeclaration === variableDeclaration && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new VariableStatementSyntax(modifiers, variableDeclaration, semicolonToken, this.parsedInStrictMode());
        };

        VariableStatementSyntax.create = function (variableDeclaration, semicolonToken) {
            return new VariableStatementSyntax(TypeScript.Syntax.emptyList, variableDeclaration, semicolonToken, false);
        };

        VariableStatementSyntax.create1 = function (variableDeclaration) {
            return new VariableStatementSyntax(TypeScript.Syntax.emptyList, variableDeclaration, TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), false);
        };

        VariableStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        VariableStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        VariableStatementSyntax.prototype.withModifiers = function (modifiers) {
            return this.update(modifiers, this.variableDeclaration, this.semicolonToken);
        };

        VariableStatementSyntax.prototype.withModifier = function (modifier) {
            return this.withModifiers(TypeScript.Syntax.list([modifier]));
        };

        VariableStatementSyntax.prototype.withVariableDeclaration = function (variableDeclaration) {
            return this.update(this.modifiers, variableDeclaration, this.semicolonToken);
        };

        VariableStatementSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.modifiers, this.variableDeclaration, semicolonToken);
        };

        VariableStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.modifiers.isTypeScriptSpecific()) {
                return true;
            }
            if (this.variableDeclaration.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return VariableStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.VariableStatementSyntax = VariableStatementSyntax;

    var VariableDeclarationSyntax = (function (_super) {
        __extends(VariableDeclarationSyntax, _super);
        function VariableDeclarationSyntax(varKeyword, variableDeclarators, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.varKeyword = varKeyword;
            this.variableDeclarators = variableDeclarators;
        }
        VariableDeclarationSyntax.prototype.accept = function (visitor) {
            return visitor.visitVariableDeclaration(this);
        };

        VariableDeclarationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.VariableDeclaration;
        };

        VariableDeclarationSyntax.prototype.childCount = function () {
            return 2;
        };

        VariableDeclarationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.varKeyword;
                case 1:
                    return this.variableDeclarators;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        VariableDeclarationSyntax.prototype.update = function (varKeyword, variableDeclarators) {
            if (this.varKeyword === varKeyword && this.variableDeclarators === variableDeclarators) {
                return this;
            }

            return new VariableDeclarationSyntax(varKeyword, variableDeclarators, this.parsedInStrictMode());
        };

        VariableDeclarationSyntax.create1 = function (variableDeclarators) {
            return new VariableDeclarationSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.VarKeyword), variableDeclarators, false);
        };

        VariableDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        VariableDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        VariableDeclarationSyntax.prototype.withVarKeyword = function (varKeyword) {
            return this.update(varKeyword, this.variableDeclarators);
        };

        VariableDeclarationSyntax.prototype.withVariableDeclarators = function (variableDeclarators) {
            return this.update(this.varKeyword, variableDeclarators);
        };

        VariableDeclarationSyntax.prototype.withVariableDeclarator = function (variableDeclarator) {
            return this.withVariableDeclarators(TypeScript.Syntax.separatedList([variableDeclarator]));
        };

        VariableDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.variableDeclarators.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return VariableDeclarationSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.VariableDeclarationSyntax = VariableDeclarationSyntax;

    var VariableDeclaratorSyntax = (function (_super) {
        __extends(VariableDeclaratorSyntax, _super);
        function VariableDeclaratorSyntax(identifier, typeAnnotation, equalsValueClause, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.identifier = identifier;
            this.typeAnnotation = typeAnnotation;
            this.equalsValueClause = equalsValueClause;
        }
        VariableDeclaratorSyntax.prototype.accept = function (visitor) {
            return visitor.visitVariableDeclarator(this);
        };

        VariableDeclaratorSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.VariableDeclarator;
        };

        VariableDeclaratorSyntax.prototype.childCount = function () {
            return 3;
        };

        VariableDeclaratorSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.identifier;
                case 1:
                    return this.typeAnnotation;
                case 2:
                    return this.equalsValueClause;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        VariableDeclaratorSyntax.prototype.update = function (identifier, typeAnnotation, equalsValueClause) {
            if (this.identifier === identifier && this.typeAnnotation === typeAnnotation && this.equalsValueClause === equalsValueClause) {
                return this;
            }

            return new VariableDeclaratorSyntax(identifier, typeAnnotation, equalsValueClause, this.parsedInStrictMode());
        };

        VariableDeclaratorSyntax.create = function (identifier) {
            return new VariableDeclaratorSyntax(identifier, null, null, false);
        };

        VariableDeclaratorSyntax.create1 = function (identifier) {
            return new VariableDeclaratorSyntax(identifier, null, null, false);
        };

        VariableDeclaratorSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        VariableDeclaratorSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        VariableDeclaratorSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(identifier, this.typeAnnotation, this.equalsValueClause);
        };

        VariableDeclaratorSyntax.prototype.withTypeAnnotation = function (typeAnnotation) {
            return this.update(this.identifier, typeAnnotation, this.equalsValueClause);
        };

        VariableDeclaratorSyntax.prototype.withEqualsValueClause = function (equalsValueClause) {
            return this.update(this.identifier, this.typeAnnotation, equalsValueClause);
        };

        VariableDeclaratorSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.typeAnnotation !== null) {
                return true;
            }
            if (this.equalsValueClause !== null && this.equalsValueClause.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return VariableDeclaratorSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.VariableDeclaratorSyntax = VariableDeclaratorSyntax;

    var EqualsValueClauseSyntax = (function (_super) {
        __extends(EqualsValueClauseSyntax, _super);
        function EqualsValueClauseSyntax(equalsToken, value, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.equalsToken = equalsToken;
            this.value = value;
        }
        EqualsValueClauseSyntax.prototype.accept = function (visitor) {
            return visitor.visitEqualsValueClause(this);
        };

        EqualsValueClauseSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.EqualsValueClause;
        };

        EqualsValueClauseSyntax.prototype.childCount = function () {
            return 2;
        };

        EqualsValueClauseSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.equalsToken;
                case 1:
                    return this.value;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        EqualsValueClauseSyntax.prototype.update = function (equalsToken, value) {
            if (this.equalsToken === equalsToken && this.value === value) {
                return this;
            }

            return new EqualsValueClauseSyntax(equalsToken, value, this.parsedInStrictMode());
        };

        EqualsValueClauseSyntax.create1 = function (value) {
            return new EqualsValueClauseSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.EqualsToken), value, false);
        };

        EqualsValueClauseSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        EqualsValueClauseSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        EqualsValueClauseSyntax.prototype.withEqualsToken = function (equalsToken) {
            return this.update(equalsToken, this.value);
        };

        EqualsValueClauseSyntax.prototype.withValue = function (value) {
            return this.update(this.equalsToken, value);
        };

        EqualsValueClauseSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.value.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return EqualsValueClauseSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.EqualsValueClauseSyntax = EqualsValueClauseSyntax;

    var PrefixUnaryExpressionSyntax = (function (_super) {
        __extends(PrefixUnaryExpressionSyntax, _super);
        function PrefixUnaryExpressionSyntax(kind, operatorToken, operand, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.operatorToken = operatorToken;
            this.operand = operand;

            this._kind = kind;
        }
        PrefixUnaryExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitPrefixUnaryExpression(this);
        };

        PrefixUnaryExpressionSyntax.prototype.childCount = function () {
            return 2;
        };

        PrefixUnaryExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.operatorToken;
                case 1:
                    return this.operand;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        PrefixUnaryExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        PrefixUnaryExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        PrefixUnaryExpressionSyntax.prototype.kind = function () {
            return this._kind;
        };

        PrefixUnaryExpressionSyntax.prototype.update = function (kind, operatorToken, operand) {
            if (this._kind === kind && this.operatorToken === operatorToken && this.operand === operand) {
                return this;
            }

            return new PrefixUnaryExpressionSyntax(kind, operatorToken, operand, this.parsedInStrictMode());
        };

        PrefixUnaryExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        PrefixUnaryExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        PrefixUnaryExpressionSyntax.prototype.withKind = function (kind) {
            return this.update(kind, this.operatorToken, this.operand);
        };

        PrefixUnaryExpressionSyntax.prototype.withOperatorToken = function (operatorToken) {
            return this.update(this._kind, operatorToken, this.operand);
        };

        PrefixUnaryExpressionSyntax.prototype.withOperand = function (operand) {
            return this.update(this._kind, this.operatorToken, operand);
        };

        PrefixUnaryExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.operand.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return PrefixUnaryExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.PrefixUnaryExpressionSyntax = PrefixUnaryExpressionSyntax;

    var ArrayLiteralExpressionSyntax = (function (_super) {
        __extends(ArrayLiteralExpressionSyntax, _super);
        function ArrayLiteralExpressionSyntax(openBracketToken, expressions, closeBracketToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.openBracketToken = openBracketToken;
            this.expressions = expressions;
            this.closeBracketToken = closeBracketToken;
        }
        ArrayLiteralExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitArrayLiteralExpression(this);
        };

        ArrayLiteralExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ArrayLiteralExpression;
        };

        ArrayLiteralExpressionSyntax.prototype.childCount = function () {
            return 3;
        };

        ArrayLiteralExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.openBracketToken;
                case 1:
                    return this.expressions;
                case 2:
                    return this.closeBracketToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ArrayLiteralExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        ArrayLiteralExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        ArrayLiteralExpressionSyntax.prototype.update = function (openBracketToken, expressions, closeBracketToken) {
            if (this.openBracketToken === openBracketToken && this.expressions === expressions && this.closeBracketToken === closeBracketToken) {
                return this;
            }

            return new ArrayLiteralExpressionSyntax(openBracketToken, expressions, closeBracketToken, this.parsedInStrictMode());
        };

        ArrayLiteralExpressionSyntax.create = function (openBracketToken, closeBracketToken) {
            return new ArrayLiteralExpressionSyntax(openBracketToken, TypeScript.Syntax.emptySeparatedList, closeBracketToken, false);
        };

        ArrayLiteralExpressionSyntax.create1 = function () {
            return new ArrayLiteralExpressionSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenBracketToken), TypeScript.Syntax.emptySeparatedList, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseBracketToken), false);
        };

        ArrayLiteralExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ArrayLiteralExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ArrayLiteralExpressionSyntax.prototype.withOpenBracketToken = function (openBracketToken) {
            return this.update(openBracketToken, this.expressions, this.closeBracketToken);
        };

        ArrayLiteralExpressionSyntax.prototype.withExpressions = function (expressions) {
            return this.update(this.openBracketToken, expressions, this.closeBracketToken);
        };

        ArrayLiteralExpressionSyntax.prototype.withExpression = function (expression) {
            return this.withExpressions(TypeScript.Syntax.separatedList([expression]));
        };

        ArrayLiteralExpressionSyntax.prototype.withCloseBracketToken = function (closeBracketToken) {
            return this.update(this.openBracketToken, this.expressions, closeBracketToken);
        };

        ArrayLiteralExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expressions.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ArrayLiteralExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ArrayLiteralExpressionSyntax = ArrayLiteralExpressionSyntax;

    var OmittedExpressionSyntax = (function (_super) {
        __extends(OmittedExpressionSyntax, _super);
        function OmittedExpressionSyntax(parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
        }
        OmittedExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitOmittedExpression(this);
        };

        OmittedExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.OmittedExpression;
        };

        OmittedExpressionSyntax.prototype.childCount = function () {
            return 0;
        };

        OmittedExpressionSyntax.prototype.childAt = function (slot) {
            throw TypeScript.Errors.invalidOperation();
        };

        OmittedExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        OmittedExpressionSyntax.prototype.update = function () {
            return this;
        };

        OmittedExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        OmittedExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        OmittedExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            return false;
        };
        return OmittedExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.OmittedExpressionSyntax = OmittedExpressionSyntax;

    var ParenthesizedExpressionSyntax = (function (_super) {
        __extends(ParenthesizedExpressionSyntax, _super);
        function ParenthesizedExpressionSyntax(openParenToken, expression, closeParenToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.openParenToken = openParenToken;
            this.expression = expression;
            this.closeParenToken = closeParenToken;
        }
        ParenthesizedExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitParenthesizedExpression(this);
        };

        ParenthesizedExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ParenthesizedExpression;
        };

        ParenthesizedExpressionSyntax.prototype.childCount = function () {
            return 3;
        };

        ParenthesizedExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.openParenToken;
                case 1:
                    return this.expression;
                case 2:
                    return this.closeParenToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ParenthesizedExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        ParenthesizedExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        ParenthesizedExpressionSyntax.prototype.update = function (openParenToken, expression, closeParenToken) {
            if (this.openParenToken === openParenToken && this.expression === expression && this.closeParenToken === closeParenToken) {
                return this;
            }

            return new ParenthesizedExpressionSyntax(openParenToken, expression, closeParenToken, this.parsedInStrictMode());
        };

        ParenthesizedExpressionSyntax.create1 = function (expression) {
            return new ParenthesizedExpressionSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), expression, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), false);
        };

        ParenthesizedExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ParenthesizedExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ParenthesizedExpressionSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(openParenToken, this.expression, this.closeParenToken);
        };

        ParenthesizedExpressionSyntax.prototype.withExpression = function (expression) {
            return this.update(this.openParenToken, expression, this.closeParenToken);
        };

        ParenthesizedExpressionSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.openParenToken, this.expression, closeParenToken);
        };

        ParenthesizedExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ParenthesizedExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ParenthesizedExpressionSyntax = ParenthesizedExpressionSyntax;

    var ArrowFunctionExpressionSyntax = (function (_super) {
        __extends(ArrowFunctionExpressionSyntax, _super);
        function ArrowFunctionExpressionSyntax(equalsGreaterThanToken, body, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.equalsGreaterThanToken = equalsGreaterThanToken;
            this.body = body;
        }
        ArrowFunctionExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        ArrowFunctionExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        ArrowFunctionExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ArrowFunctionExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ArrowFunctionExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ArrowFunctionExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ArrowFunctionExpressionSyntax = ArrowFunctionExpressionSyntax;

    var SimpleArrowFunctionExpressionSyntax = (function (_super) {
        __extends(SimpleArrowFunctionExpressionSyntax, _super);
        function SimpleArrowFunctionExpressionSyntax(identifier, equalsGreaterThanToken, body, parsedInStrictMode) {
            _super.call(this, equalsGreaterThanToken, body, parsedInStrictMode);
            this.identifier = identifier;
        }
        SimpleArrowFunctionExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitSimpleArrowFunctionExpression(this);
        };

        SimpleArrowFunctionExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.SimpleArrowFunctionExpression;
        };

        SimpleArrowFunctionExpressionSyntax.prototype.childCount = function () {
            return 3;
        };

        SimpleArrowFunctionExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.identifier;
                case 1:
                    return this.equalsGreaterThanToken;
                case 2:
                    return this.body;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        SimpleArrowFunctionExpressionSyntax.prototype.update = function (identifier, equalsGreaterThanToken, body) {
            if (this.identifier === identifier && this.equalsGreaterThanToken === equalsGreaterThanToken && this.body === body) {
                return this;
            }

            return new SimpleArrowFunctionExpressionSyntax(identifier, equalsGreaterThanToken, body, this.parsedInStrictMode());
        };

        SimpleArrowFunctionExpressionSyntax.create1 = function (identifier, body) {
            return new SimpleArrowFunctionExpressionSyntax(identifier, TypeScript.Syntax.token(TypeScript.SyntaxKind.EqualsGreaterThanToken), body, false);
        };

        SimpleArrowFunctionExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        SimpleArrowFunctionExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        SimpleArrowFunctionExpressionSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(identifier, this.equalsGreaterThanToken, this.body);
        };

        SimpleArrowFunctionExpressionSyntax.prototype.withEqualsGreaterThanToken = function (equalsGreaterThanToken) {
            return this.update(this.identifier, equalsGreaterThanToken, this.body);
        };

        SimpleArrowFunctionExpressionSyntax.prototype.withBody = function (body) {
            return this.update(this.identifier, this.equalsGreaterThanToken, body);
        };

        SimpleArrowFunctionExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return SimpleArrowFunctionExpressionSyntax;
    })(ArrowFunctionExpressionSyntax);
    TypeScript.SimpleArrowFunctionExpressionSyntax = SimpleArrowFunctionExpressionSyntax;

    var ParenthesizedArrowFunctionExpressionSyntax = (function (_super) {
        __extends(ParenthesizedArrowFunctionExpressionSyntax, _super);
        function ParenthesizedArrowFunctionExpressionSyntax(callSignature, equalsGreaterThanToken, body, parsedInStrictMode) {
            _super.call(this, equalsGreaterThanToken, body, parsedInStrictMode);
            this.callSignature = callSignature;
        }
        ParenthesizedArrowFunctionExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitParenthesizedArrowFunctionExpression(this);
        };

        ParenthesizedArrowFunctionExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ParenthesizedArrowFunctionExpression;
        };

        ParenthesizedArrowFunctionExpressionSyntax.prototype.childCount = function () {
            return 3;
        };

        ParenthesizedArrowFunctionExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.callSignature;
                case 1:
                    return this.equalsGreaterThanToken;
                case 2:
                    return this.body;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ParenthesizedArrowFunctionExpressionSyntax.prototype.update = function (callSignature, equalsGreaterThanToken, body) {
            if (this.callSignature === callSignature && this.equalsGreaterThanToken === equalsGreaterThanToken && this.body === body) {
                return this;
            }

            return new ParenthesizedArrowFunctionExpressionSyntax(callSignature, equalsGreaterThanToken, body, this.parsedInStrictMode());
        };

        ParenthesizedArrowFunctionExpressionSyntax.create1 = function (body) {
            return new ParenthesizedArrowFunctionExpressionSyntax(CallSignatureSyntax.create1(), TypeScript.Syntax.token(TypeScript.SyntaxKind.EqualsGreaterThanToken), body, false);
        };

        ParenthesizedArrowFunctionExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ParenthesizedArrowFunctionExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ParenthesizedArrowFunctionExpressionSyntax.prototype.withCallSignature = function (callSignature) {
            return this.update(callSignature, this.equalsGreaterThanToken, this.body);
        };

        ParenthesizedArrowFunctionExpressionSyntax.prototype.withEqualsGreaterThanToken = function (equalsGreaterThanToken) {
            return this.update(this.callSignature, equalsGreaterThanToken, this.body);
        };

        ParenthesizedArrowFunctionExpressionSyntax.prototype.withBody = function (body) {
            return this.update(this.callSignature, this.equalsGreaterThanToken, body);
        };

        ParenthesizedArrowFunctionExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ParenthesizedArrowFunctionExpressionSyntax;
    })(ArrowFunctionExpressionSyntax);
    TypeScript.ParenthesizedArrowFunctionExpressionSyntax = ParenthesizedArrowFunctionExpressionSyntax;

    var QualifiedNameSyntax = (function (_super) {
        __extends(QualifiedNameSyntax, _super);
        function QualifiedNameSyntax(left, dotToken, right, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.left = left;
            this.dotToken = dotToken;
            this.right = right;
        }
        QualifiedNameSyntax.prototype.accept = function (visitor) {
            return visitor.visitQualifiedName(this);
        };

        QualifiedNameSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.QualifiedName;
        };

        QualifiedNameSyntax.prototype.childCount = function () {
            return 3;
        };

        QualifiedNameSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.left;
                case 1:
                    return this.dotToken;
                case 2:
                    return this.right;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        QualifiedNameSyntax.prototype.isName = function () {
            return true;
        };

        QualifiedNameSyntax.prototype.isType = function () {
            return true;
        };

        QualifiedNameSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        QualifiedNameSyntax.prototype.isExpression = function () {
            return true;
        };

        QualifiedNameSyntax.prototype.update = function (left, dotToken, right) {
            if (this.left === left && this.dotToken === dotToken && this.right === right) {
                return this;
            }

            return new QualifiedNameSyntax(left, dotToken, right, this.parsedInStrictMode());
        };

        QualifiedNameSyntax.create1 = function (left, right) {
            return new QualifiedNameSyntax(left, TypeScript.Syntax.token(TypeScript.SyntaxKind.DotToken), right, false);
        };

        QualifiedNameSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        QualifiedNameSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        QualifiedNameSyntax.prototype.withLeft = function (left) {
            return this.update(left, this.dotToken, this.right);
        };

        QualifiedNameSyntax.prototype.withDotToken = function (dotToken) {
            return this.update(this.left, dotToken, this.right);
        };

        QualifiedNameSyntax.prototype.withRight = function (right) {
            return this.update(this.left, this.dotToken, right);
        };

        QualifiedNameSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return QualifiedNameSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.QualifiedNameSyntax = QualifiedNameSyntax;

    var TypeArgumentListSyntax = (function (_super) {
        __extends(TypeArgumentListSyntax, _super);
        function TypeArgumentListSyntax(lessThanToken, typeArguments, greaterThanToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.lessThanToken = lessThanToken;
            this.typeArguments = typeArguments;
            this.greaterThanToken = greaterThanToken;
        }
        TypeArgumentListSyntax.prototype.accept = function (visitor) {
            return visitor.visitTypeArgumentList(this);
        };

        TypeArgumentListSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.TypeArgumentList;
        };

        TypeArgumentListSyntax.prototype.childCount = function () {
            return 3;
        };

        TypeArgumentListSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.lessThanToken;
                case 1:
                    return this.typeArguments;
                case 2:
                    return this.greaterThanToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        TypeArgumentListSyntax.prototype.update = function (lessThanToken, typeArguments, greaterThanToken) {
            if (this.lessThanToken === lessThanToken && this.typeArguments === typeArguments && this.greaterThanToken === greaterThanToken) {
                return this;
            }

            return new TypeArgumentListSyntax(lessThanToken, typeArguments, greaterThanToken, this.parsedInStrictMode());
        };

        TypeArgumentListSyntax.create = function (lessThanToken, greaterThanToken) {
            return new TypeArgumentListSyntax(lessThanToken, TypeScript.Syntax.emptySeparatedList, greaterThanToken, false);
        };

        TypeArgumentListSyntax.create1 = function () {
            return new TypeArgumentListSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.LessThanToken), TypeScript.Syntax.emptySeparatedList, TypeScript.Syntax.token(TypeScript.SyntaxKind.GreaterThanToken), false);
        };

        TypeArgumentListSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        TypeArgumentListSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        TypeArgumentListSyntax.prototype.withLessThanToken = function (lessThanToken) {
            return this.update(lessThanToken, this.typeArguments, this.greaterThanToken);
        };

        TypeArgumentListSyntax.prototype.withTypeArguments = function (typeArguments) {
            return this.update(this.lessThanToken, typeArguments, this.greaterThanToken);
        };

        TypeArgumentListSyntax.prototype.withTypeArgument = function (typeArgument) {
            return this.withTypeArguments(TypeScript.Syntax.separatedList([typeArgument]));
        };

        TypeArgumentListSyntax.prototype.withGreaterThanToken = function (greaterThanToken) {
            return this.update(this.lessThanToken, this.typeArguments, greaterThanToken);
        };

        TypeArgumentListSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return TypeArgumentListSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.TypeArgumentListSyntax = TypeArgumentListSyntax;

    var ConstructorTypeSyntax = (function (_super) {
        __extends(ConstructorTypeSyntax, _super);
        function ConstructorTypeSyntax(newKeyword, typeParameterList, parameterList, equalsGreaterThanToken, type, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.newKeyword = newKeyword;
            this.typeParameterList = typeParameterList;
            this.parameterList = parameterList;
            this.equalsGreaterThanToken = equalsGreaterThanToken;
            this.type = type;
        }
        ConstructorTypeSyntax.prototype.accept = function (visitor) {
            return visitor.visitConstructorType(this);
        };

        ConstructorTypeSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ConstructorType;
        };

        ConstructorTypeSyntax.prototype.childCount = function () {
            return 5;
        };

        ConstructorTypeSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.newKeyword;
                case 1:
                    return this.typeParameterList;
                case 2:
                    return this.parameterList;
                case 3:
                    return this.equalsGreaterThanToken;
                case 4:
                    return this.type;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ConstructorTypeSyntax.prototype.isType = function () {
            return true;
        };

        ConstructorTypeSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        ConstructorTypeSyntax.prototype.isExpression = function () {
            return true;
        };

        ConstructorTypeSyntax.prototype.update = function (newKeyword, typeParameterList, parameterList, equalsGreaterThanToken, type) {
            if (this.newKeyword === newKeyword && this.typeParameterList === typeParameterList && this.parameterList === parameterList && this.equalsGreaterThanToken === equalsGreaterThanToken && this.type === type) {
                return this;
            }

            return new ConstructorTypeSyntax(newKeyword, typeParameterList, parameterList, equalsGreaterThanToken, type, this.parsedInStrictMode());
        };

        ConstructorTypeSyntax.create = function (newKeyword, parameterList, equalsGreaterThanToken, type) {
            return new ConstructorTypeSyntax(newKeyword, null, parameterList, equalsGreaterThanToken, type, false);
        };

        ConstructorTypeSyntax.create1 = function (type) {
            return new ConstructorTypeSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.NewKeyword), null, ParameterListSyntax.create1(), TypeScript.Syntax.token(TypeScript.SyntaxKind.EqualsGreaterThanToken), type, false);
        };

        ConstructorTypeSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ConstructorTypeSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ConstructorTypeSyntax.prototype.withNewKeyword = function (newKeyword) {
            return this.update(newKeyword, this.typeParameterList, this.parameterList, this.equalsGreaterThanToken, this.type);
        };

        ConstructorTypeSyntax.prototype.withTypeParameterList = function (typeParameterList) {
            return this.update(this.newKeyword, typeParameterList, this.parameterList, this.equalsGreaterThanToken, this.type);
        };

        ConstructorTypeSyntax.prototype.withParameterList = function (parameterList) {
            return this.update(this.newKeyword, this.typeParameterList, parameterList, this.equalsGreaterThanToken, this.type);
        };

        ConstructorTypeSyntax.prototype.withEqualsGreaterThanToken = function (equalsGreaterThanToken) {
            return this.update(this.newKeyword, this.typeParameterList, this.parameterList, equalsGreaterThanToken, this.type);
        };

        ConstructorTypeSyntax.prototype.withType = function (type) {
            return this.update(this.newKeyword, this.typeParameterList, this.parameterList, this.equalsGreaterThanToken, type);
        };

        ConstructorTypeSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ConstructorTypeSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ConstructorTypeSyntax = ConstructorTypeSyntax;

    var FunctionTypeSyntax = (function (_super) {
        __extends(FunctionTypeSyntax, _super);
        function FunctionTypeSyntax(typeParameterList, parameterList, equalsGreaterThanToken, type, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.typeParameterList = typeParameterList;
            this.parameterList = parameterList;
            this.equalsGreaterThanToken = equalsGreaterThanToken;
            this.type = type;
        }
        FunctionTypeSyntax.prototype.accept = function (visitor) {
            return visitor.visitFunctionType(this);
        };

        FunctionTypeSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.FunctionType;
        };

        FunctionTypeSyntax.prototype.childCount = function () {
            return 4;
        };

        FunctionTypeSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.typeParameterList;
                case 1:
                    return this.parameterList;
                case 2:
                    return this.equalsGreaterThanToken;
                case 3:
                    return this.type;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        FunctionTypeSyntax.prototype.isType = function () {
            return true;
        };

        FunctionTypeSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        FunctionTypeSyntax.prototype.isExpression = function () {
            return true;
        };

        FunctionTypeSyntax.prototype.update = function (typeParameterList, parameterList, equalsGreaterThanToken, type) {
            if (this.typeParameterList === typeParameterList && this.parameterList === parameterList && this.equalsGreaterThanToken === equalsGreaterThanToken && this.type === type) {
                return this;
            }

            return new FunctionTypeSyntax(typeParameterList, parameterList, equalsGreaterThanToken, type, this.parsedInStrictMode());
        };

        FunctionTypeSyntax.create = function (parameterList, equalsGreaterThanToken, type) {
            return new FunctionTypeSyntax(null, parameterList, equalsGreaterThanToken, type, false);
        };

        FunctionTypeSyntax.create1 = function (type) {
            return new FunctionTypeSyntax(null, ParameterListSyntax.create1(), TypeScript.Syntax.token(TypeScript.SyntaxKind.EqualsGreaterThanToken), type, false);
        };

        FunctionTypeSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        FunctionTypeSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        FunctionTypeSyntax.prototype.withTypeParameterList = function (typeParameterList) {
            return this.update(typeParameterList, this.parameterList, this.equalsGreaterThanToken, this.type);
        };

        FunctionTypeSyntax.prototype.withParameterList = function (parameterList) {
            return this.update(this.typeParameterList, parameterList, this.equalsGreaterThanToken, this.type);
        };

        FunctionTypeSyntax.prototype.withEqualsGreaterThanToken = function (equalsGreaterThanToken) {
            return this.update(this.typeParameterList, this.parameterList, equalsGreaterThanToken, this.type);
        };

        FunctionTypeSyntax.prototype.withType = function (type) {
            return this.update(this.typeParameterList, this.parameterList, this.equalsGreaterThanToken, type);
        };

        FunctionTypeSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return FunctionTypeSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.FunctionTypeSyntax = FunctionTypeSyntax;

    var ObjectTypeSyntax = (function (_super) {
        __extends(ObjectTypeSyntax, _super);
        function ObjectTypeSyntax(openBraceToken, typeMembers, closeBraceToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.openBraceToken = openBraceToken;
            this.typeMembers = typeMembers;
            this.closeBraceToken = closeBraceToken;
        }
        ObjectTypeSyntax.prototype.accept = function (visitor) {
            return visitor.visitObjectType(this);
        };

        ObjectTypeSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ObjectType;
        };

        ObjectTypeSyntax.prototype.childCount = function () {
            return 3;
        };

        ObjectTypeSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.openBraceToken;
                case 1:
                    return this.typeMembers;
                case 2:
                    return this.closeBraceToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ObjectTypeSyntax.prototype.isType = function () {
            return true;
        };

        ObjectTypeSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        ObjectTypeSyntax.prototype.isExpression = function () {
            return true;
        };

        ObjectTypeSyntax.prototype.update = function (openBraceToken, typeMembers, closeBraceToken) {
            if (this.openBraceToken === openBraceToken && this.typeMembers === typeMembers && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new ObjectTypeSyntax(openBraceToken, typeMembers, closeBraceToken, this.parsedInStrictMode());
        };

        ObjectTypeSyntax.create = function (openBraceToken, closeBraceToken) {
            return new ObjectTypeSyntax(openBraceToken, TypeScript.Syntax.emptySeparatedList, closeBraceToken, false);
        };

        ObjectTypeSyntax.create1 = function () {
            return new ObjectTypeSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenBraceToken), TypeScript.Syntax.emptySeparatedList, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseBraceToken), false);
        };

        ObjectTypeSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ObjectTypeSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ObjectTypeSyntax.prototype.withOpenBraceToken = function (openBraceToken) {
            return this.update(openBraceToken, this.typeMembers, this.closeBraceToken);
        };

        ObjectTypeSyntax.prototype.withTypeMembers = function (typeMembers) {
            return this.update(this.openBraceToken, typeMembers, this.closeBraceToken);
        };

        ObjectTypeSyntax.prototype.withTypeMember = function (typeMember) {
            return this.withTypeMembers(TypeScript.Syntax.separatedList([typeMember]));
        };

        ObjectTypeSyntax.prototype.withCloseBraceToken = function (closeBraceToken) {
            return this.update(this.openBraceToken, this.typeMembers, closeBraceToken);
        };

        ObjectTypeSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ObjectTypeSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ObjectTypeSyntax = ObjectTypeSyntax;

    var ArrayTypeSyntax = (function (_super) {
        __extends(ArrayTypeSyntax, _super);
        function ArrayTypeSyntax(type, openBracketToken, closeBracketToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.type = type;
            this.openBracketToken = openBracketToken;
            this.closeBracketToken = closeBracketToken;
        }
        ArrayTypeSyntax.prototype.accept = function (visitor) {
            return visitor.visitArrayType(this);
        };

        ArrayTypeSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ArrayType;
        };

        ArrayTypeSyntax.prototype.childCount = function () {
            return 3;
        };

        ArrayTypeSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.type;
                case 1:
                    return this.openBracketToken;
                case 2:
                    return this.closeBracketToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ArrayTypeSyntax.prototype.isType = function () {
            return true;
        };

        ArrayTypeSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        ArrayTypeSyntax.prototype.isExpression = function () {
            return true;
        };

        ArrayTypeSyntax.prototype.update = function (type, openBracketToken, closeBracketToken) {
            if (this.type === type && this.openBracketToken === openBracketToken && this.closeBracketToken === closeBracketToken) {
                return this;
            }

            return new ArrayTypeSyntax(type, openBracketToken, closeBracketToken, this.parsedInStrictMode());
        };

        ArrayTypeSyntax.create1 = function (type) {
            return new ArrayTypeSyntax(type, TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenBracketToken), TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseBracketToken), false);
        };

        ArrayTypeSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ArrayTypeSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ArrayTypeSyntax.prototype.withType = function (type) {
            return this.update(type, this.openBracketToken, this.closeBracketToken);
        };

        ArrayTypeSyntax.prototype.withOpenBracketToken = function (openBracketToken) {
            return this.update(this.type, openBracketToken, this.closeBracketToken);
        };

        ArrayTypeSyntax.prototype.withCloseBracketToken = function (closeBracketToken) {
            return this.update(this.type, this.openBracketToken, closeBracketToken);
        };

        ArrayTypeSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ArrayTypeSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ArrayTypeSyntax = ArrayTypeSyntax;

    var GenericTypeSyntax = (function (_super) {
        __extends(GenericTypeSyntax, _super);
        function GenericTypeSyntax(name, typeArgumentList, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.name = name;
            this.typeArgumentList = typeArgumentList;
        }
        GenericTypeSyntax.prototype.accept = function (visitor) {
            return visitor.visitGenericType(this);
        };

        GenericTypeSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.GenericType;
        };

        GenericTypeSyntax.prototype.childCount = function () {
            return 2;
        };

        GenericTypeSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.name;
                case 1:
                    return this.typeArgumentList;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        GenericTypeSyntax.prototype.isType = function () {
            return true;
        };

        GenericTypeSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        GenericTypeSyntax.prototype.isExpression = function () {
            return true;
        };

        GenericTypeSyntax.prototype.update = function (name, typeArgumentList) {
            if (this.name === name && this.typeArgumentList === typeArgumentList) {
                return this;
            }

            return new GenericTypeSyntax(name, typeArgumentList, this.parsedInStrictMode());
        };

        GenericTypeSyntax.create1 = function (name) {
            return new GenericTypeSyntax(name, TypeArgumentListSyntax.create1(), false);
        };

        GenericTypeSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        GenericTypeSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        GenericTypeSyntax.prototype.withName = function (name) {
            return this.update(name, this.typeArgumentList);
        };

        GenericTypeSyntax.prototype.withTypeArgumentList = function (typeArgumentList) {
            return this.update(this.name, typeArgumentList);
        };

        GenericTypeSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return GenericTypeSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.GenericTypeSyntax = GenericTypeSyntax;

    var TypeAnnotationSyntax = (function (_super) {
        __extends(TypeAnnotationSyntax, _super);
        function TypeAnnotationSyntax(colonToken, type, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.colonToken = colonToken;
            this.type = type;
        }
        TypeAnnotationSyntax.prototype.accept = function (visitor) {
            return visitor.visitTypeAnnotation(this);
        };

        TypeAnnotationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.TypeAnnotation;
        };

        TypeAnnotationSyntax.prototype.childCount = function () {
            return 2;
        };

        TypeAnnotationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.colonToken;
                case 1:
                    return this.type;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        TypeAnnotationSyntax.prototype.update = function (colonToken, type) {
            if (this.colonToken === colonToken && this.type === type) {
                return this;
            }

            return new TypeAnnotationSyntax(colonToken, type, this.parsedInStrictMode());
        };

        TypeAnnotationSyntax.create1 = function (type) {
            return new TypeAnnotationSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.ColonToken), type, false);
        };

        TypeAnnotationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        TypeAnnotationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        TypeAnnotationSyntax.prototype.withColonToken = function (colonToken) {
            return this.update(colonToken, this.type);
        };

        TypeAnnotationSyntax.prototype.withType = function (type) {
            return this.update(this.colonToken, type);
        };

        TypeAnnotationSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return TypeAnnotationSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.TypeAnnotationSyntax = TypeAnnotationSyntax;

    var BlockSyntax = (function (_super) {
        __extends(BlockSyntax, _super);
        function BlockSyntax(openBraceToken, statements, closeBraceToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.openBraceToken = openBraceToken;
            this.statements = statements;
            this.closeBraceToken = closeBraceToken;
        }
        BlockSyntax.prototype.accept = function (visitor) {
            return visitor.visitBlock(this);
        };

        BlockSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.Block;
        };

        BlockSyntax.prototype.childCount = function () {
            return 3;
        };

        BlockSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.openBraceToken;
                case 1:
                    return this.statements;
                case 2:
                    return this.closeBraceToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        BlockSyntax.prototype.isStatement = function () {
            return true;
        };

        BlockSyntax.prototype.isModuleElement = function () {
            return true;
        };

        BlockSyntax.prototype.update = function (openBraceToken, statements, closeBraceToken) {
            if (this.openBraceToken === openBraceToken && this.statements === statements && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new BlockSyntax(openBraceToken, statements, closeBraceToken, this.parsedInStrictMode());
        };

        BlockSyntax.create = function (openBraceToken, closeBraceToken) {
            return new BlockSyntax(openBraceToken, TypeScript.Syntax.emptyList, closeBraceToken, false);
        };

        BlockSyntax.create1 = function () {
            return new BlockSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenBraceToken), TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseBraceToken), false);
        };

        BlockSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        BlockSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        BlockSyntax.prototype.withOpenBraceToken = function (openBraceToken) {
            return this.update(openBraceToken, this.statements, this.closeBraceToken);
        };

        BlockSyntax.prototype.withStatements = function (statements) {
            return this.update(this.openBraceToken, statements, this.closeBraceToken);
        };

        BlockSyntax.prototype.withStatement = function (statement) {
            return this.withStatements(TypeScript.Syntax.list([statement]));
        };

        BlockSyntax.prototype.withCloseBraceToken = function (closeBraceToken) {
            return this.update(this.openBraceToken, this.statements, closeBraceToken);
        };

        BlockSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.statements.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return BlockSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.BlockSyntax = BlockSyntax;

    var ParameterSyntax = (function (_super) {
        __extends(ParameterSyntax, _super);
        function ParameterSyntax(dotDotDotToken, publicOrPrivateKeyword, identifier, questionToken, typeAnnotation, equalsValueClause, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.dotDotDotToken = dotDotDotToken;
            this.publicOrPrivateKeyword = publicOrPrivateKeyword;
            this.identifier = identifier;
            this.questionToken = questionToken;
            this.typeAnnotation = typeAnnotation;
            this.equalsValueClause = equalsValueClause;
        }
        ParameterSyntax.prototype.accept = function (visitor) {
            return visitor.visitParameter(this);
        };

        ParameterSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.Parameter;
        };

        ParameterSyntax.prototype.childCount = function () {
            return 6;
        };

        ParameterSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.dotDotDotToken;
                case 1:
                    return this.publicOrPrivateKeyword;
                case 2:
                    return this.identifier;
                case 3:
                    return this.questionToken;
                case 4:
                    return this.typeAnnotation;
                case 5:
                    return this.equalsValueClause;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ParameterSyntax.prototype.update = function (dotDotDotToken, publicOrPrivateKeyword, identifier, questionToken, typeAnnotation, equalsValueClause) {
            if (this.dotDotDotToken === dotDotDotToken && this.publicOrPrivateKeyword === publicOrPrivateKeyword && this.identifier === identifier && this.questionToken === questionToken && this.typeAnnotation === typeAnnotation && this.equalsValueClause === equalsValueClause) {
                return this;
            }

            return new ParameterSyntax(dotDotDotToken, publicOrPrivateKeyword, identifier, questionToken, typeAnnotation, equalsValueClause, this.parsedInStrictMode());
        };

        ParameterSyntax.create = function (identifier) {
            return new ParameterSyntax(null, null, identifier, null, null, null, false);
        };

        ParameterSyntax.create1 = function (identifier) {
            return new ParameterSyntax(null, null, identifier, null, null, null, false);
        };

        ParameterSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ParameterSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ParameterSyntax.prototype.withDotDotDotToken = function (dotDotDotToken) {
            return this.update(dotDotDotToken, this.publicOrPrivateKeyword, this.identifier, this.questionToken, this.typeAnnotation, this.equalsValueClause);
        };

        ParameterSyntax.prototype.withPublicOrPrivateKeyword = function (publicOrPrivateKeyword) {
            return this.update(this.dotDotDotToken, publicOrPrivateKeyword, this.identifier, this.questionToken, this.typeAnnotation, this.equalsValueClause);
        };

        ParameterSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(this.dotDotDotToken, this.publicOrPrivateKeyword, identifier, this.questionToken, this.typeAnnotation, this.equalsValueClause);
        };

        ParameterSyntax.prototype.withQuestionToken = function (questionToken) {
            return this.update(this.dotDotDotToken, this.publicOrPrivateKeyword, this.identifier, questionToken, this.typeAnnotation, this.equalsValueClause);
        };

        ParameterSyntax.prototype.withTypeAnnotation = function (typeAnnotation) {
            return this.update(this.dotDotDotToken, this.publicOrPrivateKeyword, this.identifier, this.questionToken, typeAnnotation, this.equalsValueClause);
        };

        ParameterSyntax.prototype.withEqualsValueClause = function (equalsValueClause) {
            return this.update(this.dotDotDotToken, this.publicOrPrivateKeyword, this.identifier, this.questionToken, this.typeAnnotation, equalsValueClause);
        };

        ParameterSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.dotDotDotToken !== null) {
                return true;
            }
            if (this.publicOrPrivateKeyword !== null) {
                return true;
            }
            if (this.questionToken !== null) {
                return true;
            }
            if (this.typeAnnotation !== null) {
                return true;
            }
            if (this.equalsValueClause !== null) {
                return true;
            }
            return false;
        };
        return ParameterSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ParameterSyntax = ParameterSyntax;

    var MemberAccessExpressionSyntax = (function (_super) {
        __extends(MemberAccessExpressionSyntax, _super);
        function MemberAccessExpressionSyntax(expression, dotToken, name, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.expression = expression;
            this.dotToken = dotToken;
            this.name = name;
        }
        MemberAccessExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitMemberAccessExpression(this);
        };

        MemberAccessExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.MemberAccessExpression;
        };

        MemberAccessExpressionSyntax.prototype.childCount = function () {
            return 3;
        };

        MemberAccessExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.expression;
                case 1:
                    return this.dotToken;
                case 2:
                    return this.name;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        MemberAccessExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        MemberAccessExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        MemberAccessExpressionSyntax.prototype.update = function (expression, dotToken, name) {
            if (this.expression === expression && this.dotToken === dotToken && this.name === name) {
                return this;
            }

            return new MemberAccessExpressionSyntax(expression, dotToken, name, this.parsedInStrictMode());
        };

        MemberAccessExpressionSyntax.create1 = function (expression, name) {
            return new MemberAccessExpressionSyntax(expression, TypeScript.Syntax.token(TypeScript.SyntaxKind.DotToken), name, false);
        };

        MemberAccessExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        MemberAccessExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        MemberAccessExpressionSyntax.prototype.withExpression = function (expression) {
            return this.update(expression, this.dotToken, this.name);
        };

        MemberAccessExpressionSyntax.prototype.withDotToken = function (dotToken) {
            return this.update(this.expression, dotToken, this.name);
        };

        MemberAccessExpressionSyntax.prototype.withName = function (name) {
            return this.update(this.expression, this.dotToken, name);
        };

        MemberAccessExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return MemberAccessExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.MemberAccessExpressionSyntax = MemberAccessExpressionSyntax;

    var PostfixUnaryExpressionSyntax = (function (_super) {
        __extends(PostfixUnaryExpressionSyntax, _super);
        function PostfixUnaryExpressionSyntax(kind, operand, operatorToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.operand = operand;
            this.operatorToken = operatorToken;

            this._kind = kind;
        }
        PostfixUnaryExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitPostfixUnaryExpression(this);
        };

        PostfixUnaryExpressionSyntax.prototype.childCount = function () {
            return 2;
        };

        PostfixUnaryExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.operand;
                case 1:
                    return this.operatorToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        PostfixUnaryExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        PostfixUnaryExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        PostfixUnaryExpressionSyntax.prototype.kind = function () {
            return this._kind;
        };

        PostfixUnaryExpressionSyntax.prototype.update = function (kind, operand, operatorToken) {
            if (this._kind === kind && this.operand === operand && this.operatorToken === operatorToken) {
                return this;
            }

            return new PostfixUnaryExpressionSyntax(kind, operand, operatorToken, this.parsedInStrictMode());
        };

        PostfixUnaryExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        PostfixUnaryExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        PostfixUnaryExpressionSyntax.prototype.withKind = function (kind) {
            return this.update(kind, this.operand, this.operatorToken);
        };

        PostfixUnaryExpressionSyntax.prototype.withOperand = function (operand) {
            return this.update(this._kind, operand, this.operatorToken);
        };

        PostfixUnaryExpressionSyntax.prototype.withOperatorToken = function (operatorToken) {
            return this.update(this._kind, this.operand, operatorToken);
        };

        PostfixUnaryExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.operand.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return PostfixUnaryExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.PostfixUnaryExpressionSyntax = PostfixUnaryExpressionSyntax;

    var ElementAccessExpressionSyntax = (function (_super) {
        __extends(ElementAccessExpressionSyntax, _super);
        function ElementAccessExpressionSyntax(expression, openBracketToken, argumentExpression, closeBracketToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.expression = expression;
            this.openBracketToken = openBracketToken;
            this.argumentExpression = argumentExpression;
            this.closeBracketToken = closeBracketToken;
        }
        ElementAccessExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitElementAccessExpression(this);
        };

        ElementAccessExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ElementAccessExpression;
        };

        ElementAccessExpressionSyntax.prototype.childCount = function () {
            return 4;
        };

        ElementAccessExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.expression;
                case 1:
                    return this.openBracketToken;
                case 2:
                    return this.argumentExpression;
                case 3:
                    return this.closeBracketToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ElementAccessExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        ElementAccessExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        ElementAccessExpressionSyntax.prototype.update = function (expression, openBracketToken, argumentExpression, closeBracketToken) {
            if (this.expression === expression && this.openBracketToken === openBracketToken && this.argumentExpression === argumentExpression && this.closeBracketToken === closeBracketToken) {
                return this;
            }

            return new ElementAccessExpressionSyntax(expression, openBracketToken, argumentExpression, closeBracketToken, this.parsedInStrictMode());
        };

        ElementAccessExpressionSyntax.create1 = function (expression, argumentExpression) {
            return new ElementAccessExpressionSyntax(expression, TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenBracketToken), argumentExpression, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseBracketToken), false);
        };

        ElementAccessExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ElementAccessExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ElementAccessExpressionSyntax.prototype.withExpression = function (expression) {
            return this.update(expression, this.openBracketToken, this.argumentExpression, this.closeBracketToken);
        };

        ElementAccessExpressionSyntax.prototype.withOpenBracketToken = function (openBracketToken) {
            return this.update(this.expression, openBracketToken, this.argumentExpression, this.closeBracketToken);
        };

        ElementAccessExpressionSyntax.prototype.withArgumentExpression = function (argumentExpression) {
            return this.update(this.expression, this.openBracketToken, argumentExpression, this.closeBracketToken);
        };

        ElementAccessExpressionSyntax.prototype.withCloseBracketToken = function (closeBracketToken) {
            return this.update(this.expression, this.openBracketToken, this.argumentExpression, closeBracketToken);
        };

        ElementAccessExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            if (this.argumentExpression.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ElementAccessExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ElementAccessExpressionSyntax = ElementAccessExpressionSyntax;

    var InvocationExpressionSyntax = (function (_super) {
        __extends(InvocationExpressionSyntax, _super);
        function InvocationExpressionSyntax(expression, argumentList, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.expression = expression;
            this.argumentList = argumentList;
        }
        InvocationExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitInvocationExpression(this);
        };

        InvocationExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.InvocationExpression;
        };

        InvocationExpressionSyntax.prototype.childCount = function () {
            return 2;
        };

        InvocationExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.expression;
                case 1:
                    return this.argumentList;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        InvocationExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        InvocationExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        InvocationExpressionSyntax.prototype.update = function (expression, argumentList) {
            if (this.expression === expression && this.argumentList === argumentList) {
                return this;
            }

            return new InvocationExpressionSyntax(expression, argumentList, this.parsedInStrictMode());
        };

        InvocationExpressionSyntax.create1 = function (expression) {
            return new InvocationExpressionSyntax(expression, ArgumentListSyntax.create1(), false);
        };

        InvocationExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        InvocationExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        InvocationExpressionSyntax.prototype.withExpression = function (expression) {
            return this.update(expression, this.argumentList);
        };

        InvocationExpressionSyntax.prototype.withArgumentList = function (argumentList) {
            return this.update(this.expression, argumentList);
        };

        InvocationExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            if (this.argumentList.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return InvocationExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.InvocationExpressionSyntax = InvocationExpressionSyntax;

    var ArgumentListSyntax = (function (_super) {
        __extends(ArgumentListSyntax, _super);
        function ArgumentListSyntax(typeArgumentList, openParenToken, arguments, closeParenToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.typeArgumentList = typeArgumentList;
            this.openParenToken = openParenToken;
            this.arguments = arguments;
            this.closeParenToken = closeParenToken;
        }
        ArgumentListSyntax.prototype.accept = function (visitor) {
            return visitor.visitArgumentList(this);
        };

        ArgumentListSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ArgumentList;
        };

        ArgumentListSyntax.prototype.childCount = function () {
            return 4;
        };

        ArgumentListSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.typeArgumentList;
                case 1:
                    return this.openParenToken;
                case 2:
                    return this.arguments;
                case 3:
                    return this.closeParenToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ArgumentListSyntax.prototype.update = function (typeArgumentList, openParenToken, _arguments, closeParenToken) {
            if (this.typeArgumentList === typeArgumentList && this.openParenToken === openParenToken && this.arguments === _arguments && this.closeParenToken === closeParenToken) {
                return this;
            }

            return new ArgumentListSyntax(typeArgumentList, openParenToken, _arguments, closeParenToken, this.parsedInStrictMode());
        };

        ArgumentListSyntax.create = function (openParenToken, closeParenToken) {
            return new ArgumentListSyntax(null, openParenToken, TypeScript.Syntax.emptySeparatedList, closeParenToken, false);
        };

        ArgumentListSyntax.create1 = function () {
            return new ArgumentListSyntax(null, TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), TypeScript.Syntax.emptySeparatedList, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), false);
        };

        ArgumentListSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ArgumentListSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ArgumentListSyntax.prototype.withTypeArgumentList = function (typeArgumentList) {
            return this.update(typeArgumentList, this.openParenToken, this.arguments, this.closeParenToken);
        };

        ArgumentListSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(this.typeArgumentList, openParenToken, this.arguments, this.closeParenToken);
        };

        ArgumentListSyntax.prototype.withArguments = function (_arguments) {
            return this.update(this.typeArgumentList, this.openParenToken, _arguments, this.closeParenToken);
        };

        ArgumentListSyntax.prototype.withArgument = function (_argument) {
            return this.withArguments(TypeScript.Syntax.separatedList([_argument]));
        };

        ArgumentListSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.typeArgumentList, this.openParenToken, this.arguments, closeParenToken);
        };

        ArgumentListSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.typeArgumentList !== null && this.typeArgumentList.isTypeScriptSpecific()) {
                return true;
            }
            if (this.arguments.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ArgumentListSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ArgumentListSyntax = ArgumentListSyntax;

    var BinaryExpressionSyntax = (function (_super) {
        __extends(BinaryExpressionSyntax, _super);
        function BinaryExpressionSyntax(kind, left, operatorToken, right, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.left = left;
            this.operatorToken = operatorToken;
            this.right = right;

            this._kind = kind;
        }
        BinaryExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitBinaryExpression(this);
        };

        BinaryExpressionSyntax.prototype.childCount = function () {
            return 3;
        };

        BinaryExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.left;
                case 1:
                    return this.operatorToken;
                case 2:
                    return this.right;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        BinaryExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        BinaryExpressionSyntax.prototype.kind = function () {
            return this._kind;
        };

        BinaryExpressionSyntax.prototype.update = function (kind, left, operatorToken, right) {
            if (this._kind === kind && this.left === left && this.operatorToken === operatorToken && this.right === right) {
                return this;
            }

            return new BinaryExpressionSyntax(kind, left, operatorToken, right, this.parsedInStrictMode());
        };

        BinaryExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        BinaryExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        BinaryExpressionSyntax.prototype.withKind = function (kind) {
            return this.update(kind, this.left, this.operatorToken, this.right);
        };

        BinaryExpressionSyntax.prototype.withLeft = function (left) {
            return this.update(this._kind, left, this.operatorToken, this.right);
        };

        BinaryExpressionSyntax.prototype.withOperatorToken = function (operatorToken) {
            return this.update(this._kind, this.left, operatorToken, this.right);
        };

        BinaryExpressionSyntax.prototype.withRight = function (right) {
            return this.update(this._kind, this.left, this.operatorToken, right);
        };

        BinaryExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.left.isTypeScriptSpecific()) {
                return true;
            }
            if (this.right.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return BinaryExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.BinaryExpressionSyntax = BinaryExpressionSyntax;

    var ConditionalExpressionSyntax = (function (_super) {
        __extends(ConditionalExpressionSyntax, _super);
        function ConditionalExpressionSyntax(condition, questionToken, whenTrue, colonToken, whenFalse, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.condition = condition;
            this.questionToken = questionToken;
            this.whenTrue = whenTrue;
            this.colonToken = colonToken;
            this.whenFalse = whenFalse;
        }
        ConditionalExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitConditionalExpression(this);
        };

        ConditionalExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ConditionalExpression;
        };

        ConditionalExpressionSyntax.prototype.childCount = function () {
            return 5;
        };

        ConditionalExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.condition;
                case 1:
                    return this.questionToken;
                case 2:
                    return this.whenTrue;
                case 3:
                    return this.colonToken;
                case 4:
                    return this.whenFalse;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ConditionalExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        ConditionalExpressionSyntax.prototype.update = function (condition, questionToken, whenTrue, colonToken, whenFalse) {
            if (this.condition === condition && this.questionToken === questionToken && this.whenTrue === whenTrue && this.colonToken === colonToken && this.whenFalse === whenFalse) {
                return this;
            }

            return new ConditionalExpressionSyntax(condition, questionToken, whenTrue, colonToken, whenFalse, this.parsedInStrictMode());
        };

        ConditionalExpressionSyntax.create1 = function (condition, whenTrue, whenFalse) {
            return new ConditionalExpressionSyntax(condition, TypeScript.Syntax.token(TypeScript.SyntaxKind.QuestionToken), whenTrue, TypeScript.Syntax.token(TypeScript.SyntaxKind.ColonToken), whenFalse, false);
        };

        ConditionalExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ConditionalExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ConditionalExpressionSyntax.prototype.withCondition = function (condition) {
            return this.update(condition, this.questionToken, this.whenTrue, this.colonToken, this.whenFalse);
        };

        ConditionalExpressionSyntax.prototype.withQuestionToken = function (questionToken) {
            return this.update(this.condition, questionToken, this.whenTrue, this.colonToken, this.whenFalse);
        };

        ConditionalExpressionSyntax.prototype.withWhenTrue = function (whenTrue) {
            return this.update(this.condition, this.questionToken, whenTrue, this.colonToken, this.whenFalse);
        };

        ConditionalExpressionSyntax.prototype.withColonToken = function (colonToken) {
            return this.update(this.condition, this.questionToken, this.whenTrue, colonToken, this.whenFalse);
        };

        ConditionalExpressionSyntax.prototype.withWhenFalse = function (whenFalse) {
            return this.update(this.condition, this.questionToken, this.whenTrue, this.colonToken, whenFalse);
        };

        ConditionalExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.condition.isTypeScriptSpecific()) {
                return true;
            }
            if (this.whenTrue.isTypeScriptSpecific()) {
                return true;
            }
            if (this.whenFalse.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ConditionalExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ConditionalExpressionSyntax = ConditionalExpressionSyntax;

    var ConstructSignatureSyntax = (function (_super) {
        __extends(ConstructSignatureSyntax, _super);
        function ConstructSignatureSyntax(newKeyword, callSignature, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.newKeyword = newKeyword;
            this.callSignature = callSignature;
        }
        ConstructSignatureSyntax.prototype.accept = function (visitor) {
            return visitor.visitConstructSignature(this);
        };

        ConstructSignatureSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ConstructSignature;
        };

        ConstructSignatureSyntax.prototype.childCount = function () {
            return 2;
        };

        ConstructSignatureSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.newKeyword;
                case 1:
                    return this.callSignature;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ConstructSignatureSyntax.prototype.isTypeMember = function () {
            return true;
        };

        ConstructSignatureSyntax.prototype.update = function (newKeyword, callSignature) {
            if (this.newKeyword === newKeyword && this.callSignature === callSignature) {
                return this;
            }

            return new ConstructSignatureSyntax(newKeyword, callSignature, this.parsedInStrictMode());
        };

        ConstructSignatureSyntax.create1 = function () {
            return new ConstructSignatureSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.NewKeyword), CallSignatureSyntax.create1(), false);
        };

        ConstructSignatureSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ConstructSignatureSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ConstructSignatureSyntax.prototype.withNewKeyword = function (newKeyword) {
            return this.update(newKeyword, this.callSignature);
        };

        ConstructSignatureSyntax.prototype.withCallSignature = function (callSignature) {
            return this.update(this.newKeyword, callSignature);
        };

        ConstructSignatureSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ConstructSignatureSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ConstructSignatureSyntax = ConstructSignatureSyntax;

    var MethodSignatureSyntax = (function (_super) {
        __extends(MethodSignatureSyntax, _super);
        function MethodSignatureSyntax(propertyName, questionToken, callSignature, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.propertyName = propertyName;
            this.questionToken = questionToken;
            this.callSignature = callSignature;
        }
        MethodSignatureSyntax.prototype.accept = function (visitor) {
            return visitor.visitMethodSignature(this);
        };

        MethodSignatureSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.MethodSignature;
        };

        MethodSignatureSyntax.prototype.childCount = function () {
            return 3;
        };

        MethodSignatureSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.propertyName;
                case 1:
                    return this.questionToken;
                case 2:
                    return this.callSignature;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        MethodSignatureSyntax.prototype.isTypeMember = function () {
            return true;
        };

        MethodSignatureSyntax.prototype.update = function (propertyName, questionToken, callSignature) {
            if (this.propertyName === propertyName && this.questionToken === questionToken && this.callSignature === callSignature) {
                return this;
            }

            return new MethodSignatureSyntax(propertyName, questionToken, callSignature, this.parsedInStrictMode());
        };

        MethodSignatureSyntax.create = function (propertyName, callSignature) {
            return new MethodSignatureSyntax(propertyName, null, callSignature, false);
        };

        MethodSignatureSyntax.create1 = function (propertyName) {
            return new MethodSignatureSyntax(propertyName, null, CallSignatureSyntax.create1(), false);
        };

        MethodSignatureSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        MethodSignatureSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        MethodSignatureSyntax.prototype.withPropertyName = function (propertyName) {
            return this.update(propertyName, this.questionToken, this.callSignature);
        };

        MethodSignatureSyntax.prototype.withQuestionToken = function (questionToken) {
            return this.update(this.propertyName, questionToken, this.callSignature);
        };

        MethodSignatureSyntax.prototype.withCallSignature = function (callSignature) {
            return this.update(this.propertyName, this.questionToken, callSignature);
        };

        MethodSignatureSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.callSignature.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return MethodSignatureSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.MethodSignatureSyntax = MethodSignatureSyntax;

    var IndexSignatureSyntax = (function (_super) {
        __extends(IndexSignatureSyntax, _super);
        function IndexSignatureSyntax(openBracketToken, parameter, closeBracketToken, typeAnnotation, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.openBracketToken = openBracketToken;
            this.parameter = parameter;
            this.closeBracketToken = closeBracketToken;
            this.typeAnnotation = typeAnnotation;
        }
        IndexSignatureSyntax.prototype.accept = function (visitor) {
            return visitor.visitIndexSignature(this);
        };

        IndexSignatureSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.IndexSignature;
        };

        IndexSignatureSyntax.prototype.childCount = function () {
            return 4;
        };

        IndexSignatureSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.openBracketToken;
                case 1:
                    return this.parameter;
                case 2:
                    return this.closeBracketToken;
                case 3:
                    return this.typeAnnotation;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        IndexSignatureSyntax.prototype.isTypeMember = function () {
            return true;
        };

        IndexSignatureSyntax.prototype.isClassElement = function () {
            return true;
        };

        IndexSignatureSyntax.prototype.update = function (openBracketToken, parameter, closeBracketToken, typeAnnotation) {
            if (this.openBracketToken === openBracketToken && this.parameter === parameter && this.closeBracketToken === closeBracketToken && this.typeAnnotation === typeAnnotation) {
                return this;
            }

            return new IndexSignatureSyntax(openBracketToken, parameter, closeBracketToken, typeAnnotation, this.parsedInStrictMode());
        };

        IndexSignatureSyntax.create = function (openBracketToken, parameter, closeBracketToken) {
            return new IndexSignatureSyntax(openBracketToken, parameter, closeBracketToken, null, false);
        };

        IndexSignatureSyntax.create1 = function (parameter) {
            return new IndexSignatureSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenBracketToken), parameter, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseBracketToken), null, false);
        };

        IndexSignatureSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        IndexSignatureSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        IndexSignatureSyntax.prototype.withOpenBracketToken = function (openBracketToken) {
            return this.update(openBracketToken, this.parameter, this.closeBracketToken, this.typeAnnotation);
        };

        IndexSignatureSyntax.prototype.withParameter = function (parameter) {
            return this.update(this.openBracketToken, parameter, this.closeBracketToken, this.typeAnnotation);
        };

        IndexSignatureSyntax.prototype.withCloseBracketToken = function (closeBracketToken) {
            return this.update(this.openBracketToken, this.parameter, closeBracketToken, this.typeAnnotation);
        };

        IndexSignatureSyntax.prototype.withTypeAnnotation = function (typeAnnotation) {
            return this.update(this.openBracketToken, this.parameter, this.closeBracketToken, typeAnnotation);
        };

        IndexSignatureSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return IndexSignatureSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.IndexSignatureSyntax = IndexSignatureSyntax;

    var PropertySignatureSyntax = (function (_super) {
        __extends(PropertySignatureSyntax, _super);
        function PropertySignatureSyntax(propertyName, questionToken, typeAnnotation, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.propertyName = propertyName;
            this.questionToken = questionToken;
            this.typeAnnotation = typeAnnotation;
        }
        PropertySignatureSyntax.prototype.accept = function (visitor) {
            return visitor.visitPropertySignature(this);
        };

        PropertySignatureSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.PropertySignature;
        };

        PropertySignatureSyntax.prototype.childCount = function () {
            return 3;
        };

        PropertySignatureSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.propertyName;
                case 1:
                    return this.questionToken;
                case 2:
                    return this.typeAnnotation;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        PropertySignatureSyntax.prototype.isTypeMember = function () {
            return true;
        };

        PropertySignatureSyntax.prototype.update = function (propertyName, questionToken, typeAnnotation) {
            if (this.propertyName === propertyName && this.questionToken === questionToken && this.typeAnnotation === typeAnnotation) {
                return this;
            }

            return new PropertySignatureSyntax(propertyName, questionToken, typeAnnotation, this.parsedInStrictMode());
        };

        PropertySignatureSyntax.create = function (propertyName) {
            return new PropertySignatureSyntax(propertyName, null, null, false);
        };

        PropertySignatureSyntax.create1 = function (propertyName) {
            return new PropertySignatureSyntax(propertyName, null, null, false);
        };

        PropertySignatureSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        PropertySignatureSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        PropertySignatureSyntax.prototype.withPropertyName = function (propertyName) {
            return this.update(propertyName, this.questionToken, this.typeAnnotation);
        };

        PropertySignatureSyntax.prototype.withQuestionToken = function (questionToken) {
            return this.update(this.propertyName, questionToken, this.typeAnnotation);
        };

        PropertySignatureSyntax.prototype.withTypeAnnotation = function (typeAnnotation) {
            return this.update(this.propertyName, this.questionToken, typeAnnotation);
        };

        PropertySignatureSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return PropertySignatureSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.PropertySignatureSyntax = PropertySignatureSyntax;

    var CallSignatureSyntax = (function (_super) {
        __extends(CallSignatureSyntax, _super);
        function CallSignatureSyntax(typeParameterList, parameterList, typeAnnotation, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.typeParameterList = typeParameterList;
            this.parameterList = parameterList;
            this.typeAnnotation = typeAnnotation;
        }
        CallSignatureSyntax.prototype.accept = function (visitor) {
            return visitor.visitCallSignature(this);
        };

        CallSignatureSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.CallSignature;
        };

        CallSignatureSyntax.prototype.childCount = function () {
            return 3;
        };

        CallSignatureSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.typeParameterList;
                case 1:
                    return this.parameterList;
                case 2:
                    return this.typeAnnotation;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        CallSignatureSyntax.prototype.isTypeMember = function () {
            return true;
        };

        CallSignatureSyntax.prototype.update = function (typeParameterList, parameterList, typeAnnotation) {
            if (this.typeParameterList === typeParameterList && this.parameterList === parameterList && this.typeAnnotation === typeAnnotation) {
                return this;
            }

            return new CallSignatureSyntax(typeParameterList, parameterList, typeAnnotation, this.parsedInStrictMode());
        };

        CallSignatureSyntax.create = function (parameterList) {
            return new CallSignatureSyntax(null, parameterList, null, false);
        };

        CallSignatureSyntax.create1 = function () {
            return new CallSignatureSyntax(null, ParameterListSyntax.create1(), null, false);
        };

        CallSignatureSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        CallSignatureSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        CallSignatureSyntax.prototype.withTypeParameterList = function (typeParameterList) {
            return this.update(typeParameterList, this.parameterList, this.typeAnnotation);
        };

        CallSignatureSyntax.prototype.withParameterList = function (parameterList) {
            return this.update(this.typeParameterList, parameterList, this.typeAnnotation);
        };

        CallSignatureSyntax.prototype.withTypeAnnotation = function (typeAnnotation) {
            return this.update(this.typeParameterList, this.parameterList, typeAnnotation);
        };

        CallSignatureSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.typeParameterList !== null) {
                return true;
            }
            if (this.parameterList.isTypeScriptSpecific()) {
                return true;
            }
            if (this.typeAnnotation !== null) {
                return true;
            }
            return false;
        };
        return CallSignatureSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.CallSignatureSyntax = CallSignatureSyntax;

    var ParameterListSyntax = (function (_super) {
        __extends(ParameterListSyntax, _super);
        function ParameterListSyntax(openParenToken, parameters, closeParenToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.openParenToken = openParenToken;
            this.parameters = parameters;
            this.closeParenToken = closeParenToken;
        }
        ParameterListSyntax.prototype.accept = function (visitor) {
            return visitor.visitParameterList(this);
        };

        ParameterListSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ParameterList;
        };

        ParameterListSyntax.prototype.childCount = function () {
            return 3;
        };

        ParameterListSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.openParenToken;
                case 1:
                    return this.parameters;
                case 2:
                    return this.closeParenToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ParameterListSyntax.prototype.update = function (openParenToken, parameters, closeParenToken) {
            if (this.openParenToken === openParenToken && this.parameters === parameters && this.closeParenToken === closeParenToken) {
                return this;
            }

            return new ParameterListSyntax(openParenToken, parameters, closeParenToken, this.parsedInStrictMode());
        };

        ParameterListSyntax.create = function (openParenToken, closeParenToken) {
            return new ParameterListSyntax(openParenToken, TypeScript.Syntax.emptySeparatedList, closeParenToken, false);
        };

        ParameterListSyntax.create1 = function () {
            return new ParameterListSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), TypeScript.Syntax.emptySeparatedList, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), false);
        };

        ParameterListSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ParameterListSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ParameterListSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(openParenToken, this.parameters, this.closeParenToken);
        };

        ParameterListSyntax.prototype.withParameters = function (parameters) {
            return this.update(this.openParenToken, parameters, this.closeParenToken);
        };

        ParameterListSyntax.prototype.withParameter = function (parameter) {
            return this.withParameters(TypeScript.Syntax.separatedList([parameter]));
        };

        ParameterListSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.openParenToken, this.parameters, closeParenToken);
        };

        ParameterListSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.parameters.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ParameterListSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ParameterListSyntax = ParameterListSyntax;

    var TypeParameterListSyntax = (function (_super) {
        __extends(TypeParameterListSyntax, _super);
        function TypeParameterListSyntax(lessThanToken, typeParameters, greaterThanToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.lessThanToken = lessThanToken;
            this.typeParameters = typeParameters;
            this.greaterThanToken = greaterThanToken;
        }
        TypeParameterListSyntax.prototype.accept = function (visitor) {
            return visitor.visitTypeParameterList(this);
        };

        TypeParameterListSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.TypeParameterList;
        };

        TypeParameterListSyntax.prototype.childCount = function () {
            return 3;
        };

        TypeParameterListSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.lessThanToken;
                case 1:
                    return this.typeParameters;
                case 2:
                    return this.greaterThanToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        TypeParameterListSyntax.prototype.update = function (lessThanToken, typeParameters, greaterThanToken) {
            if (this.lessThanToken === lessThanToken && this.typeParameters === typeParameters && this.greaterThanToken === greaterThanToken) {
                return this;
            }

            return new TypeParameterListSyntax(lessThanToken, typeParameters, greaterThanToken, this.parsedInStrictMode());
        };

        TypeParameterListSyntax.create = function (lessThanToken, greaterThanToken) {
            return new TypeParameterListSyntax(lessThanToken, TypeScript.Syntax.emptySeparatedList, greaterThanToken, false);
        };

        TypeParameterListSyntax.create1 = function () {
            return new TypeParameterListSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.LessThanToken), TypeScript.Syntax.emptySeparatedList, TypeScript.Syntax.token(TypeScript.SyntaxKind.GreaterThanToken), false);
        };

        TypeParameterListSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        TypeParameterListSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        TypeParameterListSyntax.prototype.withLessThanToken = function (lessThanToken) {
            return this.update(lessThanToken, this.typeParameters, this.greaterThanToken);
        };

        TypeParameterListSyntax.prototype.withTypeParameters = function (typeParameters) {
            return this.update(this.lessThanToken, typeParameters, this.greaterThanToken);
        };

        TypeParameterListSyntax.prototype.withTypeParameter = function (typeParameter) {
            return this.withTypeParameters(TypeScript.Syntax.separatedList([typeParameter]));
        };

        TypeParameterListSyntax.prototype.withGreaterThanToken = function (greaterThanToken) {
            return this.update(this.lessThanToken, this.typeParameters, greaterThanToken);
        };

        TypeParameterListSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return TypeParameterListSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.TypeParameterListSyntax = TypeParameterListSyntax;

    var TypeParameterSyntax = (function (_super) {
        __extends(TypeParameterSyntax, _super);
        function TypeParameterSyntax(identifier, constraint, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.identifier = identifier;
            this.constraint = constraint;
        }
        TypeParameterSyntax.prototype.accept = function (visitor) {
            return visitor.visitTypeParameter(this);
        };

        TypeParameterSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.TypeParameter;
        };

        TypeParameterSyntax.prototype.childCount = function () {
            return 2;
        };

        TypeParameterSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.identifier;
                case 1:
                    return this.constraint;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        TypeParameterSyntax.prototype.update = function (identifier, constraint) {
            if (this.identifier === identifier && this.constraint === constraint) {
                return this;
            }

            return new TypeParameterSyntax(identifier, constraint, this.parsedInStrictMode());
        };

        TypeParameterSyntax.create = function (identifier) {
            return new TypeParameterSyntax(identifier, null, false);
        };

        TypeParameterSyntax.create1 = function (identifier) {
            return new TypeParameterSyntax(identifier, null, false);
        };

        TypeParameterSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        TypeParameterSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        TypeParameterSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(identifier, this.constraint);
        };

        TypeParameterSyntax.prototype.withConstraint = function (constraint) {
            return this.update(this.identifier, constraint);
        };

        TypeParameterSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return TypeParameterSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.TypeParameterSyntax = TypeParameterSyntax;

    var ConstraintSyntax = (function (_super) {
        __extends(ConstraintSyntax, _super);
        function ConstraintSyntax(extendsKeyword, type, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.extendsKeyword = extendsKeyword;
            this.type = type;
        }
        ConstraintSyntax.prototype.accept = function (visitor) {
            return visitor.visitConstraint(this);
        };

        ConstraintSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.Constraint;
        };

        ConstraintSyntax.prototype.childCount = function () {
            return 2;
        };

        ConstraintSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.extendsKeyword;
                case 1:
                    return this.type;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ConstraintSyntax.prototype.update = function (extendsKeyword, type) {
            if (this.extendsKeyword === extendsKeyword && this.type === type) {
                return this;
            }

            return new ConstraintSyntax(extendsKeyword, type, this.parsedInStrictMode());
        };

        ConstraintSyntax.create1 = function (type) {
            return new ConstraintSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.ExtendsKeyword), type, false);
        };

        ConstraintSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ConstraintSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ConstraintSyntax.prototype.withExtendsKeyword = function (extendsKeyword) {
            return this.update(extendsKeyword, this.type);
        };

        ConstraintSyntax.prototype.withType = function (type) {
            return this.update(this.extendsKeyword, type);
        };

        ConstraintSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ConstraintSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ConstraintSyntax = ConstraintSyntax;

    var ElseClauseSyntax = (function (_super) {
        __extends(ElseClauseSyntax, _super);
        function ElseClauseSyntax(elseKeyword, statement, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.elseKeyword = elseKeyword;
            this.statement = statement;
        }
        ElseClauseSyntax.prototype.accept = function (visitor) {
            return visitor.visitElseClause(this);
        };

        ElseClauseSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ElseClause;
        };

        ElseClauseSyntax.prototype.childCount = function () {
            return 2;
        };

        ElseClauseSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.elseKeyword;
                case 1:
                    return this.statement;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ElseClauseSyntax.prototype.update = function (elseKeyword, statement) {
            if (this.elseKeyword === elseKeyword && this.statement === statement) {
                return this;
            }

            return new ElseClauseSyntax(elseKeyword, statement, this.parsedInStrictMode());
        };

        ElseClauseSyntax.create1 = function (statement) {
            return new ElseClauseSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.ElseKeyword), statement, false);
        };

        ElseClauseSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ElseClauseSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ElseClauseSyntax.prototype.withElseKeyword = function (elseKeyword) {
            return this.update(elseKeyword, this.statement);
        };

        ElseClauseSyntax.prototype.withStatement = function (statement) {
            return this.update(this.elseKeyword, statement);
        };

        ElseClauseSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.statement.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ElseClauseSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ElseClauseSyntax = ElseClauseSyntax;

    var IfStatementSyntax = (function (_super) {
        __extends(IfStatementSyntax, _super);
        function IfStatementSyntax(ifKeyword, openParenToken, condition, closeParenToken, statement, elseClause, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.ifKeyword = ifKeyword;
            this.openParenToken = openParenToken;
            this.condition = condition;
            this.closeParenToken = closeParenToken;
            this.statement = statement;
            this.elseClause = elseClause;
        }
        IfStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitIfStatement(this);
        };

        IfStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.IfStatement;
        };

        IfStatementSyntax.prototype.childCount = function () {
            return 6;
        };

        IfStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.ifKeyword;
                case 1:
                    return this.openParenToken;
                case 2:
                    return this.condition;
                case 3:
                    return this.closeParenToken;
                case 4:
                    return this.statement;
                case 5:
                    return this.elseClause;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        IfStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        IfStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        IfStatementSyntax.prototype.update = function (ifKeyword, openParenToken, condition, closeParenToken, statement, elseClause) {
            if (this.ifKeyword === ifKeyword && this.openParenToken === openParenToken && this.condition === condition && this.closeParenToken === closeParenToken && this.statement === statement && this.elseClause === elseClause) {
                return this;
            }

            return new IfStatementSyntax(ifKeyword, openParenToken, condition, closeParenToken, statement, elseClause, this.parsedInStrictMode());
        };

        IfStatementSyntax.create = function (ifKeyword, openParenToken, condition, closeParenToken, statement) {
            return new IfStatementSyntax(ifKeyword, openParenToken, condition, closeParenToken, statement, null, false);
        };

        IfStatementSyntax.create1 = function (condition, statement) {
            return new IfStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.IfKeyword), TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), condition, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), statement, null, false);
        };

        IfStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        IfStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        IfStatementSyntax.prototype.withIfKeyword = function (ifKeyword) {
            return this.update(ifKeyword, this.openParenToken, this.condition, this.closeParenToken, this.statement, this.elseClause);
        };

        IfStatementSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(this.ifKeyword, openParenToken, this.condition, this.closeParenToken, this.statement, this.elseClause);
        };

        IfStatementSyntax.prototype.withCondition = function (condition) {
            return this.update(this.ifKeyword, this.openParenToken, condition, this.closeParenToken, this.statement, this.elseClause);
        };

        IfStatementSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.ifKeyword, this.openParenToken, this.condition, closeParenToken, this.statement, this.elseClause);
        };

        IfStatementSyntax.prototype.withStatement = function (statement) {
            return this.update(this.ifKeyword, this.openParenToken, this.condition, this.closeParenToken, statement, this.elseClause);
        };

        IfStatementSyntax.prototype.withElseClause = function (elseClause) {
            return this.update(this.ifKeyword, this.openParenToken, this.condition, this.closeParenToken, this.statement, elseClause);
        };

        IfStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.condition.isTypeScriptSpecific()) {
                return true;
            }
            if (this.statement.isTypeScriptSpecific()) {
                return true;
            }
            if (this.elseClause !== null && this.elseClause.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return IfStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.IfStatementSyntax = IfStatementSyntax;

    var ExpressionStatementSyntax = (function (_super) {
        __extends(ExpressionStatementSyntax, _super);
        function ExpressionStatementSyntax(expression, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.expression = expression;
            this.semicolonToken = semicolonToken;
        }
        ExpressionStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitExpressionStatement(this);
        };

        ExpressionStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ExpressionStatement;
        };

        ExpressionStatementSyntax.prototype.childCount = function () {
            return 2;
        };

        ExpressionStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.expression;
                case 1:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ExpressionStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        ExpressionStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        ExpressionStatementSyntax.prototype.update = function (expression, semicolonToken) {
            if (this.expression === expression && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ExpressionStatementSyntax(expression, semicolonToken, this.parsedInStrictMode());
        };

        ExpressionStatementSyntax.create1 = function (expression) {
            return new ExpressionStatementSyntax(expression, TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), false);
        };

        ExpressionStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ExpressionStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ExpressionStatementSyntax.prototype.withExpression = function (expression) {
            return this.update(expression, this.semicolonToken);
        };

        ExpressionStatementSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.expression, semicolonToken);
        };

        ExpressionStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ExpressionStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ExpressionStatementSyntax = ExpressionStatementSyntax;

    var ConstructorDeclarationSyntax = (function (_super) {
        __extends(ConstructorDeclarationSyntax, _super);
        function ConstructorDeclarationSyntax(constructorKeyword, parameterList, block, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.constructorKeyword = constructorKeyword;
            this.parameterList = parameterList;
            this.block = block;
            this.semicolonToken = semicolonToken;
        }
        ConstructorDeclarationSyntax.prototype.accept = function (visitor) {
            return visitor.visitConstructorDeclaration(this);
        };

        ConstructorDeclarationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ConstructorDeclaration;
        };

        ConstructorDeclarationSyntax.prototype.childCount = function () {
            return 4;
        };

        ConstructorDeclarationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.constructorKeyword;
                case 1:
                    return this.parameterList;
                case 2:
                    return this.block;
                case 3:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ConstructorDeclarationSyntax.prototype.isClassElement = function () {
            return true;
        };

        ConstructorDeclarationSyntax.prototype.update = function (constructorKeyword, parameterList, block, semicolonToken) {
            if (this.constructorKeyword === constructorKeyword && this.parameterList === parameterList && this.block === block && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ConstructorDeclarationSyntax(constructorKeyword, parameterList, block, semicolonToken, this.parsedInStrictMode());
        };

        ConstructorDeclarationSyntax.create = function (constructorKeyword, parameterList) {
            return new ConstructorDeclarationSyntax(constructorKeyword, parameterList, null, null, false);
        };

        ConstructorDeclarationSyntax.create1 = function () {
            return new ConstructorDeclarationSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.ConstructorKeyword), ParameterListSyntax.create1(), null, null, false);
        };

        ConstructorDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ConstructorDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ConstructorDeclarationSyntax.prototype.withConstructorKeyword = function (constructorKeyword) {
            return this.update(constructorKeyword, this.parameterList, this.block, this.semicolonToken);
        };

        ConstructorDeclarationSyntax.prototype.withParameterList = function (parameterList) {
            return this.update(this.constructorKeyword, parameterList, this.block, this.semicolonToken);
        };

        ConstructorDeclarationSyntax.prototype.withBlock = function (block) {
            return this.update(this.constructorKeyword, this.parameterList, block, this.semicolonToken);
        };

        ConstructorDeclarationSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.constructorKeyword, this.parameterList, this.block, semicolonToken);
        };

        ConstructorDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return ConstructorDeclarationSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ConstructorDeclarationSyntax = ConstructorDeclarationSyntax;

    var MemberFunctionDeclarationSyntax = (function (_super) {
        __extends(MemberFunctionDeclarationSyntax, _super);
        function MemberFunctionDeclarationSyntax(modifiers, propertyName, callSignature, block, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.modifiers = modifiers;
            this.propertyName = propertyName;
            this.callSignature = callSignature;
            this.block = block;
            this.semicolonToken = semicolonToken;
        }
        MemberFunctionDeclarationSyntax.prototype.accept = function (visitor) {
            return visitor.visitMemberFunctionDeclaration(this);
        };

        MemberFunctionDeclarationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.MemberFunctionDeclaration;
        };

        MemberFunctionDeclarationSyntax.prototype.childCount = function () {
            return 5;
        };

        MemberFunctionDeclarationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.modifiers;
                case 1:
                    return this.propertyName;
                case 2:
                    return this.callSignature;
                case 3:
                    return this.block;
                case 4:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        MemberFunctionDeclarationSyntax.prototype.isMemberDeclaration = function () {
            return true;
        };

        MemberFunctionDeclarationSyntax.prototype.isClassElement = function () {
            return true;
        };

        MemberFunctionDeclarationSyntax.prototype.update = function (modifiers, propertyName, callSignature, block, semicolonToken) {
            if (this.modifiers === modifiers && this.propertyName === propertyName && this.callSignature === callSignature && this.block === block && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new MemberFunctionDeclarationSyntax(modifiers, propertyName, callSignature, block, semicolonToken, this.parsedInStrictMode());
        };

        MemberFunctionDeclarationSyntax.create = function (propertyName, callSignature) {
            return new MemberFunctionDeclarationSyntax(TypeScript.Syntax.emptyList, propertyName, callSignature, null, null, false);
        };

        MemberFunctionDeclarationSyntax.create1 = function (propertyName) {
            return new MemberFunctionDeclarationSyntax(TypeScript.Syntax.emptyList, propertyName, CallSignatureSyntax.create1(), null, null, false);
        };

        MemberFunctionDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        MemberFunctionDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        MemberFunctionDeclarationSyntax.prototype.withModifiers = function (modifiers) {
            return this.update(modifiers, this.propertyName, this.callSignature, this.block, this.semicolonToken);
        };

        MemberFunctionDeclarationSyntax.prototype.withModifier = function (modifier) {
            return this.withModifiers(TypeScript.Syntax.list([modifier]));
        };

        MemberFunctionDeclarationSyntax.prototype.withPropertyName = function (propertyName) {
            return this.update(this.modifiers, propertyName, this.callSignature, this.block, this.semicolonToken);
        };

        MemberFunctionDeclarationSyntax.prototype.withCallSignature = function (callSignature) {
            return this.update(this.modifiers, this.propertyName, callSignature, this.block, this.semicolonToken);
        };

        MemberFunctionDeclarationSyntax.prototype.withBlock = function (block) {
            return this.update(this.modifiers, this.propertyName, this.callSignature, block, this.semicolonToken);
        };

        MemberFunctionDeclarationSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.modifiers, this.propertyName, this.callSignature, this.block, semicolonToken);
        };

        MemberFunctionDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return MemberFunctionDeclarationSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.MemberFunctionDeclarationSyntax = MemberFunctionDeclarationSyntax;

    var MemberAccessorDeclarationSyntax = (function (_super) {
        __extends(MemberAccessorDeclarationSyntax, _super);
        function MemberAccessorDeclarationSyntax(modifiers, propertyName, parameterList, block, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.modifiers = modifiers;
            this.propertyName = propertyName;
            this.parameterList = parameterList;
            this.block = block;
        }
        MemberAccessorDeclarationSyntax.prototype.isMemberDeclaration = function () {
            return true;
        };

        MemberAccessorDeclarationSyntax.prototype.isClassElement = function () {
            return true;
        };

        MemberAccessorDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        MemberAccessorDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        MemberAccessorDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return MemberAccessorDeclarationSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.MemberAccessorDeclarationSyntax = MemberAccessorDeclarationSyntax;

    var GetMemberAccessorDeclarationSyntax = (function (_super) {
        __extends(GetMemberAccessorDeclarationSyntax, _super);
        function GetMemberAccessorDeclarationSyntax(modifiers, getKeyword, propertyName, parameterList, typeAnnotation, block, parsedInStrictMode) {
            _super.call(this, modifiers, propertyName, parameterList, block, parsedInStrictMode);
            this.getKeyword = getKeyword;
            this.typeAnnotation = typeAnnotation;
        }
        GetMemberAccessorDeclarationSyntax.prototype.accept = function (visitor) {
            return visitor.visitGetMemberAccessorDeclaration(this);
        };

        GetMemberAccessorDeclarationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.GetMemberAccessorDeclaration;
        };

        GetMemberAccessorDeclarationSyntax.prototype.childCount = function () {
            return 6;
        };

        GetMemberAccessorDeclarationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.modifiers;
                case 1:
                    return this.getKeyword;
                case 2:
                    return this.propertyName;
                case 3:
                    return this.parameterList;
                case 4:
                    return this.typeAnnotation;
                case 5:
                    return this.block;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        GetMemberAccessorDeclarationSyntax.prototype.update = function (modifiers, getKeyword, propertyName, parameterList, typeAnnotation, block) {
            if (this.modifiers === modifiers && this.getKeyword === getKeyword && this.propertyName === propertyName && this.parameterList === parameterList && this.typeAnnotation === typeAnnotation && this.block === block) {
                return this;
            }

            return new GetMemberAccessorDeclarationSyntax(modifiers, getKeyword, propertyName, parameterList, typeAnnotation, block, this.parsedInStrictMode());
        };

        GetMemberAccessorDeclarationSyntax.create = function (getKeyword, propertyName, parameterList, block) {
            return new GetMemberAccessorDeclarationSyntax(TypeScript.Syntax.emptyList, getKeyword, propertyName, parameterList, null, block, false);
        };

        GetMemberAccessorDeclarationSyntax.create1 = function (propertyName) {
            return new GetMemberAccessorDeclarationSyntax(TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.GetKeyword), propertyName, ParameterListSyntax.create1(), null, BlockSyntax.create1(), false);
        };

        GetMemberAccessorDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        GetMemberAccessorDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        GetMemberAccessorDeclarationSyntax.prototype.withModifiers = function (modifiers) {
            return this.update(modifiers, this.getKeyword, this.propertyName, this.parameterList, this.typeAnnotation, this.block);
        };

        GetMemberAccessorDeclarationSyntax.prototype.withModifier = function (modifier) {
            return this.withModifiers(TypeScript.Syntax.list([modifier]));
        };

        GetMemberAccessorDeclarationSyntax.prototype.withGetKeyword = function (getKeyword) {
            return this.update(this.modifiers, getKeyword, this.propertyName, this.parameterList, this.typeAnnotation, this.block);
        };

        GetMemberAccessorDeclarationSyntax.prototype.withPropertyName = function (propertyName) {
            return this.update(this.modifiers, this.getKeyword, propertyName, this.parameterList, this.typeAnnotation, this.block);
        };

        GetMemberAccessorDeclarationSyntax.prototype.withParameterList = function (parameterList) {
            return this.update(this.modifiers, this.getKeyword, this.propertyName, parameterList, this.typeAnnotation, this.block);
        };

        GetMemberAccessorDeclarationSyntax.prototype.withTypeAnnotation = function (typeAnnotation) {
            return this.update(this.modifiers, this.getKeyword, this.propertyName, this.parameterList, typeAnnotation, this.block);
        };

        GetMemberAccessorDeclarationSyntax.prototype.withBlock = function (block) {
            return this.update(this.modifiers, this.getKeyword, this.propertyName, this.parameterList, this.typeAnnotation, block);
        };

        GetMemberAccessorDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return GetMemberAccessorDeclarationSyntax;
    })(MemberAccessorDeclarationSyntax);
    TypeScript.GetMemberAccessorDeclarationSyntax = GetMemberAccessorDeclarationSyntax;

    var SetMemberAccessorDeclarationSyntax = (function (_super) {
        __extends(SetMemberAccessorDeclarationSyntax, _super);
        function SetMemberAccessorDeclarationSyntax(modifiers, setKeyword, propertyName, parameterList, block, parsedInStrictMode) {
            _super.call(this, modifiers, propertyName, parameterList, block, parsedInStrictMode);
            this.setKeyword = setKeyword;
        }
        SetMemberAccessorDeclarationSyntax.prototype.accept = function (visitor) {
            return visitor.visitSetMemberAccessorDeclaration(this);
        };

        SetMemberAccessorDeclarationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.SetMemberAccessorDeclaration;
        };

        SetMemberAccessorDeclarationSyntax.prototype.childCount = function () {
            return 5;
        };

        SetMemberAccessorDeclarationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.modifiers;
                case 1:
                    return this.setKeyword;
                case 2:
                    return this.propertyName;
                case 3:
                    return this.parameterList;
                case 4:
                    return this.block;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        SetMemberAccessorDeclarationSyntax.prototype.update = function (modifiers, setKeyword, propertyName, parameterList, block) {
            if (this.modifiers === modifiers && this.setKeyword === setKeyword && this.propertyName === propertyName && this.parameterList === parameterList && this.block === block) {
                return this;
            }

            return new SetMemberAccessorDeclarationSyntax(modifiers, setKeyword, propertyName, parameterList, block, this.parsedInStrictMode());
        };

        SetMemberAccessorDeclarationSyntax.create = function (setKeyword, propertyName, parameterList, block) {
            return new SetMemberAccessorDeclarationSyntax(TypeScript.Syntax.emptyList, setKeyword, propertyName, parameterList, block, false);
        };

        SetMemberAccessorDeclarationSyntax.create1 = function (propertyName) {
            return new SetMemberAccessorDeclarationSyntax(TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.SetKeyword), propertyName, ParameterListSyntax.create1(), BlockSyntax.create1(), false);
        };

        SetMemberAccessorDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        SetMemberAccessorDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        SetMemberAccessorDeclarationSyntax.prototype.withModifiers = function (modifiers) {
            return this.update(modifiers, this.setKeyword, this.propertyName, this.parameterList, this.block);
        };

        SetMemberAccessorDeclarationSyntax.prototype.withModifier = function (modifier) {
            return this.withModifiers(TypeScript.Syntax.list([modifier]));
        };

        SetMemberAccessorDeclarationSyntax.prototype.withSetKeyword = function (setKeyword) {
            return this.update(this.modifiers, setKeyword, this.propertyName, this.parameterList, this.block);
        };

        SetMemberAccessorDeclarationSyntax.prototype.withPropertyName = function (propertyName) {
            return this.update(this.modifiers, this.setKeyword, propertyName, this.parameterList, this.block);
        };

        SetMemberAccessorDeclarationSyntax.prototype.withParameterList = function (parameterList) {
            return this.update(this.modifiers, this.setKeyword, this.propertyName, parameterList, this.block);
        };

        SetMemberAccessorDeclarationSyntax.prototype.withBlock = function (block) {
            return this.update(this.modifiers, this.setKeyword, this.propertyName, this.parameterList, block);
        };

        SetMemberAccessorDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return SetMemberAccessorDeclarationSyntax;
    })(MemberAccessorDeclarationSyntax);
    TypeScript.SetMemberAccessorDeclarationSyntax = SetMemberAccessorDeclarationSyntax;

    var MemberVariableDeclarationSyntax = (function (_super) {
        __extends(MemberVariableDeclarationSyntax, _super);
        function MemberVariableDeclarationSyntax(modifiers, variableDeclarator, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.modifiers = modifiers;
            this.variableDeclarator = variableDeclarator;
            this.semicolonToken = semicolonToken;
        }
        MemberVariableDeclarationSyntax.prototype.accept = function (visitor) {
            return visitor.visitMemberVariableDeclaration(this);
        };

        MemberVariableDeclarationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.MemberVariableDeclaration;
        };

        MemberVariableDeclarationSyntax.prototype.childCount = function () {
            return 3;
        };

        MemberVariableDeclarationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.modifiers;
                case 1:
                    return this.variableDeclarator;
                case 2:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        MemberVariableDeclarationSyntax.prototype.isMemberDeclaration = function () {
            return true;
        };

        MemberVariableDeclarationSyntax.prototype.isClassElement = function () {
            return true;
        };

        MemberVariableDeclarationSyntax.prototype.update = function (modifiers, variableDeclarator, semicolonToken) {
            if (this.modifiers === modifiers && this.variableDeclarator === variableDeclarator && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new MemberVariableDeclarationSyntax(modifiers, variableDeclarator, semicolonToken, this.parsedInStrictMode());
        };

        MemberVariableDeclarationSyntax.create = function (variableDeclarator, semicolonToken) {
            return new MemberVariableDeclarationSyntax(TypeScript.Syntax.emptyList, variableDeclarator, semicolonToken, false);
        };

        MemberVariableDeclarationSyntax.create1 = function (variableDeclarator) {
            return new MemberVariableDeclarationSyntax(TypeScript.Syntax.emptyList, variableDeclarator, TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), false);
        };

        MemberVariableDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        MemberVariableDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        MemberVariableDeclarationSyntax.prototype.withModifiers = function (modifiers) {
            return this.update(modifiers, this.variableDeclarator, this.semicolonToken);
        };

        MemberVariableDeclarationSyntax.prototype.withModifier = function (modifier) {
            return this.withModifiers(TypeScript.Syntax.list([modifier]));
        };

        MemberVariableDeclarationSyntax.prototype.withVariableDeclarator = function (variableDeclarator) {
            return this.update(this.modifiers, variableDeclarator, this.semicolonToken);
        };

        MemberVariableDeclarationSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.modifiers, this.variableDeclarator, semicolonToken);
        };

        MemberVariableDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return MemberVariableDeclarationSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.MemberVariableDeclarationSyntax = MemberVariableDeclarationSyntax;

    var ThrowStatementSyntax = (function (_super) {
        __extends(ThrowStatementSyntax, _super);
        function ThrowStatementSyntax(throwKeyword, expression, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.throwKeyword = throwKeyword;
            this.expression = expression;
            this.semicolonToken = semicolonToken;
        }
        ThrowStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitThrowStatement(this);
        };

        ThrowStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ThrowStatement;
        };

        ThrowStatementSyntax.prototype.childCount = function () {
            return 3;
        };

        ThrowStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.throwKeyword;
                case 1:
                    return this.expression;
                case 2:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ThrowStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        ThrowStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        ThrowStatementSyntax.prototype.update = function (throwKeyword, expression, semicolonToken) {
            if (this.throwKeyword === throwKeyword && this.expression === expression && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ThrowStatementSyntax(throwKeyword, expression, semicolonToken, this.parsedInStrictMode());
        };

        ThrowStatementSyntax.create1 = function (expression) {
            return new ThrowStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.ThrowKeyword), expression, TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), false);
        };

        ThrowStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ThrowStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ThrowStatementSyntax.prototype.withThrowKeyword = function (throwKeyword) {
            return this.update(throwKeyword, this.expression, this.semicolonToken);
        };

        ThrowStatementSyntax.prototype.withExpression = function (expression) {
            return this.update(this.throwKeyword, expression, this.semicolonToken);
        };

        ThrowStatementSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.throwKeyword, this.expression, semicolonToken);
        };

        ThrowStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ThrowStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ThrowStatementSyntax = ThrowStatementSyntax;

    var ReturnStatementSyntax = (function (_super) {
        __extends(ReturnStatementSyntax, _super);
        function ReturnStatementSyntax(returnKeyword, expression, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.returnKeyword = returnKeyword;
            this.expression = expression;
            this.semicolonToken = semicolonToken;
        }
        ReturnStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitReturnStatement(this);
        };

        ReturnStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ReturnStatement;
        };

        ReturnStatementSyntax.prototype.childCount = function () {
            return 3;
        };

        ReturnStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.returnKeyword;
                case 1:
                    return this.expression;
                case 2:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ReturnStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        ReturnStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        ReturnStatementSyntax.prototype.update = function (returnKeyword, expression, semicolonToken) {
            if (this.returnKeyword === returnKeyword && this.expression === expression && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ReturnStatementSyntax(returnKeyword, expression, semicolonToken, this.parsedInStrictMode());
        };

        ReturnStatementSyntax.create = function (returnKeyword, semicolonToken) {
            return new ReturnStatementSyntax(returnKeyword, null, semicolonToken, false);
        };

        ReturnStatementSyntax.create1 = function () {
            return new ReturnStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.ReturnKeyword), null, TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), false);
        };

        ReturnStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ReturnStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ReturnStatementSyntax.prototype.withReturnKeyword = function (returnKeyword) {
            return this.update(returnKeyword, this.expression, this.semicolonToken);
        };

        ReturnStatementSyntax.prototype.withExpression = function (expression) {
            return this.update(this.returnKeyword, expression, this.semicolonToken);
        };

        ReturnStatementSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.returnKeyword, this.expression, semicolonToken);
        };

        ReturnStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression !== null && this.expression.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ReturnStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ReturnStatementSyntax = ReturnStatementSyntax;

    var ObjectCreationExpressionSyntax = (function (_super) {
        __extends(ObjectCreationExpressionSyntax, _super);
        function ObjectCreationExpressionSyntax(newKeyword, expression, argumentList, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.newKeyword = newKeyword;
            this.expression = expression;
            this.argumentList = argumentList;
        }
        ObjectCreationExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitObjectCreationExpression(this);
        };

        ObjectCreationExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ObjectCreationExpression;
        };

        ObjectCreationExpressionSyntax.prototype.childCount = function () {
            return 3;
        };

        ObjectCreationExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.newKeyword;
                case 1:
                    return this.expression;
                case 2:
                    return this.argumentList;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ObjectCreationExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        ObjectCreationExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        ObjectCreationExpressionSyntax.prototype.update = function (newKeyword, expression, argumentList) {
            if (this.newKeyword === newKeyword && this.expression === expression && this.argumentList === argumentList) {
                return this;
            }

            return new ObjectCreationExpressionSyntax(newKeyword, expression, argumentList, this.parsedInStrictMode());
        };

        ObjectCreationExpressionSyntax.create = function (newKeyword, expression) {
            return new ObjectCreationExpressionSyntax(newKeyword, expression, null, false);
        };

        ObjectCreationExpressionSyntax.create1 = function (expression) {
            return new ObjectCreationExpressionSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.NewKeyword), expression, null, false);
        };

        ObjectCreationExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ObjectCreationExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ObjectCreationExpressionSyntax.prototype.withNewKeyword = function (newKeyword) {
            return this.update(newKeyword, this.expression, this.argumentList);
        };

        ObjectCreationExpressionSyntax.prototype.withExpression = function (expression) {
            return this.update(this.newKeyword, expression, this.argumentList);
        };

        ObjectCreationExpressionSyntax.prototype.withArgumentList = function (argumentList) {
            return this.update(this.newKeyword, this.expression, argumentList);
        };

        ObjectCreationExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            if (this.argumentList !== null && this.argumentList.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ObjectCreationExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ObjectCreationExpressionSyntax = ObjectCreationExpressionSyntax;

    var SwitchStatementSyntax = (function (_super) {
        __extends(SwitchStatementSyntax, _super);
        function SwitchStatementSyntax(switchKeyword, openParenToken, expression, closeParenToken, openBraceToken, switchClauses, closeBraceToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.switchKeyword = switchKeyword;
            this.openParenToken = openParenToken;
            this.expression = expression;
            this.closeParenToken = closeParenToken;
            this.openBraceToken = openBraceToken;
            this.switchClauses = switchClauses;
            this.closeBraceToken = closeBraceToken;
        }
        SwitchStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitSwitchStatement(this);
        };

        SwitchStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.SwitchStatement;
        };

        SwitchStatementSyntax.prototype.childCount = function () {
            return 7;
        };

        SwitchStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.switchKeyword;
                case 1:
                    return this.openParenToken;
                case 2:
                    return this.expression;
                case 3:
                    return this.closeParenToken;
                case 4:
                    return this.openBraceToken;
                case 5:
                    return this.switchClauses;
                case 6:
                    return this.closeBraceToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        SwitchStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        SwitchStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        SwitchStatementSyntax.prototype.update = function (switchKeyword, openParenToken, expression, closeParenToken, openBraceToken, switchClauses, closeBraceToken) {
            if (this.switchKeyword === switchKeyword && this.openParenToken === openParenToken && this.expression === expression && this.closeParenToken === closeParenToken && this.openBraceToken === openBraceToken && this.switchClauses === switchClauses && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new SwitchStatementSyntax(switchKeyword, openParenToken, expression, closeParenToken, openBraceToken, switchClauses, closeBraceToken, this.parsedInStrictMode());
        };

        SwitchStatementSyntax.create = function (switchKeyword, openParenToken, expression, closeParenToken, openBraceToken, closeBraceToken) {
            return new SwitchStatementSyntax(switchKeyword, openParenToken, expression, closeParenToken, openBraceToken, TypeScript.Syntax.emptyList, closeBraceToken, false);
        };

        SwitchStatementSyntax.create1 = function (expression) {
            return new SwitchStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.SwitchKeyword), TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), expression, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenBraceToken), TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseBraceToken), false);
        };

        SwitchStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        SwitchStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        SwitchStatementSyntax.prototype.withSwitchKeyword = function (switchKeyword) {
            return this.update(switchKeyword, this.openParenToken, this.expression, this.closeParenToken, this.openBraceToken, this.switchClauses, this.closeBraceToken);
        };

        SwitchStatementSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(this.switchKeyword, openParenToken, this.expression, this.closeParenToken, this.openBraceToken, this.switchClauses, this.closeBraceToken);
        };

        SwitchStatementSyntax.prototype.withExpression = function (expression) {
            return this.update(this.switchKeyword, this.openParenToken, expression, this.closeParenToken, this.openBraceToken, this.switchClauses, this.closeBraceToken);
        };

        SwitchStatementSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.switchKeyword, this.openParenToken, this.expression, closeParenToken, this.openBraceToken, this.switchClauses, this.closeBraceToken);
        };

        SwitchStatementSyntax.prototype.withOpenBraceToken = function (openBraceToken) {
            return this.update(this.switchKeyword, this.openParenToken, this.expression, this.closeParenToken, openBraceToken, this.switchClauses, this.closeBraceToken);
        };

        SwitchStatementSyntax.prototype.withSwitchClauses = function (switchClauses) {
            return this.update(this.switchKeyword, this.openParenToken, this.expression, this.closeParenToken, this.openBraceToken, switchClauses, this.closeBraceToken);
        };

        SwitchStatementSyntax.prototype.withSwitchClause = function (switchClause) {
            return this.withSwitchClauses(TypeScript.Syntax.list([switchClause]));
        };

        SwitchStatementSyntax.prototype.withCloseBraceToken = function (closeBraceToken) {
            return this.update(this.switchKeyword, this.openParenToken, this.expression, this.closeParenToken, this.openBraceToken, this.switchClauses, closeBraceToken);
        };

        SwitchStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            if (this.switchClauses.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return SwitchStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.SwitchStatementSyntax = SwitchStatementSyntax;

    var SwitchClauseSyntax = (function (_super) {
        __extends(SwitchClauseSyntax, _super);
        function SwitchClauseSyntax(colonToken, statements, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.colonToken = colonToken;
            this.statements = statements;
        }
        SwitchClauseSyntax.prototype.isSwitchClause = function () {
            return true;
        };

        SwitchClauseSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        SwitchClauseSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        SwitchClauseSyntax.prototype.isTypeScriptSpecific = function () {
            return false;
        };
        return SwitchClauseSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.SwitchClauseSyntax = SwitchClauseSyntax;

    var CaseSwitchClauseSyntax = (function (_super) {
        __extends(CaseSwitchClauseSyntax, _super);
        function CaseSwitchClauseSyntax(caseKeyword, expression, colonToken, statements, parsedInStrictMode) {
            _super.call(this, colonToken, statements, parsedInStrictMode);
            this.caseKeyword = caseKeyword;
            this.expression = expression;
        }
        CaseSwitchClauseSyntax.prototype.accept = function (visitor) {
            return visitor.visitCaseSwitchClause(this);
        };

        CaseSwitchClauseSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.CaseSwitchClause;
        };

        CaseSwitchClauseSyntax.prototype.childCount = function () {
            return 4;
        };

        CaseSwitchClauseSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.caseKeyword;
                case 1:
                    return this.expression;
                case 2:
                    return this.colonToken;
                case 3:
                    return this.statements;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        CaseSwitchClauseSyntax.prototype.update = function (caseKeyword, expression, colonToken, statements) {
            if (this.caseKeyword === caseKeyword && this.expression === expression && this.colonToken === colonToken && this.statements === statements) {
                return this;
            }

            return new CaseSwitchClauseSyntax(caseKeyword, expression, colonToken, statements, this.parsedInStrictMode());
        };

        CaseSwitchClauseSyntax.create = function (caseKeyword, expression, colonToken) {
            return new CaseSwitchClauseSyntax(caseKeyword, expression, colonToken, TypeScript.Syntax.emptyList, false);
        };

        CaseSwitchClauseSyntax.create1 = function (expression) {
            return new CaseSwitchClauseSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.CaseKeyword), expression, TypeScript.Syntax.token(TypeScript.SyntaxKind.ColonToken), TypeScript.Syntax.emptyList, false);
        };

        CaseSwitchClauseSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        CaseSwitchClauseSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        CaseSwitchClauseSyntax.prototype.withCaseKeyword = function (caseKeyword) {
            return this.update(caseKeyword, this.expression, this.colonToken, this.statements);
        };

        CaseSwitchClauseSyntax.prototype.withExpression = function (expression) {
            return this.update(this.caseKeyword, expression, this.colonToken, this.statements);
        };

        CaseSwitchClauseSyntax.prototype.withColonToken = function (colonToken) {
            return this.update(this.caseKeyword, this.expression, colonToken, this.statements);
        };

        CaseSwitchClauseSyntax.prototype.withStatements = function (statements) {
            return this.update(this.caseKeyword, this.expression, this.colonToken, statements);
        };

        CaseSwitchClauseSyntax.prototype.withStatement = function (statement) {
            return this.withStatements(TypeScript.Syntax.list([statement]));
        };

        CaseSwitchClauseSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            if (this.statements.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return CaseSwitchClauseSyntax;
    })(SwitchClauseSyntax);
    TypeScript.CaseSwitchClauseSyntax = CaseSwitchClauseSyntax;

    var DefaultSwitchClauseSyntax = (function (_super) {
        __extends(DefaultSwitchClauseSyntax, _super);
        function DefaultSwitchClauseSyntax(defaultKeyword, colonToken, statements, parsedInStrictMode) {
            _super.call(this, colonToken, statements, parsedInStrictMode);
            this.defaultKeyword = defaultKeyword;
        }
        DefaultSwitchClauseSyntax.prototype.accept = function (visitor) {
            return visitor.visitDefaultSwitchClause(this);
        };

        DefaultSwitchClauseSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.DefaultSwitchClause;
        };

        DefaultSwitchClauseSyntax.prototype.childCount = function () {
            return 3;
        };

        DefaultSwitchClauseSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.defaultKeyword;
                case 1:
                    return this.colonToken;
                case 2:
                    return this.statements;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        DefaultSwitchClauseSyntax.prototype.update = function (defaultKeyword, colonToken, statements) {
            if (this.defaultKeyword === defaultKeyword && this.colonToken === colonToken && this.statements === statements) {
                return this;
            }

            return new DefaultSwitchClauseSyntax(defaultKeyword, colonToken, statements, this.parsedInStrictMode());
        };

        DefaultSwitchClauseSyntax.create = function (defaultKeyword, colonToken) {
            return new DefaultSwitchClauseSyntax(defaultKeyword, colonToken, TypeScript.Syntax.emptyList, false);
        };

        DefaultSwitchClauseSyntax.create1 = function () {
            return new DefaultSwitchClauseSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.DefaultKeyword), TypeScript.Syntax.token(TypeScript.SyntaxKind.ColonToken), TypeScript.Syntax.emptyList, false);
        };

        DefaultSwitchClauseSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        DefaultSwitchClauseSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        DefaultSwitchClauseSyntax.prototype.withDefaultKeyword = function (defaultKeyword) {
            return this.update(defaultKeyword, this.colonToken, this.statements);
        };

        DefaultSwitchClauseSyntax.prototype.withColonToken = function (colonToken) {
            return this.update(this.defaultKeyword, colonToken, this.statements);
        };

        DefaultSwitchClauseSyntax.prototype.withStatements = function (statements) {
            return this.update(this.defaultKeyword, this.colonToken, statements);
        };

        DefaultSwitchClauseSyntax.prototype.withStatement = function (statement) {
            return this.withStatements(TypeScript.Syntax.list([statement]));
        };

        DefaultSwitchClauseSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.statements.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return DefaultSwitchClauseSyntax;
    })(SwitchClauseSyntax);
    TypeScript.DefaultSwitchClauseSyntax = DefaultSwitchClauseSyntax;

    var BreakStatementSyntax = (function (_super) {
        __extends(BreakStatementSyntax, _super);
        function BreakStatementSyntax(breakKeyword, identifier, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.breakKeyword = breakKeyword;
            this.identifier = identifier;
            this.semicolonToken = semicolonToken;
        }
        BreakStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitBreakStatement(this);
        };

        BreakStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.BreakStatement;
        };

        BreakStatementSyntax.prototype.childCount = function () {
            return 3;
        };

        BreakStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.breakKeyword;
                case 1:
                    return this.identifier;
                case 2:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        BreakStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        BreakStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        BreakStatementSyntax.prototype.update = function (breakKeyword, identifier, semicolonToken) {
            if (this.breakKeyword === breakKeyword && this.identifier === identifier && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new BreakStatementSyntax(breakKeyword, identifier, semicolonToken, this.parsedInStrictMode());
        };

        BreakStatementSyntax.create = function (breakKeyword, semicolonToken) {
            return new BreakStatementSyntax(breakKeyword, null, semicolonToken, false);
        };

        BreakStatementSyntax.create1 = function () {
            return new BreakStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.BreakKeyword), null, TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), false);
        };

        BreakStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        BreakStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        BreakStatementSyntax.prototype.withBreakKeyword = function (breakKeyword) {
            return this.update(breakKeyword, this.identifier, this.semicolonToken);
        };

        BreakStatementSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(this.breakKeyword, identifier, this.semicolonToken);
        };

        BreakStatementSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.breakKeyword, this.identifier, semicolonToken);
        };

        BreakStatementSyntax.prototype.isTypeScriptSpecific = function () {
            return false;
        };
        return BreakStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.BreakStatementSyntax = BreakStatementSyntax;

    var ContinueStatementSyntax = (function (_super) {
        __extends(ContinueStatementSyntax, _super);
        function ContinueStatementSyntax(continueKeyword, identifier, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.continueKeyword = continueKeyword;
            this.identifier = identifier;
            this.semicolonToken = semicolonToken;
        }
        ContinueStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitContinueStatement(this);
        };

        ContinueStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ContinueStatement;
        };

        ContinueStatementSyntax.prototype.childCount = function () {
            return 3;
        };

        ContinueStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.continueKeyword;
                case 1:
                    return this.identifier;
                case 2:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ContinueStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        ContinueStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        ContinueStatementSyntax.prototype.update = function (continueKeyword, identifier, semicolonToken) {
            if (this.continueKeyword === continueKeyword && this.identifier === identifier && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ContinueStatementSyntax(continueKeyword, identifier, semicolonToken, this.parsedInStrictMode());
        };

        ContinueStatementSyntax.create = function (continueKeyword, semicolonToken) {
            return new ContinueStatementSyntax(continueKeyword, null, semicolonToken, false);
        };

        ContinueStatementSyntax.create1 = function () {
            return new ContinueStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.ContinueKeyword), null, TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), false);
        };

        ContinueStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ContinueStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ContinueStatementSyntax.prototype.withContinueKeyword = function (continueKeyword) {
            return this.update(continueKeyword, this.identifier, this.semicolonToken);
        };

        ContinueStatementSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(this.continueKeyword, identifier, this.semicolonToken);
        };

        ContinueStatementSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.continueKeyword, this.identifier, semicolonToken);
        };

        ContinueStatementSyntax.prototype.isTypeScriptSpecific = function () {
            return false;
        };
        return ContinueStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ContinueStatementSyntax = ContinueStatementSyntax;

    var IterationStatementSyntax = (function (_super) {
        __extends(IterationStatementSyntax, _super);
        function IterationStatementSyntax(openParenToken, closeParenToken, statement, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.openParenToken = openParenToken;
            this.closeParenToken = closeParenToken;
            this.statement = statement;
        }
        IterationStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        IterationStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        IterationStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        IterationStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        IterationStatementSyntax.prototype.isTypeScriptSpecific = function () {
            return false;
        };
        return IterationStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.IterationStatementSyntax = IterationStatementSyntax;

    var BaseForStatementSyntax = (function (_super) {
        __extends(BaseForStatementSyntax, _super);
        function BaseForStatementSyntax(forKeyword, openParenToken, variableDeclaration, closeParenToken, statement, parsedInStrictMode) {
            _super.call(this, openParenToken, closeParenToken, statement, parsedInStrictMode);
            this.forKeyword = forKeyword;
            this.variableDeclaration = variableDeclaration;
        }
        BaseForStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        BaseForStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        BaseForStatementSyntax.prototype.isTypeScriptSpecific = function () {
            return false;
        };
        return BaseForStatementSyntax;
    })(IterationStatementSyntax);
    TypeScript.BaseForStatementSyntax = BaseForStatementSyntax;

    var ForStatementSyntax = (function (_super) {
        __extends(ForStatementSyntax, _super);
        function ForStatementSyntax(forKeyword, openParenToken, variableDeclaration, initializer, firstSemicolonToken, condition, secondSemicolonToken, incrementor, closeParenToken, statement, parsedInStrictMode) {
            _super.call(this, forKeyword, openParenToken, variableDeclaration, closeParenToken, statement, parsedInStrictMode);
            this.initializer = initializer;
            this.firstSemicolonToken = firstSemicolonToken;
            this.condition = condition;
            this.secondSemicolonToken = secondSemicolonToken;
            this.incrementor = incrementor;
        }
        ForStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitForStatement(this);
        };

        ForStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ForStatement;
        };

        ForStatementSyntax.prototype.childCount = function () {
            return 10;
        };

        ForStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.forKeyword;
                case 1:
                    return this.openParenToken;
                case 2:
                    return this.variableDeclaration;
                case 3:
                    return this.initializer;
                case 4:
                    return this.firstSemicolonToken;
                case 5:
                    return this.condition;
                case 6:
                    return this.secondSemicolonToken;
                case 7:
                    return this.incrementor;
                case 8:
                    return this.closeParenToken;
                case 9:
                    return this.statement;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ForStatementSyntax.prototype.update = function (forKeyword, openParenToken, variableDeclaration, initializer, firstSemicolonToken, condition, secondSemicolonToken, incrementor, closeParenToken, statement) {
            if (this.forKeyword === forKeyword && this.openParenToken === openParenToken && this.variableDeclaration === variableDeclaration && this.initializer === initializer && this.firstSemicolonToken === firstSemicolonToken && this.condition === condition && this.secondSemicolonToken === secondSemicolonToken && this.incrementor === incrementor && this.closeParenToken === closeParenToken && this.statement === statement) {
                return this;
            }

            return new ForStatementSyntax(forKeyword, openParenToken, variableDeclaration, initializer, firstSemicolonToken, condition, secondSemicolonToken, incrementor, closeParenToken, statement, this.parsedInStrictMode());
        };

        ForStatementSyntax.create = function (forKeyword, openParenToken, firstSemicolonToken, secondSemicolonToken, closeParenToken, statement) {
            return new ForStatementSyntax(forKeyword, openParenToken, null, null, firstSemicolonToken, null, secondSemicolonToken, null, closeParenToken, statement, false);
        };

        ForStatementSyntax.create1 = function (statement) {
            return new ForStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.ForKeyword), TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), null, null, TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), null, TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), null, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), statement, false);
        };

        ForStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ForStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ForStatementSyntax.prototype.withForKeyword = function (forKeyword) {
            return this.update(forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        };

        ForStatementSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(this.forKeyword, openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        };

        ForStatementSyntax.prototype.withVariableDeclaration = function (variableDeclaration) {
            return this.update(this.forKeyword, this.openParenToken, variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        };

        ForStatementSyntax.prototype.withInitializer = function (initializer) {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        };

        ForStatementSyntax.prototype.withFirstSemicolonToken = function (firstSemicolonToken) {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        };

        ForStatementSyntax.prototype.withCondition = function (condition) {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        };

        ForStatementSyntax.prototype.withSecondSemicolonToken = function (secondSemicolonToken) {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        };

        ForStatementSyntax.prototype.withIncrementor = function (incrementor) {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, incrementor, this.closeParenToken, this.statement);
        };

        ForStatementSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, closeParenToken, this.statement);
        };

        ForStatementSyntax.prototype.withStatement = function (statement) {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, statement);
        };

        ForStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.variableDeclaration !== null && this.variableDeclaration.isTypeScriptSpecific()) {
                return true;
            }
            if (this.initializer !== null && this.initializer.isTypeScriptSpecific()) {
                return true;
            }
            if (this.condition !== null && this.condition.isTypeScriptSpecific()) {
                return true;
            }
            if (this.incrementor !== null && this.incrementor.isTypeScriptSpecific()) {
                return true;
            }
            if (this.statement.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ForStatementSyntax;
    })(BaseForStatementSyntax);
    TypeScript.ForStatementSyntax = ForStatementSyntax;

    var ForInStatementSyntax = (function (_super) {
        __extends(ForInStatementSyntax, _super);
        function ForInStatementSyntax(forKeyword, openParenToken, variableDeclaration, left, inKeyword, expression, closeParenToken, statement, parsedInStrictMode) {
            _super.call(this, forKeyword, openParenToken, variableDeclaration, closeParenToken, statement, parsedInStrictMode);
            this.left = left;
            this.inKeyword = inKeyword;
            this.expression = expression;
        }
        ForInStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitForInStatement(this);
        };

        ForInStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ForInStatement;
        };

        ForInStatementSyntax.prototype.childCount = function () {
            return 8;
        };

        ForInStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.forKeyword;
                case 1:
                    return this.openParenToken;
                case 2:
                    return this.variableDeclaration;
                case 3:
                    return this.left;
                case 4:
                    return this.inKeyword;
                case 5:
                    return this.expression;
                case 6:
                    return this.closeParenToken;
                case 7:
                    return this.statement;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ForInStatementSyntax.prototype.update = function (forKeyword, openParenToken, variableDeclaration, left, inKeyword, expression, closeParenToken, statement) {
            if (this.forKeyword === forKeyword && this.openParenToken === openParenToken && this.variableDeclaration === variableDeclaration && this.left === left && this.inKeyword === inKeyword && this.expression === expression && this.closeParenToken === closeParenToken && this.statement === statement) {
                return this;
            }

            return new ForInStatementSyntax(forKeyword, openParenToken, variableDeclaration, left, inKeyword, expression, closeParenToken, statement, this.parsedInStrictMode());
        };

        ForInStatementSyntax.create = function (forKeyword, openParenToken, inKeyword, expression, closeParenToken, statement) {
            return new ForInStatementSyntax(forKeyword, openParenToken, null, null, inKeyword, expression, closeParenToken, statement, false);
        };

        ForInStatementSyntax.create1 = function (expression, statement) {
            return new ForInStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.ForKeyword), TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), null, null, TypeScript.Syntax.token(TypeScript.SyntaxKind.InKeyword), expression, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), statement, false);
        };

        ForInStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ForInStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ForInStatementSyntax.prototype.withForKeyword = function (forKeyword) {
            return this.update(forKeyword, this.openParenToken, this.variableDeclaration, this.left, this.inKeyword, this.expression, this.closeParenToken, this.statement);
        };

        ForInStatementSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(this.forKeyword, openParenToken, this.variableDeclaration, this.left, this.inKeyword, this.expression, this.closeParenToken, this.statement);
        };

        ForInStatementSyntax.prototype.withVariableDeclaration = function (variableDeclaration) {
            return this.update(this.forKeyword, this.openParenToken, variableDeclaration, this.left, this.inKeyword, this.expression, this.closeParenToken, this.statement);
        };

        ForInStatementSyntax.prototype.withLeft = function (left) {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, left, this.inKeyword, this.expression, this.closeParenToken, this.statement);
        };

        ForInStatementSyntax.prototype.withInKeyword = function (inKeyword) {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.left, inKeyword, this.expression, this.closeParenToken, this.statement);
        };

        ForInStatementSyntax.prototype.withExpression = function (expression) {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.left, this.inKeyword, expression, this.closeParenToken, this.statement);
        };

        ForInStatementSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.left, this.inKeyword, this.expression, closeParenToken, this.statement);
        };

        ForInStatementSyntax.prototype.withStatement = function (statement) {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.left, this.inKeyword, this.expression, this.closeParenToken, statement);
        };

        ForInStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.variableDeclaration !== null && this.variableDeclaration.isTypeScriptSpecific()) {
                return true;
            }
            if (this.left !== null && this.left.isTypeScriptSpecific()) {
                return true;
            }
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            if (this.statement.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ForInStatementSyntax;
    })(BaseForStatementSyntax);
    TypeScript.ForInStatementSyntax = ForInStatementSyntax;

    var WhileStatementSyntax = (function (_super) {
        __extends(WhileStatementSyntax, _super);
        function WhileStatementSyntax(whileKeyword, openParenToken, condition, closeParenToken, statement, parsedInStrictMode) {
            _super.call(this, openParenToken, closeParenToken, statement, parsedInStrictMode);
            this.whileKeyword = whileKeyword;
            this.condition = condition;
        }
        WhileStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitWhileStatement(this);
        };

        WhileStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.WhileStatement;
        };

        WhileStatementSyntax.prototype.childCount = function () {
            return 5;
        };

        WhileStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.whileKeyword;
                case 1:
                    return this.openParenToken;
                case 2:
                    return this.condition;
                case 3:
                    return this.closeParenToken;
                case 4:
                    return this.statement;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        WhileStatementSyntax.prototype.update = function (whileKeyword, openParenToken, condition, closeParenToken, statement) {
            if (this.whileKeyword === whileKeyword && this.openParenToken === openParenToken && this.condition === condition && this.closeParenToken === closeParenToken && this.statement === statement) {
                return this;
            }

            return new WhileStatementSyntax(whileKeyword, openParenToken, condition, closeParenToken, statement, this.parsedInStrictMode());
        };

        WhileStatementSyntax.create1 = function (condition, statement) {
            return new WhileStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.WhileKeyword), TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), condition, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), statement, false);
        };

        WhileStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        WhileStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        WhileStatementSyntax.prototype.withWhileKeyword = function (whileKeyword) {
            return this.update(whileKeyword, this.openParenToken, this.condition, this.closeParenToken, this.statement);
        };

        WhileStatementSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(this.whileKeyword, openParenToken, this.condition, this.closeParenToken, this.statement);
        };

        WhileStatementSyntax.prototype.withCondition = function (condition) {
            return this.update(this.whileKeyword, this.openParenToken, condition, this.closeParenToken, this.statement);
        };

        WhileStatementSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.whileKeyword, this.openParenToken, this.condition, closeParenToken, this.statement);
        };

        WhileStatementSyntax.prototype.withStatement = function (statement) {
            return this.update(this.whileKeyword, this.openParenToken, this.condition, this.closeParenToken, statement);
        };

        WhileStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.condition.isTypeScriptSpecific()) {
                return true;
            }
            if (this.statement.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return WhileStatementSyntax;
    })(IterationStatementSyntax);
    TypeScript.WhileStatementSyntax = WhileStatementSyntax;

    var WithStatementSyntax = (function (_super) {
        __extends(WithStatementSyntax, _super);
        function WithStatementSyntax(withKeyword, openParenToken, condition, closeParenToken, statement, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.withKeyword = withKeyword;
            this.openParenToken = openParenToken;
            this.condition = condition;
            this.closeParenToken = closeParenToken;
            this.statement = statement;
        }
        WithStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitWithStatement(this);
        };

        WithStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.WithStatement;
        };

        WithStatementSyntax.prototype.childCount = function () {
            return 5;
        };

        WithStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.withKeyword;
                case 1:
                    return this.openParenToken;
                case 2:
                    return this.condition;
                case 3:
                    return this.closeParenToken;
                case 4:
                    return this.statement;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        WithStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        WithStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        WithStatementSyntax.prototype.update = function (withKeyword, openParenToken, condition, closeParenToken, statement) {
            if (this.withKeyword === withKeyword && this.openParenToken === openParenToken && this.condition === condition && this.closeParenToken === closeParenToken && this.statement === statement) {
                return this;
            }

            return new WithStatementSyntax(withKeyword, openParenToken, condition, closeParenToken, statement, this.parsedInStrictMode());
        };

        WithStatementSyntax.create1 = function (condition, statement) {
            return new WithStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.WithKeyword), TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), condition, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), statement, false);
        };

        WithStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        WithStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        WithStatementSyntax.prototype.withWithKeyword = function (withKeyword) {
            return this.update(withKeyword, this.openParenToken, this.condition, this.closeParenToken, this.statement);
        };

        WithStatementSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(this.withKeyword, openParenToken, this.condition, this.closeParenToken, this.statement);
        };

        WithStatementSyntax.prototype.withCondition = function (condition) {
            return this.update(this.withKeyword, this.openParenToken, condition, this.closeParenToken, this.statement);
        };

        WithStatementSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.withKeyword, this.openParenToken, this.condition, closeParenToken, this.statement);
        };

        WithStatementSyntax.prototype.withStatement = function (statement) {
            return this.update(this.withKeyword, this.openParenToken, this.condition, this.closeParenToken, statement);
        };

        WithStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.condition.isTypeScriptSpecific()) {
                return true;
            }
            if (this.statement.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return WithStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.WithStatementSyntax = WithStatementSyntax;

    var EnumDeclarationSyntax = (function (_super) {
        __extends(EnumDeclarationSyntax, _super);
        function EnumDeclarationSyntax(modifiers, enumKeyword, identifier, openBraceToken, enumElements, closeBraceToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.modifiers = modifiers;
            this.enumKeyword = enumKeyword;
            this.identifier = identifier;
            this.openBraceToken = openBraceToken;
            this.enumElements = enumElements;
            this.closeBraceToken = closeBraceToken;
        }
        EnumDeclarationSyntax.prototype.accept = function (visitor) {
            return visitor.visitEnumDeclaration(this);
        };

        EnumDeclarationSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.EnumDeclaration;
        };

        EnumDeclarationSyntax.prototype.childCount = function () {
            return 6;
        };

        EnumDeclarationSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.modifiers;
                case 1:
                    return this.enumKeyword;
                case 2:
                    return this.identifier;
                case 3:
                    return this.openBraceToken;
                case 4:
                    return this.enumElements;
                case 5:
                    return this.closeBraceToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        EnumDeclarationSyntax.prototype.isModuleElement = function () {
            return true;
        };

        EnumDeclarationSyntax.prototype.update = function (modifiers, enumKeyword, identifier, openBraceToken, enumElements, closeBraceToken) {
            if (this.modifiers === modifiers && this.enumKeyword === enumKeyword && this.identifier === identifier && this.openBraceToken === openBraceToken && this.enumElements === enumElements && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new EnumDeclarationSyntax(modifiers, enumKeyword, identifier, openBraceToken, enumElements, closeBraceToken, this.parsedInStrictMode());
        };

        EnumDeclarationSyntax.create = function (enumKeyword, identifier, openBraceToken, closeBraceToken) {
            return new EnumDeclarationSyntax(TypeScript.Syntax.emptyList, enumKeyword, identifier, openBraceToken, TypeScript.Syntax.emptySeparatedList, closeBraceToken, false);
        };

        EnumDeclarationSyntax.create1 = function (identifier) {
            return new EnumDeclarationSyntax(TypeScript.Syntax.emptyList, TypeScript.Syntax.token(TypeScript.SyntaxKind.EnumKeyword), identifier, TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenBraceToken), TypeScript.Syntax.emptySeparatedList, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseBraceToken), false);
        };

        EnumDeclarationSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        EnumDeclarationSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        EnumDeclarationSyntax.prototype.withModifiers = function (modifiers) {
            return this.update(modifiers, this.enumKeyword, this.identifier, this.openBraceToken, this.enumElements, this.closeBraceToken);
        };

        EnumDeclarationSyntax.prototype.withModifier = function (modifier) {
            return this.withModifiers(TypeScript.Syntax.list([modifier]));
        };

        EnumDeclarationSyntax.prototype.withEnumKeyword = function (enumKeyword) {
            return this.update(this.modifiers, enumKeyword, this.identifier, this.openBraceToken, this.enumElements, this.closeBraceToken);
        };

        EnumDeclarationSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(this.modifiers, this.enumKeyword, identifier, this.openBraceToken, this.enumElements, this.closeBraceToken);
        };

        EnumDeclarationSyntax.prototype.withOpenBraceToken = function (openBraceToken) {
            return this.update(this.modifiers, this.enumKeyword, this.identifier, openBraceToken, this.enumElements, this.closeBraceToken);
        };

        EnumDeclarationSyntax.prototype.withEnumElements = function (enumElements) {
            return this.update(this.modifiers, this.enumKeyword, this.identifier, this.openBraceToken, enumElements, this.closeBraceToken);
        };

        EnumDeclarationSyntax.prototype.withEnumElement = function (enumElement) {
            return this.withEnumElements(TypeScript.Syntax.separatedList([enumElement]));
        };

        EnumDeclarationSyntax.prototype.withCloseBraceToken = function (closeBraceToken) {
            return this.update(this.modifiers, this.enumKeyword, this.identifier, this.openBraceToken, this.enumElements, closeBraceToken);
        };

        EnumDeclarationSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return EnumDeclarationSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.EnumDeclarationSyntax = EnumDeclarationSyntax;

    var EnumElementSyntax = (function (_super) {
        __extends(EnumElementSyntax, _super);
        function EnumElementSyntax(propertyName, equalsValueClause, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.propertyName = propertyName;
            this.equalsValueClause = equalsValueClause;
        }
        EnumElementSyntax.prototype.accept = function (visitor) {
            return visitor.visitEnumElement(this);
        };

        EnumElementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.EnumElement;
        };

        EnumElementSyntax.prototype.childCount = function () {
            return 2;
        };

        EnumElementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.propertyName;
                case 1:
                    return this.equalsValueClause;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        EnumElementSyntax.prototype.update = function (propertyName, equalsValueClause) {
            if (this.propertyName === propertyName && this.equalsValueClause === equalsValueClause) {
                return this;
            }

            return new EnumElementSyntax(propertyName, equalsValueClause, this.parsedInStrictMode());
        };

        EnumElementSyntax.create = function (propertyName) {
            return new EnumElementSyntax(propertyName, null, false);
        };

        EnumElementSyntax.create1 = function (propertyName) {
            return new EnumElementSyntax(propertyName, null, false);
        };

        EnumElementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        EnumElementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        EnumElementSyntax.prototype.withPropertyName = function (propertyName) {
            return this.update(propertyName, this.equalsValueClause);
        };

        EnumElementSyntax.prototype.withEqualsValueClause = function (equalsValueClause) {
            return this.update(this.propertyName, equalsValueClause);
        };

        EnumElementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.equalsValueClause !== null && this.equalsValueClause.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return EnumElementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.EnumElementSyntax = EnumElementSyntax;

    var CastExpressionSyntax = (function (_super) {
        __extends(CastExpressionSyntax, _super);
        function CastExpressionSyntax(lessThanToken, type, greaterThanToken, expression, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.lessThanToken = lessThanToken;
            this.type = type;
            this.greaterThanToken = greaterThanToken;
            this.expression = expression;
        }
        CastExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitCastExpression(this);
        };

        CastExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.CastExpression;
        };

        CastExpressionSyntax.prototype.childCount = function () {
            return 4;
        };

        CastExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.lessThanToken;
                case 1:
                    return this.type;
                case 2:
                    return this.greaterThanToken;
                case 3:
                    return this.expression;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        CastExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        CastExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        CastExpressionSyntax.prototype.update = function (lessThanToken, type, greaterThanToken, expression) {
            if (this.lessThanToken === lessThanToken && this.type === type && this.greaterThanToken === greaterThanToken && this.expression === expression) {
                return this;
            }

            return new CastExpressionSyntax(lessThanToken, type, greaterThanToken, expression, this.parsedInStrictMode());
        };

        CastExpressionSyntax.create1 = function (type, expression) {
            return new CastExpressionSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.LessThanToken), type, TypeScript.Syntax.token(TypeScript.SyntaxKind.GreaterThanToken), expression, false);
        };

        CastExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        CastExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        CastExpressionSyntax.prototype.withLessThanToken = function (lessThanToken) {
            return this.update(lessThanToken, this.type, this.greaterThanToken, this.expression);
        };

        CastExpressionSyntax.prototype.withType = function (type) {
            return this.update(this.lessThanToken, type, this.greaterThanToken, this.expression);
        };

        CastExpressionSyntax.prototype.withGreaterThanToken = function (greaterThanToken) {
            return this.update(this.lessThanToken, this.type, greaterThanToken, this.expression);
        };

        CastExpressionSyntax.prototype.withExpression = function (expression) {
            return this.update(this.lessThanToken, this.type, this.greaterThanToken, expression);
        };

        CastExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            return true;
        };
        return CastExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.CastExpressionSyntax = CastExpressionSyntax;

    var ObjectLiteralExpressionSyntax = (function (_super) {
        __extends(ObjectLiteralExpressionSyntax, _super);
        function ObjectLiteralExpressionSyntax(openBraceToken, propertyAssignments, closeBraceToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.openBraceToken = openBraceToken;
            this.propertyAssignments = propertyAssignments;
            this.closeBraceToken = closeBraceToken;
        }
        ObjectLiteralExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitObjectLiteralExpression(this);
        };

        ObjectLiteralExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.ObjectLiteralExpression;
        };

        ObjectLiteralExpressionSyntax.prototype.childCount = function () {
            return 3;
        };

        ObjectLiteralExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.openBraceToken;
                case 1:
                    return this.propertyAssignments;
                case 2:
                    return this.closeBraceToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        ObjectLiteralExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        ObjectLiteralExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        ObjectLiteralExpressionSyntax.prototype.update = function (openBraceToken, propertyAssignments, closeBraceToken) {
            if (this.openBraceToken === openBraceToken && this.propertyAssignments === propertyAssignments && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new ObjectLiteralExpressionSyntax(openBraceToken, propertyAssignments, closeBraceToken, this.parsedInStrictMode());
        };

        ObjectLiteralExpressionSyntax.create = function (openBraceToken, closeBraceToken) {
            return new ObjectLiteralExpressionSyntax(openBraceToken, TypeScript.Syntax.emptySeparatedList, closeBraceToken, false);
        };

        ObjectLiteralExpressionSyntax.create1 = function () {
            return new ObjectLiteralExpressionSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenBraceToken), TypeScript.Syntax.emptySeparatedList, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseBraceToken), false);
        };

        ObjectLiteralExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        ObjectLiteralExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        ObjectLiteralExpressionSyntax.prototype.withOpenBraceToken = function (openBraceToken) {
            return this.update(openBraceToken, this.propertyAssignments, this.closeBraceToken);
        };

        ObjectLiteralExpressionSyntax.prototype.withPropertyAssignments = function (propertyAssignments) {
            return this.update(this.openBraceToken, propertyAssignments, this.closeBraceToken);
        };

        ObjectLiteralExpressionSyntax.prototype.withPropertyAssignment = function (propertyAssignment) {
            return this.withPropertyAssignments(TypeScript.Syntax.separatedList([propertyAssignment]));
        };

        ObjectLiteralExpressionSyntax.prototype.withCloseBraceToken = function (closeBraceToken) {
            return this.update(this.openBraceToken, this.propertyAssignments, closeBraceToken);
        };

        ObjectLiteralExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.propertyAssignments.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return ObjectLiteralExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.ObjectLiteralExpressionSyntax = ObjectLiteralExpressionSyntax;

    var PropertyAssignmentSyntax = (function (_super) {
        __extends(PropertyAssignmentSyntax, _super);
        function PropertyAssignmentSyntax(propertyName, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.propertyName = propertyName;
        }
        PropertyAssignmentSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        PropertyAssignmentSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        PropertyAssignmentSyntax.prototype.isTypeScriptSpecific = function () {
            return false;
        };
        return PropertyAssignmentSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.PropertyAssignmentSyntax = PropertyAssignmentSyntax;

    var SimplePropertyAssignmentSyntax = (function (_super) {
        __extends(SimplePropertyAssignmentSyntax, _super);
        function SimplePropertyAssignmentSyntax(propertyName, colonToken, expression, parsedInStrictMode) {
            _super.call(this, propertyName, parsedInStrictMode);
            this.colonToken = colonToken;
            this.expression = expression;
        }
        SimplePropertyAssignmentSyntax.prototype.accept = function (visitor) {
            return visitor.visitSimplePropertyAssignment(this);
        };

        SimplePropertyAssignmentSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.SimplePropertyAssignment;
        };

        SimplePropertyAssignmentSyntax.prototype.childCount = function () {
            return 3;
        };

        SimplePropertyAssignmentSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.propertyName;
                case 1:
                    return this.colonToken;
                case 2:
                    return this.expression;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        SimplePropertyAssignmentSyntax.prototype.update = function (propertyName, colonToken, expression) {
            if (this.propertyName === propertyName && this.colonToken === colonToken && this.expression === expression) {
                return this;
            }

            return new SimplePropertyAssignmentSyntax(propertyName, colonToken, expression, this.parsedInStrictMode());
        };

        SimplePropertyAssignmentSyntax.create1 = function (propertyName, expression) {
            return new SimplePropertyAssignmentSyntax(propertyName, TypeScript.Syntax.token(TypeScript.SyntaxKind.ColonToken), expression, false);
        };

        SimplePropertyAssignmentSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        SimplePropertyAssignmentSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        SimplePropertyAssignmentSyntax.prototype.withPropertyName = function (propertyName) {
            return this.update(propertyName, this.colonToken, this.expression);
        };

        SimplePropertyAssignmentSyntax.prototype.withColonToken = function (colonToken) {
            return this.update(this.propertyName, colonToken, this.expression);
        };

        SimplePropertyAssignmentSyntax.prototype.withExpression = function (expression) {
            return this.update(this.propertyName, this.colonToken, expression);
        };

        SimplePropertyAssignmentSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return SimplePropertyAssignmentSyntax;
    })(PropertyAssignmentSyntax);
    TypeScript.SimplePropertyAssignmentSyntax = SimplePropertyAssignmentSyntax;

    var FunctionPropertyAssignmentSyntax = (function (_super) {
        __extends(FunctionPropertyAssignmentSyntax, _super);
        function FunctionPropertyAssignmentSyntax(propertyName, callSignature, block, parsedInStrictMode) {
            _super.call(this, propertyName, parsedInStrictMode);
            this.callSignature = callSignature;
            this.block = block;
        }
        FunctionPropertyAssignmentSyntax.prototype.accept = function (visitor) {
            return visitor.visitFunctionPropertyAssignment(this);
        };

        FunctionPropertyAssignmentSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.FunctionPropertyAssignment;
        };

        FunctionPropertyAssignmentSyntax.prototype.childCount = function () {
            return 3;
        };

        FunctionPropertyAssignmentSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.propertyName;
                case 1:
                    return this.callSignature;
                case 2:
                    return this.block;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        FunctionPropertyAssignmentSyntax.prototype.update = function (propertyName, callSignature, block) {
            if (this.propertyName === propertyName && this.callSignature === callSignature && this.block === block) {
                return this;
            }

            return new FunctionPropertyAssignmentSyntax(propertyName, callSignature, block, this.parsedInStrictMode());
        };

        FunctionPropertyAssignmentSyntax.create1 = function (propertyName) {
            return new FunctionPropertyAssignmentSyntax(propertyName, CallSignatureSyntax.create1(), BlockSyntax.create1(), false);
        };

        FunctionPropertyAssignmentSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        FunctionPropertyAssignmentSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        FunctionPropertyAssignmentSyntax.prototype.withPropertyName = function (propertyName) {
            return this.update(propertyName, this.callSignature, this.block);
        };

        FunctionPropertyAssignmentSyntax.prototype.withCallSignature = function (callSignature) {
            return this.update(this.propertyName, callSignature, this.block);
        };

        FunctionPropertyAssignmentSyntax.prototype.withBlock = function (block) {
            return this.update(this.propertyName, this.callSignature, block);
        };

        FunctionPropertyAssignmentSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.callSignature.isTypeScriptSpecific()) {
                return true;
            }
            if (this.block.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return FunctionPropertyAssignmentSyntax;
    })(PropertyAssignmentSyntax);
    TypeScript.FunctionPropertyAssignmentSyntax = FunctionPropertyAssignmentSyntax;

    var AccessorPropertyAssignmentSyntax = (function (_super) {
        __extends(AccessorPropertyAssignmentSyntax, _super);
        function AccessorPropertyAssignmentSyntax(propertyName, openParenToken, closeParenToken, block, parsedInStrictMode) {
            _super.call(this, propertyName, parsedInStrictMode);
            this.openParenToken = openParenToken;
            this.closeParenToken = closeParenToken;
            this.block = block;
        }
        AccessorPropertyAssignmentSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        AccessorPropertyAssignmentSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        AccessorPropertyAssignmentSyntax.prototype.isTypeScriptSpecific = function () {
            return false;
        };
        return AccessorPropertyAssignmentSyntax;
    })(PropertyAssignmentSyntax);
    TypeScript.AccessorPropertyAssignmentSyntax = AccessorPropertyAssignmentSyntax;

    var GetAccessorPropertyAssignmentSyntax = (function (_super) {
        __extends(GetAccessorPropertyAssignmentSyntax, _super);
        function GetAccessorPropertyAssignmentSyntax(getKeyword, propertyName, openParenToken, closeParenToken, typeAnnotation, block, parsedInStrictMode) {
            _super.call(this, propertyName, openParenToken, closeParenToken, block, parsedInStrictMode);
            this.getKeyword = getKeyword;
            this.typeAnnotation = typeAnnotation;
        }
        GetAccessorPropertyAssignmentSyntax.prototype.accept = function (visitor) {
            return visitor.visitGetAccessorPropertyAssignment(this);
        };

        GetAccessorPropertyAssignmentSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.GetAccessorPropertyAssignment;
        };

        GetAccessorPropertyAssignmentSyntax.prototype.childCount = function () {
            return 6;
        };

        GetAccessorPropertyAssignmentSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.getKeyword;
                case 1:
                    return this.propertyName;
                case 2:
                    return this.openParenToken;
                case 3:
                    return this.closeParenToken;
                case 4:
                    return this.typeAnnotation;
                case 5:
                    return this.block;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        GetAccessorPropertyAssignmentSyntax.prototype.update = function (getKeyword, propertyName, openParenToken, closeParenToken, typeAnnotation, block) {
            if (this.getKeyword === getKeyword && this.propertyName === propertyName && this.openParenToken === openParenToken && this.closeParenToken === closeParenToken && this.typeAnnotation === typeAnnotation && this.block === block) {
                return this;
            }

            return new GetAccessorPropertyAssignmentSyntax(getKeyword, propertyName, openParenToken, closeParenToken, typeAnnotation, block, this.parsedInStrictMode());
        };

        GetAccessorPropertyAssignmentSyntax.create = function (getKeyword, propertyName, openParenToken, closeParenToken, block) {
            return new GetAccessorPropertyAssignmentSyntax(getKeyword, propertyName, openParenToken, closeParenToken, null, block, false);
        };

        GetAccessorPropertyAssignmentSyntax.create1 = function (propertyName) {
            return new GetAccessorPropertyAssignmentSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.GetKeyword), propertyName, TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), null, BlockSyntax.create1(), false);
        };

        GetAccessorPropertyAssignmentSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        GetAccessorPropertyAssignmentSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        GetAccessorPropertyAssignmentSyntax.prototype.withGetKeyword = function (getKeyword) {
            return this.update(getKeyword, this.propertyName, this.openParenToken, this.closeParenToken, this.typeAnnotation, this.block);
        };

        GetAccessorPropertyAssignmentSyntax.prototype.withPropertyName = function (propertyName) {
            return this.update(this.getKeyword, propertyName, this.openParenToken, this.closeParenToken, this.typeAnnotation, this.block);
        };

        GetAccessorPropertyAssignmentSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(this.getKeyword, this.propertyName, openParenToken, this.closeParenToken, this.typeAnnotation, this.block);
        };

        GetAccessorPropertyAssignmentSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.getKeyword, this.propertyName, this.openParenToken, closeParenToken, this.typeAnnotation, this.block);
        };

        GetAccessorPropertyAssignmentSyntax.prototype.withTypeAnnotation = function (typeAnnotation) {
            return this.update(this.getKeyword, this.propertyName, this.openParenToken, this.closeParenToken, typeAnnotation, this.block);
        };

        GetAccessorPropertyAssignmentSyntax.prototype.withBlock = function (block) {
            return this.update(this.getKeyword, this.propertyName, this.openParenToken, this.closeParenToken, this.typeAnnotation, block);
        };

        GetAccessorPropertyAssignmentSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.typeAnnotation !== null && this.typeAnnotation.isTypeScriptSpecific()) {
                return true;
            }
            if (this.block.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return GetAccessorPropertyAssignmentSyntax;
    })(AccessorPropertyAssignmentSyntax);
    TypeScript.GetAccessorPropertyAssignmentSyntax = GetAccessorPropertyAssignmentSyntax;

    var SetAccessorPropertyAssignmentSyntax = (function (_super) {
        __extends(SetAccessorPropertyAssignmentSyntax, _super);
        function SetAccessorPropertyAssignmentSyntax(setKeyword, propertyName, openParenToken, parameter, closeParenToken, block, parsedInStrictMode) {
            _super.call(this, propertyName, openParenToken, closeParenToken, block, parsedInStrictMode);
            this.setKeyword = setKeyword;
            this.parameter = parameter;
        }
        SetAccessorPropertyAssignmentSyntax.prototype.accept = function (visitor) {
            return visitor.visitSetAccessorPropertyAssignment(this);
        };

        SetAccessorPropertyAssignmentSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.SetAccessorPropertyAssignment;
        };

        SetAccessorPropertyAssignmentSyntax.prototype.childCount = function () {
            return 6;
        };

        SetAccessorPropertyAssignmentSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.setKeyword;
                case 1:
                    return this.propertyName;
                case 2:
                    return this.openParenToken;
                case 3:
                    return this.parameter;
                case 4:
                    return this.closeParenToken;
                case 5:
                    return this.block;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        SetAccessorPropertyAssignmentSyntax.prototype.update = function (setKeyword, propertyName, openParenToken, parameter, closeParenToken, block) {
            if (this.setKeyword === setKeyword && this.propertyName === propertyName && this.openParenToken === openParenToken && this.parameter === parameter && this.closeParenToken === closeParenToken && this.block === block) {
                return this;
            }

            return new SetAccessorPropertyAssignmentSyntax(setKeyword, propertyName, openParenToken, parameter, closeParenToken, block, this.parsedInStrictMode());
        };

        SetAccessorPropertyAssignmentSyntax.create1 = function (propertyName, parameter) {
            return new SetAccessorPropertyAssignmentSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.SetKeyword), propertyName, TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), parameter, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), BlockSyntax.create1(), false);
        };

        SetAccessorPropertyAssignmentSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        SetAccessorPropertyAssignmentSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        SetAccessorPropertyAssignmentSyntax.prototype.withSetKeyword = function (setKeyword) {
            return this.update(setKeyword, this.propertyName, this.openParenToken, this.parameter, this.closeParenToken, this.block);
        };

        SetAccessorPropertyAssignmentSyntax.prototype.withPropertyName = function (propertyName) {
            return this.update(this.setKeyword, propertyName, this.openParenToken, this.parameter, this.closeParenToken, this.block);
        };

        SetAccessorPropertyAssignmentSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(this.setKeyword, this.propertyName, openParenToken, this.parameter, this.closeParenToken, this.block);
        };

        SetAccessorPropertyAssignmentSyntax.prototype.withParameter = function (parameter) {
            return this.update(this.setKeyword, this.propertyName, this.openParenToken, parameter, this.closeParenToken, this.block);
        };

        SetAccessorPropertyAssignmentSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.setKeyword, this.propertyName, this.openParenToken, this.parameter, closeParenToken, this.block);
        };

        SetAccessorPropertyAssignmentSyntax.prototype.withBlock = function (block) {
            return this.update(this.setKeyword, this.propertyName, this.openParenToken, this.parameter, this.closeParenToken, block);
        };

        SetAccessorPropertyAssignmentSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.parameter.isTypeScriptSpecific()) {
                return true;
            }
            if (this.block.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return SetAccessorPropertyAssignmentSyntax;
    })(AccessorPropertyAssignmentSyntax);
    TypeScript.SetAccessorPropertyAssignmentSyntax = SetAccessorPropertyAssignmentSyntax;

    var FunctionExpressionSyntax = (function (_super) {
        __extends(FunctionExpressionSyntax, _super);
        function FunctionExpressionSyntax(functionKeyword, identifier, callSignature, block, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.functionKeyword = functionKeyword;
            this.identifier = identifier;
            this.callSignature = callSignature;
            this.block = block;
        }
        FunctionExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitFunctionExpression(this);
        };

        FunctionExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.FunctionExpression;
        };

        FunctionExpressionSyntax.prototype.childCount = function () {
            return 4;
        };

        FunctionExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.functionKeyword;
                case 1:
                    return this.identifier;
                case 2:
                    return this.callSignature;
                case 3:
                    return this.block;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        FunctionExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        FunctionExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        FunctionExpressionSyntax.prototype.update = function (functionKeyword, identifier, callSignature, block) {
            if (this.functionKeyword === functionKeyword && this.identifier === identifier && this.callSignature === callSignature && this.block === block) {
                return this;
            }

            return new FunctionExpressionSyntax(functionKeyword, identifier, callSignature, block, this.parsedInStrictMode());
        };

        FunctionExpressionSyntax.create = function (functionKeyword, callSignature, block) {
            return new FunctionExpressionSyntax(functionKeyword, null, callSignature, block, false);
        };

        FunctionExpressionSyntax.create1 = function () {
            return new FunctionExpressionSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.FunctionKeyword), null, CallSignatureSyntax.create1(), BlockSyntax.create1(), false);
        };

        FunctionExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        FunctionExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        FunctionExpressionSyntax.prototype.withFunctionKeyword = function (functionKeyword) {
            return this.update(functionKeyword, this.identifier, this.callSignature, this.block);
        };

        FunctionExpressionSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(this.functionKeyword, identifier, this.callSignature, this.block);
        };

        FunctionExpressionSyntax.prototype.withCallSignature = function (callSignature) {
            return this.update(this.functionKeyword, this.identifier, callSignature, this.block);
        };

        FunctionExpressionSyntax.prototype.withBlock = function (block) {
            return this.update(this.functionKeyword, this.identifier, this.callSignature, block);
        };

        FunctionExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.callSignature.isTypeScriptSpecific()) {
                return true;
            }
            if (this.block.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return FunctionExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.FunctionExpressionSyntax = FunctionExpressionSyntax;

    var EmptyStatementSyntax = (function (_super) {
        __extends(EmptyStatementSyntax, _super);
        function EmptyStatementSyntax(semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.semicolonToken = semicolonToken;
        }
        EmptyStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitEmptyStatement(this);
        };

        EmptyStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.EmptyStatement;
        };

        EmptyStatementSyntax.prototype.childCount = function () {
            return 1;
        };

        EmptyStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        EmptyStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        EmptyStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        EmptyStatementSyntax.prototype.update = function (semicolonToken) {
            if (this.semicolonToken === semicolonToken) {
                return this;
            }

            return new EmptyStatementSyntax(semicolonToken, this.parsedInStrictMode());
        };

        EmptyStatementSyntax.create1 = function () {
            return new EmptyStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), false);
        };

        EmptyStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        EmptyStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        EmptyStatementSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(semicolonToken);
        };

        EmptyStatementSyntax.prototype.isTypeScriptSpecific = function () {
            return false;
        };
        return EmptyStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.EmptyStatementSyntax = EmptyStatementSyntax;

    var TryStatementSyntax = (function (_super) {
        __extends(TryStatementSyntax, _super);
        function TryStatementSyntax(tryKeyword, block, catchClause, finallyClause, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.tryKeyword = tryKeyword;
            this.block = block;
            this.catchClause = catchClause;
            this.finallyClause = finallyClause;
        }
        TryStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitTryStatement(this);
        };

        TryStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.TryStatement;
        };

        TryStatementSyntax.prototype.childCount = function () {
            return 4;
        };

        TryStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.tryKeyword;
                case 1:
                    return this.block;
                case 2:
                    return this.catchClause;
                case 3:
                    return this.finallyClause;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        TryStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        TryStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        TryStatementSyntax.prototype.update = function (tryKeyword, block, catchClause, finallyClause) {
            if (this.tryKeyword === tryKeyword && this.block === block && this.catchClause === catchClause && this.finallyClause === finallyClause) {
                return this;
            }

            return new TryStatementSyntax(tryKeyword, block, catchClause, finallyClause, this.parsedInStrictMode());
        };

        TryStatementSyntax.create = function (tryKeyword, block) {
            return new TryStatementSyntax(tryKeyword, block, null, null, false);
        };

        TryStatementSyntax.create1 = function () {
            return new TryStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.TryKeyword), BlockSyntax.create1(), null, null, false);
        };

        TryStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        TryStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        TryStatementSyntax.prototype.withTryKeyword = function (tryKeyword) {
            return this.update(tryKeyword, this.block, this.catchClause, this.finallyClause);
        };

        TryStatementSyntax.prototype.withBlock = function (block) {
            return this.update(this.tryKeyword, block, this.catchClause, this.finallyClause);
        };

        TryStatementSyntax.prototype.withCatchClause = function (catchClause) {
            return this.update(this.tryKeyword, this.block, catchClause, this.finallyClause);
        };

        TryStatementSyntax.prototype.withFinallyClause = function (finallyClause) {
            return this.update(this.tryKeyword, this.block, this.catchClause, finallyClause);
        };

        TryStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.block.isTypeScriptSpecific()) {
                return true;
            }
            if (this.catchClause !== null && this.catchClause.isTypeScriptSpecific()) {
                return true;
            }
            if (this.finallyClause !== null && this.finallyClause.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return TryStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.TryStatementSyntax = TryStatementSyntax;

    var CatchClauseSyntax = (function (_super) {
        __extends(CatchClauseSyntax, _super);
        function CatchClauseSyntax(catchKeyword, openParenToken, identifier, typeAnnotation, closeParenToken, block, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.catchKeyword = catchKeyword;
            this.openParenToken = openParenToken;
            this.identifier = identifier;
            this.typeAnnotation = typeAnnotation;
            this.closeParenToken = closeParenToken;
            this.block = block;
        }
        CatchClauseSyntax.prototype.accept = function (visitor) {
            return visitor.visitCatchClause(this);
        };

        CatchClauseSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.CatchClause;
        };

        CatchClauseSyntax.prototype.childCount = function () {
            return 6;
        };

        CatchClauseSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.catchKeyword;
                case 1:
                    return this.openParenToken;
                case 2:
                    return this.identifier;
                case 3:
                    return this.typeAnnotation;
                case 4:
                    return this.closeParenToken;
                case 5:
                    return this.block;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        CatchClauseSyntax.prototype.update = function (catchKeyword, openParenToken, identifier, typeAnnotation, closeParenToken, block) {
            if (this.catchKeyword === catchKeyword && this.openParenToken === openParenToken && this.identifier === identifier && this.typeAnnotation === typeAnnotation && this.closeParenToken === closeParenToken && this.block === block) {
                return this;
            }

            return new CatchClauseSyntax(catchKeyword, openParenToken, identifier, typeAnnotation, closeParenToken, block, this.parsedInStrictMode());
        };

        CatchClauseSyntax.create = function (catchKeyword, openParenToken, identifier, closeParenToken, block) {
            return new CatchClauseSyntax(catchKeyword, openParenToken, identifier, null, closeParenToken, block, false);
        };

        CatchClauseSyntax.create1 = function (identifier) {
            return new CatchClauseSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.CatchKeyword), TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), identifier, null, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), BlockSyntax.create1(), false);
        };

        CatchClauseSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        CatchClauseSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        CatchClauseSyntax.prototype.withCatchKeyword = function (catchKeyword) {
            return this.update(catchKeyword, this.openParenToken, this.identifier, this.typeAnnotation, this.closeParenToken, this.block);
        };

        CatchClauseSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(this.catchKeyword, openParenToken, this.identifier, this.typeAnnotation, this.closeParenToken, this.block);
        };

        CatchClauseSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(this.catchKeyword, this.openParenToken, identifier, this.typeAnnotation, this.closeParenToken, this.block);
        };

        CatchClauseSyntax.prototype.withTypeAnnotation = function (typeAnnotation) {
            return this.update(this.catchKeyword, this.openParenToken, this.identifier, typeAnnotation, this.closeParenToken, this.block);
        };

        CatchClauseSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.catchKeyword, this.openParenToken, this.identifier, this.typeAnnotation, closeParenToken, this.block);
        };

        CatchClauseSyntax.prototype.withBlock = function (block) {
            return this.update(this.catchKeyword, this.openParenToken, this.identifier, this.typeAnnotation, this.closeParenToken, block);
        };

        CatchClauseSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.typeAnnotation !== null && this.typeAnnotation.isTypeScriptSpecific()) {
                return true;
            }
            if (this.block.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return CatchClauseSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.CatchClauseSyntax = CatchClauseSyntax;

    var FinallyClauseSyntax = (function (_super) {
        __extends(FinallyClauseSyntax, _super);
        function FinallyClauseSyntax(finallyKeyword, block, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.finallyKeyword = finallyKeyword;
            this.block = block;
        }
        FinallyClauseSyntax.prototype.accept = function (visitor) {
            return visitor.visitFinallyClause(this);
        };

        FinallyClauseSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.FinallyClause;
        };

        FinallyClauseSyntax.prototype.childCount = function () {
            return 2;
        };

        FinallyClauseSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.finallyKeyword;
                case 1:
                    return this.block;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        FinallyClauseSyntax.prototype.update = function (finallyKeyword, block) {
            if (this.finallyKeyword === finallyKeyword && this.block === block) {
                return this;
            }

            return new FinallyClauseSyntax(finallyKeyword, block, this.parsedInStrictMode());
        };

        FinallyClauseSyntax.create1 = function () {
            return new FinallyClauseSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.FinallyKeyword), BlockSyntax.create1(), false);
        };

        FinallyClauseSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        FinallyClauseSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        FinallyClauseSyntax.prototype.withFinallyKeyword = function (finallyKeyword) {
            return this.update(finallyKeyword, this.block);
        };

        FinallyClauseSyntax.prototype.withBlock = function (block) {
            return this.update(this.finallyKeyword, block);
        };

        FinallyClauseSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.block.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return FinallyClauseSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.FinallyClauseSyntax = FinallyClauseSyntax;

    var LabeledStatementSyntax = (function (_super) {
        __extends(LabeledStatementSyntax, _super);
        function LabeledStatementSyntax(identifier, colonToken, statement, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.identifier = identifier;
            this.colonToken = colonToken;
            this.statement = statement;
        }
        LabeledStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitLabeledStatement(this);
        };

        LabeledStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.LabeledStatement;
        };

        LabeledStatementSyntax.prototype.childCount = function () {
            return 3;
        };

        LabeledStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.identifier;
                case 1:
                    return this.colonToken;
                case 2:
                    return this.statement;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        LabeledStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        LabeledStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        LabeledStatementSyntax.prototype.update = function (identifier, colonToken, statement) {
            if (this.identifier === identifier && this.colonToken === colonToken && this.statement === statement) {
                return this;
            }

            return new LabeledStatementSyntax(identifier, colonToken, statement, this.parsedInStrictMode());
        };

        LabeledStatementSyntax.create1 = function (identifier, statement) {
            return new LabeledStatementSyntax(identifier, TypeScript.Syntax.token(TypeScript.SyntaxKind.ColonToken), statement, false);
        };

        LabeledStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        LabeledStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        LabeledStatementSyntax.prototype.withIdentifier = function (identifier) {
            return this.update(identifier, this.colonToken, this.statement);
        };

        LabeledStatementSyntax.prototype.withColonToken = function (colonToken) {
            return this.update(this.identifier, colonToken, this.statement);
        };

        LabeledStatementSyntax.prototype.withStatement = function (statement) {
            return this.update(this.identifier, this.colonToken, statement);
        };

        LabeledStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.statement.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return LabeledStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.LabeledStatementSyntax = LabeledStatementSyntax;

    var DoStatementSyntax = (function (_super) {
        __extends(DoStatementSyntax, _super);
        function DoStatementSyntax(doKeyword, statement, whileKeyword, openParenToken, condition, closeParenToken, semicolonToken, parsedInStrictMode) {
            _super.call(this, openParenToken, closeParenToken, statement, parsedInStrictMode);
            this.doKeyword = doKeyword;
            this.whileKeyword = whileKeyword;
            this.condition = condition;
            this.semicolonToken = semicolonToken;
        }
        DoStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitDoStatement(this);
        };

        DoStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.DoStatement;
        };

        DoStatementSyntax.prototype.childCount = function () {
            return 7;
        };

        DoStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.doKeyword;
                case 1:
                    return this.statement;
                case 2:
                    return this.whileKeyword;
                case 3:
                    return this.openParenToken;
                case 4:
                    return this.condition;
                case 5:
                    return this.closeParenToken;
                case 6:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        DoStatementSyntax.prototype.update = function (doKeyword, statement, whileKeyword, openParenToken, condition, closeParenToken, semicolonToken) {
            if (this.doKeyword === doKeyword && this.statement === statement && this.whileKeyword === whileKeyword && this.openParenToken === openParenToken && this.condition === condition && this.closeParenToken === closeParenToken && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new DoStatementSyntax(doKeyword, statement, whileKeyword, openParenToken, condition, closeParenToken, semicolonToken, this.parsedInStrictMode());
        };

        DoStatementSyntax.create1 = function (statement, condition) {
            return new DoStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.DoKeyword), statement, TypeScript.Syntax.token(TypeScript.SyntaxKind.WhileKeyword), TypeScript.Syntax.token(TypeScript.SyntaxKind.OpenParenToken), condition, TypeScript.Syntax.token(TypeScript.SyntaxKind.CloseParenToken), TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), false);
        };

        DoStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        DoStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        DoStatementSyntax.prototype.withDoKeyword = function (doKeyword) {
            return this.update(doKeyword, this.statement, this.whileKeyword, this.openParenToken, this.condition, this.closeParenToken, this.semicolonToken);
        };

        DoStatementSyntax.prototype.withStatement = function (statement) {
            return this.update(this.doKeyword, statement, this.whileKeyword, this.openParenToken, this.condition, this.closeParenToken, this.semicolonToken);
        };

        DoStatementSyntax.prototype.withWhileKeyword = function (whileKeyword) {
            return this.update(this.doKeyword, this.statement, whileKeyword, this.openParenToken, this.condition, this.closeParenToken, this.semicolonToken);
        };

        DoStatementSyntax.prototype.withOpenParenToken = function (openParenToken) {
            return this.update(this.doKeyword, this.statement, this.whileKeyword, openParenToken, this.condition, this.closeParenToken, this.semicolonToken);
        };

        DoStatementSyntax.prototype.withCondition = function (condition) {
            return this.update(this.doKeyword, this.statement, this.whileKeyword, this.openParenToken, condition, this.closeParenToken, this.semicolonToken);
        };

        DoStatementSyntax.prototype.withCloseParenToken = function (closeParenToken) {
            return this.update(this.doKeyword, this.statement, this.whileKeyword, this.openParenToken, this.condition, closeParenToken, this.semicolonToken);
        };

        DoStatementSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.doKeyword, this.statement, this.whileKeyword, this.openParenToken, this.condition, this.closeParenToken, semicolonToken);
        };

        DoStatementSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.statement.isTypeScriptSpecific()) {
                return true;
            }
            if (this.condition.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return DoStatementSyntax;
    })(IterationStatementSyntax);
    TypeScript.DoStatementSyntax = DoStatementSyntax;

    var TypeOfExpressionSyntax = (function (_super) {
        __extends(TypeOfExpressionSyntax, _super);
        function TypeOfExpressionSyntax(typeOfKeyword, expression, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.typeOfKeyword = typeOfKeyword;
            this.expression = expression;
        }
        TypeOfExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitTypeOfExpression(this);
        };

        TypeOfExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.TypeOfExpression;
        };

        TypeOfExpressionSyntax.prototype.childCount = function () {
            return 2;
        };

        TypeOfExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.typeOfKeyword;
                case 1:
                    return this.expression;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        TypeOfExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        TypeOfExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        TypeOfExpressionSyntax.prototype.update = function (typeOfKeyword, expression) {
            if (this.typeOfKeyword === typeOfKeyword && this.expression === expression) {
                return this;
            }

            return new TypeOfExpressionSyntax(typeOfKeyword, expression, this.parsedInStrictMode());
        };

        TypeOfExpressionSyntax.create1 = function (expression) {
            return new TypeOfExpressionSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.TypeOfKeyword), expression, false);
        };

        TypeOfExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        TypeOfExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        TypeOfExpressionSyntax.prototype.withTypeOfKeyword = function (typeOfKeyword) {
            return this.update(typeOfKeyword, this.expression);
        };

        TypeOfExpressionSyntax.prototype.withExpression = function (expression) {
            return this.update(this.typeOfKeyword, expression);
        };

        TypeOfExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return TypeOfExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.TypeOfExpressionSyntax = TypeOfExpressionSyntax;

    var DeleteExpressionSyntax = (function (_super) {
        __extends(DeleteExpressionSyntax, _super);
        function DeleteExpressionSyntax(deleteKeyword, expression, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.deleteKeyword = deleteKeyword;
            this.expression = expression;
        }
        DeleteExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitDeleteExpression(this);
        };

        DeleteExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.DeleteExpression;
        };

        DeleteExpressionSyntax.prototype.childCount = function () {
            return 2;
        };

        DeleteExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.deleteKeyword;
                case 1:
                    return this.expression;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        DeleteExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        DeleteExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        DeleteExpressionSyntax.prototype.update = function (deleteKeyword, expression) {
            if (this.deleteKeyword === deleteKeyword && this.expression === expression) {
                return this;
            }

            return new DeleteExpressionSyntax(deleteKeyword, expression, this.parsedInStrictMode());
        };

        DeleteExpressionSyntax.create1 = function (expression) {
            return new DeleteExpressionSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.DeleteKeyword), expression, false);
        };

        DeleteExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        DeleteExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        DeleteExpressionSyntax.prototype.withDeleteKeyword = function (deleteKeyword) {
            return this.update(deleteKeyword, this.expression);
        };

        DeleteExpressionSyntax.prototype.withExpression = function (expression) {
            return this.update(this.deleteKeyword, expression);
        };

        DeleteExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return DeleteExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.DeleteExpressionSyntax = DeleteExpressionSyntax;

    var VoidExpressionSyntax = (function (_super) {
        __extends(VoidExpressionSyntax, _super);
        function VoidExpressionSyntax(voidKeyword, expression, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.voidKeyword = voidKeyword;
            this.expression = expression;
        }
        VoidExpressionSyntax.prototype.accept = function (visitor) {
            return visitor.visitVoidExpression(this);
        };

        VoidExpressionSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.VoidExpression;
        };

        VoidExpressionSyntax.prototype.childCount = function () {
            return 2;
        };

        VoidExpressionSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.voidKeyword;
                case 1:
                    return this.expression;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        VoidExpressionSyntax.prototype.isUnaryExpression = function () {
            return true;
        };

        VoidExpressionSyntax.prototype.isExpression = function () {
            return true;
        };

        VoidExpressionSyntax.prototype.update = function (voidKeyword, expression) {
            if (this.voidKeyword === voidKeyword && this.expression === expression) {
                return this;
            }

            return new VoidExpressionSyntax(voidKeyword, expression, this.parsedInStrictMode());
        };

        VoidExpressionSyntax.create1 = function (expression) {
            return new VoidExpressionSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.VoidKeyword), expression, false);
        };

        VoidExpressionSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        VoidExpressionSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        VoidExpressionSyntax.prototype.withVoidKeyword = function (voidKeyword) {
            return this.update(voidKeyword, this.expression);
        };

        VoidExpressionSyntax.prototype.withExpression = function (expression) {
            return this.update(this.voidKeyword, expression);
        };

        VoidExpressionSyntax.prototype.isTypeScriptSpecific = function () {
            if (this.expression.isTypeScriptSpecific()) {
                return true;
            }
            return false;
        };
        return VoidExpressionSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.VoidExpressionSyntax = VoidExpressionSyntax;

    var DebuggerStatementSyntax = (function (_super) {
        __extends(DebuggerStatementSyntax, _super);
        function DebuggerStatementSyntax(debuggerKeyword, semicolonToken, parsedInStrictMode) {
            _super.call(this, parsedInStrictMode);
            this.debuggerKeyword = debuggerKeyword;
            this.semicolonToken = semicolonToken;
        }
        DebuggerStatementSyntax.prototype.accept = function (visitor) {
            return visitor.visitDebuggerStatement(this);
        };

        DebuggerStatementSyntax.prototype.kind = function () {
            return TypeScript.SyntaxKind.DebuggerStatement;
        };

        DebuggerStatementSyntax.prototype.childCount = function () {
            return 2;
        };

        DebuggerStatementSyntax.prototype.childAt = function (slot) {
            switch (slot) {
                case 0:
                    return this.debuggerKeyword;
                case 1:
                    return this.semicolonToken;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        DebuggerStatementSyntax.prototype.isStatement = function () {
            return true;
        };

        DebuggerStatementSyntax.prototype.isModuleElement = function () {
            return true;
        };

        DebuggerStatementSyntax.prototype.update = function (debuggerKeyword, semicolonToken) {
            if (this.debuggerKeyword === debuggerKeyword && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new DebuggerStatementSyntax(debuggerKeyword, semicolonToken, this.parsedInStrictMode());
        };

        DebuggerStatementSyntax.create1 = function () {
            return new DebuggerStatementSyntax(TypeScript.Syntax.token(TypeScript.SyntaxKind.DebuggerKeyword), TypeScript.Syntax.token(TypeScript.SyntaxKind.SemicolonToken), false);
        };

        DebuggerStatementSyntax.prototype.withLeadingTrivia = function (trivia) {
            return _super.prototype.withLeadingTrivia.call(this, trivia);
        };

        DebuggerStatementSyntax.prototype.withTrailingTrivia = function (trivia) {
            return _super.prototype.withTrailingTrivia.call(this, trivia);
        };

        DebuggerStatementSyntax.prototype.withDebuggerKeyword = function (debuggerKeyword) {
            return this.update(debuggerKeyword, this.semicolonToken);
        };

        DebuggerStatementSyntax.prototype.withSemicolonToken = function (semicolonToken) {
            return this.update(this.debuggerKeyword, semicolonToken);
        };

        DebuggerStatementSyntax.prototype.isTypeScriptSpecific = function () {
            return false;
        };
        return DebuggerStatementSyntax;
    })(TypeScript.SyntaxNode);
    TypeScript.DebuggerStatementSyntax = DebuggerStatementSyntax;
})(TypeScript || (TypeScript = {}));
