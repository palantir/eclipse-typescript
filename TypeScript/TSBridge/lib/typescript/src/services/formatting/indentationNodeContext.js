var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var IndentationNodeContext = (function () {
            function IndentationNodeContext(parent, node, fullStart, indentationAmount, childIndentationAmountDelta) {
                this.update(parent, node, fullStart, indentationAmount, childIndentationAmountDelta);
            }
            IndentationNodeContext.prototype.parent = function () {
                return this._parent;
            };

            IndentationNodeContext.prototype.node = function () {
                return this._node;
            };

            IndentationNodeContext.prototype.fullStart = function () {
                return this._fullStart;
            };

            IndentationNodeContext.prototype.fullWidth = function () {
                return this._node.fullWidth();
            };

            IndentationNodeContext.prototype.start = function () {
                return this._fullStart + this._node.leadingTriviaWidth();
            };

            IndentationNodeContext.prototype.end = function () {
                return this._fullStart + this._node.leadingTriviaWidth() + this._node.width();
            };

            IndentationNodeContext.prototype.indentationAmount = function () {
                return this._indentationAmount;
            };

            IndentationNodeContext.prototype.childIndentationAmountDelta = function () {
                return this._childIndentationAmountDelta;
            };

            IndentationNodeContext.prototype.depth = function () {
                return this._depth;
            };

            IndentationNodeContext.prototype.kind = function () {
                return this._node.kind();
            };

            IndentationNodeContext.prototype.hasSkippedOrMissingTokenChild = function () {
                if (this._hasSkippedOrMissingTokenChild === null) {
                    this._hasSkippedOrMissingTokenChild = TypeScript.Syntax.nodeHasSkippedOrMissingTokens(this._node);
                }
                return this._hasSkippedOrMissingTokenChild;
            };

            IndentationNodeContext.prototype.clone = function (pool) {
                var parent = null;
                if (this._parent) {
                    parent = this._parent.clone(pool);
                }
                return pool.getNode(parent, this._node, this._fullStart, this._indentationAmount, this._childIndentationAmountDelta);
            };

            IndentationNodeContext.prototype.update = function (parent, node, fullStart, indentationAmount, childIndentationAmountDelta) {
                this._parent = parent;
                this._node = node;
                this._fullStart = fullStart;
                this._indentationAmount = indentationAmount;
                this._childIndentationAmountDelta = childIndentationAmountDelta;
                this._hasSkippedOrMissingTokenChild = null;

                if (parent) {
                    this._depth = parent.depth() + 1;
                } else {
                    this._depth = 0;
                }
            };
            return IndentationNodeContext;
        })();
        Formatting.IndentationNodeContext = IndentationNodeContext;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
