var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var SyntaxDiagnostic = (function (_super) {
        __extends(SyntaxDiagnostic, _super);
        function SyntaxDiagnostic() {
            _super.apply(this, arguments);
        }
        SyntaxDiagnostic.equals = function (diagnostic1, diagnostic2) {
            return TypeScript.Diagnostic.equals(diagnostic1, diagnostic2);
        };
        return SyntaxDiagnostic;
    })(TypeScript.Diagnostic);
    TypeScript.SyntaxDiagnostic = SyntaxDiagnostic;
})(TypeScript || (TypeScript = {}));
