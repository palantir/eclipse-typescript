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

package com.palantir.typescript.services.language;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IFolder;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.ProjectScope;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.core.runtime.preferences.IEclipsePreferences.IPreferenceChangeListener;
import org.eclipse.core.runtime.preferences.IEclipsePreferences.PreferenceChangeEvent;
import org.eclipse.core.runtime.preferences.IScopeContext;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.util.IPropertyChangeListener;
import org.eclipse.jface.util.PropertyChangeEvent;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.databind.type.MapType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.google.common.base.Charsets;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import com.google.common.io.Resources;
import com.palantir.typescript.EclipseResources;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.preferences.ProjectPreferenceStore;
import com.palantir.typescript.services.Bridge;
import com.palantir.typescript.services.Request;

/**
 * The language service.
 * <p>
 * This service provides code completion, formatting, compiling, etc...
 *
 * @author tyleradams
 */
public final class LanguageService {

    private static final String STANDARD_LIBRARY_FILE_NAME = "lib.d.ts";

    private static final String SERVICE = "language";

    private final Bridge bridge;
    private final MyPreferenceChangeListener preferencesListener;
    private final IProject project;

    public LanguageService(String fileName, String filePath) {
        this((IProject) null);

        checkNotNull(fileName);
        checkNotNull(filePath);

        this.addFiles(ImmutableMap.of(fileName, filePath));
    }

    public LanguageService(IProject project) {
        this.bridge = new Bridge();
        this.preferencesListener = new MyPreferenceChangeListener();
        this.project = project;

        // add the default library unless it has been suppressed
        IPreferenceStore preferenceStore = this.getPreferenceStore();
        if (!preferenceStore.getBoolean(IPreferenceConstants.COMPILER_NO_LIB)) {
            this.addDefaultLibrary();
        }

        if (this.project != null) {
            ImmutableList<IFile> typeScriptFiles = EclipseResources.getTypeScriptFiles(project);

            Map<String, String> filePaths = Maps.newHashMap();
            for (IFile typeScriptFile : typeScriptFiles) {
                String fileName = EclipseResources.getFileName(typeScriptFile);
                String filePath = EclipseResources.getFilePath(typeScriptFile);

                filePaths.put(fileName, filePath);
            }

            this.addFiles(filePaths);
        }
        this.updateCompilationSettings();

        TypeScriptPlugin.getDefault().getPreferenceStore().addPropertyChangeListener(this.preferencesListener);

        if (this.project != null) {
            IScopeContext projectScope = new ProjectScope(this.project);
            IEclipsePreferences projectPreferences = projectScope.getNode(TypeScriptPlugin.ID);

            projectPreferences.addPreferenceChangeListener(this.preferencesListener);
        }
    }

    public void dispose() {
        if (this.project != null) {
            IScopeContext projectScope = new ProjectScope(this.project);
            IEclipsePreferences projectPreferences = projectScope.getNode(TypeScriptPlugin.ID);

            projectPreferences.removePreferenceChangeListener(this.preferencesListener);
        }

        TypeScriptPlugin.getDefault().getPreferenceStore().removePropertyChangeListener(this.preferencesListener);

        this.bridge.dispose();
    }

    public void editFile(String fileName, int offset, int length, String replacementText) {
        checkNotNull(fileName);
        checkArgument(offset >= 0);
        checkArgument(length >= 0);
        checkNotNull(replacementText);

        Request request = new Request(SERVICE, "editFile", fileName, offset, length, replacementText);
        this.bridge.call(request, Void.class);
    }

    public List<ReferenceEntryEx> findReferences(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "findReferences", fileName, position);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, ReferenceEntryEx.class);
        return this.bridge.call(request, returnType);
    }

    public Map<String, List<DiagnosticEx>> getAllDiagnostics() {
        Request request = new Request(SERVICE, "getAllDiagnostics");
        JavaType stringType = TypeFactory.defaultInstance().uncheckedSimpleType(String.class);
        CollectionType diagnosticListType = TypeFactory.defaultInstance().constructCollectionType(List.class, DiagnosticEx.class);
        MapType returnType = TypeFactory.defaultInstance().constructMapType(Map.class, stringType, diagnosticListType);
        return LanguageService.this.bridge.call(request, returnType);
    }

    public List<TextSpan> getBraceMatchingAtPosition(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getBraceMatchingAtPosition", fileName, position);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, TextSpan.class);
        return this.bridge.call(request, resultType);
    }

    public CompletionInfoEx getCompletionsAtPosition(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getCompletionsAtPosition", fileName, position);
        return this.bridge.call(request, CompletionInfoEx.class);
    }

    public List<DefinitionInfo> getDefinitionAtPosition(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getDefinitionAtPosition", fileName, position);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, DefinitionInfo.class);
        return this.bridge.call(request, resultType);
    }

    public List<DiagnosticEx> getDiagnostics(String fileName) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getDiagnostics", fileName, this.project != null);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, DiagnosticEx.class);
        return this.bridge.call(request, resultType);
    }

    public List<OutputFile> getEmitOutput(String fileName) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getEmitOutput", fileName);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, OutputFile.class);
        return this.bridge.call(request, resultType);
    }

    public List<TextEdit> getFormattingEditsForRange(String fileName, int minChar, int limChar, FormatCodeOptions options) {
        checkNotNull(fileName);
        checkArgument(minChar >= 0);
        checkArgument(limChar >= 0);
        checkNotNull(options);

        Request request = new Request(SERVICE, "getFormattingEditsForRange", fileName, minChar, limChar, options);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, TextEdit.class);
        return this.bridge.call(request, resultType);
    }

    public int getIndentationAtPosition(String fileName, int position, EditorOptions options) {
        checkNotNull(fileName);
        checkArgument(position >= 0);
        checkNotNull(options);

        Request request = new Request(SERVICE, "getIndentationAtPosition", fileName, position, options);
        return this.bridge.call(request, Integer.class);
    }

    public SpanInfo getNameOrDottedNameSpan(String fileName, int startPos, int endPos) {
        checkNotNull(fileName);
        checkArgument(startPos >= 0);
        checkArgument(endPos >= 0);

        Request request = new Request(SERVICE, "getNameOrDottedNameSpan", fileName, startPos, endPos);
        return this.bridge.call(request, SpanInfo.class);
    }

    public List<NavigateToItem> getNavigateToItems(String searchValue) {
        checkNotNull(searchValue);

        Request request = new Request(SERVICE, "getNavigateToItems", searchValue);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, NavigateToItem.class);
        return this.bridge.call(request, returnType);
    }

    public List<ReferenceEntry> getOccurrencesAtPosition(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getOccurrencesAtPosition", fileName, position);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, ReferenceEntry.class);
        return this.bridge.call(request, returnType);
    }

    public List<ReferenceEntry> getReferencesAtPosition(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getReferencesAtPosition", fileName, position);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, ReferenceEntry.class);
        return this.bridge.call(request, returnType);
    }

    public List<NavigateToItem> getScriptLexicalStructure(String fileName) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getScriptLexicalStructure", fileName);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, NavigateToItem.class);
        return this.bridge.call(request, returnType);
    }

    public SignatureInfo getSignatureAtPosition(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getSignatureAtPosition", fileName, position);
        return this.bridge.call(request, SignatureInfo.class);
    }

    public TypeInfoEx getTypeAtPosition(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getTypeAtPosition", fileName, position);
        return this.bridge.call(request, TypeInfoEx.class);
    }

    public void setFileOpen(String fileName, boolean open) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "setFileOpen", fileName, open);
        this.bridge.call(request, Void.class);
    }

    public void updateFiles(List<FileDelta> fileDeltas) {
        checkNotNull(fileDeltas);

        if (!fileDeltas.isEmpty()) {
            Request request = new Request(SERVICE, "updateFiles", fileDeltas);

            LanguageService.this.bridge.call(request, Void.class);
        }
    }

    private void addDefaultLibrary() {
        String libraryContents;
        try {
            libraryContents = Resources.toString(LanguageService.class.getResource(STANDARD_LIBRARY_FILE_NAME), Charsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        Request request = new Request(SERVICE, "addDefaultLibrary", libraryContents);
        this.bridge.call(request, Void.class);
    }

    private void removeDefaultLibrary() {
        Request request = new Request(SERVICE, "removeDefaultLibrary");
        this.bridge.call(request, Void.class);
    }

    private void addFiles(Map<String, String> files) {
        Request request = new Request(SERVICE, "addFiles", files);
        this.bridge.call(request, Void.class);
    }

    private IPreferenceStore getPreferenceStore() {
        if (this.project != null) {
            return new ProjectPreferenceStore(this.project);
        } else {
            return TypeScriptPlugin.getDefault().getPreferenceStore();
        }
    }

    private void updateCompilationSettings() {
        IPreferenceStore preferenceStore = this.getPreferenceStore();

        // create the compilation settings from the preferences
        CompilationSettings compilationSettings = new CompilationSettings();
        compilationSettings.setCodeGenTarget(LanguageVersion.valueOf(preferenceStore
            .getString(IPreferenceConstants.COMPILER_CODE_GEN_TARGET)));
        compilationSettings.setMapSourceFiles(preferenceStore.getBoolean(IPreferenceConstants.COMPILER_MAP_SOURCE_FILES));
        compilationSettings.setModuleGenTarget(ModuleGenTarget.valueOf(preferenceStore
            .getString(IPreferenceConstants.COMPILER_MODULE_GEN_TARGET)));
        compilationSettings.setNoImplicitAny(preferenceStore.getBoolean(IPreferenceConstants.COMPILER_NO_IMPLICIT_ANY));
        compilationSettings.setNoLib(preferenceStore.getBoolean(IPreferenceConstants.COMPILER_NO_LIB));
        compilationSettings.setRemoveComments(preferenceStore.getBoolean(IPreferenceConstants.COMPILER_REMOVE_COMMENTS));

        // set the output directory or file if it was specified
        if (this.project != null) {
            String outputDir = preferenceStore.getString(IPreferenceConstants.COMPILER_OUTPUT_DIR_OPTION);
            String outputFile = preferenceStore.getString(IPreferenceConstants.COMPILER_OUTPUT_FILE_OPTION);

            // get the eclipse name for the output directory
            String outputFolderName = null;
            if (!Strings.isNullOrEmpty(outputDir)) {
                IFolder outputFolder = this.project.getFolder(outputDir);

                outputFolderName = EclipseResources.getFolderName(outputFolder);
            }

            if (!Strings.isNullOrEmpty(outputFile)) {
                if (outputFolderName == null) {
                    outputFolderName = EclipseResources.getProjectName(this.project);
                }

                compilationSettings.setOutFileOption(outputFolderName + outputFile);
            } else if (outputFolderName != null) {
                compilationSettings.setOutDirOption(outputFolderName);
            }
        }

        Request request = new Request(SERVICE, "setCompilationSettings", compilationSettings);
        this.bridge.call(request, Void.class);
    }

    private final class MyPreferenceChangeListener implements IPreferenceChangeListener, IPropertyChangeListener {
        @Override
        public void preferenceChange(PreferenceChangeEvent event) {
            this.preferenceChanged(event.getKey());
        }

        @Override
        public void propertyChange(PropertyChangeEvent event) {
            this.preferenceChanged(event.getProperty());
        }

        private void preferenceChanged(String name) {
            if (name.equals(IPreferenceConstants.COMPILER_NO_LIB)) {
                boolean noLib = getPreferenceStore().getBoolean(IPreferenceConstants.COMPILER_NO_LIB);

                if (noLib) {
                    removeDefaultLibrary();
                } else {
                    addDefaultLibrary();
                }
            }

            if (IPreferenceConstants.COMPILER_PREFERENCES.contains(name)) {
                updateCompilationSettings();
            }
        }
    }
}
