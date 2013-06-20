var TypeScript;
(function (TypeScript) {
    var SyntaxNode = (function () {
        function SyntaxNode(parsedInStrictMode) {
            this._data = parsedInStrictMode ? TypeScript.SyntaxConstants.NodeParsedInStrictModeMask : 0;
        }
        SyntaxNode.prototype.isNode = function () {
            return true;
        };
        SyntaxNode.prototype.isToken = function () {
            return false;
        };
        SyntaxNode.prototype.isList = function () {
            return false;
        };
        SyntaxNode.prototype.isSeparatedList = function () {
            return false;
        };

        SyntaxNode.prototype.kind = function () {
            throw TypeScript.Errors.abstract();
        };

        SyntaxNode.prototype.childCount = function () {
            throw TypeScript.Errors.abstract();
        };

        SyntaxNode.prototype.childAt = function (slot) {
            throw TypeScript.Errors.abstract();
        };

        SyntaxNode.prototype.firstToken = function () {
            for (var i = 0, n = this.childCount(); i < n; i++) {
                var element = this.childAt(i);

                if (element !== null) {
                    if (element.fullWidth() > 0 || element.kind() === TypeScript.SyntaxKind.EndOfFileToken) {
                        return element.firstToken();
                    }
                }
            }

            return null;
        };

        SyntaxNode.prototype.lastToken = function () {
            for (var i = this.childCount() - 1; i >= 0; i--) {
                var element = this.childAt(i);

                if (element !== null) {
                    if (element.fullWidth() > 0 || element.kind() === TypeScript.SyntaxKind.EndOfFileToken) {
                        return element.lastToken();
                    }
                }
            }

            return null;
        };

        SyntaxNode.prototype.insertChildrenInto = function (array, index) {
            for (var i = this.childCount() - 1; i >= 0; i--) {
                var element = this.childAt(i);

                if (element !== null) {
                    if (element.isNode() || element.isToken()) {
                        array.splice(index, 0, element);
                    } else if (element.isList()) {
                        (element).insertChildrenInto(array, index);
                    } else if (element.isSeparatedList()) {
                        (element).insertChildrenInto(array, index);
                    } else {
                        throw TypeScript.Errors.invalidOperation();
                    }
                }
            }
        };

        SyntaxNode.prototype.leadingTrivia = function () {
            return this.firstToken().leadingTrivia();
        };

        SyntaxNode.prototype.trailingTrivia = function () {
            return this.lastToken().trailingTrivia();
        };

        SyntaxNode.prototype.toJSON = function (key) {
            var result = {
                kind: TypeScript.SyntaxKind[this.kind()],
                fullWidth: this.fullWidth()
            };

            if (this.isIncrementallyUnusable()) {
                result.isIncrementallyUnusable = true;
            }

            if (this.parsedInStrictMode()) {
                result.parsedInStrictMode = true;
            }

            for (var i = 0, n = this.childCount(); i < n; i++) {
                var value = this.childAt(i);

                if (value) {
                    for (var name in this) {
                        if (value === this[name]) {
                            result[name] = value;
                            break;
                        }
                    }
                }
            }

            return result;
        };

        SyntaxNode.prototype.accept = function (visitor) {
            throw TypeScript.Errors.abstract();
        };

        SyntaxNode.prototype.fullText = function () {
            var elements = [];
            this.collectTextElements(elements);
            return elements.join("");
        };

        SyntaxNode.prototype.collectTextElements = function (elements) {
            for (var i = 0, n = this.childCount(); i < n; i++) {
                var element = this.childAt(i);

                if (element !== null) {
                    element.collectTextElements(elements);
                }
            }
        };

        SyntaxNode.prototype.replaceToken = function (token1, token2) {
            if (token1 === token2) {
                return this;
            }

            return this.accept(new TypeScript.SyntaxTokenReplacer(token1, token2));
        };

        SyntaxNode.prototype.withLeadingTrivia = function (trivia) {
            return this.replaceToken(this.firstToken(), this.firstToken().withLeadingTrivia(trivia));
        };

        SyntaxNode.prototype.withTrailingTrivia = function (trivia) {
            return this.replaceToken(this.lastToken(), this.lastToken().withTrailingTrivia(trivia));
        };

        SyntaxNode.prototype.hasLeadingTrivia = function () {
            return this.lastToken().hasLeadingTrivia();
        };

        SyntaxNode.prototype.hasTrailingTrivia = function () {
            return this.lastToken().hasTrailingTrivia();
        };

        SyntaxNode.prototype.isTypeScriptSpecific = function () {
            return false;
        };

        SyntaxNode.prototype.isIncrementallyUnusable = function () {
            return (this.data() & TypeScript.SyntaxConstants.NodeIncrementallyUnusableMask) !== 0;
        };

        SyntaxNode.prototype.parsedInStrictMode = function () {
            return (this.data() & TypeScript.SyntaxConstants.NodeParsedInStrictModeMask) !== 0;
        };

        SyntaxNode.prototype.fullWidth = function () {
            return this.data() >>> TypeScript.SyntaxConstants.NodeFullWidthShift;
        };

        SyntaxNode.prototype.computeData = function () {
            var slotCount = this.childCount();

            var fullWidth = 0;
            var childWidth = 0;

            var isIncrementallyUnusable = ((this._data & TypeScript.SyntaxConstants.NodeIncrementallyUnusableMask) !== 0) || slotCount === 0;

            for (var i = 0, n = slotCount; i < n; i++) {
                var element = this.childAt(i);

                if (element !== null) {
                    childWidth = element.fullWidth();
                    fullWidth += childWidth;

                    if (!isIncrementallyUnusable) {
                        isIncrementallyUnusable = element.isIncrementallyUnusable();
                    }
                }
            }

            return (fullWidth << TypeScript.SyntaxConstants.NodeFullWidthShift) | (isIncrementallyUnusable ? TypeScript.SyntaxConstants.NodeIncrementallyUnusableMask : 0) | TypeScript.SyntaxConstants.NodeDataComputed;
        };

        SyntaxNode.prototype.data = function () {
            if ((this._data & TypeScript.SyntaxConstants.NodeDataComputed) === 0) {
                this._data |= this.computeData();
            }

            return this._data;
        };

        SyntaxNode.prototype.findToken = function (position, includeSkippedTokens) {
            if (typeof includeSkippedTokens === "undefined") { includeSkippedTokens = false; }
            var endOfFileToken = this.tryGetEndOfFileAt(position);
            if (endOfFileToken !== null) {
                return endOfFileToken;
            }

            if (position < 0 || position >= this.fullWidth()) {
                throw TypeScript.Errors.argumentOutOfRange("position");
            }

            var positionedToken = this.findTokenInternal(null, position, 0);

            if (includeSkippedTokens) {
                return TypeScript.Syntax.findSkippedTokenInPositionedToken(positionedToken, position) || positionedToken;
            }

            return positionedToken;
        };

        SyntaxNode.prototype.tryGetEndOfFileAt = function (position) {
            if (this.kind() === TypeScript.SyntaxKind.SourceUnit && position === this.fullWidth()) {
                var sourceUnit = this;
                return new TypeScript.PositionedToken(new TypeScript.PositionedNode(null, sourceUnit, 0), sourceUnit.endOfFileToken, sourceUnit.moduleElements.fullWidth());
            }

            return null;
        };

        SyntaxNode.prototype.findTokenInternal = function (parent, position, fullStart) {
            parent = new TypeScript.PositionedNode(parent, this, fullStart);
            for (var i = 0, n = this.childCount(); i < n; i++) {
                var element = this.childAt(i);

                if (element !== null) {
                    var childWidth = element.fullWidth();

                    if (position < childWidth) {
                        return (element).findTokenInternal(parent, position, fullStart);
                    }

                    position -= childWidth;
                    fullStart += childWidth;
                }
            }

            throw TypeScript.Errors.invalidOperation();
        };

        SyntaxNode.prototype.findTokenOnLeft = function (position, includeSkippedTokens) {
            if (typeof includeSkippedTokens === "undefined") { includeSkippedTokens = false; }
            var positionedToken = this.findToken(position, includeSkippedTokens);
            var start = positionedToken.start();

            if (position > start) {
                return positionedToken;
            }

            if (positionedToken.fullStart() === 0) {
                return null;
            }

            return positionedToken.previousToken(includeSkippedTokens);
        };

        SyntaxNode.prototype.findCompleteTokenOnLeft = function (position, includeSkippedTokens) {
            if (typeof includeSkippedTokens === "undefined") { includeSkippedTokens = false; }
            var positionedToken = this.findToken(position, includeSkippedTokens);

            if (positionedToken.token().width() > 0 && position >= positionedToken.end()) {
                return positionedToken;
            }

            return positionedToken.previousToken(includeSkippedTokens);
        };

        SyntaxNode.prototype.isModuleElement = function () {
            return false;
        };

        SyntaxNode.prototype.isClassElement = function () {
            return false;
        };

        SyntaxNode.prototype.isTypeMember = function () {
            return false;
        };

        SyntaxNode.prototype.isStatement = function () {
            return false;
        };

        SyntaxNode.prototype.isSwitchClause = function () {
            return false;
        };

        SyntaxNode.prototype.structuralEquals = function (node) {
            if (this === node) {
                return true;
            }
            if (node === null) {
                return false;
            }
            if (this.kind() !== node.kind()) {
                return false;
            }

            for (var i = 0, n = this.childCount(); i < n; i++) {
                var element1 = this.childAt(i);
                var element2 = node.childAt(i);

                if (!TypeScript.Syntax.elementStructuralEquals(element1, element2)) {
                    return false;
                }
            }

            return true;
        };

        SyntaxNode.prototype.width = function () {
            return this.fullWidth() - this.leadingTriviaWidth() - this.trailingTriviaWidth();
        };

        SyntaxNode.prototype.leadingTriviaWidth = function () {
            var firstToken = this.firstToken();
            return firstToken === null ? 0 : firstToken.leadingTriviaWidth();
        };

        SyntaxNode.prototype.trailingTriviaWidth = function () {
            var lastToken = this.lastToken();
            return lastToken === null ? 0 : lastToken.trailingTriviaWidth();
        };
        return SyntaxNode;
    })();
    TypeScript.SyntaxNode = SyntaxNode;
})(TypeScript || (TypeScript = {}));
