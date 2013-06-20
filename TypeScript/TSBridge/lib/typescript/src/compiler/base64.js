var TypeScript;
(function (TypeScript) {
    var Base64Format = (function () {
        function Base64Format() {
        }
        Base64Format.encode = function (inValue) {
            if (inValue < 64) {
                return Base64Format.encodedValues.charAt(inValue);
            }
            throw TypeError(inValue + ": not a 64 based value");
        };

        Base64Format.decodeChar = function (inChar) {
            if (inChar.length === 1) {
                return Base64Format.encodedValues.indexOf(inChar);
            } else {
                throw TypeError('"' + inChar + '" must have length 1');
            }
        };
        Base64Format.encodedValues = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        return Base64Format;
    })();

    var Base64VLQFormat = (function () {
        function Base64VLQFormat() {
        }
        Base64VLQFormat.encode = function (inValue) {
            if (inValue < 0) {
                inValue = ((-inValue) << 1) + 1;
            } else {
                inValue = inValue << 1;
            }

            var encodedStr = "";
            do {
                var currentDigit = inValue & 31;
                inValue = inValue >> 5;
                if (inValue > 0) {
                    currentDigit = currentDigit | 32;
                }
                encodedStr = encodedStr + Base64Format.encode(currentDigit);
            } while(inValue > 0);

            return encodedStr;
        };

        Base64VLQFormat.decode = function (inString) {
            var result = 0;
            var negative = false;

            var shift = 0;
            for (var i = 0; i < inString.length; i++) {
                var byte = Base64Format.decodeChar(inString[i]);
                if (i === 0) {
                    if ((byte & 1) === 1) {
                        negative = true;
                    }
                    result = (byte >> 1) & 15;
                } else {
                    result = result | ((byte & 31) << shift);
                }

                shift += (i === 0) ? 4 : 5;

                if ((byte & 32) === 32) {
                } else {
                    return { value: negative ? -(result) : result, rest: inString.substr(i + 1) };
                }
            }

            throw new Error('Base64 value "' + inString + '" finished with a continuation bit');
        };
        return Base64VLQFormat;
    })();
    TypeScript.Base64VLQFormat = Base64VLQFormat;
})(TypeScript || (TypeScript = {}));
