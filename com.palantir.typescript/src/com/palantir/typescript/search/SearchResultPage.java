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
import org.eclipse.jface.viewers.DelegatingStyledCellLabelProvider;
import org.eclipse.jface.viewers.IStructuredContentProvider;
import org.eclipse.jface.viewers.TableViewer;
import org.eclipse.jface.viewers.TreeViewer;
import org.eclipse.jface.viewers.Viewer;
import org.eclipse.search.ui.text.AbstractTextSearchViewPage;
import org.eclipse.search.ui.text.Match;
import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.PartInitException;

/**
 * The TypeScript search result page.
 *
 * @author dcicerone
 */
public final class SearchResultPage extends AbstractTextSearchViewPage {

    @Override
    public boolean isLayoutSupported(int layout) {
        // TODO: support tree view as well
        return layout == FLAG_LAYOUT_FLAT;
    }

    @Override
    protected void clear() {
        this.getViewer().refresh();
    }

    @Override
    protected void configureTableViewer(TableViewer viewer) {
        viewer.setContentProvider(new MyContentProvider());
        viewer.setLabelProvider(new DelegatingStyledCellLabelProvider(new SearchResultLabelProvider(this)));
        viewer.setUseHashlookup(true);
    }

    @Override
    protected void configureTreeViewer(TreeViewer viewer) {
        throw new UnsupportedOperationException();
    }

    @Override
    protected void elementsChanged(Object[] objects) {
        this.getViewer().refresh();
    }

    @Override
    protected void showMatch(Match match, int offset, int length, boolean activate) throws PartInitException {
        IWorkbenchPage page = getSite().getPage();
        IFile file = (IFile) match.getElement();

        this.openAndSelect(page, file, offset, length, activate);
    }

    private static final class MyContentProvider implements IStructuredContentProvider {

        @Override
        public void dispose() {
        }

        @Override
        public void inputChanged(Viewer viewer, Object oldInput, Object newInput) {
        }

        @Override
        public Object[] getElements(Object inputElement) {
            SearchResult searchResult = (SearchResult) inputElement;

            return searchResult.getElements();
        }
    }
}
