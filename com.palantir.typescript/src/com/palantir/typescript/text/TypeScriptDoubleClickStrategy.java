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

import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.ITextDoubleClickStrategy;
import org.eclipse.jface.text.ITextViewer;

/**
 * This determines how to act during a double click.
 *
 * @author tyleradams
 */
public final class TypeScriptDoubleClickStrategy implements ITextDoubleClickStrategy {

    private ITextViewer textViewer;

    @Override
    public void doubleClicked(ITextViewer part) {
        int position = part.getSelectedRange().x;

        if (position < 0) {
            return;
        }

        this.textViewer = part;

        if (!selectComment(position)) {
            selectWord(position);
        }
    }

    /**
     * Sets the selectedRange to be the region of a comment. Returns whether the cursor was in a
     * comment or not.
     *
     * @return whether the act was successful or not
     */
    protected boolean selectComment(int caretPosition) {
        IDocument document = this.textViewer.getDocument();
        int startPosition;
        int endPosition;

        try {
            int position = caretPosition;
            char currentCharacter = ' ';

            while (position >= 0) {
                currentCharacter = document.getChar(position);
                if (currentCharacter == '\\') {
                    position -= 2;
                    continue;
                }
                if (currentCharacter == Character.LINE_SEPARATOR || currentCharacter == '\"') {
                    break;
                }
                --position;
            }

            if (currentCharacter != '\"') {
                return false;
            }

            startPosition = position;

            position = caretPosition;
            int length = document.getLength();
            currentCharacter = ' ';

            while (position < length) {
                currentCharacter = document.getChar(position);
                if (currentCharacter == Character.LINE_SEPARATOR || currentCharacter == '\"') {
                    break;
                }
                ++position;
            }
            if (currentCharacter != '\"') {
                return false;
            }

            endPosition = position;
            selectRange(startPosition, endPosition);
            return true;
        } catch (BadLocationException x) {
        }

        return false;
    }

    /**
     * Sets a selected range in the textviewer.
     *
     * @return whether a word was selected
     */
    protected boolean selectWord(int caretPosition) {

        IDocument document = this.textViewer.getDocument();
        int startPosition;
        int endPosition;

        try {

            int position = caretPosition;
            char currentCharacter;

            while (position >= 0) {
                currentCharacter = document.getChar(position);
                if (!Character.isJavaIdentifierPart(currentCharacter)) {
                    break;
                }
                --position;
            }

            startPosition = position;

            position = caretPosition;
            int length = document.getLength();

            while (position < length) {
                currentCharacter = document.getChar(position);
                if (!Character.isJavaIdentifierPart(currentCharacter)) {
                    break;
                }
                ++position;
            }

            endPosition = position;
            selectRange(startPosition, endPosition);
            return true;

        } catch (BadLocationException x) {
        }

        return false;
    }

    private void selectRange(int startPos, int stopPos) {
        int offset = startPos + 1;
        int length = stopPos - offset;
        this.textViewer.setSelectedRange(offset, length);
    }
}
