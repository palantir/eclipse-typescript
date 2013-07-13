var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var SingleTokenIndenter = (function (_super) {
            __extends(SingleTokenIndenter, _super);
            function SingleTokenIndenter(indentationPosition, sourceUnit, snapshot, indentFirstToken, options) {
                _super.call(this, new TypeScript.TextSpan(indentationPosition, 1), sourceUnit, snapshot, indentFirstToken, options);
                this.indentationAmount = null;

                this.indentationPosition = indentationPosition;
            }
            SingleTokenIndenter.getIndentationAmount = function (position, sourceUnit, snapshot, options) {
                var walker = new SingleTokenIndenter(position, sourceUnit, snapshot, true, options);
                sourceUnit.accept(walker);
                return walker.indentationAmount;
            };

            SingleTokenIndenter.prototype.indentToken = function (token, indentationAmount, commentIndentationAmount) {
                if (token.fullWidth() === 0 || (this.indentationPosition - this.position() < token.leadingTriviaWidth())) {
                    this.indentationAmount = commentIndentationAmount;
                } else {
                    this.indentationAmount = indentationAmount;
                }
            };
            return SingleTokenIndenter;
        })(Formatting.IndentationTrackingWalker);
        Formatting.SingleTokenIndenter = SingleTokenIndenter;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
