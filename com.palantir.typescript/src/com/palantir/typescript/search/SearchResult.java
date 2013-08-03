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

import static com.google.common.base.Preconditions.checkNotNull;

import java.text.MessageFormat;

import org.eclipse.core.resources.IFile;
import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.search.ui.ISearchQuery;
import org.eclipse.search.ui.text.AbstractTextSearchResult;
import org.eclipse.search.ui.text.IEditorMatchAdapter;
import org.eclipse.search.ui.text.IFileMatchAdapter;
import org.eclipse.search.ui.text.Match;
import org.eclipse.ui.IEditorInput;
import org.eclipse.ui.IEditorPart;
import org.eclipse.ui.IFileEditorInput;

/**
 * A TypeScript search result.
 *
 * @author dcicerone
 */
public final class SearchResult extends AbstractTextSearchResult {

    private final SearchQuery query;

    public SearchResult(SearchQuery query) {
        checkNotNull(query);

        this.query = query;
    }

    @Override
    public String getLabel() {
        String searchString = this.query.getSearchString();
        int matchCount = this.getMatchCount();

        return MessageFormat.format("''{0}'' - {1,choice,1#1 match|1<{1,number,integer} matches} in project", searchString, matchCount);
    }

    @Override
    public String getTooltip() {
        return null;
    }

    @Override
    public ImageDescriptor getImageDescriptor() {
        return null;
    }

    @Override
    public ISearchQuery getQuery() {
        return this.query;
    }

    @Override
    public IEditorMatchAdapter getEditorMatchAdapter() {
        return new MyEditorMatchAdapter();
    }

    @Override
    public IFileMatchAdapter getFileMatchAdapter() {
        return new MyFileMatchAdapter();
    }

    private static final class MyEditorMatchAdapter implements IEditorMatchAdapter {
        @Override
        public boolean isShownInEditor(Match match, IEditorPart editor) {
            IFile file = (IFile) match.getElement();
            IEditorInput editorInput = editor.getEditorInput();

            if (editorInput instanceof IFileEditorInput) {
                IFileEditorInput fileEditorInput = (IFileEditorInput) editorInput;

                return fileEditorInput.getFile().equals(file);
            }

            return false;
        }

        @Override
        public Match[] computeContainedMatches(AbstractTextSearchResult result, IEditorPart editor) {
            IEditorInput editorInput = editor.getEditorInput();

            if (editorInput instanceof IFileEditorInput) {
                IFileEditorInput fileEditorInput = (IFileEditorInput) editorInput;
                IFile file = fileEditorInput.getFile();

                return result.getMatches(file);
            }

            return null;
        }
    }

    private static final class MyFileMatchAdapter implements IFileMatchAdapter {
        @Override
        public IFile getFile(Object element) {
            return (IFile) element;
        }

        @Override
        public Match[] computeContainedMatches(AbstractTextSearchResult result, IFile file) {
            return result.getMatches(file);
        }
    }
}
