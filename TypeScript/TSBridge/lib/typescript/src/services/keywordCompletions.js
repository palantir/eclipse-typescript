var Services;
(function (Services) {
    var KeywordCompletions = (function () {
        function KeywordCompletions() {
        }
        KeywordCompletions.getKeywordCompltions = function () {
            if (KeywordCompletions.keywordCompletions === null) {
                var completions = [];
                for (var i = 0, n = KeywordCompletions.keywords.length; i < n; i++) {
                    var keyword = KeywordCompletions.keywords[i];
                    var entry = new Services.CompletionEntry();
                    entry.name = entry.fullSymbolName = keyword;
                    entry.type = null;
                    entry.docComment = null;
                    entry.kind = Services.ScriptElementKind.keyword;
                    entry.kindModifiers = Services.ScriptElementKindModifier.none;
                    completions.push(entry);
                }

                KeywordCompletions.keywordCompletions = completions;
            }

            return KeywordCompletions.keywordCompletions;
        };
        KeywordCompletions.keywords = [
            "break",
            "case",
            "catch",
            "class",
            "constructor",
            "continue",
            "debugger",
            "declare",
            "default",
            "delete",
            "do",
            "else",
            "enum",
            "export",
            "extends",
            "false",
            "finally",
            "for",
            "function",
            "get",
            "if",
            "implements",
            "import",
            "in",
            "instanceOf",
            "interface",
            "module",
            "new",
            "private",
            "public",
            "require",
            "return",
            "set",
            "static",
            "super",
            "switch",
            "this",
            "throw",
            "true",
            "try",
            "typeOf",
            "var",
            "while",
            "with"
        ];

        KeywordCompletions.keywordCompletions = null;
        return KeywordCompletions;
    })();
    Services.KeywordCompletions = KeywordCompletions;
})(Services || (Services = {}));
