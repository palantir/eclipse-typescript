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

import org.eclipse.jface.action.Action;
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

import com.palantir.typescript.Activator;

/**
 * The editor for TypeScript files.
 *
 * @author tyleradams
 */
public final class TypeScriptEditor extends TextEditor {

    private final ColorManager colorManager;

    public TypeScriptEditor() {
        this.colorManager = new ColorManager();

        this.setSourceViewerConfiguration(new SourceViewerConfiguration(this.colorManager));
    }

    @Override
    public void dispose() {
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

            String text = event.getText();
            if (text != null) {
                IEditorInput input = getEditorInput();
                String file = ((IPathEditorInput) input).getPath().toOSString();

                Activator.getBridge().getLanguageService().editFile(file, event.getOffset(), event.getLength(), text);
            }
        }
    }
}
