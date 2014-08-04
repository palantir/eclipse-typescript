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

package com.palantir.typescript.text.reconciler;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

import org.eclipse.swt.widgets.Display;
import org.eclipse.ui.views.contentoutline.IContentOutlinePage;

import com.palantir.typescript.services.language.NavigateToItem;
import com.palantir.typescript.text.FileLanguageService;
import com.palantir.typescript.text.OutlinePage;
import com.palantir.typescript.text.TypeScriptEditor;

/**
 * Reconciles the outline view.
 *
 * @author tyleradams
 */
public final class OutlineViewReconcilingStrategy {

    private final OutlinePage outlinePage;

    public OutlineViewReconcilingStrategy(TypeScriptEditor editor) {
        checkNotNull(editor);

        this.outlinePage = (OutlinePage) editor.getAdapter(IContentOutlinePage.class);
    }

    public void reconcile(FileLanguageService languageService) {
        checkNotNull(languageService);

        if (this.isVisible()) {
            final List<NavigateToItem> lexicalStructure = languageService.getScriptLexicalStructure();
            Display.getDefault().asyncExec(new Runnable() {

                @Override
                public void run() {
                    OutlineViewReconcilingStrategy.this.outlinePage.setInput(lexicalStructure);
                }
            });
        }
    }

    private boolean isVisible() {
        final AtomicBoolean outlinePageVisible = new AtomicBoolean();

        Display.getDefault().syncExec(new Runnable() {

            @Override
            public void run() {
                outlinePageVisible.set(OutlineViewReconcilingStrategy.this.outlinePage.isVisible());
            }
        });

        return outlinePageVisible.get();
    }
}
