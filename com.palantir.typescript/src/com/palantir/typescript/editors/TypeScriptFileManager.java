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

package com.palantir.typescript.editors;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.NoSuchElementException;
import java.util.Scanner;

import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.IResourceDeltaVisitor;
import org.eclipse.core.runtime.IPath;

import com.google.common.base.Preconditions;
import com.palantir.typescript.tsbridge.TypeScriptBridge;

public final class TypeScriptFileManager implements IResourceDeltaVisitor {

    public TypeScriptFileManager() {

    }

    @Override
    public boolean visit(IResourceDelta delta) {
        Preconditions.checkNotNull(delta);

        IResource res = delta.getResource();
        if (isFile(res)) {
            IPath filePath = res.getRawLocation();
            String fileName = getFileName(filePath);
            if (isTypeScriptFile(fileName)) {
                switch (delta.getKind()) {
                    case IResourceDelta.ADDED:
                        String rootFolder = getFileRootPath(filePath);
                        TypeScriptBridge.getBridge().getAutoCompleteService().safeAddFile(fileName, rootFolder);
                        break;
                    case IResourceDelta.REMOVED:
                        TypeScriptBridge.getBridge().getAutoCompleteService().safeRemoveFile(fileName);
                        break;
                    case IResourceDelta.CHANGED:
                        String fileLocation = filePath.toString();
                        String fileContents;
                        try {
                            fileContents = new Scanner(new File(fileLocation)).useDelimiter("\\Z").next();
                        } catch (FileNotFoundException e) {
                            throw new RuntimeException(e);
                        } catch (NoSuchElementException e) {
                            throw new RuntimeException(e);
                        }
                        TypeScriptBridge.getBridge().getAutoCompleteService().safeUpdateFile(fileName, fileContents);
                        break;
                }
            }
        }
        return true;
    }

    private boolean isTypeScriptFile(String fileName) {
        Preconditions.checkNotNull(fileName);

        return fileName.endsWith(".ts");
    }

    private boolean isFile(IResource res) {
        Preconditions.checkNotNull(res);

        return res.getType() == IResource.FILE;
    }

    private String getFileName(IPath path) {
        Preconditions.checkNotNull(path);

        return path.lastSegment();
    }

    private String getFileRootPath(IPath path) {
        Preconditions.checkNotNull(path);

        String rootPath = "";
        for (int i = 0; i < path.segmentCount() - 1; i++) {
            rootPath += "/" + path.segment(i);
        }
        rootPath += "/";
        return rootPath;
    }
}
