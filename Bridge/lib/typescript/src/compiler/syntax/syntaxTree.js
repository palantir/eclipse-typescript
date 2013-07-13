var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var SyntaxTree = (function () {
        function SyntaxTree(sourceUnit, isDeclaration, diagnostics, fileName, lineMap, languageVersion, parseOtions) {
            this._allDiagnostics = null;
            this._sourceUnit = sourceUnit;
            this._isDeclaration = isDeclaration;
            this._parserDiagnostics = diagnostics;
            this._fileName = fileName;
            this._lineMap = lineMap;
            this._languageVersion = languageVersion;
            this._parseOptions = parseOtions;
        }
        SyntaxTree.prototype.toJSON = function (key) {
            var result = {};

            result.isDeclaration = this._isDeclaration;
            result.languageVersion = TypeScript.LanguageVersion[this._languageVersion];
            result.parseOptions = this._parseOptions;

            if (this.diagnostics().length > 0) {
                result.diagnostics = this.diagnostics();
            }

            result.sourceUnit = this._sourceUnit;
            result.lineMap = this._lineMap;

            return result;
        };

        SyntaxTree.prototype.sourceUnit = function () {
            return this._sourceUnit;
        };

        SyntaxTree.prototype.isDeclaration = function () {
            return this._isDeclaration;
        };

        SyntaxTree.prototype.computeDiagnostics = function () {
            if (this._parserDiagnostics.length > 0) {
                return this._parserDiagnostics;
            }

            var diagnostics = [];
            this.sourceUnit().accept(new GrammarCheckerWalker(this, diagnostics));

            return diagnostics;
        };

        SyntaxTree.prototype.diagnostics = function () {
            if (this._allDiagnostics === null) {
                this._allDiagnostics = this.computeDiagnostics();
            }

            return this._allDiagnostics;
        };

        SyntaxTree.prototype.fileName = function () {
            return this._fileName;
        };

        SyntaxTree.prototype.lineMap = function () {
            return this._lineMap;
        };

        SyntaxTree.prototype.languageVersion = function () {
            return this._languageVersion;
        };

        SyntaxTree.prototype.parseOptions = function () {
            return this._parseOptions;
        };

        SyntaxTree.prototype.structuralEquals = function (tree) {
            return TypeScript.ArrayUtilities.sequenceEquals(this.diagnostics(), tree.diagnostics(), TypeScript.SyntaxDiagnostic.equals) && this.sourceUnit().structuralEquals(tree.sourceUnit());
        };
        return SyntaxTree;
    })();
    TypeScript.SyntaxTree = SyntaxTree;

    var GrammarCheckerWalker = (function (_super) {
        __extends(GrammarCheckerWalker, _super);
        function GrammarCheckerWalker(syntaxTree, diagnostics) {
            _super.call(this);
            this.syntaxTree = syntaxTree;
            this.diagnostics = diagnostics;
            this.inAmbientDeclaration = false;
            this.inBlock = false;
            this.currentConstructor = null;
        }
        GrammarCheckerWalker.prototype.childFullStart = function (parent, child) {
            return this.position() + TypeScript.Syntax.childOffset(parent, child);
        };

        GrammarCheckerWalker.prototype.childStart = function (parent, child) {
            return this.childFullStart(parent, child) + child.leadingTriviaWidth();
        };

        GrammarCheckerWalker.prototype.pushDiagnostic = function (start, length, diagnosticCode, args) {
            if (typeof args === "undefined") { args = null; }
            this.diagnostics.push(new TypeScript.SyntaxDiagnostic(this.syntaxTree.fileName(), start, length, diagnosticCode, args));
        };

        GrammarCheckerWalker.prototype.pushDiagnostic1 = function (elementFullStart, element, diagnosticCode, args) {
            if (typeof args === "undefined") { args = null; }
            this.diagnostics.push(new TypeScript.SyntaxDiagnostic(this.syntaxTree.fileName(), elementFullStart + element.leadingTriviaWidth(), element.width(), diagnosticCode, args));
        };

        GrammarCheckerWalker.prototype.visitCatchClause = function (node) {
            if (node.typeAnnotation) {
                this.pushDiagnostic(this.childStart(node, node.typeAnnotation), node.typeAnnotation.width(), TypeScript.DiagnosticCode.A_catch_clause_variable_cannot_have_a_type_annotation);
            }

            _super.prototype.visitCatchClause.call(this, node);
        };

        GrammarCheckerWalker.prototype.checkParameterListOrder = function (node) {
            var parameterFullStart = this.childFullStart(node, node.parameters);

            var seenOptionalParameter = false;
            var parameterCount = node.parameters.nonSeparatorCount();

            for (var i = 0, n = node.parameters.childCount(); i < n; i++) {
                var nodeOrToken = node.parameters.childAt(i);
                if (i % 2 === 0) {
                    var parameterIndex = i / 2;
                    var parameter = node.parameters.childAt(i);

                    if (parameter.dotDotDotToken) {
                        if (parameterIndex !== (parameterCount - 1)) {
                            this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode.Rest_parameter_must_be_last_in_list);
                            return true;
                        }

                        if (parameter.questionToken) {
                            this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode.Rest_parameter_cannot_be_optional);
                            return true;
                        }

                        if (parameter.equalsValueClause) {
                            this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode.Rest_parameter_cannot_have_initializer);
                            return true;
                        }
                    } else if (parameter.questionToken || parameter.equalsValueClause) {
                        seenOptionalParameter = true;

                        if (parameter.questionToken && parameter.equalsValueClause) {
                            this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode.Parameter_cannot_have_question_mark_and_initializer);
                            return true;
                        }
                    } else {
                        if (seenOptionalParameter) {
                            this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode.Required_parameter_cannot_follow_optional_parameter);
                            return true;
                        }
                    }
                }

                parameterFullStart += nodeOrToken.fullWidth();
            }

            return false;
        };

        GrammarCheckerWalker.prototype.checkParameterListAcessibilityModifiers = function (node) {
            if (this.currentConstructor !== null && this.currentConstructor.parameterList === node && this.currentConstructor.block && !this.inAmbientDeclaration) {
                return false;
            }

            var parameterFullStart = this.childFullStart(node, node.parameters);

            for (var i = 0, n = node.parameters.childCount(); i < n; i++) {
                var nodeOrToken = node.parameters.childAt(i);
                if (i % 2 === 0) {
                    var parameter = node.parameters.childAt(i);

                    if (parameter.publicOrPrivateKeyword) {
                        var keywordFullStart = parameterFullStart + TypeScript.Syntax.childOffset(parameter, parameter.publicOrPrivateKeyword);
                        this.pushDiagnostic1(keywordFullStart, parameter.publicOrPrivateKeyword, TypeScript.DiagnosticCode.Overload_and_ambient_signatures_cannot_specify_parameter_properties);
                    }
                }

                parameterFullStart += nodeOrToken.fullWidth();
            }

            return false;
        };

        GrammarCheckerWalker.prototype.checkForTrailingSeparator = function (parent, list) {
            if (list.childCount() === 0 || list.childCount() % 2 === 1) {
                return false;
            }

            var currentElementFullStart = this.childFullStart(parent, list);

            for (var i = 0, n = list.childCount(); i < n; i++) {
                var child = list.childAt(i);
                if (i === n - 1) {
                    this.pushDiagnostic1(currentElementFullStart, child, TypeScript.DiagnosticCode.Trailing_separator_not_allowed);
                }

                currentElementFullStart += child.fullWidth();
            }

            return true;
        };

        GrammarCheckerWalker.prototype.checkForAtLeastOneElement = function (parent, list, expected) {
            if (list.childCount() > 0) {
                return false;
            }

            var listFullStart = this.childFullStart(parent, list);
            var tokenAtStart = this.syntaxTree.sourceUnit().findToken(listFullStart);

            this.pushDiagnostic1(listFullStart, tokenAtStart.token(), TypeScript.DiagnosticCode.Unexpected_token__0_expected, [expected]);

            return true;
        };

        GrammarCheckerWalker.prototype.visitParameterList = function (node) {
            if (this.checkParameterListAcessibilityModifiers(node) || this.checkParameterListOrder(node) || this.checkForTrailingSeparator(node, node.parameters)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitParameterList.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitHeritageClause = function (node) {
            if (this.checkForTrailingSeparator(node, node.typeNames) || this.checkForAtLeastOneElement(node, node.typeNames, TypeScript.Strings.type_name)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitHeritageClause.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitArgumentList = function (node) {
            if (this.checkForTrailingSeparator(node, node.arguments)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitArgumentList.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitVariableDeclaration = function (node) {
            if (this.checkForTrailingSeparator(node, node.variableDeclarators) || this.checkForAtLeastOneElement(node, node.variableDeclarators, TypeScript.Strings.identifier)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitVariableDeclaration.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitTypeArgumentList = function (node) {
            if (this.checkForTrailingSeparator(node, node.typeArguments) || this.checkForAtLeastOneElement(node, node.typeArguments, TypeScript.Strings.identifier)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitTypeArgumentList.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitTypeParameterList = function (node) {
            if (this.checkForTrailingSeparator(node, node.typeParameters) || this.checkForAtLeastOneElement(node, node.typeParameters, TypeScript.Strings.identifier)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitTypeParameterList.call(this, node);
        };

        GrammarCheckerWalker.prototype.checkIndexSignatureParameter = function (node) {
            var parameterFullStart = this.childFullStart(node, node.parameter);
            var parameter = node.parameter;

            if (parameter.dotDotDotToken) {
                this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode.Index_signatures_cannot_have_rest_parameters);
                return true;
            } else if (parameter.publicOrPrivateKeyword) {
                this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode.Index_signature_parameter_cannot_have_accessibility_modifiers);
                return true;
            } else if (parameter.questionToken) {
                this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode.Index_signature_parameter_cannot_have_a_question_mark);
                return true;
            } else if (parameter.equalsValueClause) {
                this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode.Index_signature_parameter_cannot_have_an_initializer);
                return true;
            } else if (!parameter.typeAnnotation) {
                this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode.Index_signature_parameter_must_have_a_type_annotation);
                return true;
            } else if (parameter.typeAnnotation.type.kind() !== TypeScript.SyntaxKind.StringKeyword && parameter.typeAnnotation.type.kind() !== TypeScript.SyntaxKind.NumberKeyword) {
                this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode.Index_signature_parameter_type_must_be__string__or__number_);
                return true;
            }

            return false;
        };

        GrammarCheckerWalker.prototype.visitIndexSignature = function (node) {
            if (this.checkIndexSignatureParameter(node)) {
                this.skip(node);
                return;
            }

            if (!node.typeAnnotation) {
                this.pushDiagnostic1(this.position(), node, TypeScript.DiagnosticCode.Index_signature_must_have_a_type_annotation);
                this.skip(node);
                return;
            }

            _super.prototype.visitIndexSignature.call(this, node);
        };

        GrammarCheckerWalker.prototype.checkClassDeclarationHeritageClauses = function (node) {
            var heritageClauseFullStart = this.childFullStart(node, node.heritageClauses);

            var seenExtendsClause = false;
            var seenImplementsClause = false;

            for (var i = 0, n = node.heritageClauses.childCount(); i < n; i++) {
                TypeScript.Debug.assert(i <= 2);
                var heritageClause = node.heritageClauses.childAt(i);

                if (heritageClause.extendsOrImplementsKeyword.tokenKind === TypeScript.SyntaxKind.ExtendsKeyword) {
                    if (seenExtendsClause) {
                        this.pushDiagnostic1(heritageClauseFullStart, heritageClause, TypeScript.DiagnosticCode._extends__clause_already_seen);
                        return true;
                    }

                    if (seenImplementsClause) {
                        this.pushDiagnostic1(heritageClauseFullStart, heritageClause, TypeScript.DiagnosticCode._extends__clause_must_precede__implements__clause);
                        return true;
                    }

                    if (heritageClause.typeNames.nonSeparatorCount() > 1) {
                        this.pushDiagnostic1(heritageClauseFullStart, heritageClause, TypeScript.DiagnosticCode.Class_can_only_extend_single_type);
                        return true;
                    }

                    seenExtendsClause = true;
                } else {
                    TypeScript.Debug.assert(heritageClause.extendsOrImplementsKeyword.tokenKind === TypeScript.SyntaxKind.ImplementsKeyword);
                    if (seenImplementsClause) {
                        this.pushDiagnostic1(heritageClauseFullStart, heritageClause, TypeScript.DiagnosticCode._implements__clause_already_seen);
                        return true;
                    }

                    seenImplementsClause = true;
                }

                heritageClauseFullStart += heritageClause.fullWidth();
            }

            return false;
        };

        GrammarCheckerWalker.prototype.checkForDisallowedDeclareModifier = function (modifiers) {
            if (this.inAmbientDeclaration) {
                var declareToken = TypeScript.SyntaxUtilities.getToken(modifiers, TypeScript.SyntaxKind.DeclareKeyword);

                if (declareToken) {
                    this.pushDiagnostic1(this.childFullStart(modifiers, declareToken), declareToken, TypeScript.DiagnosticCode._declare__modifier_not_allowed_for_code_already_in_an_ambient_context);
                    return true;
                }
            }

            return false;
        };

        GrammarCheckerWalker.prototype.checkForRequiredDeclareModifier = function (moduleElement, typeKeyword, modifiers) {
            if (!this.inAmbientDeclaration && this.syntaxTree.isDeclaration()) {
                if (!TypeScript.SyntaxUtilities.containsToken(modifiers, TypeScript.SyntaxKind.DeclareKeyword)) {
                    this.pushDiagnostic1(this.childFullStart(moduleElement, typeKeyword), typeKeyword.firstToken(), TypeScript.DiagnosticCode._declare__modifier_required_for_top_level_element);
                    return true;
                }
            }
        };

        GrammarCheckerWalker.prototype.checkFunctionOverloads = function (node, moduleElements) {
            if (!this.inAmbientDeclaration && !this.syntaxTree.isDeclaration()) {
                var moduleElementFullStart = this.childFullStart(node, moduleElements);

                var inFunctionOverloadChain = false;
                var functionOverloadChainName = null;

                for (var i = 0, n = moduleElements.childCount(); i < n; i++) {
                    var moduleElement = moduleElements.childAt(i);
                    var lastElement = i === (n - 1);

                    if (inFunctionOverloadChain) {
                        if (moduleElement.kind() !== TypeScript.SyntaxKind.FunctionDeclaration) {
                            this.pushDiagnostic1(moduleElementFullStart, moduleElement.firstToken(), TypeScript.DiagnosticCode.Function_implementation_expected);
                            return true;
                        }

                        var functionDeclaration = moduleElement;
                        if (functionDeclaration.identifier.valueText() !== functionOverloadChainName) {
                            var identifierFullStart = moduleElementFullStart + TypeScript.Syntax.childOffset(moduleElement, functionDeclaration.identifier);
                            this.pushDiagnostic1(identifierFullStart, functionDeclaration.identifier, TypeScript.DiagnosticCode.Function_overload_name_must_be__0_, [functionOverloadChainName]);
                            return true;
                        }
                    }

                    if (moduleElement.kind() === TypeScript.SyntaxKind.FunctionDeclaration) {
                        functionDeclaration = moduleElement;
                        if (!TypeScript.SyntaxUtilities.containsToken(functionDeclaration.modifiers, TypeScript.SyntaxKind.DeclareKeyword)) {
                            inFunctionOverloadChain = functionDeclaration.block === null;
                            functionOverloadChainName = functionDeclaration.identifier.valueText();

                            if (lastElement && inFunctionOverloadChain) {
                                this.pushDiagnostic1(moduleElementFullStart, moduleElement.firstToken(), TypeScript.DiagnosticCode.Function_implementation_expected);
                                return true;
                            }
                        } else {
                            inFunctionOverloadChain = false;
                            functionOverloadChainName = "";
                        }
                    }

                    moduleElementFullStart += moduleElement.fullWidth();
                }
            }

            return false;
        };

        GrammarCheckerWalker.prototype.checkClassOverloads = function (node) {
            if (!this.inAmbientDeclaration && !TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword)) {
                var classElementFullStart = this.childFullStart(node, node.classElements);

                var inFunctionOverloadChain = false;
                var inConstructorOverloadChain = false;

                var functionOverloadChainName = null;
                var memberFunctionDeclaration = null;

                for (var i = 0, n = node.classElements.childCount(); i < n; i++) {
                    var classElement = node.classElements.childAt(i);
                    var lastElement = i === (n - 1);

                    if (inFunctionOverloadChain) {
                        if (classElement.kind() !== TypeScript.SyntaxKind.MemberFunctionDeclaration) {
                            this.pushDiagnostic1(classElementFullStart, classElement.firstToken(), TypeScript.DiagnosticCode.Function_implementation_expected);
                            return true;
                        }

                        memberFunctionDeclaration = classElement;
                        if (memberFunctionDeclaration.propertyName.valueText() !== functionOverloadChainName) {
                            var propertyNameFullStart = classElementFullStart + TypeScript.Syntax.childOffset(classElement, memberFunctionDeclaration.propertyName);
                            this.pushDiagnostic1(propertyNameFullStart, memberFunctionDeclaration.propertyName, TypeScript.DiagnosticCode.Function_overload_name_must_be__0_, [functionOverloadChainName]);
                            return true;
                        }
                    } else if (inConstructorOverloadChain) {
                        if (classElement.kind() !== TypeScript.SyntaxKind.ConstructorDeclaration) {
                            this.pushDiagnostic1(classElementFullStart, classElement.firstToken(), TypeScript.DiagnosticCode.Constructor_implementation_expected);
                            return true;
                        }
                    }

                    if (classElement.kind() === TypeScript.SyntaxKind.MemberFunctionDeclaration) {
                        memberFunctionDeclaration = classElement;

                        inFunctionOverloadChain = memberFunctionDeclaration.block === null;
                        functionOverloadChainName = memberFunctionDeclaration.propertyName.valueText();

                        if (lastElement && inFunctionOverloadChain) {
                            this.pushDiagnostic1(classElementFullStart, classElement.firstToken(), TypeScript.DiagnosticCode.Function_implementation_expected);
                            return true;
                        }
                    } else if (classElement.kind() === TypeScript.SyntaxKind.ConstructorDeclaration) {
                        var constructorDeclaration = classElement;

                        inConstructorOverloadChain = constructorDeclaration.block === null;
                        if (lastElement && inConstructorOverloadChain) {
                            this.pushDiagnostic1(classElementFullStart, classElement.firstToken(), TypeScript.DiagnosticCode.Constructor_implementation_expected);
                            return true;
                        }
                    }

                    classElementFullStart += classElement.fullWidth();
                }
            }

            return false;
        };

        GrammarCheckerWalker.prototype.checkForReservedName = function (parent, name, code) {
            var nameFullStart = this.childFullStart(parent, name);
            var token;
            var tokenFullStart;

            var current = name;
            while (current !== null) {
                if (current.kind() === TypeScript.SyntaxKind.QualifiedName) {
                    var qualifiedName = current;
                    token = qualifiedName.right;
                    tokenFullStart = nameFullStart + this.childFullStart(qualifiedName, token);
                    current = qualifiedName.left;
                } else {
                    TypeScript.Debug.assert(current.kind() === TypeScript.SyntaxKind.IdentifierName);
                    token = current;
                    tokenFullStart = nameFullStart;
                    current = null;
                }

                switch (token.valueText()) {
                    case "any":
                    case "number":
                    case "bool":
                    case "string":
                    case "void":
                        this.pushDiagnostic(tokenFullStart + token.leadingTriviaWidth(), token.width(), code, [token.valueText()]);
                        return true;
                }
            }

            return false;
        };

        GrammarCheckerWalker.prototype.visitClassDeclaration = function (node) {
            if (this.checkForReservedName(node, node.identifier, TypeScript.DiagnosticCode.Class_name_cannot_be__0_) || this.checkForDisallowedDeclareModifier(node.modifiers) || this.checkForRequiredDeclareModifier(node, node.classKeyword, node.modifiers) || this.checkModuleElementModifiers(node.modifiers) || this.checkClassDeclarationHeritageClauses(node) || this.checkClassOverloads(node)) {
                this.skip(node);
                return;
            }

            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = this.inAmbientDeclaration || this.syntaxTree.isDeclaration() || TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword);
            _super.prototype.visitClassDeclaration.call(this, node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        };

        GrammarCheckerWalker.prototype.checkInterfaceDeclarationHeritageClauses = function (node) {
            var heritageClauseFullStart = this.childFullStart(node, node.heritageClauses);

            var seenExtendsClause = false;

            for (var i = 0, n = node.heritageClauses.childCount(); i < n; i++) {
                TypeScript.Debug.assert(i <= 1);
                var heritageClause = node.heritageClauses.childAt(i);

                if (heritageClause.extendsOrImplementsKeyword.tokenKind === TypeScript.SyntaxKind.ExtendsKeyword) {
                    if (seenExtendsClause) {
                        this.pushDiagnostic1(heritageClauseFullStart, heritageClause, TypeScript.DiagnosticCode._extends__clause_already_seen);
                        return true;
                    }

                    seenExtendsClause = true;
                } else {
                    TypeScript.Debug.assert(heritageClause.extendsOrImplementsKeyword.tokenKind === TypeScript.SyntaxKind.ImplementsKeyword);
                    this.pushDiagnostic1(heritageClauseFullStart, heritageClause, TypeScript.DiagnosticCode.Interface_declaration_cannot_have__implements__clause);
                    return true;
                }

                heritageClauseFullStart += heritageClause.fullWidth();
            }

            return false;
        };

        GrammarCheckerWalker.prototype.checkInterfaceModifiers = function (modifiers) {
            var modifierFullStart = this.position();

            for (var i = 0, n = modifiers.childCount(); i < n; i++) {
                var modifier = modifiers.childAt(i);
                if (modifier.tokenKind === TypeScript.SyntaxKind.DeclareKeyword) {
                    this.pushDiagnostic1(modifierFullStart, modifier, TypeScript.DiagnosticCode._declare__modifier_cannot_appear_on_an_interface_declaration);
                    return true;
                }

                modifierFullStart += modifier.fullWidth();
            }

            return false;
        };

        GrammarCheckerWalker.prototype.visitInterfaceDeclaration = function (node) {
            if (this.checkForReservedName(node, node.identifier, TypeScript.DiagnosticCode.Interface_name_cannot_be__0_) || this.checkInterfaceModifiers(node.modifiers) || this.checkModuleElementModifiers(node.modifiers) || this.checkInterfaceDeclarationHeritageClauses(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitInterfaceDeclaration.call(this, node);
        };

        GrammarCheckerWalker.prototype.checkClassElementModifiers = function (list) {
            var modifierFullStart = this.position();

            var seenAccessibilityModifier = false;
            var seenStaticModifier = false;

            for (var i = 0, n = list.childCount(); i < n; i++) {
                var modifier = list.childAt(i);
                if (modifier.tokenKind === TypeScript.SyntaxKind.PublicKeyword || modifier.tokenKind === TypeScript.SyntaxKind.PrivateKeyword) {
                    if (seenAccessibilityModifier) {
                        this.pushDiagnostic1(modifierFullStart, modifier, TypeScript.DiagnosticCode.Accessibility_modifier_already_seen);
                        return true;
                    }

                    if (seenStaticModifier) {
                        var previousToken = list.childAt(i - 1);
                        this.pushDiagnostic1(modifierFullStart, modifier, TypeScript.DiagnosticCode._0__modifier_must_precede__1__modifier, [modifier.text(), previousToken.text()]);
                        return true;
                    }

                    seenAccessibilityModifier = true;
                } else if (modifier.tokenKind === TypeScript.SyntaxKind.StaticKeyword) {
                    if (seenStaticModifier) {
                        this.pushDiagnostic1(modifierFullStart, modifier, TypeScript.DiagnosticCode._0__modifier_already_seen, [modifier.text()]);
                        return true;
                    }

                    seenStaticModifier = true;
                } else {
                    this.pushDiagnostic1(modifierFullStart, modifier, TypeScript.DiagnosticCode._0__modifier_cannot_appear_on_a_class_element, [modifier.text()]);
                    return true;
                }

                modifierFullStart += modifier.fullWidth();
            }

            return false;
        };

        GrammarCheckerWalker.prototype.visitMemberVariableDeclaration = function (node) {
            if (this.checkClassElementModifiers(node.modifiers)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitMemberVariableDeclaration.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitMemberFunctionDeclaration = function (node) {
            if (this.checkClassElementModifiers(node.modifiers)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitMemberFunctionDeclaration.call(this, node);
        };

        GrammarCheckerWalker.prototype.checkGetMemberAccessorParameter = function (node) {
            var getKeywordFullStart = this.childFullStart(node, node.getKeyword);
            if (node.parameterList.parameters.childCount() !== 0) {
                this.pushDiagnostic1(getKeywordFullStart, node.getKeyword, TypeScript.DiagnosticCode._get__accessor_cannot_have_parameters);
                return true;
            }

            return false;
        };

        GrammarCheckerWalker.prototype.checkEcmaScriptVersionIsAtLeast = function (parent, node, languageVersion, code) {
            if (this.syntaxTree.languageVersion() < languageVersion) {
                var nodeFullStart = this.childFullStart(parent, node);
                this.pushDiagnostic1(nodeFullStart, node, code);
                return true;
            }

            return false;
        };

        GrammarCheckerWalker.prototype.visitGetMemberAccessorDeclaration = function (node) {
            if (this.checkEcmaScriptVersionIsAtLeast(node, node.getKeyword, TypeScript.LanguageVersion.EcmaScript5, TypeScript.DiagnosticCode.Accessors_are_only_available_when_targeting_EcmaScript5_and_higher) || this.checkClassElementModifiers(node.modifiers) || this.checkGetMemberAccessorParameter(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitGetMemberAccessorDeclaration.call(this, node);
        };

        GrammarCheckerWalker.prototype.checkSetMemberAccessorParameter = function (node) {
            var setKeywordFullStart = this.childFullStart(node, node.setKeyword);
            if (node.parameterList.parameters.childCount() !== 1) {
                this.pushDiagnostic1(setKeywordFullStart, node.setKeyword, TypeScript.DiagnosticCode._set__accessor_must_have_only_one_parameter);
                return true;
            }

            var parameterListFullStart = this.childFullStart(node, node.parameterList);
            var parameterFullStart = parameterListFullStart + TypeScript.Syntax.childOffset(node.parameterList, node.parameterList.openParenToken);
            var parameter = node.parameterList.parameters.childAt(0);

            if (parameter.publicOrPrivateKeyword) {
                this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode._set__accessor_parameter_cannot_have_accessibility_modifier);
                return true;
            }

            if (parameter.questionToken) {
                this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode._set__accessor_parameter_cannot_be_optional);
                return true;
            }

            if (parameter.equalsValueClause) {
                this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode._set__accessor_parameter_cannot_have_initializer);
                return true;
            }

            if (parameter.dotDotDotToken) {
                this.pushDiagnostic1(parameterFullStart, parameter, TypeScript.DiagnosticCode._set__accessor_cannot_have_rest_parameter);
                return true;
            }

            return false;
        };

        GrammarCheckerWalker.prototype.visitSetMemberAccessorDeclaration = function (node) {
            if (this.checkEcmaScriptVersionIsAtLeast(node, node.setKeyword, TypeScript.LanguageVersion.EcmaScript5, TypeScript.DiagnosticCode.Accessors_are_only_available_when_targeting_EcmaScript5_and_higher) || this.checkClassElementModifiers(node.modifiers) || this.checkSetMemberAccessorParameter(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitSetMemberAccessorDeclaration.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitGetAccessorPropertyAssignment = function (node) {
            if (this.checkEcmaScriptVersionIsAtLeast(node, node.getKeyword, TypeScript.LanguageVersion.EcmaScript5, TypeScript.DiagnosticCode.Accessors_are_only_available_when_targeting_EcmaScript5_and_higher)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitGetAccessorPropertyAssignment.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitSetAccessorPropertyAssignment = function (node) {
            if (this.checkEcmaScriptVersionIsAtLeast(node, node.setKeyword, TypeScript.LanguageVersion.EcmaScript5, TypeScript.DiagnosticCode.Accessors_are_only_available_when_targeting_EcmaScript5_and_higher)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitSetAccessorPropertyAssignment.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitEnumDeclaration = function (node) {
            if (this.checkForReservedName(node, node.identifier, TypeScript.DiagnosticCode.Enum_name_cannot_be__0_) || this.checkForDisallowedDeclareModifier(node.modifiers) || this.checkForRequiredDeclareModifier(node, node.enumKeyword, node.modifiers) || this.checkModuleElementModifiers(node.modifiers), this.checkEnumElements(node)) {
                this.skip(node);
                return;
            }

            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = this.inAmbientDeclaration || this.syntaxTree.isDeclaration() || TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword);
            _super.prototype.visitEnumDeclaration.call(this, node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        };

        GrammarCheckerWalker.prototype.checkEnumElements = function (node) {
            var enumElementFullStart = this.childFullStart(node, node.enumElements);

            var seenComputedValue = false;
            for (var i = 0, n = node.enumElements.childCount(); i < n; i++) {
                var child = node.enumElements.childAt(i);

                if (i % 2 === 0) {
                    var enumElement = child;

                    if (!enumElement.equalsValueClause && seenComputedValue) {
                        this.pushDiagnostic1(enumElementFullStart, enumElement, TypeScript.DiagnosticCode.Enum_member_must_have_initializer, null);
                        return true;
                    }

                    if (enumElement.equalsValueClause) {
                        var value = enumElement.equalsValueClause.value;
                        if (value.kind() !== TypeScript.SyntaxKind.NumericLiteral) {
                            seenComputedValue = true;
                        }
                    }
                }

                enumElementFullStart += child.fullWidth();
            }

            return false;
        };

        GrammarCheckerWalker.prototype.visitInvocationExpression = function (node) {
            if (node.expression.kind() === TypeScript.SyntaxKind.SuperKeyword && node.argumentList.typeArgumentList !== null) {
                this.pushDiagnostic1(this.position(), node, TypeScript.DiagnosticCode._super__invocation_cannot_have_type_arguments);
            }

            _super.prototype.visitInvocationExpression.call(this, node);
        };

        GrammarCheckerWalker.prototype.checkModuleElementModifiers = function (modifiers) {
            var modifierFullStart = this.position();
            var seenExportModifier = false;
            var seenDeclareModifier = false;

            for (var i = 0, n = modifiers.childCount(); i < n; i++) {
                var modifier = modifiers.childAt(i);
                if (modifier.tokenKind === TypeScript.SyntaxKind.PublicKeyword || modifier.tokenKind === TypeScript.SyntaxKind.PrivateKeyword || modifier.tokenKind === TypeScript.SyntaxKind.StaticKeyword) {
                    this.pushDiagnostic1(modifierFullStart, modifier, TypeScript.DiagnosticCode._0__modifier_cannot_appear_on_a_module_element, [modifier.text()]);
                    return true;
                }

                if (modifier.tokenKind === TypeScript.SyntaxKind.DeclareKeyword) {
                    if (seenDeclareModifier) {
                        this.pushDiagnostic1(modifierFullStart, modifier, TypeScript.DiagnosticCode.Accessibility_modifier_already_seen);
                        return;
                    }

                    seenDeclareModifier = true;
                } else if (modifier.tokenKind === TypeScript.SyntaxKind.ExportKeyword) {
                    if (seenExportModifier) {
                        this.pushDiagnostic1(modifierFullStart, modifier, TypeScript.DiagnosticCode._0__modifier_already_seen, [modifier.text()]);
                        return;
                    }

                    if (seenDeclareModifier) {
                        this.pushDiagnostic1(modifierFullStart, modifier, TypeScript.DiagnosticCode._0__modifier_must_precede__1__modifier, [TypeScript.SyntaxFacts.getText(TypeScript.SyntaxKind.ExportKeyword), TypeScript.SyntaxFacts.getText(TypeScript.SyntaxKind.DeclareKeyword)]);
                        return;
                    }

                    seenExportModifier = true;
                }

                modifierFullStart += modifier.fullWidth();
            }

            return false;
        };

        GrammarCheckerWalker.prototype.checkForDisallowedImportDeclaration = function (node) {
            if (node.stringLiteral === null) {
                var currentElementFullStart = this.childFullStart(node, node.moduleElements);

                for (var i = 0, n = node.moduleElements.childCount(); i < n; i++) {
                    var child = node.moduleElements.childAt(i);
                    if (child.kind() === TypeScript.SyntaxKind.ImportDeclaration) {
                        var importDeclaration = child;
                        if (importDeclaration.moduleReference.kind() === TypeScript.SyntaxKind.ExternalModuleReference) {
                            this.pushDiagnostic1(currentElementFullStart, importDeclaration, TypeScript.DiagnosticCode.Import_declarations_in_an_internal_module_cannot_reference_an_external_module, null);
                        }
                    }

                    currentElementFullStart += child.fullWidth();
                }
            }

            return false;
        };

        GrammarCheckerWalker.prototype.visitModuleDeclaration = function (node) {
            if (this.checkForReservedName(node, node.moduleName, TypeScript.DiagnosticCode.Module_name_cannot_be__0_) || this.checkForDisallowedDeclareModifier(node.modifiers) || this.checkForRequiredDeclareModifier(node, node.moduleKeyword, node.modifiers) || this.checkModuleElementModifiers(node.modifiers) || this.checkForDisallowedImportDeclaration(node) || this.checkForDisallowedExports(node, node.moduleElements) || this.checkForMultipleExportAssignments(node, node.moduleElements)) {
                this.skip(node);
                return;
            }

            if (!TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword) && this.checkFunctionOverloads(node, node.moduleElements)) {
                this.skip(node);
                return;
            }

            if (node.stringLiteral && !this.inAmbientDeclaration && !TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword)) {
                var stringLiteralFullStart = this.childFullStart(node, node.stringLiteral);
                this.pushDiagnostic1(stringLiteralFullStart, node.stringLiteral, TypeScript.DiagnosticCode.Non_ambient_modules_cannot_use_quoted_names);
                this.skip(node);
                return;
            }

            if (!node.stringLiteral && this.checkForDisallowedExportAssignment(node)) {
                this.skip(node);
                return;
            }

            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = this.inAmbientDeclaration || this.syntaxTree.isDeclaration() || TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword);
            _super.prototype.visitModuleDeclaration.call(this, node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        };

        GrammarCheckerWalker.prototype.checkForDisallowedExports = function (node, moduleElements) {
            var seenExportedElement = false;
            for (var i = 0, n = moduleElements.childCount(); i < n; i++) {
                var child = moduleElements.childAt(i);

                if (TypeScript.SyntaxUtilities.hasExportKeyword(child)) {
                    seenExportedElement = true;
                    break;
                }
            }

            var moduleElementFullStart = this.childFullStart(node, moduleElements);
            if (seenExportedElement) {
                for (var i = 0, n = moduleElements.childCount(); i < n; i++) {
                    var child = moduleElements.childAt(i);

                    if (child.kind() === TypeScript.SyntaxKind.ExportAssignment) {
                        this.pushDiagnostic1(moduleElementFullStart, child, TypeScript.DiagnosticCode.Export_assignment_not_allowed_in_module_with_exported_element);
                        return true;
                    }

                    moduleElementFullStart += child.fullWidth();
                }
            }

            return false;
        };

        GrammarCheckerWalker.prototype.checkForMultipleExportAssignments = function (node, moduleElements) {
            var moduleElementFullStart = this.childFullStart(node, moduleElements);
            var seenExportAssignment = false;
            var errorFound = false;
            for (var i = 0, n = moduleElements.childCount(); i < n; i++) {
                var child = moduleElements.childAt(i);
                if (child.kind() === TypeScript.SyntaxKind.ExportAssignment) {
                    if (seenExportAssignment) {
                        this.pushDiagnostic1(moduleElementFullStart, child, TypeScript.DiagnosticCode.Module_cannot_have_multiple_export_assignments);
                        errorFound = true;
                    }
                    seenExportAssignment = true;
                }

                moduleElementFullStart += child.fullWidth();
            }

            return errorFound;
        };

        GrammarCheckerWalker.prototype.checkForDisallowedExportAssignment = function (node) {
            var moduleElementFullStart = this.childFullStart(node, node.moduleElements);

            for (var i = 0, n = node.moduleElements.childCount(); i < n; i++) {
                var child = node.moduleElements.childAt(i);

                if (child.kind() === TypeScript.SyntaxKind.ExportAssignment) {
                    this.pushDiagnostic1(moduleElementFullStart, child, TypeScript.DiagnosticCode.Export_assignments_cannot_be_used_in_internal_modules);

                    return true;
                }

                moduleElementFullStart += child.fullWidth();
            }

            return false;
        };

        GrammarCheckerWalker.prototype.visitBlock = function (node) {
            if (this.inAmbientDeclaration || this.syntaxTree.isDeclaration()) {
                this.pushDiagnostic1(this.position(), node.firstToken(), TypeScript.DiagnosticCode.Implementations_are_not_allowed_in_ambient_contexts);
                this.skip(node);
                return;
            }

            if (this.checkFunctionOverloads(node, node.statements)) {
                this.skip(node);
                return;
            }

            var savedInBlock = this.inBlock;
            this.inBlock = true;
            _super.prototype.visitBlock.call(this, node);
            this.inBlock = savedInBlock;
        };

        GrammarCheckerWalker.prototype.checkForStatementInAmbientContxt = function (node) {
            if (this.inAmbientDeclaration || this.syntaxTree.isDeclaration()) {
                this.pushDiagnostic1(this.position(), node.firstToken(), TypeScript.DiagnosticCode.Statements_are_not_allowed_in_ambient_contexts);
                return true;
            }

            return false;
        };

        GrammarCheckerWalker.prototype.visitBreakStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitBreakStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitContinueStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitContinueStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitDebuggerStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitDebuggerStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitDoStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitDoStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitEmptyStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitEmptyStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitExpressionStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitExpressionStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitForInStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitForInStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitForStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitForStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitIfStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitIfStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitLabeledStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitLabeledStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitReturnStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitReturnStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitSwitchStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitSwitchStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitThrowStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitThrowStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitTryStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitTryStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitWhileStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitWhileStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitWithStatement = function (node) {
            if (this.checkForStatementInAmbientContxt(node)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitWithStatement.call(this, node);
        };

        GrammarCheckerWalker.prototype.checkForDisallowedModifiers = function (parent, modifiers) {
            if (this.inBlock && modifiers.childCount() > 0) {
                var modifierFullStart = this.childFullStart(parent, modifiers);
                this.pushDiagnostic1(modifierFullStart, modifiers.childAt(0), TypeScript.DiagnosticCode.Modifiers_cannot_appear_here);
                return true;
            }

            return false;
        };

        GrammarCheckerWalker.prototype.visitFunctionDeclaration = function (node) {
            if (this.checkForDisallowedDeclareModifier(node.modifiers) || this.checkForDisallowedModifiers(node, node.modifiers) || this.checkForRequiredDeclareModifier(node, node.functionKeyword, node.modifiers) || this.checkModuleElementModifiers(node.modifiers)) {
                this.skip(node);
                return;
            }

            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = this.inAmbientDeclaration || this.syntaxTree.isDeclaration() || TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword);
            _super.prototype.visitFunctionDeclaration.call(this, node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        };

        GrammarCheckerWalker.prototype.visitVariableStatement = function (node) {
            if (this.checkForDisallowedDeclareModifier(node.modifiers) || this.checkForDisallowedModifiers(node, node.modifiers) || this.checkForRequiredDeclareModifier(node, node.variableDeclaration, node.modifiers) || this.checkModuleElementModifiers(node.modifiers)) {
                this.skip(node);
                return;
            }

            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = this.inAmbientDeclaration || this.syntaxTree.isDeclaration() || TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword);
            _super.prototype.visitVariableStatement.call(this, node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        };

        GrammarCheckerWalker.prototype.checkListSeparators = function (parent, list, kind) {
            var currentElementFullStart = this.childFullStart(parent, list);

            for (var i = 0, n = list.childCount(); i < n; i++) {
                var child = list.childAt(i);
                if (i % 2 === 1 && child.kind() !== kind) {
                    this.pushDiagnostic1(currentElementFullStart, child, TypeScript.DiagnosticCode._0_expected, [TypeScript.SyntaxFacts.getText(kind)]);
                }

                currentElementFullStart += child.fullWidth();
            }

            return false;
        };

        GrammarCheckerWalker.prototype.visitObjectType = function (node) {
            if (this.checkListSeparators(node, node.typeMembers, TypeScript.SyntaxKind.SemicolonToken)) {
                this.skip(node);
                return;
            }

            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = true;
            _super.prototype.visitObjectType.call(this, node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        };

        GrammarCheckerWalker.prototype.visitArrayType = function (node) {
            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = true;
            _super.prototype.visitArrayType.call(this, node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        };

        GrammarCheckerWalker.prototype.visitFunctionType = function (node) {
            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = true;
            _super.prototype.visitFunctionType.call(this, node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        };

        GrammarCheckerWalker.prototype.visitConstructorType = function (node) {
            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = true;
            _super.prototype.visitConstructorType.call(this, node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        };

        GrammarCheckerWalker.prototype.visitEqualsValueClause = function (node) {
            if (this.inAmbientDeclaration) {
                this.pushDiagnostic1(this.position(), node.firstToken(), TypeScript.DiagnosticCode.Initializers_are_not_allowed_in_ambient_contexts);
                this.skip(node);
                return;
            }

            _super.prototype.visitEqualsValueClause.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitConstructorDeclaration = function (node) {
            var savedCurrentConstructor = this.currentConstructor;
            this.currentConstructor = node;
            _super.prototype.visitConstructorDeclaration.call(this, node);
            this.currentConstructor = savedCurrentConstructor;
        };

        GrammarCheckerWalker.prototype.visitSourceUnit = function (node) {
            if (this.checkFunctionOverloads(node, node.moduleElements) || this.checkForDisallowedExports(node, node.moduleElements) || this.checkForMultipleExportAssignments(node, node.moduleElements)) {
                this.skip(node);
                return;
            }

            _super.prototype.visitSourceUnit.call(this, node);
        };

        GrammarCheckerWalker.prototype.visitExternalModuleReference = function (node) {
            if (node.moduleOrRequireKeyword.tokenKind === TypeScript.SyntaxKind.ModuleKeyword && !this.syntaxTree.parseOptions().allowModuleKeywordInExternalModuleReference()) {
                this.pushDiagnostic1(this.position(), node.moduleOrRequireKeyword, TypeScript.DiagnosticCode._module_______is_deprecated__Use__require_______instead);
                this.skip(node);
                return;
            }

            _super.prototype.visitExternalModuleReference.call(this, node);
        };
        return GrammarCheckerWalker;
    })(TypeScript.PositionTrackingWalker);
})(TypeScript || (TypeScript = {}));
