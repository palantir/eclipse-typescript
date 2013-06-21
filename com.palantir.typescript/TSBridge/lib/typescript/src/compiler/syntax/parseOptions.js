var TypeScript;
(function (TypeScript) {
    var ParseOptions = (function () {
        function ParseOptions(allowAutomaticSemicolonInsertion, allowModuleKeywordInExternalModuleReference) {
            this._allowAutomaticSemicolonInsertion = allowAutomaticSemicolonInsertion;
            this._allowModuleKeywordInExternalModuleReference = allowModuleKeywordInExternalModuleReference;
        }
        ParseOptions.prototype.toJSON = function (key) {
            return {
                allowAutomaticSemicolonInsertion: this._allowAutomaticSemicolonInsertion,
                allowModuleKeywordInExternalModuleReference: this._allowModuleKeywordInExternalModuleReference
            };
        };

        ParseOptions.prototype.allowAutomaticSemicolonInsertion = function () {
            return this._allowAutomaticSemicolonInsertion;
        };

        ParseOptions.prototype.allowModuleKeywordInExternalModuleReference = function () {
            return this._allowModuleKeywordInExternalModuleReference;
        };
        return ParseOptions;
    })();
    TypeScript.ParseOptions = ParseOptions;
})(TypeScript || (TypeScript = {}));
