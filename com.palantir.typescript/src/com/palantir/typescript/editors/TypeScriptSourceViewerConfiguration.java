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

import org.eclipse.jface.text.DefaultIndentLineAutoEditStrategy;
import org.eclipse.jface.text.DefaultInformationControl;
import org.eclipse.jface.text.IAutoEditStrategy;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IInformationControlCreator;
import org.eclipse.jface.text.ITextDoubleClickStrategy;
import org.eclipse.jface.text.TextAttribute;
import org.eclipse.jface.text.contentassist.ContentAssistant;
import org.eclipse.jface.text.contentassist.IContentAssistant;
import org.eclipse.jface.text.presentation.IPresentationReconciler;
import org.eclipse.jface.text.presentation.PresentationReconciler;
import org.eclipse.jface.text.rules.DefaultDamagerRepairer;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.swt.widgets.Shell;
import org.eclipse.ui.editors.text.TextSourceViewerConfiguration;

import com.google.common.base.Preconditions;

/**
 * Configures the features of the editor. This is the entry point for features like intelligent
 * double click, auto completion, and syntax highlighting.
 *
 * @author tyleradams
 */
public final class TypeScriptSourceViewerConfiguration extends TextSourceViewerConfiguration {

    private final TypeScriptDoubleClickStrategy doubleClickStrategy;
    private final TypeScriptServerScanner typeScriptScanner;
    private final ColorManager colorManager;
    private final JSDocScanner jsDocScanner;

    public TypeScriptSourceViewerConfiguration(ColorManager colorManager) {
        Preconditions.checkNotNull(colorManager);

        this.colorManager = colorManager;
        this.typeScriptScanner = new TypeScriptServerScanner(colorManager);
        this.jsDocScanner = new JSDocScanner(colorManager);
        this.doubleClickStrategy = new TypeScriptDoubleClickStrategy();
    }

    @Override
    public IAutoEditStrategy[] getAutoEditStrategies(ISourceViewer sourceViewer, String contentType) {
        return new IAutoEditStrategy[] { new DefaultIndentLineAutoEditStrategy() };
    }

    @Override
    public String[] getConfiguredContentTypes(ISourceViewer sourceViewer) {
        return new String[] {
                IDocument.DEFAULT_CONTENT_TYPE,
                TypeScriptPartitionScanner.JSDOC,
                TypeScriptPartitionScanner.MULTILINE_COMMENT
        };
    }

    @Override
    public ITextDoubleClickStrategy getDoubleClickStrategy(ISourceViewer sourceViewer, String contentType) {
        return this.doubleClickStrategy;
    }

    private TypeScriptServerScanner getTypeScriptScanner() {
        return this.typeScriptScanner;
    }

    private JSDocScanner getJSDocScanner() {
        return this.jsDocScanner;
    }

    @Override
    public IPresentationReconciler getPresentationReconciler(ISourceViewer sourceViewer) {
        Preconditions.checkNotNull(sourceViewer);

        PresentationReconciler reconciler = new PresentationReconciler();

        DefaultDamagerRepairer damagerRepairer = new DefaultDamagerRepairer(getTypeScriptScanner());
        reconciler.setDamager(damagerRepairer, IDocument.DEFAULT_CONTENT_TYPE);
        reconciler.setRepairer(damagerRepairer, IDocument.DEFAULT_CONTENT_TYPE);

        damagerRepairer = new DefaultDamagerRepairer(getJSDocScanner());
        reconciler.setDamager(damagerRepairer, TypeScriptPartitionScanner.JSDOC);
        reconciler.setRepairer(damagerRepairer, TypeScriptPartitionScanner.JSDOC);

        TextAttribute multiLine = new TextAttribute(this.colorManager.getColor(TypeScriptColorConstants.COMMENT));
        NonRuleBasedDamagerRepairer newDamagerRepairer = new NonRuleBasedDamagerRepairer(multiLine);

        reconciler.setDamager(newDamagerRepairer, TypeScriptPartitionScanner.MULTILINE_COMMENT);
        reconciler.setRepairer(newDamagerRepairer, TypeScriptPartitionScanner.MULTILINE_COMMENT);

        return reconciler;
    }

    @Override
    public IContentAssistant getContentAssistant(ISourceViewer sourceViewer) {
        Preconditions.checkNotNull(sourceViewer);

        ContentAssistant assistant = new ContentAssistant();

        assistant.setDocumentPartitioning(getConfiguredDocumentPartitioning(sourceViewer));
        assistant.setContentAssistProcessor(new TypeScriptCompletionProcessor(), IDocument.DEFAULT_CONTENT_TYPE);

        assistant.enableAutoActivation(true);
        assistant.setAutoActivationDelay(100);
        assistant.setProposalPopupOrientation(IContentAssistant.PROPOSAL_OVERLAY);
        assistant.setProposalSelectorBackground(this.colorManager.getColor(TypeScriptColorConstants.AUTO_COMPLETE_BACKGROUND));
        Shell parent = null;
        IInformationControlCreator creator = new DefaultInformationControl(parent).getInformationPresenterControlCreator();
        assistant.setInformationControlCreator(creator); //TODO: Why does this work?
        return assistant;
    }

}
