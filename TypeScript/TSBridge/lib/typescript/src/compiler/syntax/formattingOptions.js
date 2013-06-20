var FormattingOptions = (function () {
    function FormattingOptions(useTabs, spacesPerTab, indentSpaces, newLineCharacter) {
        this.useTabs = useTabs;
        this.spacesPerTab = spacesPerTab;
        this.indentSpaces = indentSpaces;
        this.newLineCharacter = newLineCharacter;
    }
    FormattingOptions.defaultOptions = new FormattingOptions(false, 4, 4, "\r\n");
    return FormattingOptions;
})();
