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

import com.google.common.collect.ImmutableList;
import com.palantir.typescript.services.language.NavigationBarItem;

/**
 * Provides content for the {@link Tree} in a {@link TreeViewer}.
 *
 * @author tyleradams
 */
public final class ContentProvider implements ITreeContentProvider {

    private List<NavigationBarItem> navigationBarItems;

    @Override
    public void dispose() {
    }

    @Override
    public Object[] getChildren(Object parentElement) {
        checkNotNull(parentElement);

        NavigationBarItem parentItem = (NavigationBarItem) parentElement;

        return parentItem.getChildItems().toArray();
    }

    @Override
    public Object[] getElements(Object inputElement) {
        return this.navigationBarItems.toArray();
    }

    @Override
    public Object getParent(Object childElement) {
        checkNotNull(childElement);

        for (NavigationBarItem item : this.navigationBarItems) {
            Object parent = getParent(item, childElement);

            if (parent != null) {
                return parent;
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
            this.navigationBarItems = (List<NavigationBarItem>) newInput;
        } else if (newInput == null) {
            this.navigationBarItems = ImmutableList.<NavigationBarItem> of();
        } else {
            throw new RuntimeException("Invalid input for the content provider.");
        }
    }

    private static Object getParent(NavigationBarItem item, Object childElement) {
        for (NavigationBarItem childItem : item.getChildItems()) {
            if (childItem.equals(childElement)) {
                return item;
            } else {
                Object parent = getParent(childItem, childElement);

                if (parent != null) {
                    return parent;
                }
            }
        }

        return null;
    }
}
