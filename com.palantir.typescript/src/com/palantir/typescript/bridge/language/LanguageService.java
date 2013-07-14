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

package com.palantir.typescript.bridge.language;

import java.io.File;
import java.util.List;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.ResourcesPlugin;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.palantir.typescript.bridge.Request;
import com.palantir.typescript.bridge.TypeScriptBridge;

/**
 * The language service.
 * <p>
 * This service provides autocompletion, formatting, compiling, etc...
 *
 * @author tyleradams
 */
public final class LanguageService {

    private static final String SERVICE = "language service";

    private final TypeScriptBridge typeScriptBridge;

    public LanguageService(TypeScriptBridge typeScriptBridge) {
        Preconditions.checkNotNull(typeScriptBridge);

        this.typeScriptBridge = typeScriptBridge;
    }

    public AutoCompleteResult autoComplete(String file, int offset, String contents) {
        Preconditions.checkNotNull(file);
        Preconditions.checkArgument(offset >= 0);
        Preconditions.checkNotNull(contents);

        Request request = new Request(SERVICE, "getCompletionsAtPosition", file, offset, contents);
        DetailedAutoCompletionInfo autoCompletionInfo = this.typeScriptBridge.sendRequest(request, DetailedAutoCompletionInfo.class);
        return new AutoCompleteResult(autoCompletionInfo);
    }

    public boolean addFileToWorkspace(String file) {
        Preconditions.checkNotNull(file);

        return this.addFilesToWorkspace(ImmutableList.of(file));
    }

    public boolean addFilesToWorkspace(List<String> files) {
        Preconditions.checkNotNull(files);

        if (files.isEmpty()) {
            return true;
        }

        int lineBunchSize = 20;
        if (files.size() > lineBunchSize) {
            List<String> firstFiles = files.subList(0, lineBunchSize);
            Request request = new Request(SERVICE, "loadFiles", firstFiles);

            this.typeScriptBridge.sendRequest(request, Boolean.class);

            return this.addFilesToWorkspace(files.subList(lineBunchSize, files.size()));
        } else {
            Request request = new Request(SERVICE, "loadFiles", files);

            return this.typeScriptBridge.sendRequest(request, Boolean.class);
        }
    }

    public boolean removeFileFromWorkspace(String file) {
        Preconditions.checkNotNull(file);

        return this.removeFilesFromWorkspace(ImmutableList.of(file));
    }

    public boolean removeFilesFromWorkspace(List<String> files) {
        Preconditions.checkNotNull(files);

        if (files.isEmpty()) {
            return true;
        }

        Request request = new Request(SERVICE, "removeFiles", files);

        return this.typeScriptBridge.sendRequest(request, Boolean.class);
    }

    public boolean updateFile(String file, String content) {
        Preconditions.checkNotNull(file);
        Preconditions.checkNotNull(content);

        Request request = new Request(SERVICE, "updateFile", file, content);

        return this.typeScriptBridge.sendRequest(request, Boolean.class);
    }

    public boolean updateSavedFile(String file) {
        Preconditions.checkNotNull(file);

        Request request = new Request(SERVICE, "updateSavedFile", file);

        return this.typeScriptBridge.sendRequest(request, Boolean.class);
    }

    public boolean addFolderToWorkspace(String folder) {
        Preconditions.checkNotNull(folder);

        return addFolderToWorkspace(new File(folder));
    }

    public boolean addFolderToWorkspace(File directory) {
        Preconditions.checkNotNull(directory);

        List<File> files = Lists.newArrayList(directory.listFiles());
        List<String> fileNames = Lists.newArrayList();

        for (File file : files) {
            if (file.isDirectory()) {
                this.addFolderToWorkspace(file);
            } else if (file.isFile() && file.getName().endsWith(".ts")) {
                fileNames.add(file.getAbsolutePath());
            }
        }

        return this.addFilesToWorkspace(fileNames);
    }

    public void intializeWorkspace() {
        List<IProject> projects = Lists.newArrayList(ResourcesPlugin.getWorkspace().getRoot().getProjects());
        for (IProject project : projects) {
            this.addFolderToWorkspace(project.getRawLocation().toOSString());
        }
    }
}
