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

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.Position;
import org.eclipse.jface.text.reconciler.DirtyRegion;
import org.eclipse.jface.text.reconciler.IReconcilingStrategy;
import org.eclipse.jface.text.source.Annotation;
import org.eclipse.jface.text.source.IAnnotationModelExtension;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.swt.widgets.Display;
import org.eclipse.ui.IPathEditorInput;
import org.eclipse.ui.ide.ResourceUtil;

import com.google.common.collect.Maps;
import com.palantir.typescript.services.language.Diagnostic;
import com.palantir.typescript.services.language.LanguageService;

/**
 * The reconciling strategy shows error annotations before a file is saved.
 *
 * @author dcicerone
 */
public final class ReconcilingStrategy implements IReconcilingStrategy {

    private static final String ANNOTATION_TYPE = "com.palantir.typescript.diagnostic";

    private LanguageService cachedLanguageService;
    private IDocument document;
    private Annotation[] lastAnnotations;

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
        LanguageService languageService = this.getLanguageService();
        String fileName = this.editor.getFileName();

        // edit the file
        int offset = dirtyRegion.getOffset();
        int length = dirtyRegion.getLength();
        String text = dirtyRegion.getText();
        if (dirtyRegion.getType().equals(DirtyRegion.INSERT)) {
            length = 0;
        } else { // replace
            text = "";
        }
        languageService.editFile(fileName, offset, length, text);

        this.reconcile(languageService, fileName);
    }

    @Override
    public void reconcile(IRegion partition) {
        LanguageService languageService = this.getLanguageService();
        String fileName = this.editor.getFileName();

        // update the file contents
        String contents = this.document.get();
        languageService.updateFileContents(fileName, contents);

        this.reconcile(languageService, fileName);
    }

    private void reconcile(LanguageService languageService, String fileName) {
        final List<Diagnostic> diagnostics = languageService.getDiagnostics(fileName);

        Display.getDefault().asyncExec(new Runnable() {
            @Override
            public void run() {
                updateAnnotations(diagnostics);
            }
        });
    }

    private LanguageService getLanguageService() {
        if (this.cachedLanguageService == null) {
            IPathEditorInput editorInput = (IPathEditorInput) this.editor.getEditorInput();
            IResource resource = ResourceUtil.getResource(editorInput);
            IProject project = resource.getProject();

            this.cachedLanguageService = new LanguageService(project);
        }

        return this.cachedLanguageService;
    }

    private void updateAnnotations(List<Diagnostic> diagnostics) {
        IAnnotationModelExtension annotationModel = (IAnnotationModelExtension) this.sourceViewer.getAnnotationModel();

        if (annotationModel != null) {
            Map<Annotation, Position> annotationsToAdd = Maps.newHashMap();

            for (Diagnostic diagnostic : diagnostics) {
                Annotation annotation = new Annotation(ANNOTATION_TYPE, false, diagnostic.getText());
                Position position = new Position(diagnostic.getStart(), diagnostic.getLength());

                annotationsToAdd.put(annotation, position);
            }

            annotationModel.replaceAnnotations(this.lastAnnotations, annotationsToAdd);

            // keep the annotations around in case they will be replaced later
            this.lastAnnotations = annotationsToAdd.keySet().toArray(new Annotation[diagnostics.size()]);
        }
    }
}
