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

import org.eclipse.jface.action.IToolBarManager;
import org.eclipse.jface.text.TextSelection;
import org.eclipse.jface.viewers.ISelection;
import org.eclipse.jface.viewers.ISelectionChangedListener;
import org.eclipse.jface.viewers.SelectionChangedEvent;
import org.eclipse.jface.viewers.TreePath;
import org.eclipse.jface.viewers.TreeSelection;
import org.eclipse.jface.viewers.TreeViewer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Tree;
import org.eclipse.swt.widgets.TreeItem;
import org.eclipse.ui.IActionBars;
import org.eclipse.ui.ISelectionListener;
import org.eclipse.ui.IWorkbenchPart;
import org.eclipse.ui.part.IPageSite;
import org.eclipse.ui.views.contentoutline.ContentOutlinePage;

import com.google.common.collect.ImmutableList;
import com.palantir.typescript.navigate.NavigationBarItemLabelProvider;
import com.palantir.typescript.services.language.NavigationBarItem;
import com.palantir.typescript.services.language.TextSpan;
import com.palantir.typescript.text.actions.CollapseAllAction;

/**
 * The outline view.
 *
 * @author dcicerone
 */
public final class OutlinePage extends ContentOutlinePage {

    private final TypeScriptEditor editor;
    private final MySelectionListener selectionListener;

    public OutlinePage(TypeScriptEditor editor) {
        checkNotNull(editor);

        this.editor = editor;
        this.selectionListener = new MySelectionListener();
    }

    @Override
    public void createControl(Composite parent) {
        super.createControl(parent);

        List<NavigationBarItem> navigationBarItems = this.editor.getLanguageService().getNavigationBarItems();

        TreeViewer treeViewer = this.getTreeViewer();
        treeViewer.addSelectionChangedListener(new MySelectionChangedListener());
        treeViewer.setContentProvider(new ContentProvider());
        treeViewer.setLabelProvider(new NavigationBarItemLabelProvider());
        treeViewer.setInput(navigationBarItems);

        IPageSite site = getSite();
        IActionBars actionBars = site.getActionBars();
        IToolBarManager toolBarManager = actionBars.getToolBarManager();

        toolBarManager.add(new CollapseAllAction(treeViewer));

        // expand all the nodes if there aren't too many of them
        if (navigationBarItems.size() < 500) {
            treeViewer.expandAll();
        }

        this.getSite().getWorkbenchWindow().getSelectionService().addPostSelectionListener(this.selectionListener);
    }

    @Override
    public void dispose() {
        super.dispose();

        this.getSite().getWorkbenchWindow().getSelectionService().removePostSelectionListener(this.selectionListener);
    }

    public boolean isVisible() {
        Control control = this.getControl();

        return control != null && !control.isDisposed() && control.isVisible();
    }

    public void refreshInput() {
        List<NavigationBarItem> navigationBarItems = this.editor.getLanguageService().getNavigationBarItems();

        this.setInput(navigationBarItems);
    }

    public void setInput(List<NavigationBarItem> navigateToItems) {
        checkNotNull(navigateToItems);

        if (!navigateToItems.equals(this.getTreeViewer().getInput())) {
            List<TreePath> newExpandedTreePaths = mapTreePaths(navigateToItems);

            this.getTreeViewer().setInput(navigateToItems);
            this.getTreeViewer().setExpandedTreePaths(newExpandedTreePaths.toArray(new TreePath[0]));
        }
    }

    @Override
    protected int getTreeStyle() {
        return SWT.SINGLE | SWT.H_SCROLL | SWT.V_SCROLL;
    }

    private NavigationBarItem mapSegment(List<NavigationBarItem> lexicalStructure, NavigationBarItem segment) {
        for (NavigationBarItem item : lexicalStructure) {
            if (segment.getText().equals(item.getText())) {
                return item;
            }
        }

        return null;
    }

    private List<TreePath> mapTreePaths(List<NavigationBarItem> lexicalStructure) {
        ImmutableList.Builder<TreePath> treePaths = ImmutableList.builder();

        for (TreePath treePath : this.getTreeViewer().getExpandedTreePaths()) {
            TreePath newTreePath = TreePath.EMPTY;

            for (int i = 0; i < treePath.getSegmentCount(); i++) {
                NavigationBarItem segment = (NavigationBarItem) treePath.getSegment(i);
                NavigationBarItem newSegment = mapSegment(lexicalStructure, segment);
                if (newSegment != null) {
                    newTreePath = newTreePath.createChildPath(newSegment);
                }
            }

            treePaths.add(newTreePath);
        }

        return treePaths.build();
    }

    private final class MySelectionChangedListener implements ISelectionChangedListener {
        @Override
        public void selectionChanged(SelectionChangedEvent event) {
            // only respond to the selection change if the Tree is focused
            if (Display.getCurrent().getFocusControl() instanceof Tree) {
                TreeSelection selection = (TreeSelection) event.getSelection();
                NavigationBarItem item = (NavigationBarItem) selection.getFirstElement();

                if (item != null) {
                    TextSpan textSpan = item.getSpans().get(0);

                    OutlinePage.this.editor.selectAndReveal(textSpan.getStart(), textSpan.getLength(), item.getText());
                }
            }
        }
    }

    private final class MySelectionListener implements ISelectionListener {
        @Override
        public void selectionChanged(IWorkbenchPart part, ISelection selection) {
            if (part instanceof TypeScriptEditor) {
                TextSelection textSelection = (TextSelection) selection;
                int offset = textSelection.getOffset();
                TreeItem[] treeItems = getTreeViewer().getTree().getItems();

                if (!this.selectTreeItem(treeItems, offset)) {
                    OutlinePage.this.getTreeViewer().getTree().deselectAll();
                }
            }
        }

        private boolean selectTreeItem(TreeItem[] treeItems, int offset) {
            boolean selected = false;

            for (TreeItem treeItem : treeItems) {
                NavigationBarItem navigateToItem = (NavigationBarItem) treeItem.getData();

                if (navigateToItem == null) {
                    continue;
                }

                TextSpan textSpan = navigateToItem.getSpans().get(0);
                if (textSpan.getStart() <= offset && offset <= textSpan.getStart() + textSpan.getLength()) {
                    TreeItem[] childTreeItems = treeItem.getItems();

                    // check for a better match in one of the children items
                    if (childTreeItems.length != 0) {
                        selected = this.selectTreeItem(childTreeItems, offset);
                    }

                    // no better match found, select this item
                    if (!selected) {
                        OutlinePage.this.getTreeViewer().getTree().select(treeItem);
                        selected = true;
                    }

                    return selected;
                }
            }

            return selected;
        }
    }
}
