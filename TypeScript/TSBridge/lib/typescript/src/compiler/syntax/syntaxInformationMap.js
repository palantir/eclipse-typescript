var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var SyntaxInformationMap = (function (_super) {
        __extends(SyntaxInformationMap, _super);
        function SyntaxInformationMap(trackParents, trackPreviousToken) {
            _super.call(this);
            this.trackParents = trackParents;
            this.trackPreviousToken = trackPreviousToken;
            this.tokenToInformation = TypeScript.Collections.createHashTable(TypeScript.Collections.DefaultHashTableCapacity, TypeScript.Collections.identityHashCode);
            this.elementToPosition = TypeScript.Collections.createHashTable(TypeScript.Collections.DefaultHashTableCapacity, TypeScript.Collections.identityHashCode);
            this._previousToken = null;
            this._previousTokenInformation = null;
            this._currentPosition = 0;
            this._elementToParent = TypeScript.Collections.createHashTable(TypeScript.Collections.DefaultHashTableCapacity, TypeScript.Collections.identityHashCode);
            this._parentStack = [];
            this._parentStack.push(null);
        }
        SyntaxInformationMap.create = function (node, trackParents, trackPreviousToken) {
            var map = new SyntaxInformationMap(trackParents, trackPreviousToken);
            map.visitNode(node);
            return map;
        };

        SyntaxInformationMap.prototype.visitNode = function (node) {
            this.trackParents && this._elementToParent.add(node, TypeScript.ArrayUtilities.last(this._parentStack));
            this.elementToPosition.add(node, this._currentPosition);

            this.trackParents && this._parentStack.push(node);
            _super.prototype.visitNode.call(this, node);
            this.trackParents && this._parentStack.pop();
        };

        SyntaxInformationMap.prototype.visitToken = function (token) {
            this.trackParents && this._elementToParent.add(token, TypeScript.ArrayUtilities.last(this._parentStack));

            if (this.trackPreviousToken) {
                var tokenInformation = {
                    previousToken: this._previousToken,
                    nextToken: null
                };

                if (this._previousTokenInformation !== null) {
                    this._previousTokenInformation.nextToken = token;
                }

                this._previousToken = token;
                this._previousTokenInformation = tokenInformation;

                this.tokenToInformation.add(token, tokenInformation);
            }

            this.elementToPosition.add(token, this._currentPosition);
            this._currentPosition += token.fullWidth();
        };

        SyntaxInformationMap.prototype.parent = function (element) {
            return this._elementToParent.get(element);
        };

        SyntaxInformationMap.prototype.fullStart = function (element) {
            return this.elementToPosition.get(element);
        };

        SyntaxInformationMap.prototype.start = function (element) {
            return this.fullStart(element) + element.leadingTriviaWidth();
        };

        SyntaxInformationMap.prototype.end = function (element) {
            return this.start(element) + element.width();
        };

        SyntaxInformationMap.prototype.previousToken = function (token) {
            return this.tokenInformation(token).previousToken;
        };

        SyntaxInformationMap.prototype.tokenInformation = function (token) {
            return this.tokenToInformation.get(token);
        };

        SyntaxInformationMap.prototype.firstTokenInLineContainingToken = function (token) {
            var current = token;
            while (true) {
                var information = this.tokenInformation(current);
                if (this.isFirstTokenInLineWorker(information)) {
                    break;
                }

                current = information.previousToken;
            }

            return current;
        };

        SyntaxInformationMap.prototype.isFirstTokenInLine = function (token) {
            var information = this.tokenInformation(token);
            return this.isFirstTokenInLineWorker(information);
        };

        SyntaxInformationMap.prototype.isFirstTokenInLineWorker = function (information) {
            return information.previousToken === null || information.previousToken.hasTrailingNewLine();
        };
        return SyntaxInformationMap;
    })(TypeScript.SyntaxWalker);
    TypeScript.SyntaxInformationMap = SyntaxInformationMap;
})(TypeScript || (TypeScript = {}));
