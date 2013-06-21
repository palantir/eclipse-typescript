var TypeScript;
(function (TypeScript) {
    var CandidateInferenceInfo = (function () {
        function CandidateInferenceInfo() {
            this.typeParameter = null;
            this.isFixed = false;
            this.inferenceCandidates = [];
        }
        CandidateInferenceInfo.prototype.addCandidate = function (candidate) {
            if (!this.isFixed) {
                this.inferenceCandidates[this.inferenceCandidates.length] = candidate;
            }
        };
        return CandidateInferenceInfo;
    })();
    TypeScript.CandidateInferenceInfo = CandidateInferenceInfo;

    var ArgumentInferenceContext = (function () {
        function ArgumentInferenceContext() {
            this.inferenceCache = {};
            this.candidateCache = {};
        }
        ArgumentInferenceContext.prototype.alreadyRelatingTypes = function (objectType, parameterType) {
            var comboID = objectType.getSymbolID().toString() + "#" + parameterType.getSymbolID().toString();

            if (this.inferenceCache[comboID]) {
                return true;
            } else {
                this.inferenceCache[comboID] = true;
                return false;
            }
        };

        ArgumentInferenceContext.prototype.resetRelationshipCache = function () {
            this.inferenceCache = {};
        };

        ArgumentInferenceContext.prototype.addInferenceRoot = function (param) {
            var info = this.candidateCache[param.getSymbolID().toString()];

            if (!info) {
                info = new CandidateInferenceInfo();
                info.typeParameter = param;
                this.candidateCache[param.getSymbolID().toString()] = info;
            }
        };

        ArgumentInferenceContext.prototype.getInferenceInfo = function (param) {
            return this.candidateCache[param.getSymbolID().toString()];
        };

        ArgumentInferenceContext.prototype.addCandidateForInference = function (param, candidate, fix) {
            var info = this.getInferenceInfo(param);

            if (info) {
                if (candidate) {
                    info.addCandidate(candidate);
                }

                if (!info.isFixed) {
                    info.isFixed = fix;
                }
            }
        };

        ArgumentInferenceContext.prototype.getInferenceCandidates = function () {
            var inferenceCandidates = [];
            var info;
            var val;

            for (var infoKey in this.candidateCache) {
                info = this.candidateCache[infoKey];

                for (var i = 0; i < info.inferenceCandidates.length; i++) {
                    val = {};
                    val[info.typeParameter.getSymbolID().toString()] = info.inferenceCandidates[i];
                    inferenceCandidates[inferenceCandidates.length] = val;
                }
            }

            return inferenceCandidates;
        };

        ArgumentInferenceContext.prototype.inferArgumentTypes = function (resolver, context) {
            var info = null;

            var collection;

            var bestCommonType;

            var results = [];

            var unfit = false;

            for (var infoKey in this.candidateCache) {
                info = this.candidateCache[infoKey];

                if (!info.inferenceCandidates.length) {
                    results[results.length] = { param: info.typeParameter, type: resolver.semanticInfoChain.anyTypeSymbol };
                    continue;
                }

                collection = {
                    getLength: function () {
                        return info.inferenceCandidates.length;
                    },
                    setTypeAtIndex: function (index, type) {
                    },
                    getTypeAtIndex: function (index) {
                        return info.inferenceCandidates[index].getType();
                    }
                };

                bestCommonType = resolver.widenType(resolver.findBestCommonType(info.inferenceCandidates[0], null, collection, context, new TypeScript.TypeComparisonInfo()));

                if (!bestCommonType) {
                    unfit = true;
                } else {
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].type == info.typeParameter) {
                            results[i].type = bestCommonType;
                        }
                    }
                }

                results[results.length] = { param: info.typeParameter, type: bestCommonType };
            }

            return { results: results, unfit: unfit };
        };
        return ArgumentInferenceContext;
    })();
    TypeScript.ArgumentInferenceContext = ArgumentInferenceContext;

    var PullContextualTypeContext = (function () {
        function PullContextualTypeContext(contextualType, provisional, substitutions) {
            this.contextualType = contextualType;
            this.provisional = provisional;
            this.substitutions = substitutions;
            this.provisionallyTypedSymbols = [];
            this.provisionalDiagnostic = [];
        }
        PullContextualTypeContext.prototype.recordProvisionallyTypedSymbol = function (symbol) {
            this.provisionallyTypedSymbols[this.provisionallyTypedSymbols.length] = symbol;
        };

        PullContextualTypeContext.prototype.invalidateProvisionallyTypedSymbols = function () {
            for (var i = 0; i < this.provisionallyTypedSymbols.length; i++) {
                this.provisionallyTypedSymbols[i].invalidate();
            }
        };

        PullContextualTypeContext.prototype.postDiagnostic = function (error) {
            this.provisionalDiagnostic[this.provisionalDiagnostic.length] = error;
        };

        PullContextualTypeContext.prototype.hadProvisionalErrors = function () {
            return this.provisionalDiagnostic.length > 0;
        };
        return PullContextualTypeContext;
    })();
    TypeScript.PullContextualTypeContext = PullContextualTypeContext;

    var PullTypeResolutionContext = (function () {
        function PullTypeResolutionContext() {
            this.contextStack = [];
            this.typeSpecializationStack = [];
            this.genericASTResolutionStack = [];
            this.resolvingTypeReference = false;
            this.resolvingNamespaceMemberAccess = false;
            this.resolveAggressively = false;
            this.canUseTypeSymbol = false;
            this.specializingToAny = false;
            this.specializingToObject = false;
            this.isResolvingClassExtendedType = false;
            this.isSpecializingSignatureAtCallSite = false;
            this.isSpecializingConstructorMethod = false;
            this.isComparingSpecializedSignatures = false;
            this.inSpecialization = false;
            this.suppressErrors = false;
            this.inBaseTypeResolution = false;
        }
        PullTypeResolutionContext.prototype.pushContextualType = function (type, provisional, substitutions) {
            this.contextStack.push(new PullContextualTypeContext(type, provisional, substitutions));
        };

        PullTypeResolutionContext.prototype.popContextualType = function () {
            var tc = this.contextStack.pop();

            tc.invalidateProvisionallyTypedSymbols();

            return tc;
        };

        PullTypeResolutionContext.prototype.findSubstitution = function (type) {
            var substitution = null;

            if (this.contextStack.length) {
                for (var i = this.contextStack.length - 1; i >= 0; i--) {
                    if (this.contextStack[i].substitutions) {
                        substitution = this.contextStack[i].substitutions[type.getSymbolID().toString()];

                        if (substitution) {
                            break;
                        }
                    }
                }
            }

            return substitution;
        };

        PullTypeResolutionContext.prototype.getContextualType = function () {
            var context = !this.contextStack.length ? null : this.contextStack[this.contextStack.length - 1];

            if (context) {
                var type = context.contextualType;

                if (!type) {
                    return null;
                }

                if (type.isTypeParameter() && (type).getConstraint()) {
                    type = (type).getConstraint();
                }

                var substitution = this.findSubstitution(type);

                return substitution ? substitution : type;
            }

            return null;
        };

        PullTypeResolutionContext.prototype.inProvisionalResolution = function () {
            return (!this.contextStack.length ? false : this.contextStack[this.contextStack.length - 1].provisional);
        };

        PullTypeResolutionContext.prototype.isInBaseTypeResolution = function () {
            return this.inBaseTypeResolution;
        };

        PullTypeResolutionContext.prototype.startBaseTypeResolution = function () {
            var wasInBaseTypeResoltion = this.inBaseTypeResolution;
            this.inBaseTypeResolution = true;
            return wasInBaseTypeResoltion;
        };

        PullTypeResolutionContext.prototype.doneBaseTypeResolution = function (wasInBaseTypeResolution) {
            this.inBaseTypeResolution = wasInBaseTypeResolution;
        };

        PullTypeResolutionContext.prototype.setTypeInContext = function (symbol, type) {
            var substitution = this.findSubstitution(type);

            symbol.setType(substitution ? substitution : type);

            if (this.contextStack.length && this.inProvisionalResolution()) {
                this.contextStack[this.contextStack.length - 1].recordProvisionallyTypedSymbol(symbol);
            }
        };

        PullTypeResolutionContext.prototype.pushTypeSpecializationCache = function (cache) {
            this.typeSpecializationStack[this.typeSpecializationStack.length] = cache;
        };

        PullTypeResolutionContext.prototype.popTypeSpecializationCache = function () {
            if (this.typeSpecializationStack.length) {
                this.typeSpecializationStack.length--;
            }
        };

        PullTypeResolutionContext.prototype.findSpecializationForType = function (type) {
            var specialization = null;

            for (var i = this.typeSpecializationStack.length - 1; i >= 0; i--) {
                specialization = (this.typeSpecializationStack[i])[type.getSymbolID().toString()];

                if (specialization) {
                    return specialization;
                }
            }

            return type;
        };

        PullTypeResolutionContext.prototype.postError = function (fileName, offset, length, diagnosticCode, arguments, enclosingDecl, addToDecl) {
            if (typeof arguments === "undefined") { arguments = null; }
            if (typeof enclosingDecl === "undefined") { enclosingDecl = null; }
            if (typeof addToDecl === "undefined") { addToDecl = false; }
            var diagnostic = new TypeScript.SemanticDiagnostic(fileName, offset, length, diagnosticCode, arguments);
            this.postDiagnostic(diagnostic, enclosingDecl, addToDecl);

            return diagnostic;
        };

        PullTypeResolutionContext.prototype.postDiagnostic = function (diagnostic, enclosingDecl, addToDecl) {
            if (this.inProvisionalResolution()) {
                (this.contextStack[this.contextStack.length - 1]).postDiagnostic(diagnostic);
            } else if (!this.suppressErrors && enclosingDecl && addToDecl) {
                enclosingDecl.addDiagnostic(diagnostic);
            }
        };

        PullTypeResolutionContext.prototype.startResolvingTypeArguments = function (ast) {
            this.genericASTResolutionStack[this.genericASTResolutionStack.length] = ast;
        };

        PullTypeResolutionContext.prototype.isResolvingTypeArguments = function (ast) {
            for (var i = 0; i < this.genericASTResolutionStack.length; i++) {
                if (this.genericASTResolutionStack[i].getID() === ast.getID()) {
                    return true;
                }
            }

            return false;
        };

        PullTypeResolutionContext.prototype.doneResolvingTypeArguments = function () {
            this.genericASTResolutionStack.length--;
        };
        return PullTypeResolutionContext;
    })();
    TypeScript.PullTypeResolutionContext = PullTypeResolutionContext;
})(TypeScript || (TypeScript = {}));
