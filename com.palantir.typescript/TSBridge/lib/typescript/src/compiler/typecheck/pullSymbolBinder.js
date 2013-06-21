var TypeScript;
(function (TypeScript) {
    TypeScript.globalBindingPhase = 0;

    var PullSymbolBinder = (function () {
        function PullSymbolBinder(compilationSettings, semanticInfoChain) {
            this.compilationSettings = compilationSettings;
            this.semanticInfoChain = semanticInfoChain;
            this.parentChain = [];
            this.parentDeclChain = [];
            this.declPath = [];
            this.bindingPhase = TypeScript.globalBindingPhase++;
            this.staticClassMembers = [];
            this.functionTypeParameterCache = new TypeScript.BlockIntrinsics();
            this.reBindingAfterChange = false;
            this.startingDeclForRebind = TypeScript.pullDeclID;
            this.startingSymbolForRebind = TypeScript.pullSymbolID;
        }
        PullSymbolBinder.prototype.findTypeParameterInCache = function (name) {
            return this.functionTypeParameterCache[name];
        };

        PullSymbolBinder.prototype.addTypeParameterToCache = function (typeParameter) {
            this.functionTypeParameterCache[typeParameter.getName()] = typeParameter;
        };

        PullSymbolBinder.prototype.resetTypeParameterCache = function () {
            this.functionTypeParameterCache = new TypeScript.BlockIntrinsics();
        };

        PullSymbolBinder.prototype.setUnit = function (fileName) {
            this.semanticInfo = this.semanticInfoChain.getUnit(fileName);
        };

        PullSymbolBinder.prototype.getParent = function (returnInstanceType) {
            if (typeof returnInstanceType === "undefined") { returnInstanceType = false; }
            var parent = this.parentChain ? this.parentChain[this.parentChain.length - 1] : null;

            if (parent && parent.isContainer() && returnInstanceType) {
                var instanceSymbol = (parent).getInstanceSymbol();

                if (instanceSymbol) {
                    parent = instanceSymbol.getType();
                }
            }

            return parent;
        };

        PullSymbolBinder.prototype.getParentDecl = function () {
            return this.parentDeclChain.length ? this.parentDeclChain[this.parentDeclChain.length - 1] : null;
        };

        PullSymbolBinder.prototype.getDeclPath = function () {
            return this.declPath;
        };

        PullSymbolBinder.prototype.pushParent = function (parentType, parentDecl) {
            if (parentType) {
                this.parentChain[this.parentChain.length] = parentType;
                this.parentDeclChain[this.parentDeclChain.length] = parentDecl;
                this.declPath[this.declPath.length] = parentType.getName();
            }
        };

        PullSymbolBinder.prototype.popParent = function () {
            if (this.parentChain.length) {
                this.parentChain.length--;
                this.parentDeclChain.length--;
                this.declPath.length--;
            }
        };

        PullSymbolBinder.prototype.findSymbolInContext = function (name, declKind, typeLookupPath) {
            var startTime = new Date().getTime();
            var contextSymbolPath = this.getDeclPath();
            var nestedSymbolPath = [];
            var copyOfContextSymbolPath = [];
            var symbol = null;

            var endTime = 0;

            if (typeLookupPath.length) {
                for (var i = 0; i < typeLookupPath.length; i++) {
                    nestedSymbolPath[nestedSymbolPath.length] = typeLookupPath[i];
                }

                nestedSymbolPath[nestedSymbolPath.length] = name;

                while (nestedSymbolPath.length >= 2) {
                    symbol = this.semanticInfoChain.findSymbol(nestedSymbolPath, declKind);

                    if (symbol) {
                        endTime = new Date().getTime();
                        TypeScript.time_in_findSymbol += endTime - startTime;

                        return symbol;
                    }
                    nestedSymbolPath.length -= 2;
                    nestedSymbolPath[nestedSymbolPath.length] = name;
                }
            }

            if (contextSymbolPath.length) {
                for (var i = 0; i < contextSymbolPath.length; i++) {
                    copyOfContextSymbolPath[copyOfContextSymbolPath.length] = contextSymbolPath[i];
                }

                for (var i = 0; i < typeLookupPath.length; i++) {
                    copyOfContextSymbolPath[copyOfContextSymbolPath.length] = typeLookupPath[i];
                }

                copyOfContextSymbolPath[copyOfContextSymbolPath.length] = name;

                while (copyOfContextSymbolPath.length >= 2) {
                    symbol = this.semanticInfoChain.findSymbol(copyOfContextSymbolPath, declKind);

                    if (symbol) {
                        endTime = new Date().getTime();
                        TypeScript.time_in_findSymbol += endTime - startTime;

                        return symbol;
                    }
                    copyOfContextSymbolPath.length -= 2;
                    copyOfContextSymbolPath[copyOfContextSymbolPath.length] = name;
                }
            }

            symbol = this.semanticInfoChain.findSymbol([name], declKind);

            endTime = new Date().getTime();
            TypeScript.time_in_findSymbol += endTime - startTime;

            return symbol;
        };

        PullSymbolBinder.prototype.symbolIsRedeclaration = function (sym) {
            var symID = sym.getSymbolID();
            return (symID >= this.startingSymbolForRebind) || ((sym.getRebindingID() === this.bindingPhase) && (symID !== this.startingSymbolForRebind));
        };

        PullSymbolBinder.prototype.bindModuleDeclarationToPullSymbol = function (moduleContainerDecl) {
            var modName = moduleContainerDecl.getName();

            var moduleContainerTypeSymbol = null;
            var moduleInstanceSymbol = null;
            var moduleInstanceTypeSymbol = null;

            var moduleInstanceDecl = moduleContainerDecl.getValueDecl();

            var moduleKind = moduleContainerDecl.getKind();

            var parent = this.getParent();
            var parentInstanceSymbol = this.getParent(true);
            var moduleAST = this.semanticInfo.getASTForDecl(moduleContainerDecl);

            var isExported = moduleContainerDecl.getFlags() & TypeScript.PullElementFlags.Exported;
            var isEnum = (moduleKind & TypeScript.PullElementKind.Enum) != 0;
            var searchKind = isEnum ? TypeScript.PullElementKind.Enum : TypeScript.PullElementKind.SomeContainer;
            var isInitializedModule = (moduleContainerDecl.getFlags() & TypeScript.PullElementFlags.SomeInitializedModule) != 0;

            var createdNewSymbol = false;

            if (parent) {
                if (isExported) {
                    moduleContainerTypeSymbol = parent.findNestedType(modName, searchKind);
                } else {
                    moduleContainerTypeSymbol = parent.findContainedMember(modName);

                    if (moduleContainerTypeSymbol && !(moduleContainerTypeSymbol.getKind() & searchKind)) {
                        moduleContainerTypeSymbol = null;
                    }
                }
            } else if (!isExported || moduleContainerDecl.getKind() === TypeScript.PullElementKind.DynamicModule) {
                moduleContainerTypeSymbol = this.findSymbolInContext(modName, searchKind, []);
            }

            if (moduleContainerTypeSymbol && moduleContainerTypeSymbol.getKind() !== moduleKind) {
                if (isInitializedModule) {
                    moduleContainerDecl.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), moduleAST.minChar, moduleAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [moduleContainerDecl.getDisplayName()]));
                }

                moduleContainerTypeSymbol = null;
            }

            if (moduleContainerTypeSymbol) {
                moduleInstanceSymbol = moduleContainerTypeSymbol.getInstanceSymbol();
            } else {
                moduleContainerTypeSymbol = new TypeScript.PullContainerTypeSymbol(modName, moduleKind);
                createdNewSymbol = true;

                if (!parent) {
                    this.semanticInfoChain.cacheGlobalSymbol(moduleContainerTypeSymbol, searchKind);
                }
            }

            if (!moduleInstanceSymbol && isInitializedModule) {
                var variableSymbol = null;
                if (!isEnum) {
                    if (parentInstanceSymbol) {
                        if (isExported) {
                            variableSymbol = parentInstanceSymbol.findMember(modName, false);

                            if (!variableSymbol) {
                                variableSymbol = parentInstanceSymbol.findContainedMember(modName);
                            }
                        } else {
                            variableSymbol = parentInstanceSymbol.findContainedMember(modName);

                            if (!variableSymbol) {
                                variableSymbol = parentInstanceSymbol.findMember(modName, false);
                            }
                        }

                        if (variableSymbol) {
                            var declarations = variableSymbol.getDeclarations();

                            if (declarations.length) {
                                var variableSymbolParent = declarations[0].getParentDecl();

                                if ((this.getParentDecl() !== variableSymbolParent) && (!this.reBindingAfterChange || (variableSymbolParent.getDeclID() >= this.startingDeclForRebind))) {
                                    variableSymbol = null;
                                }
                            }
                        }
                    } else if (!(moduleContainerDecl.getFlags() & TypeScript.PullElementFlags.Exported)) {
                        variableSymbol = this.findSymbolInContext(modName, TypeScript.PullElementKind.SomeValue, []);
                    }
                }

                if (variableSymbol) {
                    var prevKind = variableSymbol.getKind();
                    var acceptableRedeclaration = (prevKind == TypeScript.PullElementKind.Function) || (prevKind == TypeScript.PullElementKind.ConstructorMethod) || variableSymbol.hasFlag(TypeScript.PullElementFlags.ImplicitVariable);

                    if (acceptableRedeclaration) {
                        moduleInstanceTypeSymbol = variableSymbol.getType();
                    } else {
                        variableSymbol = null;
                    }
                }

                if (!moduleInstanceTypeSymbol) {
                    moduleInstanceTypeSymbol = new TypeScript.PullTypeSymbol(modName, TypeScript.PullElementKind.ObjectType);
                }

                moduleInstanceTypeSymbol.addDeclaration(moduleContainerDecl);

                moduleInstanceTypeSymbol.setAssociatedContainerType(moduleContainerTypeSymbol);

                if (variableSymbol) {
                    moduleInstanceSymbol = variableSymbol;
                } else {
                    moduleInstanceSymbol = new TypeScript.PullSymbol(modName, TypeScript.PullElementKind.Variable);
                    moduleInstanceSymbol.setType(moduleInstanceTypeSymbol);
                }

                moduleContainerTypeSymbol.setInstanceSymbol(moduleInstanceSymbol);
            }

            moduleContainerTypeSymbol.addDeclaration(moduleContainerDecl);
            moduleContainerDecl.setSymbol(moduleContainerTypeSymbol);

            this.semanticInfo.setSymbolAndDiagnosticsForAST(moduleAST.name, TypeScript.SymbolAndDiagnostics.fromSymbol(moduleContainerTypeSymbol));
            this.semanticInfo.setSymbolAndDiagnosticsForAST(moduleAST, TypeScript.SymbolAndDiagnostics.fromSymbol(moduleContainerTypeSymbol));

            var moduleDeclarations = moduleContainerTypeSymbol.getDeclarations();
            if (isEnum && moduleDeclarations.length > 1 && moduleAST.members.members.length > 0) {
                var multipleEnums = TypeScript.ArrayUtilities.where(moduleDeclarations, function (d) {
                    return d.getKind() === TypeScript.PullElementKind.Enum;
                }).length > 1;
                if (multipleEnums) {
                    var firstVariable = moduleAST.members.members[0];
                    var firstVariableDeclarator = firstVariable.declaration.declarators.members[0];
                    if (firstVariableDeclarator.isImplicitlyInitialized) {
                        moduleContainerDecl.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), firstVariableDeclarator.minChar, firstVariableDeclarator.getLength(), TypeScript.DiagnosticCode.Enums_with_multiple_declarations_must_provide_an_initializer_for_the_first_enum_element, null));
                    }
                }
            }

            if (createdNewSymbol) {
                if (parent) {
                    var linkKind = moduleContainerDecl.getFlags() & TypeScript.PullElementFlags.Exported ? TypeScript.SymbolLinkKind.PublicMember : TypeScript.SymbolLinkKind.PrivateMember;

                    if (linkKind === TypeScript.SymbolLinkKind.PublicMember) {
                        parent.addMember(moduleContainerTypeSymbol, linkKind);
                    } else {
                        moduleContainerTypeSymbol.setContainer(parent);
                    }
                }
            } else if (this.reBindingAfterChange) {
                var decls = moduleContainerTypeSymbol.getDeclarations();
                var scriptName = moduleContainerDecl.getScriptName();

                for (var i = 0; i < decls.length; i++) {
                    if (decls[i].getScriptName() === scriptName && decls[i].getDeclID() < this.startingDeclForRebind) {
                        moduleContainerTypeSymbol.removeDeclaration(decls[i]);
                    }
                }

                moduleContainerTypeSymbol.invalidate();

                moduleInstanceSymbol = moduleContainerTypeSymbol.getInstanceSymbol();

                if (moduleInstanceSymbol) {
                    var moduleInstanceTypeSymbol = moduleInstanceSymbol.getType();
                    decls = moduleInstanceTypeSymbol.getDeclarations();

                    for (var i = 0; i < decls.length; i++) {
                        if (decls[i].getScriptName() === scriptName && decls[i].getDeclID() < this.startingDeclForRebind) {
                            moduleInstanceTypeSymbol.removeDeclaration(decls[i]);
                        }
                    }

                    moduleInstanceTypeSymbol.addDeclaration(moduleContainerDecl);
                    moduleInstanceTypeSymbol.invalidate();
                }
            }

            this.pushParent(moduleContainerTypeSymbol, moduleContainerDecl);

            var childDecls = moduleContainerDecl.getChildDecls();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }

            if (isEnum) {
                moduleInstanceTypeSymbol = moduleContainerTypeSymbol.getInstanceSymbol().getType();

                if (this.reBindingAfterChange) {
                    var existingIndexSigs = moduleInstanceTypeSymbol.getIndexSignatures();

                    for (var i = 0; i < existingIndexSigs.length; i++) {
                        moduleInstanceTypeSymbol.removeIndexSignature(existingIndexSigs[i]);
                    }
                }

                var enumIndexSignature = new TypeScript.PullSignatureSymbol(TypeScript.PullElementKind.IndexSignature);
                var enumIndexParameterSymbol = new TypeScript.PullSymbol("x", TypeScript.PullElementKind.Parameter);
                enumIndexParameterSymbol.setType(this.semanticInfoChain.numberTypeSymbol);
                enumIndexSignature.addParameter(enumIndexParameterSymbol);
                enumIndexSignature.setReturnType(this.semanticInfoChain.stringTypeSymbol);

                moduleInstanceTypeSymbol.addIndexSignature(enumIndexSignature);

                moduleInstanceTypeSymbol.recomputeIndexSignatures();
            }

            this.popParent();
        };

        PullSymbolBinder.prototype.bindImportDeclaration = function (importDeclaration) {
            var declFlags = importDeclaration.getFlags();
            var declKind = importDeclaration.getKind();
            var importDeclAST = this.semanticInfo.getASTForDecl(importDeclaration);

            var isExported = false;
            var linkKind = TypeScript.SymbolLinkKind.PrivateMember;
            var importSymbol = null;
            var declName = importDeclaration.getName();
            var parentHadSymbol = false;
            var parent = this.getParent();

            if (parent) {
                importSymbol = parent.findMember(declName, false);

                if (!importSymbol) {
                    importSymbol = parent.findContainedMember(declName);

                    if (importSymbol) {
                        var declarations = importSymbol.getDeclarations();

                        if (declarations.length) {
                            var importSymbolParent = declarations[0].getParentDecl();

                            if ((importSymbolParent !== importDeclaration.getParentDecl()) && (!this.reBindingAfterChange || (importSymbolParent.getDeclID() >= this.startingDeclForRebind))) {
                                importSymbol = null;
                            }
                        }
                    }
                }
            } else if (!(importDeclaration.getFlags() & TypeScript.PullElementFlags.Exported)) {
                importSymbol = this.findSymbolInContext(declName, TypeScript.PullElementKind.SomeContainer, []);
            }

            if (importSymbol) {
                parentHadSymbol = true;
            }

            if (importSymbol && this.symbolIsRedeclaration(importSymbol)) {
                importDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), importDeclAST.minChar, importDeclAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [importDeclaration.getDisplayName()]));
                importSymbol = null;
            }

            if (this.reBindingAfterChange && importSymbol) {
                var decls = importSymbol.getDeclarations();
                var scriptName = importDeclaration.getScriptName();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        importSymbol.removeDeclaration(decls[j]);
                    }
                }

                importSymbol.setUnresolved();
            }

            if (!importSymbol) {
                importSymbol = new TypeScript.PullTypeAliasSymbol(declName);

                if (!parent) {
                    this.semanticInfoChain.cacheGlobalSymbol(importSymbol, TypeScript.PullElementKind.SomeContainer);
                }
            }

            importSymbol.addDeclaration(importDeclaration);
            importDeclaration.setSymbol(importSymbol);

            this.semanticInfo.setSymbolAndDiagnosticsForAST(importDeclAST, TypeScript.SymbolAndDiagnostics.fromSymbol(importSymbol));

            if (parent && !parentHadSymbol) {
                if (declFlags & TypeScript.PullElementFlags.Exported) {
                    parent.addMember(importSymbol, TypeScript.SymbolLinkKind.PublicMember);
                } else {
                    importSymbol.setContainer(parent);
                }
            }

            importSymbol.setIsBound(this.bindingPhase);
        };

        PullSymbolBinder.prototype.cleanInterfaceSignatures = function (interfaceSymbol) {
            var callSigs = interfaceSymbol.getCallSignatures();
            var constructSigs = interfaceSymbol.getConstructSignatures();
            var indexSigs = interfaceSymbol.getIndexSignatures();

            for (var i = 0; i < callSigs.length; i++) {
                if (callSigs[i].getSymbolID() < this.startingSymbolForRebind) {
                    interfaceSymbol.removeCallSignature(callSigs[i], false);
                }
            }
            for (var i = 0; i < constructSigs.length; i++) {
                if (constructSigs[i].getSymbolID() < this.startingSymbolForRebind) {
                    interfaceSymbol.removeConstructSignature(constructSigs[i], false);
                }
            }
            for (var i = 0; i < indexSigs.length; i++) {
                if (indexSigs[i].getSymbolID() < this.startingSymbolForRebind) {
                    interfaceSymbol.removeIndexSignature(indexSigs[i], false);
                }
            }

            interfaceSymbol.recomputeCallSignatures();
            interfaceSymbol.recomputeConstructSignatures();
            interfaceSymbol.recomputeIndexSignatures();
        };

        PullSymbolBinder.prototype.cleanClassSignatures = function (classSymbol) {
            var callSigs = classSymbol.getCallSignatures();
            var constructSigs = classSymbol.getConstructSignatures();
            var indexSigs = classSymbol.getIndexSignatures();

            for (var i = 0; i < callSigs.length; i++) {
                classSymbol.removeCallSignature(callSigs[i], false);
            }
            for (var i = 0; i < constructSigs.length; i++) {
                classSymbol.removeConstructSignature(constructSigs[i], false);
            }
            for (var i = 0; i < indexSigs.length; i++) {
                classSymbol.removeIndexSignature(indexSigs[i], false);
            }

            classSymbol.recomputeCallSignatures();
            classSymbol.recomputeConstructSignatures();
            classSymbol.recomputeIndexSignatures();

            var constructorSymbol = classSymbol.getConstructorMethod();
            var constructorTypeSymbol = (constructorSymbol ? constructorSymbol.getType() : null);

            if (constructorTypeSymbol) {
                constructSigs = constructorTypeSymbol.getConstructSignatures();

                for (var i = 0; i < constructSigs.length; i++) {
                    constructorTypeSymbol.removeConstructSignature(constructSigs[i], false);
                }

                constructorTypeSymbol.recomputeConstructSignatures();
                constructorTypeSymbol.invalidate();
                constructorSymbol.invalidate();
            }

            classSymbol.invalidate();
        };

        PullSymbolBinder.prototype.bindClassDeclarationToPullSymbol = function (classDecl) {
            var className = classDecl.getName();
            var classSymbol = null;

            var constructorSymbol = null;
            var constructorTypeSymbol = null;

            var classAST = this.semanticInfo.getASTForDecl(classDecl);
            var parentHadSymbol = false;

            var parent = this.getParent();
            var cleanedPreviousDecls = false;
            var isExported = classDecl.getFlags() & TypeScript.PullElementFlags.Exported;
            var isGeneric = false;

            var acceptableSharedKind = TypeScript.PullElementKind.Class;

            if (parent) {
                if (isExported) {
                    classSymbol = parent.findNestedType(className);

                    if (!classSymbol) {
                        classSymbol = parent.findMember(className, false);
                    }
                } else {
                    classSymbol = parent.findContainedMember(className);

                    if (classSymbol && (classSymbol.getKind() & acceptableSharedKind)) {
                        var declarations = classSymbol.getDeclarations();

                        if (declarations.length) {
                            var classSymbolParent = declarations[0].getParentDecl();

                            if ((classSymbolParent !== this.getParentDecl()) && (!this.reBindingAfterChange || (classSymbolParent.getDeclID() >= this.startingDeclForRebind))) {
                                classSymbol = null;
                            }
                        }
                    } else {
                        classSymbol = null;
                    }
                }
            } else {
                classSymbol = this.findSymbolInContext(className, acceptableSharedKind, []);
            }

            if (classSymbol && (!(classSymbol.getKind() & acceptableSharedKind) || !this.reBindingAfterChange || this.symbolIsRedeclaration(classSymbol))) {
                classDecl.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), classAST.minChar, classAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [classDecl.getDisplayName()]));
                classSymbol = null;
            } else if (classSymbol) {
                parentHadSymbol = true;
            }

            var decls;

            if (this.reBindingAfterChange && classSymbol) {
                decls = classSymbol.getDeclarations();
                var scriptName = classDecl.getScriptName();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        classSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                constructorSymbol = classSymbol.getConstructorMethod();
                constructorTypeSymbol = constructorSymbol.getType();

                decls = constructorSymbol.getDeclarations();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        constructorSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                if (constructorSymbol.getIsSynthesized()) {
                    classSymbol.setConstructorMethod(null);
                }

                if (classSymbol.isGeneric()) {
                    isGeneric = true;

                    var specializations = classSymbol.getKnownSpecializations();
                    var specialization = null;

                    for (var i = 0; i < specializations.length; i++) {
                        specializations[i].setUnresolved();
                        specializations[i].invalidate();
                    }

                    classSymbol.cleanTypeParameters();
                    constructorTypeSymbol.cleanTypeParameters();
                }

                classSymbol.setUnresolved();
                constructorSymbol.setUnresolved();
                constructorTypeSymbol.setUnresolved();
            }

            if (!parentHadSymbol) {
                classSymbol = new TypeScript.PullClassTypeSymbol(className);

                if (!parent) {
                    this.semanticInfoChain.cacheGlobalSymbol(classSymbol, acceptableSharedKind);
                }
            }

            classSymbol.addDeclaration(classDecl);

            classDecl.setSymbol(classSymbol);

            this.semanticInfo.setSymbolAndDiagnosticsForAST(classAST.name, TypeScript.SymbolAndDiagnostics.fromSymbol(classSymbol));
            this.semanticInfo.setSymbolAndDiagnosticsForAST(classAST, TypeScript.SymbolAndDiagnostics.fromSymbol(classSymbol));

            if (parent && !parentHadSymbol) {
                var linkKind = classDecl.getFlags() & TypeScript.PullElementFlags.Exported ? TypeScript.SymbolLinkKind.PublicMember : TypeScript.SymbolLinkKind.PrivateMember;

                if (linkKind === TypeScript.SymbolLinkKind.PublicMember) {
                    parent.addMember(classSymbol, linkKind);
                } else {
                    classSymbol.setContainer(parent);
                }
            }

            if (parentHadSymbol && cleanedPreviousDecls) {
                this.cleanClassSignatures(classSymbol);

                if (isGeneric) {
                    specializations = classSymbol.getKnownSpecializations();

                    for (var i = 0; i < specializations.length; i++) {
                        this.cleanClassSignatures(specializations[i]);
                    }
                }
            }

            this.pushParent(classSymbol, classDecl);

            var childDecls = classDecl.getChildDecls();

            this.resetTypeParameterCache();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }

            this.resetTypeParameterCache();

            this.popParent();

            constructorSymbol = classSymbol.getConstructorMethod();
            constructorTypeSymbol = (constructorSymbol ? constructorSymbol.getType() : null);

            if (!constructorSymbol) {
                constructorSymbol = new TypeScript.PullSymbol(className, TypeScript.PullElementKind.ConstructorMethod);
                constructorTypeSymbol = new TypeScript.PullConstructorTypeSymbol();

                constructorSymbol.setIsSynthesized();

                constructorSymbol.setType(constructorTypeSymbol);
                constructorSymbol.addDeclaration(classDecl.getValueDecl());
                classSymbol.setConstructorMethod(constructorSymbol);

                constructorTypeSymbol.addDeclaration(classDecl);

                classSymbol.setHasDefaultConstructor();

                if (!classAST.extendsList || !classAST.extendsList.members.length) {
                    var constructorSignature = new TypeScript.PullSignatureSymbol(TypeScript.PullElementKind.ConstructSignature);
                    constructorSignature.setReturnType(classSymbol);
                    constructorTypeSymbol.addConstructSignature(constructorSignature);
                    constructorSignature.addDeclaration(classDecl);
                }
            }

            constructorTypeSymbol.setAssociatedContainerType(classSymbol);

            if (this.staticClassMembers.length) {
                var member;
                var isPrivate = false;
                var memberMap = new TypeScript.BlockIntrinsics();
                var memberDecl;
                var memberAST;

                for (var i = 0; i < this.staticClassMembers.length; i++) {
                    member = this.staticClassMembers[i];

                    if (memberMap[member.getName()]) {
                        memberDecl = member.getDeclarations()[0];
                        memberAST = this.semanticInfo.getASTForDecl(memberDecl);
                        memberDecl.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), memberAST.minChar, memberAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [memberDecl.getDisplayName()]));
                    } else {
                        memberMap[member.getName()] = true;
                    }

                    isPrivate = member.hasFlag(TypeScript.PullElementFlags.Private);

                    constructorTypeSymbol.addMember(member, isPrivate ? TypeScript.SymbolLinkKind.PrivateMember : TypeScript.SymbolLinkKind.PublicMember);
                }

                this.staticClassMembers.length = 0;
            }

            var typeParameters = classDecl.getTypeParameters();
            var typeParameter;
            var typeParameterDecls = null;

            for (var i = 0; i < typeParameters.length; i++) {
                typeParameter = classSymbol.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new TypeScript.PullTypeParameterSymbol(typeParameters[i].getName(), false);

                    classSymbol.addMember(typeParameter, TypeScript.SymbolLinkKind.TypeParameter);
                    constructorTypeSymbol.addTypeParameter(typeParameter, true);
                } else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        classDecl.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [typeParameter.getName()]));
                    }

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            classSymbol.setIsBound(this.bindingPhase);
        };

        PullSymbolBinder.prototype.bindInterfaceDeclarationToPullSymbol = function (interfaceDecl) {
            var interfaceName = interfaceDecl.getName();
            var interfaceSymbol = this.findSymbolInContext(interfaceName, TypeScript.PullElementKind.SomeType, []);

            var interfaceAST = this.semanticInfo.getASTForDecl(interfaceDecl);
            var createdNewSymbol = false;
            var parent = this.getParent();

            var acceptableSharedKind = TypeScript.PullElementKind.Interface;

            if (parent) {
                interfaceSymbol = parent.findNestedType(interfaceName);
            } else if (!(interfaceDecl.getFlags() & TypeScript.PullElementFlags.Exported)) {
                interfaceSymbol = this.findSymbolInContext(interfaceName, acceptableSharedKind, []);
            }

            if (interfaceSymbol && !(interfaceSymbol.getKind() & acceptableSharedKind)) {
                interfaceDecl.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), interfaceAST.minChar, interfaceAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [interfaceDecl.getDisplayName()]));
                interfaceSymbol = null;
            }

            if (!interfaceSymbol) {
                interfaceSymbol = new TypeScript.PullTypeSymbol(interfaceName, TypeScript.PullElementKind.Interface);
                createdNewSymbol = true;

                if (!parent) {
                    this.semanticInfoChain.cacheGlobalSymbol(interfaceSymbol, acceptableSharedKind);
                }
            }

            interfaceSymbol.addDeclaration(interfaceDecl);
            interfaceDecl.setSymbol(interfaceSymbol);

            if (createdNewSymbol) {
                if (parent) {
                    var linkKind = interfaceDecl.getFlags() & TypeScript.PullElementFlags.Exported ? TypeScript.SymbolLinkKind.PublicMember : TypeScript.SymbolLinkKind.PrivateMember;

                    if (linkKind === TypeScript.SymbolLinkKind.PublicMember) {
                        parent.addMember(interfaceSymbol, linkKind);
                    } else {
                        interfaceSymbol.setContainer(parent);
                    }
                }
            } else if (this.reBindingAfterChange) {
                var decls = interfaceSymbol.getDeclarations();
                var scriptName = interfaceDecl.getScriptName();

                for (var i = 0; i < decls.length; i++) {
                    if (decls[i].getScriptName() === scriptName && decls[i].getDeclID() < this.startingDeclForRebind) {
                        interfaceSymbol.removeDeclaration(decls[i]);
                    }
                }

                if (interfaceSymbol.isGeneric()) {
                    var specializations = interfaceSymbol.getKnownSpecializations();
                    var specialization = null;

                    for (var i = 0; i < specializations.length; i++) {
                        specialization = specializations[i];

                        this.cleanInterfaceSignatures(specialization);
                        specialization.invalidate();
                    }

                    interfaceSymbol.cleanTypeParameters();
                }

                this.cleanInterfaceSignatures(interfaceSymbol);
                interfaceSymbol.invalidate();
            }

            this.pushParent(interfaceSymbol, interfaceDecl);

            var childDecls = interfaceDecl.getChildDecls();

            this.resetTypeParameterCache();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }

            this.resetTypeParameterCache();

            this.popParent();

            var typeParameters = interfaceDecl.getTypeParameters();
            var typeParameter;
            var typeParameterDecls = null;

            for (var i = 0; i < typeParameters.length; i++) {
                typeParameter = interfaceSymbol.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new TypeScript.PullTypeParameterSymbol(typeParameters[i].getName(), false);

                    interfaceSymbol.addMember(typeParameter, TypeScript.SymbolLinkKind.TypeParameter);
                } else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        for (var j = 0; j < typeParameterDecls.length; j++) {
                            var typeParameterDeclParent = typeParameterDecls[j].getParentDecl();

                            if (typeParameterDeclParent && typeParameterDeclParent === interfaceDecl) {
                                var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                                interfaceDecl.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [typeParameter.getName()]));

                                break;
                            }
                        }
                    }

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }
        };

        PullSymbolBinder.prototype.bindObjectTypeDeclarationToPullSymbol = function (objectDecl) {
            var objectSymbolAST = this.semanticInfo.getASTForDecl(objectDecl);

            var objectSymbol = new TypeScript.PullTypeSymbol("", TypeScript.PullElementKind.ObjectType);

            objectSymbol.addDeclaration(objectDecl);
            objectDecl.setSymbol(objectSymbol);

            this.semanticInfo.setSymbolAndDiagnosticsForAST(objectSymbolAST, TypeScript.SymbolAndDiagnostics.fromSymbol(objectSymbol));

            this.pushParent(objectSymbol, objectDecl);

            var childDecls = objectDecl.getChildDecls();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }

            this.popParent();

            var typeParameters = objectDecl.getTypeParameters();
            var typeParameter;
            var typeParameterDecls = null;

            for (var i = 0; i < typeParameters.length; i++) {
                typeParameter = objectSymbol.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new TypeScript.PullTypeParameterSymbol(typeParameters[i].getName(), false);

                    objectSymbol.addMember(typeParameter, TypeScript.SymbolLinkKind.TypeParameter);
                } else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        objectDecl.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [typeParameter.getName()]));
                    }

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }
        };

        PullSymbolBinder.prototype.bindConstructorTypeDeclarationToPullSymbol = function (constructorTypeDeclaration) {
            var declKind = constructorTypeDeclaration.getKind();
            var declFlags = constructorTypeDeclaration.getFlags();
            var constructorTypeAST = this.semanticInfo.getASTForDecl(constructorTypeDeclaration);

            var constructorTypeSymbol = new TypeScript.PullConstructorTypeSymbol();

            constructorTypeDeclaration.setSymbol(constructorTypeSymbol);
            constructorTypeSymbol.addDeclaration(constructorTypeDeclaration);
            this.semanticInfo.setSymbolAndDiagnosticsForAST(constructorTypeAST, TypeScript.SymbolAndDiagnostics.fromSymbol(constructorTypeSymbol));

            var signature = new TypeScript.PullDefinitionSignatureSymbol(TypeScript.PullElementKind.ConstructSignature);

            if ((constructorTypeAST).variableArgList) {
                signature.setHasVariableParamList();
            }

            signature.addDeclaration(constructorTypeDeclaration);
            constructorTypeDeclaration.setSignatureSymbol(signature);

            this.bindParameterSymbols(this.semanticInfo.getASTForDecl(constructorTypeDeclaration), constructorTypeSymbol, signature);

            constructorTypeSymbol.addSignature(signature);

            var typeParameters = constructorTypeDeclaration.getTypeParameters();
            var typeParameter;
            var typeParameterDecls = null;

            for (var i = 0; i < typeParameters.length; i++) {
                typeParameter = constructorTypeSymbol.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new TypeScript.PullTypeParameterSymbol(typeParameters[i].getName(), false);

                    constructorTypeSymbol.addTypeParameter(typeParameter);
                } else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        constructorTypeDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [typeParameter.getName()]));
                    }

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }
        };

        PullSymbolBinder.prototype.bindVariableDeclarationToPullSymbol = function (variableDeclaration) {
            var declFlags = variableDeclaration.getFlags();
            var declKind = variableDeclaration.getKind();
            var varDeclAST = this.semanticInfo.getASTForDecl(variableDeclaration);

            var isExported = (declFlags & TypeScript.PullElementFlags.Exported) !== 0;

            var linkKind = TypeScript.SymbolLinkKind.PrivateMember;

            var variableSymbol = null;

            var declName = variableDeclaration.getName();

            var parentHadSymbol = false;

            var parent = this.getParent(true);

            var parentDecl = variableDeclaration.getParentDecl();

            var isImplicit = (declFlags & TypeScript.PullElementFlags.ImplicitVariable) !== 0;
            var isModuleValue = (declFlags & (TypeScript.PullElementFlags.InitializedModule | TypeScript.PullElementFlags.InitializedDynamicModule | TypeScript.PullElementFlags.InitializedEnum)) != 0;
            var isEnumValue = (declFlags & TypeScript.PullElementFlags.InitializedEnum) != 0;

            if (parentDecl && !isImplicit) {
                parentDecl.addVariableDeclToGroup(variableDeclaration);
            }

            if (parent) {
                if (isExported) {
                    variableSymbol = parent.findMember(declName, false);
                } else {
                    variableSymbol = parent.findContainedMember(declName);
                }

                if (variableSymbol) {
                    var declarations = variableSymbol.getDeclarations();

                    if (declarations.length) {
                        var variableSymbolParent = declarations[0].getParentDecl();

                        if ((this.getParentDecl() !== variableSymbolParent) && (!this.reBindingAfterChange || (variableSymbolParent.getDeclID() >= this.startingDeclForRebind))) {
                            variableSymbol = null;
                        }
                    }
                }
            } else if (!(variableDeclaration.getFlags() & TypeScript.PullElementFlags.Exported)) {
                variableSymbol = this.findSymbolInContext(declName, TypeScript.PullElementKind.SomeValue, []);
            }

            if (variableSymbol && !variableSymbol.isType()) {
                parentHadSymbol = true;
            }

            var span;
            var decl;
            var decls;
            var ast;
            var members;

            if (variableSymbol && this.symbolIsRedeclaration(variableSymbol)) {
                var prevKind = variableSymbol.getKind();
                var prevIsAmbient = variableSymbol.hasFlag(TypeScript.PullElementFlags.Ambient);
                var prevIsEnum = variableSymbol.hasFlag(TypeScript.PullElementFlags.InitializedEnum);
                var prevIsClass = prevKind == TypeScript.PullElementKind.ConstructorMethod;
                var prevIsContainer = variableSymbol.hasFlag(TypeScript.PullElementFlags.InitializedModule | TypeScript.PullElementFlags.InitializedDynamicModule);
                var onlyOneIsEnum = (isEnumValue || prevIsEnum) && !(isEnumValue && prevIsEnum);
                var isAmbient = (variableDeclaration.getFlags() & TypeScript.PullElementFlags.Ambient) != 0;
                var isClass = variableDeclaration.getKind() == TypeScript.PullElementKind.ConstructorMethod;

                var acceptableRedeclaration = isImplicit && ((!isEnumValue && prevKind == TypeScript.PullElementKind.Function) || (!isModuleValue && prevIsContainer && isAmbient) || (!isModuleValue && prevIsClass) || variableSymbol.hasFlag(TypeScript.PullElementFlags.ImplicitVariable));

                if (acceptableRedeclaration && prevIsClass && !prevIsAmbient) {
                    if (variableSymbol.getDeclarations()[0].getScriptName() != variableDeclaration.getScriptName()) {
                        acceptableRedeclaration = false;
                    }
                }

                if ((!isModuleValue && !isClass && !isAmbient) || !acceptableRedeclaration || onlyOneIsEnum) {
                    span = variableDeclaration.getSpan();

                    if (!parent || variableSymbol.getIsSynthesized()) {
                        variableDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), span.start(), span.length(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [variableDeclaration.getDisplayName()]));
                    }

                    variableSymbol = null;
                    parentHadSymbol = false;
                }
            } else if (variableSymbol && (variableSymbol.getKind() !== TypeScript.PullElementKind.Variable) && !isImplicit) {
                span = variableDeclaration.getSpan();

                variableDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), span.start(), span.length(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [variableDeclaration.getDisplayName()]));
                variableSymbol = null;
                parentHadSymbol = false;
            }

            if (this.reBindingAfterChange && variableSymbol && !variableSymbol.isType()) {
                decls = variableSymbol.getDeclarations();
                var scriptName = variableDeclaration.getScriptName();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        variableSymbol.removeDeclaration(decls[j]);
                    }
                }

                variableSymbol.invalidate();
            }

            var replaceProperty = false;
            var previousProperty = null;

            if ((declFlags & TypeScript.PullElementFlags.ImplicitVariable) === 0) {
                if (!variableSymbol) {
                    variableSymbol = new TypeScript.PullSymbol(declName, declKind);
                }

                variableSymbol.addDeclaration(variableDeclaration);
                variableDeclaration.setSymbol(variableSymbol);

                this.semanticInfo.setSymbolAndDiagnosticsForAST(varDeclAST.id, TypeScript.SymbolAndDiagnostics.fromSymbol(variableSymbol));
                this.semanticInfo.setSymbolAndDiagnosticsForAST(varDeclAST, TypeScript.SymbolAndDiagnostics.fromSymbol(variableSymbol));
            } else if (!parentHadSymbol) {
                if ((declFlags & TypeScript.PullElementFlags.ClassConstructorVariable)) {
                    var classTypeSymbol = variableSymbol;

                    if (parent) {
                        members = parent.getMembers();

                        for (var i = 0; i < members.length; i++) {
                            if ((members[i].getName() === declName) && (members[i].getKind() === TypeScript.PullElementKind.Class)) {
                                classTypeSymbol = members[i];
                                break;
                            }
                        }
                    }

                    if (!classTypeSymbol) {
                        var parentDecl = variableDeclaration.getParentDecl();

                        if (parentDecl) {
                            var childDecls = parentDecl.searchChildDecls(declName, TypeScript.PullElementKind.SomeType);

                            if (childDecls.length) {
                                for (var i = 0; i < childDecls.length; i++) {
                                    if (childDecls[i].getValueDecl() === variableDeclaration) {
                                        classTypeSymbol = childDecls[i].getSymbol();
                                    }
                                }
                            }
                        }

                        if (!classTypeSymbol) {
                            classTypeSymbol = this.findSymbolInContext(declName, TypeScript.PullElementKind.SomeType, []);
                        }
                    }

                    if (classTypeSymbol && (classTypeSymbol.getKind() !== TypeScript.PullElementKind.Class)) {
                        classTypeSymbol = null;
                    }

                    if (classTypeSymbol && classTypeSymbol.isClass()) {
                        replaceProperty = variableSymbol && variableSymbol.getIsSynthesized();

                        if (replaceProperty) {
                            previousProperty = variableSymbol;
                        }

                        variableSymbol = classTypeSymbol.getConstructorMethod();
                        variableDeclaration.setSymbol(variableSymbol);

                        decls = classTypeSymbol.getDeclarations();

                        if (decls.length) {
                            decl = decls[decls.length - 1];
                            ast = this.semanticInfo.getASTForDecl(decl);

                            if (ast) {
                                this.semanticInfo.setASTForDecl(variableDeclaration, ast);
                            }
                        }
                    } else {
                        if (!variableSymbol) {
                            variableSymbol = new TypeScript.PullSymbol(declName, declKind);
                        }

                        variableSymbol.addDeclaration(variableDeclaration);
                        variableDeclaration.setSymbol(variableSymbol);

                        variableSymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    }
                } else if (declFlags & TypeScript.PullElementFlags.SomeInitializedModule) {
                    var moduleContainerTypeSymbol = null;
                    var moduleParent = this.getParent(false);

                    if (moduleParent) {
                        members = moduleParent.getMembers();

                        for (var i = 0; i < members.length; i++) {
                            if ((members[i].getName() === declName) && (members[i].isContainer())) {
                                moduleContainerTypeSymbol = members[i];
                                break;
                            }
                        }
                    }

                    if (!moduleContainerTypeSymbol) {
                        var parentDecl = variableDeclaration.getParentDecl();

                        if (parentDecl) {
                            var searchKind = (declFlags & (TypeScript.PullElementFlags.InitializedModule | TypeScript.PullElementFlags.InitializedDynamicModule)) ? TypeScript.PullElementKind.SomeContainer : TypeScript.PullElementKind.Enum;
                            var childDecls = parentDecl.searchChildDecls(declName, searchKind);

                            if (childDecls.length) {
                                for (var i = 0; i < childDecls.length; i++) {
                                    if (childDecls[i].getValueDecl() === variableDeclaration) {
                                        moduleContainerTypeSymbol = childDecls[i].getSymbol();
                                    }
                                }
                            }
                        }
                        if (!moduleContainerTypeSymbol) {
                            moduleContainerTypeSymbol = this.findSymbolInContext(declName, (TypeScript.PullElementKind.SomeContainer | TypeScript.PullElementKind.Enum), []);
                        }
                    }

                    if (moduleContainerTypeSymbol && (!moduleContainerTypeSymbol.isContainer())) {
                        moduleContainerTypeSymbol = null;
                    }

                    if (moduleContainerTypeSymbol) {
                        variableSymbol = moduleContainerTypeSymbol.getInstanceSymbol();

                        variableSymbol.addDeclaration(variableDeclaration);
                        variableDeclaration.setSymbol(variableSymbol);

                        decls = moduleContainerTypeSymbol.getDeclarations();

                        if (decls.length) {
                            decl = decls[decls.length - 1];
                            ast = this.semanticInfo.getASTForDecl(decl);

                            if (ast) {
                                this.semanticInfo.setASTForDecl(variableDeclaration, ast);
                            }
                        }
                    } else {
                        TypeScript.Debug.assert(false, "Attempted to bind invalid implicit variable symbol");
                    }
                }
            } else {
                variableSymbol.addDeclaration(variableDeclaration);
                variableDeclaration.setSymbol(variableSymbol);
            }

            if (parent && !parentHadSymbol) {
                if (declFlags & TypeScript.PullElementFlags.Exported) {
                    parent.addMember(variableSymbol, TypeScript.SymbolLinkKind.PublicMember);
                } else {
                    variableSymbol.setContainer(parent);
                }
            } else if (replaceProperty) {
                parent.removeMember(previousProperty);
                parent.addMember(variableSymbol, linkKind);
            }

            variableSymbol.setIsBound(this.bindingPhase);
        };

        PullSymbolBinder.prototype.bindPropertyDeclarationToPullSymbol = function (propertyDeclaration) {
            var declFlags = propertyDeclaration.getFlags();
            var declKind = propertyDeclaration.getKind();
            var propDeclAST = this.semanticInfo.getASTForDecl(propertyDeclaration);

            var isStatic = false;
            var isOptional = false;

            var linkKind = TypeScript.SymbolLinkKind.PublicMember;

            var propertySymbol = null;

            if (TypeScript.hasFlag(declFlags, TypeScript.PullElementFlags.Static)) {
                isStatic = true;
            }

            if (TypeScript.hasFlag(declFlags, TypeScript.PullElementFlags.Private)) {
                linkKind = TypeScript.SymbolLinkKind.PrivateMember;
            }

            if (TypeScript.hasFlag(declFlags, TypeScript.PullElementFlags.Optional)) {
                isOptional = true;
            }

            var declName = propertyDeclaration.getName();

            var parentHadSymbol = false;

            var parent = this.getParent(true);

            if (parent.isClass() && isStatic) {
                for (var i = 0; i < this.staticClassMembers.length; i++) {
                    if (this.staticClassMembers[i].getName() === declName) {
                        propertySymbol = this.staticClassMembers[i];
                        break;
                    }
                }

                if (!propertySymbol && this.reBindingAfterChange) {
                    var classConstructor = (parent).getConstructorMethod();

                    if (classConstructor) {
                        var classConstructorType = classConstructor.getType();

                        propertySymbol = classConstructorType.findMember(declName);
                    }
                }
            } else {
                propertySymbol = parent.findMember(declName, false);
            }

            if (propertySymbol && (!this.reBindingAfterChange || this.symbolIsRedeclaration(propertySymbol))) {
                var span = propertyDeclaration.getSpan();

                propertyDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), span.start(), span.length(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [propertyDeclaration.getDisplayName()]));

                propertySymbol = null;
            }

            if (propertySymbol) {
                parentHadSymbol = true;
            }

            if (this.reBindingAfterChange && propertySymbol) {
                var decls = propertySymbol.getDeclarations();
                var scriptName = propertyDeclaration.getScriptName();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        propertySymbol.removeDeclaration(decls[j]);
                    }
                }

                propertySymbol.setUnresolved();
            }

            var classTypeSymbol;

            if (!parentHadSymbol) {
                propertySymbol = new TypeScript.PullSymbol(declName, declKind);
            }

            propertySymbol.addDeclaration(propertyDeclaration);
            propertyDeclaration.setSymbol(propertySymbol);

            this.semanticInfo.setSymbolAndDiagnosticsForAST(propDeclAST.id, TypeScript.SymbolAndDiagnostics.fromSymbol(propertySymbol));
            this.semanticInfo.setSymbolAndDiagnosticsForAST(propDeclAST, TypeScript.SymbolAndDiagnostics.fromSymbol(propertySymbol));

            if (isOptional) {
                propertySymbol.setIsOptional();
            }

            if (parent && !parentHadSymbol) {
                if (parent.isClass()) {
                    classTypeSymbol = parent;

                    if (isStatic) {
                        this.staticClassMembers[this.staticClassMembers.length] = propertySymbol;
                    } else {
                        classTypeSymbol.addMember(propertySymbol, linkKind);
                    }
                } else {
                    parent.addMember(propertySymbol, linkKind);
                }
            }

            propertySymbol.setIsBound(this.bindingPhase);
        };

        PullSymbolBinder.prototype.bindParameterSymbols = function (funcDecl, funcType, signatureSymbol) {
            var parameters = [];
            var decl = null;
            var argDecl = null;
            var parameterSymbol = null;
            var isProperty = false;
            var params = new TypeScript.BlockIntrinsics();

            if (funcDecl.arguments) {
                for (var i = 0; i < funcDecl.arguments.members.length; i++) {
                    argDecl = funcDecl.arguments.members[i];
                    decl = this.semanticInfo.getDeclForAST(argDecl);
                    isProperty = TypeScript.hasFlag(argDecl.getVarFlags(), TypeScript.VariableFlags.Property);
                    parameterSymbol = new TypeScript.PullSymbol(argDecl.id.text, TypeScript.PullElementKind.Parameter);

                    if (funcDecl.variableArgList && i === funcDecl.arguments.members.length - 1) {
                        parameterSymbol.setIsVarArg();
                    }

                    if (decl.getFlags() & TypeScript.PullElementFlags.Optional) {
                        parameterSymbol.setIsOptional();
                    }

                    if (params[argDecl.id.text]) {
                        decl.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), argDecl.minChar, argDecl.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [argDecl.id.actualText]));
                    } else {
                        params[argDecl.id.text] = true;
                    }
                    if (decl) {
                        parameterSymbol.addDeclaration(decl);
                        decl.setSymbol(parameterSymbol);

                        var valDecl = decl.getValueDecl();

                        if (valDecl) {
                            valDecl.setSymbol(parameterSymbol);
                            parameterSymbol.addDeclaration(valDecl);
                        }
                    }
                    this.semanticInfo.setSymbolAndDiagnosticsForAST(argDecl.id, TypeScript.SymbolAndDiagnostics.fromSymbol(parameterSymbol));
                    this.semanticInfo.setSymbolAndDiagnosticsForAST(argDecl, TypeScript.SymbolAndDiagnostics.fromSymbol(parameterSymbol));

                    signatureSymbol.addParameter(parameterSymbol, parameterSymbol.getIsOptional());

                    if (signatureSymbol.isDefinition()) {
                        parameterSymbol.setContainer(funcType);
                    }
                }
            }
        };

        PullSymbolBinder.prototype.bindFunctionDeclarationToPullSymbol = function (functionDeclaration) {
            var declKind = functionDeclaration.getKind();
            var declFlags = functionDeclaration.getFlags();
            var funcDeclAST = this.semanticInfo.getASTForDecl(functionDeclaration);

            var isExported = (declFlags & TypeScript.PullElementFlags.Exported) !== 0;

            var funcName = functionDeclaration.getName();

            var isSignature = (declFlags & TypeScript.PullElementFlags.Signature) !== 0;

            var parent = this.getParent(true);
            var parentHadSymbol = false;
            var cleanedPreviousDecls = false;

            var functionSymbol = null;
            var functionTypeSymbol = null;

            if (parent) {
                functionSymbol = parent.findMember(funcName, false);

                if (!functionSymbol) {
                    functionSymbol = parent.findContainedMember(funcName);

                    if (functionSymbol) {
                        var declarations = functionSymbol.getDeclarations();

                        if (declarations.length) {
                            var funcSymbolParent = declarations[0].getParentDecl();

                            if ((this.getParentDecl() !== funcSymbolParent) && (!this.reBindingAfterChange || (funcSymbolParent.getDeclID() >= this.startingDeclForRebind))) {
                                functionSymbol = null;
                            }
                        }
                    }
                }
            } else if (!(functionDeclaration.getFlags() & TypeScript.PullElementFlags.Exported)) {
                functionSymbol = this.findSymbolInContext(funcName, TypeScript.PullElementKind.SomeValue, []);
            }

            if (functionSymbol && (functionSymbol.getKind() !== TypeScript.PullElementKind.Function || (this.symbolIsRedeclaration(functionSymbol) && !isSignature && !functionSymbol.allDeclsHaveFlag(TypeScript.PullElementFlags.Signature)))) {
                functionDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [functionDeclaration.getDisplayName()]));
                functionSymbol = null;
            }

            if (functionSymbol) {
                functionTypeSymbol = functionSymbol.getType();
                parentHadSymbol = true;
            }

            if (this.reBindingAfterChange && functionSymbol) {
                var decls = functionSymbol.getDeclarations();
                var scriptName = functionDeclaration.getScriptName();
                var isGeneric = functionTypeSymbol.isGeneric();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        functionSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                decls = functionTypeSymbol.getDeclarations();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        functionTypeSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                if (isGeneric) {
                    var specializations = functionTypeSymbol.getKnownSpecializations();

                    for (var i = 0; i < specializations.length; i++) {
                        specializations[i].invalidate();
                    }
                }

                functionSymbol.invalidate();
                functionTypeSymbol.invalidate();
            }

            if (!functionSymbol) {
                functionSymbol = new TypeScript.PullSymbol(funcName, TypeScript.PullElementKind.Function);
            }

            if (!functionTypeSymbol) {
                functionTypeSymbol = new TypeScript.PullFunctionTypeSymbol();
                functionSymbol.setType(functionTypeSymbol);
            }

            functionDeclaration.setSymbol(functionSymbol);
            functionSymbol.addDeclaration(functionDeclaration);
            functionTypeSymbol.addDeclaration(functionDeclaration);

            this.semanticInfo.setSymbolAndDiagnosticsForAST(funcDeclAST.name, TypeScript.SymbolAndDiagnostics.fromSymbol(functionSymbol));
            this.semanticInfo.setSymbolAndDiagnosticsForAST(funcDeclAST, TypeScript.SymbolAndDiagnostics.fromSymbol(functionSymbol));

            if (parent && !parentHadSymbol) {
                if (isExported) {
                    parent.addMember(functionSymbol, TypeScript.SymbolLinkKind.PublicMember);
                } else {
                    functionSymbol.setContainer(parent);
                }
            }

            if (!isSignature) {
                this.pushParent(functionTypeSymbol, functionDeclaration);
            }

            if (parentHadSymbol && cleanedPreviousDecls) {
                var callSigs = functionTypeSymbol.getCallSignatures();

                for (var i = 0; i < callSigs.length; i++) {
                    functionTypeSymbol.removeCallSignature(callSigs[i], false);
                }

                functionSymbol.invalidate();
                functionTypeSymbol.invalidate();
                functionTypeSymbol.recomputeCallSignatures();

                if (isGeneric) {
                    var specializations = functionTypeSymbol.getKnownSpecializations();

                    for (var j = 0; j < specializations.length; j++) {
                        callSigs = specializations[j].getCallSignatures();

                        for (var i = 0; i < callSigs.length; i++) {
                            callSigs[i].invalidate();
                        }
                    }
                }
            }

            var signature = isSignature ? new TypeScript.PullSignatureSymbol(TypeScript.PullElementKind.CallSignature) : new TypeScript.PullDefinitionSignatureSymbol(TypeScript.PullElementKind.CallSignature);

            signature.addDeclaration(functionDeclaration);
            functionDeclaration.setSignatureSymbol(signature);

            if (funcDeclAST.variableArgList) {
                signature.setHasVariableParamList();
            }

            this.bindParameterSymbols(this.semanticInfo.getASTForDecl(functionDeclaration), functionTypeSymbol, signature);

            var typeParameters = functionDeclaration.getTypeParameters();
            var typeParameter;
            var typeParameterDecls = null;

            for (var i = 0; i < typeParameters.length; i++) {
                typeParameter = signature.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new TypeScript.PullTypeParameterSymbol(typeParameters[i].getName(), true);

                    signature.addTypeParameter(typeParameter);
                } else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        functionDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [typeParameter.getName()]));
                    }

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            functionTypeSymbol.addCallSignature(signature);

            if (!isSignature) {
                var childDecls = functionDeclaration.getChildDecls();

                for (var i = 0; i < childDecls.length; i++) {
                    this.bindDeclToPullSymbol(childDecls[i]);
                }

                this.popParent();
            }

            functionSymbol.setIsBound(this.bindingPhase);
        };

        PullSymbolBinder.prototype.bindFunctionExpressionToPullSymbol = function (functionExpressionDeclaration) {
            var declKind = functionExpressionDeclaration.getKind();
            var declFlags = functionExpressionDeclaration.getFlags();
            var funcExpAST = this.semanticInfo.getASTForDecl(functionExpressionDeclaration);

            var functionName = declKind == TypeScript.PullElementKind.FunctionExpression ? (functionExpressionDeclaration).getFunctionExpressionName() : functionExpressionDeclaration.getName();
            var functionSymbol = new TypeScript.PullSymbol(functionName, TypeScript.PullElementKind.Function);
            var functionTypeSymbol = new TypeScript.PullFunctionTypeSymbol();

            functionSymbol.setType(functionTypeSymbol);

            functionExpressionDeclaration.setSymbol(functionSymbol);
            functionSymbol.addDeclaration(functionExpressionDeclaration);
            functionTypeSymbol.addDeclaration(functionExpressionDeclaration);

            if (funcExpAST.name) {
                this.semanticInfo.setSymbolAndDiagnosticsForAST(funcExpAST.name, TypeScript.SymbolAndDiagnostics.fromSymbol(functionSymbol));
            }
            this.semanticInfo.setSymbolAndDiagnosticsForAST(funcExpAST, TypeScript.SymbolAndDiagnostics.fromSymbol(functionSymbol));

            this.pushParent(functionTypeSymbol, functionExpressionDeclaration);

            var signature = new TypeScript.PullDefinitionSignatureSymbol(TypeScript.PullElementKind.CallSignature);

            if (funcExpAST.variableArgList) {
                signature.setHasVariableParamList();
            }

            var typeParameters = functionExpressionDeclaration.getTypeParameters();
            var typeParameter;
            var typeParameterDecls = null;

            for (var i = 0; i < typeParameters.length; i++) {
                typeParameter = signature.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new TypeScript.PullTypeParameterSymbol(typeParameters[i].getName(), true);

                    signature.addTypeParameter(typeParameter);
                } else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        functionExpressionDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [typeParameter.getName()]));
                    }

                    typeParameterDecls = typeParameter.getDeclarations();

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            signature.addDeclaration(functionExpressionDeclaration);
            functionExpressionDeclaration.setSignatureSymbol(signature);

            this.bindParameterSymbols(this.semanticInfo.getASTForDecl(functionExpressionDeclaration), functionTypeSymbol, signature);

            functionTypeSymbol.addSignature(signature);

            var childDecls = functionExpressionDeclaration.getChildDecls();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }

            this.popParent();
        };

        PullSymbolBinder.prototype.bindFunctionTypeDeclarationToPullSymbol = function (functionTypeDeclaration) {
            var declKind = functionTypeDeclaration.getKind();
            var declFlags = functionTypeDeclaration.getFlags();
            var funcTypeAST = this.semanticInfo.getASTForDecl(functionTypeDeclaration);

            var functionTypeSymbol = new TypeScript.PullFunctionTypeSymbol();

            functionTypeDeclaration.setSymbol(functionTypeSymbol);
            functionTypeSymbol.addDeclaration(functionTypeDeclaration);
            this.semanticInfo.setSymbolAndDiagnosticsForAST(funcTypeAST, TypeScript.SymbolAndDiagnostics.fromSymbol(functionTypeSymbol));

            this.pushParent(functionTypeSymbol, functionTypeDeclaration);

            var isSignature = (declFlags & TypeScript.PullElementFlags.Signature) !== 0;
            var signature = isSignature ? new TypeScript.PullSignatureSymbol(TypeScript.PullElementKind.CallSignature) : new TypeScript.PullDefinitionSignatureSymbol(TypeScript.PullElementKind.CallSignature);

            if (funcTypeAST.variableArgList) {
                signature.setHasVariableParamList();
            }

            var typeParameters = functionTypeDeclaration.getTypeParameters();
            var typeParameter;
            var typeParameterDecls = null;

            for (var i = 0; i < typeParameters.length; i++) {
                typeParameter = signature.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new TypeScript.PullTypeParameterSymbol(typeParameters[i].getName(), true);

                    signature.addTypeParameter(typeParameter);
                } else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        functionTypeDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [typeParameter.getName()]));
                    }

                    typeParameterDecls = typeParameter.getDeclarations();

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            signature.addDeclaration(functionTypeDeclaration);
            functionTypeDeclaration.setSignatureSymbol(signature);

            this.bindParameterSymbols(this.semanticInfo.getASTForDecl(functionTypeDeclaration), functionTypeSymbol, signature);

            functionTypeSymbol.addSignature(signature);

            this.popParent();
        };

        PullSymbolBinder.prototype.bindMethodDeclarationToPullSymbol = function (methodDeclaration) {
            var declKind = methodDeclaration.getKind();
            var declFlags = methodDeclaration.getFlags();
            var methodAST = this.semanticInfo.getASTForDecl(methodDeclaration);

            var isPrivate = (declFlags & TypeScript.PullElementFlags.Private) !== 0;
            var isStatic = (declFlags & TypeScript.PullElementFlags.Static) !== 0;
            var isOptional = (declFlags & TypeScript.PullElementFlags.Optional) !== 0;

            var methodName = methodDeclaration.getName();

            var isSignature = (declFlags & TypeScript.PullElementFlags.Signature) !== 0;

            var parent = this.getParent(true);
            var parentHadSymbol = false;

            var cleanedPreviousDecls = false;

            var methodSymbol = null;
            var methodTypeSymbol = null;

            var linkKind = isPrivate ? TypeScript.SymbolLinkKind.PrivateMember : TypeScript.SymbolLinkKind.PublicMember;

            if (parent.isClass() && isStatic) {
                for (var i = 0; i < this.staticClassMembers.length; i++) {
                    if (this.staticClassMembers[i].getName() === methodName) {
                        methodSymbol = this.staticClassMembers[i];
                        break;
                    }
                }

                if (!methodSymbol && this.reBindingAfterChange) {
                    var classConstructor = (parent).getConstructorMethod();

                    if (classConstructor) {
                        var classConstructorType = classConstructor.getType();

                        methodSymbol = classConstructorType.findMember(methodName);
                    }
                }
            } else {
                methodSymbol = parent.findMember(methodName, false);
            }

            if (methodSymbol && (methodSymbol.getKind() !== TypeScript.PullElementKind.Method || (this.symbolIsRedeclaration(methodSymbol) && !isSignature && !methodSymbol.allDeclsHaveFlag(TypeScript.PullElementFlags.Signature)))) {
                methodDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), methodAST.minChar, methodAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [methodDeclaration.getDisplayName()]));
                methodSymbol = null;
            }

            if (methodSymbol) {
                methodTypeSymbol = methodSymbol.getType();
                parentHadSymbol = true;
            }

            if (this.reBindingAfterChange && methodSymbol) {
                var decls = methodSymbol.getDeclarations();
                var scriptName = methodDeclaration.getScriptName();
                var isGeneric = methodTypeSymbol.isGeneric();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        methodSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                decls = methodTypeSymbol.getDeclarations();
                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        methodTypeSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                if (isGeneric) {
                    var specializations = methodTypeSymbol.getKnownSpecializations();

                    for (var i = 0; i < specializations.length; i++) {
                        specializations[i].invalidate();
                    }
                }

                methodSymbol.invalidate();
                methodTypeSymbol.invalidate();
            }

            if (!methodSymbol) {
                methodSymbol = new TypeScript.PullSymbol(methodName, TypeScript.PullElementKind.Method);
            }

            if (!methodTypeSymbol) {
                methodTypeSymbol = new TypeScript.PullFunctionTypeSymbol();
                methodSymbol.setType(methodTypeSymbol);
            }

            methodDeclaration.setSymbol(methodSymbol);
            methodSymbol.addDeclaration(methodDeclaration);
            methodTypeSymbol.addDeclaration(methodDeclaration);
            this.semanticInfo.setSymbolAndDiagnosticsForAST(methodAST.name, TypeScript.SymbolAndDiagnostics.fromSymbol(methodSymbol));
            this.semanticInfo.setSymbolAndDiagnosticsForAST(methodAST, TypeScript.SymbolAndDiagnostics.fromSymbol(methodSymbol));

            if (isOptional) {
                methodSymbol.setIsOptional();
            }

            if (!parentHadSymbol) {
                if (isStatic) {
                    this.staticClassMembers[this.staticClassMembers.length] = methodSymbol;
                } else {
                    parent.addMember(methodSymbol, linkKind);
                }
            }

            if (!isSignature) {
                this.pushParent(methodTypeSymbol, methodDeclaration);
            }

            if (parentHadSymbol && cleanedPreviousDecls) {
                var callSigs = methodTypeSymbol.getCallSignatures();
                var constructSigs = methodTypeSymbol.getConstructSignatures();
                var indexSigs = methodTypeSymbol.getIndexSignatures();

                for (var i = 0; i < callSigs.length; i++) {
                    methodTypeSymbol.removeCallSignature(callSigs[i], false);
                }
                for (var i = 0; i < constructSigs.length; i++) {
                    methodTypeSymbol.removeConstructSignature(constructSigs[i], false);
                }
                for (var i = 0; i < indexSigs.length; i++) {
                    methodTypeSymbol.removeIndexSignature(indexSigs[i], false);
                }

                methodSymbol.invalidate();
                methodTypeSymbol.invalidate();
                methodTypeSymbol.recomputeCallSignatures();
                methodTypeSymbol.recomputeConstructSignatures();
                methodTypeSymbol.recomputeIndexSignatures();

                if (isGeneric) {
                    var specializations = methodTypeSymbol.getKnownSpecializations();

                    for (var j = 0; j < specializations.length; j++) {
                        callSigs = specializations[j].getCallSignatures();

                        for (var i = 0; i < callSigs.length; i++) {
                            callSigs[i].invalidate();
                        }
                    }
                }
            }

            var sigKind = TypeScript.PullElementKind.CallSignature;

            var signature = isSignature ? new TypeScript.PullSignatureSymbol(sigKind) : new TypeScript.PullDefinitionSignatureSymbol(sigKind);

            if (methodAST.variableArgList) {
                signature.setHasVariableParamList();
            }

            var typeParameters = methodDeclaration.getTypeParameters();
            var typeParameter;
            var typeParameterDecls = null;
            var typeParameterName;
            var typeParameterAST;

            for (var i = 0; i < typeParameters.length; i++) {
                typeParameterName = typeParameters[i].getName();
                typeParameterAST = this.semanticInfo.getASTForDecl(typeParameters[i]);

                typeParameter = signature.findTypeParameter(typeParameterName);

                if (!typeParameter) {
                    if (!typeParameterAST.constraint) {
                        typeParameter = this.findTypeParameterInCache(typeParameterName);
                    }

                    if (!typeParameter) {
                        typeParameter = new TypeScript.PullTypeParameterSymbol(typeParameterName, true);

                        if (!typeParameterAST.constraint) {
                            this.addTypeParameterToCache(typeParameter);
                        }
                    }

                    signature.addTypeParameter(typeParameter);
                } else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        methodDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [typeParameter.getName()]));
                    }

                    typeParameterDecls = typeParameter.getDeclarations();

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            signature.addDeclaration(methodDeclaration);
            methodDeclaration.setSignatureSymbol(signature);

            this.bindParameterSymbols(this.semanticInfo.getASTForDecl(methodDeclaration), methodTypeSymbol, signature);

            methodTypeSymbol.addSignature(signature);

            if (!isSignature) {
                var childDecls = methodDeclaration.getChildDecls();

                for (var i = 0; i < childDecls.length; i++) {
                    this.bindDeclToPullSymbol(childDecls[i]);
                }

                this.popParent();
            }
        };

        PullSymbolBinder.prototype.bindConstructorDeclarationToPullSymbol = function (constructorDeclaration) {
            var declKind = constructorDeclaration.getKind();
            var declFlags = constructorDeclaration.getFlags();
            var constructorAST = this.semanticInfo.getASTForDecl(constructorDeclaration);

            var constructorName = constructorDeclaration.getName();

            var isSignature = (declFlags & TypeScript.PullElementFlags.Signature) !== 0;

            var parent = this.getParent(true);

            var parentHadSymbol = false;
            var cleanedPreviousDecls = false;

            var constructorSymbol = parent.getConstructorMethod();
            var constructorTypeSymbol = null;

            var linkKind = TypeScript.SymbolLinkKind.ConstructorMethod;

            if (constructorSymbol && (constructorSymbol.getKind() !== TypeScript.PullElementKind.ConstructorMethod || (!isSignature && !constructorSymbol.allDeclsHaveFlag(TypeScript.PullElementFlags.Signature)))) {
                constructorDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), constructorAST.minChar, constructorAST.getLength(), TypeScript.DiagnosticCode.Multiple_constructor_implementations_are_not_allowed, null));

                constructorSymbol = null;
            }

            if (constructorSymbol) {
                constructorTypeSymbol = constructorSymbol.getType();

                if (this.reBindingAfterChange) {
                    var decls = constructorSymbol.getDeclarations();
                    var scriptName = constructorDeclaration.getScriptName();
                    var isGeneric = constructorTypeSymbol.isGeneric();

                    for (var j = 0; j < decls.length; j++) {
                        if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                            constructorSymbol.removeDeclaration(decls[j]);

                            cleanedPreviousDecls = true;
                        }
                    }

                    decls = constructorTypeSymbol.getDeclarations();

                    for (var j = 0; j < decls.length; j++) {
                        if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                            constructorTypeSymbol.removeDeclaration(decls[j]);

                            cleanedPreviousDecls = true;
                        }
                    }

                    if (isGeneric) {
                        var specializations = constructorTypeSymbol.getKnownSpecializations();

                        for (var i = 0; i < specializations.length; i++) {
                            specializations[i].invalidate();
                        }
                    }

                    constructorSymbol.invalidate();
                    constructorTypeSymbol.invalidate();
                }
            }

            if (!constructorSymbol) {
                constructorSymbol = new TypeScript.PullSymbol(constructorName, TypeScript.PullElementKind.ConstructorMethod);
                constructorTypeSymbol = new TypeScript.PullConstructorTypeSymbol();
            }

            parent.setConstructorMethod(constructorSymbol);
            constructorSymbol.setType(constructorTypeSymbol);

            constructorDeclaration.setSymbol(constructorSymbol);
            constructorSymbol.addDeclaration(constructorDeclaration);
            constructorTypeSymbol.addDeclaration(constructorDeclaration);
            this.semanticInfo.setSymbolAndDiagnosticsForAST(constructorAST, TypeScript.SymbolAndDiagnostics.fromSymbol(constructorSymbol));

            if (!isSignature) {
                this.pushParent(constructorTypeSymbol, constructorDeclaration);
            }

            if (parentHadSymbol && cleanedPreviousDecls) {
                var constructSigs = constructorTypeSymbol.getConstructSignatures();

                for (var i = 0; i < constructSigs.length; i++) {
                    constructorTypeSymbol.removeConstructSignature(constructSigs[i]);
                }

                constructorSymbol.invalidate();
                constructorTypeSymbol.invalidate();
                constructorTypeSymbol.recomputeConstructSignatures();

                if (isGeneric) {
                    var specializations = constructorTypeSymbol.getKnownSpecializations();

                    for (var j = 0; j < specializations.length; j++) {
                        constructSigs = specializations[j].getConstructSignatures();

                        for (var i = 0; i < constructSigs.length; i++) {
                            constructSigs[i].invalidate();
                        }
                    }
                }
            }

            var constructSignature = isSignature ? new TypeScript.PullSignatureSymbol(TypeScript.PullElementKind.ConstructSignature) : new TypeScript.PullDefinitionSignatureSymbol(TypeScript.PullElementKind.ConstructSignature);

            constructSignature.setReturnType(parent);

            constructSignature.addDeclaration(constructorDeclaration);
            constructorDeclaration.setSignatureSymbol(constructSignature);

            this.bindParameterSymbols(constructorAST, constructorTypeSymbol, constructSignature);

            if (constructorAST.variableArgList) {
                constructSignature.setHasVariableParamList();
            }

            constructorTypeSymbol.addSignature(constructSignature);

            if (!isSignature) {
                var childDecls = constructorDeclaration.getChildDecls();

                for (var i = 0; i < childDecls.length; i++) {
                    this.bindDeclToPullSymbol(childDecls[i]);
                }

                this.popParent();
            }
        };

        PullSymbolBinder.prototype.bindConstructSignatureDeclarationToPullSymbol = function (constructSignatureDeclaration) {
            var parent = this.getParent(true);
            var constructorAST = this.semanticInfo.getASTForDecl(constructSignatureDeclaration);

            var constructSigs = parent.getConstructSignatures();

            for (var i = 0; i < constructSigs.length; i++) {
                if (constructSigs[i].getSymbolID() < this.startingSymbolForRebind) {
                    parent.removeConstructSignature(constructSigs[i], false);
                }
            }

            parent.recomputeConstructSignatures();
            var constructSignature = new TypeScript.PullSignatureSymbol(TypeScript.PullElementKind.ConstructSignature);

            if (constructorAST.variableArgList) {
                constructSignature.setHasVariableParamList();
            }

            var typeParameters = constructSignatureDeclaration.getTypeParameters();
            var typeParameter;
            var typeParameterDecls = null;

            for (var i = 0; i < typeParameters.length; i++) {
                typeParameter = constructSignature.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new TypeScript.PullTypeParameterSymbol(typeParameters[i].getName(), true);

                    constructSignature.addTypeParameter(typeParameter);
                } else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        constructSignatureDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [typeParameter.getName()]));
                    }

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            constructSignature.addDeclaration(constructSignatureDeclaration);
            constructSignatureDeclaration.setSignatureSymbol(constructSignature);

            this.bindParameterSymbols(this.semanticInfo.getASTForDecl(constructSignatureDeclaration), null, constructSignature);

            this.semanticInfo.setSymbolAndDiagnosticsForAST(this.semanticInfo.getASTForDecl(constructSignatureDeclaration), TypeScript.SymbolAndDiagnostics.fromSymbol(constructSignature));

            parent.addConstructSignature(constructSignature);
        };

        PullSymbolBinder.prototype.bindCallSignatureDeclarationToPullSymbol = function (callSignatureDeclaration) {
            var parent = this.getParent(true);
            var callSignatureAST = this.semanticInfo.getASTForDecl(callSignatureDeclaration);

            var callSigs = parent.getCallSignatures();

            for (var i = 0; i < callSigs.length; i++) {
                if (callSigs[i].getSymbolID() < this.startingSymbolForRebind) {
                    parent.removeCallSignature(callSigs[i], false);
                }
            }

            parent.recomputeCallSignatures();

            var callSignature = new TypeScript.PullSignatureSymbol(TypeScript.PullElementKind.CallSignature);

            if (callSignatureAST.variableArgList) {
                callSignature.setHasVariableParamList();
            }

            var typeParameters = callSignatureDeclaration.getTypeParameters();
            var typeParameter;
            var typeParameterDecls = null;

            for (var i = 0; i < typeParameters.length; i++) {
                typeParameter = callSignature.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new TypeScript.PullTypeParameterSymbol(typeParameters[i].getName(), true);

                    callSignature.addTypeParameter(typeParameter);
                } else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        callSignatureDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [typeParameter.getName()]));
                    }

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            callSignature.addDeclaration(callSignatureDeclaration);
            callSignatureDeclaration.setSignatureSymbol(callSignature);

            this.bindParameterSymbols(this.semanticInfo.getASTForDecl(callSignatureDeclaration), null, callSignature);

            this.semanticInfo.setSymbolAndDiagnosticsForAST(this.semanticInfo.getASTForDecl(callSignatureDeclaration), TypeScript.SymbolAndDiagnostics.fromSymbol(callSignature));

            parent.addCallSignature(callSignature);
        };

        PullSymbolBinder.prototype.bindIndexSignatureDeclarationToPullSymbol = function (indexSignatureDeclaration) {
            var parent = this.getParent(true);

            var indexSigs = parent.getIndexSignatures();

            for (var i = 0; i < indexSigs.length; i++) {
                if (indexSigs[i].getSymbolID() < this.startingSymbolForRebind) {
                    parent.removeIndexSignature(indexSigs[i], false);
                }
            }

            parent.recomputeIndexSignatures();

            var indexSignature = new TypeScript.PullSignatureSymbol(TypeScript.PullElementKind.IndexSignature);

            var typeParameters = indexSignatureDeclaration.getTypeParameters();
            var typeParameter;
            var typeParameterDecls = null;

            for (var i = 0; i < typeParameters.length; i++) {
                typeParameter = indexSignature.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new TypeScript.PullTypeParameterSymbol(typeParameters[i].getName(), true);

                    indexSignature.addTypeParameter(typeParameter);
                } else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        indexSignatureDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [typeParameter.getName()]));
                    }

                    typeParameterDecls = typeParameter.getDeclarations();

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            indexSignature.addDeclaration(indexSignatureDeclaration);
            indexSignatureDeclaration.setSignatureSymbol(indexSignature);

            this.bindParameterSymbols(this.semanticInfo.getASTForDecl(indexSignatureDeclaration), null, indexSignature);

            this.semanticInfo.setSymbolAndDiagnosticsForAST(this.semanticInfo.getASTForDecl(indexSignatureDeclaration), TypeScript.SymbolAndDiagnostics.fromSymbol(indexSignature));

            parent.addIndexSignature(indexSignature);
        };

        PullSymbolBinder.prototype.bindGetAccessorDeclarationToPullSymbol = function (getAccessorDeclaration) {
            var declKind = getAccessorDeclaration.getKind();
            var declFlags = getAccessorDeclaration.getFlags();
            var funcDeclAST = this.semanticInfo.getASTForDecl(getAccessorDeclaration);

            var isExported = (declFlags & TypeScript.PullElementFlags.Exported) !== 0;

            var funcName = getAccessorDeclaration.getName();

            var isSignature = (declFlags & TypeScript.PullElementFlags.Signature) !== 0;
            var isStatic = false;
            var linkKind = TypeScript.SymbolLinkKind.PublicMember;

            if (TypeScript.hasFlag(declFlags, TypeScript.PullElementFlags.Static)) {
                isStatic = true;
            }

            if (TypeScript.hasFlag(declFlags, TypeScript.PullElementFlags.Private)) {
                linkKind = TypeScript.SymbolLinkKind.PrivateMember;
            }

            var parent = this.getParent(true);
            var parentHadSymbol = false;
            var hadOtherAccessor = false;
            var cleanedPreviousDecls = false;

            var accessorSymbol = null;
            var getterSymbol = null;
            var getterTypeSymbol = null;

            if (!isStatic) {
                accessorSymbol = parent.findMember(funcName, false);
            } else {
                var candidate;

                for (var m = 0; m < this.staticClassMembers.length; m++) {
                    candidate = this.staticClassMembers[m];

                    if (candidate.getName() === funcName) {
                        accessorSymbol = candidate;
                        hadOtherAccessor = accessorSymbol.isAccessor();
                        break;
                    }
                }
            }

            if (accessorSymbol) {
                if (!accessorSymbol.isAccessor()) {
                    getAccessorDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [getAccessorDeclaration.getDisplayName()]));
                    accessorSymbol = null;
                } else {
                    getterSymbol = accessorSymbol.getGetter();

                    if (getterSymbol && (!this.reBindingAfterChange || this.symbolIsRedeclaration(getterSymbol))) {
                        getAccessorDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), TypeScript.DiagnosticCode.Getter__0__already_declared, [getAccessorDeclaration.getDisplayName()]));
                        accessorSymbol = null;
                        getterSymbol = null;
                    }
                }
            }

            if (accessorSymbol && getterSymbol) {
                getterTypeSymbol = getterSymbol.getType();
                parentHadSymbol = true;
            }

            if (this.reBindingAfterChange && accessorSymbol) {
                var decls = accessorSymbol.getDeclarations();
                var scriptName = getAccessorDeclaration.getScriptName();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        accessorSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                if (getterSymbol) {
                    decls = getterSymbol.getDeclarations();

                    for (var j = 0; j < decls.length; j++) {
                        if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                            getterSymbol.removeDeclaration(decls[j]);

                            cleanedPreviousDecls = true;
                        }
                    }
                }

                accessorSymbol.invalidate();
            }

            if (!accessorSymbol) {
                accessorSymbol = new TypeScript.PullAccessorSymbol(funcName);
            }

            if (!getterSymbol) {
                getterSymbol = new TypeScript.PullSymbol(funcName, TypeScript.PullElementKind.Function);
                getterTypeSymbol = new TypeScript.PullFunctionTypeSymbol();

                getterSymbol.setType(getterTypeSymbol);

                accessorSymbol.setGetter(getterSymbol);
            }

            getAccessorDeclaration.setSymbol(accessorSymbol);
            accessorSymbol.addDeclaration(getAccessorDeclaration);
            getterSymbol.addDeclaration(getAccessorDeclaration);

            this.semanticInfo.setSymbolAndDiagnosticsForAST(funcDeclAST.name, TypeScript.SymbolAndDiagnostics.fromSymbol(getterSymbol));
            this.semanticInfo.setSymbolAndDiagnosticsForAST(funcDeclAST, TypeScript.SymbolAndDiagnostics.fromSymbol(getterSymbol));

            if (!parentHadSymbol && !hadOtherAccessor) {
                if (isStatic) {
                    this.staticClassMembers[this.staticClassMembers.length] = accessorSymbol;
                } else {
                    parent.addMember(accessorSymbol, linkKind);
                }
            }

            if (!isSignature) {
                this.pushParent(getterTypeSymbol, getAccessorDeclaration);
            }

            if (parentHadSymbol && cleanedPreviousDecls) {
                var callSigs = getterTypeSymbol.getCallSignatures();

                for (var i = 0; i < callSigs.length; i++) {
                    getterTypeSymbol.removeCallSignature(callSigs[i], false);
                }

                getterSymbol.invalidate();
                getterTypeSymbol.invalidate();
                getterTypeSymbol.recomputeCallSignatures();
            }

            var signature = isSignature ? new TypeScript.PullSignatureSymbol(TypeScript.PullElementKind.CallSignature) : new TypeScript.PullDefinitionSignatureSymbol(TypeScript.PullElementKind.CallSignature);

            signature.addDeclaration(getAccessorDeclaration);
            getAccessorDeclaration.setSignatureSymbol(signature);

            this.bindParameterSymbols(this.semanticInfo.getASTForDecl(getAccessorDeclaration), getterTypeSymbol, signature);

            var typeParameters = getAccessorDeclaration.getTypeParameters();

            if (typeParameters.length) {
                getAccessorDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), TypeScript.DiagnosticCode.Accessor_cannot_have_type_parameters, null));
            }

            getterTypeSymbol.addSignature(signature);

            if (!isSignature) {
                var childDecls = getAccessorDeclaration.getChildDecls();

                for (var i = 0; i < childDecls.length; i++) {
                    this.bindDeclToPullSymbol(childDecls[i]);
                }

                this.popParent();
            }

            getterSymbol.setIsBound(this.bindingPhase);
        };

        PullSymbolBinder.prototype.bindSetAccessorDeclarationToPullSymbol = function (setAccessorDeclaration) {
            var declKind = setAccessorDeclaration.getKind();
            var declFlags = setAccessorDeclaration.getFlags();
            var funcDeclAST = this.semanticInfo.getASTForDecl(setAccessorDeclaration);

            var isExported = (declFlags & TypeScript.PullElementFlags.Exported) !== 0;

            var funcName = setAccessorDeclaration.getName();

            var isSignature = (declFlags & TypeScript.PullElementFlags.Signature) !== 0;
            var isStatic = false;
            var linkKind = TypeScript.SymbolLinkKind.PublicMember;

            if (TypeScript.hasFlag(declFlags, TypeScript.PullElementFlags.Static)) {
                isStatic = true;
            }

            if (TypeScript.hasFlag(declFlags, TypeScript.PullElementFlags.Private)) {
                linkKind = TypeScript.SymbolLinkKind.PrivateMember;
            }

            var parent = this.getParent(true);
            var parentHadSymbol = false;
            var hadOtherAccessor = false;
            var cleanedPreviousDecls = false;

            var accessorSymbol = null;
            var setterSymbol = null;
            var setterTypeSymbol = null;

            if (!isStatic) {
                accessorSymbol = parent.findMember(funcName, false);
            } else {
                var candidate;

                for (var m = 0; m < this.staticClassMembers.length; m++) {
                    candidate = this.staticClassMembers[m];

                    if (candidate.getName() === funcName) {
                        accessorSymbol = candidate;
                        hadOtherAccessor = accessorSymbol.isAccessor();
                        break;
                    }
                }
            }

            if (accessorSymbol) {
                if (!accessorSymbol.isAccessor()) {
                    setAccessorDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), TypeScript.DiagnosticCode.Duplicate_identifier__0_, [setAccessorDeclaration.getDisplayName()]));
                    accessorSymbol = null;
                } else {
                    setterSymbol = accessorSymbol.getSetter();

                    if (setterSymbol && (!this.reBindingAfterChange || this.symbolIsRedeclaration(setterSymbol))) {
                        setAccessorDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), TypeScript.DiagnosticCode.Setter__0__already_declared, [setAccessorDeclaration.getDisplayName()]));
                        accessorSymbol = null;
                        setterSymbol = null;
                    }
                }
            }

            if (accessorSymbol && setterSymbol) {
                setterTypeSymbol = setterSymbol.getType();
                parentHadSymbol = true;
            }

            if (this.reBindingAfterChange && accessorSymbol) {
                var decls = accessorSymbol.getDeclarations();
                var scriptName = setAccessorDeclaration.getScriptName();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        accessorSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                if (setterSymbol) {
                    decls = setterSymbol.getDeclarations();

                    for (var j = 0; j < decls.length; j++) {
                        if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                            setterSymbol.removeDeclaration(decls[j]);

                            cleanedPreviousDecls = true;
                        }
                    }
                }

                accessorSymbol.invalidate();
            }

            if (!accessorSymbol) {
                accessorSymbol = new TypeScript.PullAccessorSymbol(funcName);
            }

            if (!setterSymbol) {
                setterSymbol = new TypeScript.PullSymbol(funcName, TypeScript.PullElementKind.Function);
                setterTypeSymbol = new TypeScript.PullFunctionTypeSymbol();

                setterSymbol.setType(setterTypeSymbol);

                accessorSymbol.setSetter(setterSymbol);
            }

            setAccessorDeclaration.setSymbol(accessorSymbol);
            accessorSymbol.addDeclaration(setAccessorDeclaration);
            setterSymbol.addDeclaration(setAccessorDeclaration);

            this.semanticInfo.setSymbolAndDiagnosticsForAST(funcDeclAST.name, TypeScript.SymbolAndDiagnostics.fromSymbol(setterSymbol));
            this.semanticInfo.setSymbolAndDiagnosticsForAST(funcDeclAST, TypeScript.SymbolAndDiagnostics.fromSymbol(setterSymbol));

            if (!parentHadSymbol && !hadOtherAccessor) {
                if (isStatic) {
                    this.staticClassMembers[this.staticClassMembers.length] = accessorSymbol;
                } else {
                    parent.addMember(accessorSymbol, linkKind);
                }
            }

            if (!isSignature) {
                this.pushParent(setterTypeSymbol, setAccessorDeclaration);
            }

            if (parentHadSymbol && cleanedPreviousDecls) {
                var callSigs = setterTypeSymbol.getCallSignatures();

                for (var i = 0; i < callSigs.length; i++) {
                    setterTypeSymbol.removeCallSignature(callSigs[i], false);
                }

                setterSymbol.invalidate();
                setterTypeSymbol.invalidate();
                setterTypeSymbol.recomputeCallSignatures();
            }

            var signature = isSignature ? new TypeScript.PullSignatureSymbol(TypeScript.PullElementKind.CallSignature) : new TypeScript.PullDefinitionSignatureSymbol(TypeScript.PullElementKind.CallSignature);

            signature.addDeclaration(setAccessorDeclaration);
            setAccessorDeclaration.setSignatureSymbol(signature);

            this.bindParameterSymbols(this.semanticInfo.getASTForDecl(setAccessorDeclaration), setterTypeSymbol, signature);

            var typeParameters = setAccessorDeclaration.getTypeParameters();

            if (typeParameters.length) {
                setAccessorDeclaration.addDiagnostic(new TypeScript.SemanticDiagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), TypeScript.DiagnosticCode.Accessor_cannot_have_type_parameters, null));
            }

            setterTypeSymbol.addSignature(signature);

            if (!isSignature) {
                var childDecls = setAccessorDeclaration.getChildDecls();

                for (var i = 0; i < childDecls.length; i++) {
                    this.bindDeclToPullSymbol(childDecls[i]);
                }

                this.popParent();
            }

            setterSymbol.setIsBound(this.bindingPhase);
        };

        PullSymbolBinder.prototype.bindCatchBlockPullSymbols = function (catchBlockDecl) {
            var childDecls = catchBlockDecl.getChildDecls();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }
        };

        PullSymbolBinder.prototype.bindWithBlockPullSymbols = function (withBlockDecl) {
            var childDecls = withBlockDecl.getChildDecls();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }
        };

        PullSymbolBinder.prototype.bindDeclToPullSymbol = function (decl, rebind) {
            if (typeof rebind === "undefined") { rebind = false; }
            if (rebind) {
                this.startingDeclForRebind = TypeScript.lastBoundPullDeclId;
                this.startingSymbolForRebind = TypeScript.lastBoundPullSymbolID;
                this.reBindingAfterChange = true;
            }

            switch (decl.getKind()) {
                case TypeScript.PullElementKind.Script:
                    var childDecls = decl.getChildDecls();
                    for (var i = 0; i < childDecls.length; i++) {
                        this.bindDeclToPullSymbol(childDecls[i]);
                    }
                    break;

                case TypeScript.PullElementKind.Enum:
                case TypeScript.PullElementKind.DynamicModule:
                case TypeScript.PullElementKind.Container:
                    this.bindModuleDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.Interface:
                    this.bindInterfaceDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.Class:
                    this.bindClassDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.Function:
                    this.bindFunctionDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.Variable:
                    this.bindVariableDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.EnumMember:
                case TypeScript.PullElementKind.Property:
                    this.bindPropertyDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.Method:
                    this.bindMethodDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.ConstructorMethod:
                    this.bindConstructorDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.CallSignature:
                    this.bindCallSignatureDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.ConstructSignature:
                    this.bindConstructSignatureDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.IndexSignature:
                    this.bindIndexSignatureDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.GetAccessor:
                    this.bindGetAccessorDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.SetAccessor:
                    this.bindSetAccessorDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.ObjectType:
                    this.bindObjectTypeDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.FunctionType:
                    this.bindFunctionTypeDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.ConstructorType:
                    this.bindConstructorTypeDeclarationToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.FunctionExpression:
                    this.bindFunctionExpressionToPullSymbol(decl);
                    break;

                case TypeScript.PullElementKind.TypeAlias:
                    this.bindImportDeclaration(decl);
                    break;

                case TypeScript.PullElementKind.Parameter:
                    break;

                case TypeScript.PullElementKind.CatchBlock:
                    this.bindCatchBlockPullSymbols(decl);

                case TypeScript.PullElementKind.WithBlock:
                    this.bindWithBlockPullSymbols(decl);
                    break;

                default:
                    throw new Error("Unrecognized type declaration");
            }
        };

        PullSymbolBinder.prototype.bindDeclsForUnit = function (filePath, rebind) {
            if (typeof rebind === "undefined") { rebind = false; }
            this.setUnit(filePath);

            var topLevelDecls = this.semanticInfo.getTopLevelDecls();

            for (var i = 0; i < topLevelDecls.length; i++) {
                this.bindDeclToPullSymbol(topLevelDecls[i], rebind);
            }
        };
        return PullSymbolBinder;
    })();
    TypeScript.PullSymbolBinder = PullSymbolBinder;
})(TypeScript || (TypeScript = {}));
