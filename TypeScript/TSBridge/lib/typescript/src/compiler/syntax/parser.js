var TypeScript;
(function (TypeScript) {
    (function (Parser) {
        var ExpressionPrecedence;
        (function (ExpressionPrecedence) {
            ExpressionPrecedence[ExpressionPrecedence["CommaExpressionPrecedence"] = 1] = "CommaExpressionPrecedence";

            ExpressionPrecedence[ExpressionPrecedence["AssignmentExpressionPrecedence"] = 2] = "AssignmentExpressionPrecedence";

            ExpressionPrecedence[ExpressionPrecedence["ConditionalExpressionPrecedence"] = 3] = "ConditionalExpressionPrecedence";

            ExpressionPrecedence[ExpressionPrecedence["ArrowFunctionPrecedence"] = 4] = "ArrowFunctionPrecedence";

            ExpressionPrecedence[ExpressionPrecedence["LogicalOrExpressionPrecedence"] = 5] = "LogicalOrExpressionPrecedence";
            ExpressionPrecedence[ExpressionPrecedence["LogicalAndExpressionPrecedence"] = 6] = "LogicalAndExpressionPrecedence";
            ExpressionPrecedence[ExpressionPrecedence["BitwiseOrExpressionPrecedence"] = 7] = "BitwiseOrExpressionPrecedence";
            ExpressionPrecedence[ExpressionPrecedence["BitwiseExclusiveOrExpressionPrecedence"] = 8] = "BitwiseExclusiveOrExpressionPrecedence";
            ExpressionPrecedence[ExpressionPrecedence["BitwiseAndExpressionPrecedence"] = 9] = "BitwiseAndExpressionPrecedence";
            ExpressionPrecedence[ExpressionPrecedence["EqualityExpressionPrecedence"] = 10] = "EqualityExpressionPrecedence";
            ExpressionPrecedence[ExpressionPrecedence["RelationalExpressionPrecedence"] = 11] = "RelationalExpressionPrecedence";
            ExpressionPrecedence[ExpressionPrecedence["ShiftExpressionPrecdence"] = 12] = "ShiftExpressionPrecdence";
            ExpressionPrecedence[ExpressionPrecedence["AdditiveExpressionPrecedence"] = 13] = "AdditiveExpressionPrecedence";
            ExpressionPrecedence[ExpressionPrecedence["MultiplicativeExpressionPrecedence"] = 14] = "MultiplicativeExpressionPrecedence";

            ExpressionPrecedence[ExpressionPrecedence["UnaryExpressionPrecedence"] = 15] = "UnaryExpressionPrecedence";
        })(ExpressionPrecedence || (ExpressionPrecedence = {}));

        var ListParsingState;
        (function (ListParsingState) {
            ListParsingState[ListParsingState["SourceUnit_ModuleElements"] = 1 << 0] = "SourceUnit_ModuleElements";
            ListParsingState[ListParsingState["ClassDeclaration_ClassElements"] = 1 << 1] = "ClassDeclaration_ClassElements";
            ListParsingState[ListParsingState["ModuleDeclaration_ModuleElements"] = 1 << 2] = "ModuleDeclaration_ModuleElements";
            ListParsingState[ListParsingState["SwitchStatement_SwitchClauses"] = 1 << 3] = "SwitchStatement_SwitchClauses";
            ListParsingState[ListParsingState["SwitchClause_Statements"] = 1 << 4] = "SwitchClause_Statements";
            ListParsingState[ListParsingState["Block_Statements"] = 1 << 5] = "Block_Statements";
            ListParsingState[ListParsingState["TryBlock_Statements"] = 1 << 6] = "TryBlock_Statements";
            ListParsingState[ListParsingState["CatchBlock_Statements"] = 1 << 7] = "CatchBlock_Statements";
            ListParsingState[ListParsingState["EnumDeclaration_EnumElements"] = 1 << 8] = "EnumDeclaration_EnumElements";
            ListParsingState[ListParsingState["ObjectType_TypeMembers"] = 1 << 9] = "ObjectType_TypeMembers";
            ListParsingState[ListParsingState["ClassOrInterfaceDeclaration_HeritageClauses"] = 1 << 10] = "ClassOrInterfaceDeclaration_HeritageClauses";
            ListParsingState[ListParsingState["HeritageClause_TypeNameList"] = 1 << 11] = "HeritageClause_TypeNameList";
            ListParsingState[ListParsingState["VariableDeclaration_VariableDeclarators_AllowIn"] = 1 << 12] = "VariableDeclaration_VariableDeclarators_AllowIn";
            ListParsingState[ListParsingState["VariableDeclaration_VariableDeclarators_DisallowIn"] = 1 << 13] = "VariableDeclaration_VariableDeclarators_DisallowIn";
            ListParsingState[ListParsingState["ArgumentList_AssignmentExpressions"] = 1 << 14] = "ArgumentList_AssignmentExpressions";
            ListParsingState[ListParsingState["ObjectLiteralExpression_PropertyAssignments"] = 1 << 15] = "ObjectLiteralExpression_PropertyAssignments";
            ListParsingState[ListParsingState["ArrayLiteralExpression_AssignmentExpressions"] = 1 << 16] = "ArrayLiteralExpression_AssignmentExpressions";
            ListParsingState[ListParsingState["ParameterList_Parameters"] = 1 << 17] = "ParameterList_Parameters";
            ListParsingState[ListParsingState["TypeArgumentList_Types"] = 1 << 18] = "TypeArgumentList_Types";
            ListParsingState[ListParsingState["TypeParameterList_TypeParameters"] = 1 << 19] = "TypeParameterList_TypeParameters";

            ListParsingState[ListParsingState["FirstListParsingState"] = ListParsingState.SourceUnit_ModuleElements] = "FirstListParsingState";
            ListParsingState[ListParsingState["LastListParsingState"] = ListParsingState.TypeArgumentList_Types] = "LastListParsingState";
        })(ListParsingState || (ListParsingState = {}));

        var SyntaxCursor = (function () {
            function SyntaxCursor(sourceUnit) {
                this._elements = [];
                this._index = 0;
                this._pinCount = 0;
                sourceUnit.insertChildrenInto(this._elements, 0);
            }
            SyntaxCursor.prototype.isFinished = function () {
                return this._index === this._elements.length;
            };

            SyntaxCursor.prototype.currentElement = function () {
                if (this.isFinished()) {
                    return null;
                }

                return this._elements[this._index];
            };

            SyntaxCursor.prototype.currentNode = function () {
                var element = this.currentElement();
                return element !== null && element.isNode() ? element : null;
            };

            SyntaxCursor.prototype.moveToFirstChild = function () {
                if (this.isFinished()) {
                    return;
                }

                var element = this._elements[this._index];
                if (element.isToken()) {
                    return;
                }

                var node = element;

                this._elements.splice(this._index, 1);

                node.insertChildrenInto(this._elements, this._index);
            };

            SyntaxCursor.prototype.moveToNextSibling = function () {
                if (this.isFinished()) {
                    return;
                }

                if (this._pinCount > 0) {
                    this._index++;
                    return;
                }

                this._elements.shift();
            };

            SyntaxCursor.prototype.getAndPinCursorIndex = function () {
                this._pinCount++;
                return this._index;
            };

            SyntaxCursor.prototype.releaseAndUnpinCursorIndex = function (index) {
                this._pinCount--;
                if (this._pinCount === 0) {
                }
            };

            SyntaxCursor.prototype.rewindToPinnedCursorIndex = function (index) {
                this._index = index;
            };

            SyntaxCursor.prototype.pinCount = function () {
                return this._pinCount;
            };

            SyntaxCursor.prototype.moveToFirstToken = function () {
                var element;

                while (!this.isFinished()) {
                    element = this.currentElement();
                    if (element.isNode()) {
                        this.moveToFirstChild();
                        continue;
                    }

                    return;
                }
            };

            SyntaxCursor.prototype.currentToken = function () {
                this.moveToFirstToken();
                if (this.isFinished()) {
                    return null;
                }

                var element = this.currentElement();

                return element;
            };

            SyntaxCursor.prototype.peekToken = function (n) {
                this.moveToFirstToken();
                var pin = this.getAndPinCursorIndex();
                try  {
                    for (var i = 0; i < n; i++) {
                        this.moveToNextSibling();
                        this.moveToFirstToken();
                    }

                    return this.currentToken();
                } finally {
                    this.rewindToPinnedCursorIndex(pin);
                    this.releaseAndUnpinCursorIndex(pin);
                }
            };
            return SyntaxCursor;
        })();

        var NormalParserSource = (function () {
            function NormalParserSource(fileName, text, languageVersion) {
                this._previousToken = null;
                this._absolutePosition = 0;
                this._tokenDiagnostics = [];
                this.rewindPointPool = [];
                this.rewindPointPoolCount = 0;
                this.slidingWindow = new TypeScript.SlidingWindow(this, TypeScript.ArrayUtilities.createArray(32, null), null);
                this.scanner = new TypeScript.Scanner(fileName, text, languageVersion);
            }
            NormalParserSource.prototype.languageVersion = function () {
                return this.scanner.languageVersion();
            };

            NormalParserSource.prototype.currentNode = function () {
                return null;
            };

            NormalParserSource.prototype.moveToNextNode = function () {
                throw TypeScript.Errors.invalidOperation();
            };

            NormalParserSource.prototype.absolutePosition = function () {
                return this._absolutePosition;
            };

            NormalParserSource.prototype.previousToken = function () {
                return this._previousToken;
            };

            NormalParserSource.prototype.tokenDiagnostics = function () {
                return this._tokenDiagnostics;
            };

            NormalParserSource.prototype.getOrCreateRewindPoint = function () {
                if (this.rewindPointPoolCount === 0) {
                    return {};
                }

                this.rewindPointPoolCount--;
                var result = this.rewindPointPool[this.rewindPointPoolCount];
                this.rewindPointPool[this.rewindPointPoolCount] = null;
                return result;
            };

            NormalParserSource.prototype.getRewindPoint = function () {
                var slidingWindowIndex = this.slidingWindow.getAndPinAbsoluteIndex();

                var rewindPoint = this.getOrCreateRewindPoint();

                rewindPoint.slidingWindowIndex = slidingWindowIndex;
                rewindPoint.previousToken = this._previousToken;
                rewindPoint.absolutePosition = this._absolutePosition;

                rewindPoint.pinCount = this.slidingWindow.pinCount();

                return rewindPoint;
            };

            NormalParserSource.prototype.isPinned = function () {
                return this.slidingWindow.pinCount() > 0;
            };

            NormalParserSource.prototype.rewind = function (rewindPoint) {
                this.slidingWindow.rewindToPinnedIndex(rewindPoint.slidingWindowIndex);

                this._previousToken = rewindPoint.previousToken;
                this._absolutePosition = rewindPoint.absolutePosition;
            };

            NormalParserSource.prototype.releaseRewindPoint = function (rewindPoint) {
                this.slidingWindow.releaseAndUnpinAbsoluteIndex((rewindPoint).absoluteIndex);

                this.rewindPointPool[this.rewindPointPoolCount] = rewindPoint;
                this.rewindPointPoolCount++;
            };

            NormalParserSource.prototype.fetchMoreItems = function (allowRegularExpression, sourceIndex, window, destinationIndex, spaceAvailable) {
                window[destinationIndex] = this.scanner.scan(this._tokenDiagnostics, allowRegularExpression);
                return 1;
            };

            NormalParserSource.prototype.peekToken = function (n) {
                return this.slidingWindow.peekItemN(n);
            };

            NormalParserSource.prototype.moveToNextToken = function () {
                var currentToken = this.currentToken();
                this._absolutePosition += currentToken.fullWidth();
                this._previousToken = currentToken;

                this.slidingWindow.moveToNextItem();
            };

            NormalParserSource.prototype.currentToken = function () {
                return this.slidingWindow.currentItem(false);
            };

            NormalParserSource.prototype.removeDiagnosticsOnOrAfterPosition = function (position) {
                var tokenDiagnosticsLength = this._tokenDiagnostics.length;
                while (tokenDiagnosticsLength > 0) {
                    var diagnostic = this._tokenDiagnostics[tokenDiagnosticsLength - 1];
                    if (diagnostic.start() >= position) {
                        tokenDiagnosticsLength--;
                    } else {
                        break;
                    }
                }

                this._tokenDiagnostics.length = tokenDiagnosticsLength;
            };

            NormalParserSource.prototype.resetToPosition = function (absolutePosition, previousToken) {
                this._absolutePosition = absolutePosition;
                this._previousToken = previousToken;

                this.removeDiagnosticsOnOrAfterPosition(absolutePosition);

                this.slidingWindow.disgardAllItemsFromCurrentIndexOnwards();

                this.scanner.setAbsoluteIndex(absolutePosition);
            };

            NormalParserSource.prototype.currentTokenAllowingRegularExpression = function () {
                this.resetToPosition(this._absolutePosition, this._previousToken);

                var token = this.slidingWindow.currentItem(true);

                return token;
            };
            return NormalParserSource;
        })();

        var IncrementalParserSource = (function () {
            function IncrementalParserSource(oldSyntaxTree, textChangeRange, newText) {
                this._changeDelta = 0;
                var oldSourceUnit = oldSyntaxTree.sourceUnit();
                this._oldSourceUnitCursor = new SyntaxCursor(oldSourceUnit);

                this._changeRange = IncrementalParserSource.extendToAffectedRange(textChangeRange, oldSourceUnit);

                this._normalParserSource = new NormalParserSource(oldSyntaxTree.fileName(), newText, oldSyntaxTree.languageVersion());
            }
            IncrementalParserSource.extendToAffectedRange = function (changeRange, sourceUnit) {
                var maxLookahead = 1;

                var start = changeRange.span().start();

                for (var i = 0; start > 0 && i <= maxLookahead; i++) {
                    var token = sourceUnit.findToken(start);

                    var position = token.fullStart();

                    start = TypeScript.MathPrototype.max(0, position - 1);
                }

                var finalSpan = TypeScript.TextSpan.fromBounds(start, changeRange.span().end());
                var finalLength = changeRange.newLength() + (changeRange.span().start() - start);

                return new TypeScript.TextChangeRange(finalSpan, finalLength);
            };

            IncrementalParserSource.prototype.languageVersion = function () {
                return this._normalParserSource.languageVersion();
            };

            IncrementalParserSource.prototype.absolutePosition = function () {
                return this._normalParserSource.absolutePosition();
            };

            IncrementalParserSource.prototype.previousToken = function () {
                return this._normalParserSource.previousToken();
            };

            IncrementalParserSource.prototype.tokenDiagnostics = function () {
                return this._normalParserSource.tokenDiagnostics();
            };

            IncrementalParserSource.prototype.getRewindPoint = function () {
                var rewindPoint = this._normalParserSource.getRewindPoint();
                var oldSourceUnitCursorIndex = this._oldSourceUnitCursor.getAndPinCursorIndex();

                rewindPoint.changeDelta = this._changeDelta;
                rewindPoint.changeRange = this._changeRange;
                rewindPoint.oldSourceUnitCursorIndex = oldSourceUnitCursorIndex;

                return rewindPoint;
            };

            IncrementalParserSource.prototype.rewind = function (rewindPoint) {
                this._changeRange = rewindPoint.changeRange;
                this._changeDelta = rewindPoint.changeDelta;
                this._oldSourceUnitCursor.rewindToPinnedCursorIndex(rewindPoint.oldSourceUnitCursorIndex);

                this._normalParserSource.rewind(rewindPoint);
            };

            IncrementalParserSource.prototype.releaseRewindPoint = function (rewindPoint) {
                this._oldSourceUnitCursor.releaseAndUnpinCursorIndex(rewindPoint.oldSourceUnitCursorIndex);
                this._normalParserSource.releaseRewindPoint(rewindPoint);
            };

            IncrementalParserSource.prototype.canReadFromOldSourceUnit = function () {
                if (this._normalParserSource.isPinned()) {
                    return false;
                }

                if (this._changeRange !== null && this._changeRange.newSpan().intersectsWithPosition(this.absolutePosition())) {
                    return false;
                }

                this.syncCursorToNewTextIfBehind();

                return this._changeDelta === 0 && !this._oldSourceUnitCursor.isFinished();
            };

            IncrementalParserSource.prototype.currentNode = function () {
                if (this.canReadFromOldSourceUnit()) {
                    return this.tryGetNodeFromOldSourceUnit();
                }

                return null;
            };

            IncrementalParserSource.prototype.currentToken = function () {
                if (this.canReadFromOldSourceUnit()) {
                    var token = this.tryGetTokenFromOldSourceUnit();
                    if (token !== null) {
                        return token;
                    }
                }

                return this._normalParserSource.currentToken();
            };

            IncrementalParserSource.prototype.currentTokenAllowingRegularExpression = function () {
                return this._normalParserSource.currentTokenAllowingRegularExpression();
            };

            IncrementalParserSource.prototype.syncCursorToNewTextIfBehind = function () {
                while (true) {
                    if (this._oldSourceUnitCursor.isFinished()) {
                        break;
                    }

                    if (this._changeDelta >= 0) {
                        break;
                    }

                    var currentElement = this._oldSourceUnitCursor.currentElement();

                    if (currentElement.isNode() && (currentElement.fullWidth() > Math.abs(this._changeDelta))) {
                        this._oldSourceUnitCursor.moveToFirstChild();
                    } else {
                        this._oldSourceUnitCursor.moveToNextSibling();

                        this._changeDelta += currentElement.fullWidth();
                    }
                }
            };

            IncrementalParserSource.prototype.intersectsWithChangeRangeSpanInOriginalText = function (start, length) {
                return this._changeRange !== null && this._changeRange.span().intersectsWith(start, length);
            };

            IncrementalParserSource.prototype.tryGetNodeFromOldSourceUnit = function () {
                while (true) {
                    var node = this._oldSourceUnitCursor.currentNode();
                    if (node === null) {
                        return null;
                    }

                    if (!this.intersectsWithChangeRangeSpanInOriginalText(this.absolutePosition(), node.fullWidth())) {
                        if (!node.isIncrementallyUnusable()) {
                            return node;
                        }
                    }

                    this._oldSourceUnitCursor.moveToFirstChild();
                }
            };

            IncrementalParserSource.prototype.canReuseTokenFromOldSourceUnit = function (position, token) {
                if (token !== null) {
                    if (!this.intersectsWithChangeRangeSpanInOriginalText(position, token.fullWidth())) {
                        if (!token.isIncrementallyUnusable()) {
                            return true;
                        }
                    }
                }

                return false;
            };

            IncrementalParserSource.prototype.tryGetTokenFromOldSourceUnit = function () {
                var token = this._oldSourceUnitCursor.currentToken();

                return this.canReuseTokenFromOldSourceUnit(this.absolutePosition(), token) ? token : null;
            };

            IncrementalParserSource.prototype.peekToken = function (n) {
                if (this.canReadFromOldSourceUnit()) {
                    var token = this.tryPeekTokenFromOldSourceUnit(n);
                    if (token !== null) {
                        return token;
                    }
                }

                return this._normalParserSource.peekToken(n);
            };

            IncrementalParserSource.prototype.tryPeekTokenFromOldSourceUnit = function (n) {
                var currentPosition = this.absolutePosition();
                for (var i = 0; i < n; i++) {
                    var interimToken = this._oldSourceUnitCursor.peekToken(i);
                    if (!this.canReuseTokenFromOldSourceUnit(currentPosition, interimToken)) {
                        return null;
                    }

                    currentPosition += interimToken.fullWidth();
                }

                var token = this._oldSourceUnitCursor.peekToken(n);
                return this.canReuseTokenFromOldSourceUnit(currentPosition, token) ? token : null;
            };

            IncrementalParserSource.prototype.moveToNextNode = function () {
                var currentElement = this._oldSourceUnitCursor.currentElement();
                var currentNode = this._oldSourceUnitCursor.currentNode();

                this._oldSourceUnitCursor.moveToNextSibling();

                var absolutePosition = this.absolutePosition() + currentNode.fullWidth();
                var previousToken = currentNode.lastToken();
                this._normalParserSource.resetToPosition(absolutePosition, previousToken);

                if (this._changeRange !== null) {
                }
            };

            IncrementalParserSource.prototype.moveToNextToken = function () {
                var currentToken = this.currentToken();

                if (this._oldSourceUnitCursor.currentToken() === currentToken) {
                    this._oldSourceUnitCursor.moveToNextSibling();

                    var absolutePosition = this.absolutePosition() + currentToken.fullWidth();
                    var previousToken = currentToken;
                    this._normalParserSource.resetToPosition(absolutePosition, previousToken);

                    if (this._changeRange !== null) {
                    }
                } else {
                    this._changeDelta -= currentToken.fullWidth();

                    this._normalParserSource.moveToNextToken();

                    if (this._changeRange !== null) {
                        var changeRangeSpanInNewText = this._changeRange.newSpan();
                        if (this.absolutePosition() >= changeRangeSpanInNewText.end()) {
                            this._changeDelta += this._changeRange.newLength() - this._changeRange.span().length();
                            this._changeRange = null;
                        }
                    }
                }
            };
            return IncrementalParserSource;
        })();

        var ParserImpl = (function () {
            function ParserImpl(fileName, lineMap, source, parseOptions) {
                this.listParsingState = 0;
                this.isInStrictMode = false;
                this.diagnostics = [];
                this.factory = TypeScript.Syntax.normalModeFactory;
                this.mergeTokensStorage = [];
                this.arrayPool = [];
                this.fileName = fileName;
                this.lineMap = lineMap;
                this.source = source;
                this.parseOptions = parseOptions;
            }
            ParserImpl.prototype.getRewindPoint = function () {
                var rewindPoint = this.source.getRewindPoint();

                rewindPoint.diagnosticsCount = this.diagnostics.length;

                rewindPoint.isInStrictMode = this.isInStrictMode;
                rewindPoint.listParsingState = this.listParsingState;

                return rewindPoint;
            };

            ParserImpl.prototype.rewind = function (rewindPoint) {
                this.source.rewind(rewindPoint);

                this.diagnostics.length = rewindPoint.diagnosticsCount;
            };

            ParserImpl.prototype.releaseRewindPoint = function (rewindPoint) {
                this.source.releaseRewindPoint(rewindPoint);
            };

            ParserImpl.prototype.currentTokenStart = function () {
                return this.source.absolutePosition() + this.currentToken().leadingTriviaWidth();
            };

            ParserImpl.prototype.previousTokenStart = function () {
                if (this.previousToken() === null) {
                    return 0;
                }

                return this.source.absolutePosition() - this.previousToken().fullWidth() + this.previousToken().leadingTriviaWidth();
            };

            ParserImpl.prototype.previousTokenEnd = function () {
                if (this.previousToken() === null) {
                    return 0;
                }

                return this.previousTokenStart() + this.previousToken().width();
            };

            ParserImpl.prototype.currentNode = function () {
                var node = this.source.currentNode();

                if (node === null || node.parsedInStrictMode() !== this.isInStrictMode) {
                    return null;
                }

                return node;
            };

            ParserImpl.prototype.currentToken = function () {
                return this.source.currentToken();
            };

            ParserImpl.prototype.currentTokenAllowingRegularExpression = function () {
                return this.source.currentTokenAllowingRegularExpression();
            };

            ParserImpl.prototype.peekToken = function (n) {
                return this.source.peekToken(n);
            };

            ParserImpl.prototype.eatAnyToken = function () {
                var token = this.currentToken();
                this.moveToNextToken();
                return token;
            };

            ParserImpl.prototype.moveToNextToken = function () {
                this.source.moveToNextToken();
            };

            ParserImpl.prototype.previousToken = function () {
                return this.source.previousToken();
            };

            ParserImpl.prototype.eatNode = function () {
                var node = this.source.currentNode();
                this.source.moveToNextNode();
                return node;
            };

            ParserImpl.prototype.eatToken = function (kind) {
                var token = this.currentToken();
                if (token.tokenKind === kind) {
                    this.moveToNextToken();
                    return token;
                }

                return this.createMissingToken(kind, token);
            };

            ParserImpl.prototype.tryEatToken = function (kind) {
                if (this.currentToken().tokenKind === kind) {
                    return this.eatToken(kind);
                }

                return null;
            };

            ParserImpl.prototype.tryEatKeyword = function (kind) {
                if (this.currentToken().tokenKind === kind) {
                    return this.eatKeyword(kind);
                }

                return null;
            };

            ParserImpl.prototype.eatKeyword = function (kind) {
                var token = this.currentToken();
                if (token.tokenKind === kind) {
                    this.moveToNextToken();
                    return token;
                }

                return this.createMissingToken(kind, token);
            };

            ParserImpl.prototype.isIdentifier = function (token) {
                var tokenKind = token.tokenKind;

                if (tokenKind === TypeScript.SyntaxKind.IdentifierName) {
                    return true;
                }

                if (tokenKind >= TypeScript.SyntaxKind.FirstFutureReservedStrictKeyword) {
                    if (tokenKind <= TypeScript.SyntaxKind.LastFutureReservedStrictKeyword) {
                        return !this.isInStrictMode;
                    }

                    return tokenKind <= TypeScript.SyntaxKind.LastTypeScriptKeyword;
                }

                return false;
            };

            ParserImpl.prototype.eatIdentifierNameToken = function () {
                var token = this.currentToken();

                if (token.tokenKind === TypeScript.SyntaxKind.IdentifierName) {
                    this.moveToNextToken();
                    return token;
                }

                if (TypeScript.SyntaxFacts.isAnyKeyword(token.tokenKind)) {
                    this.moveToNextToken();
                    return TypeScript.Syntax.convertToIdentifierName(token);
                }

                return this.createMissingToken(TypeScript.SyntaxKind.IdentifierName, token);
            };

            ParserImpl.prototype.eatIdentifierToken = function () {
                var token = this.currentToken();
                if (this.isIdentifier(token)) {
                    this.moveToNextToken();

                    if (token.tokenKind === TypeScript.SyntaxKind.IdentifierName) {
                        return token;
                    }

                    return TypeScript.Syntax.convertToIdentifierName(token);
                }

                return this.createMissingToken(TypeScript.SyntaxKind.IdentifierName, token);
            };

            ParserImpl.prototype.canEatAutomaticSemicolon = function (allowWithoutNewLine) {
                var token = this.currentToken();

                if (token.tokenKind === TypeScript.SyntaxKind.EndOfFileToken) {
                    return true;
                }

                if (token.tokenKind === TypeScript.SyntaxKind.CloseBraceToken) {
                    return true;
                }

                if (allowWithoutNewLine) {
                    return true;
                }

                if (this.previousToken() !== null && this.previousToken().hasTrailingNewLine()) {
                    return true;
                }

                return false;
            };

            ParserImpl.prototype.canEatExplicitOrAutomaticSemicolon = function (allowWithoutNewline) {
                var token = this.currentToken();

                if (token.tokenKind === TypeScript.SyntaxKind.SemicolonToken) {
                    return true;
                }

                return this.canEatAutomaticSemicolon(allowWithoutNewline);
            };

            ParserImpl.prototype.eatExplicitOrAutomaticSemicolon = function (allowWithoutNewline) {
                var token = this.currentToken();

                if (token.tokenKind === TypeScript.SyntaxKind.SemicolonToken) {
                    return this.eatToken(TypeScript.SyntaxKind.SemicolonToken);
                }

                if (this.canEatAutomaticSemicolon(allowWithoutNewline)) {
                    var semicolonToken = TypeScript.Syntax.emptyToken(TypeScript.SyntaxKind.SemicolonToken);

                    if (!this.parseOptions.allowAutomaticSemicolonInsertion()) {
                        this.addDiagnostic(new TypeScript.SyntaxDiagnostic(this.fileName, this.previousTokenEnd(), 0, TypeScript.DiagnosticCode.Automatic_semicolon_insertion_not_allowed, null));
                    }

                    return semicolonToken;
                }

                return this.eatToken(TypeScript.SyntaxKind.SemicolonToken);
            };

            ParserImpl.prototype.isKeyword = function (kind) {
                if (kind >= TypeScript.SyntaxKind.FirstKeyword) {
                    if (kind <= TypeScript.SyntaxKind.LastFutureReservedKeyword) {
                        return true;
                    }

                    if (this.isInStrictMode) {
                        return kind <= TypeScript.SyntaxKind.LastFutureReservedStrictKeyword;
                    }
                }

                return false;
            };

            ParserImpl.prototype.createMissingToken = function (expectedKind, actual) {
                var diagnostic = this.getExpectedTokenDiagnostic(expectedKind, actual);
                this.addDiagnostic(diagnostic);

                return TypeScript.Syntax.emptyToken(expectedKind);
            };

            ParserImpl.prototype.getExpectedTokenDiagnostic = function (expectedKind, actual) {
                var token = this.currentToken();

                if (TypeScript.SyntaxFacts.isAnyKeyword(expectedKind) || TypeScript.SyntaxFacts.isAnyPunctuation(expectedKind)) {
                    return new TypeScript.SyntaxDiagnostic(this.fileName, this.currentTokenStart(), token.width(), TypeScript.DiagnosticCode._0_expected, [TypeScript.SyntaxFacts.getText(expectedKind)]);
                } else {
                    if (actual !== null && TypeScript.SyntaxFacts.isAnyKeyword(actual.tokenKind)) {
                        return new TypeScript.SyntaxDiagnostic(this.fileName, this.currentTokenStart(), token.width(), TypeScript.DiagnosticCode.Identifier_expected__0__is_a_keyword, [TypeScript.SyntaxFacts.getText(actual.tokenKind)]);
                    } else {
                        return new TypeScript.SyntaxDiagnostic(this.fileName, this.currentTokenStart(), token.width(), TypeScript.DiagnosticCode.Identifier_expected, null);
                    }
                }
            };

            ParserImpl.getPrecedence = function (expressionKind) {
                switch (expressionKind) {
                    case TypeScript.SyntaxKind.CommaExpression:
                        return ExpressionPrecedence.CommaExpressionPrecedence;

                    case TypeScript.SyntaxKind.AssignmentExpression:
                    case TypeScript.SyntaxKind.AddAssignmentExpression:
                    case TypeScript.SyntaxKind.SubtractAssignmentExpression:
                    case TypeScript.SyntaxKind.MultiplyAssignmentExpression:
                    case TypeScript.SyntaxKind.DivideAssignmentExpression:
                    case TypeScript.SyntaxKind.ModuloAssignmentExpression:
                    case TypeScript.SyntaxKind.AndAssignmentExpression:
                    case TypeScript.SyntaxKind.ExclusiveOrAssignmentExpression:
                    case TypeScript.SyntaxKind.OrAssignmentExpression:
                    case TypeScript.SyntaxKind.LeftShiftAssignmentExpression:
                    case TypeScript.SyntaxKind.SignedRightShiftAssignmentExpression:
                    case TypeScript.SyntaxKind.UnsignedRightShiftAssignmentExpression:
                        return ExpressionPrecedence.AssignmentExpressionPrecedence;

                    case TypeScript.SyntaxKind.ConditionalExpression:
                        return ExpressionPrecedence.ConditionalExpressionPrecedence;

                    case TypeScript.SyntaxKind.LogicalOrExpression:
                        return ExpressionPrecedence.LogicalOrExpressionPrecedence;

                    case TypeScript.SyntaxKind.LogicalAndExpression:
                        return ExpressionPrecedence.LogicalAndExpressionPrecedence;

                    case TypeScript.SyntaxKind.BitwiseOrExpression:
                        return ExpressionPrecedence.BitwiseOrExpressionPrecedence;

                    case TypeScript.SyntaxKind.BitwiseExclusiveOrExpression:
                        return ExpressionPrecedence.BitwiseExclusiveOrExpressionPrecedence;

                    case TypeScript.SyntaxKind.BitwiseAndExpression:
                        return ExpressionPrecedence.BitwiseAndExpressionPrecedence;

                    case TypeScript.SyntaxKind.EqualsWithTypeConversionExpression:
                    case TypeScript.SyntaxKind.NotEqualsWithTypeConversionExpression:
                    case TypeScript.SyntaxKind.EqualsExpression:
                    case TypeScript.SyntaxKind.NotEqualsExpression:
                        return ExpressionPrecedence.EqualityExpressionPrecedence;

                    case TypeScript.SyntaxKind.LessThanExpression:
                    case TypeScript.SyntaxKind.GreaterThanExpression:
                    case TypeScript.SyntaxKind.LessThanOrEqualExpression:
                    case TypeScript.SyntaxKind.GreaterThanOrEqualExpression:
                    case TypeScript.SyntaxKind.InstanceOfExpression:
                    case TypeScript.SyntaxKind.InExpression:
                        return ExpressionPrecedence.RelationalExpressionPrecedence;

                    case TypeScript.SyntaxKind.LeftShiftExpression:
                    case TypeScript.SyntaxKind.SignedRightShiftExpression:
                    case TypeScript.SyntaxKind.UnsignedRightShiftExpression:
                        return ExpressionPrecedence.ShiftExpressionPrecdence;

                    case TypeScript.SyntaxKind.AddExpression:
                    case TypeScript.SyntaxKind.SubtractExpression:
                        return ExpressionPrecedence.AdditiveExpressionPrecedence;

                    case TypeScript.SyntaxKind.MultiplyExpression:
                    case TypeScript.SyntaxKind.DivideExpression:
                    case TypeScript.SyntaxKind.ModuloExpression:
                        return ExpressionPrecedence.MultiplicativeExpressionPrecedence;

                    case TypeScript.SyntaxKind.PlusExpression:
                    case TypeScript.SyntaxKind.NegateExpression:
                    case TypeScript.SyntaxKind.BitwiseNotExpression:
                    case TypeScript.SyntaxKind.LogicalNotExpression:
                    case TypeScript.SyntaxKind.DeleteExpression:
                    case TypeScript.SyntaxKind.TypeOfExpression:
                    case TypeScript.SyntaxKind.VoidExpression:
                    case TypeScript.SyntaxKind.PreIncrementExpression:
                    case TypeScript.SyntaxKind.PreDecrementExpression:
                        return ExpressionPrecedence.UnaryExpressionPrecedence;
                }

                throw TypeScript.Errors.invalidOperation();
            };

            ParserImpl.prototype.addSkippedTokenAfterNodeOrToken = function (nodeOrToken, skippedToken) {
                if (nodeOrToken.isToken()) {
                    return this.addSkippedTokenAfterToken(nodeOrToken, skippedToken);
                } else if (nodeOrToken.isNode()) {
                    return this.addSkippedTokenAfterNode(nodeOrToken, skippedToken);
                } else {
                    throw TypeScript.Errors.invalidOperation();
                }
            };

            ParserImpl.prototype.addSkippedTokenAfterNode = function (node, skippedToken) {
                var oldToken = node.lastToken();
                var newToken = this.addSkippedTokenAfterToken(oldToken, skippedToken);

                return node.replaceToken(oldToken, newToken);
            };

            ParserImpl.prototype.addSkippedTokensBeforeNode = function (node, skippedTokens) {
                if (skippedTokens.length > 0) {
                    var oldToken = node.firstToken();
                    var newToken = this.addSkippedTokensBeforeToken(oldToken, skippedTokens);

                    return node.replaceToken(oldToken, newToken);
                }

                return node;
            };

            ParserImpl.prototype.addSkippedTokensBeforeToken = function (token, skippedTokens) {
                var leadingTrivia = [];
                for (var i = 0, n = skippedTokens.length; i < n; i++) {
                    this.addSkippedTokenToTriviaArray(leadingTrivia, skippedTokens[i]);
                }

                this.addTriviaTo(token.leadingTrivia(), leadingTrivia);

                this.returnArray(skippedTokens);
                return token.withLeadingTrivia(TypeScript.Syntax.triviaList(leadingTrivia));
            };

            ParserImpl.prototype.addSkippedTokensAfterToken = function (token, skippedTokens) {
                if (skippedTokens.length === 0) {
                    this.returnArray(skippedTokens);
                    return token;
                }

                var trailingTrivia = token.trailingTrivia().toArray();

                for (var i = 0, n = skippedTokens.length; i < n; i++) {
                    this.addSkippedTokenToTriviaArray(trailingTrivia, skippedTokens[i]);
                }

                this.returnArray(skippedTokens);
                return token.withTrailingTrivia(TypeScript.Syntax.triviaList(trailingTrivia));
            };

            ParserImpl.prototype.addSkippedTokenAfterToken = function (token, skippedToken) {
                var trailingTrivia = token.trailingTrivia().toArray();
                this.addSkippedTokenToTriviaArray(trailingTrivia, skippedToken);

                return token.withTrailingTrivia(TypeScript.Syntax.triviaList(trailingTrivia));
            };

            ParserImpl.prototype.addSkippedTokenToTriviaArray = function (array, skippedToken) {
                this.addTriviaTo(skippedToken.leadingTrivia(), array);

                var trimmedToken = skippedToken.withLeadingTrivia(TypeScript.Syntax.emptyTriviaList).withTrailingTrivia(TypeScript.Syntax.emptyTriviaList);
                array.push(TypeScript.Syntax.skippedTokenTrivia(trimmedToken));

                this.addTriviaTo(skippedToken.trailingTrivia(), array);
            };

            ParserImpl.prototype.addTriviaTo = function (list, array) {
                for (var i = 0, n = list.count(); i < n; i++) {
                    array.push(list.syntaxTriviaAt(i));
                }
            };

            ParserImpl.prototype.parseSyntaxTree = function (isDeclaration) {
                var sourceUnit = this.parseSourceUnit();

                var allDiagnostics = this.source.tokenDiagnostics().concat(this.diagnostics);
                allDiagnostics.sort(function (a, b) {
                    return a.start() - b.start();
                });

                return new TypeScript.SyntaxTree(sourceUnit, isDeclaration, allDiagnostics, this.fileName, this.lineMap, this.source.languageVersion(), this.parseOptions);
            };

            ParserImpl.prototype.setStrictMode = function (isInStrictMode) {
                this.isInStrictMode = isInStrictMode;
                this.factory = isInStrictMode ? TypeScript.Syntax.strictModeFactory : TypeScript.Syntax.normalModeFactory;
            };

            ParserImpl.prototype.parseSourceUnit = function () {
                var savedIsInStrictMode = this.isInStrictMode;

                var result = this.parseSyntaxList(ListParsingState.SourceUnit_ModuleElements, ParserImpl.updateStrictModeState);
                var moduleElements = result.list;

                this.setStrictMode(savedIsInStrictMode);

                var sourceUnit = this.factory.sourceUnit(moduleElements, this.currentToken());
                sourceUnit = this.addSkippedTokensBeforeNode(sourceUnit, result.skippedTokens);

                return sourceUnit;
            };

            ParserImpl.updateStrictModeState = function (parser, items) {
                if (!parser.isInStrictMode) {
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        if (!TypeScript.SyntaxFacts.isDirectivePrologueElement(item)) {
                            return;
                        }
                    }

                    parser.setStrictMode(TypeScript.SyntaxFacts.isUseStrictDirective(items[items.length - 1]));
                }
            };

            ParserImpl.prototype.isModuleElement = function (inErrorRecovery) {
                if (this.currentNode() !== null && this.currentNode().isModuleElement()) {
                    return true;
                }

                return this.isImportDeclaration() || this.isExportAssignment() || this.isModuleDeclaration() || this.isInterfaceDeclaration() || this.isClassDeclaration() || this.isEnumDeclaration() || this.isStatement(inErrorRecovery);
            };

            ParserImpl.prototype.parseModuleElement = function () {
                if (this.currentNode() !== null && this.currentNode().isModuleElement()) {
                    return this.eatNode();
                }

                if (this.isImportDeclaration()) {
                    return this.parseImportDeclaration();
                } else if (this.isExportAssignment()) {
                    return this.parseExportAssignment();
                } else if (this.isModuleDeclaration()) {
                    return this.parseModuleDeclaration();
                } else if (this.isInterfaceDeclaration()) {
                    return this.parseInterfaceDeclaration();
                } else if (this.isClassDeclaration()) {
                    return this.parseClassDeclaration();
                } else if (this.isEnumDeclaration()) {
                    return this.parseEnumDeclaration();
                } else if (this.isStatement(false)) {
                    return this.parseStatement();
                } else {
                    throw TypeScript.Errors.invalidOperation();
                }
            };

            ParserImpl.prototype.isImportDeclaration = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.ImportKeyword;
            };

            ParserImpl.prototype.parseImportDeclaration = function () {
                var importKeyword = this.eatKeyword(TypeScript.SyntaxKind.ImportKeyword);
                var identifier = this.eatIdentifierToken();
                var equalsToken = this.eatToken(TypeScript.SyntaxKind.EqualsToken);
                var moduleReference = this.parseModuleReference();
                var semicolonToken = this.eatExplicitOrAutomaticSemicolon(false);

                return this.factory.importDeclaration(importKeyword, identifier, equalsToken, moduleReference, semicolonToken);
            };

            ParserImpl.prototype.isExportAssignment = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.ExportKeyword && this.peekToken(1).tokenKind === TypeScript.SyntaxKind.EqualsToken;
            };

            ParserImpl.prototype.parseExportAssignment = function () {
                var exportKeyword = this.eatKeyword(TypeScript.SyntaxKind.ExportKeyword);
                var equalsToken = this.eatToken(TypeScript.SyntaxKind.EqualsToken);
                var identifier = this.eatIdentifierToken();
                var semicolonToken = this.eatExplicitOrAutomaticSemicolon(false);

                return this.factory.exportAssignment(exportKeyword, equalsToken, identifier, semicolonToken);
            };

            ParserImpl.prototype.parseModuleReference = function () {
                if (this.isExternalModuleReference()) {
                    return this.parseExternalModuleReference();
                } else {
                    return this.parseModuleNameModuleReference();
                }
            };

            ParserImpl.prototype.isExternalModuleReference = function () {
                var token0 = this.currentToken();
                if (token0.tokenKind === TypeScript.SyntaxKind.ModuleKeyword || token0.tokenKind === TypeScript.SyntaxKind.RequireKeyword) {
                    return this.peekToken(1).tokenKind === TypeScript.SyntaxKind.OpenParenToken;
                }

                return false;
            };

            ParserImpl.prototype.parseExternalModuleReference = function () {
                var moduleOrRequireKeyword = this.eatAnyToken();
                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);
                var stringLiteral = this.eatToken(TypeScript.SyntaxKind.StringLiteral);
                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);

                return this.factory.externalModuleReference(moduleOrRequireKeyword, openParenToken, stringLiteral, closeParenToken);
            };

            ParserImpl.prototype.parseModuleNameModuleReference = function () {
                var name = this.parseName();
                return this.factory.moduleNameModuleReference(name);
            };

            ParserImpl.prototype.parseIdentifierName = function () {
                var identifierName = this.eatIdentifierNameToken();
                return identifierName;
            };

            ParserImpl.prototype.isName = function () {
                return this.isIdentifier(this.currentToken());
            };

            ParserImpl.prototype.tryParseTypeArgumentList = function (inExpression) {
                if (this.currentToken().kind() !== TypeScript.SyntaxKind.LessThanToken) {
                    return null;
                }

                var lessThanToken;
                var greaterThanToken;
                var result;
                var typeArguments;

                if (!inExpression) {
                    lessThanToken = this.eatToken(TypeScript.SyntaxKind.LessThanToken);

                    result = this.parseSeparatedSyntaxList(ListParsingState.TypeArgumentList_Types);
                    typeArguments = result.list;
                    lessThanToken = this.addSkippedTokensAfterToken(lessThanToken, result.skippedTokens);

                    greaterThanToken = this.eatToken(TypeScript.SyntaxKind.GreaterThanToken);

                    return this.factory.typeArgumentList(lessThanToken, typeArguments, greaterThanToken);
                }

                var rewindPoint = this.getRewindPoint();
                try  {
                    lessThanToken = this.eatToken(TypeScript.SyntaxKind.LessThanToken);

                    result = this.parseSeparatedSyntaxList(ListParsingState.TypeArgumentList_Types);
                    typeArguments = result.list;
                    lessThanToken = this.addSkippedTokensAfterToken(lessThanToken, result.skippedTokens);

                    greaterThanToken = this.eatToken(TypeScript.SyntaxKind.GreaterThanToken);

                    if (greaterThanToken.fullWidth() === 0 || !this.canFollowTypeArgumentListInExpression(this.currentToken().kind())) {
                        this.rewind(rewindPoint);
                        return null;
                    }

                    return this.factory.typeArgumentList(lessThanToken, typeArguments, greaterThanToken);
                } finally {
                    this.releaseRewindPoint(rewindPoint);
                }
            };

            ParserImpl.prototype.canFollowTypeArgumentListInExpression = function (kind) {
                switch (kind) {
                    case TypeScript.SyntaxKind.OpenParenToken:
                    case TypeScript.SyntaxKind.DotToken:

                    case TypeScript.SyntaxKind.CloseParenToken:
                    case TypeScript.SyntaxKind.CloseBracketToken:
                    case TypeScript.SyntaxKind.ColonToken:
                    case TypeScript.SyntaxKind.SemicolonToken:
                    case TypeScript.SyntaxKind.CommaToken:
                    case TypeScript.SyntaxKind.QuestionToken:
                    case TypeScript.SyntaxKind.EqualsEqualsToken:
                    case TypeScript.SyntaxKind.EqualsEqualsEqualsToken:
                    case TypeScript.SyntaxKind.ExclamationEqualsToken:
                    case TypeScript.SyntaxKind.ExclamationEqualsEqualsToken:
                    case TypeScript.SyntaxKind.AmpersandAmpersandToken:
                    case TypeScript.SyntaxKind.BarBarToken:
                    case TypeScript.SyntaxKind.CaretToken:
                    case TypeScript.SyntaxKind.AmpersandToken:
                    case TypeScript.SyntaxKind.BarToken:
                    case TypeScript.SyntaxKind.CloseBraceToken:
                    case TypeScript.SyntaxKind.EndOfFileToken:
                        return true;

                    default:
                        return false;
                }
            };

            ParserImpl.prototype.parseName = function () {
                var shouldContinue = this.isIdentifier(this.currentToken());
                var current = this.eatIdentifierToken();

                while (shouldContinue && this.currentToken().tokenKind === TypeScript.SyntaxKind.DotToken) {
                    var dotToken = this.eatToken(TypeScript.SyntaxKind.DotToken);

                    var currentToken = this.currentToken();
                    var identifierName;

                    if (TypeScript.SyntaxFacts.isAnyKeyword(currentToken.tokenKind) && this.previousToken().hasTrailingNewLine() && !currentToken.hasTrailingNewLine() && TypeScript.SyntaxFacts.isIdentifierNameOrAnyKeyword(this.peekToken(1))) {
                        identifierName = this.createMissingToken(TypeScript.SyntaxKind.IdentifierName, currentToken);
                    } else {
                        identifierName = this.eatIdentifierNameToken();
                    }

                    current = this.factory.qualifiedName(current, dotToken, identifierName);

                    shouldContinue = identifierName.fullWidth() > 0;
                }

                return current;
            };

            ParserImpl.prototype.isEnumDeclaration = function () {
                var index = this.modifierCount();

                if (index > 0 && this.peekToken(index).tokenKind === TypeScript.SyntaxKind.EnumKeyword) {
                    return true;
                }

                return this.currentToken().tokenKind === TypeScript.SyntaxKind.EnumKeyword && this.isIdentifier(this.peekToken(1));
            };

            ParserImpl.prototype.parseEnumDeclaration = function () {
                var modifiers = this.parseModifiers();
                var enumKeyword = this.eatKeyword(TypeScript.SyntaxKind.EnumKeyword);
                var identifier = this.eatIdentifierToken();

                var openBraceToken = this.eatToken(TypeScript.SyntaxKind.OpenBraceToken);
                var enumElements = TypeScript.Syntax.emptySeparatedList;

                if (openBraceToken.width() > 0) {
                    var result = this.parseSeparatedSyntaxList(ListParsingState.EnumDeclaration_EnumElements);
                    enumElements = result.list;
                    openBraceToken = this.addSkippedTokensAfterToken(openBraceToken, result.skippedTokens);
                }

                var closeBraceToken = this.eatToken(TypeScript.SyntaxKind.CloseBraceToken);

                return this.factory.enumDeclaration(modifiers, enumKeyword, identifier, openBraceToken, enumElements, closeBraceToken);
            };

            ParserImpl.prototype.isEnumElement = function (inErrorRecovery) {
                if (this.currentNode() !== null && this.currentNode().kind() === TypeScript.SyntaxKind.EnumElement) {
                    return true;
                }

                return this.isPropertyName(this.currentToken(), inErrorRecovery);
            };

            ParserImpl.prototype.parseEnumElement = function () {
                if (this.currentNode() !== null && this.currentNode().kind() === TypeScript.SyntaxKind.EnumElement) {
                    return this.eatNode();
                }

                var propertyName = this.eatPropertyName();
                var equalsValueClause = null;
                if (this.isEqualsValueClause(false)) {
                    equalsValueClause = this.parseEqualsValueClause(true);
                }

                return this.factory.enumElement(propertyName, equalsValueClause);
            };

            ParserImpl.isModifier = function (token) {
                switch (token.tokenKind) {
                    case TypeScript.SyntaxKind.PublicKeyword:
                    case TypeScript.SyntaxKind.PrivateKeyword:
                    case TypeScript.SyntaxKind.StaticKeyword:
                    case TypeScript.SyntaxKind.ExportKeyword:
                    case TypeScript.SyntaxKind.DeclareKeyword:
                        return true;

                    default:
                        return false;
                }
            };

            ParserImpl.prototype.modifierCount = function () {
                var modifierCount = 0;
                while (true) {
                    if (ParserImpl.isModifier(this.peekToken(modifierCount))) {
                        modifierCount++;
                        continue;
                    }

                    break;
                }

                return modifierCount;
            };

            ParserImpl.prototype.parseModifiers = function () {
                var tokens = this.getArray();

                while (true) {
                    if (ParserImpl.isModifier(this.currentToken())) {
                        tokens.push(this.eatAnyToken());
                        continue;
                    }

                    break;
                }

                var result = TypeScript.Syntax.list(tokens);

                this.returnZeroOrOneLengthArray(tokens);

                return result;
            };

            ParserImpl.prototype.isClassDeclaration = function () {
                var index = this.modifierCount();

                if (index > 0 && this.peekToken(index).tokenKind === TypeScript.SyntaxKind.ClassKeyword) {
                    return true;
                }

                return this.currentToken().tokenKind === TypeScript.SyntaxKind.ClassKeyword && this.isIdentifier(this.peekToken(1));
            };

            ParserImpl.prototype.parseHeritageClauses = function () {
                var heritageClauses = TypeScript.Syntax.emptyList;

                if (this.isHeritageClause()) {
                    var result = this.parseSyntaxList(ListParsingState.ClassOrInterfaceDeclaration_HeritageClauses);
                    heritageClauses = result.list;
                    TypeScript.Debug.assert(result.skippedTokens.length === 0);
                }

                return heritageClauses;
            };

            ParserImpl.prototype.parseClassDeclaration = function () {
                var modifiers = this.parseModifiers();

                var classKeyword = this.eatKeyword(TypeScript.SyntaxKind.ClassKeyword);
                var identifier = this.eatIdentifierToken();
                var typeParameterList = this.parseOptionalTypeParameterList(false);
                var heritageClauses = this.parseHeritageClauses();
                var openBraceToken = this.eatToken(TypeScript.SyntaxKind.OpenBraceToken);
                var classElements = TypeScript.Syntax.emptyList;

                if (openBraceToken.width() > 0) {
                    var result = this.parseSyntaxList(ListParsingState.ClassDeclaration_ClassElements);

                    classElements = result.list;
                    openBraceToken = this.addSkippedTokensAfterToken(openBraceToken, result.skippedTokens);
                }

                var closeBraceToken = this.eatToken(TypeScript.SyntaxKind.CloseBraceToken);
                return this.factory.classDeclaration(modifiers, classKeyword, identifier, typeParameterList, heritageClauses, openBraceToken, classElements, closeBraceToken);
            };

            ParserImpl.prototype.isConstructorDeclaration = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.ConstructorKeyword;
            };

            ParserImpl.isPublicOrPrivateKeyword = function (token) {
                return token.tokenKind === TypeScript.SyntaxKind.PublicKeyword || token.tokenKind === TypeScript.SyntaxKind.PrivateKeyword;
            };

            ParserImpl.prototype.isMemberAccessorDeclaration = function (inErrorRecovery) {
                var index = this.modifierCount();

                if (this.peekToken(index).tokenKind !== TypeScript.SyntaxKind.GetKeyword && this.peekToken(index).tokenKind !== TypeScript.SyntaxKind.SetKeyword) {
                    return false;
                }

                index++;
                return this.isPropertyName(this.peekToken(index), inErrorRecovery);
            };

            ParserImpl.prototype.parseMemberAccessorDeclaration = function () {
                var modifiers = this.parseModifiers();

                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.GetKeyword) {
                    return this.parseGetMemberAccessorDeclaration(modifiers);
                } else if (this.currentToken().tokenKind === TypeScript.SyntaxKind.SetKeyword) {
                    return this.parseSetMemberAccessorDeclaration(modifiers);
                } else {
                    throw TypeScript.Errors.invalidOperation();
                }
            };

            ParserImpl.prototype.parseGetMemberAccessorDeclaration = function (modifiers) {
                var getKeyword = this.eatKeyword(TypeScript.SyntaxKind.GetKeyword);
                var propertyName = this.eatPropertyName();
                var parameterList = this.parseParameterList();
                var typeAnnotation = this.parseOptionalTypeAnnotation(false);
                var block = this.parseBlock(false, false);

                return this.factory.getMemberAccessorDeclaration(modifiers, getKeyword, propertyName, parameterList, typeAnnotation, block);
            };

            ParserImpl.prototype.parseSetMemberAccessorDeclaration = function (modifiers) {
                var setKeyword = this.eatKeyword(TypeScript.SyntaxKind.SetKeyword);
                var propertyName = this.eatPropertyName();
                var parameterList = this.parseParameterList();
                var block = this.parseBlock(false, false);

                return this.factory.setMemberAccessorDeclaration(modifiers, setKeyword, propertyName, parameterList, block);
            };

            ParserImpl.prototype.isClassElement = function (inErrorRecovery) {
                if (this.currentNode() !== null && this.currentNode().isClassElement()) {
                    return true;
                }

                return this.isConstructorDeclaration() || this.isMemberFunctionDeclaration(inErrorRecovery) || this.isMemberAccessorDeclaration(inErrorRecovery) || this.isMemberVariableDeclaration(inErrorRecovery) || this.isIndexSignature();
            };

            ParserImpl.prototype.parseConstructorDeclaration = function () {
                var constructorKeyword = this.eatKeyword(TypeScript.SyntaxKind.ConstructorKeyword);
                var parameterList = this.parseParameterList();

                var semicolonToken = null;
                var block = null;

                if (this.isBlock()) {
                    block = this.parseBlock(false, true);
                } else {
                    semicolonToken = this.eatExplicitOrAutomaticSemicolon(false);
                }

                return this.factory.constructorDeclaration(constructorKeyword, parameterList, block, semicolonToken);
            };

            ParserImpl.prototype.isMemberFunctionDeclaration = function (inErrorRecovery) {
                var index = 0;

                while (true) {
                    var token = this.peekToken(index);
                    if (this.isPropertyName(token, inErrorRecovery) && this.isCallSignature(index + 1)) {
                        return true;
                    }

                    if (ParserImpl.isModifier(token)) {
                        index++;
                        continue;
                    }

                    return false;
                }
            };

            ParserImpl.prototype.parseMemberFunctionDeclaration = function () {
                var modifierArray = this.getArray();

                while (true) {
                    var currentToken = this.currentToken();
                    if (this.isPropertyName(currentToken, false) && this.isCallSignature(1)) {
                        break;
                    }

                    TypeScript.Debug.assert(ParserImpl.isModifier(currentToken));
                    modifierArray.push(this.eatAnyToken());
                }

                var modifiers = TypeScript.Syntax.list(modifierArray);
                this.returnZeroOrOneLengthArray(modifierArray);

                var propertyName = this.eatPropertyName();
                var callSignature = this.parseCallSignature(false);

                var newCallSignature = this.tryAddUnexpectedEqualsGreaterThanToken(callSignature);
                var parseBlockEvenWithNoOpenBrace = callSignature !== newCallSignature;
                callSignature = newCallSignature;

                var block = null;
                var semicolon = null;

                if (parseBlockEvenWithNoOpenBrace || this.isBlock()) {
                    block = this.parseBlock(parseBlockEvenWithNoOpenBrace, true);
                } else {
                    semicolon = this.eatExplicitOrAutomaticSemicolon(false);
                }

                return this.factory.memberFunctionDeclaration(modifiers, propertyName, callSignature, block, semicolon);
            };

            ParserImpl.prototype.isDefinitelyMemberVariablePropertyName = function (index) {
                if (TypeScript.SyntaxFacts.isAnyKeyword(this.peekToken(index).tokenKind)) {
                    switch (this.peekToken(index + 1).tokenKind) {
                        case TypeScript.SyntaxKind.SemicolonToken:
                        case TypeScript.SyntaxKind.EqualsToken:
                        case TypeScript.SyntaxKind.ColonToken:
                        case TypeScript.SyntaxKind.CloseBraceToken:
                        case TypeScript.SyntaxKind.EndOfFileToken:
                            return true;
                        default:
                            return false;
                    }
                } else {
                    return true;
                }
            };

            ParserImpl.prototype.isMemberVariableDeclaration = function (inErrorRecovery) {
                var index = 0;

                while (true) {
                    var token = this.peekToken(index);
                    if (this.isPropertyName(token, inErrorRecovery) && this.isDefinitelyMemberVariablePropertyName(index)) {
                        return true;
                    }

                    if (ParserImpl.isModifier(this.peekToken(index))) {
                        index++;
                        continue;
                    }

                    return false;
                }
            };

            ParserImpl.prototype.parseMemberVariableDeclaration = function () {
                var modifierArray = this.getArray();

                while (true) {
                    var currentToken = this.currentToken();
                    if (this.isPropertyName(currentToken, false) && this.isDefinitelyMemberVariablePropertyName(0)) {
                        break;
                    }

                    TypeScript.Debug.assert(ParserImpl.isModifier(currentToken));
                    modifierArray.push(this.eatAnyToken());
                }

                var modifiers = TypeScript.Syntax.list(modifierArray);
                this.returnZeroOrOneLengthArray(modifierArray);

                var variableDeclarator = this.parseVariableDeclarator(true, true);
                var semicolon = this.eatExplicitOrAutomaticSemicolon(false);

                return this.factory.memberVariableDeclaration(modifiers, variableDeclarator, semicolon);
            };

            ParserImpl.prototype.parseClassElement = function (inErrorRecovery) {
                if (this.currentNode() !== null && this.currentNode().isClassElement()) {
                    return this.eatNode();
                }

                if (this.isConstructorDeclaration()) {
                    return this.parseConstructorDeclaration();
                } else if (this.isMemberFunctionDeclaration(inErrorRecovery)) {
                    return this.parseMemberFunctionDeclaration();
                } else if (this.isMemberAccessorDeclaration(inErrorRecovery)) {
                    return this.parseMemberAccessorDeclaration();
                } else if (this.isMemberVariableDeclaration(inErrorRecovery)) {
                    return this.parseMemberVariableDeclaration();
                } else if (this.isIndexSignature()) {
                    return this.parseIndexSignature();
                } else {
                    throw TypeScript.Errors.invalidOperation();
                }
            };

            ParserImpl.prototype.tryAddUnexpectedEqualsGreaterThanToken = function (callSignature) {
                var token0 = this.currentToken();

                var hasEqualsGreaterThanToken = token0.tokenKind === TypeScript.SyntaxKind.EqualsGreaterThanToken;
                if (hasEqualsGreaterThanToken) {
                    var diagnostic = new TypeScript.SyntaxDiagnostic(this.fileName, this.currentTokenStart(), token0.width(), TypeScript.DiagnosticCode.Unexpected_token_, []);
                    this.addDiagnostic(diagnostic);

                    var token = this.eatAnyToken();
                    return this.addSkippedTokenAfterNode(callSignature, token0);
                }

                return callSignature;
            };

            ParserImpl.prototype.isFunctionDeclaration = function () {
                var index = this.modifierCount();
                return this.peekToken(index).tokenKind === TypeScript.SyntaxKind.FunctionKeyword;
            };

            ParserImpl.prototype.parseFunctionDeclaration = function () {
                var modifiers = this.parseModifiers();
                var functionKeyword = this.eatKeyword(TypeScript.SyntaxKind.FunctionKeyword);
                var identifier = this.eatIdentifierToken();
                var callSignature = this.parseCallSignature(false);

                var newCallSignature = this.tryAddUnexpectedEqualsGreaterThanToken(callSignature);
                var parseBlockEvenWithNoOpenBrace = callSignature !== newCallSignature;
                callSignature = newCallSignature;

                var semicolonToken = null;
                var block = null;

                if (parseBlockEvenWithNoOpenBrace || this.isBlock()) {
                    block = this.parseBlock(parseBlockEvenWithNoOpenBrace, true);
                } else {
                    semicolonToken = this.eatExplicitOrAutomaticSemicolon(false);
                }

                return this.factory.functionDeclaration(modifiers, functionKeyword, identifier, callSignature, block, semicolonToken);
            };

            ParserImpl.prototype.isModuleDeclaration = function () {
                var index = this.modifierCount();

                if (index > 0 && this.peekToken(index).tokenKind === TypeScript.SyntaxKind.ModuleKeyword) {
                    return true;
                }

                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.ModuleKeyword) {
                    var token1 = this.peekToken(1);
                    return this.isIdentifier(token1) || token1.tokenKind === TypeScript.SyntaxKind.StringLiteral;
                }

                return false;
            };

            ParserImpl.prototype.parseModuleDeclaration = function () {
                var modifiers = this.parseModifiers();
                var moduleKeyword = this.eatKeyword(TypeScript.SyntaxKind.ModuleKeyword);

                var moduleName = null;
                var stringLiteral = null;

                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.StringLiteral) {
                    stringLiteral = this.eatToken(TypeScript.SyntaxKind.StringLiteral);
                } else {
                    moduleName = this.parseName();
                }

                var openBraceToken = this.eatToken(TypeScript.SyntaxKind.OpenBraceToken);

                var moduleElements = TypeScript.Syntax.emptyList;
                if (openBraceToken.width() > 0) {
                    var result = this.parseSyntaxList(ListParsingState.ModuleDeclaration_ModuleElements);
                    moduleElements = result.list;
                    openBraceToken = this.addSkippedTokensAfterToken(openBraceToken, result.skippedTokens);
                }

                var closeBraceToken = this.eatToken(TypeScript.SyntaxKind.CloseBraceToken);

                return this.factory.moduleDeclaration(modifiers, moduleKeyword, moduleName, stringLiteral, openBraceToken, moduleElements, closeBraceToken);
            };

            ParserImpl.prototype.isInterfaceDeclaration = function () {
                var index = this.modifierCount();

                if (index > 0 && this.peekToken(index).tokenKind === TypeScript.SyntaxKind.InterfaceKeyword) {
                    return true;
                }

                return this.currentToken().tokenKind === TypeScript.SyntaxKind.InterfaceKeyword && this.isIdentifier(this.peekToken(1));
            };

            ParserImpl.prototype.parseInterfaceDeclaration = function () {
                var modifiers = this.parseModifiers();
                var interfaceKeyword = this.eatKeyword(TypeScript.SyntaxKind.InterfaceKeyword);
                var identifier = this.eatIdentifierToken();
                var typeParameterList = this.parseOptionalTypeParameterList(false);
                var heritageClauses = this.parseHeritageClauses();

                var objectType = this.parseObjectType();
                return this.factory.interfaceDeclaration(modifiers, interfaceKeyword, identifier, typeParameterList, heritageClauses, objectType);
            };

            ParserImpl.prototype.parseObjectType = function () {
                var openBraceToken = this.eatToken(TypeScript.SyntaxKind.OpenBraceToken);

                var typeMembers = TypeScript.Syntax.emptySeparatedList;
                if (openBraceToken.width() > 0) {
                    var result = this.parseSeparatedSyntaxList(ListParsingState.ObjectType_TypeMembers);
                    typeMembers = result.list;
                    openBraceToken = this.addSkippedTokensAfterToken(openBraceToken, result.skippedTokens);
                }

                var closeBraceToken = this.eatToken(TypeScript.SyntaxKind.CloseBraceToken);
                return this.factory.objectType(openBraceToken, typeMembers, closeBraceToken);
            };

            ParserImpl.prototype.isTypeMember = function (inErrorRecovery) {
                if (this.currentNode() !== null && this.currentNode().isTypeMember()) {
                    return true;
                }

                return this.isCallSignature(0) || this.isConstructSignature() || this.isIndexSignature() || this.isMethodSignature(inErrorRecovery) || this.isPropertySignature(inErrorRecovery);
            };

            ParserImpl.prototype.parseTypeMember = function () {
                if (this.currentNode() !== null && this.currentNode().isTypeMember()) {
                    return this.eatNode();
                }

                if (this.isCallSignature(0)) {
                    return this.parseCallSignature(false);
                } else if (this.isConstructSignature()) {
                    return this.parseConstructSignature();
                } else if (this.isIndexSignature()) {
                    return this.parseIndexSignature();
                } else if (this.isMethodSignature(false)) {
                    return this.parseMethodSignature();
                } else if (this.isPropertySignature(false)) {
                    return this.parsePropertySignature();
                } else {
                    throw TypeScript.Errors.invalidOperation();
                }
            };

            ParserImpl.prototype.parseConstructSignature = function () {
                var newKeyword = this.eatKeyword(TypeScript.SyntaxKind.NewKeyword);
                var callSignature = this.parseCallSignature(false);

                return this.factory.constructSignature(newKeyword, callSignature);
            };

            ParserImpl.prototype.parseIndexSignature = function () {
                var openBracketToken = this.eatToken(TypeScript.SyntaxKind.OpenBracketToken);
                var parameter = this.parseParameter();
                var closeBracketToken = this.eatToken(TypeScript.SyntaxKind.CloseBracketToken);
                var typeAnnotation = this.parseOptionalTypeAnnotation(false);

                return this.factory.indexSignature(openBracketToken, parameter, closeBracketToken, typeAnnotation);
            };

            ParserImpl.prototype.parseMethodSignature = function () {
                var propertyName = this.eatPropertyName();
                var questionToken = this.tryEatToken(TypeScript.SyntaxKind.QuestionToken);
                var callSignature = this.parseCallSignature(false);

                return this.factory.methodSignature(propertyName, questionToken, callSignature);
            };

            ParserImpl.prototype.parsePropertySignature = function () {
                var propertyName = this.eatPropertyName();
                var questionToken = this.tryEatToken(TypeScript.SyntaxKind.QuestionToken);
                var typeAnnotation = this.parseOptionalTypeAnnotation(false);

                return this.factory.propertySignature(propertyName, questionToken, typeAnnotation);
            };

            ParserImpl.prototype.isCallSignature = function (tokenIndex) {
                var tokenKind = this.peekToken(tokenIndex).tokenKind;
                return tokenKind === TypeScript.SyntaxKind.OpenParenToken || tokenKind === TypeScript.SyntaxKind.LessThanToken;
            };

            ParserImpl.prototype.isConstructSignature = function () {
                if (this.currentToken().tokenKind !== TypeScript.SyntaxKind.NewKeyword) {
                    return false;
                }

                var token1 = this.peekToken(1);
                return token1.tokenKind === TypeScript.SyntaxKind.LessThanToken || token1.tokenKind === TypeScript.SyntaxKind.OpenParenToken;
            };

            ParserImpl.prototype.isIndexSignature = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.OpenBracketToken;
            };

            ParserImpl.prototype.isMethodSignature = function (inErrorRecovery) {
                if (this.isPropertyName(this.currentToken(), inErrorRecovery)) {
                    if (this.isCallSignature(1)) {
                        return true;
                    }

                    if (this.peekToken(1).tokenKind === TypeScript.SyntaxKind.QuestionToken && this.isCallSignature(2)) {
                        return true;
                    }
                }

                return false;
            };

            ParserImpl.prototype.isPropertySignature = function (inErrorRecovery) {
                var currentToken = this.currentToken();

                if (ParserImpl.isModifier(currentToken) && !currentToken.hasTrailingNewLine() && this.isPropertyName(this.peekToken(1), inErrorRecovery)) {
                    return false;
                }

                return this.isPropertyName(currentToken, inErrorRecovery);
            };

            ParserImpl.prototype.isHeritageClause = function () {
                var token0 = this.currentToken();
                return token0.tokenKind === TypeScript.SyntaxKind.ExtendsKeyword || token0.tokenKind === TypeScript.SyntaxKind.ImplementsKeyword;
            };

            ParserImpl.prototype.isNotHeritageClauseTypeName = function () {
                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.ImplementsKeyword || this.currentToken().tokenKind === TypeScript.SyntaxKind.ExtendsKeyword) {
                    return this.isIdentifier(this.peekToken(1));
                }

                return false;
            };

            ParserImpl.prototype.isHeritageClauseTypeName = function () {
                if (this.isName()) {
                    return !this.isNotHeritageClauseTypeName();
                }

                return false;
            };

            ParserImpl.prototype.parseHeritageClause = function () {
                var extendsOrImplementsKeyword = this.eatAnyToken();
                TypeScript.Debug.assert(extendsOrImplementsKeyword.tokenKind === TypeScript.SyntaxKind.ExtendsKeyword || extendsOrImplementsKeyword.tokenKind === TypeScript.SyntaxKind.ImplementsKeyword);

                var result = this.parseSeparatedSyntaxList(ListParsingState.HeritageClause_TypeNameList);
                var typeNames = result.list;
                extendsOrImplementsKeyword = this.addSkippedTokensAfterToken(extendsOrImplementsKeyword, result.skippedTokens);

                return this.factory.heritageClause(extendsOrImplementsKeyword, typeNames);
            };

            ParserImpl.prototype.isStatement = function (inErrorRecovery) {
                if (this.currentNode() !== null && this.currentNode().isStatement()) {
                    return true;
                }

                switch (this.currentToken().tokenKind) {
                    case TypeScript.SyntaxKind.PublicKeyword:
                    case TypeScript.SyntaxKind.PrivateKeyword:
                    case TypeScript.SyntaxKind.StaticKeyword:
                        var token1 = this.peekToken(1);
                        if (TypeScript.SyntaxFacts.isIdentifierNameOrAnyKeyword(token1)) {
                            return false;
                        }
                }

                return this.isVariableStatement() || this.isLabeledStatement() || this.isFunctionDeclaration() || this.isIfStatement() || this.isBlock() || this.isExpressionStatement() || this.isReturnStatement() || this.isSwitchStatement() || this.isThrowStatement() || this.isBreakStatement() || this.isContinueStatement() || this.isForOrForInStatement() || this.isEmptyStatement(inErrorRecovery) || this.isWhileStatement() || this.isWithStatement() || this.isDoStatement() || this.isTryStatement() || this.isDebuggerStatement();
            };

            ParserImpl.prototype.parseStatement = function () {
                if (this.currentNode() !== null && this.currentNode().isStatement()) {
                    return this.eatNode();
                }

                if (this.isVariableStatement()) {
                    return this.parseVariableStatement();
                } else if (this.isLabeledStatement()) {
                    return this.parseLabeledStatement();
                } else if (this.isFunctionDeclaration()) {
                    return this.parseFunctionDeclaration();
                } else if (this.isIfStatement()) {
                    return this.parseIfStatement();
                } else if (this.isBlock()) {
                    return this.parseBlock(false, false);
                } else if (this.isReturnStatement()) {
                    return this.parseReturnStatement();
                } else if (this.isSwitchStatement()) {
                    return this.parseSwitchStatement();
                } else if (this.isThrowStatement()) {
                    return this.parseThrowStatement();
                } else if (this.isBreakStatement()) {
                    return this.parseBreakStatement();
                } else if (this.isContinueStatement()) {
                    return this.parseContinueStatement();
                } else if (this.isForOrForInStatement()) {
                    return this.parseForOrForInStatement();
                } else if (this.isEmptyStatement(false)) {
                    return this.parseEmptyStatement();
                } else if (this.isWhileStatement()) {
                    return this.parseWhileStatement();
                } else if (this.isWithStatement()) {
                    return this.parseWithStatement();
                } else if (this.isDoStatement()) {
                    return this.parseDoStatement();
                } else if (this.isTryStatement()) {
                    return this.parseTryStatement();
                } else if (this.isDebuggerStatement()) {
                    return this.parseDebuggerStatement();
                } else {
                    return this.parseExpressionStatement();
                }
            };

            ParserImpl.prototype.isDebuggerStatement = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.DebuggerKeyword;
            };

            ParserImpl.prototype.parseDebuggerStatement = function () {
                var debuggerKeyword = this.eatKeyword(TypeScript.SyntaxKind.DebuggerKeyword);
                var semicolonToken = this.eatExplicitOrAutomaticSemicolon(false);

                return this.factory.debuggerStatement(debuggerKeyword, semicolonToken);
            };

            ParserImpl.prototype.isDoStatement = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.DoKeyword;
            };

            ParserImpl.prototype.parseDoStatement = function () {
                var doKeyword = this.eatKeyword(TypeScript.SyntaxKind.DoKeyword);
                var statement = this.parseStatement();
                var whileKeyword = this.eatKeyword(TypeScript.SyntaxKind.WhileKeyword);
                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);
                var condition = this.parseExpression(true);
                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);

                var semicolonToken = this.eatExplicitOrAutomaticSemicolon(true);

                return this.factory.doStatement(doKeyword, statement, whileKeyword, openParenToken, condition, closeParenToken, semicolonToken);
            };

            ParserImpl.prototype.isLabeledStatement = function () {
                return this.isIdentifier(this.currentToken()) && this.peekToken(1).tokenKind === TypeScript.SyntaxKind.ColonToken;
            };

            ParserImpl.prototype.parseLabeledStatement = function () {
                var identifier = this.eatIdentifierToken();
                var colonToken = this.eatToken(TypeScript.SyntaxKind.ColonToken);
                var statement = this.parseStatement();

                return this.factory.labeledStatement(identifier, colonToken, statement);
            };

            ParserImpl.prototype.isTryStatement = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.TryKeyword;
            };

            ParserImpl.prototype.parseTryStatement = function () {
                var tryKeyword = this.eatKeyword(TypeScript.SyntaxKind.TryKeyword);

                var savedListParsingState = this.listParsingState;
                this.listParsingState |= ListParsingState.TryBlock_Statements;
                var block = this.parseBlock(false, false);
                this.listParsingState = savedListParsingState;

                var catchClause = null;
                if (this.isCatchClause()) {
                    catchClause = this.parseCatchClause();
                }

                var finallyClause = null;
                if (catchClause === null || this.isFinallyClause()) {
                    finallyClause = this.parseFinallyClause();
                }

                return this.factory.tryStatement(tryKeyword, block, catchClause, finallyClause);
            };

            ParserImpl.prototype.isCatchClause = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.CatchKeyword;
            };

            ParserImpl.prototype.parseCatchClause = function () {
                var catchKeyword = this.eatKeyword(TypeScript.SyntaxKind.CatchKeyword);
                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);
                var identifier = this.eatIdentifierToken();
                var typeAnnotation = this.parseOptionalTypeAnnotation(false);
                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);

                var savedListParsingState = this.listParsingState;
                this.listParsingState |= ListParsingState.CatchBlock_Statements;
                var block = this.parseBlock(false, false);
                this.listParsingState = savedListParsingState;

                return this.factory.catchClause(catchKeyword, openParenToken, identifier, typeAnnotation, closeParenToken, block);
            };

            ParserImpl.prototype.isFinallyClause = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.FinallyKeyword;
            };

            ParserImpl.prototype.parseFinallyClause = function () {
                var finallyKeyword = this.eatKeyword(TypeScript.SyntaxKind.FinallyKeyword);
                var block = this.parseBlock(false, false);

                return this.factory.finallyClause(finallyKeyword, block);
            };

            ParserImpl.prototype.isWithStatement = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.WithKeyword;
            };

            ParserImpl.prototype.parseWithStatement = function () {
                var withKeyword = this.eatKeyword(TypeScript.SyntaxKind.WithKeyword);
                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);
                var condition = this.parseExpression(true);
                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);
                var statement = this.parseStatement();

                return this.factory.withStatement(withKeyword, openParenToken, condition, closeParenToken, statement);
            };

            ParserImpl.prototype.isWhileStatement = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.WhileKeyword;
            };

            ParserImpl.prototype.parseWhileStatement = function () {
                var whileKeyword = this.eatKeyword(TypeScript.SyntaxKind.WhileKeyword);
                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);
                var condition = this.parseExpression(true);
                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);
                var statement = this.parseStatement();

                return this.factory.whileStatement(whileKeyword, openParenToken, condition, closeParenToken, statement);
            };

            ParserImpl.prototype.isEmptyStatement = function (inErrorRecovery) {
                if (inErrorRecovery) {
                    return false;
                }

                return this.currentToken().tokenKind === TypeScript.SyntaxKind.SemicolonToken;
            };

            ParserImpl.prototype.parseEmptyStatement = function () {
                var semicolonToken = this.eatToken(TypeScript.SyntaxKind.SemicolonToken);
                return this.factory.emptyStatement(semicolonToken);
            };

            ParserImpl.prototype.isForOrForInStatement = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.ForKeyword;
            };

            ParserImpl.prototype.parseForOrForInStatement = function () {
                var forKeyword = this.eatKeyword(TypeScript.SyntaxKind.ForKeyword);
                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);

                var currentToken = this.currentToken();
                if (currentToken.tokenKind === TypeScript.SyntaxKind.VarKeyword) {
                    return this.parseForOrForInStatementWithVariableDeclaration(forKeyword, openParenToken);
                } else if (currentToken.tokenKind === TypeScript.SyntaxKind.SemicolonToken) {
                    return this.parseForStatement(forKeyword, openParenToken);
                } else {
                    return this.parseForOrForInStatementWithInitializer(forKeyword, openParenToken);
                }
            };

            ParserImpl.prototype.parseForOrForInStatementWithVariableDeclaration = function (forKeyword, openParenToken) {
                var variableDeclaration = this.parseVariableDeclaration(false);

                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.InKeyword) {
                    return this.parseForInStatementWithVariableDeclarationOrInitializer(forKeyword, openParenToken, variableDeclaration, null);
                }

                return this.parseForStatementWithVariableDeclarationOrInitializer(forKeyword, openParenToken, variableDeclaration, null);
            };

            ParserImpl.prototype.parseForInStatementWithVariableDeclarationOrInitializer = function (forKeyword, openParenToken, variableDeclaration, initializer) {
                var inKeyword = this.eatKeyword(TypeScript.SyntaxKind.InKeyword);
                var expression = this.parseExpression(true);
                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);
                var statement = this.parseStatement();

                return this.factory.forInStatement(forKeyword, openParenToken, variableDeclaration, initializer, inKeyword, expression, closeParenToken, statement);
            };

            ParserImpl.prototype.parseForOrForInStatementWithInitializer = function (forKeyword, openParenToken) {
                var initializer = this.parseExpression(false);
                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.InKeyword) {
                    return this.parseForInStatementWithVariableDeclarationOrInitializer(forKeyword, openParenToken, null, initializer);
                } else {
                    return this.parseForStatementWithVariableDeclarationOrInitializer(forKeyword, openParenToken, null, initializer);
                }
            };

            ParserImpl.prototype.parseForStatement = function (forKeyword, openParenToken) {
                var initializer = null;

                if (this.currentToken().tokenKind !== TypeScript.SyntaxKind.SemicolonToken && this.currentToken().tokenKind !== TypeScript.SyntaxKind.CloseParenToken && this.currentToken().tokenKind !== TypeScript.SyntaxKind.EndOfFileToken) {
                    initializer = this.parseExpression(false);
                }

                return this.parseForStatementWithVariableDeclarationOrInitializer(forKeyword, openParenToken, null, initializer);
            };

            ParserImpl.prototype.parseForStatementWithVariableDeclarationOrInitializer = function (forKeyword, openParenToken, variableDeclaration, initializer) {
                var firstSemicolonToken = this.eatToken(TypeScript.SyntaxKind.SemicolonToken);

                var condition = null;
                if (this.currentToken().tokenKind !== TypeScript.SyntaxKind.SemicolonToken && this.currentToken().tokenKind !== TypeScript.SyntaxKind.CloseParenToken && this.currentToken().tokenKind !== TypeScript.SyntaxKind.EndOfFileToken) {
                    condition = this.parseExpression(true);
                }

                var secondSemicolonToken = this.eatToken(TypeScript.SyntaxKind.SemicolonToken);

                var incrementor = null;
                if (this.currentToken().tokenKind !== TypeScript.SyntaxKind.CloseParenToken && this.currentToken().tokenKind !== TypeScript.SyntaxKind.EndOfFileToken) {
                    incrementor = this.parseExpression(true);
                }

                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);
                var statement = this.parseStatement();

                return this.factory.forStatement(forKeyword, openParenToken, variableDeclaration, initializer, firstSemicolonToken, condition, secondSemicolonToken, incrementor, closeParenToken, statement);
            };

            ParserImpl.prototype.isBreakStatement = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.BreakKeyword;
            };

            ParserImpl.prototype.parseBreakStatement = function () {
                var breakKeyword = this.eatKeyword(TypeScript.SyntaxKind.BreakKeyword);

                var identifier = null;
                if (!this.canEatExplicitOrAutomaticSemicolon(false)) {
                    if (this.isIdentifier(this.currentToken())) {
                        identifier = this.eatIdentifierToken();
                    }
                }

                var semicolon = this.eatExplicitOrAutomaticSemicolon(false);
                return this.factory.breakStatement(breakKeyword, identifier, semicolon);
            };

            ParserImpl.prototype.isContinueStatement = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.ContinueKeyword;
            };

            ParserImpl.prototype.parseContinueStatement = function () {
                var continueKeyword = this.eatKeyword(TypeScript.SyntaxKind.ContinueKeyword);

                var identifier = null;
                if (!this.canEatExplicitOrAutomaticSemicolon(false)) {
                    if (this.isIdentifier(this.currentToken())) {
                        identifier = this.eatIdentifierToken();
                    }
                }

                var semicolon = this.eatExplicitOrAutomaticSemicolon(false);
                return this.factory.continueStatement(continueKeyword, identifier, semicolon);
            };

            ParserImpl.prototype.isSwitchStatement = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.SwitchKeyword;
            };

            ParserImpl.prototype.parseSwitchStatement = function () {
                var switchKeyword = this.eatKeyword(TypeScript.SyntaxKind.SwitchKeyword);
                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);
                var expression = this.parseExpression(true);
                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);

                var openBraceToken = this.eatToken(TypeScript.SyntaxKind.OpenBraceToken);

                var switchClauses = TypeScript.Syntax.emptyList;
                if (openBraceToken.width() > 0) {
                    var result = this.parseSyntaxList(ListParsingState.SwitchStatement_SwitchClauses);
                    switchClauses = result.list;
                    openBraceToken = this.addSkippedTokensAfterToken(openBraceToken, result.skippedTokens);
                }

                var closeBraceToken = this.eatToken(TypeScript.SyntaxKind.CloseBraceToken);
                return this.factory.switchStatement(switchKeyword, openParenToken, expression, closeParenToken, openBraceToken, switchClauses, closeBraceToken);
            };

            ParserImpl.prototype.isCaseSwitchClause = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.CaseKeyword;
            };

            ParserImpl.prototype.isDefaultSwitchClause = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.DefaultKeyword;
            };

            ParserImpl.prototype.isSwitchClause = function () {
                if (this.currentNode() !== null && this.currentNode().isSwitchClause()) {
                    return true;
                }

                return this.isCaseSwitchClause() || this.isDefaultSwitchClause();
            };

            ParserImpl.prototype.parseSwitchClause = function () {
                if (this.currentNode() !== null && this.currentNode().isSwitchClause()) {
                    return this.eatNode();
                }

                if (this.isCaseSwitchClause()) {
                    return this.parseCaseSwitchClause();
                } else if (this.isDefaultSwitchClause()) {
                    return this.parseDefaultSwitchClause();
                } else {
                    throw TypeScript.Errors.invalidOperation();
                }
            };

            ParserImpl.prototype.parseCaseSwitchClause = function () {
                var caseKeyword = this.eatKeyword(TypeScript.SyntaxKind.CaseKeyword);
                var expression = this.parseExpression(true);
                var colonToken = this.eatToken(TypeScript.SyntaxKind.ColonToken);
                var statements = TypeScript.Syntax.emptyList;

                if (colonToken.fullWidth() > 0) {
                    var result = this.parseSyntaxList(ListParsingState.SwitchClause_Statements);
                    statements = result.list;
                    colonToken = this.addSkippedTokensAfterToken(colonToken, result.skippedTokens);
                }

                return this.factory.caseSwitchClause(caseKeyword, expression, colonToken, statements);
            };

            ParserImpl.prototype.parseDefaultSwitchClause = function () {
                var defaultKeyword = this.eatKeyword(TypeScript.SyntaxKind.DefaultKeyword);
                var colonToken = this.eatToken(TypeScript.SyntaxKind.ColonToken);
                var statements = TypeScript.Syntax.emptyList;

                if (colonToken.fullWidth() > 0) {
                    var result = this.parseSyntaxList(ListParsingState.SwitchClause_Statements);
                    statements = result.list;
                    colonToken = this.addSkippedTokensAfterToken(colonToken, result.skippedTokens);
                }

                return this.factory.defaultSwitchClause(defaultKeyword, colonToken, statements);
            };

            ParserImpl.prototype.isThrowStatement = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.ThrowKeyword;
            };

            ParserImpl.prototype.parseThrowStatement = function () {
                var throwKeyword = this.eatKeyword(TypeScript.SyntaxKind.ThrowKeyword);

                var expression = null;
                if (this.canEatExplicitOrAutomaticSemicolon(false)) {
                    var token = this.createMissingToken(TypeScript.SyntaxKind.IdentifierName, null);
                    expression = token;
                } else {
                    expression = this.parseExpression(true);
                }

                var semicolonToken = this.eatExplicitOrAutomaticSemicolon(false);

                return this.factory.throwStatement(throwKeyword, expression, semicolonToken);
            };

            ParserImpl.prototype.isReturnStatement = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.ReturnKeyword;
            };

            ParserImpl.prototype.parseReturnStatement = function () {
                var returnKeyword = this.eatKeyword(TypeScript.SyntaxKind.ReturnKeyword);

                var expression = null;
                if (!this.canEatExplicitOrAutomaticSemicolon(false)) {
                    expression = this.parseExpression(true);
                }

                var semicolonToken = this.eatExplicitOrAutomaticSemicolon(false);

                return this.factory.returnStatement(returnKeyword, expression, semicolonToken);
            };

            ParserImpl.prototype.isExpressionStatement = function () {
                var currentToken = this.currentToken();

                var kind = currentToken.tokenKind;
                if (kind === TypeScript.SyntaxKind.OpenBraceToken || kind === TypeScript.SyntaxKind.FunctionKeyword) {
                    return false;
                }

                return this.isExpression();
            };

            ParserImpl.prototype.isAssignmentOrOmittedExpression = function () {
                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.CommaToken) {
                    return true;
                }

                return this.isExpression();
            };

            ParserImpl.prototype.parseAssignmentOrOmittedExpression = function () {
                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.CommaToken) {
                    return this.factory.omittedExpression();
                }

                return this.parseAssignmentExpression(true);
            };

            ParserImpl.prototype.isExpression = function () {
                var currentToken = this.currentToken();
                var kind = currentToken.tokenKind;

                switch (kind) {
                    case TypeScript.SyntaxKind.NumericLiteral:
                    case TypeScript.SyntaxKind.StringLiteral:
                    case TypeScript.SyntaxKind.RegularExpressionLiteral:
                        return true;

                    case TypeScript.SyntaxKind.OpenBracketToken:
                    case TypeScript.SyntaxKind.OpenParenToken:
                        return true;

                    case TypeScript.SyntaxKind.LessThanToken:
                        return true;

                    case TypeScript.SyntaxKind.PlusPlusToken:
                    case TypeScript.SyntaxKind.MinusMinusToken:
                    case TypeScript.SyntaxKind.PlusToken:
                    case TypeScript.SyntaxKind.MinusToken:
                    case TypeScript.SyntaxKind.TildeToken:
                    case TypeScript.SyntaxKind.ExclamationToken:
                        return true;

                    case TypeScript.SyntaxKind.OpenBraceToken:
                        return true;

                    case TypeScript.SyntaxKind.EqualsGreaterThanToken:
                        return true;

                    case TypeScript.SyntaxKind.SlashToken:
                    case TypeScript.SyntaxKind.SlashEqualsToken:
                        return true;

                    case TypeScript.SyntaxKind.SuperKeyword:
                    case TypeScript.SyntaxKind.ThisKeyword:
                    case TypeScript.SyntaxKind.TrueKeyword:
                    case TypeScript.SyntaxKind.FalseKeyword:
                    case TypeScript.SyntaxKind.NullKeyword:
                        return true;

                    case TypeScript.SyntaxKind.NewKeyword:
                        return true;

                    case TypeScript.SyntaxKind.DeleteKeyword:
                    case TypeScript.SyntaxKind.VoidKeyword:
                    case TypeScript.SyntaxKind.TypeOfKeyword:
                        return true;

                    case TypeScript.SyntaxKind.FunctionKeyword:
                        return true;
                }

                if (this.isIdentifier(this.currentToken())) {
                    return true;
                }

                return false;
            };

            ParserImpl.prototype.parseExpressionStatement = function () {
                var expression = this.parseExpression(true);

                var semicolon = this.eatExplicitOrAutomaticSemicolon(false);

                return this.factory.expressionStatement(expression, semicolon);
            };

            ParserImpl.prototype.isIfStatement = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.IfKeyword;
            };

            ParserImpl.prototype.parseIfStatement = function () {
                var ifKeyword = this.eatKeyword(TypeScript.SyntaxKind.IfKeyword);
                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);
                var condition = this.parseExpression(true);
                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);
                var statement = this.parseStatement();

                var elseClause = null;
                if (this.isElseClause()) {
                    elseClause = this.parseElseClause();
                }

                return this.factory.ifStatement(ifKeyword, openParenToken, condition, closeParenToken, statement, elseClause);
            };

            ParserImpl.prototype.isElseClause = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.ElseKeyword;
            };

            ParserImpl.prototype.parseElseClause = function () {
                var elseKeyword = this.eatKeyword(TypeScript.SyntaxKind.ElseKeyword);
                var statement = this.parseStatement();

                return this.factory.elseClause(elseKeyword, statement);
            };

            ParserImpl.prototype.isVariableStatement = function () {
                var index = this.modifierCount();
                return this.peekToken(index).tokenKind === TypeScript.SyntaxKind.VarKeyword;
            };

            ParserImpl.prototype.parseVariableStatement = function () {
                var modifiers = this.parseModifiers();
                var variableDeclaration = this.parseVariableDeclaration(true);
                var semicolonToken = this.eatExplicitOrAutomaticSemicolon(false);

                return this.factory.variableStatement(modifiers, variableDeclaration, semicolonToken);
            };

            ParserImpl.prototype.parseVariableDeclaration = function (allowIn) {
                var varKeyword = this.eatKeyword(TypeScript.SyntaxKind.VarKeyword);

                var listParsingState = allowIn ? ListParsingState.VariableDeclaration_VariableDeclarators_AllowIn : ListParsingState.VariableDeclaration_VariableDeclarators_DisallowIn;

                var result = this.parseSeparatedSyntaxList(listParsingState);
                var variableDeclarators = result.list;
                varKeyword = this.addSkippedTokensAfterToken(varKeyword, result.skippedTokens);

                return this.factory.variableDeclaration(varKeyword, variableDeclarators);
            };

            ParserImpl.prototype.isVariableDeclarator = function () {
                if (this.currentNode() !== null && this.currentNode().kind() === TypeScript.SyntaxKind.VariableDeclarator) {
                    return true;
                }

                return this.isIdentifier(this.currentToken());
            };

            ParserImpl.prototype.canReuseVariableDeclaratorNode = function (node) {
                if (node === null || node.kind() !== TypeScript.SyntaxKind.VariableDeclarator) {
                    return false;
                }

                var variableDeclarator = node;
                return variableDeclarator.equalsValueClause === null;
            };

            ParserImpl.prototype.parseVariableDeclarator = function (allowIn, allowPropertyName) {
                if (this.canReuseVariableDeclaratorNode(this.currentNode())) {
                    return this.eatNode();
                }

                var propertyName = allowPropertyName ? this.eatPropertyName() : this.eatIdentifierToken();
                var equalsValueClause = null;
                var typeAnnotation = null;

                if (propertyName.width() > 0) {
                    typeAnnotation = this.parseOptionalTypeAnnotation(false);

                    if (this.isEqualsValueClause(false)) {
                        equalsValueClause = this.parseEqualsValueClause(allowIn);
                    }
                }

                return this.factory.variableDeclarator(propertyName, typeAnnotation, equalsValueClause);
            };

            ParserImpl.prototype.isColonValueClause = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.ColonToken;
            };

            ParserImpl.prototype.isEqualsValueClause = function (inParameter) {
                var token0 = this.currentToken();
                if (token0.tokenKind === TypeScript.SyntaxKind.EqualsToken) {
                    return true;
                }

                if (!this.previousToken().hasTrailingNewLine()) {
                    if (token0.tokenKind === TypeScript.SyntaxKind.EqualsGreaterThanToken) {
                        return false;
                    }

                    if (token0.tokenKind === TypeScript.SyntaxKind.OpenBraceToken && inParameter) {
                        return false;
                    }

                    return this.isExpression();
                }

                return false;
            };

            ParserImpl.prototype.parseEqualsValueClause = function (allowIn) {
                var equalsToken = this.eatToken(TypeScript.SyntaxKind.EqualsToken);
                var value = this.parseAssignmentExpression(allowIn);

                return this.factory.equalsValueClause(equalsToken, value);
            };

            ParserImpl.prototype.parseExpression = function (allowIn) {
                return this.parseSubExpression(0, allowIn);
            };

            ParserImpl.prototype.parseAssignmentExpression = function (allowIn) {
                return this.parseSubExpression(ExpressionPrecedence.AssignmentExpressionPrecedence, allowIn);
            };

            ParserImpl.prototype.parseUnaryExpression = function () {
                var currentTokenKind = this.currentToken().tokenKind;
                if (TypeScript.SyntaxFacts.isPrefixUnaryExpressionOperatorToken(currentTokenKind)) {
                    var operatorKind = TypeScript.SyntaxFacts.getPrefixUnaryExpressionFromOperatorToken(currentTokenKind);

                    var operatorToken = this.eatAnyToken();

                    var operand = this.parseUnaryExpression();
                    return this.factory.prefixUnaryExpression(operatorKind, operatorToken, operand);
                } else {
                    return this.parseTerm(false);
                }
            };

            ParserImpl.prototype.parseSubExpression = function (precedence, allowIn) {
                var leftOperand = this.parseUnaryExpression();
                leftOperand = this.parseBinaryOrConditionalExpressions(precedence, allowIn, leftOperand);

                return leftOperand;
            };

            ParserImpl.prototype.parseBinaryOrConditionalExpressions = function (precedence, allowIn, leftOperand) {
                while (true) {
                    var token0 = this.currentToken();
                    var token0Kind = token0.tokenKind;

                    if (TypeScript.SyntaxFacts.isBinaryExpressionOperatorToken(token0Kind)) {
                        if (token0Kind === TypeScript.SyntaxKind.InKeyword && !allowIn) {
                            break;
                        }

                        var mergedToken = this.tryMergeBinaryExpressionTokens();
                        var tokenKind = mergedToken === null ? token0Kind : mergedToken.syntaxKind;

                        var binaryExpressionKind = TypeScript.SyntaxFacts.getBinaryExpressionFromOperatorToken(tokenKind);
                        var newPrecedence = ParserImpl.getPrecedence(binaryExpressionKind);

                        if (newPrecedence < precedence) {
                            break;
                        }

                        if (newPrecedence === precedence && !this.isRightAssociative(binaryExpressionKind)) {
                            break;
                        }

                        var operatorToken = mergedToken === null ? token0 : TypeScript.Syntax.token(mergedToken.syntaxKind).withLeadingTrivia(token0.leadingTrivia()).withTrailingTrivia(this.peekToken(mergedToken.tokenCount - 1).trailingTrivia());

                        var skipCount = mergedToken === null ? 1 : mergedToken.tokenCount;
                        for (var i = 0; i < skipCount; i++) {
                            this.eatAnyToken();
                        }

                        leftOperand = this.factory.binaryExpression(binaryExpressionKind, leftOperand, operatorToken, this.parseSubExpression(newPrecedence, allowIn));
                        continue;
                    }

                    if (token0Kind === TypeScript.SyntaxKind.QuestionToken && precedence <= ExpressionPrecedence.ConditionalExpressionPrecedence) {
                        var questionToken = this.eatToken(TypeScript.SyntaxKind.QuestionToken);

                        var whenTrueExpression = this.parseAssignmentExpression(allowIn);
                        var colon = this.eatToken(TypeScript.SyntaxKind.ColonToken);

                        var whenFalseExpression = this.parseAssignmentExpression(allowIn);
                        leftOperand = this.factory.conditionalExpression(leftOperand, questionToken, whenTrueExpression, colon, whenFalseExpression);
                        continue;
                    }

                    break;
                }

                return leftOperand;
            };

            ParserImpl.prototype.tryMergeBinaryExpressionTokens = function () {
                var token0 = this.currentToken();

                if (token0.tokenKind === TypeScript.SyntaxKind.GreaterThanToken && !token0.hasTrailingTrivia()) {
                    var storage = this.mergeTokensStorage;
                    storage[0] = TypeScript.SyntaxKind.None;
                    storage[1] = TypeScript.SyntaxKind.None;
                    storage[2] = TypeScript.SyntaxKind.None;

                    for (var i = 0; i < storage.length; i++) {
                        var nextToken = this.peekToken(i + 1);

                        if (!nextToken.hasLeadingTrivia()) {
                            storage[i] = nextToken.tokenKind;
                        }

                        if (nextToken.hasTrailingTrivia()) {
                            break;
                        }
                    }

                    if (storage[0] === TypeScript.SyntaxKind.GreaterThanToken) {
                        if (storage[1] === TypeScript.SyntaxKind.GreaterThanToken) {
                            if (storage[2] === TypeScript.SyntaxKind.EqualsToken) {
                                return { tokenCount: 4, syntaxKind: TypeScript.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken };
                            } else {
                                return { tokenCount: 3, syntaxKind: TypeScript.SyntaxKind.GreaterThanGreaterThanGreaterThanToken };
                            }
                        } else if (storage[1] === TypeScript.SyntaxKind.EqualsToken) {
                            return { tokenCount: 3, syntaxKind: TypeScript.SyntaxKind.GreaterThanGreaterThanEqualsToken };
                        } else {
                            return { tokenCount: 2, syntaxKind: TypeScript.SyntaxKind.GreaterThanGreaterThanToken };
                        }
                    } else if (storage[0] === TypeScript.SyntaxKind.EqualsToken) {
                        return { tokenCount: 2, syntaxKind: TypeScript.SyntaxKind.GreaterThanEqualsToken };
                    }
                }

                return null;
            };

            ParserImpl.prototype.isRightAssociative = function (expressionKind) {
                switch (expressionKind) {
                    case TypeScript.SyntaxKind.AssignmentExpression:
                    case TypeScript.SyntaxKind.AddAssignmentExpression:
                    case TypeScript.SyntaxKind.SubtractAssignmentExpression:
                    case TypeScript.SyntaxKind.MultiplyAssignmentExpression:
                    case TypeScript.SyntaxKind.DivideAssignmentExpression:
                    case TypeScript.SyntaxKind.ModuloAssignmentExpression:
                    case TypeScript.SyntaxKind.AndAssignmentExpression:
                    case TypeScript.SyntaxKind.ExclusiveOrAssignmentExpression:
                    case TypeScript.SyntaxKind.OrAssignmentExpression:
                    case TypeScript.SyntaxKind.LeftShiftAssignmentExpression:
                    case TypeScript.SyntaxKind.SignedRightShiftAssignmentExpression:
                    case TypeScript.SyntaxKind.UnsignedRightShiftAssignmentExpression:
                        return true;
                    default:
                        return false;
                }
            };

            ParserImpl.prototype.parseTerm = function (inObjectCreation) {
                var term = this.parseTermWorker();
                if (term === null) {
                    return this.eatIdentifierToken();
                }

                return this.parsePostFixExpression(term, inObjectCreation);
            };

            ParserImpl.prototype.parsePostFixExpression = function (expression, inObjectCreation) {
                while (true) {
                    var currentTokenKind = this.currentToken().tokenKind;
                    switch (currentTokenKind) {
                        case TypeScript.SyntaxKind.OpenParenToken:
                            if (inObjectCreation) {
                                return expression;
                            }

                            expression = this.factory.invocationExpression(expression, this.parseArgumentList(null));
                            continue;

                        case TypeScript.SyntaxKind.LessThanToken:
                            if (inObjectCreation) {
                                return expression;
                            }

                            var argumentList = this.tryParseArgumentList();
                            if (argumentList !== null) {
                                expression = this.factory.invocationExpression(expression, argumentList);
                                continue;
                            }

                            break;

                        case TypeScript.SyntaxKind.OpenBracketToken:
                            expression = this.parseElementAccessExpression(expression, inObjectCreation);
                            continue;

                        case TypeScript.SyntaxKind.PlusPlusToken:
                        case TypeScript.SyntaxKind.MinusMinusToken:
                            if (this.previousToken() !== null && this.previousToken().hasTrailingNewLine()) {
                                break;
                            }

                            expression = this.factory.postfixUnaryExpression(TypeScript.SyntaxFacts.getPostfixUnaryExpressionFromOperatorToken(currentTokenKind), expression, this.eatAnyToken());
                            continue;

                        case TypeScript.SyntaxKind.DotToken:
                            expression = this.factory.memberAccessExpression(expression, this.eatToken(TypeScript.SyntaxKind.DotToken), this.eatIdentifierNameToken());
                            continue;
                    }

                    return expression;
                }
            };

            ParserImpl.prototype.tryParseArgumentList = function () {
                var typeArgumentList = null;

                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.LessThanToken) {
                    var rewindPoint = this.getRewindPoint();
                    try  {
                        typeArgumentList = this.tryParseTypeArgumentList(true);
                        var token0 = this.currentToken();

                        var isOpenParen = token0.tokenKind === TypeScript.SyntaxKind.OpenParenToken;
                        var isDot = token0.tokenKind === TypeScript.SyntaxKind.DotToken;
                        var isOpenParenOrDot = isOpenParen || isDot;
                        if (typeArgumentList === null || !isOpenParenOrDot) {
                            this.rewind(rewindPoint);
                            return null;
                        }

                        if (isDot) {
                            var diagnostic = new TypeScript.SyntaxDiagnostic(this.fileName, this.currentTokenStart(), token0.width(), TypeScript.DiagnosticCode.A_parameter_list_must_follow_a_generic_type_argument_list______expected, null);
                            this.addDiagnostic(diagnostic);

                            return this.factory.argumentList(typeArgumentList, TypeScript.Syntax.emptyToken(TypeScript.SyntaxKind.OpenParenToken), TypeScript.Syntax.emptySeparatedList, TypeScript.Syntax.emptyToken(TypeScript.SyntaxKind.CloseParenToken));
                        }
                    } finally {
                        this.releaseRewindPoint(rewindPoint);
                    }
                }

                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.OpenParenToken) {
                    return this.parseArgumentList(typeArgumentList);
                }

                return null;
            };

            ParserImpl.prototype.parseArgumentList = function (typeArgumentList) {
                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);
                var arguments = TypeScript.Syntax.emptySeparatedList;

                if (openParenToken.fullWidth() > 0) {
                    var result = this.parseSeparatedSyntaxList(ListParsingState.ArgumentList_AssignmentExpressions);
                    arguments = result.list;
                    openParenToken = this.addSkippedTokensAfterToken(openParenToken, result.skippedTokens);
                }

                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);

                return this.factory.argumentList(typeArgumentList, openParenToken, arguments, closeParenToken);
            };

            ParserImpl.prototype.parseElementAccessExpression = function (expression, inObjectCreation) {
                var start = this.currentTokenStart();
                var openBracketToken = this.eatToken(TypeScript.SyntaxKind.OpenBracketToken);
                var argumentExpression;

                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.CloseBracketToken && inObjectCreation) {
                    var end = this.currentTokenStart() + this.currentToken().width();
                    var diagnostic = new TypeScript.SyntaxDiagnostic(this.fileName, start, end - start, TypeScript.DiagnosticCode._new_T____cannot_be_used_to_create_an_array__Use__new_Array_T_____instead, null);
                    this.addDiagnostic(diagnostic);

                    argumentExpression = TypeScript.Syntax.emptyToken(TypeScript.SyntaxKind.IdentifierName);
                } else {
                    argumentExpression = this.parseExpression(true);
                }

                var closeBracketToken = this.eatToken(TypeScript.SyntaxKind.CloseBracketToken);

                return this.factory.elementAccessExpression(expression, openBracketToken, argumentExpression, closeBracketToken);
            };

            ParserImpl.prototype.parseTermWorker = function () {
                var currentToken = this.currentToken();

                if (currentToken.tokenKind === TypeScript.SyntaxKind.EqualsGreaterThanToken) {
                    return this.parseSimpleArrowFunctionExpression();
                }

                if (this.isIdentifier(currentToken)) {
                    if (this.isSimpleArrowFunctionExpression()) {
                        return this.parseSimpleArrowFunctionExpression();
                    } else {
                        var identifier = this.eatIdentifierToken();
                        return identifier;
                    }
                }

                var currentTokenKind = currentToken.tokenKind;
                switch (currentTokenKind) {
                    case TypeScript.SyntaxKind.ThisKeyword:
                        return this.parseThisExpression();

                    case TypeScript.SyntaxKind.TrueKeyword:
                    case TypeScript.SyntaxKind.FalseKeyword:
                        return this.parseLiteralExpression();

                    case TypeScript.SyntaxKind.NullKeyword:
                        return this.parseLiteralExpression();

                    case TypeScript.SyntaxKind.NewKeyword:
                        return this.parseObjectCreationExpression();

                    case TypeScript.SyntaxKind.FunctionKeyword:
                        return this.parseFunctionExpression();

                    case TypeScript.SyntaxKind.SuperKeyword:
                        return this.parseSuperExpression();

                    case TypeScript.SyntaxKind.TypeOfKeyword:
                        return this.parseTypeOfExpression();

                    case TypeScript.SyntaxKind.DeleteKeyword:
                        return this.parseDeleteExpression();

                    case TypeScript.SyntaxKind.VoidKeyword:
                        return this.parseVoidExpression();

                    case TypeScript.SyntaxKind.NumericLiteral:
                        return this.parseLiteralExpression();

                    case TypeScript.SyntaxKind.RegularExpressionLiteral:
                        return this.parseLiteralExpression();

                    case TypeScript.SyntaxKind.StringLiteral:
                        return this.parseLiteralExpression();

                    case TypeScript.SyntaxKind.OpenBracketToken:
                        return this.parseArrayLiteralExpression();

                    case TypeScript.SyntaxKind.OpenBraceToken:
                        return this.parseObjectLiteralExpression();

                    case TypeScript.SyntaxKind.OpenParenToken:
                        return this.parseParenthesizedOrArrowFunctionExpression();

                    case TypeScript.SyntaxKind.LessThanToken:
                        return this.parseCastOrArrowFunctionExpression();

                    case TypeScript.SyntaxKind.SlashToken:
                    case TypeScript.SyntaxKind.SlashEqualsToken:
                        var result = this.tryReparseDivideAsRegularExpression();
                        if (result !== null) {
                            return result;
                        }
                        break;
                }

                return null;
            };

            ParserImpl.prototype.tryReparseDivideAsRegularExpression = function () {
                var currentToken = this.currentToken();

                if (this.previousToken() !== null) {
                    var previousTokenKind = this.previousToken().tokenKind;
                    switch (previousTokenKind) {
                        case TypeScript.SyntaxKind.IdentifierName:
                            return null;

                        case TypeScript.SyntaxKind.ThisKeyword:
                        case TypeScript.SyntaxKind.TrueKeyword:
                        case TypeScript.SyntaxKind.FalseKeyword:
                            return null;

                        case TypeScript.SyntaxKind.StringLiteral:
                        case TypeScript.SyntaxKind.NumericLiteral:
                        case TypeScript.SyntaxKind.RegularExpressionLiteral:
                        case TypeScript.SyntaxKind.PlusPlusToken:
                        case TypeScript.SyntaxKind.MinusMinusToken:
                        case TypeScript.SyntaxKind.CloseBracketToken:
                        case TypeScript.SyntaxKind.CloseBraceToken:
                            return null;
                    }
                }

                currentToken = this.currentTokenAllowingRegularExpression();

                if (currentToken.tokenKind === TypeScript.SyntaxKind.SlashToken || currentToken.tokenKind === TypeScript.SyntaxKind.SlashEqualsToken) {
                    return null;
                } else if (currentToken.tokenKind === TypeScript.SyntaxKind.RegularExpressionLiteral) {
                    return this.parseLiteralExpression();
                } else {
                    throw TypeScript.Errors.invalidOperation();
                }
            };

            ParserImpl.prototype.parseTypeOfExpression = function () {
                var typeOfKeyword = this.eatKeyword(TypeScript.SyntaxKind.TypeOfKeyword);
                var expression = this.parseUnaryExpression();

                return this.factory.typeOfExpression(typeOfKeyword, expression);
            };

            ParserImpl.prototype.parseDeleteExpression = function () {
                var deleteKeyword = this.eatKeyword(TypeScript.SyntaxKind.DeleteKeyword);
                var expression = this.parseUnaryExpression();

                return this.factory.deleteExpression(deleteKeyword, expression);
            };

            ParserImpl.prototype.parseVoidExpression = function () {
                var voidKeyword = this.eatKeyword(TypeScript.SyntaxKind.VoidKeyword);
                var expression = this.parseUnaryExpression();

                return this.factory.voidExpression(voidKeyword, expression);
            };

            ParserImpl.prototype.parseSuperExpression = function () {
                var superKeyword = this.eatKeyword(TypeScript.SyntaxKind.SuperKeyword);
                return superKeyword;
            };

            ParserImpl.prototype.parseFunctionExpression = function () {
                var functionKeyword = this.eatKeyword(TypeScript.SyntaxKind.FunctionKeyword);
                var identifier = null;

                if (this.isIdentifier(this.currentToken())) {
                    identifier = this.eatIdentifierToken();
                }

                var callSignature = this.parseCallSignature(false);
                var block = this.parseBlock(false, true);

                return this.factory.functionExpression(functionKeyword, identifier, callSignature, block);
            };

            ParserImpl.prototype.parseObjectCreationExpression = function () {
                var newKeyword = this.eatKeyword(TypeScript.SyntaxKind.NewKeyword);

                var expression = this.parseTerm(true);
                var argumentList = this.tryParseArgumentList();

                return this.factory.objectCreationExpression(newKeyword, expression, argumentList);
            };

            ParserImpl.prototype.parseCastOrArrowFunctionExpression = function () {
                var rewindPoint = this.getRewindPoint();
                try  {
                    var arrowFunction = this.tryParseArrowFunctionExpression();
                    if (arrowFunction !== null) {
                        return arrowFunction;
                    }

                    this.rewind(rewindPoint);
                    return this.parseCastExpression();
                } finally {
                    this.releaseRewindPoint(rewindPoint);
                }
            };

            ParserImpl.prototype.parseCastExpression = function () {
                var lessThanToken = this.eatToken(TypeScript.SyntaxKind.LessThanToken);
                var type = this.parseType();
                var greaterThanToken = this.eatToken(TypeScript.SyntaxKind.GreaterThanToken);
                var expression = this.parseUnaryExpression();

                return this.factory.castExpression(lessThanToken, type, greaterThanToken, expression);
            };

            ParserImpl.prototype.parseParenthesizedOrArrowFunctionExpression = function () {
                var result = this.tryParseArrowFunctionExpression();
                if (result !== null) {
                    return result;
                }

                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);
                var expression = this.parseExpression(true);
                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);

                return this.factory.parenthesizedExpression(openParenToken, expression, closeParenToken);
            };

            ParserImpl.prototype.tryParseArrowFunctionExpression = function () {
                var tokenKind = this.currentToken().tokenKind;

                if (this.isDefinitelyArrowFunctionExpression()) {
                    return this.parseParenthesizedArrowFunctionExpression(false);
                }

                if (!this.isPossiblyArrowFunctionExpression()) {
                    return null;
                }

                var rewindPoint = this.getRewindPoint();
                try  {
                    var arrowFunction = this.parseParenthesizedArrowFunctionExpression(true);
                    if (arrowFunction === null) {
                        this.rewind(rewindPoint);
                    }
                    return arrowFunction;
                } finally {
                    this.releaseRewindPoint(rewindPoint);
                }
            };

            ParserImpl.prototype.parseParenthesizedArrowFunctionExpression = function (requireArrow) {
                var currentToken = this.currentToken();

                var callSignature = this.parseCallSignature(true);

                if (requireArrow && this.currentToken().tokenKind !== TypeScript.SyntaxKind.EqualsGreaterThanToken) {
                    return null;
                }

                var equalsGreaterThanToken = this.eatToken(TypeScript.SyntaxKind.EqualsGreaterThanToken);
                var body = this.parseArrowFunctionBody();

                return this.factory.parenthesizedArrowFunctionExpression(callSignature, equalsGreaterThanToken, body);
            };

            ParserImpl.prototype.parseArrowFunctionBody = function () {
                if (this.isBlock()) {
                    return this.parseBlock(false, false);
                } else {
                    return this.parseAssignmentExpression(true);
                }
            };

            ParserImpl.prototype.isSimpleArrowFunctionExpression = function () {
                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.EqualsGreaterThanToken) {
                    return true;
                }

                return this.isIdentifier(this.currentToken()) && this.peekToken(1).tokenKind === TypeScript.SyntaxKind.EqualsGreaterThanToken;
            };

            ParserImpl.prototype.parseSimpleArrowFunctionExpression = function () {
                var identifier = this.eatIdentifierToken();
                var equalsGreaterThanToken = this.eatToken(TypeScript.SyntaxKind.EqualsGreaterThanToken);
                var body = this.parseArrowFunctionBody();

                return this.factory.simpleArrowFunctionExpression(identifier, equalsGreaterThanToken, body);
            };

            ParserImpl.prototype.isBlock = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.OpenBraceToken;
            };

            ParserImpl.prototype.isDefinitelyArrowFunctionExpression = function () {
                var token0 = this.currentToken();
                if (token0.tokenKind !== TypeScript.SyntaxKind.OpenParenToken) {
                    return false;
                }

                var token1 = this.peekToken(1);
                var token2;

                if (token1.tokenKind === TypeScript.SyntaxKind.CloseParenToken) {
                    token2 = this.peekToken(2);
                    return token2.tokenKind === TypeScript.SyntaxKind.ColonToken || token2.tokenKind === TypeScript.SyntaxKind.EqualsGreaterThanToken || token2.tokenKind === TypeScript.SyntaxKind.OpenBraceToken;
                }

                if (token1.tokenKind === TypeScript.SyntaxKind.DotDotDotToken) {
                    return true;
                }

                if (!this.isIdentifier(token1)) {
                    return false;
                }

                token2 = this.peekToken(2);
                if (token2.tokenKind === TypeScript.SyntaxKind.ColonToken) {
                    return true;
                }

                var token3 = this.peekToken(3);
                if (token2.tokenKind === TypeScript.SyntaxKind.QuestionToken) {
                    if (token3.tokenKind === TypeScript.SyntaxKind.ColonToken || token3.tokenKind === TypeScript.SyntaxKind.CloseParenToken || token3.tokenKind === TypeScript.SyntaxKind.CommaToken) {
                        return true;
                    }
                }

                if (token2.tokenKind === TypeScript.SyntaxKind.CloseParenToken) {
                    if (token3.tokenKind === TypeScript.SyntaxKind.EqualsGreaterThanToken) {
                        return true;
                    }
                }

                return false;
            };

            ParserImpl.prototype.isPossiblyArrowFunctionExpression = function () {
                var token0 = this.currentToken();
                if (token0.tokenKind !== TypeScript.SyntaxKind.OpenParenToken) {
                    return true;
                }

                var token1 = this.peekToken(1);

                if (!this.isIdentifier(token1)) {
                    return false;
                }

                var token2 = this.peekToken(2);
                if (token2.tokenKind === TypeScript.SyntaxKind.EqualsToken) {
                    return true;
                }

                if (token2.tokenKind === TypeScript.SyntaxKind.CommaToken) {
                    return true;
                }

                if (token2.tokenKind === TypeScript.SyntaxKind.CloseParenToken) {
                    var token3 = this.peekToken(3);
                    if (token3.tokenKind === TypeScript.SyntaxKind.ColonToken) {
                        return true;
                    }
                }

                return false;
            };

            ParserImpl.prototype.parseObjectLiteralExpression = function () {
                var openBraceToken = this.eatToken(TypeScript.SyntaxKind.OpenBraceToken);

                var result = this.parseSeparatedSyntaxList(ListParsingState.ObjectLiteralExpression_PropertyAssignments);
                var propertyAssignments = result.list;
                openBraceToken = this.addSkippedTokensAfterToken(openBraceToken, result.skippedTokens);

                var closeBraceToken = this.eatToken(TypeScript.SyntaxKind.CloseBraceToken);

                return this.factory.objectLiteralExpression(openBraceToken, propertyAssignments, closeBraceToken);
            };

            ParserImpl.prototype.parsePropertyAssignment = function () {
                if (this.isGetAccessorPropertyAssignment(false)) {
                    return this.parseGetAccessorPropertyAssignment();
                } else if (this.isSetAccessorPropertyAssignment(false)) {
                    return this.parseSetAccessorPropertyAssignment();
                } else if (this.isFunctionPropertyAssignment(false)) {
                    return this.parseFunctionPropertyAssignment();
                } else if (this.isSimplePropertyAssignment(false)) {
                    return this.parseSimplePropertyAssignment();
                } else {
                    throw TypeScript.Errors.invalidOperation();
                }
            };

            ParserImpl.prototype.isPropertyAssignment = function (inErrorRecovery) {
                return this.isGetAccessorPropertyAssignment(inErrorRecovery) || this.isSetAccessorPropertyAssignment(inErrorRecovery) || this.isFunctionPropertyAssignment(inErrorRecovery) || this.isSimplePropertyAssignment(inErrorRecovery);
            };

            ParserImpl.prototype.isGetAccessorPropertyAssignment = function (inErrorRecovery) {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.GetKeyword && this.isPropertyName(this.peekToken(1), inErrorRecovery);
            };

            ParserImpl.prototype.parseGetAccessorPropertyAssignment = function () {
                var getKeyword = this.eatKeyword(TypeScript.SyntaxKind.GetKeyword);
                var propertyName = this.eatPropertyName();
                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);
                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);
                var typeAnnotation = this.parseOptionalTypeAnnotation(false);
                var block = this.parseBlock(false, true);

                return this.factory.getAccessorPropertyAssignment(getKeyword, propertyName, openParenToken, closeParenToken, typeAnnotation, block);
            };

            ParserImpl.prototype.isSetAccessorPropertyAssignment = function (inErrorRecovery) {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.SetKeyword && this.isPropertyName(this.peekToken(1), inErrorRecovery);
            };

            ParserImpl.prototype.parseSetAccessorPropertyAssignment = function () {
                var setKeyword = this.eatKeyword(TypeScript.SyntaxKind.SetKeyword);
                var propertyName = this.eatPropertyName();
                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);
                var parameter = this.parseParameter();
                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);
                var block = this.parseBlock(false, true);

                return this.factory.setAccessorPropertyAssignment(setKeyword, propertyName, openParenToken, parameter, closeParenToken, block);
            };

            ParserImpl.prototype.eatPropertyName = function () {
                return TypeScript.SyntaxFacts.isIdentifierNameOrAnyKeyword(this.currentToken()) ? this.eatIdentifierNameToken() : this.eatAnyToken();
            };

            ParserImpl.prototype.isFunctionPropertyAssignment = function (inErrorRecovery) {
                return this.isPropertyName(this.currentToken(), inErrorRecovery) && this.isCallSignature(1);
            };

            ParserImpl.prototype.parseFunctionPropertyAssignment = function () {
                var propertyName = this.eatPropertyName();
                var callSignature = this.parseCallSignature(false);
                var block = this.parseBlock(false, true);

                return this.factory.functionPropertyAssignment(propertyName, callSignature, block);
            };

            ParserImpl.prototype.isSimplePropertyAssignment = function (inErrorRecovery) {
                return this.isPropertyName(this.currentToken(), inErrorRecovery);
            };

            ParserImpl.prototype.parseSimplePropertyAssignment = function () {
                var propertyName = this.eatPropertyName();
                var colonToken = this.eatToken(TypeScript.SyntaxKind.ColonToken);
                var expression = this.parseAssignmentExpression(true);

                return this.factory.simplePropertyAssignment(propertyName, colonToken, expression);
            };

            ParserImpl.prototype.isPropertyName = function (token, inErrorRecovery) {
                if (TypeScript.SyntaxFacts.isIdentifierNameOrAnyKeyword(token)) {
                    if (inErrorRecovery) {
                        return this.isIdentifier(token);
                    } else {
                        return true;
                    }
                }

                switch (token.tokenKind) {
                    case TypeScript.SyntaxKind.StringLiteral:
                    case TypeScript.SyntaxKind.NumericLiteral:
                        return true;

                    default:
                        return false;
                }
            };

            ParserImpl.prototype.parseArrayLiteralExpression = function () {
                var openBracketToken = this.eatToken(TypeScript.SyntaxKind.OpenBracketToken);

                var result = this.parseSeparatedSyntaxList(ListParsingState.ArrayLiteralExpression_AssignmentExpressions);
                var expressions = result.list;
                openBracketToken = this.addSkippedTokensAfterToken(openBracketToken, result.skippedTokens);

                var closeBracketToken = this.eatToken(TypeScript.SyntaxKind.CloseBracketToken);

                return this.factory.arrayLiteralExpression(openBracketToken, expressions, closeBracketToken);
            };

            ParserImpl.prototype.parseLiteralExpression = function () {
                return this.eatAnyToken();
            };

            ParserImpl.prototype.parseThisExpression = function () {
                var thisKeyword = this.eatKeyword(TypeScript.SyntaxKind.ThisKeyword);
                return thisKeyword;
            };

            ParserImpl.prototype.parseBlock = function (parseBlockEvenWithNoOpenBrace, checkForStrictMode) {
                var openBraceToken = this.eatToken(TypeScript.SyntaxKind.OpenBraceToken);

                var statements = TypeScript.Syntax.emptyList;

                if (parseBlockEvenWithNoOpenBrace || openBraceToken.width() > 0) {
                    var savedIsInStrictMode = this.isInStrictMode;

                    var processItems = checkForStrictMode ? ParserImpl.updateStrictModeState : null;
                    var result = this.parseSyntaxList(ListParsingState.Block_Statements, processItems);
                    statements = result.list;
                    openBraceToken = this.addSkippedTokensAfterToken(openBraceToken, result.skippedTokens);

                    this.setStrictMode(savedIsInStrictMode);
                }

                var closeBraceToken = this.eatToken(TypeScript.SyntaxKind.CloseBraceToken);

                return this.factory.block(openBraceToken, statements, closeBraceToken);
            };

            ParserImpl.prototype.parseCallSignature = function (requireCompleteTypeParameterList) {
                var typeParameterList = this.parseOptionalTypeParameterList(requireCompleteTypeParameterList);
                var parameterList = this.parseParameterList();
                var typeAnnotation = this.parseOptionalTypeAnnotation(false);

                return this.factory.callSignature(typeParameterList, parameterList, typeAnnotation);
            };

            ParserImpl.prototype.parseOptionalTypeParameterList = function (requireCompleteTypeParameterList) {
                if (this.currentToken().tokenKind !== TypeScript.SyntaxKind.LessThanToken) {
                    return null;
                }

                var rewindPoint = this.getRewindPoint();
                try  {
                    var lessThanToken = this.eatToken(TypeScript.SyntaxKind.LessThanToken);

                    var result = this.parseSeparatedSyntaxList(ListParsingState.TypeParameterList_TypeParameters);
                    var typeParameterList = result.list;
                    lessThanToken = this.addSkippedTokensAfterToken(lessThanToken, result.skippedTokens);

                    var greaterThanToken = this.eatToken(TypeScript.SyntaxKind.GreaterThanToken);

                    if (requireCompleteTypeParameterList && greaterThanToken.fullWidth() === 0) {
                        this.rewind(rewindPoint);
                        return null;
                    }

                    return this.factory.typeParameterList(lessThanToken, typeParameterList, greaterThanToken);
                } finally {
                    this.releaseRewindPoint(rewindPoint);
                }
            };

            ParserImpl.prototype.isTypeParameter = function () {
                return this.isIdentifier(this.currentToken());
            };

            ParserImpl.prototype.parseTypeParameter = function () {
                var identifier = this.eatIdentifierToken();
                var constraint = this.parseOptionalConstraint();

                return this.factory.typeParameter(identifier, constraint);
            };

            ParserImpl.prototype.parseOptionalConstraint = function () {
                if (this.currentToken().kind() !== TypeScript.SyntaxKind.ExtendsKeyword) {
                    return null;
                }

                var extendsKeyword = this.eatKeyword(TypeScript.SyntaxKind.ExtendsKeyword);
                var type = this.parseType();

                return this.factory.constraint(extendsKeyword, type);
            };

            ParserImpl.prototype.parseParameterList = function () {
                var openParenToken = this.eatToken(TypeScript.SyntaxKind.OpenParenToken);
                var parameters = TypeScript.Syntax.emptySeparatedList;

                if (openParenToken.width() > 0) {
                    var result = this.parseSeparatedSyntaxList(ListParsingState.ParameterList_Parameters);
                    parameters = result.list;
                    openParenToken = this.addSkippedTokensAfterToken(openParenToken, result.skippedTokens);
                }

                var closeParenToken = this.eatToken(TypeScript.SyntaxKind.CloseParenToken);
                return this.factory.parameterList(openParenToken, parameters, closeParenToken);
            };

            ParserImpl.prototype.isTypeAnnotation = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.ColonToken;
            };

            ParserImpl.prototype.parseOptionalTypeAnnotation = function (allowStringLiteral) {
                return this.isTypeAnnotation() ? this.parseTypeAnnotation(allowStringLiteral) : null;
            };

            ParserImpl.prototype.parseTypeAnnotation = function (allowStringLiteral) {
                var colonToken = this.eatToken(TypeScript.SyntaxKind.ColonToken);
                var type = allowStringLiteral && this.currentToken().tokenKind === TypeScript.SyntaxKind.StringLiteral ? this.eatToken(TypeScript.SyntaxKind.StringLiteral) : this.parseType();

                return this.factory.typeAnnotation(colonToken, type);
            };

            ParserImpl.prototype.isType = function () {
                return this.isPredefinedType() || this.isTypeLiteral() || this.isName();
            };

            ParserImpl.prototype.parseType = function () {
                var type = this.parseNonArrayType();

                while (this.currentToken().tokenKind === TypeScript.SyntaxKind.OpenBracketToken) {
                    var openBracketToken = this.eatToken(TypeScript.SyntaxKind.OpenBracketToken);
                    var closeBracketToken = this.eatToken(TypeScript.SyntaxKind.CloseBracketToken);

                    type = this.factory.arrayType(type, openBracketToken, closeBracketToken);
                }

                return type;
            };

            ParserImpl.prototype.parseNonArrayType = function () {
                if (this.isPredefinedType()) {
                    return this.parsePredefinedType();
                } else if (this.isTypeLiteral()) {
                    return this.parseTypeLiteral();
                } else {
                    return this.parseNameOrGenericType();
                }
            };

            ParserImpl.prototype.parseNameOrGenericType = function () {
                var name = this.parseName();
                var typeArgumentList = this.tryParseTypeArgumentList(false);

                return typeArgumentList === null ? name : this.factory.genericType(name, typeArgumentList);
            };

            ParserImpl.prototype.parseTypeLiteral = function () {
                if (this.isObjectType()) {
                    return this.parseObjectType();
                } else if (this.isFunctionType()) {
                    return this.parseFunctionType();
                } else if (this.isConstructorType()) {
                    return this.parseConstructorType();
                } else {
                    throw TypeScript.Errors.invalidOperation();
                }
            };

            ParserImpl.prototype.parseFunctionType = function () {
                var typeParameterList = this.parseOptionalTypeParameterList(false);
                var parameterList = this.parseParameterList();
                var equalsGreaterThanToken = this.eatToken(TypeScript.SyntaxKind.EqualsGreaterThanToken);
                var returnType = this.parseType();

                return this.factory.functionType(typeParameterList, parameterList, equalsGreaterThanToken, returnType);
            };

            ParserImpl.prototype.parseConstructorType = function () {
                var newKeyword = this.eatKeyword(TypeScript.SyntaxKind.NewKeyword);
                var parameterList = this.parseParameterList();
                var equalsGreaterThanToken = this.eatToken(TypeScript.SyntaxKind.EqualsGreaterThanToken);
                var type = this.parseType();

                return this.factory.constructorType(newKeyword, null, parameterList, equalsGreaterThanToken, type);
            };

            ParserImpl.prototype.isTypeLiteral = function () {
                return this.isObjectType() || this.isFunctionType() || this.isConstructorType();
            };

            ParserImpl.prototype.isObjectType = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.OpenBraceToken;
            };

            ParserImpl.prototype.isFunctionType = function () {
                var tokenKind = this.currentToken().tokenKind;
                return tokenKind === TypeScript.SyntaxKind.OpenParenToken || tokenKind === TypeScript.SyntaxKind.LessThanToken;
            };

            ParserImpl.prototype.isConstructorType = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.NewKeyword;
            };

            ParserImpl.prototype.parsePredefinedType = function () {
                return this.eatAnyToken();
            };

            ParserImpl.prototype.isPredefinedType = function () {
                switch (this.currentToken().tokenKind) {
                    case TypeScript.SyntaxKind.AnyKeyword:
                    case TypeScript.SyntaxKind.NumberKeyword:
                    case TypeScript.SyntaxKind.BooleanKeyword:
                    case TypeScript.SyntaxKind.BoolKeyword:
                    case TypeScript.SyntaxKind.StringKeyword:
                    case TypeScript.SyntaxKind.VoidKeyword:
                        return true;
                }

                return false;
            };

            ParserImpl.prototype.isParameter = function () {
                if (this.currentNode() !== null && this.currentNode().kind() === TypeScript.SyntaxKind.Parameter) {
                    return true;
                }

                var token = this.currentToken();
                if (token.tokenKind === TypeScript.SyntaxKind.DotDotDotToken) {
                    return true;
                }

                if (ParserImpl.isPublicOrPrivateKeyword(token)) {
                    return true;
                }

                return this.isIdentifier(token);
            };

            ParserImpl.prototype.parseParameter = function () {
                if (this.currentNode() !== null && this.currentNode().kind() === TypeScript.SyntaxKind.Parameter) {
                    return this.eatNode();
                }

                var dotDotDotToken = this.tryEatToken(TypeScript.SyntaxKind.DotDotDotToken);

                var publicOrPrivateToken = null;
                if (ParserImpl.isPublicOrPrivateKeyword(this.currentToken())) {
                    publicOrPrivateToken = this.eatAnyToken();
                }

                var identifier = this.eatIdentifierToken();
                var questionToken = this.tryEatToken(TypeScript.SyntaxKind.QuestionToken);
                var typeAnnotation = this.parseOptionalTypeAnnotation(true);

                var equalsValueClause = null;
                if (this.isEqualsValueClause(true)) {
                    equalsValueClause = this.parseEqualsValueClause(true);
                }

                return this.factory.parameter(dotDotDotToken, publicOrPrivateToken, identifier, questionToken, typeAnnotation, equalsValueClause);
            };

            ParserImpl.prototype.parseSyntaxList = function (currentListType, processItems) {
                if (typeof processItems === "undefined") { processItems = null; }
                var savedListParsingState = this.listParsingState;
                this.listParsingState |= currentListType;

                var result = this.parseSyntaxListWorker(currentListType, processItems);

                this.listParsingState = savedListParsingState;

                return result;
            };

            ParserImpl.prototype.parseSeparatedSyntaxList = function (currentListType) {
                var savedListParsingState = this.listParsingState;
                this.listParsingState |= currentListType;

                var result = this.parseSeparatedSyntaxListWorker(currentListType);

                this.listParsingState = savedListParsingState;

                return result;
            };

            ParserImpl.prototype.abortParsingListOrMoveToNextToken = function (currentListType, items, skippedTokens) {
                this.reportUnexpectedTokenDiagnostic(currentListType);

                for (var state = ListParsingState.LastListParsingState; state >= ListParsingState.FirstListParsingState; state >>= 1) {
                    if ((this.listParsingState & state) !== 0) {
                        if (this.isExpectedListTerminator(state) || this.isExpectedListItem(state, true)) {
                            return true;
                        }
                    }
                }

                var skippedToken = this.currentToken();

                this.moveToNextToken();

                this.addSkippedTokenToList(items, skippedTokens, skippedToken);

                return false;
            };

            ParserImpl.prototype.addSkippedTokenToList = function (items, skippedTokens, skippedToken) {
                for (var i = items.length - 1; i >= 0; i--) {
                    var item = items[i];
                    var lastToken = item.lastToken();
                    if (lastToken.fullWidth() > 0) {
                        items[i] = this.addSkippedTokenAfterNodeOrToken(item, skippedToken);
                        return;
                    }
                }

                skippedTokens.push(skippedToken);
            };

            ParserImpl.prototype.tryParseExpectedListItem = function (currentListType, inErrorRecovery, items, processItems) {
                if (this.isExpectedListItem(currentListType, inErrorRecovery)) {
                    var item = this.parseExpectedListItem(currentListType);

                    items.push(item);

                    if (processItems !== null) {
                        processItems(this, items);
                    }
                }
            };

            ParserImpl.prototype.listIsTerminated = function (currentListType) {
                return this.isExpectedListTerminator(currentListType) || this.currentToken().tokenKind === TypeScript.SyntaxKind.EndOfFileToken;
            };

            ParserImpl.prototype.getArray = function () {
                if (this.arrayPool.length > 0) {
                    return this.arrayPool.pop();
                }

                return [];
            };

            ParserImpl.prototype.returnZeroOrOneLengthArray = function (array) {
                if (array.length <= 1) {
                    this.returnArray(array);
                }
            };

            ParserImpl.prototype.returnArray = function (array) {
                array.length = 0;
                this.arrayPool.push(array);
            };

            ParserImpl.prototype.parseSyntaxListWorker = function (currentListType, processItems) {
                var items = this.getArray();
                var skippedTokens = this.getArray();

                while (true) {
                    var oldItemsCount = items.length;
                    this.tryParseExpectedListItem(currentListType, false, items, processItems);

                    var newItemsCount = items.length;
                    if (newItemsCount === oldItemsCount) {
                        if (this.listIsTerminated(currentListType)) {
                            break;
                        }

                        var abort = this.abortParsingListOrMoveToNextToken(currentListType, items, skippedTokens);
                        if (abort) {
                            break;
                        }
                    }
                }

                var result = TypeScript.Syntax.list(items);

                this.returnZeroOrOneLengthArray(items);

                return { skippedTokens: skippedTokens, list: result };
            };

            ParserImpl.prototype.parseSeparatedSyntaxListWorker = function (currentListType) {
                var items = this.getArray();
                var skippedTokens = this.getArray();
                TypeScript.Debug.assert(items.length === 0);
                TypeScript.Debug.assert(skippedTokens.length === 0);
                TypeScript.Debug.assert(skippedTokens !== items);

                var separatorKind = this.separatorKind(currentListType);
                var allowAutomaticSemicolonInsertion = separatorKind === TypeScript.SyntaxKind.SemicolonToken;

                var inErrorRecovery = false;
                var listWasTerminated = false;
                while (true) {
                    var oldItemsCount = items.length;

                    this.tryParseExpectedListItem(currentListType, inErrorRecovery, items, null);

                    var newItemsCount = items.length;
                    if (newItemsCount === oldItemsCount) {
                        if (this.listIsTerminated(currentListType)) {
                            listWasTerminated = true;
                            break;
                        }

                        var abort = this.abortParsingListOrMoveToNextToken(currentListType, items, skippedTokens);
                        if (abort) {
                            break;
                        } else {
                            inErrorRecovery = true;
                            continue;
                        }
                    }

                    inErrorRecovery = false;

                    var currentToken = this.currentToken();
                    if (currentToken.tokenKind === separatorKind || currentToken.tokenKind === TypeScript.SyntaxKind.CommaToken) {
                        items.push(this.eatAnyToken());
                        continue;
                    }

                    if (this.listIsTerminated(currentListType)) {
                        listWasTerminated = true;
                        break;
                    }

                    if (allowAutomaticSemicolonInsertion && this.canEatAutomaticSemicolon(false)) {
                        items.push(this.eatExplicitOrAutomaticSemicolon(false));

                        continue;
                    }

                    items.push(this.eatToken(separatorKind));

                    inErrorRecovery = true;
                }

                var result = TypeScript.Syntax.separatedList(items);

                this.returnZeroOrOneLengthArray(items);

                return { skippedTokens: skippedTokens, list: result };
            };

            ParserImpl.prototype.separatorKind = function (currentListType) {
                switch (currentListType) {
                    case ListParsingState.HeritageClause_TypeNameList:
                    case ListParsingState.ArgumentList_AssignmentExpressions:
                    case ListParsingState.EnumDeclaration_EnumElements:
                    case ListParsingState.VariableDeclaration_VariableDeclarators_AllowIn:
                    case ListParsingState.VariableDeclaration_VariableDeclarators_DisallowIn:
                    case ListParsingState.ObjectLiteralExpression_PropertyAssignments:
                    case ListParsingState.ParameterList_Parameters:
                    case ListParsingState.ArrayLiteralExpression_AssignmentExpressions:
                    case ListParsingState.TypeArgumentList_Types:
                    case ListParsingState.TypeParameterList_TypeParameters:
                        return TypeScript.SyntaxKind.CommaToken;

                    case ListParsingState.ObjectType_TypeMembers:
                        return TypeScript.SyntaxKind.SemicolonToken;

                    case ListParsingState.SourceUnit_ModuleElements:
                    case ListParsingState.ClassOrInterfaceDeclaration_HeritageClauses:
                    case ListParsingState.ClassDeclaration_ClassElements:
                    case ListParsingState.ModuleDeclaration_ModuleElements:
                    case ListParsingState.SwitchStatement_SwitchClauses:
                    case ListParsingState.SwitchClause_Statements:
                    case ListParsingState.Block_Statements:
                    default:
                        throw TypeScript.Errors.notYetImplemented();
                }
            };

            ParserImpl.prototype.reportUnexpectedTokenDiagnostic = function (listType) {
                var token = this.currentToken();

                var diagnostic = new TypeScript.SyntaxDiagnostic(this.fileName, this.currentTokenStart(), token.width(), TypeScript.DiagnosticCode.Unexpected_token__0_expected, [this.getExpectedListElementType(listType)]);
                this.addDiagnostic(diagnostic);
            };

            ParserImpl.prototype.addDiagnostic = function (diagnostic) {
                if (this.diagnostics.length > 0 && this.diagnostics[this.diagnostics.length - 1].start() === diagnostic.start()) {
                    return;
                }

                this.diagnostics.push(diagnostic);
            };

            ParserImpl.prototype.isExpectedListTerminator = function (currentListType) {
                switch (currentListType) {
                    case ListParsingState.SourceUnit_ModuleElements:
                        return this.isExpectedSourceUnit_ModuleElementsTerminator();

                    case ListParsingState.ClassOrInterfaceDeclaration_HeritageClauses:
                        return this.isExpectedClassOrInterfaceDeclaration_HeritageClausesTerminator();

                    case ListParsingState.ClassDeclaration_ClassElements:
                        return this.isExpectedClassDeclaration_ClassElementsTerminator();

                    case ListParsingState.ModuleDeclaration_ModuleElements:
                        return this.isExpectedModuleDeclaration_ModuleElementsTerminator();

                    case ListParsingState.SwitchStatement_SwitchClauses:
                        return this.isExpectedSwitchStatement_SwitchClausesTerminator();

                    case ListParsingState.SwitchClause_Statements:
                        return this.isExpectedSwitchClause_StatementsTerminator();

                    case ListParsingState.Block_Statements:
                        return this.isExpectedBlock_StatementsTerminator();

                    case ListParsingState.TryBlock_Statements:
                        return this.isExpectedTryBlock_StatementsTerminator();

                    case ListParsingState.CatchBlock_Statements:
                        return this.isExpectedCatchBlock_StatementsTerminator();

                    case ListParsingState.EnumDeclaration_EnumElements:
                        return this.isExpectedEnumDeclaration_EnumElementsTerminator();

                    case ListParsingState.ObjectType_TypeMembers:
                        return this.isExpectedObjectType_TypeMembersTerminator();

                    case ListParsingState.ArgumentList_AssignmentExpressions:
                        return this.isExpectedArgumentList_AssignmentExpressionsTerminator();

                    case ListParsingState.HeritageClause_TypeNameList:
                        return this.isExpectedHeritageClause_TypeNameListTerminator();

                    case ListParsingState.VariableDeclaration_VariableDeclarators_AllowIn:
                        return this.isExpectedVariableDeclaration_VariableDeclarators_AllowInTerminator();

                    case ListParsingState.VariableDeclaration_VariableDeclarators_DisallowIn:
                        return this.isExpectedVariableDeclaration_VariableDeclarators_DisallowInTerminator();

                    case ListParsingState.ObjectLiteralExpression_PropertyAssignments:
                        return this.isExpectedObjectLiteralExpression_PropertyAssignmentsTerminator();

                    case ListParsingState.ParameterList_Parameters:
                        return this.isExpectedParameterList_ParametersTerminator();

                    case ListParsingState.TypeArgumentList_Types:
                        return this.isExpectedTypeArgumentList_TypesTerminator();

                    case ListParsingState.TypeParameterList_TypeParameters:
                        return this.isExpectedTypeParameterList_TypeParametersTerminator();

                    case ListParsingState.ArrayLiteralExpression_AssignmentExpressions:
                        return this.isExpectedLiteralExpression_AssignmentExpressionsTerminator();

                    default:
                        throw TypeScript.Errors.invalidOperation();
                }
            };

            ParserImpl.prototype.isExpectedSourceUnit_ModuleElementsTerminator = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.EndOfFileToken;
            };

            ParserImpl.prototype.isExpectedEnumDeclaration_EnumElementsTerminator = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.CloseBraceToken;
            };

            ParserImpl.prototype.isExpectedModuleDeclaration_ModuleElementsTerminator = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.CloseBraceToken;
            };

            ParserImpl.prototype.isExpectedObjectType_TypeMembersTerminator = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.CloseBraceToken;
            };

            ParserImpl.prototype.isExpectedObjectLiteralExpression_PropertyAssignmentsTerminator = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.CloseBraceToken;
            };

            ParserImpl.prototype.isExpectedLiteralExpression_AssignmentExpressionsTerminator = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.CloseBracketToken;
            };

            ParserImpl.prototype.isExpectedTypeArgumentList_TypesTerminator = function () {
                var token = this.currentToken();
                if (token.tokenKind === TypeScript.SyntaxKind.GreaterThanToken) {
                    return true;
                }

                if (this.canFollowTypeArgumentListInExpression(token.tokenKind)) {
                    return true;
                }

                return false;
            };

            ParserImpl.prototype.isExpectedTypeParameterList_TypeParametersTerminator = function () {
                var token = this.currentToken();
                if (token.tokenKind === TypeScript.SyntaxKind.GreaterThanToken) {
                    return true;
                }

                if (token.tokenKind === TypeScript.SyntaxKind.OpenParenToken || token.tokenKind === TypeScript.SyntaxKind.OpenBraceToken || token.tokenKind === TypeScript.SyntaxKind.ExtendsKeyword || token.tokenKind === TypeScript.SyntaxKind.ImplementsKeyword) {
                    return true;
                }

                return false;
            };

            ParserImpl.prototype.isExpectedParameterList_ParametersTerminator = function () {
                var token = this.currentToken();
                if (token.tokenKind === TypeScript.SyntaxKind.CloseParenToken) {
                    return true;
                }

                if (token.tokenKind === TypeScript.SyntaxKind.OpenBraceToken) {
                    return true;
                }

                if (token.tokenKind === TypeScript.SyntaxKind.EqualsGreaterThanToken) {
                    return true;
                }

                return false;
            };

            ParserImpl.prototype.isExpectedVariableDeclaration_VariableDeclarators_DisallowInTerminator = function () {
                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.SemicolonToken || this.currentToken().tokenKind === TypeScript.SyntaxKind.CloseParenToken) {
                    return true;
                }

                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.InKeyword) {
                    return true;
                }

                return false;
            };

            ParserImpl.prototype.isExpectedVariableDeclaration_VariableDeclarators_AllowInTerminator = function () {
                if (this.previousToken().tokenKind === TypeScript.SyntaxKind.CommaToken) {
                    return false;
                }

                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.EqualsGreaterThanToken) {
                    return true;
                }

                return this.canEatExplicitOrAutomaticSemicolon(false);
            };

            ParserImpl.prototype.isExpectedClassOrInterfaceDeclaration_HeritageClausesTerminator = function () {
                var token0 = this.currentToken();
                if (token0.tokenKind === TypeScript.SyntaxKind.OpenBraceToken || token0.tokenKind === TypeScript.SyntaxKind.CloseBraceToken) {
                    return true;
                }

                return false;
            };

            ParserImpl.prototype.isExpectedHeritageClause_TypeNameListTerminator = function () {
                var token0 = this.currentToken();
                if (token0.tokenKind === TypeScript.SyntaxKind.ExtendsKeyword || token0.tokenKind === TypeScript.SyntaxKind.ImplementsKeyword) {
                    return true;
                }

                if (this.isExpectedClassOrInterfaceDeclaration_HeritageClausesTerminator()) {
                    return true;
                }

                return false;
            };

            ParserImpl.prototype.isExpectedArgumentList_AssignmentExpressionsTerminator = function () {
                var token0 = this.currentToken();
                return token0.tokenKind === TypeScript.SyntaxKind.CloseParenToken || token0.tokenKind === TypeScript.SyntaxKind.SemicolonToken;
            };

            ParserImpl.prototype.isExpectedClassDeclaration_ClassElementsTerminator = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.CloseBraceToken;
            };

            ParserImpl.prototype.isExpectedSwitchStatement_SwitchClausesTerminator = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.CloseBraceToken;
            };

            ParserImpl.prototype.isExpectedSwitchClause_StatementsTerminator = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.CloseBraceToken || this.isSwitchClause();
            };

            ParserImpl.prototype.isExpectedBlock_StatementsTerminator = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.CloseBraceToken;
            };

            ParserImpl.prototype.isExpectedTryBlock_StatementsTerminator = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.CatchKeyword || this.currentToken().tokenKind === TypeScript.SyntaxKind.FinallyKeyword;
            };

            ParserImpl.prototype.isExpectedCatchBlock_StatementsTerminator = function () {
                return this.currentToken().tokenKind === TypeScript.SyntaxKind.FinallyKeyword;
            };

            ParserImpl.prototype.isExpectedListItem = function (currentListType, inErrorRecovery) {
                switch (currentListType) {
                    case ListParsingState.SourceUnit_ModuleElements:
                        return this.isModuleElement(inErrorRecovery);

                    case ListParsingState.ClassOrInterfaceDeclaration_HeritageClauses:
                        return this.isHeritageClause();

                    case ListParsingState.ClassDeclaration_ClassElements:
                        return this.isClassElement(inErrorRecovery);

                    case ListParsingState.ModuleDeclaration_ModuleElements:
                        return this.isModuleElement(inErrorRecovery);

                    case ListParsingState.SwitchStatement_SwitchClauses:
                        return this.isSwitchClause();

                    case ListParsingState.SwitchClause_Statements:
                        return this.isStatement(inErrorRecovery);

                    case ListParsingState.Block_Statements:
                        return this.isStatement(inErrorRecovery);

                    case ListParsingState.TryBlock_Statements:
                    case ListParsingState.CatchBlock_Statements:
                        return false;

                    case ListParsingState.EnumDeclaration_EnumElements:
                        return this.isEnumElement(inErrorRecovery);

                    case ListParsingState.VariableDeclaration_VariableDeclarators_AllowIn:
                    case ListParsingState.VariableDeclaration_VariableDeclarators_DisallowIn:
                        return this.isVariableDeclarator();

                    case ListParsingState.ObjectType_TypeMembers:
                        return this.isTypeMember(inErrorRecovery);

                    case ListParsingState.ArgumentList_AssignmentExpressions:
                        return this.isExpectedArgumentList_AssignmentExpression();

                    case ListParsingState.HeritageClause_TypeNameList:
                        return this.isHeritageClauseTypeName();

                    case ListParsingState.ObjectLiteralExpression_PropertyAssignments:
                        return this.isPropertyAssignment(inErrorRecovery);

                    case ListParsingState.ParameterList_Parameters:
                        return this.isParameter();

                    case ListParsingState.TypeArgumentList_Types:
                        return this.isType();

                    case ListParsingState.TypeParameterList_TypeParameters:
                        return this.isTypeParameter();

                    case ListParsingState.ArrayLiteralExpression_AssignmentExpressions:
                        return this.isAssignmentOrOmittedExpression();

                    default:
                        throw TypeScript.Errors.invalidOperation();
                }
            };

            ParserImpl.prototype.isExpectedArgumentList_AssignmentExpression = function () {
                if (this.isExpression()) {
                    return true;
                }

                if (this.currentToken().tokenKind === TypeScript.SyntaxKind.CommaToken) {
                    return true;
                }

                return false;
            };

            ParserImpl.prototype.parseExpectedListItem = function (currentListType) {
                switch (currentListType) {
                    case ListParsingState.SourceUnit_ModuleElements:
                        return this.parseModuleElement();

                    case ListParsingState.ClassOrInterfaceDeclaration_HeritageClauses:
                        return this.parseHeritageClause();

                    case ListParsingState.ClassDeclaration_ClassElements:
                        return this.parseClassElement(false);

                    case ListParsingState.ModuleDeclaration_ModuleElements:
                        return this.parseModuleElement();

                    case ListParsingState.SwitchStatement_SwitchClauses:
                        return this.parseSwitchClause();

                    case ListParsingState.SwitchClause_Statements:
                        return this.parseStatement();

                    case ListParsingState.Block_Statements:
                        return this.parseStatement();

                    case ListParsingState.EnumDeclaration_EnumElements:
                        return this.parseEnumElement();

                    case ListParsingState.ObjectType_TypeMembers:
                        return this.parseTypeMember();

                    case ListParsingState.ArgumentList_AssignmentExpressions:
                        return this.parseAssignmentExpression(true);

                    case ListParsingState.HeritageClause_TypeNameList:
                        return this.parseNameOrGenericType();

                    case ListParsingState.VariableDeclaration_VariableDeclarators_AllowIn:
                        return this.parseVariableDeclarator(true, false);

                    case ListParsingState.VariableDeclaration_VariableDeclarators_DisallowIn:
                        return this.parseVariableDeclarator(false, false);

                    case ListParsingState.ObjectLiteralExpression_PropertyAssignments:
                        return this.parsePropertyAssignment();

                    case ListParsingState.ArrayLiteralExpression_AssignmentExpressions:
                        return this.parseAssignmentOrOmittedExpression();

                    case ListParsingState.ParameterList_Parameters:
                        return this.parseParameter();

                    case ListParsingState.TypeArgumentList_Types:
                        return this.parseType();

                    case ListParsingState.TypeParameterList_TypeParameters:
                        return this.parseTypeParameter();

                    default:
                        throw TypeScript.Errors.invalidOperation();
                }
            };

            ParserImpl.prototype.getExpectedListElementType = function (currentListType) {
                switch (currentListType) {
                    case ListParsingState.SourceUnit_ModuleElements:
                        return TypeScript.Strings.module__class__interface__enum__import_or_statement;

                    case ListParsingState.ClassOrInterfaceDeclaration_HeritageClauses:
                        return '{';

                    case ListParsingState.ClassDeclaration_ClassElements:
                        return TypeScript.Strings.constructor__function__accessor_or_variable;

                    case ListParsingState.ModuleDeclaration_ModuleElements:
                        return TypeScript.Strings.module__class__interface__enum__import_or_statement;

                    case ListParsingState.SwitchStatement_SwitchClauses:
                        return TypeScript.Strings.case_or_default_clause;

                    case ListParsingState.SwitchClause_Statements:
                        return TypeScript.Strings.statement;

                    case ListParsingState.Block_Statements:
                        return TypeScript.Strings.statement;

                    case ListParsingState.VariableDeclaration_VariableDeclarators_AllowIn:
                    case ListParsingState.VariableDeclaration_VariableDeclarators_DisallowIn:
                        return TypeScript.Strings.identifier;

                    case ListParsingState.EnumDeclaration_EnumElements:
                        return TypeScript.Strings.identifier;

                    case ListParsingState.ObjectType_TypeMembers:
                        return TypeScript.Strings.call__construct__index__property_or_function_signature;

                    case ListParsingState.ArgumentList_AssignmentExpressions:
                        return TypeScript.Strings.expression;

                    case ListParsingState.HeritageClause_TypeNameList:
                        return TypeScript.Strings.type_name;

                    case ListParsingState.ObjectLiteralExpression_PropertyAssignments:
                        return TypeScript.Strings.property_or_accessor;

                    case ListParsingState.ParameterList_Parameters:
                        return TypeScript.Strings.parameter;

                    case ListParsingState.TypeArgumentList_Types:
                        return TypeScript.Strings.type;

                    case ListParsingState.TypeParameterList_TypeParameters:
                        return TypeScript.Strings.type_parameter;

                    case ListParsingState.ArrayLiteralExpression_AssignmentExpressions:
                        return TypeScript.Strings.expression;

                    default:
                        throw TypeScript.Errors.invalidOperation();
                }
            };
            return ParserImpl;
        })();

        function parse(fileName, text, isDeclaration, languageVersion, options) {
            var source = new NormalParserSource(fileName, text, languageVersion);

            return new ParserImpl(fileName, text.lineMap(), source, options).parseSyntaxTree(isDeclaration);
        }
        Parser.parse = parse;

        function incrementalParse(oldSyntaxTree, textChangeRange, newText) {
            if (textChangeRange.isUnchanged()) {
                return oldSyntaxTree;
            }

            var source = new IncrementalParserSource(oldSyntaxTree, textChangeRange, newText);

            return new ParserImpl(oldSyntaxTree.fileName(), newText.lineMap(), source, oldSyntaxTree.parseOptions()).parseSyntaxTree(oldSyntaxTree.isDeclaration());
        }
        Parser.incrementalParse = incrementalParse;
    })(TypeScript.Parser || (TypeScript.Parser = {}));
    var Parser = TypeScript.Parser;
})(TypeScript || (TypeScript = {}));
