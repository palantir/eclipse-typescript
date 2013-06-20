var TypeScript;
(function (TypeScript) {
    var incrementalAst = true;
    var SyntaxPositionMap = (function () {
        function SyntaxPositionMap(node) {
            this.position = 0;
            this.elementToPosition = TypeScript.Collections.createHashTable(2048, TypeScript.Collections.identityHashCode);
            this.process(node);
        }
        SyntaxPositionMap.prototype.process = function (element) {
            if (element !== null) {
                if (element.isToken()) {
                    this.elementToPosition.add(element, this.position);
                    this.position += element.fullWidth();
                } else {
                    if (element.isNode() || (element.isList() && (element).childCount() > 0) || (element.isSeparatedList() && (element).childCount() > 0)) {
                        this.elementToPosition.add(element, this.position);
                    }

                    for (var i = 0, n = element.childCount(); i < n; i++) {
                        this.process(element.childAt(i));
                    }
                }
            }
        };

        SyntaxPositionMap.create = function (node) {
            var map = new SyntaxPositionMap(node);
            return map;
        };

        SyntaxPositionMap.prototype.fullStart = function (element) {
            return this.elementToPosition.get(element);
        };

        SyntaxPositionMap.prototype.start = function (element) {
            return this.fullStart(element) + element.leadingTriviaWidth();
        };

        SyntaxPositionMap.prototype.end = function (element) {
            return this.start(element) + element.width();
        };

        SyntaxPositionMap.prototype.fullEnd = function (element) {
            return this.fullStart(element) + element.fullWidth();
        };
        return SyntaxPositionMap;
    })();
    TypeScript.SyntaxPositionMap = SyntaxPositionMap;

    var SyntaxTreeToAstVisitor = (function () {
        function SyntaxTreeToAstVisitor(syntaxPositionMap, fileName, lineMap, compilationSettings) {
            this.syntaxPositionMap = syntaxPositionMap;
            this.fileName = fileName;
            this.lineMap = lineMap;
            this.compilationSettings = compilationSettings;
            this.position = 0;
            this.requiresExtendsBlock = false;
            this.previousTokenTrailingComments = null;
            this.isParsingAmbientModule = false;
            this.containingModuleHasExportAssignment = false;
            this.isParsingDeclareFile = TypeScript.isDTSFile(fileName);
        }
        SyntaxTreeToAstVisitor.visit = function (syntaxTree, fileName, compilationSettings) {
            var map = SyntaxTreeToAstVisitor.checkPositions ? SyntaxPositionMap.create(syntaxTree.sourceUnit()) : null;
            var visitor = new SyntaxTreeToAstVisitor(map, fileName, syntaxTree.lineMap(), compilationSettings);
            return syntaxTree.sourceUnit().accept(visitor);
        };

        SyntaxTreeToAstVisitor.prototype.assertElementAtPosition = function (element) {
            if (SyntaxTreeToAstVisitor.checkPositions) {
                TypeScript.Debug.assert(this.position === this.syntaxPositionMap.fullStart(element));
            }
        };

        SyntaxTreeToAstVisitor.prototype.movePast = function (element) {
            if (element !== null) {
                this.assertElementAtPosition(element);
                this.position += element.fullWidth();
            }
        };

        SyntaxTreeToAstVisitor.prototype.moveTo = function (element1, element2) {
            if (element2 !== null) {
                this.position += TypeScript.Syntax.childOffset(element1, element2);
            }
        };

        SyntaxTreeToAstVisitor.prototype.applyDelta = function (ast, delta) {
            var _this = this;
            if (delta === 0) {
                return;
            }

            var applyDelta = function (ast) {
                if (ast.minChar !== -1) {
                    ast.minChar += delta;
                }
                if (ast.limChar !== -1) {
                    ast.limChar += delta;
                }
            };

            var applyDeltaToComments = function (comments) {
                if (comments && comments.length > 0) {
                    for (var i = 0; i < comments.length; i++) {
                        var comment = comments[i];
                        applyDelta(comment);
                        comment.minLine = _this.lineMap.getLineNumberFromPosition(comment.minChar);
                        comment.limLine = _this.lineMap.getLineNumberFromPosition(comment.limChar);
                    }
                }
            };

            var pre = function (cur, parent, walker) {
                applyDelta(cur);
                applyDeltaToComments(cur.preComments);
                applyDeltaToComments(cur.postComments);

                return cur;
            };

            TypeScript.getAstWalkerFactory().walk(ast, pre);
        };

        SyntaxTreeToAstVisitor.prototype.setSpan = function (span, fullStart, element) {
            var desiredMinChar = fullStart + element.leadingTriviaWidth();
            var desiredLimChar = desiredMinChar + element.width();

            this.setSpanExplicit(span, desiredMinChar, desiredLimChar);

            span.trailingTriviaWidth = element.trailingTriviaWidth();
        };

        SyntaxTreeToAstVisitor.prototype.setSpanExplicit = function (span, start, end) {
            if (span.minChar !== -1) {
                TypeScript.Debug.assert(span.limChar !== -1);
                TypeScript.Debug.assert((span).nodeType !== undefined);

                var delta = start - span.minChar;
                this.applyDelta(span, delta);

                span.limChar = end;

                TypeScript.Debug.assert(span.minChar === start);
                TypeScript.Debug.assert(span.limChar === end);
            } else {
                TypeScript.Debug.assert(span.limChar === -1);

                span.minChar = start;
                span.limChar = end;
            }

            TypeScript.Debug.assert(!isNaN(span.minChar));
            TypeScript.Debug.assert(!isNaN(span.limChar));
            TypeScript.Debug.assert(span.minChar !== -1);
            TypeScript.Debug.assert(span.limChar !== -1);
        };

        SyntaxTreeToAstVisitor.prototype.identifierFromToken = function (token, isOptional, useValueText) {
            this.assertElementAtPosition(token);

            var result = null;
            if (token.fullWidth() === 0) {
                result = new TypeScript.MissingIdentifier();
            } else {
                result = new TypeScript.Identifier(token.text());
                result.text = useValueText ? token.valueText() : result.text;
                if (result.text == SyntaxTreeToAstVisitor.protoString) {
                    result.text = SyntaxTreeToAstVisitor.protoSubstitutionString;
                }
            }

            if (isOptional) {
                result.setFlags(result.getFlags() | TypeScript.ASTFlags.OptionalName);
            }

            var start = this.position + token.leadingTriviaWidth();
            this.setSpanExplicit(result, start, start + token.width());

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.getAST = function (element) {
            if (this.previousTokenTrailingComments !== null) {
                return null;
            }

            if (incrementalAst) {
                var result = (element)._ast;
                return result ? result : null;
            } else {
                return null;
            }
        };

        SyntaxTreeToAstVisitor.prototype.setAST = function (element, ast) {
            if (incrementalAst) {
                (element)._ast = ast;
            }
        };

        SyntaxTreeToAstVisitor.prototype.visitSyntaxList = function (list) {
            var start = this.position;
            var result = this.getAST(list);
            if (result) {
                this.movePast(list);
            } else {
                result = new TypeScript.ASTList();

                for (var i = 0, n = list.childCount(); i < n; i++) {
                    result.append(list.childAt(i).accept(this));
                }

                if (n > 0) {
                    this.setAST(list, result);
                }
            }

            this.setSpan(result, start, list);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitSeparatedSyntaxList = function (list) {
            var start = this.position;
            var result = this.getAST(list);
            if (result) {
                this.movePast(list);
            } else {
                result = new TypeScript.ASTList();

                for (var i = 0, n = list.childCount(); i < n; i++) {
                    if (i % 2 === 0) {
                        result.append(list.childAt(i).accept(this));
                        this.previousTokenTrailingComments = null;
                    } else {
                        var separatorToken = list.childAt(i);
                        this.previousTokenTrailingComments = this.convertTokenTrailingComments(separatorToken, this.position + separatorToken.leadingTriviaWidth() + separatorToken.width());
                        this.movePast(separatorToken);
                    }
                }

                result.postComments = this.previousTokenTrailingComments;
                this.previousTokenTrailingComments = null;

                if (n > 0) {
                    this.setAST(list, result);
                }
            }

            this.setSpan(result, start, list);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.createRef = function (text, minChar) {
            var id = new TypeScript.Identifier(text);
            id.minChar = minChar;
            return id;
        };

        SyntaxTreeToAstVisitor.prototype.convertComment = function (trivia, commentStartPosition, hasTrailingNewLine) {
            var comment = new TypeScript.Comment(trivia.fullText(), trivia.kind() === TypeScript.SyntaxKind.MultiLineCommentTrivia, hasTrailingNewLine);

            comment.minChar = commentStartPosition;
            comment.limChar = commentStartPosition + trivia.fullWidth();
            comment.minLine = this.lineMap.getLineNumberFromPosition(comment.minChar);
            comment.limLine = this.lineMap.getLineNumberFromPosition(comment.limChar);

            return comment;
        };

        SyntaxTreeToAstVisitor.prototype.convertComments = function (triviaList, commentStartPosition) {
            var result = [];

            for (var i = 0, n = triviaList.count(); i < n; i++) {
                var trivia = triviaList.syntaxTriviaAt(i);

                if (trivia.isComment()) {
                    var hasTrailingNewLine = ((i + 1) < n) && triviaList.syntaxTriviaAt(i + 1).isNewLine();
                    result.push(this.convertComment(trivia, commentStartPosition, hasTrailingNewLine));
                }

                commentStartPosition += trivia.fullWidth();
            }

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.mergeComments = function (comments1, comments2) {
            if (comments1 === null) {
                return comments2;
            }

            if (comments2 === null) {
                return comments1;
            }

            return comments1.concat(comments2);
        };

        SyntaxTreeToAstVisitor.prototype.convertTokenLeadingComments = function (token, commentStartPosition) {
            if (token === null) {
                return null;
            }

            var preComments = token.hasLeadingComment() ? this.convertComments(token.leadingTrivia(), commentStartPosition) : null;

            var previousTokenTrailingComments = this.previousTokenTrailingComments;
            this.previousTokenTrailingComments = null;

            return this.mergeComments(previousTokenTrailingComments, preComments);
        };

        SyntaxTreeToAstVisitor.prototype.convertTokenTrailingComments = function (token, commentStartPosition) {
            if (token === null || !token.hasTrailingComment() || token.hasTrailingNewLine()) {
                return null;
            }

            return this.convertComments(token.trailingTrivia(), commentStartPosition);
        };

        SyntaxTreeToAstVisitor.prototype.convertNodeLeadingComments = function (node, nodeStart) {
            return this.convertTokenLeadingComments(node.firstToken(), nodeStart);
        };

        SyntaxTreeToAstVisitor.prototype.convertNodeTrailingComments = function (node, nodeStart) {
            return this.convertTokenTrailingComments(node.lastToken(), nodeStart + node.leadingTriviaWidth() + node.width());
        };

        SyntaxTreeToAstVisitor.prototype.visitToken = function (token) {
            this.assertElementAtPosition(token);

            var result = this.getAST(token);
            var fullStart = this.position;

            if (result) {
                this.movePast(token);
            } else {
                if (token.kind() === TypeScript.SyntaxKind.ThisKeyword) {
                    result = new TypeScript.ThisExpression();
                } else if (token.kind() === TypeScript.SyntaxKind.SuperKeyword) {
                    result = new TypeScript.SuperExpression();
                } else if (token.kind() === TypeScript.SyntaxKind.TrueKeyword) {
                    result = new TypeScript.LiteralExpression(TypeScript.NodeType.TrueLiteral);
                } else if (token.kind() === TypeScript.SyntaxKind.FalseKeyword) {
                    result = new TypeScript.LiteralExpression(TypeScript.NodeType.FalseLiteral);
                } else if (token.kind() === TypeScript.SyntaxKind.NullKeyword) {
                    result = new TypeScript.LiteralExpression(TypeScript.NodeType.NullLiteral);
                } else if (token.kind() === TypeScript.SyntaxKind.StringLiteral) {
                    result = new TypeScript.StringLiteral(token.text(), token.valueText());
                } else if (token.kind() === TypeScript.SyntaxKind.RegularExpressionLiteral) {
                    result = new TypeScript.RegexLiteral(token.text());
                } else if (token.kind() === TypeScript.SyntaxKind.NumericLiteral) {
                    var preComments = this.convertTokenLeadingComments(token, fullStart);

                    var value = token.text().indexOf(".") > 0 ? parseFloat(token.text()) : parseInt(token.text());
                    result = new TypeScript.NumberLiteral(value, token.text());

                    result.preComments = preComments;
                } else {
                    result = this.identifierFromToken(token, false, true);
                }

                this.movePast(token);
            }

            var start = fullStart + token.leadingTriviaWidth();
            this.setAST(token, result);
            this.setSpanExplicit(result, start, start + token.width());
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.getLeadingComments = function (node) {
            var firstToken = node.firstToken();
            var result = [];

            if (firstToken.hasLeadingComment()) {
                var leadingTrivia = firstToken.leadingTrivia();

                for (var i = 0, n = leadingTrivia.count(); i < n; i++) {
                    var trivia = leadingTrivia.syntaxTriviaAt(i);

                    if (trivia.isComment()) {
                        result.push(trivia);
                    }
                }
            }

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.hasTopLevelImportOrExport = function (node) {
            var firstToken;

            for (var i = 0, n = node.moduleElements.childCount(); i < n; i++) {
                var moduleElement = node.moduleElements.childAt(i);

                firstToken = moduleElement.firstToken();
                if (firstToken !== null && firstToken.kind() === TypeScript.SyntaxKind.ExportKeyword) {
                    return true;
                }

                if (moduleElement.kind() === TypeScript.SyntaxKind.ImportDeclaration) {
                    var importDecl = moduleElement;
                    if (importDecl.moduleReference.kind() === TypeScript.SyntaxKind.ExternalModuleReference) {
                        return true;
                    }
                }
            }

            var leadingComments = this.getLeadingComments(node);
            for (var i = 0, n = leadingComments.length; i < n; i++) {
                var trivia = leadingComments[i];

                if (TypeScript.getImplicitImport(trivia.fullText())) {
                    return true;
                }
            }

            return false;
        };

        SyntaxTreeToAstVisitor.prototype.getAmdDependency = function (comment) {
            var amdDependencyRegEx = /^\/\/\/\s*<amd-dependency\s+path=('|")(.+?)\1/gim;
            var match = amdDependencyRegEx.exec(comment);
            return match ? match[2] : null;
        };

        SyntaxTreeToAstVisitor.prototype.visitSourceUnit = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var members;

            var bod = this.visitSyntaxList(node.moduleElements);

            var topLevelMod = null;
            if (this.hasTopLevelImportOrExport(node)) {
                var correctedFileName = TypeScript.switchToForwardSlashes(this.fileName);
                var id = new TypeScript.Identifier(correctedFileName);
                topLevelMod = new TypeScript.ModuleDeclaration(id, bod, null);
                this.setSpanExplicit(topLevelMod, start, this.position);

                topLevelMod.setModuleFlags(topLevelMod.getModuleFlags() | TypeScript.ModuleFlags.IsDynamic);
                topLevelMod.setModuleFlags(topLevelMod.getModuleFlags() | TypeScript.ModuleFlags.IsWholeFile);
                topLevelMod.setModuleFlags(topLevelMod.getModuleFlags() | TypeScript.ModuleFlags.Exported);

                if (this.isParsingDeclareFile) {
                    topLevelMod.setModuleFlags(topLevelMod.getModuleFlags() | TypeScript.ModuleFlags.Ambient);
                }

                topLevelMod.prettyName = TypeScript.getPrettyName(correctedFileName);

                var leadingComments = this.getLeadingComments(node);
                for (var i = 0, n = leadingComments.length; i < n; i++) {
                    var trivia = leadingComments[i];
                    var amdDependency = this.getAmdDependency(trivia.fullText());
                    if (amdDependency) {
                        topLevelMod.amdDependencies.push(amdDependency);
                    }
                }

                bod = new TypeScript.ASTList();
                this.setSpanExplicit(bod, start, this.position);
                bod.append(topLevelMod);
            }

            var result = new TypeScript.Script();
            this.setSpanExplicit(result, start, start + node.fullWidth());

            result.moduleElements = bod;
            result.topLevelMod = topLevelMod;
            result.isDeclareFile = this.isParsingDeclareFile;
            result.requiresExtendsBlock = this.requiresExtendsBlock;

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitExternalModuleReference = function (node) {
            this.assertElementAtPosition(node);
            this.moveTo(node, node.stringLiteral);
            var result = this.identifierFromToken(node.stringLiteral, false, false);
            this.movePast(node.stringLiteral);
            this.movePast(node.closeParenToken);

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitModuleNameModuleReference = function (node) {
            this.assertElementAtPosition(node);
            return node.moduleName.accept(this);
        };

        SyntaxTreeToAstVisitor.prototype.visitClassDeclaration = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);
                var postComments = this.convertNodeTrailingComments(node, start);
                this.moveTo(node, node.identifier);
                var name = this.identifierFromToken(node.identifier, false, true);
                this.movePast(node.identifier);

                var typeParameters = node.typeParameterList === null ? null : node.typeParameterList.accept(this);
                var extendsList = new TypeScript.ASTList();
                var implementsList = new TypeScript.ASTList();

                for (var i = 0, n = node.heritageClauses.childCount(); i < n; i++) {
                    var heritageClause = node.heritageClauses.childAt(i);
                    if (heritageClause.extendsOrImplementsKeyword.tokenKind === TypeScript.SyntaxKind.ExtendsKeyword) {
                        extendsList = heritageClause.accept(this);
                    } else {
                        TypeScript.Debug.assert(heritageClause.extendsOrImplementsKeyword.tokenKind === TypeScript.SyntaxKind.ImplementsKeyword);
                        implementsList = heritageClause.accept(this);
                    }
                }

                this.movePast(node.openBraceToken);
                var members = this.visitSyntaxList(node.classElements);
                var closeBracePosition = this.position;
                this.movePast(node.closeBraceToken);
                var closeBraceSpan = new TypeScript.ASTSpan();
                this.setSpan(closeBraceSpan, closeBracePosition, node.closeBraceToken);

                result = new TypeScript.ClassDeclaration(name, typeParameters, members, extendsList, implementsList);
                result.endingToken = closeBraceSpan;

                result.preComments = preComments;
                result.postComments = postComments;

                for (var i = 0; i < members.members.length; i++) {
                    var member = members.members[i];
                    if (member.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                        var funcDecl = member;

                        if (funcDecl.isConstructor) {
                            funcDecl.classDecl = result;

                            result.constructorDecl = funcDecl;
                        }
                    }
                }
            }

            this.requiresExtendsBlock = this.requiresExtendsBlock || result.extendsList.members.length > 0;

            if (!this.containingModuleHasExportAssignment && (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.ExportKeyword) || this.isParsingAmbientModule)) {
                result.setVarFlags(result.getVarFlags() | TypeScript.VariableFlags.Exported);
            } else {
                result.setVarFlags(result.getVarFlags() & ~TypeScript.VariableFlags.Exported);
            }

            if (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword) || this.isParsingAmbientModule || this.isParsingDeclareFile) {
                result.setVarFlags(result.getVarFlags() | TypeScript.VariableFlags.Ambient);
            } else {
                result.setVarFlags(result.getVarFlags() & ~TypeScript.VariableFlags.Ambient);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitInterfaceDeclaration = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);
                var postComments = this.convertNodeTrailingComments(node, start);
                this.moveTo(node, node.identifier);
                var name = this.identifierFromToken(node.identifier, false, true);
                this.movePast(node.identifier);
                var typeParameters = node.typeParameterList === null ? null : node.typeParameterList.accept(this);

                var extendsList = null;

                for (var i = 0, n = node.heritageClauses.childCount(); i < n; i++) {
                    var heritageClause = node.heritageClauses.childAt(i);
                    if (i === 0) {
                        extendsList = heritageClause.accept(this);
                    } else {
                        this.movePast(heritageClause);
                    }
                }

                this.movePast(node.body.openBraceToken);
                var members = this.visitSeparatedSyntaxList(node.body.typeMembers);

                this.movePast(node.body.closeBraceToken);

                result = new TypeScript.InterfaceDeclaration(name, typeParameters, members, extendsList, null);

                result.preComments = preComments;
                result.postComments = postComments;
            }

            if (!this.containingModuleHasExportAssignment && (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.ExportKeyword) || this.isParsingAmbientModule)) {
                result.setVarFlags(result.getVarFlags() | TypeScript.VariableFlags.Exported);
            } else {
                result.setVarFlags(result.getVarFlags() & ~TypeScript.VariableFlags.Exported);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitHeritageClause = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                result = new TypeScript.ASTList();

                this.movePast(node.extendsOrImplementsKeyword);
                for (var i = 0, n = node.typeNames.childCount(); i < n; i++) {
                    if (i % 2 === 1) {
                        this.movePast(node.typeNames.childAt(i));
                    } else {
                        var type = this.visitType(node.typeNames.childAt(i)).term;
                        result.append(type);
                    }
                }
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.getModuleNames = function (node) {
            var result = [];

            if (node.stringLiteral !== null) {
                result.push(this.identifierFromToken(node.stringLiteral, false, false));
                this.movePast(node.stringLiteral);
            } else {
                this.getModuleNamesHelper(node.moduleName, result);
            }

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.getModuleNamesHelper = function (name, result) {
            this.assertElementAtPosition(name);

            if (name.kind() === TypeScript.SyntaxKind.QualifiedName) {
                var qualifiedName = name;
                this.getModuleNamesHelper(qualifiedName.left, result);
                this.movePast(qualifiedName.dotToken);
                result.push(this.identifierFromToken(qualifiedName.right, false, false));
                this.movePast(qualifiedName.right);
            } else {
                result.push(this.identifierFromToken(name, false, false));
                this.movePast(name);
            }
        };

        SyntaxTreeToAstVisitor.prototype.visitModuleDeclaration = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);
                var postComments = this.convertNodeTrailingComments(node, start);

                this.moveTo(node, node.moduleKeyword);
                this.movePast(node.moduleKeyword);
                var names = this.getModuleNames(node);
                this.movePast(node.openBraceToken);

                var savedIsParsingAmbientModule = this.isParsingAmbientModule;
                if (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword) || this.isParsingDeclareFile) {
                    this.isParsingAmbientModule = true;
                }

                var savedContainingModuleHasExportAssignment = this.containingModuleHasExportAssignment;
                this.containingModuleHasExportAssignment = TypeScript.ArrayUtilities.any(node.moduleElements.toArray(), function (m) {
                    return m.kind() === TypeScript.SyntaxKind.ExportAssignment;
                });

                var members = this.visitSyntaxList(node.moduleElements);

                this.isParsingAmbientModule = savedIsParsingAmbientModule;
                this.containingModuleHasExportAssignment = savedContainingModuleHasExportAssignment;

                var closeBracePosition = this.position;
                this.movePast(node.closeBraceToken);
                var closeBraceSpan = new TypeScript.ASTSpan();
                this.setSpan(closeBraceSpan, closeBracePosition, node.closeBraceToken);

                for (var i = names.length - 1; i >= 0; i--) {
                    var innerName = names[i];

                    result = new TypeScript.ModuleDeclaration(innerName, members, closeBraceSpan);
                    this.setSpan(result, start, node);

                    result.preComments = preComments;
                    result.postComments = postComments;

                    preComments = null;
                    postComments = null;

                    if (i) {
                        result.setModuleFlags(result.getModuleFlags() | TypeScript.ModuleFlags.Exported);
                    } else if (!this.containingModuleHasExportAssignment && (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.ExportKeyword) || this.isParsingAmbientModule)) {
                        result.setModuleFlags(result.getModuleFlags() | TypeScript.ModuleFlags.Exported);
                    }

                    members = new TypeScript.ASTList();
                    members.append(result);
                }
            }

            if (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword) || this.isParsingAmbientModule || this.isParsingDeclareFile) {
                result.setModuleFlags(result.getModuleFlags() | TypeScript.ModuleFlags.Ambient);
            } else {
                result.setModuleFlags(result.getModuleFlags() & ~TypeScript.ModuleFlags.Ambient);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.hasDotDotDotParameter = function (parameters) {
            for (var i = 0, n = parameters.nonSeparatorCount(); i < n; i++) {
                if ((parameters.nonSeparatorAt(i)).dotDotDotToken) {
                    return true;
                }
            }

            return false;
        };

        SyntaxTreeToAstVisitor.prototype.visitFunctionDeclaration = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);
                var postComments = this.convertNodeTrailingComments(node, start);

                this.moveTo(node, node.identifier);
                var name = this.identifierFromToken(node.identifier, false, true);

                this.movePast(node.identifier);

                var typeParameters = node.callSignature.typeParameterList === null ? null : node.callSignature.typeParameterList.accept(this);
                var parameters = node.callSignature.parameterList.accept(this);

                var returnType = node.callSignature.typeAnnotation ? node.callSignature.typeAnnotation.accept(this) : null;

                var block = node.block ? node.block.accept(this) : null;

                this.movePast(node.semicolonToken);

                result = new TypeScript.FunctionDeclaration(name, block, false, typeParameters, parameters, TypeScript.NodeType.FunctionDeclaration);

                result.preComments = preComments;
                result.postComments = postComments;
                result.variableArgList = this.hasDotDotDotParameter(node.callSignature.parameterList.parameters);
                result.returnTypeAnnotation = returnType;

                if (node.semicolonToken) {
                    result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Signature);
                }
            }

            if (!this.containingModuleHasExportAssignment && (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.ExportKeyword) || this.isParsingAmbientModule)) {
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Exported);
            } else {
                result.setFunctionFlags(result.getFunctionFlags() & ~TypeScript.FunctionFlags.Exported);
            }

            if (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword) || this.isParsingAmbientModule || this.isParsingDeclareFile) {
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Ambient);
            } else {
                result.setFunctionFlags(result.getFunctionFlags() & ~TypeScript.FunctionFlags.Ambient);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitEnumDeclaration = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;

            var preComments = this.convertNodeLeadingComments(node, start);
            var postComments = this.convertNodeTrailingComments(node, start);

            this.moveTo(node, node.identifier);
            var name = this.identifierFromToken(node.identifier, false, true);
            this.movePast(node.identifier);

            this.movePast(node.openBraceToken);
            var members = new TypeScript.ASTList();

            var lastValue = null;
            var memberNames = [];
            var memberName;

            for (var i = 0, n = node.enumElements.childCount(); i < n; i++) {
                if (i % 2 === 1) {
                    this.movePast(node.enumElements.childAt(i));
                } else {
                    var enumElement = node.enumElements.childAt(i);

                    var memberValue = null;

                    memberName = this.identifierFromToken(enumElement.propertyName, false, true);
                    this.movePast(enumElement.propertyName);

                    if (enumElement.equalsValueClause !== null) {
                        memberValue = enumElement.equalsValueClause.accept(this);
                        lastValue = null;
                    }

                    var memberStart = this.position;

                    if (memberValue === null) {
                        if (lastValue === null) {
                            memberValue = new TypeScript.NumberLiteral(0, "0");
                            lastValue = memberValue;
                        } else {
                            var nextValue = lastValue.value + 1;
                            memberValue = new TypeScript.NumberLiteral(nextValue, nextValue.toString());
                            lastValue = memberValue;
                        }
                    }

                    var declarator = new TypeScript.VariableDeclarator(memberName);
                    declarator.init = memberValue;
                    declarator.isImplicitlyInitialized = enumElement.equalsValueClause === null;

                    declarator.typeExpr = new TypeScript.TypeReference(this.createRef(name.actualText, -1), 0);
                    declarator.setVarFlags(declarator.getVarFlags() | TypeScript.VariableFlags.Property);
                    this.setSpanExplicit(declarator, memberStart, this.position);

                    if (memberValue.nodeType === TypeScript.NodeType.NumericLiteral) {
                        declarator.setVarFlags(declarator.getVarFlags() | TypeScript.VariableFlags.Constant);
                    } else if (memberValue.nodeType === TypeScript.NodeType.LeftShiftExpression) {
                        var binop = memberValue;
                        if (binop.operand1.nodeType === TypeScript.NodeType.NumericLiteral && binop.operand2.nodeType === TypeScript.NodeType.NumericLiteral) {
                            declarator.setVarFlags(declarator.getVarFlags() | TypeScript.VariableFlags.Constant);
                        }
                    } else if (memberValue.nodeType === TypeScript.NodeType.Name) {
                        var nameNode = memberValue;
                        for (var j = 0; j < memberNames.length; j++) {
                            memberName = memberNames[j];
                            if (memberName.text === nameNode.text) {
                                declarator.setVarFlags(declarator.getVarFlags() | TypeScript.VariableFlags.Constant);
                                break;
                            }
                        }
                    }

                    var declarators = new TypeScript.ASTList();
                    declarators.append(declarator);
                    var declaration = new TypeScript.VariableDeclaration(declarators);
                    this.setSpanExplicit(declaration, memberStart, this.position);

                    var statement = new TypeScript.VariableStatement(declaration);
                    statement.setFlags(TypeScript.ASTFlags.EnumElement);
                    this.setSpanExplicit(statement, memberStart, this.position);

                    members.append(statement);
                    memberNames.push(memberName);

                    declarator.setVarFlags(declarator.getVarFlags() | TypeScript.VariableFlags.Exported);
                }
            }

            var closeBracePosition = this.position;
            this.movePast(node.closeBraceToken);
            var closeBraceSpan = new TypeScript.ASTSpan();
            this.setSpan(closeBraceSpan, closeBracePosition, node.closeBraceToken);

            var modDecl = new TypeScript.ModuleDeclaration(name, members, closeBraceSpan);
            this.setSpan(modDecl, start, node);

            modDecl.preComments = preComments;
            modDecl.postComments = postComments;
            modDecl.setModuleFlags(modDecl.getModuleFlags() | TypeScript.ModuleFlags.IsEnum);

            if (!this.containingModuleHasExportAssignment && (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.ExportKeyword) || this.isParsingAmbientModule)) {
                modDecl.setModuleFlags(modDecl.getModuleFlags() | TypeScript.ModuleFlags.Exported);
            }

            return modDecl;
        };

        SyntaxTreeToAstVisitor.prototype.visitEnumElement = function (node) {
            throw TypeScript.Errors.invalidOperation();
        };

        SyntaxTreeToAstVisitor.prototype.visitImportDeclaration = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);
                var postComments = this.convertNodeTrailingComments(node, start);

                this.moveTo(node, node.identifier);
                var name = this.identifierFromToken(node.identifier, false, true);
                this.movePast(node.identifier);
                this.movePast(node.equalsToken);
                var alias = node.moduleReference.accept(this);
                this.movePast(node.semicolonToken);

                result = new TypeScript.ImportDeclaration(name, alias);

                result.preComments = preComments;
                result.postComments = postComments;
                result.isDynamicImport = node.moduleReference.kind() === TypeScript.SyntaxKind.ExternalModuleReference;
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitExportAssignment = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.moveTo(node, node.identifier);
                var name = this.identifierFromToken(node.identifier, false, true);
                this.movePast(node.identifier);
                this.movePast(node.semicolonToken);

                result = new TypeScript.ExportAssignment(name);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitVariableStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;

            var preComments = null;
            if (node.modifiers.childCount() > 0) {
                preComments = this.convertTokenLeadingComments(node.modifiers.firstToken(), start);
            }

            this.moveTo(node, node.variableDeclaration);

            var declaration = node.variableDeclaration.accept(this);
            this.movePast(node.semicolonToken);

            for (var i = 0, n = declaration.declarators.members.length; i < n; i++) {
                var varDecl = declaration.declarators.members[i];

                if (i === 0) {
                    varDecl.preComments = this.mergeComments(preComments, varDecl.preComments);
                }

                if (!this.containingModuleHasExportAssignment && (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.ExportKeyword) || this.isParsingAmbientModule)) {
                    varDecl.setVarFlags(varDecl.getVarFlags() | TypeScript.VariableFlags.Exported);
                } else {
                    varDecl.setVarFlags(varDecl.getVarFlags() & ~TypeScript.VariableFlags.Exported);
                }

                if (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.DeclareKeyword) || this.isParsingAmbientModule || this.isParsingDeclareFile) {
                    varDecl.setVarFlags(varDecl.getVarFlags() | TypeScript.VariableFlags.Ambient);
                } else {
                    varDecl.setVarFlags(varDecl.getVarFlags() & ~TypeScript.VariableFlags.Ambient);
                }
            }

            var result = new TypeScript.VariableStatement(declaration);

            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitVariableDeclaration = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;

            var preComments = this.convertNodeLeadingComments(node, start);
            var postComments = this.convertNodeTrailingComments(node, start);

            this.moveTo(node, node.variableDeclarators);
            var variableDecls = this.visitSeparatedSyntaxList(node.variableDeclarators);

            for (var i = 0; i < variableDecls.members.length; i++) {
                if (i === 0) {
                    variableDecls.members[i].preComments = preComments;
                    variableDecls.members[i].postComments = postComments;
                }
            }

            var result = new TypeScript.VariableDeclaration(variableDecls);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitVariableDeclarator = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var name = this.identifierFromToken(node.identifier, false, true);
            this.movePast(node.identifier);
            var typeExpr = node.typeAnnotation ? node.typeAnnotation.accept(this) : null;
            var init = node.equalsValueClause ? node.equalsValueClause.accept(this) : null;

            var result = new TypeScript.VariableDeclarator(name);
            this.setSpan(result, start, node);

            result.typeExpr = typeExpr;
            result.init = init;
            if (init && init.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                var funcDecl = init;
                funcDecl.hint = name.actualText;
            }

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitEqualsValueClause = function (node) {
            this.assertElementAtPosition(node);

            this.previousTokenTrailingComments = this.convertTokenTrailingComments(node.equalsToken, this.position + node.equalsToken.leadingTriviaWidth() + node.equalsToken.width());

            this.movePast(node.equalsToken);
            var result = node.value.accept(this);

            this.previousTokenTrailingComments = null;
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.getUnaryExpressionNodeType = function (kind) {
            switch (kind) {
                case TypeScript.SyntaxKind.PlusExpression:
                    return TypeScript.NodeType.PlusExpression;
                case TypeScript.SyntaxKind.NegateExpression:
                    return TypeScript.NodeType.NegateExpression;
                case TypeScript.SyntaxKind.BitwiseNotExpression:
                    return TypeScript.NodeType.BitwiseNotExpression;
                case TypeScript.SyntaxKind.LogicalNotExpression:
                    return TypeScript.NodeType.LogicalNotExpression;
                case TypeScript.SyntaxKind.PreIncrementExpression:
                    return TypeScript.NodeType.PreIncrementExpression;
                case TypeScript.SyntaxKind.PreDecrementExpression:
                    return TypeScript.NodeType.PreDecrementExpression;
                default:
                    throw TypeScript.Errors.invalidOperation();
            }
        };

        SyntaxTreeToAstVisitor.prototype.visitPrefixUnaryExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.operatorToken);
                var operand = node.operand.accept(this);

                result = new TypeScript.UnaryExpression(this.getUnaryExpressionNodeType(node.kind()), operand);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.isOnSingleLine = function (start, end) {
            return this.lineMap.getLineNumberFromPosition(start) === this.lineMap.getLineNumberFromPosition(end);
        };

        SyntaxTreeToAstVisitor.prototype.visitArrayLiteralExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var openStart = this.position + node.openBracketToken.leadingTriviaWidth();
                this.movePast(node.openBracketToken);

                var expressions = this.visitSeparatedSyntaxList(node.expressions);

                var closeStart = this.position + node.closeBracketToken.leadingTriviaWidth();
                this.movePast(node.closeBracketToken);

                TypeScript.Debug.assert(expressions !== null);
                result = new TypeScript.UnaryExpression(TypeScript.NodeType.ArrayLiteralExpression, expressions);

                if (this.isOnSingleLine(openStart, closeStart)) {
                    result.setFlags(result.getFlags() | TypeScript.ASTFlags.SingleLine);
                }
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitOmittedExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                result = new TypeScript.OmittedExpression();
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitParenthesizedExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.openParenToken);
                var expr = node.expression.accept(this);
                this.movePast(node.closeParenToken);

                result = new TypeScript.ParenthesizedExpression(expr);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.getArrowFunctionStatements = function (body) {
            if (body.kind() === TypeScript.SyntaxKind.Block) {
                return body.accept(this);
            } else {
                var statements = new TypeScript.ASTList();
                var expression = body.accept(this);
                var returnStatement = new TypeScript.ReturnStatement(expression);

                returnStatement.preComments = expression.preComments;
                expression.preComments = null;

                statements.append(returnStatement);
                var block = new TypeScript.Block(statements);
                block.closeBraceSpan = statements.members[0];
                return block;
            }
        };

        SyntaxTreeToAstVisitor.prototype.visitSimpleArrowFunctionExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var identifier = this.identifierFromToken(node.identifier, false, true);
                this.movePast(node.identifier);
                this.movePast(node.equalsGreaterThanToken);

                var parameters = new TypeScript.ASTList();

                var parameter = new TypeScript.Parameter(identifier);
                this.setSpanExplicit(parameter, identifier.minChar, identifier.limChar);

                parameters.append(parameter);

                var statements = this.getArrowFunctionStatements(node.body);

                result = new TypeScript.FunctionDeclaration(null, statements, false, null, parameters, TypeScript.NodeType.FunctionDeclaration);

                result.returnTypeAnnotation = null;
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.IsFunctionExpression);
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.IsFatArrowFunction);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitParenthesizedArrowFunctionExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);

                var typeParameters = node.callSignature.typeParameterList === null ? null : node.callSignature.typeParameterList.accept(this);
                var parameters = node.callSignature.parameterList.accept(this);
                var returnType = node.callSignature.typeAnnotation ? node.callSignature.typeAnnotation.accept(this) : null;
                this.movePast(node.equalsGreaterThanToken);

                var block = this.getArrowFunctionStatements(node.body);

                result = new TypeScript.FunctionDeclaration(null, block, false, typeParameters, parameters, TypeScript.NodeType.FunctionDeclaration);

                result.preComments = preComments;
                result.returnTypeAnnotation = returnType;
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.IsFunctionExpression);
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.IsFatArrowFunction);
                result.variableArgList = this.hasDotDotDotParameter(node.callSignature.parameterList.parameters);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitType = function (type) {
            this.assertElementAtPosition(type);

            var result;
            if (type.isToken()) {
                var start = this.position;
                result = new TypeScript.TypeReference(type.accept(this), 0);
                this.setSpan(result, start, type);
            } else {
                result = type.accept(this);
            }

            TypeScript.Debug.assert(result.nodeType === TypeScript.NodeType.TypeRef);

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitQualifiedName = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var left = this.visitType(node.left).term;
                this.movePast(node.dotToken);
                var right = this.identifierFromToken(node.right, false, true);
                this.movePast(node.right);

                var term = new TypeScript.BinaryExpression(TypeScript.NodeType.MemberAccessExpression, left, right);
                this.setSpan(term, start, node);

                result = new TypeScript.TypeReference(term, 0);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitTypeArgumentList = function (node) {
            this.assertElementAtPosition(node);

            var result = new TypeScript.ASTList();

            this.movePast(node.lessThanToken);

            var start = this.position;

            for (var i = 0, n = node.typeArguments.childCount(); i < n; i++) {
                if (i % 2 === 1) {
                    this.movePast(node.typeArguments.childAt(i));
                } else {
                    result.append(this.visitType(node.typeArguments.childAt(i)));
                }
            }
            this.movePast(node.greaterThanToken);

            this.setSpan(result, start, node.typeArguments);

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitConstructorType = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.newKeyword);
                var typeParameters = node.typeParameterList === null ? null : node.typeParameterList.accept(this);
                var parameters = node.parameterList.accept(this);
                this.movePast(node.equalsGreaterThanToken);
                var returnType = node.type ? this.visitType(node.type) : null;

                var funcDecl = new TypeScript.FunctionDeclaration(null, null, false, typeParameters, parameters, TypeScript.NodeType.FunctionDeclaration);
                this.setSpan(funcDecl, start, node);

                funcDecl.returnTypeAnnotation = returnType;
                funcDecl.setFunctionFlags(funcDecl.getFunctionFlags() | TypeScript.FunctionFlags.Signature);
                funcDecl.variableArgList = this.hasDotDotDotParameter(node.parameterList.parameters);

                funcDecl.setFunctionFlags(funcDecl.getFunctionFlags() | TypeScript.FunctionFlags.ConstructMember);
                funcDecl.setFlags(funcDecl.getFlags() | TypeScript.ASTFlags.TypeReference);
                funcDecl.hint = "_construct";
                funcDecl.classDecl = null;

                result = new TypeScript.TypeReference(funcDecl, 0);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitFunctionType = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var typeParameters = node.typeParameterList === null ? null : node.typeParameterList.accept(this);
                var parameters = node.parameterList.accept(this);
                this.movePast(node.equalsGreaterThanToken);
                var returnType = node.type ? this.visitType(node.type) : null;

                var funcDecl = new TypeScript.FunctionDeclaration(null, null, false, typeParameters, parameters, TypeScript.NodeType.FunctionDeclaration);
                this.setSpan(funcDecl, start, node);

                funcDecl.returnTypeAnnotation = returnType;

                funcDecl.setFlags(funcDecl.getFunctionFlags() | TypeScript.FunctionFlags.Signature);
                funcDecl.setFlags(funcDecl.getFlags() | TypeScript.ASTFlags.TypeReference);
                funcDecl.variableArgList = this.hasDotDotDotParameter(node.parameterList.parameters);

                result = new TypeScript.TypeReference(funcDecl, 0);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitObjectType = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.openBraceToken);
                var typeMembers = this.visitSeparatedSyntaxList(node.typeMembers);
                this.movePast(node.closeBraceToken);

                var interfaceDecl = new TypeScript.InterfaceDeclaration(new TypeScript.Identifier("__anonymous"), null, typeMembers, null, null);
                this.setSpan(interfaceDecl, start, node);

                interfaceDecl.setFlags(interfaceDecl.getFlags() | TypeScript.ASTFlags.TypeReference);

                result = new TypeScript.TypeReference(interfaceDecl, 0);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitArrayType = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var underlying = this.visitType(node.type);
                this.movePast(node.openBracketToken);
                this.movePast(node.closeBracketToken);

                if (underlying.nodeType === TypeScript.NodeType.TypeRef) {
                    result = underlying;
                    result.arrayCount++;
                } else {
                    result = new TypeScript.TypeReference(underlying, 1);
                }

                result.setFlags(result.getFlags() | TypeScript.ASTFlags.TypeReference);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitGenericType = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var underlying = this.visitType(node.name).term;
                var typeArguments = node.typeArgumentList.accept(this);

                var genericType = new TypeScript.GenericType(underlying, typeArguments);
                this.setSpan(genericType, start, node);

                genericType.setFlags(genericType.getFlags() | TypeScript.ASTFlags.TypeReference);

                result = new TypeScript.TypeReference(genericType, 0);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitTypeAnnotation = function (node) {
            this.assertElementAtPosition(node);

            this.movePast(node.colonToken);
            return this.visitType(node.type);
        };

        SyntaxTreeToAstVisitor.prototype.visitBlock = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.openBraceToken);
                var statements = this.visitSyntaxList(node.statements);
                var closeBracePosition = this.position;
                this.movePast(node.closeBraceToken);
                var closeBraceSpan = new TypeScript.ASTSpan();
                this.setSpan(closeBraceSpan, closeBracePosition, node.closeBraceToken);

                result = new TypeScript.Block(statements);
                result.closeBraceSpan = closeBraceSpan;
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitParameter = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);
                var postComments = this.convertNodeTrailingComments(node, start);

                this.moveTo(node, node.identifier);
                var identifier = this.identifierFromToken(node.identifier, !!node.questionToken, true);
                this.movePast(node.identifier);
                this.movePast(node.questionToken);
                var typeExpr = node.typeAnnotation ? node.typeAnnotation.accept(this) : null;
                var init = node.equalsValueClause ? node.equalsValueClause.accept(this) : null;

                result = new TypeScript.Parameter(identifier);

                result.preComments = preComments;
                result.postComments = postComments;
                result.isOptional = !!node.questionToken;
                result.init = init;
                result.typeExpr = typeExpr;

                if (node.publicOrPrivateKeyword) {
                    result.setVarFlags(result.getVarFlags() | TypeScript.VariableFlags.Property);

                    if (node.publicOrPrivateKeyword.kind() === TypeScript.SyntaxKind.PublicKeyword) {
                        result.setVarFlags(result.getVarFlags() | TypeScript.VariableFlags.Public);
                    } else {
                        result.setVarFlags(result.getVarFlags() | TypeScript.VariableFlags.Private);
                    }
                }

                if (node.equalsValueClause || node.dotDotDotToken) {
                    result.setFlags(result.getFlags() | TypeScript.ASTFlags.OptionalName);
                }
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitMemberAccessExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var expression = node.expression.accept(this);
                this.movePast(node.dotToken);
                var name = this.identifierFromToken(node.name, false, true);
                this.movePast(node.name);

                result = new TypeScript.BinaryExpression(TypeScript.NodeType.MemberAccessExpression, expression, name);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitPostfixUnaryExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var operand = node.operand.accept(this);
                this.movePast(node.operatorToken);

                result = new TypeScript.UnaryExpression(node.kind() === TypeScript.SyntaxKind.PostIncrementExpression ? TypeScript.NodeType.PostIncrementExpression : TypeScript.NodeType.PostDecrementExpression, operand);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitElementAccessExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var expression = node.expression.accept(this);
                this.movePast(node.openBracketToken);
                var argumentExpression = node.argumentExpression.accept(this);
                this.movePast(node.closeBracketToken);

                result = new TypeScript.BinaryExpression(TypeScript.NodeType.ElementAccessExpression, expression, argumentExpression);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.convertArgumentListArguments = function (node) {
            if (node === null) {
                return null;
            }

            var start = this.position;

            this.movePast(node.openParenToken);

            var result = this.visitSeparatedSyntaxList(node.arguments);

            if (node.arguments.fullWidth() === 0 && node.closeParenToken.fullWidth() === 0) {
                var openParenTokenEnd = start + node.openParenToken.leadingTriviaWidth() + node.openParenToken.width();
                this.setSpanExplicit(result, openParenTokenEnd, openParenTokenEnd + node.openParenToken.trailingTriviaWidth());
            }

            this.movePast(node.closeParenToken);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitInvocationExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var expression = node.expression.accept(this);
                var typeArguments = node.argumentList.typeArgumentList !== null ? node.argumentList.typeArgumentList.accept(this) : null;
                var argumentList = this.convertArgumentListArguments(node.argumentList);

                result = new TypeScript.CallExpression(TypeScript.NodeType.InvocationExpression, expression, typeArguments, argumentList);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitArgumentList = function (node) {
            throw TypeScript.Errors.invalidOperation();
        };

        SyntaxTreeToAstVisitor.prototype.getBinaryExpressionNodeType = function (node) {
            switch (node.kind()) {
                case TypeScript.SyntaxKind.CommaExpression:
                    return TypeScript.NodeType.CommaExpression;
                case TypeScript.SyntaxKind.AssignmentExpression:
                    return TypeScript.NodeType.AssignmentExpression;
                case TypeScript.SyntaxKind.AddAssignmentExpression:
                    return TypeScript.NodeType.AddAssignmentExpression;
                case TypeScript.SyntaxKind.SubtractAssignmentExpression:
                    return TypeScript.NodeType.SubtractAssignmentExpression;
                case TypeScript.SyntaxKind.MultiplyAssignmentExpression:
                    return TypeScript.NodeType.MultiplyAssignmentExpression;
                case TypeScript.SyntaxKind.DivideAssignmentExpression:
                    return TypeScript.NodeType.DivideAssignmentExpression;
                case TypeScript.SyntaxKind.ModuloAssignmentExpression:
                    return TypeScript.NodeType.ModuloAssignmentExpression;
                case TypeScript.SyntaxKind.AndAssignmentExpression:
                    return TypeScript.NodeType.AndAssignmentExpression;
                case TypeScript.SyntaxKind.ExclusiveOrAssignmentExpression:
                    return TypeScript.NodeType.ExclusiveOrAssignmentExpression;
                case TypeScript.SyntaxKind.OrAssignmentExpression:
                    return TypeScript.NodeType.OrAssignmentExpression;
                case TypeScript.SyntaxKind.LeftShiftAssignmentExpression:
                    return TypeScript.NodeType.LeftShiftAssignmentExpression;
                case TypeScript.SyntaxKind.SignedRightShiftAssignmentExpression:
                    return TypeScript.NodeType.SignedRightShiftAssignmentExpression;
                case TypeScript.SyntaxKind.UnsignedRightShiftAssignmentExpression:
                    return TypeScript.NodeType.UnsignedRightShiftAssignmentExpression;
                case TypeScript.SyntaxKind.LogicalOrExpression:
                    return TypeScript.NodeType.LogicalOrExpression;
                case TypeScript.SyntaxKind.LogicalAndExpression:
                    return TypeScript.NodeType.LogicalAndExpression;
                case TypeScript.SyntaxKind.BitwiseOrExpression:
                    return TypeScript.NodeType.BitwiseOrExpression;
                case TypeScript.SyntaxKind.BitwiseExclusiveOrExpression:
                    return TypeScript.NodeType.BitwiseExclusiveOrExpression;
                case TypeScript.SyntaxKind.BitwiseAndExpression:
                    return TypeScript.NodeType.BitwiseAndExpression;
                case TypeScript.SyntaxKind.EqualsWithTypeConversionExpression:
                    return TypeScript.NodeType.EqualsWithTypeConversionExpression;
                case TypeScript.SyntaxKind.NotEqualsWithTypeConversionExpression:
                    return TypeScript.NodeType.NotEqualsWithTypeConversionExpression;
                case TypeScript.SyntaxKind.EqualsExpression:
                    return TypeScript.NodeType.EqualsExpression;
                case TypeScript.SyntaxKind.NotEqualsExpression:
                    return TypeScript.NodeType.NotEqualsExpression;
                case TypeScript.SyntaxKind.LessThanExpression:
                    return TypeScript.NodeType.LessThanExpression;
                case TypeScript.SyntaxKind.GreaterThanExpression:
                    return TypeScript.NodeType.GreaterThanExpression;
                case TypeScript.SyntaxKind.LessThanOrEqualExpression:
                    return TypeScript.NodeType.LessThanOrEqualExpression;
                case TypeScript.SyntaxKind.GreaterThanOrEqualExpression:
                    return TypeScript.NodeType.GreaterThanOrEqualExpression;
                case TypeScript.SyntaxKind.InstanceOfExpression:
                    return TypeScript.NodeType.InstanceOfExpression;
                case TypeScript.SyntaxKind.InExpression:
                    return TypeScript.NodeType.InExpression;
                case TypeScript.SyntaxKind.LeftShiftExpression:
                    return TypeScript.NodeType.LeftShiftExpression;
                case TypeScript.SyntaxKind.SignedRightShiftExpression:
                    return TypeScript.NodeType.SignedRightShiftExpression;
                case TypeScript.SyntaxKind.UnsignedRightShiftExpression:
                    return TypeScript.NodeType.UnsignedRightShiftExpression;
                case TypeScript.SyntaxKind.MultiplyExpression:
                    return TypeScript.NodeType.MultiplyExpression;
                case TypeScript.SyntaxKind.DivideExpression:
                    return TypeScript.NodeType.DivideExpression;
                case TypeScript.SyntaxKind.ModuloExpression:
                    return TypeScript.NodeType.ModuloExpression;
                case TypeScript.SyntaxKind.AddExpression:
                    return TypeScript.NodeType.AddExpression;
                case TypeScript.SyntaxKind.SubtractExpression:
                    return TypeScript.NodeType.SubtractExpression;
            }

            throw TypeScript.Errors.invalidOperation();
        };

        SyntaxTreeToAstVisitor.prototype.visitBinaryExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var nodeType = this.getBinaryExpressionNodeType(node);
                var left = node.left.accept(this);
                this.movePast(node.operatorToken);
                var right = node.right.accept(this);

                result = new TypeScript.BinaryExpression(nodeType, left, right);

                if (right.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                    var id = left.nodeType === TypeScript.NodeType.MemberAccessExpression ? (left).operand2 : left;
                    var idHint = id.nodeType === TypeScript.NodeType.Name ? id.actualText : null;

                    var funcDecl = right;
                    funcDecl.hint = idHint;
                }
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitConditionalExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var condition = node.condition.accept(this);
                this.movePast(node.questionToken);
                var whenTrue = node.whenTrue.accept(this);
                this.movePast(node.colonToken);
                var whenFalse = node.whenFalse.accept(this);

                result = new TypeScript.ConditionalExpression(condition, whenTrue, whenFalse);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitConstructSignature = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);

                this.movePast(node.newKeyword);
                var typeParameters = node.callSignature.typeParameterList === null ? null : node.callSignature.typeParameterList.accept(this);
                var parameters = node.callSignature.parameterList.accept(this);
                var returnType = node.callSignature.typeAnnotation ? node.callSignature.typeAnnotation.accept(this) : null;

                result = new TypeScript.FunctionDeclaration(null, null, false, typeParameters, parameters, TypeScript.NodeType.FunctionDeclaration);

                result.preComments = preComments;
                result.returnTypeAnnotation = returnType;

                result.hint = "_construct";
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.ConstructMember);
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Method);
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Signature);
                result.variableArgList = this.hasDotDotDotParameter(node.callSignature.parameterList.parameters);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitMethodSignature = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);

                var name = this.identifierFromToken(node.propertyName, !!node.questionToken, true);
                this.movePast(node.propertyName);
                this.movePast(node.questionToken);

                var typeParameters = node.callSignature.typeParameterList ? node.callSignature.typeParameterList.accept(this) : null;
                var parameters = node.callSignature.parameterList.accept(this);
                var returnType = node.callSignature.typeAnnotation ? node.callSignature.typeAnnotation.accept(this) : null;

                result = new TypeScript.FunctionDeclaration(name, null, false, typeParameters, parameters, TypeScript.NodeType.FunctionDeclaration);

                result.preComments = preComments;
                result.variableArgList = this.hasDotDotDotParameter(node.callSignature.parameterList.parameters);
                result.returnTypeAnnotation = returnType;
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Method);
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Signature);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitIndexSignature = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);

                this.movePast(node.openBracketToken);

                var parameter = node.parameter.accept(this);

                this.movePast(node.closeBracketToken);
                var returnType = node.typeAnnotation ? node.typeAnnotation.accept(this) : null;

                var name = new TypeScript.Identifier("__item");
                this.setSpanExplicit(name, start, start);

                var parameters = new TypeScript.ASTList();
                parameters.append(parameter);

                result = new TypeScript.FunctionDeclaration(name, null, false, null, parameters, TypeScript.NodeType.FunctionDeclaration);

                result.preComments = preComments;
                result.variableArgList = false;
                result.returnTypeAnnotation = returnType;

                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.IndexerMember);
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Method);
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Signature);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitPropertySignature = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);

                var name = this.identifierFromToken(node.propertyName, !!node.questionToken, true);
                this.movePast(node.propertyName);
                this.movePast(node.questionToken);
                var typeExpr = node.typeAnnotation ? node.typeAnnotation.accept(this) : null;

                result = new TypeScript.VariableDeclarator(name);

                result.preComments = preComments;
                result.typeExpr = typeExpr;
                result.setVarFlags(result.getVarFlags() | TypeScript.VariableFlags.Property);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitParameterList = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;

            var openParenToken = node.openParenToken;
            this.previousTokenTrailingComments = this.convertTokenTrailingComments(openParenToken, start + openParenToken.leadingTriviaWidth() + openParenToken.width());

            this.movePast(node.openParenToken);
            var result = this.visitSeparatedSyntaxList(node.parameters);
            this.movePast(node.closeParenToken);

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitCallSignature = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);

                var typeParameters = node.typeParameterList === null ? null : node.typeParameterList.accept(this);
                var parameters = node.parameterList.accept(this);
                var returnType = node.typeAnnotation ? node.typeAnnotation.accept(this) : null;

                result = new TypeScript.FunctionDeclaration(null, null, false, typeParameters, parameters, TypeScript.NodeType.FunctionDeclaration);

                result.preComments = preComments;
                result.variableArgList = this.hasDotDotDotParameter(node.parameterList.parameters);
                result.returnTypeAnnotation = returnType;

                result.hint = "_call";
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.CallMember);
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Method);
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Signature);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitTypeParameterList = function (node) {
            this.assertElementAtPosition(node);

            this.movePast(node.lessThanToken);
            var result = this.visitSeparatedSyntaxList(node.typeParameters);
            this.movePast(node.greaterThanToken);

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitTypeParameter = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var identifier = this.identifierFromToken(node.identifier, false, true);
                this.movePast(node.identifier);
                var constraint = node.constraint ? node.constraint.accept(this) : null;

                result = new TypeScript.TypeParameter(identifier, constraint);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitConstraint = function (node) {
            this.assertElementAtPosition(node);

            this.movePast(node.extendsKeyword);
            return this.visitType(node.type);
        };

        SyntaxTreeToAstVisitor.prototype.visitIfStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.moveTo(node, node.condition);
                var condition = node.condition.accept(this);
                this.movePast(node.closeParenToken);
                var thenBod = node.statement.accept(this);
                var elseBod = node.elseClause ? node.elseClause.accept(this) : null;

                result = new TypeScript.IfStatement(condition, thenBod, elseBod);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitElseClause = function (node) {
            this.assertElementAtPosition(node);

            this.movePast(node.elseKeyword);
            return node.statement.accept(this);
        };

        SyntaxTreeToAstVisitor.prototype.visitExpressionStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);
                var postComments = this.convertNodeTrailingComments(node, start);

                var expression = node.expression.accept(this);
                this.movePast(node.semicolonToken);

                result = new TypeScript.ExpressionStatement(expression);
                result.preComments = preComments;
                result.postComments = postComments;
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitConstructorDeclaration = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);
                var postComments = this.convertNodeTrailingComments(node, start);

                this.moveTo(node, node.parameterList);
                var parameters = node.parameterList.accept(this);

                var block = node.block ? node.block.accept(this) : null;

                this.movePast(node.semicolonToken);

                result = new TypeScript.FunctionDeclaration(null, block, true, null, parameters, TypeScript.NodeType.FunctionDeclaration);

                result.preComments = preComments;
                result.postComments = postComments;
                result.variableArgList = this.hasDotDotDotParameter(node.parameterList.parameters);

                if (node.semicolonToken) {
                    result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Signature);
                }
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitMemberFunctionDeclaration = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);
                var postComments = this.convertNodeTrailingComments(node, start);

                this.moveTo(node, node.propertyName);
                var name = this.identifierFromToken(node.propertyName, false, true);

                this.movePast(node.propertyName);

                var typeParameters = node.callSignature.typeParameterList === null ? null : node.callSignature.typeParameterList.accept(this);
                var parameters = node.callSignature.parameterList.accept(this);
                var returnType = node.callSignature.typeAnnotation ? node.callSignature.typeAnnotation.accept(this) : null;

                var block = node.block ? node.block.accept(this) : null;
                this.movePast(node.semicolonToken);

                result = new TypeScript.FunctionDeclaration(name, block, false, typeParameters, parameters, TypeScript.NodeType.FunctionDeclaration);

                result.preComments = preComments;
                result.postComments = postComments;
                result.variableArgList = this.hasDotDotDotParameter(node.callSignature.parameterList.parameters);
                result.returnTypeAnnotation = returnType;

                if (node.semicolonToken) {
                    result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Signature);
                }

                if (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.PrivateKeyword)) {
                    result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Private);
                } else {
                    result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Public);
                }

                if (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.StaticKeyword)) {
                    result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Static);
                }

                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Method);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitMemberAccessorDeclaration = function (node, typeAnnotation) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);
                var postComments = this.convertNodeTrailingComments(node, start);

                this.moveTo(node, node.propertyName);
                var name = this.identifierFromToken(node.propertyName, false, true);
                this.movePast(node.propertyName);
                var parameters = node.parameterList.accept(this);
                var returnType = typeAnnotation ? typeAnnotation.accept(this) : null;

                var block = node.block ? node.block.accept(this) : null;
                result = new TypeScript.FunctionDeclaration(name, block, false, null, parameters, TypeScript.NodeType.FunctionDeclaration);

                result.preComments = preComments;
                result.postComments = postComments;
                result.variableArgList = this.hasDotDotDotParameter(node.parameterList.parameters);
                result.returnTypeAnnotation = returnType;

                if (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.PrivateKeyword)) {
                    result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Private);
                } else {
                    result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Public);
                }

                if (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.StaticKeyword)) {
                    result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Static);
                }

                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.Method);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitGetMemberAccessorDeclaration = function (node) {
            this.assertElementAtPosition(node);

            var result = this.visitMemberAccessorDeclaration(node, node.typeAnnotation);

            result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.GetAccessor);
            result.hint = "get" + result.name.actualText;

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitSetMemberAccessorDeclaration = function (node) {
            this.assertElementAtPosition(node);

            var result = this.visitMemberAccessorDeclaration(node, null);

            result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.SetAccessor);
            result.hint = "set" + result.name.actualText;

            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitMemberVariableDeclaration = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);
                var postComments = this.convertNodeTrailingComments(node, start);

                this.moveTo(node, node.variableDeclarator);
                this.moveTo(node.variableDeclarator, node.variableDeclarator.identifier);

                var name = this.identifierFromToken(node.variableDeclarator.identifier, false, true);
                this.movePast(node.variableDeclarator.identifier);
                var typeExpr = node.variableDeclarator.typeAnnotation ? node.variableDeclarator.typeAnnotation.accept(this) : null;
                var init = node.variableDeclarator.equalsValueClause ? node.variableDeclarator.equalsValueClause.accept(this) : null;
                this.movePast(node.semicolonToken);

                result = new TypeScript.VariableDeclarator(name);

                result.preComments = preComments;
                result.postComments = postComments;
                result.typeExpr = typeExpr;
                result.init = init;

                if (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.StaticKeyword)) {
                    result.setVarFlags(result.getVarFlags() | TypeScript.VariableFlags.Static);
                }

                if (TypeScript.SyntaxUtilities.containsToken(node.modifiers, TypeScript.SyntaxKind.PrivateKeyword)) {
                    result.setVarFlags(result.getVarFlags() | TypeScript.VariableFlags.Private);
                } else {
                    result.setVarFlags(result.getVarFlags() | TypeScript.VariableFlags.Public);
                }

                result.setVarFlags(result.getVarFlags() | TypeScript.VariableFlags.ClassProperty);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitThrowStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.throwKeyword);
                var expression = node.expression.accept(this);
                this.movePast(node.semicolonToken);

                result = new TypeScript.ThrowStatement(expression);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitReturnStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;

            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);
                var postComments = this.convertNodeTrailingComments(node, start);

                this.movePast(node.returnKeyword);
                var expression = node.expression ? node.expression.accept(this) : null;
                this.movePast(node.semicolonToken);

                result = new TypeScript.ReturnStatement(expression);
                result.preComments = preComments;
                result.postComments = postComments;
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitObjectCreationExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.newKeyword);
                var expression = node.expression.accept(this);
                var typeArgumentList = node.argumentList === null || node.argumentList.typeArgumentList === null ? null : node.argumentList.typeArgumentList.accept(this);
                var argumentList = this.convertArgumentListArguments(node.argumentList);

                result = new TypeScript.CallExpression(TypeScript.NodeType.ObjectCreationExpression, expression, typeArgumentList, argumentList);

                if (expression.nodeType === TypeScript.NodeType.TypeRef) {
                    var typeRef = expression;

                    if (typeRef.arrayCount === 0) {
                        var term = typeRef.term;
                        if (term.nodeType === TypeScript.NodeType.MemberAccessExpression || term.nodeType === TypeScript.NodeType.Name) {
                            expression = term;
                        }
                    }
                }
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitSwitchStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.switchKeyword);
                this.movePast(node.openParenToken);
                var expression = node.expression.accept(this);
                this.movePast(node.closeParenToken);
                var closeParenPosition = this.position;
                this.movePast(node.openBraceToken);

                result = new TypeScript.SwitchStatement(expression);

                result.statement.minChar = start;
                result.statement.limChar = closeParenPosition;

                result.caseList = new TypeScript.ASTList();

                for (var i = 0, n = node.switchClauses.childCount(); i < n; i++) {
                    var switchClause = node.switchClauses.childAt(i);
                    var translated = switchClause.accept(this);

                    if (switchClause.kind() === TypeScript.SyntaxKind.DefaultSwitchClause) {
                        result.defaultCase = translated;
                    }

                    result.caseList.append(translated);
                }

                this.movePast(node.closeBraceToken);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitCaseSwitchClause = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.caseKeyword);
                var expression = node.expression.accept(this);
                this.movePast(node.colonToken);
                var statements = this.visitSyntaxList(node.statements);

                result = new TypeScript.CaseClause();

                result.expr = expression;
                result.body = statements;
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitDefaultSwitchClause = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.defaultKeyword);
                this.movePast(node.colonToken);
                var statements = this.visitSyntaxList(node.statements);

                result = new TypeScript.CaseClause();
                result.body = statements;
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitBreakStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.breakKeyword);
                this.movePast(node.identifier);
                this.movePast(node.semicolonToken);

                result = new TypeScript.Jump(TypeScript.NodeType.BreakStatement);

                if (node.identifier !== null) {
                    result.target = node.identifier.valueText();
                }
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitContinueStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.continueKeyword);
                this.movePast(node.identifier);
                this.movePast(node.semicolonToken);

                result = new TypeScript.Jump(TypeScript.NodeType.ContinueStatement);

                if (node.identifier !== null) {
                    result.target = node.identifier.valueText();
                }
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitForStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.forKeyword);
                this.movePast(node.openParenToken);
                var init = node.variableDeclaration ? node.variableDeclaration.accept(this) : node.initializer ? node.initializer.accept(this) : null;
                this.movePast(node.firstSemicolonToken);
                var cond = node.condition ? node.condition.accept(this) : null;
                this.movePast(node.secondSemicolonToken);
                var incr = node.incrementor ? node.incrementor.accept(this) : null;
                this.movePast(node.closeParenToken);
                var body = node.statement.accept(this);

                result = new TypeScript.ForStatement(init, cond, incr, body);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitForInStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.forKeyword);
                this.movePast(node.openParenToken);
                var init = node.variableDeclaration ? node.variableDeclaration.accept(this) : node.left.accept(this);
                this.movePast(node.inKeyword);
                var expression = node.expression.accept(this);
                this.movePast(node.closeParenToken);
                var body = node.statement.accept(this);

                result = new TypeScript.ForInStatement(init, expression, body);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitWhileStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.moveTo(node, node.condition);
                var condition = node.condition.accept(this);
                this.movePast(node.closeParenToken);
                var statement = node.statement.accept(this);

                result = new TypeScript.WhileStatement(condition, statement);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitWithStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.moveTo(node, node.condition);
                var condition = node.condition.accept(this);
                this.movePast(node.closeParenToken);
                var statement = node.statement.accept(this);

                result = new TypeScript.WithStatement(condition, statement);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitCastExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.lessThanToken);
                var castTerm = this.visitType(node.type);
                this.movePast(node.greaterThanToken);
                var expression = node.expression.accept(this);

                result = new TypeScript.UnaryExpression(TypeScript.NodeType.CastExpression, expression);
                result.castTerm = castTerm;
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitObjectLiteralExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);

                var openStart = this.position + node.openBraceToken.leadingTriviaWidth();
                this.movePast(node.openBraceToken);

                var propertyAssignments = this.visitSeparatedSyntaxList(node.propertyAssignments);

                var closeStart = this.position + node.closeBraceToken.leadingTriviaWidth();
                this.movePast(node.closeBraceToken);

                result = new TypeScript.UnaryExpression(TypeScript.NodeType.ObjectLiteralExpression, propertyAssignments);
                result.preComments = preComments;

                if (this.isOnSingleLine(openStart, closeStart)) {
                    result.setFlags(result.getFlags() | TypeScript.ASTFlags.SingleLine);
                }
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitSimplePropertyAssignment = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);

                var left = node.propertyName.accept(this);

                this.previousTokenTrailingComments = this.convertTokenTrailingComments(node.colonToken, this.position + node.colonToken.leadingTriviaWidth() + node.colonToken.width());

                this.movePast(node.colonToken);
                var right = node.expression.accept(this);

                result = new TypeScript.BinaryExpression(TypeScript.NodeType.Member, left, right);
                result.preComments = preComments;

                if (right.nodeType === TypeScript.NodeType.FunctionDeclaration) {
                    var funcDecl = right;
                    funcDecl.hint = left.text;
                }
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitFunctionPropertyAssignment = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var left = node.propertyName.accept(this);
                var functionDeclaration = node.callSignature.accept(this);
                var block = node.block.accept(this);

                functionDeclaration.hint = left.text;
                functionDeclaration.block = block;
                functionDeclaration.setFunctionFlags(TypeScript.FunctionFlags.IsFunctionProperty);

                result = new TypeScript.BinaryExpression(TypeScript.NodeType.Member, left, functionDeclaration);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitGetAccessorPropertyAssignment = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.moveTo(node, node.propertyName);
                var name = this.identifierFromToken(node.propertyName, false, true);
                var functionName = this.identifierFromToken(node.propertyName, false, true);
                this.movePast(node.propertyName);
                this.movePast(node.openParenToken);
                this.movePast(node.closeParenToken);
                var returnType = node.typeAnnotation ? node.typeAnnotation.accept(this) : null;

                var block = node.block ? node.block.accept(this) : null;

                var funcDecl = new TypeScript.FunctionDeclaration(functionName, block, false, null, new TypeScript.ASTList(), TypeScript.NodeType.FunctionDeclaration);
                this.setSpan(funcDecl, start, node);

                funcDecl.setFunctionFlags(funcDecl.getFunctionFlags() | TypeScript.FunctionFlags.GetAccessor);
                funcDecl.setFunctionFlags(funcDecl.getFunctionFlags() | TypeScript.FunctionFlags.IsFunctionExpression);
                funcDecl.hint = "get" + node.propertyName.valueText();
                funcDecl.returnTypeAnnotation = returnType;

                result = new TypeScript.BinaryExpression(TypeScript.NodeType.Member, name, funcDecl);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitSetAccessorPropertyAssignment = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.moveTo(node, node.propertyName);
                var name = this.identifierFromToken(node.propertyName, false, true);
                var functionName = this.identifierFromToken(node.propertyName, false, true);
                this.movePast(node.propertyName);
                this.movePast(node.openParenToken);
                var parameter = node.parameter.accept(this);
                this.movePast(node.closeParenToken);

                var parameters = new TypeScript.ASTList();
                parameters.append(parameter);

                var block = node.block ? node.block.accept(this) : null;

                var funcDecl = new TypeScript.FunctionDeclaration(functionName, block, false, null, parameters, TypeScript.NodeType.FunctionDeclaration);
                this.setSpan(funcDecl, start, node);

                funcDecl.setFunctionFlags(funcDecl.getFunctionFlags() | TypeScript.FunctionFlags.SetAccessor);
                funcDecl.setFunctionFlags(funcDecl.getFunctionFlags() | TypeScript.FunctionFlags.IsFunctionExpression);
                funcDecl.hint = "set" + node.propertyName.valueText();

                result = new TypeScript.BinaryExpression(TypeScript.NodeType.Member, name, funcDecl);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitFunctionExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var preComments = this.convertNodeLeadingComments(node, start);

                this.movePast(node.functionKeyword);
                var name = node.identifier === null ? null : this.identifierFromToken(node.identifier, false, true);
                this.movePast(node.identifier);
                var typeParameters = node.callSignature.typeParameterList === null ? null : node.callSignature.typeParameterList.accept(this);
                var parameters = node.callSignature.parameterList.accept(this);
                var returnType = node.callSignature.typeAnnotation ? node.callSignature.typeAnnotation.accept(this) : null;

                var block = node.block ? node.block.accept(this) : null;

                result = new TypeScript.FunctionDeclaration(name, block, false, typeParameters, parameters, TypeScript.NodeType.FunctionDeclaration);

                result.preComments = preComments;
                result.variableArgList = this.hasDotDotDotParameter(node.callSignature.parameterList.parameters);
                result.returnTypeAnnotation = returnType;
                result.setFunctionFlags(result.getFunctionFlags() | TypeScript.FunctionFlags.IsFunctionExpression);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitEmptyStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.semicolonToken);

                result = new TypeScript.EmptyStatement();
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitTryStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.tryKeyword);
                var tryBody = node.block.accept(this);

                var catchClause = null;
                if (node.catchClause !== null) {
                    catchClause = node.catchClause.accept(this);
                }

                var finallyBody = null;
                if (node.finallyClause !== null) {
                    finallyBody = node.finallyClause.accept(this);
                }

                result = new TypeScript.TryStatement(tryBody, catchClause, finallyBody);
            }

            TypeScript.Debug.assert(result !== null);
            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitCatchClause = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.catchKeyword);
                this.movePast(node.openParenToken);
                var identifier = this.identifierFromToken(node.identifier, false, true);
                this.movePast(node.identifier);
                var typeExpr = node.typeAnnotation ? node.typeAnnotation.accept(this) : null;
                this.movePast(node.closeParenToken);
                var block = node.block.accept(this);

                var varDecl = new TypeScript.VariableDeclarator(identifier);
                this.setSpanExplicit(varDecl, identifier.minChar, identifier.limChar);

                varDecl.typeExpr = typeExpr;

                result = new TypeScript.CatchClause(varDecl, block);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitFinallyClause = function (node) {
            this.movePast(node.finallyKeyword);
            return node.block.accept(this);
        };

        SyntaxTreeToAstVisitor.prototype.visitLabeledStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                var identifier = this.identifierFromToken(node.identifier, false, true);
                this.movePast(node.identifier);
                this.movePast(node.colonToken);
                var statement = node.statement.accept(this);

                result = new TypeScript.LabeledStatement(identifier, statement);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitDoStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.doKeyword);
                var statement = node.statement.accept(this);
                var whileSpan = new TypeScript.ASTSpan();
                this.setSpan(whileSpan, this.position, node.whileKeyword);

                this.movePast(node.whileKeyword);
                this.movePast(node.openParenToken);
                var condition = node.condition.accept(this);
                this.movePast(node.closeParenToken);
                this.movePast(node.semicolonToken);

                result = new TypeScript.DoStatement(statement, condition);
                result.whileSpan = whileSpan;
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitTypeOfExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.typeOfKeyword);
                var expression = node.expression.accept(this);

                result = new TypeScript.UnaryExpression(TypeScript.NodeType.TypeOfExpression, expression);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitDeleteExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.deleteKeyword);
                var expression = node.expression.accept(this);

                result = new TypeScript.UnaryExpression(TypeScript.NodeType.DeleteExpression, expression);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitVoidExpression = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.voidKeyword);
                var expression = node.expression.accept(this);

                result = new TypeScript.UnaryExpression(TypeScript.NodeType.VoidExpression, expression);
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };

        SyntaxTreeToAstVisitor.prototype.visitDebuggerStatement = function (node) {
            this.assertElementAtPosition(node);

            var start = this.position;
            var result = this.getAST(node);
            if (result) {
                this.movePast(node);
            } else {
                this.movePast(node.debuggerKeyword);
                this.movePast(node.semicolonToken);

                result = new TypeScript.DebuggerStatement();
            }

            this.setAST(node, result);
            this.setSpan(result, start, node);
            return result;
        };
        SyntaxTreeToAstVisitor.checkPositions = false;

        SyntaxTreeToAstVisitor.protoString = "__proto__";
        SyntaxTreeToAstVisitor.protoSubstitutionString = "#__proto__";
        return SyntaxTreeToAstVisitor;
    })();
    TypeScript.SyntaxTreeToAstVisitor = SyntaxTreeToAstVisitor;
})(TypeScript || (TypeScript = {}));
