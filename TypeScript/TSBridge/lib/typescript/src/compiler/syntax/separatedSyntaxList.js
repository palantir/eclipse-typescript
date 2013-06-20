var TypeScript;
(function (TypeScript) {
    (function (Syntax) {
        var EmptySeparatedSyntaxList = (function () {
            function EmptySeparatedSyntaxList() {
            }
            EmptySeparatedSyntaxList.prototype.kind = function () {
                return TypeScript.SyntaxKind.SeparatedList;
            };

            EmptySeparatedSyntaxList.prototype.isNode = function () {
                return false;
            };

            EmptySeparatedSyntaxList.prototype.isToken = function () {
                return false;
            };

            EmptySeparatedSyntaxList.prototype.isList = function () {
                return false;
            };

            EmptySeparatedSyntaxList.prototype.isSeparatedList = function () {
                return true;
            };

            EmptySeparatedSyntaxList.prototype.toJSON = function (key) {
                return [];
            };

            EmptySeparatedSyntaxList.prototype.childCount = function () {
                return 0;
            };

            EmptySeparatedSyntaxList.prototype.nonSeparatorCount = function () {
                return 0;
            };

            EmptySeparatedSyntaxList.prototype.separatorCount = function () {
                return 0;
            };

            EmptySeparatedSyntaxList.prototype.toArray = function () {
                return [];
            };

            EmptySeparatedSyntaxList.prototype.toNonSeparatorArray = function () {
                return [];
            };

            EmptySeparatedSyntaxList.prototype.childAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange("index");
            };

            EmptySeparatedSyntaxList.prototype.nonSeparatorAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange("index");
            };

            EmptySeparatedSyntaxList.prototype.separatorAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange("index");
            };

            EmptySeparatedSyntaxList.prototype.collectTextElements = function (elements) {
            };

            EmptySeparatedSyntaxList.prototype.firstToken = function () {
                return null;
            };

            EmptySeparatedSyntaxList.prototype.lastToken = function () {
                return null;
            };

            EmptySeparatedSyntaxList.prototype.fullWidth = function () {
                return 0;
            };

            EmptySeparatedSyntaxList.prototype.fullText = function () {
                return "";
            };

            EmptySeparatedSyntaxList.prototype.width = function () {
                return 0;
            };

            EmptySeparatedSyntaxList.prototype.isTypeScriptSpecific = function () {
                return false;
            };

            EmptySeparatedSyntaxList.prototype.isIncrementallyUnusable = function () {
                return false;
            };

            EmptySeparatedSyntaxList.prototype.findTokenInternal = function (parent, position, fullStart) {
                throw TypeScript.Errors.invalidOperation();
            };

            EmptySeparatedSyntaxList.prototype.insertChildrenInto = function (array, index) {
            };

            EmptySeparatedSyntaxList.prototype.leadingTrivia = function () {
                return Syntax.emptyTriviaList;
            };

            EmptySeparatedSyntaxList.prototype.trailingTrivia = function () {
                return Syntax.emptyTriviaList;
            };

            EmptySeparatedSyntaxList.prototype.leadingTriviaWidth = function () {
                return 0;
            };

            EmptySeparatedSyntaxList.prototype.trailingTriviaWidth = function () {
                return 0;
            };
            return EmptySeparatedSyntaxList;
        })();

        Syntax.emptySeparatedList = new EmptySeparatedSyntaxList();

        var SingletonSeparatedSyntaxList = (function () {
            function SingletonSeparatedSyntaxList(item) {
                this.item = item;
            }
            SingletonSeparatedSyntaxList.prototype.toJSON = function (key) {
                return [this.item];
            };

            SingletonSeparatedSyntaxList.prototype.kind = function () {
                return TypeScript.SyntaxKind.SeparatedList;
            };

            SingletonSeparatedSyntaxList.prototype.isNode = function () {
                return false;
            };
            SingletonSeparatedSyntaxList.prototype.isToken = function () {
                return false;
            };
            SingletonSeparatedSyntaxList.prototype.isList = function () {
                return false;
            };
            SingletonSeparatedSyntaxList.prototype.isSeparatedList = function () {
                return true;
            };

            SingletonSeparatedSyntaxList.prototype.childCount = function () {
                return 1;
            };
            SingletonSeparatedSyntaxList.prototype.nonSeparatorCount = function () {
                return 1;
            };
            SingletonSeparatedSyntaxList.prototype.separatorCount = function () {
                return 0;
            };

            SingletonSeparatedSyntaxList.prototype.toArray = function () {
                return [this.item];
            };
            SingletonSeparatedSyntaxList.prototype.toNonSeparatorArray = function () {
                return [this.item];
            };

            SingletonSeparatedSyntaxList.prototype.childAt = function (index) {
                if (index !== 0) {
                    throw TypeScript.Errors.argumentOutOfRange("index");
                }

                return this.item;
            };

            SingletonSeparatedSyntaxList.prototype.nonSeparatorAt = function (index) {
                if (index !== 0) {
                    throw TypeScript.Errors.argumentOutOfRange("index");
                }

                return this.item;
            };

            SingletonSeparatedSyntaxList.prototype.separatorAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange("index");
            };

            SingletonSeparatedSyntaxList.prototype.collectTextElements = function (elements) {
                this.item.collectTextElements(elements);
            };

            SingletonSeparatedSyntaxList.prototype.firstToken = function () {
                return this.item.firstToken();
            };

            SingletonSeparatedSyntaxList.prototype.lastToken = function () {
                return this.item.lastToken();
            };

            SingletonSeparatedSyntaxList.prototype.fullWidth = function () {
                return this.item.fullWidth();
            };

            SingletonSeparatedSyntaxList.prototype.width = function () {
                return this.item.width();
            };

            SingletonSeparatedSyntaxList.prototype.fullText = function () {
                return this.item.fullText();
            };

            SingletonSeparatedSyntaxList.prototype.leadingTrivia = function () {
                return this.item.leadingTrivia();
            };

            SingletonSeparatedSyntaxList.prototype.trailingTrivia = function () {
                return this.item.trailingTrivia();
            };

            SingletonSeparatedSyntaxList.prototype.leadingTriviaWidth = function () {
                return this.item.leadingTriviaWidth();
            };

            SingletonSeparatedSyntaxList.prototype.trailingTriviaWidth = function () {
                return this.item.trailingTriviaWidth();
            };

            SingletonSeparatedSyntaxList.prototype.isTypeScriptSpecific = function () {
                return this.item.isTypeScriptSpecific();
            };

            SingletonSeparatedSyntaxList.prototype.isIncrementallyUnusable = function () {
                return this.item.isIncrementallyUnusable();
            };

            SingletonSeparatedSyntaxList.prototype.findTokenInternal = function (parent, position, fullStart) {
                return (this.item).findTokenInternal(new TypeScript.PositionedSeparatedList(parent, this, fullStart), position, fullStart);
            };

            SingletonSeparatedSyntaxList.prototype.insertChildrenInto = function (array, index) {
                array.splice(index, 0, this.item);
            };
            return SingletonSeparatedSyntaxList;
        })();

        var NormalSeparatedSyntaxList = (function () {
            function NormalSeparatedSyntaxList(elements) {
                this._data = 0;
                this.elements = elements;
            }
            NormalSeparatedSyntaxList.prototype.kind = function () {
                return TypeScript.SyntaxKind.SeparatedList;
            };

            NormalSeparatedSyntaxList.prototype.isToken = function () {
                return false;
            };
            NormalSeparatedSyntaxList.prototype.isNode = function () {
                return false;
            };
            NormalSeparatedSyntaxList.prototype.isList = function () {
                return false;
            };
            NormalSeparatedSyntaxList.prototype.isSeparatedList = function () {
                return true;
            };
            NormalSeparatedSyntaxList.prototype.toJSON = function (key) {
                return this.elements;
            };

            NormalSeparatedSyntaxList.prototype.childCount = function () {
                return this.elements.length;
            };
            NormalSeparatedSyntaxList.prototype.nonSeparatorCount = function () {
                return TypeScript.IntegerUtilities.integerDivide(this.elements.length + 1, 2);
            };
            NormalSeparatedSyntaxList.prototype.separatorCount = function () {
                return TypeScript.IntegerUtilities.integerDivide(this.elements.length, 2);
            };

            NormalSeparatedSyntaxList.prototype.toArray = function () {
                return this.elements.slice(0);
            };

            NormalSeparatedSyntaxList.prototype.toNonSeparatorArray = function () {
                var result = [];
                for (var i = 0, n = this.nonSeparatorCount(); i < n; i++) {
                    result.push(this.nonSeparatorAt(i));
                }

                return result;
            };

            NormalSeparatedSyntaxList.prototype.childAt = function (index) {
                if (index < 0 || index >= this.elements.length) {
                    throw TypeScript.Errors.argumentOutOfRange("index");
                }

                return this.elements[index];
            };

            NormalSeparatedSyntaxList.prototype.nonSeparatorAt = function (index) {
                var value = index * 2;
                if (value < 0 || value >= this.elements.length) {
                    throw TypeScript.Errors.argumentOutOfRange("index");
                }

                return this.elements[value];
            };

            NormalSeparatedSyntaxList.prototype.separatorAt = function (index) {
                var value = index * 2 + 1;
                if (value < 0 || value >= this.elements.length) {
                    throw TypeScript.Errors.argumentOutOfRange("index");
                }

                return this.elements[value];
            };

            NormalSeparatedSyntaxList.prototype.firstToken = function () {
                var token;
                for (var i = 0, n = this.elements.length; i < n; i++) {
                    if (i % 2 === 0) {
                        var nodeOrToken = this.elements[i];
                        token = nodeOrToken.firstToken();
                        if (token !== null) {
                            return token;
                        }
                    } else {
                        token = this.elements[i];
                        if (token.width() > 0) {
                            return token;
                        }
                    }
                }

                return null;
            };

            NormalSeparatedSyntaxList.prototype.lastToken = function () {
                var token;
                for (var i = this.elements.length - 1; i >= 0; i--) {
                    if (i % 2 === 0) {
                        var nodeOrToken = this.elements[i];
                        token = nodeOrToken.lastToken();
                        if (token !== null) {
                            return token;
                        }
                    } else {
                        token = this.elements[i];
                        if (token.width() > 0) {
                            return token;
                        }
                    }
                }

                return null;
            };

            NormalSeparatedSyntaxList.prototype.fullText = function () {
                var elements = [];
                this.collectTextElements(elements);
                return elements.join("");
            };

            NormalSeparatedSyntaxList.prototype.isTypeScriptSpecific = function () {
                for (var i = 0, n = this.nonSeparatorCount(); i < n; i++) {
                    if (this.nonSeparatorAt(i).isTypeScriptSpecific()) {
                        return true;
                    }
                }

                return false;
            };

            NormalSeparatedSyntaxList.prototype.isIncrementallyUnusable = function () {
                return (this.data() & TypeScript.SyntaxConstants.NodeIncrementallyUnusableMask) !== 0;
            };

            NormalSeparatedSyntaxList.prototype.fullWidth = function () {
                return this.data() >>> TypeScript.SyntaxConstants.NodeFullWidthShift;
            };

            NormalSeparatedSyntaxList.prototype.width = function () {
                var fullWidth = this.fullWidth();
                return fullWidth - this.leadingTriviaWidth() - this.trailingTriviaWidth();
            };

            NormalSeparatedSyntaxList.prototype.leadingTrivia = function () {
                return this.firstToken().leadingTrivia();
            };

            NormalSeparatedSyntaxList.prototype.trailingTrivia = function () {
                return this.lastToken().trailingTrivia();
            };

            NormalSeparatedSyntaxList.prototype.leadingTriviaWidth = function () {
                return this.firstToken().leadingTriviaWidth();
            };

            NormalSeparatedSyntaxList.prototype.trailingTriviaWidth = function () {
                return this.lastToken().trailingTriviaWidth();
            };

            NormalSeparatedSyntaxList.prototype.computeData = function () {
                var fullWidth = 0;
                var isIncrementallyUnusable = false;

                for (var i = 0, n = this.elements.length; i < n; i++) {
                    var element = this.elements[i];

                    var childWidth = element.fullWidth();
                    fullWidth += childWidth;

                    isIncrementallyUnusable = isIncrementallyUnusable || element.isIncrementallyUnusable();
                }

                return (fullWidth << TypeScript.SyntaxConstants.NodeFullWidthShift) | (isIncrementallyUnusable ? TypeScript.SyntaxConstants.NodeIncrementallyUnusableMask : 0) | TypeScript.SyntaxConstants.NodeDataComputed;
            };

            NormalSeparatedSyntaxList.prototype.data = function () {
                if ((this._data & TypeScript.SyntaxConstants.NodeDataComputed) === 0) {
                    this._data = this.computeData();
                }

                return this._data;
            };

            NormalSeparatedSyntaxList.prototype.findTokenInternal = function (parent, position, fullStart) {
                parent = new TypeScript.PositionedSeparatedList(parent, this, fullStart);
                for (var i = 0, n = this.elements.length; i < n; i++) {
                    var element = this.elements[i];

                    var childWidth = element.fullWidth();
                    if (position < childWidth) {
                        return (element).findTokenInternal(parent, position, fullStart);
                    }

                    position -= childWidth;
                    fullStart += childWidth;
                }

                throw TypeScript.Errors.invalidOperation();
            };

            NormalSeparatedSyntaxList.prototype.collectTextElements = function (elements) {
                for (var i = 0, n = this.elements.length; i < n; i++) {
                    var element = this.elements[i];
                    element.collectTextElements(elements);
                }
            };

            NormalSeparatedSyntaxList.prototype.insertChildrenInto = function (array, index) {
                if (index === 0) {
                    array.unshift.apply(array, this.elements);
                } else {
                    array.splice.apply(array, [index, 0].concat(this.elements));
                }
            };
            return NormalSeparatedSyntaxList;
        })();

        function separatedList(nodes) {
            return separatedListAndValidate(nodes, false);
        }
        Syntax.separatedList = separatedList;

        function separatedListAndValidate(nodes, validate) {
            if (nodes === undefined || nodes === null || nodes.length === 0) {
                return Syntax.emptySeparatedList;
            }

            if (validate) {
                for (var i = 0; i < nodes.length; i++) {
                    var item = nodes[i];

                    if (i % 2 === 1) {
                    }
                }
            }

            if (nodes.length === 1) {
                return new SingletonSeparatedSyntaxList(nodes[0]);
            }

            return new NormalSeparatedSyntaxList(nodes);
        }
    })(TypeScript.Syntax || (TypeScript.Syntax = {}));
    var Syntax = TypeScript.Syntax;
})(TypeScript || (TypeScript = {}));
