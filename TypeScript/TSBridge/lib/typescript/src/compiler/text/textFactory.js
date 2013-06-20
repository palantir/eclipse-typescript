var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    (function (TextFactory) {
        function getStartAndLengthOfLineBreakEndingAt(text, index, info) {
            var c = text.charCodeAt(index);
            if (c === TypeScript.CharacterCodes.lineFeed) {
                if (index > 0 && text.charCodeAt(index - 1) === TypeScript.CharacterCodes.carriageReturn) {
                    info.startPosition = index - 1;
                    info.length = 2;
                } else {
                    info.startPosition = index;
                    info.length = 1;
                }
            } else if (TypeScript.TextUtilities.isAnyLineBreakCharacter(c)) {
                info.startPosition = index;
                info.length = 1;
            } else {
                info.startPosition = index + 1;
                info.length = 0;
            }
        }

        var LinebreakInfo = (function () {
            function LinebreakInfo(startPosition, length) {
                this.startPosition = startPosition;
                this.length = length;
            }
            return LinebreakInfo;
        })();

        var TextLine = (function () {
            function TextLine(text, body, lineBreakLength, lineNumber) {
                this._text = null;
                this._textSpan = null;
                TypeScript.Contract.throwIfNull(text);
                TypeScript.Contract.throwIfFalse(lineBreakLength >= 0);
                TypeScript.Contract.requires(lineNumber >= 0);
                this._text = text;
                this._textSpan = body;
                this._lineBreakLength = lineBreakLength;
                this._lineNumber = lineNumber;
            }
            TextLine.prototype.start = function () {
                return this._textSpan.start();
            };

            TextLine.prototype.end = function () {
                return this._textSpan.end();
            };

            TextLine.prototype.endIncludingLineBreak = function () {
                return this.end() + this._lineBreakLength;
            };

            TextLine.prototype.extent = function () {
                return this._textSpan;
            };

            TextLine.prototype.extentIncludingLineBreak = function () {
                return TypeScript.TextSpan.fromBounds(this.start(), this.endIncludingLineBreak());
            };

            TextLine.prototype.toString = function () {
                return this._text.toString(this._textSpan);
            };

            TextLine.prototype.lineNumber = function () {
                return this._lineNumber;
            };
            return TextLine;
        })();

        var TextBase = (function () {
            function TextBase() {
                this.lazyLineStarts = null;
                this.linebreakInfo = new LinebreakInfo(0, 0);
                this.lastLineFoundForPosition = null;
            }
            TextBase.prototype.length = function () {
                throw TypeScript.Errors.abstract();
            };

            TextBase.prototype.charCodeAt = function (position) {
                throw TypeScript.Errors.abstract();
            };

            TextBase.prototype.checkSubSpan = function (span) {
                if (span.start() < 0 || span.start() > this.length() || span.end() > this.length()) {
                    throw TypeScript.Errors.argumentOutOfRange("span");
                }
            };

            TextBase.prototype.toString = function (span) {
                if (typeof span === "undefined") { span = null; }
                throw TypeScript.Errors.abstract();
            };

            TextBase.prototype.subText = function (span) {
                this.checkSubSpan(span);

                return new SubText(this, span);
            };

            TextBase.prototype.substr = function (start, length, intern) {
                throw TypeScript.Errors.abstract();
            };

            TextBase.prototype.copyTo = function (sourceIndex, destination, destinationIndex, count) {
                throw TypeScript.Errors.abstract();
            };

            TextBase.prototype.lineCount = function () {
                return this.lineStarts().length;
            };

            TextBase.prototype.lines = function () {
                var lines = [];

                var length = this.lineCount();
                for (var i = 0; i < length; ++i) {
                    lines[i] = this.getLineFromLineNumber(i);
                }

                return lines;
            };

            TextBase.prototype.lineMap = function () {
                return new TypeScript.LineMap(this.lineStarts(), this.length());
            };

            TextBase.prototype.lineStarts = function () {
                if (this.lazyLineStarts === null) {
                    this.lazyLineStarts = TypeScript.TextUtilities.parseLineStarts(this);
                }

                return this.lazyLineStarts;
            };

            TextBase.prototype.getLineFromLineNumber = function (lineNumber) {
                var lineStarts = this.lineStarts();

                if (lineNumber < 0 || lineNumber >= lineStarts.length) {
                    throw TypeScript.Errors.argumentOutOfRange("lineNumber");
                }

                var first = lineStarts[lineNumber];
                if (lineNumber === lineStarts.length - 1) {
                    return new TextLine(this, new TypeScript.TextSpan(first, this.length() - first), 0, lineNumber);
                } else {
                    getStartAndLengthOfLineBreakEndingAt(this, lineStarts[lineNumber + 1] - 1, this.linebreakInfo);
                    return new TextLine(this, new TypeScript.TextSpan(first, this.linebreakInfo.startPosition - first), this.linebreakInfo.length, lineNumber);
                }
            };

            TextBase.prototype.getLineFromPosition = function (position) {
                var lastFound = this.lastLineFoundForPosition;
                if (lastFound !== null && lastFound.start() <= position && lastFound.endIncludingLineBreak() > position) {
                    return lastFound;
                }

                var lineNumber = this.getLineNumberFromPosition(position);

                var result = this.getLineFromLineNumber(lineNumber);
                this.lastLineFoundForPosition = result;
                return result;
            };

            TextBase.prototype.getLineNumberFromPosition = function (position) {
                if (position < 0 || position > this.length()) {
                    throw TypeScript.Errors.argumentOutOfRange("position");
                }

                if (position === this.length()) {
                    return this.lineCount() - 1;
                }

                var lineNumber = TypeScript.ArrayUtilities.binarySearch(this.lineStarts(), position);
                if (lineNumber < 0) {
                    lineNumber = (~lineNumber) - 1;
                }

                return lineNumber;
            };

            TextBase.prototype.getLinePosition = function (position) {
                if (position < 0 || position > this.length()) {
                    throw TypeScript.Errors.argumentOutOfRange("position");
                }

                var lineNumber = this.getLineNumberFromPosition(position);

                return new TypeScript.LineAndCharacter(lineNumber, position - this.lineStarts()[lineNumber]);
            };
            return TextBase;
        })();

        var SubText = (function (_super) {
            __extends(SubText, _super);
            function SubText(text, span) {
                _super.call(this);

                if (text === null) {
                    throw TypeScript.Errors.argumentNull("text");
                }

                if (span.start() < 0 || span.start() >= text.length() || span.end() < 0 || span.end() > text.length()) {
                    throw TypeScript.Errors.argument("span");
                }

                this.text = text;
                this.span = span;
            }
            SubText.prototype.length = function () {
                return this.span.length();
            };

            SubText.prototype.charCodeAt = function (position) {
                if (position < 0 || position > this.length()) {
                    throw TypeScript.Errors.argumentOutOfRange("position");
                }

                return this.text.charCodeAt(this.span.start() + position);
            };

            SubText.prototype.subText = function (span) {
                this.checkSubSpan(span);

                return new SubText(this.text, this.getCompositeSpan(span.start(), span.length()));
            };

            SubText.prototype.copyTo = function (sourceIndex, destination, destinationIndex, count) {
                var span = this.getCompositeSpan(sourceIndex, count);
                this.text.copyTo(span.start(), destination, destinationIndex, span.length());
            };

            SubText.prototype.getCompositeSpan = function (start, length) {
                var compositeStart = TypeScript.MathPrototype.min(this.text.length(), this.span.start() + start);
                var compositeEnd = TypeScript.MathPrototype.min(this.text.length(), compositeStart + length);
                return new TypeScript.TextSpan(compositeStart, compositeEnd - compositeStart);
            };
            return SubText;
        })(TextBase);

        var StringText = (function (_super) {
            __extends(StringText, _super);
            function StringText(data) {
                _super.call(this);
                this.source = null;

                if (data === null) {
                    throw TypeScript.Errors.argumentNull("data");
                }

                this.source = data;
            }
            StringText.prototype.length = function () {
                return this.source.length;
            };

            StringText.prototype.charCodeAt = function (position) {
                if (position < 0 || position >= this.source.length) {
                    throw TypeScript.Errors.argumentOutOfRange("position");
                }

                return this.source.charCodeAt(position);
            };

            StringText.prototype.substr = function (start, length, intern) {
                return this.source.substr(start, length);
            };

            StringText.prototype.toString = function (span) {
                if (typeof span === "undefined") { span = null; }
                if (span === null) {
                    span = new TypeScript.TextSpan(0, this.length());
                }

                this.checkSubSpan(span);

                if (span.start() === 0 && span.length() === this.length()) {
                    return this.source;
                }

                return this.source.substr(span.start(), span.length());
            };

            StringText.prototype.copyTo = function (sourceIndex, destination, destinationIndex, count) {
                TypeScript.StringUtilities.copyTo(this.source, sourceIndex, destination, destinationIndex, count);
            };
            return StringText;
        })(TextBase);

        function createText(value) {
            return new StringText(value);
        }
        TextFactory.createText = createText;
    })(TypeScript.TextFactory || (TypeScript.TextFactory = {}));
    var TextFactory = TypeScript.TextFactory;
})(TypeScript || (TypeScript = {}));

var TypeScript;
(function (TypeScript) {
    (function (SimpleText) {
        var SimpleSubText = (function () {
            function SimpleSubText(text, span) {
                this.text = null;
                this.span = null;
                if (text === null) {
                    throw TypeScript.Errors.argumentNull("text");
                }

                if (span.start() < 0 || span.start() >= text.length() || span.end() < 0 || span.end() > text.length()) {
                    throw TypeScript.Errors.argument("span");
                }

                this.text = text;
                this.span = span;
            }
            SimpleSubText.prototype.checkSubSpan = function (span) {
                if (span.start() < 0 || span.start() > this.length() || span.end() > this.length()) {
                    throw TypeScript.Errors.argumentOutOfRange("span");
                }
            };

            SimpleSubText.prototype.checkSubPosition = function (position) {
                if (position < 0 || position >= this.length()) {
                    throw TypeScript.Errors.argumentOutOfRange("position");
                }
            };

            SimpleSubText.prototype.length = function () {
                return this.span.length();
            };

            SimpleSubText.prototype.subText = function (span) {
                this.checkSubSpan(span);

                return new SimpleSubText(this.text, this.getCompositeSpan(span.start(), span.length()));
            };

            SimpleSubText.prototype.copyTo = function (sourceIndex, destination, destinationIndex, count) {
                var span = this.getCompositeSpan(sourceIndex, count);
                this.text.copyTo(span.start(), destination, destinationIndex, span.length());
            };

            SimpleSubText.prototype.substr = function (start, length, intern) {
                var span = this.getCompositeSpan(start, length);
                return this.text.substr(span.start(), span.length(), intern);
            };

            SimpleSubText.prototype.getCompositeSpan = function (start, length) {
                var compositeStart = TypeScript.MathPrototype.min(this.text.length(), this.span.start() + start);
                var compositeEnd = TypeScript.MathPrototype.min(this.text.length(), compositeStart + length);
                return new TypeScript.TextSpan(compositeStart, compositeEnd - compositeStart);
            };

            SimpleSubText.prototype.charCodeAt = function (index) {
                this.checkSubPosition(index);
                return this.text.charCodeAt(this.span.start() + index);
            };

            SimpleSubText.prototype.lineMap = function () {
                return TypeScript.LineMap.fromSimpleText(this);
            };
            return SimpleSubText;
        })();

        var SimpleStringText = (function () {
            function SimpleStringText(value) {
                this.value = value;
            }
            SimpleStringText.prototype.length = function () {
                return this.value.length;
            };

            SimpleStringText.prototype.copyTo = function (sourceIndex, destination, destinationIndex, count) {
                TypeScript.StringUtilities.copyTo(this.value, sourceIndex, destination, destinationIndex, count);
            };

            SimpleStringText.prototype.substr = function (start, length, intern) {
                if (intern) {
                    var array = length <= SimpleStringText.charArray.length ? SimpleStringText.charArray : TypeScript.ArrayUtilities.createArray(length, 0);
                    this.copyTo(start, array, 0, length);
                    return TypeScript.Collections.DefaultStringTable.addCharArray(array, 0, length);
                }

                return this.value.substr(start, length);
            };

            SimpleStringText.prototype.subText = function (span) {
                return new SimpleSubText(this, span);
            };

            SimpleStringText.prototype.charCodeAt = function (index) {
                return this.value.charCodeAt(index);
            };

            SimpleStringText.prototype.lineMap = function () {
                return TypeScript.LineMap.fromSimpleText(this);
            };
            SimpleStringText.charArray = TypeScript.ArrayUtilities.createArray(1024, 0);
            return SimpleStringText;
        })();

        var SimpleScriptSnapshotText = (function () {
            function SimpleScriptSnapshotText(scriptSnapshot) {
                this.scriptSnapshot = scriptSnapshot;
            }
            SimpleScriptSnapshotText.prototype.charCodeAt = function (index) {
                return this.scriptSnapshot.getText(index, index + 1).charCodeAt(0);
            };

            SimpleScriptSnapshotText.prototype.length = function () {
                return this.scriptSnapshot.getLength();
            };

            SimpleScriptSnapshotText.prototype.copyTo = function (sourceIndex, destination, destinationIndex, count) {
                var text = this.scriptSnapshot.getText(sourceIndex, sourceIndex + count);
                TypeScript.StringUtilities.copyTo(text, 0, destination, destinationIndex, count);
            };

            SimpleScriptSnapshotText.prototype.substr = function (start, length, intern) {
                return this.scriptSnapshot.getText(start, start + length);
            };

            SimpleScriptSnapshotText.prototype.subText = function (span) {
                return new SimpleSubText(this, span);
            };

            SimpleScriptSnapshotText.prototype.lineMap = function () {
                var lineStartPositions = this.scriptSnapshot.getLineStartPositions();
                return new TypeScript.LineMap(lineStartPositions, this.length());
            };
            return SimpleScriptSnapshotText;
        })();

        function fromString(value) {
            return new SimpleStringText(value);
        }
        SimpleText.fromString = fromString;

        function fromScriptSnapshot(scriptSnapshot) {
            return new SimpleScriptSnapshotText(scriptSnapshot);
        }
        SimpleText.fromScriptSnapshot = fromScriptSnapshot;
    })(TypeScript.SimpleText || (TypeScript.SimpleText = {}));
    var SimpleText = TypeScript.SimpleText;
})(TypeScript || (TypeScript = {}));
