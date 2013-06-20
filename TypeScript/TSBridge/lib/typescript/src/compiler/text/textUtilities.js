var TypeScript;
(function (TypeScript) {
    (function (TextUtilities) {
        function parseLineStarts(text) {
            var length = text.length();

            if (0 === length) {
                var result = [];
                result.push(0);
                return result;
            }

            var position = 0;
            var index = 0;
            var arrayBuilder = [];
            var lineNumber = 0;

            while (index < length) {
                var c = text.charCodeAt(index);
                var lineBreakLength;

                if (c > TypeScript.CharacterCodes.carriageReturn && c <= 127) {
                    index++;
                    continue;
                } else if (c === TypeScript.CharacterCodes.carriageReturn && index + 1 < length && text.charCodeAt(index + 1) === TypeScript.CharacterCodes.lineFeed) {
                    lineBreakLength = 2;
                } else if (c === TypeScript.CharacterCodes.lineFeed) {
                    lineBreakLength = 1;
                } else {
                    lineBreakLength = TextUtilities.getLengthOfLineBreak(text, index);
                }

                if (0 === lineBreakLength) {
                    index++;
                } else {
                    arrayBuilder.push(position);
                    index += lineBreakLength;
                    position = index;
                    lineNumber++;
                }
            }

            arrayBuilder.push(position);

            return arrayBuilder;
        }
        TextUtilities.parseLineStarts = parseLineStarts;

        function getLengthOfLineBreakSlow(text, index, c) {
            if (c === TypeScript.CharacterCodes.carriageReturn) {
                var next = index + 1;
                return (next < text.length()) && TypeScript.CharacterCodes.lineFeed === text.charCodeAt(next) ? 2 : 1;
            } else if (isAnyLineBreakCharacter(c)) {
                return 1;
            } else {
                return 0;
            }
        }
        TextUtilities.getLengthOfLineBreakSlow = getLengthOfLineBreakSlow;

        function getLengthOfLineBreak(text, index) {
            var c = text.charCodeAt(index);

            if (c > TypeScript.CharacterCodes.carriageReturn && c <= 127) {
                return 0;
            }

            return getLengthOfLineBreakSlow(text, index, c);
        }
        TextUtilities.getLengthOfLineBreak = getLengthOfLineBreak;

        function isAnyLineBreakCharacter(c) {
            return c === TypeScript.CharacterCodes.lineFeed || c === TypeScript.CharacterCodes.carriageReturn || c === TypeScript.CharacterCodes.nextLine || c === TypeScript.CharacterCodes.lineSeparator || c === TypeScript.CharacterCodes.paragraphSeparator;
        }
        TextUtilities.isAnyLineBreakCharacter = isAnyLineBreakCharacter;
    })(TypeScript.TextUtilities || (TypeScript.TextUtilities = {}));
    var TextUtilities = TypeScript.TextUtilities;
})(TypeScript || (TypeScript = {}));
