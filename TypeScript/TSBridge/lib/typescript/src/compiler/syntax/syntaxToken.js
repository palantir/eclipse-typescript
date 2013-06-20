var TypeScript;
(function (TypeScript) {
    (function (Syntax) {
        function realizeToken(token) {
            return new RealizedToken(token.tokenKind, token.leadingTrivia(), token.text(), token.value(), token.valueText(), token.trailingTrivia());
        }
        Syntax.realizeToken = realizeToken;

        function convertToIdentifierName(token) {
            TypeScript.Debug.assert(TypeScript.SyntaxFacts.isAnyKeyword(token.tokenKind));
            return new RealizedToken(TypeScript.SyntaxKind.IdentifierName, token.leadingTrivia(), token.text(), token.text(), token.text(), token.trailingTrivia());
        }
        Syntax.convertToIdentifierName = convertToIdentifierName;

        function tokenToJSON(token) {
            var result = {};

            for (var name in TypeScript.SyntaxKind) {
                if (TypeScript.SyntaxKind[name] === token.kind()) {
                    result.kind = name;
                    break;
                }
            }

            result.width = token.width();
            if (token.fullWidth() !== token.width()) {
                result.fullWidth = token.fullWidth();
            }

            result.text = token.text();

            var value = token.value();
            if (value !== null) {
                result.value = value;
                result.valueText = token.valueText();
            }

            if (token.hasLeadingTrivia()) {
                result.hasLeadingTrivia = true;
            }

            if (token.hasLeadingComment()) {
                result.hasLeadingComment = true;
            }

            if (token.hasLeadingNewLine()) {
                result.hasLeadingNewLine = true;
            }

            if (token.hasLeadingSkippedText()) {
                result.hasLeadingSkippedText = true;
            }

            if (token.hasTrailingTrivia()) {
                result.hasTrailingTrivia = true;
            }

            if (token.hasTrailingComment()) {
                result.hasTrailingComment = true;
            }

            if (token.hasTrailingNewLine()) {
                result.hasTrailingNewLine = true;
            }

            if (token.hasTrailingSkippedText()) {
                result.hasTrailingSkippedText = true;
            }

            var trivia = token.leadingTrivia();
            if (trivia.count() > 0) {
                result.leadingTrivia = trivia;
            }

            trivia = token.trailingTrivia();
            if (trivia.count() > 0) {
                result.trailingTrivia = trivia;
            }

            return result;
        }
        Syntax.tokenToJSON = tokenToJSON;

        function value(token) {
            return value1(token.tokenKind, token.text());
        }
        Syntax.value = value;

        function hexValue(text, start, length) {
            var intChar = 0;
            for (var i = 0; i < length; i++) {
                var ch2 = text.charCodeAt(start + i);
                if (!TypeScript.CharacterInfo.isHexDigit(ch2)) {
                    break;
                }

                intChar = (intChar << 4) + TypeScript.CharacterInfo.hexValue(ch2);
            }

            return intChar;
        }

        var characterArray = [];

        function convertEscapes(text) {
            characterArray.length = 0;
            var result = "";

            for (var i = 0, n = text.length; i < n; i++) {
                var ch = text.charCodeAt(i);

                if (ch === TypeScript.CharacterCodes.backslash) {
                    i++;
                    if (i < n) {
                        ch = text.charCodeAt(i);
                        switch (ch) {
                            case TypeScript.CharacterCodes._0:
                                characterArray.push(TypeScript.CharacterCodes.nullCharacter);
                                continue;

                            case TypeScript.CharacterCodes.b:
                                characterArray.push(TypeScript.CharacterCodes.backspace);
                                continue;

                            case TypeScript.CharacterCodes.f:
                                characterArray.push(TypeScript.CharacterCodes.formFeed);
                                continue;

                            case TypeScript.CharacterCodes.n:
                                characterArray.push(TypeScript.CharacterCodes.lineFeed);
                                continue;

                            case TypeScript.CharacterCodes.r:
                                characterArray.push(TypeScript.CharacterCodes.carriageReturn);
                                continue;

                            case TypeScript.CharacterCodes.t:
                                characterArray.push(TypeScript.CharacterCodes.tab);
                                continue;

                            case TypeScript.CharacterCodes.v:
                                characterArray.push(TypeScript.CharacterCodes.verticalTab);
                                continue;

                            case TypeScript.CharacterCodes.x:
                                characterArray.push(hexValue(text, i + 1, 2));
                                i += 2;
                                continue;

                            case TypeScript.CharacterCodes.u:
                                characterArray.push(hexValue(text, i + 1, 4));
                                i += 4;
                                continue;

                            default:
                        }
                    }
                }

                characterArray.push(ch);

                if (i && !(i % 1024)) {
                    result = result.concat(String.fromCharCode.apply(null, characterArray));
                    characterArray.length = 0;
                }
            }

            if (characterArray.length) {
                result = result.concat(String.fromCharCode.apply(null, characterArray));
            }

            return result;
        }

        function massageEscapes(text) {
            return text.indexOf("\\") >= 0 ? convertEscapes(text) : text;
        }

        function value1(kind, text) {
            if (kind === TypeScript.SyntaxKind.IdentifierName) {
                return massageEscapes(text);
            }

            switch (kind) {
                case TypeScript.SyntaxKind.TrueKeyword:
                    return true;
                case TypeScript.SyntaxKind.FalseKeyword:
                    return false;
                case TypeScript.SyntaxKind.NullKeyword:
                    return null;
            }

            if (TypeScript.SyntaxFacts.isAnyKeyword(kind) || TypeScript.SyntaxFacts.isAnyPunctuation(kind)) {
                return TypeScript.SyntaxFacts.getText(kind);
            }

            if (kind === TypeScript.SyntaxKind.NumericLiteral) {
                return parseFloat(text);
            } else if (kind === TypeScript.SyntaxKind.StringLiteral) {
                if (text.length > 1 && text.charCodeAt(text.length - 1) === text.charCodeAt(0)) {
                    return massageEscapes(text.substr(1, text.length - 2));
                } else {
                    return massageEscapes(text.substr(1));
                }
            } else if (kind === TypeScript.SyntaxKind.RegularExpressionLiteral) {
                try  {
                    var lastSlash = text.lastIndexOf("/");
                    var body = text.substring(1, lastSlash);
                    var flags = text.substring(lastSlash + 1);
                    return new RegExp(body, flags);
                } catch (e) {
                    return null;
                }
            } else if (kind === TypeScript.SyntaxKind.EndOfFileToken || kind === TypeScript.SyntaxKind.ErrorToken) {
                return null;
            } else {
                throw TypeScript.Errors.invalidOperation();
            }
        }

        function valueText1(kind, text) {
            var value = value1(kind, text);
            return value === null ? "" : value.toString();
        }

        function valueText(token) {
            var value = token.value();
            return value === null ? "" : value.toString();
        }
        Syntax.valueText = valueText;

        var EmptyToken = (function () {
            function EmptyToken(kind) {
                this.tokenKind = kind;
            }
            EmptyToken.prototype.clone = function () {
                return new EmptyToken(this.tokenKind);
            };

            EmptyToken.prototype.kind = function () {
                return this.tokenKind;
            };

            EmptyToken.prototype.isToken = function () {
                return true;
            };
            EmptyToken.prototype.isNode = function () {
                return false;
            };
            EmptyToken.prototype.isList = function () {
                return false;
            };
            EmptyToken.prototype.isSeparatedList = function () {
                return false;
            };

            EmptyToken.prototype.childCount = function () {
                return 0;
            };

            EmptyToken.prototype.childAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange("index");
            };

            EmptyToken.prototype.toJSON = function (key) {
                return tokenToJSON(this);
            };
            EmptyToken.prototype.accept = function (visitor) {
                return visitor.visitToken(this);
            };

            EmptyToken.prototype.findTokenInternal = function (parent, position, fullStart) {
                return new TypeScript.PositionedToken(parent, this, fullStart);
            };

            EmptyToken.prototype.firstToken = function () {
                return this;
            };
            EmptyToken.prototype.lastToken = function () {
                return this;
            };
            EmptyToken.prototype.isTypeScriptSpecific = function () {
                return false;
            };

            EmptyToken.prototype.isIncrementallyUnusable = function () {
                return true;
            };

            EmptyToken.prototype.fullWidth = function () {
                return 0;
            };
            EmptyToken.prototype.width = function () {
                return 0;
            };
            EmptyToken.prototype.text = function () {
                return "";
            };
            EmptyToken.prototype.fullText = function () {
                return "";
            };
            EmptyToken.prototype.value = function () {
                return null;
            };
            EmptyToken.prototype.valueText = function () {
                return "";
            };

            EmptyToken.prototype.hasLeadingTrivia = function () {
                return false;
            };
            EmptyToken.prototype.hasLeadingComment = function () {
                return false;
            };
            EmptyToken.prototype.hasLeadingNewLine = function () {
                return false;
            };
            EmptyToken.prototype.hasLeadingSkippedText = function () {
                return false;
            };
            EmptyToken.prototype.leadingTriviaWidth = function () {
                return 0;
            };
            EmptyToken.prototype.hasTrailingTrivia = function () {
                return false;
            };
            EmptyToken.prototype.hasTrailingComment = function () {
                return false;
            };
            EmptyToken.prototype.hasTrailingNewLine = function () {
                return false;
            };
            EmptyToken.prototype.hasTrailingSkippedText = function () {
                return false;
            };
            EmptyToken.prototype.hasSkippedToken = function () {
                return false;
            };

            EmptyToken.prototype.trailingTriviaWidth = function () {
                return 0;
            };
            EmptyToken.prototype.leadingTrivia = function () {
                return TypeScript.Syntax.emptyTriviaList;
            };
            EmptyToken.prototype.trailingTrivia = function () {
                return TypeScript.Syntax.emptyTriviaList;
            };
            EmptyToken.prototype.realize = function () {
                return realizeToken(this);
            };
            EmptyToken.prototype.collectTextElements = function (elements) {
            };

            EmptyToken.prototype.withLeadingTrivia = function (leadingTrivia) {
                return this.realize().withLeadingTrivia(leadingTrivia);
            };

            EmptyToken.prototype.withTrailingTrivia = function (trailingTrivia) {
                return this.realize().withTrailingTrivia(trailingTrivia);
            };
            return EmptyToken;
        })();

        function emptyToken(kind) {
            return new EmptyToken(kind);
        }
        Syntax.emptyToken = emptyToken;

        var RealizedToken = (function () {
            function RealizedToken(tokenKind, leadingTrivia, text, value, valueText, trailingTrivia) {
                this.tokenKind = tokenKind;
                this._leadingTrivia = leadingTrivia;
                this._text = text;
                this._value = value;
                this._valueText = valueText;
                this._trailingTrivia = trailingTrivia;
            }
            RealizedToken.prototype.clone = function () {
                return new RealizedToken(this.tokenKind, this._leadingTrivia, this._text, this._value, this._valueText, this._trailingTrivia);
            };

            RealizedToken.prototype.kind = function () {
                return this.tokenKind;
            };
            RealizedToken.prototype.toJSON = function (key) {
                return tokenToJSON(this);
            };
            RealizedToken.prototype.firstToken = function () {
                return this;
            };
            RealizedToken.prototype.lastToken = function () {
                return this;
            };
            RealizedToken.prototype.isTypeScriptSpecific = function () {
                return false;
            };

            RealizedToken.prototype.isIncrementallyUnusable = function () {
                return true;
            };

            RealizedToken.prototype.accept = function (visitor) {
                return visitor.visitToken(this);
            };

            RealizedToken.prototype.childCount = function () {
                return 0;
            };

            RealizedToken.prototype.childAt = function (index) {
                throw TypeScript.Errors.argumentOutOfRange("index");
            };

            RealizedToken.prototype.isToken = function () {
                return true;
            };
            RealizedToken.prototype.isNode = function () {
                return false;
            };
            RealizedToken.prototype.isList = function () {
                return false;
            };
            RealizedToken.prototype.isSeparatedList = function () {
                return false;
            };
            RealizedToken.prototype.isTrivia = function () {
                return false;
            };
            RealizedToken.prototype.isTriviaList = function () {
                return false;
            };

            RealizedToken.prototype.fullWidth = function () {
                return this._leadingTrivia.fullWidth() + this.width() + this._trailingTrivia.fullWidth();
            };
            RealizedToken.prototype.width = function () {
                return this.text().length;
            };

            RealizedToken.prototype.text = function () {
                return this._text;
            };
            RealizedToken.prototype.fullText = function () {
                return this._leadingTrivia.fullText() + this.text() + this._trailingTrivia.fullText();
            };

            RealizedToken.prototype.value = function () {
                return this._value;
            };
            RealizedToken.prototype.valueText = function () {
                return this._valueText;
            };

            RealizedToken.prototype.hasLeadingTrivia = function () {
                return this._leadingTrivia.count() > 0;
            };
            RealizedToken.prototype.hasLeadingComment = function () {
                return this._leadingTrivia.hasComment();
            };
            RealizedToken.prototype.hasLeadingNewLine = function () {
                return this._leadingTrivia.hasNewLine();
            };
            RealizedToken.prototype.hasLeadingSkippedText = function () {
                return this._leadingTrivia.hasSkippedToken();
            };
            RealizedToken.prototype.leadingTriviaWidth = function () {
                return this._leadingTrivia.fullWidth();
            };

            RealizedToken.prototype.hasTrailingTrivia = function () {
                return this._trailingTrivia.count() > 0;
            };
            RealizedToken.prototype.hasTrailingComment = function () {
                return this._trailingTrivia.hasComment();
            };
            RealizedToken.prototype.hasTrailingNewLine = function () {
                return this._trailingTrivia.hasNewLine();
            };
            RealizedToken.prototype.hasTrailingSkippedText = function () {
                return this._trailingTrivia.hasSkippedToken();
            };
            RealizedToken.prototype.trailingTriviaWidth = function () {
                return this._trailingTrivia.fullWidth();
            };

            RealizedToken.prototype.hasSkippedToken = function () {
                return this.hasLeadingSkippedText() || this.hasTrailingSkippedText();
            };

            RealizedToken.prototype.leadingTrivia = function () {
                return this._leadingTrivia;
            };
            RealizedToken.prototype.trailingTrivia = function () {
                return this._trailingTrivia;
            };

            RealizedToken.prototype.findTokenInternal = function (parent, position, fullStart) {
                return new TypeScript.PositionedToken(parent, this, fullStart);
            };

            RealizedToken.prototype.collectTextElements = function (elements) {
                this.leadingTrivia().collectTextElements(elements);
                elements.push(this.text());
                this.trailingTrivia().collectTextElements(elements);
            };

            RealizedToken.prototype.withLeadingTrivia = function (leadingTrivia) {
                return new RealizedToken(this.tokenKind, leadingTrivia, this._text, this._value, this._valueText, this._trailingTrivia);
            };

            RealizedToken.prototype.withTrailingTrivia = function (trailingTrivia) {
                return new RealizedToken(this.tokenKind, this._leadingTrivia, this._text, this._value, this._valueText, trailingTrivia);
            };
            return RealizedToken;
        })();

        function token(kind, info) {
            if (typeof info === "undefined") { info = null; }
            var text = (info !== null && info.text !== undefined) ? info.text : TypeScript.SyntaxFacts.getText(kind);

            return new RealizedToken(kind, TypeScript.Syntax.triviaList(info === null ? null : info.leadingTrivia), text, value1(kind, text), valueText1(kind, text), TypeScript.Syntax.triviaList(info === null ? null : info.trailingTrivia));
        }
        Syntax.token = token;

        function identifier(text, info) {
            if (typeof info === "undefined") { info = null; }
            info = info || {};
            info.text = text;
            return token(TypeScript.SyntaxKind.IdentifierName, info);
        }
        Syntax.identifier = identifier;
    })(TypeScript.Syntax || (TypeScript.Syntax = {}));
    var Syntax = TypeScript.Syntax;
})(TypeScript || (TypeScript = {}));
