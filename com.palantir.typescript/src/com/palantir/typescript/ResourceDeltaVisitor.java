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

import org.eclipse.core.resources.IFolder;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.IResourceDeltaVisitor;
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
 * A resource delta visitor which creates a file delta for each TypeScript file it visits.
 *
 * @author dcicerone
 */
public final class ResourceDeltaVisitor implements IResourceDeltaVisitor {

    /*
     * The flags used when the content (or encoding) of a file changes.
     */
    private static final int FLAGS = IResourceDelta.CONTENT | IResourceDelta.ENCODING;

    private final ImmutableList.Builder<FileDelta> deltas;
    private final IPath sourceFolderPath;

    private ResourceDeltaVisitor(IProject project) {
        this.deltas = ImmutableList.builder();

        IScopeContext projectScope = new ProjectScope(project);
        IEclipsePreferences projectPreferences = projectScope.getNode(TypeScriptPlugin.ID);
        String sourceFolderName = projectPreferences.get(IPreferenceConstants.BUILD_PATH_SOURCE_FOLDER, "");
        if (!Strings.isNullOrEmpty(sourceFolderName)) {
            IPath relativeSourceFolderPath = Path.fromPortableString(sourceFolderName);
            IFolder sourceFolder = project.getFolder(relativeSourceFolderPath);

            this.sourceFolderPath = sourceFolder.getRawLocation();
        } else {
            this.sourceFolderPath = project.getRawLocation();
        }
    }

    @Override
    public boolean visit(IResourceDelta delta) throws CoreException {
        IResource resource = delta.getResource();

        // check that the resource is in the source root
        IPath resourcePath = resource.getRawLocation();
        if (!this.sourceFolderPath.isPrefixOf(resourcePath)) {
            return resourcePath.isPrefixOf(this.sourceFolderPath);
        }

        // add the delta if its a TypeScript file
        if (resource.getType() == IResource.FILE && resource.getName().endsWith(".ts")) {
            Delta deltaEnum = this.getDeltaEnum(delta);

            // check that the delta is a change that impacts the contents (or encoding) of the file
            if (deltaEnum != Delta.CHANGED || (delta.getFlags() & FLAGS) != 0) {
                String fileName = resourcePath.toOSString();
                FileDelta fileDelta = new FileDelta(deltaEnum, fileName);

                this.deltas.add(fileDelta);
            }
        }

        return true;
    }

    public ImmutableList<FileDelta> getFileDeltas() {
        return this.deltas.build();
    }

    public static ImmutableList<FileDelta> getFileDeltas(IResourceDelta delta, IProject project) {
        ResourceDeltaVisitor visitor = new ResourceDeltaVisitor(project);

        try {
            delta.accept(visitor);
        } catch (CoreException e) {
            throw new RuntimeException(e);
        }

        return visitor.getFileDeltas();
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
