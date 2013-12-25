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
import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.ITextInputListener;
import org.eclipse.jface.text.ITextViewerExtension5;
import org.eclipse.jface.text.Region;
import org.eclipse.jface.text.source.DefaultCharacterPairMatcher;
import org.eclipse.jface.text.source.ICharacterPairMatcher;
import org.eclipse.jface.text.source.IOverviewRuler;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.jface.text.source.IVerticalRuler;
import org.eclipse.swt.custom.StyledText;
import org.eclipse.swt.graphics.Point;
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
import com.google.common.collect.Lists;
import com.palantir.typescript.EclipseResources;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.preferences.ProjectPreferenceStore;
import com.palantir.typescript.services.language.DefinitionInfo;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.LanguageService;
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

    private OutlinePage contentOutlinePage;
    private LanguageService languageService;

    private DefaultCharacterPairMatcher pairMatcher;

    // Previous location history for goto matching bracket action.
    private List<IRegion> previousSelections;

    protected static final char[] BRACKETS = { '{', '}', '(', ')', '[', ']' };

    @Override
    public void dispose() {
        // inform the language service that the file is no longer open
        if (this.getEditorInput() != null) {
            this.languageService.setFileOpen(this.getFileName(), false);
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

    public LanguageService getLanguageService() {
        return this.languageService;
    }

    @Override
    public void init(IEditorSite site, IEditorInput input) throws PartInitException {
        String fileName = getFileName(input);

        if (input instanceof IPathEditorInput) {
            IResource resource = ResourceUtil.getResource(input);
            IProject project = resource.getProject();

            // set a project-specific preference store
            IPreferenceStore pluginPreferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();
            ChainedPreferenceStore chainedPreferenceStore = new ChainedPreferenceStore(new IPreferenceStore[] {
                    new ProjectPreferenceStore(project, pluginPreferenceStore, ""),
                    EditorsUI.getPreferenceStore(),
                    PlatformUI.getPreferenceStore()
            });
            this.setPreferenceStore(chainedPreferenceStore);

            if (EclipseResources.isContainedInSourceFolder(resource, project)) {
                this.languageService = LANGUAGE_SERVICE_CACHE.getUnchecked(project);
            } else {
                String filePath = getFilePath(input);

                this.languageService = new LanguageService(fileName, filePath);
            }
        } else if (input instanceof FileStoreEditorInput) {
            String filePath = getFilePath(input);

            this.languageService = new LanguageService(fileName, filePath);
        }

        // inform the language service that the file is open
        this.languageService.setFileOpen(fileName, true);

        super.init(site, input);
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

    /**
     * Jumps to the matching bracket.
     * Based on org.eclipse.jdt.internal.ui.javaeditor.JavaEditor.gotoMatchingBracket()
     */
    public void gotoMatchingBracket() {

        ISourceViewer sourceViewer = getSourceViewer();
        IDocument document = sourceViewer.getDocument();
        if (document == null)
            return;

        IRegion selection = getSignedSelection(sourceViewer);
        if (this.previousSelections == null)
            initializePreviousSelectionList();

        IRegion region = this.pairMatcher.match(document, selection.getOffset(), selection.getLength());
        if (region == null) {
            region = this.pairMatcher.findEnclosingPeerCharacters(document, selection.getOffset(), selection.getLength());
            initializePreviousSelectionList();
            this.previousSelections.add(selection);
        } else {
            if (this.previousSelections.size() == 2) {
                if (!selection.equals(this.previousSelections.get(1))) {
                    initializePreviousSelectionList();
                }
            } else if (this.previousSelections.size() == 3) {
                if (selection.equals(this.previousSelections.get(2)) && !selection.equals(this.previousSelections.get(0))) {
                    IRegion originalSelection = this.previousSelections.get(0);
                    sourceViewer.setSelectedRange(originalSelection.getOffset(), originalSelection.getLength());
                    sourceViewer.revealRange(originalSelection.getOffset(), originalSelection.getLength());
                    initializePreviousSelectionList();
                    return;
                }
                initializePreviousSelectionList();
            }
        }

        if (region == null) {
            setStatusLineErrorMessage("No matching bracket found");
            sourceViewer.getTextWidget().getDisplay().beep();
            return;
        }

        int offset = region.getOffset();
        int length = region.getLength();

        if (length < 1)
            return;

        int anchor = this.pairMatcher.getAnchor();
        int targetOffset = (ICharacterPairMatcher.RIGHT == anchor) ? offset + 1 : offset + length - 1;

        boolean visible = false;
        if (sourceViewer instanceof ITextViewerExtension5) {
            ITextViewerExtension5 extension = (ITextViewerExtension5) sourceViewer;
            visible = (extension.modelOffset2WidgetOffset(targetOffset) > -1);
        } else {
            IRegion visibleRegion = sourceViewer.getVisibleRegion();
            visible = (targetOffset >= visibleRegion.getOffset() && targetOffset <= visibleRegion.getOffset() + visibleRegion.getLength());
        }

        if (!visible) {
            setStatusLineErrorMessage("Matching bracket is not visible");
            sourceViewer.getTextWidget().getDisplay().beep();
            return;
        }

        int adjustment = getOffsetAdjustment(document, selection.getOffset() + selection.getLength(), selection.getLength());
        targetOffset += adjustment;
        int direction = (selection.getLength() == 0) ? 0 : ((selection.getLength() > 0) ? 1 : -1);
        if (this.previousSelections.size() == 1 && direction < 0) {
            targetOffset++;
        }

        if (this.previousSelections.size() > 0) {
            this.previousSelections.add(new Region(targetOffset, direction));
        }
        sourceViewer.setSelectedRange(targetOffset, direction);
        sourceViewer.revealRange(targetOffset, direction);
    }

    private void initializePreviousSelectionList() {
        this.previousSelections = Lists.newArrayList();
    }

    /**
     * Copy of org.eclipse.jface.text.source.MatchingCharacterPainter.getSignedSelection(ISourceViewer).
     */
    private static IRegion getSignedSelection(ISourceViewer sourceViewer) {
        Point viewerSelection = sourceViewer.getSelectedRange();

        StyledText text = sourceViewer.getTextWidget();
        Point selection = text.getSelectionRange();
        if (text.getCaretOffset() == selection.x) {
            viewerSelection.x = viewerSelection.x + viewerSelection.y;
            viewerSelection.y = -viewerSelection.y;
        }

        return new Region(viewerSelection.x, viewerSelection.y);
    }

    /**
     * Copy of org.eclipse.jface.text.source.DefaultCharacterPairMatcher.getOffsetAdjustment(IDocument, int, int).
     */
    private static int getOffsetAdjustment(IDocument document, int offset, int length) {
        if (length == 0 || Math.abs(length) > 1)
            return 0;
        try {
            if (length < 0) {
                if (isOpeningBracket(document.getChar(offset))) {
                    return 1;
                }
            } else {
                if (isClosingBracket(document.getChar(offset - 1))) {
                    return -1;
                }
            }
        } catch (BadLocationException e) {
            //do nothing
        }
        return 0;
    }

    private static boolean isOpeningBracket(char character) {
        for (int i = 0; i < BRACKETS.length; i += 2) {
            if (character == BRACKETS[i])
                return true;
        }
        return false;
    }

    private static boolean isClosingBracket(char character) {
        for (int i = 1; i < BRACKETS.length; i += 2) {
            if (character == BRACKETS[i])
                return true;
        }
        return false;
    }

    private DefaultCharacterPairMatcher getPairMatcher() {
        if (this.pairMatcher == null) {
            // configure character matching
            try { // the 3-arg constructor is only available in 3.8+
                DefaultCharacterPairMatcher.class.getDeclaredConstructor(char[].class, String.class, boolean.class);
                this.pairMatcher = new DefaultCharacterPairMatcher(BRACKETS, IDocumentExtension3.DEFAULT_PARTITIONING, true);
            } catch (NoSuchMethodException e) {
                this.pairMatcher = new DefaultCharacterPairMatcher(BRACKETS, IDocumentExtension3.DEFAULT_PARTITIONING);
            } catch (SecurityException e) {
                throw new RuntimeException(e);
            }
        }
        return this.pairMatcher;
    }

    @Override
    protected void configureSourceViewerDecorationSupport(SourceViewerDecorationSupport support) {
        super.configureSourceViewerDecorationSupport(support);

        support.setCharacterPairMatcher(getPairMatcher());
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
        GoToMatchingBracketAction gotoMatchingBracketAction = new GoToMatchingBracketAction(this);
        gotoMatchingBracketAction.setActionDefinitionId(ITypeScriptActionDefinitionIds.GO_TO_MATCHIING_BRACKET);
        this.setAction(ITypeScriptActionDefinitionIds.GO_TO_MATCHIING_BRACKET, gotoMatchingBracketAction);

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

    private static String getFileName(IEditorInput input) {
        if (input instanceof IFileEditorInput) {
            IFileEditorInput fileInput = (IFileEditorInput) input;
            IFile file = fileInput.getFile();

            return EclipseResources.getFileName(file);
        } else if (input instanceof FileStoreEditorInput) {
            FileStoreEditorInput fileStoreInput = (FileStoreEditorInput) input;

            return fileStoreInput.getURI().toString();
        }

        throw new UnsupportedOperationException();
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
            String fileName = TypeScriptEditor.this.getFileName();
            int offset = event.getOffset();
            int length = event.getLength();
            String text = event.getText();

            TypeScriptEditor.this.languageService.editFile(fileName, offset, length, text);
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
