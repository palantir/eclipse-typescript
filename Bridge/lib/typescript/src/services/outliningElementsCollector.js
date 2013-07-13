var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Services;
(function (Services) {
    var OutliningElementsCollector = (function (_super) {
        __extends(OutliningElementsCollector, _super);
        function OutliningElementsCollector() {
            _super.call(this, OutliningElementsCollector.MaximumDepth);
            this.elements = [];
        }
        OutliningElementsCollector.prototype.visitClassDeclaration = function (node) {
            this.addOutlineRange(node, node.openBraceToken, node.closeBraceToken);
            _super.prototype.visitClassDeclaration.call(this, node);
        };

        OutliningElementsCollector.prototype.visitInterfaceDeclaration = function (node) {
            this.addOutlineRange(node, node.body, node.body);
            _super.prototype.visitInterfaceDeclaration.call(this, node);
        };

        OutliningElementsCollector.prototype.visitModuleDeclaration = function (node) {
            this.addOutlineRange(node, node.openBraceToken, node.closeBraceToken);
            _super.prototype.visitModuleDeclaration.call(this, node);
        };

        OutliningElementsCollector.prototype.visitEnumDeclaration = function (node) {
            this.addOutlineRange(node, node.openBraceToken, node.closeBraceToken);
            _super.prototype.visitEnumDeclaration.call(this, node);
        };

        OutliningElementsCollector.prototype.visitFunctionDeclaration = function (node) {
            this.addOutlineRange(node, node.block, node.block);
            _super.prototype.visitFunctionDeclaration.call(this, node);
        };

        OutliningElementsCollector.prototype.visitFunctionExpression = function (node) {
            this.addOutlineRange(node, node.block, node.block);
            _super.prototype.visitFunctionExpression.call(this, node);
        };

        OutliningElementsCollector.prototype.visitConstructorDeclaration = function (node) {
            this.addOutlineRange(node, node.block, node.block);
            _super.prototype.visitConstructorDeclaration.call(this, node);
        };

        OutliningElementsCollector.prototype.visitMemberFunctionDeclaration = function (node) {
            this.addOutlineRange(node, node.block, node.block);
            _super.prototype.visitMemberFunctionDeclaration.call(this, node);
        };

        OutliningElementsCollector.prototype.visitGetMemberAccessorDeclaration = function (node) {
            this.addOutlineRange(node, node.block, node.block);
            _super.prototype.visitGetMemberAccessorDeclaration.call(this, node);
        };

        OutliningElementsCollector.prototype.visitSetMemberAccessorDeclaration = function (node) {
            this.addOutlineRange(node, node.block, node.block);
            _super.prototype.visitSetMemberAccessorDeclaration.call(this, node);
        };

        OutliningElementsCollector.prototype.addOutlineRange = function (node, startElement, endElement) {
            if (startElement && endElement) {
                var start = this.position() + TypeScript.Syntax.childOffset(node, startElement);
                var end = this.position() + TypeScript.Syntax.childOffset(node, endElement) + endElement.leadingTriviaWidth() + endElement.width();

                this.elements.push(TypeScript.TextSpan.fromBounds(start, end));
            }
        };

        OutliningElementsCollector.collectElements = function (node) {
            var collector = new OutliningElementsCollector();
            node.accept(collector);
            return collector.elements;
        };
        OutliningElementsCollector.MaximumDepth = 10;
        return OutliningElementsCollector;
    })(TypeScript.DepthLimitedWalker);
    Services.OutliningElementsCollector = OutliningElementsCollector;
})(Services || (Services = {}));
