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
import java.util.Map;

import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IMarker;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IncrementalProjectBuilder;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.Path;
import org.eclipse.ui.texteditor.MarkerUtilities;

import com.google.common.collect.Maps;
import com.palantir.typescript.services.language.Diagnostic;
import com.palantir.typescript.services.language.LanguageService;

/**
 * The TypeScript builder transpiles TypeScript files into JavaScript.
 *
 * @author dcicerone
 */
public final class TypeScriptBuilder extends IncrementalProjectBuilder {

    public static final String ID = "com.palantir.typescript.typeScriptBuilder";

    private static final String MARKER_TYPE = "com.palantir.typescript.typeScriptProblem";

    @Override
    protected IProject[] build(int kind, Map args, IProgressMonitor monitor) throws CoreException {
        // TODO: incremental builds weren't working in TypeScript so we only support full builds at this time
        this.fullBuild();

        return null;
    }

    @Override
    protected void clean(IProgressMonitor monitor) throws CoreException {
        this.getProject().deleteMarkers(MARKER_TYPE, true, IResource.DEPTH_INFINITE);
    }

    private void fullBuild() throws CoreException {
        IProject project = this.getProject();

        project.deleteMarkers(MARKER_TYPE, true, IResource.DEPTH_INFINITE);

        LanguageService languageService = new LanguageService(project);
        try {
            Map<String, List<Diagnostic>> diagnostics = languageService.getAllDiagnostics();

            for (Map.Entry<String, List<Diagnostic>> entry : diagnostics.entrySet()) {
                String fileName = entry.getKey();
                List<Diagnostic> fileDiagnostics = entry.getValue();

                // ignore the default library
                if (fileName.equals("lib.d.ts")) {
                    continue;
                }

                Path path = new Path(fileName);
                IFile file = ResourcesPlugin.getWorkspace().getRoot().getFileForLocation(path);
                for (Diagnostic diagnostic : fileDiagnostics) {
                    Map<String, Object> attributes = Maps.newHashMap();
                    attributes.put(IMarker.CHAR_START, diagnostic.getStart());
                    attributes.put(IMarker.CHAR_END, diagnostic.getStart() + diagnostic.getLength());
                    attributes.put(IMarker.LINE_NUMBER, diagnostic.getLine() + 1);
                    attributes.put(IMarker.MESSAGE, diagnostic.getText());
                    attributes.put(IMarker.PRIORITY, IMarker.PRIORITY_NORMAL);
                    attributes.put(IMarker.SEVERITY, IMarker.SEVERITY_ERROR);

                    MarkerUtilities.createMarker(file, attributes, MARKER_TYPE);
                }
            }
        } finally {
            languageService.dispose();
        }
    }
}
