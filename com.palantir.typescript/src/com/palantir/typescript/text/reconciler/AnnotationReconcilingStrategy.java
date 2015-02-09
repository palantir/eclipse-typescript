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
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import org.eclipse.jface.text.ITextSelection;
import org.eclipse.jface.text.Position;
import org.eclipse.jface.text.source.Annotation;
import org.eclipse.jface.text.source.IAnnotationModelExtension;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.jface.viewers.ISelectionProvider;
import org.eclipse.swt.widgets.Display;

import com.google.common.collect.Maps;
import com.palantir.typescript.services.language.DiagnosticEx;
import com.palantir.typescript.services.language.ReferenceEntry;
import com.palantir.typescript.services.language.TextSpan;
import com.palantir.typescript.services.language.TodoCommentEx;
import com.palantir.typescript.text.FileLanguageService;
import com.palantir.typescript.text.TypeScriptEditor;

/**
 * The reconciling strategy for showing occurrences and diagnostics annotations.
 *
 * @author dcicerone
 */
public final class AnnotationReconcilingStrategy {

    private static final String DIAGNOSTIC_TYPE = "com.palantir.typescript.diagnostic";
    private static final String OCCURRENCES_TYPE = "com.palantir.typescript.occurrences";
    private static final String TASK_TYPE = "com.palantir.typescript.task";

    private final TypeScriptEditor editor;
    private final ISourceViewer sourceViewer;

    private Annotation[] lastAnnotations;

    public AnnotationReconcilingStrategy(TypeScriptEditor editor, ISourceViewer sourceViewer) {
        checkNotNull(editor);
        checkNotNull(sourceViewer);

        this.editor = editor;
        this.sourceViewer = sourceViewer;
    }

    public void reconcile(FileLanguageService languageService) {
        checkNotNull(languageService);

        // update the annotations
        int offset = this.getOffset();
        if (offset >= 0) {
            final List<DiagnosticEx> diagnostics = languageService.getDiagnostics();
            final List<ReferenceEntry> occurrences = languageService.getOccurrencesAtPosition(offset);
            final List<TodoCommentEx> todoComments = languageService.getTodoComments();

            Display.getDefault().asyncExec(new Runnable() {
                @Override
                public void run() {
                    updateAnnotations(diagnostics, occurrences, todoComments);
                }
            });
        }
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

    private boolean isDirty() {
        final AtomicBoolean dirty = new AtomicBoolean();

        Display.getDefault().syncExec(new Runnable() {
            @Override
            public void run() {
                dirty.set(AnnotationReconcilingStrategy.this.editor.isDirty());
            }
        });

        return dirty.get();
    }

    private void updateAnnotations(List<DiagnosticEx> diagnostics, List<ReferenceEntry> occurrences, List<TodoCommentEx> todoComments) {
        IAnnotationModelExtension annotationModel = (IAnnotationModelExtension) this.sourceViewer.getAnnotationModel();

        if (annotationModel != null) {
            Map<Annotation, Position> annotationsToAdd = Maps.newHashMap();

            // add the diagnostics if the editor is dirty
            if (this.isDirty()) {
                for (DiagnosticEx diagnostic : diagnostics) {
                    Annotation annotation = new Annotation(DIAGNOSTIC_TYPE, false, diagnostic.getText());
                    Position position = new Position(diagnostic.getStart(), diagnostic.getLength());

                    annotationsToAdd.put(annotation, position);
                }
            }

            // add the occurrences
            if (occurrences != null) {
                for (ReferenceEntry occurrence : occurrences) {
                    Annotation annotation = new Annotation(OCCURRENCES_TYPE, false, null);
                    TextSpan textSpan = occurrence.getTextSpan();
                    Position position = new Position(textSpan.getStart(), textSpan.getLength());

                    annotationsToAdd.put(annotation, position);
                }
            }

            // add the todo comments
            if (todoComments != null) {
                for (TodoCommentEx todoComment : todoComments) {
                    Annotation annotation = new Annotation(TASK_TYPE, false, todoComment.getText());
                    Position position = new Position(todoComment.getStart(), todoComment.getText().length());

                    annotationsToAdd.put(annotation, position);
                }
            }

            annotationModel.replaceAnnotations(this.lastAnnotations, annotationsToAdd);

            // keep the annotations around in case they will be replaced later
            this.lastAnnotations = annotationsToAdd.keySet().toArray(new Annotation[diagnostics.size()]);
        }
    }
}
