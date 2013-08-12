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

import java.util.Queue;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor.DiscardPolicy;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.jface.text.DocumentEvent;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IDocumentListener;
import org.eclipse.jface.text.ITextInputListener;
import org.eclipse.jface.text.ITextViewer;
import org.eclipse.jface.text.Region;
import org.eclipse.jface.text.reconciler.IReconciler;
import org.eclipse.jface.text.reconciler.IReconcilingStrategy;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.swt.custom.CaretEvent;
import org.eclipse.swt.custom.CaretListener;
import org.eclipse.swt.custom.StyledText;
import org.eclipse.swt.widgets.Control;
import org.eclipse.ui.IPathEditorInput;
import org.eclipse.ui.editors.text.EditorsUI;
import org.eclipse.ui.ide.ResourceUtil;
import org.eclipse.ui.texteditor.spelling.SpellingReconcileStrategy;
import org.eclipse.ui.texteditor.spelling.SpellingService;

import com.google.common.collect.Queues;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import com.palantir.typescript.services.language.LanguageService;

/**
 * A reconciler which also reconciles for selection changes.
 *
 * @author dcicerone
 */
public final class Reconciler implements IReconciler {

    private final TypeScriptEditor editor;

    private final AnnotationReconcilingStrategy annotationStrategy;
    private final CaretListener caretListener;
    private final Queue<DocumentEvent> eventQueue;
    private final ScheduledExecutorService executor;
    private final MyListener listener;
    private final AtomicBoolean reconcileRequired;
    private final SpellingReconcileStrategy spellingStrategy;

    private LanguageService cachedLanguageService;
    private ITextViewer cachedTextViewer;

    public Reconciler(TypeScriptEditor editor, ISourceViewer sourceViewer) {
        checkNotNull(editor);
        checkNotNull(sourceViewer);

        this.editor = editor;

        this.annotationStrategy = new AnnotationReconcilingStrategy(editor, sourceViewer);
        this.caretListener = new MyCaretListener();
        this.eventQueue = Queues.newConcurrentLinkedQueue();
        this.executor = createExecutor();
        this.listener = new MyListener();
        this.reconcileRequired = new AtomicBoolean();
        this.spellingStrategy = new SpellingReconcileStrategy(sourceViewer, EditorsUI.getSpellingService());
    }

    @Override
    public void install(ITextViewer textViewer) {
        StyledText control = (StyledText) this.editor.getAdapter(Control.class);
        control.addCaretListener(this.caretListener);

        this.cachedTextViewer = textViewer;
        this.cachedTextViewer.addTextInputListener(this.listener);
    }

    @Override
    public void uninstall() {
        StyledText control = (StyledText) this.editor.getAdapter(Control.class);
        control.removeCaretListener(this.caretListener);

        this.cachedTextViewer.removeTextInputListener(this.listener);

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

            // set the file as open so that resource change events are not processed for it
            String fileName = this.editor.getFileName();
            this.cachedLanguageService.setFileOpen(fileName, true);
        }

        return this.cachedLanguageService;
    }

    private void scheduleReconcile() {
        this.reconcileRequired.set(true);
        this.executor.schedule(new Runnable() {
            @Override
            public void run() {
                reconcile();
            }
        }, 500, TimeUnit.MILLISECONDS);
    }

    private void processEvents(LanguageService languageService) {
        DocumentEvent event;

        while ((event = Reconciler.this.eventQueue.poll()) != null) {
            String fileName = Reconciler.this.editor.getFileName();
            int offset = event.getOffset();
            int length = event.getLength();
            String text = event.getText();

            languageService.editFile(fileName, offset, length, text);
        }
    }

    private void reconcile() {
        LanguageService languageService = getLanguageService();

        // check that a reconcile is still required (many tasks may be queued but only one should run at any given time)
        if (this.reconcileRequired.compareAndSet(true, false)) {
            // spelling
            if (EditorsUI.getPreferenceStore().getBoolean(SpellingService.PREFERENCE_SPELLING_ENABLED)) {
                int length = this.editor.getDocument().getLength();
                Region region = new Region(0, length);

                this.spellingStrategy.reconcile(region);
            }

            // annotations
            this.processEvents(languageService);
            this.annotationStrategy.reconcile(languageService);
        }
    }

    private static ScheduledExecutorService createExecutor() {
        ThreadFactory threadFactory = new ThreadFactoryBuilder().setDaemon(true).setPriority(Thread.MIN_PRIORITY).build();
        DiscardPolicy policy = new DiscardPolicy();

        return new ScheduledThreadPoolExecutor(1, threadFactory, policy);
    }

    private final class MyCaretListener implements CaretListener {
        @Override
        public void caretMoved(CaretEvent event) {
            scheduleReconcile();
        }
    }

    private final class MyListener implements IDocumentListener, ITextInputListener {
        @Override
        public void documentAboutToBeChanged(DocumentEvent event) {
        }

        @Override
        public void documentChanged(DocumentEvent event) {
            Reconciler.this.eventQueue.add(event);

            scheduleReconcile();
        }

        @Override
        public void inputDocumentAboutToBeChanged(IDocument oldInput, IDocument newInput) {
            if (oldInput != null) {
                oldInput.removeDocumentListener(this);
            }
        }

        @Override
        public void inputDocumentChanged(IDocument oldInput, IDocument newInput) {
            Reconciler.this.spellingStrategy.setDocument(newInput);

            if (newInput != null) {
                newInput.addDocumentListener(this);

                // initial reconcile
                Reconciler.this.reconcileRequired.set(true);
                Reconciler.this.executor.execute(new Runnable() {
                    @Override
                    public void run() {
                        reconcile();
                    }
                });
            }
        }
    }
}
