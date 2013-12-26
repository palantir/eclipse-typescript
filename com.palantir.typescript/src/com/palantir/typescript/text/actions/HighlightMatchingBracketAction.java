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

package com.palantir.typescript.text.actions;

import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.source.DefaultCharacterPairMatcher;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.swt.graphics.Point;

import com.palantir.typescript.text.TypeScriptEditor;

/**
 * Highlights the range of matching brackets.
 *
 * @author yupengf
 */
public final class HighlightMatchingBracketAction extends TypeScriptEditorAction {
    public HighlightMatchingBracketAction(TypeScriptEditor editor) {
        super(editor);
    }

    @Override
    public void run() {
        TypeScriptEditor editor = this.getTextEditor();
        ISourceViewer sourceViewer = editor.getEditorSourceViewer();
        IDocument document = sourceViewer.getDocument();
        if (document == null)
            return;

        Point viewerSelection = sourceViewer.getSelectedRange();
        int offset = viewerSelection.x;
        int length = viewerSelection.y;

        DefaultCharacterPairMatcher pairMatcher = editor.getPairMatcher();
        IRegion region = pairMatcher.match(document, offset, length);
        if (region == null) {
            region = pairMatcher.findEnclosingPeerCharacters(document, offset, length);
        }

        if (region == null) {
            editor.setStatusErrorAndBeep("No matching bracket found");
            return;
        }

        editor.selectAndReveal(region.getOffset(), region.getLength());
    }
}
