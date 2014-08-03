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

import com.palantir.typescript.services.language.CompletionInfoEx;
import com.palantir.typescript.services.language.DefinitionInfo;
import com.palantir.typescript.services.language.EditorOptions;
import com.palantir.typescript.services.language.FormatCodeOptions;
import com.palantir.typescript.services.language.LanguageService;
import com.palantir.typescript.services.language.NavigateToItem;
import com.palantir.typescript.services.language.ReferenceEntry;
import com.palantir.typescript.services.language.ReferenceEntryEx;
import com.palantir.typescript.services.language.SpanInfo;
import com.palantir.typescript.services.language.TextEdit;
import com.palantir.typescript.services.language.TextSpan;
import com.palantir.typescript.services.language.TypeInfoEx;

/**
 * A language service specifically for use with a text editor.
 *
 * @author dcicerone
 */
public final class EditorLanguageService {

    private final String fileName;
    private final LanguageService languageService;

    public EditorLanguageService(String fileName, LanguageService languageService) {
        checkNotNull(fileName);
        checkNotNull(languageService);

        this.fileName = fileName;
        this.languageService = languageService;
    }

    public void editFile(int offset, int length, String replacementText) {
        this.languageService.editFile(this.fileName, offset, length, replacementText);
    }

    public List<ReferenceEntryEx> findReferences(int position) {
        return this.languageService.findReferences(this.fileName, position);
    }

    public List<TextSpan> getBraceMatchingAtPosition(int position) {
        return this.languageService.getBraceMatchingAtPosition(this.fileName, position);
    }

    public CompletionInfoEx getCompletionsAtPosition(int position) {
        return this.languageService.getCompletionsAtPosition(this.fileName, position);
    }

    public List<DefinitionInfo> getDefinitionAtPosition(int position) {
        return this.languageService.getDefinitionAtPosition(this.fileName, position);
    }

    public List<TextEdit> getFormattingEditsForRange(int minChar, int limChar, FormatCodeOptions options) {
        return this.languageService.getFormattingEditsForRange(this.fileName, minChar, limChar, options);
    }

    public int getIndentationAtPosition(int position, EditorOptions options) {
        return this.languageService.getIndentationAtPosition(this.fileName, position, options);
    }

    public SpanInfo getNameOrDottedNameSpan(int startPos, int endPos) {
        return this.languageService.getNameOrDottedNameSpan(this.fileName, startPos, endPos);
    }

    public List<ReferenceEntry> getReferencesAtPosition(int position) {
        return this.languageService.getReferencesAtPosition(this.fileName, position);
    }

    public List<NavigateToItem> getScriptLexicalStructure() {
        return this.languageService.getScriptLexicalStructure(this.fileName);
    }

    public TypeInfoEx getTypeAtPosition(int position) {
        return this.languageService.getTypeAtPosition(this.fileName, position);
    }

    public void setFileOpen(boolean open) {
        this.languageService.setFileOpen(this.fileName, open);
    }
}
