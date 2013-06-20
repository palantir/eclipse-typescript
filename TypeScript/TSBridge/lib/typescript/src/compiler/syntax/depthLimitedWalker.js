var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var DepthLimitedWalker = (function (_super) {
        __extends(DepthLimitedWalker, _super);
        function DepthLimitedWalker(maximumDepth) {
            _super.call(this);
            this._depth = 0;
            this._maximumDepth = 0;
            this._maximumDepth = maximumDepth;
        }
        DepthLimitedWalker.prototype.visitNode = function (node) {
            if (this._depth < this._maximumDepth) {
                this._depth++;
                _super.prototype.visitNode.call(this, node);
                this._depth--;
            } else {
                this.skip(node);
            }
        };
        return DepthLimitedWalker;
    })(TypeScript.PositionTrackingWalker);
    TypeScript.DepthLimitedWalker = DepthLimitedWalker;
})(TypeScript || (TypeScript = {}));
