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
import static com.palantir.typescript.TypeScriptPlugin.logInfo;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import org.eclipse.core.resources.IContainer;
import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.IResourceDeltaVisitor;
import org.eclipse.core.resources.IResourceVisitor;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.palantir.typescript.preferences.ProjectPreferenceStore;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.FileDelta.Delta;

/**
 * Utilities for dealing with TypeScript projects.
 *
 * @author dcicerone
 * @author lgrignon
 */
public final class TypeScriptProjects {

    public static final char BUILD_PATH_SPEC_SEPARATOR = ';';

    private static final Splitter PATH_SPLITTER = Splitter.on(BUILD_PATH_SPEC_SEPARATOR);

    public enum Folders {
        EXPORTED, SOURCE, SOURCE_AND_EXPORTED
    }

    public static Set<IFile> getFiles(IProject project, Folders folders) {
        checkNotNull(folders);
        checkNotNull(project);

        TypeScriptProjectSources projectSources = new TypeScriptProjectSources(project, folders);

        return Collections.unmodifiableSet(projectSources.getAllSourceFiles());
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

        TypeScriptProjectSources projectSources = new TypeScriptProjectSources(project, folders);
        return Collections.unmodifiableSet(projectSources.getDeltas(delta));
    }

    public static IContainer getOutputFolder(IProject project) {
        checkNotNull(project);

        ProjectPreferenceStore projectPreferences = new ProjectPreferenceStore(project);
        String outFolderPath = projectPreferences.getString(IPreferenceConstants.COMPILER_OUT_DIR);
        IContainer outFolder = null;
        if (!Strings.isNullOrEmpty(outFolderPath)) {
            IPath relativeFolderPath = Path.fromPortableString(outFolderPath);
            outFolder = project.getFolder(relativeFolderPath);
        }

        return outFolder;
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

    public static boolean isSourceFile(IResource resource, IProject project) {

        TypeScriptProjectSources projectSources = new TypeScriptProjectSources(project, Folders.SOURCE);

        return projectSources.getAllSourceFiles().contains(resource);
    }

    private static class TypeScriptProjectSources {

        private static final class SourcesSpecs {
            private final List<String> files;
            private final List<String> include;
            private final List<String> exclude;

            private SourcesSpecs(List<String> files, List<String> include, List<String> exclude) {
                this.files = files;
                this.include = include;
                this.exclude = exclude;
            }

            @Override
            public String toString() {
                return files.size() + " files - include=" + include + " exclude=" + exclude;
            }
        }

        private IProject project;
        private Folders type;

        TypeScriptProjectSources(IProject project, Folders type) {
            this.project = project;
            this.type = type;
        }

        public Set<FileDelta> getDeltas(IResourceDelta delta) {
            Set<FileDelta> fileDeltas = Sets.newHashSet();

            TypeScriptSourcesDeltaVisitor visitor = new TypeScriptSourcesDeltaVisitor(getAllSourceFiles());
            try {
                delta.accept(visitor);
            } catch (CoreException e) {
                throw new RuntimeException(e);
            }

            fileDeltas.addAll(visitor.fileDeltas.build());

            return Collections.unmodifiableSet(fileDeltas);
        }

        public Set<IFile> getAllSourceFiles() {
            SourcesSpecs sourcesSpecs = getSourcesSpecs();

            logInfo("get all source files - folders=" + type + " specs=" + sourcesSpecs);

            List<IResource> excludeList = getResourcesFromSpecs(sourcesSpecs.exclude, project);
            List<IResource> sourcesList = Lists.newLinkedList();
            sourcesList.addAll(getResourcesFromSpecs(sourcesSpecs.files, project));
            sourcesList.addAll(getResourcesFromSpecs(sourcesSpecs.include, project));
            if (sourcesList.isEmpty()) {
                sourcesList = ImmutableList.<IResource> of(project);
            }

            Set<IFile> allSourceFiles = Sets.newHashSet();
            for (IResource resource : sourcesList) {
                collectSourceFiles(resource, excludeList, allSourceFiles);
            }

            logInfo("> found " + allSourceFiles.size() + " source files");

            return allSourceFiles;
        }

        private void collectSourceFiles(IResource resource, List<IResource> excludeList, Set<IFile> allSourceFiles) {
            if (resource.exists() && !isExcluded(resource, excludeList)) {
                logInfo("adding " + resource.getProjectRelativePath() + " to sources");
                if (resource instanceof IFile) {
                    allSourceFiles.add((IFile) resource);
                } else if (resource instanceof IContainer) {

                    TypeScriptFilesCollectorVisitor visitor = new TypeScriptFilesCollectorVisitor();
                    try {
                        resource.accept(visitor);
                    } catch (CoreException e) {
                        throw new RuntimeException(e);
                    }

                    allSourceFiles.addAll(visitor.files.build());
                }
            }
        }

        private boolean isExcluded(IResource fileOrFolder, List<IResource> excludeList) {
            if (excludeList.contains(fileOrFolder)) {
                return true;
            }

            IResource parent = fileOrFolder;
            while ((parent = parent.getParent()) != null) {
                if (excludeList.contains(parent)) {
                    return true;
                }
            }

            return false;
        }

        private SourcesSpecs getSourcesSpecs() {
            ProjectPreferenceStore preferencesStore = new ProjectPreferenceStore(project);

            boolean addExported = (type == Folders.EXPORTED || type == Folders.SOURCE_AND_EXPORTED);
            boolean addSource = (type == Folders.SOURCE || type == Folders.SOURCE_AND_EXPORTED);

            List<String> files = Lists.newLinkedList();
            if (addExported) {
                files.addAll(PATH_SPLITTER.splitToList(preferencesStore.getString(IPreferenceConstants.BUILD_PATH_EXPORTED_FOLDER)));
            }

            if (addSource) {
                files.addAll(PATH_SPLITTER.splitToList(preferencesStore.getString(IPreferenceConstants.BUILD_PATH_SOURCE_FOLDER)));
                files.addAll(PATH_SPLITTER.splitToList(preferencesStore.getString(IPreferenceConstants.BUILD_PATH_FILES)));
            }

            List<String> filesNotEmpty = Lists.newLinkedList();
            for (String fileSpec : files) {
                if (!Strings.isNullOrEmpty(fileSpec)) {
                    filesNotEmpty.add(fileSpec);
                }
            }

            List<String> include = PATH_SPLITTER.splitToList(preferencesStore.getString(IPreferenceConstants.BUILD_PATH_INCLUDE));
            List<String> exclude = PATH_SPLITTER.splitToList(preferencesStore.getString(IPreferenceConstants.BUILD_PATH_EXCLUDE));

            return new SourcesSpecs(filesNotEmpty, include, exclude);
        }
    }

    private static List<IResource> getResourcesFromSpecs(List<String> resourcesSpecs, IProject project) {
        List<IResource> resources = Lists.newArrayListWithCapacity(resourcesSpecs.size());
        for (String resourceSpec : resourcesSpecs) {
            if (resourceSpec.contains("*")) {
                throw new RuntimeException("sources spec contain glob - not supported for now, coming soon: " + resourceSpec);
            }

            if (Strings.isNullOrEmpty(resourceSpec)) {
                continue;
            }

            IPath path = Path.fromPortableString(resourceSpec);
            IResource resource = project.findMember(path);
            if (resource != null && resource.exists()) {
                logInfo("adding " + resourceSpec + " to specs => " + resource.getFullPath());
                resources.add(resource);
            } else {
                logInfo("WARN: not found - " + resourceSpec);
            }
        }

        return resources;
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

    private static final class TypeScriptSourcesDeltaVisitor implements IResourceDeltaVisitor {

        /*
         * The flags used when the content (or encoding) of a file changes.
         */
        private static final int FLAGS = IResourceDelta.CONTENT | IResourceDelta.ENCODING;

        private final ImmutableList.Builder<FileDelta> fileDeltas;

        private Collection<IFile> sourceFiles;

        TypeScriptSourcesDeltaVisitor(Collection<IFile> sourceFiles) {
            this.sourceFiles = sourceFiles;
            this.fileDeltas = ImmutableList.builder();
        }

        @Override
        public boolean visit(IResourceDelta delta) throws CoreException {
            IResource resource = delta.getResource();

            // check that the resource is a TypeScript file in the source folder
            if (sourceFiles.contains(resource)) {
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

    private static final class TypeScriptFilesCollectorVisitor implements IResourceVisitor {

        private final ImmutableList.Builder<IFile> files;

        private TypeScriptFilesCollectorVisitor() {
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

    public static List<String> getExportedFolderNames(IProject project) {
        List<IContainer> exportedFolders = getExportedFolders(project);
        List<String> folderNames = Lists.newArrayListWithCapacity(exportedFolders.size());
        for (IContainer folder : exportedFolders) {
            folderNames.add(EclipseResources.getContainerName(folder));
        }

        return folderNames;
    }

    public static List<IContainer> getExportedFolders(IProject project) {
        ProjectPreferenceStore projectPreferenceStore = new ProjectPreferenceStore(project);
        List<String> folderPaths = PATH_SPLITTER
            .splitToList(projectPreferenceStore.getString(IPreferenceConstants.BUILD_PATH_EXPORTED_FOLDER));
        List<IResource> folderResources = getResourcesFromSpecs(folderPaths, project);

        List<IContainer> folders = Lists.newArrayListWithCapacity(folderResources.size());
        for (IResource folderResource : folderResources) {
            if (folderResource instanceof IContainer) {
                folders.add((IContainer) folderResource);
            }
        }

        return folders;
    }

    public static boolean isContainedIn(IResource resource, List<IContainer> containers) {
        for (IContainer container : containers) {
            for (IContainer parent = resource.getParent(); parent != null; parent = parent.getParent()) {
                if (parent.equals(container)) {
                    return true;
                }
            }
        }

        return false;
    }
}
