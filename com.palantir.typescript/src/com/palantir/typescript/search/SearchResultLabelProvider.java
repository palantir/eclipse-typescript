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
import org.eclipse.jface.viewers.DelegatingStyledCellLabelProvider.IStyledLabelProvider;
import org.eclipse.jface.viewers.ILabelProviderListener;
import org.eclipse.jface.viewers.LabelProvider;
import org.eclipse.jface.viewers.StyledString;
import org.eclipse.swt.graphics.Image;
import org.eclipse.ui.model.WorkbenchLabelProvider;

/**
 * The label provider for a search result.
 *
 * @author dcicerone
 */
final class SearchResultLabelProvider extends LabelProvider implements IStyledLabelProvider {

    private final WorkbenchLabelProvider labelProvider;
    private final SearchResultPage page;

    public SearchResultLabelProvider(SearchResultPage page) {
        checkNotNull(page);

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
        return this.labelProvider.getImage(element);
    }

    @Override
    public boolean isLabelProperty(Object element, String property) {
        return this.labelProvider.isLabelProperty(element, property);
    }

    @Override
    public StyledString getStyledText(Object element) {
        IFile file = (IFile) element;
        String fileName = file.getName();
        StyledString string = new StyledString(fileName);

        // file parent path
        String path = " - " + file.getParent().getFullPath().makeRelative().toString();
        string.append(path, StyledString.QUALIFIER_STYLER);

        // match count
        SearchResult result = (SearchResult) this.page.getInput();
        int matchCount = result.getMatchCount(element);
        String count = MessageFormat.format(" ({0,choice,1#1 match|1<{0,number,integer} matches})", matchCount);
        string.append(count, StyledString.COUNTER_STYLER);

        return string;
    }
}
