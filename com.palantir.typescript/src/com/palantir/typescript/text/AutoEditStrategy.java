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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.DocumentCommand;
import org.eclipse.jface.text.IAutoEditStrategy;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.TextUtilities;
import org.eclipse.ui.texteditor.AbstractDecoratedTextEditorPreferenceConstants;

import com.google.common.base.Strings;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.services.language.EditorOptions;
import com.palantir.typescript.services.language.TextSpan;

/**
 * The auto-edit strategy maintains the proper indentation when inserting line delimiters.
 *
 * @author dcicerone
 */
public final class AutoEditStrategy implements IAutoEditStrategy {

    private static final Pattern INDENTATION = Pattern.compile("^\\s*");
    private static final Pattern JSDOC_MIDDLE = Pattern.compile("\\s*\\* .*");
    private static final Pattern JSDOC_START = Pattern.compile("\\s*/\\*\\*");

    private final TypeScriptEditor editor;
    private final IPreferenceStore preferenceStore;

    private boolean closeBraces;
    private boolean closeJSDocs;
    private int indentSize;
    private boolean spacesForTabs;
    private int tabWidth;

    public AutoEditStrategy(TypeScriptEditor editor, IPreferenceStore preferenceStore) {
        checkNotNull(editor);
        checkNotNull(preferenceStore);

        this.editor = editor;
        this.preferenceStore = preferenceStore;
    }

    @Override
    public void customizeDocumentCommand(IDocument document, DocumentCommand command) {
        try {
            // customize the command if the user hits enter
            if (isLineDelimiter(document, command)) {
                this.readPreferences();

                if (this.closeBrace(document, command)) {
                    return;
                } else if (this.closeJavadoc(document, command)) {
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
        String lineText = getLineText(document, line);
        String indentationText = getIndentationText(lineText);
        int lineOffset = document.getLineOffset(line);
        command.length = Math.max(0, indentationText.length() - (offset - lineOffset));
    }

    private boolean closeBrace(IDocument document, DocumentCommand command) throws BadLocationException {
        int offset = command.offset;

        if (this.closeBraces && offset > 0 && document.getChar(offset - 1) == '{' && !this.isBraceClosed(offset)) {
            int indentation = this.getIndentationAtPosition(offset);

            // workaround for a TypeScript language service bug that returns 0 when a file is relatively empty
            // TODO: remove this workaround if the bug is fixed in v1.0.0
            if (indentation == 0) {
                indentation = this.indentSize;
            }

            String caretIndentationText = this.createIndentationText(indentation);
            String closingBraceIndentationText = this.createIndentationText(indentation - this.indentSize);

            command.caretOffset = offset + caretIndentationText.length() + 1;
            command.shiftsCaret = false;
            command.text += caretIndentationText + command.text + closingBraceIndentationText + "}";

            return true;
        }

        return false;
    }

    private boolean closeJavadoc(IDocument document, DocumentCommand command) throws BadLocationException {
        int offset = command.offset;
        int line = document.getLineOfOffset(offset);
        String lineText = getLineText(document, line);
        String indentationText = getIndentationText(lineText);

        if (JSDOC_START.matcher(lineText).matches()) {
            command.text += indentationText + " * ";

            if (this.closeJSDocs && line + 1 < document.getNumberOfLines()) {
                String nextLineText = getLineText(document, line + 1);

                if (!JSDOC_MIDDLE.matcher(nextLineText).matches()) {
                    String defaultLineDelimiter = TextUtilities.getDefaultLineDelimiter(document);

                    command.caretOffset = offset + command.text.length();
                    command.shiftsCaret = false;
                    command.text += defaultLineDelimiter + indentationText + " */";
                }
            }

            return true;
        } else if (JSDOC_MIDDLE.matcher(lineText).matches()) {
            command.text += indentationText + "* ";

            return true;
        }

        return false;
    }

    private String createIndentationText(int indentation) {
        checkArgument(indentation >= 0);

        int tabs = 0;
        int spaces = 0;

        if (this.spacesForTabs) {
            spaces = indentation;
        } else {
            tabs = indentation / this.tabWidth;
            spaces = indentation % this.tabWidth;
        }

        return Strings.repeat("\t", tabs) + Strings.repeat(" ", spaces);
    }

    private int getIndentationAtPosition(int position) {
        String fileName = this.editor.getFileName();
        EditorOptions options = new EditorOptions(this.indentSize, this.tabWidth, this.spacesForTabs);

        try {
            return this.editor.getLanguageService().getIndentationAtPosition(fileName, position, options);
        } catch (RuntimeException e) {
            Status status = new Status(IStatus.ERROR, TypeScriptPlugin.ID, e.getMessage(), e);

            // log the exception
            TypeScriptPlugin.getDefault().getLog().log(status);

            // fallback to no indentation (its better than the enter key not working)
            return 0;
        }
    }

    private boolean isBraceClosed(int offset) {
        String fileName = this.editor.getFileName();
        List<TextSpan> braceMatching = this.editor.getLanguageService().getBraceMatchingAtPosition(fileName, offset - 1);

        // matching braces come in pairs so if there is no pair, there is no match (happens at the end of files)
        if (braceMatching.size() != 2) {
            return false;
        }

        // get the indentation of the opening brace
        int openingBraceOffset = braceMatching.get(0).getStart();
        int openingBraceIndentation = this.getIndentationAtPosition(openingBraceOffset) - this.indentSize;

        // get the indentation of the closing brace
        int closingBraceOffset = braceMatching.get(1).getStart();
        IDocument document = this.editor.getDocument();
        try {
            int closingBraceLine = document.getLineOfOffset(closingBraceOffset);
            int closingBraceLineOffset = document.getLineOffset(closingBraceLine);
            int closingBraceIndentation = closingBraceOffset - closingBraceLineOffset;

            // consider the opening brace closed if the opening and closing braces have the same indentation
            return openingBraceIndentation == closingBraceIndentation;
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }

    private void readPreferences() {
        this.closeBraces = this.preferenceStore.getBoolean(IPreferenceConstants.EDITOR_CLOSE_BRACES);
        this.closeJSDocs = this.preferenceStore.getBoolean(IPreferenceConstants.EDITOR_CLOSE_JSDOCS);
        this.indentSize = this.preferenceStore.getInt(IPreferenceConstants.EDITOR_INDENT_SIZE);
        this.spacesForTabs = this.preferenceStore.getBoolean(AbstractDecoratedTextEditorPreferenceConstants.EDITOR_SPACES_FOR_TABS);
        this.tabWidth = this.preferenceStore.getInt(AbstractDecoratedTextEditorPreferenceConstants.EDITOR_TAB_WIDTH);
    }

    private static String getIndentationText(String lineText) {
        Matcher matcher = INDENTATION.matcher(lineText);

        if (matcher.find()) {
            return matcher.group();
        }

        return "";
    }

    private static String getLineText(IDocument document, int line) throws BadLocationException {
        int lineOffset = document.getLineOffset(line);
        String lineDelimiter = document.getLineDelimiter(line);
        int lineLengthWithoutDelimiter = document.getLineLength(line) - (lineDelimiter != null ? lineDelimiter.length() : 0);

        return document.get(lineOffset, lineLengthWithoutDelimiter);
    }

    private static boolean isLineDelimiter(IDocument document, DocumentCommand command) {
        String[] legalLineDelimiters = document.getLegalLineDelimiters();

        return command.length == 0 && command.text != null && TextUtilities.equals(legalLineDelimiters, command.text) != -1;
    }
}
