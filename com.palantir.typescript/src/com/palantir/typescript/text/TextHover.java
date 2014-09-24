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

import org.eclipse.jface.text.DefaultTextHover;
import org.eclipse.jface.text.IInformationControl;
import org.eclipse.jface.text.IInformationControlCreator;
import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.ITextHoverExtension;
import org.eclipse.jface.text.ITextHoverExtension2;
import org.eclipse.jface.text.ITextViewer;
import org.eclipse.jface.text.source.Annotation;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.swt.widgets.Shell;

/**
 * Determines what to display when hovering over the text.
 *
 * @author dcicerone
 */
public final class TextHover extends DefaultTextHover implements ITextHoverExtension, ITextHoverExtension2 {

    private final TypeScriptEditor editor;

    public TextHover(ISourceViewer sourceViewer, TypeScriptEditor editor) {
        super(sourceViewer);

        checkNotNull(editor);

        this.editor = editor;
    }

    @Override
    protected boolean isIncluded(Annotation annotation) {
        // suppress quick diff annotations since they are noisy and mostly useless
        if (annotation.getType().startsWith("org.eclipse.ui.workbench.texteditor.quickdiff")) {
            return false;
        }

        return true;
    }

    @Override
    @SuppressWarnings("deprecation")
    public Object getHoverInfo2(ITextViewer textViewer, IRegion hoverRegion) {
        String hoverInfo = super.getHoverInfo(textViewer, hoverRegion);

        // get the quick info
        if (hoverInfo == null) {
            int offset = hoverRegion.getOffset();

            return this.editor.getLanguageService().getQuickInfoAtPosition(offset);
        }

        return hoverInfo;
    }

    @Override
    public IInformationControlCreator getHoverControlCreator() {
        return new IInformationControlCreator() {
            @Override
            public IInformationControl createInformationControl(Shell parent) {
                return new QuickInfoInformationControl(parent, true, false);
            }
        };
    }
}
