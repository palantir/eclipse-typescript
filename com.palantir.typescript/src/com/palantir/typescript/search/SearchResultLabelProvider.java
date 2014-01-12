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
import org.eclipse.jface.viewers.DecoratingStyledCellLabelProvider;
import org.eclipse.jface.viewers.DelegatingStyledCellLabelProvider;
import org.eclipse.jface.viewers.DelegatingStyledCellLabelProvider.IStyledLabelProvider;
import org.eclipse.jface.viewers.StyledString;
import org.eclipse.jface.viewers.StyledString.Styler;
import org.eclipse.ui.PlatformUI;
import org.eclipse.ui.model.WorkbenchLabelProvider;

import com.google.common.base.CharMatcher;
import com.palantir.typescript.Resources;
import com.palantir.typescript.services.language.ReferenceEntryEx;

/**
 * The label provider for a search result.
 *
 * @author dcicerone
 */
final class SearchResultLabelProvider extends DelegatingStyledCellLabelProvider implements IStyledLabelProvider {

    private static final String HIGHLIGHT_BG_COLOR_NAME = "org.eclipse.search.ui.match.highlight";
    private static final Styler HIGHLIGHT_STYLE = StyledString.createColorRegistryStyler(null, HIGHLIGHT_BG_COLOR_NAME);
    private static final CharMatcher NON_WHITESPACE_MATCHER = CharMatcher.WHITESPACE.negate();

    private final boolean isTree;
    private final SearchResultPage page;

    public SearchResultLabelProvider(SearchResultPage page, boolean isTree) {
        super(new MyWorkbenchLabelProvider());

        checkNotNull(page);

        this.isTree = isTree;
        this.page = page;
    }

    @Override
    public StyledString getStyledText(Object element) {
        if (element instanceof IFile) {
            return this.getFileStyledText((IFile) element);
        } else if (element instanceof LineResult) {
            return this.getLineStyledText((LineResult) element);
        }

        return super.getStyledText(element);
    }

    private StyledString getFileStyledText(IFile file) {
        String fileName = file.getName();
        StyledString string = new StyledString(fileName);

        // file parent path
        if (!this.isTree) {
            String path = " - " + file.getParent().getFullPath().makeRelative().toString();

            string.append(path, StyledString.QUALIFIER_STYLER);
        }

        // match count
        SearchResult result = (SearchResult) this.page.getInput();
        int matchCount = result.getMatchCount(file);
        if (matchCount > 1) {
            String matches = " " + Resources.format("search.result.match", matchCount);

            string.append(matches, StyledString.COUNTER_STYLER);
        }

        return string;
    }

    private StyledString getLineStyledText(LineResult lineResult) {
        StyledString string = new StyledString();
        ReferenceEntryEx firstReference = lineResult.getMatches().get(0).getReference();

        // line number
        int lineNumber = firstReference.getLineNumber();
        String lineNumberString = MessageFormat.format("{0,number,integer}: ", lineNumber + 1);
        string.append(lineNumberString, StyledString.QUALIFIER_STYLER);

        // line (highlight the matches)
        int lineStart = firstReference.getLineStart();
        String line = firstReference.getLine();
        int trimStart = NON_WHITESPACE_MATCHER.indexIn(line);
        int trimEnd = NON_WHITESPACE_MATCHER.lastIndexIn(line);
        string.append(line.substring(trimStart, trimEnd));
        for (FindReferenceMatch match : lineResult.getMatches()) {
            ReferenceEntryEx reference = match.getReference();
            int minChar = reference.getMinChar();
            int limChar = reference.getLimChar();
            int offset = minChar + lineNumberString.length() - trimStart - lineStart;
            int length = limChar - minChar;

            // highlight the match if its present in the line (note: the line may have been truncated earlier)
            if (offset + length <= string.length()) {
                string.setStyle(offset, length, HIGHLIGHT_STYLE);
            }
        }

        return string;
    }

    private static final class MyWorkbenchLabelProvider extends DecoratingStyledCellLabelProvider implements IStyledLabelProvider {

        private MyWorkbenchLabelProvider() {
            super(new WorkbenchLabelProvider(), PlatformUI.getWorkbench().getDecoratorManager().getLabelDecorator(), null);
        }

        @Override
        public StyledString getStyledText(Object element) {
            return super.getStyledText(element);
        }
    }
}
