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

import java.util.List;
import java.util.UUID;

import org.eclipse.core.resources.IProject;

import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.services.language.CompletionInfoEx;
import com.palantir.typescript.services.language.DefinitionInfo;
import com.palantir.typescript.services.language.DiagnosticEx;
import com.palantir.typescript.services.language.EditorOptions;
import com.palantir.typescript.services.language.FormatCodeOptions;
import com.palantir.typescript.services.language.NavigateToItem;
import com.palantir.typescript.services.language.ReferenceEntry;
import com.palantir.typescript.services.language.ReferenceEntryEx;
import com.palantir.typescript.services.language.SpanInfo;
import com.palantir.typescript.services.language.TextEdit;
import com.palantir.typescript.services.language.TextSpan;
import com.palantir.typescript.services.language.TypeInfoEx;
import com.palantir.typescript.services.language.WorkspaceLanguageService;

/**
 * A language service specifically for use with a single file.
 *
 * @author dcicerone
 */
public final class FileLanguageService {

    private final WorkspaceLanguageService languageService;
    private final String fileName;
    private final String serviceKey;

    private FileLanguageService(WorkspaceLanguageService languageService, String serviceKey, String fileName) {
        this.languageService = languageService;
        this.fileName = fileName;
        this.serviceKey = serviceKey;
    }

    public void dispose() {
        this.languageService.setFileOpen(this.fileName, false);

        // remove the language service if it was isolated
        if (this.serviceKey.equals(this.fileName)) {
            this.languageService.closeIsolatedLanguageService(this.serviceKey, this.fileName);
        }
    }

    public void editFile(int offset, int length, String replacementText) {
        this.languageService.editFile(this.fileName, offset, length, replacementText);
    }

    public List<ReferenceEntryEx> findReferences(int position) {
        return this.languageService.findReferences(this.serviceKey, this.fileName, position);
    }

    public List<TextSpan> getBraceMatchingAtPosition(int position) {
        return this.languageService.getBraceMatchingAtPosition(this.serviceKey, this.fileName, position);
    }

    public CompletionInfoEx getCompletionsAtPosition(int position) {
        return this.languageService.getCompletionsAtPosition(this.serviceKey, this.fileName, position);
    }

    public List<DefinitionInfo> getDefinitionAtPosition(int position) {
        return this.languageService.getDefinitionAtPosition(this.serviceKey, this.fileName, position);
    }

    public List<DiagnosticEx> getDiagnostics() {
        boolean semantic = !this.serviceKey.equals(this.fileName);

        return this.languageService.getDiagnostics(this.serviceKey, this.fileName, semantic);
    }

    public List<TextEdit> getFormattingEditsForRange(int minChar, int limChar, FormatCodeOptions options) {
        return this.languageService.getFormattingEditsForRange(this.serviceKey, this.fileName, minChar, limChar, options);
    }

    public int getIndentationAtPosition(int position, EditorOptions options) {
        return this.languageService.getIndentationAtPosition(this.serviceKey, this.fileName, position, options);
    }

    public SpanInfo getNameOrDottedNameSpan(int startPos, int endPos) {
        return this.languageService.getNameOrDottedNameSpan(this.serviceKey, this.fileName, startPos, endPos);
    }

    public List<ReferenceEntry> getOccurrencesAtPosition(int position) {
        return this.languageService.getOccurrencesAtPosition(this.serviceKey, this.fileName, position);
    }

    public List<ReferenceEntry> getReferencesAtPosition(int position) {
        return this.languageService.getReferencesAtPosition(this.serviceKey, this.fileName, position);
    }

    public List<NavigateToItem> getScriptLexicalStructure() {
        return this.languageService.getScriptLexicalStructure(this.serviceKey, this.fileName);
    }

    public TypeInfoEx getTypeAtPosition(int position) {
        return this.languageService.getTypeAtPosition(this.serviceKey, this.fileName, position);
    }

    public static FileLanguageService create(IProject project, String fileName) {
        WorkspaceLanguageService languageService = TypeScriptPlugin.getDefault().getEditorLanguageService();

        // ensure the project is initialized
        if (!languageService.isProjectInitialized(project)) {
            languageService.initializeProject(project);
        }

        languageService.setFileOpen(fileName, true);

        return new FileLanguageService(languageService, project.getName(), fileName);
    }

    public static FileLanguageService create(String documentText) {
        WorkspaceLanguageService languageService = TypeScriptPlugin.getDefault().getEditorLanguageService();
        String serviceKey = UUID.randomUUID().toString();
        String fileName = serviceKey;
        languageService.initializeIsolatedLanguageService(serviceKey, fileName, documentText);

        languageService.setFileOpen(fileName, true);

        return new FileLanguageService(languageService, serviceKey, fileName);
    }
}
