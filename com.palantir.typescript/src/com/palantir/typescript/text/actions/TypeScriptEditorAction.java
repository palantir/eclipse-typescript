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

import org.eclipse.jface.text.ITextOperationTarget;
import org.eclipse.ui.texteditor.TextEditorAction;

import com.palantir.typescript.Resources;
import com.palantir.typescript.text.TypeScriptEditor;

/**
 * An abstract TypeScript editor action.
 *
 * @author dcicerone
 */
abstract class TypeScriptEditorAction extends TextEditorAction {

    public TypeScriptEditorAction(TypeScriptEditor editor) {
        super(Resources.BUNDLE, null, editor);
    }

    @Override
    protected final TypeScriptEditor getTextEditor() {
        return (TypeScriptEditor) super.getTextEditor();
    }

    protected final ITextOperationTarget getTextOperationTarget() {
        return (ITextOperationTarget) this.getTextEditor().getAdapter(ITextOperationTarget.class);
    }
    protected final void doOperation(int operation) {
        this.getTextOperationTarget().doOperation(operation);
    }
}
