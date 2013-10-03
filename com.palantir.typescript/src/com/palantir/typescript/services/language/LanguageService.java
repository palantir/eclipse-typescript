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

import org.eclipse.core.resources.IFolder;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.ProjectScope;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
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
import com.google.common.io.Resources;
import com.palantir.typescript.EclipseResources;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.services.Bridge;
import com.palantir.typescript.services.Request;
import com.palantir.typescript.services.language.FileDelta.Delta;

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
    private final MyPropertyChangeListener preferencesListener;
    private final IProject project;

    public LanguageService(String fileName) {
        this(null, ImmutableList.of(fileName));
    }

    public LanguageService(IProject project) {
        this(project, EclipseResources.getTypeScriptFileNames(project));
    }

    private LanguageService(IProject project, List<String> fileNames) {
        checkNotNull(fileNames);

        this.bridge = new Bridge();
        this.preferencesListener = new MyPropertyChangeListener();
        this.project = project;

        // add the default library unless it has been suppressed
        IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();
        if (!preferenceStore.getBoolean(IPreferenceConstants.COMPILER_NO_LIB)) {
            this.addDefaultLibrary();
        }

        this.addFiles(fileNames);
        this.updateCompilationSettings();

        TypeScriptPlugin.getDefault().getPreferenceStore().addPropertyChangeListener(this.preferencesListener);
    }

    public void dispose() {
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

    public List<Reference> findReferences(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "findReferences", fileName, position);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, Reference.class);
        return this.bridge.call(request, returnType);
    }

    public Map<String, List<CompleteDiagnostic>> getAllDiagnostics() {
        Request request = new Request(SERVICE, "getAllDiagnostics");
        JavaType stringType = TypeFactory.defaultInstance().uncheckedSimpleType(String.class);
        CollectionType diagnosticListType = TypeFactory.defaultInstance().constructCollectionType(List.class, CompleteDiagnostic.class);
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

    public CompletionInfo getCompletionsAtPosition(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getCompletionsAtPosition", fileName, position);
        return this.bridge.call(request, CompletionInfo.class);
    }

    public List<DefinitionInfo> getDefinitionAtPosition(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getDefinitionAtPosition", fileName, position);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, DefinitionInfo.class);
        return this.bridge.call(request, resultType);
    }

    public List<CompleteDiagnostic> getDiagnostics(String fileName) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getDiagnostics", fileName);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, CompleteDiagnostic.class);
        return this.bridge.call(request, resultType);
    }

    public List<String> getEmitOutput(String fileName) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getEmitOutput", fileName);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, String.class);
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

    public List<SpanInfo> getHoistedVariableDeclarators(String fileName) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getHoistedVariableDeclarators", fileName);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, SpanInfo.class);
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

    public List<Diagnostic> getSyntacticDiagnostics(String fileName) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getSyntacticDiagnostics", fileName);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, Diagnostic.class);
        return this.bridge.call(request, returnType);
    }

    public TypeInfo getTypeAtPosition(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getTypeAtPosition", fileName, position);
        return this.bridge.call(request, TypeInfo.class);
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

    private void addFiles(List<String> fileNames) {
        Request request = new Request(SERVICE, "addFiles", fileNames);
        this.bridge.call(request, Void.class);
    }

    private static String getProjectPreference(IProject project, String key) {
        IScopeContext projectScope = new ProjectScope(project);
        IEclipsePreferences projectPreferences = projectScope.getNode(TypeScriptPlugin.ID);

        return projectPreferences.get(key, "");
    }

    private void updateCompilationSettings() {
        IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();

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

        // set the output directory if it was specified
        if (this.project != null) {
            String relativePath = getProjectPreference(this.project, IPreferenceConstants.COMPILER_OUTPUT_DIR_OPTION);

            if (!Strings.isNullOrEmpty(relativePath)) {
                IFolder outputFolder = this.project.getFolder(relativePath);
                String outDir = outputFolder.getRawLocation().toOSString() + "/";

                compilationSettings.setOutDirOption(outDir);
            }
        }

        Request request = new Request(SERVICE, "setCompilationSettings", compilationSettings);
        this.bridge.call(request, Void.class);
    }

    private final class MyPropertyChangeListener implements IPropertyChangeListener {
        @Override
        public void propertyChange(PropertyChangeEvent event) {
            String property = event.getProperty();

            if (property.equals(IPreferenceConstants.COMPILER_NO_LIB)) {
                boolean noLib = (Boolean) event.getNewValue();

                if (noLib) {
                    updateFiles(ImmutableList.of(new FileDelta(Delta.REMOVED, STANDARD_LIBRARY_FILE_NAME)));
                } else {
                    addDefaultLibrary();
                }
            }

            if (IPreferenceConstants.COMPILER_PREFERENCES.contains(property)) {
                updateCompilationSettings();
            }
        }
    }
}
