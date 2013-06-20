var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var TextSnapshot = (function () {
            function TextSnapshot(snapshot) {
                this.snapshot = snapshot;
                this.lines = [];
            }
            TextSnapshot.prototype.getText = function (span) {
                return this.snapshot.substr(span.start(), span.length(), false);
            };

            TextSnapshot.prototype.getLineNumberFromPosition = function (position) {
                return this.snapshot.lineMap().getLineNumberFromPosition(position);
            };

            TextSnapshot.prototype.getLineFromPosition = function (position) {
                var lineNumber = this.getLineNumberFromPosition(position);
                return this.getLineFromLineNumber(lineNumber);
            };

            TextSnapshot.prototype.getLineFromLineNumber = function (lineNumber) {
                var line = this.lines[lineNumber];
                if (line === undefined) {
                    line = this.getLineFromLineNumberWorker(lineNumber);
                    this.lines[lineNumber] = line;
                }
                return line;
            };

            TextSnapshot.prototype.getLineFromLineNumberWorker = function (lineNumber) {
                var lineMap = this.snapshot.lineMap().lineStarts();
                var lineMapIndex = lineNumber;
                if (lineMapIndex < 0 || lineMapIndex >= lineMap.length)
                    throw new Error("invalid line number (" + lineMapIndex + ")");
                var start = lineMap[lineMapIndex];

                var end;
                var endIncludingLineBreak;
                var lineBreak = "";
                if (lineMapIndex == lineMap.length) {
                    end = endIncludingLineBreak = this.snapshot.length();
                } else {
                    endIncludingLineBreak = (lineMapIndex >= lineMap.length - 1 ? this.snapshot.length() : lineMap[lineMapIndex + 1]);
                    for (var p = endIncludingLineBreak - 1; p >= start; p--) {
                        var c = this.snapshot.substr(p, 1, false);

                        if (c != "\r" && c != "\n") {
                            break;
                        }
                    }
                    end = p + 1;
                    lineBreak = this.snapshot.substr(end, endIncludingLineBreak - end, false);
                }
                var result = new Formatting.TextSnapshotLine(this, lineNumber, start, end, lineBreak);
                return result;
            };
            return TextSnapshot;
        })();
        Formatting.TextSnapshot = TextSnapshot;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
