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

import static com.google.common.base.Preconditions.checkNotNull;

import java.io.IOException;
import java.net.URL;
import java.util.List;
import java.util.Map;

import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IProject;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.databind.type.MapType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.Resources;
import com.palantir.typescript.EclipseResources;
import com.palantir.typescript.services.Bridge;
import com.palantir.typescript.services.Request;

/**
 * The workspace language service.
 *
 * @author dcicerone
 */
public final class WorkspaceLanguageService {

    private static final String LIB_FILE_NAME = "lib.d.ts";
    private static final String SERVICE = "workspaceLanguage";

    private final Bridge bridge;

    public WorkspaceLanguageService() {
        this.bridge = new Bridge();

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

        String projectName = project.getName();
        CompilationSettings compilationSettings = CompilationSettings.fromProject(project);
        Map<String, String> files = getFiles(project);
        Request request = new Request(SERVICE, "initializeProject", projectName, compilationSettings, files);
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

    public void updateFiles(List<FileDelta> fileDeltas) {
        checkNotNull(fileDeltas);

        if (!fileDeltas.isEmpty()) {
            Request request = new Request(SERVICE, "updateFiles", fileDeltas);

            this.bridge.call(request, Void.class);
        }
    }

    public void dispose() {
        this.bridge.dispose();
    }

    private static Map<String, String> getFiles(IProject project) {
        ImmutableMap.Builder<String, String> files = ImmutableMap.builder();

        ImmutableList<IFile> typeScriptFiles = EclipseResources.getTypeScriptFiles(project);
        for (IFile typeScriptFile : typeScriptFiles) {
            String fileName = EclipseResources.getFileName(typeScriptFile);
            String filePath = EclipseResources.getFilePath(typeScriptFile);

            files.put(fileName, filePath);
        }

        return files.build();
    }

    private static String readLibContents() {
        URL libUrl = LanguageService.class.getResource(LIB_FILE_NAME);

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
