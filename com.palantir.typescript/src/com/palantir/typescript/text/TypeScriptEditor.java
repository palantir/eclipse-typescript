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

import org.eclipse.core.runtime.CoreException;
import org.eclipse.jface.action.Action;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.ITextListener;
import org.eclipse.jface.text.TextEvent;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.jface.text.source.IVerticalRuler;
import org.eclipse.jface.text.source.SourceViewer;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.ui.IEditorInput;
import org.eclipse.ui.IPathEditorInput;
import org.eclipse.ui.editors.text.TextEditor;
import org.eclipse.ui.texteditor.IUpdate;
import org.eclipse.ui.views.contentoutline.IContentOutlinePage;

import com.palantir.typescript.bridge.Bridge;
import com.palantir.typescript.bridge.classifier.Classifier;
import com.palantir.typescript.bridge.language.LanguageService;

/**
 * The editor for TypeScript files.
 *
 * @author tyleradams
 */
public final class TypeScriptEditor extends TextEditor {

    private final ColorManager colorManager;

    private final Bridge bridge;
    private final Classifier classifier;
    private final LanguageService languageService;

    private OutlinePage contentOutlinePage;

    public TypeScriptEditor() {
        this.colorManager = new ColorManager();

        this.bridge = new Bridge();
        this.classifier = new Classifier(this.bridge);
        this.languageService = new LanguageService(this.bridge);

        this.setSourceViewerConfiguration(new SourceViewerConfiguration(this));
    }

    @Override
    public Object getAdapter(Class adapter) {
        if (IContentOutlinePage.class.equals(adapter)) {
            if (this.contentOutlinePage == null) {
                this.contentOutlinePage = new OutlinePage(this);
            }

            return this.contentOutlinePage;
        }

        return super.getAdapter(adapter);
    }

    public Classifier getClassifier() {
        return this.classifier;
    }

    public ColorManager getColorManager() {
        return this.colorManager;
    }

    public LanguageService getLanguageService() {
        return this.languageService;
    }

    @Override
    public void dispose() {
        this.bridge.dispose();
        this.colorManager.dispose();

        super.dispose();
    }

    @Override
    protected void createActions() {
        super.createActions();

        // format
        FormatAction formatAction = new FormatAction();
        formatAction.setActionDefinitionId(ITypeScriptActionDefinitionIds.FORMAT);
        this.setAction("format", formatAction);
    }

    @Override
    protected ISourceViewer createSourceViewer(Composite parent, IVerticalRuler ruler, int styles) {
        ISourceViewer sourceViewer = super.createSourceViewer(parent, ruler, styles);

        sourceViewer.addTextListener(new MyTextListener());

        return sourceViewer;
    }

    @Override
    protected void doSetInput(IEditorInput input) throws CoreException {
        super.doSetInput(input);

        IPathEditorInput editorInput = (IPathEditorInput) input;
        String fileName = editorInput.getPath().toOSString();

        this.getLanguageService().addFile(fileName);
    }

    @Override
    protected void initializeKeyBindingScopes() {
        this.setKeyBindingScopes(new String[] { "com.palantir.typescript.text.typeScriptEditorScope" });
    }

    private final class FormatAction extends Action implements IUpdate {

        public FormatAction() {
            this.update();
        }

        @Override
        public void run() {
            SourceViewer sourceViewer = (SourceViewer) getSourceViewer();

            sourceViewer.doOperation(ISourceViewer.FORMAT);
        }

        @Override
        public void update() {
            this.setEnabled(isEditorInputModifiable());
        }
    }

    private final class MyTextListener implements ITextListener {
        @Override
        public void textChanged(TextEvent event) {
            checkNotNull(event);

            int offset = event.getOffset();
            int length = event.getLength();
            String text = event.getText();
            IPathEditorInput editorInput = (IPathEditorInput) getEditorInput();
            String fileName = editorInput.getPath().toOSString();

            // redraw state change - update the entire document
            if (event.getDocumentEvent() == null && offset == 0 && length == 0 && text == null) {
                IDocument document = getSourceViewer().getDocument();
                int editLength = document.getLength();

                String replacementText;
                try {
                    replacementText = document.get(0, editLength);
                } catch (BadLocationException e) {
                    throw new RuntimeException(e);
                }

                TypeScriptEditor.this.languageService.editFile(fileName, 0, editLength, replacementText);
            } else if (text != null) { // normal edit
                TypeScriptEditor.this.languageService.editFile(fileName, offset, length, text);
            }
        }
    }
}
