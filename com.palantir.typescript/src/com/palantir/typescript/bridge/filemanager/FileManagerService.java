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

package com.palantir.typescript.bridge.filemanager;

import java.io.File;
import java.util.List;

import org.eclipse.core.resources.ResourcesPlugin;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.palantir.typescript.bridge.TypeScriptBridge;

/**
 * This Eclipse Service handles managing files in the TypeScript language service (host).
 *
 * @author tyleradams
 */
public final class FileManagerService {

    private final TypeScriptBridge typeScriptBridge;

    public FileManagerService(TypeScriptBridge typeScriptBridge) {
        Preconditions.checkNotNull(typeScriptBridge);

        this.typeScriptBridge = typeScriptBridge;
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
            this.typeScriptBridge.sendRequest(new LoadFilesRequest(firstFiles), Boolean.class);
            return this.addFilesToWorkspace(files.subList(lineBunchSize, files.size()));
        } else {
            return this.typeScriptBridge.sendRequest(new LoadFilesRequest(files), Boolean.class);
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

        return this.typeScriptBridge.sendRequest(new RemoveFilesRequest(files), Boolean.class);
    }

    public boolean updateFile(String file, String content) {
        Preconditions.checkNotNull(file);
        Preconditions.checkNotNull(content);

        return this.typeScriptBridge.sendRequest(new UpdateFileRequest(file, content), Boolean.class);
    }

    public boolean updateSavedFile(String file) {
        Preconditions.checkNotNull(file);

        return this.typeScriptBridge.sendRequest(new UpdateSavedFileRequest(file), Boolean.class);
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
        File workspace = ResourcesPlugin.getWorkspace().getRoot().getLocation().toFile();
        this.addFolderToWorkspace(workspace);
    }
}
