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

import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IResource;
import org.eclipse.jface.viewers.DelegatingStyledCellLabelProvider;
import org.eclipse.jface.viewers.TableViewer;
import org.eclipse.jface.viewers.TreeViewer;
import org.eclipse.search.ui.text.AbstractTextSearchResult;
import org.eclipse.search.ui.text.AbstractTextSearchViewPage;
import org.eclipse.search.ui.text.Match;
import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.PartInitException;

import com.google.common.collect.ImmutableList;

/**
 * The TypeScript search result page.
 *
 * @author dcicerone
 */
public final class SearchResultPage extends AbstractTextSearchViewPage {

    @Override
    protected void clear() {
        this.getViewer().setInput(null);
    }

    @Override
    protected void configureTableViewer(TableViewer viewer) {
        viewer.setContentProvider(new SearchResultTableContentProvider());
        viewer.setLabelProvider(new DelegatingStyledCellLabelProvider(new SearchResultLabelProvider(this, false)));
        viewer.setUseHashlookup(true);
    }

    @Override
    protected void configureTreeViewer(TreeViewer viewer) {
        viewer.setContentProvider(new SearchResultTreeContentProvider());
        viewer.setLabelProvider(new DelegatingStyledCellLabelProvider(new SearchResultLabelProvider(this, true)));
        viewer.setUseHashlookup(true);
    }

    @Override
    protected void elementsChanged(Object[] objects) {
        AbstractTextSearchResult input = this.getInput();

        this.getViewer().setInput(input);
    }

    @Override
    public int getDisplayedMatchCount(Object element) {
        return this.getDisplayedMatches(element).length;
    }

    @Override
    public Match[] getDisplayedMatches(Object element) {
        if (element instanceof LineResult) {
            LineResult lineResult = (LineResult) element;
            ImmutableList<FindReferenceMatch> matches = lineResult.getMatches();

            return matches.toArray(new Match[matches.size()]);
        } else if (element instanceof IResource) {
            SearchResult input = (SearchResult) this.getInput();

            return input.getMatches(element);
        }

        return super.getDisplayedMatches(element);
    }

    @Override
    protected void showMatch(Match match, int offset, int length, boolean activate) throws PartInitException {
        IWorkbenchPage page = getSite().getPage();
        IFile file = (IFile) match.getElement();

        this.openAndSelect(page, file, offset, length, activate);
    }
}
