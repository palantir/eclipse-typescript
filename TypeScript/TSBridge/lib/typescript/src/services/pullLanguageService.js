var Services;
(function (Services) {
    var LanguageService = (function () {
        function LanguageService(host) {
            this.host = host;
            this.currentFileName = "";
            this.currentFileVersion = -1;
            this.currentFileSyntaxTree = null;
            this.logger = this.host;
            this.compilerState = new Services.CompilerState(this.host);
        }
        LanguageService.prototype.refresh = function () {
            var _this = this;
            TypeScript.timeFunction(this.logger, "refresh()", function () {
                _this.compilerState.refresh();
            });
        };

        LanguageService.prototype.minimalRefresh = function () {
            var _this = this;
            TypeScript.timeFunction(this.logger, "minimalRefresh()", function () {
                _this.compilerState.minimalRefresh();
            });
        };

        LanguageService.prototype.getReferencesAtPosition = function (fileName, pos) {
            this.refresh();

            var result = [];

            var document = this.compilerState.getDocument(fileName);
            var script = document.script;

            var path = this.getAstPathToPosition(script, pos);
            if (path.ast() === null || path.ast().nodeType !== TypeScript.NodeType.Name) {
                this.logger.log("No name found at the given position");
                return result;
            }

            var symbolInfoAtPosition = this.compilerState.getSymbolInformationFromPath(path, document);
            if (symbolInfoAtPosition === null || symbolInfoAtPosition.symbol === null) {
                this.logger.log("No symbol found at the given position");
                return result;
            }

            var symbol = symbolInfoAtPosition.symbol;
            var symbolName = symbol.getName();

            var fileNames = this.compilerState.getFileNames();
            for (var i = 0, len = fileNames.length; i < len; i++) {
                var tempFileName = fileNames[i];

                var tempDocument = this.compilerState.getDocument(tempFileName);
                var filter = tempDocument.bloomFilter();

                if (filter.probablyContains(symbolName)) {
                    result = result.concat(this.getReferencesInFile(tempFileName, symbol));
                }
            }

            return result;
        };

        LanguageService.prototype.getOccurrencesAtPosition = function (fileName, pos) {
            this.refresh();

            var result = [];

            var document = this.compilerState.getDocument(fileName);
            var script = document.script;

            var path = this.getAstPathToPosition(script, pos);
            if (path.ast() === null || path.ast().nodeType !== TypeScript.NodeType.Name) {
                this.logger.log("No name found at the given position");
                return result;
            }

            var symbolInfoAtPosition = this.compilerState.getSymbolInformationFromPath(path, document);
            if (symbolInfoAtPosition === null || symbolInfoAtPosition.symbol === null) {
                this.logger.log("No symbol found at the given position");
                return result;
            }

            var symbol = symbolInfoAtPosition.symbol;
            return this.getReferencesInFile(fileName, symbol);
        };

        LanguageService.prototype.getImplementorsAtPosition = function (fileName, position) {
            return [];
        };

        LanguageService.prototype.getReferencesInFile = function (fileName, symbol) {
            var _this = this;
            var result = [];
            var symbolName = symbol.getDisplayName();

            var possiblePositions = this.getPossibleSymbolReferencePositions(fileName, symbolName);
            if (possiblePositions && possiblePositions.length > 0) {
                var document = this.compilerState.getDocument(fileName);
                var script = document.script;

                possiblePositions.forEach(function (p) {
                    var path = _this.getAstPathToPosition(script, p);
                    if (path.ast() === null || path.ast().nodeType !== TypeScript.NodeType.Name) {
                        return;
                    }
                    var searchSymbolInfoAtPosition = _this.compilerState.getSymbolInformationFromPath(path, document);

                    if (searchSymbolInfoAtPosition !== null) {
                        var referenceAST = Services.FindReferenceHelpers.getCorrectASTForReferencedSymbolName(searchSymbolInfoAtPosition.ast, symbolName);

                        if (referenceAST.limChar - referenceAST.minChar === symbolName.length && Services.FindReferenceHelpers.compareSymbolsForLexicalIdentity(searchSymbolInfoAtPosition.symbol, symbol)) {
                            var isWriteAccess = _this.isWriteAccess(path.ast(), path.parent());
                            result.push(new Services.ReferenceEntry(fileName, referenceAST.minChar, referenceAST.limChar, isWriteAccess));
                        }
                    }
                });
            }

            return result;
        };

        LanguageService.prototype.isWriteAccess = function (current, parent) {
            if (parent !== null) {
                var parentNodeType = parent.nodeType;
                switch (parentNodeType) {
                    case TypeScript.NodeType.ClassDeclaration:
                        return (parent).name === current;

                    case TypeScript.NodeType.InterfaceDeclaration:
                        return (parent).name === current;

                    case TypeScript.NodeType.ModuleDeclaration:
                        return (parent).name === current;

                    case TypeScript.NodeType.FunctionDeclaration:
                        return (parent).name === current;

                    case TypeScript.NodeType.ImportDeclaration:
                        return (parent).id === current;

                    case TypeScript.NodeType.VariableDeclarator:
                        var varDeclarator = parent;
                        return !!(varDeclarator.init && varDeclarator.id === current);

                    case TypeScript.NodeType.Parameter:
                        return true;

                    case TypeScript.NodeType.AssignmentExpression:
                    case TypeScript.NodeType.AddAssignmentExpression:
                    case TypeScript.NodeType.SubtractAssignmentExpression:
                    case TypeScript.NodeType.MultiplyAssignmentExpression:
                    case TypeScript.NodeType.DivideAssignmentExpression:
                    case TypeScript.NodeType.ModuloAssignmentExpression:
                    case TypeScript.NodeType.OrAssignmentExpression:
                    case TypeScript.NodeType.AndAssignmentExpression:
                    case TypeScript.NodeType.ExclusiveOrAssignmentExpression:
                    case TypeScript.NodeType.LeftShiftAssignmentExpression:
                    case TypeScript.NodeType.UnsignedRightShiftAssignmentExpression:
                    case TypeScript.NodeType.SignedRightShiftAssignmentExpression:
                        return (parent).operand1 === current;

                    case TypeScript.NodeType.PreIncrementExpression:
                    case TypeScript.NodeType.PostIncrementExpression:
                    case TypeScript.NodeType.PreDecrementExpression:
                    case TypeScript.NodeType.PostDecrementExpression:
                        return true;
                }
            }

            return false;
        };

        LanguageService.prototype.getPossibleSymbolReferencePositions = function (fileName, symbolName) {
            var positions = [];

            var sourceText = this.compilerState.getScriptSnapshot(fileName);
            var text = sourceText.getText(0, sourceText.getLength());

            var position = text.indexOf(symbolName);
            while (position >= 0) {
                positions.push(position);
                position = text.indexOf(symbolName, position + symbolName.length + 1);
            }

            return positions;
        };

        LanguageService.prototype.getSignatureAtPosition = function (fileName, position) {
            this.refresh();

            var document = this.compilerState.getDocument(fileName);

            if (Services.SignatureInfoHelpers.isSignatureHelpBlocker(document.syntaxTree().sourceUnit(), position)) {
                this.logger.log("position is not a valid singature help location");
                return null;
            }

            var genericTypeArgumentListInfo = Services.SignatureInfoHelpers.isInPartiallyWrittenTypeArgumentList(document.syntaxTree(), position);
            if (genericTypeArgumentListInfo) {
                return this.getTypeParameterSignatureFromPartiallyWrittenExpression(document, position, genericTypeArgumentListInfo);
            }

            var script = document.script;
            var path = this.getAstPathToPosition(script, position);
            if (path.count() == 0) {
                return null;
            }

            while (path.count() >= 2) {
                if (path.ast().nodeType === TypeScript.NodeType.InvocationExpression || path.ast().nodeType === TypeScript.NodeType.ObjectCreationExpression || (path.isDeclaration() && position > path.ast().minChar)) {
                    break;
                }

                path.pop();
            }

            if (path.ast().nodeType !== TypeScript.NodeType.InvocationExpression && path.ast().nodeType !== TypeScript.NodeType.ObjectCreationExpression) {
                this.logger.log("No call expression or generic arguments found for the given position");
                return null;
            }

            var callExpression = path.ast();
            var isNew = (callExpression.nodeType === TypeScript.NodeType.ObjectCreationExpression);

            if (position <= callExpression.target.limChar + callExpression.target.trailingTriviaWidth || position > callExpression.arguments.limChar + callExpression.arguments.trailingTriviaWidth) {
                this.logger.log("Outside argument list");
                return null;
            }

            var callSymbolInfo = this.compilerState.getCallInformationFromPath(path, document);
            if (!callSymbolInfo || !callSymbolInfo.targetSymbol || !callSymbolInfo.resolvedSignatures) {
                this.logger.log("Could not find symbol for call expression");
                return null;
            }

            var result = new Services.SignatureInfo();

            result.formal = Services.SignatureInfoHelpers.getSignatureInfoFromSignatureSymbol(callSymbolInfo.targetSymbol, callSymbolInfo.resolvedSignatures, callSymbolInfo.enclosingScopeSymbol, this.compilerState);
            result.actual = Services.SignatureInfoHelpers.getActualSignatureInfoFromCallExpression(callExpression, position, genericTypeArgumentListInfo);
            result.activeFormal = (callSymbolInfo.resolvedSignatures && callSymbolInfo.candidateSignature) ? callSymbolInfo.resolvedSignatures.indexOf(callSymbolInfo.candidateSignature) : -1;

            if (result.actual === null || result.formal === null || result.activeFormal === null) {
                this.logger.log("Can't compute actual and/or formal signature of the call expression");
                return null;
            }

            return result;
        };

        LanguageService.prototype.getTypeParameterSignatureFromPartiallyWrittenExpression = function (document, position, genericTypeArgumentListInfo) {
            var script = document.script;

            var path = this.getAstPathToPosition(script, genericTypeArgumentListInfo.genericIdentifer.start());
            if (path.count() == 0 || path.ast().nodeType !== TypeScript.NodeType.Name) {
                throw new Error("getTypeParameterSignatureAtPosition: Looking up path for identifier token did not result in an identifer.");
            }

            var symbolInformation = this.compilerState.getSymbolInformationFromPath(path, document);

            if (!symbolInformation.symbol) {
                return null;
            }

            var isNew = Services.SignatureInfoHelpers.isTargetOfObjectCreationExpression(genericTypeArgumentListInfo.genericIdentifer);

            var typeSymbol = symbolInformation.symbol.getType();

            if (typeSymbol.getKind() === TypeScript.PullElementKind.FunctionType || (isNew && typeSymbol.getKind() === TypeScript.PullElementKind.ConstructorType)) {
                var signatures = isNew ? typeSymbol.getConstructSignatures() : typeSymbol.getCallSignatures();

                var result = new Services.SignatureInfo();

                result.formal = Services.SignatureInfoHelpers.getSignatureInfoFromSignatureSymbol(symbolInformation.symbol, signatures, symbolInformation.enclosingScopeSymbol, this.compilerState);
                result.actual = Services.SignatureInfoHelpers.getActualSignatureInfoFromPartiallyWritenGenericExpression(position, genericTypeArgumentListInfo);
                result.activeFormal = 0;

                return result;
            } else if (typeSymbol.isGeneric()) {
                if (typeSymbol.getKind() === TypeScript.PullElementKind.ConstructorType) {
                    typeSymbol = typeSymbol.getAssociatedContainerType();
                }

                var result = new Services.SignatureInfo();

                result.formal = Services.SignatureInfoHelpers.getSignatureInfoFromGenericSymbol(typeSymbol, symbolInformation.enclosingScopeSymbol, this.compilerState);
                result.actual = Services.SignatureInfoHelpers.getActualSignatureInfoFromPartiallyWritenGenericExpression(position, genericTypeArgumentListInfo);
                result.activeFormal = 0;

                return result;
            }

            return null;
        };

        LanguageService.prototype.getDefinitionAtPosition = function (fileName, position) {
            this.refresh();

            var document = this.compilerState.getDocument(fileName);
            var script = document.script;

            var path = this.getAstPathToPosition(script, position);
            if (path.count() == 0) {
                return null;
            }

            var symbolInfo = this.compilerState.getSymbolInformationFromPath(path, document);
            if (symbolInfo == null || symbolInfo.symbol == null) {
                this.logger.log("No identifier at the specified location.");
                return null;
            }

            var declarations = symbolInfo.symbol.getDeclarations();
            if (declarations == null || declarations.length === 0) {
                this.logger.log("Could not find declaration for symbol.");
                return null;
            }

            var symbolName = symbolInfo.symbol.getDisplayName();
            var symbolKind = this.mapPullElementKind(symbolInfo.symbol.getKind(), symbolInfo.symbol);
            var container = symbolInfo.symbol.getContainer();
            var containerName = container ? container.fullName() : "";
            var containerKind = container ? this.mapPullElementKind(container.getKind(), container) : "";

            var result = [];
            var lastAddedSingature = null;
            for (var i = 0, n = declarations.length; i < n; i++) {
                var declaration = declarations[i];
                var span = declaration.getSpan();

                var nextEntryIndex = result.length;

                var signature = declaration.getSignatureSymbol();
                if (signature) {
                    if (lastAddedSingature && !lastAddedSingature.isDefinition) {
                        nextEntryIndex = lastAddedSingature.index;
                    }
                    lastAddedSingature = { isDefinition: signature.isDefinition(), index: nextEntryIndex };
                }

                result[nextEntryIndex] = new Services.DefinitionInfo(declaration.getScriptName(), span.start(), span.end(), symbolKind, symbolName, containerKind, containerName);
            }

            return result;
        };

        LanguageService.prototype.getNavigateToItems = function (searchValue) {
            return null;
        };

        LanguageService.prototype.getScriptLexicalStructure = function (fileName) {
            this.refresh();

            var declarations = this.compilerState.getTopLevelDeclarations(fileName);
            if (!declarations) {
                return null;
            }

            var result = [];
            this.mapPullDeclsToNavigateToItem(declarations, result);
            return result;
        };

        LanguageService.prototype.mapPullDeclsToNavigateToItem = function (declarations, result, parentSymbol, parentkindName, includeSubcontainers) {
            if (typeof includeSubcontainers === "undefined") { includeSubcontainers = true; }
            for (var i = 0, n = declarations.length; i < n; i++) {
                var declaration = declarations[i];
                var symbol = declaration.getSymbol();
                var kindName = this.mapPullElementKind(declaration.getKind(), symbol);
                var fileName = declaration.getScriptName();

                if (this.shouldIncludeDeclarationInNavigationItems(declaration, includeSubcontainers)) {
                    var item = new Services.NavigateToItem();
                    item.name = this.getNavigationItemDispalyName(declaration);
                    item.matchKind = Services.MatchKind.exact;
                    item.kind = kindName;
                    item.kindModifiers = symbol ? this.getScriptElementKindModifiers(symbol) : "";
                    item.fileName = fileName;
                    item.minChar = declaration.getSpan().start();
                    item.limChar = declaration.getSpan().end();
                    item.containerName = parentSymbol ? parentSymbol.fullName() : "";
                    item.containerKind = parentkindName || "";

                    result.push(item);
                }

                if (includeSubcontainers && this.isContainerDeclaration(declaration)) {
                    this.mapPullDeclsToNavigateToItem(declaration.getChildDecls(), result, symbol, kindName, true);

                    if (symbol) {
                        var otherDeclarations = symbol.getDeclarations();
                        if (otherDeclarations.length > 1) {
                            for (var j = 0, m = otherDeclarations.length; j < m; j++) {
                                var otherDeclaration = otherDeclarations[j];
                                if (otherDeclaration.getScriptName() === fileName) {
                                    continue;
                                }
                                this.mapPullDeclsToNavigateToItem(otherDeclaration.getChildDecls(), result, symbol, kindName, false);
                            }
                        }
                    }
                }
            }
        };

        LanguageService.prototype.isContainerDeclaration = function (declaration) {
            switch (declaration.getKind()) {
                case TypeScript.PullElementKind.Script:
                case TypeScript.PullElementKind.Container:
                case TypeScript.PullElementKind.Class:
                case TypeScript.PullElementKind.Interface:
                case TypeScript.PullElementKind.DynamicModule:
                case TypeScript.PullElementKind.Enum:
                    return true;
            }

            return false;
        };

        LanguageService.prototype.shouldIncludeDeclarationInNavigationItems = function (declaration, includeSubcontainers) {
            switch (declaration.getKind()) {
                case TypeScript.PullElementKind.Script:
                    return false;
                case TypeScript.PullElementKind.Variable:
                case TypeScript.PullElementKind.Property:
                    var symbol = declaration.getSymbol();
                    return !this.isModule(symbol) && !this.isDynamicModule(symbol) && !this.isConstructorMethod(symbol) && !this.isClass(symbol);
                case TypeScript.PullElementKind.EnumMember:
                    return true;
                case TypeScript.PullElementKind.FunctionExpression:
                case TypeScript.PullElementKind.Function:
                    return declaration.getName() !== "";
            }

            if (this.isContainerDeclaration(declaration)) {
                return includeSubcontainers;
            }

            return true;
        };

        LanguageService.prototype.getNavigationItemDispalyName = function (declaration) {
            switch (declaration.getKind()) {
                case TypeScript.PullElementKind.ConstructorMethod:
                    return "constructor";
                case TypeScript.PullElementKind.CallSignature:
                    return "()";
                case TypeScript.PullElementKind.ConstructSignature:
                    return "new()";
                case TypeScript.PullElementKind.IndexSignature:
                    return "[]";
            }

            return declaration.getDisplayName();
        };

        LanguageService.prototype.getSyntacticDiagnostics = function (fileName) {
            this.compilerState.refresh();
            return this.compilerState.getSyntacticDiagnostics(fileName);
        };

        LanguageService.prototype.getSemanticDiagnostics = function (fileName) {
            this.compilerState.refresh();
            return this.compilerState.getSemanticDiagnostics(fileName);
        };

        LanguageService.prototype.getEmitOutput = function (fileName) {
            this.compilerState.refresh();
            return this.compilerState.getEmitOutput(fileName);
        };

        LanguageService.prototype.getAstPathToPosition = function (script, pos, useTrailingTriviaAsLimChar, options) {
            if (typeof useTrailingTriviaAsLimChar === "undefined") { useTrailingTriviaAsLimChar = true; }
            if (typeof options === "undefined") { options = TypeScript.GetAstPathOptions.Default; }
            if (this.logger.information()) {
                this.logger.log("getAstPathToPosition(" + script + ", " + pos + ")");
            }

            return TypeScript.getAstPathToPosition(script, pos, useTrailingTriviaAsLimChar, options);
        };

        LanguageService.prototype.getFullNameOfSymbol = function (symbol, enclosingScopeSymbol) {
            var container = symbol.getContainer();
            if (this.isLocal(symbol) || symbol.getKind() == TypeScript.PullElementKind.Parameter) {
                return symbol.getScopedName(enclosingScopeSymbol);
            }

            if (symbol.getKind() == TypeScript.PullElementKind.Primitive) {
                return "";
            }

            return symbol.fullName(enclosingScopeSymbol);
        };

        LanguageService.prototype.getTypeInfoEligiblePath = function (fileName, position, isConstructorValidPosition) {
            this.refresh();

            var document = this.compilerState.getDocument(fileName);
            var script = document.script;

            var path = this.getAstPathToPosition(script, position, false);
            if (path.count() == 0) {
                return null;
            }

            var cur = path.ast();
            switch (cur.nodeType) {
                default:
                    return null;
                case TypeScript.NodeType.FunctionDeclaration:
                    var funcDecl = cur;

                    if (!isConstructorValidPosition || !funcDecl.isConstructor || !(position >= funcDecl.minChar && position <= funcDecl.minChar + 11)) {
                        return null;
                    }
                case TypeScript.NodeType.MemberAccessExpression:
                case TypeScript.NodeType.SuperExpression:
                case TypeScript.NodeType.StringLiteral:
                case TypeScript.NodeType.ThisExpression:
                case TypeScript.NodeType.Name:
                    return path;
            }
        };

        LanguageService.prototype.getTypeAtPosition = function (fileName, position) {
            var path = this.getTypeInfoEligiblePath(fileName, position, true);
            if (!path) {
                return null;
            }

            var document = this.compilerState.getDocument(fileName);
            var ast;
            var symbol;
            var typeSymbol;
            var enclosingScopeSymbol;
            var isCallExpression = false;
            var resolvedSignatures;
            var candidateSignature;
            var isConstructorCall;

            if (path.isNameOfClass() || path.isNameOfInterface() || path.isNameOfFunction() || path.isNameOfVariable()) {
                path.pop();
            }

            if (path.isDeclaration()) {
                var declarationInformation = this.compilerState.getDeclarationSymbolInformation(path, document);

                ast = declarationInformation.ast;
                symbol = declarationInformation.symbol;
                enclosingScopeSymbol = declarationInformation.enclosingScopeSymbol;

                if (path.ast().nodeType === TypeScript.NodeType.FunctionDeclaration) {
                    var funcDecl = (path.ast());
                    if (symbol && symbol.getKind() != TypeScript.PullElementKind.Property) {
                        var signatureInfo = TypeScript.PullHelpers.getSignatureForFuncDecl(funcDecl, this.compilerState.getSemanticInfoChain().getUnit(fileName));
                        isCallExpression = true;
                        candidateSignature = signatureInfo.signature;
                        resolvedSignatures = signatureInfo.allSignatures;
                    }
                }
            } else if (path.isCallExpression() || path.isCallExpressionTarget()) {
                while (!path.isCallExpression()) {
                    path.pop();
                }

                var callExpressionInformation = this.compilerState.getCallInformationFromPath(path, document);

                if (!callExpressionInformation.targetSymbol) {
                    return null;
                }

                ast = callExpressionInformation.ast;
                symbol = callExpressionInformation.targetSymbol;
                enclosingScopeSymbol = callExpressionInformation.enclosingScopeSymbol;

                var isPropertyOrVar = symbol.getKind() == TypeScript.PullElementKind.Property || symbol.getKind() == TypeScript.PullElementKind.Variable;
                typeSymbol = symbol.getType();
                if (isPropertyOrVar) {
                    if (typeSymbol.getName() != "") {
                        symbol = typeSymbol;
                    }
                    isPropertyOrVar = (typeSymbol.getKind() != TypeScript.PullElementKind.Interface && typeSymbol.getKind() != TypeScript.PullElementKind.ObjectType) || typeSymbol.getName() == "";
                }

                if (!isPropertyOrVar) {
                    isCallExpression = true;
                    resolvedSignatures = callExpressionInformation.resolvedSignatures;
                    candidateSignature = callExpressionInformation.candidateSignature;
                    isConstructorCall = callExpressionInformation.isConstructorCall;
                }
            } else {
                var symbolInformation = this.compilerState.getSymbolInformationFromPath(path, document);

                if (!symbolInformation.symbol) {
                    return null;
                }

                ast = symbolInformation.ast;
                symbol = symbolInformation.symbol;
                enclosingScopeSymbol = symbolInformation.enclosingScopeSymbol;

                if (symbol.getKind() === TypeScript.PullElementKind.Method || symbol.getKind() == TypeScript.PullElementKind.Function) {
                    typeSymbol = symbol.getType();
                    if (typeSymbol) {
                        isCallExpression = true;
                        resolvedSignatures = typeSymbol.getCallSignatures();
                    }
                }
            }

            if (resolvedSignatures && (!candidateSignature || candidateSignature.isDefinition())) {
                for (var i = 0, len = resolvedSignatures.length; i < len; i++) {
                    if (len > 1 && resolvedSignatures[i].isDefinition()) {
                        continue;
                    }

                    candidateSignature = resolvedSignatures[i];
                    break;
                }
            }

            var memberName = isCallExpression ? TypeScript.PullSignatureSymbol.getSignatureTypeMemberName(candidateSignature, resolvedSignatures, enclosingScopeSymbol) : symbol.getTypeNameEx(enclosingScopeSymbol, true);
            var kind = this.mapPullElementKind(symbol.getKind(), symbol, !isCallExpression, isCallExpression, isConstructorCall);
            var docComment = this.compilerState.getDocComments(candidateSignature || symbol, !isCallExpression);
            var symbolName = this.getFullNameOfSymbol(symbol, enclosingScopeSymbol);
            var minChar = ast ? ast.minChar : -1;
            var limChar = ast ? ast.limChar : -1;

            return new Services.TypeInfo(memberName, docComment, symbolName, kind, minChar, limChar);
        };

        LanguageService.prototype.getCompletionsAtPosition = function (fileName, position, isMemberCompletion) {
            this.refresh();

            var completions = new Services.CompletionInfo();

            var document = this.compilerState.getDocument(fileName);
            var script = document.script;

            if (Services.CompletionHelpers.isCompletionListBlocker(document.syntaxTree().sourceUnit(), position)) {
                this.logger.log("Returning an empty list because completion was blocked.");
                return null;
            }

            var path = this.getAstPathToPosition(script, position);

            var isRightOfDot = false;
            if (path.count() >= 1 && path.asts[path.top].nodeType === TypeScript.NodeType.MemberAccessExpression && (path.asts[path.top]).operand1.limChar < position) {
                isRightOfDot = true;
                path.push((path.asts[path.top]).operand1);
            } else if (path.count() >= 2 && path.asts[path.top].nodeType === TypeScript.NodeType.Name && path.asts[path.top - 1].nodeType === TypeScript.NodeType.MemberAccessExpression && (path.asts[path.top - 1]).operand2 === path.asts[path.top]) {
                isRightOfDot = true;
                path.pop();
                path.push((path.asts[path.top]).operand1);
            }

            if (isRightOfDot) {
                var members = this.compilerState.getVisibleMemberSymbolsFromPath(path, document);
                if (!members) {
                    return null;
                }
                completions.isMemberCompletion = true;
                completions.entries = this.getCompletionEntriesFromSymbols(members);
            } else {
                var containingObjectLiteral = Services.CompletionHelpers.getContaingingObjectLiteralApplicableForCompletion(document.syntaxTree().sourceUnit(), position);

                if (containingObjectLiteral) {
                    var searchPosition = Math.min(position, containingObjectLiteral.end());
                    path = this.getAstPathToPosition(script, searchPosition);

                    while (path.ast().nodeType !== TypeScript.NodeType.ObjectLiteralExpression) {
                        path.pop();
                    }

                    if (!path.ast() || path.ast().nodeType !== TypeScript.NodeType.ObjectLiteralExpression) {
                        throw TypeScript.Errors.invalidOperation("AST Path look up did not result in the same node as Fidelity Syntax Tree look up.");
                    }

                    completions.isMemberCompletion = true;

                    var contextualMembers = this.compilerState.geContextualMembersFromPath(path, document);
                    if (contextualMembers && contextualMembers.symbols && contextualMembers.symbols.length > 0) {
                        var existingMembers = this.compilerState.getVisibleMemberSymbolsFromPath(path, document);

                        completions.entries = this.getCompletionEntriesFromSymbols({
                            symbols: Services.CompletionHelpers.filterContextualMembersList(contextualMembers.symbols, existingMembers),
                            enclosingScopeSymbol: contextualMembers.enclosingScopeSymbol
                        });
                    }
                } else {
                    completions.isMemberCompletion = false;
                    var symbols = this.compilerState.getVisibleSymbolsFromPath(path, document);
                    completions.entries = this.getCompletionEntriesFromSymbols(symbols);
                }
            }

            if (!completions.isMemberCompletion) {
                completions.entries = completions.entries.concat(Services.KeywordCompletions.getKeywordCompltions());
            }

            return completions;
        };

        LanguageService.prototype.getCompletionEntriesFromSymbols = function (symbolInfo) {
            var result = [];

            for (var i = 0, n = symbolInfo.symbols.length; i < n; i++) {
                var symbol = symbolInfo.symbols[i];

                var symboDisplaylName = Services.CompletionHelpers.getValidCompletionEntryDisplayName(symbol, this.compilerState.compilationSettings().codeGenTarget);
                if (!symboDisplaylName) {
                    continue;
                }

                var entry = new Services.CompletionEntry();
                entry.name = symboDisplaylName;
                entry.type = symbol.getTypeName(symbolInfo.enclosingScopeSymbol, true);
                entry.kind = this.mapPullElementKind(symbol.getKind(), symbol, true);
                entry.fullSymbolName = this.getFullNameOfSymbol(symbol, symbolInfo.enclosingScopeSymbol);

                var type = symbol.getType();
                var symbolForDocComments = symbol;
                if (type && type.hasOnlyOverloadCallSignatures()) {
                    symbolForDocComments = type.getCallSignatures()[0];
                }

                entry.docComment = this.compilerState.getDocComments(symbolForDocComments, true);
                entry.kindModifiers = this.getScriptElementKindModifiers(symbol);
                result.push(entry);
            }

            return result;
        };

        LanguageService.prototype.isLocal = function (symbol) {
            var container = symbol.getContainer();
            if (container) {
                var containerKind = container.getKind();
                if (containerKind & (TypeScript.PullElementKind.SomeFunction | TypeScript.PullElementKind.FunctionType)) {
                    return true;
                }

                if (containerKind == TypeScript.PullElementKind.ConstructorType && !symbol.hasFlag(TypeScript.PullElementFlags.Static)) {
                    return true;
                }
            }

            return false;
        };

        LanguageService.prototype.isModule = function (symbol) {
            return this.isOneDeclarationOfKind(symbol, TypeScript.PullElementKind.Container);
        };

        LanguageService.prototype.isDynamicModule = function (symbol) {
            return this.isOneDeclarationOfKind(symbol, TypeScript.PullElementKind.DynamicModule);
        };

        LanguageService.prototype.isConstructorMethod = function (symbol) {
            return symbol.hasFlag(TypeScript.PullElementFlags.ClassConstructorVariable | TypeScript.PullElementFlags.Constructor);
        };

        LanguageService.prototype.isClass = function (symbol) {
            return this.isOneDeclarationOfKind(symbol, TypeScript.PullElementKind.Class);
        };

        LanguageService.prototype.isOneDeclarationOfKind = function (symbol, kind) {
            var decls = symbol.getDeclarations();
            for (var i = 0; i < decls.length; i++) {
                if (decls[i].getKind() === kind) {
                    return true;
                }
            }

            return false;
        };

        LanguageService.prototype.mapPullElementKind = function (kind, symbol, useConstructorAsClass, varIsFunction, functionIsConstructor) {
            if (functionIsConstructor) {
                return Services.ScriptElementKind.constructorImplementationElement;
            }

            if (varIsFunction) {
                switch (kind) {
                    case TypeScript.PullElementKind.Container:
                    case TypeScript.PullElementKind.DynamicModule:
                    case TypeScript.PullElementKind.TypeAlias:
                    case TypeScript.PullElementKind.Interface:
                    case TypeScript.PullElementKind.Class:
                    case TypeScript.PullElementKind.Parameter:
                        return Services.ScriptElementKind.functionElement;
                    case TypeScript.PullElementKind.Variable:
                        return (symbol && this.isLocal(symbol)) ? Services.ScriptElementKind.localFunctionElement : Services.ScriptElementKind.functionElement;
                    case TypeScript.PullElementKind.Property:
                        return Services.ScriptElementKind.memberFunctionElement;
                    case TypeScript.PullElementKind.Function:
                        return (symbol && this.isLocal(symbol)) ? Services.ScriptElementKind.localFunctionElement : Services.ScriptElementKind.functionElement;
                    case TypeScript.PullElementKind.ConstructorMethod:
                        return Services.ScriptElementKind.constructorImplementationElement;
                    case TypeScript.PullElementKind.Method:
                        return Services.ScriptElementKind.memberFunctionElement;
                    case TypeScript.PullElementKind.FunctionExpression:
                        return Services.ScriptElementKind.localFunctionElement;
                    case TypeScript.PullElementKind.GetAccessor:
                        return Services.ScriptElementKind.memberGetAccessorElement;
                    case TypeScript.PullElementKind.SetAccessor:
                        return Services.ScriptElementKind.memberSetAccessorElement;
                    case TypeScript.PullElementKind.CallSignature:
                        return Services.ScriptElementKind.callSignatureElement;
                    case TypeScript.PullElementKind.ConstructSignature:
                        return Services.ScriptElementKind.constructSignatureElement;
                    case TypeScript.PullElementKind.IndexSignature:
                        return Services.ScriptElementKind.indexSignatureElement;
                    case TypeScript.PullElementKind.TypeParameter:
                        return Services.ScriptElementKind.typeParameterElement;
                    case TypeScript.PullElementKind.Primitive:
                        return Services.ScriptElementKind.primitiveType;
                }
            } else {
                switch (kind) {
                    case TypeScript.PullElementKind.Script:
                        return Services.ScriptElementKind.scriptElement;
                    case TypeScript.PullElementKind.Container:
                    case TypeScript.PullElementKind.DynamicModule:
                    case TypeScript.PullElementKind.TypeAlias:
                        return Services.ScriptElementKind.moduleElement;
                    case TypeScript.PullElementKind.Interface:
                        return Services.ScriptElementKind.interfaceElement;
                    case TypeScript.PullElementKind.Class:
                        return Services.ScriptElementKind.classElement;
                    case TypeScript.PullElementKind.Enum:
                        return Services.ScriptElementKind.enumElement;
                    case TypeScript.PullElementKind.Variable:
                        if (symbol && this.isModule(symbol)) {
                            return Services.ScriptElementKind.moduleElement;
                        }
                        return (symbol && this.isLocal(symbol)) ? Services.ScriptElementKind.localVariableElement : Services.ScriptElementKind.variableElement;
                    case TypeScript.PullElementKind.Parameter:
                        return Services.ScriptElementKind.parameterElement;
                    case TypeScript.PullElementKind.Property:
                        return Services.ScriptElementKind.memberVariableElement;
                    case TypeScript.PullElementKind.Function:
                        return (symbol && this.isLocal(symbol)) ? Services.ScriptElementKind.localFunctionElement : Services.ScriptElementKind.functionElement;
                    case TypeScript.PullElementKind.ConstructorMethod:
                        return useConstructorAsClass ? Services.ScriptElementKind.classElement : Services.ScriptElementKind.constructorImplementationElement;
                    case TypeScript.PullElementKind.Method:
                        return Services.ScriptElementKind.memberFunctionElement;
                    case TypeScript.PullElementKind.FunctionExpression:
                        return Services.ScriptElementKind.localFunctionElement;
                    case TypeScript.PullElementKind.GetAccessor:
                        return Services.ScriptElementKind.memberGetAccessorElement;
                    case TypeScript.PullElementKind.SetAccessor:
                        return Services.ScriptElementKind.memberSetAccessorElement;
                    case TypeScript.PullElementKind.CallSignature:
                        return Services.ScriptElementKind.callSignatureElement;
                    case TypeScript.PullElementKind.ConstructSignature:
                        return Services.ScriptElementKind.constructSignatureElement;
                    case TypeScript.PullElementKind.IndexSignature:
                        return Services.ScriptElementKind.indexSignatureElement;
                    case TypeScript.PullElementKind.EnumMember:
                        return Services.ScriptElementKind.memberVariableElement;
                    case TypeScript.PullElementKind.TypeParameter:
                        return Services.ScriptElementKind.typeParameterElement;
                    case TypeScript.PullElementKind.Primitive:
                        return Services.ScriptElementKind.primitiveType;
                }
            }

            return Services.ScriptElementKind.unknown;
        };

        LanguageService.prototype.getScriptElementKindModifiers = function (symbol) {
            var result = [];

            if (symbol.hasFlag(TypeScript.PullElementFlags.Exported)) {
                result.push(Services.ScriptElementKindModifier.exportedModifier);
            }
            if (symbol.hasFlag(TypeScript.PullElementFlags.Ambient)) {
                result.push(Services.ScriptElementKindModifier.ambientModifier);
            }
            if (symbol.hasFlag(TypeScript.PullElementFlags.Public)) {
                result.push(Services.ScriptElementKindModifier.publicMemberModifier);
            }
            if (symbol.hasFlag(TypeScript.PullElementFlags.Private)) {
                result.push(Services.ScriptElementKindModifier.privateMemberModifier);
            }
            if (symbol.hasFlag(TypeScript.PullElementFlags.Static)) {
                result.push(Services.ScriptElementKindModifier.staticModifier);
            }

            return result.length > 0 ? result.join(',') : Services.ScriptElementKindModifier.none;
        };

        LanguageService.prototype.getNameOrDottedNameSpan = function (fileName, startPos, endPos) {
            var path = this.getTypeInfoEligiblePath(fileName, startPos, false);

            if (!path) {
                return null;
            }

            while (path.count() > 0) {
                if (path.isMemberOfMemberAccessExpression()) {
                    path.pop();
                } else {
                    break;
                }
            }
            var cur = path.ast();
            var spanInfo = new Services.SpanInfo(cur.minChar, cur.limChar);
            return spanInfo;
        };

        LanguageService.prototype.getBreakpointStatementAtPosition = function (fileName, pos) {
            this.minimalRefresh();
            var syntaxtree = this.getSyntaxTreeInternal(fileName);
            return Services.Breakpoints.getBreakpointLocation(syntaxtree, pos);
        };

        LanguageService.prototype.getFormattingEditsForRange = function (fileName, minChar, limChar, options) {
            this.minimalRefresh();

            var manager = this.getFormattingManager(fileName, options);

            return manager.formatSelection(minChar, limChar);
        };

        LanguageService.prototype.getFormattingEditsForDocument = function (fileName, minChar, limChar, options) {
            this.minimalRefresh();

            var manager = this.getFormattingManager(fileName, options);

            return manager.formatDocument(minChar, limChar);
        };

        LanguageService.prototype.getFormattingEditsOnPaste = function (fileName, minChar, limChar, options) {
            this.minimalRefresh();

            var manager = this.getFormattingManager(fileName, options);

            return manager.formatOnPaste(minChar, limChar);
        };

        LanguageService.prototype.getFormattingEditsAfterKeystroke = function (fileName, position, key, options) {
            this.minimalRefresh();

            var manager = this.getFormattingManager(fileName, options);

            if (key === "}") {
                return manager.formatOnClosingCurlyBrace(position);
            } else if (key === ";") {
                return manager.formatOnSemicolon(position);
            } else if (key === "\n") {
                return manager.formatOnEnter(position);
            }

            return [];
        };

        LanguageService.prototype.getFormattingManager = function (fileName, options) {
            if (this.formattingRulesProvider == null) {
                this.formattingRulesProvider = new TypeScript.Formatting.RulesProvider(this.logger);
            }

            this.formattingRulesProvider.ensureUpToDate(options);

            var syntaxTree = this.getSyntaxTreeInternal(fileName);

            var scriptSnapshot = this.compilerState.getScriptSnapshot(fileName);
            var scriptText = TypeScript.SimpleText.fromScriptSnapshot(scriptSnapshot);
            var textSnapshot = new TypeScript.Formatting.TextSnapshot(scriptText);

            var manager = new TypeScript.Formatting.FormattingManager(syntaxTree, textSnapshot, this.formattingRulesProvider, options);

            return manager;
        };

        LanguageService.prototype.getOutliningRegions = function (fileName) {
            this.minimalRefresh();

            var syntaxTree = this.getSyntaxTree(fileName);

            return Services.OutliningElementsCollector.collectElements(syntaxTree.sourceUnit());
        };

        LanguageService.prototype.getIndentationAtPosition = function (fileName, position, editorOptions) {
            this.minimalRefresh();

            var syntaxTree = this.getSyntaxTree(fileName);

            var scriptSnapshot = this.compilerState.getScriptSnapshot(fileName);
            var scriptText = TypeScript.SimpleText.fromScriptSnapshot(scriptSnapshot);
            var textSnapshot = new TypeScript.Formatting.TextSnapshot(scriptText);
            var options = new FormattingOptions(!editorOptions.ConvertTabsToSpaces, editorOptions.TabSize, editorOptions.IndentSize, editorOptions.NewLineCharacter);

            return TypeScript.Formatting.SingleTokenIndenter.getIndentationAmount(position, syntaxTree.sourceUnit(), textSnapshot, options);
        };

        LanguageService.prototype.getBraceMatchingAtPosition = function (fileName, position) {
            this.minimalRefresh();

            var syntaxTree = this.getSyntaxTreeInternal(fileName);

            return Services.BraceMatcher.getMatchSpans(syntaxTree, position);
        };

        LanguageService.prototype.getSyntaxTree = function (fileName) {
            this.minimalRefresh();

            return this.getSyntaxTreeInternal(fileName);
        };

        LanguageService.prototype.getSyntaxTreeInternal = function (fileName) {
            var version = this.compilerState.getScriptVersion(fileName);
            var syntaxTree = null;

            if (this.currentFileSyntaxTree === null || this.currentFileName !== fileName) {
                syntaxTree = this.createSyntaxTree(fileName);
            } else if (this.currentFileVersion !== version) {
                syntaxTree = this.updateSyntaxTree(fileName, this.currentFileSyntaxTree, this.currentFileVersion);
            }

            if (syntaxTree !== null) {
                this.currentFileVersion = version;
                this.currentFileName = fileName;
                this.currentFileSyntaxTree = syntaxTree;
            }

            return this.currentFileSyntaxTree;
        };

        LanguageService.prototype.createSyntaxTree = function (fileName) {
            var scriptSnapshot = this.compilerState.getScriptSnapshot(fileName);
            var text = TypeScript.SimpleText.fromScriptSnapshot(scriptSnapshot);

            var syntaxTree = TypeScript.Parser.parse(fileName, text, TypeScript.isDTSFile(fileName), this.compilerState.getHostCompilationSettings().codeGenTarget, TypeScript.getParseOptions(this.compilerState.getHostCompilationSettings()));

            return syntaxTree;
        };

        LanguageService.prototype.updateSyntaxTree = function (fileName, previousSyntaxTree, previousFileVersion) {
            var editRange = this.compilerState.getScriptTextChangeRangeSinceVersion(fileName, previousFileVersion);

            if (editRange === null) {
                return previousSyntaxTree;
            }

            var newScriptSnapshot = this.compilerState.getScriptSnapshot(fileName);
            var newSegmentedScriptSnapshot = TypeScript.SimpleText.fromScriptSnapshot(newScriptSnapshot);

            var nextSyntaxTree = TypeScript.Parser.incrementalParse(previousSyntaxTree, editRange, newSegmentedScriptSnapshot);

            return nextSyntaxTree;
        };
        return LanguageService;
    })();
    Services.LanguageService = LanguageService;
})(Services || (Services = {}));
