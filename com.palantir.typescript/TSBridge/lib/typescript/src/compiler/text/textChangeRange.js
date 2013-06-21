var TypeScript;
(function (TypeScript) {
    var TextChangeRange = (function () {
        function TextChangeRange(span, newLength) {
            if (newLength < 0) {
                throw TypeScript.Errors.argumentOutOfRange("newLength");
            }

            this._span = span;
            this._newLength = newLength;
        }
        TextChangeRange.prototype.span = function () {
            return this._span;
        };

        TextChangeRange.prototype.newLength = function () {
            return this._newLength;
        };

        TextChangeRange.prototype.newSpan = function () {
            return new TypeScript.TextSpan(this.span().start(), this.newLength());
        };

        TextChangeRange.prototype.isUnchanged = function () {
            return this.span().isEmpty() && this.newLength() === 0;
        };

        TextChangeRange.collapseChangesFromSingleVersion = function (changes) {
            var diff = 0;
            var start = TypeScript.Constants.Max31BitInteger;
            var end = 0;

            for (var i = 0; i < changes.length; i++) {
                var change = changes[i];
                diff += change.newLength() - change.span().length();

                if (change.span().start() < start) {
                    start = change.span().start();
                }

                if (change.span().end() > end) {
                    end = change.span().end();
                }
            }

            if (start > end) {
                return null;
            }

            var combined = TypeScript.TextSpan.fromBounds(start, end);
            var newLen = combined.length() + diff;

            return new TextChangeRange(combined, newLen);
        };

        TextChangeRange.collapseChangesAcrossMultipleVersions = function (changes) {
            if (changes.length === 0) {
                return TextChangeRange.unchanged;
            }

            if (changes.length === 1) {
                return changes[0];
            }

            var change0 = changes[0];

            var oldStartN = change0.span().start();
            var oldEndN = change0.span().end();
            var newEndN = oldStartN + change0.newLength();

            for (var i = 1; i < changes.length; i++) {
                var nextChange = changes[i];

                var oldStart1 = oldStartN;
                var oldEnd1 = oldEndN;
                var newEnd1 = newEndN;

                var oldStart2 = nextChange.span().start();
                var oldEnd2 = nextChange.span().end();
                var newEnd2 = oldStart2 + nextChange.newLength();

                oldStartN = TypeScript.MathPrototype.min(oldStart1, oldStart2);
                oldEndN = TypeScript.MathPrototype.max(oldEnd1, oldEnd1 + (oldEnd2 - newEnd1));
                newEndN = TypeScript.MathPrototype.max(newEnd2, newEnd2 + (newEnd1 - oldEnd2));
            }

            return new TextChangeRange(TypeScript.TextSpan.fromBounds(oldStartN, oldEndN), newEndN - oldStartN);
        };
        TextChangeRange.unchanged = new TextChangeRange(new TypeScript.TextSpan(0, 0), 0);
        return TextChangeRange;
    })();
    TypeScript.TextChangeRange = TextChangeRange;
})(TypeScript || (TypeScript = {}));
