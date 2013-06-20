var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    TypeScript.pullSymbolID = 0;
    TypeScript.lastBoundPullSymbolID = 0;
    TypeScript.globalTyvarID = 0;

    var PullSymbol = (function () {
        function PullSymbol(name, declKind) {
            this.pullSymbolID = TypeScript.pullSymbolID++;
            this.outgoingLinks = new TypeScript.LinkList();
            this.incomingLinks = new TypeScript.LinkList();
            this.declarations = new TypeScript.LinkList();
            this.cachedPathIDs = {};
            this.cachedContainerLink = null;
            this.cachedTypeLink = null;
            this.cachedDeclarations = null;
            this.hasBeenResolved = false;
            this.isOptional = false;
            this.inResolution = false;
            this.isSynthesized = false;
            this.isBound = false;
            this.rebindingID = 0;
            this.isVarArg = false;
            this.isSpecialized = false;
            this.isBeingSpecialized = false;
            this.rootSymbol = null;
            this.typeChangeUpdateVersion = -1;
            this.addUpdateVersion = -1;
            this.removeUpdateVersion = -1;
            this.docComments = null;
            this.isPrinting = false;
            this.name = name;
            this.declKind = declKind;
        }
        PullSymbol.prototype.getSymbolID = function () {
            return this.pullSymbolID;
        };

        PullSymbol.prototype.isType = function () {
            return (this.declKind & TypeScript.PullElementKind.SomeType) != 0;
        };

        PullSymbol.prototype.isSignature = function () {
            return (this.declKind & TypeScript.PullElementKind.SomeSignature) != 0;
        };

        PullSymbol.prototype.isArray = function () {
            return (this.declKind & TypeScript.PullElementKind.Array) != 0;
        };

        PullSymbol.prototype.isPrimitive = function () {
            return this.declKind === TypeScript.PullElementKind.Primitive;
        };

        PullSymbol.prototype.isAccessor = function () {
            return false;
        };

        PullSymbol.prototype.isError = function () {
            return false;
        };

        PullSymbol.prototype.isAlias = function () {
            return false;
        };
        PullSymbol.prototype.isContainer = function () {
            return false;
        };

        PullSymbol.prototype.findAliasedType = function (decls) {
            for (var i = 0; i < decls.length; i++) {
                var childDecls = decls[i].getChildDecls();
                for (var j = 0; j < childDecls.length; j++) {
                    if (childDecls[j].getKind() === TypeScript.PullElementKind.TypeAlias) {
                        var symbol = childDecls[j].getSymbol();
                        if (PullContainerTypeSymbol.usedAsSymbol(symbol, this)) {
                            return symbol;
                        }
                    }
                }
            }

            return null;
        };

        PullSymbol.prototype.getAliasedSymbol = function (scopeSymbol) {
            if (!scopeSymbol) {
                return null;
            }

            var scopePath = scopeSymbol.pathToRoot();
            if (scopePath.length && scopePath[scopePath.length - 1].getKind() === TypeScript.PullElementKind.DynamicModule) {
                var decls = scopePath[scopePath.length - 1].getDeclarations();
                var symbol = this.findAliasedType(decls);
                return symbol;
            }

            return null;
        };

        PullSymbol.prototype.getName = function (scopeSymbol, useConstraintInName) {
            var symbol = this.getAliasedSymbol(scopeSymbol);
            if (symbol) {
                return symbol.getName();
            }

            return this.name;
        };

        PullSymbol.prototype.getDisplayName = function (scopeSymbol, useConstraintInName) {
            var symbol = this.getAliasedSymbol(scopeSymbol);
            if (symbol) {
                return symbol.getDisplayName();
            }

            return this.getDeclarations()[0].getDisplayName();
        };

        PullSymbol.prototype.getKind = function () {
            return this.declKind;
        };
        PullSymbol.prototype.setKind = function (declType) {
            this.declKind = declType;
        };

        PullSymbol.prototype.setIsOptional = function () {
            this.isOptional = true;
        };
        PullSymbol.prototype.getIsOptional = function () {
            return this.isOptional;
        };

        PullSymbol.prototype.getIsVarArg = function () {
            return this.isVarArg;
        };
        PullSymbol.prototype.setIsVarArg = function () {
            this.isVarArg = true;
        };

        PullSymbol.prototype.setIsSynthesized = function () {
            this.isSynthesized = true;
        };
        PullSymbol.prototype.getIsSynthesized = function () {
            return this.isSynthesized;
        };

        PullSymbol.prototype.setIsSpecialized = function () {
            this.isSpecialized = true;
            this.isBeingSpecialized = false;
        };
        PullSymbol.prototype.getIsSpecialized = function () {
            return this.isSpecialized;
        };
        PullSymbol.prototype.currentlyBeingSpecialized = function () {
            return this.isBeingSpecialized;
        };
        PullSymbol.prototype.setIsBeingSpecialized = function () {
            this.isBeingSpecialized = true;
        };
        PullSymbol.prototype.setValueIsBeingSpecialized = function (val) {
            this.isBeingSpecialized = val;
        };

        PullSymbol.prototype.getRootSymbol = function () {
            return this.rootSymbol;
        };
        PullSymbol.prototype.setRootSymbol = function (symbol) {
            this.rootSymbol = symbol;
        };

        PullSymbol.prototype.setIsBound = function (rebindingID) {
            this.isBound = true;
            this.rebindingID = rebindingID;
        };

        PullSymbol.prototype.getRebindingID = function () {
            return this.rebindingID;
        };

        PullSymbol.prototype.getIsBound = function () {
            return this.isBound;
        };

        PullSymbol.prototype.addCacheID = function (cacheID) {
            if (!this.cachedPathIDs[cacheID]) {
                this.cachedPathIDs[cacheID] = true;
            }
        };

        PullSymbol.prototype.invalidateCachedIDs = function (cache) {
            for (var id in this.cachedPathIDs) {
                if (cache[id]) {
                    cache[id] = undefined;
                }
            }
        };

        PullSymbol.prototype.addDeclaration = function (decl) {
            TypeScript.Debug.assert(!!decl);

            if (this.rootSymbol) {
                return;
            }

            this.declarations.addItem(decl);

            if (!this.cachedDeclarations) {
                this.cachedDeclarations = [decl];
            } else {
                this.cachedDeclarations[this.cachedDeclarations.length] = decl;
            }
        };

        PullSymbol.prototype.getDeclarations = function () {
            if (this.rootSymbol) {
                return this.rootSymbol.getDeclarations();
            }

            if (!this.cachedDeclarations) {
                this.cachedDeclarations = [];
            }

            return this.cachedDeclarations;
        };

        PullSymbol.prototype.removeDeclaration = function (decl) {
            if (this.rootSymbol) {
                return;
            }

            this.declarations.remove(function (d) {
                return d === decl;
            });
            this.cachedDeclarations = this.declarations.find(function (d) {
                return d;
            });
        };

        PullSymbol.prototype.updateDeclarations = function (map, context) {
            if (this.rootSymbol) {
                return;
            }

            this.declarations.update(map, context);
        };

        PullSymbol.prototype.addOutgoingLink = function (linkTo, kind) {
            var link = new TypeScript.PullSymbolLink(this, linkTo, kind);
            this.outgoingLinks.addItem(link);
            linkTo.incomingLinks.addItem(link);

            return link;
        };

        PullSymbol.prototype.findOutgoingLinks = function (p) {
            return this.outgoingLinks.find(p);
        };

        PullSymbol.prototype.findIncomingLinks = function (p) {
            return this.incomingLinks.find(p);
        };

        PullSymbol.prototype.removeOutgoingLink = function (link) {
            if (link) {
                this.outgoingLinks.remove(function (p) {
                    return p === link;
                });

                if (link.end.incomingLinks) {
                    link.end.incomingLinks.remove(function (p) {
                        return p === link;
                    });
                }
            }
        };

        PullSymbol.prototype.updateOutgoingLinks = function (map, context) {
            if (this.outgoingLinks) {
                this.outgoingLinks.update(map, context);
            }
        };

        PullSymbol.prototype.updateIncomingLinks = function (map, context) {
            if (this.incomingLinks) {
                this.incomingLinks.update(map, context);
            }
        };

        PullSymbol.prototype.removeAllLinks = function () {
            var _this = this;
            this.updateOutgoingLinks(function (item) {
                return _this.removeOutgoingLink(item);
            }, null);
            this.updateIncomingLinks(function (item) {
                return item.start.removeOutgoingLink(item);
            }, null);
        };

        PullSymbol.prototype.setContainer = function (containerSymbol) {
            var link = this.addOutgoingLink(containerSymbol, TypeScript.SymbolLinkKind.ContainedBy);
            this.cachedContainerLink = link;

            containerSymbol.addContainedByLink(link);
        };

        PullSymbol.prototype.getContainer = function () {
            if (this.cachedContainerLink) {
                return this.cachedContainerLink.end;
            }

            if (this.getIsSpecialized()) {
                var specializations = this.findIncomingLinks(function (symbolLink) {
                    return symbolLink.kind == TypeScript.SymbolLinkKind.SpecializedTo;
                });
                if (specializations.length == 1) {
                    return specializations[0].start.getContainer();
                }
            }

            return null;
        };

        PullSymbol.prototype.unsetContainer = function () {
            if (this.cachedContainerLink) {
                this.removeOutgoingLink(this.cachedContainerLink);
            }

            this.invalidate();
        };

        PullSymbol.prototype.setType = function (typeRef) {
            if (this.cachedTypeLink) {
                this.unsetType();
            }

            this.cachedTypeLink = this.addOutgoingLink(typeRef, TypeScript.SymbolLinkKind.TypedAs);
        };

        PullSymbol.prototype.getType = function () {
            if (this.cachedTypeLink) {
                return this.cachedTypeLink.end;
            }

            return null;
        };

        PullSymbol.prototype.unsetType = function () {
            var foundType = false;

            if (this.cachedTypeLink) {
                this.removeOutgoingLink(this.cachedTypeLink);
                foundType = true;
            }

            if (foundType) {
                this.invalidate();
            }
        };

        PullSymbol.prototype.isTyped = function () {
            return this.getType() != null;
        };

        PullSymbol.prototype.setResolved = function () {
            this.hasBeenResolved = true;
            this.inResolution = false;
        };
        PullSymbol.prototype.isResolved = function () {
            return this.hasBeenResolved;
        };

        PullSymbol.prototype.startResolving = function () {
            this.inResolution = true;
        };
        PullSymbol.prototype.isResolving = function () {
            return this.inResolution;
        };

        PullSymbol.prototype.setUnresolved = function () {
            this.hasBeenResolved = false;
            this.isBound = false;
            this.inResolution = false;
        };

        PullSymbol.prototype.invalidate = function () {
            this.docComments = null;

            this.hasBeenResolved = false;
            this.isBound = false;

            this.declarations.update(function (pullDecl) {
                return pullDecl.resetErrors();
            }, null);
        };

        PullSymbol.prototype.hasFlag = function (flag) {
            var declarations = this.getDeclarations();
            for (var i = 0, n = declarations.length; i < n; i++) {
                if ((declarations[i].getFlags() & flag) !== TypeScript.PullElementFlags.None) {
                    return true;
                }
            }
            return false;
        };

        PullSymbol.prototype.allDeclsHaveFlag = function (flag) {
            var declarations = this.getDeclarations();
            for (var i = 0, n = declarations.length; i < n; i++) {
                if (!((declarations[i].getFlags() & flag) !== TypeScript.PullElementFlags.None)) {
                    return false;
                }
            }
            return true;
        };

        PullSymbol.prototype.pathToRoot = function () {
            var path = [];
            var node = this;
            while (node) {
                if (node.isType()) {
                    var associatedContainerSymbol = (node).getAssociatedContainerType();
                    if (associatedContainerSymbol) {
                        node = associatedContainerSymbol;
                    }
                }
                path[path.length] = node;
                node = node.getContainer();
            }
            return path;
        };

        PullSymbol.prototype.findCommonAncestorPath = function (b) {
            var aPath = this.pathToRoot();
            if (aPath.length === 1) {
                return aPath;
            }

            var bPath;
            if (b) {
                bPath = b.pathToRoot();
            } else {
                return aPath;
            }

            var commonNodeIndex = -1;
            for (var i = 0, aLen = aPath.length; i < aLen; i++) {
                var aNode = aPath[i];
                for (var j = 0, bLen = bPath.length; j < bLen; j++) {
                    var bNode = bPath[j];
                    if (aNode === bNode) {
                        var aDecl = null;
                        if (i > 0) {
                            var decls = aPath[i - 1].getDeclarations();
                            if (decls.length) {
                                aDecl = decls[0].getParentDecl();
                            }
                        }
                        var bDecl = null;
                        if (j > 0) {
                            var decls = bPath[j - 1].getDeclarations();
                            if (decls.length) {
                                bDecl = decls[0].getParentDecl();
                            }
                        }
                        if (!aDecl || !bDecl || aDecl == bDecl) {
                            commonNodeIndex = i;
                            break;
                        }
                    }
                }
                if (commonNodeIndex >= 0) {
                    break;
                }
            }

            if (commonNodeIndex >= 0) {
                return aPath.slice(0, commonNodeIndex);
            } else {
                return aPath;
            }
        };

        PullSymbol.prototype.toString = function (useConstraintInName) {
            var str = this.getNameAndTypeName();
            return str;
        };

        PullSymbol.prototype.getNamePartForFullName = function () {
            return this.getDisplayName(null, true);
        };

        PullSymbol.prototype.fullName = function (scopeSymbol) {
            var path = this.pathToRoot();
            var fullName = "";
            var aliasedSymbol = this.getAliasedSymbol(scopeSymbol);
            if (aliasedSymbol) {
                return aliasedSymbol.getDisplayName();
            }

            for (var i = 1; i < path.length; i++) {
                aliasedSymbol = path[i].getAliasedSymbol(scopeSymbol);
                if (aliasedSymbol) {
                    fullName = aliasedSymbol.getDisplayName() + "." + fullName;
                    break;
                } else {
                    var scopedName = path[i].getNamePartForFullName();
                    if (path[i].getKind() == TypeScript.PullElementKind.DynamicModule && !TypeScript.isQuoted(scopedName)) {
                        break;
                    }

                    if (scopedName === "") {
                        break;
                    }

                    fullName = scopedName + "." + fullName;
                }
            }

            fullName = fullName + this.getNamePartForFullName();
            return fullName;
        };

        PullSymbol.prototype.getScopedName = function (scopeSymbol, useConstraintInName) {
            var path = this.findCommonAncestorPath(scopeSymbol);
            var fullName = "";
            var aliasedSymbol = this.getAliasedSymbol(scopeSymbol);
            if (aliasedSymbol) {
                return aliasedSymbol.getDisplayName();
            }

            for (var i = 1; i < path.length; i++) {
                var kind = path[i].getKind();
                if (kind === TypeScript.PullElementKind.Container || kind === TypeScript.PullElementKind.DynamicModule) {
                    aliasedSymbol = path[i].getAliasedSymbol(scopeSymbol);
                    if (aliasedSymbol) {
                        fullName = aliasedSymbol.getDisplayName() + "." + fullName;
                        break;
                    } else if (kind === TypeScript.PullElementKind.Container) {
                        fullName = path[i].getDisplayName() + "." + fullName;
                    } else {
                        var displayName = path[i].getDisplayName();
                        if (TypeScript.isQuoted(displayName)) {
                            fullName = displayName + "." + fullName;
                        }
                        break;
                    }
                } else {
                    break;
                }
            }
            fullName = fullName + this.getDisplayName(scopeSymbol, useConstraintInName);
            return fullName;
        };

        PullSymbol.prototype.getScopedNameEx = function (scopeSymbol, useConstraintInName, getPrettyTypeName, getTypeParamMarkerInfo) {
            var name = this.getScopedName(scopeSymbol, useConstraintInName);
            return TypeScript.MemberName.create(name);
        };

        PullSymbol.prototype.getTypeName = function (scopeSymbol, getPrettyTypeName) {
            var memberName = this.getTypeNameEx(scopeSymbol, getPrettyTypeName);
            return memberName.toString();
        };

        PullSymbol.prototype.getTypeNameEx = function (scopeSymbol, getPrettyTypeName) {
            var type = this.getType();
            if (type) {
                var memberName = getPrettyTypeName ? this.getTypeNameForFunctionSignature("", scopeSymbol, getPrettyTypeName) : null;
                if (!memberName) {
                    memberName = type.getScopedNameEx(scopeSymbol, true, getPrettyTypeName);
                }

                return memberName;
            }
            return TypeScript.MemberName.create("");
        };

        PullSymbol.prototype.getTypeNameForFunctionSignature = function (prefix, scopeSymbol, getPrettyTypeName) {
            var type = this.getType();
            if (type && !type.isNamedTypeSymbol() && this.declKind != TypeScript.PullElementKind.Property && this.declKind != TypeScript.PullElementKind.Variable && this.declKind != TypeScript.PullElementKind.Parameter) {
                var signatures = type.getCallSignatures();
                var typeName = new TypeScript.MemberNameArray();
                var signatureName = PullSignatureSymbol.getSignaturesTypeNameEx(signatures, prefix, false, false, scopeSymbol, getPrettyTypeName);
                typeName.addAll(signatureName);
                return typeName;
            }

            return null;
        };

        PullSymbol.prototype.getNameAndTypeName = function (scopeSymbol) {
            var nameAndTypeName = this.getNameAndTypeNameEx(scopeSymbol);
            return nameAndTypeName.toString();
        };

        PullSymbol.prototype.getNameAndTypeNameEx = function (scopeSymbol) {
            var type = this.getType();
            var nameEx = this.getScopedNameEx(scopeSymbol);
            if (type) {
                var nameStr = nameEx.toString() + (this.getIsOptional() ? "?" : "");
                var memberName = this.getTypeNameForFunctionSignature(nameStr, scopeSymbol);
                if (!memberName) {
                    var typeNameEx = type.getScopedNameEx(scopeSymbol);
                    memberName = TypeScript.MemberName.create(typeNameEx, nameStr + ": ", "");
                }
                return memberName;
            }
            return nameEx;
        };

        PullSymbol.getTypeParameterString = function (typars, scopeSymbol, useContraintInName) {
            return PullSymbol.getTypeParameterStringEx(typars, scopeSymbol, undefined, useContraintInName).toString();
        };

        PullSymbol.getTypeParameterStringEx = function (typeParameters, scopeSymbol, getTypeParamMarkerInfo, useContraintInName) {
            var builder = new TypeScript.MemberNameArray();
            builder.prefix = "";

            if (typeParameters && typeParameters.length) {
                builder.add(TypeScript.MemberName.create("<"));

                for (var i = 0; i < typeParameters.length; i++) {
                    if (i) {
                        builder.add(TypeScript.MemberName.create(", "));
                    }

                    if (getTypeParamMarkerInfo) {
                        builder.add(new TypeScript.MemberName());
                    }

                    builder.add(typeParameters[i].getScopedNameEx(scopeSymbol, useContraintInName));

                    if (getTypeParamMarkerInfo) {
                        builder.add(new TypeScript.MemberName());
                    }
                }

                builder.add(TypeScript.MemberName.create(">"));
            }

            return builder;
        };

        PullSymbol.getIsExternallyVisible = function (symbol, fromIsExternallyVisibleSymbol, inIsExternallyVisibleSymbols) {
            if (inIsExternallyVisibleSymbols) {
                for (var i = 0; i < inIsExternallyVisibleSymbols.length; i++) {
                    if (inIsExternallyVisibleSymbols[i] === symbol) {
                        return true;
                    }
                }
            } else {
                inIsExternallyVisibleSymbols = [];
            }

            if (fromIsExternallyVisibleSymbol === symbol) {
                return true;
            }
            inIsExternallyVisibleSymbols = inIsExternallyVisibleSymbols.concat(fromIsExternallyVisibleSymbol);

            return symbol.isExternallyVisible(inIsExternallyVisibleSymbols);
        };

        PullSymbol.prototype.isExternallyVisible = function (inIsExternallyVisibleSymbols) {
            var kind = this.getKind();
            if (kind === TypeScript.PullElementKind.Primitive) {
                return true;
            }

            if (this.isType()) {
                var associatedContainerSymbol = (this).getAssociatedContainerType();
                if (associatedContainerSymbol) {
                    return PullSymbol.getIsExternallyVisible(associatedContainerSymbol, this, inIsExternallyVisibleSymbols);
                }
            }

            if (this.hasFlag(TypeScript.PullElementFlags.Private)) {
                return false;
            }

            var container = this.getContainer();
            if (container === null) {
                return true;
            }

            if (container.getKind() == TypeScript.PullElementKind.DynamicModule || (container.getAssociatedContainerType() && container.getAssociatedContainerType().getKind() == TypeScript.PullElementKind.DynamicModule)) {
                var containerTypeSymbol = container.getKind() == TypeScript.PullElementKind.DynamicModule ? container : container.getAssociatedContainerType();
                if (PullContainerTypeSymbol.usedAsSymbol(containerTypeSymbol, this)) {
                    return true;
                }
            }

            if (!this.hasFlag(TypeScript.PullElementFlags.Exported) && kind != TypeScript.PullElementKind.Property && kind != TypeScript.PullElementKind.Method) {
                return false;
            }

            return PullSymbol.getIsExternallyVisible(container, this, inIsExternallyVisibleSymbols);
        };
        return PullSymbol;
    })();
    TypeScript.PullSymbol = PullSymbol;

    var PullExpressionSymbol = (function (_super) {
        __extends(PullExpressionSymbol, _super);
        function PullExpressionSymbol() {
            _super.call(this, "", TypeScript.PullElementKind.Expression);
            this.contributingSymbols = [];
        }
        PullExpressionSymbol.prototype.addContributingSymbol = function (symbol) {
            var link = this.addOutgoingLink(symbol, TypeScript.SymbolLinkKind.ContributesToExpression);

            this.contributingSymbols[this.contributingSymbols.length] = symbol;
        };

        PullExpressionSymbol.prototype.getContributingSymbols = function () {
            return this.contributingSymbols;
        };
        return PullExpressionSymbol;
    })(PullSymbol);
    TypeScript.PullExpressionSymbol = PullExpressionSymbol;

    var PullSignatureSymbol = (function (_super) {
        __extends(PullSignatureSymbol, _super);
        function PullSignatureSymbol(kind) {
            _super.call(this, "", kind);
            this.parameterLinks = null;
            this.typeParameterLinks = null;
            this.returnTypeLink = null;
            this.hasOptionalParam = false;
            this.nonOptionalParamCount = 0;
            this.hasVarArgs = false;
            this.specializationCache = {};
            this.memberTypeParameterNameCache = null;
            this.hasAGenericParameter = false;
            this.stringConstantOverload = undefined;
        }
        PullSignatureSymbol.prototype.isDefinition = function () {
            return false;
        };

        PullSignatureSymbol.prototype.hasVariableParamList = function () {
            return this.hasVarArgs;
        };
        PullSignatureSymbol.prototype.setHasVariableParamList = function () {
            this.hasVarArgs = true;
        };

        PullSignatureSymbol.prototype.setHasGenericParameter = function () {
            this.hasAGenericParameter = true;
        };
        PullSignatureSymbol.prototype.hasGenericParameter = function () {
            return this.hasAGenericParameter;
        };

        PullSignatureSymbol.prototype.isGeneric = function () {
            return this.hasAGenericParameter || (this.typeParameterLinks && this.typeParameterLinks.length != 0);
        };

        PullSignatureSymbol.prototype.addParameter = function (parameter, isOptional) {
            if (typeof isOptional === "undefined") { isOptional = false; }
            if (!this.parameterLinks) {
                this.parameterLinks = [];
            }

            var link = this.addOutgoingLink(parameter, TypeScript.SymbolLinkKind.Parameter);
            this.parameterLinks[this.parameterLinks.length] = link;
            this.hasOptionalParam = isOptional;

            if (!isOptional) {
                this.nonOptionalParamCount++;
            }
        };

        PullSignatureSymbol.prototype.addSpecialization = function (signature, typeArguments) {
            if (typeArguments && typeArguments.length) {
                this.specializationCache[getIDForTypeSubstitutions(typeArguments)] = signature;
            }
        };

        PullSignatureSymbol.prototype.getSpecialization = function (typeArguments) {
            if (typeArguments) {
                var sig = this.specializationCache[getIDForTypeSubstitutions(typeArguments)];

                if (sig) {
                    return sig;
                }
            }

            return null;
        };

        PullSignatureSymbol.prototype.addTypeParameter = function (parameter) {
            if (!this.typeParameterLinks) {
                this.typeParameterLinks = [];
            }

            if (!this.memberTypeParameterNameCache) {
                this.memberTypeParameterNameCache = new TypeScript.BlockIntrinsics();
            }

            var link = this.addOutgoingLink(parameter, TypeScript.SymbolLinkKind.TypeParameter);
            this.typeParameterLinks[this.typeParameterLinks.length] = link;

            this.memberTypeParameterNameCache[link.end.getName()] = link.end;
        };

        PullSignatureSymbol.prototype.getNonOptionalParameterCount = function () {
            return this.nonOptionalParamCount;
        };

        PullSignatureSymbol.prototype.setReturnType = function (returnType) {
            if (returnType) {
                if (this.returnTypeLink) {
                    this.removeOutgoingLink(this.returnTypeLink);
                }
                this.returnTypeLink = this.addOutgoingLink(returnType, TypeScript.SymbolLinkKind.ReturnType);
            }
        };

        PullSignatureSymbol.prototype.getParameters = function () {
            var params = [];

            if (this.parameterLinks) {
                for (var i = 0; i < this.parameterLinks.length; i++) {
                    params[params.length] = this.parameterLinks[i].end;
                }
            }

            return params;
        };

        PullSignatureSymbol.prototype.getTypeParameters = function () {
            var params = [];

            if (this.typeParameterLinks) {
                for (var i = 0; i < this.typeParameterLinks.length; i++) {
                    params[params.length] = this.typeParameterLinks[i].end;
                }
            }

            return params;
        };

        PullSignatureSymbol.prototype.findTypeParameter = function (name) {
            var memberSymbol;

            if (!this.memberTypeParameterNameCache) {
                this.memberTypeParameterNameCache = new TypeScript.BlockIntrinsics();

                if (this.typeParameterLinks) {
                    for (var i = 0; i < this.typeParameterLinks.length; i++) {
                        this.memberTypeParameterNameCache[this.typeParameterLinks[i].end.getName()] = this.typeParameterLinks[i].end;
                    }
                }
            }

            memberSymbol = this.memberTypeParameterNameCache[name];

            return memberSymbol;
        };

        PullSignatureSymbol.prototype.removeParameter = function (parameterSymbol) {
            var paramLink;

            if (this.parameterLinks) {
                for (var i = 0; i < this.parameterLinks.length; i++) {
                    if (parameterSymbol === this.parameterLinks[i].end) {
                        paramLink = this.parameterLinks[i];
                        this.removeOutgoingLink(paramLink);
                        break;
                    }
                }
            }

            this.invalidate();
        };

        PullSignatureSymbol.prototype.mimicSignature = function (signature, resolver) {
            var typeParameters = signature.getTypeParameters();
            var typeParameter;

            if (typeParameters) {
                for (var i = 0; i < typeParameters.length; i++) {
                    this.addTypeParameter(typeParameters[i]);
                }
            }

            var parameters = signature.getParameters();
            var parameter;

            if (parameters) {
                for (var j = 0; j < parameters.length; j++) {
                    parameter = new PullSymbol(parameters[j].getName(), TypeScript.PullElementKind.Parameter);
                    parameter.setRootSymbol(parameters[j]);

                    if (parameters[j].getIsOptional()) {
                        parameter.setIsOptional();
                    }
                    if (parameters[j].getIsVarArg()) {
                        parameter.setIsVarArg();
                        this.setHasVariableParamList();
                    }
                    this.addParameter(parameter);
                }
            }

            var returnType = signature.getReturnType();

            if (!resolver.isTypeArgumentOrWrapper(returnType)) {
                this.setReturnType(returnType);
            }
        };

        PullSignatureSymbol.prototype.getReturnType = function () {
            if (this.returnTypeLink) {
                return this.returnTypeLink.end;
            } else {
                var rtl = this.findOutgoingLinks(function (p) {
                    return p.kind === TypeScript.SymbolLinkKind.ReturnType;
                });

                if (rtl.length) {
                    this.returnTypeLink = rtl[0];
                    return this.returnTypeLink.end;
                }

                return null;
            }
        };

        PullSignatureSymbol.prototype.parametersAreFixed = function () {
            if (!this.isGeneric()) {
                return true;
            }

            if (this.parameterLinks) {
                var paramType;
                for (var i = 0; i < this.parameterLinks.length; i++) {
                    paramType = this.parameterLinks[i].end.getType();

                    if (paramType && !paramType.isFixed()) {
                        return false;
                    }
                }
            }

            return true;
        };

        PullSignatureSymbol.prototype.invalidate = function () {
            this.parameterLinks = this.findOutgoingLinks(function (psl) {
                return psl.kind === TypeScript.SymbolLinkKind.Parameter;
            });
            this.nonOptionalParamCount = 0;
            this.hasOptionalParam = false;
            this.hasAGenericParameter = false;
            this.stringConstantOverload = undefined;

            if (this.parameterLinks) {
                for (var i = 0; i < this.parameterLinks.length; i++) {
                    this.parameterLinks[i].end.invalidate();

                    if (!this.parameterLinks[i].end.getIsOptional()) {
                        this.nonOptionalParamCount++;
                    } else {
                        this.hasOptionalParam;
                        break;
                    }
                }
            }

            _super.prototype.invalidate.call(this);
        };

        PullSignatureSymbol.prototype.isStringConstantOverloadSignature = function () {
            if (this.stringConstantOverload === undefined) {
                var params = this.getParameters();
                this.stringConstantOverload = false;
                for (var i = 0; i < params.length; i++) {
                    var paramType = params[i].getType();
                    if (paramType && paramType.isPrimitive() && (paramType).isStringConstant()) {
                        this.stringConstantOverload = true;
                    }
                }
            }

            return this.stringConstantOverload;
        };

        PullSignatureSymbol.getSignatureTypeMemberName = function (candidateSignature, signatures, scopeSymbol) {
            var allMemberNames = new TypeScript.MemberNameArray();
            var signatureMemberName = PullSignatureSymbol.getSignaturesTypeNameEx(signatures, "", false, false, scopeSymbol, true, candidateSignature);
            allMemberNames.addAll(signatureMemberName);
            return allMemberNames;
        };

        PullSignatureSymbol.getSignaturesTypeNameEx = function (signatures, prefix, shortform, brackets, scopeSymbol, getPrettyTypeName, candidateSignature) {
            var result = [];
            var len = signatures.length;
            if (!getPrettyTypeName && len > 1) {
                shortform = false;
            }

            var foundDefinition = false;
            if (candidateSignature && candidateSignature.isDefinition() && len > 1) {
                candidateSignature = null;
            }

            for (var i = 0; i < len; i++) {
                if (len > 1 && signatures[i].isDefinition()) {
                    foundDefinition = true;
                    continue;
                }

                var signature = signatures[i];
                if (getPrettyTypeName && candidateSignature) {
                    signature = candidateSignature;
                }

                result.push(signature.getSignatureTypeNameEx(prefix, shortform, brackets, scopeSymbol));
                if (getPrettyTypeName) {
                    break;
                }
            }

            if (getPrettyTypeName && result.length && len > 1) {
                var lastMemberName = result[result.length - 1];
                for (var i = i + 1; i < len; i++) {
                    if (signatures[i].isDefinition()) {
                        foundDefinition = true;
                        break;
                    }
                }
                var overloadString = " (+ " + (foundDefinition ? len - 2 : len - 1) + " overload(s))";
                lastMemberName.add(TypeScript.MemberName.create(overloadString));
            }

            return result;
        };

        PullSignatureSymbol.prototype.toString = function (useConstraintInName) {
            var s = this.getSignatureTypeNameEx(this.getScopedNameEx().toString(), false, false, undefined, undefined, useConstraintInName).toString();
            return s;
        };

        PullSignatureSymbol.prototype.getSignatureTypeNameEx = function (prefix, shortform, brackets, scopeSymbol, getParamMarkerInfo, getTypeParamMarkerInfo) {
            var typeParamterBuilder = new TypeScript.MemberNameArray();

            typeParamterBuilder.add(PullSymbol.getTypeParameterStringEx(this.getTypeParameters(), scopeSymbol, getTypeParamMarkerInfo, true));

            if (brackets) {
                typeParamterBuilder.add(TypeScript.MemberName.create("["));
            } else {
                typeParamterBuilder.add(TypeScript.MemberName.create("("));
            }

            var builder = new TypeScript.MemberNameArray();
            builder.prefix = prefix;

            if (getTypeParamMarkerInfo) {
                builder.prefix = prefix;
                builder.addAll(typeParamterBuilder.entries);
            } else {
                builder.prefix = prefix + typeParamterBuilder.toString();
            }

            var params = this.getParameters();
            var paramLen = params.length;
            for (var i = 0; i < paramLen; i++) {
                var paramType = params[i].getType();
                var typeString = paramType ? ": " : "";
                var paramIsVarArg = params[i].getIsVarArg();
                var varArgPrefix = paramIsVarArg ? "..." : "";
                var optionalString = (!paramIsVarArg && params[i].getIsOptional()) ? "?" : "";
                if (getParamMarkerInfo) {
                    builder.add(new TypeScript.MemberName());
                }
                builder.add(TypeScript.MemberName.create(varArgPrefix + params[i].getScopedNameEx(scopeSymbol).toString() + optionalString + typeString));
                if (paramType) {
                    builder.add(paramType.getScopedNameEx(scopeSymbol));
                }
                if (getParamMarkerInfo) {
                    builder.add(new TypeScript.MemberName());
                }
                if (i < paramLen - 1) {
                    builder.add(TypeScript.MemberName.create(", "));
                }
            }

            if (shortform) {
                if (brackets) {
                    builder.add(TypeScript.MemberName.create("] => "));
                } else {
                    builder.add(TypeScript.MemberName.create(") => "));
                }
            } else {
                if (brackets) {
                    builder.add(TypeScript.MemberName.create("]: "));
                } else {
                    builder.add(TypeScript.MemberName.create("): "));
                }
            }

            var returnType = this.getReturnType();

            if (returnType) {
                builder.add(returnType.getScopedNameEx(scopeSymbol));
            } else {
                builder.add(TypeScript.MemberName.create("any"));
            }

            return builder;
        };
        return PullSignatureSymbol;
    })(PullSymbol);
    TypeScript.PullSignatureSymbol = PullSignatureSymbol;

    var PullTypeSymbol = (function (_super) {
        __extends(PullTypeSymbol, _super);
        function PullTypeSymbol() {
            _super.apply(this, arguments);
            this.memberLinks = null;
            this.typeParameterLinks = null;
            this.specializationLinks = null;
            this.containedByLinks = null;
            this.memberNameCache = null;
            this.memberTypeNameCache = null;
            this.memberTypeParameterNameCache = null;
            this.containedMemberCache = null;
            this.typeArguments = null;
            this.specializedTypeCache = null;
            this.memberCache = null;
            this.implementedTypeLinks = null;
            this.extendedTypeLinks = null;
            this.callSignatureLinks = null;
            this.constructSignatureLinks = null;
            this.indexSignatureLinks = null;
            this.arrayType = null;
            this.hasGenericSignature = false;
            this.hasGenericMember = false;
            this.knownBaseTypeCount = 0;
            this.invalidatedSpecializations = false;
            this.associatedContainerTypeSymbol = null;
            this.constructorMethod = null;
            this.hasDefaultConstructor = false;
        }
        PullTypeSymbol.prototype.getKnownBaseTypeCount = function () {
            return this.knownBaseTypeCount;
        };
        PullTypeSymbol.prototype.resetKnownBaseTypeCount = function () {
            this.knownBaseTypeCount = 0;
        };
        PullTypeSymbol.prototype.incrementKnownBaseCount = function () {
            this.knownBaseTypeCount++;
        };

        PullTypeSymbol.prototype.isType = function () {
            return true;
        };
        PullTypeSymbol.prototype.isClass = function () {
            return this.getKind() == TypeScript.PullElementKind.Class || (this.constructorMethod != null);
        };

        PullTypeSymbol.prototype.hasMembers = function () {
            var thisHasMembers = this.memberLinks && this.memberLinks.length != 0;

            if (thisHasMembers) {
                return true;
            }

            var parents = this.getExtendedTypes();

            for (var i = 0; i < parents.length; i++) {
                if (parents[i].hasMembers()) {
                    return true;
                }
            }

            return false;
        };
        PullTypeSymbol.prototype.isFunction = function () {
            return false;
        };
        PullTypeSymbol.prototype.isConstructor = function () {
            return false;
        };
        PullTypeSymbol.prototype.isTypeParameter = function () {
            return false;
        };
        PullTypeSymbol.prototype.isTypeVariable = function () {
            return false;
        };
        PullTypeSymbol.prototype.isError = function () {
            return false;
        };

        PullTypeSymbol.prototype.setHasGenericSignature = function () {
            this.hasGenericSignature = true;
        };
        PullTypeSymbol.prototype.getHasGenericSignature = function () {
            return this.hasGenericSignature;
        };

        PullTypeSymbol.prototype.setHasGenericMember = function () {
            this.hasGenericMember = true;
        };
        PullTypeSymbol.prototype.getHasGenericMember = function () {
            return this.hasGenericMember;
        };

        PullTypeSymbol.prototype.setAssociatedContainerType = function (type) {
            this.associatedContainerTypeSymbol = type;
        };

        PullTypeSymbol.prototype.getAssociatedContainerType = function () {
            return this.associatedContainerTypeSymbol;
        };

        PullTypeSymbol.prototype.getType = function () {
            return this;
        };

        PullTypeSymbol.prototype.getArrayType = function () {
            return this.arrayType;
        };

        PullTypeSymbol.prototype.getElementType = function () {
            var arrayOfLinks = this.findOutgoingLinks(function (link) {
                return link.kind === TypeScript.SymbolLinkKind.ArrayOf;
            });

            if (arrayOfLinks.length) {
                return arrayOfLinks[0].end;
            }

            return null;
        };
        PullTypeSymbol.prototype.setArrayType = function (arrayType) {
            this.arrayType = arrayType;

            arrayType.addOutgoingLink(this, TypeScript.SymbolLinkKind.ArrayOf);
        };

        PullTypeSymbol.prototype.addContainedByLink = function (containedByLink) {
            if (!this.containedByLinks) {
                this.containedByLinks = [];
            }

            if (!this.containedMemberCache) {
                this.containedMemberCache = new TypeScript.BlockIntrinsics();
            }

            this.containedByLinks[this.containedByLinks.length] = containedByLink;
            this.containedMemberCache[containedByLink.start.getName()] = containedByLink.start;
        };

        PullTypeSymbol.prototype.findContainedMember = function (name) {
            if (!this.containedByLinks) {
                this.containedByLinks = this.findIncomingLinks(function (psl) {
                    return psl.kind === TypeScript.SymbolLinkKind.ContainedBy;
                });
                this.containedMemberCache = new TypeScript.BlockIntrinsics();

                for (var i = 0; i < this.containedByLinks.length; i++) {
                    this.containedMemberCache[this.containedByLinks[i].start.getName()] = this.containedByLinks[i].start;
                }
            }

            return this.containedMemberCache[name];
        };

        PullTypeSymbol.prototype.addMember = function (memberSymbol, linkKind, doNotChangeContainer) {
            var link = this.addOutgoingLink(memberSymbol, linkKind);

            if (!doNotChangeContainer) {
                memberSymbol.setContainer(this);
            }

            if (!this.memberLinks) {
                this.memberLinks = [];
            }

            if (!this.memberCache || !this.memberNameCache) {
                this.populateMemberCache();
            }

            if (!memberSymbol.isType()) {
                this.memberLinks[this.memberLinks.length] = link;

                this.memberCache[this.memberCache.length] = memberSymbol;

                if (!this.memberNameCache) {
                    this.populateMemberCache();
                }
                this.memberNameCache[memberSymbol.getName()] = memberSymbol;
            } else {
                if ((memberSymbol).isTypeParameter()) {
                    if (!this.typeParameterLinks) {
                        this.typeParameterLinks = [];
                    }
                    if (!this.memberTypeParameterNameCache) {
                        this.memberTypeParameterNameCache = new TypeScript.BlockIntrinsics();
                    }
                    this.typeParameterLinks[this.typeParameterLinks.length] = link;
                    this.memberTypeParameterNameCache[memberSymbol.getName()] = memberSymbol;
                } else {
                    if (!this.memberTypeNameCache) {
                        this.memberTypeNameCache = new TypeScript.BlockIntrinsics();
                    }
                    this.memberLinks[this.memberLinks.length] = link;
                    this.memberTypeNameCache[memberSymbol.getName()] = memberSymbol;
                    this.memberCache[this.memberCache.length] = memberSymbol;
                }
            }
        };

        PullTypeSymbol.prototype.removeMember = function (memberSymbol) {
            var memberLink;
            var child;

            var links = (memberSymbol.isType() && (memberSymbol).isTypeParameter()) ? this.typeParameterLinks : this.memberLinks;

            if (links) {
                for (var i = 0; i < links.length; i++) {
                    if (memberSymbol === links[i].end) {
                        memberLink = links[i];
                        child = memberLink.end;
                        child.unsetContainer();
                        this.removeOutgoingLink(memberLink);
                        break;
                    }
                }
            }

            this.invalidate();
        };

        PullTypeSymbol.prototype.getMembers = function () {
            if (this.memberCache) {
                return this.memberCache;
            } else {
                var members = [];

                if (this.memberLinks) {
                    for (var i = 0; i < this.memberLinks.length; i++) {
                        members[members.length] = this.memberLinks[i].end;
                    }
                }

                if (members.length) {
                    this.memberCache = members;
                }

                return members;
            }
        };

        PullTypeSymbol.prototype.setHasDefaultConstructor = function (hasOne) {
            if (typeof hasOne === "undefined") { hasOne = true; }
            this.hasDefaultConstructor = hasOne;
        };

        PullTypeSymbol.prototype.getHasDefaultConstructor = function () {
            return this.hasDefaultConstructor;
        };

        PullTypeSymbol.prototype.getConstructorMethod = function () {
            return this.constructorMethod;
        };

        PullTypeSymbol.prototype.setConstructorMethod = function (constructorMethod) {
            this.constructorMethod = constructorMethod;
        };

        PullTypeSymbol.prototype.getTypeParameters = function () {
            var members = [];

            if (this.typeParameterLinks) {
                for (var i = 0; i < this.typeParameterLinks.length; i++) {
                    members[members.length] = this.typeParameterLinks[i].end;
                }
            }

            return members;
        };

        PullTypeSymbol.prototype.isGeneric = function () {
            return (this.typeParameterLinks && this.typeParameterLinks.length != 0) || this.hasGenericSignature || this.hasGenericMember || (this.typeArguments && this.typeArguments.length);
        };

        PullTypeSymbol.prototype.isFixed = function () {
            if (!this.isGeneric()) {
                return true;
            }

            if (this.typeParameterLinks && this.typeArguments) {
                if (!this.typeArguments.length || this.typeArguments.length < this.typeParameterLinks.length) {
                    return false;
                }

                for (var i = 0; i < this.typeArguments.length; i++) {
                    if (!this.typeArguments[i].isFixed()) {
                        return false;
                    }
                }

                return true;
            }

            return false;
        };

        PullTypeSymbol.prototype.addSpecialization = function (specializedVersionOfThisType, substitutingTypes) {
            if (!substitutingTypes || !substitutingTypes.length) {
                return;
            }

            if (!this.specializedTypeCache) {
                this.specializedTypeCache = new TypeScript.BlockIntrinsics();
            }

            if (!this.specializationLinks) {
                this.specializationLinks = [];
            }

            this.specializationLinks[this.specializationLinks.length] = this.addOutgoingLink(specializedVersionOfThisType, TypeScript.SymbolLinkKind.SpecializedTo);

            this.specializedTypeCache[getIDForTypeSubstitutions(substitutingTypes)] = specializedVersionOfThisType;
        };

        PullTypeSymbol.prototype.getSpecialization = function (substitutingTypes) {
            if (!substitutingTypes || !substitutingTypes.length) {
                return null;
            }

            if (!this.specializedTypeCache) {
                this.specializedTypeCache = new TypeScript.BlockIntrinsics();

                return null;
            }

            var specialization = this.specializedTypeCache[getIDForTypeSubstitutions(substitutingTypes)];

            if (!specialization) {
                return null;
            }

            return specialization;
        };

        PullTypeSymbol.prototype.getKnownSpecializations = function () {
            var specializations = [];

            if (this.specializedTypeCache) {
                for (var specializationID in this.specializedTypeCache) {
                    if (this.specializedTypeCache[specializationID]) {
                        specializations[specializations.length] = this.specializedTypeCache[specializationID];
                    }
                }
            }

            return specializations;
        };

        PullTypeSymbol.prototype.invalidateSpecializations = function () {
            if (this.invalidatedSpecializations) {
                return;
            }

            var specializations = this.getKnownSpecializations();

            for (var i = 0; i < specializations.length; i++) {
                specializations[i].invalidate();
            }

            if (this.specializationLinks && this.specializationLinks.length) {
                for (var i = 0; i < this.specializationLinks.length; i++) {
                    this.removeOutgoingLink(this.specializationLinks[i]);
                }
            }

            this.specializationLinks = null;

            this.specializedTypeCache = null;

            this.invalidatedSpecializations = true;
        };

        PullTypeSymbol.prototype.removeSpecialization = function (specializationType) {
            if (this.specializationLinks && this.specializationLinks.length) {
                for (var i = 0; i < this.specializationLinks.length; i++) {
                    if (this.specializationLinks[i].end === specializationType) {
                        this.removeOutgoingLink(this.specializationLinks[i]);
                        break;
                    }
                }
            }

            if (this.specializedTypeCache) {
                for (var specializationID in this.specializedTypeCache) {
                    if (this.specializedTypeCache[specializationID] === specializationType) {
                        this.specializedTypeCache[specializationID] = undefined;
                    }
                }
            }
        };

        PullTypeSymbol.prototype.getTypeArguments = function () {
            return this.typeArguments;
        };
        PullTypeSymbol.prototype.setTypeArguments = function (typeArgs) {
            this.typeArguments = typeArgs;
        };

        PullTypeSymbol.prototype.addCallSignature = function (callSignature) {
            if (!this.callSignatureLinks) {
                this.callSignatureLinks = [];
            }

            var link = this.addOutgoingLink(callSignature, TypeScript.SymbolLinkKind.CallSignature);
            this.callSignatureLinks[this.callSignatureLinks.length] = link;

            if (callSignature.isGeneric()) {
                this.hasGenericSignature = true;
            }
        };

        PullTypeSymbol.prototype.addCallSignatures = function (callSignatures) {
            if (!this.callSignatureLinks) {
                this.callSignatureLinks = [];
            }

            for (var i = 0; i < callSignatures.length; i++) {
                this.addCallSignature(callSignatures[i]);
            }
        };

        PullTypeSymbol.prototype.addConstructSignature = function (constructSignature) {
            if (!this.constructSignatureLinks) {
                this.constructSignatureLinks = [];
            }

            var link = this.addOutgoingLink(constructSignature, TypeScript.SymbolLinkKind.ConstructSignature);
            this.constructSignatureLinks[this.constructSignatureLinks.length] = link;

            if (constructSignature.isGeneric()) {
                this.hasGenericSignature = true;
            }
        };

        PullTypeSymbol.prototype.addConstructSignatures = function (constructSignatures) {
            if (!this.constructSignatureLinks) {
                this.constructSignatureLinks = [];
            }

            for (var i = 0; i < constructSignatures.length; i++) {
                this.addConstructSignature(constructSignatures[i]);
            }
        };

        PullTypeSymbol.prototype.addIndexSignature = function (indexSignature) {
            if (!this.indexSignatureLinks) {
                this.indexSignatureLinks = [];
            }

            var link = this.addOutgoingLink(indexSignature, TypeScript.SymbolLinkKind.IndexSignature);
            this.indexSignatureLinks[this.indexSignatureLinks.length] = link;

            if (indexSignature.isGeneric()) {
                this.hasGenericSignature = true;
            }
        };

        PullTypeSymbol.prototype.addIndexSignatures = function (indexSignatures) {
            if (!this.indexSignatureLinks) {
                this.indexSignatureLinks = [];
            }

            for (var i = 0; i < indexSignatures.length; i++) {
                this.addIndexSignature(indexSignatures[i]);
            }
        };

        PullTypeSymbol.prototype.hasOwnCallSignatures = function () {
            return !!this.callSignatureLinks;
        };

        PullTypeSymbol.prototype.getCallSignatures = function () {
            var members = [];

            if (this.callSignatureLinks) {
                for (var i = 0; i < this.callSignatureLinks.length; i++) {
                    members[members.length] = this.callSignatureLinks[i].end;
                }
            }

            var extendedTypes = this.getExtendedTypes();

            for (var i = 0; i < extendedTypes.length; i++) {
                if (extendedTypes[i].hasBase(this)) {
                    continue;
                }
                members = members.concat(extendedTypes[i].getCallSignatures());
            }

            return members;
        };

        PullTypeSymbol.prototype.hasOwnConstructSignatures = function () {
            return !!this.constructSignatureLinks;
        };

        PullTypeSymbol.prototype.getConstructSignatures = function () {
            var members = [];

            if (this.constructSignatureLinks) {
                for (var i = 0; i < this.constructSignatureLinks.length; i++) {
                    members[members.length] = this.constructSignatureLinks[i].end;
                }
            }

            if (!(this.getKind() == TypeScript.PullElementKind.ConstructorType)) {
                var extendedTypes = this.getExtendedTypes();

                for (var i = 0; i < extendedTypes.length; i++) {
                    if (extendedTypes[i].hasBase(this)) {
                        continue;
                    }
                    members = members.concat(extendedTypes[i].getConstructSignatures());
                }
            }

            return members;
        };

        PullTypeSymbol.prototype.hasOwnIndexSignatures = function () {
            return !!this.indexSignatureLinks;
        };

        PullTypeSymbol.prototype.getIndexSignatures = function () {
            var members = [];

            if (this.indexSignatureLinks) {
                for (var i = 0; i < this.indexSignatureLinks.length; i++) {
                    members[members.length] = this.indexSignatureLinks[i].end;
                }
            }
            var extendedTypes = this.getExtendedTypes();

            for (var i = 0; i < extendedTypes.length; i++) {
                if (extendedTypes[i].hasBase(this)) {
                    continue;
                }
                members = members.concat(extendedTypes[i].getIndexSignatures());
            }

            return members;
        };

        PullTypeSymbol.prototype.removeCallSignature = function (signature, invalidate) {
            if (typeof invalidate === "undefined") { invalidate = true; }
            var signatureLink;

            if (this.callSignatureLinks) {
                for (var i = 0; i < this.callSignatureLinks.length; i++) {
                    if (signature === this.callSignatureLinks[i].end) {
                        signatureLink = this.callSignatureLinks[i];
                        this.removeOutgoingLink(signatureLink);
                        break;
                    }
                }
            }

            if (invalidate) {
                this.invalidate();
            }
        };

        PullTypeSymbol.prototype.recomputeCallSignatures = function () {
            this.callSignatureLinks = this.findOutgoingLinks(function (psl) {
                return psl.kind === TypeScript.SymbolLinkKind.CallSignature;
            });
        };

        PullTypeSymbol.prototype.removeConstructSignature = function (signature, invalidate) {
            if (typeof invalidate === "undefined") { invalidate = true; }
            var signatureLink;

            if (this.constructSignatureLinks) {
                for (var i = 0; i < this.constructSignatureLinks.length; i++) {
                    if (signature === this.constructSignatureLinks[i].end) {
                        signatureLink = this.constructSignatureLinks[i];
                        this.removeOutgoingLink(signatureLink);
                        break;
                    }
                }
            }

            if (invalidate) {
                this.invalidate();
            }
        };

        PullTypeSymbol.prototype.recomputeConstructSignatures = function () {
            this.constructSignatureLinks = this.findOutgoingLinks(function (psl) {
                return psl.kind === TypeScript.SymbolLinkKind.ConstructSignature;
            });
        };

        PullTypeSymbol.prototype.removeIndexSignature = function (signature, invalidate) {
            if (typeof invalidate === "undefined") { invalidate = true; }
            var signatureLink;

            if (this.indexSignatureLinks) {
                for (var i = 0; i < this.indexSignatureLinks.length; i++) {
                    if (signature === this.indexSignatureLinks[i].end) {
                        signatureLink = this.indexSignatureLinks[i];
                        this.removeOutgoingLink(signatureLink);
                        break;
                    }
                }
            }

            if (invalidate) {
                this.invalidate();
            }
        };

        PullTypeSymbol.prototype.recomputeIndexSignatures = function () {
            this.indexSignatureLinks = this.findOutgoingLinks(function (psl) {
                return psl.kind === TypeScript.SymbolLinkKind.IndexSignature;
            });
        };

        PullTypeSymbol.prototype.addImplementedType = function (interfaceType) {
            if (!this.implementedTypeLinks) {
                this.implementedTypeLinks = [];
            }

            var link = this.addOutgoingLink(interfaceType, TypeScript.SymbolLinkKind.Implements);
            this.implementedTypeLinks[this.implementedTypeLinks.length] = link;
        };

        PullTypeSymbol.prototype.getImplementedTypes = function () {
            var members = [];

            if (this.implementedTypeLinks) {
                for (var i = 0; i < this.implementedTypeLinks.length; i++) {
                    members[members.length] = this.implementedTypeLinks[i].end;
                }
            }

            return members;
        };

        PullTypeSymbol.prototype.removeImplementedType = function (implementedType) {
            var typeLink;

            if (this.implementedTypeLinks) {
                for (var i = 0; i < this.implementedTypeLinks.length; i++) {
                    if (implementedType === this.implementedTypeLinks[i].end) {
                        typeLink = this.implementedTypeLinks[i];
                        this.removeOutgoingLink(typeLink);
                        break;
                    }
                }
            }

            this.invalidate();
        };

        PullTypeSymbol.prototype.addExtendedType = function (extendedType) {
            if (!this.extendedTypeLinks) {
                this.extendedTypeLinks = [];
            }

            var link = this.addOutgoingLink(extendedType, TypeScript.SymbolLinkKind.Extends);
            this.extendedTypeLinks[this.extendedTypeLinks.length] = link;
        };

        PullTypeSymbol.prototype.getExtendedTypes = function () {
            var members = [];

            if (this.extendedTypeLinks) {
                for (var i = 0; i < this.extendedTypeLinks.length; i++) {
                    members[members.length] = this.extendedTypeLinks[i].end;
                }
            }

            return members;
        };

        PullTypeSymbol.prototype.hasBase = function (potentialBase) {
            if (this === potentialBase) {
                return true;
            }

            var extendedTypes = this.getExtendedTypes();

            for (var i = 0; i < extendedTypes.length; i++) {
                if (extendedTypes[i].hasBase(potentialBase)) {
                    return true;
                }
            }

            var implementedTypes = this.getImplementedTypes();

            for (var i = 0; i < implementedTypes.length; i++) {
                if (implementedTypes[i].hasBase(potentialBase)) {
                    return true;
                }
            }

            return false;
        };

        PullTypeSymbol.prototype.isValidBaseKind = function (baseType, isExtendedType) {
            if (baseType.isError()) {
                return false;
            }

            var thisIsClass = this.isClass();
            if (isExtendedType) {
                if (thisIsClass) {
                    return baseType.getKind() === TypeScript.PullElementKind.Class;
                }
            } else {
                if (!thisIsClass) {
                    return false;
                }
            }

            return !!(baseType.getKind() & (TypeScript.PullElementKind.Interface | TypeScript.PullElementKind.Class | TypeScript.PullElementKind.Array));
        };

        PullTypeSymbol.prototype.removeExtendedType = function (extendedType) {
            var typeLink;

            if (this.extendedTypeLinks) {
                for (var i = 0; i < this.extendedTypeLinks.length; i++) {
                    if (extendedType === this.extendedTypeLinks[i].end) {
                        typeLink = this.extendedTypeLinks[i];
                        this.removeOutgoingLink(typeLink);
                        break;
                    }
                }
            }

            this.invalidate();
        };

        PullTypeSymbol.prototype.findMember = function (name, lookInParent) {
            if (typeof lookInParent === "undefined") { lookInParent = true; }
            var memberSymbol;

            if (!this.memberNameCache) {
                this.populateMemberCache();
            }

            memberSymbol = this.memberNameCache[name];

            if (!lookInParent) {
                return memberSymbol;
            } else if (memberSymbol) {
                return memberSymbol;
            }

            if (!memberSymbol && this.extendedTypeLinks) {
                for (var i = 0; i < this.extendedTypeLinks.length; i++) {
                    memberSymbol = (this.extendedTypeLinks[i].end).findMember(name);

                    if (memberSymbol) {
                        return memberSymbol;
                    }
                }
            }

            return this.findNestedType(name);
        };

        PullTypeSymbol.prototype.findNestedType = function (name, kind) {
            if (typeof kind === "undefined") { kind = TypeScript.PullElementKind.None; }
            var memberSymbol;

            if (!this.memberTypeNameCache) {
                this.populateMemberTypeCache();
            }

            memberSymbol = this.memberTypeNameCache[name];

            if (memberSymbol && kind != TypeScript.PullElementKind.None) {
                memberSymbol = ((memberSymbol.getKind() & kind) != 0) ? memberSymbol : null;
            }

            return memberSymbol;
        };

        PullTypeSymbol.prototype.populateMemberCache = function () {
            if (!this.memberNameCache || !this.memberCache) {
                this.memberNameCache = new TypeScript.BlockIntrinsics();
                this.memberCache = [];

                if (this.memberLinks) {
                    for (var i = 0; i < this.memberLinks.length; i++) {
                        this.memberNameCache[this.memberLinks[i].end.getName()] = this.memberLinks[i].end;
                        this.memberCache[this.memberCache.length] = this.memberLinks[i].end;
                    }
                }
            }
        };

        PullTypeSymbol.prototype.populateMemberTypeCache = function () {
            if (!this.memberTypeNameCache) {
                this.memberTypeNameCache = new TypeScript.BlockIntrinsics();

                var setAll = false;

                if (!this.memberCache) {
                    this.memberCache = [];
                    this.memberNameCache = new TypeScript.BlockIntrinsics();
                    setAll = true;
                }

                if (this.memberLinks) {
                    for (var i = 0; i < this.memberLinks.length; i++) {
                        if (this.memberLinks[i].end.isType()) {
                            this.memberTypeNameCache[this.memberLinks[i].end.getName()] = this.memberLinks[i].end;
                            this.memberCache[this.memberCache.length] = this.memberLinks[i].end;
                        } else if (setAll) {
                            this.memberNameCache[this.memberLinks[i].end.getName()] = this.memberLinks[i].end;
                            this.memberCache[this.memberCache.length] = this.memberLinks[i].end;
                        }
                    }
                }
            }
        };

        PullTypeSymbol.prototype.getAllMembers = function (searchDeclKind, includePrivate) {
            var allMembers = [];
            var i = 0;
            var j = 0;
            var m = 0;
            var n = 0;

            if (!this.memberCache) {
                this.populateMemberCache();
            }

            if (!this.memberTypeNameCache) {
                this.populateMemberTypeCache();
            }

            if (!this.memberNameCache) {
                this.populateMemberCache();
            }

            for (var i = 0, n = this.memberCache.length; i < n; i++) {
                var member = this.memberCache[i];
                if ((member.getKind() & searchDeclKind) && (includePrivate || !member.hasFlag(TypeScript.PullElementFlags.Private))) {
                    allMembers[allMembers.length] = member;
                }
            }

            if (this.extendedTypeLinks) {
                for (var i = 0, n = this.extendedTypeLinks.length; i < n; i++) {
                    var extendedMembers = (this.extendedTypeLinks[i].end).getAllMembers(searchDeclKind, includePrivate);

                    for (var j = 0, m = extendedMembers.length; j < m; j++) {
                        var extendedMember = extendedMembers[j];
                        if (!this.memberNameCache[extendedMember.getName()]) {
                            allMembers[allMembers.length] = extendedMember;
                        }
                    }
                }
            }

            return allMembers;
        };

        PullTypeSymbol.prototype.findTypeParameter = function (name) {
            var memberSymbol;

            if (!this.memberTypeParameterNameCache) {
                this.memberTypeParameterNameCache = new TypeScript.BlockIntrinsics();

                if (this.typeParameterLinks) {
                    for (var i = 0; i < this.typeParameterLinks.length; i++) {
                        this.memberTypeParameterNameCache[this.typeParameterLinks[i].end.getName()] = this.typeParameterLinks[i].end;
                    }
                }
            }

            memberSymbol = this.memberTypeParameterNameCache[name];

            return memberSymbol;
        };

        PullTypeSymbol.prototype.cleanTypeParameters = function () {
            if (this.typeParameterLinks) {
                for (var i = 0; i < this.typeParameterLinks.length; i++) {
                    this.removeOutgoingLink(this.typeParameterLinks[i]);
                }
            }

            this.typeParameterLinks = null;
            this.memberTypeParameterNameCache = null;
        };

        PullTypeSymbol.prototype.setResolved = function () {
            this.invalidatedSpecializations = true;
            _super.prototype.setResolved.call(this);
        };

        PullTypeSymbol.prototype.invalidate = function () {
            if (this.constructorMethod) {
                this.constructorMethod.invalidate();
            }

            this.memberNameCache = null;
            this.memberCache = null;
            this.memberTypeNameCache = null;
            this.containedMemberCache = null;

            this.invalidatedSpecializations = false;

            this.containedByLinks = null;

            this.memberLinks = this.findOutgoingLinks(function (psl) {
                return psl.kind === TypeScript.SymbolLinkKind.PrivateMember || psl.kind === TypeScript.SymbolLinkKind.PublicMember;
            });

            this.typeParameterLinks = this.findOutgoingLinks(function (psl) {
                return psl.kind === TypeScript.SymbolLinkKind.TypeParameter;
            });

            this.callSignatureLinks = this.findOutgoingLinks(function (psl) {
                return psl.kind === TypeScript.SymbolLinkKind.CallSignature;
            });

            this.constructSignatureLinks = this.findOutgoingLinks(function (psl) {
                return psl.kind === TypeScript.SymbolLinkKind.ConstructSignature;
            });

            this.indexSignatureLinks = this.findOutgoingLinks(function (psl) {
                return psl.kind === TypeScript.SymbolLinkKind.IndexSignature;
            });

            this.implementedTypeLinks = this.findOutgoingLinks(function (psl) {
                return psl.kind === TypeScript.SymbolLinkKind.Implements;
            });

            this.extendedTypeLinks = this.findOutgoingLinks(function (psl) {
                return psl.kind === TypeScript.SymbolLinkKind.Extends;
            });

            this.knownBaseTypeCount = 0;

            _super.prototype.invalidate.call(this);
        };

        PullTypeSymbol.prototype.getNamePartForFullName = function () {
            var name = _super.prototype.getNamePartForFullName.call(this);

            var typars = this.getTypeArguments();
            if (!typars || !typars.length) {
                typars = this.getTypeParameters();
            }

            var typarString = PullSymbol.getTypeParameterString(typars, this, true);
            return name + typarString;
        };

        PullTypeSymbol.prototype.getScopedName = function (scopeSymbol, useConstraintInName) {
            return this.getScopedNameEx(scopeSymbol, useConstraintInName).toString();
        };

        PullTypeSymbol.prototype.isNamedTypeSymbol = function () {
            var kind = this.getKind();
            if (kind === TypeScript.PullElementKind.Primitive || kind === TypeScript.PullElementKind.Class || kind === TypeScript.PullElementKind.Container || kind === TypeScript.PullElementKind.DynamicModule || kind === TypeScript.PullElementKind.TypeAlias || kind === TypeScript.PullElementKind.Enum || kind === TypeScript.PullElementKind.TypeParameter || ((kind === TypeScript.PullElementKind.Interface || kind === TypeScript.PullElementKind.ObjectType) && this.getName() != "")) {
                return true;
            }

            return false;
        };

        PullTypeSymbol.prototype.toString = function (useConstraintInName) {
            var s = this.getScopedNameEx(null, useConstraintInName).toString();
            return s;
        };

        PullTypeSymbol.prototype.getScopedNameEx = function (scopeSymbol, useConstraintInName, getPrettyTypeName, getTypeParamMarkerInfo) {
            if (!this.isNamedTypeSymbol()) {
                return this.getMemberTypeNameEx(true, scopeSymbol, getPrettyTypeName);
            }

            var builder = new TypeScript.MemberNameArray();
            builder.prefix = _super.prototype.getScopedName.call(this, scopeSymbol, useConstraintInName);

            var typars = this.getTypeArguments();
            if (!typars || !typars.length) {
                typars = this.getTypeParameters();
            }

            builder.add(PullSymbol.getTypeParameterStringEx(typars, this, getTypeParamMarkerInfo, useConstraintInName));

            return builder;
        };

        PullTypeSymbol.prototype.hasOnlyOverloadCallSignatures = function () {
            var members = this.getMembers();
            var callSignatures = this.getCallSignatures();
            var constructSignatures = this.getConstructSignatures();
            return members.length === 0 && constructSignatures.length === 0 && callSignatures.length > 1;
        };

        PullTypeSymbol.prototype.getMemberTypeNameEx = function (topLevel, scopeSymbol, getPrettyTypeName) {
            var members = this.getMembers();
            var callSignatures = this.getCallSignatures();
            var constructSignatures = this.getConstructSignatures();
            var indexSignatures = this.getIndexSignatures();

            if (members.length > 0 || callSignatures.length > 0 || constructSignatures.length > 0 || indexSignatures.length > 0) {
                var allMemberNames = new TypeScript.MemberNameArray();
                var curlies = !topLevel || indexSignatures.length != 0;
                var delim = "; ";
                for (var i = 0; i < members.length; i++) {
                    var memberTypeName = members[i].getNameAndTypeNameEx(scopeSymbol);

                    if (memberTypeName.isArray() && (memberTypeName).delim === delim) {
                        allMemberNames.addAll((memberTypeName).entries);
                    } else {
                        allMemberNames.add(memberTypeName);
                    }
                    curlies = true;
                }

                var getPrettyFunctionOverload = getPrettyTypeName && !curlies && this.hasOnlyOverloadCallSignatures();

                var signatureCount = callSignatures.length + constructSignatures.length + indexSignatures.length;
                if (signatureCount != 0 || members.length != 0) {
                    var useShortFormSignature = !curlies && (signatureCount === 1);
                    var signatureMemberName;

                    if (callSignatures.length > 0) {
                        signatureMemberName = PullSignatureSymbol.getSignaturesTypeNameEx(callSignatures, "", useShortFormSignature, false, scopeSymbol, getPrettyFunctionOverload);
                        allMemberNames.addAll(signatureMemberName);
                    }

                    if (constructSignatures.length > 0) {
                        signatureMemberName = PullSignatureSymbol.getSignaturesTypeNameEx(constructSignatures, "new", useShortFormSignature, false, scopeSymbol);
                        allMemberNames.addAll(signatureMemberName);
                    }

                    if (indexSignatures.length > 0) {
                        signatureMemberName = PullSignatureSymbol.getSignaturesTypeNameEx(indexSignatures, "", useShortFormSignature, true, scopeSymbol);
                        allMemberNames.addAll(signatureMemberName);
                    }

                    if ((curlies) || (!getPrettyFunctionOverload && (signatureCount > 1) && topLevel)) {
                        allMemberNames.prefix = "{ ";
                        allMemberNames.suffix = "}";
                        allMemberNames.delim = delim;
                    } else if (allMemberNames.entries.length > 1) {
                        allMemberNames.delim = delim;
                    }

                    return allMemberNames;
                }
            }

            return TypeScript.MemberName.create("{}");
        };

        PullTypeSymbol.prototype.isExternallyVisible = function (inIsExternallyVisibleSymbols) {
            var isVisible = _super.prototype.isExternallyVisible.call(this, inIsExternallyVisibleSymbols);
            if (isVisible) {
                var typars = this.getTypeArguments();
                if (!typars || !typars.length) {
                    typars = this.getTypeParameters();
                }

                if (typars) {
                    for (var i = 0; i < typars.length; i++) {
                        isVisible = PullSymbol.getIsExternallyVisible(typars[i], this, inIsExternallyVisibleSymbols);
                        if (!isVisible) {
                            break;
                        }
                    }
                }
            }

            return isVisible;
        };

        PullTypeSymbol.prototype.setType = function (type) {
            TypeScript.Debug.assert(false, "tried to set type of type");
        };
        return PullTypeSymbol;
    })(PullSymbol);
    TypeScript.PullTypeSymbol = PullTypeSymbol;

    var PullPrimitiveTypeSymbol = (function (_super) {
        __extends(PullPrimitiveTypeSymbol, _super);
        function PullPrimitiveTypeSymbol(name) {
            _super.call(this, name, TypeScript.PullElementKind.Primitive);
        }
        PullPrimitiveTypeSymbol.prototype.isResolved = function () {
            return true;
        };

        PullPrimitiveTypeSymbol.prototype.isStringConstant = function () {
            return false;
        };

        PullPrimitiveTypeSymbol.prototype.isFixed = function () {
            return true;
        };

        PullPrimitiveTypeSymbol.prototype.invalidate = function () {
        };
        return PullPrimitiveTypeSymbol;
    })(PullTypeSymbol);
    TypeScript.PullPrimitiveTypeSymbol = PullPrimitiveTypeSymbol;

    var PullStringConstantTypeSymbol = (function (_super) {
        __extends(PullStringConstantTypeSymbol, _super);
        function PullStringConstantTypeSymbol(name) {
            _super.call(this, name);
        }
        PullStringConstantTypeSymbol.prototype.isStringConstant = function () {
            return true;
        };
        return PullStringConstantTypeSymbol;
    })(PullPrimitiveTypeSymbol);
    TypeScript.PullStringConstantTypeSymbol = PullStringConstantTypeSymbol;

    var PullErrorTypeSymbol = (function (_super) {
        __extends(PullErrorTypeSymbol, _super);
        function PullErrorTypeSymbol(diagnostic, delegateType) {
            _super.call(this, "error");
            this.diagnostic = diagnostic;
            this.delegateType = delegateType;
        }
        PullErrorTypeSymbol.prototype.isError = function () {
            return true;
        };

        PullErrorTypeSymbol.prototype.getDiagnostic = function () {
            return this.diagnostic;
        };

        PullErrorTypeSymbol.prototype.getName = function (scopeSymbol, useConstraintInName) {
            return this.delegateType.getName(scopeSymbol, useConstraintInName);
        };

        PullErrorTypeSymbol.prototype.getDisplayName = function (scopeSymbol, useConstraintInName) {
            return this.delegateType.getDisplayName(scopeSymbol, useConstraintInName);
        };

        PullErrorTypeSymbol.prototype.toString = function () {
            return this.delegateType.toString();
        };

        PullErrorTypeSymbol.prototype.isResolved = function () {
            return false;
        };
        return PullErrorTypeSymbol;
    })(PullPrimitiveTypeSymbol);
    TypeScript.PullErrorTypeSymbol = PullErrorTypeSymbol;

    var PullClassTypeSymbol = (function (_super) {
        __extends(PullClassTypeSymbol, _super);
        function PullClassTypeSymbol(name) {
            _super.call(this, name, TypeScript.PullElementKind.Class);
        }
        return PullClassTypeSymbol;
    })(PullTypeSymbol);
    TypeScript.PullClassTypeSymbol = PullClassTypeSymbol;

    var PullContainerTypeSymbol = (function (_super) {
        __extends(PullContainerTypeSymbol, _super);
        function PullContainerTypeSymbol(name, kind) {
            if (typeof kind === "undefined") { kind = TypeScript.PullElementKind.Container; }
            _super.call(this, name, kind);
            this.instanceSymbol = null;
            this._exportAssignedValueSymbol = null;
            this._exportAssignedTypeSymbol = null;
            this._exportAssignedContainerSymbol = null;
        }
        PullContainerTypeSymbol.prototype.isContainer = function () {
            return true;
        };

        PullContainerTypeSymbol.prototype.setInstanceSymbol = function (symbol) {
            this.instanceSymbol = symbol;
        };

        PullContainerTypeSymbol.prototype.getInstanceSymbol = function () {
            return this.instanceSymbol;
        };

        PullContainerTypeSymbol.prototype.invalidate = function () {
            if (this.instanceSymbol) {
                this.instanceSymbol.invalidate();
            }

            _super.prototype.invalidate.call(this);
        };

        PullContainerTypeSymbol.prototype.setExportAssignedValueSymbol = function (symbol) {
            this._exportAssignedValueSymbol = symbol;
        };
        PullContainerTypeSymbol.prototype.getExportAssignedValueSymbol = function () {
            return this._exportAssignedValueSymbol;
        };

        PullContainerTypeSymbol.prototype.setExportAssignedTypeSymbol = function (type) {
            this._exportAssignedTypeSymbol = type;
        };
        PullContainerTypeSymbol.prototype.getExportAssignedTypeSymbol = function () {
            return this._exportAssignedTypeSymbol;
        };

        PullContainerTypeSymbol.prototype.setExportAssignedContainerSymbol = function (container) {
            this._exportAssignedContainerSymbol = container;
        };
        PullContainerTypeSymbol.prototype.getExportAssignedContainerSymbol = function () {
            return this._exportAssignedContainerSymbol;
        };

        PullContainerTypeSymbol.prototype.resetExportAssignedSymbols = function () {
            this._exportAssignedContainerSymbol = null;
            this._exportAssignedTypeSymbol = null;
            this._exportAssignedValueSymbol = null;
        };

        PullContainerTypeSymbol.usedAsSymbol = function (containerSymbol, symbol) {
            if (!containerSymbol || !containerSymbol.isContainer()) {
                return false;
            }

            if (containerSymbol.getType() == symbol) {
                return true;
            }

            var containerTypeSymbol = containerSymbol;
            var valueExportSymbol = containerTypeSymbol.getExportAssignedValueSymbol();
            var typeExportSymbol = containerTypeSymbol.getExportAssignedTypeSymbol();
            var containerExportSymbol = containerTypeSymbol.getExportAssignedContainerSymbol();
            if (valueExportSymbol || typeExportSymbol || containerExportSymbol) {
                return valueExportSymbol == symbol || typeExportSymbol == symbol || containerExportSymbol == symbol || PullContainerTypeSymbol.usedAsSymbol(containerExportSymbol, symbol);
            }

            return false;
        };
        return PullContainerTypeSymbol;
    })(PullTypeSymbol);
    TypeScript.PullContainerTypeSymbol = PullContainerTypeSymbol;

    var PullTypeAliasSymbol = (function (_super) {
        __extends(PullTypeAliasSymbol, _super);
        function PullTypeAliasSymbol(name) {
            _super.call(this, name, TypeScript.PullElementKind.TypeAlias);
            this.typeAliasLink = null;
            this.isUsedAsValue = false;
            this.typeUsedExternally = false;
            this.retrievingExportAssignment = false;
        }
        PullTypeAliasSymbol.prototype.isAlias = function () {
            return true;
        };
        PullTypeAliasSymbol.prototype.isContainer = function () {
            return true;
        };

        PullTypeAliasSymbol.prototype.setAliasedType = function (type) {
            TypeScript.Debug.assert(!type.isError(), "Attempted to alias an error");
            if (this.typeAliasLink) {
                this.removeOutgoingLink(this.typeAliasLink);
            }

            this.typeAliasLink = this.addOutgoingLink(type, TypeScript.SymbolLinkKind.Aliases);
        };

        PullTypeAliasSymbol.prototype.getExportAssignedValueSymbol = function () {
            if (!this.typeAliasLink) {
                return null;
            }

            if (this.retrievingExportAssignment) {
                return null;
            }

            if (this.typeAliasLink.end.isContainer()) {
                this.retrievingExportAssignment = true;
                var sym = (this.typeAliasLink.end).getExportAssignedValueSymbol();
                this.retrievingExportAssignment = false;
                return sym;
            }

            return null;
        };

        PullTypeAliasSymbol.prototype.getExportAssignedTypeSymbol = function () {
            if (!this.typeAliasLink) {
                return null;
            }

            if (this.retrievingExportAssignment) {
                return null;
            }

            if (this.typeAliasLink.end.isContainer()) {
                this.retrievingExportAssignment = true;
                var sym = (this.typeAliasLink.end).getExportAssignedTypeSymbol();
                this.retrievingExportAssignment = false;
                return sym;
            }

            return null;
        };

        PullTypeAliasSymbol.prototype.getExportAssignedContainerSymbol = function () {
            if (!this.typeAliasLink) {
                return null;
            }

            if (this.retrievingExportAssignment) {
                return null;
            }

            if (this.typeAliasLink.end.isContainer()) {
                this.retrievingExportAssignment = true;
                var sym = (this.typeAliasLink.end).getExportAssignedContainerSymbol();
                this.retrievingExportAssignment = false;
                return sym;
            }

            return null;
        };

        PullTypeAliasSymbol.prototype.getType = function () {
            if (this.typeAliasLink) {
                return this.typeAliasLink.end;
            }

            return null;
        };

        PullTypeAliasSymbol.prototype.setType = function (type) {
            this.setAliasedType(type);
        };

        PullTypeAliasSymbol.prototype.setIsUsedAsValue = function () {
            this.isUsedAsValue = true;
        };

        PullTypeAliasSymbol.prototype.getIsUsedAsValue = function () {
            return this.isUsedAsValue;
        };

        PullTypeAliasSymbol.prototype.setIsTypeUsedExternally = function () {
            this.typeUsedExternally = true;
        };

        PullTypeAliasSymbol.prototype.getTypeUsedExternally = function () {
            return this.typeUsedExternally;
        };

        PullTypeAliasSymbol.prototype.getMembers = function () {
            if (this.typeAliasLink) {
                return (this.typeAliasLink.end).getMembers();
            }

            return [];
        };

        PullTypeAliasSymbol.prototype.getCallSignatures = function () {
            if (this.typeAliasLink) {
                return (this.typeAliasLink.end).getCallSignatures();
            }

            return [];
        };

        PullTypeAliasSymbol.prototype.getConstructSignatures = function () {
            if (this.typeAliasLink) {
                return (this.typeAliasLink.end).getConstructSignatures();
            }

            return [];
        };

        PullTypeAliasSymbol.prototype.getIndexSignatures = function () {
            if (this.typeAliasLink) {
                return (this.typeAliasLink.end).getIndexSignatures();
            }

            return [];
        };

        PullTypeAliasSymbol.prototype.findMember = function (name) {
            if (this.typeAliasLink) {
                return (this.typeAliasLink.end).findMember(name);
            }

            return null;
        };

        PullTypeAliasSymbol.prototype.findNestedType = function (name) {
            if (this.typeAliasLink) {
                return (this.typeAliasLink.end).findNestedType(name);
            }

            return null;
        };

        PullTypeAliasSymbol.prototype.getAllMembers = function (searchDeclKind, includePrivate) {
            if (this.typeAliasLink) {
                return (this.typeAliasLink.end).getAllMembers(searchDeclKind, includePrivate);
            }

            return [];
        };

        PullTypeAliasSymbol.prototype.invalidate = function () {
            this.isUsedAsValue = false;

            _super.prototype.invalidate.call(this);
        };
        return PullTypeAliasSymbol;
    })(PullTypeSymbol);
    TypeScript.PullTypeAliasSymbol = PullTypeAliasSymbol;

    var PullDefinitionSignatureSymbol = (function (_super) {
        __extends(PullDefinitionSignatureSymbol, _super);
        function PullDefinitionSignatureSymbol() {
            _super.apply(this, arguments);
        }
        PullDefinitionSignatureSymbol.prototype.isDefinition = function () {
            return true;
        };
        return PullDefinitionSignatureSymbol;
    })(PullSignatureSymbol);
    TypeScript.PullDefinitionSignatureSymbol = PullDefinitionSignatureSymbol;

    var PullFunctionTypeSymbol = (function (_super) {
        __extends(PullFunctionTypeSymbol, _super);
        function PullFunctionTypeSymbol() {
            _super.call(this, "", TypeScript.PullElementKind.FunctionType);
            this.definitionSignature = null;
        }
        PullFunctionTypeSymbol.prototype.isFunction = function () {
            return true;
        };

        PullFunctionTypeSymbol.prototype.invalidate = function () {
            var callSignatures = this.getCallSignatures();

            if (callSignatures.length) {
                for (var i = 0; i < callSignatures.length; i++) {
                    callSignatures[i].invalidate();
                }
            }

            this.definitionSignature = null;

            _super.prototype.invalidate.call(this);
        };

        PullFunctionTypeSymbol.prototype.addSignature = function (signature) {
            this.addCallSignature(signature);

            if (signature.isDefinition()) {
                this.definitionSignature = signature;
            }
        };

        PullFunctionTypeSymbol.prototype.getDefinitionSignature = function () {
            return this.definitionSignature;
        };
        return PullFunctionTypeSymbol;
    })(PullTypeSymbol);
    TypeScript.PullFunctionTypeSymbol = PullFunctionTypeSymbol;

    var PullConstructorTypeSymbol = (function (_super) {
        __extends(PullConstructorTypeSymbol, _super);
        function PullConstructorTypeSymbol() {
            _super.call(this, "", TypeScript.PullElementKind.ConstructorType);
            this.definitionSignature = null;
        }
        PullConstructorTypeSymbol.prototype.isFunction = function () {
            return true;
        };
        PullConstructorTypeSymbol.prototype.isConstructor = function () {
            return true;
        };

        PullConstructorTypeSymbol.prototype.invalidate = function () {
            this.definitionSignature = null;

            _super.prototype.invalidate.call(this);
        };

        PullConstructorTypeSymbol.prototype.addSignature = function (signature) {
            this.addConstructSignature(signature);

            if (signature.isDefinition()) {
                this.definitionSignature = signature;
            }
        };

        PullConstructorTypeSymbol.prototype.addTypeParameter = function (typeParameter, doNotChangeContainer) {
            this.addMember(typeParameter, TypeScript.SymbolLinkKind.TypeParameter, doNotChangeContainer);

            var constructSignatures = this.getConstructSignatures();

            for (var i = 0; i < constructSignatures.length; i++) {
                constructSignatures[i].addTypeParameter(typeParameter);
            }
        };

        PullConstructorTypeSymbol.prototype.getDefinitionSignature = function () {
            return this.definitionSignature;
        };
        return PullConstructorTypeSymbol;
    })(PullTypeSymbol);
    TypeScript.PullConstructorTypeSymbol = PullConstructorTypeSymbol;

    var PullTypeParameterSymbol = (function (_super) {
        __extends(PullTypeParameterSymbol, _super);
        function PullTypeParameterSymbol(name, _isFunctionTypeParameter) {
            _super.call(this, name, TypeScript.PullElementKind.TypeParameter);
            this._isFunctionTypeParameter = _isFunctionTypeParameter;
            this.constraintLink = null;
        }
        PullTypeParameterSymbol.prototype.isTypeParameter = function () {
            return true;
        };
        PullTypeParameterSymbol.prototype.isFunctionTypeParameter = function () {
            return this._isFunctionTypeParameter;
        };

        PullTypeParameterSymbol.prototype.isFixed = function () {
            return false;
        };

        PullTypeParameterSymbol.prototype.setConstraint = function (constraintType) {
            if (this.constraintLink) {
                this.removeOutgoingLink(this.constraintLink);
            }

            this.constraintLink = this.addOutgoingLink(constraintType, TypeScript.SymbolLinkKind.TypeConstraint);
        };

        PullTypeParameterSymbol.prototype.getConstraint = function () {
            if (this.constraintLink) {
                return this.constraintLink.end;
            }

            return null;
        };

        PullTypeParameterSymbol.prototype.isGeneric = function () {
            return true;
        };

        PullTypeParameterSymbol.prototype.fullName = function (scopeSymbol) {
            var name = this.getDisplayName(scopeSymbol);
            var container = this.getContainer();
            if (container) {
                var containerName = container.fullName(scopeSymbol);
                name = name + " in " + containerName;
            }

            return name;
        };

        PullTypeParameterSymbol.prototype.getName = function (scopeSymbol, useConstraintInName) {
            var name = _super.prototype.getName.call(this, scopeSymbol);

            if (this.isPrinting) {
                return name;
            }

            this.isPrinting = true;

            if (useConstraintInName && this.constraintLink) {
                name += " extends " + this.constraintLink.end.toString();
            }

            this.isPrinting = false;

            return name;
        };

        PullTypeParameterSymbol.prototype.getDisplayName = function (scopeSymbol, useConstraintInName) {
            var name = _super.prototype.getDisplayName.call(this, scopeSymbol, useConstraintInName);

            if (this.isPrinting) {
                return name;
            }

            this.isPrinting = true;

            if (useConstraintInName && this.constraintLink) {
                name += " extends " + this.constraintLink.end.toString();
            }

            this.isPrinting = false;

            return name;
        };

        PullTypeParameterSymbol.prototype.isExternallyVisible = function (inIsExternallyVisibleSymbols) {
            var constraint = this.getConstraint();
            if (constraint) {
                return PullSymbol.getIsExternallyVisible(constraint, this, inIsExternallyVisibleSymbols);
            }

            return true;
        };
        return PullTypeParameterSymbol;
    })(PullTypeSymbol);
    TypeScript.PullTypeParameterSymbol = PullTypeParameterSymbol;

    var PullTypeVariableSymbol = (function (_super) {
        __extends(PullTypeVariableSymbol, _super);
        function PullTypeVariableSymbol(name, isFunctionTypeParameter) {
            _super.call(this, name, isFunctionTypeParameter);
            this.tyvarID = TypeScript.globalTyvarID++;
        }
        PullTypeVariableSymbol.prototype.isTypeParameter = function () {
            return true;
        };
        PullTypeVariableSymbol.prototype.isTypeVariable = function () {
            return true;
        };
        return PullTypeVariableSymbol;
    })(PullTypeParameterSymbol);
    TypeScript.PullTypeVariableSymbol = PullTypeVariableSymbol;

    var PullAccessorSymbol = (function (_super) {
        __extends(PullAccessorSymbol, _super);
        function PullAccessorSymbol(name) {
            _super.call(this, name, TypeScript.PullElementKind.Property);
            this.getterSymbolLink = null;
            this.setterSymbolLink = null;
        }
        PullAccessorSymbol.prototype.isAccessor = function () {
            return true;
        };

        PullAccessorSymbol.prototype.setSetter = function (setter) {
            this.setterSymbolLink = this.addOutgoingLink(setter, TypeScript.SymbolLinkKind.SetterFunction);
        };

        PullAccessorSymbol.prototype.getSetter = function () {
            var setter = null;

            if (this.setterSymbolLink) {
                setter = this.setterSymbolLink.end;
            }

            return setter;
        };

        PullAccessorSymbol.prototype.removeSetter = function () {
            if (this.setterSymbolLink) {
                this.removeOutgoingLink(this.setterSymbolLink);
            }
        };

        PullAccessorSymbol.prototype.setGetter = function (getter) {
            this.getterSymbolLink = this.addOutgoingLink(getter, TypeScript.SymbolLinkKind.GetterFunction);
        };

        PullAccessorSymbol.prototype.getGetter = function () {
            var getter = null;

            if (this.getterSymbolLink) {
                getter = this.getterSymbolLink.end;
            }

            return getter;
        };

        PullAccessorSymbol.prototype.removeGetter = function () {
            if (this.getterSymbolLink) {
                this.removeOutgoingLink(this.getterSymbolLink);
            }
        };

        PullAccessorSymbol.prototype.invalidate = function () {
            if (this.getterSymbolLink) {
                this.getterSymbolLink.end.invalidate();
            }

            if (this.setterSymbolLink) {
                this.setterSymbolLink.end.invalidate();
            }

            _super.prototype.invalidate.call(this);
        };
        return PullAccessorSymbol;
    })(PullSymbol);
    TypeScript.PullAccessorSymbol = PullAccessorSymbol;

    var PullArrayTypeSymbol = (function (_super) {
        __extends(PullArrayTypeSymbol, _super);
        function PullArrayTypeSymbol() {
            _super.call(this, "Array", TypeScript.PullElementKind.Array);
            this.elementType = null;
        }
        PullArrayTypeSymbol.prototype.isArray = function () {
            return true;
        };
        PullArrayTypeSymbol.prototype.getElementType = function () {
            return this.elementType;
        };
        PullArrayTypeSymbol.prototype.isGeneric = function () {
            return true;
        };

        PullArrayTypeSymbol.prototype.setElementType = function (type) {
            this.elementType = type;
        };

        PullArrayTypeSymbol.prototype.getScopedNameEx = function (scopeSymbol, useConstraintInName, getPrettyTypeName, getTypeParamMarkerInfo) {
            var elementMemberName = this.elementType ? (this.elementType.isArray() || this.elementType.isNamedTypeSymbol() ? this.elementType.getScopedNameEx(scopeSymbol, false, getPrettyTypeName, getTypeParamMarkerInfo) : this.elementType.getMemberTypeNameEx(false, scopeSymbol, getPrettyTypeName)) : TypeScript.MemberName.create("any");
            return TypeScript.MemberName.create(elementMemberName, "", "[]");
        };

        PullArrayTypeSymbol.prototype.getMemberTypeNameEx = function (topLevel, scopeSymbol, getPrettyTypeName) {
            var elementMemberName = this.elementType ? this.elementType.getMemberTypeNameEx(false, scopeSymbol, getPrettyTypeName) : TypeScript.MemberName.create("any");
            return TypeScript.MemberName.create(elementMemberName, "", "[]");
        };
        return PullArrayTypeSymbol;
    })(PullTypeSymbol);
    TypeScript.PullArrayTypeSymbol = PullArrayTypeSymbol;

    function specializeToArrayType(typeToReplace, typeToSpecializeTo, resolver, context) {
        var arrayInterfaceType = resolver.getCachedArrayType();

        if (!arrayInterfaceType || (arrayInterfaceType.getKind() & TypeScript.PullElementKind.Interface) === 0) {
            return null;
        }

        if (arrayInterfaceType.isGeneric()) {
            var enclosingDecl = arrayInterfaceType.getDeclarations()[0];
            return specializeType(arrayInterfaceType, [typeToSpecializeTo], resolver, enclosingDecl, context);
        }

        if (typeToSpecializeTo.getArrayType()) {
            return typeToSpecializeTo.getArrayType();
        }

        var newArrayType = new PullArrayTypeSymbol();
        newArrayType.addDeclaration(arrayInterfaceType.getDeclarations()[0]);

        typeToSpecializeTo.setArrayType(newArrayType);
        newArrayType.addOutgoingLink(typeToSpecializeTo, TypeScript.SymbolLinkKind.ArrayOf);

        var field = null;
        var newField = null;
        var fieldType = null;

        var method = null;
        var methodType = null;
        var newMethod = null;
        var newMethodType = null;

        var signatures = null;
        var newSignature = null;

        var parameters = null;
        var newParameter = null;
        var parameterType = null;

        var returnType = null;
        var newReturnType = null;

        var members = arrayInterfaceType.getMembers();

        for (var i = 0; i < members.length; i++) {
            resolver.resolveDeclaredSymbol(members[i], null, context);

            if (members[i].getKind() === TypeScript.PullElementKind.Method) {
                method = members[i];

                resolver.resolveDeclaredSymbol(method, null, context);

                methodType = method.getType();

                newMethod = new PullSymbol(method.getName(), TypeScript.PullElementKind.Method);
                newMethodType = new PullFunctionTypeSymbol();
                newMethod.setType(newMethodType);

                newMethod.addDeclaration(method.getDeclarations()[0]);

                signatures = methodType.getCallSignatures();

                for (var j = 0; j < signatures.length; j++) {
                    newSignature = new PullSignatureSymbol(TypeScript.PullElementKind.CallSignature);
                    newSignature.addDeclaration(signatures[j].getDeclarations()[0]);

                    parameters = signatures[j].getParameters();
                    returnType = signatures[j].getReturnType();

                    if (returnType === typeToReplace) {
                        newSignature.setReturnType(typeToSpecializeTo);
                    } else {
                        newSignature.setReturnType(returnType);
                    }

                    for (var k = 0; k < parameters.length; k++) {
                        newParameter = new PullSymbol(parameters[k].getName(), parameters[k].getKind());

                        parameterType = parameters[k].getType();

                        if (parameterType === null) {
                            continue;
                        }

                        if (parameterType === typeToReplace) {
                            newParameter.setType(typeToSpecializeTo);
                        } else {
                            newParameter.setType(parameterType);
                        }

                        newSignature.addParameter(newParameter);
                    }

                    newMethodType.addSignature(newSignature);
                }

                newArrayType.addMember(newMethod, TypeScript.SymbolLinkKind.PublicMember);
            } else {
                field = members[i];

                newField = new PullSymbol(field.getName(), field.getKind());
                newField.addDeclaration(field.getDeclarations()[0]);

                fieldType = field.getType();

                if (fieldType === typeToReplace) {
                    newField.setType(typeToSpecializeTo);
                } else {
                    newField.setType(fieldType);
                }

                newArrayType.addMember(newField, TypeScript.SymbolLinkKind.PublicMember);
            }
        }
        newArrayType.addOutgoingLink(arrayInterfaceType, TypeScript.SymbolLinkKind.ArrayType);
        return newArrayType;
    }
    TypeScript.specializeToArrayType = specializeToArrayType;

    function typeWrapsTypeParameter(type, typeParameter) {
        if (type.isTypeParameter()) {
            return type == typeParameter;
        }

        var typeArguments = type.getTypeArguments();

        if (typeArguments) {
            for (var i = 0; i < typeArguments.length; i++) {
                if (typeWrapsTypeParameter(typeArguments[i], typeParameter)) {
                    return true;
                }
            }
        }

        return false;
    }
    TypeScript.typeWrapsTypeParameter = typeWrapsTypeParameter;

    function getRootType(typeToSpecialize) {
        var decl = typeToSpecialize.getDeclarations()[0];

        if (!typeToSpecialize.isGeneric()) {
            return typeToSpecialize;
        }

        return (typeToSpecialize.getKind() & (TypeScript.PullElementKind.Class | TypeScript.PullElementKind.Interface)) ? decl.getSymbol().getType() : typeToSpecialize;
    }
    TypeScript.getRootType = getRootType;

    TypeScript.nSpecializationsCreated = 0;
    TypeScript.nSpecializedSignaturesCreated = 0;

    function shouldSpecializeTypeParameterForTypeParameter(specialization, typeToSpecialize) {
        if (specialization == typeToSpecialize) {
            return false;
        }

        if (!(specialization.isTypeParameter() && typeToSpecialize.isTypeParameter())) {
            return true;
        }

        var parent = specialization.getDeclarations()[0].getParentDecl();
        var targetParent = typeToSpecialize.getDeclarations()[0].getParentDecl();

        if (parent == targetParent) {
            return true;
        }

        while (parent) {
            if (parent.getFlags() & TypeScript.PullElementFlags.Static) {
                return true;
            }

            if (parent == targetParent) {
                return false;
            }

            parent = parent.getParentDecl();
        }

        return true;
    }
    TypeScript.shouldSpecializeTypeParameterForTypeParameter = shouldSpecializeTypeParameterForTypeParameter;

    function specializeType(typeToSpecialize, typeArguments, resolver, enclosingDecl, context, ast) {
        if (typeToSpecialize.isPrimitive() || !typeToSpecialize.isGeneric()) {
            return typeToSpecialize;
        }

        var searchForExistingSpecialization = typeArguments != null;

        if (typeArguments === null || (context.specializingToAny && typeArguments.length)) {
            typeArguments = [];
        }

        if (typeToSpecialize.isTypeParameter()) {
            if (context.specializingToAny) {
                return resolver.semanticInfoChain.anyTypeSymbol;
            }

            var substitution = context.findSpecializationForType(typeToSpecialize);

            if (substitution != typeToSpecialize) {
                if (shouldSpecializeTypeParameterForTypeParameter(substitution, typeToSpecialize)) {
                    return substitution;
                }
            }

            if (typeArguments && typeArguments.length) {
                if (shouldSpecializeTypeParameterForTypeParameter(typeArguments[0], typeToSpecialize)) {
                    return typeArguments[0];
                }
            }

            return typeToSpecialize;
        }

        if (typeToSpecialize.isArray()) {
            if (typeToSpecialize.currentlyBeingSpecialized()) {
                return typeToSpecialize;
            }

            var newElementType = null;

            if (!context.specializingToAny) {
                var elementType = (typeToSpecialize).getElementType();

                newElementType = specializeType(elementType, typeArguments, resolver, enclosingDecl, context, ast);
            } else {
                newElementType = resolver.semanticInfoChain.anyTypeSymbol;
            }

            var newArrayType = specializeType(resolver.getCachedArrayType(), [newElementType], resolver, enclosingDecl, context);

            return newArrayType;
        }

        var typeParameters = typeToSpecialize.getTypeParameters();

        if (!context.specializingToAny && searchForExistingSpecialization && (typeParameters.length > typeArguments.length)) {
            searchForExistingSpecialization = false;
        }

        var newType = null;

        var newTypeDecl = typeToSpecialize.getDeclarations()[0];

        var rootType = getRootType(typeToSpecialize);

        var isArray = typeToSpecialize === resolver.getCachedArrayType() || typeToSpecialize.isArray();

        if (searchForExistingSpecialization || context.specializingToAny) {
            if (!typeArguments.length || context.specializingToAny) {
                for (var i = 0; i < typeParameters.length; i++) {
                    typeArguments[typeArguments.length] = resolver.semanticInfoChain.anyTypeSymbol;
                }
            }

            if (isArray) {
                newType = typeArguments[0].getArrayType();
            } else if (typeArguments.length) {
                newType = rootType.getSpecialization(typeArguments);
            }

            if (!newType && !typeParameters.length && context.specializingToAny) {
                newType = rootType.getSpecialization([resolver.semanticInfoChain.anyTypeSymbol]);
            }

            for (var i = 0; i < typeArguments.length; i++) {
                if (!typeArguments[i].isTypeParameter() && (typeArguments[i] == rootType || typeWrapsTypeParameter(typeArguments[i], typeParameters[i]))) {
                    declAST = resolver.semanticInfoChain.getASTForDecl(newTypeDecl);
                    if (declAST) {
                        diagnostic = context.postError(enclosingDecl.getScriptName(), declAST.minChar, declAST.getLength(), TypeScript.DiagnosticCode.A_generic_type_may_not_reference_itself_with_its_own_type_parameters, null, enclosingDecl, true);
                        return resolver.getNewErrorTypeSymbol(diagnostic);
                    } else {
                        return resolver.semanticInfoChain.anyTypeSymbol;
                    }
                }
            }
        } else {
            var knownTypeArguments = typeToSpecialize.getTypeArguments();
            var typesToReplace = knownTypeArguments ? knownTypeArguments : typeParameters;
            var diagnostic;
            var declAST;

            for (var i = 0; i < typesToReplace.length; i++) {
                if (!typesToReplace[i].isTypeParameter() && (typeArguments[i] == rootType || typeWrapsTypeParameter(typesToReplace[i], typeParameters[i]))) {
                    declAST = resolver.semanticInfoChain.getASTForDecl(newTypeDecl);
                    if (declAST) {
                        diagnostic = context.postError(enclosingDecl.getScriptName(), declAST.minChar, declAST.getLength(), TypeScript.DiagnosticCode.A_generic_type_may_not_reference_itself_with_its_own_type_parameters, null, enclosingDecl, true);
                        return resolver.getNewErrorTypeSymbol(diagnostic);
                    } else {
                        return resolver.semanticInfoChain.anyTypeSymbol;
                    }
                }

                substitution = specializeType(typesToReplace[i], null, resolver, enclosingDecl, context, ast);

                typeArguments[i] = substitution != null ? substitution : typesToReplace[i];
            }

            newType = rootType.getSpecialization(typeArguments);
        }

        var rootTypeParameters = rootType.getTypeParameters();

        if (rootTypeParameters.length && (rootTypeParameters.length == typeArguments.length)) {
            for (var i = 0; i < typeArguments.length; i++) {
                if (typeArguments[i] != rootTypeParameters[i]) {
                    break;
                }
            }

            if (i == rootTypeParameters.length) {
                return rootType;
            }
        }

        if (newType) {
            if (!newType.isResolved() && !newType.currentlyBeingSpecialized()) {
                typeToSpecialize.invalidateSpecializations();
            } else {
                return newType;
            }
        }

        var prevInSpecialization = context.inSpecialization;
        context.inSpecialization = true;

        TypeScript.nSpecializationsCreated++;

        newType = typeToSpecialize.isClass() ? new PullClassTypeSymbol(typeToSpecialize.getName()) : isArray ? new PullArrayTypeSymbol() : typeToSpecialize.isTypeParameter() ? new PullTypeVariableSymbol(typeToSpecialize.getName(), (typeToSpecialize).isFunctionTypeParameter()) : new PullTypeSymbol(typeToSpecialize.getName(), typeToSpecialize.getKind());
        newType.setRootSymbol(rootType);

        newType.setIsBeingSpecialized();

        newType.setTypeArguments(typeArguments);

        rootType.addSpecialization(newType, typeArguments);

        if (isArray) {
            (newType).setElementType(typeArguments[0]);
            typeArguments[0].setArrayType(newType);
        }

        if (typeToSpecialize.currentlyBeingSpecialized()) {
            return newType;
        }

        var prevCurrentlyBeingSpecialized = typeToSpecialize.currentlyBeingSpecialized();
        if (typeToSpecialize.getKind() == TypeScript.PullElementKind.ConstructorType) {
            typeToSpecialize.setIsBeingSpecialized();
        }

        var typeReplacementMap = {};

        for (var i = 0; i < typeParameters.length; i++) {
            if (typeParameters[i] != typeArguments[i]) {
                typeReplacementMap[typeParameters[i].getSymbolID().toString()] = typeArguments[i];
            }
            newType.addMember(typeParameters[i], TypeScript.SymbolLinkKind.TypeParameter, true);
        }

        var extendedTypesToSpecialize = typeToSpecialize.getExtendedTypes();
        var typeDecl;
        var typeAST;
        var unitPath;
        var decls = typeToSpecialize.getDeclarations();

        if (extendedTypesToSpecialize.length) {
            for (var i = 0; i < decls.length; i++) {
                typeDecl = decls[i];
                typeAST = resolver.semanticInfoChain.getASTForDecl(typeDecl);

                if (typeAST.extendsList) {
                    unitPath = resolver.getUnitPath();
                    resolver.setUnitPath(typeDecl.getScriptName());
                    context.pushTypeSpecializationCache(typeReplacementMap);
                    var extendTypeSymbol = resolver.resolveTypeReference(new TypeScript.TypeReference(typeAST.extendsList.members[0], 0), typeDecl, context).symbol;
                    resolver.setUnitPath(unitPath);
                    context.popTypeSpecializationCache();

                    newType.addExtendedType(extendTypeSymbol);
                }
            }
        }

        var implementedTypesToSpecialize = typeToSpecialize.getImplementedTypes();

        if (implementedTypesToSpecialize.length) {
            for (var i = 0; i < decls.length; i++) {
                typeDecl = decls[i];
                typeAST = resolver.semanticInfoChain.getASTForDecl(typeDecl);

                if (typeAST.implementsList) {
                    unitPath = resolver.getUnitPath();
                    resolver.setUnitPath(typeDecl.getScriptName());
                    context.pushTypeSpecializationCache(typeReplacementMap);
                    var implementedTypeSymbol = resolver.resolveTypeReference(new TypeScript.TypeReference(typeAST.implementsList.members[0], 0), typeDecl, context).symbol;
                    resolver.setUnitPath(unitPath);
                    context.popTypeSpecializationCache();

                    newType.addImplementedType(implementedTypeSymbol);
                }
            }
        }

        var callSignatures = typeToSpecialize.getCallSignatures();
        var constructSignatures = typeToSpecialize.getConstructSignatures();
        var indexSignatures = typeToSpecialize.getIndexSignatures();
        var members = typeToSpecialize.getMembers();

        var newSignature;
        var signature;

        var decl = null;
        var declAST = null;
        var parameters;
        var newParameters;
        var returnType = null;
        var prevSpecializationSignature = null;

        for (var i = 0; i < callSignatures.length; i++) {
            signature = callSignatures[i];

            if (!signature.currentlyBeingSpecialized()) {
                context.pushTypeSpecializationCache(typeReplacementMap);

                decl = signature.getDeclarations()[0];
                unitPath = resolver.getUnitPath();
                resolver.setUnitPath(decl.getScriptName());

                newSignature = new PullSignatureSymbol(signature.getKind());
                TypeScript.nSpecializedSignaturesCreated++;
                newSignature.mimicSignature(signature, resolver);
                declAST = resolver.semanticInfoChain.getASTForDecl(decl);

                TypeScript.Debug.assert(declAST != null, "Call signature for type '" + typeToSpecialize.toString() + "' could not be specialized because of a stale declaration");

                prevSpecializationSignature = decl.getSpecializingSignatureSymbol();
                decl.setSpecializingSignatureSymbol(newSignature);
                resolver.resolveAST(declAST, false, newTypeDecl, context);
                decl.setSpecializingSignatureSymbol(prevSpecializationSignature);

                parameters = signature.getParameters();
                newParameters = newSignature.getParameters();

                for (var p = 0; p < parameters.length; p++) {
                    newParameters[p].setType(parameters[p].getType());
                }
                newSignature.setResolved();

                resolver.setUnitPath(unitPath);

                returnType = newSignature.getReturnType();

                if (!returnType) {
                    newSignature.setReturnType(signature.getReturnType());
                }

                signature.setIsBeingSpecialized();
                newSignature.setRootSymbol(signature);
                newSignature = specializeSignature(newSignature, true, typeReplacementMap, null, resolver, newTypeDecl, context);
                signature.setIsSpecialized();

                context.popTypeSpecializationCache();

                if (!newSignature) {
                    context.inSpecialization = prevInSpecialization;
                    typeToSpecialize.setValueIsBeingSpecialized(prevCurrentlyBeingSpecialized);
                    TypeScript.Debug.assert(false, "returning from call");
                    return resolver.semanticInfoChain.anyTypeSymbol;
                }
            } else {
                newSignature = signature;
            }

            newType.addCallSignature(newSignature);

            if (newSignature.hasGenericParameter()) {
                newType.setHasGenericSignature();
            }
        }

        for (var i = 0; i < constructSignatures.length; i++) {
            signature = constructSignatures[i];

            if (!signature.currentlyBeingSpecialized()) {
                context.pushTypeSpecializationCache(typeReplacementMap);

                decl = signature.getDeclarations()[0];
                unitPath = resolver.getUnitPath();
                resolver.setUnitPath(decl.getScriptName());

                newSignature = new PullSignatureSymbol(signature.getKind());
                TypeScript.nSpecializedSignaturesCreated++;
                newSignature.mimicSignature(signature, resolver);
                declAST = resolver.semanticInfoChain.getASTForDecl(decl);

                TypeScript.Debug.assert(declAST != null, "Construct signature for type '" + typeToSpecialize.toString() + "' could not be specialized because of a stale declaration");

                prevSpecializationSignature = decl.getSpecializingSignatureSymbol();
                decl.setSpecializingSignatureSymbol(newSignature);
                resolver.resolveAST(declAST, false, newTypeDecl, context);
                decl.setSpecializingSignatureSymbol(prevSpecializationSignature);

                parameters = signature.getParameters();
                newParameters = newSignature.getParameters();

                for (var p = 0; p < parameters.length; p++) {
                    newParameters[p].setType(parameters[p].getType());
                }
                newSignature.setResolved();

                resolver.setUnitPath(unitPath);

                returnType = newSignature.getReturnType();

                if (!returnType) {
                    newSignature.setReturnType(signature.getReturnType());
                }

                signature.setIsBeingSpecialized();
                newSignature.setRootSymbol(signature);
                newSignature = specializeSignature(newSignature, true, typeReplacementMap, null, resolver, newTypeDecl, context);
                signature.setIsSpecialized();

                context.popTypeSpecializationCache();

                if (!newSignature) {
                    context.inSpecialization = prevInSpecialization;
                    typeToSpecialize.setValueIsBeingSpecialized(prevCurrentlyBeingSpecialized);
                    TypeScript.Debug.assert(false, "returning from construct");
                    return resolver.semanticInfoChain.anyTypeSymbol;
                }
            } else {
                newSignature = signature;
            }

            newType.addConstructSignature(newSignature);

            if (newSignature.hasGenericParameter()) {
                newType.setHasGenericSignature();
            }
        }

        for (var i = 0; i < indexSignatures.length; i++) {
            signature = indexSignatures[i];

            if (!signature.currentlyBeingSpecialized()) {
                context.pushTypeSpecializationCache(typeReplacementMap);

                decl = signature.getDeclarations()[0];
                unitPath = resolver.getUnitPath();
                resolver.setUnitPath(decl.getScriptName());

                newSignature = new PullSignatureSymbol(signature.getKind());
                TypeScript.nSpecializedSignaturesCreated++;
                newSignature.mimicSignature(signature, resolver);
                declAST = resolver.semanticInfoChain.getASTForDecl(decl);

                TypeScript.Debug.assert(declAST != null, "Index signature for type '" + typeToSpecialize.toString() + "' could not be specialized because of a stale declaration");

                prevSpecializationSignature = decl.getSpecializingSignatureSymbol();
                decl.setSpecializingSignatureSymbol(newSignature);
                resolver.resolveAST(declAST, false, newTypeDecl, context);
                decl.setSpecializingSignatureSymbol(prevSpecializationSignature);

                parameters = signature.getParameters();
                newParameters = newSignature.getParameters();

                for (var p = 0; p < parameters.length; p++) {
                    newParameters[p].setType(parameters[p].getType());
                }
                newSignature.setResolved();

                resolver.setUnitPath(unitPath);

                returnType = newSignature.getReturnType();

                if (!returnType) {
                    newSignature.setReturnType(signature.getReturnType());
                }

                signature.setIsBeingSpecialized();
                newSignature.setRootSymbol(signature);
                newSignature = specializeSignature(newSignature, true, typeReplacementMap, null, resolver, newTypeDecl, context);
                signature.setIsSpecialized();

                context.popTypeSpecializationCache();

                if (!newSignature) {
                    context.inSpecialization = prevInSpecialization;
                    typeToSpecialize.setValueIsBeingSpecialized(prevCurrentlyBeingSpecialized);
                    TypeScript.Debug.assert(false, "returning from index");
                    return resolver.semanticInfoChain.anyTypeSymbol;
                }
            } else {
                newSignature = signature;
            }

            newType.addIndexSignature(newSignature);

            if (newSignature.hasGenericParameter()) {
                newType.setHasGenericSignature();
            }
        }

        var field = null;
        var newField = null;

        var fieldType = null;
        var newFieldType = null;
        var replacementType = null;

        var fieldSignatureSymbol = null;

        for (var i = 0; i < members.length; i++) {
            field = members[i];
            field.setIsBeingSpecialized();

            decls = field.getDeclarations();

            newField = new PullSymbol(field.getName(), field.getKind());

            newField.setRootSymbol(field);

            if (field.getIsOptional()) {
                newField.setIsOptional();
            }

            if (!field.isResolved()) {
                resolver.resolveDeclaredSymbol(field, newTypeDecl, context);
            }

            fieldType = field.getType();

            if (!fieldType) {
                fieldType = newType;
            }

            replacementType = typeReplacementMap[fieldType.getSymbolID().toString()];

            if (replacementType) {
                newField.setType(replacementType);
            } else {
                if (fieldType.isGeneric() && !fieldType.isFixed()) {
                    unitPath = resolver.getUnitPath();
                    resolver.setUnitPath(decls[0].getScriptName());

                    context.pushTypeSpecializationCache(typeReplacementMap);

                    newFieldType = specializeType(fieldType, !fieldType.getIsSpecialized() ? typeArguments : null, resolver, newTypeDecl, context, ast);

                    resolver.setUnitPath(unitPath);

                    context.popTypeSpecializationCache();

                    newField.setType(newFieldType);
                } else {
                    newField.setType(fieldType);
                }
            }
            field.setIsSpecialized();
            newType.addMember(newField, (field.hasFlag(TypeScript.PullElementFlags.Private)) ? TypeScript.SymbolLinkKind.PrivateMember : TypeScript.SymbolLinkKind.PublicMember);
        }

        if (typeToSpecialize.isClass()) {
            var constructorMethod = (typeToSpecialize).getConstructorMethod();

            if (!constructorMethod.isResolved()) {
                var prevIsSpecializingConstructorMethod = context.isSpecializingConstructorMethod;
                context.isSpecializingConstructorMethod = true;
                resolver.resolveDeclaredSymbol(constructorMethod, enclosingDecl, context);
                context.isSpecializingConstructorMethod = prevIsSpecializingConstructorMethod;
            }

            var newConstructorMethod = new PullSymbol(constructorMethod.getName(), TypeScript.PullElementKind.ConstructorMethod);
            var newConstructorType = specializeType(constructorMethod.getType(), typeArguments, resolver, newTypeDecl, context, ast);

            newConstructorMethod.setType(newConstructorType);

            var constructorDecls = constructorMethod.getDeclarations();

            newConstructorMethod.setRootSymbol(constructorMethod);

            (newType).setConstructorMethod(newConstructorMethod);
        }

        newType.setIsSpecialized();

        newType.setResolved();
        typeToSpecialize.setValueIsBeingSpecialized(prevCurrentlyBeingSpecialized);
        context.inSpecialization = prevInSpecialization;
        return newType;
    }
    TypeScript.specializeType = specializeType;

    function specializeSignature(signature, skipLocalTypeParameters, typeReplacementMap, typeArguments, resolver, enclosingDecl, context, ast) {
        if (signature.currentlyBeingSpecialized()) {
            return signature;
        }

        if (!signature.isResolved() && !signature.isResolving()) {
            resolver.resolveDeclaredSymbol(signature, enclosingDecl, context);
        }

        var newSignature = signature.getSpecialization(typeArguments);

        if (newSignature) {
            return newSignature;
        }

        signature.setIsBeingSpecialized();

        var prevInSpecialization = context.inSpecialization;
        context.inSpecialization = true;

        newSignature = new PullSignatureSymbol(signature.getKind());
        TypeScript.nSpecializedSignaturesCreated++;
        newSignature.setRootSymbol(signature);

        if (signature.hasVariableParamList()) {
            newSignature.setHasVariableParamList();
        }

        if (signature.hasGenericParameter()) {
            newSignature.setHasGenericParameter();
        }

        signature.addSpecialization(newSignature, typeArguments);

        var parameters = signature.getParameters();
        var typeParameters = signature.getTypeParameters();
        var returnType = signature.getReturnType();

        for (var i = 0; i < typeParameters.length; i++) {
            newSignature.addTypeParameter(typeParameters[i]);
        }

        if (signature.hasGenericParameter()) {
            newSignature.setHasGenericParameter();
        }

        var newParameter;
        var newParameterType;
        var newParameterElementType;
        var parameterType;
        var replacementParameterType;
        var localTypeParameters = new TypeScript.BlockIntrinsics();
        var localSkipMap = null;

        if (skipLocalTypeParameters) {
            for (var i = 0; i < typeParameters.length; i++) {
                localTypeParameters[typeParameters[i].getName()] = true;
                if (!localSkipMap) {
                    localSkipMap = {};
                }
                localSkipMap[typeParameters[i].getSymbolID().toString()] = typeParameters[i];
            }
        }

        context.pushTypeSpecializationCache(typeReplacementMap);

        if (skipLocalTypeParameters && localSkipMap) {
            context.pushTypeSpecializationCache(localSkipMap);
        }
        var newReturnType = (!localTypeParameters[returnType.getName()]) ? specializeType(returnType, null, resolver, enclosingDecl, context, ast) : returnType;
        if (skipLocalTypeParameters && localSkipMap) {
            context.popTypeSpecializationCache();
        }
        context.popTypeSpecializationCache();

        newSignature.setReturnType(newReturnType);

        for (var k = 0; k < parameters.length; k++) {
            newParameter = new PullSymbol(parameters[k].getName(), parameters[k].getKind());
            newParameter.setRootSymbol(parameters[k]);

            parameterType = parameters[k].getType();

            context.pushTypeSpecializationCache(typeReplacementMap);
            if (skipLocalTypeParameters && localSkipMap) {
                context.pushTypeSpecializationCache(localSkipMap);
            }
            newParameterType = !localTypeParameters[parameterType.getName()] ? specializeType(parameterType, null, resolver, enclosingDecl, context, ast) : parameterType;
            if (skipLocalTypeParameters && localSkipMap) {
                context.popTypeSpecializationCache();
            }
            context.popTypeSpecializationCache();

            if (parameters[k].getIsOptional()) {
                newParameter.setIsOptional();
            }

            if (parameters[k].getIsVarArg()) {
                newParameter.setIsVarArg();
                newSignature.setHasVariableParamList();
            }

            if (resolver.isTypeArgumentOrWrapper(newParameterType)) {
                newSignature.setHasGenericParameter();
            }

            newParameter.setType(newParameterType);
            newSignature.addParameter(newParameter, newParameter.getIsOptional());
        }

        signature.setIsSpecialized();

        context.inSpecialization = prevInSpecialization;

        return newSignature;
    }
    TypeScript.specializeSignature = specializeSignature;

    function getIDForTypeSubstitutions(types) {
        var substitution = "";

        for (var i = 0; i < types.length; i++) {
            substitution += types[i].getSymbolID().toString() + "#";
        }

        return substitution;
    }
    TypeScript.getIDForTypeSubstitutions = getIDForTypeSubstitutions;
})(TypeScript || (TypeScript = {}));
