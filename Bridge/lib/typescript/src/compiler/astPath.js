var TypeScript;
(function (TypeScript) {
    function max(a, b) {
        return a >= b ? a : b;
    }
    TypeScript.max = max;

    function min(a, b) {
        return a <= b ? a : b;
    }
    TypeScript.min = min;

    var AstPath = (function () {
        function AstPath() {
            this.asts = [];
            this.top = -1;
        }
        AstPath.reverseIndexOf = function (items, index) {
            return (items === null || items.length <= index) ? null : items[items.length - index - 1];
        };

        AstPath.prototype.clone = function () {
            var clone = new AstPath();
            clone.asts = this.asts.map(function (value) {
                return value;
            });
            clone.top = this.top;
            return clone;
        };

        AstPath.prototype.pop = function () {
            var head = this.ast();
            this.up();

            while (this.asts.length > this.count()) {
                this.asts.pop();
            }
            return head;
        };

        AstPath.prototype.push = function (ast) {
            while (this.asts.length > this.count()) {
                this.asts.pop();
            }
            this.top = this.asts.length;
            this.asts.push(ast);
        };

        AstPath.prototype.up = function () {
            if (this.top <= -1)
                throw new Error("Invalid call to 'up'");
            this.top--;
        };

        AstPath.prototype.down = function () {
            if (this.top === this.ast.length - 1)
                throw new Error("Invalid call to 'down'");
            this.top++;
        };

        AstPath.prototype.nodeType = function () {
            if (this.ast() === null)
                return TypeScript.NodeType.None;
            return this.ast().nodeType;
        };

        AstPath.prototype.ast = function () {
            return AstPath.reverseIndexOf(this.asts, this.asts.length - (this.top + 1));
        };

        AstPath.prototype.parent = function () {
            return AstPath.reverseIndexOf(this.asts, this.asts.length - this.top);
        };

        AstPath.prototype.count = function () {
            return this.top + 1;
        };

        AstPath.prototype.get = function (index) {
            return this.asts[index];
        };

        AstPath.prototype.isNameOfClass = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.ast().nodeType === TypeScript.NodeType.Name) && (this.parent().nodeType === TypeScript.NodeType.ClassDeclaration) && ((this.parent()).name === this.ast());
        };

        AstPath.prototype.isNameOfInterface = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.ast().nodeType === TypeScript.NodeType.Name) && (this.parent().nodeType === TypeScript.NodeType.InterfaceDeclaration) && ((this.parent()).name === this.ast());
        };

        AstPath.prototype.isNameOfArgument = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.ast().nodeType === TypeScript.NodeType.Name) && (this.parent().nodeType === TypeScript.NodeType.Parameter) && ((this.parent()).id === this.ast());
        };

        AstPath.prototype.isNameOfVariable = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.ast().nodeType === TypeScript.NodeType.Name) && (this.parent().nodeType === TypeScript.NodeType.VariableDeclarator) && ((this.parent()).id === this.ast());
        };

        AstPath.prototype.isNameOfModule = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.ast().nodeType === TypeScript.NodeType.Name) && (this.parent().nodeType === TypeScript.NodeType.ModuleDeclaration) && ((this.parent()).name === this.ast());
        };

        AstPath.prototype.isNameOfFunction = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.ast().nodeType === TypeScript.NodeType.Name) && (this.parent().nodeType === TypeScript.NodeType.FunctionDeclaration) && ((this.parent()).name === this.ast());
        };

        AstPath.prototype.isBodyOfFunction = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.FunctionDeclaration && (this.asts[this.top - 1]).block === this.asts[this.top - 0];
        };

        AstPath.prototype.isArgumentListOfFunction = function () {
            return this.count() >= 2 && this.asts[this.top - 0].nodeType === TypeScript.NodeType.List && this.asts[this.top - 1].nodeType === TypeScript.NodeType.FunctionDeclaration && (this.asts[this.top - 1]).arguments === this.asts[this.top - 0];
        };

        AstPath.prototype.isTargetOfCall = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.InvocationExpression && (this.asts[this.top - 1]).target === this.asts[this.top];
        };

        AstPath.prototype.isTargetOfNew = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.ObjectCreationExpression && (this.asts[this.top - 1]).target === this.asts[this.top];
        };

        AstPath.prototype.isInClassImplementsList = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.parent().nodeType === TypeScript.NodeType.ClassDeclaration) && (this.isMemberOfList((this.parent()).implementsList, this.ast()));
        };

        AstPath.prototype.isInInterfaceExtendsList = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.parent().nodeType === TypeScript.NodeType.InterfaceDeclaration) && (this.isMemberOfList((this.parent()).extendsList, this.ast()));
        };

        AstPath.prototype.isMemberOfMemberAccessExpression = function () {
            if (this.count() > 1 && this.parent().nodeType === TypeScript.NodeType.MemberAccessExpression && (this.parent()).operand2 === this.asts[this.top]) {
                return true;
            }

            return false;
        };

        AstPath.prototype.isCallExpression = function () {
            return this.count() >= 1 && (this.asts[this.top - 0].nodeType === TypeScript.NodeType.InvocationExpression || this.asts[this.top - 0].nodeType === TypeScript.NodeType.ObjectCreationExpression);
        };

        AstPath.prototype.isCallExpressionTarget = function () {
            if (this.count() < 2) {
                return false;
            }

            var current = this.top;

            var nodeType = this.asts[current].nodeType;
            if (nodeType === TypeScript.NodeType.ThisExpression || nodeType === TypeScript.NodeType.SuperExpression || nodeType === TypeScript.NodeType.Name) {
                current--;
            }

            while (current >= 0) {
                if (current < this.top && this.asts[current].nodeType === TypeScript.NodeType.MemberAccessExpression && (this.asts[current]).operand2 === this.asts[current + 1]) {
                    current--;
                    continue;
                }

                break;
            }

            return current < this.top && (this.asts[current].nodeType === TypeScript.NodeType.InvocationExpression || this.asts[current].nodeType === TypeScript.NodeType.ObjectCreationExpression) && this.asts[current + 1] === (this.asts[current]).target;
        };

        AstPath.prototype.isDeclaration = function () {
            if (this.ast() !== null) {
                switch (this.ast().nodeType) {
                    case TypeScript.NodeType.ClassDeclaration:
                    case TypeScript.NodeType.InterfaceDeclaration:
                    case TypeScript.NodeType.ModuleDeclaration:
                    case TypeScript.NodeType.FunctionDeclaration:
                    case TypeScript.NodeType.VariableDeclarator:
                        return true;
                }
            }

            return false;
        };

        AstPath.prototype.isMemberOfList = function (list, item) {
            if (list && list.members) {
                for (var i = 0, n = list.members.length; i < n; i++) {
                    if (list.members[i] === item) {
                        return true;
                    }
                }
            }

            return false;
        };
        return AstPath;
    })();
    TypeScript.AstPath = AstPath;

    function isValidAstNode(ast) {
        if (ast === null)
            return false;

        if (ast.minChar === -1 || ast.limChar === -1)
            return false;

        return true;
    }
    TypeScript.isValidAstNode = isValidAstNode;

    var AstPathContext = (function () {
        function AstPathContext() {
            this.path = new TypeScript.AstPath();
        }
        return AstPathContext;
    })();
    TypeScript.AstPathContext = AstPathContext;

    (function (GetAstPathOptions) {
        GetAstPathOptions[GetAstPathOptions["Default"] = 0] = "Default";
        GetAstPathOptions[GetAstPathOptions["EdgeInclusive"] = 1] = "EdgeInclusive";

        GetAstPathOptions[GetAstPathOptions["DontPruneSearchBasedOnPosition"] = 1 << 1] = "DontPruneSearchBasedOnPosition";
    })(TypeScript.GetAstPathOptions || (TypeScript.GetAstPathOptions = {}));
    var GetAstPathOptions = TypeScript.GetAstPathOptions;

    function getAstPathToPosition(script, pos, useTrailingTriviaAsLimChar, options) {
        if (typeof useTrailingTriviaAsLimChar === "undefined") { useTrailingTriviaAsLimChar = true; }
        if (typeof options === "undefined") { options = GetAstPathOptions.Default; }
        var lookInComments = function (comments) {
            if (comments && comments.length > 0) {
                for (var i = 0; i < comments.length; i++) {
                    var minChar = comments[i].minChar;
                    var limChar = comments[i].limChar + (useTrailingTriviaAsLimChar ? comments[i].trailingTriviaWidth : 0);
                    if (!comments[i].isBlockComment) {
                        limChar++;
                    }
                    if (pos >= minChar && pos < limChar) {
                        ctx.path.push(comments[i]);
                    }
                }
            }
        };

        var pre = function (cur, parent, walker) {
            if (isValidAstNode(cur)) {
                var inclusive = TypeScript.hasFlag(options, GetAstPathOptions.EdgeInclusive) || cur.nodeType === TypeScript.NodeType.Name || cur.nodeType === TypeScript.NodeType.MemberAccessExpression || cur.nodeType === TypeScript.NodeType.TypeRef || pos === script.limChar + script.trailingTriviaWidth;

                var minChar = cur.minChar;
                var limChar = cur.limChar + (useTrailingTriviaAsLimChar ? cur.trailingTriviaWidth : 0) + (inclusive ? 1 : 0);
                if (pos >= minChar && pos < limChar) {
                    var previous = ctx.path.ast();
                    if (previous === null || (cur.minChar >= previous.minChar && (cur.limChar + (useTrailingTriviaAsLimChar ? cur.trailingTriviaWidth : 0)) <= (previous.limChar + (useTrailingTriviaAsLimChar ? previous.trailingTriviaWidth : 0)))) {
                        ctx.path.push(cur);
                    } else {
                    }
                }

                if (pos < limChar) {
                    lookInComments(cur.preComments);
                }
                if (pos >= minChar) {
                    lookInComments(cur.postComments);
                }

                if (!TypeScript.hasFlag(options, GetAstPathOptions.DontPruneSearchBasedOnPosition)) {
                    walker.options.goChildren = (minChar <= pos && pos <= limChar);
                }
            }
            return cur;
        };

        var ctx = new AstPathContext();
        TypeScript.getAstWalkerFactory().walk(script, pre, null, null, ctx);
        return ctx.path;
    }
    TypeScript.getAstPathToPosition = getAstPathToPosition;

    function walkAST(ast, callback) {
        var pre = function (cur, parent, walker) {
            var path = walker.state;
            path.push(cur);
            callback(path, walker);
            return cur;
        };
        var post = function (cur, parent, walker) {
            var path = walker.state;
            path.pop();
            return cur;
        };

        var path = new AstPath();
        TypeScript.getAstWalkerFactory().walk(ast, pre, post, null, path);
    }
    TypeScript.walkAST = walkAST;
})(TypeScript || (TypeScript = {}));
