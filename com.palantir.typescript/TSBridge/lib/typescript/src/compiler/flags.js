var TypeScript;
(function (TypeScript) {
    function hasFlag(val, flag) {
        return (val & flag) !== 0;
    }
    TypeScript.hasFlag = hasFlag;

    function withoutFlag(val, flag) {
        return val & ~flag;
    }
    TypeScript.withoutFlag = withoutFlag;

    (function (ASTFlags) {
        ASTFlags[ASTFlags["None"] = 0] = "None";
        ASTFlags[ASTFlags["SingleLine"] = 1 << 1] = "SingleLine";
        ASTFlags[ASTFlags["OptionalName"] = 1 << 2] = "OptionalName";
        ASTFlags[ASTFlags["TypeReference"] = 1 << 3] = "TypeReference";
        ASTFlags[ASTFlags["EnumElement"] = 1 << 4] = "EnumElement";
        ASTFlags[ASTFlags["EnumMapElement"] = 1 << 5] = "EnumMapElement";
    })(TypeScript.ASTFlags || (TypeScript.ASTFlags = {}));
    var ASTFlags = TypeScript.ASTFlags;

    (function (DeclFlags) {
        DeclFlags[DeclFlags["None"] = 0] = "None";
        DeclFlags[DeclFlags["Exported"] = 1] = "Exported";
        DeclFlags[DeclFlags["Private"] = 1 << 1] = "Private";
        DeclFlags[DeclFlags["Public"] = 1 << 2] = "Public";
        DeclFlags[DeclFlags["Ambient"] = 1 << 3] = "Ambient";
        DeclFlags[DeclFlags["Static"] = 1 << 4] = "Static";
    })(TypeScript.DeclFlags || (TypeScript.DeclFlags = {}));
    var DeclFlags = TypeScript.DeclFlags;

    (function (ModuleFlags) {
        ModuleFlags[ModuleFlags["None"] = 0] = "None";
        ModuleFlags[ModuleFlags["Exported"] = 1] = "Exported";
        ModuleFlags[ModuleFlags["Private"] = 1 << 1] = "Private";
        ModuleFlags[ModuleFlags["Public"] = 1 << 2] = "Public";
        ModuleFlags[ModuleFlags["Ambient"] = 1 << 3] = "Ambient";
        ModuleFlags[ModuleFlags["Static"] = 1 << 4] = "Static";
        ModuleFlags[ModuleFlags["IsEnum"] = 1 << 7] = "IsEnum";
        ModuleFlags[ModuleFlags["IsWholeFile"] = 1 << 8] = "IsWholeFile";
        ModuleFlags[ModuleFlags["IsDynamic"] = 1 << 9] = "IsDynamic";
    })(TypeScript.ModuleFlags || (TypeScript.ModuleFlags = {}));
    var ModuleFlags = TypeScript.ModuleFlags;

    (function (VariableFlags) {
        VariableFlags[VariableFlags["None"] = 0] = "None";
        VariableFlags[VariableFlags["Exported"] = 1] = "Exported";
        VariableFlags[VariableFlags["Private"] = 1 << 1] = "Private";
        VariableFlags[VariableFlags["Public"] = 1 << 2] = "Public";
        VariableFlags[VariableFlags["Ambient"] = 1 << 3] = "Ambient";
        VariableFlags[VariableFlags["Static"] = 1 << 4] = "Static";
        VariableFlags[VariableFlags["Property"] = 1 << 8] = "Property";
        VariableFlags[VariableFlags["ClassProperty"] = 1 << 11] = "ClassProperty";
        VariableFlags[VariableFlags["Constant"] = 1 << 12] = "Constant";

        VariableFlags[VariableFlags["EnumElement"] = 1 << 13] = "EnumElement";
    })(TypeScript.VariableFlags || (TypeScript.VariableFlags = {}));
    var VariableFlags = TypeScript.VariableFlags;

    (function (FunctionFlags) {
        FunctionFlags[FunctionFlags["None"] = 0] = "None";
        FunctionFlags[FunctionFlags["Exported"] = 1] = "Exported";
        FunctionFlags[FunctionFlags["Private"] = 1 << 1] = "Private";
        FunctionFlags[FunctionFlags["Public"] = 1 << 2] = "Public";
        FunctionFlags[FunctionFlags["Ambient"] = 1 << 3] = "Ambient";
        FunctionFlags[FunctionFlags["Static"] = 1 << 4] = "Static";
        FunctionFlags[FunctionFlags["GetAccessor"] = 1 << 5] = "GetAccessor";
        FunctionFlags[FunctionFlags["SetAccessor"] = 1 << 6] = "SetAccessor";
        FunctionFlags[FunctionFlags["Signature"] = 1 << 7] = "Signature";
        FunctionFlags[FunctionFlags["Method"] = 1 << 8] = "Method";
        FunctionFlags[FunctionFlags["CallMember"] = 1 << 9] = "CallMember";
        FunctionFlags[FunctionFlags["ConstructMember"] = 1 << 10] = "ConstructMember";
        FunctionFlags[FunctionFlags["IsFatArrowFunction"] = 1 << 11] = "IsFatArrowFunction";
        FunctionFlags[FunctionFlags["IndexerMember"] = 1 << 12] = "IndexerMember";
        FunctionFlags[FunctionFlags["IsFunctionExpression"] = 1 << 13] = "IsFunctionExpression";
        FunctionFlags[FunctionFlags["IsFunctionProperty"] = 1 << 14] = "IsFunctionProperty";
    })(TypeScript.FunctionFlags || (TypeScript.FunctionFlags = {}));
    var FunctionFlags = TypeScript.FunctionFlags;

    function ToDeclFlags(fncOrVarOrModuleFlags) {
        return fncOrVarOrModuleFlags;
    }
    TypeScript.ToDeclFlags = ToDeclFlags;

    (function (TypeRelationshipFlags) {
        TypeRelationshipFlags[TypeRelationshipFlags["SuccessfulComparison"] = 0] = "SuccessfulComparison";
        TypeRelationshipFlags[TypeRelationshipFlags["RequiredPropertyIsMissing"] = 1 << 1] = "RequiredPropertyIsMissing";
        TypeRelationshipFlags[TypeRelationshipFlags["IncompatibleSignatures"] = 1 << 2] = "IncompatibleSignatures";
        TypeRelationshipFlags[TypeRelationshipFlags["SourceSignatureHasTooManyParameters"] = 3] = "SourceSignatureHasTooManyParameters";
        TypeRelationshipFlags[TypeRelationshipFlags["IncompatibleReturnTypes"] = 1 << 4] = "IncompatibleReturnTypes";
        TypeRelationshipFlags[TypeRelationshipFlags["IncompatiblePropertyTypes"] = 1 << 5] = "IncompatiblePropertyTypes";
        TypeRelationshipFlags[TypeRelationshipFlags["IncompatibleParameterTypes"] = 1 << 6] = "IncompatibleParameterTypes";
        TypeRelationshipFlags[TypeRelationshipFlags["InconsistantPropertyAccesibility"] = 1 << 7] = "InconsistantPropertyAccesibility";
    })(TypeScript.TypeRelationshipFlags || (TypeScript.TypeRelationshipFlags = {}));
    var TypeRelationshipFlags = TypeScript.TypeRelationshipFlags;

    (function (ModuleGenTarget) {
        ModuleGenTarget[ModuleGenTarget["Synchronous"] = 0] = "Synchronous";
        ModuleGenTarget[ModuleGenTarget["Asynchronous"] = 1] = "Asynchronous";
    })(TypeScript.ModuleGenTarget || (TypeScript.ModuleGenTarget = {}));
    var ModuleGenTarget = TypeScript.ModuleGenTarget;
})(TypeScript || (TypeScript = {}));
