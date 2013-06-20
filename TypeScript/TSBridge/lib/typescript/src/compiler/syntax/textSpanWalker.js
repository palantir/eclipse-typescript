var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var TextSpanWalker = (function (_super) {
        __extends(TextSpanWalker, _super);
        function TextSpanWalker(textSpan) {
            _super.call(this);
            this.textSpan = textSpan;
            this._position = 0;
        }
        TextSpanWalker.prototype.visitToken = function (token) {
            this._position += token.fullWidth();
        };

        TextSpanWalker.prototype.visitNode = function (node) {
            var nodeSpan = new TypeScript.TextSpan(this.position(), node.fullWidth());

            if (nodeSpan.intersectsWithTextSpan(this.textSpan)) {
                node.accept(this);
            } else {
                this._position += node.fullWidth();
            }
        };

        TextSpanWalker.prototype.position = function () {
            return this._position;
        };
        return TextSpanWalker;
    })(TypeScript.SyntaxWalker);
})(TypeScript || (TypeScript = {}));
