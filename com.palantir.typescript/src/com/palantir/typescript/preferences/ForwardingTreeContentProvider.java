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

package com.palantir.typescript.preferences;

import org.eclipse.jface.viewers.ITreeContentProvider;
import org.eclipse.jface.viewers.Viewer;

/**
 * A tree content provider which forwards its calls to a delegate.
 *
 * @author dcicerone
 */
abstract class ForwardingTreeContentProvider implements ITreeContentProvider {

    private final ITreeContentProvider delegate;

    ForwardingTreeContentProvider(ITreeContentProvider delegate) {
        this.delegate = delegate;
    }

    @Override
    public void dispose() {
        this.delegate.dispose();
    }

    @Override
    public void inputChanged(Viewer viewer, Object oldInput, Object newInput) {
        this.delegate.inputChanged(viewer, oldInput, newInput);
    }

    @Override
    public Object[] getElements(Object inputElement) {
        return this.delegate.getElements(inputElement);
    }

    @Override
    public Object[] getChildren(Object parentElement) {
        return this.delegate.getChildren(parentElement);
    }

    @Override
    public Object getParent(Object element) {
        return this.delegate.getParent(element);
    }

    @Override
    public boolean hasChildren(Object element) {
        return this.delegate.hasChildren(element);
    }
}
