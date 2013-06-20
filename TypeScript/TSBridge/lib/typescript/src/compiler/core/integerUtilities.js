var TypeScript;
(function (TypeScript) {
    var IntegerUtilities = (function () {
        function IntegerUtilities() {
        }
        IntegerUtilities.integerDivide = function (numerator, denominator) {
            return (numerator / denominator) >> 0;
        };

        IntegerUtilities.integerMultiplyLow32Bits = function (n1, n2) {
            var n1Low16 = n1 & 0x0000ffff;
            var n1High16 = n1 >>> 16;

            var n2Low16 = n2 & 0x0000ffff;
            var n2High16 = n2 >>> 16;

            var resultLow32 = (((n1 & 0xffff0000) * n2) >>> 0) + (((n1 & 0x0000ffff) * n2) >>> 0) >>> 0;
            return resultLow32;
        };

        IntegerUtilities.integerMultiplyHigh32Bits = function (n1, n2) {
            var n1Low16 = n1 & 0x0000ffff;
            var n1High16 = n1 >>> 16;

            var n2Low16 = n2 & 0x0000ffff;
            var n2High16 = n2 >>> 16;

            var resultHigh32 = n1High16 * n2High16 + ((((n1Low16 * n2Low16) >>> 17) + n1Low16 * n2High16) >>> 15);
            return resultHigh32;
        };
        return IntegerUtilities;
    })();
    TypeScript.IntegerUtilities = IntegerUtilities;
})(TypeScript || (TypeScript = {}));
