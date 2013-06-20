var TypeScript;
(function (TypeScript) {
    (function (EmitContainer) {
        EmitContainer[EmitContainer["Prog"] = 0] = "Prog";
        EmitContainer[EmitContainer["Module"] = 1] = "Module";
        EmitContainer[EmitContainer["DynamicModule"] = 2] = "DynamicModule";
        EmitContainer[EmitContainer["Class"] = 3] = "Class";
        EmitContainer[EmitContainer["Constructor"] = 4] = "Constructor";
        EmitContainer[EmitContainer["Function"] = 5] = "Function";
        EmitContainer[EmitContainer["Args"] = 6] = "Args";
        EmitContainer[EmitContainer["Interface"] = 7] = "Interface";
    })(TypeScript.EmitContainer || (TypeScript.EmitContainer = {}));
    var EmitContainer = TypeScript.EmitContainer;

    var EmitState = (function () {
        function EmitState() {
            this.column = 0;
            this.line = 0;
            this.container = EmitContainer.Prog;
        }
        return EmitState;
    })();
    TypeScript.EmitState = EmitState;

    var EmitOptions = (function () {
        function EmitOptions(compilationSettings) {
            this.compilationSettings = compilationSettings;
            this.ioHost = null;
            this.outputMany = true;
            this.commonDirectoryPath = "";
        }
        EmitOptions.prototype.mapOutputFileName = function (fileName, extensionChanger) {
            if (this.outputMany) {
                var updatedFileName = fileName;
                if (this.compilationSettings.outputOption !== "") {
                    updatedFileName = fileName.replace(this.commonDirectoryPath, "");
                    updatedFileName = this.compilationSettings.outputOption + updatedFileName;
                }
                return extensionChanger(updatedFileName, false);
            } else {
                return extensionChanger(this.compilationSettings.outputOption, true);
            }
        };
        return EmitOptions;
    })();
    TypeScript.EmitOptions = EmitOptions;

    var Indenter = (function () {
        function Indenter() {
            this.indentAmt = 0;
        }
        Indenter.prototype.increaseIndent = function () {
            this.indentAmt += Indenter.indentStep;
        };

        Indenter.prototype.decreaseIndent = function () {
            this.indentAmt -= Indenter.indentStep;
        };

        Indenter.prototype.getIndent = function () {
            var indentString = Indenter.indentStrings[this.indentAmt];
            if (indentString === undefined) {
                indentString = "";
                for (var i = 0; i < this.indentAmt; i = i + Indenter.indentStep) {
                    indentString += Indenter.indentStepString;
                }
                Indenter.indentStrings[this.indentAmt] = indentString;
            }
            return indentString;
        };
        Indenter.indentStep = 4;
        Indenter.indentStepString = "    ";
        Indenter.indentStrings = [];
        return Indenter;
    })();
    TypeScript.Indenter = Indenter;

    var Emitter = (function () {
        function Emitter(emittingFileName, outfile, emitOptions, semanticInfoChain) {
            this.emittingFileName = emittingFileName;
            this.outfile = outfile;
            this.emitOptions = emitOptions;
            this.semanticInfoChain = semanticInfoChain;
            this.globalThisCapturePrologueEmitted = false;
            this.extendsPrologueEmitted = false;
            this.thisClassNode = null;
            this.thisFunctionDeclaration = null;
            this.moduleName = "";
            this.emitState = new EmitState();
            this.indenter = new Indenter();
            this.modAliasId = null;
            this.firstModAlias = null;
            this.allSourceMappers = [];
            this.sourceMapper = null;
            this.captureThisStmtString = "var _this = this;";
            this.varListCountStack = [0];
            this.pullTypeChecker = null;
            this.declStack = [];
            this.resolvingContext = new TypeScript.PullTypeResolutionContext();
            this.exportAssignmentIdentifier = null;
            this.document = null;
            this.pullTypeChecker = new TypeScript.PullTypeChecker(emitOptions.compilationSettings, semanticInfoChain);
        }
        Emitter.prototype.pushDecl = function (decl) {
            if (decl) {
                this.declStack[this.declStack.length] = decl;
            }
        };

        Emitter.prototype.popDecl = function (decl) {
            if (decl) {
                this.declStack.length--;
            }
        };

        Emitter.prototype.getEnclosingDecl = function () {
            var declStackLen = this.declStack.length;
            var enclosingDecl = declStackLen > 0 ? this.declStack[declStackLen - 1] : null;
            return enclosingDecl;
        };

        Emitter.prototype.setTypeCheckerUnit = function (fileName) {
            if (!this.pullTypeChecker.resolver) {
                this.pullTypeChecker.setUnit(fileName);
                return;
            }

            this.pullTypeChecker.resolver.setUnitPath(fileName);
        };

        Emitter.prototype.setExportAssignmentIdentifier = function (id) {
            this.exportAssignmentIdentifier = id;
        };

        Emitter.prototype.getExportAssignmentIdentifier = function () {
            return this.exportAssignmentIdentifier;
        };

        Emitter.prototype.setDocument = function (document) {
            this.document = document;
        };

        Emitter.prototype.importStatementShouldBeEmitted = function (importDeclAST, unitPath) {
            if (!importDeclAST.isDynamicImport) {
                return true;
            }

            var importDecl = this.semanticInfoChain.getDeclForAST(importDeclAST, this.document.fileName);
            var pullSymbol = importDecl.getSymbol();
            return pullSymbol.getIsUsedAsValue();
        };

        Emitter.prototype.setSourceMappings = function (mapper) {
            this.allSourceMappers.push(mapper);
            this.sourceMapper = mapper;
        };

        Emitter.prototype.writeToOutput = function (s) {
            this.outfile.Write(s);

            this.emitState.column += s.length;
        };

        Emitter.prototype.writeToOutputTrimmable = function (s) {
            if (this.emitOptions.compilationSettings.minWhitespace) {
                s = s.replace(/[\s]*/g, '');
            }
            this.writeToOutput(s);
        };

        Emitter.prototype.writeLineToOutput = function (s) {
            if (this.emitOptions.compilationSettings.minWhitespace) {
                this.writeToOutput(s);
                var c = s.charCodeAt(s.length - 1);
                if (!((c === TypeScript.CharacterCodes.space) || (c === TypeScript.CharacterCodes.semicolon) || (c === TypeScript.CharacterCodes.openBracket))) {
                    this.writeToOutput(' ');
                }
            } else {
                this.outfile.WriteLine(s);
                this.emitState.column = 0;
                this.emitState.line++;
            }
        };

        Emitter.prototype.writeCaptureThisStatement = function (ast) {
            this.emitIndent();
            this.recordSourceMappingStart(ast);
            this.writeToOutput(this.captureThisStmtString);
            this.recordSourceMappingEnd(ast);
            this.writeLineToOutput("");
        };

        Emitter.prototype.setInVarBlock = function (count) {
            this.varListCountStack[this.varListCountStack.length - 1] = count;
        };

        Emitter.prototype.setContainer = function (c) {
            var temp = this.emitState.container;
            this.emitState.container = c;
            return temp;
        };

        Emitter.prototype.getIndentString = function () {
            if (this.emitOptions.compilationSettings.minWhitespace) {
                return "";
            } else {
                return this.indenter.getIndent();
            }
        };

        Emitter.prototype.emitIndent = function () {
            this.writeToOutput(this.getIndentString());
        };

        Emitter.prototype.emitCommentInPlace = function (comment) {
            var text = comment.getText();
            var hadNewLine = false;

            if (comment.isBlockComment) {
                if (this.emitState.column === 0) {
                    this.emitIndent();
                }
                this.recordSourceMappingStart(comment);
                this.writeToOutput(text[0]);

                if (text.length > 1 || comment.endsLine) {
                    for (var i = 1; i < text.length; i++) {
                        this.writeLineToOutput("");
                        this.emitIndent();
                        this.writeToOutput(text[i]);
                    }
                    this.recordSourceMappingEnd(comment);
                    this.writeLineToOutput("");
                    hadNewLine = true;
                } else {
                    this.recordSourceMappingEnd(comment);
                }
            } else {
                if (this.emitState.column === 0) {
                    this.emitIndent();
                }
                this.recordSourceMappingStart(comment);
                this.writeToOutput(text[0]);
                this.recordSourceMappingEnd(comment);
                this.writeLineToOutput("");
                hadNewLine = true;
            }

            if (hadNewLine) {
                this.emitIndent();
            } else {
                this.writeToOutput(" ");
            }
        };

        Emitter.prototype.emitComments = function (ast, pre) {
            var comments = pre ? ast.preComments : ast.postComments;

            if (this.emitOptions.compilationSettings.emitComments && comments && comments.length !== 0) {
                for (var i = 0; i < comments.length; i++) {
                    this.emitCommentInPlace(comments[i]);
                }
            }
        };

        Emitter.prototype.emitObjectLiteral = function (objectLiteral) {
            var useNewLines = !TypeScript.hasFlag(objectLiteral.getFlags(), TypeScript.ASTFlags.SingleLine);

            this.writeToOutput("{");
            var list = objectLiteral.operand;
            if (list.members.length > 0) {
                if (useNewLines) {
                    this.writeLineToOutput("");
                } else {
                    this.writeToOutput(" ");
                }

                this.indenter.increaseIndent();
                this.emitCommaSeparatedList(list, useNewLines);
                this.indenter.decreaseIndent();
                if (useNewLines) {
                    this.emitIndent();
                } else {
                    this.writeToOutput(" ");
                }
            }
            this.writeToOutput("}");
        };

        Emitter.prototype.emitArrayLiteral = function (arrayLiteral) {
            var useNewLines = !TypeScript.hasFlag(arrayLiteral.getFlags(), TypeScript.ASTFlags.SingleLine);

            this.writeToOutput("[");
            var list = arrayLiteral.operand;
            if (list.members.length > 0) {
                if (useNewLines) {
                    this.writeLineToOutput("");
                }

                this.indenter.increaseIndent();
                this.emitCommaSeparatedList(list, useNewLines);
                this.indenter.decreaseIndent();
                if (useNewLines) {
                    this.emitIndent();
                }
            }
            this.writeToOutput("]");
        };

        Emitter.prototype.emitNew = function (target, args) {
            this.writeToOutput("new ");
            if (target.nodeType === TypeScript.NodeType.TypeRef) {
                var typeRef = target;
                if (typeRef.arrayCount) {
                    this.writeToOutput("Array()");
                } else {
                    typeRef.term.emit(this);
                    this.writeToOutput("()");
                }
            } else {
                target.emit(this);
                this.recordSourceMappingStart(args);
                this.writeToOutput("(");
                this.emitCommaSeparatedList(args);
                this.writeToOutput(")");
                this.recordSourceMappingEnd(args);
            }
        };

        Emitter.prototype.getVarDeclFromIdentifier = function (boundDeclInfo) {
            TypeScript.CompilerDiagnostics.assert(boundDeclInfo.boundDecl && boundDeclInfo.boundDecl.init && boundDeclInfo.boundDecl.init.nodeType === TypeScript.NodeType.Name, "The init expression of bound declaration when emitting as constant has to be indentifier");

            var init = boundDeclInfo.boundDecl.init;
            var ident = init;

            this.setTypeCheckerUnit(this.document.fileName);
            var pullSymbol = this.resolvingContext.resolvingTypeReference ? this.pullTypeChecker.resolver.resolveTypeNameExpression(ident, boundDeclInfo.pullDecl.getParentDecl(), this.resolvingContext).symbol : this.pullTypeChecker.resolver.resolveNameExpression(ident, boundDeclInfo.pullDecl.getParentDecl(), this.resolvingContext).symbol;
            if (pullSymbol) {
                var pullDecls = pullSymbol.getDeclarations();
                if (pullDecls.length === 1) {
                    var pullDecl = pullDecls[0];
                    var ast = this.semanticInfoChain.getASTForDecl(pullDecl);
                    if (ast && ast.nodeType === TypeScript.NodeType.VariableDeclarator) {
                        return { boundDecl: ast, pullDecl: pullDecl };
                    }
                }
            }

            return null;
        };

        Emitter.prototype.getConstantValue = function (boundDeclInfo) {
            var init = boundDeclInfo.boundDecl.init;
            if (init) {
                if (init.nodeType === TypeScript.NodeType.NumericLiteral) {
                    var numLit = init;
                    return numLit.value;
                } else if (init.nodeType === TypeScript.NodeType.LeftShiftExpression) {
                    var binop = init;
                    if (binop.operand1.nodeType === TypeScript.NodeType.NumericLiteral && binop.operand2.nodeType === TypeScript.NodeType.NumericLiteral) {
                        return (binop.operand1).value << (binop.operand2).value;
                    }
                } else if (init.nodeType === TypeScript.NodeType.Name) {
                    var varDeclInfo = this.getVarDeclFromIdentifier(boundDeclInfo);
                    if (varDeclInfo) {
                        return this.getConstantValue(varDeclInfo);
                    }
                }
            }

            return null;
        };

        Emitter.prototype.getConstantDecl = function (dotExpr) {
            this.setTypeCheckerUnit(this.document.fileName);
            var pullSymbol = this.pullTypeChecker.resolver.resolveDottedNameExpression(dotExpr, this.getEnclosingDecl(), this.resolvingContext).symbol;
            if (pullSymbol && pullSymbol.hasFlag(TypeScript.PullElementFlags.Constant)) {
                var pullDecls = pullSymbol.getDeclarations();
                if (pullDecls.length === 1) {
                    var pullDecl = pullDecls[0];
                    var ast = this.semanticInfoChain.getASTForDecl(pullDecl);
                    if (ast && ast.nodeType === TypeScript.NodeType.VariableDeclarator) {
                        return { boundDecl: ast, pullDecl: pullDecl };
                    }
                }
            }

            return null;
        };

        Emitter.prototype.tryEmitConstant = function (dotExpr) {
            if (!this.emitOptions.compilationSettings.propagateConstants) {
                return false;
            }
            var propertyName = dotExpr.operand2;
            var boundDeclInfo = this.getConstantDecl(dotExpr);
            if (boundDeclInfo) {
                var value = this.getConstantValue(boundDeclInfo);
                if (value !== null) {
                    this.writeToOutput(value.toString());
                    var comment = " /* ";
                    comment += propertyName.actualText;
                    comment += " */";
                    this.writeToOutput(comment);
                    return true;
                }
            }

            return false;
        };

        Emitter.prototype.emitCall = function (callNode, target, args) {
            if (!this.emitSuperCall(callNode)) {
                if (target.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                    this.writeToOutput("(");
                }
                if (callNode.target.nodeType === TypeScript.NodeType.SuperExpression && this.emitState.container === EmitContainer.Constructor) {
                    this.writeToOutput("_super.call");
                } else {
                    this.emitJavascript(target, false);
                }
                if (target.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                    this.writeToOutput(")");
                }
                this.recordSourceMappingStart(args);
                this.writeToOutput("(");
                if (callNode.target.nodeType === TypeScript.NodeType.SuperExpression && this.emitState.container === EmitContainer.Constructor) {
                    this.writeToOutput("this");
                    if (args && args.members.length) {
                        this.writeToOutput(", ");
                    }
                }
                this.emitCommaSeparatedList(args);
                this.writeToOutput(")");
                this.recordSourceMappingEnd(args);
            }
        };

        Emitter.prototype.emitInnerFunction = function (funcDecl, printName, includePreComments) {
            if (typeof includePreComments === "undefined") { includePreComments = true; }
            var pullDecl = this.semanticInfoChain.getDeclForAST(funcDecl, this.document.fileName);
            this.pushDecl(pullDecl);

            var shouldParenthesize = false;

            if (includePreComments) {
                this.emitComments(funcDecl, true);
            }

            if (shouldParenthesize) {
                this.writeToOutput("(");
            }
            this.recordSourceMappingStart(funcDecl);
            var accessorSymbol = funcDecl.isAccessor() ? TypeScript.PullHelpers.getAccessorSymbol(funcDecl, this.semanticInfoChain, this.document.fileName) : null;
            var container = accessorSymbol ? accessorSymbol.getContainer() : null;
            var containerKind = container ? container.getKind() : TypeScript.PullElementKind.None;
            if (!(funcDecl.isAccessor() && containerKind !== TypeScript.PullElementKind.Class && containerKind !== TypeScript.PullElementKind.ConstructorType)) {
                this.writeToOutput("function ");
            }

            if (funcDecl.isConstructor) {
                this.writeToOutput(this.thisClassNode.name.actualText);
            }

            if (printName) {
                var id = funcDecl.getNameText();
                if (id && !funcDecl.isAccessor()) {
                    if (funcDecl.name) {
                        this.recordSourceMappingStart(funcDecl.name);
                    }
                    this.writeToOutput(id);
                    if (funcDecl.name) {
                        this.recordSourceMappingEnd(funcDecl.name);
                    }
                }
            }

            this.writeToOutput("(");
            var argsLen = 0;
            if (funcDecl.arguments) {
                this.emitComments(funcDecl.arguments, true);

                var tempContainer = this.setContainer(EmitContainer.Args);
                argsLen = funcDecl.arguments.members.length;
                var printLen = argsLen;
                if (funcDecl.variableArgList) {
                    printLen--;
                }
                for (var i = 0; i < printLen; i++) {
                    var arg = funcDecl.arguments.members[i];
                    arg.emit(this);

                    if (i < (printLen - 1)) {
                        this.writeToOutput(", ");
                    }
                }
                this.setContainer(tempContainer);

                this.emitComments(funcDecl.arguments, false);
            }
            this.writeLineToOutput(") {");

            if (funcDecl.isConstructor) {
                this.recordSourceMappingNameStart("constructor");
            } else if (funcDecl.isGetAccessor()) {
                this.recordSourceMappingNameStart("get_" + funcDecl.getNameText());
            } else if (funcDecl.isSetAccessor()) {
                this.recordSourceMappingNameStart("set_" + funcDecl.getNameText());
            } else {
                this.recordSourceMappingNameStart(funcDecl.getNameText());
            }
            this.indenter.increaseIndent();

            this.emitDefaultValueAssignments(funcDecl);
            this.emitRestParameterInitializer(funcDecl);

            if (this.shouldCaptureThis(funcDecl)) {
                this.writeCaptureThisStatement(funcDecl);
            }

            if (funcDecl.isConstructor) {
                this.emitConstructorStatements(funcDecl);
            } else {
                this.emitModuleElements(funcDecl.block.statements);
            }

            this.indenter.decreaseIndent();
            this.emitIndent();
            this.recordSourceMappingStart(funcDecl.block.closeBraceSpan);
            this.writeToOutput("}");

            this.recordSourceMappingNameEnd();
            this.recordSourceMappingEnd(funcDecl.block.closeBraceSpan);
            this.recordSourceMappingEnd(funcDecl);

            if (shouldParenthesize) {
                this.writeToOutput(")");
            }

            this.recordSourceMappingEnd(funcDecl);

            this.emitComments(funcDecl, false);

            this.popDecl(pullDecl);
        };

        Emitter.prototype.emitDefaultValueAssignments = function (funcDecl) {
            var n = funcDecl.arguments.members.length;
            if (funcDecl.variableArgList) {
                n--;
            }

            for (var i = 0; i < n; i++) {
                var arg = funcDecl.arguments.members[i];
                if (arg.init) {
                    this.emitIndent();
                    this.recordSourceMappingStart(arg);
                    this.writeToOutput("if (typeof " + arg.id.actualText + " === \"undefined\") { ");
                    this.recordSourceMappingStart(arg.id);
                    this.writeToOutput(arg.id.actualText);
                    this.recordSourceMappingEnd(arg.id);
                    this.writeToOutput(" = ");
                    this.emitJavascript(arg.init, false);
                    this.writeLineToOutput("; }");
                    this.recordSourceMappingEnd(arg);
                }
            }
        };

        Emitter.prototype.emitRestParameterInitializer = function (funcDecl) {
            if (funcDecl.variableArgList) {
                var n = funcDecl.arguments.members.length;
                var lastArg = funcDecl.arguments.members[n - 1];
                this.emitIndent();
                this.recordSourceMappingStart(lastArg);
                this.writeToOutput("var ");
                this.recordSourceMappingStart(lastArg.id);
                this.writeToOutput(lastArg.id.actualText);
                this.recordSourceMappingEnd(lastArg.id);
                this.writeLineToOutput(" = [];");
                this.recordSourceMappingEnd(lastArg);
                this.emitIndent();
                this.writeToOutput("for (");
                this.recordSourceMappingStart(lastArg);
                this.writeToOutput("var _i = 0;");
                this.recordSourceMappingEnd(lastArg);
                this.writeToOutput(" ");
                this.recordSourceMappingStart(lastArg);
                this.writeToOutput("_i < (arguments.length - " + (n - 1) + ")");
                this.recordSourceMappingEnd(lastArg);
                this.writeToOutput("; ");
                this.recordSourceMappingStart(lastArg);
                this.writeToOutput("_i++");
                this.recordSourceMappingEnd(lastArg);
                this.writeLineToOutput(") {");
                this.indenter.increaseIndent();
                this.emitIndent();

                this.recordSourceMappingStart(lastArg);
                this.writeToOutput(lastArg.id.actualText + "[_i] = arguments[_i + " + (n - 1) + "];");
                this.recordSourceMappingEnd(lastArg);
                this.writeLineToOutput("");
                this.indenter.decreaseIndent();
                this.emitIndent();
                this.writeLineToOutput("}");
            }
        };

        Emitter.prototype.getModuleImportAndDependencyList = function (moduleDecl) {
            var importList = "";
            var dependencyList = "";

            var semanticInfo = this.semanticInfoChain.getUnit(this.document.fileName);
            var imports = semanticInfo.getDynamicModuleImports();

            if (imports.length) {
                for (var i = 0; i < imports.length; i++) {
                    var importStatement = imports[i];
                    var importStatementAST = semanticInfo.getASTForDecl(importStatement.getDeclarations()[0]);

                    if (importStatement.getIsUsedAsValue()) {
                        if (i <= imports.length - 1) {
                            dependencyList += ", ";
                            importList += ", ";
                        }

                        importList += "__" + importStatement.getName() + "__";
                        dependencyList += importStatementAST.firstAliasedModToString();
                    }
                }
            }

            for (var i = 0; i < moduleDecl.amdDependencies.length; i++) {
                dependencyList += ", \"" + moduleDecl.amdDependencies[i] + "\"";
            }

            return {
                importList: importList,
                dependencyList: dependencyList
            };
        };

        Emitter.prototype.shouldCaptureThis = function (ast) {
            if (ast.nodeType === TypeScript.NodeType.Script) {
                var scriptDecl = this.semanticInfoChain.getUnit(this.document.fileName).getTopLevelDecls()[0];
                return (scriptDecl.getFlags() & TypeScript.PullElementFlags.MustCaptureThis) === TypeScript.PullElementFlags.MustCaptureThis;
            }

            var decl = this.semanticInfoChain.getDeclForAST(ast, this.document.fileName);
            if (decl) {
                return (decl.getFlags() & TypeScript.PullElementFlags.MustCaptureThis) === TypeScript.PullElementFlags.MustCaptureThis;
            }

            return false;
        };

        Emitter.prototype.emitModule = function (moduleDecl) {
            var pullDecl = this.semanticInfoChain.getDeclForAST(moduleDecl, this.document.fileName);
            this.pushDecl(pullDecl);

            var modName = moduleDecl.name.actualText;
            if (TypeScript.isTSFile(modName)) {
                moduleDecl.name.setText(modName.substring(0, modName.length - 3));
            }

            var isDynamicMod = TypeScript.hasFlag(moduleDecl.getModuleFlags(), TypeScript.ModuleFlags.IsDynamic);
            var prevOutFile = this.outfile;
            var prevOutFileName = this.emittingFileName;
            var prevAllSourceMappers = this.allSourceMappers;
            var prevSourceMapper = this.sourceMapper;
            var prevColumn = this.emitState.column;
            var prevLine = this.emitState.line;
            var temp = this.setContainer(EmitContainer.Module);
            var svModuleName = this.moduleName;
            var isExported = TypeScript.hasFlag(moduleDecl.getModuleFlags(), TypeScript.ModuleFlags.Exported);
            var isWholeFile = TypeScript.hasFlag(moduleDecl.getModuleFlags(), TypeScript.ModuleFlags.IsWholeFile);
            this.moduleName = moduleDecl.name.actualText;

            if (isDynamicMod) {
                this.setExportAssignmentIdentifier(null);
                this.setContainer(EmitContainer.DynamicModule);

                this.recordSourceMappingStart(moduleDecl);
                if (this.emitOptions.compilationSettings.moduleGenTarget === TypeScript.ModuleGenTarget.Asynchronous) {
                    var dependencyList = "[\"require\", \"exports\"";
                    var importList = "require, exports";

                    var importAndDependencyList = this.getModuleImportAndDependencyList(moduleDecl);
                    importList += importAndDependencyList.importList;
                    dependencyList += importAndDependencyList.dependencyList + "]";

                    this.writeLineToOutput("define(" + dependencyList + "," + " function(" + importList + ") {");
                }
            } else {
                if (!isExported) {
                    this.recordSourceMappingStart(moduleDecl);
                    this.writeToOutput("var ");
                    this.recordSourceMappingStart(moduleDecl.name);
                    this.writeToOutput(this.moduleName);
                    this.recordSourceMappingEnd(moduleDecl.name);
                    this.writeLineToOutput(";");
                    this.recordSourceMappingEnd(moduleDecl);
                    this.emitIndent();
                }

                this.writeToOutput("(");
                this.recordSourceMappingStart(moduleDecl);
                this.writeToOutput("function (");
                this.recordSourceMappingStart(moduleDecl.name);
                this.writeToOutput(this.moduleName);
                this.recordSourceMappingEnd(moduleDecl.name);
                this.writeLineToOutput(") {");
            }

            if (!isWholeFile) {
                this.recordSourceMappingNameStart(this.moduleName);
            }

            if (!isDynamicMod || this.emitOptions.compilationSettings.moduleGenTarget === TypeScript.ModuleGenTarget.Asynchronous) {
                this.indenter.increaseIndent();
            }

            if (this.shouldCaptureThis(moduleDecl)) {
                this.writeCaptureThisStatement(moduleDecl);
            }

            this.emitModuleElements(moduleDecl.members);
            if (!isDynamicMod || this.emitOptions.compilationSettings.moduleGenTarget === TypeScript.ModuleGenTarget.Asynchronous) {
                this.indenter.decreaseIndent();
            }
            this.emitIndent();

            if (isDynamicMod) {
                var exportAssignmentIdentifier = this.getExportAssignmentIdentifier();
                var exportAssignmentValueSymbol = (pullDecl.getSymbol()).getExportAssignedValueSymbol();

                if (this.emitOptions.compilationSettings.moduleGenTarget === TypeScript.ModuleGenTarget.Asynchronous) {
                    if (exportAssignmentIdentifier && exportAssignmentValueSymbol && !(exportAssignmentValueSymbol.getKind() & TypeScript.PullElementKind.SomeTypeReference)) {
                        this.indenter.increaseIndent();
                        this.emitIndent();
                        this.writeLineToOutput("return " + exportAssignmentIdentifier + ";");
                        this.indenter.decreaseIndent();
                    }
                    this.writeToOutput("});");
                } else if (exportAssignmentIdentifier && exportAssignmentValueSymbol && !(exportAssignmentValueSymbol.getKind() & TypeScript.PullElementKind.SomeTypeReference)) {
                    this.emitIndent();
                    this.writeLineToOutput("module.exports = " + exportAssignmentIdentifier + ";");
                }

                if (!isWholeFile) {
                    this.recordSourceMappingNameEnd();
                }
                this.recordSourceMappingEnd(moduleDecl);

                if (this.outfile !== prevOutFile) {
                    this.emitSourceMapsAndClose();
                    if (prevSourceMapper !== null) {
                        this.allSourceMappers = prevAllSourceMappers;
                        this.sourceMapper = prevSourceMapper;
                        this.emitState.column = prevColumn;
                        this.emitState.line = prevLine;
                    }
                    this.outfile = prevOutFile;
                    this.emittingFileName = prevOutFileName;
                }
            } else {
                var parentIsDynamic = temp === EmitContainer.DynamicModule;
                this.recordSourceMappingStart(moduleDecl.endingToken);
                if (temp === EmitContainer.Prog && isExported) {
                    this.writeToOutput("}");
                    if (!isWholeFile) {
                        this.recordSourceMappingNameEnd();
                    }
                    this.recordSourceMappingEnd(moduleDecl.endingToken);
                    this.writeToOutput(")(this." + this.moduleName + " || (this." + this.moduleName + " = {}));");
                } else if (isExported || temp === EmitContainer.Prog) {
                    var dotMod = svModuleName !== "" ? (parentIsDynamic ? "exports" : svModuleName) + "." : svModuleName;
                    this.writeToOutput("}");
                    if (!isWholeFile) {
                        this.recordSourceMappingNameEnd();
                    }
                    this.recordSourceMappingEnd(moduleDecl.endingToken);
                    this.writeToOutput(")(" + dotMod + this.moduleName + " || (" + dotMod + this.moduleName + " = {}));");
                } else if (!isExported && temp !== EmitContainer.Prog) {
                    this.writeToOutput("}");
                    if (!isWholeFile) {
                        this.recordSourceMappingNameEnd();
                    }
                    this.recordSourceMappingEnd(moduleDecl.endingToken);
                    this.writeToOutput(")(" + this.moduleName + " || (" + this.moduleName + " = {}));");
                } else {
                    this.writeToOutput("}");
                    if (!isWholeFile) {
                        this.recordSourceMappingNameEnd();
                    }
                    this.recordSourceMappingEnd(moduleDecl.endingToken);
                    this.writeToOutput(")();");
                }

                this.recordSourceMappingEnd(moduleDecl);
                if (temp !== EmitContainer.Prog && isExported) {
                    this.recordSourceMappingStart(moduleDecl);
                    if (parentIsDynamic) {
                        this.writeLineToOutput("");
                        this.emitIndent();
                        this.writeToOutput("var " + this.moduleName + " = exports." + this.moduleName + ";");
                    } else {
                        this.writeLineToOutput("");
                        this.emitIndent();
                        this.writeToOutput("var " + this.moduleName + " = " + svModuleName + "." + this.moduleName + ";");
                    }
                    this.recordSourceMappingEnd(moduleDecl);
                }
            }

            this.setContainer(temp);
            this.moduleName = svModuleName;

            this.popDecl(pullDecl);
        };

        Emitter.prototype.emitEnumElement = function (varDecl) {
            this.writeToOutput(this.moduleName);
            this.writeToOutput('[');
            this.writeToOutput(this.moduleName);
            this.writeToOutput('["');
            this.writeToOutput(varDecl.id.text);
            this.writeToOutput('"] = ');
            varDecl.init.emit(this);
            this.writeToOutput('] = "');
            this.writeToOutput(varDecl.id.text);
            this.writeToOutput('";');
        };

        Emitter.prototype.emitIndex = function (operand1, operand2) {
            operand1.emit(this);
            this.writeToOutput("[");
            operand2.emit(this);
            this.writeToOutput("]");
        };

        Emitter.prototype.emitFunction = function (funcDecl) {
            if (TypeScript.hasFlag(funcDecl.getFunctionFlags(), TypeScript.FunctionFlags.Signature)) {
                return;
            }
            var temp;
            var tempFnc = this.thisFunctionDeclaration;
            this.thisFunctionDeclaration = funcDecl;

            if (funcDecl.isConstructor) {
                temp = this.setContainer(EmitContainer.Constructor);
            } else {
                temp = this.setContainer(EmitContainer.Function);
            }

            var funcName = funcDecl.getNameText();

            if (((temp !== EmitContainer.Constructor) || ((funcDecl.getFunctionFlags() & TypeScript.FunctionFlags.Method) === TypeScript.FunctionFlags.None))) {
                this.recordSourceMappingStart(funcDecl);
                this.emitInnerFunction(funcDecl, (funcDecl.name && !funcDecl.name.isMissing()));
            }
            this.setContainer(temp);
            this.thisFunctionDeclaration = tempFnc;

            if (!TypeScript.hasFlag(funcDecl.getFunctionFlags(), TypeScript.FunctionFlags.Signature)) {
                if (TypeScript.hasFlag(funcDecl.getFunctionFlags(), TypeScript.FunctionFlags.Static)) {
                    if (this.thisClassNode) {
                        this.writeLineToOutput("");
                        if (funcDecl.isAccessor()) {
                            this.emitPropertyAccessor(funcDecl, this.thisClassNode.name.actualText, false);
                        } else {
                            this.emitIndent();
                            this.recordSourceMappingStart(funcDecl);
                            this.writeToOutput(this.thisClassNode.name.actualText + "." + funcName + " = " + funcName + ";");
                            this.recordSourceMappingEnd(funcDecl);
                        }
                    }
                } else if ((this.emitState.container === EmitContainer.Module || this.emitState.container === EmitContainer.DynamicModule) && TypeScript.hasFlag(funcDecl.getFunctionFlags(), TypeScript.FunctionFlags.Exported)) {
                    this.writeLineToOutput("");
                    this.emitIndent();
                    var modName = this.emitState.container === EmitContainer.Module ? this.moduleName : "exports";
                    this.recordSourceMappingStart(funcDecl);
                    this.writeToOutput(modName + "." + funcName + " = " + funcName + ";");
                    this.recordSourceMappingEnd(funcDecl);
                }
            }
        };

        Emitter.prototype.emitAmbientVarDecl = function (varDecl) {
            if (varDecl.init) {
                this.emitComments(varDecl, true);
                this.recordSourceMappingStart(varDecl);
                this.recordSourceMappingStart(varDecl.id);
                this.writeToOutput(varDecl.id.actualText);
                this.recordSourceMappingEnd(varDecl.id);
                this.writeToOutput(" = ");
                this.emitJavascript(varDecl.init, false);
                this.recordSourceMappingEnd(varDecl);
                this.emitComments(varDecl, false);
            }
        };

        Emitter.prototype.varListCount = function () {
            return this.varListCountStack[this.varListCountStack.length - 1];
        };

        Emitter.prototype.emitVarDeclVar = function () {
            if (this.varListCount() >= 0) {
                this.writeToOutput("var ");
                this.setInVarBlock(-this.varListCount());
            }
            return true;
        };

        Emitter.prototype.onEmitVar = function () {
            if (this.varListCount() > 0) {
                this.setInVarBlock(this.varListCount() - 1);
            } else if (this.varListCount() < 0) {
                this.setInVarBlock(this.varListCount() + 1);
            }
        };

        Emitter.prototype.emitVariableDeclaration = function (declaration) {
            var varDecl = declaration.declarators.members[0];

            var symbolAndDiagnostics = this.semanticInfoChain.getSymbolAndDiagnosticsForAST(varDecl, this.document.fileName);
            var symbol = symbolAndDiagnostics && symbolAndDiagnostics.symbol;

            var parentSymbol = symbol ? symbol.getContainer() : null;
            var parentKind = parentSymbol ? parentSymbol.getKind() : TypeScript.PullElementKind.None;
            var inClass = parentKind === TypeScript.PullElementKind.Class;

            this.emitComments(declaration, true);
            this.recordSourceMappingStart(declaration);
            this.setInVarBlock(declaration.declarators.members.length);

            var isAmbientWithoutInit = TypeScript.hasFlag(varDecl.getVarFlags(), TypeScript.VariableFlags.Ambient) && varDecl.init === null;
            if (!isAmbientWithoutInit) {
                for (var i = 0, n = declaration.declarators.members.length; i < n; i++) {
                    var declarator = declaration.declarators.members[i];

                    if (i > 0) {
                        if (inClass) {
                            this.writeToOutputTrimmable(";");
                        } else {
                            this.writeToOutputTrimmable(", ");
                        }
                    }

                    declarator.emit(this);
                }
            }

            this.recordSourceMappingEnd(declaration);
            this.emitComments(declaration, false);
        };

        Emitter.prototype.emitVariableDeclarator = function (varDecl) {
            var pullDecl = this.semanticInfoChain.getDeclForAST(varDecl, this.document.fileName);
            this.pushDecl(pullDecl);
            if ((varDecl.getVarFlags() & TypeScript.VariableFlags.Ambient) === TypeScript.VariableFlags.Ambient) {
                this.emitAmbientVarDecl(varDecl);
                this.onEmitVar();
            } else {
                this.emitComments(varDecl, true);
                this.recordSourceMappingStart(varDecl);

                var symbolAndDiagnostics = this.semanticInfoChain.getSymbolAndDiagnosticsForAST(varDecl, this.document.fileName);
                var symbol = symbolAndDiagnostics && symbolAndDiagnostics.symbol;
                var parentSymbol = symbol ? symbol.getContainer() : null;
                var parentKind = parentSymbol ? parentSymbol.getKind() : TypeScript.PullElementKind.None;
                var associatedParentSymbol = parentSymbol ? parentSymbol.getAssociatedContainerType() : null;
                var associatedParentSymbolKind = associatedParentSymbol ? associatedParentSymbol.getKind() : TypeScript.PullElementKind.None;
                if (parentKind === TypeScript.PullElementKind.Class) {
                    if (this.emitState.container !== EmitContainer.Args) {
                        if (varDecl.isStatic()) {
                            this.writeToOutput(parentSymbol.getName() + ".");
                        } else {
                            this.writeToOutput("this.");
                        }
                    }
                } else if (parentKind === TypeScript.PullElementKind.Enum || parentKind === TypeScript.PullElementKind.DynamicModule || associatedParentSymbolKind === TypeScript.PullElementKind.Container || associatedParentSymbolKind === TypeScript.PullElementKind.DynamicModule || associatedParentSymbolKind === TypeScript.PullElementKind.Enum) {
                    if (!varDecl.isExported() && !varDecl.isProperty()) {
                        this.emitVarDeclVar();
                    } else {
                        if (this.emitState.container === EmitContainer.DynamicModule) {
                            this.writeToOutput("exports.");
                        } else {
                            this.writeToOutput(this.moduleName + ".");
                        }
                    }
                } else {
                    this.emitVarDeclVar();
                }

                this.recordSourceMappingStart(varDecl.id);
                this.writeToOutput(varDecl.id.actualText);
                this.recordSourceMappingEnd(varDecl.id);
                var hasInitializer = (varDecl.init !== null);
                if (hasInitializer) {
                    this.writeToOutputTrimmable(" = ");

                    this.varListCountStack.push(0);
                    varDecl.init.emit(this);
                    this.varListCountStack.pop();
                }

                if (parentKind === TypeScript.PullElementKind.Class) {
                    if (this.emitState.container !== EmitContainer.Args) {
                        this.writeToOutput(";");
                    }
                }

                this.onEmitVar();

                this.recordSourceMappingEnd(varDecl);
                this.emitComments(varDecl, false);
            }
            this.popDecl(pullDecl);
        };

        Emitter.prototype.symbolIsUsedInItsEnclosingContainer = function (symbol, dynamic) {
            if (typeof dynamic === "undefined") { dynamic = false; }
            var symDecls = symbol.getDeclarations();

            if (symDecls.length) {
                var enclosingDecl = this.getEnclosingDecl();
                if (enclosingDecl) {
                    var parentDecl = symDecls[0].getParentDecl();
                    if (parentDecl) {
                        var symbolDeclarationEnclosingContainer = parentDecl;
                        var enclosingContainer = enclosingDecl;

                        while (symbolDeclarationEnclosingContainer) {
                            if (symbolDeclarationEnclosingContainer.getKind() === (dynamic ? TypeScript.PullElementKind.DynamicModule : TypeScript.PullElementKind.Container)) {
                                break;
                            }
                            symbolDeclarationEnclosingContainer = symbolDeclarationEnclosingContainer.getParentDecl();
                        }

                        if (symbolDeclarationEnclosingContainer) {
                            while (enclosingContainer) {
                                if (enclosingContainer.getKind() === (dynamic ? TypeScript.PullElementKind.DynamicModule : TypeScript.PullElementKind.Container)) {
                                    break;
                                }

                                enclosingContainer = enclosingContainer.getParentDecl();
                            }
                        }

                        if (symbolDeclarationEnclosingContainer && enclosingContainer) {
                            var same = symbolDeclarationEnclosingContainer === enclosingContainer;

                            if (!same && symbol.hasFlag(TypeScript.PullElementFlags.InitializedModule)) {
                                same = symbolDeclarationEnclosingContainer === enclosingContainer.getParentDecl();
                            }

                            return same;
                        }
                    }
                }
            }

            return false;
        };

        Emitter.prototype.emitName = function (name, addThis) {
            this.emitComments(name, true);
            this.recordSourceMappingStart(name);
            if (!name.isMissing()) {
                this.setTypeCheckerUnit(this.document.fileName);
                var pullSymbolAndDiagnostics = this.resolvingContext.resolvingTypeReference ? this.pullTypeChecker.resolver.resolveTypeNameExpression(name, this.getEnclosingDecl(), this.resolvingContext) : this.pullTypeChecker.resolver.resolveNameExpression(name, this.getEnclosingDecl(), this.resolvingContext);
                var pullSymbol = pullSymbolAndDiagnostics.symbol;
                var pullSymbolAlias = pullSymbolAndDiagnostics.symbolAlias;
                var pullSymbolKind = pullSymbol.getKind();
                var isLocalAlias = pullSymbolAlias && (pullSymbolAlias.getDeclarations()[0].getParentDecl() == this.getEnclosingDecl());
                if (addThis && (this.emitState.container !== EmitContainer.Args) && pullSymbol) {
                    var pullSymbolContainer = pullSymbol.getContainer();

                    if (pullSymbolContainer) {
                        var pullSymbolContainerKind = pullSymbolContainer.getKind();

                        if (pullSymbolContainerKind === TypeScript.PullElementKind.Class) {
                            if (pullSymbol.hasFlag(TypeScript.PullElementFlags.Static)) {
                                this.writeToOutput(pullSymbolContainer.getName() + ".");
                            } else if (pullSymbolKind === TypeScript.PullElementKind.Property) {
                                this.emitThis();
                                this.writeToOutput(".");
                            }
                        } else if (pullSymbolContainerKind === TypeScript.PullElementKind.Container || pullSymbolContainerKind === TypeScript.PullElementKind.Enum || pullSymbolContainer.hasFlag(TypeScript.PullElementFlags.InitializedModule | TypeScript.PullElementFlags.InitializedEnum)) {
                            if (pullSymbolKind === TypeScript.PullElementKind.Property || pullSymbolKind === TypeScript.PullElementKind.EnumMember) {
                                this.writeToOutput(pullSymbolContainer.getName() + ".");
                            } else if (pullSymbol.hasFlag(TypeScript.PullElementFlags.Exported) && pullSymbolKind === TypeScript.PullElementKind.Variable && !pullSymbol.hasFlag(TypeScript.PullElementFlags.InitializedModule | TypeScript.PullElementFlags.InitializedEnum)) {
                                this.writeToOutput(pullSymbolContainer.getName() + ".");
                            } else if (pullSymbol.hasFlag(TypeScript.PullElementFlags.Exported) && !this.symbolIsUsedInItsEnclosingContainer(pullSymbol)) {
                                this.writeToOutput(pullSymbolContainer.getName() + ".");
                            }
                        } else if (pullSymbolContainerKind === TypeScript.PullElementKind.DynamicModule || pullSymbolContainer.hasFlag(TypeScript.PullElementFlags.InitializedDynamicModule)) {
                            if (pullSymbolKind === TypeScript.PullElementKind.Property) {
                                this.writeToOutput("exports.");
                            } else if (pullSymbol.hasFlag(TypeScript.PullElementFlags.Exported) && !isLocalAlias && !pullSymbol.hasFlag(TypeScript.PullElementFlags.ImplicitVariable) && pullSymbol.getKind() !== TypeScript.PullElementKind.ConstructorMethod && pullSymbol.getKind() !== TypeScript.PullElementKind.Class && pullSymbol.getKind() !== TypeScript.PullElementKind.Enum) {
                                this.writeToOutput("exports.");
                            }
                        } else if (pullSymbolKind === TypeScript.PullElementKind.Property) {
                            if (pullSymbolContainer.getKind() === TypeScript.PullElementKind.Class) {
                                this.emitThis();
                                this.writeToOutput(".");
                            }
                        } else {
                            var pullDecls = pullSymbol.getDeclarations();
                            var emitContainerName = true;
                            for (var i = 0; i < pullDecls.length; i++) {
                                if (pullDecls[i].getScriptName() === this.document.fileName) {
                                    emitContainerName = false;
                                }
                            }
                            if (emitContainerName) {
                                this.writeToOutput(pullSymbolContainer.getName() + ".");
                            }
                        }
                    }
                }

                if (pullSymbol && pullSymbolKind === TypeScript.PullElementKind.DynamicModule) {
                    if (this.emitOptions.compilationSettings.moduleGenTarget === TypeScript.ModuleGenTarget.Asynchronous) {
                        this.writeToOutput("__" + this.modAliasId + "__");
                    } else {
                        var moduleDecl = this.semanticInfoChain.getASTForSymbol(pullSymbol, this.document.fileName);
                        var modPath = name.actualText;
                        var isAmbient = pullSymbol.hasFlag(TypeScript.PullElementFlags.Ambient);
                        modPath = isAmbient ? modPath : this.firstModAlias ? this.firstModAlias : TypeScript.quoteBaseName(modPath);
                        modPath = isAmbient ? modPath : (!TypeScript.isRelative(TypeScript.stripQuotes(modPath)) ? TypeScript.quoteStr("./" + TypeScript.stripQuotes(modPath)) : modPath);
                        this.writeToOutput("require(" + modPath + ")");
                    }
                } else {
                    this.writeToOutput(name.actualText);
                }
            }

            this.recordSourceMappingEnd(name);
            this.emitComments(name, false);
        };

        Emitter.prototype.recordSourceMappingNameStart = function (name) {
            if (this.sourceMapper) {
                var finalName = name;
                if (!name) {
                    finalName = "";
                } else if (this.sourceMapper.currentNameIndex.length > 0) {
                    finalName = this.sourceMapper.names[this.sourceMapper.currentNameIndex[this.sourceMapper.currentNameIndex.length - 1]] + "." + name;
                }

                this.sourceMapper.names.push(finalName);
                this.sourceMapper.currentNameIndex.push(this.sourceMapper.names.length - 1);
            }
        };

        Emitter.prototype.recordSourceMappingNameEnd = function () {
            if (this.sourceMapper) {
                this.sourceMapper.currentNameIndex.pop();
            }
        };

        Emitter.prototype.recordSourceMappingStart = function (ast) {
            if (this.sourceMapper && TypeScript.isValidAstNode(ast)) {
                var lineCol = { line: -1, character: -1 };
                var sourceMapping = new TypeScript.SourceMapping();
                sourceMapping.start.emittedColumn = this.emitState.column;
                sourceMapping.start.emittedLine = this.emitState.line;

                var lineMap = this.document.lineMap;
                lineMap.fillLineAndCharacterFromPosition(ast.minChar, lineCol);
                sourceMapping.start.sourceColumn = lineCol.character;
                sourceMapping.start.sourceLine = lineCol.line + 1;
                lineMap.fillLineAndCharacterFromPosition(ast.limChar, lineCol);
                sourceMapping.end.sourceColumn = lineCol.character;
                sourceMapping.end.sourceLine = lineCol.line + 1;
                if (this.sourceMapper.currentNameIndex.length > 0) {
                    sourceMapping.nameIndex = this.sourceMapper.currentNameIndex[this.sourceMapper.currentNameIndex.length - 1];
                }

                var siblings = this.sourceMapper.currentMappings[this.sourceMapper.currentMappings.length - 1];
                siblings.push(sourceMapping);
                this.sourceMapper.currentMappings.push(sourceMapping.childMappings);
            }
        };

        Emitter.prototype.recordSourceMappingEnd = function (ast) {
            if (this.sourceMapper && TypeScript.isValidAstNode(ast)) {
                this.sourceMapper.currentMappings.pop();

                var siblings = this.sourceMapper.currentMappings[this.sourceMapper.currentMappings.length - 1];
                var sourceMapping = siblings[siblings.length - 1];

                sourceMapping.end.emittedColumn = this.emitState.column;
                sourceMapping.end.emittedLine = this.emitState.line;
            }
        };

        Emitter.prototype.emitSourceMapsAndClose = function () {
            if (this.sourceMapper !== null) {
                TypeScript.SourceMapper.emitSourceMapping(this.allSourceMappers);
            }

            try  {
                this.outfile.Close();
            } catch (e) {
                Emitter.throwEmitterError(e);
            }
        };

        Emitter.prototype.emitParameterPropertyAndMemberVariableAssignments = function () {
            var constructorDecl = this.thisClassNode.constructorDecl;

            if (constructorDecl && constructorDecl.arguments) {
                for (var i = 0, n = constructorDecl.arguments.members.length; i < n; i++) {
                    var arg = constructorDecl.arguments.members[i];
                    if ((arg.getVarFlags() & TypeScript.VariableFlags.Property) !== TypeScript.VariableFlags.None) {
                        this.emitIndent();
                        this.recordSourceMappingStart(arg);
                        this.recordSourceMappingStart(arg.id);
                        this.writeToOutput("this." + arg.id.actualText);
                        this.recordSourceMappingEnd(arg.id);
                        this.writeToOutput(" = ");
                        this.recordSourceMappingStart(arg.id);
                        this.writeToOutput(arg.id.actualText);
                        this.recordSourceMappingEnd(arg.id);
                        this.writeLineToOutput(";");
                        this.recordSourceMappingEnd(arg);
                    }
                }
            }

            for (var i = 0, n = this.thisClassNode.members.members.length; i < n; i++) {
                if (this.thisClassNode.members.members[i].nodeType === TypeScript.NodeType.VariableDeclarator) {
                    var varDecl = this.thisClassNode.members.members[i];
                    if (!TypeScript.hasFlag(varDecl.getVarFlags(), TypeScript.VariableFlags.Static) && varDecl.init) {
                        this.emitIndent();
                        this.emitVariableDeclarator(varDecl);
                        this.writeLineToOutput("");
                    }
                }
            }
        };

        Emitter.prototype.emitCommaSeparatedList = function (list, startLine) {
            if (typeof startLine === "undefined") { startLine = false; }
            if (list === null) {
                return;
            } else {
                for (var i = 0, n = list.members.length; i < n; i++) {
                    var emitNode = list.members[i];
                    this.emitJavascript(emitNode, startLine);

                    if (i < (n - 1)) {
                        this.writeToOutput(startLine ? "," : ", ");
                    }

                    if (startLine) {
                        this.writeLineToOutput("");
                    }
                }
            }
        };

        Emitter.prototype.emitModuleElements = function (list) {
            if (list === null) {
                return;
            }

            this.emitComments(list, true);
            var lastEmittedNode = null;

            for (var i = 0, n = list.members.length; i < n; i++) {
                var node = list.members[i];

                if (node.shouldEmit()) {
                    this.emitSpaceBetweenConstructs(lastEmittedNode, node);

                    this.emitJavascript(node, true);
                    this.writeLineToOutput("");

                    lastEmittedNode = node;
                }
            }

            this.emitComments(list, false);
        };

        Emitter.prototype.isDirectivePrologueElement = function (node) {
            if (node.nodeType === TypeScript.NodeType.ExpressionStatement) {
                var exprStatement = node;
                return exprStatement.expression.nodeType === TypeScript.NodeType.StringLiteral;
            }

            return false;
        };

        Emitter.prototype.emitSpaceBetweenConstructs = function (node1, node2) {
            if (node1 === null || node2 === null) {
                return;
            }

            if (node1.minChar === -1 || node1.limChar === -1 || node2.minChar === -1 || node2.limChar === -1) {
                return;
            }

            var lineMap = this.document.lineMap;
            var node1EndLine = lineMap.getLineNumberFromPosition(node1.limChar);
            var node2StartLine = lineMap.getLineNumberFromPosition(node2.minChar);

            if ((node2StartLine - node1EndLine) > 1) {
                this.writeLineToOutput("");
            }
        };

        Emitter.prototype.emitScriptElements = function (script, requiresExtendsBlock) {
            var list = script.moduleElements;
            this.emitComments(list, true);

            for (var i = 0, n = list.members.length; i < n; i++) {
                var node = list.members[i];

                if (!this.isDirectivePrologueElement(node)) {
                    break;
                }

                this.emitJavascript(node, true);
                this.writeLineToOutput("");
            }

            this.emitPrologue(script, requiresExtendsBlock);
            var lastEmittedNode = null;

            for (; i < n; i++) {
                var node = list.members[i];

                if (node.shouldEmit()) {
                    this.emitSpaceBetweenConstructs(lastEmittedNode, node);

                    this.emitJavascript(node, true);
                    this.writeLineToOutput("");

                    lastEmittedNode = node;
                }
            }

            this.emitComments(list, false);
        };

        Emitter.prototype.emitConstructorStatements = function (funcDecl) {
            var list = funcDecl.block.statements;

            if (list === null) {
                return;
            }

            this.emitComments(list, true);

            var emitPropertyAssignmentsAfterSuperCall = this.thisClassNode.extendsList && this.thisClassNode.extendsList.members.length > 0;
            var propertyAssignmentIndex = emitPropertyAssignmentsAfterSuperCall ? 1 : 0;
            var lastEmittedNode = null;

            for (var i = 0, n = list.members.length; i < n; i++) {
                if (i === propertyAssignmentIndex) {
                    this.emitParameterPropertyAndMemberVariableAssignments();
                }

                var node = list.members[i];

                if (node.shouldEmit()) {
                    this.emitSpaceBetweenConstructs(lastEmittedNode, node);

                    this.emitJavascript(node, true);
                    this.writeLineToOutput("");

                    lastEmittedNode = node;
                }
            }

            if (i === propertyAssignmentIndex) {
                this.emitParameterPropertyAndMemberVariableAssignments();
            }

            this.emitComments(list, false);
        };

        Emitter.prototype.emitJavascript = function (ast, startLine) {
            if (ast === null) {
                return;
            }

            if (startLine && this.indenter.indentAmt > 0) {
                this.emitIndent();
            }

            ast.emit(this);
        };

        Emitter.prototype.emitPropertyAccessor = function (funcDecl, className, isProto) {
            if (!TypeScript.hasFlag(funcDecl.getFunctionFlags(), TypeScript.FunctionFlags.GetAccessor)) {
                var accessorSymbol = TypeScript.PullHelpers.getAccessorSymbol(funcDecl, this.semanticInfoChain, this.document.fileName);
                if (accessorSymbol.getGetter()) {
                    return;
                }
            }

            this.emitIndent();
            this.recordSourceMappingStart(funcDecl);
            this.writeLineToOutput("Object.defineProperty(" + className + (isProto ? ".prototype, \"" : ", \"") + funcDecl.name.actualText + "\"" + ", {");
            this.indenter.increaseIndent();

            var accessors = TypeScript.PullHelpers.getGetterAndSetterFunction(funcDecl, this.semanticInfoChain, this.document.fileName);
            if (accessors.getter) {
                this.emitIndent();
                this.recordSourceMappingStart(accessors.getter);
                this.writeToOutput("get: ");
                this.emitInnerFunction(accessors.getter, false);
                this.writeLineToOutput(",");
            }

            if (accessors.setter) {
                this.emitIndent();
                this.recordSourceMappingStart(accessors.setter);
                this.writeToOutput("set: ");
                this.emitInnerFunction(accessors.setter, false);
                this.writeLineToOutput(",");
            }

            this.emitIndent();
            this.writeLineToOutput("enumerable: true,");
            this.emitIndent();
            this.writeLineToOutput("configurable: true");
            this.indenter.decreaseIndent();
            this.emitIndent();
            this.writeLineToOutput("});");
            this.recordSourceMappingEnd(funcDecl);
        };

        Emitter.prototype.emitPrototypeMember = function (funcDecl, className) {
            if (funcDecl.isAccessor()) {
                this.emitPropertyAccessor(funcDecl, className, true);
            } else {
                this.emitIndent();
                this.recordSourceMappingStart(funcDecl);
                this.emitComments(funcDecl, true);
                this.writeToOutput(className + ".prototype." + funcDecl.getNameText() + " = ");
                this.emitInnerFunction(funcDecl, false, false);
                this.writeLineToOutput(";");
            }
        };

        Emitter.prototype.emitClass = function (classDecl) {
            var pullDecl = this.semanticInfoChain.getDeclForAST(classDecl, this.document.fileName);
            this.pushDecl(pullDecl);

            var svClassNode = this.thisClassNode;
            this.thisClassNode = classDecl;
            var className = classDecl.name.actualText;
            this.emitComments(classDecl, true);
            var temp = this.setContainer(EmitContainer.Class);

            this.recordSourceMappingStart(classDecl);
            this.writeToOutput("var " + className);

            var hasBaseClass = classDecl.extendsList && classDecl.extendsList.members.length;
            var baseNameDecl = null;
            var baseName = null;
            var varDecl = null;

            if (hasBaseClass) {
                this.writeLineToOutput(" = (function (_super) {");
            } else {
                this.writeLineToOutput(" = (function () {");
            }

            this.recordSourceMappingNameStart(className);
            this.indenter.increaseIndent();

            if (hasBaseClass) {
                baseNameDecl = classDecl.extendsList.members[0];
                baseName = baseNameDecl.nodeType === TypeScript.NodeType.InvocationExpression ? (baseNameDecl).target : baseNameDecl;
                this.emitIndent();
                this.writeLineToOutput("__extends(" + className + ", _super);");
            }

            this.emitIndent();

            var constrDecl = classDecl.constructorDecl;

            if (constrDecl) {
                constrDecl.emit(this);
                this.writeLineToOutput("");
            } else {
                this.recordSourceMappingStart(classDecl);

                this.indenter.increaseIndent();
                this.writeLineToOutput("function " + classDecl.name.actualText + "() {");
                this.recordSourceMappingNameStart("constructor");
                if (hasBaseClass) {
                    this.emitIndent();
                    this.writeLineToOutput("_super.apply(this, arguments);");
                }

                this.emitParameterPropertyAndMemberVariableAssignments();

                this.indenter.decreaseIndent();
                this.emitIndent();
                this.writeLineToOutput("}");

                this.recordSourceMappingNameEnd();
                this.recordSourceMappingEnd(classDecl);
            }

            this.emitClassMembers(classDecl);

            this.emitIndent();
            this.recordSourceMappingStart(classDecl.endingToken);
            this.writeLineToOutput("return " + className + ";");
            this.recordSourceMappingEnd(classDecl.endingToken);
            this.indenter.decreaseIndent();
            this.emitIndent();
            this.recordSourceMappingStart(classDecl.endingToken);
            this.writeToOutput("}");
            this.recordSourceMappingNameEnd();
            this.recordSourceMappingEnd(classDecl.endingToken);
            this.recordSourceMappingStart(classDecl);
            this.writeToOutput(")(");
            if (hasBaseClass) {
                this.resolvingContext.resolvingTypeReference = true;
                this.emitJavascript(baseName, false);
                this.resolvingContext.resolvingTypeReference = false;
            }
            this.writeToOutput(");");
            this.recordSourceMappingEnd(classDecl);

            if ((temp === EmitContainer.Module || temp === EmitContainer.DynamicModule) && TypeScript.hasFlag(classDecl.getVarFlags(), TypeScript.VariableFlags.Exported)) {
                this.writeLineToOutput("");
                this.emitIndent();
                var modName = temp === EmitContainer.Module ? this.moduleName : "exports";
                this.recordSourceMappingStart(classDecl);
                this.writeToOutput(modName + "." + className + " = " + className + ";");
                this.recordSourceMappingEnd(classDecl);
            }

            this.recordSourceMappingEnd(classDecl);
            this.emitComments(classDecl, false);
            this.setContainer(temp);
            this.thisClassNode = svClassNode;

            this.popDecl(pullDecl);
        };

        Emitter.prototype.emitClassMembers = function (classDecl) {
            var lastEmittedMember = null;

            for (var i = 0, n = classDecl.members.members.length; i < n; i++) {
                var memberDecl = classDecl.members.members[i];

                if (memberDecl.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                    var fn = memberDecl;

                    if (TypeScript.hasFlag(fn.getFunctionFlags(), TypeScript.FunctionFlags.Method) && !fn.isSignature()) {
                        this.emitSpaceBetweenConstructs(lastEmittedMember, fn);

                        if (!TypeScript.hasFlag(fn.getFunctionFlags(), TypeScript.FunctionFlags.Static)) {
                            this.emitPrototypeMember(fn, classDecl.name.actualText);
                        } else {
                            if (fn.isAccessor()) {
                                this.emitPropertyAccessor(fn, this.thisClassNode.name.actualText, false);
                            } else {
                                this.emitIndent();
                                this.recordSourceMappingStart(fn);
                                this.writeToOutput(classDecl.name.actualText + "." + fn.name.actualText + " = ");
                                this.emitInnerFunction(fn, false);
                                this.writeLineToOutput(";");
                            }
                        }

                        lastEmittedMember = fn;
                    }
                }
            }

            for (var i = 0, n = classDecl.members.members.length; i < n; i++) {
                var memberDecl = classDecl.members.members[i];

                if (memberDecl.nodeType === TypeScript.NodeType.VariableDeclarator) {
                    var varDecl = memberDecl;

                    if (TypeScript.hasFlag(varDecl.getVarFlags(), TypeScript.VariableFlags.Static) && varDecl.init) {
                        this.emitSpaceBetweenConstructs(lastEmittedMember, varDecl);

                        this.emitIndent();
                        this.recordSourceMappingStart(varDecl);
                        this.writeToOutput(classDecl.name.actualText + "." + varDecl.id.actualText + " = ");
                        varDecl.init.emit(this);

                        this.writeLineToOutput(";");
                        this.recordSourceMappingEnd(varDecl);

                        lastEmittedMember = varDecl;
                    }
                }
            }
        };

        Emitter.prototype.emitPrologue = function (script, requiresExtendsBlock) {
            if (!this.extendsPrologueEmitted) {
                if (requiresExtendsBlock) {
                    this.extendsPrologueEmitted = true;
                    this.writeLineToOutput("var __extends = this.__extends || function (d, b) {");
                    this.writeLineToOutput("    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];");
                    this.writeLineToOutput("    function __() { this.constructor = d; }");
                    this.writeLineToOutput("    __.prototype = b.prototype;");
                    this.writeLineToOutput("    d.prototype = new __();");
                    this.writeLineToOutput("};");
                }
            }

            if (!this.globalThisCapturePrologueEmitted) {
                if (this.shouldCaptureThis(script)) {
                    this.globalThisCapturePrologueEmitted = true;
                    this.writeLineToOutput(this.captureThisStmtString);
                }
            }
        };

        Emitter.prototype.emitSuperReference = function () {
            this.writeToOutput("_super.prototype");
        };

        Emitter.prototype.emitSuperCall = function (callEx) {
            if (callEx.target.nodeType === TypeScript.NodeType.MemberAccessExpression) {
                var dotNode = callEx.target;
                if (dotNode.operand1.nodeType === TypeScript.NodeType.SuperExpression) {
                    dotNode.emit(this);
                    this.writeToOutput(".call(");
                    this.emitThis();
                    if (callEx.arguments && callEx.arguments.members.length > 0) {
                        this.writeToOutput(", ");
                        this.emitCommaSeparatedList(callEx.arguments);
                    }
                    this.writeToOutput(")");
                    return true;
                }
            }
            return false;
        };

        Emitter.prototype.emitThis = function () {
            if (this.thisFunctionDeclaration && !this.thisFunctionDeclaration.isMethod() && (!this.thisFunctionDeclaration.isConstructor)) {
                this.writeToOutput("_this");
            } else {
                this.writeToOutput("this");
            }
        };

        Emitter.prototype.emitBlockOrStatement = function (node) {
            if (node.nodeType === TypeScript.NodeType.Block) {
                node.emit(this);
            } else {
                this.writeLineToOutput("");
                this.indenter.increaseIndent();
                this.emitJavascript(node, true);
                this.indenter.decreaseIndent();
            }
        };

        Emitter.throwEmitterError = function (e) {
            var error = new Error(e.message);
            error.isEmitterError = true;
            throw error;
        };

        Emitter.handleEmitterError = function (fileName, e) {
            if ((e).isEmitterError === true) {
                return [new TypeScript.Diagnostic(fileName, 0, 0, TypeScript.DiagnosticCode.Emit_Error__0, [e.message])];
            }

            throw e;
        };
        return Emitter;
    })();
    TypeScript.Emitter = Emitter;
})(TypeScript || (TypeScript = {}));
