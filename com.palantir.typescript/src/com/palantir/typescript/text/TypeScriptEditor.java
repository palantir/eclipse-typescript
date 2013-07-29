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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import java.io.File;
import java.util.List;

import org.eclipse.core.filesystem.EFS;
import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.jface.action.Action;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.ITextListener;
import org.eclipse.jface.text.TextEvent;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.jface.text.source.IVerticalRuler;
import org.eclipse.jface.text.source.SourceViewer;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.ui.IEditorInput;
import org.eclipse.ui.IEditorSite;
import org.eclipse.ui.IPathEditorInput;
import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.PartInitException;
import org.eclipse.ui.PlatformUI;
import org.eclipse.ui.editors.text.TextEditor;
import org.eclipse.ui.ide.IDE;
import org.eclipse.ui.ide.ResourceUtil;
import org.eclipse.ui.texteditor.IUpdate;
import org.eclipse.ui.views.contentoutline.IContentOutlinePage;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.palantir.typescript.services.language.DefinitionInfo;
import com.palantir.typescript.services.language.LanguageService;

/**
 * The editor for TypeScript files.
 *
 * @author tyleradams
 */
public final class TypeScriptEditor extends TextEditor {

    private static final LoadingCache<IProject, LanguageService> LANGUAGE_SERVICE_CACHE = CacheBuilder.newBuilder().build(new CacheLoader<IProject, LanguageService>() {
        @Override
        public LanguageService load(IProject project) throws Exception {
            return new LanguageService(project);
        }
    });

    private OutlinePage contentOutlinePage;
    private LanguageService languageService;

    @Override
    public Object getAdapter(Class adapter) {
        if (IContentOutlinePage.class.equals(adapter)) {
            if (this.contentOutlinePage == null) {
                this.contentOutlinePage = new OutlinePage(this);
            }

            return this.contentOutlinePage;
        }

        return super.getAdapter(adapter);
    }

    @Override
    protected void initializeEditor() {
        super.initializeEditor();

        this.setSourceViewerConfiguration(new SourceViewerConfiguration(this));
    }

    public String getFileName() {
        IPathEditorInput editorInput = (IPathEditorInput) this.getEditorInput();

        return editorInput.getPath().toOSString();
    }

    public LanguageService getLanguageService() {
        return this.languageService;
    }

    public IDocument getDocument() {
        return this.getSourceViewer().getDocument();
    }

    @Override
    public void init(IEditorSite site, IEditorInput input) throws PartInitException {
        IPathEditorInput editorInput = (IPathEditorInput) input;

        // create the langauge service
        IResource resource = ResourceUtil.getResource(input);
        IProject project = resource.getProject();
        this.languageService = LANGUAGE_SERVICE_CACHE.getUnchecked(project);

        // inform the language service that the file is open
        String fileName = editorInput.getPath().toOSString();
        this.languageService.setFileOpen(fileName, true);

        super.init(site, input);
    }

    @Override
    public void dispose() {
        // inform the language service that the file is no longer open
        this.languageService.setFileOpen(this.getFileName(), false);

        super.dispose();
    }

    public void selectAndReveal(int offset, int length, String name) {
        checkArgument(offset >= 0);
        checkArgument(length >= 0);
        checkNotNull(name);

        try {
            IDocument document = this.getDocument();
            String text = document.get(offset, length);
            int start = offset + text.indexOf(name);

            this.selectAndReveal(start, name.length());
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }

    public static void openDefinition(DefinitionInfo definition) {
        checkNotNull(definition);

        IWorkbenchPage activePage = PlatformUI.getWorkbench().getActiveWorkbenchWindow().getActivePage();
        String fileName = definition.getFileName();
        File definitionFile = new File(fileName);
        IFileStore localFile = EFS.getLocalFileSystem().fromLocalFile(definitionFile);

        // open the editor and select the text
        try {
            TypeScriptEditor definitionEditor = (TypeScriptEditor) IDE.openEditorOnFileStore(activePage, localFile);
            int minChar = definition.getMinChar();
            int limChar = definition.getLimChar();
            String name = definition.getName();

            definitionEditor.selectAndReveal(minChar, limChar - minChar, name);
        } catch (PartInitException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void createActions() {
        super.createActions();

        // format
        FormatAction formatAction = new FormatAction();
        formatAction.setActionDefinitionId(ITypeScriptActionDefinitionIds.FORMAT);
        this.setAction(ITypeScriptActionDefinitionIds.FORMAT, formatAction);

        // open definition
        OpenDefinitionAction openDefinitionAction = new OpenDefinitionAction();
        openDefinitionAction.setActionDefinitionId(ITypeScriptActionDefinitionIds.OPEN_DEFINITION);
        this.setAction(ITypeScriptActionDefinitionIds.OPEN_DEFINITION, openDefinitionAction);
    }

    @Override
    protected ISourceViewer createSourceViewer(Composite parent, IVerticalRuler ruler, int styles) {
        ISourceViewer sourceViewer = super.createSourceViewer(parent, ruler, styles);

        sourceViewer.addTextListener(new MyTextListener());

        return sourceViewer;
    }

    @Override
    protected void initializeKeyBindingScopes() {
        this.setKeyBindingScopes(new String[] {
                "com.palantir.typescript.text.typeScriptEditorScope",
                "org.eclipse.ui.textEditorScope"
        });
    }

    private final class FormatAction extends Action implements IUpdate {

        public FormatAction() {
            this.update();
        }

        @Override
        public void run() {
            SourceViewer sourceViewer = (SourceViewer) getSourceViewer();

            sourceViewer.doOperation(ISourceViewer.FORMAT);
        }

        @Override
        public void update() {
            this.setEnabled(isEditorInputModifiable());
        }
    }

    private final class OpenDefinitionAction extends Action {
        @Override
        public void run() {
            String fileName = getFileName();
            int position = getSourceViewer().getSelectedRange().x;
            List<DefinitionInfo> definitions = TypeScriptEditor.this.languageService.getDefinitionAtPosition(fileName, position);

            if (definitions != null && !definitions.isEmpty()) {
                DefinitionInfo definition = definitions.get(0);

                // don't follow references to the built-in default library
                if (!definition.getFileName().equals("lib.d.ts")) {
                    openDefinition(definition);
                }
            }
        }
    }

    private final class MyTextListener implements ITextListener {

        @Override
        public void textChanged(TextEvent event) {
            checkNotNull(event);

            String fileName = getFileName();
            int offset = event.getOffset();
            int length = event.getLength();
            String text = event.getText();

            // redraw state change - update the entire document
            if (event.getDocumentEvent() == null) {
                IDocument document = getSourceViewer().getDocument();
                String documentText = document.get();

                TypeScriptEditor.this.languageService.updateFileContents(fileName, documentText);
            } else if (text != null) { // normal edit
                TypeScriptEditor.this.languageService.editFile(fileName, offset, length, text);
            }
        }
    }
}
