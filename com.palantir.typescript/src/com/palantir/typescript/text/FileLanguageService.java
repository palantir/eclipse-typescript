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
import java.util.UUID;

import org.eclipse.core.resources.IProject;

import com.palantir.typescript.services.language.CompletionInfoEx;
import com.palantir.typescript.services.language.DefinitionInfo;
import com.palantir.typescript.services.language.DiagnosticEx;
import com.palantir.typescript.services.language.EditorOptions;
import com.palantir.typescript.services.language.FormatCodeOptions;
import com.palantir.typescript.services.language.LanguageEndpoint;
import com.palantir.typescript.services.language.NavigationBarItem;
import com.palantir.typescript.services.language.QuickInfo;
import com.palantir.typescript.services.language.ReferenceEntry;
import com.palantir.typescript.services.language.ReferenceEntryEx;
import com.palantir.typescript.services.language.TextChange;
import com.palantir.typescript.services.language.TextSpan;

/**
 * A language service specifically for use with a single file.
 *
 * @author dcicerone
 */
public final class FileLanguageService {

    private final LanguageEndpoint languageEndpoint;
    private final String fileName;
    private final String serviceKey;

    private FileLanguageService(LanguageEndpoint languageEndpoint, String serviceKey, String fileName) {
        this.languageEndpoint = languageEndpoint;
        this.fileName = fileName;
        this.serviceKey = serviceKey;
    }

    public void dispose() {
        this.languageEndpoint.setFileOpen(this.fileName, false);

        // remove the language service if it was isolated
        if (this.serviceKey.equals(this.fileName)) {
            this.languageEndpoint.closeIsolatedLanguageService(this.serviceKey, this.fileName);
        }
    }

    public void editFile(int offset, int length, String replacementText) {
        this.languageEndpoint.editFile(this.fileName, offset, length, replacementText);
    }

    public List<ReferenceEntryEx> findReferences(int position) {
        return this.languageEndpoint.findReferences(this.serviceKey, this.fileName, position);
    }

    public List<TextSpan> getBraceMatchingAtPosition(int position) {
        return this.languageEndpoint.getBraceMatchingAtPosition(this.serviceKey, this.fileName, position);
    }

    public CompletionInfoEx getCompletionsAtPosition(int position) {
        return this.languageEndpoint.getCompletionsAtPosition(this.serviceKey, this.fileName, position);
    }

    public List<DefinitionInfo> getDefinitionAtPosition(int position) {
        return this.languageEndpoint.getDefinitionAtPosition(this.serviceKey, this.fileName, position);
    }

    public List<DiagnosticEx> getDiagnostics() {
        boolean semantic = !this.serviceKey.equals(this.fileName);

        return this.languageEndpoint.getDiagnostics(this.serviceKey, this.fileName, semantic);
    }

    public List<TextChange> getFormattingEditsForRange(int start, int end, FormatCodeOptions options) {
        return this.languageEndpoint.getFormattingEditsForRange(this.serviceKey, this.fileName, start, end, options);
    }

    public int getIndentationAtPosition(int position, EditorOptions options) {
        return this.languageEndpoint.getIndentationAtPosition(this.serviceKey, this.fileName, position, options);
    }

    public TextSpan getNameOrDottedNameSpan(int startPos, int endPos) {
        return this.languageEndpoint.getNameOrDottedNameSpan(this.serviceKey, this.fileName, startPos, endPos);
    }

    public List<NavigationBarItem> getNavigationBarItems() {
        return this.languageEndpoint.getNavigationBarItems(this.serviceKey, this.fileName);
    }

    public List<ReferenceEntry> getOccurrencesAtPosition(int position) {
        return this.languageEndpoint.getOccurrencesAtPosition(this.serviceKey, this.fileName, position);
    }

    public QuickInfo getQuickInfoAtPosition(int position) {
        return this.languageEndpoint.getQuickInfoAtPosition(this.serviceKey, this.fileName, position);
    }

    public List<ReferenceEntry> getReferencesAtPosition(int position) {
        return this.languageEndpoint.getReferencesAtPosition(this.serviceKey, this.fileName, position);
    }

    public static FileLanguageService create(LanguageEndpoint languageEndpoint, IProject project, String fileName) {
        checkNotNull(languageEndpoint);
        checkNotNull(project);
        checkNotNull(fileName);

        // ensure the project is initialized
        if (!languageEndpoint.isProjectInitialized(project)) {
            languageEndpoint.initializeProject(project);
        }

        languageEndpoint.setFileOpen(fileName, true);

        return new FileLanguageService(languageEndpoint, project.getName(), fileName);
    }

    public static FileLanguageService create(LanguageEndpoint languageEndpoint, String documentText) {
        checkNotNull(languageEndpoint);
        checkNotNull(documentText);

        String serviceKey = UUID.randomUUID().toString();
        String fileName = serviceKey;
        languageEndpoint.initializeIsolatedLanguageService(serviceKey, fileName, documentText);

        languageEndpoint.setFileOpen(fileName, true);

        return new FileLanguageService(languageEndpoint, serviceKey, fileName);
    }
}
