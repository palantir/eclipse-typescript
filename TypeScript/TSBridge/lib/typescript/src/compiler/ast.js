var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var ASTSpan = (function () {
        function ASTSpan() {
            this.minChar = -1;
            this.limChar = -1;
            this.trailingTriviaWidth = 0;
        }
        return ASTSpan;
    })();
    TypeScript.ASTSpan = ASTSpan;

    TypeScript.astID = 0;

    function structuralEqualsNotIncludingPosition(ast1, ast2) {
        return structuralEquals(ast1, ast2, false);
    }
    TypeScript.structuralEqualsNotIncludingPosition = structuralEqualsNotIncludingPosition;

    function structuralEqualsIncludingPosition(ast1, ast2) {
        return structuralEquals(ast1, ast2, true);
    }
    TypeScript.structuralEqualsIncludingPosition = structuralEqualsIncludingPosition;

    function structuralEquals(ast1, ast2, includingPosition) {
        if (ast1 === ast2) {
            return true;
        }

        return ast1 !== null && ast2 !== null && ast1.nodeType === ast2.nodeType && ast1.structuralEquals(ast2, includingPosition);
    }

    function astArrayStructuralEquals(array1, array2, includingPosition) {
        return TypeScript.ArrayUtilities.sequenceEquals(array1, array2, includingPosition ? structuralEqualsIncludingPosition : structuralEqualsNotIncludingPosition);
    }

    var AST = (function () {
        function AST(nodeType) {
            this.nodeType = nodeType;
            this.minChar = -1;
            this.limChar = -1;
            this.trailingTriviaWidth = 0;
            this._flags = TypeScript.ASTFlags.None;
            this.typeCheckPhase = -1;
            this.astID = TypeScript.astID++;
            this.passCreated = TypeScript.CompilerDiagnostics.analysisPass;
            this.preComments = null;
            this.postComments = null;
            this.docComments = null;
        }
        AST.prototype.shouldEmit = function () {
            return true;
        };

        AST.prototype.isExpression = function () {
            return false;
        };
        AST.prototype.isStatementOrExpression = function () {
            return false;
        };

        AST.prototype.getFlags = function () {
            return this._flags;
        };

        AST.prototype.setFlags = function (flags) {
            this._flags = flags;
        };

        AST.prototype.getLength = function () {
            return this.limChar - this.minChar;
        };

        AST.prototype.getID = function () {
            return this.astID;
        };

        AST.prototype.isDeclaration = function () {
            return false;
        };

        AST.prototype.isStatement = function () {
            return false;
        };

        AST.prototype.emit = function (emitter) {
            emitter.emitComments(this, true);
            emitter.recordSourceMappingStart(this);
            this.emitWorker(emitter);
            emitter.recordSourceMappingEnd(this);
            emitter.emitComments(this, false);
        };

        AST.prototype.emitWorker = function (emitter) {
            throw new Error("please implement in derived class");
        };

        AST.prototype.getDocComments = function () {
            if (!this.isDeclaration() || !this.preComments || this.preComments.length === 0) {
                return [];
            }

            if (!this.docComments) {
                var preCommentsLength = this.preComments.length;
                var docComments = [];
                for (var i = preCommentsLength - 1; i >= 0; i--) {
                    if (this.preComments[i].isDocComment()) {
                        var prevDocComment = docComments.length > 0 ? docComments[docComments.length - 1] : null;
                        if (prevDocComment === null || (this.preComments[i].limLine === prevDocComment.minLine || this.preComments[i].limLine + 1 === prevDocComment.minLine)) {
                            docComments.push(this.preComments[i]);
                            continue;
                        }
                    }
                    break;
                }

                this.docComments = docComments.reverse();
            }

            return this.docComments;
        };

        AST.prototype.structuralEquals = function (ast, includingPosition) {
            if (includingPosition) {
                if (this.minChar !== ast.minChar || this.limChar !== ast.limChar) {
                    return false;
                }
            }

            return this._flags === ast._flags && astArrayStructuralEquals(this.preComments, ast.preComments, includingPosition) && astArrayStructuralEquals(this.postComments, ast.postComments, includingPosition);
        };
        return AST;
    })();
    TypeScript.AST = AST;

    var ASTList = (function (_super) {
        __extends(ASTList, _super);
        function ASTList() {
            _super.call(this, TypeScript.NodeType.List);
            this.members = [];
        }
        ASTList.prototype.append = function (ast) {
            this.members[this.members.length] = ast;
            return this;
        };

        ASTList.prototype.emit = function (emitter) {
            emitter.recordSourceMappingStart(this);
            emitter.emitModuleElements(this);
            emitter.recordSourceMappingEnd(this);
        };

        ASTList.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && astArrayStructuralEquals(this.members, ast.members, includingPosition);
        };
        return ASTList;
    })(AST);
    TypeScript.ASTList = ASTList;

    var Expression = (function (_super) {
        __extends(Expression, _super);
        function Expression(nodeType) {
            _super.call(this, nodeType);
        }
        return Expression;
    })(AST);
    TypeScript.Expression = Expression;

    var Identifier = (function (_super) {
        __extends(Identifier, _super);
        function Identifier(actualText) {
            _super.call(this, TypeScript.NodeType.Name);
            this.actualText = actualText;
            this.setText(actualText);
        }
        Identifier.prototype.setText = function (actualText) {
            this.actualText = actualText;
            this.text = actualText;
        };

        Identifier.prototype.isMissing = function () {
            return false;
        };

        Identifier.prototype.emit = function (emitter) {
            emitter.emitName(this, true);
        };

        Identifier.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && this.text === ast.text && this.actualText === ast.actualText && this.isMissing() === ast.isMissing();
        };
        return Identifier;
    })(Expression);
    TypeScript.Identifier = Identifier;

    var MissingIdentifier = (function (_super) {
        __extends(MissingIdentifier, _super);
        function MissingIdentifier() {
            _super.call(this, "__missing");
        }
        MissingIdentifier.prototype.isMissing = function () {
            return true;
        };

        MissingIdentifier.prototype.emit = function (emitter) {
        };
        return MissingIdentifier;
    })(Identifier);
    TypeScript.MissingIdentifier = MissingIdentifier;

    var LiteralExpression = (function (_super) {
        __extends(LiteralExpression, _super);
        function LiteralExpression(nodeType) {
            _super.call(this, nodeType);
        }
        LiteralExpression.prototype.emitWorker = function (emitter) {
            switch (this.nodeType) {
                case TypeScript.NodeType.NullLiteral:
                    emitter.writeToOutput("null");
                    break;
                case TypeScript.NodeType.FalseLiteral:
                    emitter.writeToOutput("false");
                    break;
                case TypeScript.NodeType.TrueLiteral:
                    emitter.writeToOutput("true");
                    break;
                default:
                    throw new Error("please implement in derived class");
            }
        };

        LiteralExpression.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition);
        };
        return LiteralExpression;
    })(Expression);
    TypeScript.LiteralExpression = LiteralExpression;

    var ThisExpression = (function (_super) {
        __extends(ThisExpression, _super);
        function ThisExpression() {
            _super.call(this, TypeScript.NodeType.ThisExpression);
        }
        ThisExpression.prototype.emitWorker = function (emitter) {
            if (emitter.thisFunctionDeclaration && (TypeScript.hasFlag(emitter.thisFunctionDeclaration.getFunctionFlags(), TypeScript.FunctionFlags.IsFatArrowFunction))) {
                emitter.writeToOutput("_this");
            } else {
                emitter.writeToOutput("this");
            }
        };

        ThisExpression.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition);
        };
        return ThisExpression;
    })(Expression);
    TypeScript.ThisExpression = ThisExpression;

    var SuperExpression = (function (_super) {
        __extends(SuperExpression, _super);
        function SuperExpression() {
            _super.call(this, TypeScript.NodeType.SuperExpression);
        }
        SuperExpression.prototype.emitWorker = function (emitter) {
            emitter.emitSuperReference();
        };

        SuperExpression.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition);
        };
        return SuperExpression;
    })(Expression);
    TypeScript.SuperExpression = SuperExpression;

    var ParenthesizedExpression = (function (_super) {
        __extends(ParenthesizedExpression, _super);
        function ParenthesizedExpression(expression) {
            _super.call(this, TypeScript.NodeType.ParenthesizedExpression);
            this.expression = expression;
        }
        ParenthesizedExpression.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput("(");
            this.expression.emit(emitter);
            emitter.writeToOutput(")");
        };

        ParenthesizedExpression.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.expression, ast.expression, includingPosition);
        };
        return ParenthesizedExpression;
    })(Expression);
    TypeScript.ParenthesizedExpression = ParenthesizedExpression;

    var UnaryExpression = (function (_super) {
        __extends(UnaryExpression, _super);
        function UnaryExpression(nodeType, operand) {
            _super.call(this, nodeType);
            this.operand = operand;
            this.castTerm = null;
        }
        UnaryExpression.prototype.emitWorker = function (emitter) {
            switch (this.nodeType) {
                case TypeScript.NodeType.PostIncrementExpression:
                    this.operand.emit(emitter);
                    emitter.writeToOutput("++");
                    break;
                case TypeScript.NodeType.LogicalNotExpression:
                    emitter.writeToOutput("!");
                    this.operand.emit(emitter);
                    break;
                case TypeScript.NodeType.PostDecrementExpression:
                    this.operand.emit(emitter);
                    emitter.writeToOutput("--");
                    break;
                case TypeScript.NodeType.ObjectLiteralExpression:
                    emitter.emitObjectLiteral(this);
                    break;
                case TypeScript.NodeType.ArrayLiteralExpression:
                    emitter.emitArrayLiteral(this);
                    break;
                case TypeScript.NodeType.BitwiseNotExpression:
                    emitter.writeToOutput("~");
                    this.operand.emit(emitter);
                    break;
                case TypeScript.NodeType.NegateExpression:
                    emitter.writeToOutput("-");
                    if (this.operand.nodeType === TypeScript.NodeType.NegateExpression || this.operand.nodeType === TypeScript.NodeType.PreDecrementExpression) {
                        emitter.writeToOutput(" ");
                    }
                    this.operand.emit(emitter);
                    break;
                case TypeScript.NodeType.PlusExpression:
                    emitter.writeToOutput("+");
                    if (this.operand.nodeType === TypeScript.NodeType.PlusExpression || this.operand.nodeType === TypeScript.NodeType.PreIncrementExpression) {
                        emitter.writeToOutput(" ");
                    }
                    this.operand.emit(emitter);
                    break;
                case TypeScript.NodeType.PreIncrementExpression:
                    emitter.writeToOutput("++");
                    this.operand.emit(emitter);
                    break;
                case TypeScript.NodeType.PreDecrementExpression:
                    emitter.writeToOutput("--");
                    this.operand.emit(emitter);
                    break;
                case TypeScript.NodeType.TypeOfExpression:
                    emitter.writeToOutput("typeof ");
                    this.operand.emit(emitter);
                    break;
                case TypeScript.NodeType.DeleteExpression:
                    emitter.writeToOutput("delete ");
                    this.operand.emit(emitter);
                    break;
                case TypeScript.NodeType.VoidExpression:
                    emitter.writeToOutput("void ");
                    this.operand.emit(emitter);
                    break;
                case TypeScript.NodeType.CastExpression:
                    this.operand.emit(emitter);
                    break;
                default:
                    throw new Error("please implement in derived class");
            }
        };

        UnaryExpression.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.castTerm, ast.castTerm, includingPosition) && structuralEquals(this.operand, ast.operand, includingPosition);
        };
        return UnaryExpression;
    })(Expression);
    TypeScript.UnaryExpression = UnaryExpression;

    var CallExpression = (function (_super) {
        __extends(CallExpression, _super);
        function CallExpression(nodeType, target, typeArguments, arguments) {
            _super.call(this, nodeType);
            this.target = target;
            this.typeArguments = typeArguments;
            this.arguments = arguments;
        }
        CallExpression.prototype.emitWorker = function (emitter) {
            if (this.nodeType === TypeScript.NodeType.ObjectCreationExpression) {
                emitter.emitNew(this.target, this.arguments);
            } else {
                emitter.emitCall(this, this.target, this.arguments);
            }
        };

        CallExpression.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.target, ast.target, includingPosition) && structuralEquals(this.typeArguments, ast.typeArguments, includingPosition) && structuralEquals(this.arguments, ast.arguments, includingPosition);
        };
        return CallExpression;
    })(Expression);
    TypeScript.CallExpression = CallExpression;

    var BinaryExpression = (function (_super) {
        __extends(BinaryExpression, _super);
        function BinaryExpression(nodeType, operand1, operand2) {
            _super.call(this, nodeType);
            this.operand1 = operand1;
            this.operand2 = operand2;
        }
        BinaryExpression.getTextForBinaryToken = function (nodeType) {
            switch (nodeType) {
                case TypeScript.NodeType.CommaExpression:
                    return ",";
                case TypeScript.NodeType.AssignmentExpression:
                    return "=";
                case TypeScript.NodeType.AddAssignmentExpression:
                    return "+=";
                case TypeScript.NodeType.SubtractAssignmentExpression:
                    return "-=";
                case TypeScript.NodeType.MultiplyAssignmentExpression:
                    return "*=";
                case TypeScript.NodeType.DivideAssignmentExpression:
                    return "/=";
                case TypeScript.NodeType.ModuloAssignmentExpression:
                    return "%=";
                case TypeScript.NodeType.AndAssignmentExpression:
                    return "&=";
                case TypeScript.NodeType.ExclusiveOrAssignmentExpression:
                    return "^=";
                case TypeScript.NodeType.OrAssignmentExpression:
                    return "|=";
                case TypeScript.NodeType.LeftShiftAssignmentExpression:
                    return "<<=";
                case TypeScript.NodeType.SignedRightShiftAssignmentExpression:
                    return ">>=";
                case TypeScript.NodeType.UnsignedRightShiftAssignmentExpression:
                    return ">>>=";
                case TypeScript.NodeType.LogicalOrExpression:
                    return "||";
                case TypeScript.NodeType.LogicalAndExpression:
                    return "&&";
                case TypeScript.NodeType.BitwiseOrExpression:
                    return "|";
                case TypeScript.NodeType.BitwiseExclusiveOrExpression:
                    return "^";
                case TypeScript.NodeType.BitwiseAndExpression:
                    return "&";
                case TypeScript.NodeType.EqualsWithTypeConversionExpression:
                    return "==";
                case TypeScript.NodeType.NotEqualsWithTypeConversionExpression:
                    return "!=";
                case TypeScript.NodeType.EqualsExpression:
                    return "===";
                case TypeScript.NodeType.NotEqualsExpression:
                    return "!==";
                case TypeScript.NodeType.LessThanExpression:
                    return "<";
                case TypeScript.NodeType.GreaterThanExpression:
                    return ">";
                case TypeScript.NodeType.LessThanOrEqualExpression:
                    return "<=";
                case TypeScript.NodeType.GreaterThanOrEqualExpression:
                    return ">=";
                case TypeScript.NodeType.InstanceOfExpression:
                    return "instanceof";
                case TypeScript.NodeType.InExpression:
                    return "in";
                case TypeScript.NodeType.LeftShiftExpression:
                    return "<<";
                case TypeScript.NodeType.SignedRightShiftExpression:
                    return ">>";
                case TypeScript.NodeType.UnsignedRightShiftExpression:
                    return ">>>";
                case TypeScript.NodeType.MultiplyExpression:
                    return "*";
                case TypeScript.NodeType.DivideExpression:
                    return "/";
                case TypeScript.NodeType.ModuloExpression:
                    return "%";
                case TypeScript.NodeType.AddExpression:
                    return "+";
                case TypeScript.NodeType.SubtractExpression:
                    return "-";
            }

            throw TypeScript.Errors.invalidOperation();
        };

        BinaryExpression.prototype.emitWorker = function (emitter) {
            switch (this.nodeType) {
                case TypeScript.NodeType.MemberAccessExpression:
                    if (!emitter.tryEmitConstant(this)) {
                        this.operand1.emit(emitter);
                        emitter.writeToOutput(".");
                        emitter.emitName(this.operand2, false);
                    }
                    break;
                case TypeScript.NodeType.ElementAccessExpression:
                    emitter.emitIndex(this.operand1, this.operand2);
                    break;

                case TypeScript.NodeType.Member:
                    if (this.operand2.nodeType === TypeScript.NodeType.FunctionDeclaration && (this.operand2).isAccessor()) {
                        var funcDecl = this.operand2;
                        if (TypeScript.hasFlag(funcDecl.getFunctionFlags(), TypeScript.FunctionFlags.GetAccessor)) {
                            emitter.writeToOutput("get ");
                        } else {
                            emitter.writeToOutput("set ");
                        }
                        this.operand1.emit(emitter);
                    } else {
                        this.operand1.emit(emitter);
                        emitter.writeToOutputTrimmable(": ");
                    }
                    this.operand2.emit(emitter);
                    break;
                case TypeScript.NodeType.CommaExpression:
                    this.operand1.emit(emitter);
                    emitter.writeToOutput(", ");
                    this.operand2.emit(emitter);
                    break;
                default: {
                    this.operand1.emit(emitter);
                    var binOp = BinaryExpression.getTextForBinaryToken(this.nodeType);
                    if (binOp === "instanceof") {
                        emitter.writeToOutput(" instanceof ");
                    } else if (binOp === "in") {
                        emitter.writeToOutput(" in ");
                    } else {
                        emitter.writeToOutputTrimmable(" " + binOp + " ");
                    }
                    this.operand2.emit(emitter);
                }
            }
        };

        BinaryExpression.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.operand1, ast.operand1, includingPosition) && structuralEquals(this.operand2, ast.operand2, includingPosition);
        };
        return BinaryExpression;
    })(Expression);
    TypeScript.BinaryExpression = BinaryExpression;

    var ConditionalExpression = (function (_super) {
        __extends(ConditionalExpression, _super);
        function ConditionalExpression(operand1, operand2, operand3) {
            _super.call(this, TypeScript.NodeType.ConditionalExpression);
            this.operand1 = operand1;
            this.operand2 = operand2;
            this.operand3 = operand3;
        }
        ConditionalExpression.prototype.emitWorker = function (emitter) {
            this.operand1.emit(emitter);
            emitter.writeToOutput(" ? ");
            this.operand2.emit(emitter);
            emitter.writeToOutput(" : ");
            this.operand3.emit(emitter);
        };

        ConditionalExpression.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.operand1, ast.operand1, includingPosition) && structuralEquals(this.operand2, ast.operand2, includingPosition) && structuralEquals(this.operand3, ast.operand3, includingPosition);
        };
        return ConditionalExpression;
    })(Expression);
    TypeScript.ConditionalExpression = ConditionalExpression;

    var NumberLiteral = (function (_super) {
        __extends(NumberLiteral, _super);
        function NumberLiteral(value, text) {
            _super.call(this, TypeScript.NodeType.NumericLiteral);
            this.value = value;
            this.text = text;
        }
        NumberLiteral.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput(this.text);
        };

        NumberLiteral.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && this.value === ast.value && this.text === ast.text;
        };
        return NumberLiteral;
    })(Expression);
    TypeScript.NumberLiteral = NumberLiteral;

    var RegexLiteral = (function (_super) {
        __extends(RegexLiteral, _super);
        function RegexLiteral(text) {
            _super.call(this, TypeScript.NodeType.RegularExpressionLiteral);
            this.text = text;
        }
        RegexLiteral.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput(this.text);
        };

        RegexLiteral.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && this.text === ast.text;
        };
        return RegexLiteral;
    })(Expression);
    TypeScript.RegexLiteral = RegexLiteral;

    var StringLiteral = (function (_super) {
        __extends(StringLiteral, _super);
        function StringLiteral(actualText, text) {
            _super.call(this, TypeScript.NodeType.StringLiteral);
            this.actualText = actualText;
            this.text = text;
        }
        StringLiteral.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput(this.actualText);
        };

        StringLiteral.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && this.actualText === ast.actualText;
        };
        return StringLiteral;
    })(Expression);
    TypeScript.StringLiteral = StringLiteral;

    var ImportDeclaration = (function (_super) {
        __extends(ImportDeclaration, _super);
        function ImportDeclaration(id, alias) {
            _super.call(this, TypeScript.NodeType.ImportDeclaration);
            this.id = id;
            this.alias = alias;
            this.isDynamicImport = false;
        }
        ImportDeclaration.prototype.isStatementOrExpression = function () {
            return true;
        };

        ImportDeclaration.prototype.isDeclaration = function () {
            return true;
        };

        ImportDeclaration.prototype.emit = function (emitter) {
            if (emitter.importStatementShouldBeEmitted(this)) {
                var prevModAliasId = emitter.modAliasId;
                var prevFirstModAlias = emitter.firstModAlias;

                emitter.recordSourceMappingStart(this);
                emitter.emitComments(this, true);
                emitter.writeToOutput("var " + this.id.actualText + " = ");
                emitter.modAliasId = this.id.actualText;
                emitter.firstModAlias = this.firstAliasedModToString();
                var aliasAST = this.alias.nodeType === TypeScript.NodeType.TypeRef ? (this.alias).term : this.alias;

                emitter.emitJavascript(aliasAST, false);
                emitter.writeToOutput(";");

                emitter.emitComments(this, false);
                emitter.recordSourceMappingEnd(this);

                emitter.modAliasId = prevModAliasId;
                emitter.firstModAlias = prevFirstModAlias;
            }
        };

        ImportDeclaration.prototype.getAliasName = function (aliasAST) {
            if (typeof aliasAST === "undefined") { aliasAST = this.alias; }
            if (aliasAST.nodeType === TypeScript.NodeType.Name) {
                return (aliasAST).actualText;
            } else {
                var dotExpr = aliasAST;
                return this.getAliasName(dotExpr.operand1) + "." + this.getAliasName(dotExpr.operand2);
            }
        };

        ImportDeclaration.prototype.firstAliasedModToString = function () {
            if (this.alias.nodeType === TypeScript.NodeType.Name) {
                return (this.alias).actualText;
            } else {
                var dotExpr = this.alias;
                var firstMod = (dotExpr.term).operand1;
                return firstMod.actualText;
            }
        };

        ImportDeclaration.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.id, ast.id, includingPosition) && structuralEquals(this.alias, ast.alias, includingPosition);
        };
        return ImportDeclaration;
    })(AST);
    TypeScript.ImportDeclaration = ImportDeclaration;

    var ExportAssignment = (function (_super) {
        __extends(ExportAssignment, _super);
        function ExportAssignment(id) {
            _super.call(this, TypeScript.NodeType.ExportAssignment);
            this.id = id;
        }
        ExportAssignment.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.id, ast.id, includingPosition);
        };

        ExportAssignment.prototype.emit = function (emitter) {
            emitter.setExportAssignmentIdentifier(this.id.actualText);
        };
        return ExportAssignment;
    })(AST);
    TypeScript.ExportAssignment = ExportAssignment;

    var BoundDecl = (function (_super) {
        __extends(BoundDecl, _super);
        function BoundDecl(id, nodeType) {
            _super.call(this, nodeType);
            this.id = id;
            this.init = null;
            this.isImplicitlyInitialized = false;
            this.typeExpr = null;
            this._varFlags = TypeScript.VariableFlags.None;
        }
        BoundDecl.prototype.isDeclaration = function () {
            return true;
        };
        BoundDecl.prototype.isStatementOrExpression = function () {
            return true;
        };

        BoundDecl.prototype.getVarFlags = function () {
            return this._varFlags;
        };

        BoundDecl.prototype.setVarFlags = function (flags) {
            this._varFlags = flags;
        };

        BoundDecl.prototype.isProperty = function () {
            return TypeScript.hasFlag(this.getVarFlags(), TypeScript.VariableFlags.Property);
        };

        BoundDecl.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && this._varFlags === ast._varFlags && structuralEquals(this.init, ast.init, includingPosition) && structuralEquals(this.typeExpr, ast.typeExpr, includingPosition) && structuralEquals(this.id, ast.id, includingPosition);
        };
        return BoundDecl;
    })(AST);
    TypeScript.BoundDecl = BoundDecl;

    var VariableDeclarator = (function (_super) {
        __extends(VariableDeclarator, _super);
        function VariableDeclarator(id) {
            _super.call(this, id, TypeScript.NodeType.VariableDeclarator);
        }
        VariableDeclarator.prototype.isExported = function () {
            return TypeScript.hasFlag(this.getVarFlags(), TypeScript.VariableFlags.Exported);
        };

        VariableDeclarator.prototype.isStatic = function () {
            return TypeScript.hasFlag(this.getVarFlags(), TypeScript.VariableFlags.Static);
        };

        VariableDeclarator.prototype.emit = function (emitter) {
            emitter.emitVariableDeclarator(this);
        };
        return VariableDeclarator;
    })(BoundDecl);
    TypeScript.VariableDeclarator = VariableDeclarator;

    var Parameter = (function (_super) {
        __extends(Parameter, _super);
        function Parameter(id) {
            _super.call(this, id, TypeScript.NodeType.Parameter);
            this.isOptional = false;
        }
        Parameter.prototype.isOptionalArg = function () {
            return this.isOptional || this.init;
        };

        Parameter.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput(this.id.actualText);
        };

        Parameter.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && this.isOptional === ast.isOptional;
        };
        return Parameter;
    })(BoundDecl);
    TypeScript.Parameter = Parameter;

    var FunctionDeclaration = (function (_super) {
        __extends(FunctionDeclaration, _super);
        function FunctionDeclaration(name, block, isConstructor, typeArguments, arguments, nodeType) {
            _super.call(this, nodeType);
            this.name = name;
            this.block = block;
            this.isConstructor = isConstructor;
            this.typeArguments = typeArguments;
            this.arguments = arguments;
            this.hint = null;
            this._functionFlags = TypeScript.FunctionFlags.None;
            this.returnTypeAnnotation = null;
            this.variableArgList = false;
            this.classDecl = null;
        }
        FunctionDeclaration.prototype.isDeclaration = function () {
            return true;
        };

        FunctionDeclaration.prototype.getFunctionFlags = function () {
            return this._functionFlags;
        };

        FunctionDeclaration.prototype.setFunctionFlags = function (flags) {
            this._functionFlags = flags;
        };

        FunctionDeclaration.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && this._functionFlags === ast._functionFlags && this.hint === ast.hint && this.variableArgList === ast.variableArgList && structuralEquals(this.name, ast.name, includingPosition) && structuralEquals(this.block, ast.block, includingPosition) && this.isConstructor === ast.isConstructor && structuralEquals(this.typeArguments, ast.typeArguments, includingPosition) && structuralEquals(this.arguments, ast.arguments, includingPosition);
        };

        FunctionDeclaration.prototype.shouldEmit = function () {
            return !TypeScript.hasFlag(this.getFunctionFlags(), TypeScript.FunctionFlags.Signature) && !TypeScript.hasFlag(this.getFunctionFlags(), TypeScript.FunctionFlags.Ambient);
        };

        FunctionDeclaration.prototype.emit = function (emitter) {
            emitter.emitFunction(this);
        };

        FunctionDeclaration.prototype.getNameText = function () {
            if (this.name) {
                return this.name.actualText;
            } else {
                return this.hint;
            }
        };

        FunctionDeclaration.prototype.isMethod = function () {
            return (this.getFunctionFlags() & TypeScript.FunctionFlags.Method) !== TypeScript.FunctionFlags.None;
        };

        FunctionDeclaration.prototype.isCallMember = function () {
            return TypeScript.hasFlag(this.getFunctionFlags(), TypeScript.FunctionFlags.CallMember);
        };
        FunctionDeclaration.prototype.isConstructMember = function () {
            return TypeScript.hasFlag(this.getFunctionFlags(), TypeScript.FunctionFlags.ConstructMember);
        };
        FunctionDeclaration.prototype.isIndexerMember = function () {
            return TypeScript.hasFlag(this.getFunctionFlags(), TypeScript.FunctionFlags.IndexerMember);
        };
        FunctionDeclaration.prototype.isSpecialFn = function () {
            return this.isCallMember() || this.isIndexerMember() || this.isConstructMember();
        };
        FunctionDeclaration.prototype.isAccessor = function () {
            return TypeScript.hasFlag(this.getFunctionFlags(), TypeScript.FunctionFlags.GetAccessor) || TypeScript.hasFlag(this.getFunctionFlags(), TypeScript.FunctionFlags.SetAccessor);
        };
        FunctionDeclaration.prototype.isGetAccessor = function () {
            return TypeScript.hasFlag(this.getFunctionFlags(), TypeScript.FunctionFlags.GetAccessor);
        };
        FunctionDeclaration.prototype.isSetAccessor = function () {
            return TypeScript.hasFlag(this.getFunctionFlags(), TypeScript.FunctionFlags.SetAccessor);
        };
        FunctionDeclaration.prototype.isStatic = function () {
            return TypeScript.hasFlag(this.getFunctionFlags(), TypeScript.FunctionFlags.Static);
        };

        FunctionDeclaration.prototype.isSignature = function () {
            return (this.getFunctionFlags() & TypeScript.FunctionFlags.Signature) !== TypeScript.FunctionFlags.None;
        };
        return FunctionDeclaration;
    })(AST);
    TypeScript.FunctionDeclaration = FunctionDeclaration;

    var Script = (function (_super) {
        __extends(Script, _super);
        function Script() {
            _super.call(this, TypeScript.NodeType.Script);
            this.moduleElements = null;
            this.referencedFiles = [];
            this.requiresExtendsBlock = false;
            this.isDeclareFile = false;
            this.topLevelMod = null;
            this.containsUnicodeChar = false;
            this.containsUnicodeCharInComment = false;
        }
        Script.prototype.emit = function (emitter) {
            if (!this.isDeclareFile) {
                emitter.emitScriptElements(this, this.requiresExtendsBlock);
            }
        };

        Script.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.moduleElements, ast.moduleElements, includingPosition);
        };
        return Script;
    })(AST);
    TypeScript.Script = Script;

    var NamedDeclaration = (function (_super) {
        __extends(NamedDeclaration, _super);
        function NamedDeclaration(nodeType, name, members) {
            _super.call(this, nodeType);
            this.name = name;
            this.members = members;
        }
        NamedDeclaration.prototype.isDeclaration = function () {
            return true;
        };

        NamedDeclaration.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.name, ast.name, includingPosition) && structuralEquals(this.members, ast.members, includingPosition);
        };
        return NamedDeclaration;
    })(AST);
    TypeScript.NamedDeclaration = NamedDeclaration;

    var ModuleDeclaration = (function (_super) {
        __extends(ModuleDeclaration, _super);
        function ModuleDeclaration(name, members, endingToken) {
            _super.call(this, TypeScript.NodeType.ModuleDeclaration, name, members);
            this.endingToken = endingToken;
            this._moduleFlags = TypeScript.ModuleFlags.None;
            this.amdDependencies = [];
            this.containsUnicodeChar = false;
            this.containsUnicodeCharInComment = false;

            this.prettyName = this.name.actualText;
        }
        ModuleDeclaration.prototype.getModuleFlags = function () {
            return this._moduleFlags;
        };

        ModuleDeclaration.prototype.setModuleFlags = function (flags) {
            this._moduleFlags = flags;
        };

        ModuleDeclaration.prototype.structuralEquals = function (ast, includePosition) {
            if (_super.prototype.structuralEquals.call(this, ast, includePosition)) {
                return this._moduleFlags === ast._moduleFlags;
            }

            return false;
        };

        ModuleDeclaration.prototype.isEnum = function () {
            return TypeScript.hasFlag(this.getModuleFlags(), TypeScript.ModuleFlags.IsEnum);
        };
        ModuleDeclaration.prototype.isWholeFile = function () {
            return TypeScript.hasFlag(this.getModuleFlags(), TypeScript.ModuleFlags.IsWholeFile);
        };

        ModuleDeclaration.prototype.shouldEmit = function () {
            if (TypeScript.hasFlag(this.getModuleFlags(), TypeScript.ModuleFlags.Ambient)) {
                return false;
            }

            if (TypeScript.hasFlag(this.getModuleFlags(), TypeScript.ModuleFlags.IsEnum)) {
                return true;
            }

            for (var i = 0, n = this.members.members.length; i < n; i++) {
                var member = this.members.members[i];

                if (member.nodeType === TypeScript.NodeType.ModuleDeclaration) {
                    if ((member).shouldEmit()) {
                        return true;
                    }
                } else if (member.nodeType !== TypeScript.NodeType.InterfaceDeclaration) {
                    return true;
                }
            }

            return false;
        };

        ModuleDeclaration.prototype.emit = function (emitter) {
            if (this.shouldEmit()) {
                emitter.emitComments(this, true);
                emitter.emitModule(this);
                emitter.emitComments(this, false);
            }
        };
        return ModuleDeclaration;
    })(NamedDeclaration);
    TypeScript.ModuleDeclaration = ModuleDeclaration;

    var TypeDeclaration = (function (_super) {
        __extends(TypeDeclaration, _super);
        function TypeDeclaration(nodeType, name, typeParameters, extendsList, implementsList, members) {
            _super.call(this, nodeType, name, members);
            this.typeParameters = typeParameters;
            this.extendsList = extendsList;
            this.implementsList = implementsList;
            this._varFlags = TypeScript.VariableFlags.None;
        }
        TypeDeclaration.prototype.getVarFlags = function () {
            return this._varFlags;
        };

        TypeDeclaration.prototype.setVarFlags = function (flags) {
            this._varFlags = flags;
        };

        TypeDeclaration.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && this._varFlags === ast._varFlags && structuralEquals(this.typeParameters, ast.typeParameters, includingPosition) && structuralEquals(this.extendsList, ast.extendsList, includingPosition) && structuralEquals(this.implementsList, ast.implementsList, includingPosition);
        };
        return TypeDeclaration;
    })(NamedDeclaration);
    TypeScript.TypeDeclaration = TypeDeclaration;

    var ClassDeclaration = (function (_super) {
        __extends(ClassDeclaration, _super);
        function ClassDeclaration(name, typeParameters, members, extendsList, implementsList) {
            _super.call(this, TypeScript.NodeType.ClassDeclaration, name, typeParameters, extendsList, implementsList, members);
            this.constructorDecl = null;
            this.endingToken = null;
        }
        ClassDeclaration.prototype.shouldEmit = function () {
            return !TypeScript.hasFlag(this.getVarFlags(), TypeScript.VariableFlags.Ambient);
        };

        ClassDeclaration.prototype.emit = function (emitter) {
            emitter.emitClass(this);
        };
        return ClassDeclaration;
    })(TypeDeclaration);
    TypeScript.ClassDeclaration = ClassDeclaration;

    var InterfaceDeclaration = (function (_super) {
        __extends(InterfaceDeclaration, _super);
        function InterfaceDeclaration(name, typeParameters, members, extendsList, implementsList) {
            _super.call(this, TypeScript.NodeType.InterfaceDeclaration, name, typeParameters, extendsList, implementsList, members);
        }
        InterfaceDeclaration.prototype.shouldEmit = function () {
            return false;
        };
        return InterfaceDeclaration;
    })(TypeDeclaration);
    TypeScript.InterfaceDeclaration = InterfaceDeclaration;

    var Statement = (function (_super) {
        __extends(Statement, _super);
        function Statement(nodeType) {
            _super.call(this, nodeType);
        }
        Statement.prototype.isStatement = function () {
            return true;
        };

        Statement.prototype.isStatementOrExpression = function () {
            return true;
        };
        return Statement;
    })(AST);
    TypeScript.Statement = Statement;

    var ThrowStatement = (function (_super) {
        __extends(ThrowStatement, _super);
        function ThrowStatement(expression) {
            _super.call(this, TypeScript.NodeType.ThrowStatement);
            this.expression = expression;
        }
        ThrowStatement.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput("throw ");
            this.expression.emit(emitter);
            emitter.writeToOutput(";");
        };

        ThrowStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.expression, ast.expression, includingPosition);
        };
        return ThrowStatement;
    })(Statement);
    TypeScript.ThrowStatement = ThrowStatement;

    var ExpressionStatement = (function (_super) {
        __extends(ExpressionStatement, _super);
        function ExpressionStatement(expression) {
            _super.call(this, TypeScript.NodeType.ExpressionStatement);
            this.expression = expression;
        }
        ExpressionStatement.prototype.emitWorker = function (emitter) {
            this.expression.emit(emitter);
            emitter.writeToOutput(";");
        };

        ExpressionStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.expression, ast.expression, includingPosition);
        };
        return ExpressionStatement;
    })(Statement);
    TypeScript.ExpressionStatement = ExpressionStatement;

    var LabeledStatement = (function (_super) {
        __extends(LabeledStatement, _super);
        function LabeledStatement(identifier, statement) {
            _super.call(this, TypeScript.NodeType.LabeledStatement);
            this.identifier = identifier;
            this.statement = statement;
        }
        LabeledStatement.prototype.emitWorker = function (emitter) {
            emitter.recordSourceMappingStart(this.identifier);
            emitter.writeToOutput(this.identifier.actualText);
            emitter.recordSourceMappingEnd(this.identifier);
            emitter.writeLineToOutput(":");
            emitter.emitJavascript(this.statement, true);
        };

        LabeledStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.identifier, ast.identifier, includingPosition) && structuralEquals(this.statement, ast.statement, includingPosition);
        };
        return LabeledStatement;
    })(Statement);
    TypeScript.LabeledStatement = LabeledStatement;

    var VariableDeclaration = (function (_super) {
        __extends(VariableDeclaration, _super);
        function VariableDeclaration(declarators) {
            _super.call(this, TypeScript.NodeType.VariableDeclaration);
            this.declarators = declarators;
        }
        VariableDeclaration.prototype.emit = function (emitter) {
            emitter.emitVariableDeclaration(this);
        };

        VariableDeclaration.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.declarators, ast.declarators, includingPosition);
        };
        return VariableDeclaration;
    })(AST);
    TypeScript.VariableDeclaration = VariableDeclaration;

    var VariableStatement = (function (_super) {
        __extends(VariableStatement, _super);
        function VariableStatement(declaration) {
            _super.call(this, TypeScript.NodeType.VariableStatement);
            this.declaration = declaration;
        }
        VariableStatement.prototype.shouldEmit = function () {
            if (TypeScript.hasFlag(this.getFlags(), TypeScript.ASTFlags.EnumMapElement)) {
                return false;
            }

            var varDecl = this.declaration.declarators.members[0];
            return !TypeScript.hasFlag(varDecl.getVarFlags(), TypeScript.VariableFlags.Ambient) || varDecl.init !== null;
        };

        VariableStatement.prototype.emitWorker = function (emitter) {
            if (TypeScript.hasFlag(this.getFlags(), TypeScript.ASTFlags.EnumElement)) {
                emitter.emitEnumElement(this.declaration.declarators.members[0]);
            } else {
                this.declaration.emit(emitter);
                emitter.writeToOutput(";");
            }
        };

        VariableStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.declaration, ast.declaration, includingPosition);
        };
        return VariableStatement;
    })(Statement);
    TypeScript.VariableStatement = VariableStatement;

    var Block = (function (_super) {
        __extends(Block, _super);
        function Block(statements) {
            _super.call(this, TypeScript.NodeType.Block);
            this.statements = statements;
            this.closeBraceSpan = null;
        }
        Block.prototype.emitWorker = function (emitter) {
            emitter.writeLineToOutput(" {");
            emitter.indenter.increaseIndent();
            if (this.statements) {
                emitter.emitModuleElements(this.statements);
            }
            emitter.indenter.decreaseIndent();
            emitter.emitIndent();
            emitter.writeToOutput("}");
        };

        Block.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.statements, ast.statements, includingPosition);
        };
        return Block;
    })(Statement);
    TypeScript.Block = Block;

    var Jump = (function (_super) {
        __extends(Jump, _super);
        function Jump(nodeType) {
            _super.call(this, nodeType);
            this.target = null;
            this.resolvedTarget = null;
        }
        Jump.prototype.hasExplicitTarget = function () {
            return (this.target);
        };

        Jump.prototype.emitWorker = function (emitter) {
            if (this.nodeType === TypeScript.NodeType.BreakStatement) {
                emitter.writeToOutput("break");
            } else {
                emitter.writeToOutput("continue");
            }
            if (this.hasExplicitTarget()) {
                emitter.writeToOutput(" " + this.target);
            }
            emitter.writeToOutput(";");
        };

        Jump.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && this.target === ast.target;
        };
        return Jump;
    })(Statement);
    TypeScript.Jump = Jump;

    var WhileStatement = (function (_super) {
        __extends(WhileStatement, _super);
        function WhileStatement(cond, body) {
            _super.call(this, TypeScript.NodeType.WhileStatement);
            this.cond = cond;
            this.body = body;
        }
        WhileStatement.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput("while (");
            this.cond.emit(emitter);
            emitter.writeToOutput(")");
            emitter.emitBlockOrStatement(this.body);
        };

        WhileStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.cond, ast.cond, includingPosition) && structuralEquals(this.body, ast.body, includingPosition);
        };
        return WhileStatement;
    })(Statement);
    TypeScript.WhileStatement = WhileStatement;

    var DoStatement = (function (_super) {
        __extends(DoStatement, _super);
        function DoStatement(body, cond) {
            _super.call(this, TypeScript.NodeType.DoStatement);
            this.body = body;
            this.cond = cond;
            this.whileSpan = null;
        }
        DoStatement.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput("do");
            emitter.emitBlockOrStatement(this.body);
            emitter.recordSourceMappingStart(this.whileSpan);
            emitter.writeToOutput(" while");
            emitter.recordSourceMappingEnd(this.whileSpan);
            emitter.writeToOutput('(');
            this.cond.emit(emitter);
            emitter.writeToOutput(")");
            emitter.writeToOutput(";");
        };

        DoStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.body, ast.body, includingPosition) && structuralEquals(this.cond, ast.cond, includingPosition);
        };
        return DoStatement;
    })(Statement);
    TypeScript.DoStatement = DoStatement;

    var IfStatement = (function (_super) {
        __extends(IfStatement, _super);
        function IfStatement(cond, thenBod, elseBod) {
            _super.call(this, TypeScript.NodeType.IfStatement);
            this.cond = cond;
            this.thenBod = thenBod;
            this.elseBod = elseBod;
            this.statement = new ASTSpan();
        }
        IfStatement.prototype.emitWorker = function (emitter) {
            emitter.recordSourceMappingStart(this.statement);
            emitter.writeToOutput("if (");
            this.cond.emit(emitter);
            emitter.writeToOutput(")");
            emitter.recordSourceMappingEnd(this.statement);

            emitter.emitBlockOrStatement(this.thenBod);

            if (this.elseBod) {
                if (this.elseBod.nodeType === TypeScript.NodeType.IfStatement) {
                    emitter.writeToOutput(" else ");
                    this.elseBod.emit(emitter);
                } else {
                    emitter.writeToOutput(" else");
                    emitter.emitBlockOrStatement(this.elseBod);
                }
            }
        };

        IfStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.cond, ast.cond, includingPosition) && structuralEquals(this.thenBod, ast.thenBod, includingPosition) && structuralEquals(this.elseBod, ast.elseBod, includingPosition);
        };
        return IfStatement;
    })(Statement);
    TypeScript.IfStatement = IfStatement;

    var ReturnStatement = (function (_super) {
        __extends(ReturnStatement, _super);
        function ReturnStatement(returnExpression) {
            _super.call(this, TypeScript.NodeType.ReturnStatement);
            this.returnExpression = returnExpression;
        }
        ReturnStatement.prototype.emitWorker = function (emitter) {
            if (this.returnExpression) {
                emitter.writeToOutput("return ");
                this.returnExpression.emit(emitter);
                emitter.writeToOutput(";");
            } else {
                emitter.writeToOutput("return;");
            }
        };

        ReturnStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.returnExpression, ast.returnExpression, includingPosition);
        };
        return ReturnStatement;
    })(Statement);
    TypeScript.ReturnStatement = ReturnStatement;

    var ForInStatement = (function (_super) {
        __extends(ForInStatement, _super);
        function ForInStatement(lval, obj, body) {
            _super.call(this, TypeScript.NodeType.ForInStatement);
            this.lval = lval;
            this.obj = obj;
            this.body = body;
            this.statement = new ASTSpan();
        }
        ForInStatement.prototype.emitWorker = function (emitter) {
            emitter.recordSourceMappingStart(this.statement);
            emitter.writeToOutput("for (");
            this.lval.emit(emitter);
            emitter.writeToOutput(" in ");
            this.obj.emit(emitter);
            emitter.writeToOutput(")");
            emitter.recordSourceMappingEnd(this.statement);
            emitter.emitBlockOrStatement(this.body);
        };

        ForInStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.lval, ast.lval, includingPosition) && structuralEquals(this.obj, ast.obj, includingPosition) && structuralEquals(this.body, ast.body, includingPosition);
        };
        return ForInStatement;
    })(Statement);
    TypeScript.ForInStatement = ForInStatement;

    var ForStatement = (function (_super) {
        __extends(ForStatement, _super);
        function ForStatement(init, cond, incr, body) {
            _super.call(this, TypeScript.NodeType.ForStatement);
            this.init = init;
            this.cond = cond;
            this.incr = incr;
            this.body = body;
        }
        ForStatement.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput("for (");
            if (this.init) {
                if (this.init.nodeType !== TypeScript.NodeType.List) {
                    this.init.emit(emitter);
                } else {
                    emitter.setInVarBlock((this.init).members.length);
                    emitter.emitCommaSeparatedList(this.init);
                }
            }

            emitter.writeToOutput("; ");
            emitter.emitJavascript(this.cond, false);
            emitter.writeToOutput("; ");
            emitter.emitJavascript(this.incr, false);
            emitter.writeToOutput(")");
            emitter.emitBlockOrStatement(this.body);
        };

        ForStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.init, ast.init, includingPosition) && structuralEquals(this.cond, ast.cond, includingPosition) && structuralEquals(this.incr, ast.incr, includingPosition) && structuralEquals(this.body, ast.body, includingPosition);
        };
        return ForStatement;
    })(Statement);
    TypeScript.ForStatement = ForStatement;

    var WithStatement = (function (_super) {
        __extends(WithStatement, _super);
        function WithStatement(expr, body) {
            _super.call(this, TypeScript.NodeType.WithStatement);
            this.expr = expr;
            this.body = body;
        }
        WithStatement.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput("with (");
            if (this.expr) {
                this.expr.emit(emitter);
            }

            emitter.writeToOutput(")");
            emitter.emitBlockOrStatement(this.body);
        };

        WithStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.expr, ast.expr, includingPosition) && structuralEquals(this.body, ast.body, includingPosition);
        };
        return WithStatement;
    })(Statement);
    TypeScript.WithStatement = WithStatement;

    var SwitchStatement = (function (_super) {
        __extends(SwitchStatement, _super);
        function SwitchStatement(val) {
            _super.call(this, TypeScript.NodeType.SwitchStatement);
            this.val = val;
            this.defaultCase = null;
            this.statement = new ASTSpan();
        }
        SwitchStatement.prototype.emitWorker = function (emitter) {
            emitter.recordSourceMappingStart(this.statement);
            emitter.writeToOutput("switch (");
            this.val.emit(emitter);
            emitter.writeToOutput(")");
            emitter.recordSourceMappingEnd(this.statement);
            emitter.writeLineToOutput(" {");
            emitter.indenter.increaseIndent();

            var lastEmittedNode = null;
            for (var i = 0, n = this.caseList.members.length; i < n; i++) {
                var caseExpr = this.caseList.members[i];

                emitter.emitSpaceBetweenConstructs(lastEmittedNode, caseExpr);
                emitter.emitJavascript(caseExpr, true);

                lastEmittedNode = caseExpr;
            }
            emitter.indenter.decreaseIndent();
            emitter.emitIndent();
            emitter.writeToOutput("}");
        };

        SwitchStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.caseList, ast.caseList, includingPosition) && structuralEquals(this.val, ast.val, includingPosition);
        };
        return SwitchStatement;
    })(Statement);
    TypeScript.SwitchStatement = SwitchStatement;

    var CaseClause = (function (_super) {
        __extends(CaseClause, _super);
        function CaseClause() {
            _super.call(this, TypeScript.NodeType.CaseClause);
            this.expr = null;
            this.colonSpan = new ASTSpan();
        }
        CaseClause.prototype.emitWorker = function (emitter) {
            if (this.expr) {
                emitter.writeToOutput("case ");
                this.expr.emit(emitter);
            } else {
                emitter.writeToOutput("default");
            }
            emitter.recordSourceMappingStart(this.colonSpan);
            emitter.writeToOutput(":");
            emitter.recordSourceMappingEnd(this.colonSpan);

            if (this.body.members.length === 1 && this.body.members[0].nodeType === TypeScript.NodeType.Block) {
                this.body.members[0].emit(emitter);
                emitter.writeLineToOutput("");
            } else {
                emitter.writeLineToOutput("");
                emitter.indenter.increaseIndent();
                this.body.emit(emitter);
                emitter.indenter.decreaseIndent();
            }
        };

        CaseClause.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.expr, ast.expr, includingPosition) && structuralEquals(this.body, ast.body, includingPosition);
        };
        return CaseClause;
    })(AST);
    TypeScript.CaseClause = CaseClause;

    var TypeParameter = (function (_super) {
        __extends(TypeParameter, _super);
        function TypeParameter(name, constraint) {
            _super.call(this, TypeScript.NodeType.TypeParameter);
            this.name = name;
            this.constraint = constraint;
        }
        TypeParameter.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.name, ast.name, includingPosition) && structuralEquals(this.constraint, ast.constraint, includingPosition);
        };
        return TypeParameter;
    })(AST);
    TypeScript.TypeParameter = TypeParameter;

    var GenericType = (function (_super) {
        __extends(GenericType, _super);
        function GenericType(name, typeArguments) {
            _super.call(this, TypeScript.NodeType.GenericType);
            this.name = name;
            this.typeArguments = typeArguments;
        }
        GenericType.prototype.emit = function (emitter) {
            this.name.emit(emitter);
        };

        GenericType.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.name, ast.name, includingPosition) && structuralEquals(this.typeArguments, ast.typeArguments, includingPosition);
        };
        return GenericType;
    })(AST);
    TypeScript.GenericType = GenericType;

    var TypeReference = (function (_super) {
        __extends(TypeReference, _super);
        function TypeReference(term, arrayCount) {
            _super.call(this, TypeScript.NodeType.TypeRef);
            this.term = term;
            this.arrayCount = arrayCount;
        }
        TypeReference.prototype.emit = function (emitter) {
            throw new Error("should not emit a type ref");
        };

        TypeReference.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.term, ast.term, includingPosition) && this.arrayCount === ast.arrayCount;
        };
        return TypeReference;
    })(AST);
    TypeScript.TypeReference = TypeReference;

    var TryStatement = (function (_super) {
        __extends(TryStatement, _super);
        function TryStatement(tryBody, catchClause, finallyBody) {
            _super.call(this, TypeScript.NodeType.TryStatement);
            this.tryBody = tryBody;
            this.catchClause = catchClause;
            this.finallyBody = finallyBody;
        }
        TryStatement.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput("try ");
            this.tryBody.emit(emitter);
            emitter.emitJavascript(this.catchClause, false);

            if (this.finallyBody) {
                emitter.writeToOutput(" finally");
                this.finallyBody.emit(emitter);
            }
        };

        TryStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.tryBody, ast.tryBody, includingPosition) && structuralEquals(this.catchClause, ast.catchClause, includingPosition) && structuralEquals(this.finallyBody, ast.finallyBody, includingPosition);
        };
        return TryStatement;
    })(Statement);
    TypeScript.TryStatement = TryStatement;

    var CatchClause = (function (_super) {
        __extends(CatchClause, _super);
        function CatchClause(param, body) {
            _super.call(this, TypeScript.NodeType.CatchClause);
            this.param = param;
            this.body = body;
            this.statement = new ASTSpan();
        }
        CatchClause.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput(" ");
            emitter.recordSourceMappingStart(this.statement);
            emitter.writeToOutput("catch (");
            this.param.id.emit(emitter);
            emitter.writeToOutput(")");
            emitter.recordSourceMappingEnd(this.statement);
            this.body.emit(emitter);
        };

        CatchClause.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && structuralEquals(this.param, ast.param, includingPosition) && structuralEquals(this.body, ast.body, includingPosition);
        };
        return CatchClause;
    })(AST);
    TypeScript.CatchClause = CatchClause;

    var DebuggerStatement = (function (_super) {
        __extends(DebuggerStatement, _super);
        function DebuggerStatement() {
            _super.call(this, TypeScript.NodeType.DebuggerStatement);
        }
        DebuggerStatement.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput("debugger;");
        };
        return DebuggerStatement;
    })(Statement);
    TypeScript.DebuggerStatement = DebuggerStatement;

    var OmittedExpression = (function (_super) {
        __extends(OmittedExpression, _super);
        function OmittedExpression() {
            _super.call(this, TypeScript.NodeType.OmittedExpression);
        }
        OmittedExpression.prototype.emitWorker = function (emitter) {
        };

        OmittedExpression.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition);
        };
        return OmittedExpression;
    })(Expression);
    TypeScript.OmittedExpression = OmittedExpression;

    var EmptyStatement = (function (_super) {
        __extends(EmptyStatement, _super);
        function EmptyStatement() {
            _super.call(this, TypeScript.NodeType.EmptyStatement);
        }
        EmptyStatement.prototype.emitWorker = function (emitter) {
            emitter.writeToOutput(";");
        };

        EmptyStatement.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition);
        };
        return EmptyStatement;
    })(Statement);
    TypeScript.EmptyStatement = EmptyStatement;

    var Comment = (function (_super) {
        __extends(Comment, _super);
        function Comment(content, isBlockComment, endsLine) {
            _super.call(this, TypeScript.NodeType.Comment);
            this.content = content;
            this.isBlockComment = isBlockComment;
            this.endsLine = endsLine;
            this.text = null;
            this.docCommentText = null;
        }
        Comment.prototype.structuralEquals = function (ast, includingPosition) {
            return _super.prototype.structuralEquals.call(this, ast, includingPosition) && this.minLine === ast.minLine && this.content === ast.content && this.isBlockComment === ast.isBlockComment && this.endsLine === ast.endsLine;
        };

        Comment.prototype.getText = function () {
            if (this.text === null) {
                if (this.isBlockComment) {
                    this.text = this.content.split("\n");
                    for (var i = 0; i < this.text.length; i++) {
                        this.text[i] = this.text[i].replace(/^\s+|\s+$/g, '');
                    }
                } else {
                    this.text = [(this.content.replace(/^\s+|\s+$/g, ''))];
                }
            }

            return this.text;
        };

        Comment.prototype.isDocComment = function () {
            if (this.isBlockComment) {
                return this.content.charAt(2) === "*" && this.content.charAt(3) !== "/";
            }

            return false;
        };

        Comment.prototype.getDocCommentTextValue = function () {
            if (this.docCommentText === null) {
                this.docCommentText = Comment.cleanJSDocComment(this.content);
            }

            return this.docCommentText;
        };

        Comment.consumeLeadingSpace = function (line, startIndex, maxSpacesToRemove) {
            var endIndex = line.length;
            if (maxSpacesToRemove !== undefined) {
                endIndex = TypeScript.min(startIndex + maxSpacesToRemove, endIndex);
            }

            for (; startIndex < endIndex; startIndex++) {
                var charCode = line.charCodeAt(startIndex);
                if (charCode !== TypeScript.CharacterCodes.space && charCode !== TypeScript.CharacterCodes.tab) {
                    return startIndex;
                }
            }

            if (endIndex !== line.length) {
                return endIndex;
            }

            return -1;
        };

        Comment.isSpaceChar = function (line, index) {
            var length = line.length;
            if (index < length) {
                var charCode = line.charCodeAt(index);

                return charCode === TypeScript.CharacterCodes.space || charCode === TypeScript.CharacterCodes.tab;
            }

            return index === length;
        };

        Comment.cleanDocCommentLine = function (line, jsDocStyleComment, jsDocLineSpaceToRemove) {
            var nonSpaceIndex = Comment.consumeLeadingSpace(line, 0);
            if (nonSpaceIndex !== -1) {
                var jsDocSpacesRemoved = nonSpaceIndex;
                if (jsDocStyleComment && line.charAt(nonSpaceIndex) === '*') {
                    var startIndex = nonSpaceIndex + 1;
                    nonSpaceIndex = Comment.consumeLeadingSpace(line, startIndex, jsDocLineSpaceToRemove);

                    if (nonSpaceIndex !== -1) {
                        jsDocSpacesRemoved = nonSpaceIndex - startIndex;
                    } else {
                        return null;
                    }
                }

                return {
                    minChar: nonSpaceIndex,
                    limChar: line.charAt(line.length - 1) === "\r" ? line.length - 1 : line.length,
                    jsDocSpacesRemoved: jsDocSpacesRemoved
                };
            }

            return null;
        };

        Comment.cleanJSDocComment = function (content, spacesToRemove) {
            var docCommentLines = [];
            content = content.replace("/**", "");
            if (content.length >= 2 && content.charAt(content.length - 1) === "/" && content.charAt(content.length - 2) === "*") {
                content = content.substring(0, content.length - 2);
            }
            var lines = content.split("\n");
            var inParamTag = false;
            for (var l = 0; l < lines.length; l++) {
                var line = lines[l];
                var cleanLinePos = Comment.cleanDocCommentLine(line, true, spacesToRemove);
                if (!cleanLinePos) {
                    continue;
                }

                var docCommentText = "";
                var prevPos = cleanLinePos.minChar;
                for (var i = line.indexOf("@", cleanLinePos.minChar); 0 <= i && i < cleanLinePos.limChar; i = line.indexOf("@", i + 1)) {
                    var wasInParamtag = inParamTag;

                    if (line.indexOf("param", i + 1) === i + 1 && Comment.isSpaceChar(line, i + 6)) {
                        if (!wasInParamtag) {
                            docCommentText += line.substring(prevPos, i);
                        }

                        prevPos = i;
                        inParamTag = true;
                    } else if (wasInParamtag) {
                        prevPos = i;
                        inParamTag = false;
                    }
                }

                if (!inParamTag) {
                    docCommentText += line.substring(prevPos, cleanLinePos.limChar);
                }

                var newCleanPos = Comment.cleanDocCommentLine(docCommentText, false);
                if (newCleanPos) {
                    if (spacesToRemove === undefined) {
                        spacesToRemove = cleanLinePos.jsDocSpacesRemoved;
                    }
                    docCommentLines.push(docCommentText);
                }
            }

            return docCommentLines.join("\n");
        };

        Comment.getDocCommentText = function (comments) {
            var docCommentText = [];
            for (var c = 0; c < comments.length; c++) {
                var commentText = comments[c].getDocCommentTextValue();
                if (commentText !== "") {
                    docCommentText.push(commentText);
                }
            }
            return docCommentText.join("\n");
        };

        Comment.getParameterDocCommentText = function (param, fncDocComments) {
            if (fncDocComments.length === 0 || !fncDocComments[0].isBlockComment) {
                return "";
            }

            for (var i = 0; i < fncDocComments.length; i++) {
                var commentContents = fncDocComments[i].content;
                for (var j = commentContents.indexOf("@param", 0); 0 <= j; j = commentContents.indexOf("@param", j)) {
                    j += 6;
                    if (!Comment.isSpaceChar(commentContents, j)) {
                        continue;
                    }

                    j = Comment.consumeLeadingSpace(commentContents, j);
                    if (j === -1) {
                        break;
                    }

                    if (commentContents.charCodeAt(j) === TypeScript.CharacterCodes.openBrace) {
                        j++;

                        var charCode = 0;
                        for (var curlies = 1; j < commentContents.length; j++) {
                            charCode = commentContents.charCodeAt(j);

                            if (charCode === TypeScript.CharacterCodes.openBrace) {
                                curlies++;
                                continue;
                            }

                            if (charCode === TypeScript.CharacterCodes.closeBrace) {
                                curlies--;
                                if (curlies === 0) {
                                    break;
                                } else {
                                    continue;
                                }
                            }

                            if (charCode === TypeScript.CharacterCodes.at) {
                                break;
                            }
                        }

                        if (j === commentContents.length) {
                            break;
                        }

                        if (charCode === TypeScript.CharacterCodes.at) {
                            continue;
                        }

                        j = Comment.consumeLeadingSpace(commentContents, j + 1);
                        if (j === -1) {
                            break;
                        }
                    }

                    if (param !== commentContents.substr(j, param.length) || !Comment.isSpaceChar(commentContents, j + param.length)) {
                        continue;
                    }

                    j = Comment.consumeLeadingSpace(commentContents, j + param.length);
                    if (j === -1) {
                        return "";
                    }

                    var endOfParam = commentContents.indexOf("@", j);
                    var paramHelpString = commentContents.substring(j, endOfParam < 0 ? commentContents.length : endOfParam);

                    var paramSpacesToRemove = undefined;
                    var paramLineIndex = commentContents.substring(0, j).lastIndexOf("\n") + 1;
                    if (paramLineIndex !== 0) {
                        if (paramLineIndex < j && commentContents.charAt(paramLineIndex + 1) === "\r") {
                            paramLineIndex++;
                        }
                    }
                    var startSpaceRemovalIndex = Comment.consumeLeadingSpace(commentContents, paramLineIndex);
                    if (startSpaceRemovalIndex !== j && commentContents.charAt(startSpaceRemovalIndex) === "*") {
                        paramSpacesToRemove = j - startSpaceRemovalIndex - 1;
                    }

                    return Comment.cleanJSDocComment(paramHelpString, paramSpacesToRemove);
                }
            }

            return "";
        };
        return Comment;
    })(AST);
    TypeScript.Comment = Comment;
})(TypeScript || (TypeScript = {}));
