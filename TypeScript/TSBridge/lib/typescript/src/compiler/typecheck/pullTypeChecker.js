var TypeScript;
(function (TypeScript) {
    var TypeComparisonInfo = (function () {
        function TypeComparisonInfo(sourceComparisonInfo) {
            this.onlyCaptureFirstError = false;
            this.flags = TypeScript.TypeRelationshipFlags.SuccessfulComparison;
            this.message = "";
            this.stringConstantVal = null;
            this.indent = 1;
            if (sourceComparisonInfo) {
                this.flags = sourceComparisonInfo.flags;
                this.onlyCaptureFirstError = sourceComparisonInfo.onlyCaptureFirstError;
                this.stringConstantVal = sourceComparisonInfo.stringConstantVal;
                this.indent = sourceComparisonInfo.indent + 1;
            }
        }
        TypeComparisonInfo.prototype.addMessage = function (message) {
            if (!this.onlyCaptureFirstError && this.message) {
                this.message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode._0__NL__1_TB__2, [this.message, this.indent, message]);
            } else {
                this.message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode._0_TB__1, [this.indent, message]);
            }
        };

        TypeComparisonInfo.prototype.setMessage = function (message) {
            this.message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode._0_TB__1, [this.indent, message]);
        };
        return TypeComparisonInfo;
    })();
    TypeScript.TypeComparisonInfo = TypeComparisonInfo;

    var PullTypeCheckContext = (function () {
        function PullTypeCheckContext(compiler, script, scriptName) {
            this.compiler = compiler;
            this.script = script;
            this.scriptName = scriptName;
            this.enclosingDeclStack = [];
            this.enclosingDeclReturnStack = [];
            this.semanticInfo = null;
            this.inSuperConstructorCall = false;
            this.inSuperConstructorTarget = false;
            this.seenSuperConstructorCall = false;
            this.inConstructorArguments = false;
            this.inImportDeclaration = false;
        }
        PullTypeCheckContext.prototype.pushEnclosingDecl = function (decl) {
            this.enclosingDeclStack[this.enclosingDeclStack.length] = decl;
            this.enclosingDeclReturnStack[this.enclosingDeclReturnStack.length] = false;
        };

        PullTypeCheckContext.prototype.popEnclosingDecl = function () {
            this.enclosingDeclStack.length--;
            this.enclosingDeclReturnStack.length--;
        };

        PullTypeCheckContext.prototype.getEnclosingDecl = function (kind) {
            if (typeof kind === "undefined") { kind = TypeScript.PullElementKind.All; }
            for (var i = this.enclosingDeclStack.length - 1; i >= 0; i--) {
                var decl = this.enclosingDeclStack[i];
                if (decl.getKind() & kind) {
                    return decl;
                }
            }

            return null;
        };

        PullTypeCheckContext.prototype.getEnclosingNonLambdaDecl = function () {
            for (var i = this.enclosingDeclStack.length - 1; i >= 0; i--) {
                var decl = this.enclosingDeclStack[i];
                if (!(decl.getKind() === TypeScript.PullElementKind.FunctionExpression && (decl.getFlags() & TypeScript.PullElementFlags.FatArrow))) {
                    return decl;
                }
            }

            return null;
        };

        PullTypeCheckContext.prototype.getEnclosingClassDecl = function () {
            return this.getEnclosingDecl(TypeScript.PullElementKind.Class);
        };

        PullTypeCheckContext.prototype.getEnclosingDeclHasReturn = function () {
            return this.enclosingDeclReturnStack[this.enclosingDeclReturnStack.length - 1];
        };

        PullTypeCheckContext.prototype.setEnclosingDeclHasReturn = function () {
            return this.enclosingDeclReturnStack[this.enclosingDeclReturnStack.length - 1] = true;
        };
        return PullTypeCheckContext;
    })();
    TypeScript.PullTypeCheckContext = PullTypeCheckContext;

    var PullTypeChecker = (function () {
        function PullTypeChecker(compilationSettings, semanticInfoChain) {
            this.compilationSettings = compilationSettings;
            this.semanticInfoChain = semanticInfoChain;
            this.resolver = null;
            this.context = new TypeScript.PullTypeResolutionContext();
        }
        PullTypeChecker.prototype.setUnit = function (unitPath) {
            this.resolver = new TypeScript.PullTypeResolver(this.compilationSettings, this.semanticInfoChain, unitPath);
        };

        PullTypeChecker.prototype.getScriptDecl = function (fileName) {
            return this.semanticInfoChain.getUnit(fileName).getTopLevelDecls()[0];
        };

        PullTypeChecker.prototype.checkForResolutionError = function (typeSymbol, decl) {
            if (typeSymbol && typeSymbol.isError()) {
                decl.addDiagnostic((typeSymbol).getDiagnostic());
            }
        };

        PullTypeChecker.prototype.postError = function (offset, length, fileName, diagnosticCode, arguments, enclosingDecl) {
            enclosingDecl.addDiagnostic(new TypeScript.SemanticDiagnostic(fileName, offset, length, diagnosticCode, arguments));
        };

        PullTypeChecker.prototype.validateVariableDeclarationGroups = function (enclosingDecl, typeCheckContext) {
            var declGroups = enclosingDecl.getVariableDeclGroups();
            var decl;
            var firstSymbol;
            var symbol;
            var boundDeclAST;

            for (var i = 0; i < declGroups.length; i++) {
                for (var j = 0; j < declGroups[i].length; j++) {
                    decl = declGroups[i][j];
                    symbol = decl.getSymbol();
                    boundDeclAST = this.semanticInfoChain.getASTForDecl(decl);
                    this.resolver.resolveAST(boundDeclAST, false, enclosingDecl, this.context);
                    if (!j) {
                        firstSymbol = decl.getSymbol();

                        if (this.resolver.isAnyOrEquivalent(this.resolver.widenType(firstSymbol.getType()))) {
                            return;
                        }
                        continue;
                    }

                    if (!this.resolver.typesAreIdentical(symbol.getType(), firstSymbol.getType())) {
                        this.postError(boundDeclAST.minChar, boundDeclAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Subsequent_variable_declarations_must_have_the_same_type___Variable__0__must_be_of_type__1___but_here_has_type___2_, [symbol.getDisplayName(), firstSymbol.getType().toString(), symbol.getType().toString()], enclosingDecl);
                    }
                }
            }
        };

        PullTypeChecker.prototype.typeCheckAST = function (ast, typeCheckContext, inContextuallyTypedAssignment) {
            if (!ast) {
                return null;
            }

            if (ast.typeCheckPhase >= PullTypeChecker.globalPullTypeCheckPhase) {
                return null;
            } else {
                ast.typeCheckPhase = PullTypeChecker.globalPullTypeCheckPhase;
            }

            switch (ast.nodeType) {
                case TypeScript.NodeType.List:
                    return this.typeCheckList(ast, typeCheckContext);

                case TypeScript.NodeType.VariableDeclarator:
                case TypeScript.NodeType.Parameter:
                    return this.typeCheckBoundDecl(ast, typeCheckContext);

                case TypeScript.NodeType.FunctionDeclaration:
                    return this.typeCheckFunction(ast, typeCheckContext, inContextuallyTypedAssignment);

                case TypeScript.NodeType.ClassDeclaration:
                    return this.typeCheckClass(ast, typeCheckContext);

                case TypeScript.NodeType.InterfaceDeclaration:
                    return this.typeCheckInterface(ast, typeCheckContext);

                case TypeScript.NodeType.ModuleDeclaration:
                    return this.typeCheckModule(ast, typeCheckContext);

                case TypeScript.NodeType.TypeParameter:
                    return this.typeCheckTypeParameter(ast, typeCheckContext);

                case TypeScript.NodeType.ImportDeclaration:
                    return this.typeCheckImportDeclaration(ast, typeCheckContext);

                case TypeScript.NodeType.AssignmentExpression:
                    return this.typeCheckAssignment(ast, typeCheckContext);

                case TypeScript.NodeType.GenericType:
                    return this.typeCheckGenericType(ast, typeCheckContext);

                case TypeScript.NodeType.ObjectLiteralExpression:
                    return this.typeCheckObjectLiteral(ast, typeCheckContext, inContextuallyTypedAssignment);

                case TypeScript.NodeType.ArrayLiteralExpression:
                    return this.typeCheckArrayLiteral(ast, typeCheckContext, inContextuallyTypedAssignment);

                case TypeScript.NodeType.ThisExpression:
                    return this.typeCheckThisExpression(ast, typeCheckContext);

                case TypeScript.NodeType.SuperExpression:
                    return this.typeCheckSuperExpression(ast, typeCheckContext);

                case TypeScript.NodeType.InvocationExpression:
                    return this.typeCheckCallExpression(ast, typeCheckContext);

                case TypeScript.NodeType.ObjectCreationExpression:
                    return this.typeCheckObjectCreationExpression(ast, typeCheckContext);

                case TypeScript.NodeType.CastExpression:
                    return this.typeCheckTypeAssertion(ast, typeCheckContext);

                case TypeScript.NodeType.TypeRef:
                    return this.typeCheckTypeReference(ast, typeCheckContext);

                case TypeScript.NodeType.ExportAssignment:
                    return this.typeCheckExportAssignment(ast, typeCheckContext);

                case TypeScript.NodeType.NotEqualsWithTypeConversionExpression:
                case TypeScript.NodeType.EqualsWithTypeConversionExpression:
                case TypeScript.NodeType.EqualsExpression:
                case TypeScript.NodeType.NotEqualsExpression:
                case TypeScript.NodeType.LessThanExpression:
                case TypeScript.NodeType.LessThanOrEqualExpression:
                case TypeScript.NodeType.GreaterThanOrEqualExpression:
                case TypeScript.NodeType.GreaterThanExpression:
                    return this.typeCheckLogicalOperation(ast, typeCheckContext);

                case TypeScript.NodeType.CommaExpression:
                    return this.typeCheckCommaExpression(ast, typeCheckContext);

                case TypeScript.NodeType.AddExpression:
                case TypeScript.NodeType.AddAssignmentExpression:
                    return this.typeCheckBinaryAdditionOperation(ast, typeCheckContext);

                case TypeScript.NodeType.SubtractExpression:
                case TypeScript.NodeType.MultiplyExpression:
                case TypeScript.NodeType.DivideExpression:
                case TypeScript.NodeType.ModuloExpression:
                case TypeScript.NodeType.BitwiseOrExpression:
                case TypeScript.NodeType.BitwiseAndExpression:
                case TypeScript.NodeType.LeftShiftExpression:
                case TypeScript.NodeType.SignedRightShiftExpression:
                case TypeScript.NodeType.UnsignedRightShiftExpression:
                case TypeScript.NodeType.BitwiseExclusiveOrExpression:
                case TypeScript.NodeType.ExclusiveOrAssignmentExpression:
                case TypeScript.NodeType.LeftShiftAssignmentExpression:
                case TypeScript.NodeType.SignedRightShiftAssignmentExpression:
                case TypeScript.NodeType.UnsignedRightShiftAssignmentExpression:
                case TypeScript.NodeType.SubtractAssignmentExpression:
                case TypeScript.NodeType.MultiplyAssignmentExpression:
                case TypeScript.NodeType.DivideAssignmentExpression:
                case TypeScript.NodeType.ModuloAssignmentExpression:
                case TypeScript.NodeType.OrAssignmentExpression:
                case TypeScript.NodeType.AndAssignmentExpression:
                    return this.typeCheckBinaryArithmeticOperation(ast, typeCheckContext);

                case TypeScript.NodeType.PlusExpression:
                case TypeScript.NodeType.NegateExpression:
                case TypeScript.NodeType.BitwiseNotExpression:
                case TypeScript.NodeType.PostIncrementExpression:
                case TypeScript.NodeType.PreIncrementExpression:
                case TypeScript.NodeType.PostDecrementExpression:
                case TypeScript.NodeType.PreDecrementExpression:
                    return this.typeCheckUnaryArithmeticOperation(ast, typeCheckContext, inContextuallyTypedAssignment);

                case TypeScript.NodeType.ElementAccessExpression:
                    return this.typeCheckElementAccessExpression(ast, typeCheckContext);

                case TypeScript.NodeType.LogicalNotExpression:
                    return this.typeCheckLogicalNotExpression(ast, typeCheckContext, inContextuallyTypedAssignment);

                case TypeScript.NodeType.LogicalOrExpression:
                case TypeScript.NodeType.LogicalAndExpression:
                    return this.typeCheckLogicalAndOrExpression(ast, typeCheckContext);

                case TypeScript.NodeType.TypeOfExpression:
                    return this.typeCheckTypeOf(ast, typeCheckContext);

                case TypeScript.NodeType.ConditionalExpression:
                    return this.typeCheckConditionalExpression(ast, typeCheckContext);

                case TypeScript.NodeType.VoidExpression:
                    return this.typeCheckVoidExpression(ast, typeCheckContext);

                case TypeScript.NodeType.ThrowStatement:
                    return this.typeCheckThrowStatement(ast, typeCheckContext);

                case TypeScript.NodeType.DeleteExpression:
                    return this.typeCheckDeleteExpression(ast, typeCheckContext);

                case TypeScript.NodeType.RegularExpressionLiteral:
                    return this.typeCheckRegExpExpression(ast, typeCheckContext);

                case TypeScript.NodeType.InExpression:
                    return this.typeCheckInExpression(ast, typeCheckContext);

                case TypeScript.NodeType.InstanceOfExpression:
                    return this.typeCheckInstanceOfExpression(ast, typeCheckContext);

                case TypeScript.NodeType.ParenthesizedExpression:
                    return this.typeCheckParenthesizedExpression(ast, typeCheckContext);

                case TypeScript.NodeType.ForStatement:
                    return this.typeCheckForStatement(ast, typeCheckContext);

                case TypeScript.NodeType.ForInStatement:
                    return this.typeCheckForInStatement(ast, typeCheckContext);

                case TypeScript.NodeType.WhileStatement:
                    return this.typeCheckWhileStatement(ast, typeCheckContext);

                case TypeScript.NodeType.DoStatement:
                    return this.typeCheckDoStatement(ast, typeCheckContext);

                case TypeScript.NodeType.IfStatement:
                    return this.typeCheckIfStatement(ast, typeCheckContext);

                case TypeScript.NodeType.Block:
                    return this.typeCheckBlock(ast, typeCheckContext);

                case TypeScript.NodeType.VariableDeclaration:
                    return this.typeCheckVariableDeclaration(ast, typeCheckContext);

                case TypeScript.NodeType.VariableStatement:
                    return this.typeCheckVariableStatement(ast, typeCheckContext);

                case TypeScript.NodeType.WithStatement:
                    return this.typeCheckWithStatement(ast, typeCheckContext);

                case TypeScript.NodeType.TryStatement:
                    return this.typeCheckTryStatement(ast, typeCheckContext);

                case TypeScript.NodeType.CatchClause:
                    return this.typeCheckCatchClause(ast, typeCheckContext);

                case TypeScript.NodeType.ReturnStatement:
                    return this.typeCheckReturnStatement(ast, typeCheckContext);

                case TypeScript.NodeType.Name:
                    return this.typeCheckNameExpression(ast, typeCheckContext);

                case TypeScript.NodeType.MemberAccessExpression:
                    return this.typeCheckMemberAccessExpression(ast, typeCheckContext);

                case TypeScript.NodeType.SwitchStatement:
                    return this.typeCheckSwitchStatement(ast, typeCheckContext);

                case TypeScript.NodeType.ExpressionStatement:
                    return this.typeCheckExpressionStatement(ast, typeCheckContext, inContextuallyTypedAssignment);

                case TypeScript.NodeType.CaseClause:
                    return this.typeCheckCaseClause(ast, typeCheckContext);

                case TypeScript.NodeType.LabeledStatement:
                    return this.typeCheckLabeledStatement(ast, typeCheckContext);

                case TypeScript.NodeType.NumericLiteral:
                    return this.semanticInfoChain.numberTypeSymbol;

                case TypeScript.NodeType.StringLiteral:
                    return this.semanticInfoChain.stringTypeSymbol;

                case TypeScript.NodeType.NullLiteral:
                    return this.semanticInfoChain.nullTypeSymbol;

                case TypeScript.NodeType.TrueLiteral:
                case TypeScript.NodeType.FalseLiteral:
                    return this.semanticInfoChain.booleanTypeSymbol;

                case TypeScript.NodeType.TypeParameter:
                    return this.typeCheckTypeParameter(ast, typeCheckContext);

                default:
                    break;
            }

            return null;
        };

        PullTypeChecker.prototype.typeCheckScript = function (script, scriptName, compiler) {
            var unit = this.semanticInfoChain.getUnit(scriptName);

            if (unit.getTypeChecked()) {
                return;
            }

            var typeCheckContext = new PullTypeCheckContext(compiler, script, scriptName);

            this.setUnit(scriptName);

            typeCheckContext.semanticInfo = typeCheckContext.compiler.semanticInfoChain.getUnit(typeCheckContext.scriptName);
            var scriptDecl = typeCheckContext.semanticInfo.getTopLevelDecls()[0];
            typeCheckContext.pushEnclosingDecl(scriptDecl);

            PullTypeChecker.globalPullTypeCheckPhase++;

            this.typeCheckAST(script.moduleElements, typeCheckContext, false);

            this.validateVariableDeclarationGroups(scriptDecl, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            unit.setTypeChecked();
        };

        PullTypeChecker.prototype.typeCheckList = function (list, typeCheckContext) {
            if (!list) {
                return null;
            }

            for (var i = 0; i < list.members.length; i++) {
                this.typeCheckAST(list.members[i], typeCheckContext, false);
            }
        };

        PullTypeChecker.prototype.reportDiagnostics = function (symbolAndDiagnostics, enclosingDecl) {
            if (symbolAndDiagnostics && symbolAndDiagnostics.diagnostics) {
                for (var i = 0, n = symbolAndDiagnostics.diagnostics.length; i < n; i++) {
                    this.context.postDiagnostic(symbolAndDiagnostics.diagnostics[i], enclosingDecl, true);
                }
            }
        };

        PullTypeChecker.prototype.resolveSymbolAndReportDiagnostics = function (ast, inContextuallyTypedAssignment, enclosingDecl) {
            var symbolAndDiagnostics = this.resolver.resolveAST(ast, inContextuallyTypedAssignment, enclosingDecl, this.context);

            this.reportDiagnostics(symbolAndDiagnostics, enclosingDecl);
            return symbolAndDiagnostics && symbolAndDiagnostics.symbol;
        };

        PullTypeChecker.prototype.typeCheckBoundDecl = function (ast, typeCheckContext) {
            var _this = this;
            var boundDeclAST = ast;

            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var typeExprSymbol = null;

            if (boundDeclAST.typeExpr) {
                typeExprSymbol = this.typeCheckAST(boundDeclAST.typeExpr, typeCheckContext, false);

                if (typeExprSymbol.isNamedTypeSymbol() && typeExprSymbol.isGeneric() && !typeExprSymbol.isTypeParameter() && !this.resolver.isArrayOrEquivalent(typeExprSymbol) && typeExprSymbol.isResolved() && typeExprSymbol.getTypeParameters().length && typeExprSymbol.getTypeArguments() == null && !typeExprSymbol.getIsSpecialized() && this.resolver.isTypeRefWithoutTypeArgs(boundDeclAST.typeExpr)) {
                    this.postError(boundDeclAST.typeExpr.minChar, boundDeclAST.typeExpr.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Generic_type_references_must_include_all_type_arguments, null, enclosingDecl);
                    typeExprSymbol = this.resolver.specializeTypeToAny(typeExprSymbol, enclosingDecl, this.context);
                }
            }

            if (boundDeclAST.init) {
                if (typeExprSymbol) {
                    this.context.pushContextualType(typeExprSymbol, this.context.inProvisionalResolution(), null);
                }

                var initTypeSymbol = this.typeCheckAST(boundDeclAST.init, typeCheckContext, !!typeExprSymbol);

                if (typeExprSymbol) {
                    this.context.popContextualType();
                }

                if (typeExprSymbol && typeExprSymbol.isContainer()) {
                    var exportedTypeSymbol = (typeExprSymbol).getExportAssignedTypeSymbol();

                    if (exportedTypeSymbol) {
                        typeExprSymbol = exportedTypeSymbol;
                    } else {
                        var instanceTypeSymbol = (typeExprSymbol.getType()).getInstanceSymbol();

                        if (!instanceTypeSymbol || !TypeScript.PullHelpers.symbolIsEnum(instanceTypeSymbol)) {
                            this.postError(boundDeclAST.minChar, boundDeclAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Tried_to_set_variable_type_to_module_type__0__, [typeExprSymbol.toString()], enclosingDecl);
                            typeExprSymbol = null;
                        } else {
                            typeExprSymbol = instanceTypeSymbol.getType();
                        }
                    }
                }

                if (initTypeSymbol && initTypeSymbol.isContainer()) {
                    instanceTypeSymbol = (initTypeSymbol.getType()).getInstanceSymbol();

                    if (!instanceTypeSymbol) {
                        this.postError(boundDeclAST.minChar, boundDeclAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Tried_to_set_variable_type_to_uninitialized_module_type__0__, [initTypeSymbol.toString()], enclosingDecl);
                        initTypeSymbol = null;
                    } else {
                        initTypeSymbol = instanceTypeSymbol.getType();
                    }
                }

                if (initTypeSymbol && typeExprSymbol) {
                    var comparisonInfo = new TypeComparisonInfo();

                    var isAssignable = this.resolver.sourceIsAssignableToTarget(initTypeSymbol, typeExprSymbol, this.context, comparisonInfo);

                    if (!isAssignable) {
                        if (comparisonInfo.message) {
                            this.postError(boundDeclAST.minChar, boundDeclAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Cannot_convert__0__to__1__NL__2, [initTypeSymbol.toString(), typeExprSymbol.toString(), comparisonInfo.message], enclosingDecl);
                        } else {
                            this.postError(boundDeclAST.minChar, boundDeclAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Cannot_convert__0__to__1_, [initTypeSymbol.toString(), typeExprSymbol.toString()], enclosingDecl);
                        }
                    }
                }
            }

            var prevSupressErrors = this.context.suppressErrors;
            this.context.suppressErrors = true;
            var decl = this.resolver.getDeclForAST(boundDeclAST);

            var varTypeSymbol = this.resolveSymbolAndReportDiagnostics(boundDeclAST, false, enclosingDecl).getType();

            if (typeExprSymbol && typeExprSymbol.isContainer() && varTypeSymbol.isError()) {
                this.checkForResolutionError(varTypeSymbol, decl);
            }

            this.context.suppressErrors = prevSupressErrors;

            var declSymbol = decl.getSymbol();

            if (declSymbol.getKind() != TypeScript.PullElementKind.Parameter && (declSymbol.getKind() != TypeScript.PullElementKind.Property || declSymbol.getContainer().isNamedTypeSymbol())) {
                this.checkTypePrivacy(declSymbol, varTypeSymbol, typeCheckContext, function (typeSymbol) {
                    return _this.variablePrivacyErrorReporter(declSymbol, typeSymbol, typeCheckContext);
                });
            }

            return varTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckImportDeclaration = function (importDeclaration, typeCheckContext) {
            var result = this.resolveSymbolAndReportDiagnostics(importDeclaration, false, typeCheckContext.getEnclosingDecl());

            var savedInImportDeclaration = typeCheckContext.inImportDeclaration;
            typeCheckContext.inImportDeclaration = true;
            this.typeCheckAST(importDeclaration.alias, typeCheckContext, false);
            typeCheckContext.inImportDeclaration = savedInImportDeclaration;

            return result;
        };

        PullTypeChecker.prototype.typeCheckFunction = function (funcDeclAST, typeCheckContext, inContextuallyTypedAssignment) {
            if (funcDeclAST.isConstructor || TypeScript.hasFlag(funcDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.ConstructMember)) {
                return this.typeCheckConstructor(funcDeclAST, typeCheckContext, inContextuallyTypedAssignment);
            } else if (TypeScript.hasFlag(funcDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.IndexerMember)) {
                return this.typeCheckIndexer(funcDeclAST, typeCheckContext, inContextuallyTypedAssignment);
            } else if (funcDeclAST.isAccessor()) {
                return this.typeCheckAccessor(funcDeclAST, typeCheckContext, inContextuallyTypedAssignment);
            }

            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var functionSymbol = this.resolveSymbolAndReportDiagnostics(funcDeclAST, inContextuallyTypedAssignment, enclosingDecl);
            var functionDecl = typeCheckContext.semanticInfo.getDeclForAST(funcDeclAST);

            typeCheckContext.pushEnclosingDecl(functionDecl);

            this.typeCheckAST(funcDeclAST.typeArguments, typeCheckContext, inContextuallyTypedAssignment);
            this.typeCheckAST(funcDeclAST.arguments, typeCheckContext, inContextuallyTypedAssignment);
            this.typeCheckAST(funcDeclAST.returnTypeAnnotation, typeCheckContext, false);
            this.typeCheckAST(funcDeclAST.block, typeCheckContext, false);

            var hasReturn = typeCheckContext.getEnclosingDeclHasReturn();

            this.validateVariableDeclarationGroups(functionDecl, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            var functionSignature = functionDecl.getSignatureSymbol();

            var parameters = functionSignature.getParameters();

            if (parameters.length) {
                for (var i = 0; i < parameters.length; i++) {
                    this.checkForResolutionError(parameters[i].getType(), enclosingDecl);
                }
            }

            var returnType = functionSignature.getReturnType();

            this.checkForResolutionError(returnType, enclosingDecl);

            if (funcDeclAST.block && funcDeclAST.returnTypeAnnotation != null && !hasReturn) {
                var isVoidOrAny = this.resolver.isAnyOrEquivalent(returnType) || returnType === this.semanticInfoChain.voidTypeSymbol;

                if (!isVoidOrAny && !(funcDeclAST.block.statements.members.length > 0 && funcDeclAST.block.statements.members[0].nodeType === TypeScript.NodeType.ThrowStatement)) {
                    var funcName = functionDecl.getDisplayName();
                    funcName = funcName ? "'" + funcName + "'" : "expression";

                    this.postError(funcDeclAST.returnTypeAnnotation.minChar, funcDeclAST.returnTypeAnnotation.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Function__0__declared_a_non_void_return_type__but_has_no_return_expression, [funcName], typeCheckContext.getEnclosingDecl());
                }
            }

            this.typeCheckFunctionOverloads(funcDeclAST, typeCheckContext);
            this.checkFunctionTypePrivacy(funcDeclAST, inContextuallyTypedAssignment, typeCheckContext);

            return functionSymbol ? functionSymbol.getType() : null;
        };

        PullTypeChecker.prototype.typeCheckFunctionOverloads = function (funcDecl, typeCheckContext, signature, allSignatures) {
            if (!signature) {
                var functionSignatureInfo = TypeScript.PullHelpers.getSignatureForFuncDecl(funcDecl, typeCheckContext.semanticInfo);
                signature = functionSignatureInfo.signature;
                allSignatures = functionSignatureInfo.allSignatures;
            }

            var funcSymbol = typeCheckContext.semanticInfo.getSymbolAndDiagnosticsForAST(funcDecl).symbol;

            var definitionSignature = null;
            for (var i = allSignatures.length - 1; i >= 0; i--) {
                if (allSignatures[i].isDefinition()) {
                    definitionSignature = allSignatures[i];
                    break;
                }
            }

            if (!signature.isDefinition()) {
                for (var i = 0; i < allSignatures.length; i++) {
                    if (allSignatures[i] === signature) {
                        break;
                    }

                    if (this.resolver.signaturesAreIdentical(allSignatures[i], signature)) {
                        if (funcDecl.isConstructor) {
                            this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Duplicate_constructor_overload_signature, null, typeCheckContext.getEnclosingDecl());
                        } else if (funcDecl.isConstructMember()) {
                            this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Duplicate_overload_construct_signature, null, typeCheckContext.getEnclosingDecl());
                        } else if (funcDecl.isCallMember()) {
                            this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Duplicate_overload_call_signature, null, typeCheckContext.getEnclosingDecl());
                        } else {
                            this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Duplicate_overload_signature_for__0_, [funcSymbol.getScopedNameEx().toString()], typeCheckContext.getEnclosingDecl());
                        }

                        break;
                    }
                }
            }

            var isConstantOverloadSignature = signature.isStringConstantOverloadSignature();
            if (isConstantOverloadSignature) {
                if (signature.isDefinition()) {
                    this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Overload_signature_implementation_cannot_use_specialized_type, null, typeCheckContext.getEnclosingDecl());
                } else {
                    var resolutionContext = new TypeScript.PullTypeResolutionContext();
                    var foundSubtypeSignature = false;
                    for (var i = 0; i < allSignatures.length; i++) {
                        if (allSignatures[i].isDefinition() || allSignatures[i] === signature) {
                            continue;
                        }

                        if (!allSignatures[i].isResolved()) {
                            this.resolver.resolveDeclaredSymbol(allSignatures[i], typeCheckContext.getEnclosingDecl(), resolutionContext);
                        }

                        if (allSignatures[i].isStringConstantOverloadSignature()) {
                            continue;
                        }

                        if (this.resolver.signatureIsSubtypeOfTarget(signature, allSignatures[i], resolutionContext)) {
                            foundSubtypeSignature = true;
                            break;
                        }
                    }

                    if (!foundSubtypeSignature) {
                        this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Specialized_overload_signature_is_not_subtype_of_any_non_specialized_signature, null, typeCheckContext.getEnclosingDecl());
                    }
                }
            } else if (definitionSignature && definitionSignature != signature) {
                var comparisonInfo = new TypeComparisonInfo();
                var resolutionContext = new TypeScript.PullTypeResolutionContext();
                if (!definitionSignature.isResolved()) {
                    this.resolver.resolveDeclaredSymbol(definitionSignature, typeCheckContext.getEnclosingDecl(), resolutionContext);
                }

                if (!this.resolver.signatureIsAssignableToTarget(definitionSignature, signature, resolutionContext, comparisonInfo)) {
                    if (comparisonInfo.message) {
                        this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Overload_signature_is_not_compatible_with_function_definition__NL__0, [comparisonInfo.message], typeCheckContext.getEnclosingDecl());
                    } else {
                        this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Overload_signature_is_not_compatible_with_function_definition, null, typeCheckContext.getEnclosingDecl());
                    }
                }
            }

            var signatureForVisibilityCheck = definitionSignature;
            if (!definitionSignature) {
                if (allSignatures[0] === signature) {
                    return;
                }
                signatureForVisibilityCheck = allSignatures[0];
            }

            if (!funcDecl.isConstructor && !funcDecl.isConstructMember() && signature != signatureForVisibilityCheck) {
                var errorCode;

                if (signatureForVisibilityCheck.hasFlag(TypeScript.PullElementFlags.Private) != signature.hasFlag(TypeScript.PullElementFlags.Private)) {
                    errorCode = TypeScript.DiagnosticCode.Overload_signatures_must_all_be_public_or_private;
                } else if (signatureForVisibilityCheck.hasFlag(TypeScript.PullElementFlags.Exported) != signature.hasFlag(TypeScript.PullElementFlags.Exported)) {
                    errorCode = TypeScript.DiagnosticCode.Overload_signatures_must_all_be_exported_or_local;
                } else if (signatureForVisibilityCheck.hasFlag(TypeScript.PullElementFlags.Ambient) != signature.hasFlag(TypeScript.PullElementFlags.Ambient)) {
                    errorCode = TypeScript.DiagnosticCode.Overload_signatures_must_all_be_ambient_or_non_ambient;
                } else if (signatureForVisibilityCheck.hasFlag(TypeScript.PullElementFlags.Optional) != signature.hasFlag(TypeScript.PullElementFlags.Optional)) {
                    errorCode = TypeScript.DiagnosticCode.Overload_signatures_must_all_be_optional_or_required;
                }

                if (errorCode) {
                    this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, errorCode, null, typeCheckContext.getEnclosingDecl());
                }
            }
        };

        PullTypeChecker.prototype.typeCheckTypeParameter = function (typeParameter, typeCheckContext) {
            if (typeParameter.constraint) {
                var constraintType = this.typeCheckAST(typeParameter.constraint, typeCheckContext, false);

                if (constraintType && !constraintType.isError() && constraintType.isPrimitive()) {
                    this.postError(typeParameter.constraint.minChar, typeParameter.constraint.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Type_parameter_constraint_cannot_be_a_primitive_type, null, typeCheckContext.getEnclosingDecl());
                }
            }

            return this.resolveSymbolAndReportDiagnostics(typeParameter, false, typeCheckContext.getEnclosingDecl());
        };

        PullTypeChecker.prototype.typeCheckAccessor = function (ast, typeCheckContext, inContextuallyTypedAssignment) {
            var funcDeclAST = ast;

            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var accessorSymbol = this.resolveSymbolAndReportDiagnostics(ast, inContextuallyTypedAssignment, enclosingDecl);
            this.checkForResolutionError(accessorSymbol.getType(), enclosingDecl);

            var isGetter = TypeScript.hasFlag(funcDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.GetAccessor);
            var isSetter = !isGetter;

            var getter = accessorSymbol.getGetter();
            var setter = accessorSymbol.getSetter();

            var functionDecl = typeCheckContext.semanticInfo.getDeclForAST(funcDeclAST);
            typeCheckContext.pushEnclosingDecl(functionDecl);

            this.typeCheckAST(funcDeclAST.arguments, typeCheckContext, inContextuallyTypedAssignment);

            this.typeCheckAST(funcDeclAST.block, typeCheckContext, false);

            var hasReturn = typeCheckContext.getEnclosingDeclHasReturn();

            this.validateVariableDeclarationGroups(functionDecl, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            var functionSignature = functionDecl.getSignatureSymbol();

            var parameters = functionSignature.getParameters();

            var returnType = functionSignature.getReturnType();

            this.checkForResolutionError(returnType, enclosingDecl);

            var funcNameAST = funcDeclAST.name;

            if (isGetter && !hasReturn) {
                if (!(funcDeclAST.block.statements.members.length > 0 && funcDeclAST.block.statements.members[0].nodeType === TypeScript.NodeType.ThrowStatement)) {
                    this.postError(funcNameAST.minChar, funcNameAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Getters_must_return_a_value, null, typeCheckContext.getEnclosingDecl());
                }
            }

            if (getter && setter) {
                var getterDecl = getter.getDeclarations()[0];
                var setterDecl = setter.getDeclarations()[0];

                var getterIsPrivate = getterDecl.getFlags() & TypeScript.PullElementFlags.Private;
                var setterIsPrivate = setterDecl.getFlags() & TypeScript.PullElementFlags.Private;

                if (getterIsPrivate != setterIsPrivate) {
                    this.postError(funcNameAST.minChar, funcNameAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Getter_and_setter_accessors_do_not_agree_in_visibility, null, typeCheckContext.getEnclosingDecl());
                }
            }

            this.checkFunctionTypePrivacy(funcDeclAST, inContextuallyTypedAssignment, typeCheckContext);

            return null;
        };

        PullTypeChecker.prototype.typeCheckConstructor = function (funcDeclAST, typeCheckContext, inContextuallyTypedAssignment) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var functionSymbol = this.resolveSymbolAndReportDiagnostics(funcDeclAST, inContextuallyTypedAssignment, enclosingDecl);

            var functionDecl = typeCheckContext.semanticInfo.getDeclForAST(funcDeclAST);
            typeCheckContext.pushEnclosingDecl(functionDecl);

            this.typeCheckAST(funcDeclAST.typeArguments, typeCheckContext, inContextuallyTypedAssignment);

            typeCheckContext.inConstructorArguments = true;
            this.typeCheckAST(funcDeclAST.arguments, typeCheckContext, inContextuallyTypedAssignment);
            typeCheckContext.inConstructorArguments = false;

            typeCheckContext.seenSuperConstructorCall = false;

            this.typeCheckAST(funcDeclAST.returnTypeAnnotation, typeCheckContext, false);

            this.typeCheckAST(funcDeclAST.block, typeCheckContext, false);

            this.validateVariableDeclarationGroups(functionDecl, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            var constructorSignature = functionDecl.getSignatureSymbol();

            var parameters = constructorSignature.getParameters();

            if (parameters.length) {
                for (var i = 0, n = parameters.length; i < n; i++) {
                    this.checkForResolutionError(parameters[i].getType(), enclosingDecl);
                }
            }

            this.checkForResolutionError(constructorSignature.getReturnType(), enclosingDecl);

            if (functionDecl.getSignatureSymbol() && functionDecl.getSignatureSymbol().isDefinition() && this.enclosingClassIsDerived(typeCheckContext)) {
                if (!typeCheckContext.seenSuperConstructorCall) {
                    this.postError(funcDeclAST.minChar, 11, typeCheckContext.scriptName, TypeScript.DiagnosticCode.Constructors_for_derived_classes_must_contain_a__super__call, null, enclosingDecl);
                } else if (this.superCallMustBeFirstStatementInConstructor(functionDecl, enclosingDecl)) {
                    var firstStatement = this.getFirstStatementFromFunctionDeclAST(funcDeclAST);
                    if (!firstStatement || !this.isSuperCallNode(firstStatement)) {
                        this.postError(funcDeclAST.minChar, 11, typeCheckContext.scriptName, TypeScript.DiagnosticCode.A__super__call_must_be_the_first_statement_in_the_constructor_when_a_class_contains_intialized_properties_or_has_parameter_properties, null, enclosingDecl);
                    }
                }
            }

            this.typeCheckFunctionOverloads(funcDeclAST, typeCheckContext);
            this.checkFunctionTypePrivacy(funcDeclAST, inContextuallyTypedAssignment, typeCheckContext);
            return functionSymbol ? functionSymbol.getType() : null;
        };

        PullTypeChecker.prototype.typeCheckIndexer = function (ast, typeCheckContext, inContextuallyTypedAssignment) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            this.resolver.resolveAST(ast, inContextuallyTypedAssignment, enclosingDecl, this.context);

            var funcDeclAST = ast;

            var functionDecl = typeCheckContext.semanticInfo.getDeclForAST(funcDeclAST);
            typeCheckContext.pushEnclosingDecl(functionDecl);

            this.typeCheckAST(funcDeclAST.arguments, typeCheckContext, false);

            this.typeCheckAST(funcDeclAST.returnTypeAnnotation, typeCheckContext, false);

            typeCheckContext.popEnclosingDecl();

            var indexSignature = functionDecl.getSignatureSymbol();
            var parameters = indexSignature.getParameters();

            if (parameters.length) {
                var parameterType = null;

                for (var i = 0; i < parameters.length; i++) {
                    this.checkForResolutionError(parameters[i].getType(), enclosingDecl);
                }
            }

            this.checkForResolutionError(indexSignature.getReturnType(), enclosingDecl);
            this.checkFunctionTypePrivacy(funcDeclAST, inContextuallyTypedAssignment, typeCheckContext);

            var isNumericIndexer = parameters[0].getType() === this.semanticInfoChain.numberTypeSymbol;

            var allIndexSignatures = enclosingDecl.getSymbol().getType().getIndexSignatures();
            for (var i = 0; i < allIndexSignatures.length; i++) {
                if (!allIndexSignatures[i].isResolved()) {
                    this.resolver.resolveDeclaredSymbol(allIndexSignatures[i], allIndexSignatures[i].getDeclarations()[0].getParentDecl(), this.context);
                }
                if (allIndexSignatures[i].getParameters()[0].getType() !== parameters[0].getType()) {
                    var stringIndexSignature;
                    var numberIndexSignature;
                    if (isNumericIndexer) {
                        numberIndexSignature = indexSignature;
                        stringIndexSignature = allIndexSignatures[i];
                    } else {
                        numberIndexSignature = allIndexSignatures[i];
                        stringIndexSignature = indexSignature;

                        if (enclosingDecl.getSymbol() === numberIndexSignature.getDeclarations()[0].getParentDecl().getSymbol()) {
                            break;
                        }
                    }
                    var comparisonInfo = new TypeComparisonInfo();
                    var resolutionContext = new TypeScript.PullTypeResolutionContext();
                    if (!this.resolver.sourceIsSubtypeOfTarget(numberIndexSignature.getReturnType(), stringIndexSignature.getReturnType(), resolutionContext, comparisonInfo)) {
                        if (comparisonInfo.message) {
                            this.postError(funcDeclAST.minChar, funcDeclAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Numeric_indexer_type___0___must_be_a_subtype_of_string_indexer_type___1____NL__2, [numberIndexSignature.getReturnType().toString(), stringIndexSignature.getReturnType().toString(), comparisonInfo.message], typeCheckContext.getEnclosingDecl());
                        } else {
                            this.postError(funcDeclAST.minChar, funcDeclAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Numeric_indexer_type___0___must_be_a_subtype_of_string_indexer_type___1__, [numberIndexSignature.getReturnType().toString(), stringIndexSignature.getReturnType().toString()], typeCheckContext.getEnclosingDecl());
                        }
                    }
                    break;
                }
            }

            var allMembers = enclosingDecl.getSymbol().getType().getAllMembers(TypeScript.PullElementKind.All, true);
            for (var i = 0; i < allMembers.length; i++) {
                var name = allMembers[i].getName();
                if (name) {
                    if (!allMembers[i].isResolved()) {
                        this.resolver.resolveDeclaredSymbol(allMembers[i], allMembers[i].getDeclarations()[0].getParentDecl(), this.context);
                    }

                    if (enclosingDecl.getSymbol() !== allMembers[i].getContainer()) {
                        var isMemberNumeric = isFinite(+name);
                        if (isNumericIndexer === isMemberNumeric) {
                            this.checkThatMemberIsSubtypeOfIndexer(allMembers[i], indexSignature, funcDeclAST, typeCheckContext, isNumericIndexer);
                        }
                    }
                }
            }

            return null;
        };

        PullTypeChecker.prototype.typeCheckMembersAgainstIndexer = function (containerType, typeCheckContext) {
            var indexSignatures = containerType.getIndexSignatures();
            if (indexSignatures.length > 0) {
                var members = typeCheckContext.getEnclosingDecl().getChildDecls();
                for (var i = 0; i < members.length; i++) {
                    var member = members[i];
                    if (!member.getName() || member.getKind() & TypeScript.PullElementKind.SomeSignature) {
                        continue;
                    }

                    var isMemberNumeric = isFinite(+member.getName());
                    for (var j = 0; j < indexSignatures.length; j++) {
                        if (!indexSignatures[j].isResolved()) {
                            this.resolver.resolveDeclaredSymbol(indexSignatures[j], indexSignatures[j].getDeclarations()[0].getParentDecl(), this.context);
                        }
                        if ((indexSignatures[j].getParameters()[0].getType() === this.semanticInfoChain.numberTypeSymbol) === isMemberNumeric) {
                            this.checkThatMemberIsSubtypeOfIndexer(member.getSymbol(), indexSignatures[j], this.semanticInfoChain.getASTForDecl(member), typeCheckContext, isMemberNumeric);
                            break;
                        }
                    }
                }
            }
        };

        PullTypeChecker.prototype.checkThatMemberIsSubtypeOfIndexer = function (member, indexSignature, astForError, typeCheckContext, isNumeric) {
            var comparisonInfo = new TypeComparisonInfo();
            var resolutionContext = new TypeScript.PullTypeResolutionContext();
            if (!this.resolver.sourceIsSubtypeOfTarget(member.getType(), indexSignature.getReturnType(), resolutionContext, comparisonInfo)) {
                if (isNumeric) {
                    if (comparisonInfo.message) {
                        this.postError(astForError.minChar, astForError.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.All_numerically_named_properties_must_be_subtypes_of_numeric_indexer_type___0____NL__1, [indexSignature.getReturnType().toString(), comparisonInfo.message], typeCheckContext.getEnclosingDecl());
                    } else {
                        this.postError(astForError.minChar, astForError.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.All_numerically_named_properties_must_be_subtypes_of_numeric_indexer_type___0__, [indexSignature.getReturnType().toString()], typeCheckContext.getEnclosingDecl());
                    }
                } else {
                    if (comparisonInfo.message) {
                        this.postError(astForError.minChar, astForError.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.All_named_properties_must_be_subtypes_of_string_indexer_type___0____NL__1, [indexSignature.getReturnType().toString(), comparisonInfo.message], typeCheckContext.getEnclosingDecl());
                    } else {
                        this.postError(astForError.minChar, astForError.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.All_named_properties_must_be_subtypes_of_string_indexer_type___0__, [indexSignature.getReturnType().toString()], typeCheckContext.getEnclosingDecl());
                    }
                }
            }
        };

        PullTypeChecker.prototype.typeCheckIfTypeMemberPropertyOkToOverride = function (typeSymbol, extendedType, typeMember, extendedTypeMember, comparisonInfo) {
            if (!typeSymbol.isClass()) {
                return true;
            }

            var typeMemberKind = typeMember.getKind();
            var extendedMemberKind = extendedTypeMember.getKind();

            if (typeMemberKind === extendedMemberKind) {
                return true;
            }

            var errorCode;
            if (typeMemberKind === TypeScript.PullElementKind.Property) {
                if (typeMember.isAccessor()) {
                    errorCode = TypeScript.DiagnosticCode.Class__0__defines_instance_member_accessor__1___but_extended_class__2__defines_it_as_instance_member_function;
                } else {
                    errorCode = TypeScript.DiagnosticCode.Class__0__defines_instance_member_property__1___but_extended_class__2__defines_it_as_instance_member_function;
                }
            } else if (typeMemberKind === TypeScript.PullElementKind.Method) {
                if (extendedTypeMember.isAccessor()) {
                    errorCode = TypeScript.DiagnosticCode.Class__0__defines_instance_member_function__1___but_extended_class__2__defines_it_as_instance_member_accessor;
                } else {
                    errorCode = TypeScript.DiagnosticCode.Class__0__defines_instance_member_function__1___but_extended_class__2__defines_it_as_instance_member_property;
                }
            }

            var message = TypeScript.getDiagnosticMessage(errorCode, [typeSymbol.toString(), typeMember.getScopedNameEx().toString(), extendedType.toString()]);
            comparisonInfo.addMessage(message);
            return false;
        };

        PullTypeChecker.prototype.typeCheckIfTypeExtendsType = function (typeDecl, typeSymbol, extendedType, typeCheckContext) {
            var typeMembers = typeSymbol.getMembers();

            var resolutionContext = new TypeScript.PullTypeResolutionContext();
            var comparisonInfo = new TypeComparisonInfo();
            var foundError = false;

            for (var i = 0; i < typeMembers.length; i++) {
                var propName = typeMembers[i].getName();
                var extendedTypeProp = extendedType.findMember(propName);
                if (extendedTypeProp) {
                    foundError = !this.typeCheckIfTypeMemberPropertyOkToOverride(typeSymbol, extendedType, typeMembers[i], extendedTypeProp, comparisonInfo);

                    if (!foundError) {
                        foundError = !this.resolver.sourcePropertyIsSubtypeOfTargetProperty(typeSymbol, extendedType, typeMembers[i], extendedTypeProp, resolutionContext, comparisonInfo);
                    }

                    if (foundError) {
                        break;
                    }
                }
            }

            if (!foundError && typeSymbol.hasOwnCallSignatures()) {
                foundError = !this.resolver.sourceCallSignaturesAreSubtypeOfTargetCallSignatures(typeSymbol, extendedType, resolutionContext, comparisonInfo);
            }

            if (!foundError && typeSymbol.hasOwnConstructSignatures()) {
                foundError = !this.resolver.sourceConstructSignaturesAreSubtypeOfTargetConstructSignatures(typeSymbol, extendedType, resolutionContext, comparisonInfo);
            }

            if (!foundError && typeSymbol.hasOwnIndexSignatures()) {
                foundError = !this.resolver.sourceIndexSignaturesAreSubtypeOfTargetIndexSignatures(typeSymbol, extendedType, resolutionContext, comparisonInfo);
            }

            if (!foundError && typeSymbol.isClass()) {
                var typeConstructorType = (typeSymbol).getConstructorMethod().getType();
                var typeConstructorTypeMembers = typeConstructorType.getMembers();
                if (typeConstructorTypeMembers.length) {
                    var extendedConstructorType = (extendedType).getConstructorMethod().getType();
                    var comparisonInfoForPropTypeCheck = new TypeComparisonInfo(comparisonInfo);

                    for (var i = 0; i < typeConstructorTypeMembers.length; i++) {
                        var propName = typeConstructorTypeMembers[i].getName();
                        var extendedConstructorTypeProp = extendedConstructorType.findMember(propName);
                        if (extendedConstructorTypeProp) {
                            if (!extendedConstructorTypeProp.isResolved()) {
                                var extendedClassAst = typeCheckContext.semanticInfo.getASTForSymbol(extendedType);
                                var extendedClassDecl = typeCheckContext.semanticInfo.getDeclForAST(extendedClassAst);
                                this.resolver.resolveDeclaredSymbol(extendedConstructorTypeProp, extendedClassDecl, resolutionContext);
                            }

                            var typeConstructorTypePropType = typeConstructorTypeMembers[i].getType();
                            var extendedConstructorTypePropType = extendedConstructorTypeProp.getType();
                            if (!this.resolver.sourceIsSubtypeOfTarget(typeConstructorTypePropType, extendedConstructorTypePropType, resolutionContext, comparisonInfoForPropTypeCheck)) {
                                var propMessage;
                                if (comparisonInfoForPropTypeCheck.message) {
                                    propMessage = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Types_of_static_property__0__of_class__1__and_class__2__are_incompatible__NL__3, [extendedConstructorTypeProp.getScopedNameEx().toString(), typeSymbol.toString(), extendedType.toString(), comparisonInfoForPropTypeCheck.message]);
                                } else {
                                    propMessage = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Types_of_static_property__0__of_class__1__and_class__2__are_incompatible, [extendedConstructorTypeProp.getScopedNameEx().toString(), typeSymbol.toString(), extendedType.toString()]);
                                }
                                comparisonInfo.addMessage(propMessage);
                                foundError = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (foundError) {
                var errorCode;
                if (typeSymbol.isClass()) {
                    errorCode = TypeScript.DiagnosticCode.Class__0__cannot_extend_class__1__NL__2;
                } else {
                    if (extendedType.isClass()) {
                        errorCode = TypeScript.DiagnosticCode.Interface__0__cannot_extend_class__1__NL__2;
                    } else {
                        errorCode = TypeScript.DiagnosticCode.Interface__0__cannot_extend_interface__1__NL__2;
                    }
                }

                this.postError(typeDecl.name.minChar, typeDecl.name.getLength(), typeCheckContext.scriptName, errorCode, [typeSymbol.getScopedName(), extendedType.getScopedName(), comparisonInfo.message], typeCheckContext.getEnclosingDecl());
            }
        };

        PullTypeChecker.prototype.typeCheckIfClassImplementsType = function (classDecl, classSymbol, implementedType, typeCheckContext) {
            var resolutionContext = new TypeScript.PullTypeResolutionContext();
            var comparisonInfo = new TypeComparisonInfo();
            var foundError = !this.resolver.sourceMembersAreSubtypeOfTargetMembers(classSymbol, implementedType, resolutionContext, comparisonInfo);
            if (!foundError) {
                foundError = !this.resolver.sourceCallSignaturesAreSubtypeOfTargetCallSignatures(classSymbol, implementedType, resolutionContext, comparisonInfo);
                if (!foundError) {
                    foundError = !this.resolver.sourceConstructSignaturesAreSubtypeOfTargetConstructSignatures(classSymbol, implementedType, resolutionContext, comparisonInfo);
                    if (!foundError) {
                        foundError = !this.resolver.sourceIndexSignaturesAreSubtypeOfTargetIndexSignatures(classSymbol, implementedType, resolutionContext, comparisonInfo);
                    }
                }
            }

            if (foundError) {
                var errorCode = implementedType.isClass() ? TypeScript.DiagnosticCode.Class__0__declares_class__1__but_does_not_implement_it__NL__2 : TypeScript.DiagnosticCode.Class__0__declares_interface__1__but_does_not_implement_it__NL__2;

                this.postError(classDecl.name.minChar, classDecl.name.getLength(), typeCheckContext.scriptName, errorCode, [classSymbol.getScopedName(), implementedType.getScopedName(), comparisonInfo.message], typeCheckContext.getEnclosingDecl());
            }
        };

        PullTypeChecker.prototype.typeCheckBase = function (typeDeclAst, typeSymbol, baseDeclAST, isExtendedType, typeCheckContext) {
            var _this = this;
            var typeDecl = typeCheckContext.semanticInfo.getDeclForAST(typeDeclAst);
            var contextForBaseTypeResolution = new TypeScript.PullTypeResolutionContext();
            contextForBaseTypeResolution.isResolvingClassExtendedType = true;

            var baseType = this.typeCheckAST(new TypeScript.TypeReference(baseDeclAST, 0), typeCheckContext, false);
            contextForBaseTypeResolution.isResolvingClassExtendedType = false;

            var typeDeclIsClass = typeSymbol.isClass();

            if (!typeSymbol.isValidBaseKind(baseType, isExtendedType)) {
                if (baseType.isError()) {
                    var error = (baseType).getDiagnostic();
                    if (error) {
                        this.postError(baseDeclAST.minChar, baseDeclAST.getLength(), typeCheckContext.scriptName, error.diagnosticCode(), error.arguments(), typeCheckContext.getEnclosingDecl());
                    }
                } else if (isExtendedType) {
                    if (typeDeclIsClass) {
                        this.postError(baseDeclAST.minChar, baseDeclAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.A_class_may_only_extend_another_class, null, typeCheckContext.getEnclosingDecl());
                    } else {
                        this.postError(baseDeclAST.minChar, baseDeclAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.An_interface_may_only_extend_another_class_or_interface, null, typeCheckContext.getEnclosingDecl());
                    }
                } else {
                    this.postError(baseDeclAST.minChar, baseDeclAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.A_class_may_only_implement_another_class_or_interface, null, typeCheckContext.getEnclosingDecl());
                }
                return;
            }

            if (baseType.hasBase(typeSymbol)) {
                this.postError(typeDeclAst.name.minChar, typeDeclAst.name.getLength(), typeCheckContext.scriptName, typeDeclIsClass ? TypeScript.DiagnosticCode.Class__0__is_recursively_referenced_as_a_base_type_of_itself : TypeScript.DiagnosticCode.Interface__0__is_recursively_referenced_as_a_base_type_of_itself, [typeSymbol.getScopedName()], typeCheckContext.getEnclosingDecl());
                return;
            }

            if (isExtendedType) {
                this.typeCheckIfTypeExtendsType(typeDeclAst, typeSymbol, baseType, typeCheckContext);
            } else {
                this.typeCheckIfClassImplementsType(typeDeclAst, typeSymbol, baseType, typeCheckContext);
            }

            this.checkTypePrivacy(typeSymbol, baseType, typeCheckContext, function (errorTypeSymbol) {
                return _this.baseListPrivacyErrorReporter(typeDeclAst, typeSymbol, baseDeclAST, isExtendedType, errorTypeSymbol, typeCheckContext);
            });
        };

        PullTypeChecker.prototype.typeCheckBases = function (typeDeclAst, typeSymbol, typeCheckContext) {
            if (!typeDeclAst.extendsList && !typeDeclAst.implementsList) {
                return;
            }

            for (var i = 0; i < typeDeclAst.extendsList.members.length; i++) {
                this.typeCheckBase(typeDeclAst, typeSymbol, typeDeclAst.extendsList.members[i], true, typeCheckContext);
            }

            if (typeSymbol.isClass()) {
                for (var i = 0; i < typeDeclAst.implementsList.members.length; i++) {
                    this.typeCheckBase(typeDeclAst, typeSymbol, typeDeclAst.implementsList.members[i], false, typeCheckContext);
                }
            } else if (typeDeclAst.implementsList) {
                this.postError(typeDeclAst.implementsList.minChar, typeDeclAst.implementsList.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.An_interface_cannot_implement_another_type, null, typeCheckContext.getEnclosingDecl());
            }
        };

        PullTypeChecker.prototype.typeCheckClass = function (ast, typeCheckContext) {
            var classAST = ast;

            var classSymbol = this.resolveSymbolAndReportDiagnostics(ast, false, typeCheckContext.getEnclosingDecl()).getType();
            this.checkForResolutionError(classSymbol, typeCheckContext.getEnclosingDecl());

            this.typeCheckAST(classAST.typeParameters, typeCheckContext, false);

            var classDecl = typeCheckContext.semanticInfo.getDeclForAST(classAST);
            typeCheckContext.pushEnclosingDecl(classDecl);

            this.typeCheckAST(classAST.typeParameters, typeCheckContext, false);

            this.typeCheckBases(classAST, classSymbol, typeCheckContext);

            this.typeCheckAST(classAST.members, typeCheckContext, false);

            this.typeCheckMembersAgainstIndexer(classSymbol, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            return classSymbol;
        };

        PullTypeChecker.prototype.typeCheckInterface = function (ast, typeCheckContext) {
            var interfaceAST = ast;

            var interfaceType = this.resolveSymbolAndReportDiagnostics(ast, false, typeCheckContext.getEnclosingDecl()).getType();
            this.checkForResolutionError(interfaceType, typeCheckContext.getEnclosingDecl());

            var interfaceDecl = typeCheckContext.semanticInfo.getDeclForAST(interfaceAST);
            typeCheckContext.pushEnclosingDecl(interfaceDecl);

            this.typeCheckAST(interfaceAST.typeParameters, typeCheckContext, false);

            this.typeCheckBases(ast, interfaceType, typeCheckContext);

            this.typeCheckAST(interfaceAST.members, typeCheckContext, false);

            this.typeCheckMembersAgainstIndexer(interfaceType, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            return interfaceType;
        };

        PullTypeChecker.prototype.typeCheckModule = function (ast, typeCheckContext) {
            var moduleDeclAST = ast;
            var moduleType = this.resolveSymbolAndReportDiagnostics(ast, false, typeCheckContext.getEnclosingDecl());

            this.checkForResolutionError(moduleType, typeCheckContext.getEnclosingDecl());

            var moduleDecl = typeCheckContext.semanticInfo.getDeclForAST(moduleDeclAST);
            typeCheckContext.pushEnclosingDecl(moduleDecl);

            var modName = (moduleDeclAST.name).text;
            var isDynamic = TypeScript.isQuoted(modName) || TypeScript.hasFlag(moduleDeclAST.getModuleFlags(), TypeScript.ModuleFlags.IsDynamic);

            if (isDynamic && moduleDeclAST.members && moduleDeclAST.members.members) {
                for (var i = moduleDeclAST.members.members.length - 1; i >= 0; i--) {
                    if (moduleDeclAST.members.members[i] && moduleDeclAST.members.members[i].nodeType == TypeScript.NodeType.ExportAssignment) {
                        this.typeCheckAST(moduleDeclAST.members.members[i], typeCheckContext, false);
                        break;
                    }
                }
            }
            this.typeCheckAST(moduleDeclAST.members, typeCheckContext, false);

            this.validateVariableDeclarationGroups(moduleDecl, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            return moduleType;
        };

        PullTypeChecker.prototype.checkAssignability = function (ast, source, target, typeCheckContext) {
            var comparisonInfo = new TypeComparisonInfo();

            var isAssignable = this.resolver.sourceIsAssignableToTarget(source, target, this.context, comparisonInfo);

            if (!isAssignable) {
                var enclosingDecl = typeCheckContext.getEnclosingDecl();
                if (comparisonInfo.message) {
                    this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Cannot_convert__0__to__1__NL__2, [source.toString(), target.toString(), comparisonInfo.message], enclosingDecl);
                } else {
                    this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Cannot_convert__0__to__1_, [source.toString(), target.toString()], enclosingDecl);
                }
            }
        };

        PullTypeChecker.prototype.isValidLHS = function (ast, expressionSymbol) {
            var expressionTypeSymbol = expressionSymbol.getType();

            if (ast.nodeType === TypeScript.NodeType.ElementAccessExpression || this.resolver.isAnyOrEquivalent(expressionTypeSymbol)) {
                return true;
            } else if (!expressionSymbol.isType() || expressionTypeSymbol.isArray()) {
                return ((expressionSymbol.getKind() & TypeScript.PullElementKind.SomeLHS) != 0) && !expressionSymbol.hasFlag(TypeScript.PullElementFlags.Enum);
            }

            return false;
        };

        PullTypeChecker.prototype.typeCheckAssignment = function (binaryExpression, typeCheckContext) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            this.typeCheckAST(binaryExpression.operand1, typeCheckContext, false);

            var leftExpr = this.resolveSymbolAndReportDiagnostics(binaryExpression.operand1, false, typeCheckContext.getEnclosingDecl());
            var leftType = leftExpr.getType();
            this.checkForResolutionError(leftType, enclosingDecl);
            leftType = this.resolver.widenType(leftExpr.getType());

            this.context.pushContextualType(leftType, this.context.inProvisionalResolution(), null);
            var rightType = this.resolver.widenType(this.typeCheckAST(binaryExpression.operand2, typeCheckContext, true));
            this.context.popContextualType();

            if (!this.isValidLHS(binaryExpression.operand1, leftExpr)) {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Invalid_left_hand_side_of_assignment_expression, null, enclosingDecl);
            }

            this.checkAssignability(binaryExpression.operand1, rightType, leftType, typeCheckContext);
            return rightType;
        };

        PullTypeChecker.prototype.typeCheckGenericType = function (genericType, typeCheckContext) {
            var savedResolvingTypeReference = this.context.resolvingTypeReference;
            this.context.resolvingTypeReference = true;
            this.typeCheckAST(genericType.name, typeCheckContext, false);
            this.context.resolvingTypeReference = savedResolvingTypeReference;

            this.typeCheckAST(genericType.typeArguments, typeCheckContext, false);

            return this.resolveSymbolAndReportDiagnostics(genericType, false, typeCheckContext.getEnclosingDecl()).getType();
        };

        PullTypeChecker.prototype.typeCheckObjectLiteral = function (ast, typeCheckContext, inContextuallyTypedAssignment) {
            var objectLitAST = ast;
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var objectLitType = this.resolveSymbolAndReportDiagnostics(ast, inContextuallyTypedAssignment, enclosingDecl).getType();
            var memberDecls = objectLitAST.operand;

            var contextualType = this.context.getContextualType();
            var memberType;

            if (memberDecls) {
                var member = null;

                for (var i = 0; i < memberDecls.members.length; i++) {
                    var binex = memberDecls.members[i];

                    if (contextualType) {
                        var text;
                        if (binex.operand1.nodeType === TypeScript.NodeType.Name) {
                            text = (binex.operand1).text;
                        } else if (binex.operand1.nodeType === TypeScript.NodeType.StringLiteral) {
                            text = (binex.operand1).text;
                        }

                        member = contextualType.findMember(text);

                        if (member) {
                            this.context.pushContextualType(member.getType(), this.context.inProvisionalResolution(), null);
                        }
                    }

                    this.typeCheckAST(binex.operand2, typeCheckContext, member != null);

                    if (member) {
                        this.context.popContextualType();
                        member = null;
                    }
                }
            }

            this.checkForResolutionError(objectLitType, enclosingDecl);

            return objectLitType;
        };

        PullTypeChecker.prototype.typeCheckArrayLiteral = function (ast, typeCheckContext, inContextuallyTypedAssignment) {
            var arrayLiteralAST = ast;
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var type = this.resolveSymbolAndReportDiagnostics(ast, inContextuallyTypedAssignment, enclosingDecl).getType();
            var memberASTs = arrayLiteralAST.operand;

            var contextualType = this.context.getContextualType();
            var contextualMemberType = null;
            if (contextualType && contextualType.isArray()) {
                contextualMemberType = contextualType.getElementType();
            }

            if (memberASTs && memberASTs.members && memberASTs.members.length) {
                var elementTypes = [];

                if (contextualMemberType) {
                    this.context.pushContextualType(contextualMemberType, this.context.inProvisionalResolution(), null);
                }

                for (var i = 0; i < memberASTs.members.length; i++) {
                    elementTypes[elementTypes.length] = this.typeCheckAST(memberASTs.members[i], typeCheckContext, false);
                }
            }

            this.checkForResolutionError(type, enclosingDecl);

            return type;
        };

        PullTypeChecker.prototype.enclosingClassIsDerived = function (typeCheckContext) {
            var enclosingClass = typeCheckContext.getEnclosingDecl(TypeScript.PullElementKind.Class);

            if (enclosingClass) {
                var classSymbol = enclosingClass.getSymbol();
                if (classSymbol.getExtendedTypes().length > 0) {
                    return true;
                }
            }

            return false;
        };

        PullTypeChecker.prototype.isSuperCallNode = function (node) {
            if (node && node.nodeType === TypeScript.NodeType.ExpressionStatement) {
                var expressionStatement = node;
                if (expressionStatement.expression && expressionStatement.expression.nodeType === TypeScript.NodeType.InvocationExpression) {
                    var callExpression = expressionStatement.expression;
                    if (callExpression.target && callExpression.target.nodeType === TypeScript.NodeType.SuperExpression) {
                        return true;
                    }
                }
            }
            return false;
        };

        PullTypeChecker.prototype.getFirstStatementFromFunctionDeclAST = function (funcDeclAST) {
            if (funcDeclAST.block && funcDeclAST.block.statements && funcDeclAST.block.statements.members) {
                return funcDeclAST.block.statements.members[0];
            }

            return null;
        };

        PullTypeChecker.prototype.superCallMustBeFirstStatementInConstructor = function (enclosingConstructor, enclosingClass) {
            if (enclosingConstructor && enclosingClass) {
                var classSymbol = enclosingClass.getSymbol();
                if (classSymbol.getExtendedTypes().length === 0) {
                    return false;
                }

                var classMembers = classSymbol.getMembers();
                for (var i = 0, n1 = classMembers.length; i < n1; i++) {
                    var member = classMembers[i];

                    if (member.getKind() === TypeScript.PullElementKind.Property) {
                        var declarations = member.getDeclarations();
                        for (var j = 0, n2 = declarations.length; j < n2; j++) {
                            var declaration = declarations[j];
                            var ast = this.semanticInfoChain.getASTForDecl(declaration);
                            if (ast.nodeType === TypeScript.NodeType.Parameter) {
                                return true;
                            }

                            if (ast.nodeType === TypeScript.NodeType.VariableDeclarator) {
                                var variableDeclarator = ast;
                                if (variableDeclarator.init) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }

            return false;
        };

        PullTypeChecker.prototype.checkForThisOrSuperCaptureInArrowFunction = function (expression, typeCheckContext) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var declPath = typeCheckContext.enclosingDeclStack;

            if (declPath.length) {
                var inFatArrow = false;
                for (var i = declPath.length - 1; i >= 0; i--) {
                    var decl = declPath[i];
                    var declKind = decl.getKind();
                    var declFlags = decl.getFlags();

                    if (declKind === TypeScript.PullElementKind.FunctionExpression && TypeScript.hasFlag(declFlags, TypeScript.PullElementFlags.FatArrow)) {
                        inFatArrow = true;
                        continue;
                    }

                    if (inFatArrow) {
                        if (declKind === TypeScript.PullElementKind.Function || declKind === TypeScript.PullElementKind.Method || declKind === TypeScript.PullElementKind.ConstructorMethod || declKind === TypeScript.PullElementKind.GetAccessor || declKind === TypeScript.PullElementKind.SetAccessor || declKind === TypeScript.PullElementKind.FunctionExpression || declKind === TypeScript.PullElementKind.Class || declKind === TypeScript.PullElementKind.Container || declKind === TypeScript.PullElementKind.DynamicModule || declKind === TypeScript.PullElementKind.Script) {
                            decl.setFlags(decl.getFlags() | TypeScript.PullElementFlags.MustCaptureThis);

                            if (declKind === TypeScript.PullElementKind.Class) {
                                decl.getChildDecls().filter(function (d) {
                                    return d.getKind() === TypeScript.PullElementKind.ConstructorMethod;
                                }).map(function (d) {
                                    return d.setFlags(d.getFlags() | TypeScript.PullElementFlags.MustCaptureThis);
                                });
                            }
                            break;
                        }
                    }
                }
            }
        };

        PullTypeChecker.prototype.typeCheckThisExpression = function (thisExpressionAST, typeCheckContext) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var enclosingNonLambdaDecl = typeCheckContext.getEnclosingNonLambdaDecl();

            if (typeCheckContext.inSuperConstructorCall && this.superCallMustBeFirstStatementInConstructor(typeCheckContext.getEnclosingDecl(TypeScript.PullElementKind.ConstructorMethod), typeCheckContext.getEnclosingDecl(TypeScript.PullElementKind.Class))) {
                this.postError(thisExpressionAST.minChar, thisExpressionAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode._this__cannot_be_referenced_in_current_location, null, enclosingDecl);
            } else if (enclosingNonLambdaDecl) {
                if (enclosingNonLambdaDecl.getKind() === TypeScript.PullElementKind.Class) {
                    this.postError(thisExpressionAST.minChar, thisExpressionAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode._this__cannot_be_referenced_in_initializers_in_a_class_body, null, enclosingDecl);
                } else if (enclosingNonLambdaDecl.getKind() === TypeScript.PullElementKind.Container || enclosingNonLambdaDecl.getKind() === TypeScript.PullElementKind.DynamicModule) {
                    this.postError(thisExpressionAST.minChar, thisExpressionAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode._this__cannot_be_referenced_within_module_bodies, null, enclosingDecl);
                } else if (typeCheckContext.inConstructorArguments) {
                    this.postError(thisExpressionAST.minChar, thisExpressionAST.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode._this__cannot_be_referenced_in_constructor_arguments, null, enclosingDecl);
                }
            }

            this.checkForThisOrSuperCaptureInArrowFunction(thisExpressionAST, typeCheckContext);

            return this.resolveSymbolAndReportDiagnostics(thisExpressionAST, false, enclosingDecl).getType();
        };

        PullTypeChecker.prototype.typeCheckSuperExpression = function (ast, typeCheckContext) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var nonLambdaEnclosingDecl = typeCheckContext.getEnclosingNonLambdaDecl();
            var nonLambdaEnclosingDeclKind = nonLambdaEnclosingDecl.getKind();
            var inSuperConstructorTarget = typeCheckContext.inSuperConstructorTarget;

            if (inSuperConstructorTarget && enclosingDecl.getKind() !== TypeScript.PullElementKind.ConstructorMethod) {
                this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Super_calls_are_not_permitted_outside_constructors_or_in_local_functions_inside_constructors, null, enclosingDecl);
            } else if ((nonLambdaEnclosingDeclKind !== TypeScript.PullElementKind.Method && nonLambdaEnclosingDeclKind !== TypeScript.PullElementKind.GetAccessor && nonLambdaEnclosingDeclKind !== TypeScript.PullElementKind.SetAccessor && nonLambdaEnclosingDeclKind !== TypeScript.PullElementKind.ConstructorMethod) || ((nonLambdaEnclosingDecl.getFlags() & TypeScript.PullElementFlags.Static) !== 0)) {
                this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode._super__property_access_is_permitted_only_in_a_constructor__instance_member_function__or_instance_member_accessor_of_a_derived_class, null, enclosingDecl);
            } else if (!this.enclosingClassIsDerived(typeCheckContext)) {
                this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode._super__cannot_be_referenced_in_non_derived_classes, null, enclosingDecl);
            }

            this.checkForThisOrSuperCaptureInArrowFunction(ast, typeCheckContext);

            return this.resolveSymbolAndReportDiagnostics(ast, false, enclosingDecl).getType();
        };

        PullTypeChecker.prototype.typeCheckCallExpression = function (callExpression, typeCheckContext) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var inSuperConstructorCall = (callExpression.target.nodeType === TypeScript.NodeType.SuperExpression);

            var callResolutionData = new TypeScript.PullAdditionalCallResolutionData();
            var resultTypeAndDiagnostics = this.resolver.resolveCallExpression(callExpression, false, enclosingDecl, this.context, callResolutionData);
            this.reportDiagnostics(resultTypeAndDiagnostics, enclosingDecl);
            var resultType = resultTypeAndDiagnostics.symbol.getType();

            this.typeCheckAST(callExpression.typeArguments, typeCheckContext, false);

            if (!resultType.isError()) {
                var savedInSuperConstructorTarget = typeCheckContext.inSuperConstructorTarget;
                if (inSuperConstructorCall) {
                    typeCheckContext.inSuperConstructorTarget = true;
                }

                this.typeCheckAST(callExpression.target, typeCheckContext, false);

                typeCheckContext.inSuperConstructorTarget = savedInSuperConstructorTarget;
            }

            if (inSuperConstructorCall && enclosingDecl.getKind() === TypeScript.PullElementKind.ConstructorMethod) {
                typeCheckContext.seenSuperConstructorCall = true;
            }

            var savedInSuperConstructorCall = typeCheckContext.inSuperConstructorCall;
            if (inSuperConstructorCall) {
                typeCheckContext.inSuperConstructorCall = true;
            }

            var contextTypes = callResolutionData.actualParametersContextTypeSymbols;
            if (callExpression.arguments) {
                var argumentASTs = callExpression.arguments.members;
                for (var i = 0, n = argumentASTs.length; i < n; i++) {
                    var argumentAST = argumentASTs[i];

                    if (contextTypes && contextTypes[i]) {
                        this.context.pushContextualType(contextTypes[i], this.context.inProvisionalResolution(), null);
                    }

                    this.typeCheckAST(argumentAST, typeCheckContext, false);

                    if (contextTypes && contextTypes[i]) {
                        this.context.popContextualType();
                    }
                }
            }

            typeCheckContext.inSuperConstructorCall = savedInSuperConstructorCall;

            return resultType;
        };

        PullTypeChecker.prototype.typeCheckObjectCreationExpression = function (callExpression, typeCheckContext) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var callResolutionData = new TypeScript.PullAdditionalCallResolutionData();
            var resultAndDiagnostics = this.resolver.resolveNewExpression(callExpression, false, enclosingDecl, this.context, callResolutionData);
            this.reportDiagnostics(resultAndDiagnostics, typeCheckContext.getEnclosingDecl());

            var result = resultAndDiagnostics.symbol.getType();

            this.typeCheckAST(callExpression.target, typeCheckContext, false);

            this.typeCheckAST(callExpression.typeArguments, typeCheckContext, false);

            var contextTypes = callResolutionData.actualParametersContextTypeSymbols;
            if (callExpression.arguments) {
                var argumentASTs = callExpression.arguments.members;
                for (var i = 0, n = argumentASTs.length; i < n; i++) {
                    var argumentAST = argumentASTs[i];

                    if (contextTypes && contextTypes[i]) {
                        this.context.pushContextualType(contextTypes[i], this.context.inProvisionalResolution(), null);
                    }

                    this.typeCheckAST(argumentAST, typeCheckContext, false);

                    if (contextTypes && contextTypes[i]) {
                        this.context.popContextualType();
                    }
                }
            }

            return result;
        };

        PullTypeChecker.prototype.typeCheckTypeAssertion = function (ast, typeCheckContext) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var returnType = this.resolveSymbolAndReportDiagnostics(ast, false, enclosingDecl).getType();

            this.context.pushContextualType(returnType, this.context.inProvisionalResolution(), null);
            var exprType = this.typeCheckAST(ast.operand, typeCheckContext, true);
            this.context.popContextualType();

            var comparisonInfo = new TypeComparisonInfo();
            var isAssignable = this.resolver.sourceIsAssignableToTarget(returnType, exprType, this.context, comparisonInfo) || this.resolver.sourceIsAssignableToTarget(exprType, returnType, this.context, comparisonInfo);

            if (!isAssignable) {
                var message;
                if (comparisonInfo.message) {
                    this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Cannot_convert__0__to__1__NL__2, [exprType.toString(), returnType.toString(), comparisonInfo.message], typeCheckContext.getEnclosingDecl());
                } else {
                    this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Cannot_convert__0__to__1_, [exprType.toString(), returnType.toString()], typeCheckContext.getEnclosingDecl());
                }
            }

            return returnType;
        };

        PullTypeChecker.prototype.typeCheckLogicalOperation = function (binex, typeCheckContext) {
            var leftType = this.typeCheckAST(binex.operand1, typeCheckContext, false);
            var rightType = this.typeCheckAST(binex.operand2, typeCheckContext, false);

            var comparisonInfo = new TypeComparisonInfo();
            if (!this.resolver.sourceIsAssignableToTarget(leftType, rightType, this.context, comparisonInfo) && !this.resolver.sourceIsAssignableToTarget(rightType, leftType, this.context, comparisonInfo)) {
                this.postError(binex.minChar, binex.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Operator__0__cannot_be_applied_to_types__1__and__2_, [TypeScript.BinaryExpression.getTextForBinaryToken(binex.nodeType), leftType.toString(), rightType.toString()], typeCheckContext.getEnclosingDecl());
            }

            return this.resolveSymbolAndReportDiagnostics(binex, false, typeCheckContext.getEnclosingDecl()).getType();
        };

        PullTypeChecker.prototype.typeCheckLogicalAndOrExpression = function (binex, typeCheckContext) {
            this.typeCheckAST(binex.operand1, typeCheckContext, false);
            this.typeCheckAST(binex.operand2, typeCheckContext, false);

            return this.resolveSymbolAndReportDiagnostics(binex, false, typeCheckContext.getEnclosingDecl()).getType();
        };

        PullTypeChecker.prototype.typeCheckCommaExpression = function (binex, typeCheckContext) {
            this.typeCheckAST(binex.operand1, typeCheckContext, false);
            this.typeCheckAST(binex.operand2, typeCheckContext, false);

            return this.resolveSymbolAndReportDiagnostics(binex, false, typeCheckContext.getEnclosingDecl()).getType();
        };

        PullTypeChecker.prototype.typeCheckBinaryAdditionOperation = function (binaryExpression, typeCheckContext) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            this.resolveSymbolAndReportDiagnostics(binaryExpression, false, enclosingDecl).getType();

            var lhsType = this.typeCheckAST(binaryExpression.operand1, typeCheckContext, false);
            var rhsType = this.typeCheckAST(binaryExpression.operand2, typeCheckContext, false);

            if (TypeScript.PullHelpers.symbolIsEnum(lhsType)) {
                lhsType = this.semanticInfoChain.numberTypeSymbol;
            } else if (lhsType === this.semanticInfoChain.nullTypeSymbol || lhsType === this.semanticInfoChain.undefinedTypeSymbol) {
                if (rhsType != this.semanticInfoChain.nullTypeSymbol && rhsType != this.semanticInfoChain.undefinedTypeSymbol) {
                    lhsType = rhsType;
                } else {
                    lhsType = this.semanticInfoChain.anyTypeSymbol;
                }
            }

            if (TypeScript.PullHelpers.symbolIsEnum(rhsType)) {
                rhsType = this.semanticInfoChain.numberTypeSymbol;
            } else if (rhsType === this.semanticInfoChain.nullTypeSymbol || rhsType === this.semanticInfoChain.undefinedTypeSymbol) {
                if (lhsType != this.semanticInfoChain.nullTypeSymbol && lhsType != this.semanticInfoChain.undefinedTypeSymbol) {
                    rhsType = lhsType;
                } else {
                    rhsType = this.semanticInfoChain.anyTypeSymbol;
                }
            }

            var exprType = null;

            if (lhsType === this.semanticInfoChain.stringTypeSymbol || rhsType === this.semanticInfoChain.stringTypeSymbol) {
                exprType = this.semanticInfoChain.stringTypeSymbol;
            } else if (this.resolver.isAnyOrEquivalent(lhsType) || this.resolver.isAnyOrEquivalent(rhsType)) {
                exprType = this.semanticInfoChain.anyTypeSymbol;
            } else if (rhsType === this.semanticInfoChain.numberTypeSymbol && lhsType === this.semanticInfoChain.numberTypeSymbol) {
                exprType = this.semanticInfoChain.numberTypeSymbol;
            }

            if (exprType) {
                if (binaryExpression.nodeType === TypeScript.NodeType.AddAssignmentExpression) {
                    var lhsExpression = this.resolveSymbolAndReportDiagnostics(binaryExpression.operand1, false, typeCheckContext.getEnclosingDecl());
                    if (!this.isValidLHS(binaryExpression.operand1, lhsExpression)) {
                        this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Invalid_left_hand_side_of_assignment_expression, null, enclosingDecl);
                    }

                    this.checkAssignability(binaryExpression.operand1, exprType, lhsType, typeCheckContext);
                }
            } else {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Invalid__addition__expression___types_do_not_agree, null, typeCheckContext.getEnclosingDecl());
                exprType = this.semanticInfoChain.anyTypeSymbol;
            }

            return exprType;
        };

        PullTypeChecker.prototype.typeCheckBinaryArithmeticOperation = function (binaryExpression, typeCheckContext) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            this.resolveSymbolAndReportDiagnostics(binaryExpression, false, enclosingDecl).getType();

            var lhsType = this.typeCheckAST(binaryExpression.operand1, typeCheckContext, false);
            var rhsType = this.typeCheckAST(binaryExpression.operand2, typeCheckContext, false);

            var lhsIsFit = this.resolver.isAnyOrEquivalent(lhsType) || lhsType === this.semanticInfoChain.numberTypeSymbol || TypeScript.PullHelpers.symbolIsEnum(lhsType);
            var rhsIsFit = this.resolver.isAnyOrEquivalent(rhsType) || rhsType === this.semanticInfoChain.numberTypeSymbol || TypeScript.PullHelpers.symbolIsEnum(rhsType);

            if (!rhsIsFit) {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.The_right_hand_side_of_an_arithmetic_operation_must_be_of_type__any____number__or_an_enum_type, null, typeCheckContext.getEnclosingDecl());
            }

            if (!lhsIsFit) {
                this.postError(binaryExpression.operand2.minChar, binaryExpression.operand2.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.The_left_hand_side_of_an_arithmetic_operation_must_be_of_type__any____number__or_an_enum_type, null, typeCheckContext.getEnclosingDecl());
            }

            if (rhsIsFit && lhsIsFit) {
                switch (binaryExpression.nodeType) {
                    case TypeScript.NodeType.LeftShiftAssignmentExpression:
                    case TypeScript.NodeType.SignedRightShiftAssignmentExpression:
                    case TypeScript.NodeType.UnsignedRightShiftAssignmentExpression:
                    case TypeScript.NodeType.SubtractAssignmentExpression:
                    case TypeScript.NodeType.MultiplyAssignmentExpression:
                    case TypeScript.NodeType.DivideAssignmentExpression:
                    case TypeScript.NodeType.ModuloAssignmentExpression:
                    case TypeScript.NodeType.OrAssignmentExpression:
                    case TypeScript.NodeType.AndAssignmentExpression:
                    case TypeScript.NodeType.ExclusiveOrAssignmentExpression:
                        var lhsExpression = this.resolveSymbolAndReportDiagnostics(binaryExpression.operand1, false, typeCheckContext.getEnclosingDecl());
                        if (!this.isValidLHS(binaryExpression.operand1, lhsExpression)) {
                            this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Invalid_left_hand_side_of_assignment_expression, null, enclosingDecl);
                        }

                        this.checkAssignability(binaryExpression.operand1, rhsType, lhsType, typeCheckContext);
                        break;
                }
            }

            return this.semanticInfoChain.numberTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckLogicalNotExpression = function (unaryExpression, typeCheckContext, inContextuallyTypedAssignment) {
            this.typeCheckAST(unaryExpression.operand, typeCheckContext, inContextuallyTypedAssignment);
            return this.semanticInfoChain.booleanTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckUnaryArithmeticOperation = function (unaryExpression, typeCheckContext, inContextuallyTypedAssignment) {
            var operandType = this.typeCheckAST(unaryExpression.operand, typeCheckContext, inContextuallyTypedAssignment);

            switch (unaryExpression.nodeType) {
                case TypeScript.NodeType.PlusExpression:
                case TypeScript.NodeType.NegateExpression:
                case TypeScript.NodeType.BitwiseNotExpression:
                    return this.semanticInfoChain.numberTypeSymbol;
            }

            var operandIsFit = this.resolver.isAnyOrEquivalent(operandType) || operandType === this.semanticInfoChain.numberTypeSymbol || TypeScript.PullHelpers.symbolIsEnum(operandType);

            if (!operandIsFit) {
                this.postError(unaryExpression.operand.minChar, unaryExpression.operand.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.The_type_of_a_unary_arithmetic_operation_operand_must_be_of_type__any____number__or_an_enum_type, null, typeCheckContext.getEnclosingDecl());
            }

            switch (unaryExpression.nodeType) {
                case TypeScript.NodeType.PostIncrementExpression:
                case TypeScript.NodeType.PreIncrementExpression:
                case TypeScript.NodeType.PostDecrementExpression:
                case TypeScript.NodeType.PreDecrementExpression:
                    var expression = this.resolveSymbolAndReportDiagnostics(unaryExpression.operand, false, typeCheckContext.getEnclosingDecl());
                    if (!this.isValidLHS(unaryExpression.operand, expression)) {
                        this.postError(unaryExpression.operand.minChar, unaryExpression.operand.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.The_operand_of_an_increment_or_decrement_operator_must_be_a_variable__property_or_indexer, null, typeCheckContext.getEnclosingDecl());
                    }

                    break;
            }

            return operandType;
        };

        PullTypeChecker.prototype.typeCheckElementAccessExpression = function (binaryExpression, typeCheckContext) {
            this.typeCheckAST(binaryExpression.operand1, typeCheckContext, false);
            this.typeCheckAST(binaryExpression.operand2, typeCheckContext, false);

            return this.resolveSymbolAndReportDiagnostics(binaryExpression, false, typeCheckContext.getEnclosingDecl()).getType();
        };

        PullTypeChecker.prototype.typeCheckTypeOf = function (ast, typeCheckContext) {
            this.typeCheckAST((ast).operand, typeCheckContext, false);

            return this.semanticInfoChain.stringTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckTypeReference = function (typeRef, typeCheckContext) {
            if (typeRef.term.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                this.typeCheckFunctionTypeSignature(typeRef.term, typeCheckContext.getEnclosingDecl(), typeCheckContext);
            } else if (typeRef.term.nodeType === TypeScript.NodeType.InterfaceDeclaration) {
                this.typeCheckInterfaceTypeReference(typeRef.term, typeCheckContext.getEnclosingDecl(), typeCheckContext);
            } else {
                var savedResolvingTypeReference = this.context.resolvingTypeReference;
                this.context.resolvingTypeReference = true;
                var type = this.typeCheckAST(typeRef.term, typeCheckContext, false);

                if (type && !type.isError() && !typeCheckContext.inImportDeclaration) {
                    if ((type.getKind() & TypeScript.PullElementKind.SomeType) === 0) {
                        if (type.getKind() & TypeScript.PullElementKind.SomeContainer) {
                            this.postError(typeRef.minChar, typeRef.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Type_reference_cannot_refer_to_container__0_, [type.toString()], typeCheckContext.getEnclosingDecl());
                        } else {
                            this.postError(typeRef.minChar, typeRef.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Type_reference_must_refer_to_type, null, typeCheckContext.getEnclosingDecl());
                        }
                    }
                }

                this.context.resolvingTypeReference = savedResolvingTypeReference;
            }

            return this.resolveSymbolAndReportDiagnostics(typeRef, false, typeCheckContext.getEnclosingDecl()).getType();
        };

        PullTypeChecker.prototype.typeCheckExportAssignment = function (ast, typeCheckContext) {
            return this.resolveSymbolAndReportDiagnostics(ast, false, typeCheckContext.getEnclosingDecl()).getType();
        };

        PullTypeChecker.prototype.typeCheckFunctionTypeSignature = function (funcDeclAST, enclosingDecl, typeCheckContext) {
            var funcDeclSymbolAndDiagnostics = this.resolver.getSymbolAndDiagnosticsForAST(funcDeclAST);
            var funcDeclSymbol = funcDeclSymbolAndDiagnostics && funcDeclSymbolAndDiagnostics.symbol;
            if (!funcDeclSymbol) {
                funcDeclSymbol = this.resolver.resolveFunctionTypeSignature(funcDeclAST, enclosingDecl, this.context);
            }
            var functionDecl = typeCheckContext.semanticInfo.getDeclForAST(funcDeclAST);

            typeCheckContext.pushEnclosingDecl(functionDecl);
            this.typeCheckAST(funcDeclAST.arguments, typeCheckContext, false);
            typeCheckContext.popEnclosingDecl();

            var functionSignature = funcDeclSymbol.getKind() === TypeScript.PullElementKind.ConstructorType ? funcDeclSymbol.getConstructSignatures()[0] : funcDeclSymbol.getCallSignatures()[0];
            var parameters = functionSignature.getParameters();
            for (var i = 0; i < parameters.length; i++) {
                this.checkForResolutionError(parameters[i].getType(), enclosingDecl);
            }

            if (funcDeclAST.returnTypeAnnotation) {
                var returnType = functionSignature.getReturnType();
                this.checkForResolutionError(returnType, enclosingDecl);
            }

            this.typeCheckFunctionOverloads(funcDeclAST, typeCheckContext, functionSignature, [functionSignature]);
            return funcDeclSymbol;
        };

        PullTypeChecker.prototype.typeCheckInterfaceTypeReference = function (interfaceAST, enclosingDecl, typeCheckContext) {
            var interfaceSymbolAndDiagnostics = this.resolver.getSymbolAndDiagnosticsForAST(interfaceAST);
            var interfaceSymbol = interfaceSymbolAndDiagnostics && interfaceSymbolAndDiagnostics.symbol;
            if (!interfaceSymbol) {
                interfaceSymbol = this.resolver.resolveInterfaceTypeReference(interfaceAST, enclosingDecl, this.context);
            }

            var interfaceDecl = typeCheckContext.semanticInfo.getDeclForAST(interfaceAST);
            typeCheckContext.pushEnclosingDecl(interfaceDecl);
            this.typeCheckAST(interfaceAST.members, typeCheckContext, false);
            this.typeCheckMembersAgainstIndexer(interfaceSymbol, typeCheckContext);
            typeCheckContext.popEnclosingDecl();

            return interfaceSymbol;
        };

        PullTypeChecker.prototype.typeCheckConditionalExpression = function (conditionalExpression, typeCheckContext) {
            this.typeCheckAST(conditionalExpression.operand1, typeCheckContext, false);
            this.typeCheckAST(conditionalExpression.operand2, typeCheckContext, false);
            this.typeCheckAST(conditionalExpression.operand3, typeCheckContext, false);

            return this.resolveSymbolAndReportDiagnostics(conditionalExpression, false, typeCheckContext.getEnclosingDecl()).getType();
        };

        PullTypeChecker.prototype.typeCheckThrowStatement = function (throwStatement, typeCheckContext) {
            this.typeCheckAST(throwStatement.expression, typeCheckContext, false);

            var type = this.resolveSymbolAndReportDiagnostics(throwStatement.expression, false, typeCheckContext.getEnclosingDecl()).getType();
            this.checkForResolutionError(type, typeCheckContext.getEnclosingDecl());
            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckDeleteExpression = function (unaryExpression, typeCheckContext) {
            this.typeCheckAST(unaryExpression.operand, typeCheckContext, false);

            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var type = this.resolveSymbolAndReportDiagnostics(unaryExpression, false, enclosingDecl).getType();
            this.checkForResolutionError(type, enclosingDecl);

            return type;
        };

        PullTypeChecker.prototype.typeCheckVoidExpression = function (unaryExpression, typeCheckContext) {
            this.typeCheckAST(unaryExpression.operand, typeCheckContext, false);

            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var type = this.resolveSymbolAndReportDiagnostics(unaryExpression, false, enclosingDecl).getType();
            this.checkForResolutionError(type, enclosingDecl);

            return type;
        };

        PullTypeChecker.prototype.typeCheckRegExpExpression = function (ast, typeCheckContext) {
            var type = this.resolveSymbolAndReportDiagnostics(ast, false, typeCheckContext.getEnclosingDecl()).getType();
            this.checkForResolutionError(type, typeCheckContext.getEnclosingDecl());
            return type;
        };

        PullTypeChecker.prototype.typeCheckForStatement = function (forStatement, typeCheckContext) {
            this.typeCheckAST(forStatement.init, typeCheckContext, false);
            this.typeCheckAST(forStatement.cond, typeCheckContext, false);
            this.typeCheckAST(forStatement.body, typeCheckContext, false);

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckForInStatement = function (ast, typeCheckContext) {
            var forInStatement = ast;

            var rhsType = this.resolver.widenType(this.typeCheckAST(forInStatement.obj, typeCheckContext, false));
            var lval = forInStatement.lval;

            if (lval.nodeType === TypeScript.NodeType.VariableDeclaration) {
                var declaration = forInStatement.lval;
                var varDecl = declaration.declarators.members[0];

                if (varDecl.typeExpr) {
                    this.postError(lval.minChar, lval.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Variable_declarations_for_for_in_expressions_cannot_contain_a_type_annotation, null, typeCheckContext.getEnclosingDecl());
                }
            }

            var varSym = this.resolveSymbolAndReportDiagnostics(forInStatement.lval, false, typeCheckContext.getEnclosingDecl());
            this.checkForResolutionError(varSym.getType(), typeCheckContext.getEnclosingDecl());

            var isStringOrNumber = varSym.getType() === this.semanticInfoChain.stringTypeSymbol || this.resolver.isAnyOrEquivalent(varSym.getType());

            var isValidRHS = rhsType && (this.resolver.isAnyOrEquivalent(rhsType) || !rhsType.isPrimitive());

            if (!isStringOrNumber) {
                this.postError(lval.minChar, lval.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Variable_declarations_for_for_in_expressions_must_be_of_types__string__or__any_, null, typeCheckContext.getEnclosingDecl());
            }

            if (!isValidRHS) {
                this.postError(forInStatement.obj.minChar, forInStatement.obj.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.The_right_operand_of_a_for_in_expression_must_be_of_type__any____an_object_type_or_a_type_parameter, null, typeCheckContext.getEnclosingDecl());
            }

            this.typeCheckAST(forInStatement.body, typeCheckContext, false);

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckInExpression = function (binaryExpression, typeCheckContext) {
            var lhsType = this.resolver.widenType(this.typeCheckAST(binaryExpression.operand1, typeCheckContext, false));
            var rhsType = this.resolver.widenType(this.typeCheckAST(binaryExpression.operand2, typeCheckContext, false));

            var isStringAnyOrNumber = lhsType.getType() === this.semanticInfoChain.stringTypeSymbol || this.resolver.isAnyOrEquivalent(lhsType.getType()) || this.resolver.isNumberOrEquivalent(lhsType.getType());
            var isValidRHS = rhsType && (this.resolver.isAnyOrEquivalent(rhsType) || !rhsType.isPrimitive());

            if (!isStringAnyOrNumber) {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.The_left_hand_side_of_an__in__expression_must_be_of_types__string__or__any_, null, typeCheckContext.getEnclosingDecl());
            }

            if (!isValidRHS) {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.The_right_hand_side_of_an__in__expression_must_be_of_type__any___an_object_type_or_a_type_parameter, null, typeCheckContext.getEnclosingDecl());
            }

            return this.semanticInfoChain.booleanTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckInstanceOfExpression = function (binaryExpression, typeCheckContext) {
            var lhsType = this.resolver.widenType(this.typeCheckAST(binaryExpression.operand1, typeCheckContext, false));
            var rhsType = this.typeCheckAST(binaryExpression.operand2, typeCheckContext, false);

            var isValidLHS = lhsType && (this.resolver.isAnyOrEquivalent(lhsType) || !lhsType.isPrimitive());
            var isValidRHS = rhsType && (this.resolver.isAnyOrEquivalent(rhsType) || rhsType.isClass() || this.resolver.typeIsSubtypeOfFunction(rhsType, this.context));

            if (!isValidLHS) {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.The_left_hand_side_of_an__instanceOf__expression_must_be_of_type__any___an_object_type_or_a_type_parameter, null, typeCheckContext.getEnclosingDecl());
            }

            if (!isValidRHS) {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.The_right_hand_side_of_an__instanceOf__expression_must_be_of_type__any__or_a_subtype_of_the__Function__interface_type, null, typeCheckContext.getEnclosingDecl());
            }

            return this.semanticInfoChain.booleanTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckParenthesizedExpression = function (parenthesizedExpression, typeCheckContext) {
            return this.typeCheckAST(parenthesizedExpression.expression, typeCheckContext, false);
        };

        PullTypeChecker.prototype.typeCheckWhileStatement = function (whileStatement, typeCheckContext) {
            this.typeCheckAST(whileStatement.cond, typeCheckContext, false);
            this.typeCheckAST(whileStatement.body, typeCheckContext, false);

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckDoStatement = function (doStatement, typeCheckContext) {
            this.typeCheckAST(doStatement.cond, typeCheckContext, false);
            this.typeCheckAST(doStatement.body, typeCheckContext, false);

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckIfStatement = function (ifStatement, typeCheckContext) {
            this.typeCheckAST(ifStatement.cond, typeCheckContext, false);
            this.typeCheckAST(ifStatement.thenBod, typeCheckContext, false);
            this.typeCheckAST(ifStatement.elseBod, typeCheckContext, false);

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckBlock = function (block, typeCheckContext) {
            this.typeCheckAST(block.statements, typeCheckContext, false);

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckVariableDeclaration = function (variableDeclaration, typeCheckContext) {
            this.typeCheckAST(variableDeclaration.declarators, typeCheckContext, false);

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckVariableStatement = function (variableStatement, typeCheckContext) {
            this.typeCheckAST(variableStatement.declaration, typeCheckContext, false);

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckWithStatement = function (withStatement, typeCheckContext) {
            this.postError(withStatement.expr.minChar, withStatement.expr.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.All_symbols_within_a__with__block_will_be_resolved_to__any__, null, typeCheckContext.getEnclosingDecl());

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckTryStatement = function (tryStatement, typeCheckContext) {
            this.typeCheckAST(tryStatement.tryBody, typeCheckContext, false);
            this.typeCheckAST(tryStatement.catchClause, typeCheckContext, false);
            this.typeCheckAST(tryStatement.finallyBody, typeCheckContext, false);

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckCatchClause = function (catchClause, typeCheckContext) {
            var catchDecl = this.resolver.getDeclForAST(catchClause);

            typeCheckContext.pushEnclosingDecl(catchDecl);
            this.typeCheckAST(catchClause.body, typeCheckContext, false);
            typeCheckContext.popEnclosingDecl();

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckReturnStatement = function (returnAST, typeCheckContext) {
            typeCheckContext.setEnclosingDeclHasReturn();

            var returnExpr = returnAST.returnExpression;
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var inContextuallyTypedAssignment = false;
            var enclosingDeclAST;

            if (enclosingDecl.getKind() & TypeScript.PullElementKind.SomeFunction) {
                enclosingDeclAST = this.resolver.getASTForDecl(enclosingDecl);
                if (enclosingDeclAST.returnTypeAnnotation) {
                    var returnTypeAnnotationSymbol = this.resolver.resolveTypeReference(enclosingDeclAST.returnTypeAnnotation, enclosingDecl, this.context).symbol;
                    if (returnTypeAnnotationSymbol) {
                        inContextuallyTypedAssignment = true;
                        this.context.pushContextualType(returnTypeAnnotationSymbol, this.context.inProvisionalResolution(), null);
                    }
                } else {
                    var currentContextualType = this.context.getContextualType();
                    if (currentContextualType && currentContextualType.isFunction()) {
                        var currentContextualTypeSignatureSymbol = currentContextualType.getDeclarations()[0].getSignatureSymbol();
                        var currentContextualTypeReturnTypeSymbol = currentContextualTypeSignatureSymbol.getReturnType();
                        if (currentContextualTypeReturnTypeSymbol) {
                            inContextuallyTypedAssignment = true;
                            this.context.pushContextualType(currentContextualTypeReturnTypeSymbol, this.context.inProvisionalResolution(), null);
                        }
                    }
                }
            }

            var returnType = this.typeCheckAST(returnExpr, typeCheckContext, inContextuallyTypedAssignment);

            if (inContextuallyTypedAssignment) {
                this.context.popContextualType();
            }

            if (enclosingDecl.getKind() === TypeScript.PullElementKind.SetAccessor && returnExpr) {
                this.postError(returnExpr.minChar, returnExpr.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Setters_cannot_return_a_value, null, typeCheckContext.getEnclosingDecl());
            }

            if (enclosingDecl.getKind() & TypeScript.PullElementKind.SomeFunction) {
                enclosingDeclAST = this.resolver.getASTForDecl(enclosingDecl);

                if (enclosingDeclAST.returnTypeAnnotation) {
                    var signatureSymbol = enclosingDecl.getSignatureSymbol();
                    var sigReturnType = signatureSymbol.getReturnType();

                    if (returnType && sigReturnType) {
                        var comparisonInfo = new TypeComparisonInfo();
                        var upperBound = null;

                        if (returnType.isTypeParameter()) {
                            upperBound = (returnType).getConstraint();

                            if (upperBound) {
                                returnType = upperBound;
                            }
                        }

                        if (sigReturnType.isTypeParameter()) {
                            upperBound = (sigReturnType).getConstraint();

                            if (upperBound) {
                                sigReturnType = upperBound;
                            }
                        }

                        if (!returnType.isResolved()) {
                            this.resolver.resolveDeclaredSymbol(returnType, enclosingDecl, this.context);
                        }

                        if (!sigReturnType.isResolved()) {
                            this.resolver.resolveDeclaredSymbol(sigReturnType, enclosingDecl, this.context);
                        }

                        var isAssignable = this.resolver.sourceIsAssignableToTarget(returnType, sigReturnType, this.context, comparisonInfo);

                        if (!isAssignable) {
                            if (comparisonInfo.message) {
                                this.postError(returnExpr.minChar, returnExpr.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Cannot_convert__0__to__1__NL__2, [returnType.toString(), sigReturnType.toString(), comparisonInfo.message], enclosingDecl);
                            } else {
                                this.postError(returnExpr.minChar, returnExpr.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Cannot_convert__0__to__1_, [returnType.toString(), sigReturnType.toString()], enclosingDecl);
                            }
                        }
                    }
                }
            }

            return returnType;
        };

        PullTypeChecker.prototype.typeCheckNameExpression = function (ast, typeCheckContext) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var type = this.resolveSymbolAndReportDiagnostics(ast, false, enclosingDecl).getType();
            this.checkForResolutionError(type, enclosingDecl);
            return type;
        };

        PullTypeChecker.prototype.checkForSuperMemberAccess = function (memberAccessExpression, typeCheckContext, resolvedName) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            if (resolvedName) {
                if (memberAccessExpression.operand1.nodeType === TypeScript.NodeType.SuperExpression && !resolvedName.isError() && resolvedName.getKind() !== TypeScript.PullElementKind.Method) {
                    this.postError(memberAccessExpression.operand2.minChar, memberAccessExpression.operand2.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Only_public_instance_methods_of_the_base_class_are_accessible_via_the_super_keyword, [], enclosingDecl);
                    return true;
                }
            }

            return false;
        };

        PullTypeChecker.prototype.checkForPrivateMemberAccess = function (memberAccessExpression, typeCheckContext, expressionType, resolvedName) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            if (resolvedName) {
                if (resolvedName.hasFlag(TypeScript.PullElementFlags.Private)) {
                    var memberContainer = resolvedName.getContainer();
                    if (memberContainer && memberContainer.getKind() === TypeScript.PullElementKind.ConstructorType) {
                        memberContainer = memberContainer.getAssociatedContainerType();
                    }

                    if (memberContainer && memberContainer.isClass()) {
                        var containingClass = typeCheckContext.getEnclosingClassDecl();
                        if (!containingClass || containingClass.getSymbol() !== memberContainer) {
                            var name = memberAccessExpression.operand2;
                            this.postError(name.minChar, name.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode._0_1__is_inaccessible, [memberContainer.toString(false), name.actualText], enclosingDecl);
                            return true;
                        }
                    }
                }
            }

            return false;
        };

        PullTypeChecker.prototype.checkForStaticMemberAccess = function (memberAccessExpression, typeCheckContext, expressionType, resolvedName) {
            if (expressionType && resolvedName && !resolvedName.isError()) {
                if (expressionType.isClass() || expressionType.getKind() === TypeScript.PullElementKind.ConstructorType) {
                    var name = memberAccessExpression.operand2;
                    var enclosingDecl = typeCheckContext.getEnclosingDecl();

                    if (resolvedName.hasFlag(TypeScript.PullElementFlags.Static) || this.resolver.isPrototypeMember(memberAccessExpression, enclosingDecl, this.context)) {
                        if (expressionType.getKind() !== TypeScript.PullElementKind.ConstructorType) {
                            var enclosingDecl = typeCheckContext.getEnclosingDecl();
                            this.postError(name.minChar, name.getLength(), typeCheckContext.scriptName, TypeScript.DiagnosticCode.Static_member_cannot_be_accessed_off_an_instance_variable, null, enclosingDecl);
                            return true;
                        }
                    }
                }
            }

            return false;
        };

        PullTypeChecker.prototype.typeCheckMemberAccessExpression = function (memberAccessExpression, typeCheckContext) {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var resolvedName = this.resolveSymbolAndReportDiagnostics(memberAccessExpression, false, enclosingDecl);
            var type = resolvedName.getType();

            this.checkForResolutionError(type, enclosingDecl);
            var prevCanUseTypeSymbol = this.context.canUseTypeSymbol;
            this.context.canUseTypeSymbol = true;
            var expressionType = this.typeCheckAST(memberAccessExpression.operand1, typeCheckContext, false);
            this.context.canUseTypeSymbol = prevCanUseTypeSymbol;

            this.checkForSuperMemberAccess(memberAccessExpression, typeCheckContext, resolvedName) || this.checkForPrivateMemberAccess(memberAccessExpression, typeCheckContext, expressionType, resolvedName) || this.checkForStaticMemberAccess(memberAccessExpression, typeCheckContext, expressionType, resolvedName);

            return type;
        };

        PullTypeChecker.prototype.typeCheckSwitchStatement = function (switchStatement, typeCheckContext) {
            this.typeCheckAST(switchStatement.val, typeCheckContext, false);
            this.typeCheckAST(switchStatement.caseList, typeCheckContext, false);
            this.typeCheckAST(switchStatement.defaultCase, typeCheckContext, false);

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckExpressionStatement = function (ast, typeCheckContext, inContextuallyTypedAssignment) {
            return this.typeCheckAST(ast.expression, typeCheckContext, inContextuallyTypedAssignment);
        };

        PullTypeChecker.prototype.typeCheckCaseClause = function (caseClause, typeCheckContext) {
            this.typeCheckAST(caseClause.expr, typeCheckContext, false);
            this.typeCheckAST(caseClause.body, typeCheckContext, false);

            return this.semanticInfoChain.voidTypeSymbol;
        };

        PullTypeChecker.prototype.typeCheckLabeledStatement = function (labeledStatement, typeCheckContext) {
            return this.typeCheckAST(labeledStatement.statement, typeCheckContext, false);
        };

        PullTypeChecker.prototype.checkTypePrivacy = function (declSymbol, typeSymbol, typeCheckContext, privacyErrorReporter) {
            if (!typeSymbol || typeSymbol.getKind() === TypeScript.PullElementKind.Primitive) {
                return;
            }

            if (typeSymbol.isArray()) {
                this.checkTypePrivacy(declSymbol, (typeSymbol).getElementType(), typeCheckContext, privacyErrorReporter);
                return;
            }

            if (!typeSymbol.isNamedTypeSymbol()) {
                var members = typeSymbol.getMembers();
                for (var i = 0; i < members.length; i++) {
                    this.checkTypePrivacy(declSymbol, members[i].getType(), typeCheckContext, privacyErrorReporter);
                }

                this.checkTypePrivacyOfSignatures(declSymbol, typeSymbol.getCallSignatures(), typeCheckContext, privacyErrorReporter);
                this.checkTypePrivacyOfSignatures(declSymbol, typeSymbol.getConstructSignatures(), typeCheckContext, privacyErrorReporter);
                this.checkTypePrivacyOfSignatures(declSymbol, typeSymbol.getIndexSignatures(), typeCheckContext, privacyErrorReporter);

                return;
            }

            if (declSymbol.isExternallyVisible()) {
                var typeSymbolIsVisible = typeSymbol.isExternallyVisible();

                if (typeSymbolIsVisible) {
                    var typeSymbolPath = typeSymbol.pathToRoot();
                    if (typeSymbolPath.length && typeSymbolPath[typeSymbolPath.length - 1].getKind() === TypeScript.PullElementKind.DynamicModule) {
                        var declSymbolPath = declSymbol.pathToRoot();
                        if (declSymbolPath.length && declSymbolPath[declSymbolPath.length - 1] != typeSymbolPath[typeSymbolPath.length - 1]) {
                            typeSymbolIsVisible = false;
                            for (var i = typeSymbolPath.length - 1; i >= 0; i--) {
                                var aliasSymbol = typeSymbolPath[i].getAliasedSymbol(declSymbol);
                                if (aliasSymbol) {
                                    TypeScript.CompilerDiagnostics.assert(aliasSymbol.getKind() === TypeScript.PullElementKind.TypeAlias, "dynamic module need to be referenced by type alias");
                                    (aliasSymbol).setIsTypeUsedExternally();
                                    typeSymbolIsVisible = true;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (!typeSymbolIsVisible) {
                    privacyErrorReporter(typeSymbol);
                }
            }
        };

        PullTypeChecker.prototype.checkTypePrivacyOfSignatures = function (declSymbol, signatures, typeCheckContext, privacyErrorReporter) {
            for (var i = 0; i < signatures.length; i++) {
                var signature = signatures[i];
                if (signatures.length && signature.isDefinition()) {
                    continue;
                }

                var typeParams = signature.getTypeParameters();
                for (var j = 0; j < typeParams.length; j++) {
                    this.checkTypePrivacy(declSymbol, typeParams[j], typeCheckContext, privacyErrorReporter);
                }

                var params = signature.getParameters();
                for (var j = 0; j < params.length; j++) {
                    var paramType = params[j].getType();
                    this.checkTypePrivacy(declSymbol, paramType, typeCheckContext, privacyErrorReporter);
                }

                var returnType = signature.getReturnType();
                this.checkTypePrivacy(declSymbol, returnType, typeCheckContext, privacyErrorReporter);
            }
        };

        PullTypeChecker.prototype.baseListPrivacyErrorReporter = function (declAST, declSymbol, baseAst, isExtendedType, typeSymbol, typeCheckContext) {
            var decl = this.resolver.getDeclForAST(declAST);
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var messageCode;
            var messageArguments;

            var typeSymbolName = typeSymbol.getScopedName();
            if (typeSymbol.isContainer()) {
                if (!TypeScript.isQuoted(typeSymbolName)) {
                    typeSymbolName = "'" + typeSymbolName + "'";
                }
                if (declAST.nodeType === TypeScript.NodeType.ClassDeclaration) {
                    if (isExtendedType) {
                        messageCode = TypeScript.DiagnosticCode.Exported_class__0__extends_class_from_inaccessible_module__1_;
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    } else {
                        messageCode = TypeScript.DiagnosticCode.Exported_class__0__implements_interface_from_inaccessible_module__1_;
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    }
                } else {
                    messageCode = TypeScript.DiagnosticCode.Exported_interface__0__extends_interface_from_inaccessible_module__1_;
                    messageArguments = [declSymbol.getDisplayName(), typeSymbolName];
                }
            } else {
                if (declAST.nodeType === TypeScript.NodeType.ClassDeclaration) {
                    if (isExtendedType) {
                        messageCode = TypeScript.DiagnosticCode.Exported_class__0__extends_private_class__1_;
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    } else {
                        messageCode = TypeScript.DiagnosticCode.Exported_class__0__implements_private_interface__1_;
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    }
                } else {
                    messageCode = TypeScript.DiagnosticCode.Exported_interface__0__extends_private_interface__1_;
                    messageArguments = [declSymbol.getDisplayName(), typeSymbolName];
                }
            }

            this.context.postError(typeCheckContext.scriptName, baseAst.minChar, baseAst.getLength(), messageCode, messageArguments, enclosingDecl, true);
        };

        PullTypeChecker.prototype.variablePrivacyErrorReporter = function (declSymbol, typeSymbol, typeCheckContext) {
            var declAST = this.resolver.getASTForSymbol(declSymbol);
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var isProperty = declSymbol.getKind() === TypeScript.PullElementKind.Property;
            var isPropertyOfClass = false;
            var declParent = declSymbol.getContainer();
            if (declParent && (declParent.getKind() === TypeScript.PullElementKind.Class || declParent.getKind() === TypeScript.PullElementKind.ConstructorMethod)) {
                isPropertyOfClass = true;
            }

            var messageCode;
            var messageArguments;
            var typeSymbolName = typeSymbol.getScopedName();
            if (typeSymbol.isContainer()) {
                if (!TypeScript.isQuoted(typeSymbolName)) {
                    typeSymbolName = "'" + typeSymbolName + "'";
                }

                if (declSymbol.hasFlag(TypeScript.PullElementFlags.Static)) {
                    messageCode = TypeScript.DiagnosticCode.Public_static_property__0__of__exported_class_is_using_inaccessible_module__1_;
                    messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                } else if (isProperty) {
                    if (isPropertyOfClass) {
                        messageCode = TypeScript.DiagnosticCode.Public_property__0__of__exported_class_is_using_inaccessible_module__1_;
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    } else {
                        messageCode = TypeScript.DiagnosticCode.Property__0__of__exported_interface_is_using_inaccessible_module__1_;
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    }
                } else {
                    messageCode = TypeScript.DiagnosticCode.Exported_variable__0__is_using_inaccessible_module__1_;
                    messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                }
            } else {
                if (declSymbol.hasFlag(TypeScript.PullElementFlags.Static)) {
                    messageCode = TypeScript.DiagnosticCode.Public_static_property__0__of__exported_class_has_or_is_using_private_type__1_;
                    messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                } else if (isProperty) {
                    if (isPropertyOfClass) {
                        messageCode = TypeScript.DiagnosticCode.Public_property__0__of__exported_class_has_or_is_using_private_type__1_;
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    } else {
                        messageCode = TypeScript.DiagnosticCode.Property__0__of__exported_interface_has_or_is_using_private_type__1_;
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    }
                } else {
                    messageCode = TypeScript.DiagnosticCode.Exported_variable__0__has_or_is_using_private_type__1_;
                    messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                }
            }

            this.context.postError(typeCheckContext.scriptName, declAST.minChar, declAST.getLength(), messageCode, messageArguments, enclosingDecl, true);
        };

        PullTypeChecker.prototype.checkFunctionTypePrivacy = function (funcDeclAST, inContextuallyTypedAssignment, typeCheckContext) {
            var _this = this;
            if (inContextuallyTypedAssignment || (funcDeclAST.getFunctionFlags() & TypeScript.FunctionFlags.IsFunctionExpression) || (funcDeclAST.getFunctionFlags() & TypeScript.FunctionFlags.IsFunctionProperty)) {
                return;
            }

            var functionDecl = typeCheckContext.semanticInfo.getDeclForAST(funcDeclAST);
            var functionSymbol = functionDecl.getSymbol();
            ;
            var functionSignature;

            var isGetter = funcDeclAST.isGetAccessor();
            var isSetter = funcDeclAST.isSetAccessor();

            if (isGetter || isSetter) {
                var accessorSymbol = functionSymbol;
                functionSignature = (isGetter ? accessorSymbol.getGetter() : accessorSymbol.getSetter()).getType().getCallSignatures()[0];
            } else {
                if (!functionSymbol) {
                    var parentDecl = functionDecl.getParentDecl();
                    functionSymbol = parentDecl.getSymbol();
                    if (functionSymbol && functionSymbol.isType() && !(functionSymbol).isNamedTypeSymbol()) {
                        return;
                    }
                } else if (functionSymbol.getKind() == TypeScript.PullElementKind.Method && !functionSymbol.getContainer().isNamedTypeSymbol()) {
                    return;
                }
                functionSignature = functionDecl.getSignatureSymbol();
            }

            if (!isGetter) {
                var funcParams = functionSignature.getParameters();
                for (var i = 0; i < funcParams.length; i++) {
                    this.checkTypePrivacy(functionSymbol, funcParams[i].getType(), typeCheckContext, function (typeSymbol) {
                        return _this.functionArgumentTypePrivacyErrorReporter(funcDeclAST, i, funcParams[i], typeSymbol, typeCheckContext);
                    });
                }
            }

            if (!isSetter) {
                this.checkTypePrivacy(functionSymbol, functionSignature.getReturnType(), typeCheckContext, function (typeSymbol) {
                    return _this.functionReturnTypePrivacyErrorReporter(funcDeclAST, functionSignature.getReturnType(), typeSymbol, typeCheckContext);
                });
            }
        };

        PullTypeChecker.prototype.functionArgumentTypePrivacyErrorReporter = function (declAST, argIndex, paramSymbol, typeSymbol, typeCheckContext) {
            var decl = this.resolver.getDeclForAST(declAST);
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var isGetter = declAST.isAccessor() && TypeScript.hasFlag(declAST.getFunctionFlags(), TypeScript.FunctionFlags.GetAccessor);
            var isSetter = declAST.isAccessor() && TypeScript.hasFlag(declAST.getFunctionFlags(), TypeScript.FunctionFlags.SetAccessor);
            var isStatic = (decl.getFlags() & TypeScript.PullElementFlags.Static) === TypeScript.PullElementFlags.Static;
            var isMethod = decl.getKind() === TypeScript.PullElementKind.Method;
            var isMethodOfClass = false;
            var declParent = decl.getParentDecl();
            if (declParent && (declParent.getKind() === TypeScript.PullElementKind.Class || declParent.getKind() === TypeScript.PullElementKind.ConstructorMethod)) {
                isMethodOfClass = true;
            }

            var start = declAST.arguments.members[argIndex].minChar;
            var length = declAST.arguments.members[argIndex].getLength();

            var typeSymbolName = typeSymbol.getScopedName();
            if (typeSymbol.isContainer()) {
                if (!TypeScript.isQuoted(typeSymbolName)) {
                    typeSymbolName = "'" + typeSymbolName + "'";
                }

                if (declAST.isConstructor) {
                    this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_constructor_from_exported_class_is_using_inaccessible_module__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                } else if (isSetter) {
                    if (isStatic) {
                        this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_public_static_property_setter_from_exported_class_is_using_inaccessible_module__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    } else {
                        this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_public_property_setter_from_exported_class_is_using_inaccessible_module__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    }
                } else if (declAST.isConstructMember()) {
                    this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_constructor_signature_from_exported_interface_is_using_inaccessible_module__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                } else if (declAST.isCallMember()) {
                    this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_call_signature_from_exported_interface_is_using_inaccessible_module__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                } else if (isMethod) {
                    if (isStatic) {
                        this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_public_static_method_from_exported_class_is_using_inaccessible_module__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    } else if (isMethodOfClass) {
                        this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_public_method_from_exported_class_is_using_inaccessible_module__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    } else {
                        this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_method_from_exported_interface_is_using_inaccessible_module__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    }
                } else if (!isGetter) {
                    this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_exported_function_is_using_inaccessible_module__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                }
            } else {
                if (declAST.isConstructor) {
                    this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_constructor_from_exported_class_has_or_is_using_private_type__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                } else if (isSetter) {
                    if (isStatic) {
                        this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_public_static_property_setter_from_exported_class_has_or_is_using_private_type__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    } else {
                        this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_public_property_setter_from_exported_class_has_or_is_using_private_type__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    }
                } else if (declAST.isConstructMember()) {
                    this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_constructor_signature_from_exported_interface_has_or_is_using_private_type__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                } else if (declAST.isCallMember()) {
                    this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_call_signature_from_exported_interface_has_or_is_using_private_type__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                } else if (isMethod) {
                    if (isStatic) {
                        this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_public_static_method_from_exported_class_has_or_is_using_private_type__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    } else if (isMethodOfClass) {
                        this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_public_method_from_exported_class_has_or_is_using_private_type__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    } else {
                        this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_method_from_exported_interface_has_or_is_using_private_type__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    }
                } else if (!isGetter && !declAST.isIndexerMember()) {
                    this.context.postError(typeCheckContext.scriptName, start, length, TypeScript.DiagnosticCode.Parameter__0__of_exported_function_has_or_is_using_private_type__1_, [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                }
            }
        };

        PullTypeChecker.prototype.functionReturnTypePrivacyErrorReporter = function (declAST, funcReturnType, typeSymbol, typeCheckContext) {
            var _this = this;
            var decl = this.resolver.getDeclForAST(declAST);
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var isGetter = declAST.isAccessor() && TypeScript.hasFlag(declAST.getFunctionFlags(), TypeScript.FunctionFlags.GetAccessor);
            var isSetter = declAST.isAccessor() && TypeScript.hasFlag(declAST.getFunctionFlags(), TypeScript.FunctionFlags.SetAccessor);
            var isStatic = (decl.getFlags() & TypeScript.PullElementFlags.Static) === TypeScript.PullElementFlags.Static;
            var isMethod = decl.getKind() === TypeScript.PullElementKind.Method;
            var isMethodOfClass = false;
            var declParent = decl.getParentDecl();
            if (declParent && (declParent.getKind() === TypeScript.PullElementKind.Class || declParent.getKind() === TypeScript.PullElementKind.ConstructorMethod)) {
                isMethodOfClass = true;
            }

            var messageCode = null;
            var messageArguments;
            var typeSymbolName = typeSymbol.getScopedName();
            if (typeSymbol.isContainer()) {
                if (!TypeScript.isQuoted(typeSymbolName)) {
                    typeSymbolName = "'" + typeSymbolName + "'";
                }

                if (isGetter) {
                    if (isStatic) {
                        messageCode = TypeScript.DiagnosticCode.Return_type_of_public_static_property_getter_from_exported_class_is_using_inaccessible_module__0_;
                        messageArguments = [typeSymbolName];
                    } else {
                        messageCode = TypeScript.DiagnosticCode.Return_type_of_public_property_getter_from_exported_class_is_using_inaccessible_module__0_;
                        messageArguments = [typeSymbolName];
                    }
                } else if (declAST.isConstructMember()) {
                    messageCode = TypeScript.DiagnosticCode.Return_type_of_constructor_signature_from_exported_interface_is_using_inaccessible_module__0_;
                    messageArguments = [typeSymbolName];
                } else if (declAST.isCallMember()) {
                    messageCode = TypeScript.DiagnosticCode.Return_type_of_call_signature_from_exported_interface_is_using_inaccessible_module__0_;
                    messageArguments = [typeSymbolName];
                } else if (declAST.isIndexerMember()) {
                    messageCode = TypeScript.DiagnosticCode.Return_type_of_index_signature_from_exported_interface_is_using_inaccessible_module__0_;
                    messageArguments = [typeSymbolName];
                } else if (isMethod) {
                    if (isStatic) {
                        messageCode = TypeScript.DiagnosticCode.Return_type_of_public_static_method_from_exported_class_is_using_inaccessible_module__0_;
                        messageArguments = [typeSymbolName];
                    } else if (isMethodOfClass) {
                        messageCode = TypeScript.DiagnosticCode.Return_type_of_public_method_from_exported_class_is_using_inaccessible_module__0_;
                        messageArguments = [typeSymbolName];
                    } else {
                        messageCode = TypeScript.DiagnosticCode.Return_type_of_method_from_exported_interface_is_using_inaccessible_module__0_;
                        messageArguments = [typeSymbolName];
                    }
                } else if (!isSetter && !declAST.isConstructor) {
                    messageCode = TypeScript.DiagnosticCode.Return_type_of_exported_function_is_using_inaccessible_module__0_;
                    messageArguments = [typeSymbolName];
                }
            } else {
                if (isGetter) {
                    if (isStatic) {
                        messageCode = TypeScript.DiagnosticCode.Return_type_of_public_static_property_getter_from_exported_class_has_or_is_using_private_type__0_;
                        messageArguments = [typeSymbolName];
                    } else {
                        messageCode = TypeScript.DiagnosticCode.Return_type_of_public_property_getter_from_exported_class_has_or_is_using_private_type__0_;
                        messageArguments = [typeSymbolName];
                    }
                } else if (declAST.isConstructMember()) {
                    messageCode = TypeScript.DiagnosticCode.Return_type_of_constructor_signature_from_exported_interface_has_or_is_using_private_type__0_;
                    messageArguments = [typeSymbolName];
                } else if (declAST.isCallMember()) {
                    messageCode = TypeScript.DiagnosticCode.Return_type_of_call_signature_from_exported_interface_has_or_is_using_private_type__0_;
                    messageArguments = [typeSymbolName];
                } else if (declAST.isIndexerMember()) {
                    messageCode = TypeScript.DiagnosticCode.Return_type_of_index_signature_from_exported_interface_has_or_is_using_private_type__0_;
                    messageArguments = [typeSymbolName];
                } else if (isMethod) {
                    if (isStatic) {
                        messageCode = TypeScript.DiagnosticCode.Return_type_of_public_static_method_from_exported_class_has_or_is_using_private_type__0_;
                        messageArguments = [typeSymbolName];
                    } else if (isMethodOfClass) {
                        messageCode = TypeScript.DiagnosticCode.Return_type_of_public_method_from_exported_class_has_or_is_using_private_type__0_;
                        messageArguments = [typeSymbolName];
                    } else {
                        messageCode = TypeScript.DiagnosticCode.Return_type_of_method_from_exported_interface_has_or_is_using_private_type__0_;
                        messageArguments = [typeSymbolName];
                    }
                } else if (!isSetter && !declAST.isConstructor) {
                    messageCode = TypeScript.DiagnosticCode.Return_type_of_exported_function_has_or_is_using_private_type__0_;
                    messageArguments = [typeSymbolName];
                }
            }

            if (messageCode) {
                var reportOnFuncDecl = false;
                var contextForReturnTypeResolution = new TypeScript.PullTypeResolutionContext();
                if (declAST.returnTypeAnnotation) {
                    var returnExpressionSymbolAndDiagnostics = this.resolver.resolveTypeReference(declAST.returnTypeAnnotation, decl, contextForReturnTypeResolution);
                    var returnExpressionSymbol = returnExpressionSymbolAndDiagnostics && returnExpressionSymbolAndDiagnostics.symbol;
                    if (returnExpressionSymbol === funcReturnType) {
                        this.context.postError(typeCheckContext.scriptName, declAST.returnTypeAnnotation.minChar, declAST.returnTypeAnnotation.getLength(), messageCode, messageArguments, enclosingDecl, true);
                    }
                }

                if (declAST.block) {
                    var reportErrorOnReturnExpressions = function (ast, parent, walker) {
                        var go = true;
                        switch (ast.nodeType) {
                            case TypeScript.NodeType.FunctionDeclaration:
                                go = false;
                                break;

                            case TypeScript.NodeType.ReturnStatement:
                                var returnStatement = ast;
                                var returnExpressionSymbol = _this.resolver.resolveAST(returnStatement.returnExpression, false, decl, contextForReturnTypeResolution).symbol.getType();

                                if (returnExpressionSymbol === funcReturnType) {
                                    _this.context.postError(typeCheckContext.scriptName, returnStatement.minChar, returnStatement.getLength(), messageCode, messageArguments, enclosingDecl, true);
                                } else {
                                    reportOnFuncDecl = true;
                                }
                                go = false;
                                break;

                            default:
                                break;
                        }

                        walker.options.goChildren = go;
                        return ast;
                    };

                    TypeScript.getAstWalkerFactory().walk(declAST.block, reportErrorOnReturnExpressions);
                }

                if (reportOnFuncDecl) {
                    this.context.postError(typeCheckContext.scriptName, declAST.minChar, declAST.getLength(), messageCode, messageArguments, enclosingDecl, true);
                }
            }
        };
        PullTypeChecker.globalPullTypeCheckPhase = 0;
        return PullTypeChecker;
    })();
    TypeScript.PullTypeChecker = PullTypeChecker;
})(TypeScript || (TypeScript = {}));
