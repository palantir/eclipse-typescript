var TypeScript;
(function (TypeScript) {
    var PullSymbolBindingContext = (function () {
        function PullSymbolBindingContext(semanticInfoChain, scriptName) {
            this.semanticInfoChain = semanticInfoChain;
            this.scriptName = scriptName;
            this.parentChain = [];
            this.declPath = [];
            this.reBindingAfterChange = false;
            this.startingDeclForRebind = TypeScript.pullDeclID;
            this.semanticInfo = this.semanticInfoChain.getUnit(this.scriptName);
        }
        PullSymbolBindingContext.prototype.getParent = function (n) {
            if (typeof n === "undefined") { n = 0; }
            return this.parentChain ? this.parentChain[this.parentChain.length - 1 - n] : null;
        };
        PullSymbolBindingContext.prototype.getDeclPath = function () {
            return this.declPath;
        };

        PullSymbolBindingContext.prototype.pushParent = function (parentDecl) {
            if (parentDecl) {
                this.parentChain[this.parentChain.length] = parentDecl;
                this.declPath[this.declPath.length] = parentDecl.getName();
            }
        };

        PullSymbolBindingContext.prototype.popParent = function () {
            if (this.parentChain.length) {
                this.parentChain.length--;
                this.declPath.length--;
            }
        };
        return PullSymbolBindingContext;
    })();
    TypeScript.PullSymbolBindingContext = PullSymbolBindingContext;

    TypeScript.time_in_findSymbol = 0;

    function findSymbolInContext(name, declKind, context, typeLookupPath) {
        var startTime = new Date().getTime();
        var contextSymbolPath = context.getDeclPath();
        var nestedSymbolPath = [];
        var copyOfContextSymbolPath = [];
        var symbol = null;
        var endTime;

        if (typeLookupPath.length) {
            for (var i = 0; i < typeLookupPath.length; i++) {
                nestedSymbolPath[nestedSymbolPath.length] = typeLookupPath[i];
            }

            nestedSymbolPath[nestedSymbolPath.length] = name;

            while (nestedSymbolPath.length >= 2) {
                symbol = context.semanticInfoChain.findSymbol(nestedSymbolPath, declKind);

                if (symbol) {
                    endTime = new Date().getTime();
                    TypeScript.time_in_findSymbol += endTime - startTime;
                    return symbol;
                }
                nestedSymbolPath.length -= 2;
                nestedSymbolPath[nestedSymbolPath.length] = name;
            }
        }

        if (contextSymbolPath.length) {
            for (var i = 0; i < contextSymbolPath.length; i++) {
                copyOfContextSymbolPath[copyOfContextSymbolPath.length] = contextSymbolPath[i];
            }

            for (var i = 0; i < typeLookupPath.length; i++) {
                copyOfContextSymbolPath[copyOfContextSymbolPath.length] = typeLookupPath[i];
            }

            copyOfContextSymbolPath[copyOfContextSymbolPath.length] = name;

            while (copyOfContextSymbolPath.length >= 2) {
                symbol = context.semanticInfoChain.findSymbol(copyOfContextSymbolPath, declKind);

                if (symbol) {
                    endTime = new Date().getTime();
                    TypeScript.time_in_findSymbol += endTime - startTime;
                    return symbol;
                }

                copyOfContextSymbolPath.length -= 2;
                copyOfContextSymbolPath[copyOfContextSymbolPath.length] = name;
            }
        }

        symbol = context.semanticInfoChain.findSymbol([name], declKind);

        endTime = new Date().getTime();
        TypeScript.time_in_findSymbol += endTime - startTime;

        return symbol;
    }
    TypeScript.findSymbolInContext = findSymbolInContext;
})(TypeScript || (TypeScript = {}));
