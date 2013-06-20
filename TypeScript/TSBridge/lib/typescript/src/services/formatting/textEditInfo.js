var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var TextEditInfo = (function () {
            function TextEditInfo(position, length, replaceWith) {
                this.position = position;
                this.length = length;
                this.replaceWith = replaceWith;
            }
            TextEditInfo.prototype.toString = function () {
                return "[ position: " + this.position + ", length: " + this.length + ", replaceWith: '" + this.replaceWith + "' ]";
            };
            return TextEditInfo;
        })();
        Formatting.TextEditInfo = TextEditInfo;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
