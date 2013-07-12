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
import java.io.IOException;

import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.IResourceDeltaVisitor;
import org.eclipse.core.runtime.IPath;

import com.google.common.base.Charsets;
import com.google.common.base.Preconditions;
import com.google.common.io.Files;

public final class TypeScriptFileManager implements IResourceDeltaVisitor {

    @Override
    public boolean visit(IResourceDelta delta) {
        Preconditions.checkNotNull(delta);

        IResource resource = delta.getResource();
        if (isFile(resource)) {
            IPath filePath = resource.getRawLocation();
            String fileName = getFileName(filePath);

            if (isTypeScriptFile(fileName)) {
                switch (delta.getKind()) {
                    case IResourceDelta.ADDED:
                        String rootFolder = getFileRootPath(filePath);
                        break;
                    case IResourceDelta.REMOVED:
                        break;
                    case IResourceDelta.CHANGED:
                        String fileLocation = filePath.toString();
                        try {
                            String fileContents = Files.toString(new File(fileLocation), Charsets.UTF_8);

                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                        break;
                }
            }
        }
        return true;
    }

    private static boolean isTypeScriptFile(String fileName) {
        Preconditions.checkNotNull(fileName);

        return fileName.endsWith(".ts");
    }

    private static boolean isFile(IResource res) {
        Preconditions.checkNotNull(res);

        return res.getType() == IResource.FILE;
    }

    private static String getFileName(IPath path) {
        Preconditions.checkNotNull(path);

        return path.lastSegment();
    }

    private static String getFileRootPath(IPath path) {
        Preconditions.checkNotNull(path);

        String rootPath = "";
        for (int i = 0; i < path.segmentCount() - 1; i++) {
            rootPath += "/" + path.segment(i);
        }
        rootPath += "/";
        return rootPath;
    }
}
