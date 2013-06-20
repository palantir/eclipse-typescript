var TypeScript;
(function (TypeScript) {
    var DeclCollectionContext = (function () {
        function DeclCollectionContext(semanticInfo, scriptName) {
            if (typeof scriptName === "undefined") { scriptName = ""; }
            this.semanticInfo = semanticInfo;
            this.scriptName = scriptName;
            this.parentChain = [];
            this.foundValueDecl = false;
        }
        DeclCollectionContext.prototype.getParent = function () {
            return this.parentChain ? this.parentChain[this.parentChain.length - 1] : null;
        };

        DeclCollectionContext.prototype.pushParent = function (parentDecl) {
            if (parentDecl) {
                this.parentChain[this.parentChain.length] = parentDecl;
            }
        };

        DeclCollectionContext.prototype.popParent = function () {
            this.parentChain.length--;
        };
        return DeclCollectionContext;
    })();
    TypeScript.DeclCollectionContext = DeclCollectionContext;

    function preCollectImportDecls(ast, parentAST, context) {
        var importDecl = ast;
        var declFlags = TypeScript.PullElementFlags.None;
        var span = TypeScript.TextSpan.fromBounds(importDecl.minChar, importDecl.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl(importDecl.id.text, importDecl.id.actualText, TypeScript.PullElementKind.TypeAlias, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(ast, decl);
        context.semanticInfo.setASTForDecl(decl, ast);

        parent.addChildDecl(decl);
        decl.setParentDecl(parent);

        return false;
    }
    TypeScript.preCollectImportDecls = preCollectImportDecls;

    function preCollectModuleDecls(ast, parentAST, context) {
        var moduleDecl = ast;
        var declFlags = TypeScript.PullElementFlags.None;
        var modName = (moduleDecl.name).text;
        var isDynamic = TypeScript.isQuoted(modName) || TypeScript.hasFlag(moduleDecl.getModuleFlags(), TypeScript.ModuleFlags.IsDynamic);
        var kind = TypeScript.PullElementKind.Container;

        if (TypeScript.hasFlag(moduleDecl.getModuleFlags(), TypeScript.ModuleFlags.Ambient)) {
            declFlags |= TypeScript.PullElementFlags.Ambient;
        }

        if (TypeScript.hasFlag(moduleDecl.getModuleFlags(), TypeScript.ModuleFlags.Exported)) {
            declFlags |= TypeScript.PullElementFlags.Exported;
        }

        if (TypeScript.hasFlag(moduleDecl.getModuleFlags(), TypeScript.ModuleFlags.IsEnum)) {
            declFlags |= (TypeScript.PullElementFlags.Enum | TypeScript.PullElementFlags.InitializedEnum);
            kind = TypeScript.PullElementKind.Enum;
        } else {
            kind = isDynamic ? TypeScript.PullElementKind.DynamicModule : TypeScript.PullElementKind.Container;
        }

        var span = TypeScript.TextSpan.fromBounds(moduleDecl.minChar, moduleDecl.limChar);

        var decl = new TypeScript.PullDecl(modName, (moduleDecl.name).actualText, kind, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(ast, decl);
        context.semanticInfo.setASTForDecl(decl, ast);

        var parent = context.getParent();
        parent.addChildDecl(decl);
        decl.setParentDecl(parent);

        context.pushParent(decl);

        return true;
    }
    TypeScript.preCollectModuleDecls = preCollectModuleDecls;

    function preCollectClassDecls(classDecl, parentAST, context) {
        var declFlags = TypeScript.PullElementFlags.None;
        var constructorDeclKind = TypeScript.PullElementKind.Variable;

        if (TypeScript.hasFlag(classDecl.getVarFlags(), TypeScript.VariableFlags.Ambient)) {
            declFlags |= TypeScript.PullElementFlags.Ambient;
        }

        if (TypeScript.hasFlag(classDecl.getVarFlags(), TypeScript.VariableFlags.Exported)) {
            declFlags |= TypeScript.PullElementFlags.Exported;
        }

        var span = TypeScript.TextSpan.fromBounds(classDecl.minChar, classDecl.limChar);

        var decl = new TypeScript.PullDecl(classDecl.name.text, classDecl.name.actualText, TypeScript.PullElementKind.Class, declFlags, span, context.scriptName);

        var constructorDecl = new TypeScript.PullDecl(classDecl.name.text, classDecl.name.actualText, constructorDeclKind, declFlags | TypeScript.PullElementFlags.ClassConstructorVariable, span, context.scriptName);

        decl.setValueDecl(constructorDecl);

        var parent = context.getParent();
        parent.addChildDecl(decl);
        parent.addChildDecl(constructorDecl);
        decl.setParentDecl(parent);
        constructorDecl.setParentDecl(parent);

        context.pushParent(decl);

        context.semanticInfo.setDeclForAST(classDecl, decl);
        context.semanticInfo.setASTForDecl(decl, classDecl);
        context.semanticInfo.setASTForDecl(constructorDecl, classDecl);

        return true;
    }
    TypeScript.preCollectClassDecls = preCollectClassDecls;

    function createObjectTypeDeclaration(interfaceDecl, context) {
        var declFlags = TypeScript.PullElementFlags.None;

        var span = TypeScript.TextSpan.fromBounds(interfaceDecl.minChar, interfaceDecl.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl("", "", TypeScript.PullElementKind.ObjectType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(interfaceDecl, decl);
        context.semanticInfo.setASTForDecl(decl, interfaceDecl);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        return true;
    }
    TypeScript.createObjectTypeDeclaration = createObjectTypeDeclaration;

    function preCollectInterfaceDecls(interfaceDecl, parentAST, context) {
        var declFlags = TypeScript.PullElementFlags.None;

        if (interfaceDecl.getFlags() & TypeScript.ASTFlags.TypeReference) {
            return createObjectTypeDeclaration(interfaceDecl, context);
        }

        if (TypeScript.hasFlag(interfaceDecl.getVarFlags(), TypeScript.VariableFlags.Exported)) {
            declFlags |= TypeScript.PullElementFlags.Exported;
        }

        var span = TypeScript.TextSpan.fromBounds(interfaceDecl.minChar, interfaceDecl.limChar);

        var decl = new TypeScript.PullDecl(interfaceDecl.name.text, interfaceDecl.name.actualText, TypeScript.PullElementKind.Interface, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(interfaceDecl, decl);
        context.semanticInfo.setASTForDecl(decl, interfaceDecl);

        var parent = context.getParent();

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        return true;
    }
    TypeScript.preCollectInterfaceDecls = preCollectInterfaceDecls;

    function preCollectParameterDecl(argDecl, parentAST, context) {
        var declFlags = TypeScript.PullElementFlags.None;

        if (TypeScript.hasFlag(argDecl.getVarFlags(), TypeScript.VariableFlags.Private)) {
            declFlags |= TypeScript.PullElementFlags.Private;
        } else {
            declFlags |= TypeScript.PullElementFlags.Public;
        }

        if (TypeScript.hasFlag(argDecl.getFlags(), TypeScript.ASTFlags.OptionalName) || TypeScript.hasFlag(argDecl.id.getFlags(), TypeScript.ASTFlags.OptionalName)) {
            declFlags |= TypeScript.PullElementFlags.Optional;
        }

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var span = TypeScript.TextSpan.fromBounds(argDecl.minChar, argDecl.limChar);

        var decl = new TypeScript.PullDecl(argDecl.id.text, argDecl.id.actualText, TypeScript.PullElementKind.Parameter, declFlags, span, context.scriptName);

        parent.addChildDecl(decl);
        decl.setParentDecl(parent);

        if (TypeScript.hasFlag(argDecl.getVarFlags(), TypeScript.VariableFlags.Property)) {
            var propDecl = new TypeScript.PullDecl(argDecl.id.text, argDecl.id.actualText, TypeScript.PullElementKind.Property, declFlags, span, context.scriptName);
            propDecl.setValueDecl(decl);
            context.parentChain[context.parentChain.length - 2].addChildDecl(propDecl);
            propDecl.setParentDecl(context.parentChain[context.parentChain.length - 2]);
            context.semanticInfo.setASTForDecl(decl, argDecl);
            context.semanticInfo.setASTForDecl(propDecl, argDecl);
            context.semanticInfo.setDeclForAST(argDecl, propDecl);
        } else {
            context.semanticInfo.setASTForDecl(decl, argDecl);
            context.semanticInfo.setDeclForAST(argDecl, decl);
        }

        if (argDecl.typeExpr && ((argDecl.typeExpr).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (argDecl.typeExpr).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((argDecl.typeExpr).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return false;
    }
    TypeScript.preCollectParameterDecl = preCollectParameterDecl;

    function preCollectTypeParameterDecl(typeParameterDecl, parentAST, context) {
        var declFlags = TypeScript.PullElementFlags.None;

        var span = TypeScript.TextSpan.fromBounds(typeParameterDecl.minChar, typeParameterDecl.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl(typeParameterDecl.name.text, typeParameterDecl.name.actualText, TypeScript.PullElementKind.TypeParameter, declFlags, span, context.scriptName);
        context.semanticInfo.setASTForDecl(decl, typeParameterDecl);
        context.semanticInfo.setDeclForAST(typeParameterDecl, decl);

        parent.addChildDecl(decl);
        decl.setParentDecl(parent);

        if (typeParameterDecl.constraint && ((typeParameterDecl.constraint).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (typeParameterDecl.constraint).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((typeParameterDecl.constraint).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return true;
    }
    TypeScript.preCollectTypeParameterDecl = preCollectTypeParameterDecl;

    function createPropertySignature(propertyDecl, context) {
        var declFlags = TypeScript.PullElementFlags.Public;
        var parent = context.getParent();
        var declType = parent.getKind() === TypeScript.PullElementKind.Enum ? TypeScript.PullElementKind.EnumMember : TypeScript.PullElementKind.Property;

        if (TypeScript.hasFlag(propertyDecl.id.getFlags(), TypeScript.ASTFlags.OptionalName)) {
            declFlags |= TypeScript.PullElementFlags.Optional;
        }

        if (TypeScript.hasFlag(propertyDecl.getVarFlags(), TypeScript.VariableFlags.Constant)) {
            declFlags |= TypeScript.PullElementFlags.Constant;
        }

        var span = TypeScript.TextSpan.fromBounds(propertyDecl.minChar, propertyDecl.limChar);

        var decl = new TypeScript.PullDecl(propertyDecl.id.text, propertyDecl.id.actualText, declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(propertyDecl, decl);
        context.semanticInfo.setASTForDecl(decl, propertyDecl);

        parent.addChildDecl(decl);
        decl.setParentDecl(parent);

        if (propertyDecl.typeExpr && ((propertyDecl.typeExpr).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (propertyDecl.typeExpr).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((propertyDecl.typeExpr).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return false;
    }
    TypeScript.createPropertySignature = createPropertySignature;

    function createMemberVariableDeclaration(memberDecl, context) {
        var declFlags = TypeScript.PullElementFlags.None;
        var declType = TypeScript.PullElementKind.Property;

        if (TypeScript.hasFlag(memberDecl.getVarFlags(), TypeScript.VariableFlags.Private)) {
            declFlags |= TypeScript.PullElementFlags.Private;
        } else {
            declFlags |= TypeScript.PullElementFlags.Public;
        }

        if (TypeScript.hasFlag(memberDecl.getVarFlags(), TypeScript.VariableFlags.Static)) {
            declFlags |= TypeScript.PullElementFlags.Static;
        }

        var span = TypeScript.TextSpan.fromBounds(memberDecl.minChar, memberDecl.limChar);

        var decl = new TypeScript.PullDecl(memberDecl.id.text, memberDecl.id.actualText, declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(memberDecl, decl);
        context.semanticInfo.setASTForDecl(decl, memberDecl);

        var parent = context.getParent();
        parent.addChildDecl(decl);
        decl.setParentDecl(parent);

        if (memberDecl.typeExpr && ((memberDecl.typeExpr).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (memberDecl.typeExpr).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((memberDecl.typeExpr).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return false;
    }
    TypeScript.createMemberVariableDeclaration = createMemberVariableDeclaration;

    function createVariableDeclaration(varDecl, context) {
        var declFlags = TypeScript.PullElementFlags.None;
        var declType = TypeScript.PullElementKind.Variable;

        if (TypeScript.hasFlag(varDecl.getVarFlags(), TypeScript.VariableFlags.Ambient)) {
            declFlags |= TypeScript.PullElementFlags.Ambient;
        }

        if (TypeScript.hasFlag(varDecl.getVarFlags(), TypeScript.VariableFlags.Exported)) {
            declFlags |= TypeScript.PullElementFlags.Exported;
        }

        var span = TypeScript.TextSpan.fromBounds(varDecl.minChar, varDecl.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl(varDecl.id.text, varDecl.id.actualText, declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(varDecl, decl);
        context.semanticInfo.setASTForDecl(decl, varDecl);

        parent.addChildDecl(decl);
        decl.setParentDecl(parent);

        if (varDecl.typeExpr && ((varDecl.typeExpr).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (varDecl.typeExpr).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((varDecl.typeExpr).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return false;
    }
    TypeScript.createVariableDeclaration = createVariableDeclaration;

    function preCollectVarDecls(ast, parentAST, context) {
        var varDecl = ast;
        var declFlags = TypeScript.PullElementFlags.None;
        var declType = TypeScript.PullElementKind.Variable;
        var isProperty = false;
        var isStatic = false;

        if (TypeScript.hasFlag(varDecl.getVarFlags(), TypeScript.VariableFlags.ClassProperty)) {
            return createMemberVariableDeclaration(varDecl, context);
        } else if (TypeScript.hasFlag(varDecl.getVarFlags(), TypeScript.VariableFlags.Property)) {
            return createPropertySignature(varDecl, context);
        }

        return createVariableDeclaration(varDecl, context);
    }
    TypeScript.preCollectVarDecls = preCollectVarDecls;

    function createFunctionTypeDeclaration(functionTypeDeclAST, context) {
        var declFlags = TypeScript.PullElementFlags.Signature;
        var declType = TypeScript.PullElementKind.FunctionType;

        var span = TypeScript.TextSpan.fromBounds(functionTypeDeclAST.minChar, functionTypeDeclAST.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl("", "", declType, declFlags, span, context.semanticInfo.getPath());
        context.semanticInfo.setDeclForAST(functionTypeDeclAST, decl);
        context.semanticInfo.setASTForDecl(decl, functionTypeDeclAST);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        if (functionTypeDeclAST.returnTypeAnnotation && ((functionTypeDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (functionTypeDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((functionTypeDeclAST.returnTypeAnnotation).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return true;
    }
    TypeScript.createFunctionTypeDeclaration = createFunctionTypeDeclaration;

    function createConstructorTypeDeclaration(constructorTypeDeclAST, context) {
        var declFlags = TypeScript.PullElementFlags.None;
        var declType = TypeScript.PullElementKind.ConstructorType;

        var span = TypeScript.TextSpan.fromBounds(constructorTypeDeclAST.minChar, constructorTypeDeclAST.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl("{new}", "{new}", declType, declFlags, span, context.semanticInfo.getPath());
        context.semanticInfo.setDeclForAST(constructorTypeDeclAST, decl);
        context.semanticInfo.setASTForDecl(decl, constructorTypeDeclAST);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        if (constructorTypeDeclAST.returnTypeAnnotation && ((constructorTypeDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (constructorTypeDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((constructorTypeDeclAST.returnTypeAnnotation).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return true;
    }
    TypeScript.createConstructorTypeDeclaration = createConstructorTypeDeclaration;

    function createFunctionDeclaration(funcDeclAST, context) {
        var declFlags = TypeScript.PullElementFlags.None;
        var declType = TypeScript.PullElementKind.Function;

        if (TypeScript.hasFlag(funcDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.Ambient)) {
            declFlags |= TypeScript.PullElementFlags.Ambient;
        }

        if (TypeScript.hasFlag(funcDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.Exported)) {
            declFlags |= TypeScript.PullElementFlags.Exported;
        }

        if (!funcDeclAST.block) {
            declFlags |= TypeScript.PullElementFlags.Signature;
        }

        var span = TypeScript.TextSpan.fromBounds(funcDeclAST.minChar, funcDeclAST.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl(funcDeclAST.name.text, funcDeclAST.name.actualText, declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(funcDeclAST, decl);
        context.semanticInfo.setASTForDecl(decl, funcDeclAST);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        if (funcDeclAST.returnTypeAnnotation && ((funcDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (funcDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((funcDeclAST.returnTypeAnnotation).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return true;
    }
    TypeScript.createFunctionDeclaration = createFunctionDeclaration;

    function createFunctionExpressionDeclaration(functionExpressionDeclAST, context) {
        var declFlags = TypeScript.PullElementFlags.None;

        if (TypeScript.hasFlag(functionExpressionDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.IsFatArrowFunction)) {
            declFlags |= TypeScript.PullElementFlags.FatArrow;
        }

        var span = TypeScript.TextSpan.fromBounds(functionExpressionDeclAST.minChar, functionExpressionDeclAST.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var name = functionExpressionDeclAST.name ? functionExpressionDeclAST.name.actualText : "";
        var decl = new TypeScript.PullFunctionExpressionDecl(name, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(functionExpressionDeclAST, decl);
        context.semanticInfo.setASTForDecl(decl, functionExpressionDeclAST);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        if (functionExpressionDeclAST.returnTypeAnnotation && ((functionExpressionDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (functionExpressionDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((functionExpressionDeclAST.returnTypeAnnotation).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return true;
    }
    TypeScript.createFunctionExpressionDeclaration = createFunctionExpressionDeclaration;

    function createMemberFunctionDeclaration(memberFunctionDeclAST, context) {
        var declFlags = TypeScript.PullElementFlags.None;
        var declType = TypeScript.PullElementKind.Method;

        if (TypeScript.hasFlag(memberFunctionDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.Static)) {
            declFlags |= TypeScript.PullElementFlags.Static;
        }

        if (TypeScript.hasFlag(memberFunctionDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.Private)) {
            declFlags |= TypeScript.PullElementFlags.Private;
        } else {
            declFlags |= TypeScript.PullElementFlags.Public;
        }

        if (!memberFunctionDeclAST.block) {
            declFlags |= TypeScript.PullElementFlags.Signature;
        }

        if (TypeScript.hasFlag(memberFunctionDeclAST.name.getFlags(), TypeScript.ASTFlags.OptionalName)) {
            declFlags |= TypeScript.PullElementFlags.Optional;
        }

        var span = TypeScript.TextSpan.fromBounds(memberFunctionDeclAST.minChar, memberFunctionDeclAST.limChar);

        var decl = new TypeScript.PullDecl(memberFunctionDeclAST.name.text, memberFunctionDeclAST.name.actualText, declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(memberFunctionDeclAST, decl);
        context.semanticInfo.setASTForDecl(decl, memberFunctionDeclAST);

        var parent = context.getParent();

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        if (memberFunctionDeclAST.returnTypeAnnotation && ((memberFunctionDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (memberFunctionDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((memberFunctionDeclAST.returnTypeAnnotation).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return true;
    }
    TypeScript.createMemberFunctionDeclaration = createMemberFunctionDeclaration;

    function createIndexSignatureDeclaration(indexSignatureDeclAST, context) {
        var declFlags = TypeScript.PullElementFlags.Signature | TypeScript.PullElementFlags.Index;
        var declType = TypeScript.PullElementKind.IndexSignature;

        var span = TypeScript.TextSpan.fromBounds(indexSignatureDeclAST.minChar, indexSignatureDeclAST.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl("[]", "[]", declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(indexSignatureDeclAST, decl);
        context.semanticInfo.setASTForDecl(decl, indexSignatureDeclAST);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        if (indexSignatureDeclAST.returnTypeAnnotation && ((indexSignatureDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (indexSignatureDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((indexSignatureDeclAST.returnTypeAnnotation).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return true;
    }
    TypeScript.createIndexSignatureDeclaration = createIndexSignatureDeclaration;

    function createCallSignatureDeclaration(callSignatureDeclAST, context) {
        var declFlags = TypeScript.PullElementFlags.Signature | TypeScript.PullElementFlags.Call;
        var declType = TypeScript.PullElementKind.CallSignature;

        var span = TypeScript.TextSpan.fromBounds(callSignatureDeclAST.minChar, callSignatureDeclAST.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl("()", "()", declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(callSignatureDeclAST, decl);
        context.semanticInfo.setASTForDecl(decl, callSignatureDeclAST);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        if (callSignatureDeclAST.returnTypeAnnotation && ((callSignatureDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (callSignatureDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((callSignatureDeclAST.returnTypeAnnotation).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return true;
    }
    TypeScript.createCallSignatureDeclaration = createCallSignatureDeclaration;

    function createConstructSignatureDeclaration(constructSignatureDeclAST, context) {
        var declFlags = TypeScript.PullElementFlags.Signature | TypeScript.PullElementFlags.Call;
        var declType = TypeScript.PullElementKind.ConstructSignature;

        var span = TypeScript.TextSpan.fromBounds(constructSignatureDeclAST.minChar, constructSignatureDeclAST.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl("new", "new", declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(constructSignatureDeclAST, decl);
        context.semanticInfo.setASTForDecl(decl, constructSignatureDeclAST);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        if (constructSignatureDeclAST.returnTypeAnnotation && ((constructSignatureDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (constructSignatureDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((constructSignatureDeclAST.returnTypeAnnotation).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return true;
    }
    TypeScript.createConstructSignatureDeclaration = createConstructSignatureDeclaration;

    function createClassConstructorDeclaration(constructorDeclAST, context) {
        var declFlags = TypeScript.PullElementFlags.Constructor;
        var declType = TypeScript.PullElementKind.ConstructorMethod;

        if (!constructorDeclAST.block) {
            declFlags |= TypeScript.PullElementFlags.Signature;
        }

        var span = TypeScript.TextSpan.fromBounds(constructorDeclAST.minChar, constructorDeclAST.limChar);

        var parent = context.getParent();

        if (parent) {
            var parentFlags = parent.getFlags();

            if (parentFlags & TypeScript.PullElementFlags.Exported) {
                declFlags |= TypeScript.PullElementFlags.Exported;
            }
        }

        var decl = new TypeScript.PullDecl(parent.getName(), parent.getDisplayName(), declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(constructorDeclAST, decl);
        context.semanticInfo.setASTForDecl(decl, constructorDeclAST);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        if (constructorDeclAST.returnTypeAnnotation && ((constructorDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (constructorDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((constructorDeclAST.returnTypeAnnotation).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return true;
    }
    TypeScript.createClassConstructorDeclaration = createClassConstructorDeclaration;

    function createGetAccessorDeclaration(getAccessorDeclAST, context) {
        var declFlags = TypeScript.PullElementFlags.Public;
        var declType = TypeScript.PullElementKind.GetAccessor;

        if (TypeScript.hasFlag(getAccessorDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.Static)) {
            declFlags |= TypeScript.PullElementFlags.Static;
        }

        if (TypeScript.hasFlag(getAccessorDeclAST.name.getFlags(), TypeScript.ASTFlags.OptionalName)) {
            declFlags |= TypeScript.PullElementFlags.Optional;
        }

        if (TypeScript.hasFlag(getAccessorDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.Private)) {
            declFlags |= TypeScript.PullElementFlags.Private;
        } else {
            declFlags |= TypeScript.PullElementFlags.Public;
        }

        var span = TypeScript.TextSpan.fromBounds(getAccessorDeclAST.minChar, getAccessorDeclAST.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl(getAccessorDeclAST.name.text, getAccessorDeclAST.name.actualText, declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(getAccessorDeclAST, decl);
        context.semanticInfo.setASTForDecl(decl, getAccessorDeclAST);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        if (getAccessorDeclAST.returnTypeAnnotation && ((getAccessorDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.InterfaceDeclaration || (getAccessorDeclAST.returnTypeAnnotation).term.nodeType === TypeScript.NodeType.FunctionDeclaration)) {
            var declCollectionContext = new DeclCollectionContext(context.semanticInfo);

            declCollectionContext.scriptName = context.scriptName;

            TypeScript.getAstWalkerFactory().walk((getAccessorDeclAST.returnTypeAnnotation).term, preCollectDecls, postCollectDecls, null, declCollectionContext);
        }

        return true;
    }
    TypeScript.createGetAccessorDeclaration = createGetAccessorDeclaration;

    function createSetAccessorDeclaration(setAccessorDeclAST, context) {
        var declFlags = TypeScript.PullElementFlags.Public;
        var declType = TypeScript.PullElementKind.SetAccessor;

        if (TypeScript.hasFlag(setAccessorDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.Static)) {
            declFlags |= TypeScript.PullElementFlags.Static;
        }

        if (TypeScript.hasFlag(setAccessorDeclAST.name.getFlags(), TypeScript.ASTFlags.OptionalName)) {
            declFlags |= TypeScript.PullElementFlags.Optional;
        }

        if (TypeScript.hasFlag(setAccessorDeclAST.getFunctionFlags(), TypeScript.FunctionFlags.Private)) {
            declFlags |= TypeScript.PullElementFlags.Private;
        } else {
            declFlags |= TypeScript.PullElementFlags.Public;
        }

        var span = TypeScript.TextSpan.fromBounds(setAccessorDeclAST.minChar, setAccessorDeclAST.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl(setAccessorDeclAST.name.actualText, setAccessorDeclAST.name.actualText, declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(setAccessorDeclAST, decl);
        context.semanticInfo.setASTForDecl(decl, setAccessorDeclAST);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        return true;
    }
    TypeScript.createSetAccessorDeclaration = createSetAccessorDeclaration;

    function preCollectCatchDecls(ast, parentAST, context) {
        var declFlags = TypeScript.PullElementFlags.None;
        var declType = TypeScript.PullElementKind.CatchBlock;

        var span = TypeScript.TextSpan.fromBounds(ast.minChar, ast.limChar);

        var parent = context.getParent();

        if (parent && (parent.getKind() === TypeScript.PullElementKind.WithBlock || (parent.getFlags() & TypeScript.PullElementFlags.DeclaredInAWithBlock))) {
            declFlags |= TypeScript.PullElementFlags.DeclaredInAWithBlock;
        }

        var decl = new TypeScript.PullDecl("", "", declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(ast, decl);
        context.semanticInfo.setASTForDecl(decl, ast);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        return true;
    }
    TypeScript.preCollectCatchDecls = preCollectCatchDecls;

    function preCollectWithDecls(ast, parentAST, context) {
        var declFlags = TypeScript.PullElementFlags.None;
        var declType = TypeScript.PullElementKind.WithBlock;

        var span = TypeScript.TextSpan.fromBounds(ast.minChar, ast.limChar);

        var parent = context.getParent();

        var decl = new TypeScript.PullDecl("", "", declType, declFlags, span, context.scriptName);
        context.semanticInfo.setDeclForAST(ast, decl);
        context.semanticInfo.setASTForDecl(decl, ast);

        if (parent) {
            parent.addChildDecl(decl);
            decl.setParentDecl(parent);
        }

        context.pushParent(decl);

        return true;
    }
    TypeScript.preCollectWithDecls = preCollectWithDecls;

    function preCollectFuncDecls(ast, parentAST, context) {
        var funcDecl = ast;

        if (funcDecl.isConstructor) {
            return createClassConstructorDeclaration(funcDecl, context);
        } else if (funcDecl.isGetAccessor()) {
            return createGetAccessorDeclaration(funcDecl, context);
        } else if (funcDecl.isSetAccessor()) {
            return createSetAccessorDeclaration(funcDecl, context);
        } else if (TypeScript.hasFlag(funcDecl.getFunctionFlags(), TypeScript.FunctionFlags.ConstructMember)) {
            return TypeScript.hasFlag(funcDecl.getFlags(), TypeScript.ASTFlags.TypeReference) ? createConstructorTypeDeclaration(funcDecl, context) : createConstructSignatureDeclaration(funcDecl, context);
        } else if (TypeScript.hasFlag(funcDecl.getFunctionFlags(), TypeScript.FunctionFlags.CallMember)) {
            return createCallSignatureDeclaration(funcDecl, context);
        } else if (TypeScript.hasFlag(funcDecl.getFunctionFlags(), TypeScript.FunctionFlags.IndexerMember)) {
            return createIndexSignatureDeclaration(funcDecl, context);
        } else if (TypeScript.hasFlag(funcDecl.getFlags(), TypeScript.ASTFlags.TypeReference)) {
            return createFunctionTypeDeclaration(funcDecl, context);
        } else if (TypeScript.hasFlag(funcDecl.getFunctionFlags(), TypeScript.FunctionFlags.Method)) {
            return createMemberFunctionDeclaration(funcDecl, context);
        } else if (TypeScript.hasFlag(funcDecl.getFunctionFlags(), (TypeScript.FunctionFlags.IsFunctionExpression | TypeScript.FunctionFlags.IsFatArrowFunction | TypeScript.FunctionFlags.IsFunctionProperty))) {
            return createFunctionExpressionDeclaration(funcDecl, context);
        }

        return createFunctionDeclaration(funcDecl, context);
    }
    TypeScript.preCollectFuncDecls = preCollectFuncDecls;

    function preCollectDecls(ast, parentAST, walker) {
        var context = walker.state;
        var go = false;

        if (ast.nodeType === TypeScript.NodeType.Script) {
            var script = ast;
            var span = TypeScript.TextSpan.fromBounds(script.minChar, script.limChar);

            var decl = new TypeScript.PullDecl(context.scriptName, context.scriptName, TypeScript.PullElementKind.Script, TypeScript.PullElementFlags.None, span, context.scriptName);
            context.semanticInfo.setDeclForAST(ast, decl);
            context.semanticInfo.setASTForDecl(decl, ast);

            context.pushParent(decl);

            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.List) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.Block) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.VariableDeclaration) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.VariableStatement) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.ModuleDeclaration) {
            go = preCollectModuleDecls(ast, parentAST, context);
        } else if (ast.nodeType === TypeScript.NodeType.ClassDeclaration) {
            go = preCollectClassDecls(ast, parentAST, context);
        } else if (ast.nodeType === TypeScript.NodeType.InterfaceDeclaration) {
            go = preCollectInterfaceDecls(ast, parentAST, context);
        } else if (ast.nodeType === TypeScript.NodeType.Parameter) {
            go = preCollectParameterDecl(ast, parentAST, context);
        } else if (ast.nodeType === TypeScript.NodeType.VariableDeclarator) {
            go = preCollectVarDecls(ast, parentAST, context);
        } else if (ast.nodeType === TypeScript.NodeType.FunctionDeclaration) {
            go = preCollectFuncDecls(ast, parentAST, context);
        } else if (ast.nodeType === TypeScript.NodeType.ImportDeclaration) {
            go = preCollectImportDecls(ast, parentAST, context);
        } else if (ast.nodeType === TypeScript.NodeType.TypeParameter) {
            go = preCollectTypeParameterDecl(ast, parentAST, context);
        } else if (ast.nodeType === TypeScript.NodeType.IfStatement) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.ForStatement) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.ForInStatement) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.WhileStatement) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.DoStatement) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.CommaExpression) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.ReturnStatement) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.SwitchStatement || ast.nodeType === TypeScript.NodeType.CaseClause) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.InvocationExpression) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.ObjectCreationExpression) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.TryStatement) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.LabeledStatement) {
            go = true;
        } else if (ast.nodeType === TypeScript.NodeType.CatchClause) {
            go = preCollectCatchDecls(ast, parentAST, context);
        } else if (ast.nodeType === TypeScript.NodeType.WithStatement) {
            go = preCollectWithDecls(ast, parentAST, context);
        }

        walker.options.goChildren = go;

        return ast;
    }
    TypeScript.preCollectDecls = preCollectDecls;

    function isContainer(decl) {
        return decl.getKind() === TypeScript.PullElementKind.Container || decl.getKind() === TypeScript.PullElementKind.DynamicModule || decl.getKind() === TypeScript.PullElementKind.Enum;
    }

    function getInitializationFlag(decl) {
        if (decl.getKind() & TypeScript.PullElementKind.Container) {
            return TypeScript.PullElementFlags.InitializedModule;
        } else if (decl.getKind() & TypeScript.PullElementKind.Enum) {
            return TypeScript.PullElementFlags.InitializedEnum;
        } else if (decl.getKind() & TypeScript.PullElementKind.DynamicModule) {
            return TypeScript.PullElementFlags.InitializedDynamicModule;
        }

        return TypeScript.PullElementFlags.None;
    }

    function hasInitializationFlag(decl) {
        var kind = decl.getKind();

        if (kind & TypeScript.PullElementKind.Container) {
            return (decl.getFlags() & TypeScript.PullElementFlags.InitializedModule) !== 0;
        } else if (kind & TypeScript.PullElementKind.Enum) {
            return (decl.getFlags() & TypeScript.PullElementFlags.InitializedEnum) != 0;
        } else if (kind & TypeScript.PullElementKind.DynamicModule) {
            return (decl.getFlags() & TypeScript.PullElementFlags.InitializedDynamicModule) !== 0;
        }

        return false;
    }

    function postCollectDecls(ast, parentAST, walker) {
        var context = walker.state;
        var parentDecl;
        var initFlag = TypeScript.PullElementFlags.None;

        if (ast.nodeType === TypeScript.NodeType.ModuleDeclaration) {
            var thisModule = context.getParent();
            context.popParent();
            parentDecl = context.getParent();

            if (hasInitializationFlag(thisModule)) {
                if (parentDecl && isContainer(parentDecl)) {
                    initFlag = getInitializationFlag(parentDecl);
                    parentDecl.setFlags(parentDecl.getFlags() | initFlag);
                }

                var valueDecl = new TypeScript.PullDecl(thisModule.getName(), thisModule.getDisplayName(), TypeScript.PullElementKind.Variable, thisModule.getFlags(), thisModule.getSpan(), context.scriptName);

                thisModule.setValueDecl(valueDecl);

                context.semanticInfo.setASTForDecl(valueDecl, ast);

                if (parentDecl) {
                    parentDecl.addChildDecl(valueDecl);
                    valueDecl.setParentDecl(parentDecl);
                }
            }
        } else if (ast.nodeType === TypeScript.NodeType.ClassDeclaration) {
            context.popParent();

            parentDecl = context.getParent();

            if (parentDecl && isContainer(parentDecl)) {
                initFlag = getInitializationFlag(parentDecl);
                parentDecl.setFlags(parentDecl.getFlags() | initFlag);
            }
        } else if (ast.nodeType === TypeScript.NodeType.InterfaceDeclaration) {
            context.popParent();
        } else if (ast.nodeType === TypeScript.NodeType.FunctionDeclaration) {
            context.popParent();

            parentDecl = context.getParent();

            if (parentDecl && isContainer(parentDecl)) {
                initFlag = getInitializationFlag(parentDecl);
                parentDecl.setFlags(parentDecl.getFlags() | initFlag);
            }
        } else if (ast.nodeType === TypeScript.NodeType.VariableDeclarator) {
            parentDecl = context.getParent();

            if (parentDecl && isContainer(parentDecl)) {
                initFlag = getInitializationFlag(parentDecl);
                parentDecl.setFlags(parentDecl.getFlags() | initFlag);
            }
        } else if (ast.nodeType === TypeScript.NodeType.CatchClause) {
            parentDecl = context.getParent();

            if (parentDecl && isContainer(parentDecl)) {
                initFlag = getInitializationFlag(parentDecl);
                parentDecl.setFlags(parentDecl.getFlags() | initFlag);
            }

            context.popParent();
        } else if (ast.nodeType === TypeScript.NodeType.WithStatement) {
            parentDecl = context.getParent();

            if (parentDecl && isContainer(parentDecl)) {
                initFlag = getInitializationFlag(parentDecl);
                parentDecl.setFlags(parentDecl.getFlags() | initFlag);
            }

            context.popParent();
        }

        return ast;
    }
    TypeScript.postCollectDecls = postCollectDecls;
})(TypeScript || (TypeScript = {}));
