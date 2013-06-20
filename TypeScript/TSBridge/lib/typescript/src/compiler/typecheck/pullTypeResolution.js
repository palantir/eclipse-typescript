var TypeScript;
(function (TypeScript) {
    var SymbolAndDiagnostics = (function () {
        function SymbolAndDiagnostics(symbol, symbolAlias, diagnostics) {
            this.symbol = symbol;
            this.symbolAlias = symbolAlias;
            this.diagnostics = diagnostics;
        }
        SymbolAndDiagnostics.create = function (symbol, diagnostics) {
            return new SymbolAndDiagnostics(symbol, null, diagnostics);
        };

        SymbolAndDiagnostics.empty = function () {
            return SymbolAndDiagnostics._empty;
        };

        SymbolAndDiagnostics.fromSymbol = function (symbol) {
            return new SymbolAndDiagnostics(symbol, null, null);
        };

        SymbolAndDiagnostics.fromAlias = function (symbol, alias) {
            return new SymbolAndDiagnostics(symbol, alias, null);
        };

        SymbolAndDiagnostics.prototype.addDiagnostic = function (diagnostic) {
            TypeScript.Debug.assert(this !== SymbolAndDiagnostics._empty);

            if (this.diagnostics === null) {
                this.diagnostics = [];
            }

            this.diagnostics.push(diagnostic);
        };

        SymbolAndDiagnostics.prototype.withoutDiagnostics = function () {
            if (!this.diagnostics) {
                return this;
            }

            return SymbolAndDiagnostics.fromSymbol(this.symbol);
        };
        SymbolAndDiagnostics._empty = new SymbolAndDiagnostics(null, null, null);
        return SymbolAndDiagnostics;
    })();
    TypeScript.SymbolAndDiagnostics = SymbolAndDiagnostics;

    var PullResolutionDataCache = (function () {
        function PullResolutionDataCache() {
            this.cacheSize = 16;
            this.rdCache = [];
            this.nextUp = 0;
            for (var i = 0; i < this.cacheSize; i++) {
                this.rdCache[i] = {
                    actuals: [],
                    exactCandidates: [],
                    conversionCandidates: [],
                    id: i
                };
            }
        }
        PullResolutionDataCache.prototype.getResolutionData = function () {
            var rd = null;

            if (this.nextUp < this.cacheSize) {
                rd = this.rdCache[this.nextUp];
            }

            if (rd === null) {
                this.cacheSize++;
                rd = {
                    actuals: [],
                    exactCandidates: [],
                    conversionCandidates: [],
                    id: this.cacheSize
                };
                this.rdCache[this.cacheSize] = rd;
            }

            this.nextUp++;

            return rd;
        };

        PullResolutionDataCache.prototype.returnResolutionData = function (rd) {
            rd.actuals.length = 0;
            rd.exactCandidates.length = 0;
            rd.conversionCandidates.length = 0;

            this.nextUp = rd.id;
        };
        return PullResolutionDataCache;
    })();
    TypeScript.PullResolutionDataCache = PullResolutionDataCache;

    var PullAdditionalCallResolutionData = (function () {
        function PullAdditionalCallResolutionData() {
            this.targetSymbol = null;
            this.targetTypeSymbol = null;
            this.resolvedSignatures = null;
            this.candidateSignature = null;
            this.actualParametersContextTypeSymbols = null;
        }
        return PullAdditionalCallResolutionData;
    })();
    TypeScript.PullAdditionalCallResolutionData = PullAdditionalCallResolutionData;

    var PullAdditionalObjectLiteralResolutionData = (function () {
        function PullAdditionalObjectLiteralResolutionData() {
            this.membersContextTypeSymbols = null;
        }
        return PullAdditionalObjectLiteralResolutionData;
    })();
    TypeScript.PullAdditionalObjectLiteralResolutionData = PullAdditionalObjectLiteralResolutionData;

    var PullTypeResolver = (function () {
        function PullTypeResolver(compilationSettings, semanticInfoChain, unitPath) {
            this.compilationSettings = compilationSettings;
            this.semanticInfoChain = semanticInfoChain;
            this.unitPath = unitPath;
            this.cachedArrayInterfaceType = null;
            this.cachedNumberInterfaceType = null;
            this.cachedStringInterfaceType = null;
            this.cachedBooleanInterfaceType = null;
            this.cachedObjectInterfaceType = null;
            this.cachedFunctionInterfaceType = null;
            this.cachedIArgumentsInterfaceType = null;
            this.cachedRegExpInterfaceType = null;
            this.cachedFunctionArgumentsSymbol = null;
            this.assignableCache = {};
            this.subtypeCache = {};
            this.identicalCache = {};
            this.resolutionDataCache = new PullResolutionDataCache();
            this.currentUnit = null;
            this.cachedArrayInterfaceType = this.getSymbolFromDeclPath("Array", [], TypeScript.PullElementKind.Interface);
            this.cachedNumberInterfaceType = this.getSymbolFromDeclPath("Number", [], TypeScript.PullElementKind.Interface);
            this.cachedStringInterfaceType = this.getSymbolFromDeclPath("String", [], TypeScript.PullElementKind.Interface);
            this.cachedBooleanInterfaceType = this.getSymbolFromDeclPath("Boolean", [], TypeScript.PullElementKind.Interface);

            this.cachedObjectInterfaceType = this.getSymbolFromDeclPath("Object", [], TypeScript.PullElementKind.Interface);
            this.cachedFunctionInterfaceType = this.getSymbolFromDeclPath("Function", [], TypeScript.PullElementKind.Interface);
            this.cachedIArgumentsInterfaceType = this.getSymbolFromDeclPath("IArguments", [], TypeScript.PullElementKind.Interface);
            this.cachedRegExpInterfaceType = this.getSymbolFromDeclPath("RegExp", [], TypeScript.PullElementKind.Interface);

            this.cachedFunctionArgumentsSymbol = new TypeScript.PullSymbol("arguments", TypeScript.PullElementKind.Variable);
            this.cachedFunctionArgumentsSymbol.setType(this.cachedIArgumentsInterfaceType ? this.cachedIArgumentsInterfaceType : this.semanticInfoChain.anyTypeSymbol);
            this.cachedFunctionArgumentsSymbol.setResolved();
            var functionArgumentsDecl = new TypeScript.PullDecl("arguments", "arguments", TypeScript.PullElementKind.Parameter, TypeScript.PullElementFlags.None, new TypeScript.TextSpan(0, 0), unitPath);
            functionArgumentsDecl.setSymbol(this.cachedFunctionArgumentsSymbol);
            this.cachedFunctionArgumentsSymbol.addDeclaration(functionArgumentsDecl);

            if (!this.cachedObjectInterfaceType) {
                this.cachedObjectInterfaceType = this.semanticInfoChain.anyTypeSymbol;
            }
            if (!this.cachedArrayInterfaceType) {
                this.cachedArrayInterfaceType = this.semanticInfoChain.anyTypeSymbol;
            }

            this.currentUnit = this.semanticInfoChain.getUnit(unitPath);
        }
        PullTypeResolver.prototype.getUnitPath = function () {
            return this.unitPath;
        };

        PullTypeResolver.prototype.setUnitPath = function (unitPath) {
            this.unitPath = unitPath;

            this.currentUnit = this.semanticInfoChain.getUnit(unitPath);
        };

        PullTypeResolver.prototype.getDeclForAST = function (ast) {
            return this.semanticInfoChain.getDeclForAST(ast, this.unitPath);
        };

        PullTypeResolver.prototype.getSymbolAndDiagnosticsForAST = function (ast) {
            return this.semanticInfoChain.getSymbolAndDiagnosticsForAST(ast, this.unitPath);
        };

        PullTypeResolver.prototype.setSymbolAndDiagnosticsForAST = function (ast, symbolAndDiagnostics, context) {
            if (context && (context.inProvisionalResolution() || context.inSpecialization)) {
                return;
            }

            this.semanticInfoChain.setSymbolAndDiagnosticsForAST(ast, symbolAndDiagnostics, this.unitPath);
        };

        PullTypeResolver.prototype.getASTForSymbol = function (symbol) {
            return this.semanticInfoChain.getASTForSymbol(symbol, this.unitPath);
        };

        PullTypeResolver.prototype.getASTForDecl = function (decl) {
            return this.semanticInfoChain.getASTForDecl(decl);
        };

        PullTypeResolver.prototype.getCachedArrayType = function () {
            return this.cachedArrayInterfaceType;
        };

        PullTypeResolver.prototype.getNewErrorTypeSymbol = function (diagnostic) {
            return new TypeScript.PullErrorTypeSymbol(diagnostic, this.semanticInfoChain.anyTypeSymbol);
        };

        PullTypeResolver.prototype.getPathToDecl = function (decl) {
            if (!decl) {
                return [];
            }

            var decls = decl.getParentPath();

            if (decls) {
                return decls;
            } else {
                decls = [decl];
            }

            var parentDecl = decl.getParentDecl();

            while (parentDecl) {
                if (parentDecl && decls[decls.length - 1] != parentDecl && !(parentDecl.getKind() & TypeScript.PullElementKind.ObjectLiteral)) {
                    decls[decls.length] = parentDecl;
                }
                parentDecl = parentDecl.getParentDecl();
            }

            decls = decls.reverse();

            decl.setParentPath(decls);

            return decls;
        };

        PullTypeResolver.prototype.getEnclosingDecl = function (decl) {
            var declPath = this.getPathToDecl(decl);

            if (!declPath.length) {
                return null;
            } else if (declPath.length > 1 && declPath[declPath.length - 1] === decl) {
                return declPath[declPath.length - 2];
            } else {
                return declPath[declPath.length - 1];
            }
        };

        PullTypeResolver.prototype.findSymbolForPath = function (pathToName, enclosingDecl, declKind) {
            if (!pathToName.length) {
                return null;
            }

            var symbolName = pathToName[pathToName.length - 1];
            var contextDeclPath = this.getPathToDecl(enclosingDecl);

            var contextSymbolPath = [];
            var nestedSymbolPath = [];

            for (var i = 0; i < pathToName.length; i++) {
                nestedSymbolPath[nestedSymbolPath.length] = pathToName[i];
            }

            var symbol = null;

            while (nestedSymbolPath.length >= 2) {
                symbol = this.semanticInfoChain.findSymbol(nestedSymbolPath, declKind);

                if (symbol) {
                    return symbol;
                }
                nestedSymbolPath.length -= 2;
                nestedSymbolPath[nestedSymbolPath.length] = symbolName;
            }

            for (var i = 0; i < contextDeclPath.length; i++) {
                contextSymbolPath[contextSymbolPath.length] = contextDeclPath[i].getName();
            }

            for (var i = 0; i < pathToName.length; i++) {
                contextSymbolPath[contextSymbolPath.length] = pathToName[i];
            }

            while (contextSymbolPath.length >= 2) {
                symbol = this.semanticInfoChain.findSymbol(contextSymbolPath, declKind);

                if (symbol) {
                    return symbol;
                }
                contextSymbolPath.length -= 2;
                contextSymbolPath[contextSymbolPath.length] = symbolName;
            }

            symbol = this.semanticInfoChain.findSymbol([symbolName], declKind);

            return symbol;
        };

        PullTypeResolver.prototype.getSymbolFromDeclPath = function (symbolName, declPath, declSearchKind) {
            var symbol = null;

            var decl = null;
            var childDecls;
            var declSymbol = null;
            var declMembers;
            var pathDeclKind;
            var valDecl = null;
            var kind;
            var instanceSymbol = null;
            var instanceType = null;
            var childSymbol = null;

            for (var i = declPath.length - 1; i >= 0; i--) {
                decl = declPath[i];
                pathDeclKind = decl.getKind();

                if (decl.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock) {
                    return this.semanticInfoChain.anyTypeSymbol;
                }

                if (pathDeclKind & (TypeScript.PullElementKind.Container | TypeScript.PullElementKind.DynamicModule)) {
                    childDecls = decl.searchChildDecls(symbolName, declSearchKind);

                    if (childDecls.length) {
                        return childDecls[0].getSymbol();
                    }

                    if (declSearchKind & TypeScript.PullElementKind.SomeValue) {
                        childDecls = decl.searchChildDecls(symbolName, declSearchKind);

                        if (childDecls.length) {
                            valDecl = childDecls[0];

                            if (valDecl) {
                                return valDecl.getSymbol();
                            }
                        }

                        instanceSymbol = (decl.getSymbol()).getInstanceSymbol();

                        if (instanceSymbol) {
                            instanceType = instanceSymbol.getType();

                            childSymbol = instanceType.findMember(symbolName, false);

                            if (childSymbol && (childSymbol.getKind() & declSearchKind)) {
                                return childSymbol;
                            }
                        }

                        childDecls = decl.searchChildDecls(symbolName, TypeScript.PullElementKind.TypeAlias);

                        if (childDecls.length) {
                            var sym = childDecls[0].getSymbol();

                            if (sym.isAlias()) {
                                return sym;
                            }
                        }

                        valDecl = decl.getValueDecl();

                        if (valDecl) {
                            decl = valDecl;
                        }
                    }

                    declSymbol = decl.getSymbol().getType();
                    declMembers = declSymbol.getMembers();

                    for (var j = 0; j < declMembers.length; j++) {
                        if (declMembers[j].getName() === symbolName) {
                            kind = declMembers[j].getKind();

                            if ((kind & declSearchKind) != 0) {
                                return declMembers[j];
                            }
                        }
                    }
                } else if ((declSearchKind & (TypeScript.PullElementKind.SomeType | TypeScript.PullElementKind.SomeContainer)) || !(pathDeclKind & TypeScript.PullElementKind.Class)) {
                    var candidateSymbol = null;

                    if (pathDeclKind === TypeScript.PullElementKind.FunctionExpression && symbolName === (decl).getFunctionExpressionName()) {
                        candidateSymbol = decl.getSymbol();
                    }

                    childDecls = decl.searchChildDecls(symbolName, declSearchKind);

                    if (childDecls.length) {
                        return childDecls[0].getSymbol();
                    }

                    if (candidateSymbol) {
                        return candidateSymbol;
                    }

                    if (declSearchKind & TypeScript.PullElementKind.SomeValue) {
                        childDecls = decl.searchChildDecls(symbolName, TypeScript.PullElementKind.TypeAlias);

                        if (childDecls.length) {
                            var sym = childDecls[0].getSymbol();

                            if (sym.isAlias()) {
                                return sym;
                            }
                        }
                    }
                }
            }

            symbol = this.semanticInfoChain.findSymbol([symbolName], declSearchKind);

            return symbol;
        };

        PullTypeResolver.prototype.getVisibleSymbolsFromDeclPath = function (declPath, declSearchKind) {
            var symbols = [];
            var decl = null;
            var childDecls;
            var pathDeclKind;
            var parameters;

            for (var i = declPath.length - 1; i >= 0; i--) {
                decl = declPath[i];
                pathDeclKind = decl.getKind();
                var declSymbol = decl.getSymbol();
                var declKind = decl.getKind();

                if (declKind !== TypeScript.PullElementKind.Class && declKind !== TypeScript.PullElementKind.Interface) {
                    this.addSymbolsFromDecls(decl.getChildDecls(), declSearchKind, symbols);
                }

                switch (declKind) {
                    case TypeScript.PullElementKind.Container:
                    case TypeScript.PullElementKind.DynamicModule:
                        var members = [];
                        if (declSymbol) {
                            members = declSymbol.getMembers();
                        }

                        var instanceSymbol = (declSymbol).getInstanceSymbol();
                        var searchTypeSymbol = instanceSymbol && instanceSymbol.getType();

                        if (searchTypeSymbol) {
                            members = members.concat(searchTypeSymbol.getMembers());
                        }

                        for (var j = 0; j < members.length; j++) {
                            if ((members[j].getKind() & declSearchKind) != 0) {
                                symbols.push(members[j]);
                            }
                        }

                        break;

                    case TypeScript.PullElementKind.Class:
                    case TypeScript.PullElementKind.Interface:
                        if (declSymbol && declSymbol.isGeneric()) {
                            parameters = declSymbol.getTypeParameters();
                            for (var k = 0; k < parameters.length; k++) {
                                symbols.push(parameters[k]);
                            }
                        }

                        break;

                    case TypeScript.PullElementKind.FunctionExpression:
                        var functionExpressionName = (decl).getFunctionExpressionName();
                        if (declSymbol && functionExpressionName) {
                            symbols.push(declSymbol);
                        }

                    case TypeScript.PullElementKind.Function:
                    case TypeScript.PullElementKind.ConstructorMethod:
                    case TypeScript.PullElementKind.Method:
                        if (declSymbol) {
                            var functionType = declSymbol.getType();
                            if (functionType.getHasGenericSignature()) {
                                var signatures = (pathDeclKind === TypeScript.PullElementKind.ConstructorMethod) ? functionType.getConstructSignatures() : functionType.getCallSignatures();
                                if (signatures && signatures.length) {
                                    for (var j = 0; j < signatures.length; j++) {
                                        var signature = signatures[j];
                                        if (signature.isGeneric()) {
                                            parameters = signature.getTypeParameters();
                                            for (var k = 0; k < parameters.length; k++) {
                                                symbols.push(parameters[k]);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        break;
                }
            }

            var units = this.semanticInfoChain.units;

            for (var i = 0, n = units.length; i < n; i++) {
                var unit = units[i];
                if (unit === this.currentUnit && declPath.length != 0) {
                    continue;
                }
                var topLevelDecls = unit.getTopLevelDecls();
                if (topLevelDecls.length) {
                    for (var j = 0, m = topLevelDecls.length; j < m; j++) {
                        var topLevelDecl = topLevelDecls[j];
                        if (topLevelDecl.getKind() === TypeScript.PullElementKind.Script || topLevelDecl.getKind() === TypeScript.PullElementKind.Global) {
                            this.addSymbolsFromDecls(topLevelDecl.getChildDecls(), declSearchKind, symbols);
                        }
                    }
                }
            }

            return symbols;
        };

        PullTypeResolver.prototype.addSymbolsFromDecls = function (decls, declSearchKind, symbols) {
            if (decls.length) {
                for (var i = 0, n = decls.length; i < n; i++) {
                    if (decls[i].getKind() & declSearchKind) {
                        var symbol = decls[i].getSymbol();
                        if (symbol) {
                            symbols.push(symbol);
                        }
                    }
                }
            }
        };

        PullTypeResolver.prototype.getVisibleSymbols = function (enclosingDecl, context) {
            var declPath = enclosingDecl !== null ? this.getPathToDecl(enclosingDecl) : [];

            if (enclosingDecl && !declPath.length) {
                declPath = [enclosingDecl];
            }

            var declSearchKind = TypeScript.PullElementKind.SomeType | TypeScript.PullElementKind.SomeContainer | TypeScript.PullElementKind.SomeValue;

            return this.getVisibleSymbolsFromDeclPath(declPath, declSearchKind);
        };

        PullTypeResolver.prototype.getVisibleContextSymbols = function (enclosingDecl, context) {
            var contextualTypeSymbol = context.getContextualType();
            if (!contextualTypeSymbol || this.isAnyOrEquivalent(contextualTypeSymbol)) {
                return null;
            }

            var declSearchKind = TypeScript.PullElementKind.SomeType | TypeScript.PullElementKind.SomeContainer | TypeScript.PullElementKind.SomeValue;
            var members = contextualTypeSymbol.getAllMembers(declSearchKind, false);

            return members;
        };

        PullTypeResolver.prototype.getVisibleMembersFromExpression = function (expression, enclosingDecl, context) {
            var prevCanUseTypeSymbol = context.canUseTypeSymbol;
            context.canUseTypeSymbol = true;
            var lhs = this.resolveAST(expression, false, enclosingDecl, context).symbol;
            context.canUseTypeSymbol = prevCanUseTypeSymbol;
            var lhsType = lhs.getType();

            if (!lhsType) {
                return null;
            }

            if (this.isAnyOrEquivalent(lhsType)) {
                return null;
            }

            var includePrivate = false;
            var containerSymbol = lhsType;
            if (containerSymbol.getKind() === TypeScript.PullElementKind.ConstructorType) {
                containerSymbol = containerSymbol.getConstructSignatures()[0].getReturnType();
            }

            if (containerSymbol && containerSymbol.isClass()) {
                var declPath = this.getPathToDecl(enclosingDecl);
                if (declPath && declPath.length) {
                    var declarations = containerSymbol.getDeclarations();
                    for (var i = 0, n = declarations.length; i < n; i++) {
                        var declaration = declarations[i];
                        if (declPath.indexOf(declaration) >= 0) {
                            includePrivate = true;
                            break;
                        }
                    }
                }
            }

            var declSearchKind = TypeScript.PullElementKind.SomeType | TypeScript.PullElementKind.SomeContainer | TypeScript.PullElementKind.SomeValue;

            var members = [];

            if (lhsType.isTypeParameter()) {
                var constraint = (lhsType).getConstraint();

                if (constraint) {
                    lhsType = constraint;
                    members = lhsType.getAllMembers(declSearchKind, false);
                }
            } else {
                if (lhs.getKind() == TypeScript.PullElementKind.EnumMember) {
                    lhsType = this.semanticInfoChain.numberTypeSymbol;
                }

                if (lhsType === this.semanticInfoChain.numberTypeSymbol && this.cachedNumberInterfaceType) {
                    lhsType = this.cachedNumberInterfaceType;
                } else if (lhsType === this.semanticInfoChain.stringTypeSymbol && this.cachedStringInterfaceType) {
                    lhsType = this.cachedStringInterfaceType;
                } else if (lhsType === this.semanticInfoChain.booleanTypeSymbol && this.cachedBooleanInterfaceType) {
                    lhsType = this.cachedBooleanInterfaceType;
                }

                if (!lhsType.isResolved()) {
                    var potentiallySpecializedType = this.resolveDeclaredSymbol(lhsType, enclosingDecl, context);

                    if (potentiallySpecializedType != lhsType) {
                        if (!lhs.isType()) {
                            context.setTypeInContext(lhs, potentiallySpecializedType);
                        }

                        lhsType = potentiallySpecializedType;
                    }
                }

                members = lhsType.getAllMembers(declSearchKind, includePrivate);

                if (lhsType.isContainer()) {
                    var associatedInstance = (lhsType).getInstanceSymbol();
                    if (associatedInstance) {
                        var instanceType = associatedInstance.getType();
                        var instanceMembers = instanceType.getAllMembers(declSearchKind, includePrivate);
                        members = members.concat(instanceMembers);
                    }
                } else if (lhsType.isConstructor()) {
                    var prototypeStr = "prototype";
                    var prototypeSymbol = new TypeScript.PullSymbol(prototypeStr, TypeScript.PullElementKind.Property);
                    var parentDecl = lhsType.getDeclarations()[0];
                    var prototypeDecl = new TypeScript.PullDecl(prototypeStr, prototypeStr, parentDecl.getKind(), parentDecl.getFlags(), parentDecl.getSpan(), parentDecl.getScriptName());
                    prototypeDecl.setParentDecl(parentDecl);
                    prototypeSymbol.addDeclaration(prototypeDecl);

                    members.push(prototypeSymbol);
                } else {
                    var associatedContainerSymbol = lhsType.getAssociatedContainerType();
                    if (associatedContainerSymbol) {
                        var containerType = associatedContainerSymbol.getType();
                        var containerMembers = containerType.getAllMembers(declSearchKind, includePrivate);
                        members = members.concat(containerMembers);
                    }
                }
            }

            if (lhsType.getCallSignatures().length && this.cachedFunctionInterfaceType) {
                members = members.concat(this.cachedFunctionInterfaceType.getAllMembers(declSearchKind, false));
            }

            return members;
        };

        PullTypeResolver.prototype.isAnyOrEquivalent = function (type) {
            return (type === this.semanticInfoChain.anyTypeSymbol) || type.isError();
        };

        PullTypeResolver.prototype.isNumberOrEquivalent = function (type) {
            return (type === this.semanticInfoChain.numberTypeSymbol) || (this.cachedNumberInterfaceType && type === this.cachedNumberInterfaceType);
        };

        PullTypeResolver.prototype.isTypeArgumentOrWrapper = function (type) {
            if (!type) {
                return false;
            }

            if (!type.isGeneric()) {
                return false;
            }

            if (type.isTypeParameter()) {
                return true;
            }

            if (type.isArray()) {
                return this.isTypeArgumentOrWrapper((type).getElementType());
            }

            var typeArguments = type.getTypeArguments();

            if (typeArguments) {
                for (var i = 0; i < typeArguments.length; i++) {
                    if (this.isTypeArgumentOrWrapper(typeArguments[i])) {
                        return true;
                    }
                }
            } else {
                return true;
            }

            return false;
        };

        PullTypeResolver.prototype.isArrayOrEquivalent = function (type) {
            return type.isArray() || type == this.cachedArrayInterfaceType;
        };

        PullTypeResolver.prototype.findTypeSymbolForDynamicModule = function (idText, currentFileName, search) {
            var originalIdText = idText;
            var symbol = search(idText);

            if (symbol === null) {
                if (!symbol) {
                    idText = TypeScript.swapQuotes(originalIdText);
                    symbol = search(idText);
                }

                if (!symbol) {
                    idText = TypeScript.stripQuotes(originalIdText) + ".ts";
                    symbol = search(idText);
                }

                if (!symbol) {
                    idText = TypeScript.stripQuotes(originalIdText) + ".d.ts";
                    symbol = search(idText);
                }

                if (!symbol && !TypeScript.isRelative(originalIdText)) {
                    idText = originalIdText;

                    var strippedIdText = TypeScript.stripQuotes(idText);

                    var path = TypeScript.getRootFilePath(TypeScript.switchToForwardSlashes(currentFileName));

                    while (symbol === null && path != "") {
                        idText = TypeScript.normalizePath(path + strippedIdText + ".ts");
                        symbol = search(idText);

                        if (symbol === null) {
                            idText = TypeScript.changePathToDTS(idText);
                            symbol = search(idText);
                        }

                        if (symbol === null) {
                            if (path === '/') {
                                path = '';
                            } else {
                                path = TypeScript.normalizePath(path + "..");
                                path = path && path != '/' ? path + '/' : path;
                            }
                        }
                    }
                }
            }

            return symbol;
        };

        PullTypeResolver.prototype.resolveDeclaredSymbol = function (symbol, enclosingDecl, context) {
            var savedResolvingTypeReference = context.resolvingTypeReference;
            context.resolvingTypeReference = false;

            var result = this.resolveDeclaredSymbolWorker(symbol, enclosingDecl, context);
            context.resolvingTypeReference = savedResolvingTypeReference;

            return result;
        };

        PullTypeResolver.prototype.resolveDeclaredSymbolWorker = function (symbol, enclosingDecl, context) {
            if (!symbol || symbol.isResolved()) {
                return symbol;
            }

            if (symbol.isResolving()) {
                if (!symbol.currentlyBeingSpecialized()) {
                    if (!symbol.isType()) {
                        symbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    }

                    return symbol;
                }
            }

            var thisUnit = this.unitPath;

            var decls = symbol.getDeclarations();

            var ast = null;

            for (var i = 0; i < decls.length; i++) {
                var decl = decls[i];

                ast = this.semanticInfoChain.getASTForDecl(decl);

                if (!ast || ast.nodeType === TypeScript.NodeType.Member) {
                    this.setUnitPath(thisUnit);
                    return symbol;
                }

                this.setUnitPath(decl.getScriptName());
                this.resolveAST(ast, false, enclosingDecl, context);
            }

            var typeArgs = symbol.isType() ? (symbol).getTypeArguments() : null;

            if (typeArgs && typeArgs.length) {
                var typeParameters = (symbol).getTypeParameters();
                var typeCache = {};

                for (var i = 0; i < typeParameters.length; i++) {
                    typeCache[typeParameters[i].getSymbolID().toString()] = typeArgs[i];
                }

                context.pushTypeSpecializationCache(typeCache);
                var rootType = TypeScript.getRootType(symbol.getType());

                var specializedSymbol = TypeScript.specializeType(rootType, typeArgs, this, enclosingDecl, context, ast);

                context.popTypeSpecializationCache();

                symbol = specializedSymbol;
            }

            this.setUnitPath(thisUnit);

            return symbol;
        };

        PullTypeResolver.prototype.resolveModuleDeclaration = function (ast, context) {
            var containerSymbol = this.getSymbolAndDiagnosticsForAST(ast).symbol;

            if (containerSymbol.isResolved()) {
                return containerSymbol;
            }

            containerSymbol.setResolved();

            var containerDecl = this.getDeclForAST(ast);

            if (containerDecl.getKind() != TypeScript.PullElementKind.Enum) {
                var instanceSymbol = containerSymbol.getInstanceSymbol();

                if (instanceSymbol) {
                    this.resolveDeclaredSymbol(instanceSymbol, containerDecl.getParentDecl(), context);
                }
            }

            return containerSymbol;
        };

        PullTypeResolver.prototype.isTypeRefWithoutTypeArgs = function (typeRef) {
            if (typeRef.nodeType != TypeScript.NodeType.TypeRef) {
                return false;
            }

            if (typeRef.term.nodeType == TypeScript.NodeType.Name) {
                return true;
            } else if (typeRef.term.nodeType == TypeScript.NodeType.MemberAccessExpression) {
                var binex = typeRef.term;

                if (binex.operand2.nodeType == TypeScript.NodeType.Name) {
                    return true;
                }
            }

            return false;
        };

        PullTypeResolver.prototype.resolveReferenceTypeDeclaration = function (typeDeclAST, context) {
            var typeDecl = this.getDeclForAST(typeDeclAST);
            var enclosingDecl = this.getEnclosingDecl(typeDecl);
            var typeDeclSymbol = typeDecl.getSymbol();
            var typeDeclIsClass = typeDeclAST.nodeType === TypeScript.NodeType.ClassDeclaration;
            var hasVisited = this.getSymbolAndDiagnosticsForAST(typeDeclAST) != null;
            var extendedTypes = [];
            var implementedTypes = [];

            if ((typeDeclSymbol.isResolved() && hasVisited) || (typeDeclSymbol.isResolving() && !context.isInBaseTypeResolution())) {
                return typeDeclSymbol;
            }

            var wasResolving = typeDeclSymbol.isResolving();
            typeDeclSymbol.startResolving();

            if (!typeDeclSymbol.isResolved()) {
                var typeDeclTypeParameters = typeDeclSymbol.getTypeParameters();
                for (var i = 0; i < typeDeclTypeParameters.length; i++) {
                    this.resolveDeclaredSymbol(typeDeclTypeParameters[i], typeDecl, context);
                }
            }

            var wasInBaseTypeResolution = context.startBaseTypeResolution();

            if (!typeDeclIsClass && !hasVisited && typeDeclSymbol.isResolved()) {
                typeDeclSymbol.resetKnownBaseTypeCount();
            }

            if (typeDeclAST.extendsList) {
                var savedIsResolvingClassExtendedType = context.isResolvingClassExtendedType;
                if (typeDeclIsClass) {
                    context.isResolvingClassExtendedType = true;
                }

                for (var i = typeDeclSymbol.getKnownBaseTypeCount(); i < typeDeclAST.extendsList.members.length; i = typeDeclSymbol.getKnownBaseTypeCount()) {
                    typeDeclSymbol.incrementKnownBaseCount();
                    var parentType = this.resolveTypeReference(new TypeScript.TypeReference(typeDeclAST.extendsList.members[i], 0), typeDecl, context).symbol;

                    if (typeDeclSymbol.isValidBaseKind(parentType, true)) {
                        var resolvedParentType = parentType;
                        extendedTypes[extendedTypes.length] = parentType;
                        if (parentType.isGeneric() && parentType.isResolved() && !parentType.getIsSpecialized()) {
                            parentType = this.specializeTypeToAny(parentType, enclosingDecl, context);
                            typeDecl.addDiagnostic(new TypeScript.Diagnostic(typeDecl.getScriptName(), typeDeclAST.minChar, typeDeclAST.getLength(), TypeScript.DiagnosticCode.Generic_type_references_must_include_all_type_arguments));
                        }
                        if (!typeDeclSymbol.hasBase(parentType)) {
                            this.setSymbolAndDiagnosticsForAST(typeDeclAST.extendsList.members[i], SymbolAndDiagnostics.fromSymbol(resolvedParentType), context);
                            typeDeclSymbol.addExtendedType(parentType);
                        }
                    }
                }

                context.isResolvingClassExtendedType = savedIsResolvingClassExtendedType;
            }

            if (!typeDeclSymbol.isResolved() && !wasResolving) {
                var baseTypeSymbols = typeDeclSymbol.getExtendedTypes();
                for (var i = 0; i < baseTypeSymbols.length; i++) {
                    var baseType = baseTypeSymbols[i];

                    for (var j = 0; j < extendedTypes.length; j++) {
                        if (baseType == extendedTypes[j]) {
                            break;
                        }
                    }

                    if (j == extendedTypes.length) {
                        typeDeclSymbol.removeExtendedType(baseType);
                    }
                }
            }

            if (typeDeclAST.implementsList && typeDeclIsClass) {
                var extendsCount = typeDeclAST.extendsList ? typeDeclAST.extendsList.members.length : 0;
                for (var i = typeDeclSymbol.getKnownBaseTypeCount(); ((i - extendsCount) >= 0) && ((i - extendsCount) < typeDeclAST.implementsList.members.length); i = typeDeclSymbol.getKnownBaseTypeCount()) {
                    typeDeclSymbol.incrementKnownBaseCount();
                    var implementedType = this.resolveTypeReference(new TypeScript.TypeReference(typeDeclAST.implementsList.members[i - extendsCount], 0), typeDecl, context).symbol;

                    if (typeDeclSymbol.isValidBaseKind(implementedType, false)) {
                        var resolvedImplementedType = implementedType;
                        implementedTypes[implementedTypes.length] = implementedType;
                        if (implementedType.isGeneric() && implementedType.isResolved() && !implementedType.getIsSpecialized()) {
                            implementedType = this.specializeTypeToAny(implementedType, enclosingDecl, context);
                            typeDecl.addDiagnostic(new TypeScript.Diagnostic(typeDecl.getScriptName(), typeDeclAST.minChar, typeDeclAST.getLength(), TypeScript.DiagnosticCode.Generic_type_references_must_include_all_type_arguments));
                            this.setSymbolAndDiagnosticsForAST(typeDeclAST.implementsList.members[i - extendsCount], SymbolAndDiagnostics.fromSymbol(implementedType), context);
                            typeDeclSymbol.addImplementedType(implementedType);
                        } else if (!typeDeclSymbol.hasBase(implementedType)) {
                            this.setSymbolAndDiagnosticsForAST(typeDeclAST.implementsList.members[i - extendsCount], SymbolAndDiagnostics.fromSymbol(resolvedImplementedType), context);
                            typeDeclSymbol.addImplementedType(implementedType);
                        }
                    }
                }
            }

            if (!typeDeclSymbol.isResolved() && !wasResolving) {
                var baseTypeSymbols = typeDeclSymbol.getImplementedTypes();
                for (var i = 0; i < baseTypeSymbols.length; i++) {
                    var baseType = baseTypeSymbols[i];

                    for (var j = 0; j < implementedTypes.length; j++) {
                        if (baseType == implementedTypes[j]) {
                            break;
                        }
                    }

                    if (j == implementedTypes.length) {
                        typeDeclSymbol.removeImplementedType(baseType);
                    }
                }
            }

            context.doneBaseTypeResolution(wasInBaseTypeResolution);
            if (wasInBaseTypeResolution) {
                return typeDeclSymbol;
            }

            if (!typeDeclSymbol.isResolved()) {
                var typeDeclMembers = typeDeclSymbol.getMembers();
                for (var i = 0; i < typeDeclMembers.length; i++) {
                    this.resolveDeclaredSymbol(typeDeclMembers[i], typeDecl, context);
                }

                if (!typeDeclIsClass) {
                    var callSignatures = typeDeclSymbol.getCallSignatures();
                    for (var i = 0; i < callSignatures.length; i++) {
                        this.resolveDeclaredSymbol(callSignatures[i], typeDecl, context);
                    }

                    var constructSignatures = typeDeclSymbol.getConstructSignatures();
                    for (var i = 0; i < constructSignatures.length; i++) {
                        this.resolveDeclaredSymbol(constructSignatures[i], typeDecl, context);
                    }

                    var indexSignatures = typeDeclSymbol.getIndexSignatures();
                    for (var i = 0; i < indexSignatures.length; i++) {
                        this.resolveDeclaredSymbol(indexSignatures[i], typeDecl, context);
                    }
                }
            }

            this.setSymbolAndDiagnosticsForAST(typeDeclAST.name, SymbolAndDiagnostics.fromSymbol(typeDeclSymbol), context);
            this.setSymbolAndDiagnosticsForAST(typeDeclAST, SymbolAndDiagnostics.fromSymbol(typeDeclSymbol), context);

            typeDeclSymbol.setResolved();

            return typeDeclSymbol;
        };

        PullTypeResolver.prototype.resolveClassDeclaration = function (classDeclAST, context) {
            var classDecl = this.getDeclForAST(classDeclAST);
            var classDeclSymbol = classDecl.getSymbol();
            if (classDeclSymbol.isResolved()) {
                return classDeclSymbol;
            }

            this.resolveReferenceTypeDeclaration(classDeclAST, context);

            var constructorMethod = classDeclSymbol.getConstructorMethod();
            var extendedTypes = classDeclSymbol.getExtendedTypes();
            var parentType = extendedTypes.length ? extendedTypes[0] : null;

            if (constructorMethod) {
                var constructorTypeSymbol = constructorMethod.getType();

                var constructSignatures = constructorTypeSymbol.getConstructSignatures();

                if (!constructSignatures.length) {
                    var constructorSignature;

                    if (parentType) {
                        var parentClass = parentType;
                        var parentConstructor = parentClass.getConstructorMethod();
                        var parentConstructorType = parentConstructor.getType();
                        var parentConstructSignatures = parentConstructorType.getConstructSignatures();

                        var parentConstructSignature;
                        var parentParameters;
                        for (var i = 0; i < parentConstructSignatures.length; i++) {
                            parentConstructSignature = parentConstructSignatures[i];
                            parentParameters = parentConstructSignature.getParameters();

                            constructorSignature = parentConstructSignature.isDefinition() ? new TypeScript.PullDefinitionSignatureSymbol(TypeScript.PullElementKind.ConstructSignature) : new TypeScript.PullSignatureSymbol(TypeScript.PullElementKind.ConstructSignature);
                            constructorSignature.setReturnType(classDeclSymbol);

                            for (var j = 0; j < parentParameters.length; j++) {
                                constructorSignature.addParameter(parentParameters[j], parentParameters[j].getIsOptional());
                            }

                            var typeParameters = constructorTypeSymbol.getTypeParameters();

                            for (var j = 0; j < typeParameters.length; j++) {
                                constructorSignature.addTypeParameter(typeParameters[j]);
                            }

                            constructorTypeSymbol.addConstructSignature(constructorSignature);
                            constructorSignature.addDeclaration(classDecl);
                        }
                    } else {
                        constructorSignature = new TypeScript.PullSignatureSymbol(TypeScript.PullElementKind.ConstructSignature);
                        constructorSignature.setReturnType(classDeclSymbol);
                        constructorTypeSymbol.addConstructSignature(constructorSignature);
                        constructorSignature.addDeclaration(classDecl);

                        var typeParameters = constructorTypeSymbol.getTypeParameters();

                        for (var i = 0; i < typeParameters.length; i++) {
                            constructorSignature.addTypeParameter(typeParameters[i]);
                        }
                    }
                }

                if (!classDeclSymbol.isResolved()) {
                    return classDeclSymbol;
                }

                var constructorMembers = constructorTypeSymbol.getMembers();

                this.resolveDeclaredSymbol(constructorMethod, classDecl, context);

                for (var i = 0; i < constructorMembers.length; i++) {
                    this.resolveDeclaredSymbol(constructorMembers[i], classDecl, context);
                }

                if (parentType) {
                    var parentConstructorSymbol = (parentType).getConstructorMethod();
                    var parentConstructorTypeSymbol = parentConstructorSymbol.getType();

                    if (!constructorTypeSymbol.hasBase(parentConstructorTypeSymbol)) {
                        constructorTypeSymbol.addExtendedType(parentConstructorTypeSymbol);
                    }
                }
            }

            return classDeclSymbol;
        };

        PullTypeResolver.prototype.resolveInterfaceDeclaration = function (interfaceDeclAST, context) {
            var interfaceDecl = this.getDeclForAST(interfaceDeclAST);
            var interfaceDeclSymbol = interfaceDecl.getSymbol();

            this.resolveReferenceTypeDeclaration(interfaceDeclAST, context);
            return interfaceDeclSymbol;
        };

        PullTypeResolver.prototype.resolveImportDeclaration = function (importStatementAST, context) {
            var _this = this;
            var importDecl = this.getDeclForAST(importStatementAST);
            var enclosingDecl = this.getEnclosingDecl(importDecl);
            var importDeclSymbol = importDecl.getSymbol();

            var aliasName = importStatementAST.id.text;
            var aliasedType = null;

            if (importDeclSymbol.isResolved()) {
                return importDeclSymbol;
            }

            importDeclSymbol.startResolving();

            if (importStatementAST.alias.nodeType === TypeScript.NodeType.TypeRef) {
                aliasedType = this.resolveTypeReference(importStatementAST.alias, enclosingDecl, context).symbol;
            } else if (importStatementAST.alias.nodeType === TypeScript.NodeType.Name) {
                var text = (importStatementAST.alias).actualText;

                if (!TypeScript.isQuoted(text)) {
                    aliasedType = this.resolveTypeReference(new TypeScript.TypeReference(importStatementAST.alias, 0), enclosingDecl, context).symbol;
                } else {
                    var modPath = (importStatementAST.alias).actualText;
                    var declPath = this.getPathToDecl(enclosingDecl);

                    importStatementAST.isDynamicImport = true;

                    aliasedType = this.findTypeSymbolForDynamicModule(modPath, importDecl.getScriptName(), function (s) {
                        return _this.getSymbolFromDeclPath(s, declPath, TypeScript.PullElementKind.SomeContainer);
                    });

                    if (aliasedType) {
                        this.currentUnit.addDynamicModuleImport(importDeclSymbol);
                    } else {
                        importDecl.addDiagnostic(new TypeScript.SemanticDiagnostic(this.currentUnit.getPath(), importStatementAST.minChar, importStatementAST.getLength(), TypeScript.DiagnosticCode.Unable_to_resolve_external_module__0_, [text]));
                        aliasedType = this.semanticInfoChain.anyTypeSymbol;
                    }
                }
            }

            if (aliasedType) {
                if (!aliasedType.isContainer()) {
                    importDecl.addDiagnostic(new TypeScript.Diagnostic(this.currentUnit.getPath(), importStatementAST.minChar, importStatementAST.getLength(), TypeScript.DiagnosticCode.Module_cannot_be_aliased_to_a_non_module_type));
                    aliasedType = this.semanticInfoChain.anyTypeSymbol;
                } else if ((aliasedType).getExportAssignedValueSymbol()) {
                    importDeclSymbol.setIsUsedAsValue();
                }

                importDeclSymbol.setAliasedType(aliasedType);
                importDeclSymbol.setResolved();

                this.semanticInfoChain.setSymbolAndDiagnosticsForAST(importStatementAST.alias, SymbolAndDiagnostics.fromSymbol(aliasedType), this.unitPath);
            }

            return importDeclSymbol;
        };

        PullTypeResolver.prototype.resolveExportAssignmentStatement = function (exportAssignmentAST, enclosingDecl, context) {
            var id = exportAssignmentAST.id.text;
            var valueSymbol = null;
            var typeSymbol = null;
            var containerSymbol = null;

            var parentSymbol = enclosingDecl.getSymbol();

            if (!parentSymbol.isType() && (parentSymbol).isContainer()) {
                enclosingDecl.addDiagnostic(new TypeScript.Diagnostic(enclosingDecl.getScriptName(), exportAssignmentAST.minChar, exportAssignmentAST.getLength(), TypeScript.DiagnosticCode.Export_assignments_may_only_be_used_in_External_modules));
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
            }

            var declPath = enclosingDecl !== null ? [enclosingDecl] : [];

            containerSymbol = this.getSymbolFromDeclPath(id, declPath, TypeScript.PullElementKind.SomeContainer);

            var acceptableAlias = true;

            if (containerSymbol) {
                acceptableAlias = (containerSymbol.getKind() & TypeScript.PullElementKind.AcceptableAlias) != 0;
            }

            if (!acceptableAlias && containerSymbol && containerSymbol.getKind() == TypeScript.PullElementKind.TypeAlias) {
                if (!containerSymbol.isResolved()) {
                    this.resolveDeclaredSymbol(containerSymbol, enclosingDecl, context);
                }
                var aliasedType = (containerSymbol).getType();

                if (aliasedType.getKind() != TypeScript.PullElementKind.DynamicModule) {
                    acceptableAlias = true;
                } else {
                    var aliasedAssignedValue = (containerSymbol).getExportAssignedValueSymbol();
                    var aliasedAssignedType = (containerSymbol).getExportAssignedTypeSymbol();
                    var aliasedAssignedContainer = (containerSymbol).getExportAssignedContainerSymbol();

                    if (aliasedAssignedValue || aliasedAssignedType || aliasedAssignedContainer) {
                        if (aliasedAssignedValue) {
                            valueSymbol = aliasedAssignedValue;
                        }
                        if (aliasedAssignedType) {
                            typeSymbol = aliasedAssignedType;
                        }
                        if (aliasedAssignedContainer) {
                            containerSymbol = aliasedAssignedContainer;
                        }
                        acceptableAlias = true;
                    }
                }
            }

            if (!acceptableAlias) {
                enclosingDecl.addDiagnostic(new TypeScript.Diagnostic(enclosingDecl.getScriptName(), exportAssignmentAST.minChar, exportAssignmentAST.getLength(), TypeScript.DiagnosticCode.Export_assignments_may_only_be_made_with_acceptable_kinds));
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.voidTypeSymbol);
            }

            if (!valueSymbol) {
                valueSymbol = this.getSymbolFromDeclPath(id, declPath, TypeScript.PullElementKind.SomeValue);
            }
            if (!typeSymbol) {
                typeSymbol = this.getSymbolFromDeclPath(id, declPath, TypeScript.PullElementKind.SomeType);
            }

            if (!valueSymbol && !typeSymbol && !containerSymbol) {
                return SymbolAndDiagnostics.create(this.semanticInfoChain.voidTypeSymbol, [context.postError(enclosingDecl.getScriptName(), exportAssignmentAST.minChar, exportAssignmentAST.getLength(), TypeScript.DiagnosticCode.Could_not_find_symbol__0_, [id])]);
            }

            if (valueSymbol) {
                if (!valueSymbol.isResolved()) {
                    this.resolveDeclaredSymbol(valueSymbol, enclosingDecl, context);
                }
                (parentSymbol).setExportAssignedValueSymbol(valueSymbol);
            }
            if (typeSymbol) {
                if (!typeSymbol.isResolved()) {
                    this.resolveDeclaredSymbol(typeSymbol, enclosingDecl, context);
                }

                (parentSymbol).setExportAssignedTypeSymbol(typeSymbol);
            }
            if (containerSymbol) {
                if (!containerSymbol.isResolved()) {
                    this.resolveDeclaredSymbol(containerSymbol, enclosingDecl, context);
                }

                (parentSymbol).setExportAssignedContainerSymbol(containerSymbol);
            }

            return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.voidTypeSymbol);
        };

        PullTypeResolver.prototype.resolveFunctionTypeSignature = function (funcDeclAST, enclosingDecl, context) {
            var funcDeclSymbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(funcDeclAST);
            var funcDeclSymbol = funcDeclSymbolAndDiagnostics && funcDeclSymbolAndDiagnostics.symbol;

            if (!funcDeclSymbol) {
                var semanticInfo = this.semanticInfoChain.getUnit(this.unitPath);
                var declCollectionContext = new TypeScript.DeclCollectionContext(semanticInfo);

                declCollectionContext.scriptName = this.unitPath;

                if (enclosingDecl) {
                    declCollectionContext.pushParent(enclosingDecl);
                }

                TypeScript.getAstWalkerFactory().walk(funcDeclAST, TypeScript.preCollectDecls, TypeScript.postCollectDecls, null, declCollectionContext);

                var functionDecl = this.getDeclForAST(funcDeclAST);

                var binder = new TypeScript.PullSymbolBinder(this.compilationSettings, this.semanticInfoChain);
                binder.setUnit(this.unitPath);
                if (functionDecl.getKind() === TypeScript.PullElementKind.ConstructorType) {
                    binder.bindConstructorTypeDeclarationToPullSymbol(functionDecl);
                } else {
                    binder.bindFunctionTypeDeclarationToPullSymbol(functionDecl);
                }

                funcDeclSymbol = functionDecl.getSymbol();
            }

            var signature = funcDeclSymbol.getKind() === TypeScript.PullElementKind.ConstructorType ? funcDeclSymbol.getConstructSignatures()[0] : funcDeclSymbol.getCallSignatures()[0];

            if (funcDeclAST.returnTypeAnnotation) {
                var returnTypeSymbol = this.resolveTypeReference(funcDeclAST.returnTypeAnnotation, enclosingDecl, context).symbol;

                signature.setReturnType(returnTypeSymbol);

                if (this.isTypeArgumentOrWrapper(returnTypeSymbol)) {
                    signature.setHasGenericParameter();

                    if (funcDeclSymbol) {
                        funcDeclSymbol.getType().setHasGenericSignature();
                    }
                }
            } else {
                signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
            }

            if (funcDeclAST.arguments) {
                for (var i = 0; i < funcDeclAST.arguments.members.length; i++) {
                    this.resolveFunctionTypeSignatureParameter(funcDeclAST.arguments.members[i], signature, enclosingDecl, context);
                }
            }

            if (funcDeclSymbol && signature.hasGenericParameter()) {
                funcDeclSymbol.getType().setHasGenericSignature();
            }

            if (signature.hasGenericParameter()) {
                if (funcDeclSymbol) {
                    funcDeclSymbol.getType().setHasGenericSignature();
                }
            }

            funcDeclSymbol.setResolved();

            return funcDeclSymbol;
        };

        PullTypeResolver.prototype.resolveFunctionTypeSignatureParameter = function (argDeclAST, signature, enclosingDecl, context) {
            var paramSymbol = this.getSymbolAndDiagnosticsForAST(argDeclAST).symbol;

            if (argDeclAST.typeExpr) {
                var typeRef = this.resolveTypeReference(argDeclAST.typeExpr, enclosingDecl, context).symbol;

                if (paramSymbol.getIsVarArg() && !(typeRef.isArray() || typeRef == this.cachedArrayInterfaceType)) {
                    var diagnostic = context.postError(this.unitPath, argDeclAST.minChar, argDeclAST.getLength(), TypeScript.DiagnosticCode.Rest_parameters_must_be_array_types, null, enclosingDecl);
                    typeRef = this.getNewErrorTypeSymbol(diagnostic);
                }

                context.setTypeInContext(paramSymbol, typeRef);

                if (this.isTypeArgumentOrWrapper(typeRef)) {
                    signature.setHasGenericParameter();
                }
            } else {
                if (paramSymbol.getIsVarArg() && paramSymbol.getType()) {
                    if (this.cachedArrayInterfaceType) {
                        context.setTypeInContext(paramSymbol, TypeScript.specializeToArrayType(this.cachedArrayInterfaceType, paramSymbol.getType(), this, context));
                    } else {
                        context.setTypeInContext(paramSymbol, paramSymbol.getType());
                    }
                } else {
                    context.setTypeInContext(paramSymbol, this.semanticInfoChain.anyTypeSymbol);
                }
            }

            paramSymbol.setResolved();
        };

        PullTypeResolver.prototype.resolveFunctionExpressionParameter = function (argDeclAST, contextParam, enclosingDecl, context) {
            var paramSymbol = this.getSymbolAndDiagnosticsForAST(argDeclAST).symbol;

            if (argDeclAST.typeExpr) {
                var typeRef = this.resolveTypeReference(argDeclAST.typeExpr, enclosingDecl, context).symbol;

                if (paramSymbol.getIsVarArg() && !(typeRef.isArray() || typeRef == this.cachedArrayInterfaceType)) {
                    var diagnostic = context.postError(this.unitPath, argDeclAST.minChar, argDeclAST.getLength(), TypeScript.DiagnosticCode.Rest_parameters_must_be_array_types, null, enclosingDecl);
                    typeRef = this.getNewErrorTypeSymbol(diagnostic);
                }

                context.setTypeInContext(paramSymbol, typeRef);
            } else {
                if (paramSymbol.getIsVarArg() && paramSymbol.getType()) {
                    if (this.cachedArrayInterfaceType) {
                        context.setTypeInContext(paramSymbol, TypeScript.specializeToArrayType(this.cachedArrayInterfaceType, paramSymbol.getType(), this, context));
                    } else {
                        context.setTypeInContext(paramSymbol, paramSymbol.getType());
                    }
                } else if (contextParam) {
                    context.setTypeInContext(paramSymbol, contextParam.getType());
                } else {
                    context.setTypeInContext(paramSymbol, this.semanticInfoChain.anyTypeSymbol);
                }
            }

            paramSymbol.setResolved();
        };

        PullTypeResolver.prototype.resolveInterfaceTypeReference = function (interfaceDeclAST, enclosingDecl, context) {
            var interfaceSymbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(interfaceDeclAST);
            var interfaceSymbol = interfaceSymbolAndDiagnostics && interfaceSymbolAndDiagnostics.symbol;

            if (!interfaceSymbol) {
                var semanticInfo = this.semanticInfoChain.getUnit(this.unitPath);
                var declCollectionContext = new TypeScript.DeclCollectionContext(semanticInfo);

                declCollectionContext.scriptName = this.unitPath;

                if (enclosingDecl) {
                    declCollectionContext.pushParent(enclosingDecl);
                }

                TypeScript.getAstWalkerFactory().walk(interfaceDeclAST, TypeScript.preCollectDecls, TypeScript.postCollectDecls, null, declCollectionContext);

                var interfaceDecl = this.getDeclForAST(interfaceDeclAST);

                var binder = new TypeScript.PullSymbolBinder(this.compilationSettings, this.semanticInfoChain);

                binder.setUnit(this.unitPath);
                binder.bindObjectTypeDeclarationToPullSymbol(interfaceDecl);

                interfaceSymbol = interfaceDecl.getSymbol();
            }

            if (interfaceDeclAST.members) {
                var memberSymbol = null;
                var memberType = null;
                var typeMembers = interfaceDeclAST.members;

                for (var i = 0; i < typeMembers.members.length; i++) {
                    memberSymbol = this.getSymbolAndDiagnosticsForAST(typeMembers.members[i]).symbol;

                    this.resolveDeclaredSymbol(memberSymbol, enclosingDecl, context);

                    memberType = memberSymbol.getType();

                    if (memberType && memberType.isGeneric()) {
                        interfaceSymbol.setHasGenericMember();
                    }
                }
            }

            interfaceSymbol.setResolved();

            return interfaceSymbol;
        };

        PullTypeResolver.prototype.resolveTypeReference = function (typeRef, enclosingDecl, context) {
            if (typeRef === null) {
                return null;
            }

            var symbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(typeRef);
            if (!symbolAndDiagnostics) {
                symbolAndDiagnostics = this.computeTypeReferenceSymbol(typeRef, enclosingDecl, context);

                if (!symbolAndDiagnostics.symbol.isGeneric()) {
                    this.setSymbolAndDiagnosticsForAST(typeRef, symbolAndDiagnostics, context);
                }
            }

            return symbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeTypeReferenceSymbol = function (typeRef, enclosingDecl, context) {
            var typeDeclSymbol = null;
            var diagnostic = null;
            var symbolAndDiagnostic = null;

            if (typeRef.term.nodeType === TypeScript.NodeType.Name) {
                var prevResolvingTypeReference = context.resolvingTypeReference;
                context.resolvingTypeReference = true;
                symbolAndDiagnostic = this.resolveTypeNameExpression(typeRef.term, enclosingDecl, context);
                typeDeclSymbol = symbolAndDiagnostic.symbol;

                context.resolvingTypeReference = prevResolvingTypeReference;
            } else if (typeRef.term.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                typeDeclSymbol = this.resolveFunctionTypeSignature(typeRef.term, enclosingDecl, context);
            } else if (typeRef.term.nodeType === TypeScript.NodeType.InterfaceDeclaration) {
                typeDeclSymbol = this.resolveInterfaceTypeReference(typeRef.term, enclosingDecl, context);
            } else if (typeRef.term.nodeType === TypeScript.NodeType.GenericType) {
                symbolAndDiagnostic = this.resolveGenericTypeReference(typeRef.term, enclosingDecl, context);
                typeDeclSymbol = symbolAndDiagnostic.symbol;
            } else if (typeRef.term.nodeType === TypeScript.NodeType.MemberAccessExpression) {
                var dottedName = typeRef.term;

                prevResolvingTypeReference = context.resolvingTypeReference;
                symbolAndDiagnostic = this.resolveDottedTypeNameExpression(dottedName, enclosingDecl, context);
                typeDeclSymbol = symbolAndDiagnostic.symbol;
                context.resolvingTypeReference = prevResolvingTypeReference;
            } else if (typeRef.term.nodeType === TypeScript.NodeType.StringLiteral) {
                var stringConstantAST = typeRef.term;
                typeDeclSymbol = new TypeScript.PullStringConstantTypeSymbol(stringConstantAST.actualText);
                typeDeclSymbol.addDeclaration(new TypeScript.PullDecl(stringConstantAST.actualText, stringConstantAST.actualText, typeDeclSymbol.getKind(), null, new TypeScript.TextSpan(stringConstantAST.minChar, stringConstantAST.getLength()), enclosingDecl.getScriptName()));
            }

            if (!typeDeclSymbol) {
                return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.unitPath, typeRef.term.minChar, typeRef.term.getLength(), TypeScript.DiagnosticCode.Unable_to_resolve_type)]);
            }

            if (typeDeclSymbol.isError()) {
                return SymbolAndDiagnostics.fromSymbol(typeDeclSymbol);
            }

            if (typeRef.arrayCount) {
                var arraySymbol = typeDeclSymbol.getArrayType();

                if (!arraySymbol) {
                    if (!this.cachedArrayInterfaceType) {
                        this.cachedArrayInterfaceType = this.getSymbolFromDeclPath("Array", this.getPathToDecl(enclosingDecl), TypeScript.PullElementKind.Interface);
                    }

                    if (this.cachedArrayInterfaceType && !this.cachedArrayInterfaceType.isResolved()) {
                        this.resolveDeclaredSymbol(this.cachedArrayInterfaceType, enclosingDecl, context);
                    }

                    arraySymbol = TypeScript.specializeToArrayType(this.semanticInfoChain.elementTypeSymbol, typeDeclSymbol, this, context);

                    if (!arraySymbol) {
                        arraySymbol = this.semanticInfoChain.anyTypeSymbol;
                    }
                }

                if (this.cachedArrayInterfaceType && typeRef.arrayCount > 1) {
                    for (var arity = typeRef.arrayCount - 1; arity > 0; arity--) {
                        var existingArraySymbol = arraySymbol.getArrayType();

                        if (!existingArraySymbol) {
                            arraySymbol = TypeScript.specializeToArrayType(this.semanticInfoChain.elementTypeSymbol, arraySymbol, this, context);
                        } else {
                            arraySymbol = existingArraySymbol;
                        }
                    }
                }

                typeDeclSymbol = arraySymbol;
            }

            return SymbolAndDiagnostics.fromSymbol(typeDeclSymbol);
        };

        PullTypeResolver.prototype.resolveVariableDeclaration = function (varDecl, context, enclosingDecl) {
            var decl = this.getDeclForAST(varDecl);
            var declSymbol = decl.getSymbol();
            var declParameterSymbol = decl.getValueDecl() ? decl.getValueDecl().getSymbol() : null;

            if (declSymbol.isResolved()) {
                return declSymbol.getType();
            }

            if (declSymbol.isResolving()) {
                if (!context.inSpecialization) {
                    declSymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    declSymbol.setResolved();
                    return declSymbol;
                }
            }

            declSymbol.startResolving();

            var wrapperDecl = this.getEnclosingDecl(decl);
            wrapperDecl = wrapperDecl ? wrapperDecl : enclosingDecl;

            var diagnostic = null;

            if (varDecl.typeExpr) {
                var typeExprSymbol = this.resolveTypeReference(varDecl.typeExpr, wrapperDecl, context).symbol;

                if (!typeExprSymbol) {
                    diagnostic = context.postError(this.unitPath, varDecl.minChar, varDecl.getLength(), TypeScript.DiagnosticCode.Unable_to_resolve_type_of__0_, [varDecl.id.actualText], decl);
                    declSymbol.setType(this.getNewErrorTypeSymbol(diagnostic));

                    if (declParameterSymbol) {
                        context.setTypeInContext(declParameterSymbol, this.semanticInfoChain.anyTypeSymbol);
                    }
                } else {
                    if (typeExprSymbol.isNamedTypeSymbol() && typeExprSymbol.isGeneric() && !typeExprSymbol.isTypeParameter() && typeExprSymbol.isResolved() && !typeExprSymbol.getIsSpecialized() && typeExprSymbol.getTypeParameters().length && typeExprSymbol.getTypeArguments() == null && this.isTypeRefWithoutTypeArgs(varDecl.typeExpr)) {
                        context.postError(this.unitPath, varDecl.typeExpr.minChar, varDecl.typeExpr.getLength(), TypeScript.DiagnosticCode.Generic_type_references_must_include_all_type_arguments, null, enclosingDecl, true);
                        typeExprSymbol = this.specializeTypeToAny(typeExprSymbol, enclosingDecl, context);
                    }

                    if (typeExprSymbol.isContainer()) {
                        var exportedTypeSymbol = (typeExprSymbol).getExportAssignedTypeSymbol();

                        if (exportedTypeSymbol) {
                            typeExprSymbol = exportedTypeSymbol;
                        } else {
                            var instanceSymbol = (typeExprSymbol.getType()).getInstanceSymbol();

                            if (!instanceSymbol || !TypeScript.PullHelpers.symbolIsEnum(instanceSymbol)) {
                                typeExprSymbol = this.getNewErrorTypeSymbol(diagnostic);
                            } else {
                                typeExprSymbol = instanceSymbol.getType();
                            }
                        }
                    } else if (declSymbol.getIsVarArg() && !(typeExprSymbol.isArray() || typeExprSymbol == this.cachedArrayInterfaceType) && this.cachedArrayInterfaceType) {
                        var diagnostic = context.postError(this.unitPath, varDecl.minChar, varDecl.getLength(), TypeScript.DiagnosticCode.Rest_parameters_must_be_array_types, null, enclosingDecl);
                        typeExprSymbol = this.getNewErrorTypeSymbol(diagnostic);
                    }

                    context.setTypeInContext(declSymbol, typeExprSymbol);

                    if (declParameterSymbol) {
                        declParameterSymbol.setType(typeExprSymbol);
                    }

                    if ((varDecl.nodeType === TypeScript.NodeType.Parameter) && enclosingDecl && ((typeExprSymbol.isGeneric() && !typeExprSymbol.isArray()) || this.isTypeArgumentOrWrapper(typeExprSymbol))) {
                        var signature = enclosingDecl.getSpecializingSignatureSymbol();

                        if (signature) {
                            signature.setHasGenericParameter();
                        }
                    }
                }
            } else if (varDecl.init) {
                var initExprSymbolAndDiagnostics = this.resolveAST(varDecl.init, false, wrapperDecl, context);
                var initExprSymbol = initExprSymbolAndDiagnostics && initExprSymbolAndDiagnostics.symbol;

                if (!initExprSymbol) {
                    diagnostic = context.postError(this.unitPath, varDecl.minChar, varDecl.getLength(), TypeScript.DiagnosticCode.Unable_to_resolve_type_of__0_, [varDecl.id.actualText], decl);

                    context.setTypeInContext(declSymbol, this.getNewErrorTypeSymbol(diagnostic));

                    if (declParameterSymbol) {
                        context.setTypeInContext(declParameterSymbol, this.semanticInfoChain.anyTypeSymbol);
                    }
                } else {
                    context.setTypeInContext(declSymbol, this.widenType(initExprSymbol.getType()));
                    initExprSymbol.addOutgoingLink(declSymbol, TypeScript.SymbolLinkKind.ProvidesInferredType);

                    if (declParameterSymbol) {
                        context.setTypeInContext(declParameterSymbol, initExprSymbol.getType());
                        initExprSymbol.addOutgoingLink(declParameterSymbol, TypeScript.SymbolLinkKind.ProvidesInferredType);
                    }
                }
            } else if (declSymbol.getKind() === TypeScript.PullElementKind.Container) {
                instanceSymbol = (declSymbol).getInstanceSymbol();
                var instanceType = instanceSymbol.getType();

                if (instanceType) {
                    context.setTypeInContext(declSymbol, instanceType);
                } else {
                    context.setTypeInContext(declSymbol, this.semanticInfoChain.anyTypeSymbol);
                }
            } else {
                var defaultType = this.semanticInfoChain.anyTypeSymbol;

                if (declSymbol.getIsVarArg() && this.cachedArrayInterfaceType) {
                    defaultType = TypeScript.specializeToArrayType(this.cachedArrayInterfaceType, defaultType, this, context);
                }

                context.setTypeInContext(declSymbol, defaultType);

                if (declParameterSymbol) {
                    declParameterSymbol.setType(defaultType);
                }
            }

            declSymbol.setResolved();

            if (declParameterSymbol) {
                declParameterSymbol.setResolved();
            }

            return declSymbol;
        };

        PullTypeResolver.prototype.resolveTypeParameterDeclaration = function (typeParameterAST, context) {
            var typeParameterDecl = this.getDeclForAST(typeParameterAST);
            var typeParameterSymbol = typeParameterDecl.getSymbol();

            if (typeParameterSymbol.isResolved() || typeParameterSymbol.isResolving()) {
                return typeParameterSymbol;
            }

            typeParameterSymbol.startResolving();

            if (typeParameterAST.constraint) {
                var enclosingDecl = this.getEnclosingDecl(typeParameterDecl);
                var constraintTypeSymbol = this.resolveTypeReference(typeParameterAST.constraint, enclosingDecl, context).symbol;

                if (constraintTypeSymbol.isNamedTypeSymbol() && constraintTypeSymbol.isGeneric() && !constraintTypeSymbol.isTypeParameter() && constraintTypeSymbol.getTypeParameters().length && constraintTypeSymbol.getTypeArguments() == null && constraintTypeSymbol.isResolved() && this.isTypeRefWithoutTypeArgs(typeParameterAST.constraint)) {
                    context.postError(this.unitPath, typeParameterAST.constraint.minChar, typeParameterAST.constraint.getLength(), TypeScript.DiagnosticCode.Generic_type_references_must_include_all_type_arguments, null, enclosingDecl, true);
                    constraintTypeSymbol = this.specializeTypeToAny(constraintTypeSymbol, enclosingDecl, context);
                }

                if (constraintTypeSymbol) {
                    typeParameterSymbol.setConstraint(constraintTypeSymbol);
                }
            }

            typeParameterSymbol.setResolved();

            return typeParameterSymbol;
        };

        PullTypeResolver.prototype.resolveFunctionBodyReturnTypes = function (funcDeclAST, signature, useContextualType, enclosingDecl, context) {
            var _this = this;
            var returnStatements = [];

            var enclosingDeclStack = [enclosingDecl];

            var preFindReturnExpressionTypes = function (ast, parent, walker) {
                var go = true;

                switch (ast.nodeType) {
                    case TypeScript.NodeType.FunctionDeclaration:
                        go = false;
                        break;

                    case TypeScript.NodeType.ReturnStatement:
                        var returnStatement = ast;
                        returnStatements[returnStatements.length] = { returnStatement: returnStatement, enclosingDecl: enclosingDeclStack[enclosingDeclStack.length - 1] };
                        go = false;
                        break;

                    case TypeScript.NodeType.CatchClause:
                    case TypeScript.NodeType.WithStatement:
                        enclosingDeclStack[enclosingDeclStack.length] = _this.getDeclForAST(ast);
                        break;

                    default:
                        break;
                }

                walker.options.goChildren = go;

                return ast;
            };

            var postFindReturnExpressionEnclosingDecls = function (ast, parent, walker) {
                switch (ast.nodeType) {
                    case TypeScript.NodeType.CatchClause:
                    case TypeScript.NodeType.WithStatement:
                        enclosingDeclStack.length--;
                        break;
                    default:
                        break;
                }

                walker.options.goChildren = true;

                return ast;
            };

            TypeScript.getAstWalkerFactory().walk(funcDeclAST.block, preFindReturnExpressionTypes, postFindReturnExpressionEnclosingDecls);

            if (!returnStatements.length) {
                signature.setReturnType(this.semanticInfoChain.voidTypeSymbol);
            } else {
                var returnExpressionSymbols = [];
                var returnType;

                for (var i = 0; i < returnStatements.length; i++) {
                    if (returnStatements[i].returnStatement.returnExpression) {
                        returnType = this.resolveAST(returnStatements[i].returnStatement.returnExpression, useContextualType, returnStatements[i].enclosingDecl, context).symbol.getType();

                        if (returnType.isError()) {
                            signature.setReturnType(returnType);
                            return;
                        }

                        returnExpressionSymbols[returnExpressionSymbols.length] = returnType;
                    }
                }

                if (!returnExpressionSymbols.length) {
                    signature.setReturnType(this.semanticInfoChain.voidTypeSymbol);
                } else {
                    var collection = {
                        getLength: function () {
                            return returnExpressionSymbols.length;
                        },
                        setTypeAtIndex: function (index, type) {
                        },
                        getTypeAtIndex: function (index) {
                            return returnExpressionSymbols[index].getType();
                        }
                    };

                    returnType = this.findBestCommonType(returnExpressionSymbols[0], null, collection, context, new TypeScript.TypeComparisonInfo());

                    if (useContextualType && returnType == this.semanticInfoChain.anyTypeSymbol) {
                        var contextualType = context.getContextualType();

                        if (contextualType) {
                            returnType = contextualType;
                        }
                    }

                    signature.setReturnType(returnType ? this.widenType(returnType) : this.semanticInfoChain.anyTypeSymbol);

                    if (this.isTypeArgumentOrWrapper(returnType)) {
                        var functionSymbol = this.semanticInfoChain.getSymbolAndDiagnosticsForAST(funcDeclAST, enclosingDecl.getScriptName());

                        if (functionSymbol) {
                            functionSymbol.symbol.getType().setHasGenericSignature();
                        }
                    }

                    for (var i = 0; i < returnExpressionSymbols.length; i++) {
                        returnExpressionSymbols[i].addOutgoingLink(signature, TypeScript.SymbolLinkKind.ProvidesInferredType);
                    }
                }
            }
        };

        PullTypeResolver.prototype.resolveFunctionDeclaration = function (funcDeclAST, context) {
            var funcDecl = this.getDeclForAST(funcDeclAST);

            var funcSymbol = funcDecl.getSymbol();

            var signature = funcDecl.getSpecializingSignatureSymbol();

            var hadError = false;

            var isConstructor = funcDeclAST.isConstructor || TypeScript.hasFlag(funcDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.ConstructMember);

            if (signature) {
                if (signature.isResolved()) {
                    return funcSymbol;
                }

                if (isConstructor && !signature.isResolving()) {
                    var classAST = funcDeclAST.classDecl;

                    if (classAST) {
                        var classDecl = this.getDeclForAST(classAST);
                        var classSymbol = classDecl.getSymbol();

                        if (!classSymbol.isResolved() && !classSymbol.isResolving()) {
                            this.resolveDeclaredSymbol(classSymbol, this.getEnclosingDecl(classDecl), context);
                        }
                    }
                }

                var diagnostic;

                if (signature.isResolving()) {
                    if (funcDeclAST.returnTypeAnnotation) {
                        var returnTypeSymbol = this.resolveTypeReference(funcDeclAST.returnTypeAnnotation, funcDecl, context).symbol;
                        if (!returnTypeSymbol) {
                            diagnostic = context.postError(this.unitPath, funcDeclAST.returnTypeAnnotation.minChar, funcDeclAST.returnTypeAnnotation.getLength(), TypeScript.DiagnosticCode.Cannot_resolve_return_type_reference, null, funcDecl);
                            signature.setReturnType(this.getNewErrorTypeSymbol(diagnostic));
                            hadError = true;
                        } else {
                            if (this.isTypeArgumentOrWrapper(returnTypeSymbol)) {
                                signature.setHasGenericParameter();
                                if (funcSymbol) {
                                    funcSymbol.getType().setHasGenericSignature();
                                }
                            }
                            signature.setReturnType(returnTypeSymbol);

                            if (isConstructor && returnTypeSymbol === this.semanticInfoChain.voidTypeSymbol) {
                                context.postError(this.unitPath, funcDeclAST.minChar, funcDeclAST.getLength(), TypeScript.DiagnosticCode.Constructors_cannot_have_a_return_type_of__void_, null, funcDecl, true);
                            }
                        }
                    } else {
                        signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    }

                    signature.setResolved();
                    return funcSymbol;
                }

                signature.startResolving();

                if (funcDeclAST.typeArguments) {
                    for (var i = 0; i < funcDeclAST.typeArguments.members.length; i++) {
                        this.resolveTypeParameterDeclaration(funcDeclAST.typeArguments.members[i], context);
                    }
                }

                if (funcDeclAST.arguments) {
                    for (var i = 0; i < funcDeclAST.arguments.members.length; i++) {
                        this.resolveVariableDeclaration(funcDeclAST.arguments.members[i], context, funcDecl);
                    }
                }

                if (signature.isGeneric()) {
                    if (funcSymbol) {
                        funcSymbol.getType().setHasGenericSignature();
                    }
                }

                if (funcDeclAST.returnTypeAnnotation) {
                    var prevReturnTypeSymbol = signature.getReturnType();

                    returnTypeSymbol = this.resolveTypeReference(funcDeclAST.returnTypeAnnotation, funcDecl, context).symbol;

                    if (!returnTypeSymbol) {
                        diagnostic = context.postError(this.unitPath, funcDeclAST.returnTypeAnnotation.minChar, funcDeclAST.returnTypeAnnotation.getLength(), TypeScript.DiagnosticCode.Cannot_resolve_return_type_reference, null, funcDecl);
                        signature.setReturnType(this.getNewErrorTypeSymbol(diagnostic));

                        hadError = true;
                    } else if (!(this.isTypeArgumentOrWrapper(returnTypeSymbol) && prevReturnTypeSymbol && !this.isTypeArgumentOrWrapper(prevReturnTypeSymbol))) {
                        if (this.isTypeArgumentOrWrapper(returnTypeSymbol)) {
                            signature.setHasGenericParameter();

                            if (funcSymbol) {
                                funcSymbol.getType().setHasGenericSignature();
                            }
                        }

                        signature.setReturnType(returnTypeSymbol);

                        if (isConstructor && returnTypeSymbol === this.semanticInfoChain.voidTypeSymbol) {
                            context.postError(this.unitPath, funcDeclAST.minChar, funcDeclAST.getLength(), TypeScript.DiagnosticCode.Constructors_cannot_have_a_return_type_of__void_, null, funcDecl, true);
                        }
                    }
                } else if (!funcDeclAST.isConstructor) {
                    if (funcDeclAST.isSignature()) {
                        signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    } else {
                        this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, false, funcDecl, context);
                    }
                }

                if (!hadError) {
                    signature.setResolved();
                }
            }

            return funcSymbol;
        };

        PullTypeResolver.prototype.resolveGetAccessorDeclaration = function (funcDeclAST, context) {
            var funcDecl = this.getDeclForAST(funcDeclAST);
            var accessorSymbol = funcDecl.getSymbol();

            var getterSymbol = accessorSymbol.getGetter();
            var getterTypeSymbol = getterSymbol.getType();

            var signature = getterTypeSymbol.getCallSignatures()[0];

            var hadError = false;
            var diagnostic;

            if (signature) {
                if (signature.isResolved()) {
                    return accessorSymbol;
                }

                if (signature.isResolving()) {
                    signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    signature.setResolved();

                    return accessorSymbol;
                }

                signature.startResolving();

                if (funcDeclAST.arguments) {
                    for (var i = 0; i < funcDeclAST.arguments.members.length; i++) {
                        this.resolveVariableDeclaration(funcDeclAST.arguments.members[i], context, funcDecl);
                    }
                }

                if (signature.hasGenericParameter()) {
                    if (getterSymbol) {
                        getterTypeSymbol.setHasGenericSignature();
                    }
                }

                if (funcDeclAST.returnTypeAnnotation) {
                    var returnTypeSymbol = this.resolveTypeReference(funcDeclAST.returnTypeAnnotation, funcDecl, context).symbol;

                    if (!returnTypeSymbol) {
                        diagnostic = context.postError(this.unitPath, funcDeclAST.returnTypeAnnotation.minChar, funcDeclAST.returnTypeAnnotation.getLength(), TypeScript.DiagnosticCode.Cannot_resolve_return_type_reference, null, funcDecl);
                        signature.setReturnType(this.getNewErrorTypeSymbol(diagnostic));

                        hadError = true;
                    } else {
                        if (this.isTypeArgumentOrWrapper(returnTypeSymbol)) {
                            signature.setHasGenericParameter();

                            if (getterSymbol) {
                                getterTypeSymbol.setHasGenericSignature();
                            }
                        }

                        signature.setReturnType(returnTypeSymbol);
                    }
                } else {
                    if (funcDeclAST.isSignature()) {
                        signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    } else {
                        this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, false, funcDecl, context);
                    }
                }

                if (!hadError) {
                    signature.setResolved();
                }
            }

            var accessorType = signature.getReturnType();

            var setter = accessorSymbol.getSetter();

            if (setter) {
                var setterType = setter.getType();
                var setterSig = setterType.getCallSignatures()[0];

                if (setterSig.isResolved()) {
                    var setterParameters = setterSig.getParameters();

                    if (setterParameters.length) {
                        var setterParameter = setterParameters[0];
                        var setterParameterType = setterParameter.getType();

                        if (!this.typesAreIdentical(accessorType, setterParameterType)) {
                            diagnostic = context.postError(this.unitPath, funcDeclAST.minChar, funcDeclAST.getLength(), TypeScript.DiagnosticCode._get__and__set__accessor_must_have_the_same_type, null, this.getEnclosingDecl(funcDecl));
                            accessorSymbol.setType(this.getNewErrorTypeSymbol(diagnostic));
                        }
                    }
                } else {
                    accessorSymbol.setType(accessorType);
                }
            } else {
                accessorSymbol.setType(accessorType);
            }

            return accessorSymbol;
        };

        PullTypeResolver.prototype.resolveSetAccessorDeclaration = function (funcDeclAST, context) {
            var funcDecl = this.getDeclForAST(funcDeclAST);
            var accessorSymbol = funcDecl.getSymbol();

            var setterSymbol = accessorSymbol.getSetter();
            var setterTypeSymbol = setterSymbol.getType();

            var signature = setterTypeSymbol.getCallSignatures()[0];

            var hadError = false;

            if (signature) {
                if (signature.isResolved()) {
                    return accessorSymbol;
                }

                if (signature.isResolving()) {
                    signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    signature.setResolved();

                    return accessorSymbol;
                }

                signature.startResolving();

                if (funcDeclAST.arguments) {
                    for (var i = 0; i < funcDeclAST.arguments.members.length; i++) {
                        this.resolveVariableDeclaration(funcDeclAST.arguments.members[i], context, funcDecl);
                    }
                }

                if (signature.hasGenericParameter()) {
                    if (setterSymbol) {
                        setterTypeSymbol.setHasGenericSignature();
                    }
                }

                if (!hadError) {
                    signature.setResolved();
                }
            }

            var parameters = signature.getParameters();

            var getter = accessorSymbol.getGetter();

            var accessorType = parameters.length ? parameters[0].getType() : getter ? getter.getType() : this.semanticInfoChain.undefinedTypeSymbol;

            if (getter) {
                var getterType = getter.getType();
                var getterSig = getterType.getCallSignatures()[0];

                if (accessorType == this.semanticInfoChain.undefinedTypeSymbol) {
                    accessorType = getterType;
                }

                if (getterSig.isResolved()) {
                    var getterReturnType = getterSig.getReturnType();

                    if (!this.typesAreIdentical(accessorType, getterReturnType)) {
                        if (this.isAnyOrEquivalent(accessorType)) {
                            accessorSymbol.setType(getterReturnType);
                            if (!accessorType.isError()) {
                                parameters[0].setType(getterReturnType);
                            }
                        } else {
                            var diagnostic = context.postError(this.unitPath, funcDeclAST.minChar, funcDeclAST.getLength(), TypeScript.DiagnosticCode._get__and__set__accessor_must_have_the_same_type, null, this.getEnclosingDecl(funcDecl));
                            accessorSymbol.setType(this.getNewErrorTypeSymbol(diagnostic));
                        }
                    }
                } else {
                    accessorSymbol.setType(accessorType);
                }
            } else {
                accessorSymbol.setType(accessorType);
            }

            return accessorSymbol;
        };

        PullTypeResolver.prototype.resolveAST = function (ast, inContextuallyTypedAssignment, enclosingDecl, context) {
            switch (ast.nodeType) {
                case TypeScript.NodeType.CatchClause:
                case TypeScript.NodeType.WithStatement:
                case TypeScript.NodeType.Script:
                    return SymbolAndDiagnostics.fromSymbol(null);

                case TypeScript.NodeType.ModuleDeclaration:
                    return SymbolAndDiagnostics.fromSymbol(this.resolveModuleDeclaration(ast, context));

                case TypeScript.NodeType.InterfaceDeclaration:
                    return SymbolAndDiagnostics.fromSymbol(this.resolveInterfaceDeclaration(ast, context));

                case TypeScript.NodeType.ClassDeclaration:
                    return SymbolAndDiagnostics.fromSymbol(this.resolveClassDeclaration(ast, context));

                case TypeScript.NodeType.VariableDeclarator:
                case TypeScript.NodeType.Parameter:
                    return SymbolAndDiagnostics.fromSymbol(this.resolveVariableDeclaration(ast, context, enclosingDecl));

                case TypeScript.NodeType.TypeParameter:
                    return SymbolAndDiagnostics.fromSymbol(this.resolveTypeParameterDeclaration(ast, context));

                case TypeScript.NodeType.ImportDeclaration:
                    return SymbolAndDiagnostics.fromSymbol(this.resolveImportDeclaration(ast, context));

                case TypeScript.NodeType.ObjectLiteralExpression:
                    return this.resolveObjectLiteralExpression(ast, inContextuallyTypedAssignment, enclosingDecl, context);

                case TypeScript.NodeType.GenericType:
                    return this.resolveGenericTypeReference(ast, enclosingDecl, context);

                case TypeScript.NodeType.Name:
                    if (context.resolvingTypeReference) {
                        return this.resolveTypeNameExpression(ast, enclosingDecl, context);
                    } else {
                        return this.resolveNameExpression(ast, enclosingDecl, context);
                    }

                case TypeScript.NodeType.MemberAccessExpression:
                    if (context.resolvingTypeReference) {
                        return this.resolveDottedTypeNameExpression(ast, enclosingDecl, context);
                    } else {
                        return this.resolveDottedNameExpression(ast, enclosingDecl, context);
                    }

                case TypeScript.GenericType:
                    return this.resolveGenericTypeReference(ast, enclosingDecl, context);

                case TypeScript.NodeType.FunctionDeclaration: {
                    var funcDecl = ast;

                    if (funcDecl.isGetAccessor()) {
                        return SymbolAndDiagnostics.fromSymbol(this.resolveGetAccessorDeclaration(funcDecl, context));
                    } else if (funcDecl.isSetAccessor()) {
                        return SymbolAndDiagnostics.fromSymbol(this.resolveSetAccessorDeclaration(funcDecl, context));
                    } else if (inContextuallyTypedAssignment || (funcDecl.getFunctionFlags() & TypeScript.FunctionFlags.IsFunctionExpression) || (funcDecl.getFunctionFlags() & TypeScript.FunctionFlags.IsFatArrowFunction) || (funcDecl.getFunctionFlags() & TypeScript.FunctionFlags.IsFunctionProperty)) {
                        return SymbolAndDiagnostics.fromSymbol(this.resolveFunctionExpression(funcDecl, inContextuallyTypedAssignment, enclosingDecl, context));
                    } else {
                        return SymbolAndDiagnostics.fromSymbol(this.resolveFunctionDeclaration(funcDecl, context));
                    }
                }

                case TypeScript.NodeType.ArrayLiteralExpression:
                    return this.resolveArrayLiteralExpression(ast, inContextuallyTypedAssignment, enclosingDecl, context);

                case TypeScript.NodeType.ThisExpression:
                    return this.resolveThisExpression(ast, enclosingDecl, context);

                case TypeScript.NodeType.SuperExpression:
                    return this.resolveSuperExpression(ast, enclosingDecl, context);

                case TypeScript.NodeType.InvocationExpression:
                    return this.resolveCallExpression(ast, inContextuallyTypedAssignment, enclosingDecl, context);

                case TypeScript.NodeType.ObjectCreationExpression:
                    return this.resolveNewExpression(ast, inContextuallyTypedAssignment, enclosingDecl, context);

                case TypeScript.NodeType.CastExpression:
                    return this.resolveTypeAssertionExpression(ast, inContextuallyTypedAssignment, enclosingDecl, context);

                case TypeScript.NodeType.TypeRef:
                    return this.resolveTypeReference(ast, enclosingDecl, context);

                case TypeScript.NodeType.ExportAssignment:
                    return this.resolveExportAssignmentStatement(ast, enclosingDecl, context);

                case TypeScript.NodeType.NumericLiteral:
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.numberTypeSymbol);
                case TypeScript.NodeType.StringLiteral:
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.stringTypeSymbol);
                case TypeScript.NodeType.NullLiteral:
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.nullTypeSymbol);
                case TypeScript.NodeType.TrueLiteral:
                case TypeScript.NodeType.FalseLiteral:
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.booleanTypeSymbol);
                case TypeScript.NodeType.VoidExpression:
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.voidTypeSymbol);

                case TypeScript.NodeType.AssignmentExpression:
                    return this.resolveAssignmentStatement(ast, inContextuallyTypedAssignment, enclosingDecl, context);

                case TypeScript.NodeType.LogicalNotExpression:
                case TypeScript.NodeType.NotEqualsWithTypeConversionExpression:
                case TypeScript.NodeType.EqualsWithTypeConversionExpression:
                case TypeScript.NodeType.EqualsExpression:
                case TypeScript.NodeType.NotEqualsExpression:
                case TypeScript.NodeType.LessThanExpression:
                case TypeScript.NodeType.LessThanOrEqualExpression:
                case TypeScript.NodeType.GreaterThanOrEqualExpression:
                case TypeScript.NodeType.GreaterThanExpression:
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.booleanTypeSymbol);

                case TypeScript.NodeType.AddExpression:
                case TypeScript.NodeType.AddAssignmentExpression:
                    return this.resolveArithmeticExpression(ast, inContextuallyTypedAssignment, enclosingDecl, context);

                case TypeScript.NodeType.SubtractAssignmentExpression:
                case TypeScript.NodeType.MultiplyAssignmentExpression:
                case TypeScript.NodeType.DivideAssignmentExpression:
                case TypeScript.NodeType.ModuloAssignmentExpression:
                case TypeScript.NodeType.OrAssignmentExpression:
                case TypeScript.NodeType.AndAssignmentExpression:

                case TypeScript.NodeType.BitwiseNotExpression:
                case TypeScript.NodeType.SubtractExpression:
                case TypeScript.NodeType.MultiplyExpression:
                case TypeScript.NodeType.DivideExpression:
                case TypeScript.NodeType.ModuloExpression:
                case TypeScript.NodeType.BitwiseOrExpression:
                case TypeScript.NodeType.BitwiseAndExpression:
                case TypeScript.NodeType.PlusExpression:
                case TypeScript.NodeType.NegateExpression:
                case TypeScript.NodeType.PostIncrementExpression:
                case TypeScript.NodeType.PreIncrementExpression:
                case TypeScript.NodeType.PostDecrementExpression:
                case TypeScript.NodeType.PreDecrementExpression:
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.numberTypeSymbol);

                case TypeScript.NodeType.LeftShiftExpression:
                case TypeScript.NodeType.SignedRightShiftExpression:
                case TypeScript.NodeType.UnsignedRightShiftExpression:
                case TypeScript.NodeType.LeftShiftAssignmentExpression:
                case TypeScript.NodeType.SignedRightShiftAssignmentExpression:
                case TypeScript.NodeType.UnsignedRightShiftAssignmentExpression:
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.numberTypeSymbol);

                case TypeScript.NodeType.ElementAccessExpression:
                    return this.resolveIndexExpression(ast, inContextuallyTypedAssignment, enclosingDecl, context);

                case TypeScript.NodeType.LogicalOrExpression:
                    return this.resolveLogicalOrExpression(ast, inContextuallyTypedAssignment, enclosingDecl, context);

                case TypeScript.NodeType.LogicalAndExpression:
                    return this.resolveLogicalAndExpression(ast, inContextuallyTypedAssignment, enclosingDecl, context);

                case TypeScript.NodeType.TypeOfExpression:
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.stringTypeSymbol);

                case TypeScript.NodeType.ThrowStatement:
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.voidTypeSymbol);

                case TypeScript.NodeType.DeleteExpression:
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.booleanTypeSymbol);

                case TypeScript.NodeType.ConditionalExpression:
                    return this.resolveConditionalExpression(ast, enclosingDecl, context);

                case TypeScript.NodeType.RegularExpressionLiteral:
                    return this.resolveRegularExpressionLiteral();

                case TypeScript.NodeType.ParenthesizedExpression:
                    return this.resolveParenthesizedExpression(ast, enclosingDecl, context);

                case TypeScript.NodeType.ExpressionStatement:
                    return this.resolveExpressionStatement(ast, inContextuallyTypedAssignment, enclosingDecl, context);

                case TypeScript.NodeType.InstanceOfExpression:
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.booleanTypeSymbol);
            }

            return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
        };

        PullTypeResolver.prototype.resolveRegularExpressionLiteral = function () {
            if (this.cachedRegExpInterfaceType) {
                return SymbolAndDiagnostics.fromSymbol(this.cachedRegExpInterfaceType);
            } else {
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
            }
        };

        PullTypeResolver.prototype.isNameOrMemberAccessExpression = function (ast) {
            var checkAST = ast;

            while (checkAST) {
                if (checkAST.nodeType === TypeScript.NodeType.ExpressionStatement) {
                    checkAST = (checkAST).expression;
                } else if (checkAST.nodeType === TypeScript.NodeType.ParenthesizedExpression) {
                    checkAST = (checkAST).expression;
                } else if (checkAST.nodeType === TypeScript.NodeType.Name) {
                    return true;
                } else if (checkAST.nodeType === TypeScript.NodeType.MemberAccessExpression) {
                    return true;
                } else {
                    return false;
                }
            }
        };

        PullTypeResolver.prototype.resolveNameSymbol = function (nameSymbol, context) {
            if (nameSymbol && !context.canUseTypeSymbol && nameSymbol != this.semanticInfoChain.undefinedTypeSymbol && nameSymbol != this.semanticInfoChain.nullTypeSymbol && (nameSymbol.isPrimitive() || !(nameSymbol.getKind() & TypeScript.PullElementKind.SomeValue))) {
                nameSymbol = null;
            }

            return nameSymbol;
        };

        PullTypeResolver.prototype.resolveNameExpression = function (nameAST, enclosingDecl, context) {
            var nameSymbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(nameAST);
            var foundCached = nameSymbolAndDiagnostics != null;

            if (!foundCached) {
                nameSymbolAndDiagnostics = this.computeNameExpression(nameAST, enclosingDecl, context);
            }

            var nameSymbol = nameSymbolAndDiagnostics.symbol;
            if (!nameSymbol.isResolved()) {
                this.resolveDeclaredSymbol(nameSymbol, enclosingDecl, context);
            }

            if (!foundCached && !this.isAnyOrEquivalent(nameSymbol.getType())) {
                this.setSymbolAndDiagnosticsForAST(nameAST, nameSymbolAndDiagnostics, context);
            }

            return nameSymbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeNameExpression = function (nameAST, enclosingDecl, context) {
            if (nameAST.isMissing()) {
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
            }

            var id = nameAST.text;

            var declPath = enclosingDecl !== null ? this.getPathToDecl(enclosingDecl) : [];

            if (enclosingDecl && !declPath.length) {
                declPath = [enclosingDecl];
            }

            var aliasSymbol = null;
            var nameSymbol = this.getSymbolFromDeclPath(id, declPath, TypeScript.PullElementKind.SomeValue);

            if (!nameSymbol && id === "arguments" && enclosingDecl && (enclosingDecl.getKind() & TypeScript.PullElementKind.SomeFunction)) {
                nameSymbol = this.cachedFunctionArgumentsSymbol;

                if (this.cachedIArgumentsInterfaceType && !this.cachedIArgumentsInterfaceType.isResolved()) {
                    this.resolveDeclaredSymbol(this.cachedIArgumentsInterfaceType, enclosingDecl, context);
                }
            }

            if (!nameSymbol) {
                return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.unitPath, nameAST.minChar, nameAST.getLength(), TypeScript.DiagnosticCode.Could_not_find_symbol__0_, [nameAST.actualText])]);
            }

            if (nameSymbol.isType() && nameSymbol.isAlias()) {
                aliasSymbol = nameSymbol;

                (aliasSymbol).setIsUsedAsValue();

                if (!nameSymbol.isResolved()) {
                    this.resolveDeclaredSymbol(nameSymbol, enclosingDecl, context);
                }

                var exportAssignmentSymbol = (nameSymbol).getExportAssignedValueSymbol();

                if (exportAssignmentSymbol) {
                    nameSymbol = exportAssignmentSymbol;
                } else {
                    aliasSymbol = null;
                }
            }

            return SymbolAndDiagnostics.fromAlias(nameSymbol, aliasSymbol);
        };

        PullTypeResolver.prototype.resolveDottedNameExpression = function (dottedNameAST, enclosingDecl, context) {
            var symbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(dottedNameAST);
            var foundCached = symbolAndDiagnostics != null;

            if (!foundCached) {
                symbolAndDiagnostics = this.computeDottedNameExpressionSymbol(dottedNameAST, enclosingDecl, context);
            }

            var symbol = symbolAndDiagnostics && symbolAndDiagnostics.symbol;
            if (symbol && !symbol.isResolved()) {
                this.resolveDeclaredSymbol(symbol, enclosingDecl, context);
            }

            if (!foundCached && !this.isAnyOrEquivalent(symbol.getType())) {
                this.setSymbolAndDiagnosticsForAST(dottedNameAST, symbolAndDiagnostics, context);
                this.setSymbolAndDiagnosticsForAST(dottedNameAST.operand2, symbolAndDiagnostics, context);
            }

            return symbolAndDiagnostics;
        };

        PullTypeResolver.prototype.isPrototypeMember = function (dottedNameAST, enclosingDecl, context) {
            var rhsName = (dottedNameAST.operand2).text;
            if (rhsName === "prototype") {
                var prevCanUseTypeSymbol = context.canUseTypeSymbol;
                context.canUseTypeSymbol = true;
                var lhsType = this.resolveAST(dottedNameAST.operand1, false, enclosingDecl, context).symbol.getType();
                context.canUseTypeSymbol = prevCanUseTypeSymbol;

                if (lhsType) {
                    if (lhsType.isClass() || lhsType.isConstructor()) {
                        return true;
                    } else {
                        var classInstanceType = lhsType.getAssociatedContainerType();

                        if (classInstanceType && classInstanceType.isClass()) {
                            return true;
                        }
                    }
                }
            }

            return false;
        };

        PullTypeResolver.prototype.computeDottedNameExpressionSymbol = function (dottedNameAST, enclosingDecl, context) {
            if ((dottedNameAST.operand2).isMissing()) {
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
            }

            var rhsName = (dottedNameAST.operand2).text;
            var prevCanUseTypeSymbol = context.canUseTypeSymbol;
            context.canUseTypeSymbol = true;
            var lhs = this.resolveAST(dottedNameAST.operand1, false, enclosingDecl, context).symbol;
            context.canUseTypeSymbol = prevCanUseTypeSymbol;
            var lhsType = lhs.getType();

            if (lhs.isAlias()) {
                (lhs).setIsUsedAsValue();
            }

            if (this.isAnyOrEquivalent(lhsType)) {
                return SymbolAndDiagnostics.fromSymbol(lhsType);
            }

            if (!lhsType) {
                return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.unitPath, dottedNameAST.operand2.minChar, dottedNameAST.operand2.getLength(), TypeScript.DiagnosticCode.Could_not_find_enclosing_symbol_for_dotted_name__0_, [(dottedNameAST.operand2).actualText])]);
            }

            if ((lhsType === this.semanticInfoChain.numberTypeSymbol || (lhs.getKind() == TypeScript.PullElementKind.EnumMember)) && this.cachedNumberInterfaceType) {
                lhsType = this.cachedNumberInterfaceType;
            } else if (lhsType === this.semanticInfoChain.stringTypeSymbol && this.cachedStringInterfaceType) {
                lhsType = this.cachedStringInterfaceType;
            } else if (lhsType === this.semanticInfoChain.booleanTypeSymbol && this.cachedBooleanInterfaceType) {
                lhsType = this.cachedBooleanInterfaceType;
            }

            if (!lhsType.isResolved()) {
                var potentiallySpecializedType = this.resolveDeclaredSymbol(lhsType, enclosingDecl, context);

                if (potentiallySpecializedType != lhsType) {
                    if (!lhs.isType()) {
                        context.setTypeInContext(lhs, potentiallySpecializedType);
                    }

                    lhsType = potentiallySpecializedType;
                }
            }

            if (lhsType.isContainer() && !lhsType.isAlias()) {
                var instanceSymbol = (lhsType).getInstanceSymbol();

                if (instanceSymbol) {
                    lhsType = instanceSymbol.getType();
                }
            }

            if (this.isPrototypeMember(dottedNameAST, enclosingDecl, context)) {
                if (lhsType.isClass()) {
                    return SymbolAndDiagnostics.fromSymbol(lhsType);
                } else {
                    var classInstanceType = lhsType.getAssociatedContainerType();

                    if (classInstanceType && classInstanceType.isClass()) {
                        return SymbolAndDiagnostics.fromSymbol(classInstanceType);
                    }
                }
            }

            var nameSymbol = null;
            if (!(lhs.isType() && (lhs).isClass() && this.isNameOrMemberAccessExpression(dottedNameAST.operand1)) && !nameSymbol) {
                nameSymbol = lhsType.findMember(rhsName);
                nameSymbol = this.resolveNameSymbol(nameSymbol, context);
            }

            if (!nameSymbol) {
                if (lhsType.isClass()) {
                    var staticType = (lhsType).getConstructorMethod().getType();

                    nameSymbol = staticType.findMember(rhsName);

                    if (!nameSymbol) {
                        nameSymbol = lhsType.findMember(rhsName);
                    }
                } else if ((lhsType.getCallSignatures().length || lhsType.getConstructSignatures().length) && this.cachedFunctionInterfaceType) {
                    nameSymbol = this.cachedFunctionInterfaceType.findMember(rhsName);
                } else if (lhsType.isTypeParameter()) {
                    var constraint = (lhsType).getConstraint();

                    if (constraint) {
                        nameSymbol = constraint.findMember(rhsName);
                    }
                } else if (lhsType.isContainer()) {
                    var containerType = (lhsType.isAlias() ? (lhsType).getType() : lhsType);
                    var associatedInstance = containerType.getInstanceSymbol();

                    if (associatedInstance) {
                        var instanceType = associatedInstance.getType();

                        nameSymbol = instanceType.findMember(rhsName);
                    }
                } else {
                    var associatedType = lhsType.getAssociatedContainerType();

                    if (associatedType) {
                        nameSymbol = associatedType.findMember(rhsName);
                    }
                }

                nameSymbol = this.resolveNameSymbol(nameSymbol, context);

                if (!nameSymbol && !lhsType.isPrimitive() && this.cachedObjectInterfaceType) {
                    nameSymbol = this.cachedObjectInterfaceType.findMember(rhsName);
                }

                if (!nameSymbol) {
                    return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.unitPath, dottedNameAST.operand2.minChar, dottedNameAST.operand2.getLength(), TypeScript.DiagnosticCode.The_property__0__does_not_exist_on_value_of_type__1__, [(dottedNameAST.operand2).actualText, lhsType.getDisplayName()])]);
                }
            }

            return SymbolAndDiagnostics.fromSymbol(nameSymbol);
        };

        PullTypeResolver.prototype.resolveTypeNameExpression = function (nameAST, enclosingDecl, context) {
            var typeNameSymbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(nameAST);

            if (!typeNameSymbolAndDiagnostics || !typeNameSymbolAndDiagnostics.symbol.isType()) {
                typeNameSymbolAndDiagnostics = this.computeTypeNameExpression(nameAST, enclosingDecl, context);
                this.setSymbolAndDiagnosticsForAST(nameAST, typeNameSymbolAndDiagnostics, context);
            }

            var typeNameSymbol = typeNameSymbolAndDiagnostics && typeNameSymbolAndDiagnostics.symbol;
            if (!typeNameSymbol.isResolved()) {
                this.resolveDeclaredSymbol(typeNameSymbol, enclosingDecl, context);
            }

            if (typeNameSymbol && !(typeNameSymbol.isTypeParameter() && (typeNameSymbol).isFunctionTypeParameter() && context.isSpecializingSignatureAtCallSite && !context.isSpecializingConstructorMethod)) {
                var substitution = context.findSpecializationForType(typeNameSymbol);

                if (typeNameSymbol.isTypeParameter() && (substitution != typeNameSymbol)) {
                    if (TypeScript.shouldSpecializeTypeParameterForTypeParameter(substitution, typeNameSymbol)) {
                        typeNameSymbol = substitution;
                    }
                }

                if (typeNameSymbol != typeNameSymbolAndDiagnostics.symbol) {
                    return SymbolAndDiagnostics.fromSymbol(typeNameSymbol);
                }
            }

            return typeNameSymbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeTypeNameExpression = function (nameAST, enclosingDecl, context) {
            if (nameAST.isMissing()) {
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
            }

            var id = nameAST.text;

            if (id === "any") {
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
            } else if (id === "string") {
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.stringTypeSymbol);
            } else if (id === "number") {
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.numberTypeSymbol);
            } else if (id === "bool") {
                if (this.compilationSettings.disallowBool && !this.currentUnit.getProperties().unitContainsBool) {
                    this.currentUnit.getProperties().unitContainsBool = true;
                    return SymbolAndDiagnostics.create(this.semanticInfoChain.booleanTypeSymbol, [context.postError(this.unitPath, nameAST.minChar, nameAST.getLength(), TypeScript.DiagnosticCode.Use_of_deprecated__bool__type__Use__boolean__instead)]);
                } else {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.booleanTypeSymbol);
                }
            } else if (id === "boolean") {
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.booleanTypeSymbol);
            } else if (id === "void") {
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.voidTypeSymbol);
            } else {
                var declPath = enclosingDecl !== null ? this.getPathToDecl(enclosingDecl) : [];

                if (enclosingDecl && !declPath.length) {
                    declPath = [enclosingDecl];
                }

                var kindToCheckFirst = context.resolvingNamespaceMemberAccess ? TypeScript.PullElementKind.SomeContainer : TypeScript.PullElementKind.SomeType;
                var kindToCheckSecond = context.resolvingNamespaceMemberAccess ? TypeScript.PullElementKind.SomeType : TypeScript.PullElementKind.SomeContainer;

                var typeNameSymbol = this.getSymbolFromDeclPath(id, declPath, kindToCheckFirst);

                if (!typeNameSymbol && !context.resolvingNamespaceMemberAccess) {
                    typeNameSymbol = this.getSymbolFromDeclPath(id, declPath, kindToCheckSecond);
                }

                if (!typeNameSymbol) {
                    return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.unitPath, nameAST.minChar, nameAST.getLength(), TypeScript.DiagnosticCode.Could_not_find_symbol__0_, [nameAST.actualText])]);
                }

                if (typeNameSymbol.isAlias()) {
                    if (!typeNameSymbol.isResolved()) {
                        var savedResolvingNamespaceMemberAccess = context.resolvingNamespaceMemberAccess;
                        context.resolvingNamespaceMemberAccess = false;
                        this.resolveDeclaredSymbol(typeNameSymbol, enclosingDecl, context);
                        context.resolvingNamespaceMemberAccess = savedResolvingNamespaceMemberAccess;
                    }

                    var exportAssignmentSymbol = (typeNameSymbol).getExportAssignedTypeSymbol();

                    if (exportAssignmentSymbol) {
                        typeNameSymbol = exportAssignmentSymbol;
                    }
                }

                if (typeNameSymbol.isTypeParameter()) {
                    if (enclosingDecl && (enclosingDecl.getKind() & TypeScript.PullElementKind.SomeFunction) && (enclosingDecl.getFlags() & TypeScript.PullElementFlags.Static)) {
                        var parentDecl = typeNameSymbol.getDeclarations()[0].getParentDecl();

                        if (parentDecl.getKind() == TypeScript.PullElementKind.Class) {
                            return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.unitPath, nameAST.minChar, nameAST.getLength(), TypeScript.DiagnosticCode.Static_methods_cannot_reference_class_type_parameters)]);
                        }
                    }
                }
            }

            return SymbolAndDiagnostics.fromSymbol(typeNameSymbol);
        };

        PullTypeResolver.prototype.addDiagnostic = function (diagnostics, diagnostic) {
            if (!diagnostics) {
                diagnostics = [];
            }

            diagnostics.push(diagnostic);
            return diagnostics;
        };

        PullTypeResolver.prototype.resolveGenericTypeReference = function (genericTypeAST, enclosingDecl, context) {
            var savedResolvingTypeReference = context.resolvingTypeReference;
            context.resolvingTypeReference = true;
            var genericTypeSymbol = this.resolveAST(genericTypeAST.name, false, enclosingDecl, context).symbol.getType();
            context.resolvingTypeReference = savedResolvingTypeReference;

            if (genericTypeSymbol.isError()) {
                return SymbolAndDiagnostics.fromSymbol(genericTypeSymbol);
            }

            if (!genericTypeSymbol.isResolving() && !genericTypeSymbol.isResolved()) {
                this.resolveDeclaredSymbol(genericTypeSymbol, enclosingDecl, context);
            }

            var typeArgs = [];

            if (!context.isResolvingTypeArguments(genericTypeAST)) {
                context.startResolvingTypeArguments(genericTypeAST);

                if (genericTypeAST.typeArguments && genericTypeAST.typeArguments.members.length) {
                    for (var i = 0; i < genericTypeAST.typeArguments.members.length; i++) {
                        var typeArg = this.resolveTypeReference(genericTypeAST.typeArguments.members[i], enclosingDecl, context).symbol;
                        typeArgs[i] = context.findSpecializationForType(typeArg);
                    }
                }

                context.doneResolvingTypeArguments();
            }

            var typeParameters = genericTypeSymbol.getTypeParameters();

            if (typeArgs.length && typeArgs.length != typeParameters.length) {
                return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.unitPath, genericTypeAST.minChar, genericTypeAST.getLength(), TypeScript.DiagnosticCode.Generic_type__0__requires_1_type_argument_s_, [genericTypeSymbol.toString(), genericTypeSymbol.getTypeParameters().length])]);
            }

            var specializedSymbol = TypeScript.specializeType(genericTypeSymbol, typeArgs, this, enclosingDecl, context, genericTypeAST);

            var typeConstraint = null;
            var upperBound = null;
            var diagnostics = null;

            for (var iArg = 0; (iArg < typeArgs.length) && (iArg < typeParameters.length); iArg++) {
                typeArg = typeArgs[iArg];
                typeConstraint = typeParameters[iArg].getConstraint();

                if (typeConstraint) {
                    if (typeConstraint.isTypeParameter()) {
                        for (var j = 0; j < typeParameters.length && j < typeArgs.length; j++) {
                            if (typeParameters[j] == typeConstraint) {
                                typeConstraint = typeArgs[j];
                            }
                        }
                    }

                    if (typeArg.isTypeParameter()) {
                        upperBound = (typeArg).getConstraint();

                        if (upperBound) {
                            typeArg = upperBound;
                        }
                    }

                    if (typeArg.isResolving()) {
                        return SymbolAndDiagnostics.fromSymbol(specializedSymbol);
                    }
                    if (!this.sourceIsAssignableToTarget(typeArg, typeConstraint, context)) {
                        diagnostics = this.addDiagnostic(diagnostics, context.postError(this.unitPath, genericTypeAST.minChar, genericTypeAST.getLength(), TypeScript.DiagnosticCode.Type__0__does_not_satisfy_the_constraint__1__for_type_parameter__2_, [typeArg.toString(true), typeConstraint.toString(true), typeParameters[iArg].toString(true)]));
                    }
                }
            }

            return SymbolAndDiagnostics.create(specializedSymbol, diagnostics);
        };

        PullTypeResolver.prototype.resolveDottedTypeNameExpression = function (dottedNameAST, enclosingDecl, context) {
            var symbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(dottedNameAST);
            if (!symbolAndDiagnostics) {
                symbolAndDiagnostics = this.computeDottedTypeNameExpression(dottedNameAST, enclosingDecl, context);
                this.setSymbolAndDiagnosticsForAST(dottedNameAST, symbolAndDiagnostics, context);
            }

            var symbol = symbolAndDiagnostics.symbol;
            if (!symbol.isResolved()) {
                this.resolveDeclaredSymbol(symbol, enclosingDecl, context);
            }

            return symbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeDottedTypeNameExpression = function (dottedNameAST, enclosingDecl, context) {
            if ((dottedNameAST.operand2).isMissing()) {
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
            }

            var rhsName = (dottedNameAST.operand2).text;

            var savedResolvingTypeReference = context.resolvingTypeReference;
            var savedResolvingNamespaceMemberAccess = context.resolvingNamespaceMemberAccess;
            context.resolvingNamespaceMemberAccess = true;
            context.resolvingTypeReference = true;
            var lhs = this.resolveAST(dottedNameAST.operand1, false, enclosingDecl, context).symbol;
            context.resolvingTypeReference = savedResolvingTypeReference;
            context.resolvingNamespaceMemberAccess = savedResolvingNamespaceMemberAccess;

            var lhsType = lhs.getType();

            if (context.isResolvingClassExtendedType) {
                if (lhs.isAlias()) {
                    (lhs).setIsUsedAsValue();
                }
            }

            if (this.isAnyOrEquivalent(lhsType)) {
                return SymbolAndDiagnostics.fromSymbol(lhsType);
            }

            if (!lhsType) {
                return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.unitPath, dottedNameAST.operand2.minChar, dottedNameAST.operand2.getLength(), TypeScript.DiagnosticCode.Could_not_find_enclosing_symbol_for_dotted_name__0_, [(dottedNameAST.operand2).actualText])]);
            }

            var childTypeSymbol = lhsType.findNestedType(rhsName);

            if (!childTypeSymbol && lhsType.isContainer()) {
                var exportedContainer = (lhsType).getExportAssignedContainerSymbol();

                if (exportedContainer) {
                    childTypeSymbol = exportedContainer.findNestedType(rhsName);
                }
            }

            if (!childTypeSymbol && enclosingDecl) {
                var parentDecl = enclosingDecl;

                while (parentDecl) {
                    if (parentDecl.getKind() & TypeScript.PullElementKind.SomeContainer) {
                        break;
                    }

                    parentDecl = parentDecl.getParentDecl();
                }

                if (parentDecl) {
                    var enclosingSymbolType = parentDecl.getSymbol().getType();

                    if (enclosingSymbolType === lhsType) {
                        childTypeSymbol = lhsType.findContainedMember(rhsName);
                    }
                }
            }

            if (!childTypeSymbol) {
                return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.unitPath, dottedNameAST.operand2.minChar, dottedNameAST.operand2.getLength(), TypeScript.DiagnosticCode.The_property__0__does_not_exist_on_value_of_type__1__, [(dottedNameAST.operand2).actualText, lhsType.getName()])]);
            }

            return SymbolAndDiagnostics.fromSymbol(childTypeSymbol);
        };

        PullTypeResolver.prototype.resolveFunctionExpression = function (funcDeclAST, inContextuallyTypedAssignment, enclosingDecl, context) {
            var functionDecl = this.getDeclForAST(funcDeclAST);
            var funcDeclSymbol = null;

            if (functionDecl) {
                funcDeclSymbol = functionDecl.getSymbol();
                if (funcDeclSymbol.isResolved()) {
                    return funcDeclSymbol;
                }
            }

            var shouldContextuallyType = inContextuallyTypedAssignment;

            var assigningFunctionTypeSymbol = null;
            var assigningFunctionSignature = null;

            if (funcDeclAST.returnTypeAnnotation) {
                shouldContextuallyType = false;
            }

            if (shouldContextuallyType && funcDeclAST.arguments) {
                for (var i = 0; i < funcDeclAST.arguments.members.length; i++) {
                    if ((funcDeclAST.arguments.members[i]).typeExpr) {
                        shouldContextuallyType = false;
                        break;
                    }
                }
            }

            if (shouldContextuallyType) {
                assigningFunctionTypeSymbol = context.getContextualType();

                if (assigningFunctionTypeSymbol) {
                    this.resolveDeclaredSymbol(assigningFunctionTypeSymbol, enclosingDecl, context);

                    if (assigningFunctionTypeSymbol) {
                        assigningFunctionSignature = assigningFunctionTypeSymbol.getCallSignatures()[0];
                    }
                }
            }

            if (!funcDeclSymbol) {
                var semanticInfo = this.semanticInfoChain.getUnit(this.unitPath);
                var declCollectionContext = new TypeScript.DeclCollectionContext(semanticInfo);

                declCollectionContext.scriptName = this.unitPath;

                if (enclosingDecl) {
                    declCollectionContext.pushParent(enclosingDecl);
                }

                TypeScript.getAstWalkerFactory().walk(funcDeclAST, TypeScript.preCollectDecls, TypeScript.postCollectDecls, null, declCollectionContext);

                functionDecl = this.getDeclForAST(funcDeclAST);

                var binder = new TypeScript.PullSymbolBinder(this.compilationSettings, this.semanticInfoChain);
                binder.setUnit(this.unitPath);
                binder.bindFunctionExpressionToPullSymbol(functionDecl);

                funcDeclSymbol = functionDecl.getSymbol();
            }

            var signature = funcDeclSymbol.getType().getCallSignatures()[0];

            if (funcDeclAST.arguments) {
                var contextParams = [];
                var contextParam = null;

                if (assigningFunctionSignature) {
                    contextParams = assigningFunctionSignature.getParameters();
                }

                for (var i = 0; i < funcDeclAST.arguments.members.length; i++) {
                    if ((i < contextParams.length) && !contextParams[i].getIsVarArg()) {
                        contextParam = contextParams[i];
                    } else if (contextParams.length && contextParams[contextParams.length - 1].getIsVarArg()) {
                        contextParam = (contextParams[contextParams.length - 1].getType()).getElementType();
                    }

                    this.resolveFunctionExpressionParameter(funcDeclAST.arguments.members[i], contextParam, functionDecl, context);
                }
            }

            if (funcDeclAST.returnTypeAnnotation) {
                var returnTypeSymbol = this.resolveTypeReference(funcDeclAST.returnTypeAnnotation, functionDecl, context).symbol;

                signature.setReturnType(returnTypeSymbol);
            } else {
                if (assigningFunctionSignature) {
                    var returnType = assigningFunctionSignature.getReturnType();

                    if (returnType) {
                        context.pushContextualType(returnType, context.inProvisionalResolution(), null);

                        this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, true, functionDecl, context);
                        context.popContextualType();
                    } else {
                        signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    }
                } else {
                    this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, false, functionDecl, context);
                }
            }

            if (assigningFunctionTypeSymbol) {
                funcDeclSymbol.addOutgoingLink(assigningFunctionTypeSymbol, TypeScript.SymbolLinkKind.ContextuallyTypedAs);
            }

            funcDeclSymbol.setResolved();

            return funcDeclSymbol;
        };

        PullTypeResolver.prototype.resolveThisExpression = function (ast, enclosingDecl, context) {
            var symbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(ast);

            if (!symbolAndDiagnostics) {
                symbolAndDiagnostics = this.computeThisExpressionSymbol(ast, enclosingDecl, context);
                this.setSymbolAndDiagnosticsForAST(ast, symbolAndDiagnostics, context);
            }

            return symbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeThisExpressionSymbol = function (ast, enclosingDecl, context) {
            if (enclosingDecl) {
                var enclosingDeclKind = enclosingDecl.getKind();
                var diagnostics;

                if (enclosingDeclKind === TypeScript.PullElementKind.Container) {
                    return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.currentUnit.getPath(), ast.minChar, ast.getLength(), TypeScript.DiagnosticCode._this__cannot_be_referenced_within_module_bodies)]);
                } else if (!(enclosingDeclKind & (TypeScript.PullElementKind.SomeFunction | TypeScript.PullElementKind.Script | TypeScript.PullElementKind.SomeBlock))) {
                    return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.currentUnit.getPath(), ast.minChar, ast.getLength(), TypeScript.DiagnosticCode._this__must_only_be_used_inside_a_function_or_script_context)]);
                } else {
                    var declPath = this.getPathToDecl(enclosingDecl);

                    if (declPath.length) {
                        for (var i = declPath.length - 1; i >= 0; i--) {
                            var decl = declPath[i];
                            var declKind = decl.getKind();
                            var declFlags = decl.getFlags();

                            if (declFlags & TypeScript.PullElementFlags.Static) {
                                break;
                            } else if (declKind === TypeScript.PullElementKind.FunctionExpression && !TypeScript.hasFlag(declFlags, TypeScript.PullElementFlags.FatArrow)) {
                                break;
                            } else if (declKind === TypeScript.PullElementKind.Function) {
                                break;
                            } else if (declKind === TypeScript.PullElementKind.Class) {
                                var classSymbol = decl.getSymbol();
                                return SymbolAndDiagnostics.fromSymbol(classSymbol);
                            }
                        }
                    }
                }
            }

            return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
        };

        PullTypeResolver.prototype.resolveSuperExpression = function (ast, enclosingDecl, context) {
            if (!enclosingDecl) {
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
            }

            var declPath = enclosingDecl !== null ? this.getPathToDecl(enclosingDecl) : [];
            var classSymbol = null;

            if (declPath.length) {
                for (var i = declPath.length - 1; i >= 0; i--) {
                    var decl = declPath[i];
                    var declFlags = decl.getFlags();

                    if (decl.getKind() === TypeScript.PullElementKind.FunctionExpression && !(declFlags & TypeScript.PullElementFlags.FatArrow)) {
                        break;
                    } else if (declFlags & TypeScript.PullElementFlags.Static) {
                        break;
                    } else if (decl.getKind() === TypeScript.PullElementKind.Class) {
                        classSymbol = decl.getSymbol();

                        break;
                    }
                }
            }

            if (classSymbol) {
                var parents = classSymbol.getExtendedTypes();

                if (parents.length) {
                    return SymbolAndDiagnostics.fromSymbol(parents[0]);
                }
            }

            return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
        };

        PullTypeResolver.prototype.resolveObjectLiteralExpression = function (expressionAST, inContextuallyTypedAssignment, enclosingDecl, context, additionalResults) {
            var symbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(expressionAST);

            if (!symbolAndDiagnostics || additionalResults) {
                symbolAndDiagnostics = this.computeObjectLiteralExpression(expressionAST, inContextuallyTypedAssignment, enclosingDecl, context, additionalResults);
                this.setSymbolAndDiagnosticsForAST(expressionAST, symbolAndDiagnostics, context);
            }

            return symbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeObjectLiteralExpression = function (expressionAST, inContextuallyTypedAssignment, enclosingDecl, context, additionalResults) {
            var objectLitAST = expressionAST;
            var span = TypeScript.TextSpan.fromBounds(objectLitAST.minChar, objectLitAST.limChar);

            var objectLitDecl = new TypeScript.PullDecl("", "", TypeScript.PullElementKind.ObjectLiteral, TypeScript.PullElementFlags.None, span, this.unitPath);

            if (enclosingDecl) {
                objectLitDecl.setParentDecl(enclosingDecl);
            }

            this.currentUnit.setDeclForAST(objectLitAST, objectLitDecl);
            this.currentUnit.setASTForDecl(objectLitDecl, objectLitAST);

            var typeSymbol = new TypeScript.PullTypeSymbol("", TypeScript.PullElementKind.Interface);
            typeSymbol.addDeclaration(objectLitDecl);
            objectLitDecl.setSymbol(typeSymbol);

            var memberDecls = objectLitAST.operand;

            var contextualType = null;

            if (inContextuallyTypedAssignment) {
                contextualType = context.getContextualType();

                this.resolveDeclaredSymbol(contextualType, enclosingDecl, context);
            }

            if (memberDecls) {
                var binex;
                var memberSymbol;
                var assigningSymbol = null;
                var acceptedContextualType = false;

                if (additionalResults) {
                    additionalResults.membersContextTypeSymbols = [];
                }

                for (var i = 0, len = memberDecls.members.length; i < len; i++) {
                    binex = memberDecls.members[i];

                    var id = binex.operand1;
                    var text;
                    var actualText;

                    if (id.nodeType === TypeScript.NodeType.Name) {
                        actualText = (id).actualText;
                        text = (id).text;
                    } else if (id.nodeType === TypeScript.NodeType.StringLiteral) {
                        actualText = (id).actualText;
                        text = (id).text;
                    } else {
                        return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
                    }

                    span = TypeScript.TextSpan.fromBounds(binex.minChar, binex.limChar);

                    var decl = new TypeScript.PullDecl(text, actualText, TypeScript.PullElementKind.Property, TypeScript.PullElementFlags.Public, span, this.unitPath);

                    objectLitDecl.addChildDecl(decl);
                    decl.setParentDecl(objectLitDecl);

                    this.semanticInfoChain.getUnit(this.unitPath).setDeclForAST(binex, decl);
                    this.semanticInfoChain.getUnit(this.unitPath).setASTForDecl(decl, binex);

                    memberSymbol = new TypeScript.PullSymbol(text, TypeScript.PullElementKind.Property);

                    memberSymbol.addDeclaration(decl);
                    decl.setSymbol(memberSymbol);

                    if (contextualType) {
                        assigningSymbol = contextualType.findMember(text);

                        if (assigningSymbol) {
                            this.resolveDeclaredSymbol(assigningSymbol, enclosingDecl, context);

                            context.pushContextualType(assigningSymbol.getType(), context.inProvisionalResolution(), null);

                            acceptedContextualType = true;

                            if (additionalResults) {
                                additionalResults.membersContextTypeSymbols[i] = assigningSymbol.getType();
                            }
                        }
                    }

                    if (binex.operand2.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                        var funcDeclAST = binex.operand2;

                        if (funcDeclAST.isAccessor()) {
                            var semanticInfo = this.semanticInfoChain.getUnit(this.unitPath);
                            var declCollectionContext = new TypeScript.DeclCollectionContext(semanticInfo);

                            declCollectionContext.scriptName = this.unitPath;

                            declCollectionContext.pushParent(objectLitDecl);

                            TypeScript.getAstWalkerFactory().walk(funcDeclAST, TypeScript.preCollectDecls, TypeScript.postCollectDecls, null, declCollectionContext);

                            var functionDecl = this.getDeclForAST(funcDeclAST);

                            var binder = new TypeScript.PullSymbolBinder(this.compilationSettings, this.semanticInfoChain);
                            binder.setUnit(this.unitPath);
                            binder.pushParent(typeSymbol, objectLitDecl);

                            if (funcDeclAST.isGetAccessor()) {
                                binder.bindGetAccessorDeclarationToPullSymbol(functionDecl);
                            } else {
                                binder.bindSetAccessorDeclarationToPullSymbol(functionDecl);
                            }
                        }
                    }

                    var memberExprType = this.resolveAST(binex.operand2, assigningSymbol != null, enclosingDecl, context).symbol;

                    if (acceptedContextualType) {
                        context.popContextualType();
                        acceptedContextualType = false;
                    }

                    context.setTypeInContext(memberSymbol, memberExprType.getType());

                    memberSymbol.setResolved();

                    this.setSymbolAndDiagnosticsForAST(binex.operand1, SymbolAndDiagnostics.fromSymbol(memberSymbol), context);

                    typeSymbol.addMember(memberSymbol, TypeScript.SymbolLinkKind.PublicMember);
                }
            }

            typeSymbol.setResolved();
            return SymbolAndDiagnostics.fromSymbol(typeSymbol);
        };

        PullTypeResolver.prototype.resolveArrayLiteralExpression = function (arrayLit, inContextuallyTypedAssignment, enclosingDecl, context) {
            var symbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(arrayLit);
            if (!symbolAndDiagnostics) {
                symbolAndDiagnostics = this.computeArrayLiteralExpressionSymbol(arrayLit, inContextuallyTypedAssignment, enclosingDecl, context);
                this.setSymbolAndDiagnosticsForAST(arrayLit, symbolAndDiagnostics, context);
            }

            return symbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeArrayLiteralExpressionSymbol = function (arrayLit, inContextuallyTypedAssignment, enclosingDecl, context) {
            var elements = arrayLit.operand;
            var elementType = this.semanticInfoChain.anyTypeSymbol;
            var elementTypes = [];
            var comparisonInfo = new TypeScript.TypeComparisonInfo();
            var contextualElementType = null;
            comparisonInfo.onlyCaptureFirstError = true;

            if (inContextuallyTypedAssignment) {
                var contextualType = context.getContextualType();

                this.resolveDeclaredSymbol(contextualType, enclosingDecl, context);

                if (contextualType && contextualType.isArray()) {
                    contextualElementType = contextualType.getElementType();
                }
            }

            if (elements) {
                if (inContextuallyTypedAssignment) {
                    context.pushContextualType(contextualElementType, context.inProvisionalResolution(), null);
                }

                for (var i = 0; i < elements.members.length; i++) {
                    elementTypes[elementTypes.length] = this.resolveAST(elements.members[i], inContextuallyTypedAssignment, enclosingDecl, context).symbol.getType();
                }

                if (inContextuallyTypedAssignment) {
                    context.popContextualType();
                }
            }

            if (contextualElementType && !contextualElementType.isTypeParameter()) {
                elementType = contextualElementType;

                for (var i = 0; i < elementTypes.length; i++) {
                    var comparisonInfo = new TypeScript.TypeComparisonInfo();
                    var currentElementType = elementTypes[i];
                    var currentElementAST = elements.members[i];
                    if (!this.sourceIsAssignableToTarget(currentElementType, contextualElementType, context, comparisonInfo)) {
                        var message;
                        if (comparisonInfo.message) {
                            message = context.postError(this.getUnitPath(), currentElementAST.minChar, currentElementAST.getLength(), TypeScript.DiagnosticCode.Cannot_convert__0__to__1__NL__2, [currentElementType.toString(), contextualElementType.toString(), comparisonInfo.message]);
                        } else {
                            message = context.postError(this.getUnitPath(), currentElementAST.minChar, currentElementAST.getLength(), TypeScript.DiagnosticCode.Cannot_convert__0__to__1_, [currentElementType.toString(), contextualElementType.toString()]);
                        }

                        return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [message]);
                    }
                }
            } else {
                if (elementTypes.length) {
                    elementType = elementTypes[0];
                }

                var collection = {
                    getLength: function () {
                        return elements.members.length;
                    },
                    setTypeAtIndex: function (index, type) {
                        elementTypes[index] = type;
                    },
                    getTypeAtIndex: function (index) {
                        return elementTypes[index];
                    }
                };

                elementType = this.findBestCommonType(elementType, null, collection, context, comparisonInfo);

                if (elementType === this.semanticInfoChain.undefinedTypeSymbol || elementType === this.semanticInfoChain.nullTypeSymbol) {
                    elementType = this.semanticInfoChain.anyTypeSymbol;
                }

                if (!elementType) {
                    elementType = this.semanticInfoChain.anyTypeSymbol;
                } else if (contextualType && !contextualType.isTypeParameter()) {
                    if (this.sourceIsAssignableToTarget(elementType, contextualType, context)) {
                        elementType = contextualType;
                    }
                }
            }

            var arraySymbol = elementType.getArrayType();

            if (!arraySymbol) {
                if (!this.cachedArrayInterfaceType) {
                    this.cachedArrayInterfaceType = this.getSymbolFromDeclPath("Array", this.getPathToDecl(enclosingDecl), TypeScript.PullElementKind.Interface);
                }

                if (this.cachedArrayInterfaceType && !this.cachedArrayInterfaceType.isResolved()) {
                    this.resolveDeclaredSymbol(this.cachedArrayInterfaceType, enclosingDecl, context);
                }

                arraySymbol = TypeScript.specializeToArrayType(this.semanticInfoChain.elementTypeSymbol, elementType, this, context);

                if (!arraySymbol) {
                    arraySymbol = this.semanticInfoChain.anyTypeSymbol;
                }
            }

            return SymbolAndDiagnostics.fromSymbol(arraySymbol);
        };

        PullTypeResolver.prototype.resolveIndexExpression = function (callEx, inContextuallyTypedAssignment, enclosingDecl, context) {
            var symbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(callEx);
            if (!symbolAndDiagnostics) {
                symbolAndDiagnostics = this.computeIndexExpressionSymbol(callEx, inContextuallyTypedAssignment, enclosingDecl, context);
                this.setSymbolAndDiagnosticsForAST(callEx, symbolAndDiagnostics, context);
            }

            return symbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeIndexExpressionSymbol = function (callEx, inContextuallyTypedAssignment, enclosingDecl, context) {
            var targetSymbol = this.resolveAST(callEx.operand1, inContextuallyTypedAssignment, enclosingDecl, context).symbol;

            var targetTypeSymbol = targetSymbol.getType();

            if (this.isAnyOrEquivalent(targetTypeSymbol)) {
                return SymbolAndDiagnostics.fromSymbol(targetTypeSymbol);
            }

            var elementType = targetTypeSymbol.getElementType();

            var indexType = this.resolveAST(callEx.operand2, inContextuallyTypedAssignment, enclosingDecl, context).symbol.getType();

            var isNumberIndex = indexType === this.semanticInfoChain.numberTypeSymbol || TypeScript.PullHelpers.symbolIsEnum(indexType);

            if (elementType && isNumberIndex) {
                return SymbolAndDiagnostics.fromSymbol(elementType);
            }

            if (callEx.operand2.nodeType === TypeScript.NodeType.StringLiteral || callEx.operand2.nodeType === TypeScript.NodeType.NumericLiteral) {
                var memberName = callEx.operand2.nodeType === TypeScript.NodeType.StringLiteral ? (callEx.operand2).actualText : TypeScript.quoteStr((callEx.operand2).value.toString());

                var member = targetTypeSymbol.findMember(memberName);

                if (member) {
                    return SymbolAndDiagnostics.fromSymbol(member.getType());
                }
            }

            var signatures = targetTypeSymbol.getIndexSignatures();

            var stringSignature = null;
            var numberSignature = null;
            var signature = null;
            var paramSymbols;
            var paramType;

            for (var i = 0; i < signatures.length; i++) {
                if (stringSignature && numberSignature) {
                    break;
                }

                signature = signatures[i];

                paramSymbols = signature.getParameters();

                if (paramSymbols.length) {
                    paramType = paramSymbols[0].getType();

                    if (paramType === this.semanticInfoChain.stringTypeSymbol) {
                        stringSignature = signatures[i];
                        continue;
                    } else if (paramType === this.semanticInfoChain.numberTypeSymbol || paramType.getKind() === TypeScript.PullElementKind.Enum) {
                        numberSignature = signatures[i];
                        continue;
                    }
                }
            }

            if (numberSignature && (isNumberIndex || indexType === this.semanticInfoChain.anyTypeSymbol)) {
                var returnType = numberSignature.getReturnType();

                if (!returnType) {
                    returnType = this.semanticInfoChain.anyTypeSymbol;
                }

                return SymbolAndDiagnostics.fromSymbol(returnType);
            } else if (stringSignature && (isNumberIndex || indexType === this.semanticInfoChain.anyTypeSymbol || indexType === this.semanticInfoChain.stringTypeSymbol)) {
                var returnType = stringSignature.getReturnType();

                if (!returnType) {
                    returnType = this.semanticInfoChain.anyTypeSymbol;
                }

                return SymbolAndDiagnostics.fromSymbol(returnType);
            } else if (isNumberIndex || indexType === this.semanticInfoChain.anyTypeSymbol || indexType === this.semanticInfoChain.stringTypeSymbol) {
                var returnType = this.semanticInfoChain.anyTypeSymbol;
                return SymbolAndDiagnostics.fromSymbol(returnType);
            } else {
                return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.getUnitPath(), callEx.minChar, callEx.getLength(), TypeScript.DiagnosticCode.Value_of_type__0__is_not_indexable_by_type__1_, [targetTypeSymbol.toString(false), indexType.toString(false)])]);
            }
        };

        PullTypeResolver.prototype.resolveBitwiseOperator = function (expressionAST, inContextuallyTypedAssignment, enclosingDecl, context) {
            var binex = expressionAST;

            var leftType = this.resolveAST(binex.operand1, inContextuallyTypedAssignment, enclosingDecl, context).symbol.getType();
            var rightType = this.resolveAST(binex.operand2, inContextuallyTypedAssignment, enclosingDecl, context).symbol.getType();

            if (this.sourceIsSubtypeOfTarget(leftType, this.semanticInfoChain.numberTypeSymbol, context) && this.sourceIsSubtypeOfTarget(rightType, this.semanticInfoChain.numberTypeSymbol, context)) {
                return this.semanticInfoChain.numberTypeSymbol;
            } else if ((leftType === this.semanticInfoChain.booleanTypeSymbol) && (rightType === this.semanticInfoChain.booleanTypeSymbol)) {
                return this.semanticInfoChain.booleanTypeSymbol;
            } else if (this.isAnyOrEquivalent(leftType)) {
                if ((this.isAnyOrEquivalent(rightType) || (rightType === this.semanticInfoChain.numberTypeSymbol) || (rightType === this.semanticInfoChain.booleanTypeSymbol))) {
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            } else if (this.isAnyOrEquivalent(rightType)) {
                if ((leftType === this.semanticInfoChain.numberTypeSymbol) || (leftType === this.semanticInfoChain.booleanTypeSymbol)) {
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }

            return this.semanticInfoChain.anyTypeSymbol;
        };

        PullTypeResolver.prototype.resolveArithmeticExpression = function (binex, inContextuallyTypedAssignment, enclosingDecl, context) {
            var leftType = this.resolveAST(binex.operand1, inContextuallyTypedAssignment, enclosingDecl, context).symbol.getType();
            var rightType = this.resolveAST(binex.operand2, inContextuallyTypedAssignment, enclosingDecl, context).symbol.getType();

            if (this.isNullOrUndefinedType(leftType)) {
                leftType = rightType;
            }
            if (this.isNullOrUndefinedType(rightType)) {
                rightType = leftType;
            }

            leftType = this.widenType(leftType);
            rightType = this.widenType(rightType);

            if (binex.nodeType === TypeScript.NodeType.AddExpression || binex.nodeType === TypeScript.NodeType.AddAssignmentExpression) {
                if (leftType === this.semanticInfoChain.stringTypeSymbol || rightType === this.semanticInfoChain.stringTypeSymbol) {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.stringTypeSymbol);
                } else if (leftType === this.semanticInfoChain.numberTypeSymbol && rightType === this.semanticInfoChain.numberTypeSymbol) {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.numberTypeSymbol);
                } else if (this.sourceIsSubtypeOfTarget(leftType, this.semanticInfoChain.numberTypeSymbol, context) && this.sourceIsSubtypeOfTarget(rightType, this.semanticInfoChain.numberTypeSymbol, context)) {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.numberTypeSymbol);
                } else {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
                }
            } else {
                if (leftType === this.semanticInfoChain.numberTypeSymbol && rightType === this.semanticInfoChain.numberTypeSymbol) {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.numberTypeSymbol);
                } else if (this.sourceIsSubtypeOfTarget(leftType, this.semanticInfoChain.numberTypeSymbol, context) && this.sourceIsSubtypeOfTarget(rightType, this.semanticInfoChain.numberTypeSymbol, context)) {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.numberTypeSymbol);
                } else if (this.isAnyOrEquivalent(leftType) || this.isAnyOrEquivalent(rightType)) {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.numberTypeSymbol);
                } else {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
                }
            }
        };

        PullTypeResolver.prototype.resolveLogicalOrExpression = function (binex, inContextuallyTypedAssignment, enclosingDecl, context) {
            var symbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(binex);
            if (!symbolAndDiagnostics) {
                symbolAndDiagnostics = this.computeLogicalOrExpressionSymbol(binex, inContextuallyTypedAssignment, enclosingDecl, context);
                this.setSymbolAndDiagnosticsForAST(binex, symbolAndDiagnostics, context);
            }

            return symbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeLogicalOrExpressionSymbol = function (binex, inContextuallyTypedAssignment, enclosingDecl, context) {
            var leftType = this.resolveAST(binex.operand1, inContextuallyTypedAssignment, enclosingDecl, context).symbol.getType();
            var rightType = this.resolveAST(binex.operand2, inContextuallyTypedAssignment, enclosingDecl, context).symbol.getType();

            if (this.isAnyOrEquivalent(leftType) || this.isAnyOrEquivalent(rightType)) {
                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
            } else if (leftType === this.semanticInfoChain.booleanTypeSymbol) {
                if (rightType === this.semanticInfoChain.booleanTypeSymbol) {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.booleanTypeSymbol);
                } else {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
                }
            } else if (leftType === this.semanticInfoChain.numberTypeSymbol) {
                if (rightType === this.semanticInfoChain.numberTypeSymbol) {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.numberTypeSymbol);
                } else {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
                }
            } else if (leftType === this.semanticInfoChain.stringTypeSymbol) {
                if (rightType === this.semanticInfoChain.stringTypeSymbol) {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.stringTypeSymbol);
                } else {
                    return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
                }
            } else if (this.sourceIsSubtypeOfTarget(leftType, rightType, context)) {
                return SymbolAndDiagnostics.fromSymbol(rightType);
            } else if (this.sourceIsSubtypeOfTarget(rightType, leftType, context)) {
                return SymbolAndDiagnostics.fromSymbol(leftType);
            }

            return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
        };

        PullTypeResolver.prototype.resolveLogicalAndExpression = function (binex, inContextuallyTypedAssignment, enclosingDecl, context) {
            return SymbolAndDiagnostics.fromSymbol(this.resolveAST(binex.operand2, inContextuallyTypedAssignment, enclosingDecl, context).symbol.getType());
        };

        PullTypeResolver.prototype.resolveConditionalExpression = function (trinex, enclosingDecl, context) {
            var symbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(trinex);
            if (!symbolAndDiagnostics) {
                symbolAndDiagnostics = this.computeConditionalExpressionSymbol(trinex, enclosingDecl, context);
                this.setSymbolAndDiagnosticsForAST(trinex, symbolAndDiagnostics, context);
            }

            return symbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeConditionalExpressionSymbol = function (trinex, enclosingDecl, context) {
            var leftType = this.resolveAST(trinex.operand2, false, enclosingDecl, context).symbol.getType();
            var rightType = this.resolveAST(trinex.operand3, false, enclosingDecl, context).symbol.getType();

            var symbol = null;
            if (this.typesAreIdentical(leftType, rightType)) {
                symbol = leftType;
            } else if (this.sourceIsSubtypeOfTarget(leftType, rightType, context) || this.sourceIsSubtypeOfTarget(rightType, leftType, context)) {
                var collection = {
                    getLength: function () {
                        return 2;
                    },
                    setTypeAtIndex: function (index, type) {
                    },
                    getTypeAtIndex: function (index) {
                        return rightType;
                    }
                };

                var bestCommonType = this.findBestCommonType(leftType, null, collection, context, new TypeScript.TypeComparisonInfo());

                if (bestCommonType) {
                    symbol = bestCommonType;
                }
            }

            if (!symbol) {
                return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.getUnitPath(), trinex.minChar, trinex.getLength(), TypeScript.DiagnosticCode.Type_of_conditional_expression_cannot_be_determined__Best_common_type_could_not_be_found_between__0__and__1_, [leftType.toString(false), rightType.toString(false)])]);
            }

            return SymbolAndDiagnostics.fromSymbol(symbol);
        };

        PullTypeResolver.prototype.resolveParenthesizedExpression = function (ast, enclosingDecl, context) {
            return this.resolveAST(ast.expression, false, enclosingDecl, context).withoutDiagnostics();
        };

        PullTypeResolver.prototype.resolveExpressionStatement = function (ast, inContextuallyTypedAssignment, enclosingDecl, context) {
            return this.resolveAST(ast.expression, inContextuallyTypedAssignment, enclosingDecl, context).withoutDiagnostics();
        };

        PullTypeResolver.prototype.resolveCallExpression = function (callEx, inContextuallyTypedAssignment, enclosingDecl, context, additionalResults) {
            if (additionalResults) {
                return this.computeCallExpressionSymbol(callEx, inContextuallyTypedAssignment, enclosingDecl, context, additionalResults);
            }

            var symbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(callEx);
            if (!symbolAndDiagnostics || !symbolAndDiagnostics.symbol.isResolved()) {
                symbolAndDiagnostics = this.computeCallExpressionSymbol(callEx, inContextuallyTypedAssignment, enclosingDecl, context, null);
                this.setSymbolAndDiagnosticsForAST(callEx, symbolAndDiagnostics, context);
            }

            return symbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeCallExpressionSymbol = function (callEx, inContextuallyTypedAssignment, enclosingDecl, context, additionalResults) {
            var targetSymbol = this.resolveAST(callEx.target, inContextuallyTypedAssignment, enclosingDecl, context).symbol;
            var targetAST = this.getLastIdentifierInTarget(callEx);

            var targetTypeSymbol = targetSymbol.getType();
            if (this.isAnyOrEquivalent(targetTypeSymbol)) {
                if (callEx.typeArguments) {
                    return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), [context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), TypeScript.DiagnosticCode.Untyped_function_calls_may_not_accept_type_arguments)]);
                }

                return SymbolAndDiagnostics.fromSymbol(this.semanticInfoChain.anyTypeSymbol);
            }

            var diagnostics = [];
            var isSuperCall = false;

            if (callEx.target.nodeType === TypeScript.NodeType.SuperExpression) {
                isSuperCall = true;

                if (targetTypeSymbol.isClass()) {
                    targetSymbol = (targetTypeSymbol).getConstructorMethod();
                    targetTypeSymbol = targetSymbol.getType();
                } else {
                    diagnostics = this.addDiagnostic(diagnostics, context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), TypeScript.DiagnosticCode.Calls_to__super__are_only_valid_inside_a_class));
                    return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), diagnostics);
                }
            }

            var signatures = isSuperCall ? (targetTypeSymbol).getConstructSignatures() : (targetTypeSymbol).getCallSignatures();

            if (!signatures.length && (targetTypeSymbol.getKind() == TypeScript.PullElementKind.ConstructorType)) {
                diagnostics = this.addDiagnostic(diagnostics, context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), TypeScript.DiagnosticCode.Value_of_type__0__is_not_callable__Did_you_mean_to_include__new___, [targetTypeSymbol.toString()]));
            }

            var typeArgs = null;
            var typeReplacementMap = null;
            var couldNotFindGenericOverload = false;
            var couldNotAssignToConstraint;

            if (callEx.typeArguments) {
                typeArgs = [];

                if (callEx.typeArguments && callEx.typeArguments.members.length) {
                    for (var i = 0; i < callEx.typeArguments.members.length; i++) {
                        var typeArg = this.resolveTypeReference(callEx.typeArguments.members[i], enclosingDecl, context).symbol;
                        typeArgs[i] = context.findSpecializationForType(typeArg);
                    }
                }
            } else if (isSuperCall && targetTypeSymbol.isGeneric()) {
                typeArgs = targetTypeSymbol.getTypeArguments();
            }

            if (targetTypeSymbol.isGeneric()) {
                var resolvedSignatures = [];
                var inferredTypeArgs;
                var specializedSignature;
                var typeParameters;
                var typeConstraint = null;
                var prevSpecializingToAny = context.specializingToAny;
                var prevSpecializing = context.isSpecializingSignatureAtCallSite;
                var beforeResolutionSignatures = signatures;
                var triedToInferTypeArgs;

                for (var i = 0; i < signatures.length; i++) {
                    typeParameters = signatures[i].getTypeParameters();
                    couldNotAssignToConstraint = false;
                    triedToInferTypeArgs = false;

                    if (signatures[i].isGeneric() && typeParameters.length) {
                        if (typeArgs) {
                            inferredTypeArgs = typeArgs;
                        } else if (callEx.arguments) {
                            inferredTypeArgs = this.inferArgumentTypesForSignature(signatures[i], callEx.arguments, new TypeScript.TypeComparisonInfo(), enclosingDecl, context);
                            triedToInferTypeArgs = true;
                        }

                        if (inferredTypeArgs) {
                            typeReplacementMap = {};

                            if (inferredTypeArgs.length) {
                                if (inferredTypeArgs.length != typeParameters.length) {
                                    continue;
                                }

                                for (var j = 0; j < typeParameters.length; j++) {
                                    typeReplacementMap[typeParameters[j].getSymbolID().toString()] = inferredTypeArgs[j];
                                }
                                for (var j = 0; j < typeParameters.length; j++) {
                                    typeConstraint = typeParameters[j].getConstraint();

                                    if (typeConstraint) {
                                        if (typeConstraint.isTypeParameter()) {
                                            for (var k = 0; k < typeParameters.length && k < inferredTypeArgs.length; k++) {
                                                if (typeParameters[k] == typeConstraint) {
                                                    typeConstraint = inferredTypeArgs[k];
                                                }
                                            }
                                        }
                                        if (typeConstraint.isTypeParameter()) {
                                            context.pushTypeSpecializationCache(typeReplacementMap);
                                            typeConstraint = TypeScript.specializeType(typeConstraint, null, this, enclosingDecl, context);
                                            context.popTypeSpecializationCache();
                                        }
                                        context.isComparingSpecializedSignatures = true;
                                        if (!this.sourceIsAssignableToTarget(inferredTypeArgs[j], typeConstraint, context)) {
                                            diagnostics = this.addDiagnostic(diagnostics, context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), TypeScript.DiagnosticCode.Type__0__does_not_satisfy_the_constraint__1__for_type_parameter__2_, [inferredTypeArgs[j].toString(true), typeConstraint.toString(true), typeParameters[j].toString(true)]));
                                            couldNotAssignToConstraint = true;
                                        }
                                        context.isComparingSpecializedSignatures = false;

                                        if (couldNotAssignToConstraint) {
                                            break;
                                        }
                                    }
                                }
                            } else {
                                if (triedToInferTypeArgs) {
                                    if (signatures[i].parametersAreFixed()) {
                                        if (signatures[i].hasGenericParameter()) {
                                            context.specializingToAny = true;
                                        } else {
                                            resolvedSignatures[resolvedSignatures.length] = signatures[i];
                                        }
                                    } else {
                                        continue;
                                    }
                                }

                                context.specializingToAny = true;
                            }

                            if (couldNotAssignToConstraint) {
                                continue;
                            }

                            context.isSpecializingSignatureAtCallSite = true;
                            specializedSignature = TypeScript.specializeSignature(signatures[i], false, typeReplacementMap, inferredTypeArgs, this, enclosingDecl, context);

                            context.isSpecializingSignatureAtCallSite = prevSpecializing;
                            context.specializingToAny = prevSpecializingToAny;

                            if (specializedSignature) {
                                resolvedSignatures[resolvedSignatures.length] = specializedSignature;
                            }
                        }
                    } else {
                        if (!(callEx.typeArguments && callEx.typeArguments.members.length)) {
                            resolvedSignatures[resolvedSignatures.length] = signatures[i];
                        }
                    }
                }

                if (signatures.length && !resolvedSignatures.length) {
                    couldNotFindGenericOverload = true;
                }

                signatures = resolvedSignatures;
            }

            var errorCondition = null;

            if (!signatures.length) {
                if (additionalResults) {
                    additionalResults.targetSymbol = targetSymbol;
                    additionalResults.targetTypeSymbol = targetTypeSymbol;
                    additionalResults.resolvedSignatures = beforeResolutionSignatures;
                    additionalResults.candidateSignature = beforeResolutionSignatures && beforeResolutionSignatures.length ? beforeResolutionSignatures[0] : null;

                    additionalResults.actualParametersContextTypeSymbols = actualParametersContextTypeSymbols;
                }

                if (!couldNotFindGenericOverload) {
                    if (this.cachedFunctionInterfaceType && this.sourceIsSubtypeOfTarget(targetTypeSymbol, this.cachedFunctionInterfaceType, context)) {
                        return SymbolAndDiagnostics.create(this.semanticInfoChain.anyTypeSymbol, diagnostics);
                    }

                    diagnostics = this.addDiagnostic(diagnostics, context.postError(this.unitPath, callEx.minChar, callEx.getLength(), TypeScript.DiagnosticCode.Unable_to_invoke_type_with_no_call_signatures));
                    errorCondition = this.getNewErrorTypeSymbol(null);
                } else {
                    diagnostics = this.addDiagnostic(diagnostics, context.postError(this.unitPath, callEx.minChar, callEx.getLength(), TypeScript.DiagnosticCode.Could_not_select_overload_for__call__expression));
                    errorCondition = this.getNewErrorTypeSymbol(null);
                }

                return SymbolAndDiagnostics.create(errorCondition, diagnostics);
            }

            var signature = this.resolveOverloads(callEx, signatures, enclosingDecl, callEx.typeArguments != null, context, diagnostics);
            var useBeforeResolutionSignatures = signature == null;

            if (!signature) {
                diagnostics = this.addDiagnostic(diagnostics, context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), TypeScript.DiagnosticCode.Could_not_select_overload_for__call__expression));

                errorCondition = this.getNewErrorTypeSymbol(null);

                if (!signatures.length) {
                    return SymbolAndDiagnostics.create(errorCondition, diagnostics);
                }

                signature = signatures[0];

                if (callEx.arguments) {
                    for (var k = 0, n = callEx.arguments.members.length; k < n; k++) {
                        var arg = callEx.arguments.members[k];
                        var argSymbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(arg);
                        var argSymbol = argSymbolAndDiagnostics && argSymbolAndDiagnostics.symbol;

                        if (argSymbol) {
                            var argType = argSymbol.getType();
                            if (arg.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                                if (!this.canApplyContextualTypeToFunction(argType, arg, true)) {
                                    continue;
                                }
                            }

                            argSymbol.invalidate();
                        }
                    }
                }
            }

            if (!signature.isGeneric() && callEx.typeArguments) {
                diagnostics = this.addDiagnostic(diagnostics, context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), TypeScript.DiagnosticCode.Non_generic_functions_may_not_accept_type_arguments));
            }

            var returnType = signature.getReturnType();

            var actualParametersContextTypeSymbols = [];
            if (callEx.arguments) {
                var len = callEx.arguments.members.length;
                var params = signature.getParameters();
                var contextualType = null;
                var signatureDecl = signature.getDeclarations()[0];

                for (var i = 0; i < len; i++) {
                    if (params.length) {
                        if (i < params.length - 1 || (i < params.length && !signature.hasVariableParamList())) {
                            if (typeReplacementMap) {
                                context.pushTypeSpecializationCache(typeReplacementMap);
                            }
                            this.resolveDeclaredSymbol(params[i], signatureDecl, context);
                            if (typeReplacementMap) {
                                context.popTypeSpecializationCache();
                            }
                            contextualType = params[i].getType();
                        } else if (signature.hasVariableParamList()) {
                            contextualType = params[params.length - 1].getType();
                            if (contextualType.isArray()) {
                                contextualType = contextualType.getElementType();
                            }
                        }
                    }

                    if (contextualType) {
                        context.pushContextualType(contextualType, context.inProvisionalResolution(), null);
                        actualParametersContextTypeSymbols[i] = contextualType;
                    }

                    this.resolveAST(callEx.arguments.members[i], contextualType != null, enclosingDecl, context);

                    if (contextualType) {
                        context.popContextualType();
                        contextualType = null;
                    }
                }
            }

            if (additionalResults) {
                additionalResults.targetSymbol = targetSymbol;
                additionalResults.targetTypeSymbol = targetTypeSymbol;
                if (useBeforeResolutionSignatures && beforeResolutionSignatures) {
                    additionalResults.resolvedSignatures = beforeResolutionSignatures;
                    additionalResults.candidateSignature = beforeResolutionSignatures[0];
                } else {
                    additionalResults.resolvedSignatures = signatures;
                    additionalResults.candidateSignature = signature;
                }
                additionalResults.actualParametersContextTypeSymbols = actualParametersContextTypeSymbols;
            }

            if (errorCondition) {
                return SymbolAndDiagnostics.create(errorCondition, diagnostics);
            }

            if (!returnType) {
                returnType = this.semanticInfoChain.anyTypeSymbol;
            }

            return SymbolAndDiagnostics.fromSymbol(returnType);
        };

        PullTypeResolver.prototype.resolveNewExpression = function (callEx, inContextuallyTypedAssignment, enclosingDecl, context, additionalResults) {
            if (additionalResults) {
                return this.computeNewExpressionSymbol(callEx, inContextuallyTypedAssignment, enclosingDecl, context, additionalResults);
            }

            var symbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(callEx);
            if (!symbolAndDiagnostics || !symbolAndDiagnostics.symbol.isResolved()) {
                symbolAndDiagnostics = this.computeNewExpressionSymbol(callEx, inContextuallyTypedAssignment, enclosingDecl, context, null);
                this.setSymbolAndDiagnosticsForAST(callEx, symbolAndDiagnostics, context);
            }

            return symbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeNewExpressionSymbol = function (callEx, inContextuallyTypedAssignment, enclosingDecl, context, additionalResults) {
            var returnType = null;

            var targetSymbol = this.resolveAST(callEx.target, inContextuallyTypedAssignment, enclosingDecl, context).symbol;
            var targetTypeSymbol = targetSymbol.isType() ? targetSymbol : targetSymbol.getType();

            var targetAST = this.getLastIdentifierInTarget(callEx);

            if (targetTypeSymbol.isClass()) {
                targetTypeSymbol = (targetTypeSymbol).getConstructorMethod().getType();
            }

            var constructSignatures = targetTypeSymbol.getConstructSignatures();

            var typeArgs = null;
            var typeReplacementMap = null;
            var usedCallSignaturesInstead = false;
            var couldNotAssignToConstraint;

            if (this.isAnyOrEquivalent(targetTypeSymbol)) {
                return SymbolAndDiagnostics.fromSymbol(targetTypeSymbol);
            }

            if (!constructSignatures.length) {
                constructSignatures = targetTypeSymbol.getCallSignatures();
                usedCallSignaturesInstead = true;
            }

            var diagnostics = [];
            if (constructSignatures.length) {
                if (callEx.typeArguments) {
                    typeArgs = [];

                    if (callEx.typeArguments && callEx.typeArguments.members.length) {
                        for (var i = 0; i < callEx.typeArguments.members.length; i++) {
                            var typeArg = this.resolveTypeReference(callEx.typeArguments.members[i], enclosingDecl, context).symbol;
                            typeArgs[i] = context.findSpecializationForType(typeArg);
                        }
                    }
                }

                if (targetTypeSymbol.isGeneric()) {
                    var resolvedSignatures = [];
                    var inferredTypeArgs;
                    var specializedSignature;
                    var typeParameters;
                    var typeConstraint = null;
                    var prevSpecializingToAny = context.specializingToAny;
                    var prevIsSpecializing = context.isSpecializingSignatureAtCallSite = true;
                    var triedToInferTypeArgs;

                    for (var i = 0; i < constructSignatures.length; i++) {
                        couldNotAssignToConstraint = false;

                        if (constructSignatures[i].isGeneric()) {
                            if (typeArgs) {
                                inferredTypeArgs = typeArgs;
                            } else if (callEx.arguments) {
                                inferredTypeArgs = this.inferArgumentTypesForSignature(constructSignatures[i], callEx.arguments, new TypeScript.TypeComparisonInfo(), enclosingDecl, context);
                                triedToInferTypeArgs = true;
                            }

                            if (inferredTypeArgs) {
                                typeParameters = constructSignatures[i].getTypeParameters();

                                typeReplacementMap = {};

                                if (inferredTypeArgs.length) {
                                    if (inferredTypeArgs.length < typeParameters.length) {
                                        continue;
                                    }

                                    for (var j = 0; j < typeParameters.length; j++) {
                                        typeReplacementMap[typeParameters[j].getSymbolID().toString()] = inferredTypeArgs[j];
                                    }
                                    for (var j = 0; j < typeParameters.length; j++) {
                                        typeConstraint = typeParameters[j].getConstraint();

                                        if (typeConstraint) {
                                            if (typeConstraint.isTypeParameter()) {
                                                for (var k = 0; k < typeParameters.length && k < inferredTypeArgs.length; k++) {
                                                    if (typeParameters[k] == typeConstraint) {
                                                        typeConstraint = inferredTypeArgs[k];
                                                    }
                                                }
                                            }
                                            if (typeConstraint.isTypeParameter()) {
                                                context.pushTypeSpecializationCache(typeReplacementMap);
                                                typeConstraint = TypeScript.specializeType(typeConstraint, null, this, enclosingDecl, context);
                                                context.popTypeSpecializationCache();
                                            }

                                            context.isComparingSpecializedSignatures = true;
                                            if (!this.sourceIsAssignableToTarget(inferredTypeArgs[j], typeConstraint, context)) {
                                                diagnostics = this.addDiagnostic(diagnostics, context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), TypeScript.DiagnosticCode.Type__0__does_not_satisfy_the_constraint__1__for_type_parameter__2_, [inferredTypeArgs[j].toString(true), typeConstraint.toString(true), typeParameters[j].toString(true)]));
                                                couldNotAssignToConstraint = true;
                                            }
                                            context.isComparingSpecializedSignatures = false;

                                            if (couldNotAssignToConstraint) {
                                                break;
                                            }
                                        }
                                    }
                                } else {
                                    if (triedToInferTypeArgs) {
                                        if (constructSignatures[i].parametersAreFixed()) {
                                            if (constructSignatures[i].hasGenericParameter()) {
                                                context.specializingToAny = true;
                                            } else {
                                                resolvedSignatures[resolvedSignatures.length] = constructSignatures[i];
                                            }
                                        } else {
                                            continue;
                                        }
                                    }

                                    context.specializingToAny = true;
                                }

                                if (couldNotAssignToConstraint) {
                                    continue;
                                }

                                context.isSpecializingSignatureAtCallSite = true;
                                specializedSignature = TypeScript.specializeSignature(constructSignatures[i], false, typeReplacementMap, inferredTypeArgs, this, enclosingDecl, context);

                                context.specializingToAny = prevSpecializingToAny;
                                context.isSpecializingSignatureAtCallSite = prevIsSpecializing;

                                if (specializedSignature) {
                                    resolvedSignatures[resolvedSignatures.length] = specializedSignature;
                                }
                            }
                        } else {
                            if (!(callEx.typeArguments && callEx.typeArguments.members.length)) {
                                resolvedSignatures[resolvedSignatures.length] = constructSignatures[i];
                            }
                        }
                    }

                    constructSignatures = resolvedSignatures;
                }

                var signature = this.resolveOverloads(callEx, constructSignatures, enclosingDecl, callEx.typeArguments != null, context, diagnostics);

                if (additionalResults) {
                    additionalResults.targetSymbol = targetSymbol;
                    additionalResults.targetTypeSymbol = targetTypeSymbol;
                    additionalResults.resolvedSignatures = constructSignatures;
                    additionalResults.candidateSignature = signature;
                    additionalResults.actualParametersContextTypeSymbols = [];
                }

                if (!constructSignatures.length && diagnostics) {
                    var result = this.getNewErrorTypeSymbol(null);
                    return SymbolAndDiagnostics.create(result, diagnostics);
                }

                var errorCondition = null;

                if (!signature) {
                    diagnostics = this.addDiagnostic(diagnostics, context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), TypeScript.DiagnosticCode.Could_not_select_overload_for__new__expression));

                    errorCondition = this.getNewErrorTypeSymbol(null);

                    if (!constructSignatures.length) {
                        return SymbolAndDiagnostics.create(errorCondition, diagnostics);
                    }

                    signature = constructSignatures[0];

                    if (callEx.arguments) {
                        for (var k = 0, n = callEx.arguments.members.length; k < n; k++) {
                            var arg = callEx.arguments.members[k];
                            var argSymbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(arg);
                            var argSymbol = argSymbolAndDiagnostics && argSymbolAndDiagnostics.symbol;

                            if (argSymbol) {
                                var argType = argSymbol.getType();
                                if (arg.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                                    if (!this.canApplyContextualTypeToFunction(argType, arg, true)) {
                                        continue;
                                    }
                                }

                                argSymbol.invalidate();
                            }
                        }
                    }
                }

                returnType = signature.getReturnType();

                if (returnType && !signature.isGeneric() && returnType.isGeneric() && !returnType.getIsSpecialized()) {
                    if (typeArgs && typeArgs.length) {
                        returnType = TypeScript.specializeType(returnType, typeArgs, this, enclosingDecl, context, callEx);
                    } else {
                        returnType = this.specializeTypeToAny(returnType, enclosingDecl, context);
                    }
                }

                if (usedCallSignaturesInstead) {
                    if (returnType != this.semanticInfoChain.voidTypeSymbol) {
                        diagnostics = this.addDiagnostic(diagnostics, context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), TypeScript.DiagnosticCode.Call_signatures_used_in_a__new__expression_must_have_a__void__return_type));
                        return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), diagnostics);
                    } else {
                        returnType = this.semanticInfoChain.anyTypeSymbol;
                    }
                }

                if (!returnType) {
                    returnType = signature.getReturnType();

                    if (!returnType) {
                        returnType = targetTypeSymbol;
                    }
                }

                var actualParametersContextTypeSymbols = [];
                if (callEx.arguments) {
                    var len = callEx.arguments.members.length;
                    var params = signature.getParameters();
                    var contextualType = null;
                    var signatureDecl = signature.getDeclarations()[0];

                    for (var i = 0; i < len; i++) {
                        if (params.length) {
                            if (i < params.length - 1 || (i < params.length && !signature.hasVariableParamList())) {
                                if (typeReplacementMap) {
                                    context.pushTypeSpecializationCache(typeReplacementMap);
                                }
                                this.resolveDeclaredSymbol(params[i], signatureDecl, context);
                                if (typeReplacementMap) {
                                    context.popTypeSpecializationCache();
                                }
                                contextualType = params[i].getType();
                            } else if (signature.hasVariableParamList()) {
                                contextualType = params[params.length - 1].getType();
                                if (contextualType.isArray()) {
                                    contextualType = contextualType.getElementType();
                                }
                            }
                        }

                        if (contextualType) {
                            context.pushContextualType(contextualType, context.inProvisionalResolution(), null);
                            actualParametersContextTypeSymbols[i] = contextualType;
                        }

                        this.resolveAST(callEx.arguments.members[i], contextualType != null, enclosingDecl, context);

                        if (contextualType) {
                            context.popContextualType();
                            contextualType = null;
                        }
                    }
                }

                if (additionalResults) {
                    additionalResults.targetSymbol = targetSymbol;
                    additionalResults.targetTypeSymbol = targetTypeSymbol;
                    additionalResults.resolvedSignatures = constructSignatures;
                    additionalResults.candidateSignature = signature;
                    additionalResults.actualParametersContextTypeSymbols = actualParametersContextTypeSymbols;
                }

                if (errorCondition) {
                    return SymbolAndDiagnostics.create(errorCondition, diagnostics);
                }

                if (!returnType) {
                    returnType = this.semanticInfoChain.anyTypeSymbol;
                }

                return SymbolAndDiagnostics.fromSymbol(returnType);
            } else if (targetTypeSymbol.isClass()) {
                return SymbolAndDiagnostics.fromSymbol(returnType);
            }

            diagnostics = this.addDiagnostic(diagnostics, context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), TypeScript.DiagnosticCode.Invalid__new__expression));

            return SymbolAndDiagnostics.create(this.getNewErrorTypeSymbol(null), diagnostics);
        };

        PullTypeResolver.prototype.resolveTypeAssertionExpression = function (assertionExpression, inContextuallyTypedAssignment, enclosingDecl, context) {
            return this.resolveTypeReference(assertionExpression.castTerm, enclosingDecl, context).withoutDiagnostics();
        };

        PullTypeResolver.prototype.resolveAssignmentStatement = function (binex, inContextuallyTypedAssignment, enclosingDecl, context) {
            var symbolAndDiagnostics = this.getSymbolAndDiagnosticsForAST(binex);

            if (!symbolAndDiagnostics) {
                symbolAndDiagnostics = this.computeAssignmentStatementSymbol(binex, inContextuallyTypedAssignment, enclosingDecl, context);
                this.setSymbolAndDiagnosticsForAST(binex, symbolAndDiagnostics, context);
            }

            return symbolAndDiagnostics;
        };

        PullTypeResolver.prototype.computeAssignmentStatementSymbol = function (binex, inContextuallyTypedAssignment, enclosingDecl, context) {
            var leftType = this.resolveAST(binex.operand1, inContextuallyTypedAssignment, enclosingDecl, context).symbol.getType();

            context.pushContextualType(leftType, context.inProvisionalResolution(), null);
            this.resolveAST(binex.operand2, true, enclosingDecl, context);
            context.popContextualType();

            return SymbolAndDiagnostics.fromSymbol(leftType);
        };

        PullTypeResolver.prototype.resolveBoundDecls = function (decl, context) {
            if (!decl) {
                return;
            }

            switch (decl.getKind()) {
                case TypeScript.PullElementKind.Script:
                    var childDecls = decl.getChildDecls();
                    for (var i = 0; i < childDecls.length; i++) {
                        this.resolveBoundDecls(childDecls[i], context);
                    }
                    break;
                case TypeScript.PullElementKind.DynamicModule:
                case TypeScript.PullElementKind.Container:
                case TypeScript.PullElementKind.Enum:
                    var moduleDecl = this.semanticInfoChain.getASTForDecl(decl);
                    this.resolveModuleDeclaration(moduleDecl, context);
                    break;
                case TypeScript.PullElementKind.Interface:
                    var interfaceDecl = this.semanticInfoChain.getASTForDecl(decl);
                    this.resolveInterfaceDeclaration(interfaceDecl, context);
                    break;
                case TypeScript.PullElementKind.Class:
                    var classDecl = this.semanticInfoChain.getASTForDecl(decl);
                    this.resolveClassDeclaration(classDecl, context);
                    break;
                case TypeScript.PullElementKind.Method:
                case TypeScript.PullElementKind.Function:
                    var funcDecl = this.semanticInfoChain.getASTForDecl(decl);
                    this.resolveFunctionDeclaration(funcDecl, context);
                    break;
                case TypeScript.PullElementKind.GetAccessor:
                    funcDecl = this.semanticInfoChain.getASTForDecl(decl);
                    this.resolveGetAccessorDeclaration(funcDecl, context);
                    break;
                case TypeScript.PullElementKind.SetAccessor:
                    funcDecl = this.semanticInfoChain.getASTForDecl(decl);
                    this.resolveSetAccessorDeclaration(funcDecl, context);
                    break;
                case TypeScript.PullElementKind.Property:
                case TypeScript.PullElementKind.Variable:
                case TypeScript.PullElementKind.Parameter:
                    var varDecl = this.semanticInfoChain.getASTForDecl(decl);

                    if (varDecl) {
                        this.resolveVariableDeclaration(varDecl, context);
                    }
                    break;
            }
        };

        PullTypeResolver.prototype.mergeOrdered = function (a, b, context, comparisonInfo) {
            if (this.isAnyOrEquivalent(a) || this.isAnyOrEquivalent(b)) {
                return this.semanticInfoChain.anyTypeSymbol;
            } else if (a === b) {
                return a;
            } else if ((b === this.semanticInfoChain.nullTypeSymbol) && a != this.semanticInfoChain.nullTypeSymbol) {
                return a;
            } else if ((a === this.semanticInfoChain.nullTypeSymbol) && (b != this.semanticInfoChain.nullTypeSymbol)) {
                return b;
            } else if ((a === this.semanticInfoChain.voidTypeSymbol) && (b === this.semanticInfoChain.voidTypeSymbol || b === this.semanticInfoChain.undefinedTypeSymbol || b === this.semanticInfoChain.nullTypeSymbol)) {
                return a;
            } else if ((a === this.semanticInfoChain.voidTypeSymbol) && (b === this.semanticInfoChain.anyTypeSymbol)) {
                return b;
            } else if ((b === this.semanticInfoChain.undefinedTypeSymbol) && a != this.semanticInfoChain.voidTypeSymbol) {
                return a;
            } else if ((a === this.semanticInfoChain.undefinedTypeSymbol) && (b != this.semanticInfoChain.undefinedTypeSymbol)) {
                return b;
            } else if (a.isTypeParameter() && !b.isTypeParameter()) {
                return b;
            } else if (!a.isTypeParameter() && b.isTypeParameter()) {
                return a;
            } else if (a.isArray() && b.isArray()) {
                if (a.getElementType() === b.getElementType()) {
                    return a;
                } else {
                    var mergedET = this.mergeOrdered(a.getElementType(), b.getElementType(), context, comparisonInfo);
                    if (mergedET) {
                        var mergedArrayType = mergedET.getArrayType();

                        if (!mergedArrayType) {
                            mergedArrayType = TypeScript.specializeToArrayType(this.semanticInfoChain.elementTypeSymbol, mergedET, this, context);
                        }

                        return mergedArrayType;
                    }
                }
            } else if (this.sourceIsSubtypeOfTarget(a, b, context, comparisonInfo)) {
                return b;
            } else if (this.sourceIsSubtypeOfTarget(b, a, context, comparisonInfo)) {
                return a;
            }

            return null;
        };

        PullTypeResolver.prototype.widenType = function (type) {
            if (type === this.semanticInfoChain.undefinedTypeSymbol || type === this.semanticInfoChain.nullTypeSymbol || type.isError()) {
                return this.semanticInfoChain.anyTypeSymbol;
            }

            return type;
        };

        PullTypeResolver.prototype.isNullOrUndefinedType = function (type) {
            return type === this.semanticInfoChain.nullTypeSymbol || type === this.semanticInfoChain.undefinedTypeSymbol;
        };

        PullTypeResolver.prototype.canApplyContextualType = function (type) {
            if (!type) {
                return true;
            }

            var kind = type.getKind();

            if ((kind & TypeScript.PullElementKind.ObjectType) != 0) {
                return true;
            }
            if ((kind & TypeScript.PullElementKind.Interface) != 0) {
                return true;
            } else if ((kind & TypeScript.PullElementKind.SomeFunction) != 0) {
                return this.canApplyContextualTypeToFunction(type, this.semanticInfoChain.getASTForDecl(type.getDeclarations[0]), true);
            } else if ((kind & TypeScript.PullElementKind.Array) != 0) {
                return true;
            } else if (type == this.semanticInfoChain.anyTypeSymbol || kind != TypeScript.PullElementKind.Primitive) {
                return true;
            }

            return false;
        };

        PullTypeResolver.prototype.findBestCommonType = function (initialType, targetType, collection, context, comparisonInfo) {
            var len = collection.getLength();
            var nlastChecked = 0;
            var bestCommonType = initialType;

            if (targetType && this.canApplyContextualType(bestCommonType)) {
                if (bestCommonType) {
                    bestCommonType = this.mergeOrdered(bestCommonType, targetType, context);
                } else {
                    bestCommonType = targetType;
                }
            }

            var convergenceType = bestCommonType;

            while (nlastChecked < len) {
                for (var i = 0; i < len; i++) {
                    if (i === nlastChecked) {
                        continue;
                    }

                    if (convergenceType && (bestCommonType = this.mergeOrdered(convergenceType, collection.getTypeAtIndex(i), context, comparisonInfo))) {
                        convergenceType = bestCommonType;
                    }

                    if (bestCommonType === null || this.isAnyOrEquivalent(bestCommonType)) {
                        break;
                    } else if (targetType && !(bestCommonType.isTypeParameter() || targetType.isTypeParameter())) {
                        collection.setTypeAtIndex(i, targetType);
                    }
                }

                if (convergenceType && bestCommonType) {
                    break;
                }

                nlastChecked++;
                if (nlastChecked < len) {
                    convergenceType = collection.getTypeAtIndex(nlastChecked);
                }
            }

            if (!bestCommonType) {
                var emptyTypeDecl = new TypeScript.PullDecl("{}", "{}", TypeScript.PullElementKind.ObjectType, TypeScript.PullElementFlags.None, new TypeScript.TextSpan(0, 0), this.currentUnit.getPath());
                var emptyType = new TypeScript.PullTypeSymbol("{}", TypeScript.PullElementKind.ObjectType);

                emptyTypeDecl.setSymbol(emptyType);
                emptyType.addDeclaration(emptyTypeDecl);

                bestCommonType = emptyType;
            }

            return bestCommonType;
        };

        PullTypeResolver.prototype.typesAreIdentical = function (t1, t2, val) {
            if (t1 === t2) {
                return true;
            }

            if (!t1 || !t2) {
                return false;
            }

            if (val && t1.isPrimitive() && (t1).isStringConstant() && t2 === this.semanticInfoChain.stringTypeSymbol) {
                return (val.nodeType === TypeScript.NodeType.StringLiteral) && (TypeScript.stripQuotes((val).actualText) === TypeScript.stripQuotes(t1.getName()));
            }

            if (val && t2.isPrimitive() && (t2).isStringConstant() && t2 === this.semanticInfoChain.stringTypeSymbol) {
                return (val.nodeType === TypeScript.NodeType.StringLiteral) && (TypeScript.stripQuotes((val).actualText) === TypeScript.stripQuotes(t2.getName()));
            }

            if (t1.isPrimitive() && (t1).isStringConstant() && t2.isPrimitive() && (t2).isStringConstant()) {
                return TypeScript.stripQuotes(t1.getName()) === TypeScript.stripQuotes(t2.getName());
            }

            if (t1.isPrimitive() || t2.isPrimitive()) {
                return false;
            }

            if (t1.isClass()) {
                return false;
            }

            if (t1.isError() && t2.isError()) {
                return true;
            }

            if (t1.isTypeParameter()) {
                if (!t2.isTypeParameter()) {
                    return false;
                }

                var t1ParentDeclaration = t1.getDeclarations()[0].getParentDecl();
                var t2ParentDeclaration = t2.getDeclarations()[0].getParentDecl();

                if (t1ParentDeclaration === t2ParentDeclaration) {
                    return this.symbolsShareDeclaration(t1, t2);
                } else {
                    return true;
                }
            }

            var comboId = t2.getSymbolID().toString() + "#" + t1.getSymbolID().toString();

            if (this.identicalCache[comboId] != undefined) {
                return true;
            }

            if ((t1.getKind() & TypeScript.PullElementKind.Enum) || (t2.getKind() & TypeScript.PullElementKind.Enum)) {
                return t1.getAssociatedContainerType() === t2 || t2.getAssociatedContainerType() === t1;
            }

            if (t1.isArray() || t2.isArray()) {
                if (!(t1.isArray() && t2.isArray())) {
                    return false;
                }
                this.identicalCache[comboId] = false;
                var ret = this.typesAreIdentical(t1.getElementType(), t2.getElementType());
                if (ret) {
                    this.identicalCache[comboId] = true;
                } else {
                    this.identicalCache[comboId] = undefined;
                }

                return ret;
            }

            if (t1.isPrimitive() != t2.isPrimitive()) {
                return false;
            }

            this.identicalCache[comboId] = false;

            if (t1.hasMembers() && t2.hasMembers()) {
                var t1Members = t1.getMembers();
                var t2Members = t2.getMembers();

                if (t1Members.length != t2Members.length) {
                    this.identicalCache[comboId] = undefined;
                    return false;
                }

                var t1MemberSymbol = null;
                var t2MemberSymbol = null;

                var t1MemberType = null;
                var t2MemberType = null;

                for (var iMember = 0; iMember < t1Members.length; iMember++) {
                    t1MemberSymbol = t1Members[iMember];
                    t2MemberSymbol = t2.findMember(t1MemberSymbol.getName());

                    if (!t2MemberSymbol || (t1MemberSymbol.getIsOptional() != t2MemberSymbol.getIsOptional())) {
                        this.identicalCache[comboId] = undefined;
                        return false;
                    }

                    t1MemberType = t1MemberSymbol.getType();
                    t2MemberType = t2MemberSymbol.getType();

                    if (t1MemberType && t2MemberType && (this.identicalCache[t2MemberType.getSymbolID().toString() + "#" + t1MemberType.getSymbolID().toString()] != undefined)) {
                        continue;
                    }

                    if (!this.typesAreIdentical(t1MemberType, t2MemberType)) {
                        this.identicalCache[comboId] = undefined;
                        return false;
                    }
                }
            } else if (t1.hasMembers() || t2.hasMembers()) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            var t1CallSigs = t1.getCallSignatures();
            var t2CallSigs = t2.getCallSignatures();

            var t1ConstructSigs = t1.getConstructSignatures();
            var t2ConstructSigs = t2.getConstructSignatures();

            var t1IndexSigs = t1.getIndexSignatures();
            var t2IndexSigs = t2.getIndexSignatures();

            if (!this.signatureGroupsAreIdentical(t1CallSigs, t2CallSigs)) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            if (!this.signatureGroupsAreIdentical(t1ConstructSigs, t2ConstructSigs)) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            if (!this.signatureGroupsAreIdentical(t1IndexSigs, t2IndexSigs)) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            this.identicalCache[comboId] = true;
            return true;
        };

        PullTypeResolver.prototype.signatureGroupsAreIdentical = function (sg1, sg2) {
            if (sg1 === sg2) {
                return true;
            }

            if (!sg1 || !sg2) {
                return false;
            }

            if (sg1.length != sg2.length) {
                return false;
            }

            var sig1 = null;
            var sig2 = null;
            var sigsMatch = false;

            for (var iSig1 = 0; iSig1 < sg1.length; iSig1++) {
                sig1 = sg1[iSig1];

                for (var iSig2 = 0; iSig2 < sg2.length; iSig2++) {
                    sig2 = sg2[iSig2];

                    if (this.signaturesAreIdentical(sig1, sig2)) {
                        sigsMatch = true;
                        break;
                    }
                }

                if (sigsMatch) {
                    sigsMatch = false;
                    continue;
                }

                return false;
            }

            return true;
        };

        PullTypeResolver.prototype.signaturesAreIdentical = function (s1, s2) {
            if (s1.hasVariableParamList() != s2.hasVariableParamList()) {
                return false;
            }

            if (s1.getNonOptionalParameterCount() != s2.getNonOptionalParameterCount()) {
                return false;
            }

            var s1Params = s1.getParameters();
            var s2Params = s2.getParameters();

            if (s1Params.length != s2Params.length) {
                return false;
            }

            if (!this.typesAreIdentical(s1.getReturnType(), s2.getReturnType())) {
                return false;
            }

            for (var iParam = 0; iParam < s1Params.length; iParam++) {
                if (!this.typesAreIdentical(s1Params[iParam].getType(), s2Params[iParam].getType())) {
                    return false;
                }
            }

            return true;
        };

        PullTypeResolver.prototype.substituteUpperBoundForType = function (type) {
            if (!type || !type.isTypeParameter()) {
                return type;
            }

            var constraint = (type).getConstraint();

            if (constraint) {
                return this.substituteUpperBoundForType(constraint);
            }

            if (this.cachedObjectInterfaceType) {
                return this.cachedObjectInterfaceType;
            }

            return type;
        };

        PullTypeResolver.prototype.symbolsShareDeclaration = function (symbol1, symbol2) {
            var decls1 = symbol1.getDeclarations();
            var decls2 = symbol2.getDeclarations();

            if (decls1.length && decls2.length) {
                return decls1[0].isEqual(decls2[0]);
            }

            return false;
        };

        PullTypeResolver.prototype.sourceIsSubtypeOfTarget = function (source, target, context, comparisonInfo) {
            return this.sourceIsRelatableToTarget(source, target, false, this.subtypeCache, context, comparisonInfo);
        };

        PullTypeResolver.prototype.sourceMembersAreSubtypeOfTargetMembers = function (source, target, context, comparisonInfo) {
            return this.sourceMembersAreRelatableToTargetMembers(source, target, false, this.subtypeCache, context, comparisonInfo);
        };

        PullTypeResolver.prototype.sourcePropertyIsSubtypeOfTargetProperty = function (source, target, sourceProp, targetProp, context, comparisonInfo) {
            return this.sourcePropertyIsRelatableToTargetProperty(source, target, sourceProp, targetProp, false, this.subtypeCache, context, comparisonInfo);
        };

        PullTypeResolver.prototype.sourceCallSignaturesAreSubtypeOfTargetCallSignatures = function (source, target, context, comparisonInfo) {
            return this.sourceCallSignaturesAreRelatableToTargetCallSignatures(source, target, false, this.subtypeCache, context, comparisonInfo);
        };

        PullTypeResolver.prototype.sourceConstructSignaturesAreSubtypeOfTargetConstructSignatures = function (source, target, context, comparisonInfo) {
            return this.sourceConstructSignaturesAreRelatableToTargetConstructSignatures(source, target, false, this.subtypeCache, context, comparisonInfo);
        };

        PullTypeResolver.prototype.sourceIndexSignaturesAreSubtypeOfTargetIndexSignatures = function (source, target, context, comparisonInfo) {
            return this.sourceIndexSignaturesAreRelatableToTargetIndexSignatures(source, target, false, this.subtypeCache, context, comparisonInfo);
        };

        PullTypeResolver.prototype.typeIsSubtypeOfFunction = function (source, context) {
            var callSignatures = source.getCallSignatures();

            if (callSignatures.length) {
                return true;
            }

            var constructSignatures = source.getConstructSignatures();

            if (constructSignatures.length) {
                return true;
            }

            if (this.cachedFunctionInterfaceType) {
                return this.sourceIsSubtypeOfTarget(source, this.cachedFunctionInterfaceType, context);
            }

            return false;
        };

        PullTypeResolver.prototype.signatureGroupIsSubtypeOfTarget = function (sg1, sg2, context, comparisonInfo) {
            return this.signatureGroupIsRelatableToTarget(sg1, sg2, false, this.subtypeCache, context, comparisonInfo);
        };

        PullTypeResolver.prototype.signatureIsSubtypeOfTarget = function (s1, s2, context, comparisonInfo) {
            return this.signatureIsRelatableToTarget(s1, s2, false, this.subtypeCache, context, comparisonInfo);
        };

        PullTypeResolver.prototype.sourceIsAssignableToTarget = function (source, target, context, comparisonInfo, isInProvisionalResolution) {
            if (typeof isInProvisionalResolution === "undefined") { isInProvisionalResolution = false; }
            var cache = isInProvisionalResolution ? {} : this.assignableCache;
            return this.sourceIsRelatableToTarget(source, target, true, cache, context, comparisonInfo);
        };

        PullTypeResolver.prototype.signatureGroupIsAssignableToTarget = function (sg1, sg2, context, comparisonInfo) {
            return this.signatureGroupIsRelatableToTarget(sg1, sg2, true, this.assignableCache, context, comparisonInfo);
        };

        PullTypeResolver.prototype.signatureIsAssignableToTarget = function (s1, s2, context, comparisonInfo) {
            return this.signatureIsRelatableToTarget(s1, s2, true, this.assignableCache, context, comparisonInfo);
        };

        PullTypeResolver.prototype.sourceIsRelatableToTarget = function (source, target, assignableTo, comparisonCache, context, comparisonInfo) {
            if (source === target) {
                return true;
            }

            if (!(source && target)) {
                return true;
            }

            if (context.specializingToAny && (target.isTypeParameter() || source.isTypeParameter())) {
                return true;
            }

            if (context.specializingToObject) {
                if (target.isTypeParameter()) {
                    target = this.cachedObjectInterfaceType;
                }
                if (source.isTypeParameter()) {
                    target = this.cachedObjectInterfaceType;
                }
            }

            var sourceSubstitution = source;

            if (source == this.semanticInfoChain.stringTypeSymbol && this.cachedStringInterfaceType) {
                if (!this.cachedStringInterfaceType.isResolved()) {
                    this.resolveDeclaredSymbol(this.cachedStringInterfaceType, null, context);
                }
                sourceSubstitution = this.cachedStringInterfaceType;
            } else if (source == this.semanticInfoChain.numberTypeSymbol && this.cachedNumberInterfaceType) {
                if (!this.cachedNumberInterfaceType.isResolved()) {
                    this.resolveDeclaredSymbol(this.cachedNumberInterfaceType, null, context);
                }
                sourceSubstitution = this.cachedNumberInterfaceType;
            } else if (source == this.semanticInfoChain.booleanTypeSymbol && this.cachedBooleanInterfaceType) {
                if (!this.cachedBooleanInterfaceType.isResolved()) {
                    this.resolveDeclaredSymbol(this.cachedBooleanInterfaceType, null, context);
                }
                sourceSubstitution = this.cachedBooleanInterfaceType;
            } else if (TypeScript.PullHelpers.symbolIsEnum(source) && this.cachedNumberInterfaceType) {
                sourceSubstitution = this.cachedNumberInterfaceType;
            } else if (source.isTypeParameter()) {
                sourceSubstitution = this.substituteUpperBoundForType(source);
            }

            var comboId = source.getSymbolID().toString() + "#" + target.getSymbolID().toString();

            if (comparisonCache[comboId] != undefined) {
                return true;
            }

            if (assignableTo) {
                if (this.isAnyOrEquivalent(source) || this.isAnyOrEquivalent(target)) {
                    return true;
                }

                if (source === this.semanticInfoChain.stringTypeSymbol && target.isPrimitive() && (target).isStringConstant()) {
                    return comparisonInfo && comparisonInfo.stringConstantVal && (comparisonInfo.stringConstantVal.nodeType === TypeScript.NodeType.StringLiteral) && (TypeScript.stripQuotes((comparisonInfo.stringConstantVal).actualText) === TypeScript.stripQuotes(target.getName()));
                }
            } else {
                if (this.isAnyOrEquivalent(target)) {
                    return true;
                }

                if (target === this.semanticInfoChain.stringTypeSymbol && source.isPrimitive() && (source).isStringConstant()) {
                    return true;
                }
            }

            if (source.isPrimitive() && (source).isStringConstant() && target.isPrimitive() && (target).isStringConstant()) {
                return TypeScript.stripQuotes(source.getName()) === TypeScript.stripQuotes(target.getName());
            }

            if (source === this.semanticInfoChain.undefinedTypeSymbol) {
                return true;
            }

            if ((source === this.semanticInfoChain.nullTypeSymbol) && (target != this.semanticInfoChain.undefinedTypeSymbol && target != this.semanticInfoChain.voidTypeSymbol)) {
                return true;
            }

            if (target == this.semanticInfoChain.voidTypeSymbol) {
                if (source == this.semanticInfoChain.anyTypeSymbol || source == this.semanticInfoChain.undefinedTypeSymbol || source == this.semanticInfoChain.nullTypeSymbol) {
                    return true;
                }

                return false;
            } else if (source == this.semanticInfoChain.voidTypeSymbol) {
                if (target == this.semanticInfoChain.anyTypeSymbol) {
                    return true;
                }

                return false;
            }

            if (target === this.semanticInfoChain.numberTypeSymbol && TypeScript.PullHelpers.symbolIsEnum(source)) {
                return true;
            }

            if (source === this.semanticInfoChain.numberTypeSymbol && TypeScript.PullHelpers.symbolIsEnum(target)) {
                return true;
            }

            if (TypeScript.PullHelpers.symbolIsEnum(target) && TypeScript.PullHelpers.symbolIsEnum(source)) {
                return this.symbolsShareDeclaration(target, source);
            }

            if ((source.getKind() & TypeScript.PullElementKind.Enum) || (target.getKind() & TypeScript.PullElementKind.Enum)) {
                return false;
            }

            if (source.isArray() && target.isArray()) {
                comparisonCache[comboId] = false;
                var ret = this.sourceIsRelatableToTarget(source.getElementType(), target.getElementType(), assignableTo, comparisonCache, context, comparisonInfo);
                if (ret) {
                    comparisonCache[comboId] = true;
                } else {
                    comparisonCache[comboId] = undefined;
                }

                return ret;
            } else if (source.isArray() && target == this.cachedArrayInterfaceType) {
                return true;
            } else if (target.isArray() && source == this.cachedArrayInterfaceType) {
                return true;
            }

            if (source.isPrimitive() && target.isPrimitive()) {
                return false;
            } else if (source.isPrimitive() != target.isPrimitive()) {
                if (target.isPrimitive()) {
                    return false;
                }
            }

            if (target.isTypeParameter()) {
                if (source.isTypeParameter() && (source == sourceSubstitution)) {
                    var targetParentDeclaration = target.getDeclarations()[0].getParentDecl();
                    var sourceParentDeclaration = source.getDeclarations()[0].getParentDecl();

                    if (targetParentDeclaration !== sourceParentDeclaration) {
                        return this.symbolsShareDeclaration(target, source);
                    } else {
                        return true;
                    }
                } else {
                    if (context.isComparingSpecializedSignatures) {
                        target = this.substituteUpperBoundForType(target);
                    } else {
                        return false;
                    }
                }
            }

            comparisonCache[comboId] = false;

            if (sourceSubstitution.hasBase(target)) {
                comparisonCache[comboId] = true;
                return true;
            }

            if (this.cachedObjectInterfaceType && target === this.cachedObjectInterfaceType) {
                return true;
            }

            if (this.cachedFunctionInterfaceType && (sourceSubstitution.getCallSignatures().length || sourceSubstitution.getConstructSignatures().length) && target === this.cachedFunctionInterfaceType) {
                return true;
            }

            if (target.hasMembers() && !this.sourceMembersAreRelatableToTargetMembers(sourceSubstitution, target, assignableTo, comparisonCache, context, comparisonInfo)) {
                comparisonCache[comboId] = undefined;
                return false;
            }

            if (!this.sourceCallSignaturesAreRelatableToTargetCallSignatures(sourceSubstitution, target, assignableTo, comparisonCache, context, comparisonInfo)) {
                comparisonCache[comboId] = undefined;
                return false;
            }

            if (!this.sourceConstructSignaturesAreRelatableToTargetConstructSignatures(sourceSubstitution, target, assignableTo, comparisonCache, context, comparisonInfo)) {
                comparisonCache[comboId] = undefined;
                return false;
            }

            if (!this.sourceIndexSignaturesAreRelatableToTargetIndexSignatures(sourceSubstitution, target, assignableTo, comparisonCache, context, comparisonInfo)) {
                comparisonCache[comboId] = undefined;
                return false;
            }

            comparisonCache[comboId] = true;
            return true;
        };

        PullTypeResolver.prototype.sourceMembersAreRelatableToTargetMembers = function (source, target, assignableTo, comparisonCache, context, comparisonInfo) {
            var targetProps = target.getAllMembers(TypeScript.PullElementKind.SomeValue, true);

            for (var itargetProp = 0; itargetProp < targetProps.length; itargetProp++) {
                var targetProp = targetProps[itargetProp];
                var sourceProp = source.findMember(targetProp.getName());

                if (!targetProp.isResolved()) {
                    this.resolveDeclaredSymbol(targetProp, null, context);
                }

                var targetPropType = targetProp.getType();

                if (!sourceProp) {
                    if (this.cachedObjectInterfaceType) {
                        sourceProp = this.cachedObjectInterfaceType.findMember(targetProp.getName());
                    }

                    if (!sourceProp) {
                        if (this.cachedFunctionInterfaceType && (targetPropType.getCallSignatures().length || targetPropType.getConstructSignatures().length)) {
                            sourceProp = this.cachedFunctionInterfaceType.findMember(targetProp.getName());
                        }

                        if (!sourceProp) {
                            if (!(targetProp.getIsOptional())) {
                                if (comparisonInfo) {
                                    comparisonInfo.flags |= TypeScript.TypeRelationshipFlags.RequiredPropertyIsMissing;
                                    comparisonInfo.addMessage(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Type__0__is_missing_property__1__from_type__2_, [source.toString(), targetProp.getScopedNameEx().toString(), target.toString()]));
                                }
                                return false;
                            }
                            continue;
                        }
                    }
                }

                if (!this.sourcePropertyIsRelatableToTargetProperty(source, target, sourceProp, targetProp, assignableTo, comparisonCache, context, comparisonInfo)) {
                    return false;
                }
            }

            return true;
        };

        PullTypeResolver.prototype.sourcePropertyIsRelatableToTargetProperty = function (source, target, sourceProp, targetProp, assignableTo, comparisonCache, context, comparisonInfo) {
            var targetPropIsPrivate = targetProp.hasFlag(TypeScript.PullElementFlags.Private);
            var sourcePropIsPrivate = sourceProp.hasFlag(TypeScript.PullElementFlags.Private);

            if (targetPropIsPrivate != sourcePropIsPrivate) {
                if (comparisonInfo) {
                    if (targetPropIsPrivate) {
                        comparisonInfo.addMessage(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Property__0__defined_as_public_in_type__1__is_defined_as_private_in_type__2_, [targetProp.getScopedNameEx().toString(), sourceProp.getContainer().toString(), targetProp.getContainer().toString()]));
                    } else {
                        comparisonInfo.addMessage(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Property__0__defined_as_private_in_type__1__is_defined_as_public_in_type__2_, [targetProp.getScopedNameEx().toString(), sourceProp.getContainer().toString(), targetProp.getContainer().toString()]));
                    }
                    comparisonInfo.flags |= TypeScript.TypeRelationshipFlags.InconsistantPropertyAccesibility;
                }
                return false;
            } else if (sourcePropIsPrivate && targetPropIsPrivate) {
                var targetDecl = targetProp.getDeclarations()[0];
                var sourceDecl = sourceProp.getDeclarations()[0];

                if (!targetDecl.isEqual(sourceDecl)) {
                    comparisonInfo.flags |= TypeScript.TypeRelationshipFlags.InconsistantPropertyAccesibility;
                    comparisonInfo.addMessage(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Types__0__and__1__define_property__2__as_private, [sourceProp.getContainer().toString(), targetProp.getContainer().toString(), targetProp.getScopedNameEx().toString()]));
                    return false;
                }
            }

            if (!sourceProp.isResolved()) {
                this.resolveDeclaredSymbol(sourceProp, null, context);
            }

            var sourcePropType = sourceProp.getType();
            var targetPropType = targetProp.getType();

            if (targetPropType && sourcePropType && (comparisonCache[sourcePropType.getSymbolID().toString() + "#" + targetPropType.getSymbolID().toString()] != undefined)) {
                return true;
            }

            var comparisonInfoPropertyTypeCheck = null;
            if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                comparisonInfoPropertyTypeCheck = new TypeScript.TypeComparisonInfo(comparisonInfo);
            }
            if (!this.sourceIsRelatableToTarget(sourcePropType, targetPropType, assignableTo, comparisonCache, context, comparisonInfoPropertyTypeCheck)) {
                if (comparisonInfo) {
                    comparisonInfo.flags |= TypeScript.TypeRelationshipFlags.IncompatiblePropertyTypes;
                    var message;
                    if (comparisonInfoPropertyTypeCheck && comparisonInfoPropertyTypeCheck.message) {
                        message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Types_of_property__0__of_types__1__and__2__are_incompatible__NL__3, [targetProp.getScopedNameEx().toString(), source.toString(), target.toString(), comparisonInfoPropertyTypeCheck.message]);
                    } else {
                        message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Types_of_property__0__of_types__1__and__2__are_incompatible, [targetProp.getScopedNameEx().toString(), source.toString(), target.toString()]);
                    }
                    comparisonInfo.addMessage(message);
                }

                return false;
            }

            return true;
        };

        PullTypeResolver.prototype.sourceCallSignaturesAreRelatableToTargetCallSignatures = function (source, target, assignableTo, comparisonCache, context, comparisonInfo) {
            var targetCallSigs = target.getCallSignatures();

            if (targetCallSigs.length) {
                var comparisonInfoSignatuesTypeCheck = null;
                if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                    comparisonInfoSignatuesTypeCheck = new TypeScript.TypeComparisonInfo(comparisonInfo);
                }

                var sourceCallSigs = source.getCallSignatures();
                if (!this.signatureGroupIsRelatableToTarget(sourceCallSigs, targetCallSigs, assignableTo, comparisonCache, context, comparisonInfoSignatuesTypeCheck)) {
                    if (comparisonInfo) {
                        var message;
                        if (sourceCallSigs.length && targetCallSigs.length) {
                            if (comparisonInfoSignatuesTypeCheck && comparisonInfoSignatuesTypeCheck.message) {
                                message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Call_signatures_of_types__0__and__1__are_incompatible__NL__2, [source.toString(), target.toString(), comparisonInfoSignatuesTypeCheck.message]);
                            } else {
                                message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Call_signatures_of_types__0__and__1__are_incompatible, [source.toString(), target.toString()]);
                            }
                        } else {
                            var hasSig = targetCallSigs.length ? target.toString() : source.toString();
                            var lacksSig = !targetCallSigs.length ? target.toString() : source.toString();
                            message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Type__0__requires_a_call_signature__but_Type__1__lacks_one, [hasSig, lacksSig]);
                        }
                        comparisonInfo.flags |= TypeScript.TypeRelationshipFlags.IncompatibleSignatures;
                        comparisonInfo.addMessage(message);
                    }
                    return false;
                }
            }

            return true;
        };

        PullTypeResolver.prototype.sourceConstructSignaturesAreRelatableToTargetConstructSignatures = function (source, target, assignableTo, comparisonCache, context, comparisonInfo) {
            var targetConstructSigs = target.getConstructSignatures();
            if (targetConstructSigs.length) {
                var comparisonInfoSignatuesTypeCheck = null;
                if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                    comparisonInfoSignatuesTypeCheck = new TypeScript.TypeComparisonInfo(comparisonInfo);
                }

                var sourceConstructSigs = source.getConstructSignatures();
                if (!this.signatureGroupIsRelatableToTarget(sourceConstructSigs, targetConstructSigs, assignableTo, comparisonCache, context, comparisonInfoSignatuesTypeCheck)) {
                    if (comparisonInfo) {
                        var message;
                        if (sourceConstructSigs.length && targetConstructSigs.length) {
                            if (comparisonInfoSignatuesTypeCheck && comparisonInfoSignatuesTypeCheck.message) {
                                message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Construct_signatures_of_types__0__and__1__are_incompatible__NL__2, [source.toString(), target.toString(), comparisonInfoSignatuesTypeCheck.message]);
                            } else {
                                message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Construct_signatures_of_types__0__and__1__are_incompatible, [source.toString(), target.toString()]);
                            }
                        } else {
                            var hasSig = targetConstructSigs.length ? target.toString() : source.toString();
                            var lacksSig = !targetConstructSigs.length ? target.toString() : source.toString();
                            message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Type__0__requires_a_construct_signature__but_Type__1__lacks_one, [hasSig, lacksSig]);
                        }
                        comparisonInfo.flags |= TypeScript.TypeRelationshipFlags.IncompatibleSignatures;
                        comparisonInfo.addMessage(message);
                    }
                    return false;
                }
            }

            return true;
        };

        PullTypeResolver.prototype.sourceIndexSignaturesAreRelatableToTargetIndexSignatures = function (source, target, assignableTo, comparisonCache, context, comparisonInfo) {
            var targetIndexSigs = target.getIndexSignatures();

            if (targetIndexSigs.length) {
                var sourceIndexSigs = source.getIndexSignatures();

                var targetIndex = !targetIndexSigs.length && this.cachedObjectInterfaceType ? this.cachedObjectInterfaceType.getIndexSignatures() : targetIndexSigs;
                var sourceIndex = !sourceIndexSigs.length && this.cachedObjectInterfaceType ? this.cachedObjectInterfaceType.getIndexSignatures() : sourceIndexSigs;

                var sourceStringSig = null;
                var sourceNumberSig = null;

                var targetStringSig = null;
                var targetNumberSig = null;

                var params;

                for (var i = 0; i < targetIndex.length; i++) {
                    if (targetStringSig && targetNumberSig) {
                        break;
                    }

                    params = targetIndex[i].getParameters();

                    if (params.length) {
                        if (!targetStringSig && params[0].getType() === this.semanticInfoChain.stringTypeSymbol) {
                            targetStringSig = targetIndex[i];
                            continue;
                        } else if (!targetNumberSig && params[0].getType() === this.semanticInfoChain.numberTypeSymbol) {
                            targetNumberSig = targetIndex[i];
                            continue;
                        }
                    }
                }

                for (var i = 0; i < sourceIndex.length; i++) {
                    if (sourceStringSig && sourceNumberSig) {
                        break;
                    }

                    params = sourceIndex[i].getParameters();

                    if (params.length) {
                        if (!sourceStringSig && params[0].getType() === this.semanticInfoChain.stringTypeSymbol) {
                            sourceStringSig = sourceIndex[i];
                            continue;
                        } else if (!sourceNumberSig && params[0].getType() === this.semanticInfoChain.numberTypeSymbol) {
                            sourceNumberSig = sourceIndex[i];
                            continue;
                        }
                    }
                }

                var comparable = true;
                var comparisonInfoSignatuesTypeCheck = null;
                if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                    comparisonInfoSignatuesTypeCheck = new TypeScript.TypeComparisonInfo(comparisonInfo);
                }

                if (targetStringSig) {
                    if (sourceStringSig) {
                        comparable = this.signatureIsAssignableToTarget(sourceStringSig, targetStringSig, context, comparisonInfoSignatuesTypeCheck);
                    } else {
                        comparable = false;
                    }
                }

                if (comparable && targetNumberSig) {
                    if (sourceNumberSig) {
                        comparable = this.signatureIsAssignableToTarget(sourceNumberSig, targetNumberSig, context, comparisonInfoSignatuesTypeCheck);
                    } else if (sourceStringSig) {
                        comparable = this.sourceIsAssignableToTarget(sourceStringSig.getReturnType(), targetNumberSig.getReturnType(), context, comparisonInfoSignatuesTypeCheck);
                    } else {
                        comparable = false;
                    }
                }

                if (!comparable) {
                    if (comparisonInfo) {
                        var message;
                        if (comparisonInfoSignatuesTypeCheck && comparisonInfoSignatuesTypeCheck.message) {
                            message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Index_signatures_of_types__0__and__1__are_incompatible__NL__2, [source.toString(), target.toString(), comparisonInfoSignatuesTypeCheck.message]);
                        } else {
                            message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Index_signatures_of_types__0__and__1__are_incompatible, [source.toString(), target.toString()]);
                        }
                        comparisonInfo.flags |= TypeScript.TypeRelationshipFlags.IncompatibleSignatures;
                        comparisonInfo.addMessage(message);
                    }
                    return false;
                }
            }

            if (targetStringSig && !source.isNamedTypeSymbol() && source.hasMembers()) {
                var targetReturnType = targetStringSig.getReturnType();
                var sourceMembers = source.getMembers();

                for (var i = 0; i < sourceMembers.length; i++) {
                    if (!this.sourceIsRelatableToTarget(sourceMembers[i].getType(), targetReturnType, assignableTo, comparisonCache, context, comparisonInfo)) {
                        return false;
                    }
                }
            }

            return true;
        };

        PullTypeResolver.prototype.signatureGroupIsRelatableToTarget = function (sourceSG, targetSG, assignableTo, comparisonCache, context, comparisonInfo) {
            if (sourceSG === targetSG) {
                return true;
            }

            if (!(sourceSG.length && targetSG.length)) {
                return false;
            }

            var mSig = null;
            var nSig = null;
            var foundMatch = false;

            for (var iMSig = 0; iMSig < targetSG.length; iMSig++) {
                mSig = targetSG[iMSig];

                if (mSig.isStringConstantOverloadSignature()) {
                    continue;
                }

                for (var iNSig = 0; iNSig < sourceSG.length; iNSig++) {
                    nSig = sourceSG[iNSig];

                    if (nSig.isStringConstantOverloadSignature()) {
                        continue;
                    }

                    if (this.signatureIsRelatableToTarget(nSig, mSig, assignableTo, comparisonCache, context, comparisonInfo)) {
                        foundMatch = true;
                        break;
                    }
                }

                if (foundMatch) {
                    foundMatch = false;
                    continue;
                }
                return false;
            }

            return true;
        };

        PullTypeResolver.prototype.signatureIsRelatableToTarget = function (sourceSig, targetSig, assignableTo, comparisonCache, context, comparisonInfo) {
            var sourceParameters = sourceSig.getParameters();
            var targetParameters = targetSig.getParameters();

            if (!sourceParameters || !targetParameters) {
                return false;
            }

            var targetVarArgCount = targetSig.getNonOptionalParameterCount();
            var sourceVarArgCount = sourceSig.getNonOptionalParameterCount();

            if (sourceVarArgCount > targetVarArgCount && !targetSig.hasVariableParamList()) {
                if (comparisonInfo) {
                    comparisonInfo.flags |= TypeScript.TypeRelationshipFlags.SourceSignatureHasTooManyParameters;
                    comparisonInfo.addMessage(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Call_signature_expects__0__or_fewer_parameters, [targetVarArgCount]));
                }
                return false;
            }

            var sourceReturnType = sourceSig.getReturnType();
            var targetReturnType = targetSig.getReturnType();

            if (sourceReturnType && sourceReturnType.isTypeParameter() && this.cachedObjectInterfaceType) {
                sourceReturnType = this.cachedObjectInterfaceType;
            }
            if (targetReturnType && targetReturnType.isTypeParameter() && this.cachedObjectInterfaceType) {
                targetReturnType = this.cachedObjectInterfaceType;
            }

            var prevSpecializingToObject = context.specializingToObject;
            context.specializingToObject = true;

            if (targetReturnType != this.semanticInfoChain.voidTypeSymbol) {
                if (!this.sourceIsRelatableToTarget(sourceReturnType, targetReturnType, assignableTo, comparisonCache, context, comparisonInfo)) {
                    if (comparisonInfo) {
                        comparisonInfo.flags |= TypeScript.TypeRelationshipFlags.IncompatibleReturnTypes;
                    }
                    context.specializingToObject = prevSpecializingToObject;
                    return false;
                }
            }

            var len = (sourceVarArgCount < targetVarArgCount && (sourceSig.hasVariableParamList() || (sourceParameters.length > sourceVarArgCount))) ? targetVarArgCount : sourceVarArgCount;
            var sourceParamType = null;
            var targetParamType = null;
            var sourceParamName = "";
            var targetParamName = "";

            for (var iSource = 0, iTarget = 0; iSource < len; iSource++, iTarget++) {
                if (iSource < sourceParameters.length && (!sourceSig.hasVariableParamList() || iSource < sourceVarArgCount)) {
                    sourceParamType = sourceParameters[iSource].getType();
                    sourceParamName = sourceParameters[iSource].getName();
                } else if (iSource === sourceVarArgCount) {
                    sourceParamType = sourceParameters[iSource].getType();
                    if (sourceParamType.isArray()) {
                        sourceParamType = sourceParamType.getElementType();
                    }
                    sourceParamName = sourceParameters[iSource].getName();
                }

                if (iTarget < targetParameters.length && iTarget < targetVarArgCount) {
                    targetParamType = targetParameters[iTarget].getType();
                    targetParamName = targetParameters[iTarget].getName();
                } else if (targetSig.hasVariableParamList() && iTarget === targetVarArgCount) {
                    targetParamType = targetParameters[iTarget].getType();

                    if (targetParamType.isArray()) {
                        targetParamType = targetParamType.getElementType();
                    }
                    targetParamName = targetParameters[iTarget].getName();
                }

                if (sourceParamType && sourceParamType.isTypeParameter() && this.cachedObjectInterfaceType) {
                    sourceParamType = this.cachedObjectInterfaceType;
                }
                if (targetParamType && targetParamType.isTypeParameter() && this.cachedObjectInterfaceType) {
                    targetParamType = this.cachedObjectInterfaceType;
                }

                if (!(this.sourceIsRelatableToTarget(sourceParamType, targetParamType, assignableTo, comparisonCache, context, comparisonInfo) || this.sourceIsRelatableToTarget(targetParamType, sourceParamType, assignableTo, comparisonCache, context, comparisonInfo))) {
                    if (comparisonInfo) {
                        comparisonInfo.flags |= TypeScript.TypeRelationshipFlags.IncompatibleParameterTypes;
                    }
                    context.specializingToObject = prevSpecializingToObject;
                    return false;
                }
            }
            context.specializingToObject = prevSpecializingToObject;
            return true;
        };

        PullTypeResolver.prototype.resolveOverloads = function (application, group, enclosingDecl, haveTypeArgumentsAtCallSite, context, diagnostics) {
            var rd = this.resolutionDataCache.getResolutionData();
            var actuals = rd.actuals;
            var exactCandidates = rd.exactCandidates;
            var conversionCandidates = rd.conversionCandidates;
            var candidate = null;
            var hasOverloads = group.length > 1;
            var comparisonInfo = new TypeScript.TypeComparisonInfo();
            var args = null;
            var target = null;

            if (application.nodeType === TypeScript.NodeType.InvocationExpression || application.nodeType === TypeScript.NodeType.ObjectCreationExpression) {
                var callEx = application;

                args = callEx.arguments;
                target = this.getLastIdentifierInTarget(callEx);

                if (callEx.arguments) {
                    var len = callEx.arguments.members.length;

                    for (var i = 0; i < len; i++) {
                        var argSym = this.resolveAST(callEx.arguments.members[i], false, enclosingDecl, context).symbol;
                        actuals[i] = argSym.getType();
                    }
                }
            } else if (application.nodeType === TypeScript.NodeType.ElementAccessExpression) {
                var binExp = application;
                target = binExp.operand1;
                args = new TypeScript.ASTList();
                args.members[0] = binExp.operand2;
                var argSym = this.resolveAST(args.members[0], false, enclosingDecl, context).symbol;
                actuals[0] = argSym.getType();
            }

            var signature;
            var returnType;
            var candidateInfo;

            for (var j = 0, groupLen = group.length; j < groupLen; j++) {
                signature = group[j];
                if ((hasOverloads && signature.isDefinition()) || (haveTypeArgumentsAtCallSite && !signature.isGeneric())) {
                    continue;
                }

                returnType = signature.getReturnType();

                this.getCandidateSignatures(signature, actuals, args, exactCandidates, conversionCandidates, enclosingDecl, context, comparisonInfo);
            }
            if (exactCandidates.length === 0) {
                var applicableCandidates = this.getApplicableSignaturesFromCandidates(conversionCandidates, args, comparisonInfo, enclosingDecl, context);
                if (applicableCandidates.length > 0) {
                    candidateInfo = this.findMostApplicableSignature(applicableCandidates, args, enclosingDecl, context);

                    candidate = candidateInfo.sig;
                } else {
                    if (comparisonInfo.message) {
                        diagnostics.push(context.postError(this.unitPath, target.minChar, target.getLength(), TypeScript.DiagnosticCode.Supplied_parameters_do_not_match_any_signature_of_call_target__NL__0, [comparisonInfo.message]));
                    } else {
                        diagnostics.push(context.postError(this.unitPath, target.minChar, target.getLength(), TypeScript.DiagnosticCode.Supplied_parameters_do_not_match_any_signature_of_call_target, null));
                    }
                }
            } else {
                if (exactCandidates.length > 1) {
                    var applicableSigs = [];
                    for (var i = 0; i < exactCandidates.length; i++) {
                        applicableSigs[i] = { signature: exactCandidates[i], hadProvisionalErrors: false };
                    }
                    candidateInfo = this.findMostApplicableSignature(applicableSigs, args, enclosingDecl, context);

                    candidate = candidateInfo.sig;
                } else {
                    candidate = exactCandidates[0];
                }
            }

            this.resolutionDataCache.returnResolutionData(rd);
            return candidate;
        };

        PullTypeResolver.prototype.getLastIdentifierInTarget = function (callEx) {
            return (callEx.target.nodeType === TypeScript.NodeType.MemberAccessExpression) ? (callEx.target).operand2 : callEx.target;
        };

        PullTypeResolver.prototype.getCandidateSignatures = function (signature, actuals, args, exactCandidates, conversionCandidates, enclosingDecl, context, comparisonInfo) {
            var parameters = signature.getParameters();
            var lowerBound = signature.getNonOptionalParameterCount();
            var upperBound = parameters.length;
            var formalLen = lowerBound;
            var acceptable = false;

            if ((actuals.length >= lowerBound) && (signature.hasVariableParamList() || actuals.length <= upperBound)) {
                formalLen = (signature.hasVariableParamList() ? parameters.length : actuals.length);
                acceptable = true;
            }

            var repeatType = null;

            if (acceptable) {
                if (signature.hasVariableParamList()) {
                    formalLen -= 1;
                    repeatType = parameters[formalLen].getType();
                    repeatType = repeatType.getElementType();
                    acceptable = actuals.length >= (formalLen < lowerBound ? formalLen : lowerBound);
                }
                var len = actuals.length;

                var exact = acceptable;
                var convert = acceptable;

                var typeA;
                var typeB;

                for (var i = 0; i < len; i++) {
                    if (i < formalLen) {
                        typeA = parameters[i].getType();
                    } else {
                        typeA = repeatType;
                    }

                    typeB = actuals[i];

                    if (typeA && !typeA.isResolved()) {
                        this.resolveDeclaredSymbol(typeA, enclosingDecl, context);
                    }

                    if (typeB && !typeB.isResolved()) {
                        this.resolveDeclaredSymbol(typeB, enclosingDecl, context);
                    }

                    if (!typeA || !typeB || !(this.typesAreIdentical(typeA, typeB, args.members[i]))) {
                        exact = false;
                    }

                    comparisonInfo.stringConstantVal = args.members[i];

                    if (!this.sourceIsAssignableToTarget(typeB, typeA, context, comparisonInfo)) {
                        convert = false;
                    }

                    comparisonInfo.stringConstantVal = null;

                    if (!(exact || convert)) {
                        break;
                    }
                }
                if (exact) {
                    exactCandidates[exactCandidates.length] = signature;
                } else if (convert && (exactCandidates.length === 0)) {
                    conversionCandidates[conversionCandidates.length] = signature;
                }
            }
        };

        PullTypeResolver.prototype.getApplicableSignaturesFromCandidates = function (candidateSignatures, args, comparisonInfo, enclosingDecl, context) {
            var applicableSigs = [];
            var memberType = null;
            var miss = false;
            var cxt = null;
            var hadProvisionalErrors = false;

            var parameters;
            var signature;
            var argSym;

            for (var i = 0; i < candidateSignatures.length; i++) {
                miss = false;

                signature = candidateSignatures[i];
                parameters = signature.getParameters();

                for (var j = 0; j < args.members.length; j++) {
                    if (j >= parameters.length) {
                        continue;
                    }

                    if (!parameters[j].isResolved()) {
                        this.resolveDeclaredSymbol(parameters[j], enclosingDecl, context);
                    }

                    memberType = parameters[j].getType();

                    if (signature.hasVariableParamList() && (j >= signature.getNonOptionalParameterCount()) && memberType.isArray()) {
                        memberType = memberType.getElementType();
                    }

                    if (this.isAnyOrEquivalent(memberType)) {
                        continue;
                    } else if (args.members[j].nodeType === TypeScript.NodeType.FunctionDeclaration) {
                        if (this.cachedFunctionInterfaceType && memberType === this.cachedFunctionInterfaceType) {
                            continue;
                        }

                        argSym = this.resolveFunctionExpression(args.members[j], false, enclosingDecl, context);

                        if (!this.canApplyContextualTypeToFunction(memberType, args.members[j], true)) {
                            if (this.canApplyContextualTypeToFunction(memberType, args.members[j], false)) {
                                if (!this.sourceIsAssignableToTarget(argSym.getType(), memberType, context, comparisonInfo, true)) {
                                    break;
                                }
                            } else {
                                break;
                            }
                        } else {
                            argSym.invalidate();
                            context.pushContextualType(memberType, true, null);

                            argSym = this.resolveFunctionExpression(args.members[j], true, enclosingDecl, context);

                            if (!this.sourceIsAssignableToTarget(argSym.getType(), memberType, context, comparisonInfo, true)) {
                                if (comparisonInfo) {
                                    comparisonInfo.setMessage(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Could_not_apply_type__0__to_argument__1__which_is_of_type__2_, [memberType.toString(), (j + 1), argSym.getTypeName()]));
                                }
                                miss = true;
                            }
                            argSym.invalidate();
                            cxt = context.popContextualType();
                            hadProvisionalErrors = cxt.hadProvisionalErrors();

                            if (miss) {
                                break;
                            }
                        }
                    } else if (args.members[j].nodeType === TypeScript.NodeType.ObjectLiteralExpression) {
                        if (this.cachedObjectInterfaceType && memberType === this.cachedObjectInterfaceType) {
                            continue;
                        }

                        context.pushContextualType(memberType, true, null);
                        argSym = this.resolveObjectLiteralExpression(args.members[j], true, enclosingDecl, context).symbol;

                        if (!this.sourceIsAssignableToTarget(argSym.getType(), memberType, context, comparisonInfo, true)) {
                            if (comparisonInfo) {
                                comparisonInfo.setMessage(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Could_not_apply_type__0__to_argument__1__which_is_of_type__2_, [memberType.toString(), (j + 1), argSym.getTypeName()]));
                            }

                            miss = true;
                        }

                        argSym.invalidate();
                        cxt = context.popContextualType();
                        hadProvisionalErrors = cxt.hadProvisionalErrors();

                        if (miss) {
                            break;
                        }
                    } else if (args.members[j].nodeType === TypeScript.NodeType.ArrayLiteralExpression) {
                        if (this.cachedArrayInterfaceType && memberType === this.cachedArrayInterfaceType) {
                            continue;
                        }

                        context.pushContextualType(memberType, true, null);
                        var argSym = this.resolveArrayLiteralExpression(args.members[j], true, enclosingDecl, context).symbol;

                        if (!this.sourceIsAssignableToTarget(argSym.getType(), memberType, context, comparisonInfo, true)) {
                            if (comparisonInfo) {
                                comparisonInfo.setMessage(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Could_not_apply_type__0__to_argument__1__which_is_of_type__2_, [memberType.toString(), (j + 1), argSym.getTypeName()]));
                            }
                            break;
                        }

                        argSym.invalidate();
                        cxt = context.popContextualType();

                        hadProvisionalErrors = cxt.hadProvisionalErrors();

                        if (miss) {
                            break;
                        }
                    }
                }

                if (j === args.members.length) {
                    applicableSigs[applicableSigs.length] = { signature: candidateSignatures[i], hadProvisionalErrors: hadProvisionalErrors };
                }

                hadProvisionalErrors = false;
            }

            return applicableSigs;
        };

        PullTypeResolver.prototype.findMostApplicableSignature = function (signatures, args, enclosingDecl, context) {
            if (signatures.length === 1) {
                return { sig: signatures[0].signature, ambiguous: false };
            }

            var best = signatures[0];
            var Q = null;

            var AType = null;
            var PType = null;
            var QType = null;

            var ambiguous = false;

            var bestParams;
            var qParams;

            for (var qSig = 1; qSig < signatures.length; qSig++) {
                Q = signatures[qSig];

                for (var i = 0; args && i < args.members.length; i++) {
                    var argSym = this.resolveAST(args.members[i], false, enclosingDecl, context).symbol;

                    AType = argSym.getType();

                    argSym.invalidate();

                    bestParams = best.signature.getParameters();
                    qParams = Q.signature.getParameters();

                    PType = i < bestParams.length ? bestParams[i].getType() : bestParams[bestParams.length - 1].getType().getElementType();
                    QType = i < qParams.length ? qParams[i].getType() : qParams[qParams.length - 1].getType().getElementType();

                    if (this.typesAreIdentical(PType, QType) && !(QType.isPrimitive() && (QType).isStringConstant())) {
                        continue;
                    } else if (PType.isPrimitive() && (PType).isStringConstant() && args.members[i].nodeType === TypeScript.NodeType.StringLiteral && TypeScript.stripQuotes((args.members[i]).actualText) === TypeScript.stripQuotes((PType).getName())) {
                        break;
                    } else if (QType.isPrimitive() && (QType).isStringConstant() && args.members[i].nodeType === TypeScript.NodeType.StringLiteral && TypeScript.stripQuotes((args.members[i]).actualText) === TypeScript.stripQuotes((QType).getName())) {
                        best = Q;
                    } else if (this.typesAreIdentical(AType, PType)) {
                        break;
                    } else if (this.typesAreIdentical(AType, QType)) {
                        best = Q;
                        break;
                    } else if (this.sourceIsSubtypeOfTarget(PType, QType, context)) {
                        break;
                    } else if (this.sourceIsSubtypeOfTarget(QType, PType, context)) {
                        best = Q;
                        break;
                    } else if (Q.hadProvisionalErrors) {
                        break;
                    } else if (best.hadProvisionalErrors) {
                        best = Q;
                        break;
                    }
                }

                if (!args || i === args.members.length) {
                    var collection = {
                        getLength: function () {
                            return 2;
                        },
                        setTypeAtIndex: function (index, type) {
                        },
                        getTypeAtIndex: function (index) {
                            return index ? Q.signature.getReturnType() : best.signature.getReturnType();
                        }
                    };
                    var bct = this.findBestCommonType(best.signature.getReturnType(), null, collection, context, new TypeScript.TypeComparisonInfo());
                    ambiguous = !bct;
                } else {
                    ambiguous = false;
                }
            }

            return { sig: best.signature, ambiguous: ambiguous };
        };

        PullTypeResolver.prototype.canApplyContextualTypeToFunction = function (candidateType, funcDecl, beStringent) {
            if (funcDecl.isMethod() || beStringent && funcDecl.returnTypeAnnotation) {
                return false;
            }

            beStringent = beStringent || (this.cachedFunctionInterfaceType === candidateType);

            if (!beStringent) {
                return true;
            }

            var signature = this.getSymbolAndDiagnosticsForAST(funcDecl).symbol.getType().getCallSignatures()[0];
            var parameters = signature.getParameters();
            var paramLen = parameters.length;

            for (var i = 0; i < paramLen; i++) {
                var param = parameters[i];
                var argDecl = this.getASTForSymbol(param);

                if (beStringent && argDecl.typeExpr) {
                    return false;
                }
            }

            if (candidateType.getConstructSignatures().length && candidateType.getCallSignatures().length) {
                return false;
            }

            var candidateSigs = candidateType.getConstructSignatures().length ? candidateType.getConstructSignatures() : candidateType.getCallSignatures();

            if (!candidateSigs || candidateSigs.length > 1) {
                return false;
            }

            return true;
        };

        PullTypeResolver.prototype.inferArgumentTypesForSignature = function (signature, args, comparisonInfo, enclosingDecl, context) {
            var cxt = null;
            var hadProvisionalErrors = false;

            var parameters = signature.getParameters();
            var typeParameters = signature.getTypeParameters();
            var argContext = new TypeScript.ArgumentInferenceContext();

            var parameterType = null;

            for (var i = 0; i < typeParameters.length; i++) {
                argContext.addInferenceRoot(typeParameters[i]);
            }

            var substitutions;
            var inferenceCandidates;
            var inferenceCandidate;

            for (var i = 0; i < args.members.length; i++) {
                if (i >= parameters.length) {
                    break;
                }

                parameterType = parameters[i].getType();

                if (signature.hasVariableParamList() && (i >= signature.getNonOptionalParameterCount() - 1) && parameterType.isArray()) {
                    parameterType = parameterType.getElementType();
                }

                inferenceCandidates = argContext.getInferenceCandidates();
                substitutions = {};

                if (inferenceCandidates.length) {
                    for (var j = 0; j < inferenceCandidates.length; j++) {
                        argContext.resetRelationshipCache();

                        inferenceCandidate = inferenceCandidates[j];

                        substitutions = inferenceCandidates[j];

                        context.pushContextualType(parameterType, true, substitutions);

                        var argSym = this.resolveAST(args.members[i], true, enclosingDecl, context).symbol;

                        this.relateTypeToTypeParameters(argSym.getType(), parameterType, false, argContext, enclosingDecl, context);

                        cxt = context.popContextualType();

                        argSym.invalidate();

                        hadProvisionalErrors = cxt.hadProvisionalErrors();
                    }
                } else {
                    context.pushContextualType(parameterType, true, {});
                    var argSym = this.resolveAST(args.members[i], true, enclosingDecl, context).symbol;

                    this.relateTypeToTypeParameters(argSym.getType(), parameterType, false, argContext, enclosingDecl, context);

                    cxt = context.popContextualType();

                    argSym.invalidate();

                    hadProvisionalErrors = cxt.hadProvisionalErrors();
                }
            }

            hadProvisionalErrors = false;

            var inferenceResults = argContext.inferArgumentTypes(this, context);

            if (inferenceResults.unfit) {
                return null;
            }

            var resultTypes = [];

            for (var i = 0; i < typeParameters.length; i++) {
                for (var j = 0; j < inferenceResults.results.length; j++) {
                    if (inferenceResults.results[j].param == typeParameters[i]) {
                        resultTypes[resultTypes.length] = inferenceResults.results[j].type;
                        break;
                    }
                }
            }

            if (!args.members.length && !resultTypes.length && typeParameters.length) {
                for (var i = 0; i < typeParameters.length; i++) {
                    resultTypes[resultTypes.length] = this.semanticInfoChain.anyTypeSymbol;
                }
            } else if (resultTypes.length && resultTypes.length < typeParameters.length) {
                for (var i = resultTypes.length; i < typeParameters.length; i++) {
                    resultTypes[i] = this.semanticInfoChain.anyTypeSymbol;
                }
            }

            return resultTypes;
        };

        PullTypeResolver.prototype.relateTypeToTypeParameters = function (expressionType, parameterType, shouldFix, argContext, enclosingDecl, context) {
            if (!expressionType || !parameterType) {
                return;
            }

            if (expressionType.isError()) {
                expressionType = this.semanticInfoChain.anyTypeSymbol;
            }

            if (parameterType === expressionType) {
                return;
            }

            if (parameterType.isTypeParameter()) {
                if (expressionType.isGeneric() && !expressionType.isFixed()) {
                    expressionType = this.specializeTypeToAny(expressionType, enclosingDecl, context);
                }
                argContext.addCandidateForInference(parameterType, expressionType, shouldFix);
                return;
            }
            var parameterDeclarations = parameterType.getDeclarations();
            var expressionDeclarations = expressionType.getDeclarations();
            if (!parameterType.isArray() && parameterDeclarations.length && expressionDeclarations.length && parameterDeclarations[0].isEqual(expressionDeclarations[0]) && expressionType.isGeneric()) {
                var typeParameters = parameterType.getIsSpecialized() ? parameterType.getTypeArguments() : parameterType.getTypeParameters();
                var typeArguments = expressionType.getTypeArguments();

                if (!typeArguments) {
                    typeParameters = parameterType.getTypeArguments();
                    typeArguments = expressionType.getIsSpecialized() ? expressionType.getTypeArguments() : expressionType.getTypeParameters();
                }

                if (typeParameters && typeArguments && typeParameters.length === typeArguments.length) {
                    for (var i = 0; i < typeParameters.length; i++) {
                        if (typeArguments[i] != typeParameters[i]) {
                            this.relateTypeToTypeParameters(typeArguments[i], typeParameters[i], true, argContext, enclosingDecl, context);
                        }
                    }
                }
            }

            var prevSpecializingToAny = context.specializingToAny;
            context.specializingToAny = true;

            if (!this.sourceIsAssignableToTarget(expressionType, parameterType, context)) {
                context.specializingToAny = prevSpecializingToAny;
                return;
            }
            context.specializingToAny = prevSpecializingToAny;

            if (expressionType.isArray() && parameterType.isArray()) {
                this.relateArrayTypeToTypeParameters(expressionType, parameterType, shouldFix, argContext, enclosingDecl, context);

                return;
            }

            this.relateObjectTypeToTypeParameters(expressionType, parameterType, shouldFix, argContext, enclosingDecl, context);
        };

        PullTypeResolver.prototype.relateFunctionSignatureToTypeParameters = function (expressionSignature, parameterSignature, argContext, enclosingDecl, context) {
            var expressionParams = expressionSignature.getParameters();
            var expressionReturnType = expressionSignature.getReturnType();

            var parameterParams = parameterSignature.getParameters();
            var parameterReturnType = parameterSignature.getReturnType();

            var len = parameterParams.length < expressionParams.length ? parameterParams.length : expressionParams.length;

            for (var i = 0; i < len; i++) {
                this.relateTypeToTypeParameters(expressionParams[i].getType(), parameterParams[i].getType(), true, argContext, enclosingDecl, context);
            }

            this.relateTypeToTypeParameters(expressionReturnType, parameterReturnType, false, argContext, enclosingDecl, context);
        };

        PullTypeResolver.prototype.relateObjectTypeToTypeParameters = function (objectType, parameterType, shouldFix, argContext, enclosingDecl, context) {
            var parameterTypeMembers = parameterType.getMembers();
            var parameterSignatures;
            var parameterSignature;

            var objectMember;
            var objectSignatures;

            if (argContext.alreadyRelatingTypes(objectType, parameterType)) {
                return;
            }

            var objectTypeArguments = objectType.getTypeArguments();
            var parameterTypeParameters = parameterType.getTypeParameters();

            if (objectTypeArguments && (objectTypeArguments.length === parameterTypeParameters.length)) {
                for (var i = 0; i < objectTypeArguments.length; i++) {
                    argContext.addCandidateForInference(parameterTypeParameters[i], objectTypeArguments[i], shouldFix);
                }
            }

            for (var i = 0; i < parameterTypeMembers.length; i++) {
                objectMember = objectType.findMember(parameterTypeMembers[i].getName());

                if (objectMember) {
                    this.relateTypeToTypeParameters(objectMember.getType(), parameterTypeMembers[i].getType(), shouldFix, argContext, enclosingDecl, context);
                }
            }

            parameterSignatures = parameterType.getCallSignatures();
            objectSignatures = objectType.getCallSignatures();

            for (var i = 0; i < parameterSignatures.length; i++) {
                parameterSignature = parameterSignatures[i];

                for (var j = 0; j < objectSignatures.length; j++) {
                    this.relateFunctionSignatureToTypeParameters(objectSignatures[j], parameterSignature, argContext, enclosingDecl, context);
                }
            }

            parameterSignatures = parameterType.getConstructSignatures();
            objectSignatures = objectType.getConstructSignatures();

            for (var i = 0; i < parameterSignatures.length; i++) {
                parameterSignature = parameterSignatures[i];

                for (var j = 0; j < objectSignatures.length; j++) {
                    this.relateFunctionSignatureToTypeParameters(objectSignatures[j], parameterSignature, argContext, enclosingDecl, context);
                }
            }

            parameterSignatures = parameterType.getIndexSignatures();
            objectSignatures = objectType.getIndexSignatures();

            for (var i = 0; i < parameterSignatures.length; i++) {
                parameterSignature = parameterSignatures[i];

                for (var j = 0; j < objectSignatures.length; j++) {
                    this.relateFunctionSignatureToTypeParameters(objectSignatures[j], parameterSignature, argContext, enclosingDecl, context);
                }
            }
        };

        PullTypeResolver.prototype.relateArrayTypeToTypeParameters = function (argArrayType, parameterArrayType, shouldFix, argContext, enclosingDecl, context) {
            var argElement = argArrayType.getElementType();
            var paramElement = parameterArrayType.getElementType();

            this.relateTypeToTypeParameters(argElement, paramElement, shouldFix, argContext, enclosingDecl, context);
        };

        PullTypeResolver.prototype.specializeTypeToAny = function (typeToSpecialize, enclosingDecl, context) {
            var prevSpecialize = context.specializingToAny;

            context.specializingToAny = true;

            var rootType = TypeScript.getRootType(typeToSpecialize);

            var type = TypeScript.specializeType(rootType, [], this, enclosingDecl, context);

            context.specializingToAny = prevSpecialize;

            return type;
        };

        PullTypeResolver.prototype.specializeSignatureToAny = function (signatureToSpecialize, enclosingDecl, context) {
            var typeParameters = signatureToSpecialize.getTypeParameters();
            var typeReplacementMap = {};
            var typeArguments = [];

            for (var i = 0; i < typeParameters.length; i++) {
                typeArguments[i] = this.semanticInfoChain.anyTypeSymbol;
                typeReplacementMap[typeParameters[i].getSymbolID().toString()] = typeArguments[i];
            }
            if (!typeArguments.length) {
                typeArguments[0] = this.semanticInfoChain.anyTypeSymbol;
            }

            var prevSpecialize = context.specializingToAny;

            context.specializingToAny = true;

            var sig = TypeScript.specializeSignature(signatureToSpecialize, false, typeReplacementMap, typeArguments, this, enclosingDecl, context);
            context.specializingToAny = prevSpecialize;

            return sig;
        };
        return PullTypeResolver;
    })();
    TypeScript.PullTypeResolver = PullTypeResolver;
})(TypeScript || (TypeScript = {}));
