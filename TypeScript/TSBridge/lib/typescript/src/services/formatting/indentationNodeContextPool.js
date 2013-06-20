var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var IndentationNodeContextPool = (function () {
            function IndentationNodeContextPool() {
                this.nodes = [];
            }
            IndentationNodeContextPool.prototype.getNode = function (parent, node, fullStart, indentationLevel, childIndentationLevelDelta) {
                if (this.nodes.length > 0) {
                    var cachedNode = this.nodes.pop();
                    cachedNode.update(parent, node, fullStart, indentationLevel, childIndentationLevelDelta);
                    return cachedNode;
                }

                return new Formatting.IndentationNodeContext(parent, node, fullStart, indentationLevel, childIndentationLevelDelta);
            };

            IndentationNodeContextPool.prototype.releaseNode = function (node, recursive) {
                if (typeof recursive === "undefined") { recursive = false; }
                this.nodes.push(node);

                if (recursive) {
                    var parent = node.parent();
                    if (parent) {
                        this.releaseNode(parent, recursive);
                    }
                }
            };
            return IndentationNodeContextPool;
        })();
        Formatting.IndentationNodeContextPool = IndentationNodeContextPool;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
