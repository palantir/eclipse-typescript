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

import java.util.List;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceVisitor;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.jface.preference.IPreferenceStore;

import com.google.common.base.Function;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.FileDelta.Delta;

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

    private static IPath getSourceFolder(IProject project) {
        // The project can be null if we are analyzing a resource from outside the workspace.
        if (project != null) {
            IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();
            String sourcePath = preferenceStore.getString(IPreferenceConstants.COMPILER_SOURCE_PATH);

            if (!Strings.isNullOrEmpty(sourcePath)) {
                return new Path(sourcePath);
            }

        }

        return null;
    }

    public static List<String> getProjectFiles(final IProject project) {
        final ImmutableList.Builder<String> fileNames = ImmutableList.builder();

        try {
            final IPath sourceFolder = getSourceFolder(project);

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

    private static boolean isResourceAccepted(IResource resource, IPath sourceFolder) {
        if (resource.getType() == IResource.FILE
                && resource.getName().endsWith(".ts")) {
            return (sourceFolder == null || sourceFolder.isPrefixOf(resource.getProjectRelativePath()));
        } else {
            return false;
        }
    }

    private ClasspathUtils() {
        // Hiding constructor.
    }
}
