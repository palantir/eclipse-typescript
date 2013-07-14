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

import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.IResourceDeltaVisitor;
import org.eclipse.core.runtime.IPath;

import com.google.common.base.Preconditions;
import com.palantir.typescript.Activator;

public final class TypeScriptFileManager implements IResourceDeltaVisitor {

    @Override
    public boolean visit(IResourceDelta delta) {
        Preconditions.checkNotNull(delta);

        IResource resource = delta.getResource();
        if (isFile(resource)) {
            IPath filePath = resource.getRawLocation();
            String file = filePath.toOSString();

            if (isTypeScriptFile(file)) {
                switch (delta.getKind()) {
                    case IResourceDelta.ADDED:
                        Activator.getBridge().getLanguageService().addFileToWorkspace(file);
                        break;
                    case IResourceDelta.REMOVED:
                        Activator.getBridge().getLanguageService().removeFileFromWorkspace(file);
                        break;
                    case IResourceDelta.CHANGED:
                        Activator.getBridge().getLanguageService().updateSavedFile(file);
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
}
