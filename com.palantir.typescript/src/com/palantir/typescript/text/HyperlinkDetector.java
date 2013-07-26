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

import java.util.List;

import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.ITextViewer;
import org.eclipse.jface.text.Region;
import org.eclipse.jface.text.hyperlink.IHyperlink;
import org.eclipse.jface.text.hyperlink.IHyperlinkDetector;
import org.eclipse.ui.IPathEditorInput;

import com.palantir.typescript.bridge.language.DefinitionInfo;
import com.palantir.typescript.bridge.language.SpanInfo;

/**
 * The hyperlink detector adds links when the user holds down ctrl.
 *
 * @author dcicerone
 */
public final class HyperlinkDetector implements IHyperlinkDetector {

    private final TypeScriptEditor editor;

    public HyperlinkDetector(TypeScriptEditor editor) {
        checkNotNull(editor);

        this.editor = editor;
    }

    @Override
    public IHyperlink[] detectHyperlinks(ITextViewer textViewer, IRegion region, boolean canShowMultipleHyperlinks) {
        IPathEditorInput editorInput = (IPathEditorInput) this.editor.getEditorInput();
        String fileName = editorInput.getPath().toOSString();
        int offset = region.getOffset();
        SpanInfo span = this.editor.getLanguageService().getNameOrDottedNameSpan(fileName, offset, offset);

        if (span != null) {
            List<DefinitionInfo> definitions = this.editor.getLanguageService().getDefinitionAtPosition(fileName, offset);

            if (definitions != null && !definitions.isEmpty()) {
                DefinitionInfo definition = definitions.get(0);
                int minChar = span.getMinChar();
                IRegion hyperlinkRegion = new Region(minChar, span.getLimChar() - minChar);

                return new IHyperlink[] { new MyHyperlink(definition, hyperlinkRegion) };
            }
        }

        return null;
    }

    private static final class MyHyperlink implements IHyperlink {

        private final DefinitionInfo definition;
        private final IRegion region;

        public MyHyperlink(DefinitionInfo definition, IRegion region) {
            this.definition = definition;
            this.region = region;
        }

        @Override
        public IRegion getHyperlinkRegion() {
            return this.region;
        }

        @Override
        public String getTypeLabel() {
            return null;
        }

        @Override
        public String getHyperlinkText() {
            return null;
        }

        @Override
        public void open() {
            TypeScriptEditor.openDefinition(this.definition);
        }
    }
}
