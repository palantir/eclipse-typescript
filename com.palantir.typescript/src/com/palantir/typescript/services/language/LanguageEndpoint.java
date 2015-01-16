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
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.runtime.CoreException;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.databind.type.MapType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Sets;
import com.google.common.io.Resources;
import com.palantir.typescript.EclipseResources;
import com.palantir.typescript.TypeScriptProjects;
import com.palantir.typescript.TypeScriptProjects.Folders;
import com.palantir.typescript.services.Bridge;
import com.palantir.typescript.services.Request;

/**
 * The workspace language endpoint.
 *
 * @author dcicerone
 */
public final class LanguageEndpoint {

    private static final String LIB_FILE_NAME = "lib.d.ts";
    private static final String SERVICE = "language";

    private final Bridge bridge;

    public LanguageEndpoint(String endpointName) {
        this.bridge = new Bridge(endpointName);

        this.setLibContents();
    }

    public void cleanProject(IProject project) {
        checkNotNull(project);

        String projectName = project.getName();
        Request request = new Request(SERVICE, "cleanProject", projectName);
        this.bridge.call(request, Void.class);
    }

    public void initializeProject(IProject project) {
        checkNotNull(project);

        this.initializeProjectTree(project, Sets.<IProject> newHashSet());
    }

    public boolean isProjectInitialized(IProject project) {
        checkNotNull(project);

        String projectName = project.getName();
        Request request = new Request(SERVICE, "isProjectInitialized", projectName);
        return this.bridge.call(request, Boolean.class);
    }

    public void initializeIsolatedLanguageService(String serviceKey, String fileName, String fileContents) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);
        checkNotNull(fileContents);

        Request request = new Request(SERVICE, "initializeIsolatedLanguageService", serviceKey, fileName, fileContents);
        this.bridge.call(request, Void.class);
    }

    public void closeIsolatedLanguageService(String serviceKey, String fileName) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "closeIsolatedLanguageService", serviceKey, fileName);
        this.bridge.call(request, Void.class);
    }

    public Map<String, List<DiagnosticEx>> getAllDiagnostics(IProject project) {
        checkNotNull(project);

        String projectName = project.getName();
        Request request = new Request(SERVICE, "getAllDiagnostics", projectName);
        JavaType stringType = TypeFactory.defaultInstance().uncheckedSimpleType(String.class);
        CollectionType diagnosticListType = TypeFactory.defaultInstance().constructCollectionType(List.class, DiagnosticEx.class);
        MapType returnType = TypeFactory.defaultInstance().constructMapType(Map.class, stringType, diagnosticListType);
        return this.bridge.call(request, returnType);
    }

    public List<OutputFile> getEmitOutput(IProject project, String fileName) {
        checkNotNull(fileName);

        String projectName = project.getName();
        Request request = new Request(SERVICE, "getEmitOutput", projectName, fileName);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, OutputFile.class);
        return this.bridge.call(request, resultType);
    }

    public void editFile(String fileName, int offset, int length, String replacementText) {
        checkNotNull(fileName);
        checkArgument(offset >= 0);
        checkArgument(length >= 0);
        checkNotNull(replacementText);

        Request request = new Request(SERVICE, "editFile", fileName, offset, length, replacementText);
        this.bridge.call(request, Void.class);
    }

    public List<ReferenceEntryEx> findReferences(String serviceKey, String fileName, int position) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "findReferences", serviceKey, fileName, position);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, ReferenceEntryEx.class);
        return this.bridge.call(request, returnType);
    }

    public List<RenameLocation> findRenameLocations(String serviceKey, String fileName, int position, boolean findInStrings,
            boolean findInComments) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "findRenameLocations", serviceKey, fileName, position, findInStrings, findInComments);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, ReferenceEntry.class);
        return this.bridge.call(request, returnType);
    }

    public List<TextSpan> getBraceMatchingAtPosition(String serviceKey, String fileName, int position) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getBraceMatchingAtPosition", serviceKey, fileName, position);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, TextSpan.class);
        return this.bridge.call(request, resultType);
    }

    public CompletionInfoEx getCompletionsAtPosition(String serviceKey, String fileName, int position) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getCompletionsAtPosition", serviceKey, fileName, position);
        return this.bridge.call(request, CompletionInfoEx.class);
    }

    public List<DefinitionInfo> getDefinitionAtPosition(String serviceKey, String fileName, int position) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getDefinitionAtPosition", serviceKey, fileName, position);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, DefinitionInfo.class);
        return this.bridge.call(request, resultType);
    }

    public List<DiagnosticEx> getDiagnostics(String serviceKey, String fileName, boolean semantic) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getDiagnostics", serviceKey, fileName, semantic);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, DiagnosticEx.class);
        return this.bridge.call(request, resultType);
    }

    public List<TextChange> getFormattingEditsForRange(String serviceKey, String fileName, int start, int end, FormatCodeOptions options) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);
        checkArgument(start >= 0);
        checkArgument(end >= 0);
        checkNotNull(options);

        Request request = new Request(SERVICE, "getFormattingEditsForRange", serviceKey, fileName, start, end, options);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, TextChange.class);
        return this.bridge.call(request, resultType);
    }

    public int getIndentationAtPosition(String serviceKey, String fileName, int position, EditorOptions options) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);
        checkArgument(position >= 0);
        checkNotNull(options);

        Request request = new Request(SERVICE, "getIndentationAtPosition", serviceKey, fileName, position, options);
        return this.bridge.call(request, Integer.class);
    }

    public TextSpan getNameOrDottedNameSpan(String serviceKey, String fileName, int startPos, int endPos) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);
        checkArgument(startPos >= 0);
        checkArgument(endPos >= 0);

        Request request = new Request(SERVICE, "getNameOrDottedNameSpan", serviceKey, fileName, startPos, endPos);
        return this.bridge.call(request, TextSpan.class);
    }

    public List<NavigationBarItem> getNavigationBarItems(String serviceKey, String fileName) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getNavigationBarItems", serviceKey, fileName);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, NavigationBarItem.class);
        return this.bridge.call(request, returnType);
    }

    public List<ReferenceEntry> getOccurrencesAtPosition(String serviceKey, String fileName, int position) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getOccurrencesAtPosition", serviceKey, fileName, position);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, ReferenceEntry.class);
        return this.bridge.call(request, returnType);
    }

    public QuickInfo getQuickInfoAtPosition(String serviceKey, String fileName, int position) {
        checkNotNull(serviceKey);
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getQuickInfoAtPosition", serviceKey, fileName, position);
        return this.bridge.call(request, QuickInfo.class);
    }

    public void setFileOpen(String fileName, boolean open) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "setFileOpen", fileName, open);
        this.bridge.call(request, Void.class);
    }

    public void updateFiles(Set<FileDelta> fileDeltas) {
        checkNotNull(fileDeltas);

        if (!fileDeltas.isEmpty()) {
            Request request = new Request(SERVICE, "updateFiles", fileDeltas);

            this.bridge.call(request, Void.class);
        }
    }

    public void dispose() {
        this.bridge.dispose();
    }

    private void initializeProjectTree(IProject project, Set<IProject> initializedProjects) {
        // initialize referenced projects first (unless there is a circular dependency)
        try {
            for (IProject referencedProject : project.getReferencedProjects()) {
                if (initializedProjects.add(referencedProject)) {
                    this.initializeProjectTree(referencedProject, initializedProjects);
                }
            }
        } catch (CoreException e) {
            throw new RuntimeException(e);
        }

        // initialize the project if it has not already been initialized
        if (!isProjectInitialized(project)) {
            String projectName = project.getName();
            CompilerOptions compilationSettings = CompilerOptions.fromProject(project);
            List<String> referencedProjectNames = getReferencedProjectNames(project);
            List<String> exportedFolderNames = TypeScriptProjects.getFolderNames(project, Folders.EXPORTED);
            List<String> sourceFolderNames = TypeScriptProjects.getFolderNames(project, Folders.SOURCE);
            Map<String, String> files = getFiles(project);
            Request request = new Request(SERVICE, "initializeProject", projectName, compilationSettings, referencedProjectNames,
                exportedFolderNames, sourceFolderNames, files);
            this.bridge.call(request, Void.class);
        }
    }

    private static Map<String, String> getFiles(IProject project) {
        ImmutableMap.Builder<String, String> files = ImmutableMap.builder();

        Set<IFile> typeScriptFiles = TypeScriptProjects.getFiles(project, Folders.SOURCE_AND_EXPORTED);
        for (IFile typeScriptFile : typeScriptFiles) {
            String fileName = EclipseResources.getFileName(typeScriptFile);
            String filePath = EclipseResources.getFilePath(typeScriptFile);

            files.put(fileName, filePath);
        }

        return files.build();
    }

    private static List<String> getReferencedProjectNames(IProject project) {
        ImmutableList.Builder<String> referencedProjectNames = ImmutableList.builder();

        try {
            for (IProject referencedProject : project.getReferencedProjects()) {
                referencedProjectNames.add(referencedProject.getName());
            }
        } catch (CoreException e) {
            throw new RuntimeException(e);
        }

        return referencedProjectNames.build();
    }

    private static String readLibContents() {
        URL libUrl = LanguageEndpoint.class.getResource(LIB_FILE_NAME);

        try {
            return Resources.toString(libUrl, Charsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void setLibContents() {
        String libContents = readLibContents();
        Request request = new Request(SERVICE, "setLibContents", libContents);
        this.bridge.call(request, Void.class);
    }

}
