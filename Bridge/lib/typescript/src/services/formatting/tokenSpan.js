var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var TokenSpan = (function (_super) {
            __extends(TokenSpan, _super);
            function TokenSpan(kind, start, length) {
                _super.call(this, start, length);
                this._kind = kind;
            }
            TokenSpan.prototype.kind = function () {
                return this._kind;
            };
            return TokenSpan;
        })(TypeScript.TextSpan);
        Formatting.TokenSpan = TokenSpan;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
