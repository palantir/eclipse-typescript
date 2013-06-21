var TypeScript;
(function (TypeScript) {
    (function (ScriptSnapshot) {
        var StringScriptSnapshot = (function () {
            function StringScriptSnapshot(text) {
                this.text = text;
            }
            StringScriptSnapshot.prototype.getText = function (start, end) {
                return this.text.substring(start, end);
            };

            StringScriptSnapshot.prototype.getLength = function () {
                return this.text.length;
            };

            StringScriptSnapshot.prototype.getLineStartPositions = function () {
                return TypeScript.TextUtilities.parseLineStarts(TypeScript.SimpleText.fromString(this.text));
            };

            StringScriptSnapshot.prototype.getTextChangeRangeSinceVersion = function (scriptVersion) {
                throw TypeScript.Errors.notYetImplemented();
            };
            return StringScriptSnapshot;
        })();

        function fromString(text) {
            return new StringScriptSnapshot(text);
        }
        ScriptSnapshot.fromString = fromString;
    })(TypeScript.ScriptSnapshot || (TypeScript.ScriptSnapshot = {}));
    var ScriptSnapshot = TypeScript.ScriptSnapshot;
})(TypeScript || (TypeScript = {}));
