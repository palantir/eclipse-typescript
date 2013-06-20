var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var SyntaxTokenReplacer = (function (_super) {
        __extends(SyntaxTokenReplacer, _super);
        function SyntaxTokenReplacer(token1, token2) {
            _super.call(this);
            this.token1 = token1;
            this.token2 = token2;
        }
        SyntaxTokenReplacer.prototype.visitToken = function (token) {
            if (token === this.token1) {
                var result = this.token2;
                this.token1 = null;
                this.token2 = null;

                return result;
            }

            return token;
        };

        SyntaxTokenReplacer.prototype.visitNode = function (node) {
            if (this.token1 === null) {
                return node;
            }

            return _super.prototype.visitNode.call(this, node);
        };

        SyntaxTokenReplacer.prototype.visitList = function (list) {
            if (this.token1 === null) {
                return list;
            }

            return _super.prototype.visitList.call(this, list);
        };

        SyntaxTokenReplacer.prototype.visitSeparatedList = function (list) {
            if (this.token1 === null) {
                return list;
            }

            return _super.prototype.visitSeparatedList.call(this, list);
        };
        return SyntaxTokenReplacer;
    })(TypeScript.SyntaxRewriter);
    TypeScript.SyntaxTokenReplacer = SyntaxTokenReplacer;
})(TypeScript || (TypeScript = {}));
