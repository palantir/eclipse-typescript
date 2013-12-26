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
import org.eclipse.jface.text.ITextSelection;
import org.eclipse.jface.text.source.DefaultCharacterPairMatcher;
import org.eclipse.jface.text.source.ICharacterPairMatcher;

import com.palantir.typescript.text.TypeScriptEditor;

/**
 * Goes to the matching bracket.
 *
 * @author yupengf
 */
public final class GoToMatchingBracketAction extends TypeScriptEditorAction {
    public GoToMatchingBracketAction(TypeScriptEditor editor) {
        super(editor);
    }

    @Override
    public void run() {
        TypeScriptEditor editor = this.getTextEditor();
        IDocument document = editor.getDocument();
        if (document == null) {
            return;
        }

        ITextSelection selection = (ITextSelection) editor.getSelectionProvider().getSelection();

        DefaultCharacterPairMatcher pairMatcher = editor.characterPairMatcher();
        IRegion region = pairMatcher.match(document, selection.getOffset(), selection.getLength());
        if (region == null) {
            return;
        }

        int offset = region.getOffset();
        int length = region.getLength();
        int anchor = pairMatcher.getAnchor();
        int targetOffset = (ICharacterPairMatcher.RIGHT == anchor) ? offset + 1 : offset + length - 1;
        editor.selectAndReveal(targetOffset, 0);
    }
}
