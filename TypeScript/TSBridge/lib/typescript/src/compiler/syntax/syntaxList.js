var TypeScript;
(function (TypeScript) {
    (function (Syntax) {
        var EmptySyntaxList = (function () {
            function EmptySyntaxList() {
            }
            EmptySyntaxList.prototype.kind = function () {
                return TypeScript.SyntaxKind.List;
            };

            EmptySyntaxList.prototype.isNode = function () {
                return false;
            };
            EmptySyntaxList.prototype.isToken = function () {
                return false;
            };
            EmptySyntaxList.prototype.isList = function () {
                return true;
            };
            EmptySyntaxList.prototype.isSeparatedList = function () {
                return false;
            };

            EmptySyntaxList.prototype.toJSON = function (key) {
                return [];
            };

            EmptySyntaxList.prototype.childCount = function () {
                return 0;
            };

            EmptySyntaxList.prototype.childAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange("index");
            };

            EmptySyntaxList.prototype.toArray = function () {
                return [];
            };

            EmptySyntaxList.prototype.collectTextElements = function (elements) {
            };

            EmptySyntaxList.prototype.firstToken = function () {
                return null;
            };

            EmptySyntaxList.prototype.lastToken = function () {
                return null;
            };

            EmptySyntaxList.prototype.fullWidth = function () {
                return 0;
            };

            EmptySyntaxList.prototype.width = function () {
                return 0;
            };

            EmptySyntaxList.prototype.leadingTrivia = function () {
                return TypeScript.Syntax.emptyTriviaList;
            };

            EmptySyntaxList.prototype.trailingTrivia = function () {
                return TypeScript.Syntax.emptyTriviaList;
            };

            EmptySyntaxList.prototype.leadingTriviaWidth = function () {
                return 0;
            };

            EmptySyntaxList.prototype.trailingTriviaWidth = function () {
                return 0;
            };

            EmptySyntaxList.prototype.fullText = function () {
                return "";
            };

            EmptySyntaxList.prototype.isTypeScriptSpecific = function () {
                return false;
            };

            EmptySyntaxList.prototype.isIncrementallyUnusable = function () {
                return false;
            };

            EmptySyntaxList.prototype.findTokenInternal = function (parent, position, fullStart) {
                throw TypeScript.Errors.invalidOperation();
            };

            EmptySyntaxList.prototype.insertChildrenInto = function (array, index) {
            };
            return EmptySyntaxList;
        })();
        Syntax.EmptySyntaxList = EmptySyntaxList;

        Syntax.emptyList = new EmptySyntaxList();

        var SingletonSyntaxList = (function () {
            function SingletonSyntaxList(item) {
                this.item = item;
            }
            SingletonSyntaxList.prototype.kind = function () {
                return TypeScript.SyntaxKind.List;
            };

            SingletonSyntaxList.prototype.isToken = function () {
                return false;
            };
            SingletonSyntaxList.prototype.isNode = function () {
                return false;
            };
            SingletonSyntaxList.prototype.isList = function () {
                return true;
            };
            SingletonSyntaxList.prototype.isSeparatedList = function () {
                return false;
            };

            SingletonSyntaxList.prototype.toJSON = function (key) {
                return [this.item];
            };

            SingletonSyntaxList.prototype.childCount = function () {
                return 1;
            };

            SingletonSyntaxList.prototype.childAt = function (index) {
                if (index !== 0) {
                    throw TypeScript.Errors.argumentOutOfRange("index");
                }

                return this.item;
            };

            SingletonSyntaxList.prototype.toArray = function () {
                return [this.item];
            };

            SingletonSyntaxList.prototype.collectTextElements = function (elements) {
                this.item.collectTextElements(elements);
            };

            SingletonSyntaxList.prototype.firstToken = function () {
                return this.item.firstToken();
            };

            SingletonSyntaxList.prototype.lastToken = function () {
                return this.item.lastToken();
            };

            SingletonSyntaxList.prototype.fullWidth = function () {
                return this.item.fullWidth();
            };

            SingletonSyntaxList.prototype.width = function () {
                return this.item.width();
            };

            SingletonSyntaxList.prototype.leadingTrivia = function () {
                return this.item.leadingTrivia();
            };

            SingletonSyntaxList.prototype.trailingTrivia = function () {
                return this.item.trailingTrivia();
            };

            SingletonSyntaxList.prototype.leadingTriviaWidth = function () {
                return this.item.leadingTriviaWidth();
            };

            SingletonSyntaxList.prototype.trailingTriviaWidth = function () {
                return this.item.trailingTriviaWidth();
            };

            SingletonSyntaxList.prototype.fullText = function () {
                return this.item.fullText();
            };

            SingletonSyntaxList.prototype.isTypeScriptSpecific = function () {
                return this.item.isTypeScriptSpecific();
            };

            SingletonSyntaxList.prototype.isIncrementallyUnusable = function () {
                return this.item.isIncrementallyUnusable();
            };

            SingletonSyntaxList.prototype.findTokenInternal = function (parent, position, fullStart) {
                return (this.item).findTokenInternal(new TypeScript.PositionedList(parent, this, fullStart), position, fullStart);
            };

            SingletonSyntaxList.prototype.insertChildrenInto = function (array, index) {
                array.splice(index, 0, this.item);
            };
            return SingletonSyntaxList;
        })();

        var NormalSyntaxList = (function () {
            function NormalSyntaxList(nodeOrTokens) {
                this._data = 0;
                this.nodeOrTokens = nodeOrTokens;
            }
            NormalSyntaxList.prototype.kind = function () {
                return TypeScript.SyntaxKind.List;
            };

            NormalSyntaxList.prototype.isNode = function () {
                return false;
            };
            NormalSyntaxList.prototype.isToken = function () {
                return false;
            };
            NormalSyntaxList.prototype.isList = function () {
                return true;
            };
            NormalSyntaxList.prototype.isSeparatedList = function () {
                return false;
            };

            NormalSyntaxList.prototype.toJSON = function (key) {
                return this.nodeOrTokens;
            };

            NormalSyntaxList.prototype.childCount = function () {
                return this.nodeOrTokens.length;
            };

            NormalSyntaxList.prototype.childAt = function (index) {
                if (index < 0 || index >= this.nodeOrTokens.length) {
                    throw TypeScript.Errors.argumentOutOfRange("index");
                }

                return this.nodeOrTokens[index];
            };

            NormalSyntaxList.prototype.toArray = function () {
                return this.nodeOrTokens.slice(0);
            };

            NormalSyntaxList.prototype.collectTextElements = function (elements) {
                for (var i = 0, n = this.nodeOrTokens.length; i < n; i++) {
                    var element = this.nodeOrTokens[i];
                    element.collectTextElements(elements);
                }
            };

            NormalSyntaxList.prototype.firstToken = function () {
                for (var i = 0, n = this.nodeOrTokens.length; i < n; i++) {
                    var token = this.nodeOrTokens[i].firstToken();
                    if (token !== null) {
                        return token;
                    }
                }

                return null;
            };

            NormalSyntaxList.prototype.lastToken = function () {
                for (var i = this.nodeOrTokens.length - 1; i >= 0; i--) {
                    var token = this.nodeOrTokens[i].lastToken();
                    if (token !== null) {
                        return token;
                    }
                }

                return null;
            };

            NormalSyntaxList.prototype.fullText = function () {
                var elements = [];
                this.collectTextElements(elements);
                return elements.join("");
            };

            NormalSyntaxList.prototype.isTypeScriptSpecific = function () {
                for (var i = 0, n = this.nodeOrTokens.length; i < n; i++) {
                    if (this.nodeOrTokens[i].isTypeScriptSpecific()) {
                        return true;
                    }
                }

                return false;
            };

            NormalSyntaxList.prototype.isIncrementallyUnusable = function () {
                return (this.data() & TypeScript.SyntaxConstants.NodeIncrementallyUnusableMask) !== 0;
            };

            NormalSyntaxList.prototype.fullWidth = function () {
                return this.data() >>> TypeScript.SyntaxConstants.NodeFullWidthShift;
            };

            NormalSyntaxList.prototype.width = function () {
                var fullWidth = this.fullWidth();
                return fullWidth - this.leadingTriviaWidth() - this.trailingTriviaWidth();
            };

            NormalSyntaxList.prototype.leadingTrivia = function () {
                return this.firstToken().leadingTrivia();
            };

            NormalSyntaxList.prototype.trailingTrivia = function () {
                return this.lastToken().trailingTrivia();
            };

            NormalSyntaxList.prototype.leadingTriviaWidth = function () {
                return this.firstToken().leadingTriviaWidth();
            };

            NormalSyntaxList.prototype.trailingTriviaWidth = function () {
                return this.lastToken().trailingTriviaWidth();
            };

            NormalSyntaxList.prototype.computeData = function () {
                var fullWidth = 0;
                var isIncrementallyUnusable = false;

                for (var i = 0, n = this.nodeOrTokens.length; i < n; i++) {
                    var node = this.nodeOrTokens[i];
                    fullWidth += node.fullWidth();
                    isIncrementallyUnusable = isIncrementallyUnusable || node.isIncrementallyUnusable();
                }

                return (fullWidth << TypeScript.SyntaxConstants.NodeFullWidthShift) | (isIncrementallyUnusable ? TypeScript.SyntaxConstants.NodeIncrementallyUnusableMask : 0) | TypeScript.SyntaxConstants.NodeDataComputed;
            };

            NormalSyntaxList.prototype.data = function () {
                if ((this._data & TypeScript.SyntaxConstants.NodeDataComputed) === 0) {
                    this._data = this.computeData();
                }

                return this._data;
            };

            NormalSyntaxList.prototype.findTokenInternal = function (parent, position, fullStart) {
                parent = new TypeScript.PositionedList(parent, this, fullStart);
                for (var i = 0, n = this.nodeOrTokens.length; i < n; i++) {
                    var nodeOrToken = this.nodeOrTokens[i];

                    var childWidth = nodeOrToken.fullWidth();
                    if (position < childWidth) {
                        return (nodeOrToken).findTokenInternal(parent, position, fullStart);
                    }

                    position -= childWidth;
                    fullStart += childWidth;
                }

                throw TypeScript.Errors.invalidOperation();
            };

            NormalSyntaxList.prototype.insertChildrenInto = function (array, index) {
                if (index === 0) {
                    array.unshift.apply(array, this.nodeOrTokens);
                } else {
                    array.splice.apply(array, [index, 0].concat(this.nodeOrTokens));
                }
            };
            return NormalSyntaxList;
        })();

        function list(nodes) {
            if (nodes === undefined || nodes === null || nodes.length === 0) {
                return Syntax.emptyList;
            }

            if (nodes.length === 1) {
                var item = nodes[0];
                return new SingletonSyntaxList(item);
            }

            return new NormalSyntaxList(nodes);
        }
        Syntax.list = list;
    })(TypeScript.Syntax || (TypeScript.Syntax = {}));
    var Syntax = TypeScript.Syntax;
})(TypeScript || (TypeScript = {}));
