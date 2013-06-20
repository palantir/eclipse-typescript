var TypeScript;
(function (TypeScript) {
    (function (AstWalkerWithDetailCallback) {
        function walk(script, callback) {
            var pre = function (cur, parent) {
                walker.options.goChildren = AstWalkerCallback(true, cur, callback);
                return cur;
            };

            var post = function (cur, parent) {
                AstWalkerCallback(false, cur, callback);
                return cur;
            };

            var walker = TypeScript.getAstWalkerFactory().getWalker(pre, post);
            walker.walk(script, null);
        }
        AstWalkerWithDetailCallback.walk = walk;

        function AstWalkerCallback(pre, ast, callback) {
            var nodeType = ast.nodeType;
            var callbackString = TypeScript.NodeType[nodeType] + "Callback";
            if (callback[callbackString]) {
                return callback[callbackString](pre, ast);
            }

            if (callback.DefaultCallback) {
                return callback.DefaultCallback(pre, ast);
            }

            return true;
        }
    })(TypeScript.AstWalkerWithDetailCallback || (TypeScript.AstWalkerWithDetailCallback = {}));
    var AstWalkerWithDetailCallback = TypeScript.AstWalkerWithDetailCallback;
})(TypeScript || (TypeScript = {}));
