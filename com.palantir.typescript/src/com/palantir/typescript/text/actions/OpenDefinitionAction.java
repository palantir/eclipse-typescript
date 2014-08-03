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

import java.util.List;

import org.eclipse.jface.text.ITextSelection;

import com.palantir.typescript.services.language.DefinitionInfo;
import com.palantir.typescript.text.TypeScriptEditor;

/**
 * Opens the definition of a TypeScript element.
 *
 * @author dcicerone
 */
public final class OpenDefinitionAction extends TypeScriptEditorAction {

    public OpenDefinitionAction(TypeScriptEditor editor) {
        super(editor);
    }

    @Override
    public void run() {
        TypeScriptEditor editor = this.getTextEditor();
        ITextSelection selection = (ITextSelection) editor.getSelectionProvider().getSelection();
        int position = selection.getOffset();
        List<DefinitionInfo> definitions = editor.getLanguageService().getDefinitionAtPosition(position);

        if (definitions != null && !definitions.isEmpty()) {
            DefinitionInfo definition = definitions.get(0);

            // don't follow references to the built-in default library
            if (!definition.getFileName().equals("lib.d.ts")) {
                TypeScriptEditor.openDefinition(definition);
            }
        }
    }
}
