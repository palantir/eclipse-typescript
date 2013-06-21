var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var SemanticDiagnostic = (function (_super) {
        __extends(SemanticDiagnostic, _super);
        function SemanticDiagnostic() {
            _super.apply(this, arguments);
        }
        SemanticDiagnostic.equals = function (diagnostic1, diagnostic2) {
            return TypeScript.Diagnostic.equals(diagnostic1, diagnostic2);
        };
        return SemanticDiagnostic;
    })(TypeScript.Diagnostic);
    TypeScript.SemanticDiagnostic = SemanticDiagnostic;

    function getDiagnosticsFromEnclosingDecl(enclosingDecl, errors) {
        var declErrors = enclosingDecl.getDiagnostics();

        if (declErrors) {
            for (var i = 0; i < declErrors.length; i++) {
                errors[errors.length] = declErrors[i];
            }
        }

        var childDecls = enclosingDecl.getChildDecls();

        for (var i = 0; i < childDecls.length; i++) {
            getDiagnosticsFromEnclosingDecl(childDecls[i], errors);
        }
    }
    TypeScript.getDiagnosticsFromEnclosingDecl = getDiagnosticsFromEnclosingDecl;
})(TypeScript || (TypeScript = {}));
