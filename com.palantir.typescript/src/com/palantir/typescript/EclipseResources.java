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
import java.util.List;

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
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.Path;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.core.runtime.preferences.IScopeContext;

import com.google.common.base.Splitter;
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
    private static final Splitter PATH_SPLITTER = Splitter.on(';');

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

    public static ImmutableList<FileDelta> getTypeScriptFileDeltas(IResourceDelta delta, IProject project) {
        checkNotNull(delta);
        checkNotNull(project);

        List<IContainer> sourceFolders = getSourceFolders(project);
        ImmutableList.Builder<FileDelta> fileDeltas = ImmutableList.builder();

        for (IContainer sourceFolder : sourceFolders) {
            MyResourceDeltaVisitor visitor = new MyResourceDeltaVisitor(sourceFolder);

            try {
                delta.accept(visitor);
            } catch (CoreException e) {
                throw new RuntimeException(e);
            }

            fileDeltas.addAll(visitor.fileDeltas.build());
        }

        return fileDeltas.build();
    }

    public static ImmutableList<FileDelta> getTypeScriptFileDeltas(IResourceDelta delta) {
        checkNotNull(delta);

        ImmutableList.Builder<FileDelta> fileDeltas = ImmutableList.builder();
        for (IProject project : ResourcesPlugin.getWorkspace().getRoot().getProjects()) {
            List<IContainer> sourceFolders = getSourceFolders(project);

            for (IContainer sourceFolder : sourceFolders) {
                MyResourceDeltaVisitor visitor = new MyResourceDeltaVisitor(sourceFolder);

                try {
                    delta.accept(visitor);
                } catch (CoreException e) {
                    throw new RuntimeException(e);
                }

                fileDeltas.addAll(visitor.fileDeltas.build());
            }
        }

        return fileDeltas.build();
    }

    public static ImmutableList<IFile> getTypeScriptFiles(IProject project) {
        checkNotNull(project);

        List<IContainer> sourceFolders = getSourceFolders(project);
        ImmutableList.Builder<IFile> typeScriptFiles = ImmutableList.builder();

        for (IContainer sourceFolder : sourceFolders) {
            MyResourceVisitor visitor = new MyResourceVisitor();

            try {
                sourceFolder.accept(visitor);
            } catch (CoreException e) {
                throw new RuntimeException(e);
            }

            typeScriptFiles.addAll(visitor.files.build());
        }

        return typeScriptFiles.build();
    }

    public static boolean isContainedInSourceFolder(IResource resource, IProject project) {
        checkNotNull(resource);
        checkNotNull(project);

        if (TypeScriptBuilder.isConfigured(project)) {
            List<IContainer> sourceFolders = getSourceFolders(project);

            for (IContainer sourceFolder : sourceFolders) {
                if (isContainedIn(resource, sourceFolder)) {
                    return true;
                }
            }
        }

        return false;
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

    private static List<IContainer> getSourceFolders(IProject project) {
        return getFoldersFromPreference(project, IPreferenceConstants.BUILD_PATH_SOURCE_FOLDER);
    }

    public static List<IContainer> getExportedFolders(IProject project) {
        return getFoldersFromPreference(project, IPreferenceConstants.BUILD_PATH_EXPORTED_FOLDER);
    }

    /**
     * Gets folders within a project, or the project itself if folders is empty or null.
     * @param project the project containing the subfolders
     * @param folderNames a semicolon-separated list of folders
     * @return a list of containers: either the folders specified, or the project itself
     */
    private static List<IContainer> getFoldersFromPreference(IProject project, String preferenceId) {
        IScopeContext projectScope = new ProjectScope(project);
        IEclipsePreferences projectPreferences = projectScope.getNode(TypeScriptPlugin.ID);
        String folderNames = projectPreferences.get(preferenceId, "");
        if (!Strings.isNullOrEmpty(folderNames)) {
            ImmutableList.Builder<IContainer> folders = ImmutableList.builder();

            for (String folderName : PATH_SPLITTER.splitToList(folderNames)) {
                IPath relativeFolderPath = Path.fromPortableString(folderName);
                IFolder folder = project.getFolder(relativeFolderPath);

                folders.add(folder);
            }

            return folders.build();
        } else {
            return ImmutableList.<IContainer> of(project);
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
