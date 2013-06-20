var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    TypeScript.pullDeclID = 0;
    TypeScript.lastBoundPullDeclId = 0;

    var PullDecl = (function () {
        function PullDecl(declName, displayName, declType, declFlags, span, scriptName) {
            this.symbol = null;
            this.declGroups = new TypeScript.BlockIntrinsics();
            this.signatureSymbol = null;
            this.specializingSignatureSymbol = null;
            this.childDecls = [];
            this.typeParameters = [];
            this.childDeclTypeCache = new TypeScript.BlockIntrinsics();
            this.childDeclValueCache = new TypeScript.BlockIntrinsics();
            this.childDeclNamespaceCache = new TypeScript.BlockIntrinsics();
            this.childDeclTypeParameterCache = new TypeScript.BlockIntrinsics();
            this.declID = TypeScript.pullDeclID++;
            this.declFlags = TypeScript.PullElementFlags.None;
            this.diagnostics = null;
            this.parentDecl = null;
            this._parentPath = null;
            this.synthesizedValDecl = null;
            this.declName = declName;
            this.declType = declType;
            this.declFlags = declFlags;
            this.span = span;
            this.scriptName = scriptName;

            if (displayName !== this.declName) {
                this.declDisplayName = displayName;
            }
        }
        PullDecl.prototype.getDeclID = function () {
            return this.declID;
        };

        PullDecl.prototype.getName = function () {
            return this.declName;
        };
        PullDecl.prototype.getKind = function () {
            return this.declType;
        };

        PullDecl.prototype.getDisplayName = function () {
            return this.declDisplayName === undefined ? this.declName : this.declDisplayName;
        };

        PullDecl.prototype.setSymbol = function (symbol) {
            this.symbol = symbol;
        };
        PullDecl.prototype.getSymbol = function () {
            return this.symbol;
        };

        PullDecl.prototype.setSignatureSymbol = function (signature) {
            this.signatureSymbol = signature;
        };
        PullDecl.prototype.getSignatureSymbol = function () {
            return this.signatureSymbol;
        };

        PullDecl.prototype.setSpecializingSignatureSymbol = function (signature) {
            this.specializingSignatureSymbol = signature;
        };
        PullDecl.prototype.getSpecializingSignatureSymbol = function () {
            if (this.specializingSignatureSymbol) {
                return this.specializingSignatureSymbol;
            }

            return this.signatureSymbol;
        };

        PullDecl.prototype.getFlags = function () {
            return this.declFlags;
        };
        PullDecl.prototype.setFlags = function (flags) {
            this.declFlags = flags;
        };

        PullDecl.prototype.getSpan = function () {
            return this.span;
        };
        PullDecl.prototype.setSpan = function (span) {
            this.span = span;
        };

        PullDecl.prototype.getScriptName = function () {
            return this.scriptName;
        };

        PullDecl.prototype.setValueDecl = function (valDecl) {
            this.synthesizedValDecl = valDecl;
        };
        PullDecl.prototype.getValueDecl = function () {
            return this.synthesizedValDecl;
        };

        PullDecl.prototype.isEqual = function (other) {
            return (this.declName === other.declName) && (this.declType === other.declType) && (this.declFlags === other.declFlags) && (this.scriptName === other.scriptName) && (this.span.start() === other.span.start()) && (this.span.end() === other.span.end());
        };

        PullDecl.prototype.getParentDecl = function () {
            return this.parentDecl;
        };

        PullDecl.prototype.setParentDecl = function (parentDecl) {
            this.parentDecl = parentDecl;
        };

        PullDecl.prototype.addDiagnostic = function (diagnostic) {
            if (diagnostic) {
                if (!this.diagnostics) {
                    this.diagnostics = [];
                }

                this.diagnostics[this.diagnostics.length] = diagnostic;
            }
        };

        PullDecl.prototype.getDiagnostics = function () {
            return this.diagnostics;
        };

        PullDecl.prototype.setErrors = function (diagnostics) {
            if (diagnostics) {
                this.diagnostics = [];

                for (var i = 0; i < diagnostics.length; i++) {
                    diagnostics[i].adjustOffset(this.span.start());
                    this.diagnostics[this.diagnostics.length] = diagnostics[i];
                }
            }
        };

        PullDecl.prototype.resetErrors = function () {
            this.diagnostics = [];
        };

        PullDecl.prototype.getChildDeclCache = function (declKind) {
            return declKind === TypeScript.PullElementKind.TypeParameter ? this.childDeclTypeParameterCache : TypeScript.hasFlag(declKind, TypeScript.PullElementKind.SomeContainer) ? this.childDeclNamespaceCache : TypeScript.hasFlag(declKind, TypeScript.PullElementKind.SomeType) ? this.childDeclTypeCache : this.childDeclValueCache;
        };

        PullDecl.prototype.addChildDecl = function (childDecl) {
            if (childDecl.getKind() === TypeScript.PullElementKind.TypeParameter) {
                this.typeParameters[this.typeParameters.length] = childDecl;
            } else {
                this.childDecls[this.childDecls.length] = childDecl;
            }

            var declName = childDecl.getName();
            var cache = this.getChildDeclCache(childDecl.getKind());
            var childrenOfName = cache[declName];
            if (!childrenOfName) {
                childrenOfName = [];
            }

            childrenOfName.push(childDecl);
            cache[declName] = childrenOfName;
        };

        PullDecl.prototype.searchChildDecls = function (declName, searchKind) {
            var cache = (searchKind & TypeScript.PullElementKind.SomeType) ? this.childDeclTypeCache : (searchKind & TypeScript.PullElementKind.SomeContainer) ? this.childDeclNamespaceCache : this.childDeclValueCache;

            var cacheVal = cache[declName];

            if (cacheVal) {
                return cacheVal;
            } else {
                if (searchKind & TypeScript.PullElementKind.SomeType) {
                    cacheVal = this.childDeclTypeParameterCache[declName];

                    if (cacheVal) {
                        return cacheVal;
                    }
                }

                return [];
            }
        };

        PullDecl.prototype.getChildDecls = function () {
            return this.childDecls;
        };
        PullDecl.prototype.getTypeParameters = function () {
            return this.typeParameters;
        };

        PullDecl.prototype.addVariableDeclToGroup = function (decl) {
            var declGroup = this.declGroups[decl.getName()];
            if (declGroup) {
                declGroup.addDecl(decl);
            } else {
                declGroup = new PullDeclGroup(decl.getName());
                declGroup.addDecl(decl);
                this.declGroups[decl.getName()] = declGroup;
            }
        };

        PullDecl.prototype.getVariableDeclGroups = function () {
            var declGroups = [];

            for (var declName in this.declGroups) {
                if (this.declGroups[declName]) {
                    declGroups[declGroups.length] = this.declGroups[declName].getDecls();
                }
            }

            return declGroups;
        };

        PullDecl.prototype.getParentPath = function () {
            return this._parentPath;
        };

        PullDecl.prototype.setParentPath = function (path) {
            this._parentPath = path;
        };
        return PullDecl;
    })();
    TypeScript.PullDecl = PullDecl;

    var PullFunctionExpressionDecl = (function (_super) {
        __extends(PullFunctionExpressionDecl, _super);
        function PullFunctionExpressionDecl(expressionName, declFlags, span, scriptName) {
            _super.call(this, "", "", TypeScript.PullElementKind.FunctionExpression, declFlags, span, scriptName);
            this.functionExpressionName = expressionName;
        }
        PullFunctionExpressionDecl.prototype.getFunctionExpressionName = function () {
            return this.functionExpressionName;
        };
        return PullFunctionExpressionDecl;
    })(PullDecl);
    TypeScript.PullFunctionExpressionDecl = PullFunctionExpressionDecl;

    var PullDeclGroup = (function () {
        function PullDeclGroup(name) {
            this.name = name;
            this._decls = [];
        }
        PullDeclGroup.prototype.addDecl = function (decl) {
            if (decl.getName() === this.name) {
                this._decls[this._decls.length] = decl;
            }
        };

        PullDeclGroup.prototype.getDecls = function () {
            return this._decls;
        };
        return PullDeclGroup;
    })();
    TypeScript.PullDeclGroup = PullDeclGroup;
})(TypeScript || (TypeScript = {}));
