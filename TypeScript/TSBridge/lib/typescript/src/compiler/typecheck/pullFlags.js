var TypeScript;
(function (TypeScript) {
    (function (PullElementFlags) {
        PullElementFlags[PullElementFlags["None"] = 0] = "None";
        PullElementFlags[PullElementFlags["Exported"] = 1] = "Exported";
        PullElementFlags[PullElementFlags["Private"] = 1 << 1] = "Private";
        PullElementFlags[PullElementFlags["Public"] = 1 << 2] = "Public";
        PullElementFlags[PullElementFlags["Ambient"] = 1 << 3] = "Ambient";
        PullElementFlags[PullElementFlags["Static"] = 1 << 4] = "Static";
        PullElementFlags[PullElementFlags["GetAccessor"] = 1 << 5] = "GetAccessor";
        PullElementFlags[PullElementFlags["SetAccessor"] = 1 << 6] = "SetAccessor";
        PullElementFlags[PullElementFlags["Optional"] = 1 << 7] = "Optional";
        PullElementFlags[PullElementFlags["Call"] = 1 << 8] = "Call";
        PullElementFlags[PullElementFlags["Constructor"] = 1 << 9] = "Constructor";
        PullElementFlags[PullElementFlags["Index"] = 1 << 10] = "Index";
        PullElementFlags[PullElementFlags["Signature"] = 1 << 11] = "Signature";
        PullElementFlags[PullElementFlags["Enum"] = 1 << 12] = "Enum";
        PullElementFlags[PullElementFlags["FatArrow"] = 1 << 13] = "FatArrow";

        PullElementFlags[PullElementFlags["ClassConstructorVariable"] = 1 << 14] = "ClassConstructorVariable";
        PullElementFlags[PullElementFlags["InitializedModule"] = 1 << 15] = "InitializedModule";
        PullElementFlags[PullElementFlags["InitializedDynamicModule"] = 1 << 16] = "InitializedDynamicModule";
        PullElementFlags[PullElementFlags["InitializedEnum"] = 1 << 17] = "InitializedEnum";

        PullElementFlags[PullElementFlags["MustCaptureThis"] = 1 << 18] = "MustCaptureThis";
        PullElementFlags[PullElementFlags["Constant"] = 1 << 19] = "Constant";

        PullElementFlags[PullElementFlags["ExpressionElement"] = 1 << 20] = "ExpressionElement";

        PullElementFlags[PullElementFlags["DeclaredInAWithBlock"] = 1 << 21] = "DeclaredInAWithBlock";

        PullElementFlags[PullElementFlags["ImplicitVariable"] = PullElementFlags.ClassConstructorVariable | PullElementFlags.InitializedModule | PullElementFlags.InitializedDynamicModule | PullElementFlags.InitializedEnum] = "ImplicitVariable";
        PullElementFlags[PullElementFlags["SomeInitializedModule"] = PullElementFlags.InitializedModule | PullElementFlags.InitializedDynamicModule | PullElementFlags.InitializedEnum] = "SomeInitializedModule";
    })(TypeScript.PullElementFlags || (TypeScript.PullElementFlags = {}));
    var PullElementFlags = TypeScript.PullElementFlags;

    (function (PullElementKind) {
        PullElementKind[PullElementKind["None"] = 0] = "None";
        PullElementKind[PullElementKind["Global"] = 0] = "Global";

        PullElementKind[PullElementKind["Script"] = 1] = "Script";
        PullElementKind[PullElementKind["Primitive"] = 1 << 1] = "Primitive";

        PullElementKind[PullElementKind["Container"] = 1 << 2] = "Container";
        PullElementKind[PullElementKind["Class"] = 1 << 3] = "Class";
        PullElementKind[PullElementKind["Interface"] = 1 << 4] = "Interface";
        PullElementKind[PullElementKind["DynamicModule"] = 1 << 5] = "DynamicModule";
        PullElementKind[PullElementKind["Enum"] = 1 << 6] = "Enum";
        PullElementKind[PullElementKind["Array"] = 1 << 7] = "Array";
        PullElementKind[PullElementKind["TypeAlias"] = 1 << 8] = "TypeAlias";
        PullElementKind[PullElementKind["ObjectLiteral"] = 1 << 9] = "ObjectLiteral";

        PullElementKind[PullElementKind["Variable"] = 1 << 10] = "Variable";
        PullElementKind[PullElementKind["Parameter"] = 1 << 11] = "Parameter";
        PullElementKind[PullElementKind["Property"] = 1 << 12] = "Property";
        PullElementKind[PullElementKind["TypeParameter"] = 1 << 13] = "TypeParameter";

        PullElementKind[PullElementKind["Function"] = 1 << 14] = "Function";
        PullElementKind[PullElementKind["ConstructorMethod"] = 1 << 15] = "ConstructorMethod";
        PullElementKind[PullElementKind["Method"] = 1 << 16] = "Method";
        PullElementKind[PullElementKind["FunctionExpression"] = 1 << 17] = "FunctionExpression";

        PullElementKind[PullElementKind["GetAccessor"] = 1 << 18] = "GetAccessor";
        PullElementKind[PullElementKind["SetAccessor"] = 1 << 19] = "SetAccessor";

        PullElementKind[PullElementKind["CallSignature"] = 1 << 20] = "CallSignature";
        PullElementKind[PullElementKind["ConstructSignature"] = 1 << 21] = "ConstructSignature";
        PullElementKind[PullElementKind["IndexSignature"] = 1 << 22] = "IndexSignature";

        PullElementKind[PullElementKind["ObjectType"] = 1 << 23] = "ObjectType";
        PullElementKind[PullElementKind["FunctionType"] = 1 << 24] = "FunctionType";
        PullElementKind[PullElementKind["ConstructorType"] = 1 << 25] = "ConstructorType";

        PullElementKind[PullElementKind["EnumMember"] = 1 << 26] = "EnumMember";
        PullElementKind[PullElementKind["ErrorType"] = 1 << 27] = "ErrorType";

        PullElementKind[PullElementKind["Expression"] = 1 << 28] = "Expression";

        PullElementKind[PullElementKind["WithBlock"] = 1 << 29] = "WithBlock";
        PullElementKind[PullElementKind["CatchBlock"] = 1 << 30] = "CatchBlock";

        PullElementKind[PullElementKind["All"] = PullElementKind.Script | PullElementKind.Global | PullElementKind.Primitive | PullElementKind.Container | PullElementKind.Class | PullElementKind.Interface | PullElementKind.DynamicModule | PullElementKind.Enum | PullElementKind.Array | PullElementKind.TypeAlias | PullElementKind.ObjectLiteral | PullElementKind.Variable | PullElementKind.Parameter | PullElementKind.Property | PullElementKind.TypeParameter | PullElementKind.Function | PullElementKind.ConstructorMethod | PullElementKind.Method | PullElementKind.FunctionExpression | PullElementKind.GetAccessor | PullElementKind.SetAccessor | PullElementKind.CallSignature | PullElementKind.ConstructSignature | PullElementKind.IndexSignature | PullElementKind.ObjectType | PullElementKind.FunctionType | PullElementKind.ConstructorType | PullElementKind.EnumMember | PullElementKind.ErrorType | PullElementKind.Expression | PullElementKind.WithBlock | PullElementKind.CatchBlock] = "All";

        PullElementKind[PullElementKind["SomeFunction"] = PullElementKind.Function | PullElementKind.ConstructorMethod | PullElementKind.Method | PullElementKind.FunctionExpression | PullElementKind.GetAccessor | PullElementKind.SetAccessor | PullElementKind.CallSignature | PullElementKind.ConstructSignature | PullElementKind.IndexSignature] = "SomeFunction";

        PullElementKind[PullElementKind["SomeValue"] = PullElementKind.Variable | PullElementKind.Parameter | PullElementKind.Property | PullElementKind.EnumMember | PullElementKind.SomeFunction] = "SomeValue";

        PullElementKind[PullElementKind["SomeType"] = PullElementKind.Script | PullElementKind.Global | PullElementKind.Primitive | PullElementKind.Class | PullElementKind.Interface | PullElementKind.Enum | PullElementKind.Array | PullElementKind.ObjectType | PullElementKind.FunctionType | PullElementKind.ConstructorType | PullElementKind.TypeParameter | PullElementKind.ErrorType] = "SomeType";

        PullElementKind[PullElementKind["AcceptableAlias"] = PullElementKind.Variable | PullElementKind.SomeFunction | PullElementKind.Class | PullElementKind.Interface | PullElementKind.Enum | PullElementKind.Container | PullElementKind.ObjectType | PullElementKind.FunctionType | PullElementKind.ConstructorType] = "AcceptableAlias";

        PullElementKind[PullElementKind["SomeContainer"] = PullElementKind.Container | PullElementKind.DynamicModule | PullElementKind.TypeAlias] = "SomeContainer";

        PullElementKind[PullElementKind["SomeBlock"] = PullElementKind.WithBlock | PullElementKind.CatchBlock] = "SomeBlock";

        PullElementKind[PullElementKind["SomeSignature"] = PullElementKind.CallSignature | PullElementKind.ConstructSignature | PullElementKind.IndexSignature] = "SomeSignature";

        PullElementKind[PullElementKind["SomeAccessor"] = PullElementKind.GetAccessor | PullElementKind.SetAccessor] = "SomeAccessor";

        PullElementKind[PullElementKind["SomeTypeReference"] = PullElementKind.Interface | PullElementKind.ObjectType | PullElementKind.FunctionType | PullElementKind.ConstructorType] = "SomeTypeReference";

        PullElementKind[PullElementKind["SomeLHS"] = PullElementKind.Variable | PullElementKind.Property | PullElementKind.Parameter | PullElementKind.SetAccessor | PullElementKind.Method] = "SomeLHS";

        PullElementKind[PullElementKind["InterfaceTypeExtension"] = PullElementKind.Interface | PullElementKind.Class | PullElementKind.Enum] = "InterfaceTypeExtension";
        PullElementKind[PullElementKind["ClassTypeExtension"] = PullElementKind.Interface | PullElementKind.Class] = "ClassTypeExtension";
        PullElementKind[PullElementKind["EnumTypeExtension"] = PullElementKind.Interface | PullElementKind.Enum] = "EnumTypeExtension";
    })(TypeScript.PullElementKind || (TypeScript.PullElementKind = {}));
    var PullElementKind = TypeScript.PullElementKind;

    (function (SymbolLinkKind) {
        SymbolLinkKind[SymbolLinkKind["TypedAs"] = 0] = "TypedAs";
        SymbolLinkKind[SymbolLinkKind["ContextuallyTypedAs"] = 1] = "ContextuallyTypedAs";
        SymbolLinkKind[SymbolLinkKind["ProvidesInferredType"] = 2] = "ProvidesInferredType";
        SymbolLinkKind[SymbolLinkKind["ArrayType"] = 3] = "ArrayType";

        SymbolLinkKind[SymbolLinkKind["ArrayOf"] = 4] = "ArrayOf";

        SymbolLinkKind[SymbolLinkKind["PublicMember"] = 5] = "PublicMember";
        SymbolLinkKind[SymbolLinkKind["PrivateMember"] = 6] = "PrivateMember";

        SymbolLinkKind[SymbolLinkKind["ConstructorMethod"] = 7] = "ConstructorMethod";

        SymbolLinkKind[SymbolLinkKind["Aliases"] = 8] = "Aliases";
        SymbolLinkKind[SymbolLinkKind["ExportAliases"] = 9] = "ExportAliases";

        SymbolLinkKind[SymbolLinkKind["ContainedBy"] = 10] = "ContainedBy";

        SymbolLinkKind[SymbolLinkKind["Extends"] = 11] = "Extends";
        SymbolLinkKind[SymbolLinkKind["Implements"] = 12] = "Implements";

        SymbolLinkKind[SymbolLinkKind["Parameter"] = 13] = "Parameter";
        SymbolLinkKind[SymbolLinkKind["ReturnType"] = 14] = "ReturnType";

        SymbolLinkKind[SymbolLinkKind["CallSignature"] = 15] = "CallSignature";
        SymbolLinkKind[SymbolLinkKind["ConstructSignature"] = 16] = "ConstructSignature";
        SymbolLinkKind[SymbolLinkKind["IndexSignature"] = 17] = "IndexSignature";

        SymbolLinkKind[SymbolLinkKind["TypeParameter"] = 18] = "TypeParameter";
        SymbolLinkKind[SymbolLinkKind["TypeArgument"] = 19] = "TypeArgument";
        SymbolLinkKind[SymbolLinkKind["TypeParameterSpecializedTo"] = 20] = "TypeParameterSpecializedTo";
        SymbolLinkKind[SymbolLinkKind["SpecializedTo"] = 21] = "SpecializedTo";

        SymbolLinkKind[SymbolLinkKind["TypeConstraint"] = 22] = "TypeConstraint";

        SymbolLinkKind[SymbolLinkKind["ContributesToExpression"] = 23] = "ContributesToExpression";

        SymbolLinkKind[SymbolLinkKind["GetterFunction"] = 24] = "GetterFunction";
        SymbolLinkKind[SymbolLinkKind["SetterFunction"] = 25] = "SetterFunction";
    })(TypeScript.SymbolLinkKind || (TypeScript.SymbolLinkKind = {}));
    var SymbolLinkKind = TypeScript.SymbolLinkKind;
})(TypeScript || (TypeScript = {}));
