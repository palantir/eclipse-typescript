var TypeScript;
(function (TypeScript) {
    var Debug = (function () {
        function Debug() {
        }
        Debug.assert = function (expression, message) {
            if (!expression) {
                throw new Error("Debug Failure. False expression: " + (message ? message : ""));
            }
        };
        return Debug;
    })();
    TypeScript.Debug = Debug;
})(TypeScript || (TypeScript = {}));
