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
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.IResourceDeltaVisitor;
import org.eclipse.core.resources.IResourceVisitor;
import org.eclipse.core.resources.ProjectScope;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.core.runtime.preferences.IScopeContext;

import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.FileDelta.Delta;

/**
 * Utilities for dealing with Eclipse resources.
 *
 * @author dcicerone
 */
public final class EclipseResources {

    private static final String ECLIPSE_URI_PREFIX = "eclipse:";
    private static final String FILE_URI_PREFIX = "file:";

    public static ImmutableList<FileDelta> getTypeScriptFileDeltas(IResourceDelta delta, IProject project) {
        checkNotNull(delta);
        checkNotNull(project);

        IContainer sourceFolder = getSourceFolder(project);
        MyResourceDeltaVisitor visitor = new MyResourceDeltaVisitor(sourceFolder);

        try {
            delta.accept(visitor);
        } catch (CoreException e) {
            throw new RuntimeException(e);
        }

        return visitor.fileDeltas.build();
    }

    public static ImmutableList<IFile> getTypeScriptFiles(IProject project) {
        checkNotNull(project);

        IContainer sourceFolder = getSourceFolder(project);
        MyResourceVisitor visitor = new MyResourceVisitor();

        try {
            sourceFolder.accept(visitor);
        } catch (CoreException e) {
            throw new RuntimeException(e);
        }

        return visitor.files.build();
    }

    public static boolean isContainedInSourceFolder(IResource resource, IProject project) {
        checkNotNull(resource);
        checkNotNull(project);

        IContainer sourceFolder = getSourceFolder(project);

        return isContainedIn(resource, sourceFolder);
    }

    public static String getFileName(IFile file) {
        checkNotNull(file);

        return ECLIPSE_URI_PREFIX + file.getFullPath().toPortableString();
    }

    public static String getFolderName(IFolder folder) {
        checkNotNull(folder);

        return ECLIPSE_URI_PREFIX + folder.getFullPath().toPortableString() + "/";
    }

    public static String getProjectName(IProject project) {
        checkNotNull(project);

        return ECLIPSE_URI_PREFIX + project.getFullPath().toPortableString() + "/";
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

    private static IContainer getSourceFolder(IProject project) {
        IScopeContext projectScope = new ProjectScope(project);
        IEclipsePreferences projectPreferences = projectScope.getNode(TypeScriptPlugin.ID);
        String sourceFolderName = projectPreferences.get(IPreferenceConstants.BUILD_PATH_SOURCE_FOLDER, "");

        if (!Strings.isNullOrEmpty(sourceFolderName)) {
            IPath relativeSourceFolderPath = Path.fromPortableString(sourceFolderName);

            return project.getFolder(relativeSourceFolderPath);
        } else {
            return project;
        }
    }

    private static boolean isContainedIn(IResource resource, IContainer container) {
        for (IContainer parent = resource.getParent(); parent != null; parent = parent.getParent()) {
            if (parent.equals(container)) {
                return true;
            }
        }

        return false;
    }

    private static boolean isTypeScriptFile(IResource resource) {
        return resource.getType() == IResource.FILE && resource.getName().endsWith(".ts");
    }

    private static final class MyResourceDeltaVisitor implements IResourceDeltaVisitor {

        /*
         * The flags used when the content (or encoding) of a file changes.
         */
        private static final int FLAGS = IResourceDelta.CONTENT | IResourceDelta.ENCODING;

        private final ImmutableList.Builder<FileDelta> fileDeltas;
        private final IContainer sourceFolder;

        public MyResourceDeltaVisitor(IContainer sourceFolder) {
            this.fileDeltas = ImmutableList.builder();
            this.sourceFolder = sourceFolder;
        }

        @Override
        public boolean visit(IResourceDelta delta) throws CoreException {
            IResource resource = delta.getResource();

            // check that the resource is a TypeScript file in the source folder
            if (isTypeScriptFile(resource) && isContainedIn(resource, this.sourceFolder)) {
                Delta deltaEnum = this.getDeltaEnum(delta);

                // check that the delta is a change that impacts the contents (or encoding) of the file
                if (deltaEnum != Delta.CHANGED || (delta.getFlags() & FLAGS) != 0) {
                    FileDelta fileDelta = new FileDelta(deltaEnum, (IFile) resource);

                    this.fileDeltas.add(fileDelta);
                }
            }

            return true;
        }

        private Delta getDeltaEnum(IResourceDelta delta) {
            switch (delta.getKind()) {
                case IResourceDelta.ADDED:
                    return Delta.ADDED;
                case IResourceDelta.CHANGED:
                    return Delta.CHANGED;
                case IResourceDelta.REMOVED:
                    return Delta.REMOVED;
                default:
                    throw new IllegalStateException();
            }
        }
    }

    private static final class MyResourceVisitor implements IResourceVisitor {

        private final ImmutableList.Builder<IFile> files;

        private MyResourceVisitor() {
            this.files = ImmutableList.builder();
        }

        @Override
        public boolean visit(IResource resource) throws CoreException {
            if (isTypeScriptFile(resource)) {
                this.files.add((IFile) resource);
            }

            return true;
        }
    }

    private EclipseResources() {
        // prevent instantiation
    }
}
