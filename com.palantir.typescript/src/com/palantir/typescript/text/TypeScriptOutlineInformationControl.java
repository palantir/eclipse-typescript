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

import org.eclipse.jface.dialogs.Dialog;
import org.eclipse.jface.dialogs.PopupDialog;
import org.eclipse.jface.text.IInformationControl;
import org.eclipse.jface.text.IInformationControlExtension2;
import org.eclipse.jface.viewers.ILabelProvider;
import org.eclipse.jface.viewers.ITreeContentProvider;
import org.eclipse.jface.viewers.TreePath;
import org.eclipse.jface.viewers.TreeSelection;
import org.eclipse.jface.viewers.TreeViewer;
import org.eclipse.jface.viewers.Viewer;
import org.eclipse.jface.viewers.ViewerFilter;
import org.eclipse.osgi.util.TextProcessor;
import org.eclipse.swt.SWT;
import org.eclipse.swt.events.DisposeListener;
import org.eclipse.swt.events.FocusListener;
import org.eclipse.swt.events.KeyEvent;
import org.eclipse.swt.events.KeyListener;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.events.SelectionListener;
import org.eclipse.swt.graphics.Color;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Shell;
import org.eclipse.swt.widgets.Text;
import org.eclipse.swt.widgets.Tree;
import org.eclipse.swt.widgets.TreeItem;

import com.google.common.collect.Lists;
import com.palantir.typescript.navigate.NavigateToItemLabelProvider;
import com.palantir.typescript.services.language.NavigateToItem;

/**
 * Information control for a TypeScript based quick outline.
 *
 * @author tyleradams
 */
public final class TypeScriptOutlineInformationControl extends PopupDialog implements IInformationControl, IInformationControlExtension2 {

    private final TypeScriptEditor editor;
    private final int treeStyle;

    private Text textBox;
    private TreeViewer treeViewer;

    private PrefixMatcher matcher;

    public TypeScriptOutlineInformationControl(Shell parent, int shellStyle, TypeScriptEditor editor, int treeStyle) {
        super(parent, shellStyle, true, true, false, true, true, null, null);

        checkNotNull(editor);

        this.editor = editor;
        this.treeStyle = treeStyle;

        this.create();
    }

    @Override
    public void addDisposeListener(DisposeListener listener) {
        this.getShell().addDisposeListener(listener);
    }

    @Override
    public void removeDisposeListener(DisposeListener listener) {
        this.getShell().removeDisposeListener(listener);
    }

    @Override
    public void addFocusListener(FocusListener listener) {
        this.getShell().addFocusListener(listener);
    }

    @Override
    public void removeFocusListener(FocusListener listener) {
        this.getShell().removeFocusListener(listener);
    }

    @Override
    public Point computeSizeHint() {
        return this.getShell().getSize();
    }

    @Override
    public void dispose() {
        this.close();
    }

    @Override
    public boolean isFocusControl() {
        return this.getShell().getDisplay().getActiveShell() == this.getShell();
    }

    @Override
    public void setBackgroundColor(Color background) {
        this.applyBackgroundColor(background, this.getContents());
    }

    @Override
    public void setFocus() {
        this.getShell().forceFocus();
        this.textBox.setFocus();
    }

    @Override
    public void setForegroundColor(Color foreground) {
        this.applyForegroundColor(foreground, this.getContents());
    }

    @Override
    public void setInformation(String information) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void setInput(Object input) {
        this.textBox.setText("");
        this.treeViewer.setInput(input);
        this.treeViewer.setSelection(this.getSearchSelection());

        // expand all the nodes if there aren't too many of them
        List<NavigateToItem> items = (List) input;
        if (items.size() < 500) {
            this.treeViewer.expandAll();
        }
    }

    @Override
    public void setLocation(Point location) {
        if (!this.getPersistLocation()) {
            this.getShell().setLocation(location);
        }
    }

    @Override
    public void setSize(int width, int height) {
        this.getShell().setSize(width, height);
    }

    @Override
    public void setSizeConstraints(int maxWidth, int maxHeight) {
    }

    @Override
    public void setVisible(boolean visible) {
        this.getShell().setVisible(visible);
    }

    @Override
    protected Control createDialogArea(Composite parent) {
        final Tree tree = new Tree(parent, SWT.SINGLE | (this.treeStyle & ~SWT.MULTI));
        tree.addSelectionListener(new SelectionListener() {
            @Override
            public void widgetSelected(SelectionEvent selectionEvent) {
            }

            @Override
            public void widgetDefaultSelected(SelectionEvent selectionEvent) {
                TypeScriptOutlineInformationControl.this.goToSelectedElement();
            }
        });

        GridData gridData = new GridData(GridData.FILL_BOTH);
        gridData.heightHint = tree.getItemHeight() * 12;
        tree.setLayoutData(gridData);

        this.treeViewer = new TreeViewer(tree);
        this.treeViewer.addFilter(new MyViewerFilter());
        this.treeViewer.setContentProvider(new ContentProvider());
        this.treeViewer.setLabelProvider(new NavigateToItemLabelProvider());

        // set up the text box
        this.textBox.setText("");
        this.textBox.addModifyListener(new ModifyListener() {
            @Override
            public void modifyText(ModifyEvent modifyEvent) {
                String filterString = ((Text) modifyEvent.widget).getText();
                TypeScriptOutlineInformationControl.this.matcher = new PrefixMatcher(filterString);
                TypeScriptOutlineInformationControl.this.refreshTree();
            }
        });

        return this.treeViewer.getControl();
    }

    @Override
    protected Control createTitleControl(Composite parent) {
        this.textBox = createFilterText(parent);
        return this.textBox;
    }

    private Text createFilterText(Composite parent) {
        this.textBox = new Text(parent, SWT.NONE);
        Dialog.applyDialogFont(this.textBox);

        GridData gridData = new GridData(GridData.FILL_HORIZONTAL);
        gridData.horizontalAlignment = GridData.FILL;
        gridData.verticalAlignment = GridData.CENTER;

        this.textBox.setLayoutData(gridData);

        this.textBox.addKeyListener(new KeyListener() {
            @Override
            public void keyPressed(KeyEvent keyEvent) {
                switch (keyEvent.keyCode) {
                    case SWT.CR:
                    case SWT.KEYPAD_CR:
                        goToSelectedElement();
                        break;
                    case SWT.ARROW_DOWN:
                    case SWT.ARROW_UP:
                        TypeScriptOutlineInformationControl.this.treeViewer.getTree().setFocus();
                        break;
                    case SWT.ESC:
                        dispose();
                        break;
                }
            }

            @Override
            public void keyReleased(KeyEvent e) {
            }
        });
        return this.textBox;
    }

    private TreeSelection getSearchSelection() {
        Tree tree = this.treeViewer.getTree();
        List<Object> segments = Lists.newArrayList();

        if (tree.getItemCount() == 0) {
            return new TreeSelection();
        }

        TreeItem item = tree.getItem(0);

        Object itemData = item.getData();
        segments.add(itemData);
        while (item.getItemCount() > 0 && !this.matchesSearchString((NavigateToItem) itemData)) {
            item = item.getItem(0);
            itemData = item.getData();

            if (itemData != null) {
                segments.add(itemData);
            }
        }

        TreePath treePath = new TreePath(segments.toArray());
        return new TreeSelection(treePath);
    }

    private void goToSelectedElement() {
        TreeSelection selection = (TreeSelection) this.treeViewer.getSelection();
        NavigateToItem item = (NavigateToItem) selection.getFirstElement();

        if (item != null) {
            int minChar = item.getMinChar();
            int limChar = item.getLimChar();

            this.editor.selectAndReveal(minChar, limChar - minChar, item.getName());
        }
        dispose();
    }

    private boolean matchesSearchString(NavigateToItem item) {
        checkNotNull(item);

        return matchesSearchString(item.getName());
    }

    private boolean matchesSearchString(String rawString) {
        checkNotNull(rawString);

        return this.matcher == null || this.matcher.matches(rawString);
    }

    private void refreshTree() {
        this.treeViewer.getControl().setRedraw(false);
        this.treeViewer.refresh();
        this.treeViewer.setSelection(this.getSearchSelection());
        this.treeViewer.getControl().setRedraw(true);
    }

    private final class MyViewerFilter extends ViewerFilter {

        @Override
        public boolean select(Viewer viewer, Object parentElement, Object element) {
            checkNotNull(viewer);

            TreeViewer localTreeViewer = (TreeViewer) viewer;
            String processedElementName = ((ILabelProvider) localTreeViewer.getLabelProvider()).getText(element);
            String elementName = TextProcessor.deprocess(processedElementName);

            return TypeScriptOutlineInformationControl.this.matchesSearchString(elementName) || hasSelectedChild(localTreeViewer, element);
        }

        private boolean hasSelectedChild(TreeViewer viewer, Object element) {
            checkNotNull(viewer);

            for (Object child : ((ITreeContentProvider) viewer.getContentProvider()).getChildren(element)) {
                if (select(viewer, element, child)) {
                    return true;
                }
            }
            return false;
        }
    }
}
