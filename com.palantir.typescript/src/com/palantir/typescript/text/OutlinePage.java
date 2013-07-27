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

import org.eclipse.jface.viewers.BaseLabelProvider;
import org.eclipse.jface.viewers.ILabelProvider;
import org.eclipse.jface.viewers.ISelectionChangedListener;
import org.eclipse.jface.viewers.ITreeContentProvider;
import org.eclipse.jface.viewers.SelectionChangedEvent;
import org.eclipse.jface.viewers.TreeSelection;
import org.eclipse.jface.viewers.TreeViewer;
import org.eclipse.jface.viewers.Viewer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Image;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.ui.views.contentoutline.ContentOutlinePage;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.palantir.typescript.Images;
import com.palantir.typescript.services.language.LanguageService;
import com.palantir.typescript.services.language.NavigateToItem;
import com.palantir.typescript.services.language.ScriptElementKind;
import com.palantir.typescript.services.language.ScriptElementModifierKind;

/**
 * The outline view.
 *
 * @author dcicerone
 */
public final class OutlinePage extends ContentOutlinePage {

    private final TypeScriptEditor editor;

    public OutlinePage(TypeScriptEditor editor) {
        checkNotNull(editor);

        this.editor = editor;
    }

    @Override
    public void createControl(Composite parent) {
        super.createControl(parent);

        String fileName = this.editor.getFileName();
        LanguageService languageService = this.editor.getLanguageService();
        List<NavigateToItem> lexicalStructure = languageService.getScriptLexicalStructure(fileName);

        TreeViewer treeViewer = this.getTreeViewer();
        treeViewer.addSelectionChangedListener(new MySelectionChangedListener());
        treeViewer.setContentProvider(new MyContentProvider(lexicalStructure));
        treeViewer.setLabelProvider(new MyLabelProvider());
        treeViewer.setInput("");
        treeViewer.expandAll();
    }

    @Override
    protected int getTreeStyle() {
        return SWT.SINGLE | SWT.H_SCROLL | SWT.V_SCROLL;
    }

    private class MyContentProvider implements ITreeContentProvider {

        private final List<NavigateToItem> lexicalStructure;

        public MyContentProvider(List<NavigateToItem> lexicalStructure) {
            this.lexicalStructure = lexicalStructure;
        }

        @Override
        public void inputChanged(Viewer viewer, Object oldInput, Object newInput) {
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
        public Object[] getChildren(Object parentElement) {
            List<NavigateToItem> elements = Lists.newArrayList();
            NavigateToItem parentItem = (NavigateToItem) parentElement;
            String containerName = parentItem.getContainerName();
            String name = parentItem.getName();

            if (!containerName.isEmpty()) {
                name = containerName + "." + name;
            }

            for (NavigateToItem item : this.lexicalStructure) {
                if (item.getContainerName().equals(name)) {
                    elements.add(item);
                }
            }

            return elements.toArray();
        }

        @Override
        public Object getParent(Object element) {
            throw new UnsupportedOperationException();
        }

        @Override
        public boolean hasChildren(Object element) {
            return this.getChildren(element).length > 0;
        }

        @Override
        public void dispose() {
        }
    }

    private static final class MyLabelProvider extends BaseLabelProvider implements ILabelProvider {
        @Override
        public Image getImage(Object element) {
            NavigateToItem item = (NavigateToItem) element;
            ScriptElementKind kind = item.getKind();
            ImmutableList<ScriptElementModifierKind> kindModifiers = item.getKindModifiers();

            return Images.getImage(kind, kindModifiers);
        }

        @Override
        public String getText(Object element) {
            NavigateToItem item = (NavigateToItem) element;

            return item.getName();
        }
    }

    private final class MySelectionChangedListener implements ISelectionChangedListener {
        @Override
        public void selectionChanged(SelectionChangedEvent event) {
            TreeSelection selection = (TreeSelection) event.getSelection();
            NavigateToItem item = (NavigateToItem) selection.getFirstElement();
            int minChar = item.getMinChar();
            int limChar = item.getLimChar();

            OutlinePage.this.editor.selectAndReveal(minChar, limChar - minChar, item.getName());
        }
    }
}
