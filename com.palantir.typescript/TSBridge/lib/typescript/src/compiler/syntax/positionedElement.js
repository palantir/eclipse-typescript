var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var PositionedElement = (function () {
        function PositionedElement(parent, element, fullStart) {
            this._parent = parent;
            this._element = element;
            this._fullStart = fullStart;
        }
        PositionedElement.create = function (parent, element, fullStart) {
            if (element === null) {
                return null;
            }

            if (element.isNode()) {
                return new PositionedNode(parent, element, fullStart);
            } else if (element.isToken()) {
                return new PositionedToken(parent, element, fullStart);
            } else if (element.isList()) {
                return new PositionedList(parent, element, fullStart);
            } else if (element.isSeparatedList()) {
                return new PositionedSeparatedList(parent, element, fullStart);
            } else {
                throw TypeScript.Errors.invalidOperation();
            }
        };

        PositionedElement.prototype.parent = function () {
            return this._parent;
        };

        PositionedElement.prototype.parentElement = function () {
            return this._parent && this._parent._element;
        };

        PositionedElement.prototype.element = function () {
            return this._element;
        };

        PositionedElement.prototype.kind = function () {
            return this.element().kind();
        };

        PositionedElement.prototype.childIndex = function (child) {
            return TypeScript.Syntax.childIndex(this.element(), child);
        };

        PositionedElement.prototype.childCount = function () {
            return this.element().childCount();
        };

        PositionedElement.prototype.childAt = function (index) {
            var offset = TypeScript.Syntax.childOffsetAt(this.element(), index);
            return PositionedElement.create(this, this.element().childAt(index), this.fullStart() + offset);
        };

        PositionedElement.prototype.childStart = function (child) {
            var offset = TypeScript.Syntax.childOffset(this.element(), child);
            return this.fullStart() + offset + child.leadingTriviaWidth();
        };

        PositionedElement.prototype.childEnd = function (child) {
            var offset = TypeScript.Syntax.childOffset(this.element(), child);
            return this.fullStart() + offset + child.leadingTriviaWidth() + child.width();
        };

        PositionedElement.prototype.childStartAt = function (index) {
            var offset = TypeScript.Syntax.childOffsetAt(this.element(), index);
            var child = this.element().childAt(index);
            return this.fullStart() + offset + child.leadingTriviaWidth();
        };

        PositionedElement.prototype.childEndAt = function (index) {
            var offset = TypeScript.Syntax.childOffsetAt(this.element(), index);
            var child = this.element().childAt(index);
            return this.fullStart() + offset + child.leadingTriviaWidth() + child.width();
        };

        PositionedElement.prototype.getPositionedChild = function (child) {
            var offset = TypeScript.Syntax.childOffset(this.element(), child);
            return PositionedElement.create(this, child, this.fullStart() + offset);
        };

        PositionedElement.prototype.fullStart = function () {
            return this._fullStart;
        };

        PositionedElement.prototype.fullEnd = function () {
            return this.fullStart() + this.element().fullWidth();
        };

        PositionedElement.prototype.fullWidth = function () {
            return this.element().fullWidth();
        };

        PositionedElement.prototype.start = function () {
            return this.fullStart() + this.element().leadingTriviaWidth();
        };

        PositionedElement.prototype.end = function () {
            return this.fullStart() + this.element().leadingTriviaWidth() + this.element().width();
        };

        PositionedElement.prototype.root = function () {
            var current = this;
            while (current.parent() !== null) {
                current = current.parent();
            }

            return current;
        };

        PositionedElement.prototype.containingNode = function () {
            var current = this.parent();

            while (current !== null && !current.element().isNode()) {
                current = current.parent();
            }

            return current;
        };
        return PositionedElement;
    })();
    TypeScript.PositionedElement = PositionedElement;

    var PositionedNodeOrToken = (function (_super) {
        __extends(PositionedNodeOrToken, _super);
        function PositionedNodeOrToken(parent, nodeOrToken, fullStart) {
            _super.call(this, parent, nodeOrToken, fullStart);
        }
        PositionedNodeOrToken.prototype.nodeOrToken = function () {
            return this.element();
        };
        return PositionedNodeOrToken;
    })(PositionedElement);
    TypeScript.PositionedNodeOrToken = PositionedNodeOrToken;

    var PositionedNode = (function (_super) {
        __extends(PositionedNode, _super);
        function PositionedNode(parent, node, fullStart) {
            _super.call(this, parent, node, fullStart);
        }
        PositionedNode.prototype.node = function () {
            return this.element();
        };
        return PositionedNode;
    })(PositionedNodeOrToken);
    TypeScript.PositionedNode = PositionedNode;

    var PositionedToken = (function (_super) {
        __extends(PositionedToken, _super);
        function PositionedToken(parent, token, fullStart) {
            _super.call(this, parent, token, fullStart);
        }
        PositionedToken.prototype.token = function () {
            return this.element();
        };

        PositionedToken.prototype.previousToken = function (includeSkippedTokens) {
            if (typeof includeSkippedTokens === "undefined") { includeSkippedTokens = false; }
            var triviaList = this.token().leadingTrivia();
            if (includeSkippedTokens && triviaList && triviaList.hasSkippedToken()) {
                var currentTriviaEndPosition = this.start();
                for (var i = triviaList.count() - 1; i >= 0; i--) {
                    var trivia = triviaList.syntaxTriviaAt(i);
                    if (trivia.isSkippedToken()) {
                        return new PositionedSkippedToken(this, trivia.skippedToken(), currentTriviaEndPosition - trivia.fullWidth());
                    }

                    currentTriviaEndPosition -= trivia.fullWidth();
                }
            }

            var start = this.fullStart();
            if (start === 0) {
                return null;
            }

            return this.root().node().findToken(start - 1, includeSkippedTokens);
        };

        PositionedToken.prototype.nextToken = function (includeSkippedTokens) {
            if (typeof includeSkippedTokens === "undefined") { includeSkippedTokens = false; }
            if (this.token().tokenKind === TypeScript.SyntaxKind.EndOfFileToken) {
                return null;
            }

            var triviaList = this.token().trailingTrivia();
            if (includeSkippedTokens && triviaList && triviaList.hasSkippedToken()) {
                var fullStart = this.end();
                for (var i = 0, n = triviaList.count(); i < n; i++) {
                    var trivia = triviaList.syntaxTriviaAt(i);
                    if (trivia.isSkippedToken()) {
                        return new PositionedSkippedToken(this, trivia.skippedToken(), fullStart);
                    }

                    fullStart += trivia.fullWidth();
                }
            }

            return this.root().node().findToken(this.fullEnd(), includeSkippedTokens);
        };
        return PositionedToken;
    })(PositionedNodeOrToken);
    TypeScript.PositionedToken = PositionedToken;

    var PositionedList = (function (_super) {
        __extends(PositionedList, _super);
        function PositionedList(parent, list, fullStart) {
            _super.call(this, parent, list, fullStart);
        }
        PositionedList.prototype.list = function () {
            return this.element();
        };
        return PositionedList;
    })(PositionedElement);
    TypeScript.PositionedList = PositionedList;

    var PositionedSeparatedList = (function (_super) {
        __extends(PositionedSeparatedList, _super);
        function PositionedSeparatedList(parent, list, fullStart) {
            _super.call(this, parent, list, fullStart);
        }
        PositionedSeparatedList.prototype.list = function () {
            return this.element();
        };
        return PositionedSeparatedList;
    })(PositionedElement);
    TypeScript.PositionedSeparatedList = PositionedSeparatedList;

    var PositionedSkippedToken = (function (_super) {
        __extends(PositionedSkippedToken, _super);
        function PositionedSkippedToken(parentToken, token, fullStart) {
            _super.call(this, parentToken.parent(), token, fullStart);
            this._parentToken = parentToken;
        }
        PositionedSkippedToken.prototype.parentToken = function () {
            return this._parentToken;
        };

        PositionedSkippedToken.prototype.previousToken = function (includeSkippedTokens) {
            if (typeof includeSkippedTokens === "undefined") { includeSkippedTokens = false; }
            var start = this.fullStart();

            if (includeSkippedTokens) {
                var previousToken;

                if (start >= this.parentToken().end()) {
                    previousToken = TypeScript.Syntax.findSkippedTokenInTrailingTriviaList(this.parentToken(), start - 1);

                    if (previousToken) {
                        return previousToken;
                    }

                    return this.parentToken();
                } else {
                    previousToken = TypeScript.Syntax.findSkippedTokenInLeadingTriviaList(this.parentToken(), start - 1);

                    if (previousToken) {
                        return previousToken;
                    }
                }
            }

            var start = this.parentToken().fullStart();
            if (start === 0) {
                return null;
            }

            return this.root().node().findToken(start - 1, includeSkippedTokens);
        };

        PositionedSkippedToken.prototype.nextToken = function (includeSkippedTokens) {
            if (typeof includeSkippedTokens === "undefined") { includeSkippedTokens = false; }
            if (this.token().tokenKind === TypeScript.SyntaxKind.EndOfFileToken) {
                return null;
            }

            if (includeSkippedTokens) {
                var end = this.end();
                var nextToken;

                if (end <= this.parentToken().start()) {
                    nextToken = TypeScript.Syntax.findSkippedTokenInLeadingTriviaList(this.parentToken(), end);

                    if (nextToken) {
                        return nextToken;
                    }

                    return this.parentToken();
                } else {
                    nextToken = TypeScript.Syntax.findSkippedTokenInTrailingTriviaList(this.parentToken(), end);

                    if (nextToken) {
                        return nextToken;
                    }
                }
            }

            return this.root().node().findToken(this.parentToken().fullEnd(), includeSkippedTokens);
        };
        return PositionedSkippedToken;
    })(PositionedToken);
    TypeScript.PositionedSkippedToken = PositionedSkippedToken;
})(TypeScript || (TypeScript = {}));
