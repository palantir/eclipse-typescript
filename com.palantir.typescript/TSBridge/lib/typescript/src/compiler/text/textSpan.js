var TypeScript;
(function (TypeScript) {
    var TextSpan = (function () {
        function TextSpan(start, length) {
            if (start < 0) {
                TypeScript.Errors.argument("start");
            }

            if (start + length < start) {
                throw new Error("length");
            }

            this._start = start;
            this._length = length;
        }
        TextSpan.prototype.start = function () {
            return this._start;
        };

        TextSpan.prototype.length = function () {
            return this._length;
        };

        TextSpan.prototype.end = function () {
            return this._start + this._length;
        };

        TextSpan.prototype.isEmpty = function () {
            return this._length === 0;
        };

        TextSpan.prototype.containsPosition = function (position) {
            return position >= this._start && position < this.end();
        };

        TextSpan.prototype.containsTextSpan = function (span) {
            return span._start >= this._start && span.end() <= this.end();
        };

        TextSpan.prototype.overlapsWith = function (span) {
            var overlapStart = TypeScript.MathPrototype.max(this._start, span._start);
            var overlapEnd = TypeScript.MathPrototype.min(this.end(), span.end());

            return overlapStart < overlapEnd;
        };

        TextSpan.prototype.overlap = function (span) {
            var overlapStart = TypeScript.MathPrototype.max(this._start, span._start);
            var overlapEnd = TypeScript.MathPrototype.min(this.end(), span.end());

            if (overlapStart < overlapEnd) {
                return TextSpan.fromBounds(overlapStart, overlapEnd);
            }

            return null;
        };

        TextSpan.prototype.intersectsWithTextSpan = function (span) {
            return span._start <= this.end() && span.end() >= this._start;
        };

        TextSpan.prototype.intersectsWith = function (start, length) {
            var end = start + length;
            return start <= this.end() && end >= this._start;
        };

        TextSpan.prototype.intersectsWithPosition = function (position) {
            return position <= this.end() && position >= this._start;
        };

        TextSpan.prototype.intersection = function (span) {
            var intersectStart = TypeScript.MathPrototype.max(this._start, span._start);
            var intersectEnd = TypeScript.MathPrototype.min(this.end(), span.end());

            if (intersectStart <= intersectEnd) {
                return TextSpan.fromBounds(intersectStart, intersectEnd);
            }

            return null;
        };

        TextSpan.fromBounds = function (start, end) {
            TypeScript.Contract.requires(start >= 0);
            TypeScript.Contract.requires(end - start >= 0);
            return new TextSpan(start, end - start);
        };
        return TextSpan;
    })();
    TypeScript.TextSpan = TextSpan;
})(TypeScript || (TypeScript = {}));
