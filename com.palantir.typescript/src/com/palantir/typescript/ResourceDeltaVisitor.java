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

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.IResourceDeltaVisitor;
import org.eclipse.core.runtime.CoreException;

import com.google.common.collect.ImmutableList;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.FileDelta.Delta;

/**
 * A resource delta visitor which creates a file delta for each TypeScript file it visits.
 *
 * @author dcicerone
 */
public final class ResourceDeltaVisitor implements IResourceDeltaVisitor {

    private final ImmutableList.Builder<FileDelta> deltas;
    private final IProject project;

    public ResourceDeltaVisitor(IProject project) {
        this.deltas = ImmutableList.builder();
        this.project = project;
    }

    @Override
    public boolean visit(IResourceDelta delta) throws CoreException {
        IResource resource = delta.getResource();
        IProject resourceProject = resource.getProject();

        // skip other projects
        if (this.project != null && resourceProject != null && !this.project.equals(resourceProject)) {
            return false;
        }

        if (resource.getType() == IResource.FILE && resource.getName().endsWith(".ts")) {
            String fileName = resource.getRawLocation().toOSString();
            final Delta deltaEnum;
            switch (delta.getKind()) {
                case IResourceDelta.ADDED:
                    deltaEnum = Delta.ADDED;
                    break;
                case IResourceDelta.CHANGED:
                    deltaEnum = Delta.CHANGED;
                    break;
                case IResourceDelta.REMOVED:
                    deltaEnum = Delta.REMOVED;
                    break;
                default:
                    throw new IllegalStateException();
            }

            this.deltas.add(new FileDelta(deltaEnum, fileName));
        }

        return true;
    }

    public ImmutableList<FileDelta> getDeltas() {
        return this.deltas.build();
    }
}
