package com.palantir.typescript.editors;

import org.eclipse.ui.editors.text.TextEditor;

public class TypeScriptEditor extends TextEditor {

    private ColorManager colorManager;

    public TypeScriptEditor() {
        super();
        colorManager = new ColorManager();
        setSourceViewerConfiguration(new XMLConfiguration(colorManager));
        setDocumentProvider(new XMLDocumentProvider());
    }
    public void dispose() {
        colorManager.dispose();
        super.dispose();
    }

}
