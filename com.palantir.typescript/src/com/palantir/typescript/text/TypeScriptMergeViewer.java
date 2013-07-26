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

import org.eclipse.compare.CompareConfiguration;
import org.eclipse.compare.contentmergeviewer.TextMergeViewer;
import org.eclipse.jface.text.TextViewer;
import org.eclipse.jface.text.presentation.IPresentationReconciler;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.ui.editors.text.TextSourceViewerConfiguration;

/**
 * The TypeScript merge viewer.
 *
 * @author dcicerone
 */
public final class TypeScriptMergeViewer extends TextMergeViewer {

    public TypeScriptMergeViewer(Composite parent, CompareConfiguration configuration) {
        super(parent, configuration);
    }

    @Override
    protected void configureTextViewer(TextViewer textViewer) {
        if (textViewer instanceof ISourceViewer) {
            ISourceViewer sourceViewer = (ISourceViewer) textViewer;

            // set the presentation reconciler (it implements the syntax highlighting)
            sourceViewer.configure(new TextSourceViewerConfiguration() {
                @Override
                public IPresentationReconciler getPresentationReconciler(ISourceViewer sourceViewer2) {
                    return new PresentationReconciler();
                }
            });
        }
    }
}
