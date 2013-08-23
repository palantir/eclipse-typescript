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
import com.google.common.collect.Collections2;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.FileDelta.Delta;
import com.palantir.typescript.util.CharOperation;

/**
 * Utility class used to filter resources based on the configured exclusion and inclusion filters.
 * Filters can be set both at workspace and project level, with filters set at project level taking
 * precedence over filters set at workspace level.
 * 
 * @author rserafin
 */

public final class BuildPathUtils {
    /**
     * Returns {@link FileDelta}s for all project files included in the build path.
     * 
     * @param project
     *            the project
     * @return {@link FileDelta}s for all project files included in the build path
     */
    public static List<FileDelta> getAllSourceFilesDeltas(final IProject project) {
        return Lists.transform(getProjectFiles(project), new Function<String, FileDelta>() {
            @Override
            public FileDelta apply(final String fileName) {
                return new FileDelta(Delta.ADDED, fileName);
            }
        });
    }

    /**
     * Returns the {@link BuildPath} for the given project.
     * 
     * @param project
     *            the project
     * @return the {@link BuildPath} for the given project, or null if the given project is null
     */
    public static BuildPath getProjectBuildPath(final IProject project) {
        // The project can be null if we are analyzing a resource from outside the workspace.
        if (project != null) {
            return new BuildPath(getBuildPathPreferenceStore(project));
        }

        return null;
    }

    /**
     * Returns a list of all .ts files of the given project that are included in the build path.
     * 
     * @param project
     *            the project
     * @return a list of all .ts files of the given project that are included in the build path
     */
    public static List<String> getProjectFiles(final IProject project) {
        final ImmutableList.Builder<String> fileNames = ImmutableList.builder();

        try {
            final BuildPath buildPath = getProjectBuildPath(project);

            project.accept(new IResourceVisitor() {
                @Override
                public boolean visit(final IResource resource) throws CoreException {
                    if (isResourceAccepted(resource, buildPath)) {
                        final String fileName = resource.getRawLocation().toOSString();

                        fileNames.add(fileName);
                    }

                    return true;
                }
            });
        } catch (final CoreException e) {
            throw new RuntimeException(e);
        }

        return fileNames.build();
    }

    /**
     * Returns a preference store that contains the build path preferences (include and exclude
     * filters) for the given project, or the plugin build path preferences if none has been
     * configured for the project.
     * 
     * @param project
     *            the project
     * @return a project-scoped {@link IPreferenceStore} to be used to read and write the build path
     *         preferences for the given project
     */
    public static IPreferenceStore getBuildPathPreferenceStore(final IProject project) {
        final IPreferenceStore store = new ScopedPreferenceStore(new ProjectScope(project), TypeScriptPlugin.ID);
        store.setDefault(IPreferenceConstants.COMPILER_INCLUSION_PATTERNS, TypeScriptPlugin.getDefault()
            .getPreferenceStore().getString(IPreferenceConstants.COMPILER_INCLUSION_PATTERNS));
        store.setDefault(IPreferenceConstants.COMPILER_EXCLUSION_PATTERNS, TypeScriptPlugin.getDefault()
            .getPreferenceStore().getString(IPreferenceConstants.COMPILER_EXCLUSION_PATTERNS));
        return store;
    }

    /**
     * Returns true if the given resource should be considered, based on the build path configured
     * for the given project.
     * 
     * @param resource
     *            the resource to be tested
     * @param project
     *            the project
     * @return true if the given resource is a TypeScript resource included in the given project
     *         build path.
     */
    public static boolean isResourceAccepted(final IResource resource, final IProject project) {
        return isResourceAccepted(resource, getProjectBuildPath(project));
    }

    /**
     * Returns true if the given resource should be considered a valid TypeScript resources, based
     * on the given {@link BuildPath}. If the given {@link BuildPath} is null, the only check
     * performed is that the resource is a file with .ts extension.
     * 
     * @param resource
     *            the resource to be tested.
     * @param buildPath
     *            the {@link BuildPath} to be tested against, or null if the resource does not
     *            belong to any project (or it should be accepted, independently from the project
     *            build path).
     * @return true if the given resource should be considered a valid TypeScript resources, based
     *         on the given {@link BuildPath}
     */
    public static boolean isResourceAccepted(final IResource resource, final BuildPath buildPath) {
        return resource.getType() == IResource.FILE
                && resource.getName().endsWith(".ts")
                && isResourceContained(resource, buildPath);
    }

    private static boolean isResourceContained(final IResource resource, final BuildPath buildPath) {
        return buildPath == null
                || buildPath.contains(resource);
    }

    private BuildPathUtils() {
        // Hiding constructor.
    }

    /**
     * A project build path, based on the inclusion and exclusion filters configured for the project
     * (or for the plugin).
     * 
     * @author rserafin
     */
    public static final class BuildPath {
        private final Collection<IPath> inclusionFilters;
        private final Collection<IPath> exclusionFilters;

        /**
         * Returns true if the given resource should be considered as a valid TypeScript resource
         * for this build path.
         * 
         * @param resource
         *            the resource to be checked.
         * @return true if the given resource should be considered as a valid TypeScript resource
         *         for this build path
         */
        public boolean contains(final IResource resource) {
            final IPath resourcePath = resource.getProjectRelativePath();
            for (final IPath path : this.inclusionFilters) {
                if (!CharOperation.pathMatch(path.toString().toCharArray(), resourcePath.toString().toCharArray(), true, '/')) {
                    return false;
                }
            }

            for (final IPath path : this.exclusionFilters) {
                if (CharOperation.pathMatch(path.toString().toCharArray(), resourcePath.toString().toCharArray(), true, '/')) {
                    return false;
                }
            }

            return true;
        }

        private BuildPath(final IPreferenceStore preferenceStore) {
            this.inclusionFilters = this.getFilters(preferenceStore, IPreferenceConstants.COMPILER_INCLUSION_PATTERNS);
            this.exclusionFilters = this.getFilters(preferenceStore, IPreferenceConstants.COMPILER_EXCLUSION_PATTERNS);
        }

        private Collection<IPath> getFilters(final IPreferenceStore preferenceStore, final String key) {
            final String filtersList = preferenceStore.getString(key);
            final StringTokenizer st = new StringTokenizer(filtersList, "," + "\n\r");

            final ImmutableSet.Builder<String> filtersBuilders = ImmutableSet.builder();
            while (st.hasMoreTokens()) {
                filtersBuilders.add(st.nextToken());
            }

            return this.tranformToPathList(filtersBuilders.build());
        }

        private Collection<IPath> tranformToPathList(final Collection<String> filtersList) {
            return Collections2.transform(filtersList, new Function<String, IPath>() {

                @Override
                public IPath apply(final String filter) {
                    return new Path(filter);
                }
            });
        }

    }
}
