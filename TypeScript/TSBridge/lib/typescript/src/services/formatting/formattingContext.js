var TypeScript;
(function (TypeScript) {
    (function (Formatting) {
        var FormattingContext = (function () {
            function FormattingContext(snapshot, formattingRequestKind) {
                this.snapshot = snapshot;
                this.formattingRequestKind = formattingRequestKind;
                this.currentTokenSpan = null;
                this.nextTokenSpan = null;
                this.contextNode = null;
                this.currentTokenParent = null;
                this.nextTokenParent = null;
                this.contextNodeAllOnSameLine = null;
                this.tokensAreOnSameLine = null;
                this.tokensAreSiblingNodesOnSameLine = null;
                TypeScript.Debug.assert(this.snapshot != null, "snapshot is null");
            }
            FormattingContext.prototype.updateContext = function (currentTokenSpan, currentTokenParent, nextTokenSpan, nextTokenParent, commonParent) {
                TypeScript.Debug.assert(currentTokenSpan != null, "currentTokenSpan is null");
                TypeScript.Debug.assert(currentTokenParent != null, "currentTokenParent is null");
                TypeScript.Debug.assert(nextTokenSpan != null, "nextTokenSpan is null");
                TypeScript.Debug.assert(nextTokenParent != null, "nextTokenParent is null");
                TypeScript.Debug.assert(commonParent != null, "commonParent is null");

                this.currentTokenSpan = currentTokenSpan;
                this.currentTokenParent = currentTokenParent;
                this.nextTokenSpan = nextTokenSpan;
                this.nextTokenParent = nextTokenParent;
                this.contextNode = commonParent;

                this.contextNodeAllOnSameLine = null;
                this.tokensAreOnSameLine = null;
                this.tokensAreSiblingNodesOnSameLine = null;
            };

            FormattingContext.prototype.ContextNodeAllOnSameLine = function () {
                if (this.contextNodeAllOnSameLine === null) {
                    var startLine = this.snapshot.getLineNumberFromPosition(this.contextNode.start());
                    var endLine = this.snapshot.getLineNumberFromPosition(this.contextNode.end());

                    this.contextNodeAllOnSameLine = (startLine == endLine);
                }

                return this.contextNodeAllOnSameLine;
            };

            FormattingContext.prototype.TokensAreOnSameLine = function () {
                if (this.tokensAreOnSameLine === null) {
                    var startLine = this.snapshot.getLineNumberFromPosition(this.currentTokenSpan.start());
                    var endLine = this.snapshot.getLineNumberFromPosition(this.nextTokenSpan.start());

                    this.tokensAreOnSameLine = (startLine == endLine);
                }

                return this.tokensAreOnSameLine;
            };
            return FormattingContext;
        })();
        Formatting.FormattingContext = FormattingContext;
    })(TypeScript.Formatting || (TypeScript.Formatting = {}));
    var Formatting = TypeScript.Formatting;
})(TypeScript || (TypeScript = {}));
