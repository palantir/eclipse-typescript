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

import org.eclipse.jface.text.information.IInformationPresenter;
import org.eclipse.jface.text.source.IOverviewRuler;
import org.eclipse.jface.text.source.IVerticalRuler;
import org.eclipse.jface.text.source.SourceViewer;
import org.eclipse.jface.text.source.SourceViewerConfiguration;
import org.eclipse.swt.widgets.Composite;

/**
 * Source viewer for .ts files.
 *
 * @author tyleradams
 */
public final class TypeScriptSourceViewer extends SourceViewer {

    public static final int SHOW_OUTLINE = 51;

    private IInformationPresenter outlinePresenter;

    public TypeScriptSourceViewer(Composite parent, IVerticalRuler verticalRuler, IOverviewRuler overviewRuler,
            boolean showAnnotationsOverview, int styles) {
        super(parent, verticalRuler, overviewRuler, showAnnotationsOverview, styles);
    }

    @Override
    public void configure(SourceViewerConfiguration configuration) {
        checkNotNull(configuration);

        super.configure(configuration);

        TypeScriptSourceViewerConfiguration typeScriptConfiguration = (TypeScriptSourceViewerConfiguration) configuration;
        this.outlinePresenter = typeScriptConfiguration.getOutlinePresenter(this);
        this.outlinePresenter.install(this);
    }

    @Override
    public void doOperation(int operation) {
        if (this.getTextWidget() == null) {
            return;
        }

        switch (operation) {
            case SHOW_OUTLINE:
                if (this.outlinePresenter != null) {
                    this.outlinePresenter.showInformation();
                }
        }

        super.doOperation(operation);
    }

    @Override
    public void unconfigure() {
        if (this.outlinePresenter != null) {
            this.outlinePresenter.uninstall();
            this.outlinePresenter = null;
        }

        super.unconfigure();
    }

    @Override
    public boolean canDoOperation(int operation) {
        if (operation == SHOW_OUTLINE) {
            return this.outlinePresenter != null;
        } else {
            return super.canDoOperation(operation);
        }
    }
}
