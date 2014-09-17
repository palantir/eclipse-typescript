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

package com.palantir.typescript;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import java.net.URI;

import org.eclipse.core.filesystem.EFS;
import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.filesystem.IFileSystem;
import org.eclipse.core.resources.IContainer;
import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IFolder;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.Path;

/**
 * Utilities for dealing with Eclipse resources.
 *
 * @author dcicerone
 */
public final class EclipseResources {

    private static final String ECLIPSE_URI_PREFIX = "eclipse:";
    private static final String FILE_URI_PREFIX = "file:";

    public static void createParentDirs(IFolder folder, IProgressMonitor monitor) throws CoreException {
        checkNotNull(folder);

        if (!folder.exists()) {
            IContainer parent = folder.getParent();

            // create the parent folder (if necessary)
            if (parent instanceof IFolder) {
                createParentDirs((IFolder) parent, monitor);
            }

            folder.create(true, true, monitor);
        }
    }

    public static String getFileName(IFile file) {
        checkNotNull(file);

        return ECLIPSE_URI_PREFIX + file.getFullPath().toPortableString();
    }

    public static String getContainerName(IContainer container) {
        checkNotNull(container);

        return ECLIPSE_URI_PREFIX + container.getFullPath().toPortableString() + "/";
    }

    public static String getFilePath(IFile file) {
        checkNotNull(file);

        return file.getRawLocation().toOSString();
    }

    public static boolean isEclipseFile(String fileName) {
        checkNotNull(fileName);

        return fileName.startsWith(ECLIPSE_URI_PREFIX);
    }

    public static IFile getFile(String fileName) {
        checkNotNull(fileName);
        checkArgument(fileName.startsWith(ECLIPSE_URI_PREFIX));

        String portableString = fileName.substring(ECLIPSE_URI_PREFIX.length());
        IPath path = Path.fromPortableString(portableString);

        return ResourcesPlugin.getWorkspace().getRoot().getFile(path);
    }

    public static IFileStore getFileStore(String fileName) {
        checkNotNull(fileName);

        IFileSystem localFileSystem = EFS.getLocalFileSystem();

        if (fileName.startsWith(ECLIPSE_URI_PREFIX)) {
            IFile file = getFile(fileName);
            IPath rawLocation = file.getRawLocation();

            return localFileSystem.getStore(rawLocation);
        } else if (fileName.startsWith(FILE_URI_PREFIX)) {
            URI uri = URI.create(fileName);

            return localFileSystem.getStore(uri);
        }

        throw new IllegalStateException();
    }

    private EclipseResources() {
        // prevent instantiation
    }
}
