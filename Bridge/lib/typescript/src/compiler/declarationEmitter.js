var TypeScript;
(function (TypeScript) {
    var TextWriter = (function () {
        function TextWriter(ioHost, path, writeByteOrderMark) {
            this.ioHost = ioHost;
            this.path = path;
            this.writeByteOrderMark = writeByteOrderMark;
            this.contents = "";
            this.onNewLine = true;
        }
        TextWriter.prototype.Write = function (s) {
            this.contents += s;
            this.onNewLine = false;
        };

        TextWriter.prototype.WriteLine = function (s) {
            this.contents += s;
            this.contents += "\r\n";
            this.onNewLine = true;
        };

        TextWriter.prototype.Close = function () {
            try  {
                this.ioHost.writeFile(this.path, this.contents, this.writeByteOrderMark);
            } catch (e) {
                TypeScript.Emitter.throwEmitterError(e);
            }
        };
        return TextWriter;
    })();
    TypeScript.TextWriter = TextWriter;

    var DeclarationEmitter = (function () {
        function DeclarationEmitter(emittingFileName, semanticInfoChain, emitOptions, writeByteOrderMark) {
            this.emittingFileName = emittingFileName;
            this.semanticInfoChain = semanticInfoChain;
            this.emitOptions = emitOptions;
            this.writeByteOrderMark = writeByteOrderMark;
            this.fileName = null;
            this.declFile = null;
            this.indenter = new TypeScript.Indenter();
            this.declarationContainerStack = [];
            this.isDottedModuleName = [];
            this.ignoreCallbackAst = null;
            this.singleDeclFile = null;
            this.varListCount = 0;
            this.declFile = new TextWriter(emitOptions.ioHost, emittingFileName, writeByteOrderMark);
        }
        DeclarationEmitter.prototype.widenType = function (type) {
            if (type === this.semanticInfoChain.undefinedTypeSymbol || type === this.semanticInfoChain.nullTypeSymbol) {
                return this.semanticInfoChain.anyTypeSymbol;
            }

            return type;
        };

        DeclarationEmitter.prototype.close = function () {
            try  {
                this.declFile.Close();
            } catch (e) {
                TypeScript.Emitter.throwEmitterError(e);
            }
        };

        DeclarationEmitter.prototype.emitDeclarations = function (script) {
            TypeScript.AstWalkerWithDetailCallback.walk(script, this);
        };

        DeclarationEmitter.prototype.getAstDeclarationContainer = function () {
            return this.declarationContainerStack[this.declarationContainerStack.length - 1];
        };

        DeclarationEmitter.prototype.emitDottedModuleName = function () {
            return (this.isDottedModuleName.length === 0) ? false : this.isDottedModuleName[this.isDottedModuleName.length - 1];
        };

        DeclarationEmitter.prototype.getIndentString = function (declIndent) {
            if (typeof declIndent === "undefined") { declIndent = false; }
            if (this.emitOptions.compilationSettings.minWhitespace) {
                return "";
            } else {
                return this.indenter.getIndent();
            }
        };

        DeclarationEmitter.prototype.emitIndent = function () {
            this.declFile.Write(this.getIndentString());
        };

        DeclarationEmitter.prototype.canEmitSignature = function (declFlags, declAST, canEmitGlobalAmbientDecl, useDeclarationContainerTop) {
            if (typeof canEmitGlobalAmbientDecl === "undefined") { canEmitGlobalAmbientDecl = true; }
            if (typeof useDeclarationContainerTop === "undefined") { useDeclarationContainerTop = true; }
            var container;
            if (useDeclarationContainerTop) {
                container = this.getAstDeclarationContainer();
            } else {
                container = this.declarationContainerStack[this.declarationContainerStack.length - 2];
            }

            if (container.nodeType === TypeScript.NodeType.ModuleDeclaration && !TypeScript.hasFlag(declFlags, TypeScript.DeclFlags.Exported)) {
                var declSymbol = this.semanticInfoChain.getSymbolAndDiagnosticsForAST(declAST, this.fileName).symbol;
                return declSymbol && declSymbol.isExternallyVisible();
            }

            if (!canEmitGlobalAmbientDecl && container.nodeType === TypeScript.NodeType.Script && TypeScript.hasFlag(declFlags, TypeScript.DeclFlags.Ambient)) {
                return false;
            }

            return true;
        };

        DeclarationEmitter.prototype.canEmitPrePostAstSignature = function (declFlags, astWithPrePostCallback, preCallback) {
            if (this.ignoreCallbackAst) {
                TypeScript.CompilerDiagnostics.assert(this.ignoreCallbackAst !== astWithPrePostCallback, "Ignore Callback AST mismatch");
                this.ignoreCallbackAst = null;
                return false;
            } else if (preCallback && !this.canEmitSignature(declFlags, astWithPrePostCallback, true, preCallback)) {
                this.ignoreCallbackAst = astWithPrePostCallback;
                return false;
            }

            return true;
        };

        DeclarationEmitter.prototype.getDeclFlagsString = function (declFlags, typeString) {
            var result = this.getIndentString();

            if (TypeScript.hasFlag(declFlags, TypeScript.DeclFlags.Static)) {
                if (TypeScript.hasFlag(declFlags, TypeScript.DeclFlags.Private)) {
                    result += "private ";
                }
                result += "static ";
            } else {
                if (TypeScript.hasFlag(declFlags, TypeScript.DeclFlags.Private)) {
                    result += "private ";
                } else if (TypeScript.hasFlag(declFlags, TypeScript.DeclFlags.Public)) {
                    result += "public ";
                } else {
                    var emitDeclare = !TypeScript.hasFlag(declFlags, TypeScript.DeclFlags.Exported);

                    var container = this.getAstDeclarationContainer();
                    if (container.nodeType === TypeScript.NodeType.ModuleDeclaration && TypeScript.hasFlag((container).getModuleFlags(), TypeScript.ModuleFlags.IsWholeFile) && TypeScript.hasFlag(declFlags, TypeScript.DeclFlags.Exported)) {
                        result += "export ";
                        emitDeclare = true;
                    }

                    if (emitDeclare && typeString !== "interface") {
                        result += "declare ";
                    }

                    result += typeString + " ";
                }
            }

            return result;
        };

        DeclarationEmitter.prototype.emitDeclFlags = function (declFlags, typeString) {
            this.declFile.Write(this.getDeclFlagsString(declFlags, typeString));
        };

        DeclarationEmitter.prototype.canEmitTypeAnnotationSignature = function (declFlag) {
            if (typeof declFlag === "undefined") { declFlag = TypeScript.DeclFlags.None; }
            return !TypeScript.hasFlag(declFlag, TypeScript.DeclFlags.Private);
        };

        DeclarationEmitter.prototype.pushDeclarationContainer = function (ast) {
            this.declarationContainerStack.push(ast);
        };

        DeclarationEmitter.prototype.popDeclarationContainer = function (ast) {
            TypeScript.CompilerDiagnostics.assert(ast !== this.getAstDeclarationContainer(), 'Declaration container mismatch');
            this.declarationContainerStack.pop();
        };

        DeclarationEmitter.prototype.emitTypeNamesMember = function (memberName, emitIndent) {
            if (typeof emitIndent === "undefined") { emitIndent = false; }
            if (memberName.prefix === "{ ") {
                if (emitIndent) {
                    this.emitIndent();
                }

                this.declFile.WriteLine("{");
                this.indenter.increaseIndent();
                emitIndent = true;
            } else if (memberName.prefix !== "") {
                if (emitIndent) {
                    this.emitIndent();
                }

                this.declFile.Write(memberName.prefix);
                emitIndent = false;
            }

            if (memberName.isString()) {
                if (emitIndent) {
                    this.emitIndent();
                }

                this.declFile.Write((memberName).text);
            } else if (memberName.isArray()) {
                var ar = memberName;
                for (var index = 0; index < ar.entries.length; index++) {
                    this.emitTypeNamesMember(ar.entries[index], emitIndent);
                    if (ar.delim === "; ") {
                        this.declFile.WriteLine(";");
                    }
                }
            }

            if (memberName.suffix === "}") {
                this.indenter.decreaseIndent();
                this.emitIndent();
                this.declFile.Write(memberName.suffix);
            } else {
                this.declFile.Write(memberName.suffix);
            }
        };

        DeclarationEmitter.prototype.emitTypeSignature = function (type) {
            var declarationContainerAst = this.getAstDeclarationContainer();
            var declarationContainerDecl = this.semanticInfoChain.getDeclForAST(declarationContainerAst, this.fileName);
            var declarationPullSymbol = declarationContainerDecl.getSymbol();
            var typeNameMembers = type.getScopedNameEx(declarationPullSymbol);
            this.emitTypeNamesMember(typeNameMembers);
        };

        DeclarationEmitter.prototype.emitComment = function (comment) {
            var text = comment.getText();
            if (this.declFile.onNewLine) {
                this.emitIndent();
            } else if (!comment.isBlockComment) {
                this.declFile.WriteLine("");
                this.emitIndent();
            }

            this.declFile.Write(text[0]);

            for (var i = 1; i < text.length; i++) {
                this.declFile.WriteLine("");
                this.emitIndent();
                this.declFile.Write(text[i]);
            }

            if (comment.endsLine || !comment.isBlockComment) {
                this.declFile.WriteLine("");
            } else {
                this.declFile.Write(" ");
            }
        };

        DeclarationEmitter.prototype.emitDeclarationComments = function (astOrSymbol, endLine) {
            if (typeof endLine === "undefined") { endLine = true; }
            if (!this.emitOptions.compilationSettings.emitComments) {
                return;
            }

            var declComments = astOrSymbol.getDocComments();
            this.writeDeclarationComments(declComments, endLine);
        };

        DeclarationEmitter.prototype.writeDeclarationComments = function (declComments, endLine) {
            if (typeof endLine === "undefined") { endLine = true; }
            if (declComments.length > 0) {
                for (var i = 0; i < declComments.length; i++) {
                    this.emitComment(declComments[i]);
                }

                if (endLine) {
                    if (!this.declFile.onNewLine) {
                        this.declFile.WriteLine("");
                    }
                } else {
                    if (this.declFile.onNewLine) {
                        this.emitIndent();
                    }
                }
            }
        };

        DeclarationEmitter.prototype.emitTypeOfBoundDecl = function (boundDecl) {
            var decl = this.semanticInfoChain.getDeclForAST(boundDecl, this.fileName);
            var pullSymbol = decl.getSymbol();
            var type = this.widenType(pullSymbol.getType());
            if (!type) {
                return;
            }

            if (boundDecl.typeExpr || (boundDecl.init && type !== this.semanticInfoChain.anyTypeSymbol)) {
                this.declFile.Write(": ");
                this.emitTypeSignature(type);
            }
        };

        DeclarationEmitter.prototype.VariableDeclaratorCallback = function (pre, varDecl) {
            if (pre && this.canEmitSignature(TypeScript.ToDeclFlags(varDecl.getVarFlags()), varDecl, false)) {
                var interfaceMember = (this.getAstDeclarationContainer().nodeType === TypeScript.NodeType.InterfaceDeclaration);
                this.emitDeclarationComments(varDecl);
                if (!interfaceMember) {
                    if (this.varListCount >= 0) {
                        this.emitDeclFlags(TypeScript.ToDeclFlags(varDecl.getVarFlags()), "var");
                        this.varListCount = -this.varListCount;
                    }

                    this.declFile.Write(varDecl.id.actualText);
                } else {
                    this.emitIndent();
                    this.declFile.Write(varDecl.id.actualText);
                    if (TypeScript.hasFlag(varDecl.id.getFlags(), TypeScript.ASTFlags.OptionalName)) {
                        this.declFile.Write("?");
                    }
                }

                if (this.canEmitTypeAnnotationSignature(TypeScript.ToDeclFlags(varDecl.getVarFlags()))) {
                    this.emitTypeOfBoundDecl(varDecl);
                }

                if (this.varListCount > 0) {
                    this.varListCount--;
                } else if (this.varListCount < 0) {
                    this.varListCount++;
                }

                if (this.varListCount < 0) {
                    this.declFile.Write(", ");
                } else {
                    this.declFile.WriteLine(";");
                }
            }
            return false;
        };

        DeclarationEmitter.prototype.BlockCallback = function (pre, block) {
            return false;
        };

        DeclarationEmitter.prototype.VariableStatementCallback = function (pre, variableDeclaration) {
            return true;
        };

        DeclarationEmitter.prototype.VariableDeclarationCallback = function (pre, variableDeclaration) {
            if (pre) {
                this.varListCount = variableDeclaration.declarators.members.length;
            } else {
                this.varListCount = 0;
            }
            return true;
        };

        DeclarationEmitter.prototype.emitArgDecl = function (argDecl, funcDecl) {
            this.indenter.increaseIndent();

            this.emitDeclarationComments(argDecl, false);
            this.declFile.Write(argDecl.id.actualText);
            if (argDecl.isOptionalArg()) {
                this.declFile.Write("?");
            }

            this.indenter.decreaseIndent();

            if (this.canEmitTypeAnnotationSignature(TypeScript.ToDeclFlags(funcDecl.getFunctionFlags()))) {
                this.emitTypeOfBoundDecl(argDecl);
            }
        };

        DeclarationEmitter.prototype.isOverloadedCallSignature = function (funcDecl) {
            var functionDecl = this.semanticInfoChain.getDeclForAST(funcDecl, this.fileName);
            var funcSymbol = functionDecl.getSymbol();
            var funcTypeSymbol = funcSymbol.getType();
            var signatures = funcTypeSymbol.getCallSignatures();
            return signatures && signatures.length > 1;
        };

        DeclarationEmitter.prototype.FunctionDeclarationCallback = function (pre, funcDecl) {
            if (!pre) {
                return false;
            }

            if (funcDecl.isAccessor()) {
                return this.emitPropertyAccessorSignature(funcDecl);
            }

            var isInterfaceMember = (this.getAstDeclarationContainer().nodeType === TypeScript.NodeType.InterfaceDeclaration);

            var funcSymbol = this.semanticInfoChain.getSymbolAndDiagnosticsForAST(funcDecl, this.fileName).symbol;
            var funcTypeSymbol = funcSymbol.getType();
            if (funcDecl.block) {
                var constructSignatures = funcTypeSymbol.getConstructSignatures();
                if (constructSignatures && constructSignatures.length > 1) {
                    return false;
                } else if (this.isOverloadedCallSignature(funcDecl)) {
                    return false;
                }
            } else if (!isInterfaceMember && TypeScript.hasFlag(funcDecl.getFunctionFlags(), TypeScript.FunctionFlags.Private) && this.isOverloadedCallSignature(funcDecl)) {
                var callSignatures = funcTypeSymbol.getCallSignatures();
                TypeScript.Debug.assert(callSignatures && callSignatures.length > 1);
                var firstSignature = callSignatures[0].isDefinition() ? callSignatures[1] : callSignatures[0];
                var firstSignatureDecl = firstSignature.getDeclarations()[0];
                var firstFuncDecl = this.semanticInfoChain.getASTForDecl(firstSignatureDecl);
                if (firstFuncDecl !== funcDecl) {
                    return false;
                }
            }

            if (!this.canEmitSignature(TypeScript.ToDeclFlags(funcDecl.getFunctionFlags()), funcDecl, false)) {
                return false;
            }

            var funcSignature = this.semanticInfoChain.getDeclForAST(funcDecl, this.fileName).getSignatureSymbol();
            this.emitDeclarationComments(funcDecl);
            if (funcDecl.isConstructor) {
                this.emitIndent();
                this.declFile.Write("constructor");
                this.emitTypeParameters(funcDecl.typeArguments, funcSignature);
            } else {
                var id = funcDecl.getNameText();
                if (!isInterfaceMember) {
                    this.emitDeclFlags(TypeScript.ToDeclFlags(funcDecl.getFunctionFlags()), "function");
                    if (id !== "__missing" || !funcDecl.name || !funcDecl.name.isMissing()) {
                        this.declFile.Write(id);
                    } else if (funcDecl.isConstructMember()) {
                        this.declFile.Write("new");
                    }

                    this.emitTypeParameters(funcDecl.typeArguments, funcSignature);
                } else {
                    this.emitIndent();
                    if (funcDecl.isConstructMember()) {
                        this.declFile.Write("new");
                        this.emitTypeParameters(funcDecl.typeArguments, funcSignature);
                    } else if (!funcDecl.isCallMember() && !funcDecl.isIndexerMember()) {
                        this.declFile.Write(id);
                        this.emitTypeParameters(funcDecl.typeArguments, funcSignature);
                        if (TypeScript.hasFlag(funcDecl.name.getFlags(), TypeScript.ASTFlags.OptionalName)) {
                            this.declFile.Write("? ");
                        }
                    } else {
                        this.emitTypeParameters(funcDecl.typeArguments, funcSignature);
                    }
                }
            }

            if (!funcDecl.isIndexerMember()) {
                this.declFile.Write("(");
            } else {
                this.declFile.Write("[");
            }

            if (funcDecl.arguments) {
                var argsLen = funcDecl.arguments.members.length;
                if (funcDecl.variableArgList) {
                    argsLen--;
                }

                for (var i = 0; i < argsLen; i++) {
                    var argDecl = funcDecl.arguments.members[i];
                    this.emitArgDecl(argDecl, funcDecl);
                    if (i < (argsLen - 1)) {
                        this.declFile.Write(", ");
                    }
                }
            }

            if (funcDecl.variableArgList) {
                var lastArg = funcDecl.arguments.members[funcDecl.arguments.members.length - 1];
                if (funcDecl.arguments.members.length > 1) {
                    this.declFile.Write(", ...");
                } else {
                    this.declFile.Write("...");
                }

                this.emitArgDecl(lastArg, funcDecl);
            }

            if (!funcDecl.isIndexerMember()) {
                this.declFile.Write(")");
            } else {
                this.declFile.Write("]");
            }

            if (!funcDecl.isConstructor && this.canEmitTypeAnnotationSignature(TypeScript.ToDeclFlags(funcDecl.getFunctionFlags()))) {
                var returnType = funcSignature.getReturnType();
                if (funcDecl.returnTypeAnnotation || (returnType && returnType !== this.semanticInfoChain.anyTypeSymbol)) {
                    this.declFile.Write(": ");
                    this.emitTypeSignature(returnType);
                }
            }

            this.declFile.WriteLine(";");

            return false;
        };

        DeclarationEmitter.prototype.emitBaseExpression = function (bases, index) {
            var baseTypeAndDiagnostics = this.semanticInfoChain.getSymbolAndDiagnosticsForAST(bases.members[index], this.fileName);
            var baseType = baseTypeAndDiagnostics && baseTypeAndDiagnostics.symbol;
            this.emitTypeSignature(baseType);
        };

        DeclarationEmitter.prototype.emitBaseList = function (typeDecl, useExtendsList) {
            var bases = useExtendsList ? typeDecl.extendsList : typeDecl.implementsList;
            if (bases && (bases.members.length > 0)) {
                var qual = useExtendsList ? "extends" : "implements";
                this.declFile.Write(" " + qual + " ");
                var basesLen = bases.members.length;
                for (var i = 0; i < basesLen; i++) {
                    if (i > 0) {
                        this.declFile.Write(", ");
                    }
                    this.emitBaseExpression(bases, i);
                }
            }
        };

        DeclarationEmitter.prototype.emitAccessorDeclarationComments = function (funcDecl) {
            if (!this.emitOptions.compilationSettings.emitComments) {
                return;
            }

            var accessors = TypeScript.PullHelpers.getGetterAndSetterFunction(funcDecl, this.semanticInfoChain, this.fileName);
            var comments = [];
            if (accessors.getter) {
                comments = comments.concat(accessors.getter.getDocComments());
            }
            if (accessors.setter) {
                comments = comments.concat(accessors.setter.getDocComments());
            }
            this.writeDeclarationComments(comments);
        };

        DeclarationEmitter.prototype.emitPropertyAccessorSignature = function (funcDecl) {
            var accessorSymbol = TypeScript.PullHelpers.getAccessorSymbol(funcDecl, this.semanticInfoChain, this.fileName);
            if (!TypeScript.hasFlag(funcDecl.getFunctionFlags(), TypeScript.FunctionFlags.GetAccessor) && accessorSymbol.getGetter()) {
                return false;
            }

            this.emitAccessorDeclarationComments(funcDecl);
            this.emitDeclFlags(TypeScript.ToDeclFlags(funcDecl.getFunctionFlags()), "var");
            this.declFile.Write(funcDecl.name.actualText);
            if (this.canEmitTypeAnnotationSignature(TypeScript.ToDeclFlags(funcDecl.getFunctionFlags()))) {
                this.declFile.Write(" : ");
                var type = accessorSymbol.getType();
                this.emitTypeSignature(type);
            }
            this.declFile.WriteLine(";");

            return false;
        };

        DeclarationEmitter.prototype.emitClassMembersFromConstructorDefinition = function (funcDecl) {
            if (funcDecl.arguments) {
                var argsLen = funcDecl.arguments.members.length;
                if (funcDecl.variableArgList) {
                    argsLen--;
                }

                for (var i = 0; i < argsLen; i++) {
                    var argDecl = funcDecl.arguments.members[i];
                    if (TypeScript.hasFlag(argDecl.getVarFlags(), TypeScript.VariableFlags.Property)) {
                        this.emitDeclarationComments(argDecl);
                        this.emitDeclFlags(TypeScript.ToDeclFlags(argDecl.getVarFlags()), "var");
                        this.declFile.Write(argDecl.id.actualText);

                        if (this.canEmitTypeAnnotationSignature(TypeScript.ToDeclFlags(argDecl.getVarFlags()))) {
                            this.emitTypeOfBoundDecl(argDecl);
                        }
                        this.declFile.WriteLine(";");
                    }
                }
            }
        };

        DeclarationEmitter.prototype.ClassDeclarationCallback = function (pre, classDecl) {
            if (!this.canEmitPrePostAstSignature(TypeScript.ToDeclFlags(classDecl.getVarFlags()), classDecl, pre)) {
                return false;
            }

            if (pre) {
                var className = classDecl.name.actualText;
                this.emitDeclarationComments(classDecl);
                this.emitDeclFlags(TypeScript.ToDeclFlags(classDecl.getVarFlags()), "class");
                this.declFile.Write(className);
                this.pushDeclarationContainer(classDecl);
                this.emitTypeParameters(classDecl.typeParameters);
                this.emitBaseList(classDecl, true);
                this.emitBaseList(classDecl, false);
                this.declFile.WriteLine(" {");

                this.indenter.increaseIndent();
                if (classDecl.constructorDecl) {
                    this.emitClassMembersFromConstructorDefinition(classDecl.constructorDecl);
                }
            } else {
                this.indenter.decreaseIndent();
                this.popDeclarationContainer(classDecl);

                this.emitIndent();
                this.declFile.WriteLine("}");
            }

            return true;
        };

        DeclarationEmitter.prototype.emitTypeParameters = function (typeParams, funcSignature) {
            if (!typeParams || !typeParams.members.length) {
                return;
            }

            this.declFile.Write("<");
            var containerAst = this.getAstDeclarationContainer();
            var containerDecl = this.semanticInfoChain.getDeclForAST(containerAst, this.fileName);
            var containerSymbol = containerDecl.getSymbol();
            var typars;
            if (funcSignature) {
                typars = funcSignature.getTypeParameters();
            } else {
                typars = containerSymbol.getTypeArguments();
                if (!typars || !typars.length) {
                    typars = containerSymbol.getTypeParameters();
                }
            }

            for (var i = 0; i < typars.length; i++) {
                if (i) {
                    this.declFile.Write(", ");
                }

                var memberName = typars[i].getScopedNameEx(containerSymbol, true);
                this.emitTypeNamesMember(memberName);
            }

            this.declFile.Write(">");
        };

        DeclarationEmitter.prototype.InterfaceDeclarationCallback = function (pre, interfaceDecl) {
            if (!this.canEmitPrePostAstSignature(TypeScript.ToDeclFlags(interfaceDecl.getVarFlags()), interfaceDecl, pre)) {
                return false;
            }

            if (pre) {
                var interfaceName = interfaceDecl.name.actualText;
                this.emitDeclarationComments(interfaceDecl);
                this.emitDeclFlags(TypeScript.ToDeclFlags(interfaceDecl.getVarFlags()), "interface");
                this.declFile.Write(interfaceName);
                this.pushDeclarationContainer(interfaceDecl);
                this.emitTypeParameters(interfaceDecl.typeParameters);
                this.emitBaseList(interfaceDecl, true);
                this.declFile.WriteLine(" {");

                this.indenter.increaseIndent();
            } else {
                this.indenter.decreaseIndent();
                this.popDeclarationContainer(interfaceDecl);

                this.emitIndent();
                this.declFile.WriteLine("}");
            }

            return true;
        };

        DeclarationEmitter.prototype.ImportDeclarationCallback = function (pre, importDeclAST) {
            if (pre) {
                var importDecl = this.semanticInfoChain.getDeclForAST(importDeclAST, this.fileName);
                var importSymbol = importDecl.getSymbol();
                if (importSymbol.getTypeUsedExternally() || TypeScript.PullContainerTypeSymbol.usedAsSymbol(importSymbol.getContainer(), importSymbol)) {
                    this.emitDeclarationComments(importDeclAST);
                    this.emitIndent();
                    this.declFile.Write("import ");

                    this.declFile.Write(importDeclAST.id.actualText + " = ");
                    if (importDeclAST.isDynamicImport) {
                        this.declFile.WriteLine("require(" + importDeclAST.getAliasName() + ");");
                    } else {
                        this.declFile.WriteLine(importDeclAST.getAliasName() + ";");
                    }
                }
            }

            return false;
        };

        DeclarationEmitter.prototype.emitEnumSignature = function (moduleDecl) {
            if (!this.canEmitSignature(TypeScript.ToDeclFlags(moduleDecl.getModuleFlags()), moduleDecl)) {
                return false;
            }

            this.emitDeclarationComments(moduleDecl);
            this.emitDeclFlags(TypeScript.ToDeclFlags(moduleDecl.getModuleFlags()), "enum");
            this.declFile.WriteLine(moduleDecl.name.actualText + " {");

            this.indenter.increaseIndent();
            var membersLen = moduleDecl.members.members.length;
            for (var j = 0; j < membersLen; j++) {
                var memberDecl = moduleDecl.members.members[j];
                if (memberDecl.nodeType === TypeScript.NodeType.VariableStatement && !TypeScript.hasFlag(memberDecl.getFlags(), TypeScript.ASTFlags.EnumMapElement)) {
                    var variableStatement = memberDecl;
                    this.emitDeclarationComments(memberDecl);
                    this.emitIndent();
                    this.declFile.WriteLine((variableStatement.declaration.declarators.members[0]).id.actualText + ",");
                }
            }
            this.indenter.decreaseIndent();

            this.emitIndent();
            this.declFile.WriteLine("}");

            return false;
        };

        DeclarationEmitter.prototype.ModuleDeclarationCallback = function (pre, moduleDecl) {
            if (TypeScript.hasFlag(moduleDecl.getModuleFlags(), TypeScript.ModuleFlags.IsWholeFile)) {
                if (TypeScript.hasFlag(moduleDecl.getModuleFlags(), TypeScript.ModuleFlags.IsDynamic)) {
                    if (pre) {
                        if (!this.emitOptions.outputMany) {
                            this.singleDeclFile = this.declFile;
                            TypeScript.CompilerDiagnostics.assert(this.indenter.indentAmt === 0, "Indent has to be 0 when outputing new file");

                            var declareFileName = this.emitOptions.mapOutputFileName(this.fileName, TypeScript.TypeScriptCompiler.mapToDTSFileName);
                            var useUTF8InOutputfile = moduleDecl.containsUnicodeChar || (this.emitOptions.compilationSettings.emitComments && moduleDecl.containsUnicodeCharInComment);

                            this.declFile = new TextWriter(this.emitOptions.ioHost, declareFileName, this.writeByteOrderMark);
                        }
                        this.pushDeclarationContainer(moduleDecl);
                    } else {
                        if (!this.emitOptions.outputMany) {
                            TypeScript.CompilerDiagnostics.assert(this.singleDeclFile !== this.declFile, "singleDeclFile cannot be null as we are going to revert back to it");
                            TypeScript.CompilerDiagnostics.assert(this.indenter.indentAmt === 0, "Indent has to be 0 when outputing new file");

                            try  {
                                this.declFile.Close();
                            } catch (e) {
                                TypeScript.Emitter.throwEmitterError(e);
                            }

                            this.declFile = this.singleDeclFile;
                        }

                        this.popDeclarationContainer(moduleDecl);
                    }
                }

                return true;
            }

            if (moduleDecl.isEnum()) {
                if (pre) {
                    this.emitEnumSignature(moduleDecl);
                }
                return false;
            }

            if (!this.canEmitPrePostAstSignature(TypeScript.ToDeclFlags(moduleDecl.getModuleFlags()), moduleDecl, pre)) {
                return false;
            }

            if (pre) {
                if (this.emitDottedModuleName()) {
                    this.dottedModuleEmit += ".";
                } else {
                    this.dottedModuleEmit = this.getDeclFlagsString(TypeScript.ToDeclFlags(moduleDecl.getModuleFlags()), "module");
                }

                this.dottedModuleEmit += moduleDecl.name.actualText;

                var isCurrentModuleDotted = (moduleDecl.members.members.length === 1 && moduleDecl.members.members[0].nodeType === TypeScript.NodeType.ModuleDeclaration && !(moduleDecl.members.members[0]).isEnum() && TypeScript.hasFlag((moduleDecl.members.members[0]).getModuleFlags(), TypeScript.ModuleFlags.Exported));

                var moduleDeclComments = moduleDecl.getDocComments();
                isCurrentModuleDotted = isCurrentModuleDotted && (moduleDeclComments === null || moduleDeclComments.length === 0);

                this.isDottedModuleName.push(isCurrentModuleDotted);
                this.pushDeclarationContainer(moduleDecl);

                if (!isCurrentModuleDotted) {
                    this.emitDeclarationComments(moduleDecl);
                    this.declFile.Write(this.dottedModuleEmit);
                    this.declFile.WriteLine(" {");
                    this.indenter.increaseIndent();
                }
            } else {
                if (!this.emitDottedModuleName()) {
                    this.indenter.decreaseIndent();
                    this.emitIndent();
                    this.declFile.WriteLine("}");
                }

                this.popDeclarationContainer(moduleDecl);
                this.isDottedModuleName.pop();
            }

            return true;
        };

        DeclarationEmitter.prototype.ExportAssignmentCallback = function (pre, ast) {
            if (pre) {
                this.emitIndent();
                this.declFile.Write("export = ");
                this.declFile.Write((ast).id.actualText);
                this.declFile.WriteLine(";");
            }

            return false;
        };

        DeclarationEmitter.prototype.ScriptCallback = function (pre, script) {
            if (pre) {
                if (this.emitOptions.outputMany) {
                    for (var i = 0; i < script.referencedFiles.length; i++) {
                        var referencePath = script.referencedFiles[i].path;
                        var declareFileName;
                        if (TypeScript.isRooted(referencePath)) {
                            declareFileName = this.emitOptions.mapOutputFileName(referencePath, TypeScript.TypeScriptCompiler.mapToDTSFileName);
                        } else {
                            declareFileName = TypeScript.getDeclareFilePath(script.referencedFiles[i].path);
                        }
                        this.declFile.WriteLine('/// <reference path="' + declareFileName + '" />');
                    }
                }
                this.pushDeclarationContainer(script);
            } else {
                this.popDeclarationContainer(script);
            }
            return true;
        };

        DeclarationEmitter.prototype.DefaultCallback = function (pre, ast) {
            return !ast.isStatement();
        };
        return DeclarationEmitter;
    })();
    TypeScript.DeclarationEmitter = DeclarationEmitter;
})(TypeScript || (TypeScript = {}));
