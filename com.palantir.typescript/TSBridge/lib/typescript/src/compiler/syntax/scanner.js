var TypeScript;
(function (TypeScript) {
    var Scanner = (function () {
        function Scanner(fileName, text, languageVersion, window) {
            if (typeof window === "undefined") { window = TypeScript.ArrayUtilities.createArray(2048, 0); }
            Scanner.initializeStaticData();

            this.slidingWindow = new TypeScript.SlidingWindow(this, window, 0, text.length());
            this.fileName = fileName;
            this.text = text;
            this._languageVersion = languageVersion;
        }
        Scanner.initializeStaticData = function () {
            if (Scanner.isKeywordStartCharacter.length === 0) {
                Scanner.isKeywordStartCharacter = TypeScript.ArrayUtilities.createArray(TypeScript.CharacterCodes.maxAsciiCharacter, false);
                Scanner.isIdentifierStartCharacter = TypeScript.ArrayUtilities.createArray(TypeScript.CharacterCodes.maxAsciiCharacter, false);
                Scanner.isIdentifierPartCharacter = TypeScript.ArrayUtilities.createArray(TypeScript.CharacterCodes.maxAsciiCharacter, false);
                Scanner.isNumericLiteralStart = TypeScript.ArrayUtilities.createArray(TypeScript.CharacterCodes.maxAsciiCharacter, false);

                for (var character = 0; character < TypeScript.CharacterCodes.maxAsciiCharacter; character++) {
                    if (character >= TypeScript.CharacterCodes.a && character <= TypeScript.CharacterCodes.z) {
                        Scanner.isIdentifierStartCharacter[character] = true;
                        Scanner.isIdentifierPartCharacter[character] = true;
                    } else if ((character >= TypeScript.CharacterCodes.A && character <= TypeScript.CharacterCodes.Z) || character === TypeScript.CharacterCodes._ || character === TypeScript.CharacterCodes.$) {
                        Scanner.isIdentifierStartCharacter[character] = true;
                        Scanner.isIdentifierPartCharacter[character] = true;
                    } else if (character >= TypeScript.CharacterCodes._0 && character <= TypeScript.CharacterCodes._9) {
                        Scanner.isIdentifierPartCharacter[character] = true;
                        Scanner.isNumericLiteralStart[character] = true;
                    }
                }

                Scanner.isNumericLiteralStart[TypeScript.CharacterCodes.dot] = true;

                for (var keywordKind = TypeScript.SyntaxKind.FirstKeyword; keywordKind <= TypeScript.SyntaxKind.LastKeyword; keywordKind++) {
                    var keyword = TypeScript.SyntaxFacts.getText(keywordKind);
                    Scanner.isKeywordStartCharacter[keyword.charCodeAt(0)] = true;
                }
            }
        };

        Scanner.prototype.languageVersion = function () {
            return this._languageVersion;
        };

        Scanner.prototype.fetchMoreItems = function (argument, sourceIndex, window, destinationIndex, spaceAvailable) {
            var charactersRemaining = this.text.length() - sourceIndex;
            var amountToRead = TypeScript.MathPrototype.min(charactersRemaining, spaceAvailable);
            this.text.copyTo(sourceIndex, window, destinationIndex, amountToRead);
            return amountToRead;
        };

        Scanner.prototype.currentCharCode = function () {
            return this.slidingWindow.currentItem(null);
        };

        Scanner.prototype.absoluteIndex = function () {
            return this.slidingWindow.absoluteIndex();
        };

        Scanner.prototype.setAbsoluteIndex = function (index) {
            this.slidingWindow.setAbsoluteIndex(index);
        };

        Scanner.prototype.scan = function (diagnostics, allowRegularExpression) {
            var diagnosticsLength = diagnostics.length;
            var fullStart = this.slidingWindow.absoluteIndex();
            var leadingTriviaInfo = this.scanTriviaInfo(diagnostics, false);

            var start = this.slidingWindow.absoluteIndex();
            var kind = this.scanSyntaxToken(diagnostics, allowRegularExpression);
            var end = this.slidingWindow.absoluteIndex();

            var trailingTriviaInfo = this.scanTriviaInfo(diagnostics, true);

            var token = this.createToken(fullStart, leadingTriviaInfo, start, kind, end, trailingTriviaInfo);

            return diagnosticsLength !== diagnostics.length ? TypeScript.Syntax.realizeToken(token) : token;
        };

        Scanner.prototype.createToken = function (fullStart, leadingTriviaInfo, start, kind, end, trailingTriviaInfo) {
            if (kind >= TypeScript.SyntaxKind.FirstFixedWidth) {
                if (leadingTriviaInfo === 0) {
                    if (trailingTriviaInfo === 0) {
                        return new TypeScript.Syntax.FixedWidthTokenWithNoTrivia(kind);
                    } else {
                        return new TypeScript.Syntax.FixedWidthTokenWithTrailingTrivia(this.text, fullStart, kind, trailingTriviaInfo);
                    }
                } else if (trailingTriviaInfo === 0) {
                    return new TypeScript.Syntax.FixedWidthTokenWithLeadingTrivia(this.text, fullStart, kind, leadingTriviaInfo);
                } else {
                    return new TypeScript.Syntax.FixedWidthTokenWithLeadingAndTrailingTrivia(this.text, fullStart, kind, leadingTriviaInfo, trailingTriviaInfo);
                }
            } else {
                var width = end - start;
                if (leadingTriviaInfo === 0) {
                    if (trailingTriviaInfo === 0) {
                        return new TypeScript.Syntax.VariableWidthTokenWithNoTrivia(this.text, fullStart, kind, width);
                    } else {
                        return new TypeScript.Syntax.VariableWidthTokenWithTrailingTrivia(this.text, fullStart, kind, width, trailingTriviaInfo);
                    }
                } else if (trailingTriviaInfo === 0) {
                    return new TypeScript.Syntax.VariableWidthTokenWithLeadingTrivia(this.text, fullStart, kind, leadingTriviaInfo, width);
                } else {
                    return new TypeScript.Syntax.VariableWidthTokenWithLeadingAndTrailingTrivia(this.text, fullStart, kind, leadingTriviaInfo, width, trailingTriviaInfo);
                }
            }
        };

        Scanner.scanTrivia = function (text, start, length, isTrailing) {
            var scanner = new Scanner(null, text.subText(new TypeScript.TextSpan(start, length)), TypeScript.LanguageVersion.EcmaScript5, Scanner.triviaWindow);
            return scanner.scanTrivia(isTrailing);
        };

        Scanner.prototype.scanTrivia = function (isTrailing) {
            var trivia = [];

            while (true) {
                if (!this.slidingWindow.isAtEndOfSource()) {
                    var ch = this.currentCharCode();

                    switch (ch) {
                        case TypeScript.CharacterCodes.space:
                        case TypeScript.CharacterCodes.nonBreakingSpace:
                        case TypeScript.CharacterCodes.enQuad:
                        case TypeScript.CharacterCodes.emQuad:
                        case TypeScript.CharacterCodes.enSpace:
                        case TypeScript.CharacterCodes.emSpace:
                        case TypeScript.CharacterCodes.threePerEmSpace:
                        case TypeScript.CharacterCodes.fourPerEmSpace:
                        case TypeScript.CharacterCodes.sixPerEmSpace:
                        case TypeScript.CharacterCodes.figureSpace:
                        case TypeScript.CharacterCodes.punctuationSpace:
                        case TypeScript.CharacterCodes.thinSpace:
                        case TypeScript.CharacterCodes.hairSpace:
                        case TypeScript.CharacterCodes.zeroWidthSpace:
                        case TypeScript.CharacterCodes.narrowNoBreakSpace:
                        case TypeScript.CharacterCodes.ideographicSpace:

                        case TypeScript.CharacterCodes.tab:
                        case TypeScript.CharacterCodes.verticalTab:
                        case TypeScript.CharacterCodes.formFeed:
                        case TypeScript.CharacterCodes.byteOrderMark:
                            trivia.push(this.scanWhitespaceTrivia());
                            continue;

                        case TypeScript.CharacterCodes.slash:
                            var ch2 = this.slidingWindow.peekItemN(1);
                            if (ch2 === TypeScript.CharacterCodes.slash) {
                                trivia.push(this.scanSingleLineCommentTrivia());
                                continue;
                            }

                            if (ch2 === TypeScript.CharacterCodes.asterisk) {
                                trivia.push(this.scanMultiLineCommentTrivia());
                                continue;
                            }

                            throw TypeScript.Errors.invalidOperation();

                        case TypeScript.CharacterCodes.carriageReturn:
                        case TypeScript.CharacterCodes.lineFeed:
                        case TypeScript.CharacterCodes.paragraphSeparator:
                        case TypeScript.CharacterCodes.lineSeparator:
                            trivia.push(this.scanLineTerminatorSequenceTrivia(ch));

                            if (!isTrailing) {
                                continue;
                            }

                            break;

                        default:
                            throw TypeScript.Errors.invalidOperation();
                    }
                }

                return TypeScript.Syntax.triviaList(trivia);
            }
        };

        Scanner.prototype.scanTriviaInfo = function (diagnostics, isTrailing) {
            var width = 0;
            var hasCommentOrNewLine = 0;

            while (true) {
                var ch = this.currentCharCode();

                switch (ch) {
                    case TypeScript.CharacterCodes.space:
                    case TypeScript.CharacterCodes.nonBreakingSpace:
                    case TypeScript.CharacterCodes.enQuad:
                    case TypeScript.CharacterCodes.emQuad:
                    case TypeScript.CharacterCodes.enSpace:
                    case TypeScript.CharacterCodes.emSpace:
                    case TypeScript.CharacterCodes.threePerEmSpace:
                    case TypeScript.CharacterCodes.fourPerEmSpace:
                    case TypeScript.CharacterCodes.sixPerEmSpace:
                    case TypeScript.CharacterCodes.figureSpace:
                    case TypeScript.CharacterCodes.punctuationSpace:
                    case TypeScript.CharacterCodes.thinSpace:
                    case TypeScript.CharacterCodes.hairSpace:
                    case TypeScript.CharacterCodes.zeroWidthSpace:
                    case TypeScript.CharacterCodes.narrowNoBreakSpace:
                    case TypeScript.CharacterCodes.ideographicSpace:

                    case TypeScript.CharacterCodes.tab:
                    case TypeScript.CharacterCodes.verticalTab:
                    case TypeScript.CharacterCodes.formFeed:
                    case TypeScript.CharacterCodes.byteOrderMark:
                        this.slidingWindow.moveToNextItem();
                        width++;
                        continue;

                    case TypeScript.CharacterCodes.slash:
                        var ch2 = this.slidingWindow.peekItemN(1);
                        if (ch2 === TypeScript.CharacterCodes.slash) {
                            hasCommentOrNewLine |= TypeScript.SyntaxConstants.TriviaCommentMask;
                            width += this.scanSingleLineCommentTriviaLength();
                            continue;
                        }

                        if (ch2 === TypeScript.CharacterCodes.asterisk) {
                            hasCommentOrNewLine |= TypeScript.SyntaxConstants.TriviaCommentMask;
                            width += this.scanMultiLineCommentTriviaLength(diagnostics);
                            continue;
                        }

                        break;

                    case TypeScript.CharacterCodes.carriageReturn:
                    case TypeScript.CharacterCodes.lineFeed:
                    case TypeScript.CharacterCodes.paragraphSeparator:
                    case TypeScript.CharacterCodes.lineSeparator:
                        hasCommentOrNewLine |= TypeScript.SyntaxConstants.TriviaNewLineMask;
                        width += this.scanLineTerminatorSequenceLength(ch);

                        if (!isTrailing) {
                            continue;
                        }

                        break;
                }

                return (width << TypeScript.SyntaxConstants.TriviaFullWidthShift) | hasCommentOrNewLine;
            }
        };

        Scanner.prototype.isNewLineCharacter = function (ch) {
            switch (ch) {
                case TypeScript.CharacterCodes.carriageReturn:
                case TypeScript.CharacterCodes.lineFeed:
                case TypeScript.CharacterCodes.paragraphSeparator:
                case TypeScript.CharacterCodes.lineSeparator:
                    return true;
                default:
                    return false;
            }
        };

        Scanner.prototype.scanWhitespaceTrivia = function () {
            var absoluteStartIndex = this.slidingWindow.getAndPinAbsoluteIndex();

            var width = 0;
            while (true) {
                var ch = this.currentCharCode();

                switch (ch) {
                    case TypeScript.CharacterCodes.space:
                    case TypeScript.CharacterCodes.nonBreakingSpace:
                    case TypeScript.CharacterCodes.enQuad:
                    case TypeScript.CharacterCodes.emQuad:
                    case TypeScript.CharacterCodes.enSpace:
                    case TypeScript.CharacterCodes.emSpace:
                    case TypeScript.CharacterCodes.threePerEmSpace:
                    case TypeScript.CharacterCodes.fourPerEmSpace:
                    case TypeScript.CharacterCodes.sixPerEmSpace:
                    case TypeScript.CharacterCodes.figureSpace:
                    case TypeScript.CharacterCodes.punctuationSpace:
                    case TypeScript.CharacterCodes.thinSpace:
                    case TypeScript.CharacterCodes.hairSpace:
                    case TypeScript.CharacterCodes.zeroWidthSpace:
                    case TypeScript.CharacterCodes.narrowNoBreakSpace:
                    case TypeScript.CharacterCodes.ideographicSpace:

                    case TypeScript.CharacterCodes.tab:
                    case TypeScript.CharacterCodes.verticalTab:
                    case TypeScript.CharacterCodes.formFeed:
                    case TypeScript.CharacterCodes.byteOrderMark:
                        this.slidingWindow.moveToNextItem();
                        width++;
                        continue;
                }

                break;
            }

            var text = this.substring(absoluteStartIndex, absoluteStartIndex + width, false);
            this.slidingWindow.releaseAndUnpinAbsoluteIndex(absoluteStartIndex);

            return TypeScript.Syntax.whitespace(text);
        };

        Scanner.prototype.scanSingleLineCommentTrivia = function () {
            var absoluteStartIndex = this.slidingWindow.getAndPinAbsoluteIndex();
            var width = this.scanSingleLineCommentTriviaLength();

            var text = this.substring(absoluteStartIndex, absoluteStartIndex + width, false);
            this.slidingWindow.releaseAndUnpinAbsoluteIndex(absoluteStartIndex);

            return TypeScript.Syntax.singleLineComment(text);
        };

        Scanner.prototype.scanSingleLineCommentTriviaLength = function () {
            this.slidingWindow.moveToNextItem();
            this.slidingWindow.moveToNextItem();

            var width = 2;
            while (true) {
                if (this.slidingWindow.isAtEndOfSource() || this.isNewLineCharacter(this.currentCharCode())) {
                    return width;
                }

                this.slidingWindow.moveToNextItem();
                width++;
            }
        };

        Scanner.prototype.scanMultiLineCommentTrivia = function () {
            var absoluteStartIndex = this.slidingWindow.getAndPinAbsoluteIndex();
            var width = this.scanMultiLineCommentTriviaLength(null);

            var text = this.substring(absoluteStartIndex, absoluteStartIndex + width, false);
            this.slidingWindow.releaseAndUnpinAbsoluteIndex(absoluteStartIndex);

            return TypeScript.Syntax.multiLineComment(text);
        };

        Scanner.prototype.scanMultiLineCommentTriviaLength = function (diagnostics) {
            this.slidingWindow.moveToNextItem();
            this.slidingWindow.moveToNextItem();

            var width = 2;
            while (true) {
                if (this.slidingWindow.isAtEndOfSource()) {
                    if (diagnostics !== null) {
                        diagnostics.push(new TypeScript.SyntaxDiagnostic(this.fileName, this.slidingWindow.absoluteIndex(), 0, TypeScript.DiagnosticCode._StarSlash__expected, null));
                    }

                    return width;
                }

                var ch = this.currentCharCode();
                if (ch === TypeScript.CharacterCodes.asterisk && this.slidingWindow.peekItemN(1) === TypeScript.CharacterCodes.slash) {
                    this.slidingWindow.moveToNextItem();
                    this.slidingWindow.moveToNextItem();
                    width += 2;
                    return width;
                }

                this.slidingWindow.moveToNextItem();
                width++;
            }
        };

        Scanner.prototype.scanLineTerminatorSequenceTrivia = function (ch) {
            var absoluteStartIndex = this.slidingWindow.getAndPinAbsoluteIndex();
            var width = this.scanLineTerminatorSequenceLength(ch);

            var text = this.substring(absoluteStartIndex, absoluteStartIndex + width, false);
            this.slidingWindow.releaseAndUnpinAbsoluteIndex(absoluteStartIndex);

            return TypeScript.Syntax.trivia(TypeScript.SyntaxKind.NewLineTrivia, text);
        };

        Scanner.prototype.scanLineTerminatorSequenceLength = function (ch) {
            this.slidingWindow.moveToNextItem();

            if (ch === TypeScript.CharacterCodes.carriageReturn && this.currentCharCode() === TypeScript.CharacterCodes.lineFeed) {
                this.slidingWindow.moveToNextItem();
                return 2;
            } else {
                return 1;
            }
        };

        Scanner.prototype.scanSyntaxToken = function (diagnostics, allowRegularExpression) {
            if (this.slidingWindow.isAtEndOfSource()) {
                return TypeScript.SyntaxKind.EndOfFileToken;
            }

            var character = this.currentCharCode();

            switch (character) {
                case TypeScript.CharacterCodes.doubleQuote:
                case TypeScript.CharacterCodes.singleQuote:
                    return this.scanStringLiteral(diagnostics);

                case TypeScript.CharacterCodes.slash:
                    return this.scanSlashToken(allowRegularExpression);

                case TypeScript.CharacterCodes.dot:
                    return this.scanDotToken();

                case TypeScript.CharacterCodes.minus:
                    return this.scanMinusToken();

                case TypeScript.CharacterCodes.exclamation:
                    return this.scanExclamationToken();

                case TypeScript.CharacterCodes.equals:
                    return this.scanEqualsToken();

                case TypeScript.CharacterCodes.bar:
                    return this.scanBarToken();

                case TypeScript.CharacterCodes.asterisk:
                    return this.scanAsteriskToken();

                case TypeScript.CharacterCodes.plus:
                    return this.scanPlusToken();

                case TypeScript.CharacterCodes.percent:
                    return this.scanPercentToken();

                case TypeScript.CharacterCodes.ampersand:
                    return this.scanAmpersandToken();

                case TypeScript.CharacterCodes.caret:
                    return this.scanCaretToken();

                case TypeScript.CharacterCodes.lessThan:
                    return this.scanLessThanToken();

                case TypeScript.CharacterCodes.greaterThan:
                    return this.advanceAndSetTokenKind(TypeScript.SyntaxKind.GreaterThanToken);

                case TypeScript.CharacterCodes.comma:
                    return this.advanceAndSetTokenKind(TypeScript.SyntaxKind.CommaToken);

                case TypeScript.CharacterCodes.colon:
                    return this.advanceAndSetTokenKind(TypeScript.SyntaxKind.ColonToken);

                case TypeScript.CharacterCodes.semicolon:
                    return this.advanceAndSetTokenKind(TypeScript.SyntaxKind.SemicolonToken);

                case TypeScript.CharacterCodes.tilde:
                    return this.advanceAndSetTokenKind(TypeScript.SyntaxKind.TildeToken);

                case TypeScript.CharacterCodes.openParen:
                    return this.advanceAndSetTokenKind(TypeScript.SyntaxKind.OpenParenToken);

                case TypeScript.CharacterCodes.closeParen:
                    return this.advanceAndSetTokenKind(TypeScript.SyntaxKind.CloseParenToken);

                case TypeScript.CharacterCodes.openBrace:
                    return this.advanceAndSetTokenKind(TypeScript.SyntaxKind.OpenBraceToken);

                case TypeScript.CharacterCodes.closeBrace:
                    return this.advanceAndSetTokenKind(TypeScript.SyntaxKind.CloseBraceToken);

                case TypeScript.CharacterCodes.openBracket:
                    return this.advanceAndSetTokenKind(TypeScript.SyntaxKind.OpenBracketToken);

                case TypeScript.CharacterCodes.closeBracket:
                    return this.advanceAndSetTokenKind(TypeScript.SyntaxKind.CloseBracketToken);

                case TypeScript.CharacterCodes.question:
                    return this.advanceAndSetTokenKind(TypeScript.SyntaxKind.QuestionToken);
            }

            if (Scanner.isNumericLiteralStart[character]) {
                return this.scanNumericLiteral();
            }

            if (Scanner.isIdentifierStartCharacter[character]) {
                var result = this.tryFastScanIdentifierOrKeyword(character);
                if (result !== TypeScript.SyntaxKind.None) {
                    return result;
                }
            }

            if (this.isIdentifierStart(this.peekCharOrUnicodeEscape())) {
                return this.slowScanIdentifier(diagnostics);
            }

            return this.scanDefaultCharacter(character, diagnostics);
        };

        Scanner.prototype.isIdentifierStart = function (interpretedChar) {
            if (Scanner.isIdentifierStartCharacter[interpretedChar]) {
                return true;
            }

            return interpretedChar > TypeScript.CharacterCodes.maxAsciiCharacter && TypeScript.Unicode.isIdentifierStart(interpretedChar, this._languageVersion);
        };

        Scanner.prototype.isIdentifierPart = function (interpretedChar) {
            if (Scanner.isIdentifierPartCharacter[interpretedChar]) {
                return true;
            }

            return interpretedChar > TypeScript.CharacterCodes.maxAsciiCharacter && TypeScript.Unicode.isIdentifierPart(interpretedChar, this._languageVersion);
        };

        Scanner.prototype.tryFastScanIdentifierOrKeyword = function (firstCharacter) {
            var startIndex = this.slidingWindow.getAndPinAbsoluteIndex();

            while (true) {
                var character = this.currentCharCode();
                if (Scanner.isIdentifierPartCharacter[character]) {
                    this.slidingWindow.moveToNextItem();
                } else if (character === TypeScript.CharacterCodes.backslash || character > TypeScript.CharacterCodes.maxAsciiCharacter) {
                    this.slidingWindow.rewindToPinnedIndex(startIndex);
                    this.slidingWindow.releaseAndUnpinAbsoluteIndex(startIndex);
                    return TypeScript.SyntaxKind.None;
                } else {
                    var endIndex = this.slidingWindow.absoluteIndex();

                    var kind;
                    if (Scanner.isKeywordStartCharacter[firstCharacter]) {
                        var offset = startIndex - this.slidingWindow.windowAbsoluteStartIndex;
                        kind = TypeScript.ScannerUtilities.identifierKind(this.slidingWindow.window, offset, endIndex - startIndex);
                    } else {
                        kind = TypeScript.SyntaxKind.IdentifierName;
                    }

                    this.slidingWindow.releaseAndUnpinAbsoluteIndex(startIndex);
                    return kind;
                }
            }
        };

        Scanner.prototype.slowScanIdentifier = function (diagnostics) {
            var startIndex = this.slidingWindow.absoluteIndex();

            do {
                this.scanCharOrUnicodeEscape(diagnostics);
            } while(this.isIdentifierPart(this.peekCharOrUnicodeEscape()));

            return TypeScript.SyntaxKind.IdentifierName;
        };

        Scanner.prototype.scanNumericLiteral = function () {
            if (this.isHexNumericLiteral()) {
                return this.scanHexNumericLiteral();
            } else {
                return this.scanDecimalNumericLiteral();
            }
        };

        Scanner.prototype.scanDecimalNumericLiteral = function () {
            while (TypeScript.CharacterInfo.isDecimalDigit(this.currentCharCode())) {
                this.slidingWindow.moveToNextItem();
            }

            if (this.currentCharCode() === TypeScript.CharacterCodes.dot) {
                this.slidingWindow.moveToNextItem();
            }

            while (TypeScript.CharacterInfo.isDecimalDigit(this.currentCharCode())) {
                this.slidingWindow.moveToNextItem();
            }

            var ch = this.currentCharCode();
            if (ch === TypeScript.CharacterCodes.e || ch === TypeScript.CharacterCodes.E) {
                this.slidingWindow.moveToNextItem();

                ch = this.currentCharCode();
                if (ch === TypeScript.CharacterCodes.minus || ch === TypeScript.CharacterCodes.plus) {
                    if (TypeScript.CharacterInfo.isDecimalDigit(this.slidingWindow.peekItemN(1))) {
                        this.slidingWindow.moveToNextItem();
                    }
                }
            }

            while (TypeScript.CharacterInfo.isDecimalDigit(this.currentCharCode())) {
                this.slidingWindow.moveToNextItem();
            }

            return TypeScript.SyntaxKind.NumericLiteral;
        };

        Scanner.prototype.scanHexNumericLiteral = function () {
            this.slidingWindow.moveToNextItem();
            this.slidingWindow.moveToNextItem();

            while (TypeScript.CharacterInfo.isHexDigit(this.currentCharCode())) {
                this.slidingWindow.moveToNextItem();
            }

            return TypeScript.SyntaxKind.NumericLiteral;
        };

        Scanner.prototype.isHexNumericLiteral = function () {
            if (this.currentCharCode() === TypeScript.CharacterCodes._0) {
                var ch = this.slidingWindow.peekItemN(1);

                if (ch === TypeScript.CharacterCodes.x || ch === TypeScript.CharacterCodes.X) {
                    ch = this.slidingWindow.peekItemN(2);

                    return TypeScript.CharacterInfo.isHexDigit(ch);
                }
            }

            return false;
        };

        Scanner.prototype.advanceAndSetTokenKind = function (kind) {
            this.slidingWindow.moveToNextItem();
            return kind;
        };

        Scanner.prototype.scanLessThanToken = function () {
            this.slidingWindow.moveToNextItem();
            if (this.currentCharCode() === TypeScript.CharacterCodes.equals) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.LessThanEqualsToken;
            } else if (this.currentCharCode() === TypeScript.CharacterCodes.lessThan) {
                this.slidingWindow.moveToNextItem();
                if (this.currentCharCode() === TypeScript.CharacterCodes.equals) {
                    this.slidingWindow.moveToNextItem();
                    return TypeScript.SyntaxKind.LessThanLessThanEqualsToken;
                } else {
                    return TypeScript.SyntaxKind.LessThanLessThanToken;
                }
            } else {
                return TypeScript.SyntaxKind.LessThanToken;
            }
        };

        Scanner.prototype.scanBarToken = function () {
            this.slidingWindow.moveToNextItem();
            if (this.currentCharCode() === TypeScript.CharacterCodes.equals) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.BarEqualsToken;
            } else if (this.currentCharCode() === TypeScript.CharacterCodes.bar) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.BarBarToken;
            } else {
                return TypeScript.SyntaxKind.BarToken;
            }
        };

        Scanner.prototype.scanCaretToken = function () {
            this.slidingWindow.moveToNextItem();
            if (this.currentCharCode() === TypeScript.CharacterCodes.equals) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.CaretEqualsToken;
            } else {
                return TypeScript.SyntaxKind.CaretToken;
            }
        };

        Scanner.prototype.scanAmpersandToken = function () {
            this.slidingWindow.moveToNextItem();
            var character = this.currentCharCode();
            if (character === TypeScript.CharacterCodes.equals) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.AmpersandEqualsToken;
            } else if (this.currentCharCode() === TypeScript.CharacterCodes.ampersand) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.AmpersandAmpersandToken;
            } else {
                return TypeScript.SyntaxKind.AmpersandToken;
            }
        };

        Scanner.prototype.scanPercentToken = function () {
            this.slidingWindow.moveToNextItem();
            if (this.currentCharCode() === TypeScript.CharacterCodes.equals) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.PercentEqualsToken;
            } else {
                return TypeScript.SyntaxKind.PercentToken;
            }
        };

        Scanner.prototype.scanMinusToken = function () {
            this.slidingWindow.moveToNextItem();
            var character = this.currentCharCode();

            if (character === TypeScript.CharacterCodes.equals) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.MinusEqualsToken;
            } else if (character === TypeScript.CharacterCodes.minus) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.MinusMinusToken;
            } else {
                return TypeScript.SyntaxKind.MinusToken;
            }
        };

        Scanner.prototype.scanPlusToken = function () {
            this.slidingWindow.moveToNextItem();
            var character = this.currentCharCode();
            if (character === TypeScript.CharacterCodes.equals) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.PlusEqualsToken;
            } else if (character === TypeScript.CharacterCodes.plus) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.PlusPlusToken;
            } else {
                return TypeScript.SyntaxKind.PlusToken;
            }
        };

        Scanner.prototype.scanAsteriskToken = function () {
            this.slidingWindow.moveToNextItem();
            if (this.currentCharCode() === TypeScript.CharacterCodes.equals) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.AsteriskEqualsToken;
            } else {
                return TypeScript.SyntaxKind.AsteriskToken;
            }
        };

        Scanner.prototype.scanEqualsToken = function () {
            this.slidingWindow.moveToNextItem();
            var character = this.currentCharCode();
            if (character === TypeScript.CharacterCodes.equals) {
                this.slidingWindow.moveToNextItem();

                if (this.currentCharCode() === TypeScript.CharacterCodes.equals) {
                    this.slidingWindow.moveToNextItem();

                    return TypeScript.SyntaxKind.EqualsEqualsEqualsToken;
                } else {
                    return TypeScript.SyntaxKind.EqualsEqualsToken;
                }
            } else if (character === TypeScript.CharacterCodes.greaterThan) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.EqualsGreaterThanToken;
            } else {
                return TypeScript.SyntaxKind.EqualsToken;
            }
        };

        Scanner.prototype.isDotPrefixedNumericLiteral = function () {
            if (this.currentCharCode() === TypeScript.CharacterCodes.dot) {
                var ch = this.slidingWindow.peekItemN(1);
                return TypeScript.CharacterInfo.isDecimalDigit(ch);
            }

            return false;
        };

        Scanner.prototype.scanDotToken = function () {
            if (this.isDotPrefixedNumericLiteral()) {
                return this.scanNumericLiteral();
            }

            this.slidingWindow.moveToNextItem();
            if (this.currentCharCode() === TypeScript.CharacterCodes.dot && this.slidingWindow.peekItemN(1) === TypeScript.CharacterCodes.dot) {
                this.slidingWindow.moveToNextItem();
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.DotDotDotToken;
            } else {
                return TypeScript.SyntaxKind.DotToken;
            }
        };

        Scanner.prototype.scanSlashToken = function (allowRegularExpression) {
            if (allowRegularExpression) {
                var result = this.tryScanRegularExpressionToken();
                if (result !== TypeScript.SyntaxKind.None) {
                    return result;
                }
            }

            this.slidingWindow.moveToNextItem();
            if (this.currentCharCode() === TypeScript.CharacterCodes.equals) {
                this.slidingWindow.moveToNextItem();
                return TypeScript.SyntaxKind.SlashEqualsToken;
            } else {
                return TypeScript.SyntaxKind.SlashToken;
            }
        };

        Scanner.prototype.tryScanRegularExpressionToken = function () {
            var startIndex = this.slidingWindow.getAndPinAbsoluteIndex();
            try  {
                this.slidingWindow.moveToNextItem();

                var inEscape = false;
                var inCharacterClass = false;
                while (true) {
                    var ch = this.currentCharCode();
                    if (this.isNewLineCharacter(ch) || this.slidingWindow.isAtEndOfSource()) {
                        this.slidingWindow.rewindToPinnedIndex(startIndex);
                        return TypeScript.SyntaxKind.None;
                    }

                    this.slidingWindow.moveToNextItem();
                    if (inEscape) {
                        inEscape = false;
                        continue;
                    }

                    switch (ch) {
                        case TypeScript.CharacterCodes.backslash:
                            inEscape = true;
                            continue;

                        case TypeScript.CharacterCodes.openBracket:
                            inCharacterClass = true;
                            continue;

                        case TypeScript.CharacterCodes.closeBracket:
                            inCharacterClass = false;
                            continue;

                        case TypeScript.CharacterCodes.slash:
                            if (inCharacterClass) {
                                continue;
                            }

                            break;

                        default:
                            continue;
                    }

                    break;
                }

                while (Scanner.isIdentifierPartCharacter[this.currentCharCode()]) {
                    this.slidingWindow.moveToNextItem();
                }

                return TypeScript.SyntaxKind.RegularExpressionLiteral;
            } finally {
                this.slidingWindow.releaseAndUnpinAbsoluteIndex(startIndex);
            }
        };

        Scanner.prototype.scanExclamationToken = function () {
            this.slidingWindow.moveToNextItem();
            if (this.currentCharCode() === TypeScript.CharacterCodes.equals) {
                this.slidingWindow.moveToNextItem();

                if (this.currentCharCode() === TypeScript.CharacterCodes.equals) {
                    this.slidingWindow.moveToNextItem();

                    return TypeScript.SyntaxKind.ExclamationEqualsEqualsToken;
                } else {
                    return TypeScript.SyntaxKind.ExclamationEqualsToken;
                }
            } else {
                return TypeScript.SyntaxKind.ExclamationToken;
            }
        };

        Scanner.prototype.scanDefaultCharacter = function (character, diagnostics) {
            var position = this.slidingWindow.absoluteIndex();
            this.slidingWindow.moveToNextItem();

            var text = String.fromCharCode(character);
            var messageText = this.getErrorMessageText(text);
            diagnostics.push(new TypeScript.SyntaxDiagnostic(this.fileName, position, 1, TypeScript.DiagnosticCode.Unexpected_character_0, [messageText]));

            return TypeScript.SyntaxKind.ErrorToken;
        };

        Scanner.prototype.getErrorMessageText = function (text) {
            if (text === "\\") {
                return '"\\"';
            }

            return JSON2.stringify(text);
        };

        Scanner.prototype.skipEscapeSequence = function (diagnostics) {
            var rewindPoint = this.slidingWindow.getAndPinAbsoluteIndex();
            try  {
                this.slidingWindow.moveToNextItem();

                var ch = this.currentCharCode();
                this.slidingWindow.moveToNextItem();
                switch (ch) {
                    case TypeScript.CharacterCodes.x:
                    case TypeScript.CharacterCodes.u:
                        this.slidingWindow.rewindToPinnedIndex(rewindPoint);
                        var value = this.scanUnicodeOrHexEscape(diagnostics);
                        return;

                    case TypeScript.CharacterCodes.carriageReturn:
                        if (this.currentCharCode() === TypeScript.CharacterCodes.lineFeed) {
                            this.slidingWindow.moveToNextItem();
                        }
                        return;

                    default:
                        return;
                }
            } finally {
                this.slidingWindow.releaseAndUnpinAbsoluteIndex(rewindPoint);
            }
        };

        Scanner.prototype.scanStringLiteral = function (diagnostics) {
            var quoteCharacter = this.currentCharCode();

            this.slidingWindow.moveToNextItem();

            while (true) {
                var ch = this.currentCharCode();
                if (ch === TypeScript.CharacterCodes.backslash) {
                    this.skipEscapeSequence(diagnostics);
                } else if (ch === quoteCharacter) {
                    this.slidingWindow.moveToNextItem();
                    break;
                } else if (this.isNewLineCharacter(ch) || this.slidingWindow.isAtEndOfSource()) {
                    diagnostics.push(new TypeScript.SyntaxDiagnostic(this.fileName, this.slidingWindow.absoluteIndex(), 1, TypeScript.DiagnosticCode.Missing_closing_quote_character, null));
                    break;
                } else {
                    this.slidingWindow.moveToNextItem();
                }
            }

            return TypeScript.SyntaxKind.StringLiteral;
        };

        Scanner.prototype.isUnicodeOrHexEscape = function (character) {
            return this.isUnicodeEscape(character) || this.isHexEscape(character);
        };

        Scanner.prototype.isUnicodeEscape = function (character) {
            if (character === TypeScript.CharacterCodes.backslash) {
                var ch2 = this.slidingWindow.peekItemN(1);
                if (ch2 === TypeScript.CharacterCodes.u) {
                    return true;
                }
            }

            return false;
        };

        Scanner.prototype.isHexEscape = function (character) {
            if (character === TypeScript.CharacterCodes.backslash) {
                var ch2 = this.slidingWindow.peekItemN(1);
                if (ch2 === TypeScript.CharacterCodes.x) {
                    return true;
                }
            }

            return false;
        };

        Scanner.prototype.peekCharOrUnicodeOrHexEscape = function () {
            var character = this.currentCharCode();
            if (this.isUnicodeOrHexEscape(character)) {
                return this.peekUnicodeOrHexEscape();
            } else {
                return character;
            }
        };

        Scanner.prototype.peekCharOrUnicodeEscape = function () {
            var character = this.currentCharCode();
            if (this.isUnicodeEscape(character)) {
                return this.peekUnicodeOrHexEscape();
            } else {
                return character;
            }
        };

        Scanner.prototype.peekUnicodeOrHexEscape = function () {
            var startIndex = this.slidingWindow.getAndPinAbsoluteIndex();

            var ch = this.scanUnicodeOrHexEscape(null);

            this.slidingWindow.rewindToPinnedIndex(startIndex);
            this.slidingWindow.releaseAndUnpinAbsoluteIndex(startIndex);

            return ch;
        };

        Scanner.prototype.scanCharOrUnicodeEscape = function (errors) {
            var ch = this.currentCharCode();
            if (ch === TypeScript.CharacterCodes.backslash) {
                var ch2 = this.slidingWindow.peekItemN(1);
                if (ch2 === TypeScript.CharacterCodes.u) {
                    return this.scanUnicodeOrHexEscape(errors);
                }
            }

            this.slidingWindow.moveToNextItem();
            return ch;
        };

        Scanner.prototype.scanCharOrUnicodeOrHexEscape = function (errors) {
            var ch = this.currentCharCode();
            if (ch === TypeScript.CharacterCodes.backslash) {
                var ch2 = this.slidingWindow.peekItemN(1);
                if (ch2 === TypeScript.CharacterCodes.u || ch2 === TypeScript.CharacterCodes.x) {
                    return this.scanUnicodeOrHexEscape(errors);
                }
            }

            this.slidingWindow.moveToNextItem();
            return ch;
        };

        Scanner.prototype.scanUnicodeOrHexEscape = function (errors) {
            var start = this.slidingWindow.absoluteIndex();
            var character = this.currentCharCode();

            this.slidingWindow.moveToNextItem();

            character = this.currentCharCode();

            var intChar = 0;
            this.slidingWindow.moveToNextItem();

            var count = character === TypeScript.CharacterCodes.u ? 4 : 2;

            for (var i = 0; i < count; i++) {
                var ch2 = this.currentCharCode();
                if (!TypeScript.CharacterInfo.isHexDigit(ch2)) {
                    if (errors !== null) {
                        var end = this.slidingWindow.absoluteIndex();
                        var info = this.createIllegalEscapeDiagnostic(start, end);
                        errors.push(info);
                    }

                    break;
                }

                intChar = (intChar << 4) + TypeScript.CharacterInfo.hexValue(ch2);
                this.slidingWindow.moveToNextItem();
            }

            return intChar;
        };

        Scanner.prototype.substring = function (start, end, intern) {
            var length = end - start;
            var offset = start - this.slidingWindow.windowAbsoluteStartIndex;

            if (intern) {
                return TypeScript.Collections.DefaultStringTable.addCharArray(this.slidingWindow.window, offset, length);
            } else {
                return TypeScript.StringUtilities.fromCharCodeArray(this.slidingWindow.window.slice(offset, offset + length));
            }
        };

        Scanner.prototype.createIllegalEscapeDiagnostic = function (start, end) {
            return new TypeScript.SyntaxDiagnostic(this.fileName, start, end - start, TypeScript.DiagnosticCode.Unrecognized_escape_sequence, null);
        };

        Scanner.isValidIdentifier = function (text, languageVersion) {
            var scanner = new Scanner(null, text, TypeScript.LanguageVersion, Scanner.triviaWindow);
            var errors = [];
            var token = scanner.scan(errors, false);

            return errors.length === 0 && TypeScript.SyntaxFacts.isIdentifierNameOrAnyKeyword(token) && token.width() === text.length();
        };
        Scanner.isKeywordStartCharacter = [];
        Scanner.isIdentifierStartCharacter = [];
        Scanner.isIdentifierPartCharacter = [];
        Scanner.isNumericLiteralStart = [];

        Scanner.triviaWindow = TypeScript.ArrayUtilities.createArray(2048, 0);
        return Scanner;
    })();
    TypeScript.Scanner = Scanner;
})(TypeScript || (TypeScript = {}));
