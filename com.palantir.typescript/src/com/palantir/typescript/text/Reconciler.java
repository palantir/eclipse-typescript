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
import java.util.Queue;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.jface.text.DocumentEvent;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IDocumentListener;
import org.eclipse.jface.text.ITextInputListener;
import org.eclipse.jface.text.ITextSelection;
import org.eclipse.jface.text.ITextViewer;
import org.eclipse.jface.text.Position;
import org.eclipse.jface.text.reconciler.IReconciler;
import org.eclipse.jface.text.reconciler.IReconcilingStrategy;
import org.eclipse.jface.text.source.Annotation;
import org.eclipse.jface.text.source.IAnnotationModelExtension;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.swt.custom.CaretEvent;
import org.eclipse.swt.custom.CaretListener;
import org.eclipse.swt.custom.StyledText;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Display;
import org.eclipse.ui.IPathEditorInput;
import org.eclipse.ui.ide.ResourceUtil;

import com.google.common.collect.Maps;
import com.google.common.collect.Queues;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import com.palantir.typescript.services.language.Diagnostic;
import com.palantir.typescript.services.language.LanguageService;
import com.palantir.typescript.services.language.ReferenceEntry;

/**
 * A reconciler which also reconciles for selection changes.
 *
 * @author dcicerone
 */
public final class Reconciler implements IReconciler {

    private static final String DIAGNOSTIC_TYPE = "com.palantir.typescript.diagnostic";
    private static final String OCCURRENCES_TYPE = "com.palantir.typescript.occurrences";

    private final TypeScriptEditor editor;
    private final ISourceViewer sourceViewer;

    private final CaretListener caretListener;
    private final IDocumentListener documentListener;
    private final Queue<DocumentEvent> eventQueue;
    private final ScheduledExecutorService executor;
    private final AtomicBoolean reconcileRequired;
    private final ITextInputListener textInputListener;

    private LanguageService cachedLanguageService;
    private ITextViewer cachedTextViewer;
    private Annotation[] lastAnnotations;

    public Reconciler(TypeScriptEditor editor, ISourceViewer sourceViewer) {
        checkNotNull(editor);
        checkNotNull(sourceViewer);

        this.editor = editor;
        this.sourceViewer = sourceViewer;

        this.caretListener = new MyCaretListener();
        this.documentListener = new MyDocumentListener();
        this.eventQueue = Queues.newConcurrentLinkedQueue();
        this.executor = createExecutor();
        this.reconcileRequired = new AtomicBoolean();
        this.textInputListener = new MyTextInputListener();
    }

    @Override
    public void install(ITextViewer textViewer) {
        StyledText control = (StyledText) this.editor.getAdapter(Control.class);
        control.addCaretListener(this.caretListener);

        this.cachedTextViewer = textViewer;
        this.cachedTextViewer.addTextInputListener(this.textInputListener);
    }

    @Override
    public void uninstall() {
        StyledText control = (StyledText) this.editor.getAdapter(Control.class);
        control.removeCaretListener(this.caretListener);

        this.cachedTextViewer.removeTextInputListener(this.textInputListener);

        this.executor.shutdown();
    }

    @Override
    public IReconcilingStrategy getReconcilingStrategy(String contentType) {
        throw new UnsupportedOperationException();
    }

    private LanguageService getLanguageService() {
        if (this.cachedLanguageService == null) {
            IPathEditorInput editorInput = (IPathEditorInput) Reconciler.this.editor.getEditorInput();
            IResource resource = ResourceUtil.getResource(editorInput);
            IProject project = resource.getProject();

            this.cachedLanguageService = new LanguageService(project);
        }

        return this.cachedLanguageService;
    }

    private void reconcile() {
        this.reconcileRequired.set(true);
        this.executor.schedule(new Runnable() {
            @Override
            public void run() {
                // check that a reconcile is still required (many tasks may be queued but only one should run at any given time)
                if (Reconciler.this.reconcileRequired.compareAndSet(true, false)) {
                    processEvents();
                    reconcileAnnotations();
                }
            }
        }, 500, TimeUnit.MILLISECONDS);
    }

    private int getOffset() {
        final AtomicInteger offset = new AtomicInteger();

        Display.getDefault().syncExec(new Runnable() {
            @Override
            public void run() {
                ITextSelection selection = (ITextSelection) Reconciler.this.editor.getSelectionProvider().getSelection();

                offset.set(selection.getOffset());
            }
        });

        return offset.get();
    }

    private void processEvents() {
        DocumentEvent event;

        while ((event = Reconciler.this.eventQueue.poll()) != null) {
            LanguageService languageService = getLanguageService();
            String fileName = Reconciler.this.editor.getFileName();
            int offset = event.getOffset();
            int length = event.getLength();
            String text = event.getText();

            languageService.editFile(fileName, offset, length, text);
        }
    }

    private void reconcileAnnotations() {
        LanguageService languageService = getLanguageService();
        String fileName = Reconciler.this.editor.getFileName();
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

    private static ScheduledExecutorService createExecutor() {
        ThreadFactory threadFactory = new ThreadFactoryBuilder().setDaemon(true).setPriority(Thread.MIN_PRIORITY).build();

        return Executors.newSingleThreadScheduledExecutor(threadFactory);
    }

    private final class MyCaretListener implements CaretListener {
        @Override
        public void caretMoved(CaretEvent event) {
            reconcile();
        }
    }

    private final class MyDocumentListener implements IDocumentListener {
        @Override
        public void documentAboutToBeChanged(DocumentEvent event) {
        }

        @Override
        public void documentChanged(DocumentEvent event) {
            Reconciler.this.eventQueue.add(event);

            reconcile();
        }
    }

    private final class MyTextInputListener implements ITextInputListener {
        @Override
        public void inputDocumentAboutToBeChanged(IDocument oldInput, IDocument newInput) {
        }

        @Override
        public void inputDocumentChanged(IDocument oldInput, IDocument newInput) {
            if (oldInput != null) {
                oldInput.removeDocumentListener(Reconciler.this.documentListener);
            }

            if (newInput != null)
                newInput.addDocumentListener(Reconciler.this.documentListener);
        }
    }
}
