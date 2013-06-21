var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var PositionTrackingWalker = (function (_super) {
        __extends(PositionTrackingWalker, _super);
        function PositionTrackingWalker() {
            _super.apply(this, arguments);
            this._position = 0;
        }
        PositionTrackingWalker.prototype.visitToken = function (token) {
            this._position += token.fullWidth();
        };

        PositionTrackingWalker.prototype.position = function () {
            return this._position;
        };

        PositionTrackingWalker.prototype.skip = function (element) {
            this._position += element.fullWidth();
        };
        return PositionTrackingWalker;
    })(TypeScript.SyntaxWalker);
    TypeScript.PositionTrackingWalker = PositionTrackingWalker;
})(TypeScript || (TypeScript = {}));
