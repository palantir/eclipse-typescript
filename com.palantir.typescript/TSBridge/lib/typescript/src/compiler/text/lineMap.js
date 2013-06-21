var TypeScript;
(function (TypeScript) {
    var LineMap = (function () {
        function LineMap(_lineStarts, length) {
            this._lineStarts = _lineStarts;
            this.length = length;
        }
        LineMap.prototype.toJSON = function (key) {
            return { lineStarts: this._lineStarts, length: this.length };
        };

        LineMap.prototype.equals = function (other) {
            return this.length === other.length && TypeScript.ArrayUtilities.sequenceEquals(this.lineStarts(), other.lineStarts(), function (v1, v2) {
                return v1 === v2;
            });
        };

        LineMap.prototype.lineStarts = function () {
            return this._lineStarts;
        };

        LineMap.prototype.lineCount = function () {
            return this.lineStarts().length;
        };

        LineMap.prototype.getPosition = function (line, character) {
            return this.lineStarts()[line] + character;
        };

        LineMap.prototype.getLineNumberFromPosition = function (position) {
            if (position < 0 || position > this.length) {
                throw TypeScript.Errors.argumentOutOfRange("position");
            }

            if (position === this.length) {
                return this.lineCount() - 1;
            }

            var lineNumber = TypeScript.ArrayUtilities.binarySearch(this.lineStarts(), position);
            if (lineNumber < 0) {
                lineNumber = (~lineNumber) - 1;
            }

            return lineNumber;
        };

        LineMap.prototype.getLineStartPosition = function (lineNumber) {
            return this.lineStarts()[lineNumber];
        };

        LineMap.prototype.fillLineAndCharacterFromPosition = function (position, lineAndCharacter) {
            if (position < 0 || position > this.length) {
                throw TypeScript.Errors.argumentOutOfRange("position");
            }

            var lineNumber = this.getLineNumberFromPosition(position);
            lineAndCharacter.line = lineNumber;
            lineAndCharacter.character = position - this.lineStarts()[lineNumber];
        };

        LineMap.prototype.getLineAndCharacterFromPosition = function (position) {
            if (position < 0 || position > this.length) {
                throw TypeScript.Errors.argumentOutOfRange("position");
            }

            var lineNumber = this.getLineNumberFromPosition(position);

            return new TypeScript.LineAndCharacter(lineNumber, position - this.lineStarts()[lineNumber]);
        };

        LineMap.fromSimpleText = function (text) {
            var lineStarts = TypeScript.TextUtilities.parseLineStarts(text);

            return new LineMap(lineStarts, text.length());
        };

        LineMap.fromScriptSnapshot = function (scriptSnapshot) {
            return new LineMap(scriptSnapshot.getLineStartPositions(), scriptSnapshot.getLength());
        };

        LineMap.fromString = function (text) {
            return LineMap.fromSimpleText(TypeScript.SimpleText.fromString(text));
        };
        LineMap.empty = new LineMap([0], 0);
        return LineMap;
    })();
    TypeScript.LineMap = LineMap;
})(TypeScript || (TypeScript = {}));
