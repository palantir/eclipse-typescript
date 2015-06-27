/*
 * Copyright 2015 Diogo Sant'Ana.
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

package com.palantir.typescript.text.actions;

import static com.google.common.base.Preconditions.checkNotNull;

import org.eclipse.jface.action.Action;
import org.eclipse.jface.viewers.TreeViewer;
import org.eclipse.swt.widgets.Control;
import org.eclipse.ui.ISharedImages;
import org.eclipse.ui.PlatformUI;

import com.palantir.typescript.Resources;

/**
 * Outline view collapse all action.
 *
 * @author Diogo Sant'Ana <diogosantana@gmail.com>
 */
public final class CollapseAllAction extends Action {

    private final TreeViewer viewer;

    public CollapseAllAction(TreeViewer viewer) {
        checkNotNull(viewer);

        this.viewer = viewer;

        this.setImageDescriptor(PlatformUI.getWorkbench().getSharedImages().getImageDescriptor(ISharedImages.IMG_ELCL_COLLAPSEALL));
        this.setText(Resources.BUNDLE.getString("collapse.all"));
    }

    @Override
    public void run() {
        Control control = this.viewer.getControl();

        control.setRedraw(false);
        try {
            this.viewer.collapseAll();
        } finally {
            control.setRedraw(true);
        }
    }
}
