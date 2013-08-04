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

import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IResource;
import org.eclipse.jface.viewers.DelegatingStyledCellLabelProvider.IStyledLabelProvider;
import org.eclipse.jface.viewers.ILabelProviderListener;
import org.eclipse.jface.viewers.LabelProvider;
import org.eclipse.jface.viewers.StyledString;
import org.eclipse.swt.graphics.Image;
import org.eclipse.ui.model.WorkbenchLabelProvider;

import com.palantir.typescript.Resources;
import com.palantir.typescript.search.TypeScriptMatch.MatchLine;

/**
 * The label provider for a search result.
 *
 * @author dcicerone
 */
final class SearchResultLabelProvider extends LabelProvider implements IStyledLabelProvider {

    private final boolean isTree;
    private final WorkbenchLabelProvider labelProvider;
    private final SearchResultPage page;

    public SearchResultLabelProvider(SearchResultPage page, boolean isTree) {
        checkNotNull(page);

        this.isTree = isTree;
        this.labelProvider = new WorkbenchLabelProvider();
        this.page = page;
    }

    @Override
    public void addListener(ILabelProviderListener listener) {
        super.addListener(listener);

        this.labelProvider.addListener(listener);
    }

    @Override
    public void removeListener(ILabelProviderListener listener) {
        super.removeListener(listener);

        this.labelProvider.removeListener(listener);
    }

    @Override
    public void dispose() {
        super.dispose();

        this.labelProvider.dispose();
    }

    @Override
    public Image getImage(Object element) {
        if (element instanceof IResource) {
            return this.labelProvider.getImage(element);
        }

        return null;
    }

    @Override
    public boolean isLabelProperty(Object element, String property) {
        return this.labelProvider.isLabelProperty(element, property);
    }

    @Override
    public StyledString getStyledText(Object element) {
        if (element instanceof IFile) {
            IFile file = (IFile) element;
            String fileName = file.getName();
            StyledString string = new StyledString(fileName);

            // file parent path
            if (!this.isTree) {
                String path = " - " + file.getParent().getFullPath().makeRelative().toString();

                string.append(path, StyledString.QUALIFIER_STYLER);
            }

            // match count
            SearchResult result = (SearchResult) this.page.getInput();
            int matchCount = result.getMatchCount(element);
            if (matchCount > 1) {
                String matches = " " + Resources.format("search.result.match", matchCount);

                string.append(matches, StyledString.COUNTER_STYLER);
            }

            return string;
        } else if (element instanceof IResource) {
            IResource resource = (IResource) element;

            return new StyledString(resource.getName());
        } else if (element instanceof MatchLine) {
            MatchLine matchLine = (MatchLine) element;
            String line = matchLine.getMatch().getLine().trim();

            return new StyledString(line);
        }

        return new StyledString();
    }
}
