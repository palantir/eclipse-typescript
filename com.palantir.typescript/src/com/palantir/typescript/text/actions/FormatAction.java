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

import static com.google.common.base.Preconditions.checkNotNull;

import org.eclipse.jface.action.Action;
import org.eclipse.jface.text.ITextOperationTarget;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.ui.texteditor.IUpdate;

import com.palantir.typescript.text.TypeScriptEditor;

/**
 * Formats the selected code.
 *
 * @author dcicerone
 */
public final class FormatAction extends Action implements IUpdate {

    private final TypeScriptEditor editor;
    private ITextOperationTarget textOperationTarget;

    public FormatAction(TypeScriptEditor editor) {
        checkNotNull(editor);

        this.editor = editor;

        this.update();
    }

    @Override
    public void run() {
        this.textOperationTarget.doOperation(ISourceViewer.FORMAT);
    }

    @Override
    public void update() {
        this.textOperationTarget = (ITextOperationTarget) this.editor.getAdapter(ITextOperationTarget.class);

        this.setEnabled(this.editor.isEditorInputModifiable());
    }
}
