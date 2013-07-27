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
import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.ITextHoverExtension2;
import org.eclipse.jface.text.ITextViewer;
import org.eclipse.jface.text.source.Annotation;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.ui.texteditor.MarkerAnnotation;

import com.palantir.typescript.bridge.language.TypeInfo;

/**
 * Determines what to display when hovering over the text.
 *
 * @author dcicerone
 */
public final class TextHover extends DefaultTextHover implements ITextHoverExtension2 {

    private final TypeScriptEditor editor;

    public TextHover(ISourceViewer sourceViewer, TypeScriptEditor editor) {
        super(sourceViewer);

        checkNotNull(editor);

        this.editor = editor;
    }

    @Override
    protected boolean isIncluded(Annotation annotation) {
        // only display marker annotations
        return annotation instanceof MarkerAnnotation;
    }

    @Override
    @SuppressWarnings("deprecation")
    public Object getHoverInfo2(ITextViewer textViewer, IRegion hoverRegion) {
        String hoverInfo = super.getHoverInfo(textViewer, hoverRegion);

        // get the type information
        if (hoverInfo == null) {
            String fileName = this.editor.getFileName();
            int offset = hoverRegion.getOffset();
            TypeInfo type = this.editor.getLanguageService().getTypeAtPosition(fileName, offset);

            if (type != null) {
                switch (type.getKind()) {
                    case LOCAL_FUNCTION_ELEMENT:
                    case FUNCTION_ELEMENT:
                    case MEMBER_FUNCTION_ELEMENT:
                        hoverInfo = type.getFullSymbolName() + type.getMemberName();
                        break;
                    default:
                        hoverInfo = type.getMemberName();
                        break;
                }
            }
        }

        return hoverInfo;
    }
}
