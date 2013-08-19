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

import org.eclipse.jface.viewers.ITreeContentProvider;
import org.eclipse.jface.viewers.TreeViewer;
import org.eclipse.jface.viewers.Viewer;
import org.eclipse.swt.widgets.Tree;

import com.google.common.collect.Lists;
import com.palantir.typescript.services.language.NavigateToItem;

/**
 * Provides content for the {@link Tree} in a {@link TreeViewer}.
 *
 * @author tyleradams
 */
public final class ContentProvider implements ITreeContentProvider {

    private List<NavigateToItem> lexicalStructure;

    @Override
    public void dispose() {
    }

    @Override
    public Object[] getChildren(Object parentElement) {
        checkNotNull(parentElement);

        List<NavigateToItem> elements = Lists.newArrayList();
        NavigateToItem parentItem = (NavigateToItem) parentElement;
        String qualifiedName = this.getQualifiedName(parentItem);

        for (NavigateToItem item : this.lexicalStructure) {
            if (item.getContainerName().equals(qualifiedName)) {
                elements.add(item);
            }
        }

        return elements.toArray();
    }

    @Override
    public Object[] getElements(Object inputElement) {
        List<NavigateToItem> elements = Lists.newArrayList();

        for (NavigateToItem item : this.lexicalStructure) {
            if (item.getContainerName().isEmpty()) {
                elements.add(item);
            }
        }

        return elements.toArray();
    }

    @Override
    public Object getParent(Object childElement) {
        checkNotNull(childElement);

        NavigateToItem childItem = (NavigateToItem) childElement;
        String containerName = childItem.getContainerName();
        if (containerName.isEmpty()) {
            return null;
        }

        for (NavigateToItem item : this.lexicalStructure) {
            String itemName = this.getQualifiedName(item);
            if (containerName.equals(itemName)) {
                return item;
            }
        }

        return null;
    }

    @Override
    public boolean hasChildren(Object element) {
        return this.getChildren(element).length > 0;
    }

    @Override
    public void inputChanged(Viewer viewer, Object oldInput, Object newInput) {
        if (newInput instanceof List) {
            this.lexicalStructure = (List<NavigateToItem>) newInput;
        } else if (newInput == null) {
            this.lexicalStructure = Lists.newArrayList();
        } else {
            throw new RuntimeException("Invalid input for the content provider.");
        }
    }

    private String getQualifiedName(NavigateToItem item) {
        checkNotNull(item);

        if (item.getContainerName().isEmpty()) {
            return item.getName();
        } else {
            return item.getContainerName() + "." + item.getName();
        }
    }
}
