var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var SyntaxNodeInvariantsChecker = (function (_super) {
        __extends(SyntaxNodeInvariantsChecker, _super);
        function SyntaxNodeInvariantsChecker() {
            _super.apply(this, arguments);
            this.tokenTable = TypeScript.Collections.createHashTable(TypeScript.Collections.DefaultHashTableCapacity, TypeScript.Collections.identityHashCode);
        }
        SyntaxNodeInvariantsChecker.checkInvariants = function (node) {
            node.accept(new SyntaxNodeInvariantsChecker());
        };

        SyntaxNodeInvariantsChecker.prototype.visitToken = function (token) {
            this.tokenTable.add(token, token);
        };
        return SyntaxNodeInvariantsChecker;
    })(TypeScript.SyntaxWalker);
    TypeScript.SyntaxNodeInvariantsChecker = SyntaxNodeInvariantsChecker;
})(TypeScript || (TypeScript = {}));
