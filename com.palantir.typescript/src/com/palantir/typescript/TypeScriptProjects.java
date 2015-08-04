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

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.Collections;
import java.util.List;
import java.util.Set;

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

import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import com.google.common.collect.Sets;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.FileDelta.Delta;

/**
 * Utilities for dealing with TypeScript projects.
 *
 * @author dcicerone
 */
public final class TypeScriptProjects {

    private static final Splitter PATH_SPLITTER = Splitter.on(';');

    public enum Folders {
        EXPORTED,
        SOURCE,
        SOURCE_AND_EXPORTED
    }

    public static Set<IFile> getFiles(IProject project, Folders folders) {
        checkNotNull(folders);
        checkNotNull(project);

        Set<IFile> files = Sets.newHashSet();

        List<IContainer> containers = getContainers(project, folders);
        for (IContainer container : containers) {
            if (container.exists()) {
                MyResourceVisitor visitor = new MyResourceVisitor();

                try {
                    container.accept(visitor);
                } catch (CoreException e) {
                    throw new RuntimeException(e);
                }

                files.addAll(visitor.files.build());
            }
        }

        return Collections.unmodifiableSet(files);
    }

    public static Set<FileDelta> getFileDeltas(Folders folders, IResourceDelta delta) {
        checkNotNull(delta);
        checkNotNull(folders);

        Set<FileDelta> fileDeltas = Sets.newHashSet();

        for (IProject project : ResourcesPlugin.getWorkspace().getRoot().getProjects()) {
            fileDeltas.addAll(getFileDeltas(project, folders, delta));
        }

        return Collections.unmodifiableSet(fileDeltas);
    }

    public static Set<FileDelta> getFileDeltas(IProject project, Folders folders, IResourceDelta delta) {
        checkNotNull(delta);
        checkNotNull(folders);
        checkNotNull(project);

        Set<FileDelta> fileDeltas = Sets.newHashSet();

        List<IContainer> containers = getContainers(project, folders);
        for (IContainer container : containers) {
            MyResourceDeltaVisitor visitor = new MyResourceDeltaVisitor(container);

            try {
                delta.accept(visitor);
            } catch (CoreException e) {
                throw new RuntimeException(e);
            }

            fileDeltas.addAll(visitor.fileDeltas.build());
        }

        return Collections.unmodifiableSet(fileDeltas);
    }

    public static List<String> getFolderNames(IProject project, Folders folders) {
        checkNotNull(project);
        checkNotNull(folders);

        ImmutableList.Builder<String> folderNames = ImmutableList.builder();

        List<IContainer> containers = getContainers(project, folders);
        for (IContainer container : containers) {
            folderNames.add(EclipseResources.getContainerName(container));
        }

        return folderNames.build();
    }

    public static IContainer getOutputFolder(IProject project) {
        checkNotNull(project);

        return Iterables.getFirst(getFoldersFromPreference(project, IPreferenceConstants.COMPILER_OUT_DIR), null);
    }

    // see Bridge/typescript/src/compiler/emitter.ts, EmitOptions.determineCommonDirectoryPath
    public static IPath getCommonSourcePath(IProject project) {
        checkNotNull(project);

        // the same set of files that are passed to the builder language endpoint
        Set<IFile> sourceFiles = getFiles(project, Folders.SOURCE);

        IPath commonDirectoryPath = null;
        for (IFile sourceFile : sourceFiles) {
            if (!sourceFile.getName().endsWith(".d.ts")) {
                if (commonDirectoryPath == null) {
                    commonDirectoryPath = sourceFile.getFullPath().removeLastSegments(1);
                } else {
                    int numCommonSegments = commonDirectoryPath.matchingFirstSegments(sourceFile.getFullPath());
                    commonDirectoryPath = commonDirectoryPath.uptoSegment(numCommonSegments);
                }
            }
        }

        return commonDirectoryPath;
    }

    public static boolean isContainedInFolders(IProject project, Folders folders, IResource resource) {
        checkNotNull(folders);
        checkNotNull(project);
        checkNotNull(resource);

        if (TypeScriptBuilder.isConfigured(project)) {
            List<IContainer> containers = getContainers(project, folders);

            for (IContainer container : containers) {
                if (isContainedIn(resource, container)) {
                    return true;
                }
            }
        }

        return false;
    }

    private static List<IContainer> getContainers(IProject project, Folders folders) {
        checkNotNull(project);
        checkNotNull(folders);

        ImmutableList.Builder<IContainer> containers = ImmutableList.builder();

        boolean addExported = (folders == Folders.EXPORTED || folders == Folders.SOURCE_AND_EXPORTED);
        boolean addSource = (folders == Folders.SOURCE || folders == Folders.SOURCE_AND_EXPORTED);

        if (addExported) {
            containers.addAll(getFoldersFromPreference(project, IPreferenceConstants.BUILD_PATH_EXPORTED_FOLDER));
        }

        if (addSource) {
            List<IContainer> sourceFolders = getFoldersFromPreference(project, IPreferenceConstants.BUILD_PATH_SOURCE_FOLDER);

            // if no source folders are explicitly set, return the entire project
            if (sourceFolders.isEmpty()) {
                sourceFolders = ImmutableList.<IContainer> of(project);
            }

            containers.addAll(sourceFolders);
        }

        return containers.build();
    }

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
            return ImmutableList.of();
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
        // needs to be a file
        if (resource.getType() != IResource.FILE) {
            return false;
        }

        // needs to have a .ts or .tsx extension
        String resourceName = resource.getName();
        return resourceName.endsWith(".ts") || resourceName.endsWith(".tsx");
    }

    private static final class MyResourceDeltaVisitor implements IResourceDeltaVisitor {

        /*
         * The flags used when the content (or encoding) of a file changes.
         */
        private static final int FLAGS = IResourceDelta.CONTENT | IResourceDelta.ENCODING;

        private final ImmutableList.Builder<FileDelta> fileDeltas;
        private final IContainer container;

        public MyResourceDeltaVisitor(IContainer container) {
            this.fileDeltas = ImmutableList.builder();
            this.container = container;
        }

        @Override
        public boolean visit(IResourceDelta delta) throws CoreException {
            IResource resource = delta.getResource();

            // check that the resource is a TypeScript file in the source folder
            if (isTypeScriptFile(resource) && isContainedIn(resource, this.container)) {
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

    private TypeScriptProjects() {
        // prevent instantiation
    }
}
