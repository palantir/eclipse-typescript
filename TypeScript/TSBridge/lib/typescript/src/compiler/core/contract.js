var TypeScript;
(function (TypeScript) {
    var Contract = (function () {
        function Contract() {
        }
        Contract.requires = function (expression) {
            if (!expression) {
                throw new Error("Contract violated. False expression.");
            }
        };

        Contract.throwIfFalse = function (expression) {
            if (!expression) {
                throw new Error("Contract violated. False expression.");
            }
        };

        Contract.throwIfNull = function (value) {
            if (value === null) {
                throw new Error("Contract violated. Null value.");
            }
        };
        return Contract;
    })();
    TypeScript.Contract = Contract;
})(TypeScript || (TypeScript = {}));
