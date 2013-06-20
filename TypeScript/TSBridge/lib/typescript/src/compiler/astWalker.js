var TypeScript;
(function (TypeScript) {
    var AstWalkOptions = (function () {
        function AstWalkOptions() {
            this.goChildren = true;
        }
        return AstWalkOptions;
    })();
    TypeScript.AstWalkOptions = AstWalkOptions;

    var AstWalker = (function () {
        function AstWalker(childrenWalkers, pre, post, options, state) {
            this.childrenWalkers = childrenWalkers;
            this.pre = pre;
            this.post = post;
            this.options = options;
            this.state = state;
        }
        AstWalker.prototype.walk = function (ast, parent) {
            var preAst = this.pre(ast, parent, this);
            if (preAst === undefined) {
                preAst = ast;
            }
            if (this.options.goChildren) {
                this.childrenWalkers[ast.nodeType](ast, parent, this);
            } else {
                this.options.goChildren = true;
            }

            if (this.post) {
                var postAst = this.post(preAst, parent, this);
                if (postAst === undefined) {
                    postAst = preAst;
                }
                return postAst;
            } else {
                return preAst;
            }
        };
        return AstWalker;
    })();

    var AstWalkerFactory = (function () {
        function AstWalkerFactory() {
            this.childrenWalkers = [];
            this.initChildrenWalkers();
        }
        AstWalkerFactory.prototype.walk = function (ast, pre, post, options, state) {
            return this.getWalker(pre, post, options, state).walk(ast, null);
        };

        AstWalkerFactory.prototype.getWalker = function (pre, post, options, state) {
            return this.getSlowWalker(pre, post, options, state);
        };

        AstWalkerFactory.prototype.getSlowWalker = function (pre, post, options, state) {
            if (!options) {
                options = new AstWalkOptions();
            }

            return new AstWalker(this.childrenWalkers, pre, post, options, state);
        };

        AstWalkerFactory.prototype.initChildrenWalkers = function () {
            this.childrenWalkers[TypeScript.NodeType.None] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.EmptyStatement] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.OmittedExpression] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.TrueLiteral] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.FalseLiteral] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.ThisExpression] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.SuperExpression] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.StringLiteral] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.RegularExpressionLiteral] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.NullLiteral] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.ArrayLiteralExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.ObjectLiteralExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.VoidExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.CommaExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.PlusExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.NegateExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.DeleteExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.InExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.MemberAccessExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.InstanceOfExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.TypeOfExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.NumericLiteral] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.Name] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.TypeParameter] = ChildrenWalkers.walkTypeParameterChildren;
            this.childrenWalkers[TypeScript.NodeType.GenericType] = ChildrenWalkers.walkGenericTypeChildren;
            this.childrenWalkers[TypeScript.NodeType.TypeRef] = ChildrenWalkers.walkTypeReferenceChildren;
            this.childrenWalkers[TypeScript.NodeType.ElementAccessExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.InvocationExpression] = ChildrenWalkers.walkCallExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.ObjectCreationExpression] = ChildrenWalkers.walkCallExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.AssignmentExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.AddAssignmentExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.SubtractAssignmentExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.DivideAssignmentExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.MultiplyAssignmentExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.ModuloAssignmentExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.AndAssignmentExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.ExclusiveOrAssignmentExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.OrAssignmentExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.LeftShiftAssignmentExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.SignedRightShiftAssignmentExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.UnsignedRightShiftAssignmentExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.ConditionalExpression] = ChildrenWalkers.walkTrinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.LogicalOrExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.LogicalAndExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.BitwiseOrExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.BitwiseExclusiveOrExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.BitwiseAndExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.EqualsWithTypeConversionExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.NotEqualsWithTypeConversionExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.EqualsExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.NotEqualsExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.LessThanExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.LessThanOrEqualExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.GreaterThanExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.GreaterThanOrEqualExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.AddExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.SubtractExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.MultiplyExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.DivideExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.ModuloExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.LeftShiftExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.SignedRightShiftExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.UnsignedRightShiftExpression] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.BitwiseNotExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.LogicalNotExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.PreIncrementExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.PreDecrementExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.PostIncrementExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.PostDecrementExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.CastExpression] = ChildrenWalkers.walkUnaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.ParenthesizedExpression] = ChildrenWalkers.walkParenthesizedExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.FunctionDeclaration] = ChildrenWalkers.walkFuncDeclChildren;
            this.childrenWalkers[TypeScript.NodeType.Member] = ChildrenWalkers.walkBinaryExpressionChildren;
            this.childrenWalkers[TypeScript.NodeType.VariableDeclarator] = ChildrenWalkers.walkBoundDeclChildren;
            this.childrenWalkers[TypeScript.NodeType.VariableDeclaration] = ChildrenWalkers.walkVariableDeclarationChildren;
            this.childrenWalkers[TypeScript.NodeType.Parameter] = ChildrenWalkers.walkBoundDeclChildren;
            this.childrenWalkers[TypeScript.NodeType.ReturnStatement] = ChildrenWalkers.walkReturnStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.BreakStatement] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.ContinueStatement] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.ThrowStatement] = ChildrenWalkers.walkThrowStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.ForStatement] = ChildrenWalkers.walkForStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.ForInStatement] = ChildrenWalkers.walkForInStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.IfStatement] = ChildrenWalkers.walkIfStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.WhileStatement] = ChildrenWalkers.walkWhileStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.DoStatement] = ChildrenWalkers.walkDoStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.Block] = ChildrenWalkers.walkBlockChildren;
            this.childrenWalkers[TypeScript.NodeType.CaseClause] = ChildrenWalkers.walkCaseClauseChildren;
            this.childrenWalkers[TypeScript.NodeType.SwitchStatement] = ChildrenWalkers.walkSwitchStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.TryStatement] = ChildrenWalkers.walkTryStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.CatchClause] = ChildrenWalkers.walkCatchClauseChildren;
            this.childrenWalkers[TypeScript.NodeType.List] = ChildrenWalkers.walkListChildren;
            this.childrenWalkers[TypeScript.NodeType.Script] = ChildrenWalkers.walkScriptChildren;
            this.childrenWalkers[TypeScript.NodeType.ClassDeclaration] = ChildrenWalkers.walkClassDeclChildren;
            this.childrenWalkers[TypeScript.NodeType.InterfaceDeclaration] = ChildrenWalkers.walkTypeDeclChildren;
            this.childrenWalkers[TypeScript.NodeType.ModuleDeclaration] = ChildrenWalkers.walkModuleDeclChildren;
            this.childrenWalkers[TypeScript.NodeType.ImportDeclaration] = ChildrenWalkers.walkImportDeclChildren;
            this.childrenWalkers[TypeScript.NodeType.ExportAssignment] = ChildrenWalkers.walkExportAssignmentChildren;
            this.childrenWalkers[TypeScript.NodeType.WithStatement] = ChildrenWalkers.walkWithStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.ExpressionStatement] = ChildrenWalkers.walkExpressionStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.LabeledStatement] = ChildrenWalkers.walkLabeledStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.VariableStatement] = ChildrenWalkers.walkVariableStatementChildren;
            this.childrenWalkers[TypeScript.NodeType.Comment] = ChildrenWalkers.walkNone;
            this.childrenWalkers[TypeScript.NodeType.DebuggerStatement] = ChildrenWalkers.walkNone;

            for (var e in TypeScript.NodeType) {
                if (TypeScript.NodeType.hasOwnProperty(e) && TypeScript.StringUtilities.isString(TypeScript.NodeType[e])) {
                    if (this.childrenWalkers[e] === undefined) {
                        throw new Error("initWalkers function is not up to date with enum content!");
                    }
                }
            }
        };
        return AstWalkerFactory;
    })();
    TypeScript.AstWalkerFactory = AstWalkerFactory;

    var globalAstWalkerFactory;

    function getAstWalkerFactory() {
        if (!globalAstWalkerFactory) {
            globalAstWalkerFactory = new AstWalkerFactory();
        }
        return globalAstWalkerFactory;
    }
    TypeScript.getAstWalkerFactory = getAstWalkerFactory;

    var ChildrenWalkers;
    (function (ChildrenWalkers) {
        function walkNone(preAst, parent, walker) {
        }
        ChildrenWalkers.walkNone = walkNone;

        function walkListChildren(preAst, parent, walker) {
            var len = preAst.members.length;

            for (var i = 0; i < len; i++) {
                preAst.members[i] = walker.walk(preAst.members[i], preAst);
            }
        }
        ChildrenWalkers.walkListChildren = walkListChildren;

        function walkThrowStatementChildren(preAst, parent, walker) {
            if (preAst.expression) {
                preAst.expression = walker.walk(preAst.expression, preAst);
            }
        }
        ChildrenWalkers.walkThrowStatementChildren = walkThrowStatementChildren;

        function walkUnaryExpressionChildren(preAst, parent, walker) {
            if (preAst.castTerm) {
                preAst.castTerm = walker.walk(preAst.castTerm, preAst);
            }
            if (preAst.operand) {
                preAst.operand = walker.walk(preAst.operand, preAst);
            }
        }
        ChildrenWalkers.walkUnaryExpressionChildren = walkUnaryExpressionChildren;

        function walkParenthesizedExpressionChildren(preAst, parent, walker) {
            if (preAst.expression) {
                preAst.expression = walker.walk(preAst.expression, preAst);
            }
        }
        ChildrenWalkers.walkParenthesizedExpressionChildren = walkParenthesizedExpressionChildren;

        function walkBinaryExpressionChildren(preAst, parent, walker) {
            if (preAst.operand1) {
                preAst.operand1 = walker.walk(preAst.operand1, preAst);
            }
            if (preAst.operand2) {
                preAst.operand2 = walker.walk(preAst.operand2, preAst);
            }
        }
        ChildrenWalkers.walkBinaryExpressionChildren = walkBinaryExpressionChildren;

        function walkTypeParameterChildren(preAst, parent, walker) {
            if (preAst.name) {
                preAst.name = walker.walk(preAst.name, preAst);
            }

            if (preAst.constraint) {
                preAst.constraint = walker.walk(preAst.constraint, preAst);
            }
        }
        ChildrenWalkers.walkTypeParameterChildren = walkTypeParameterChildren;

        function walkGenericTypeChildren(preAst, parent, walker) {
            if (preAst.name) {
                preAst.name = walker.walk(preAst.name, preAst);
            }

            if (preAst.typeArguments) {
                preAst.typeArguments = walker.walk(preAst.typeArguments, preAst);
            }
        }
        ChildrenWalkers.walkGenericTypeChildren = walkGenericTypeChildren;

        function walkTypeReferenceChildren(preAst, parent, walker) {
            if (preAst.term) {
                preAst.term = walker.walk(preAst.term, preAst);
            }
        }
        ChildrenWalkers.walkTypeReferenceChildren = walkTypeReferenceChildren;

        function walkCallExpressionChildren(preAst, parent, walker) {
            preAst.target = walker.walk(preAst.target, preAst);

            if (preAst.typeArguments) {
                preAst.typeArguments = walker.walk(preAst.typeArguments, preAst);
            }

            if (preAst.arguments) {
                preAst.arguments = walker.walk(preAst.arguments, preAst);
            }
        }
        ChildrenWalkers.walkCallExpressionChildren = walkCallExpressionChildren;

        function walkTrinaryExpressionChildren(preAst, parent, walker) {
            if (preAst.operand1) {
                preAst.operand1 = walker.walk(preAst.operand1, preAst);
            }
            if (preAst.operand2) {
                preAst.operand2 = walker.walk(preAst.operand2, preAst);
            }
            if (preAst.operand3) {
                preAst.operand3 = walker.walk(preAst.operand3, preAst);
            }
        }
        ChildrenWalkers.walkTrinaryExpressionChildren = walkTrinaryExpressionChildren;

        function walkFuncDeclChildren(preAst, parent, walker) {
            if (preAst.name) {
                preAst.name = walker.walk(preAst.name, preAst);
            }
            if (preAst.typeArguments) {
                preAst.typeArguments = walker.walk(preAst.typeArguments, preAst);
            }
            if (preAst.arguments) {
                preAst.arguments = walker.walk(preAst.arguments, preAst);
            }
            if (preAst.returnTypeAnnotation) {
                preAst.returnTypeAnnotation = walker.walk(preAst.returnTypeAnnotation, preAst);
            }
            if (preAst.block) {
                preAst.block = walker.walk(preAst.block, preAst);
            }
        }
        ChildrenWalkers.walkFuncDeclChildren = walkFuncDeclChildren;

        function walkBoundDeclChildren(preAst, parent, walker) {
            if (preAst.id) {
                preAst.id = walker.walk(preAst.id, preAst);
            }
            if (preAst.init) {
                preAst.init = walker.walk(preAst.init, preAst);
            }
            if (preAst.typeExpr) {
                preAst.typeExpr = walker.walk(preAst.typeExpr, preAst);
            }
        }
        ChildrenWalkers.walkBoundDeclChildren = walkBoundDeclChildren;

        function walkReturnStatementChildren(preAst, parent, walker) {
            if (preAst.returnExpression) {
                preAst.returnExpression = walker.walk(preAst.returnExpression, preAst);
            }
        }
        ChildrenWalkers.walkReturnStatementChildren = walkReturnStatementChildren;

        function walkForStatementChildren(preAst, parent, walker) {
            if (preAst.init) {
                preAst.init = walker.walk(preAst.init, preAst);
            }

            if (preAst.cond) {
                preAst.cond = walker.walk(preAst.cond, preAst);
            }

            if (preAst.incr) {
                preAst.incr = walker.walk(preAst.incr, preAst);
            }

            if (preAst.body) {
                preAst.body = walker.walk(preAst.body, preAst);
            }
        }
        ChildrenWalkers.walkForStatementChildren = walkForStatementChildren;

        function walkForInStatementChildren(preAst, parent, walker) {
            preAst.lval = walker.walk(preAst.lval, preAst);
            preAst.obj = walker.walk(preAst.obj, preAst);

            if (preAst.body) {
                preAst.body = walker.walk(preAst.body, preAst);
            }
        }
        ChildrenWalkers.walkForInStatementChildren = walkForInStatementChildren;

        function walkIfStatementChildren(preAst, parent, walker) {
            preAst.cond = walker.walk(preAst.cond, preAst);
            if (preAst.thenBod) {
                preAst.thenBod = walker.walk(preAst.thenBod, preAst);
            }
            if (preAst.elseBod) {
                preAst.elseBod = walker.walk(preAst.elseBod, preAst);
            }
        }
        ChildrenWalkers.walkIfStatementChildren = walkIfStatementChildren;

        function walkWhileStatementChildren(preAst, parent, walker) {
            preAst.cond = walker.walk(preAst.cond, preAst);
            if (preAst.body) {
                preAst.body = walker.walk(preAst.body, preAst);
            }
        }
        ChildrenWalkers.walkWhileStatementChildren = walkWhileStatementChildren;

        function walkDoStatementChildren(preAst, parent, walker) {
            preAst.cond = walker.walk(preAst.cond, preAst);
            if (preAst.body) {
                preAst.body = walker.walk(preAst.body, preAst);
            }
        }
        ChildrenWalkers.walkDoStatementChildren = walkDoStatementChildren;

        function walkBlockChildren(preAst, parent, walker) {
            if (preAst.statements) {
                preAst.statements = walker.walk(preAst.statements, preAst);
            }
        }
        ChildrenWalkers.walkBlockChildren = walkBlockChildren;

        function walkVariableDeclarationChildren(preAst, parent, walker) {
            if (preAst.declarators) {
                preAst.declarators = walker.walk(preAst.declarators, preAst);
            }
        }
        ChildrenWalkers.walkVariableDeclarationChildren = walkVariableDeclarationChildren;

        function walkCaseClauseChildren(preAst, parent, walker) {
            if (preAst.expr) {
                preAst.expr = walker.walk(preAst.expr, preAst);
            }

            if (preAst.body) {
                preAst.body = walker.walk(preAst.body, preAst);
            }
        }
        ChildrenWalkers.walkCaseClauseChildren = walkCaseClauseChildren;

        function walkSwitchStatementChildren(preAst, parent, walker) {
            if (preAst.val) {
                preAst.val = walker.walk(preAst.val, preAst);
            }

            if (preAst.caseList) {
                preAst.caseList = walker.walk(preAst.caseList, preAst);
            }
        }
        ChildrenWalkers.walkSwitchStatementChildren = walkSwitchStatementChildren;

        function walkTryStatementChildren(preAst, parent, walker) {
            if (preAst.tryBody) {
                preAst.tryBody = walker.walk(preAst.tryBody, preAst);
            }
            if (preAst.catchClause) {
                preAst.catchClause = walker.walk(preAst.catchClause, preAst);
            }
            if (preAst.finallyBody) {
                preAst.finallyBody = walker.walk(preAst.finallyBody, preAst);
            }
        }
        ChildrenWalkers.walkTryStatementChildren = walkTryStatementChildren;

        function walkCatchClauseChildren(preAst, parent, walker) {
            if (preAst.param) {
                preAst.param = walker.walk(preAst.param, preAst);
            }

            if (preAst.body) {
                preAst.body = walker.walk(preAst.body, preAst);
            }
        }
        ChildrenWalkers.walkCatchClauseChildren = walkCatchClauseChildren;

        function walkRecordChildren(preAst, parent, walker) {
            preAst.name = walker.walk(preAst.name, preAst);
            if (preAst.members) {
                preAst.members = walker.walk(preAst.members, preAst);
            }
        }
        ChildrenWalkers.walkRecordChildren = walkRecordChildren;

        function walkNamedTypeChildren(preAst, parent, walker) {
            walkRecordChildren(preAst, parent, walker);
        }
        ChildrenWalkers.walkNamedTypeChildren = walkNamedTypeChildren;

        function walkClassDeclChildren(preAst, parent, walker) {
            walkNamedTypeChildren(preAst, parent, walker);

            if (preAst.typeParameters) {
                preAst.typeParameters = walker.walk(preAst.typeParameters, preAst);
            }

            if (preAst.extendsList) {
                preAst.extendsList = walker.walk(preAst.extendsList, preAst);
            }

            if (preAst.implementsList) {
                preAst.implementsList = walker.walk(preAst.implementsList, preAst);
            }
        }
        ChildrenWalkers.walkClassDeclChildren = walkClassDeclChildren;

        function walkScriptChildren(preAst, parent, walker) {
            if (preAst.moduleElements) {
                preAst.moduleElements = walker.walk(preAst.moduleElements, preAst);
            }
        }
        ChildrenWalkers.walkScriptChildren = walkScriptChildren;

        function walkTypeDeclChildren(preAst, parent, walker) {
            walkNamedTypeChildren(preAst, parent, walker);

            if (preAst.typeParameters) {
                preAst.typeParameters = walker.walk(preAst.typeParameters, preAst);
            }

            if (preAst.extendsList) {
                preAst.extendsList = walker.walk(preAst.extendsList, preAst);
            }

            if (preAst.implementsList) {
                preAst.implementsList = walker.walk(preAst.implementsList, preAst);
            }
        }
        ChildrenWalkers.walkTypeDeclChildren = walkTypeDeclChildren;

        function walkModuleDeclChildren(preAst, parent, walker) {
            walkRecordChildren(preAst, parent, walker);
        }
        ChildrenWalkers.walkModuleDeclChildren = walkModuleDeclChildren;

        function walkImportDeclChildren(preAst, parent, walker) {
            if (preAst.id) {
                preAst.id = walker.walk(preAst.id, preAst);
            }
            if (preAst.alias) {
                preAst.alias = walker.walk(preAst.alias, preAst);
            }
        }
        ChildrenWalkers.walkImportDeclChildren = walkImportDeclChildren;

        function walkExportAssignmentChildren(preAst, parent, walker) {
            if (preAst.id) {
                preAst.id = walker.walk(preAst.id, preAst);
            }
        }
        ChildrenWalkers.walkExportAssignmentChildren = walkExportAssignmentChildren;

        function walkWithStatementChildren(preAst, parent, walker) {
            if (preAst.expr) {
                preAst.expr = walker.walk(preAst.expr, preAst);
            }

            if (preAst.body) {
                preAst.body = walker.walk(preAst.body, preAst);
            }
        }
        ChildrenWalkers.walkWithStatementChildren = walkWithStatementChildren;

        function walkExpressionStatementChildren(preAst, parent, walker) {
            preAst.expression = walker.walk(preAst.expression, preAst);
        }
        ChildrenWalkers.walkExpressionStatementChildren = walkExpressionStatementChildren;

        function walkLabeledStatementChildren(preAst, parent, walker) {
            preAst.identifier = walker.walk(preAst.identifier, preAst);
            preAst.statement = walker.walk(preAst.statement, preAst);
        }
        ChildrenWalkers.walkLabeledStatementChildren = walkLabeledStatementChildren;

        function walkVariableStatementChildren(preAst, parent, walker) {
            preAst.declaration = walker.walk(preAst.declaration, preAst);
        }
        ChildrenWalkers.walkVariableStatementChildren = walkVariableStatementChildren;
    })(ChildrenWalkers || (ChildrenWalkers = {}));
})(TypeScript || (TypeScript = {}));
