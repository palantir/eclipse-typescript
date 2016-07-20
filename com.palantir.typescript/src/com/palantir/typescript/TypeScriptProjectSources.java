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
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.palantir.typescript.TypeScriptProjects.Folders;
import com.palantir.typescript.preferences.ProjectPreferenceStore;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.FileDelta.Delta;

/**
 * This class models a TypeScript project's sources input.
 *
 * @author lgrignon
 */
public class TypeScriptProjectSources {

    public static final char BUILD_PATH_SPEC_SEPARATOR = ';';
    public static final Splitter PATH_SPLITTER = Splitter.on(BUILD_PATH_SPEC_SEPARATOR);

    private static final class SourcesSpecs {
        private final List<String> files;
        private final List<String> include;
        private final List<String> exclude;

        private SourcesSpecs(List<String> files, List<String> include, List<String> exclude) {
            checkNotNull(files);
            checkNotNull(include);
            checkNotNull(exclude);

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

    public TypeScriptProjectSources(IProject project, Folders type) {
        this.project = project;
        this.type = type;
    }

    public Set<FileDelta> getDeltas(IResourceDelta delta) {
        checkNotNull(delta);

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

        Set<IFile> allSourceFiles = Sets.newHashSet();

        // if no files or include defined, defaults to all project's files
        if (sourcesSpecs.files.isEmpty() && sourcesSpecs.include.isEmpty()) {
            collectSourceFiles(project, excludeList, allSourceFiles);
        } else {
            // files are not affected by exclude
            for (IResource resource : getResourcesFromSpecs(sourcesSpecs.files, project)) {
                collectSourceFiles(resource, ImmutableList.<IResource> of(), allSourceFiles);
            }

            for (IResource resource : getResourcesFromSpecs(sourcesSpecs.include, project)) {
                collectSourceFiles(resource, excludeList, allSourceFiles);
            }
        }

        logInfo("> found " + allSourceFiles.size() + " source files");

        return allSourceFiles;
    }

    private void collectSourceFiles(IResource resource, List<IResource> excludeList, Set<IFile> allSourceFiles) {
        if (resource.exists()) {
            logInfo("adding " + resource.getProjectRelativePath() + " to sources");
            if (resource instanceof IFile) {
                if (!isExcluded(resource, excludeList)) {
                    allSourceFiles.add((IFile) resource);
                }
            } else if (resource instanceof IContainer) {

                TypeScriptFilesCollectorVisitor visitor = new TypeScriptFilesCollectorVisitor(excludeList);
                try {
                    resource.accept(visitor);
                } catch (CoreException e) {
                    throw new RuntimeException(e);
                }

                allSourceFiles.addAll(visitor.files.build());
            }
        }
    }

    private static boolean isExcluded(IResource fileOrFolder, List<IResource> excludeList) {
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

    public static List<IResource> getResourcesFromSpecs(List<String> resourcesSpecs, IProject project) {
        checkNotNull(resourcesSpecs);
        checkNotNull(project);

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

    private static final class TypeScriptFilesCollectorVisitor implements IResourceVisitor {

        private final ImmutableList.Builder<IFile> files;
        private final List<IResource> excludeList;

        private TypeScriptFilesCollectorVisitor(List<IResource> excludeList) {
            this.excludeList = excludeList;
            this.files = ImmutableList.builder();
        }

        @Override
        public boolean visit(IResource resource) throws CoreException {
            if (isExcluded(resource, excludeList)) {
                System.out.println(resource.getProjectRelativePath() + " is excluded, stop recursion");
                return false;
            }

            if (TypeScriptProjects.isTypeScriptFile(resource)) {
                this.files.add((IFile) resource);
            }

            return true;
        }
    }

    private static final class TypeScriptSourcesDeltaVisitor implements IResourceDeltaVisitor {

        /*
         * The flags used when the content (or encoding) of a file changes.
         */
        private static final int FLAGS = IResourceDelta.CONTENT | IResourceDelta.ENCODING;

        private final ImmutableList.Builder<FileDelta> fileDeltas;

        private Collection<IFile> sourceFiles;

        TypeScriptSourcesDeltaVisitor(Collection<IFile> sourceFiles) {
            checkNotNull(sourceFiles);

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
}
