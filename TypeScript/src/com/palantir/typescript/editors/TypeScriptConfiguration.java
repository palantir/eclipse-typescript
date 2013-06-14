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

package com.palantir.typescript.editors;

import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.ITextDoubleClickStrategy;
import org.eclipse.jface.text.presentation.IPresentationReconciler;
import org.eclipse.jface.text.presentation.PresentationReconciler;
import org.eclipse.jface.text.rules.DefaultDamagerRepairer;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.jface.text.source.SourceViewerConfiguration;

import com.google.common.base.Preconditions;

/**
 * Configures the features of the editor. This is the entry point for features like intelligent
 * double click, auto completion, and syntax highlighting.
 *
 * @author tyleradams
 */
public final class TypeScriptConfiguration extends SourceViewerConfiguration {
    private final TypeScriptDoubleClickStrategy doubleClickStrategy;
    private final TypeScriptScanner scanner;

    public TypeScriptConfiguration(ColorManager colorManager) {
        Preconditions.checkNotNull(colorManager);
        scanner = new TypeScriptScanner(colorManager);
        doubleClickStrategy = new TypeScriptDoubleClickStrategy();
    }

    @Override
    public String[] getConfiguredContentTypes(ISourceViewer sourceViewer) {
        return new String[] { IDocument.DEFAULT_CONTENT_TYPE };
    }

    @Override
    public ITextDoubleClickStrategy getDoubleClickStrategy(ISourceViewer sourceViewer, String contentType) {
        return doubleClickStrategy;
    }

    protected TypeScriptScanner getTypeScriptScanner() {
        return scanner;
    }

    @Override
    public IPresentationReconciler getPresentationReconciler(ISourceViewer sourceViewer) {
        PresentationReconciler reconciler = new PresentationReconciler();

        DefaultDamagerRepairer damagerRepairer = new DefaultDamagerRepairer(getTypeScriptScanner());
        reconciler.setDamager(damagerRepairer, IDocument.DEFAULT_CONTENT_TYPE);
        reconciler.setRepairer(damagerRepairer, IDocument.DEFAULT_CONTENT_TYPE);

        return reconciler;
    }

}
