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

import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceChangeEvent;
import org.eclipse.core.resources.IResourceChangeListener;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.DocumentEvent;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IDocumentExtension3;
import org.eclipse.jface.text.IDocumentListener;
import org.eclipse.jface.text.ITextInputListener;
import org.eclipse.jface.text.source.DefaultCharacterPairMatcher;
import org.eclipse.jface.text.source.ICharacterPairMatcher;
import org.eclipse.jface.text.source.IOverviewRuler;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.jface.text.source.IVerticalRuler;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.ui.IEditorInput;
import org.eclipse.ui.IEditorSite;
import org.eclipse.ui.IFileEditorInput;
import org.eclipse.ui.IPathEditorInput;
import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.PartInitException;
import org.eclipse.ui.PlatformUI;
import org.eclipse.ui.editors.text.EditorsUI;
import org.eclipse.ui.editors.text.TextEditor;
import org.eclipse.ui.ide.FileStoreEditorInput;
import org.eclipse.ui.ide.IDE;
import org.eclipse.ui.ide.ResourceUtil;
import org.eclipse.ui.texteditor.ChainedPreferenceStore;
import org.eclipse.ui.texteditor.SourceViewerDecorationSupport;
import org.eclipse.ui.views.contentoutline.IContentOutlinePage;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableList;
import com.palantir.typescript.EclipseResources;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.preferences.ProjectPreferenceStore;
import com.palantir.typescript.services.language.ByteOrderMark;
import com.palantir.typescript.services.language.DefinitionInfo;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.LanguageService;
import com.palantir.typescript.services.language.ScriptElementKind;
import com.palantir.typescript.text.actions.FindReferencesAction;
import com.palantir.typescript.text.actions.FormatAction;
import com.palantir.typescript.text.actions.GoToMatchingBracketAction;
import com.palantir.typescript.text.actions.OpenDefinitionAction;
import com.palantir.typescript.text.actions.QuickOutlineAction;
import com.palantir.typescript.text.actions.RenameAction;
import com.palantir.typescript.text.actions.ToggleCommentAction;

/**
 * The editor for TypeScript files.
 *
 * @author tyleradams
 */
public final class TypeScriptEditor extends TextEditor {

    private static final LoadingCache<IProject, LanguageService> LANGUAGE_SERVICE_CACHE = CacheBuilder.newBuilder().build(
        new CacheLoader<IProject, LanguageService>() {
            @Override
            public LanguageService load(IProject project) throws Exception {
                LanguageService languageService = new LanguageService(project);
                MyResourceChangeListener resourceChangeListener = new MyResourceChangeListener(languageService, project);
                ResourcesPlugin.getWorkspace().addResourceChangeListener(resourceChangeListener, IResourceChangeEvent.POST_CHANGE);

                return languageService;
            }

            final class MyResourceChangeListener implements IResourceChangeListener {

                private final LanguageService languageService;
                private final IProject project;

                public MyResourceChangeListener(LanguageService languageService, IProject project) {
                    this.languageService = languageService;
                    this.project = project;
                }

                @Override
                public void resourceChanged(IResourceChangeEvent event) {
                    IResourceDelta delta = event.getDelta();
                    final ImmutableList<FileDelta> fileDeltas = EclipseResources.getTypeScriptFileDeltas(delta, this.project);

                    this.languageService.updateFiles(fileDeltas);
                }
            }
        });

    private ICharacterPairMatcher characterPairMatcher;
    private OutlinePage contentOutlinePage;
    private EditorLanguageService languageService;

    @Override
    public void dispose() {
        // inform the language service that the file is no longer open
        if (this.getEditorInput() != null) {
            this.languageService.setFileOpen(false);
        }

        super.dispose();
    }

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

    public ICharacterPairMatcher getCharacterPairMatcher() {
        return this.characterPairMatcher;
    }

    public IDocument getDocument() {
        return this.getSourceViewer().getDocument();
    }

    public String getFileName() {
        IEditorInput input = this.getEditorInput();

        return getFileName(input);
    }

    public String getFilePath() {
        IEditorInput input = this.getEditorInput();

        return getFilePath(input);
    }

    public EditorLanguageService getLanguageService() {
        return this.languageService;
    }

    @Override
    public void init(IEditorSite site, IEditorInput input) throws PartInitException {
        super.init(site, input);

        String fileName = getFileName(input);
        if (input instanceof IPathEditorInput) {
            IResource resource = ResourceUtil.getResource(input);
            IProject project = resource.getProject();

            // set a project-specific preference store
            ChainedPreferenceStore chainedPreferenceStore = new ChainedPreferenceStore(new IPreferenceStore[] {
                    new ProjectPreferenceStore(project),
                    EditorsUI.getPreferenceStore(),
                    PlatformUI.getPreferenceStore()
            });
            this.setPreferenceStore(chainedPreferenceStore);

            if (EclipseResources.isContainedInSourceFolder(resource, project)) {
                this.languageService = new EditorLanguageService(fileName, LANGUAGE_SERVICE_CACHE.getUnchecked(project));
            } else {
                String filePath = getFilePath(input);

                this.languageService = new EditorLanguageService(fileName, new LanguageService(fileName, filePath));
            }
        } else if (input instanceof FileStoreEditorInput) {
            String filePath = getFilePath(input);

            this.languageService = new EditorLanguageService(fileName, new LanguageService(fileName, filePath));
        } else {
            String contents = this.getDocumentProvider().getDocument(input).get();

            this.languageService = new EditorLanguageService(fileName, new LanguageService(fileName, ByteOrderMark.NONE, contents));
        }

        // inform the language service that the file is open
        this.languageService.setFileOpen(true);
    }

    public static void openDefinition(DefinitionInfo definition) {
        checkNotNull(definition);

        String fileName = definition.getFileName();
        if (!fileName.isEmpty()) {
            IWorkbenchPage activePage = PlatformUI.getWorkbench().getActiveWorkbenchWindow().getActivePage();
            IFileStore fileStore = EclipseResources.getFileStore(fileName);

            // open the editor and select the text
            try {
                TypeScriptEditor definitionEditor = (TypeScriptEditor) IDE.openEditorOnFileStore(activePage, fileStore);
                int minChar = definition.getMinChar();
                int limChar = definition.getLimChar();
                String name = definition.getName();

                // constructors don't use the name from the defintion so they require special handling
                if (definition.getKind() == ScriptElementKind.CONSTRUCTOR_IMPLEMENTATION_ELEMENT){
                    name = "constructor";
                }

                definitionEditor.selectAndReveal(minChar, limChar - minChar, name);
            } catch (PartInitException e) {
                throw new RuntimeException(e);
            }
        }
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

    @Override
    protected void configureSourceViewerDecorationSupport(SourceViewerDecorationSupport support) {
        super.configureSourceViewerDecorationSupport(support);

        support.setCharacterPairMatcher(this.characterPairMatcher);
        support.setMatchingCharacterPainterPreferenceKeys(IPreferenceConstants.EDITOR_MATCHING_BRACKETS,
            IPreferenceConstants.EDITOR_MATCHING_BRACKETS_COLOR);
    }

    @Override
    protected void createActions() {
        super.createActions();

        // find references
        FindReferencesAction findReferencesAction = new FindReferencesAction(this);
        findReferencesAction.setActionDefinitionId(ITypeScriptActionDefinitionIds.FIND_REFERENCES);
        this.setAction(ITypeScriptActionDefinitionIds.FIND_REFERENCES, findReferencesAction);

        // format
        FormatAction formatAction = new FormatAction(this);
        formatAction.setActionDefinitionId(ITypeScriptActionDefinitionIds.FORMAT);
        this.setAction(ITypeScriptActionDefinitionIds.FORMAT, formatAction);

        // go to matching bracket
        GoToMatchingBracketAction goToMatchingBracketAction = new GoToMatchingBracketAction(this);
        goToMatchingBracketAction.setActionDefinitionId(ITypeScriptActionDefinitionIds.GO_TO_MATCHING_BRACKET);
        this.setAction(ITypeScriptActionDefinitionIds.GO_TO_MATCHING_BRACKET, goToMatchingBracketAction);

        // open definition
        OpenDefinitionAction openDefinitionAction = new OpenDefinitionAction(this);
        openDefinitionAction.setActionDefinitionId(ITypeScriptActionDefinitionIds.OPEN_DEFINITION);
        this.setAction(ITypeScriptActionDefinitionIds.OPEN_DEFINITION, openDefinitionAction);

        // quick outline
        QuickOutlineAction quickOutlineAction = new QuickOutlineAction(this);
        quickOutlineAction.setActionDefinitionId(ITypeScriptActionDefinitionIds.QUICK_OUTLINE);
        this.setAction(ITypeScriptActionDefinitionIds.QUICK_OUTLINE, quickOutlineAction);

        // rename
        RenameAction renameAction = new RenameAction(this);
        renameAction.setActionDefinitionId(ITypeScriptActionDefinitionIds.RENAME);
        this.setAction(ITypeScriptActionDefinitionIds.RENAME, renameAction);

        // toggle comment
        ToggleCommentAction toggleCommentAction = new ToggleCommentAction(this);
        toggleCommentAction.setActionDefinitionId(ITypeScriptActionDefinitionIds.TOGGLE_COMMENT);
        this.setAction(ITypeScriptActionDefinitionIds.TOGGLE_COMMENT, toggleCommentAction);
    }

    @Override
    protected ISourceViewer createSourceViewer(Composite parent, IVerticalRuler ruler, int styles) {
        this.fAnnotationAccess = this.getAnnotationAccess();
        this.fOverviewRuler = this.createOverviewRuler(this.getSharedColors());

        IOverviewRuler overviewRuler = this.getOverviewRuler();
        boolean overviewRulerVisible = this.isOverviewRulerVisible();
        ISourceViewer sourceViewer = new TypeScriptSourceViewer(parent, ruler, overviewRuler, overviewRulerVisible, styles);

        // ensure decoration support has been created and configured
        this.getSourceViewerDecorationSupport(sourceViewer);

        // listen for text input events to keep the language services in sync
        sourceViewer.addTextInputListener(new MyListener());

        return sourceViewer;
    }

    @Override
    protected void initializeEditor() {
        super.initializeEditor();

        this.characterPairMatcher = createCharacterPairMatcher();

        // set the preference store
        ChainedPreferenceStore chainedPreferenceStore = new ChainedPreferenceStore(new IPreferenceStore[] {
                TypeScriptPlugin.getDefault().getPreferenceStore(),
                EditorsUI.getPreferenceStore(),
                PlatformUI.getPreferenceStore()
        });
        this.setPreferenceStore(chainedPreferenceStore);
    }

    @Override
    protected void initializeKeyBindingScopes() {
        this.setKeyBindingScopes(new String[] {
                "com.palantir.typescript.text.typeScriptEditorScope",
                "org.eclipse.ui.textEditorScope"
        });
    }

    @Override
    protected void setPreferenceStore(IPreferenceStore store) {
        super.setPreferenceStore(store);

        // set a new source viewer configuration when the preference store is changed
        this.setSourceViewerConfiguration(new TypeScriptSourceViewerConfiguration(this, this.getPreferenceStore()));
    }

    private static ICharacterPairMatcher createCharacterPairMatcher() {
        char[] chars = new char[] { '{', '}', '(', ')', '[', ']' };

        try { // the 3-arg constructor is only available in 3.8+
            DefaultCharacterPairMatcher.class.getDeclaredConstructor(char[].class, String.class, boolean.class);

            return new DefaultCharacterPairMatcher(chars, IDocumentExtension3.DEFAULT_PARTITIONING, true);
        } catch (NoSuchMethodException e) {
            return new DefaultCharacterPairMatcher(chars, IDocumentExtension3.DEFAULT_PARTITIONING);
        } catch (SecurityException e) {
            throw new RuntimeException(e);
        }
    }

    private static String getFileName(IEditorInput input) {
        if (input instanceof IFileEditorInput) {
            IFileEditorInput fileInput = (IFileEditorInput) input;
            IFile file = fileInput.getFile();

            return EclipseResources.getFileName(file);
        } else if (input instanceof FileStoreEditorInput) {
            FileStoreEditorInput fileStoreInput = (FileStoreEditorInput) input;

            return fileStoreInput.getURI().toString();
        } else {
            return "unknown";
        }
    }

    private static String getFilePath(IEditorInput input) {
        if (input instanceof IFileEditorInput) {
            IFileEditorInput fileInput = (IFileEditorInput) input;
            IFile file = fileInput.getFile();

            return EclipseResources.getFilePath(file);
        } else if (input instanceof FileStoreEditorInput) {
            FileStoreEditorInput fileStoreInput = (FileStoreEditorInput) input;

            return new File(fileStoreInput.getURI()).getAbsolutePath();
        }

        throw new UnsupportedOperationException();
    }

    private final class MyListener implements IDocumentListener, ITextInputListener {
        @Override
        public void documentAboutToBeChanged(DocumentEvent event) {
        }

        @Override
        public void documentChanged(DocumentEvent event) {
            int offset = event.getOffset();
            int length = event.getLength();
            String text = event.getText();

            TypeScriptEditor.this.languageService.editFile(offset, length, text);
        }

        @Override
        public void inputDocumentAboutToBeChanged(IDocument oldInput, IDocument newInput) {
            if (oldInput != null) {
                oldInput.removeDocumentListener(this);
            }
        }

        @Override
        public void inputDocumentChanged(IDocument oldInput, IDocument newInput) {
            if (newInput != null) {
                newInput.addDocumentListener(this);
            }
        }
    }
}
