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

import java.util.Iterator;
import java.util.List;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.Position;
import org.eclipse.jface.text.reconciler.DirtyRegion;
import org.eclipse.jface.text.reconciler.IReconcilingStrategy;
import org.eclipse.jface.text.source.Annotation;
import org.eclipse.jface.text.source.IAnnotationModel;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.swt.widgets.Display;
import org.eclipse.ui.IPathEditorInput;
import org.eclipse.ui.ide.ResourceUtil;

import com.google.common.collect.Lists;
import com.palantir.typescript.services.language.Diagnostic;
import com.palantir.typescript.services.language.LanguageService;

/**
 * The reconciling strategy shows error annotations before a file is saved.
 *
 * @author dcicerone
 */
public final class ReconcilingStrategy implements IReconcilingStrategy {

    private static final String ANNOTATION_TYPE = "com.palantir.typescript.diagnostic";

    private IDocument document;
    private LanguageService languageService;

    private final TypeScriptEditor editor;
    private final ISourceViewer sourceViewer;

    public ReconcilingStrategy(TypeScriptEditor editor, ISourceViewer sourceViewer) {
        checkNotNull(editor);
        checkNotNull(sourceViewer);

        this.editor = editor;
        this.sourceViewer = sourceViewer;
    }

    @Override
    public void setDocument(IDocument document) {
        this.document = document;
    }

    @Override
    public void reconcile(DirtyRegion dirtyRegion, IRegion subRegion) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void reconcile(IRegion partition) {
        LanguageService localLanguageService = this.getLanguageService();

        // update the file contents
        String fileName = this.editor.getFileName();
        String contents = this.document.get();
        localLanguageService.updateFileContents(fileName, contents);

        // update the annotations for the diagnostics
        final List<Diagnostic> diagnostics = localLanguageService.getDiagnostics(fileName);
        Display.getDefault().asyncExec(new Runnable() {
            @Override
            public void run() {
                updateAnnotations(diagnostics);
            }
        });
    }

    private LanguageService getLanguageService() {
        if (this.languageService == null) {
            IPathEditorInput editorInput = (IPathEditorInput) this.editor.getEditorInput();
            IResource resource = ResourceUtil.getResource(editorInput);
            IProject project = resource.getProject();

            this.languageService = new LanguageService(project);
        }

        return this.languageService;
    }

    private void removeAnnotations(IAnnotationModel annotationModel) {
        List<Annotation> annotationsToRemove = Lists.newArrayList();

        Iterator<Annotation> it = annotationModel.getAnnotationIterator();
        while (it.hasNext()) {
            Annotation annotation = it.next();

            if (annotation.getType().equals(ANNOTATION_TYPE)) {
                annotationsToRemove.add(annotation);
            }
        }

        for (Annotation annotation : annotationsToRemove) {
            annotationModel.removeAnnotation(annotation);
        }
    }

    private void updateAnnotations(List<Diagnostic> diagnostics) {
        IAnnotationModel annotationModel = this.sourceViewer.getAnnotationModel();

        removeAnnotations(annotationModel);

        for (Diagnostic diagnostic : diagnostics) {
            Annotation annotation = new Annotation(ANNOTATION_TYPE, false, diagnostic.getText());
            Position position = new Position(diagnostic.getStart(), diagnostic.getLength());

            annotationModel.addAnnotation(annotation, position);
        }
    }
}
