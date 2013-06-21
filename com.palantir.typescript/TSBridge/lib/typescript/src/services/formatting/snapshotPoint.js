var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var SnapshotPoint = (function () {
            function SnapshotPoint(snapshot, position) {
                this.snapshot = snapshot;
                this.position = position;
            }
            SnapshotPoint.prototype.getContainingLine = function () {
                return this.snapshot.getLineFromPosition(this.position);
            };
            SnapshotPoint.prototype.add = function (offset) {
                return new SnapshotPoint(this.snapshot, this.position + offset);
            };
            return SnapshotPoint;
        })();
        Formatting.SnapshotPoint = SnapshotPoint;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
