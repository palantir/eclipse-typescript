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

import java.util.List;

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
import com.palantir.typescript.services.language.Diagnostic;
import com.palantir.typescript.services.language.EditorOptions;
import com.palantir.typescript.services.language.TextSpan;

/**
 * The auto-edit strategy maintains the proper indentation when inserting line delimiters.
 *
 * @author dcicerone
 */
public final class AutoEditStrategy implements IAutoEditStrategy {

    private static final CharMatcher NON_INDENTATION = CharMatcher.anyOf(" \t").negate();

    private final TypeScriptEditor editor;

    private boolean closeBraces;
    private int indentSize;
    private boolean spacesForTabs;
    private int tabWidth;

    public AutoEditStrategy(TypeScriptEditor editor) {
        checkNotNull(editor);

        this.editor = editor;
    }

    @Override
    public void customizeDocumentCommand(IDocument document, DocumentCommand command) {
        try {
            // customize the command if the user hits enter
            if (isLineDelimiter(document, command)) {
                this.readPreferences();

                if (this.closeBrace(document, command)) {
                    return;
                }

                this.adjustIndentation(document, command);
            }
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }

    private void adjustIndentation(IDocument document, DocumentCommand command) throws BadLocationException {
        int offset = command.offset;

        // add additional whitespace to maintain the proper indentation
        int indentation = this.getIndentationAtPosition(offset);
        command.text += this.createIndentationText(indentation);

        // remove existing whitespace characters at the beginning of the line to put the caret at the beginning of the line
        int line = document.getLineOfOffset(offset);
        String lineDelimiter = document.getLineDelimiter(line);
        int lineLengthWithoutDelimiter = document.getLineLength(line) - (lineDelimiter != null ? lineDelimiter.length() : 0);
        String remainingLineText = document.get(offset, lineLengthWithoutDelimiter);
        int nonIndentationWhitespace = NON_INDENTATION.indexIn(remainingLineText);
        if (nonIndentationWhitespace > 0) {
            command.length = nonIndentationWhitespace;
        }
    }

    private boolean closeBrace(IDocument document, DocumentCommand command) throws BadLocationException {
        int offset = command.offset;

        if (this.closeBraces && offset > 0 && document.getChar(offset - 1) == '{') {
            String fileName = this.editor.getFileName();
            List<Diagnostic> diagnostics = this.editor.getLanguageService().getSyntacticDiagnostics(fileName);

            if (!diagnostics.isEmpty()) {
                int indentation = this.getIndentationAtPosition(offset);
                int tabIndentation = this.spacesForTabs ? this.tabWidth : 1;

                // workaround for differing indentation results depending upon whether a syntax error was detected or brace matching failed
                List<TextSpan> braceMatching = this.editor.getLanguageService().getBraceMatchingAtPosition(fileName, offset - 1);
                if (!braceMatching.isEmpty()) {
                    indentation -= tabIndentation;
                }

                String caretIndentationText = this.createIndentationText(indentation + tabIndentation);
                String braceIndentationText = this.createIndentationText(indentation);

                command.caretOffset = offset + caretIndentationText.length() + 1;
                command.shiftsCaret = false;
                command.text += caretIndentationText + command.text + braceIndentationText + "}";

                return true;
            }
        }

        return false;
    }

    private String createIndentationText(int indentation) {
        return Strings.repeat(this.spacesForTabs ? " " : "\t", indentation);
    }

    private int getIndentationAtPosition(int position) {
        String fileName = this.editor.getFileName();
        EditorOptions options = new EditorOptions(this.indentSize, this.tabWidth, this.spacesForTabs);

        return this.editor.getLanguageService().getIndentationAtPosition(fileName, position, options);
    }

    private void readPreferences() {
        IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();

        this.closeBraces = preferenceStore.getBoolean(IPreferenceConstants.EDITOR_CLOSE_BRACES);
        this.indentSize = preferenceStore.getInt(IPreferenceConstants.EDITOR_INDENT_SIZE);
        this.spacesForTabs = preferenceStore.getBoolean(AbstractDecoratedTextEditorPreferenceConstants.EDITOR_SPACES_FOR_TABS);
        this.tabWidth = preferenceStore.getInt(AbstractDecoratedTextEditorPreferenceConstants.EDITOR_TAB_WIDTH);
    }

    private static boolean isLineDelimiter(IDocument document, DocumentCommand command) {
        String[] legalLineDelimiters = document.getLegalLineDelimiters();

        return command.length == 0 && command.text != null && TextUtilities.equals(legalLineDelimiters, command.text) != -1;
    }
}
