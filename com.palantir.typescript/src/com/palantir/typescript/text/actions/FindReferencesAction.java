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

import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.ITextSelection;
import org.eclipse.search.ui.NewSearchUI;
import org.eclipse.swt.widgets.Display;
import org.eclipse.ui.texteditor.IEditorStatusLine;

import com.palantir.typescript.search.SearchQuery;
import com.palantir.typescript.services.language.SpanInfo;
import com.palantir.typescript.text.FileLanguageService;
import com.palantir.typescript.text.TypeScriptEditor;

/**
 * Finds references to the currently selected element.
 *
 * @author dcicerone
 */
public final class FindReferencesAction extends TypeScriptEditorAction {

    public FindReferencesAction(TypeScriptEditor editor) {
        super(editor);
    }

    @Override
    public void run() {
        TypeScriptEditor editor = this.getTextEditor();
        FileLanguageService languageService = editor.getLanguageService();
        ITextSelection selection = (ITextSelection) editor.getSelectionProvider().getSelection();
        int offset = selection.getOffset();
        String searchString = getSearchString(editor, languageService, offset);

        if (searchString != null) {
            SearchQuery query = new SearchQuery(languageService, offset, searchString);

            // display the search results
            NewSearchUI.runQueryInForeground(null, query);
        } else {
            IEditorStatusLine editorStatusLine = (IEditorStatusLine) editor.getAdapter(IEditorStatusLine.class);

            if (editorStatusLine != null) {
                editorStatusLine.setMessage(true, "No search text found", null);
            }

            Display.getCurrent().beep();
        }
    }

    private static String getSearchString(TypeScriptEditor editor, FileLanguageService languageService, int offset) {
        SpanInfo spanInfo = languageService.getNameOrDottedNameSpan(offset, offset);
        if (spanInfo == null) {
            return null;
        }

        int minChar = spanInfo.getMinChar();
        int limChar = spanInfo.getLimChar();

        try {
            String searchString = editor.getDocument().get(minChar, limChar - minChar);

            int lastPeriod = searchString.lastIndexOf('.');
            if (lastPeriod >= 0) {
                searchString = searchString.substring(lastPeriod + 1);
            }

            return searchString;
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }
}
