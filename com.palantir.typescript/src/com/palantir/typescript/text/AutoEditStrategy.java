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

import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.DocumentCommand;
import org.eclipse.jface.text.IAutoEditStrategy;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.TextUtilities;
import org.eclipse.ui.texteditor.AbstractDecoratedTextEditorPreferenceConstants;

import com.google.common.base.Strings;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.TypeScriptPlugin;

/**
 * The auto-edit strategy.
 *
 * @author dcicerone
 */
public final class AutoEditStrategy implements IAutoEditStrategy {

    @Override
    public void customizeDocumentCommand(IDocument document, DocumentCommand command) {
        try {
            // customize the command if the user hit enter
            if (isLineDelimiter(document, command)) {
                int offset = command.offset;
                IRegion lineInfo = document.getLineInformationOfOffset(offset);
                int lineStart = lineInfo.getOffset();
                int lineEnd = lineStart + lineInfo.getLength();
                int indentationEnd = findEndOfIndentation(document, lineStart, lineEnd);
                int indentationEndUpToCursor = Math.min(indentationEnd, offset);

                // append indentation from the previous line and extra if necessary
                StringBuilder builder = new StringBuilder(command.text);
                builder.append(document.get(lineStart, indentationEndUpToCursor - lineStart));
                builder.append(getExtraIndentation(document, offset));
                command.text = builder.toString();

                // adjust the caret offset if it would be moved into the middle of the indentation
                if (indentationEnd != indentationEndUpToCursor) {
                    command.caretOffset = offset + command.text.length() + indentationEnd - indentationEndUpToCursor;
                    command.shiftsCaret = false;
                }
            }
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }

    private static int findEndOfIndentation(IDocument document, int start, int end) throws BadLocationException {
        for (int offset = start; offset < end; offset++) {
            char character = document.getChar(offset);

            if (character != ' ' && character != '\t') {
                return offset;
            }
        }

        return end;
    }

    private static String getExtraIndentation(IDocument document, int offset) throws BadLocationException {
        String indentation = "";

        if (offset > 0 && document.getChar(offset - 1) == '{') {
            IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();
            boolean spacesForTabs = preferenceStore.getBoolean(AbstractDecoratedTextEditorPreferenceConstants.EDITOR_SPACES_FOR_TABS);

            if (spacesForTabs) {
                int tabWidth = preferenceStore.getInt(IPreferenceConstants.EDITOR_INDENT_SIZE);

                indentation = Strings.repeat(" ", tabWidth);
            } else {
                indentation = "\t";
            }
        }

        return indentation;
    }

    private static boolean isLineDelimiter(IDocument document, DocumentCommand command) {
        String[] legalLineDelimiters = document.getLegalLineDelimiters();

        return command.length == 0 && command.text != null && TextUtilities.equals(legalLineDelimiters, command.text) != -1;
    }
}
