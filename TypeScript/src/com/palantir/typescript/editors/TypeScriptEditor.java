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

package com.palantir.typescript.editors;

import org.eclipse.ui.editors.text.TextEditor;

/**
 * The entry point of this eclipse plugin.
 *
 * @author tyleradams
 */
public final class TypeScriptEditor extends TextEditor {

    private final ColorManager colorManager;

    public TypeScriptEditor() {
        this.colorManager = new ColorManager();
        this.setSourceViewerConfiguration(new TypeScriptConfiguration(colorManager));
        this.setDocumentProvider(new TypeScriptDocumentProvider());
    }

    /**
     * The dispose method for TextEditors follows the same pattern where super.dispose() is called
     * at the very end, so we use that style here as well.
     */
    @Override
    public void dispose() {
        colorManager.dispose();
        super.dispose();
    }

}
