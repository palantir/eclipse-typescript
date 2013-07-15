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

import org.eclipse.jface.text.ITextListener;
import org.eclipse.jface.text.TextEvent;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.jface.text.source.IVerticalRuler;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.ui.IEditorInput;
import org.eclipse.ui.IPathEditorInput;
import org.eclipse.ui.editors.text.TextEditor;

import com.google.common.base.Preconditions;
import com.palantir.typescript.Activator;

/**
 * The entry point of this eclipse plugin.
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
    protected ISourceViewer createSourceViewer(Composite parent, IVerticalRuler ruler, int styles) { // cannot be private because it extends a protected method.  No need to make public
        ISourceViewer sourceViewer = super.createSourceViewer(parent, ruler, styles);

        String file;
        IEditorInput input = this.getEditorInput();
        if (input instanceof IPathEditorInput) {
            file = ((IPathEditorInput) input).getPath().toOSString();
        } else {
            throw new RuntimeException("The file for this TypeScriptEditor could not be found.");
        }

        sourceViewer.addTextListener(new TypeScriptTextListener(file));
        return sourceViewer;
    }

    private final class TypeScriptTextListener implements ITextListener {
        private final String file;

        public TypeScriptTextListener(String file) {
            Preconditions.checkNotNull(file);

            this.file = file;
        }

        @Override
        public void textChanged(TextEvent event) {
            Preconditions.checkNotNull(event);

            Activator.getBridge().getLanguageService().editFile(this.file, event.getOffset(), event.getLength(), event.getText());
        }
    }

}
