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

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IRegion;

import com.google.common.base.CharMatcher;
import com.google.common.collect.Lists;
import com.google.common.primitives.Ints;
import com.palantir.typescript.services.language.ReferenceEntry;
import com.palantir.typescript.services.language.SpanInfo;
import com.palantir.typescript.services.language.TextEdit;
import com.palantir.typescript.text.TypeScriptEditor;

/**
 * Un-hoists all variables in the file.
 *
 * @author dcicerone
 */
public final class UnhoistVariablesAction extends TypeScriptEditorAction {

    public UnhoistVariablesAction(TypeScriptEditor editor) {
        super(editor);
    }

    @Override
    public void run() {
        TypeScriptEditor textEditor = this.getTextEditor();
        String fileName = textEditor.getFileName();
        List<SpanInfo> hoistedVariableDeclarators = textEditor.getLanguageService().getHoistedVariableDeclarators(fileName);
        IDocument document = textEditor.getDocument();

        try {
            List<TextEdit> edits = getEdits(textEditor, fileName, hoistedVariableDeclarators, document);

            // apply the edits
            StringBuffer buffer = new StringBuffer(document.get());
            for (TextEdit edit : Lists.reverse(edits)) {
                int start = edit.getMinChar();
                int end = edit.getLimChar();
                String text = edit.getText();

                buffer.replace(start, end, text);
            }

            String text = buffer.toString();
            text = text.replace("var ;\n", "");
            text = text.replace(", var ", ", ");
            text = text.replace("var , ", "var ");
            text = text.replace(" = var ", " = ");

            document.set(text);
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }

    private List<TextEdit> getEdits(TypeScriptEditor textEditor, String fileName, List<SpanInfo> hoistedVariableDeclarators,
            IDocument document) throws BadLocationException {
        List<TextEdit> edits = Lists.newArrayList();

        for (SpanInfo hoistedVariableDeclarator : hoistedVariableDeclarators) {
            int hoistedVariableDeclaratorOffset = hoistedVariableDeclarator.getMinChar();
            List<ReferenceEntry> occurrences = textEditor.getLanguageService().getOccurrencesAtPosition(fileName,
                hoistedVariableDeclaratorOffset);

            if (occurrences.size() >= 2) {
                ReferenceEntry secondOccurrence = occurrences.get(1);

                if (secondOccurrence.isWriteAccess()) {
                    String declaratorIndentation = getIndentation(document, hoistedVariableDeclaratorOffset);
                    int secondOccurrenceOffset = secondOccurrence.getMinChar();
                    String writeOccurrenceIdentation = getIndentation(document, secondOccurrenceOffset);

                    if (declaratorIndentation.equals(writeOccurrenceIdentation)) {
                        int declaratorLimChar = hoistedVariableDeclarator.getLimChar();
                        if (document.getChar(hoistedVariableDeclaratorOffset - 2) == ',') {
                            hoistedVariableDeclaratorOffset -= 2;
                        }
                        edits.add(new TextEdit(hoistedVariableDeclaratorOffset, declaratorLimChar, ""));

                        // add the var keyword
                        edits.add(new TextEdit(secondOccurrenceOffset, secondOccurrenceOffset, "var "));
                    }
                }
            }
        }

        // sort the edits
        Collections.sort(edits, new Comparator<TextEdit>() {
            @Override
            public int compare(TextEdit edit1, TextEdit edit2) {
                return Ints.compare(edit1.getLimChar(), edit2.getLimChar());
            }
        });

        return edits;
    }

    private static String getIndentation(IDocument document, int offset) throws BadLocationException {
        int lineNumber = document.getLineOfOffset(offset);
        IRegion lineInfo = document.getLineInformation(lineNumber);
        String line = document.get(lineInfo.getOffset(), lineInfo.getLength());
        int nonWhitespaceIndex = CharMatcher.WHITESPACE.negate().indexIn(line);

        return line.substring(0, nonWhitespaceIndex);
    }
}
