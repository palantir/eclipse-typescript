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

import java.util.Collection;
import java.util.List;
import java.util.StringTokenizer;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceVisitor;
import org.eclipse.core.resources.ProjectScope;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.ui.preferences.ScopedPreferenceStore;

import com.google.common.base.Function;
import com.google.common.base.Strings;
import com.google.common.collect.Collections2;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.FileDelta.Delta;
import com.palantir.typescript.util.CharOperation;

/**
 * Utility class used to filter resources based on the configured classpath.
 *
 * @author rserafin
 */

public final class ClasspathUtils {

    public static List<FileDelta> getAllSourceFilesDeltas(IProject project) {
        return Lists.transform(getProjectFiles(project), new Function<String, FileDelta>() {
            @Override
            public FileDelta apply(String fileName) {
                return new FileDelta(Delta.ADDED, fileName);
            }
        });
    }

    private static Collection<IPath> getSourceFolder(IProject project) {
        // The project can be null if we are analyzing a resource from outside the workspace.
        if (project != null) {
            Collection<String> sourcePaths = getProjectSourcePaths(project);

            if (sourcePaths.isEmpty()) {
                sourcePaths = getPluginSourcePaths(sourcePaths);
            }

            if (!sourcePaths.isEmpty()) {
                return Collections2.transform(sourcePaths, new Function<String, IPath>() {

                    @Override
                    public IPath apply(String path) {
                        return new Path(path);
                    }
                });
            }

        }

        return null;
    }

    private static Collection<String> getPluginSourcePaths(Collection<String> sourcePaths) {
        IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();
        String workspaceSourcePath = preferenceStore.getString(IPreferenceConstants.COMPILER_SOURCE_PATH);
        if (!Strings.isNullOrEmpty(workspaceSourcePath)) {
            sourcePaths = ImmutableList.of(workspaceSourcePath);
        }
        return sourcePaths;
    }

    private static Collection<String> getProjectSourcePaths(IProject project) {
        IPreferenceStore preferenceStore = new ScopedPreferenceStore(new ProjectScope(project), TypeScriptPlugin.ID);
        String pathList = preferenceStore.getString(IPreferenceConstants.COMPILER_SOURCE_PATH);
        StringTokenizer st = new StringTokenizer(pathList, "," + "\n\r");

        ImmutableSet.Builder<String> pathBuilder = ImmutableSet.builder();
        while (st.hasMoreTokens()) {
            pathBuilder.add(st.nextToken());
        }

        return pathBuilder.build();
    }

    public static List<String> getProjectFiles(final IProject project) {
        final ImmutableList.Builder<String> fileNames = ImmutableList.builder();

        try {
            final Collection<IPath> sourceFolder = getSourceFolder(project);

            project.accept(new IResourceVisitor() {
                @Override
                public boolean visit(IResource resource) throws CoreException {
                    if (isResourceAccepted(resource, sourceFolder)) {
                        String fileName = resource.getRawLocation().toOSString();

                        fileNames.add(fileName);
                    }

                    return true;
                }
            });
        } catch (CoreException e) {
            throw new RuntimeException(e);
        }

        return fileNames.build();
    }

    public static boolean isResourceAccepted(IResource resource, IProject project) {
        return isResourceAccepted(resource, getSourceFolder(project));
    }

    private static boolean isResourceAccepted(IResource resource, Collection<IPath> sourcePaths) {
        return resource.getType() == IResource.FILE
                && resource.getName().endsWith(".ts")
                && isResourceContained(resource, sourcePaths);
    }

    private static boolean isResourceContained(IResource resource, Collection<IPath> sourcePaths) {
        return sourcePaths == null
                || sourcePaths.isEmpty()
                || sourcePathsContains(resource, sourcePaths);
    }

    private static boolean sourcePathsContains(IResource resource, Collection<IPath> sourcePaths) {
        System.out.print("Examining resource: '" + resource.getProjectRelativePath().toString() + "' with respect to '" + sourcePaths + "': ");
        IPath resourcePath = resource.getProjectRelativePath();
        for (IPath sourcePath : sourcePaths) {
            if (CharOperation.pathMatch(sourcePath.toString().toCharArray(), resourcePath.toString().toCharArray(), true, '/')) {
                System.out.println("accepted");
                return true;
            }
        }
        System.out.println("not accepted");
        return false;
    }



    private ClasspathUtils() {
        // Hiding constructor.
    }
}
