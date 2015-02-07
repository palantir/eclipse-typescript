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

package com.palantir.typescript.search;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;

import org.eclipse.core.resources.IFile;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.OperationCanceledException;
import org.eclipse.core.runtime.Status;
import org.eclipse.search.ui.ISearchQuery;
import org.eclipse.search.ui.ISearchResult;

import com.palantir.typescript.EclipseResources;
import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.services.language.ReferenceEntryEx;
import com.palantir.typescript.services.language.TextSpan;
import com.palantir.typescript.text.FileLanguageService;

/**
 * A TypeScript search query.
 *
 * @author dcicerone
 */
public final class SearchQuery implements ISearchQuery {

    private final FileLanguageService languageService;
    private final int offset;
    private final SearchResult result;
    private final String searchString;

    public SearchQuery(FileLanguageService languageService, int offset, String searchString) {
        checkNotNull(languageService);
        checkArgument(offset >= 0);
        checkNotNull(searchString);

        this.languageService = languageService;
        this.offset = offset;
        this.searchString = searchString;

        this.result = new SearchResult(this);
    }

    @Override
    public IStatus run(IProgressMonitor monitor) throws OperationCanceledException {
        try {
            List<ReferenceEntryEx> references = this.languageService.findReferences(this.offset);

            for (ReferenceEntryEx reference : references) {
                String referenceFileName = reference.getFileName();
                IFile file = EclipseResources.getFile(referenceFileName);
                TextSpan textSpan = reference.getTextSpan();
                FindReferenceMatch match = new FindReferenceMatch(file, textSpan.getStart(), textSpan.getLength(), reference);

                this.result.addMatch(match);
            }

            return Status.OK_STATUS;
        } catch (RuntimeException e) {
            Status status = new Status(IStatus.ERROR, TypeScriptPlugin.ID, e.getMessage(), e);

            // log the exception
            TypeScriptPlugin.getDefault().getLog().log(status);

            return status;
        }
    }

    @Override
    public String getLabel() {
        return "TypeScript Search Query";
    }

    public String getSearchString() {
        return this.searchString;
    }

    @Override
    public boolean canRerun() {
        return false;
    }

    @Override
    public boolean canRunInBackground() {
        return false;
    }

    @Override
    public ISearchResult getSearchResult() {
        return this.result;
    }
}
