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

import java.util.List;

import org.eclipse.core.runtime.IPath;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.formatter.IContentFormatter;
import org.eclipse.jface.text.formatter.IFormattingStrategy;
import org.eclipse.ui.IEditorInput;
import org.eclipse.ui.IEditorPart;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.IWorkbenchWindow;
import org.eclipse.ui.PlatformUI;
import org.eclipse.ui.part.FileEditorInput;

import com.google.common.collect.Lists;
import com.palantir.typescript.Activator;
import com.palantir.typescript.bridge.language.FormatCodeOptions;
import com.palantir.typescript.bridge.language.TextEdit;

/**
 * The TypeScript formatter.
 *
 * @author dcicerone
 */
public final class ContentFormatter implements IContentFormatter {

    @Override
    public void format(IDocument document, IRegion region) {
        String file = this.getFilePath().toOSString();
        int minChar = region.getOffset();
        int limChar = minChar + region.getLength();
        FormatCodeOptions options = new FormatCodeOptions();
        List<TextEdit> edits = Activator.getBridge().getLanguageService().getFormattingEditsForRange(file, minChar, limChar, options);

        // apply the edits
        try {
            for (TextEdit edit : Lists.reverse(edits)) {
                int offset = edit.getMinChar();
                int length = edit.getLimChar() - offset;
                String text = edit.getText();

                document.replace(offset, length, text);
            }
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public IFormattingStrategy getFormattingStrategy(String contentType) {
        throw new UnsupportedOperationException();
    }

    private IPath getFilePath() {
        IWorkbench workbench = PlatformUI.getWorkbench();
        if (workbench == null) {
            return null;
        }

        IWorkbenchWindow window = workbench.getActiveWorkbenchWindow();
        if (window == null) {
            return null;
        }

        IWorkbenchPage activePage = window.getActivePage();
        if (activePage == null) {
            return null;
        }

        IEditorPart editor = activePage.getActiveEditor();
        if (editor == null) {
            return null;
        }

        IEditorInput input = editor.getEditorInput();
        if (input instanceof FileEditorInput) {
            IPath path = ((FileEditorInput) input).getPath();
            return path;
        }
        return null;
    }
}
