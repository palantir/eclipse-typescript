/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.palantir.typescript.text.actions;

import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.ITextOperationTarget;
import org.eclipse.jface.text.TextSelection;

import com.palantir.typescript.text.TypeScriptEditor;

/**
 * This action toggles single line comments.
 *
 * @author dcicerone
 */
public final class ToggleCommentAction extends TypeScriptEditorAction {

    public ToggleCommentAction(TypeScriptEditor editor) {
        super(editor);
    }

    @Override
    public void run() {
        ITextOperationTarget textOperationTarget = this.getTextOperationTarget();
        int operation = this.isCommented() ? ITextOperationTarget.STRIP_PREFIX : ITextOperationTarget.PREFIX;

        textOperationTarget.doOperation(operation);
    }

    private boolean isCommented() {
        TypeScriptEditor textEditor = this.getTextEditor();
        TextSelection selection = (TextSelection) textEditor.getSelectionProvider().getSelection();
        IDocument document = textEditor.getDocumentProvider().getDocument(textEditor.getEditorInput());
        int startLine = selection.getStartLine();

        try {
            int lineOffset = document.getLineOffset(startLine);
            int lineLength = document.getLineLength(startLine);
            String line = document.get(lineOffset, lineLength);

            return line.startsWith("//");
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }
}
