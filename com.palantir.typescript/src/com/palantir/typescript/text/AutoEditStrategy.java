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

package com.palantir.typescript.text;

import static com.google.common.base.Preconditions.checkNotNull;

import org.eclipse.jface.text.DocumentCommand;
import org.eclipse.jface.text.IAutoEditStrategy;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.TextUtilities;

import com.google.common.base.Strings;
import com.palantir.typescript.bridge.language.EditorOptions;

/**
 * The auto-edit strategy.
 *
 * @author dcicerone
 */
public final class AutoEditStrategy implements IAutoEditStrategy {

    private final TypeScriptEditor editor;

    public AutoEditStrategy(TypeScriptEditor editor) {
        checkNotNull(editor);

        this.editor = editor;
    }

    @Override
    public void customizeDocumentCommand(IDocument document, DocumentCommand command) {
        String[] legalLineDelimiters = document.getLegalLineDelimiters();

        // check if a newline was inserted
        if (command.length == 0 && command.text != null) {
            if (TextUtilities.endsWith(legalLineDelimiters, command.text) != -1) {
                String fileName = this.editor.getFileName();
                int offset = command.offset;
                EditorOptions options = new EditorOptions();
                int indentation = this.editor.getLanguageService().getIndentationAtPosition(fileName, offset, options);

                // modify the command to use the proper indentation
                StringBuilder buffer = new StringBuilder(command.text);
                buffer.append(Strings.repeat(" ", indentation));
                command.text = buffer.toString();
            } else if (command.text.equals("}")) {
                command.offset = command.offset - 4;
                command.length = 4;
            }
        }
    }
}
