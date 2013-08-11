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
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.ITextSelection;
import org.eclipse.jface.text.Position;
import org.eclipse.jface.text.reconciler.DirtyRegion;
import org.eclipse.jface.text.reconciler.IReconcilingStrategy;
import org.eclipse.jface.text.source.Annotation;
import org.eclipse.jface.text.source.IAnnotationModelExtension;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.jface.viewers.ISelectionProvider;
import org.eclipse.swt.widgets.Display;

import com.google.common.collect.Maps;
import com.palantir.typescript.services.language.Diagnostic;
import com.palantir.typescript.services.language.LanguageService;
import com.palantir.typescript.services.language.ReferenceEntry;

/**
 * The reconciling strategy for showing occurrences and diagnostics annotations.
 *
 * @author dcicerone
 */
public final class AnnotationReconcilingStrategy implements IReconcilingStrategy {

    private static final String DIAGNOSTIC_TYPE = "com.palantir.typescript.diagnostic";
    private static final String OCCURRENCES_TYPE = "com.palantir.typescript.occurrences";

    private final TypeScriptEditor editor;
    private final ISourceViewer sourceViewer;

    private Annotation[] lastAnnotations;

    public AnnotationReconcilingStrategy(TypeScriptEditor editor, ISourceViewer sourceViewer) {
        checkNotNull(editor);
        checkNotNull(sourceViewer);

        this.editor = editor;
        this.sourceViewer = sourceViewer;
    }

    @Override
    public void setDocument(IDocument document) {
    }

    @Override
    public void reconcile(DirtyRegion dirtyRegion, IRegion subRegion) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void reconcile(IRegion partition) {
        throw new UnsupportedOperationException();
    }

    public void reconcile(LanguageService languageService) {
        checkNotNull(languageService);

        String fileName = this.editor.getFileName();
        int offset = this.getOffset();

        // update the annotations
        final List<Diagnostic> diagnostics = languageService.getDiagnostics(fileName);
        final List<ReferenceEntry> occurrences = languageService.getOccurrencesAtPosition(fileName, offset);
        Display.getDefault().asyncExec(new Runnable() {
            @Override
            public void run() {
                updateAnnotations(diagnostics, occurrences);
            }
        });
    }

    private int getOffset() {
        final AtomicInteger offset = new AtomicInteger();

        Display.getDefault().syncExec(new Runnable() {
            @Override
            public void run() {
                ISelectionProvider selectionProvider = AnnotationReconcilingStrategy.this.sourceViewer.getSelectionProvider();
                ITextSelection selection = (ITextSelection) selectionProvider.getSelection();

                offset.set(selection.getOffset());
            }
        });

        return offset.get();
    }

    private void updateAnnotations(List<Diagnostic> diagnostics, List<ReferenceEntry> occurrences) {
        IAnnotationModelExtension annotationModel = (IAnnotationModelExtension) this.sourceViewer.getAnnotationModel();

        if (annotationModel != null) {
            Map<Annotation, Position> annotationsToAdd = Maps.newHashMap();

            // add the diagnostics
            for (Diagnostic diagnostic : diagnostics) {
                Annotation annotation = new Annotation(DIAGNOSTIC_TYPE, false, diagnostic.getText());
                Position position = new Position(diagnostic.getStart(), diagnostic.getLength());

                annotationsToAdd.put(annotation, position);
            }

            // add the occurrences
            for (ReferenceEntry occurrence : occurrences) {
                Annotation annotation = new Annotation(OCCURRENCES_TYPE, false, null);
                int minChar = occurrence.getMinChar();
                int limChar = occurrence.getLimChar();
                Position position = new Position(minChar, limChar - minChar);

                annotationsToAdd.put(annotation, position);
            }

            annotationModel.replaceAnnotations(this.lastAnnotations, annotationsToAdd);

            // keep the annotations around in case they will be replaced later
            this.lastAnnotations = annotationsToAdd.keySet().toArray(new Annotation[diagnostics.size()]);
        }
    }
}
