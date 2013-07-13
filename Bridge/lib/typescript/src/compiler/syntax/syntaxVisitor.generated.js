var TypeScript;
(function (TypeScript) {
    var SyntaxVisitor = (function () {
        function SyntaxVisitor() {
        }
        SyntaxVisitor.prototype.defaultVisit = function (node) {
            return null;
        };

        SyntaxVisitor.prototype.visitToken = function (token) {
            return this.defaultVisit(token);
        };

        SyntaxVisitor.prototype.visitSourceUnit = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitExternalModuleReference = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitModuleNameModuleReference = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitImportDeclaration = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitExportAssignment = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitClassDeclaration = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitInterfaceDeclaration = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitHeritageClause = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitModuleDeclaration = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitFunctionDeclaration = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitVariableStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitVariableDeclaration = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitVariableDeclarator = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitEqualsValueClause = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitPrefixUnaryExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitArrayLiteralExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitOmittedExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitParenthesizedExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitSimpleArrowFunctionExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitParenthesizedArrowFunctionExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitQualifiedName = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitTypeArgumentList = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitConstructorType = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitFunctionType = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitObjectType = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitArrayType = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitGenericType = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitTypeAnnotation = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitBlock = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitParameter = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitMemberAccessExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitPostfixUnaryExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitElementAccessExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitInvocationExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitArgumentList = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitBinaryExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitConditionalExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitConstructSignature = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitMethodSignature = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitIndexSignature = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitPropertySignature = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitCallSignature = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitParameterList = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitTypeParameterList = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitTypeParameter = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitConstraint = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitElseClause = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitIfStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitExpressionStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitConstructorDeclaration = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitMemberFunctionDeclaration = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitGetMemberAccessorDeclaration = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitSetMemberAccessorDeclaration = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitMemberVariableDeclaration = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitThrowStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitReturnStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitObjectCreationExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitSwitchStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitCaseSwitchClause = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitDefaultSwitchClause = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitBreakStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitContinueStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitForStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitForInStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitWhileStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitWithStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitEnumDeclaration = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitEnumElement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitCastExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitObjectLiteralExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitSimplePropertyAssignment = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitFunctionPropertyAssignment = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitGetAccessorPropertyAssignment = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitSetAccessorPropertyAssignment = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitFunctionExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitEmptyStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitTryStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitCatchClause = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitFinallyClause = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitLabeledStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitDoStatement = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitTypeOfExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitDeleteExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitVoidExpression = function (node) {
            return this.defaultVisit(node);
        };

        SyntaxVisitor.prototype.visitDebuggerStatement = function (node) {
            return this.defaultVisit(node);
        };
        return SyntaxVisitor;
    })();
    TypeScript.SyntaxVisitor = SyntaxVisitor;
})(TypeScript || (TypeScript = {}));
