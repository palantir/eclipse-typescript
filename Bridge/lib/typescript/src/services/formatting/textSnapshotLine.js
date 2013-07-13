var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var TextSnapshotLine = (function () {
            function TextSnapshotLine(_snapshot, _lineNumber, _start, _end, _lineBreak) {
                this._snapshot = _snapshot;
                this._lineNumber = _lineNumber;
                this._start = _start;
                this._end = _end;
                this._lineBreak = _lineBreak;
            }
            TextSnapshotLine.prototype.snapshot = function () {
                return this._snapshot;
            };

            TextSnapshotLine.prototype.start = function () {
                return new Formatting.SnapshotPoint(this._snapshot, this._start);
            };

            TextSnapshotLine.prototype.startPosition = function () {
                return this._start;
            };

            TextSnapshotLine.prototype.end = function () {
                return new Formatting.SnapshotPoint(this._snapshot, this._end);
            };

            TextSnapshotLine.prototype.endPosition = function () {
                return this._end;
            };

            TextSnapshotLine.prototype.endIncludingLineBreak = function () {
                return new Formatting.SnapshotPoint(this._snapshot, this._end + this._lineBreak.length);
            };

            TextSnapshotLine.prototype.endIncludingLineBreakPosition = function () {
                return this._end + this._lineBreak.length;
            };

            TextSnapshotLine.prototype.length = function () {
                return this._end - this._start;
            };

            TextSnapshotLine.prototype.lineNumber = function () {
                return this._lineNumber;
            };

            TextSnapshotLine.prototype.getText = function () {
                return this._snapshot.getText(TypeScript.TextSpan.fromBounds(this._start, this._end));
            };
            return TextSnapshotLine;
        })();
        Formatting.TextSnapshotLine = TextSnapshotLine;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
