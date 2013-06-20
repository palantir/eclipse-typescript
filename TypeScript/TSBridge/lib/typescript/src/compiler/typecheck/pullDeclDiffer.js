var TypeScript;
(function (TypeScript) {
    (function (PullDeclEdit) {
        PullDeclEdit[PullDeclEdit["NoChanges"] = 0] = "NoChanges";
        PullDeclEdit[PullDeclEdit["DeclAdded"] = 1] = "DeclAdded";
        PullDeclEdit[PullDeclEdit["DeclRemoved"] = 2] = "DeclRemoved";
        PullDeclEdit[PullDeclEdit["DeclChanged"] = 3] = "DeclChanged";
    })(TypeScript.PullDeclEdit || (TypeScript.PullDeclEdit = {}));
    var PullDeclEdit = TypeScript.PullDeclEdit;

    var PullDeclDiff = (function () {
        function PullDeclDiff(oldDecl, newDecl, kind) {
            this.oldDecl = oldDecl;
            this.newDecl = newDecl;
            this.kind = kind;
        }
        return PullDeclDiff;
    })();
    TypeScript.PullDeclDiff = PullDeclDiff;

    var PullDeclDiffer = (function () {
        function PullDeclDiffer(oldSemanticInfo, newSemanticInfo) {
            this.oldSemanticInfo = oldSemanticInfo;
            this.newSemanticInfo = newSemanticInfo;
            this.differences = [];
        }
        PullDeclDiffer.diffDecls = function (oldDecl, oldSemanticInfo, newDecl, newSemanticInfo) {
            var declDiffer = new PullDeclDiffer(oldSemanticInfo, newSemanticInfo);
            declDiffer.diff(oldDecl, newDecl);
            return declDiffer.differences;
        };

        PullDeclDiffer.prototype.diff = function (oldDecl, newDecl) {
            TypeScript.Debug.assert(oldDecl.getName() === newDecl.getName());
            TypeScript.Debug.assert(oldDecl.getKind() === newDecl.getKind());

            var oldAST = this.oldSemanticInfo.getASTForDecl(oldDecl);
            var newAST = this.newSemanticInfo.getASTForDecl(newDecl);
            TypeScript.Debug.assert(oldAST !== undefined);
            TypeScript.Debug.assert(newAST !== undefined);

            if (oldAST === newAST) {
                return;
            }

            this.diff1(oldDecl, newDecl, oldAST, newAST, oldDecl.childDeclTypeCache, newDecl.childDeclTypeCache);
            this.diff1(oldDecl, newDecl, oldAST, newAST, oldDecl.childDeclTypeParameterCache, newDecl.childDeclTypeParameterCache);
            this.diff1(oldDecl, newDecl, oldAST, newAST, oldDecl.childDeclValueCache, newDecl.childDeclValueCache);
            this.diff1(oldDecl, newDecl, oldAST, newAST, oldDecl.childDeclNamespaceCache, newDecl.childDeclNamespaceCache);

            if (!this.isEquivalent(oldAST, newAST)) {
                this.differences.push(new PullDeclDiff(oldDecl, newDecl, PullDeclEdit.DeclChanged));
            }
        };

        PullDeclDiffer.prototype.diff1 = function (oldDecl, newDecl, oldAST, newAST, oldNameToDecls, newNameToDecls) {
            var oldChildrenOfName;
            var newChildrenOfName;
            var oldChild;
            var newChild;

            for (var name in oldNameToDecls) {
                oldChildrenOfName = oldNameToDecls[name] || PullDeclDiffer.emptyDeclArray;
                newChildrenOfName = newNameToDecls[name] || PullDeclDiffer.emptyDeclArray;

                for (var i = 0, n = oldChildrenOfName.length; i < n; i++) {
                    oldChild = oldChildrenOfName[i];

                    switch (oldChild.getKind()) {
                        case TypeScript.PullElementKind.FunctionExpression:
                        case TypeScript.PullElementKind.ObjectLiteral:
                        case TypeScript.PullElementKind.ObjectType:
                        case TypeScript.PullElementKind.FunctionType:
                        case TypeScript.PullElementKind.ConstructorType:
                            continue;
                    }

                    if (i < newChildrenOfName.length) {
                        newChild = newChildrenOfName[i];

                        if (oldChild.getKind() === newChild.getKind()) {
                            this.diff(oldChild, newChildrenOfName[i]);
                        } else {
                            this.differences.push(new PullDeclDiff(oldChild, null, PullDeclEdit.DeclRemoved));
                            this.differences.push(new PullDeclDiff(oldDecl, newChild, PullDeclEdit.DeclAdded));
                        }
                    } else {
                        this.differences.push(new PullDeclDiff(oldChild, null, PullDeclEdit.DeclRemoved));
                    }
                }
            }

            for (var name in newNameToDecls) {
                oldChildrenOfName = oldNameToDecls[name] || PullDeclDiffer.emptyDeclArray;
                newChildrenOfName = newNameToDecls[name] || PullDeclDiffer.emptyDeclArray;

                for (var i = oldChildrenOfName.length, n = newChildrenOfName.length; i < n; i++) {
                    newChild = newChildrenOfName[i];
                    this.differences.push(new PullDeclDiff(oldDecl, newChild, PullDeclEdit.DeclAdded));
                }
            }
        };

        PullDeclDiffer.prototype.isEquivalent = function (oldAST, newAST) {
            TypeScript.Debug.assert(oldAST !== null);
            TypeScript.Debug.assert(newAST !== null);
            TypeScript.Debug.assert(oldAST !== newAST);

            if (oldAST.nodeType !== newAST.nodeType || oldAST.getFlags() !== newAST.getFlags()) {
                return false;
            }

            switch (oldAST.nodeType) {
                case TypeScript.NodeType.ImportDeclaration:
                    return this.importDeclarationIsEquivalent(oldAST, newAST);
                case TypeScript.NodeType.ModuleDeclaration:
                    return this.moduleDeclarationIsEquivalent(oldAST, newAST);
                case TypeScript.NodeType.ClassDeclaration:
                    return this.classDeclarationIsEquivalent(oldAST, newAST);
                case TypeScript.NodeType.InterfaceDeclaration:
                    return this.interfaceDeclarationIsEquivalent(oldAST, newAST);
                case TypeScript.NodeType.Parameter:
                    return this.argumentDeclarationIsEquivalent(oldAST, newAST);
                case TypeScript.NodeType.VariableDeclarator:
                    return this.variableDeclarationIsEquivalent(oldAST, newAST);
                case TypeScript.NodeType.TypeParameter:
                    return this.typeParameterIsEquivalent(oldAST, newAST);
                case TypeScript.NodeType.FunctionDeclaration:
                    return this.functionDeclarationIsEquivalent(oldAST, newAST);
                case TypeScript.NodeType.CatchClause:
                    return this.catchClauseIsEquivalent(oldAST, newAST);
                case TypeScript.NodeType.WithStatement:
                    return this.withStatementIsEquivalent(oldAST, newAST);
                case TypeScript.NodeType.Script:
                    return this.scriptIsEquivalent(oldAST, newAST);
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        PullDeclDiffer.prototype.importDeclarationIsEquivalent = function (decl1, decl2) {
            return TypeScript.structuralEqualsNotIncludingPosition(decl1.alias, decl2.alias);
        };

        PullDeclDiffer.prototype.typeDeclarationIsEquivalent = function (decl1, decl2) {
            return decl1.getVarFlags() === decl2.getVarFlags() && TypeScript.structuralEqualsNotIncludingPosition(decl1.typeParameters, decl2.typeParameters) && TypeScript.structuralEqualsNotIncludingPosition(decl1.extendsList, decl2.extendsList) && TypeScript.structuralEqualsNotIncludingPosition(decl1.implementsList, decl2.implementsList);
        };

        PullDeclDiffer.prototype.classDeclarationIsEquivalent = function (decl1, decl2) {
            return this.typeDeclarationIsEquivalent(decl1, decl2);
        };

        PullDeclDiffer.prototype.interfaceDeclarationIsEquivalent = function (decl1, decl2) {
            return this.typeDeclarationIsEquivalent(decl1, decl2);
        };

        PullDeclDiffer.prototype.typeParameterIsEquivalent = function (decl1, decl2) {
            return TypeScript.structuralEqualsNotIncludingPosition(decl1.constraint, decl2.constraint);
        };

        PullDeclDiffer.prototype.boundDeclarationIsEquivalent = function (decl1, decl2) {
            if (decl1.getVarFlags() === decl2.getVarFlags() && TypeScript.structuralEqualsNotIncludingPosition(decl1.typeExpr, decl2.typeExpr)) {
                if (decl1.typeExpr === null) {
                    return TypeScript.structuralEqualsNotIncludingPosition(decl1.init, decl2.init);
                } else {
                    return true;
                }
            }

            return false;
        };

        PullDeclDiffer.prototype.argumentDeclarationIsEquivalent = function (decl1, decl2) {
            return this.boundDeclarationIsEquivalent(decl1, decl2) && decl1.isOptional === decl2.isOptional;
        };

        PullDeclDiffer.prototype.variableDeclarationIsEquivalent = function (decl1, decl2) {
            return this.boundDeclarationIsEquivalent(decl1, decl2);
        };

        PullDeclDiffer.prototype.functionDeclarationIsEquivalent = function (decl1, decl2) {
            if (decl1.hint === decl2.hint && decl1.getFunctionFlags() === decl2.getFunctionFlags() && decl1.variableArgList === decl2.variableArgList && decl1.isConstructor === decl2.isConstructor && TypeScript.structuralEqualsNotIncludingPosition(decl1.returnTypeAnnotation, decl2.returnTypeAnnotation) && TypeScript.structuralEqualsNotIncludingPosition(decl1.typeArguments, decl2.typeArguments) && TypeScript.structuralEqualsNotIncludingPosition(decl1.arguments, decl2.arguments)) {
                if (decl1.returnTypeAnnotation === null) {
                    return TypeScript.structuralEqualsNotIncludingPosition(decl1.block, decl2.block);
                } else {
                    return true;
                }
            }

            return false;
        };

        PullDeclDiffer.prototype.catchClauseIsEquivalent = function (decl1, decl2) {
            return TypeScript.structuralEqualsNotIncludingPosition(decl1.param, decl2.param) && TypeScript.structuralEqualsNotIncludingPosition(decl1.body, decl2.body);
        };

        PullDeclDiffer.prototype.withStatementIsEquivalent = function (decl1, decl2) {
            return TypeScript.structuralEqualsNotIncludingPosition(decl1.expr, decl2.expr) && TypeScript.structuralEqualsNotIncludingPosition(decl1.body, decl2.body);
        };

        PullDeclDiffer.prototype.scriptIsEquivalent = function (decl1, decl2) {
            return true;
        };

        PullDeclDiffer.prototype.moduleDeclarationIsEquivalent = function (decl1, decl2) {
            return decl1.getModuleFlags() === decl2.getModuleFlags() && decl2.prettyName === decl2.prettyName && TypeScript.ArrayUtilities.sequenceEquals(decl1.amdDependencies, decl2.amdDependencies, TypeScript.StringUtilities.stringEquals);
        };
        PullDeclDiffer.emptyDeclArray = [];
        return PullDeclDiffer;
    })();
    TypeScript.PullDeclDiffer = PullDeclDiffer;
})(TypeScript || (TypeScript = {}));
