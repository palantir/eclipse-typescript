var TypeScript;
(function (TypeScript) {
    (function (Syntax) {
        var VariableWidthTokenWithNoTrivia = (function () {
            function VariableWidthTokenWithNoTrivia(sourceText, fullStart, kind, textOrWidth) {
                this._sourceText = sourceText;
                this._fullStart = fullStart;
                this.tokenKind = kind;
                this._textOrWidth = textOrWidth;
            }
            VariableWidthTokenWithNoTrivia.prototype.clone = function () {
                return new VariableWidthTokenWithNoTrivia(this._sourceText, this._fullStart, this.tokenKind, this._textOrWidth);
            };

            VariableWidthTokenWithNoTrivia.prototype.isNode = function () {
                return false;
            };
            VariableWidthTokenWithNoTrivia.prototype.isToken = function () {
                return true;
            };
            VariableWidthTokenWithNoTrivia.prototype.isList = function () {
                return false;
            };
            VariableWidthTokenWithNoTrivia.prototype.isSeparatedList = function () {
                return false;
            };

            VariableWidthTokenWithNoTrivia.prototype.kind = function () {
                return this.tokenKind;
            };

            VariableWidthTokenWithNoTrivia.prototype.childCount = function () {
                return 0;
            };
            VariableWidthTokenWithNoTrivia.prototype.childAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange('index');
            };

            VariableWidthTokenWithNoTrivia.prototype.fullWidth = function () {
                return this.width();
            };
            VariableWidthTokenWithNoTrivia.prototype.start = function () {
                return this._fullStart;
            };
            VariableWidthTokenWithNoTrivia.prototype.end = function () {
                return this.start() + this.width();
            };

            VariableWidthTokenWithNoTrivia.prototype.width = function () {
                return typeof this._textOrWidth === 'number' ? this._textOrWidth : this._textOrWidth.length;
            };

            VariableWidthTokenWithNoTrivia.prototype.text = function () {
                if (typeof this._textOrWidth === 'number') {
                    this._textOrWidth = this._sourceText.substr(this.start(), this._textOrWidth, this.tokenKind === TypeScript.SyntaxKind.IdentifierName);
                }

                return this._textOrWidth;
            };

            VariableWidthTokenWithNoTrivia.prototype.fullText = function () {
                return this._sourceText.substr(this._fullStart, this.fullWidth(), false);
            };

            VariableWidthTokenWithNoTrivia.prototype.value = function () {
                if ((this)._value === undefined) {
                    (this)._value = Syntax.value(this);
                }

                return (this)._value;
            };

            VariableWidthTokenWithNoTrivia.prototype.valueText = function () {
                if ((this)._valueText === undefined) {
                    (this)._valueText = Syntax.valueText(this);
                }

                return (this)._valueText;
            };

            VariableWidthTokenWithNoTrivia.prototype.hasLeadingTrivia = function () {
                return false;
            };
            VariableWidthTokenWithNoTrivia.prototype.hasLeadingComment = function () {
                return false;
            };
            VariableWidthTokenWithNoTrivia.prototype.hasLeadingNewLine = function () {
                return false;
            };
            VariableWidthTokenWithNoTrivia.prototype.hasLeadingSkippedText = function () {
                return false;
            };
            VariableWidthTokenWithNoTrivia.prototype.leadingTriviaWidth = function () {
                return 0;
            };
            VariableWidthTokenWithNoTrivia.prototype.leadingTrivia = function () {
                return TypeScript.Syntax.emptyTriviaList;
            };

            VariableWidthTokenWithNoTrivia.prototype.hasTrailingTrivia = function () {
                return false;
            };
            VariableWidthTokenWithNoTrivia.prototype.hasTrailingComment = function () {
                return false;
            };
            VariableWidthTokenWithNoTrivia.prototype.hasTrailingNewLine = function () {
                return false;
            };
            VariableWidthTokenWithNoTrivia.prototype.hasTrailingSkippedText = function () {
                return false;
            };
            VariableWidthTokenWithNoTrivia.prototype.trailingTriviaWidth = function () {
                return 0;
            };
            VariableWidthTokenWithNoTrivia.prototype.trailingTrivia = function () {
                return TypeScript.Syntax.emptyTriviaList;
            };

            VariableWidthTokenWithNoTrivia.prototype.hasSkippedToken = function () {
                return false;
            };
            VariableWidthTokenWithNoTrivia.prototype.toJSON = function (key) {
                return Syntax.tokenToJSON(this);
            };
            VariableWidthTokenWithNoTrivia.prototype.firstToken = function () {
                return this;
            };
            VariableWidthTokenWithNoTrivia.prototype.lastToken = function () {
                return this;
            };
            VariableWidthTokenWithNoTrivia.prototype.isTypeScriptSpecific = function () {
                return false;
            };
            VariableWidthTokenWithNoTrivia.prototype.isIncrementallyUnusable = function () {
                return this.fullWidth() === 0 || TypeScript.SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind);
            };
            VariableWidthTokenWithNoTrivia.prototype.accept = function (visitor) {
                return visitor.visitToken(this);
            };
            VariableWidthTokenWithNoTrivia.prototype.realize = function () {
                return Syntax.realizeToken(this);
            };
            VariableWidthTokenWithNoTrivia.prototype.collectTextElements = function (elements) {
                collectTokenTextElements(this, elements);
            };

            VariableWidthTokenWithNoTrivia.prototype.findTokenInternal = function (parent, position, fullStart) {
                return new TypeScript.PositionedToken(parent, this, fullStart);
            };

            VariableWidthTokenWithNoTrivia.prototype.withLeadingTrivia = function (leadingTrivia) {
                return this.realize().withLeadingTrivia(leadingTrivia);
            };

            VariableWidthTokenWithNoTrivia.prototype.withTrailingTrivia = function (trailingTrivia) {
                return this.realize().withTrailingTrivia(trailingTrivia);
            };
            return VariableWidthTokenWithNoTrivia;
        })();
        Syntax.VariableWidthTokenWithNoTrivia = VariableWidthTokenWithNoTrivia;

        var VariableWidthTokenWithLeadingTrivia = (function () {
            function VariableWidthTokenWithLeadingTrivia(sourceText, fullStart, kind, leadingTriviaInfo, textOrWidth) {
                this._sourceText = sourceText;
                this._fullStart = fullStart;
                this.tokenKind = kind;
                this._leadingTriviaInfo = leadingTriviaInfo;
                this._textOrWidth = textOrWidth;
            }
            VariableWidthTokenWithLeadingTrivia.prototype.clone = function () {
                return new VariableWidthTokenWithLeadingTrivia(this._sourceText, this._fullStart, this.tokenKind, this._leadingTriviaInfo, this._textOrWidth);
            };

            VariableWidthTokenWithLeadingTrivia.prototype.isNode = function () {
                return false;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.isToken = function () {
                return true;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.isList = function () {
                return false;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.isSeparatedList = function () {
                return false;
            };

            VariableWidthTokenWithLeadingTrivia.prototype.kind = function () {
                return this.tokenKind;
            };

            VariableWidthTokenWithLeadingTrivia.prototype.childCount = function () {
                return 0;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.childAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange('index');
            };

            VariableWidthTokenWithLeadingTrivia.prototype.fullWidth = function () {
                return getTriviaWidth(this._leadingTriviaInfo) + this.width();
            };
            VariableWidthTokenWithLeadingTrivia.prototype.start = function () {
                return this._fullStart + getTriviaWidth(this._leadingTriviaInfo);
            };
            VariableWidthTokenWithLeadingTrivia.prototype.end = function () {
                return this.start() + this.width();
            };

            VariableWidthTokenWithLeadingTrivia.prototype.width = function () {
                return typeof this._textOrWidth === 'number' ? this._textOrWidth : this._textOrWidth.length;
            };

            VariableWidthTokenWithLeadingTrivia.prototype.text = function () {
                if (typeof this._textOrWidth === 'number') {
                    this._textOrWidth = this._sourceText.substr(this.start(), this._textOrWidth, this.tokenKind === TypeScript.SyntaxKind.IdentifierName);
                }

                return this._textOrWidth;
            };

            VariableWidthTokenWithLeadingTrivia.prototype.fullText = function () {
                return this._sourceText.substr(this._fullStart, this.fullWidth(), false);
            };

            VariableWidthTokenWithLeadingTrivia.prototype.value = function () {
                if ((this)._value === undefined) {
                    (this)._value = Syntax.value(this);
                }

                return (this)._value;
            };

            VariableWidthTokenWithLeadingTrivia.prototype.valueText = function () {
                if ((this)._valueText === undefined) {
                    (this)._valueText = Syntax.valueText(this);
                }

                return (this)._valueText;
            };

            VariableWidthTokenWithLeadingTrivia.prototype.hasLeadingTrivia = function () {
                return true;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.hasLeadingComment = function () {
                return hasTriviaComment(this._leadingTriviaInfo);
            };
            VariableWidthTokenWithLeadingTrivia.prototype.hasLeadingNewLine = function () {
                return hasTriviaNewLine(this._leadingTriviaInfo);
            };
            VariableWidthTokenWithLeadingTrivia.prototype.hasLeadingSkippedText = function () {
                return false;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.leadingTriviaWidth = function () {
                return getTriviaWidth(this._leadingTriviaInfo);
            };
            VariableWidthTokenWithLeadingTrivia.prototype.leadingTrivia = function () {
                return TypeScript.Scanner.scanTrivia(this._sourceText, this._fullStart, getTriviaWidth(this._leadingTriviaInfo), false);
            };

            VariableWidthTokenWithLeadingTrivia.prototype.hasTrailingTrivia = function () {
                return false;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.hasTrailingComment = function () {
                return false;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.hasTrailingNewLine = function () {
                return false;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.hasTrailingSkippedText = function () {
                return false;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.trailingTriviaWidth = function () {
                return 0;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.trailingTrivia = function () {
                return TypeScript.Syntax.emptyTriviaList;
            };

            VariableWidthTokenWithLeadingTrivia.prototype.hasSkippedToken = function () {
                return false;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.toJSON = function (key) {
                return Syntax.tokenToJSON(this);
            };
            VariableWidthTokenWithLeadingTrivia.prototype.firstToken = function () {
                return this;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.lastToken = function () {
                return this;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.isTypeScriptSpecific = function () {
                return false;
            };
            VariableWidthTokenWithLeadingTrivia.prototype.isIncrementallyUnusable = function () {
                return this.fullWidth() === 0 || TypeScript.SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind);
            };
            VariableWidthTokenWithLeadingTrivia.prototype.accept = function (visitor) {
                return visitor.visitToken(this);
            };
            VariableWidthTokenWithLeadingTrivia.prototype.realize = function () {
                return Syntax.realizeToken(this);
            };
            VariableWidthTokenWithLeadingTrivia.prototype.collectTextElements = function (elements) {
                collectTokenTextElements(this, elements);
            };

            VariableWidthTokenWithLeadingTrivia.prototype.findTokenInternal = function (parent, position, fullStart) {
                return new TypeScript.PositionedToken(parent, this, fullStart);
            };

            VariableWidthTokenWithLeadingTrivia.prototype.withLeadingTrivia = function (leadingTrivia) {
                return this.realize().withLeadingTrivia(leadingTrivia);
            };

            VariableWidthTokenWithLeadingTrivia.prototype.withTrailingTrivia = function (trailingTrivia) {
                return this.realize().withTrailingTrivia(trailingTrivia);
            };
            return VariableWidthTokenWithLeadingTrivia;
        })();
        Syntax.VariableWidthTokenWithLeadingTrivia = VariableWidthTokenWithLeadingTrivia;

        var VariableWidthTokenWithTrailingTrivia = (function () {
            function VariableWidthTokenWithTrailingTrivia(sourceText, fullStart, kind, textOrWidth, trailingTriviaInfo) {
                this._sourceText = sourceText;
                this._fullStart = fullStart;
                this.tokenKind = kind;
                this._textOrWidth = textOrWidth;
                this._trailingTriviaInfo = trailingTriviaInfo;
            }
            VariableWidthTokenWithTrailingTrivia.prototype.clone = function () {
                return new VariableWidthTokenWithTrailingTrivia(this._sourceText, this._fullStart, this.tokenKind, this._textOrWidth, this._trailingTriviaInfo);
            };

            VariableWidthTokenWithTrailingTrivia.prototype.isNode = function () {
                return false;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.isToken = function () {
                return true;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.isList = function () {
                return false;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.isSeparatedList = function () {
                return false;
            };

            VariableWidthTokenWithTrailingTrivia.prototype.kind = function () {
                return this.tokenKind;
            };

            VariableWidthTokenWithTrailingTrivia.prototype.childCount = function () {
                return 0;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.childAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange('index');
            };

            VariableWidthTokenWithTrailingTrivia.prototype.fullWidth = function () {
                return this.width() + getTriviaWidth(this._trailingTriviaInfo);
            };
            VariableWidthTokenWithTrailingTrivia.prototype.start = function () {
                return this._fullStart;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.end = function () {
                return this.start() + this.width();
            };

            VariableWidthTokenWithTrailingTrivia.prototype.width = function () {
                return typeof this._textOrWidth === 'number' ? this._textOrWidth : this._textOrWidth.length;
            };

            VariableWidthTokenWithTrailingTrivia.prototype.text = function () {
                if (typeof this._textOrWidth === 'number') {
                    this._textOrWidth = this._sourceText.substr(this.start(), this._textOrWidth, this.tokenKind === TypeScript.SyntaxKind.IdentifierName);
                }

                return this._textOrWidth;
            };

            VariableWidthTokenWithTrailingTrivia.prototype.fullText = function () {
                return this._sourceText.substr(this._fullStart, this.fullWidth(), false);
            };

            VariableWidthTokenWithTrailingTrivia.prototype.value = function () {
                if ((this)._value === undefined) {
                    (this)._value = Syntax.value(this);
                }

                return (this)._value;
            };

            VariableWidthTokenWithTrailingTrivia.prototype.valueText = function () {
                if ((this)._valueText === undefined) {
                    (this)._valueText = Syntax.valueText(this);
                }

                return (this)._valueText;
            };

            VariableWidthTokenWithTrailingTrivia.prototype.hasLeadingTrivia = function () {
                return false;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.hasLeadingComment = function () {
                return false;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.hasLeadingNewLine = function () {
                return false;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.hasLeadingSkippedText = function () {
                return false;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.leadingTriviaWidth = function () {
                return 0;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.leadingTrivia = function () {
                return TypeScript.Syntax.emptyTriviaList;
            };

            VariableWidthTokenWithTrailingTrivia.prototype.hasTrailingTrivia = function () {
                return true;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.hasTrailingComment = function () {
                return hasTriviaComment(this._trailingTriviaInfo);
            };
            VariableWidthTokenWithTrailingTrivia.prototype.hasTrailingNewLine = function () {
                return hasTriviaNewLine(this._trailingTriviaInfo);
            };
            VariableWidthTokenWithTrailingTrivia.prototype.hasTrailingSkippedText = function () {
                return false;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.trailingTriviaWidth = function () {
                return getTriviaWidth(this._trailingTriviaInfo);
            };
            VariableWidthTokenWithTrailingTrivia.prototype.trailingTrivia = function () {
                return TypeScript.Scanner.scanTrivia(this._sourceText, this.end(), getTriviaWidth(this._trailingTriviaInfo), true);
            };

            VariableWidthTokenWithTrailingTrivia.prototype.hasSkippedToken = function () {
                return false;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.toJSON = function (key) {
                return Syntax.tokenToJSON(this);
            };
            VariableWidthTokenWithTrailingTrivia.prototype.firstToken = function () {
                return this;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.lastToken = function () {
                return this;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.isTypeScriptSpecific = function () {
                return false;
            };
            VariableWidthTokenWithTrailingTrivia.prototype.isIncrementallyUnusable = function () {
                return this.fullWidth() === 0 || TypeScript.SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind);
            };
            VariableWidthTokenWithTrailingTrivia.prototype.accept = function (visitor) {
                return visitor.visitToken(this);
            };
            VariableWidthTokenWithTrailingTrivia.prototype.realize = function () {
                return Syntax.realizeToken(this);
            };
            VariableWidthTokenWithTrailingTrivia.prototype.collectTextElements = function (elements) {
                collectTokenTextElements(this, elements);
            };

            VariableWidthTokenWithTrailingTrivia.prototype.findTokenInternal = function (parent, position, fullStart) {
                return new TypeScript.PositionedToken(parent, this, fullStart);
            };

            VariableWidthTokenWithTrailingTrivia.prototype.withLeadingTrivia = function (leadingTrivia) {
                return this.realize().withLeadingTrivia(leadingTrivia);
            };

            VariableWidthTokenWithTrailingTrivia.prototype.withTrailingTrivia = function (trailingTrivia) {
                return this.realize().withTrailingTrivia(trailingTrivia);
            };
            return VariableWidthTokenWithTrailingTrivia;
        })();
        Syntax.VariableWidthTokenWithTrailingTrivia = VariableWidthTokenWithTrailingTrivia;

        var VariableWidthTokenWithLeadingAndTrailingTrivia = (function () {
            function VariableWidthTokenWithLeadingAndTrailingTrivia(sourceText, fullStart, kind, leadingTriviaInfo, textOrWidth, trailingTriviaInfo) {
                this._sourceText = sourceText;
                this._fullStart = fullStart;
                this.tokenKind = kind;
                this._leadingTriviaInfo = leadingTriviaInfo;
                this._textOrWidth = textOrWidth;
                this._trailingTriviaInfo = trailingTriviaInfo;
            }
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.clone = function () {
                return new VariableWidthTokenWithLeadingAndTrailingTrivia(this._sourceText, this._fullStart, this.tokenKind, this._leadingTriviaInfo, this._textOrWidth, this._trailingTriviaInfo);
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.isNode = function () {
                return false;
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.isToken = function () {
                return true;
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.isList = function () {
                return false;
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.isSeparatedList = function () {
                return false;
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.kind = function () {
                return this.tokenKind;
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.childCount = function () {
                return 0;
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.childAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange('index');
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.fullWidth = function () {
                return getTriviaWidth(this._leadingTriviaInfo) + this.width() + getTriviaWidth(this._trailingTriviaInfo);
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.start = function () {
                return this._fullStart + getTriviaWidth(this._leadingTriviaInfo);
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.end = function () {
                return this.start() + this.width();
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.width = function () {
                return typeof this._textOrWidth === 'number' ? this._textOrWidth : this._textOrWidth.length;
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.text = function () {
                if (typeof this._textOrWidth === 'number') {
                    this._textOrWidth = this._sourceText.substr(this.start(), this._textOrWidth, this.tokenKind === TypeScript.SyntaxKind.IdentifierName);
                }

                return this._textOrWidth;
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.fullText = function () {
                return this._sourceText.substr(this._fullStart, this.fullWidth(), false);
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.value = function () {
                if ((this)._value === undefined) {
                    (this)._value = Syntax.value(this);
                }

                return (this)._value;
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.valueText = function () {
                if ((this)._valueText === undefined) {
                    (this)._valueText = Syntax.valueText(this);
                }

                return (this)._valueText;
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.hasLeadingTrivia = function () {
                return true;
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.hasLeadingComment = function () {
                return hasTriviaComment(this._leadingTriviaInfo);
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.hasLeadingNewLine = function () {
                return hasTriviaNewLine(this._leadingTriviaInfo);
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.hasLeadingSkippedText = function () {
                return false;
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.leadingTriviaWidth = function () {
                return getTriviaWidth(this._leadingTriviaInfo);
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.leadingTrivia = function () {
                return TypeScript.Scanner.scanTrivia(this._sourceText, this._fullStart, getTriviaWidth(this._leadingTriviaInfo), false);
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.hasTrailingTrivia = function () {
                return true;
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.hasTrailingComment = function () {
                return hasTriviaComment(this._trailingTriviaInfo);
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.hasTrailingNewLine = function () {
                return hasTriviaNewLine(this._trailingTriviaInfo);
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.hasTrailingSkippedText = function () {
                return false;
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.trailingTriviaWidth = function () {
                return getTriviaWidth(this._trailingTriviaInfo);
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.trailingTrivia = function () {
                return TypeScript.Scanner.scanTrivia(this._sourceText, this.end(), getTriviaWidth(this._trailingTriviaInfo), true);
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.hasSkippedToken = function () {
                return false;
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.toJSON = function (key) {
                return Syntax.tokenToJSON(this);
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.firstToken = function () {
                return this;
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.lastToken = function () {
                return this;
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.isTypeScriptSpecific = function () {
                return false;
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.isIncrementallyUnusable = function () {
                return this.fullWidth() === 0 || TypeScript.SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind);
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.accept = function (visitor) {
                return visitor.visitToken(this);
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.realize = function () {
                return Syntax.realizeToken(this);
            };
            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.collectTextElements = function (elements) {
                collectTokenTextElements(this, elements);
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.findTokenInternal = function (parent, position, fullStart) {
                return new TypeScript.PositionedToken(parent, this, fullStart);
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.withLeadingTrivia = function (leadingTrivia) {
                return this.realize().withLeadingTrivia(leadingTrivia);
            };

            VariableWidthTokenWithLeadingAndTrailingTrivia.prototype.withTrailingTrivia = function (trailingTrivia) {
                return this.realize().withTrailingTrivia(trailingTrivia);
            };
            return VariableWidthTokenWithLeadingAndTrailingTrivia;
        })();
        Syntax.VariableWidthTokenWithLeadingAndTrailingTrivia = VariableWidthTokenWithLeadingAndTrailingTrivia;

        var FixedWidthTokenWithNoTrivia = (function () {
            function FixedWidthTokenWithNoTrivia(kind) {
                this.tokenKind = kind;
            }
            FixedWidthTokenWithNoTrivia.prototype.clone = function () {
                return new FixedWidthTokenWithNoTrivia(this.tokenKind);
            };

            FixedWidthTokenWithNoTrivia.prototype.isNode = function () {
                return false;
            };
            FixedWidthTokenWithNoTrivia.prototype.isToken = function () {
                return true;
            };
            FixedWidthTokenWithNoTrivia.prototype.isList = function () {
                return false;
            };
            FixedWidthTokenWithNoTrivia.prototype.isSeparatedList = function () {
                return false;
            };

            FixedWidthTokenWithNoTrivia.prototype.kind = function () {
                return this.tokenKind;
            };

            FixedWidthTokenWithNoTrivia.prototype.childCount = function () {
                return 0;
            };
            FixedWidthTokenWithNoTrivia.prototype.childAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange('index');
            };

            FixedWidthTokenWithNoTrivia.prototype.fullWidth = function () {
                return this.width();
            };
            FixedWidthTokenWithNoTrivia.prototype.width = function () {
                return this.text().length;
            };
            FixedWidthTokenWithNoTrivia.prototype.text = function () {
                return TypeScript.SyntaxFacts.getText(this.tokenKind);
            };
            FixedWidthTokenWithNoTrivia.prototype.fullText = function () {
                return this.text();
            };

            FixedWidthTokenWithNoTrivia.prototype.value = function () {
                return Syntax.value(this);
            };
            FixedWidthTokenWithNoTrivia.prototype.valueText = function () {
                return Syntax.valueText(this);
            };
            FixedWidthTokenWithNoTrivia.prototype.hasLeadingTrivia = function () {
                return false;
            };
            FixedWidthTokenWithNoTrivia.prototype.hasLeadingComment = function () {
                return false;
            };
            FixedWidthTokenWithNoTrivia.prototype.hasLeadingNewLine = function () {
                return false;
            };
            FixedWidthTokenWithNoTrivia.prototype.hasLeadingSkippedText = function () {
                return false;
            };
            FixedWidthTokenWithNoTrivia.prototype.leadingTriviaWidth = function () {
                return 0;
            };
            FixedWidthTokenWithNoTrivia.prototype.leadingTrivia = function () {
                return TypeScript.Syntax.emptyTriviaList;
            };

            FixedWidthTokenWithNoTrivia.prototype.hasTrailingTrivia = function () {
                return false;
            };
            FixedWidthTokenWithNoTrivia.prototype.hasTrailingComment = function () {
                return false;
            };
            FixedWidthTokenWithNoTrivia.prototype.hasTrailingNewLine = function () {
                return false;
            };
            FixedWidthTokenWithNoTrivia.prototype.hasTrailingSkippedText = function () {
                return false;
            };
            FixedWidthTokenWithNoTrivia.prototype.trailingTriviaWidth = function () {
                return 0;
            };
            FixedWidthTokenWithNoTrivia.prototype.trailingTrivia = function () {
                return TypeScript.Syntax.emptyTriviaList;
            };

            FixedWidthTokenWithNoTrivia.prototype.hasSkippedToken = function () {
                return false;
            };
            FixedWidthTokenWithNoTrivia.prototype.toJSON = function (key) {
                return Syntax.tokenToJSON(this);
            };
            FixedWidthTokenWithNoTrivia.prototype.firstToken = function () {
                return this;
            };
            FixedWidthTokenWithNoTrivia.prototype.lastToken = function () {
                return this;
            };
            FixedWidthTokenWithNoTrivia.prototype.isTypeScriptSpecific = function () {
                return false;
            };
            FixedWidthTokenWithNoTrivia.prototype.isIncrementallyUnusable = function () {
                return this.fullWidth() === 0 || TypeScript.SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind);
            };
            FixedWidthTokenWithNoTrivia.prototype.accept = function (visitor) {
                return visitor.visitToken(this);
            };
            FixedWidthTokenWithNoTrivia.prototype.realize = function () {
                return Syntax.realizeToken(this);
            };
            FixedWidthTokenWithNoTrivia.prototype.collectTextElements = function (elements) {
                collectTokenTextElements(this, elements);
            };

            FixedWidthTokenWithNoTrivia.prototype.findTokenInternal = function (parent, position, fullStart) {
                return new TypeScript.PositionedToken(parent, this, fullStart);
            };

            FixedWidthTokenWithNoTrivia.prototype.withLeadingTrivia = function (leadingTrivia) {
                return this.realize().withLeadingTrivia(leadingTrivia);
            };

            FixedWidthTokenWithNoTrivia.prototype.withTrailingTrivia = function (trailingTrivia) {
                return this.realize().withTrailingTrivia(trailingTrivia);
            };
            return FixedWidthTokenWithNoTrivia;
        })();
        Syntax.FixedWidthTokenWithNoTrivia = FixedWidthTokenWithNoTrivia;

        var FixedWidthTokenWithLeadingTrivia = (function () {
            function FixedWidthTokenWithLeadingTrivia(sourceText, fullStart, kind, leadingTriviaInfo) {
                this._sourceText = sourceText;
                this._fullStart = fullStart;
                this.tokenKind = kind;
                this._leadingTriviaInfo = leadingTriviaInfo;
            }
            FixedWidthTokenWithLeadingTrivia.prototype.clone = function () {
                return new FixedWidthTokenWithLeadingTrivia(this._sourceText, this._fullStart, this.tokenKind, this._leadingTriviaInfo);
            };

            FixedWidthTokenWithLeadingTrivia.prototype.isNode = function () {
                return false;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.isToken = function () {
                return true;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.isList = function () {
                return false;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.isSeparatedList = function () {
                return false;
            };

            FixedWidthTokenWithLeadingTrivia.prototype.kind = function () {
                return this.tokenKind;
            };

            FixedWidthTokenWithLeadingTrivia.prototype.childCount = function () {
                return 0;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.childAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange('index');
            };

            FixedWidthTokenWithLeadingTrivia.prototype.fullWidth = function () {
                return getTriviaWidth(this._leadingTriviaInfo) + this.width();
            };
            FixedWidthTokenWithLeadingTrivia.prototype.start = function () {
                return this._fullStart + getTriviaWidth(this._leadingTriviaInfo);
            };
            FixedWidthTokenWithLeadingTrivia.prototype.end = function () {
                return this.start() + this.width();
            };

            FixedWidthTokenWithLeadingTrivia.prototype.width = function () {
                return this.text().length;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.text = function () {
                return TypeScript.SyntaxFacts.getText(this.tokenKind);
            };
            FixedWidthTokenWithLeadingTrivia.prototype.fullText = function () {
                return this._sourceText.substr(this._fullStart, this.fullWidth(), false);
            };

            FixedWidthTokenWithLeadingTrivia.prototype.value = function () {
                return Syntax.value(this);
            };
            FixedWidthTokenWithLeadingTrivia.prototype.valueText = function () {
                return Syntax.valueText(this);
            };
            FixedWidthTokenWithLeadingTrivia.prototype.hasLeadingTrivia = function () {
                return true;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.hasLeadingComment = function () {
                return hasTriviaComment(this._leadingTriviaInfo);
            };
            FixedWidthTokenWithLeadingTrivia.prototype.hasLeadingNewLine = function () {
                return hasTriviaNewLine(this._leadingTriviaInfo);
            };
            FixedWidthTokenWithLeadingTrivia.prototype.hasLeadingSkippedText = function () {
                return false;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.leadingTriviaWidth = function () {
                return getTriviaWidth(this._leadingTriviaInfo);
            };
            FixedWidthTokenWithLeadingTrivia.prototype.leadingTrivia = function () {
                return TypeScript.Scanner.scanTrivia(this._sourceText, this._fullStart, getTriviaWidth(this._leadingTriviaInfo), false);
            };

            FixedWidthTokenWithLeadingTrivia.prototype.hasTrailingTrivia = function () {
                return false;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.hasTrailingComment = function () {
                return false;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.hasTrailingNewLine = function () {
                return false;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.hasTrailingSkippedText = function () {
                return false;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.trailingTriviaWidth = function () {
                return 0;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.trailingTrivia = function () {
                return TypeScript.Syntax.emptyTriviaList;
            };

            FixedWidthTokenWithLeadingTrivia.prototype.hasSkippedToken = function () {
                return false;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.toJSON = function (key) {
                return Syntax.tokenToJSON(this);
            };
            FixedWidthTokenWithLeadingTrivia.prototype.firstToken = function () {
                return this;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.lastToken = function () {
                return this;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.isTypeScriptSpecific = function () {
                return false;
            };
            FixedWidthTokenWithLeadingTrivia.prototype.isIncrementallyUnusable = function () {
                return this.fullWidth() === 0 || TypeScript.SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind);
            };
            FixedWidthTokenWithLeadingTrivia.prototype.accept = function (visitor) {
                return visitor.visitToken(this);
            };
            FixedWidthTokenWithLeadingTrivia.prototype.realize = function () {
                return Syntax.realizeToken(this);
            };
            FixedWidthTokenWithLeadingTrivia.prototype.collectTextElements = function (elements) {
                collectTokenTextElements(this, elements);
            };

            FixedWidthTokenWithLeadingTrivia.prototype.findTokenInternal = function (parent, position, fullStart) {
                return new TypeScript.PositionedToken(parent, this, fullStart);
            };

            FixedWidthTokenWithLeadingTrivia.prototype.withLeadingTrivia = function (leadingTrivia) {
                return this.realize().withLeadingTrivia(leadingTrivia);
            };

            FixedWidthTokenWithLeadingTrivia.prototype.withTrailingTrivia = function (trailingTrivia) {
                return this.realize().withTrailingTrivia(trailingTrivia);
            };
            return FixedWidthTokenWithLeadingTrivia;
        })();
        Syntax.FixedWidthTokenWithLeadingTrivia = FixedWidthTokenWithLeadingTrivia;

        var FixedWidthTokenWithTrailingTrivia = (function () {
            function FixedWidthTokenWithTrailingTrivia(sourceText, fullStart, kind, trailingTriviaInfo) {
                this._sourceText = sourceText;
                this._fullStart = fullStart;
                this.tokenKind = kind;
                this._trailingTriviaInfo = trailingTriviaInfo;
            }
            FixedWidthTokenWithTrailingTrivia.prototype.clone = function () {
                return new FixedWidthTokenWithTrailingTrivia(this._sourceText, this._fullStart, this.tokenKind, this._trailingTriviaInfo);
            };

            FixedWidthTokenWithTrailingTrivia.prototype.isNode = function () {
                return false;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.isToken = function () {
                return true;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.isList = function () {
                return false;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.isSeparatedList = function () {
                return false;
            };

            FixedWidthTokenWithTrailingTrivia.prototype.kind = function () {
                return this.tokenKind;
            };

            FixedWidthTokenWithTrailingTrivia.prototype.childCount = function () {
                return 0;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.childAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange('index');
            };

            FixedWidthTokenWithTrailingTrivia.prototype.fullWidth = function () {
                return this.width() + getTriviaWidth(this._trailingTriviaInfo);
            };
            FixedWidthTokenWithTrailingTrivia.prototype.start = function () {
                return this._fullStart;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.end = function () {
                return this.start() + this.width();
            };

            FixedWidthTokenWithTrailingTrivia.prototype.width = function () {
                return this.text().length;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.text = function () {
                return TypeScript.SyntaxFacts.getText(this.tokenKind);
            };
            FixedWidthTokenWithTrailingTrivia.prototype.fullText = function () {
                return this._sourceText.substr(this._fullStart, this.fullWidth(), false);
            };

            FixedWidthTokenWithTrailingTrivia.prototype.value = function () {
                return Syntax.value(this);
            };
            FixedWidthTokenWithTrailingTrivia.prototype.valueText = function () {
                return Syntax.valueText(this);
            };
            FixedWidthTokenWithTrailingTrivia.prototype.hasLeadingTrivia = function () {
                return false;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.hasLeadingComment = function () {
                return false;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.hasLeadingNewLine = function () {
                return false;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.hasLeadingSkippedText = function () {
                return false;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.leadingTriviaWidth = function () {
                return 0;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.leadingTrivia = function () {
                return TypeScript.Syntax.emptyTriviaList;
            };

            FixedWidthTokenWithTrailingTrivia.prototype.hasTrailingTrivia = function () {
                return true;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.hasTrailingComment = function () {
                return hasTriviaComment(this._trailingTriviaInfo);
            };
            FixedWidthTokenWithTrailingTrivia.prototype.hasTrailingNewLine = function () {
                return hasTriviaNewLine(this._trailingTriviaInfo);
            };
            FixedWidthTokenWithTrailingTrivia.prototype.hasTrailingSkippedText = function () {
                return false;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.trailingTriviaWidth = function () {
                return getTriviaWidth(this._trailingTriviaInfo);
            };
            FixedWidthTokenWithTrailingTrivia.prototype.trailingTrivia = function () {
                return TypeScript.Scanner.scanTrivia(this._sourceText, this.end(), getTriviaWidth(this._trailingTriviaInfo), true);
            };

            FixedWidthTokenWithTrailingTrivia.prototype.hasSkippedToken = function () {
                return false;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.toJSON = function (key) {
                return Syntax.tokenToJSON(this);
            };
            FixedWidthTokenWithTrailingTrivia.prototype.firstToken = function () {
                return this;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.lastToken = function () {
                return this;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.isTypeScriptSpecific = function () {
                return false;
            };
            FixedWidthTokenWithTrailingTrivia.prototype.isIncrementallyUnusable = function () {
                return this.fullWidth() === 0 || TypeScript.SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind);
            };
            FixedWidthTokenWithTrailingTrivia.prototype.accept = function (visitor) {
                return visitor.visitToken(this);
            };
            FixedWidthTokenWithTrailingTrivia.prototype.realize = function () {
                return Syntax.realizeToken(this);
            };
            FixedWidthTokenWithTrailingTrivia.prototype.collectTextElements = function (elements) {
                collectTokenTextElements(this, elements);
            };

            FixedWidthTokenWithTrailingTrivia.prototype.findTokenInternal = function (parent, position, fullStart) {
                return new TypeScript.PositionedToken(parent, this, fullStart);
            };

            FixedWidthTokenWithTrailingTrivia.prototype.withLeadingTrivia = function (leadingTrivia) {
                return this.realize().withLeadingTrivia(leadingTrivia);
            };

            FixedWidthTokenWithTrailingTrivia.prototype.withTrailingTrivia = function (trailingTrivia) {
                return this.realize().withTrailingTrivia(trailingTrivia);
            };
            return FixedWidthTokenWithTrailingTrivia;
        })();
        Syntax.FixedWidthTokenWithTrailingTrivia = FixedWidthTokenWithTrailingTrivia;

        var FixedWidthTokenWithLeadingAndTrailingTrivia = (function () {
            function FixedWidthTokenWithLeadingAndTrailingTrivia(sourceText, fullStart, kind, leadingTriviaInfo, trailingTriviaInfo) {
                this._sourceText = sourceText;
                this._fullStart = fullStart;
                this.tokenKind = kind;
                this._leadingTriviaInfo = leadingTriviaInfo;
                this._trailingTriviaInfo = trailingTriviaInfo;
            }
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.clone = function () {
                return new FixedWidthTokenWithLeadingAndTrailingTrivia(this._sourceText, this._fullStart, this.tokenKind, this._leadingTriviaInfo, this._trailingTriviaInfo);
            };

            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.isNode = function () {
                return false;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.isToken = function () {
                return true;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.isList = function () {
                return false;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.isSeparatedList = function () {
                return false;
            };

            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.kind = function () {
                return this.tokenKind;
            };

            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.childCount = function () {
                return 0;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.childAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange('index');
            };

            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.fullWidth = function () {
                return getTriviaWidth(this._leadingTriviaInfo) + this.width() + getTriviaWidth(this._trailingTriviaInfo);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.start = function () {
                return this._fullStart + getTriviaWidth(this._leadingTriviaInfo);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.end = function () {
                return this.start() + this.width();
            };

            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.width = function () {
                return this.text().length;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.text = function () {
                return TypeScript.SyntaxFacts.getText(this.tokenKind);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.fullText = function () {
                return this._sourceText.substr(this._fullStart, this.fullWidth(), false);
            };

            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.value = function () {
                return Syntax.value(this);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.valueText = function () {
                return Syntax.valueText(this);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.hasLeadingTrivia = function () {
                return true;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.hasLeadingComment = function () {
                return hasTriviaComment(this._leadingTriviaInfo);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.hasLeadingNewLine = function () {
                return hasTriviaNewLine(this._leadingTriviaInfo);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.hasLeadingSkippedText = function () {
                return false;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.leadingTriviaWidth = function () {
                return getTriviaWidth(this._leadingTriviaInfo);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.leadingTrivia = function () {
                return TypeScript.Scanner.scanTrivia(this._sourceText, this._fullStart, getTriviaWidth(this._leadingTriviaInfo), false);
            };

            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.hasTrailingTrivia = function () {
                return true;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.hasTrailingComment = function () {
                return hasTriviaComment(this._trailingTriviaInfo);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.hasTrailingNewLine = function () {
                return hasTriviaNewLine(this._trailingTriviaInfo);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.hasTrailingSkippedText = function () {
                return false;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.trailingTriviaWidth = function () {
                return getTriviaWidth(this._trailingTriviaInfo);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.trailingTrivia = function () {
                return TypeScript.Scanner.scanTrivia(this._sourceText, this.end(), getTriviaWidth(this._trailingTriviaInfo), true);
            };

            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.hasSkippedToken = function () {
                return false;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.toJSON = function (key) {
                return Syntax.tokenToJSON(this);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.firstToken = function () {
                return this;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.lastToken = function () {
                return this;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.isTypeScriptSpecific = function () {
                return false;
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.isIncrementallyUnusable = function () {
                return this.fullWidth() === 0 || TypeScript.SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.accept = function (visitor) {
                return visitor.visitToken(this);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.realize = function () {
                return Syntax.realizeToken(this);
            };
            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.collectTextElements = function (elements) {
                collectTokenTextElements(this, elements);
            };

            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.findTokenInternal = function (parent, position, fullStart) {
                return new TypeScript.PositionedToken(parent, this, fullStart);
            };

            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.withLeadingTrivia = function (leadingTrivia) {
                return this.realize().withLeadingTrivia(leadingTrivia);
            };

            FixedWidthTokenWithLeadingAndTrailingTrivia.prototype.withTrailingTrivia = function (trailingTrivia) {
                return this.realize().withTrailingTrivia(trailingTrivia);
            };
            return FixedWidthTokenWithLeadingAndTrailingTrivia;
        })();
        Syntax.FixedWidthTokenWithLeadingAndTrailingTrivia = FixedWidthTokenWithLeadingAndTrailingTrivia;

        function collectTokenTextElements(token, elements) {
            token.leadingTrivia().collectTextElements(elements);
            elements.push(token.text());
            token.trailingTrivia().collectTextElements(elements);
        }

        function fixedWidthToken(sourceText, fullStart, kind, leadingTriviaInfo, trailingTriviaInfo) {
            if (leadingTriviaInfo === 0) {
                if (trailingTriviaInfo === 0) {
                    return new FixedWidthTokenWithNoTrivia(kind);
                } else {
                    return new FixedWidthTokenWithTrailingTrivia(sourceText, fullStart, kind, trailingTriviaInfo);
                }
            } else if (trailingTriviaInfo === 0) {
                return new FixedWidthTokenWithLeadingTrivia(sourceText, fullStart, kind, leadingTriviaInfo);
            } else {
                return new FixedWidthTokenWithLeadingAndTrailingTrivia(sourceText, fullStart, kind, leadingTriviaInfo, trailingTriviaInfo);
            }
        }
        Syntax.fixedWidthToken = fixedWidthToken;

        function variableWidthToken(sourceText, fullStart, kind, leadingTriviaInfo, width, trailingTriviaInfo) {
            if (leadingTriviaInfo === 0) {
                if (trailingTriviaInfo === 0) {
                    return new VariableWidthTokenWithNoTrivia(sourceText, fullStart, kind, width);
                } else {
                    return new VariableWidthTokenWithTrailingTrivia(sourceText, fullStart, kind, width, trailingTriviaInfo);
                }
            } else if (trailingTriviaInfo === 0) {
                return new VariableWidthTokenWithLeadingTrivia(sourceText, fullStart, kind, leadingTriviaInfo, width);
            } else {
                return new VariableWidthTokenWithLeadingAndTrailingTrivia(sourceText, fullStart, kind, leadingTriviaInfo, width, trailingTriviaInfo);
            }
        }
        Syntax.variableWidthToken = variableWidthToken;

        function getTriviaWidth(value) {
            return value >>> TypeScript.SyntaxConstants.TriviaFullWidthShift;
        }

        function hasTriviaComment(value) {
            return (value & TypeScript.SyntaxConstants.TriviaCommentMask) !== 0;
        }

        function hasTriviaNewLine(value) {
            return (value & TypeScript.SyntaxConstants.TriviaNewLineMask) !== 0;
        }
    })(TypeScript.Syntax || (TypeScript.Syntax = {}));
    var Syntax = TypeScript.Syntax;
})(TypeScript || (TypeScript = {}));
