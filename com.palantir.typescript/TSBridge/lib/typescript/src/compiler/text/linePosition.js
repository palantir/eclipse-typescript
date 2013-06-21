var TypeScript;
(function (TypeScript) {
    var LineAndCharacter = (function () {
        function LineAndCharacter(line, character) {
            this._line = 0;
            this._character = 0;
            if (line < 0) {
                throw TypeScript.Errors.argumentOutOfRange("line");
            }

            if (character < 0) {
                throw TypeScript.Errors.argumentOutOfRange("character");
            }

            this._line = line;
            this._character = character;
        }
        LineAndCharacter.prototype.line = function () {
            return this._line;
        };

        LineAndCharacter.prototype.character = function () {
            return this._character;
        };
        return LineAndCharacter;
    })();
    TypeScript.LineAndCharacter = LineAndCharacter;
})(TypeScript || (TypeScript = {}));
