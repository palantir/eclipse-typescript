var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var IdentifierWalker = (function (_super) {
        __extends(IdentifierWalker, _super);
        function IdentifierWalker(list) {
            _super.call(this);
            this.list = list;
        }
        IdentifierWalker.prototype.visitToken = function (token) {
            this.list[token.text()] = true;
        };
        return IdentifierWalker;
    })(TypeScript.SyntaxWalker);
    TypeScript.IdentifierWalker = IdentifierWalker;
})(TypeScript || (TypeScript = {}));
