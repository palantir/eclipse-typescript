var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Services;
(function (Services) {
    function logInternalError(logger, err) {
        logger.log("*INTERNAL ERROR* - Exception in typescript services: " + err.message);
    }
    Services.logInternalError = logInternalError;

    var ReferenceEntry = (function () {
        function ReferenceEntry(fileName, minChar, limChar, isWriteAccess) {
            this.fileName = "";
            this.minChar = -1;
            this.limChar = -1;
            this.isWriteAccess = false;
            this.fileName = fileName;
            this.minChar = minChar;
            this.limChar = limChar;
            this.isWriteAccess = isWriteAccess;
        }
        return ReferenceEntry;
    })();
    Services.ReferenceEntry = ReferenceEntry;

    var NavigateToItem = (function () {
        function NavigateToItem() {
            this.name = "";
            this.kind = "";
            this.kindModifiers = "";
            this.matchKind = "";
            this.fileName = "";
            this.minChar = -1;
            this.limChar = -1;
            this.containerName = "";
            this.containerKind = "";
        }
        return NavigateToItem;
    })();
    Services.NavigateToItem = NavigateToItem;

    var NavigateToContext = (function () {
        function NavigateToContext() {
            this.options = new TypeScript.AstWalkOptions();
            this.fileName = "";
            this.containerKinds = [];
            this.containerASTs = [];
            this.path = new TypeScript.AstPath();
            this.result = [];
        }
        return NavigateToContext;
    })();
    Services.NavigateToContext = NavigateToContext;

    var TextEdit = (function () {
        function TextEdit(minChar, limChar, text) {
            this.minChar = minChar;
            this.limChar = limChar;
            this.text = text;
        }
        TextEdit.createInsert = function (pos, text) {
            return new TextEdit(pos, pos, text);
        };
        TextEdit.createDelete = function (minChar, limChar) {
            return new TextEdit(minChar, limChar, "");
        };
        TextEdit.createReplace = function (minChar, limChar, text) {
            return new TextEdit(minChar, limChar, text);
        };
        return TextEdit;
    })();
    Services.TextEdit = TextEdit;

    var EditorOptions = (function () {
        function EditorOptions() {
            this.IndentSize = 4;
            this.TabSize = 4;
            this.NewLineCharacter = "\r\n";
            this.ConvertTabsToSpaces = true;
        }
        EditorOptions.clone = function (objectToClone) {
            var editorOptions = new EditorOptions();
            editorOptions.IndentSize = objectToClone.IndentSize;
            editorOptions.TabSize = objectToClone.TabSize;
            editorOptions.NewLineCharacter = objectToClone.NewLineCharacter;
            editorOptions.ConvertTabsToSpaces = objectToClone.ConvertTabsToSpaces;
            return editorOptions;
        };
        return EditorOptions;
    })();
    Services.EditorOptions = EditorOptions;

    var FormatCodeOptions = (function (_super) {
        __extends(FormatCodeOptions, _super);
        function FormatCodeOptions() {
            _super.apply(this, arguments);
            this.InsertSpaceAfterCommaDelimiter = true;
            this.InsertSpaceAfterSemicolonInForStatements = true;
            this.InsertSpaceBeforeAndAfterBinaryOperators = true;
            this.InsertSpaceAfterKeywordsInControlFlowStatements = true;
            this.InsertSpaceAfterFunctionKeywordForAnonymousFunctions = false;
            this.InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis = false;
            this.PlaceOpenBraceOnNewLineForFunctions = false;
            this.PlaceOpenBraceOnNewLineForControlBlocks = false;
        }
        FormatCodeOptions.clone = function (objectToClone) {
            var formatCodeOptions = EditorOptions.clone(objectToClone);
            formatCodeOptions.InsertSpaceAfterCommaDelimiter = objectToClone.InsertSpaceAfterCommaDelimiter;
            formatCodeOptions.InsertSpaceAfterSemicolonInForStatements = objectToClone.InsertSpaceAfterSemicolonInForStatements;
            formatCodeOptions.InsertSpaceBeforeAndAfterBinaryOperators = objectToClone.InsertSpaceBeforeAndAfterBinaryOperators;
            formatCodeOptions.InsertSpaceAfterKeywordsInControlFlowStatements = objectToClone.InsertSpaceAfterKeywordsInControlFlowStatements;
            formatCodeOptions.InsertSpaceAfterFunctionKeywordForAnonymousFunctions = objectToClone.InsertSpaceAfterFunctionKeywordForAnonymousFunctions;
            formatCodeOptions.InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis = objectToClone.InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis;
            formatCodeOptions.PlaceOpenBraceOnNewLineForFunctions = objectToClone.PlaceOpenBraceOnNewLineForFunctions;
            formatCodeOptions.PlaceOpenBraceOnNewLineForControlBlocks = objectToClone.PlaceOpenBraceOnNewLineForControlBlocks;
            return formatCodeOptions;
        };
        return FormatCodeOptions;
    })(EditorOptions);
    Services.FormatCodeOptions = FormatCodeOptions;

    var DefinitionInfo = (function () {
        function DefinitionInfo(fileName, minChar, limChar, kind, name, containerKind, containerName) {
            this.fileName = fileName;
            this.minChar = minChar;
            this.limChar = limChar;
            this.kind = kind;
            this.name = name;
            this.containerKind = containerKind;
            this.containerName = containerName;
        }
        return DefinitionInfo;
    })();
    Services.DefinitionInfo = DefinitionInfo;

    var TypeInfo = (function () {
        function TypeInfo(memberName, docComment, fullSymbolName, kind, minChar, limChar) {
            this.memberName = memberName;
            this.docComment = docComment;
            this.fullSymbolName = fullSymbolName;
            this.kind = kind;
            this.minChar = minChar;
            this.limChar = limChar;
        }
        return TypeInfo;
    })();
    Services.TypeInfo = TypeInfo;

    var SpanInfo = (function () {
        function SpanInfo(minChar, limChar, text) {
            if (typeof text === "undefined") { text = null; }
            this.minChar = minChar;
            this.limChar = limChar;
            this.text = text;
        }
        return SpanInfo;
    })();
    Services.SpanInfo = SpanInfo;

    var SignatureInfo = (function () {
        function SignatureInfo() {
            this.formal = [];
        }
        return SignatureInfo;
    })();
    Services.SignatureInfo = SignatureInfo;

    var FormalSignatureItemInfo = (function () {
        function FormalSignatureItemInfo() {
            this.typeParameters = [];
            this.parameters = [];
        }
        return FormalSignatureItemInfo;
    })();
    Services.FormalSignatureItemInfo = FormalSignatureItemInfo;

    var FormalTypeParameterInfo = (function () {
        function FormalTypeParameterInfo() {
        }
        return FormalTypeParameterInfo;
    })();
    Services.FormalTypeParameterInfo = FormalTypeParameterInfo;

    var FormalParameterInfo = (function () {
        function FormalParameterInfo() {
        }
        return FormalParameterInfo;
    })();
    Services.FormalParameterInfo = FormalParameterInfo;

    var ActualSignatureInfo = (function () {
        function ActualSignatureInfo() {
        }
        return ActualSignatureInfo;
    })();
    Services.ActualSignatureInfo = ActualSignatureInfo;

    var CompletionInfo = (function () {
        function CompletionInfo() {
            this.maybeInaccurate = false;
            this.isMemberCompletion = false;
            this.entries = [];
        }
        return CompletionInfo;
    })();
    Services.CompletionInfo = CompletionInfo;

    var CompletionEntry = (function () {
        function CompletionEntry() {
            this.name = "";
            this.type = "";
            this.kind = "";
            this.kindModifiers = "";
            this.fullSymbolName = "";
            this.docComment = "";
        }
        return CompletionEntry;
    })();
    Services.CompletionEntry = CompletionEntry;

    var ScriptElementKind = (function () {
        function ScriptElementKind() {
        }
        ScriptElementKind.unknown = "";

        ScriptElementKind.keyword = "keyword";

        ScriptElementKind.scriptElement = "script";

        ScriptElementKind.moduleElement = "module";

        ScriptElementKind.classElement = "class";

        ScriptElementKind.interfaceElement = "interface";

        ScriptElementKind.enumElement = "enum";

        ScriptElementKind.variableElement = "var";

        ScriptElementKind.localVariableElement = "local var";

        ScriptElementKind.functionElement = "function";

        ScriptElementKind.localFunctionElement = "local function";

        ScriptElementKind.memberFunctionElement = "method";

        ScriptElementKind.memberGetAccessorElement = "getter";
        ScriptElementKind.memberSetAccessorElement = "setter";

        ScriptElementKind.memberVariableElement = "property";

        ScriptElementKind.constructorImplementationElement = "constructor";

        ScriptElementKind.callSignatureElement = "call";

        ScriptElementKind.indexSignatureElement = "index";

        ScriptElementKind.constructSignatureElement = "construct";

        ScriptElementKind.parameterElement = "parameter";

        ScriptElementKind.typeParameterElement = "type parameter";

        ScriptElementKind.primitiveType = "primitive type";
        return ScriptElementKind;
    })();
    Services.ScriptElementKind = ScriptElementKind;

    var ScriptElementKindModifier = (function () {
        function ScriptElementKindModifier() {
        }
        ScriptElementKindModifier.none = "";
        ScriptElementKindModifier.publicMemberModifier = "public";
        ScriptElementKindModifier.privateMemberModifier = "private";
        ScriptElementKindModifier.exportedModifier = "export";
        ScriptElementKindModifier.ambientModifier = "declare";
        ScriptElementKindModifier.staticModifier = "static";
        return ScriptElementKindModifier;
    })();
    Services.ScriptElementKindModifier = ScriptElementKindModifier;

    var MatchKind = (function () {
        function MatchKind() {
        }
        MatchKind.none = null;
        MatchKind.exact = "exact";
        MatchKind.subString = "substring";
        MatchKind.prefix = "prefix";
        return MatchKind;
    })();
    Services.MatchKind = MatchKind;

    var DiagnosticCategory = (function () {
        function DiagnosticCategory() {
        }
        DiagnosticCategory.none = "";
        DiagnosticCategory.error = "error";
        DiagnosticCategory.warning = "warning";
        DiagnosticCategory.message = "message";
        return DiagnosticCategory;
    })();
    Services.DiagnosticCategory = DiagnosticCategory;

    var ScriptSyntaxASTState = (function () {
        function ScriptSyntaxASTState() {
            this.version = -1;
            this.fileName = null;
        }
        return ScriptSyntaxASTState;
    })();
    Services.ScriptSyntaxASTState = ScriptSyntaxASTState;

    var EmitOutput = (function () {
        function EmitOutput() {
            this.outputFiles = [];
            this.diagnostics = [];
        }
        return EmitOutput;
    })();
    Services.EmitOutput = EmitOutput;
})(Services || (Services = {}));
