var TypeScript;
(function (TypeScript) {
    TypeScript.declCacheHit = 0;
    TypeScript.declCacheMiss = 0;
    TypeScript.symbolCacheHit = 0;
    TypeScript.symbolCacheMiss = 0;

    var SemanticInfo = (function () {
        function SemanticInfo(compilationUnitPath) {
            this.topLevelDecls = [];
            this.astDeclMap = new TypeScript.DataMap();
            this.declASTMap = new TypeScript.DataMap();
            this.syntaxElementDeclMap = new TypeScript.DataMap();
            this.declSyntaxElementMap = new TypeScript.DataMap();
            this.declSymbolMap = new TypeScript.DataMap();
            this.astSymbolMap = new TypeScript.DataMap();
            this.symbolASTMap = new TypeScript.DataMap();
            this.syntaxElementSymbolMap = new TypeScript.DataMap();
            this.symbolSyntaxElementMap = new TypeScript.DataMap();
            this.dynamicModuleImports = [];
            this.properties = new SemanticInfoProperties();
            this.hasBeenTypeChecked = false;
            this.compilationUnitPath = compilationUnitPath;
        }
        SemanticInfo.prototype.addTopLevelDecl = function (decl) {
            this.topLevelDecls[this.topLevelDecls.length] = decl;
        };

        SemanticInfo.prototype.setTypeChecked = function () {
            this.hasBeenTypeChecked = true;
        };
        SemanticInfo.prototype.getTypeChecked = function () {
            return this.hasBeenTypeChecked;
        };
        SemanticInfo.prototype.invalidate = function () {
            this.hasBeenTypeChecked = false;
        };

        SemanticInfo.prototype.getTopLevelDecls = function () {
            return this.topLevelDecls;
        };

        SemanticInfo.prototype.getPath = function () {
            return this.compilationUnitPath;
        };

        SemanticInfo.prototype.getDeclForAST = function (ast) {
            return this.astDeclMap.read(ast.getID().toString());
        };

        SemanticInfo.prototype.setDeclForAST = function (ast, decl) {
            this.astDeclMap.link(ast.getID().toString(), decl);
        };

        SemanticInfo.prototype.getDeclKey = function (decl) {
            var decl1 = decl;

            if (!decl1.__declKey) {
                decl1.__declKey = decl.getDeclID().toString() + "-" + decl.getKind().toString();
            }

            return decl1.__declKey;
        };

        SemanticInfo.prototype.getASTForDecl = function (decl) {
            return this.declASTMap.read(this.getDeclKey(decl));
        };

        SemanticInfo.prototype.setASTForDecl = function (decl, ast) {
            this.declASTMap.link(this.getDeclKey(decl), ast);
        };

        SemanticInfo.prototype.setSymbolAndDiagnosticsForAST = function (ast, symbolAndDiagnostics) {
            this.astSymbolMap.link(ast.getID().toString(), symbolAndDiagnostics);
            this.symbolASTMap.link(symbolAndDiagnostics.symbol.getSymbolID().toString(), ast);
        };

        SemanticInfo.prototype.getSymbolAndDiagnosticsForAST = function (ast) {
            return this.astSymbolMap.read(ast.getID().toString());
        };

        SemanticInfo.prototype.getASTForSymbol = function (symbol) {
            return this.symbolASTMap.read(symbol.getSymbolID().toString());
        };

        SemanticInfo.prototype.getSyntaxElementForDecl = function (decl) {
            return this.declSyntaxElementMap.read(this.getDeclKey(decl));
        };

        SemanticInfo.prototype.setSyntaxElementForDecl = function (decl, syntaxElement) {
            this.declSyntaxElementMap.link(this.getDeclKey(decl), syntaxElement);
        };

        SemanticInfo.prototype.getDeclForSyntaxElement = function (syntaxElement) {
            return this.syntaxElementDeclMap.read(TypeScript.Collections.identityHashCode(syntaxElement).toString());
        };

        SemanticInfo.prototype.setDeclForSyntaxElement = function (syntaxElement, decl) {
            this.syntaxElementDeclMap.link(TypeScript.Collections.identityHashCode(syntaxElement).toString(), decl);
        };

        SemanticInfo.prototype.getSyntaxElementForSymbol = function (symbol) {
            return this.symbolSyntaxElementMap.read(symbol.getSymbolID().toString());
        };

        SemanticInfo.prototype.getSymbolForSyntaxElement = function (syntaxElement) {
            return this.syntaxElementSymbolMap.read(TypeScript.Collections.identityHashCode(syntaxElement).toString());
        };

        SemanticInfo.prototype.setSymbolForSyntaxElement = function (syntaxElement, symbol) {
            this.syntaxElementSymbolMap.link(TypeScript.Collections.identityHashCode(syntaxElement).toString(), symbol);
            this.symbolSyntaxElementMap.link(symbol.getSymbolID().toString(), syntaxElement);
        };

        SemanticInfo.prototype.addDynamicModuleImport = function (importSymbol) {
            this.dynamicModuleImports[this.dynamicModuleImports.length] = importSymbol;
        };

        SemanticInfo.prototype.getDynamicModuleImports = function () {
            return this.dynamicModuleImports;
        };

        SemanticInfo.prototype.getDiagnostics = function (semanticErrors) {
            for (var i = 0; i < this.topLevelDecls.length; i++) {
                TypeScript.getDiagnosticsFromEnclosingDecl(this.topLevelDecls[i], semanticErrors);
            }
        };

        SemanticInfo.prototype.getProperties = function () {
            return this.properties;
        };
        return SemanticInfo;
    })();
    TypeScript.SemanticInfo = SemanticInfo;

    var SemanticInfoProperties = (function () {
        function SemanticInfoProperties() {
            this.unitContainsBool = false;
        }
        return SemanticInfoProperties;
    })();
    TypeScript.SemanticInfoProperties = SemanticInfoProperties;

    var SemanticInfoChain = (function () {
        function SemanticInfoChain() {
            this.units = [new SemanticInfo("")];
            this.declCache = new TypeScript.BlockIntrinsics();
            this.symbolCache = new TypeScript.BlockIntrinsics();
            this.unitCache = new TypeScript.BlockIntrinsics();
            this.anyTypeSymbol = null;
            this.booleanTypeSymbol = null;
            this.numberTypeSymbol = null;
            this.stringTypeSymbol = null;
            this.nullTypeSymbol = null;
            this.undefinedTypeSymbol = null;
            this.elementTypeSymbol = null;
            this.voidTypeSymbol = null;
            var span = new TypeScript.TextSpan(0, 0);
            var globalDecl = new TypeScript.PullDecl("", "", TypeScript.PullElementKind.Global, TypeScript.PullElementFlags.None, span, "");
            var globalInfo = this.units[0];
            globalInfo.addTopLevelDecl(globalDecl);

            this.anyTypeSymbol = this.addPrimitiveType("any", globalDecl);
            this.booleanTypeSymbol = this.addPrimitiveType("boolean", globalDecl);
            this.numberTypeSymbol = this.addPrimitiveType("number", globalDecl);
            this.stringTypeSymbol = this.addPrimitiveType("string", globalDecl);
            this.voidTypeSymbol = this.addPrimitiveType("void", globalDecl);
            this.elementTypeSymbol = this.addPrimitiveType("_element", globalDecl);

            this.nullTypeSymbol = this.addPrimitiveType("null", null);
            this.undefinedTypeSymbol = this.addPrimitiveType("undefined", null);
            this.addPrimitiveValue("undefined", this.undefinedTypeSymbol, globalDecl);
            this.addPrimitiveValue("null", this.nullTypeSymbol, globalDecl);
        }
        SemanticInfoChain.prototype.addPrimitiveType = function (name, globalDecl) {
            var span = new TypeScript.TextSpan(0, 0);
            var decl = new TypeScript.PullDecl(name, name, TypeScript.PullElementKind.Primitive, TypeScript.PullElementFlags.None, span, "");
            var symbol = new TypeScript.PullPrimitiveTypeSymbol(name);

            symbol.addDeclaration(decl);
            decl.setSymbol(symbol);

            symbol.setResolved();

            if (globalDecl) {
                globalDecl.addChildDecl(decl);
            }

            return symbol;
        };

        SemanticInfoChain.prototype.addPrimitiveValue = function (name, type, globalDecl) {
            var span = new TypeScript.TextSpan(0, 0);
            var decl = new TypeScript.PullDecl(name, name, TypeScript.PullElementKind.Variable, TypeScript.PullElementFlags.Ambient, span, "");
            var symbol = new TypeScript.PullSymbol(name, TypeScript.PullElementKind.Variable);

            symbol.addDeclaration(decl);
            decl.setSymbol(symbol);
            symbol.setType(type);
            symbol.setResolved();

            globalDecl.addChildDecl(decl);
        };

        SemanticInfoChain.prototype.addUnit = function (unit) {
            this.units[this.units.length] = unit;
            this.unitCache[unit.getPath()] = unit;
        };

        SemanticInfoChain.prototype.getUnit = function (compilationUnitPath) {
            for (var i = 0; i < this.units.length; i++) {
                if (this.units[i].getPath() === compilationUnitPath) {
                    return this.units[i];
                }
            }

            return null;
        };

        SemanticInfoChain.prototype.updateUnit = function (oldUnit, newUnit) {
            for (var i = 0; i < this.units.length; i++) {
                if (this.units[i].getPath() === oldUnit.getPath()) {
                    this.units[i] = newUnit;
                    this.unitCache[oldUnit.getPath()] = newUnit;
                    return;
                }
            }
        };

        SemanticInfoChain.prototype.collectAllTopLevelDecls = function () {
            var decls = [];
            var unitDecls;

            for (var i = 0; i < this.units.length; i++) {
                unitDecls = this.units[i].getTopLevelDecls();
                for (var j = 0; j < unitDecls.length; j++) {
                    decls[decls.length] = unitDecls[j];
                }
            }

            return decls;
        };

        SemanticInfoChain.prototype.getDeclPathCacheID = function (declPath, declKind) {
            var cacheID = "";

            for (var i = 0; i < declPath.length; i++) {
                cacheID += "#" + declPath[i];
            }

            return cacheID + "#" + declKind.toString();
        };

        SemanticInfoChain.prototype.findDecls = function (declPath, declKind) {
            var cacheID = this.getDeclPathCacheID(declPath, declKind);

            if (declPath.length) {
                var cachedDecls = this.declCache[cacheID];

                if (cachedDecls && cachedDecls.length) {
                    TypeScript.declCacheHit++;
                    return cachedDecls;
                }
            }

            TypeScript.declCacheMiss++;

            var declsToSearch = this.collectAllTopLevelDecls();

            var decls = [];
            var path;
            var foundDecls = [];
            var keepSearching = (declKind & TypeScript.PullElementKind.Container) || (declKind & TypeScript.PullElementKind.Interface);

            for (var i = 0; i < declPath.length; i++) {
                path = declPath[i];
                decls = [];

                for (var j = 0; j < declsToSearch.length; j++) {
                    var kind = (i === declPath.length - 1) ? declKind : TypeScript.PullElementKind.SomeType;
                    foundDecls = declsToSearch[j].searchChildDecls(path, kind);

                    for (var k = 0; k < foundDecls.length; k++) {
                        decls[decls.length] = foundDecls[k];
                    }

                    if (foundDecls.length && !keepSearching) {
                        break;
                    }
                }

                declsToSearch = decls;

                if (!declsToSearch) {
                    break;
                }
            }

            if (decls.length) {
                this.declCache[cacheID] = decls;
            }

            return decls;
        };

        SemanticInfoChain.prototype.findSymbol = function (declPath, declType) {
            var cacheID = this.getDeclPathCacheID(declPath, declType);

            if (declPath.length) {
                var cachedSymbol = this.symbolCache[cacheID];

                if (cachedSymbol) {
                    TypeScript.symbolCacheHit++;
                    return cachedSymbol;
                }
            }

            TypeScript.symbolCacheMiss++;

            var decls = this.findDecls(declPath, declType);
            var symbol = null;

            if (decls.length) {
                symbol = decls[0].getSymbol();

                if (symbol) {
                    this.symbolCache[cacheID] = symbol;

                    symbol.addCacheID(cacheID);
                }
            }

            return symbol;
        };

        SemanticInfoChain.prototype.cacheGlobalSymbol = function (symbol, kind) {
            var cacheID1 = this.getDeclPathCacheID([symbol.getName()], kind);
            var cacheID2 = this.getDeclPathCacheID([symbol.getName()], symbol.getKind());

            if (!this.symbolCache[cacheID1]) {
                this.symbolCache[cacheID1] = symbol;
                symbol.addCacheID(cacheID1);
            }

            if (!this.symbolCache[cacheID2]) {
                this.symbolCache[cacheID2] = symbol;
                symbol.addCacheID(cacheID2);
            }
        };

        SemanticInfoChain.prototype.update = function (compilationUnitPath) {
            this.declCache = new TypeScript.BlockIntrinsics();

            var unit = this.unitCache[compilationUnitPath];
            if (unit) {
                unit.invalidate();
            }
        };

        SemanticInfoChain.prototype.invalidateUnit = function (compilationUnitPath) {
            var unit = this.unitCache[compilationUnitPath];
            if (unit) {
                unit.invalidate();
            }
        };

        SemanticInfoChain.prototype.getDeclForAST = function (ast, unitPath) {
            var unit = this.unitCache[unitPath];

            if (unit) {
                return unit.getDeclForAST(ast);
            }

            return null;
        };

        SemanticInfoChain.prototype.getASTForDecl = function (decl) {
            var unit = this.unitCache[decl.getScriptName()];

            if (unit) {
                return unit.getASTForDecl(decl);
            }

            return null;
        };

        SemanticInfoChain.prototype.getSymbolAndDiagnosticsForAST = function (ast, unitPath) {
            var unit = this.unitCache[unitPath];

            if (unit) {
                return unit.getSymbolAndDiagnosticsForAST(ast);
            }

            return null;
        };

        SemanticInfoChain.prototype.getASTForSymbol = function (symbol, unitPath) {
            var unit = this.unitCache[unitPath];

            if (unit) {
                return unit.getASTForSymbol(symbol);
            }

            return null;
        };

        SemanticInfoChain.prototype.setSymbolAndDiagnosticsForAST = function (ast, symbolAndDiagnostics, unitPath) {
            var unit = this.unitCache[unitPath];

            if (unit) {
                unit.setSymbolAndDiagnosticsForAST(ast, symbolAndDiagnostics);
            }
        };

        SemanticInfoChain.prototype.removeSymbolFromCache = function (symbol) {
            var path = [symbol.getName()];
            var kind = (symbol.getKind() & TypeScript.PullElementKind.SomeType) !== 0 ? TypeScript.PullElementKind.SomeType : TypeScript.PullElementKind.SomeValue;

            var kindID = this.getDeclPathCacheID(path, kind);
            var symID = this.getDeclPathCacheID(path, symbol.getKind());

            symbol.addCacheID(kindID);
            symbol.addCacheID(symID);

            symbol.invalidateCachedIDs(this.symbolCache);
        };

        SemanticInfoChain.prototype.postDiagnostics = function () {
            var errors = [];

            for (var i = 1; i < this.units.length; i++) {
                this.units[i].getDiagnostics(errors);
            }

            return errors;
        };
        return SemanticInfoChain;
    })();
    TypeScript.SemanticInfoChain = SemanticInfoChain;
})(TypeScript || (TypeScript = {}));
