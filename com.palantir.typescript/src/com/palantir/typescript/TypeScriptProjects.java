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
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.palantir.typescript.preferences.ProjectPreferenceStore;
import com.palantir.typescript.services.language.FileDelta;

/**
 * Utilities for dealing with TypeScript projects.
 *
 * @author dcicerone
 * @author lgrignon
 */
public final class TypeScriptProjects {

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

    public static boolean isTypeScriptFile(IResource resource) {
        // needs to be a file
        if (resource.getType() != IResource.FILE) {
            return false;
        }

        // needs to have a .ts or .tsx extension
        String resourceName = resource.getName();
        return resourceName.endsWith(".ts") || resourceName.endsWith(".tsx");
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
        List<String> folderPaths = TypeScriptProjectSources.PATH_SPLITTER
            .splitToList(projectPreferenceStore.getString(IPreferenceConstants.BUILD_PATH_EXPORTED_FOLDER));
        List<IResource> folderResources = TypeScriptProjectSources.getResourcesFromSpecs(folderPaths, project);

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
