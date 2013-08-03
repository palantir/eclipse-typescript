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

import com.palantir.typescript.search.SearchQuery;
import com.palantir.typescript.services.language.LanguageService;
import com.palantir.typescript.services.language.SpanInfo;
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
        SearchQuery query = this.getSearchQuery();

        // display the search results
        NewSearchUI.runQueryInForeground(null, query);
    }

    private SearchQuery getSearchQuery() {
        TypeScriptEditor editor = this.getTextEditor();
        LanguageService languageService = editor.getLanguageService();
        String fileName = editor.getFileName();
        ITextSelection selection = (ITextSelection) editor.getSelectionProvider().getSelection();
        int offset = selection.getOffset();
        String searchString = getSearchString(editor, languageService, fileName, offset);

        return new SearchQuery(languageService, fileName, offset, searchString);
    }

    private String getSearchString(TypeScriptEditor editor, LanguageService languageService, String fileName, int offset) {
        SpanInfo spanInfo = languageService.getNameOrDottedNameSpan(fileName, offset, offset);
        int minChar = spanInfo.getMinChar();
        int limChar = spanInfo.getLimChar();

        try {
            return editor.getDocument().get(minChar, limChar - minChar);
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }
}
