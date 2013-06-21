var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var RuleDescriptor = (function () {
            function RuleDescriptor(LeftTokenRange, RightTokenRange) {
                this.LeftTokenRange = LeftTokenRange;
                this.RightTokenRange = RightTokenRange;
            }
            RuleDescriptor.prototype.toString = function () {
                return "[leftRange=" + this.LeftTokenRange + "," + "rightRange=" + this.RightTokenRange + "]";
            };

            RuleDescriptor.create1 = function (left, right) {
                return RuleDescriptor.create4(Formatting.Shared.TokenRange.FromToken(left), Formatting.Shared.TokenRange.FromToken(right));
            };

            RuleDescriptor.create2 = function (left, right) {
                return RuleDescriptor.create4(left, Formatting.Shared.TokenRange.FromToken(right));
            };

            RuleDescriptor.create3 = function (left, right) {
                return RuleDescriptor.create4(Formatting.Shared.TokenRange.FromToken(left), right);
            };

            RuleDescriptor.create4 = function (left, right) {
                return new RuleDescriptor(left, right);
            };
            return RuleDescriptor;
        })();
        Formatting.RuleDescriptor = RuleDescriptor;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
