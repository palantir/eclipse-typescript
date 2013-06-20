var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var RuleOperationContext = (function () {
            function RuleOperationContext() {
                var funcs = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    funcs[_i] = arguments[_i + 0];
                }
                this.customContextChecks = funcs;
            }
            RuleOperationContext.prototype.IsAny = function () {
                 {
                    return this == RuleOperationContext.Any;
                }
            };

            RuleOperationContext.prototype.InContext = function (context) {
                if (this.IsAny()) {
                    return true;
                }

                for (var i = 0, len = this.customContextChecks.length; i < len; i++) {
                    if (!this.customContextChecks[i](context)) {
                        return false;
                    }
                }
                return true;
            };
            RuleOperationContext.Any = new RuleOperationContext();
            return RuleOperationContext;
        })();
        Formatting.RuleOperationContext = RuleOperationContext;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
