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

import java.util.Set;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.jface.viewers.ITreeContentProvider;
import org.eclipse.jface.viewers.Viewer;
import org.eclipse.search.ui.text.Match;

import com.google.common.collect.LinkedHashMultimap;
import com.google.common.collect.Multimap;
import com.google.common.collect.SetMultimap;
import com.google.common.collect.TreeMultimap;

/**
 * The search result tree view content provider.
 *
 * @author dcicerone
 */
final class SearchResultTreeContentProvider implements ITreeContentProvider {

    private final Multimap<Object, Object> children;

    SearchResultTreeContentProvider() {
        this.children = LinkedHashMultimap.create();
    }

    @Override
    public void dispose() {
    }

    @Override
    public Object[] getChildren(Object parentElement) {
        return this.children.get(parentElement).toArray();
    }

    @Override
    public Object[] getElements(Object inputElement) {
        return this.getChildren(inputElement);
    }

    @Override
    public Object getParent(Object element) {
        if (element instanceof IResource) {
            if (!(element instanceof IProject)) {
                IResource resource = (IResource) element;

                return resource.getParent();
            }
        } else if (element instanceof LineResult) {
            LineResult lineResult = (LineResult) element;

            return lineResult.getMatches().get(0).getElement();
        }

        return null;
    }

    @Override
    public boolean hasChildren(Object element) {
        return !this.children.get(element).isEmpty();
    }

    @Override
    public void inputChanged(Viewer viewer, Object oldInput, Object newInput) {
        if (newInput instanceof SearchResult) {
            this.setSearchResult((SearchResult) newInput);
        }
    }

    private void add(SearchResult searchResult, Object child) {
        Object parent = this.getParent(child);

        while (parent != null) {
            if (!this.children.put(parent, child)) {
                return;
            }

            child = parent;
            parent = this.getParent(child);
        }

        this.children.put(searchResult, child);
    }

    private void setSearchResult(SearchResult searchResult) {
        this.children.clear();

        for (Object element : searchResult.getElements()) {
            SetMultimap<Integer, FindReferenceMatch> matchesByLineNumber = TreeMultimap.create();

            // collect the matches for each line
            for (Match match : searchResult.getMatches(element)) {
                FindReferenceMatch findReferenceMatch = (FindReferenceMatch) match;
                int lineNumber = findReferenceMatch.getReference().getLineNumber();

                matchesByLineNumber.put(lineNumber, findReferenceMatch);
            }

            // add the lines
            for (Integer lineNumber : matchesByLineNumber.keySet()) {
                Set<FindReferenceMatch> lineMatches = matchesByLineNumber.get(lineNumber);
                LineResult lineResult = new LineResult(lineMatches);

                this.add(searchResult, lineResult);
            }
        }
    }
}
