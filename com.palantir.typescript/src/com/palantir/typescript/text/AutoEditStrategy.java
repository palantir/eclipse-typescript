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

import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.DocumentCommand;
import org.eclipse.jface.text.IAutoEditStrategy;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.TextUtilities;
import org.eclipse.ui.texteditor.AbstractDecoratedTextEditorPreferenceConstants;

import com.google.common.base.CharMatcher;
import com.google.common.base.Strings;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.services.language.EditorOptions;

/**
 * The auto-edit strategy maintains the proper indentation when inserting line delimiters.
 *
 * @author dcicerone
 */
public final class AutoEditStrategy implements IAutoEditStrategy {

    private static final CharMatcher NON_INDENTATION = CharMatcher.anyOf(" \t").negate();

    private final TypeScriptEditor editor;

    public AutoEditStrategy(TypeScriptEditor editor) {
        checkNotNull(editor);

        this.editor = editor;
    }

    @Override
    public void customizeDocumentCommand(IDocument document, DocumentCommand command) {
        try {
            // customize the command if the user hits enter
            if (isLineDelimiter(document, command)) {
                int offset = command.offset;
                int line = document.getLineOfOffset(offset);
                int lineOffset = document.getLineOffset(line);
                int lineLength = document.getLineLength(line);
                String lineDelimiter = document.getLineDelimiter(line);
                int endOfLineOffset = lineOffset + lineLength - lineDelimiter.length();

                // add additional whitespace to maintain the proper indentation
                String fileName = this.editor.getFileName();
                EditorOptions options = createEditorOptions();
                int indentation = this.editor.getLanguageService().getIndentationAtPosition(fileName, endOfLineOffset, options);
                IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();
                boolean spacesForTabs = preferenceStore.getBoolean(AbstractDecoratedTextEditorPreferenceConstants.EDITOR_SPACES_FOR_TABS);
                command.text += Strings.repeat(spacesForTabs ? " " : "\t", indentation);

                // remove existing whitespace characters at the beginning of the line to put the caret at the beginning of the line
                String remainingLineText = document.get(offset, endOfLineOffset - offset);
                int nonIndentationWhitespace = NON_INDENTATION.indexIn(remainingLineText);
                if (nonIndentationWhitespace > 0) {
                    command.length = nonIndentationWhitespace;
                }
            }
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }

    private static EditorOptions createEditorOptions() {
        IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();

        return new EditorOptions(
            preferenceStore.getInt(IPreferenceConstants.EDITOR_INDENT_SIZE),
            preferenceStore.getInt(AbstractDecoratedTextEditorPreferenceConstants.EDITOR_TAB_WIDTH),
            preferenceStore.getBoolean(AbstractDecoratedTextEditorPreferenceConstants.EDITOR_SPACES_FOR_TABS));
    }

    private static boolean isLineDelimiter(IDocument document, DocumentCommand command) {
        String[] legalLineDelimiters = document.getLegalLineDelimiters();

        return command.length == 0 && command.text != null && TextUtilities.equals(legalLineDelimiters, command.text) != -1;
    }
}
