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

import com.palantir.typescript.text.TypeScriptEditor;
import com.palantir.typescript.text.TypeScriptSourceViewer;

/**
 * Presents the quick outline pop-up in a TypeScriptEditor.
 *
 * @author tyleradams
 */
public final class QuickOutlineAction extends TypeScriptEditorAction {

    private final TypeScriptSourceViewer sourceViewer;

    public QuickOutlineAction(TypeScriptEditor editor, TypeScriptSourceViewer sourceViewer) {
        super(editor);

        checkNotNull(sourceViewer);

        this.sourceViewer = sourceViewer;
    }

    @Override
    public void run() {
        this.sourceViewer.doOperation(TypeScriptSourceViewer.SHOW_OUTLINE);
    }
}
