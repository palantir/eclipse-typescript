var TypeScript;
(function (TypeScript) {
    var CharacterInfo = (function () {
        function CharacterInfo() {
        }
        CharacterInfo.isDecimalDigit = function (c) {
            return c >= TypeScript.CharacterCodes._0 && c <= TypeScript.CharacterCodes._9;
        };

        CharacterInfo.isHexDigit = function (c) {
            return CharacterInfo.isDecimalDigit(c) || (c >= TypeScript.CharacterCodes.A && c <= TypeScript.CharacterCodes.F) || (c >= TypeScript.CharacterCodes.a && c <= TypeScript.CharacterCodes.f);
        };

        CharacterInfo.hexValue = function (c) {
            return CharacterInfo.isDecimalDigit(c) ? (c - TypeScript.CharacterCodes._0) : (c >= TypeScript.CharacterCodes.A && c <= TypeScript.CharacterCodes.F) ? c - TypeScript.CharacterCodes.A + 10 : c - TypeScript.CharacterCodes.a + 10;
        };

        CharacterInfo.isWhitespace = function (ch) {
            switch (ch) {
                case TypeScript.CharacterCodes.space:
                case TypeScript.CharacterCodes.nonBreakingSpace:
                case TypeScript.CharacterCodes.enQuad:
                case TypeScript.CharacterCodes.emQuad:
                case TypeScript.CharacterCodes.enSpace:
                case TypeScript.CharacterCodes.emSpace:
                case TypeScript.CharacterCodes.threePerEmSpace:
                case TypeScript.CharacterCodes.fourPerEmSpace:
                case TypeScript.CharacterCodes.sixPerEmSpace:
                case TypeScript.CharacterCodes.figureSpace:
                case TypeScript.CharacterCodes.punctuationSpace:
                case TypeScript.CharacterCodes.thinSpace:
                case TypeScript.CharacterCodes.hairSpace:
                case TypeScript.CharacterCodes.zeroWidthSpace:
                case TypeScript.CharacterCodes.narrowNoBreakSpace:
                case TypeScript.CharacterCodes.ideographicSpace:

                case TypeScript.CharacterCodes.tab:
                case TypeScript.CharacterCodes.verticalTab:
                case TypeScript.CharacterCodes.formFeed:
                case TypeScript.CharacterCodes.byteOrderMark:
                    return true;
            }

            return false;
        };

        CharacterInfo.isLineTerminator = function (ch) {
            switch (ch) {
                case TypeScript.CharacterCodes.carriageReturn:
                case TypeScript.CharacterCodes.lineFeed:
                case TypeScript.CharacterCodes.paragraphSeparator:
                case TypeScript.CharacterCodes.lineSeparator:
                    return true;
            }

            return false;
        };
        return CharacterInfo;
    })();
    TypeScript.CharacterInfo = CharacterInfo;
})(TypeScript || (TypeScript = {}));
