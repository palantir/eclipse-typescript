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

import org.eclipse.jface.text.DefaultInformationControl;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IInformationControl;
import org.eclipse.jface.text.IInformationControlCreator;
import org.eclipse.jface.text.ITextHover;
import org.eclipse.jface.text.contentassist.ContentAssistant;
import org.eclipse.jface.text.contentassist.IContentAssistant;
import org.eclipse.jface.text.formatter.IContentFormatter;
import org.eclipse.jface.text.presentation.IPresentationReconciler;
import org.eclipse.jface.text.source.DefaultAnnotationHover;
import org.eclipse.jface.text.source.IAnnotationHover;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.swt.widgets.Shell;
import org.eclipse.ui.editors.text.TextSourceViewerConfiguration;

/**
 * Configures the features of the editor. This is the entry point for features like intelligent
 * double click, auto completion, and syntax highlighting.
 *
 * @author tyleradams
 */
public final class SourceViewerConfiguration extends TextSourceViewerConfiguration {

    private final TypeScriptEditor editor;

    public SourceViewerConfiguration(TypeScriptEditor editor) {
        checkNotNull(editor);

        this.editor = editor;
    }

    @Override
    public IAnnotationHover getAnnotationHover(ISourceViewer sourceViewer) {
        return new DefaultAnnotationHover();
    }

    @Override
    public IContentAssistant getContentAssistant(ISourceViewer sourceViewer) {
        checkNotNull(sourceViewer);

        ContentAssistProcessor contentAssistProcessor = new ContentAssistProcessor(this.editor);

        ContentAssistant contentAssistant = new ContentAssistant();
        contentAssistant.addCompletionListener(contentAssistProcessor);
        contentAssistant.enableAutoActivation(true);
        contentAssistant.setAutoActivationDelay(200);
        contentAssistant.setContentAssistProcessor(contentAssistProcessor, IDocument.DEFAULT_CONTENT_TYPE);
        contentAssistant.setInformationControlCreator(new MyInformationControlCreator());
        contentAssistant.setProposalPopupOrientation(IContentAssistant.CONTEXT_INFO_ABOVE);

        return contentAssistant;
    }

    @Override
    public IContentFormatter getContentFormatter(ISourceViewer sourceViewer) {
        return new ContentFormatter(this.editor);
    }

    @Override
    public IPresentationReconciler getPresentationReconciler(ISourceViewer sourceViewer) {
        return new PresentationReconciler(this.editor);
    }

    @Override
    public ITextHover getTextHover(ISourceViewer sourceViewer, String contentType) {
        return new TextHover(sourceViewer);
    }

    private static final class MyInformationControlCreator implements IInformationControlCreator {
        @Override
        public IInformationControl createInformationControl(Shell parent) {
            return new DefaultInformationControl(parent);
        }
    }
}
