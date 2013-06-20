var TypeScript;
(function (TypeScript) {
    var StringUtilities = (function () {
        function StringUtilities() {
        }
        StringUtilities.isString = function (value) {
            return Object.prototype.toString.apply(value, []) === '[object String]';
        };

        StringUtilities.fromCharCodeArray = function (array) {
            return String.fromCharCode.apply(null, array);
        };

        StringUtilities.endsWith = function (string, value) {
            return string.substring(string.length - value.length, string.length) === value;
        };

        StringUtilities.startsWith = function (string, value) {
            return string.substr(0, value.length) === value;
        };

        StringUtilities.copyTo = function (source, sourceIndex, destination, destinationIndex, count) {
            for (var i = 0; i < count; i++) {
                destination[destinationIndex + i] = source.charCodeAt(sourceIndex + i);
            }
        };

        StringUtilities.repeat = function (value, count) {
            return Array(count + 1).join(value);
        };

        StringUtilities.stringEquals = function (val1, val2) {
            return val1 === val2;
        };
        return StringUtilities;
    })();
    TypeScript.StringUtilities = StringUtilities;
})(TypeScript || (TypeScript = {}));
