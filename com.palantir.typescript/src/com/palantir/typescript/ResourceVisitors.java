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

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.IResourceDeltaVisitor;
import org.eclipse.core.resources.IResourceVisitor;
import org.eclipse.core.resources.ProjectScope;
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
 * Resource visitors for finding TypeScript files in the source directory.
 *
 * @author dcicerone
 */
public final class ResourceVisitors {

    public static ImmutableList<FileDelta> getTypeScriptFileDeltas(IResourceDelta delta, IProject project) {
        checkNotNull(delta);
        checkNotNull(project);

        IResource sourceFolder = getSourceFolder(project);
        MyResourceDeltaVisitor visitor = new MyResourceDeltaVisitor(sourceFolder);

        try {
            delta.accept(visitor);
        } catch (CoreException e) {
            throw new RuntimeException(e);
        }

        return visitor.fileDeltas.build();
    }

    public static ImmutableList<String> getTypeScriptFileNames(IProject project) {
        checkNotNull(project);

        IResource sourceFolder = getSourceFolder(project);
        MyResourceVisitor visitor = new MyResourceVisitor();

        try {
            sourceFolder.accept(visitor);
        } catch (CoreException e) {
            throw new RuntimeException(e);
        }

        return visitor.fileNames.build();
    }

    private static IResource getSourceFolder(IProject project) {
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

    private static boolean isTypeScriptFile(IResource resource) {
        return resource.getType() == IResource.FILE && resource.getName().endsWith(".ts");
    }

    private static final class MyResourceDeltaVisitor implements IResourceDeltaVisitor {

        /*
         * The flags used when the content (or encoding) of a file changes.
         */
        private static final int FLAGS = IResourceDelta.CONTENT | IResourceDelta.ENCODING;

        private final ImmutableList.Builder<FileDelta> fileDeltas;
        private final IPath sourceFolderPath;

        public MyResourceDeltaVisitor(IResource sourceFolder) {
            this.fileDeltas = ImmutableList.builder();
            this.sourceFolderPath = sourceFolder.getRawLocation();
        }

        @Override
        public boolean visit(IResourceDelta delta) throws CoreException {
            IResource resource = delta.getResource();
            IPath resourcePath = resource.getRawLocation();

            // check that the resource is a TypeScript file in the source folder
            if (isTypeScriptFile(resource) && resourcePath != null && this.sourceFolderPath.isPrefixOf(resourcePath)) {
                Delta deltaEnum = this.getDeltaEnum(delta);

                // check that the delta is a change that impacts the contents (or encoding) of the file
                if (deltaEnum != Delta.CHANGED || (delta.getFlags() & FLAGS) != 0) {
                    String fileName = resourcePath.toOSString();
                    FileDelta fileDelta = new FileDelta(deltaEnum, fileName);

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

        private final ImmutableList.Builder<String> fileNames;

        private MyResourceVisitor() {
            this.fileNames = ImmutableList.builder();
        }

        @Override
        public boolean visit(IResource resource) throws CoreException {
            if (isTypeScriptFile(resource)) {
                String fileName = resource.getRawLocation().toOSString();

                this.fileNames.add(fileName);
            }

            return true;
        }
    }

    private ResourceVisitors() {
        // prevent instantiation
    }
}
