var TypeScript;
(function (TypeScript) {
    (function (PullHelpers) {
        function getSignatureForFuncDecl(funcDecl, semanticInfo) {
            var funcSymbol = semanticInfo.getSymbolAndDiagnosticsForAST(funcDecl).symbol;
            var functionDecl = semanticInfo.getDeclForAST(funcDecl);
            var functionSignature = null;
            var typeSymbolWithAllSignatures = null;
            if (funcSymbol.isSignature()) {
                functionSignature = funcSymbol;
                var parent = functionDecl.getParentDecl();
                typeSymbolWithAllSignatures = parent.getSymbol().getType();
            } else {
                functionSignature = functionDecl.getSignatureSymbol();
                typeSymbolWithAllSignatures = funcSymbol.getType();
            }
            var signatures;
            if (funcDecl.isConstructor || funcDecl.isConstructMember()) {
                signatures = typeSymbolWithAllSignatures.getConstructSignatures();
            } else if (funcDecl.isIndexerMember()) {
                signatures = typeSymbolWithAllSignatures.getIndexSignatures();
            } else {
                signatures = typeSymbolWithAllSignatures.getCallSignatures();
            }
            return {
                signature: functionSignature,
                allSignatures: signatures
            };
        }
        PullHelpers.getSignatureForFuncDecl = getSignatureForFuncDecl;

        function getAccessorSymbol(getterOrSetter, semanticInfoChain, unitPath) {
            var getterOrSetterSymbol = semanticInfoChain.getSymbolAndDiagnosticsForAST(getterOrSetter, unitPath).symbol;
            var linkKind;
            if (TypeScript.hasFlag(getterOrSetter.getFunctionFlags(), TypeScript.FunctionFlags.GetAccessor)) {
                linkKind = TypeScript.SymbolLinkKind.GetterFunction;
            } else {
                linkKind = TypeScript.SymbolLinkKind.SetterFunction;
            }

            var accessorSymbolLinks = getterOrSetterSymbol.findIncomingLinks(function (psl) {
                return psl.kind === linkKind;
            });
            if (accessorSymbolLinks.length) {
                return accessorSymbolLinks[0].start;
            }

            return null;
        }
        PullHelpers.getAccessorSymbol = getAccessorSymbol;

        function getGetterAndSetterFunction(funcDecl, semanticInfoChain, unitPath) {
            var accessorSymbol = PullHelpers.getAccessorSymbol(funcDecl, semanticInfoChain, unitPath);
            var result = {
                getter: null,
                setter: null
            };
            var getter = accessorSymbol.getGetter();
            if (getter) {
                var getterDecl = getter.getDeclarations()[0];
                result.getter = semanticInfoChain.getASTForDecl(getterDecl);
            }
            var setter = accessorSymbol.getSetter();
            if (setter) {
                var setterDecl = setter.getDeclarations()[0];
                result.setter = semanticInfoChain.getASTForDecl(setterDecl);
            }

            return result;
        }
        PullHelpers.getGetterAndSetterFunction = getGetterAndSetterFunction;

        function symbolIsEnum(source) {
            return source && ((source.getKind() & (TypeScript.PullElementKind.Enum | TypeScript.PullElementKind.EnumMember)) || source.hasFlag(TypeScript.PullElementFlags.InitializedEnum));
        }
        PullHelpers.symbolIsEnum = symbolIsEnum;
    })(TypeScript.PullHelpers || (TypeScript.PullHelpers = {}));
    var PullHelpers = TypeScript.PullHelpers;
})(TypeScript || (TypeScript = {}));
