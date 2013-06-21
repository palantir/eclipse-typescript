var TypeScript;
(function (TypeScript) {
    var MathPrototype = (function () {
        function MathPrototype() {
        }
        MathPrototype.max = function (a, b) {
            return a >= b ? a : b;
        };

        MathPrototype.min = function (a, b) {
            return a <= b ? a : b;
        };
        return MathPrototype;
    })();
    TypeScript.MathPrototype = MathPrototype;
})(TypeScript || (TypeScript = {}));
