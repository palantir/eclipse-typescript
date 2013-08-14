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

import java.util.List;
import java.util.Map;

import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IMarker;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.IResourceVisitor;
import org.eclipse.core.resources.IncrementalProjectBuilder;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Path;
import org.eclipse.core.runtime.Status;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.ui.texteditor.MarkerUtilities;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Maps;
import com.palantir.typescript.services.language.Diagnostic;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.FileDelta.Delta;
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
        checkNotNull(monitor);

        switch (kind) {
            case IncrementalProjectBuilder.AUTO_BUILD:
            case IncrementalProjectBuilder.INCREMENTAL_BUILD:
                this.incrementalBuild(monitor);
                break;
            case IncrementalProjectBuilder.FULL_BUILD:
                this.fullBuild(monitor);
                break;
        }

        return null;
    }

    @Override
    protected void clean(IProgressMonitor monitor) throws CoreException {
        checkNotNull(monitor);

        // clear the problem markers
        this.getProject().deleteMarkers(MARKER_TYPE, true, IResource.DEPTH_INFINITE);

        // remove the built files
        for (FileDelta fileDelta : this.getAllTypeScriptFiles()) {
            this.removeBuiltFiles(fileDelta.getFileName(), monitor);
        }
    }

    private void incrementalBuild(IProgressMonitor monitor) throws CoreException {
        IProject project = this.getProject();
        IResourceDelta delta = this.getDelta(project);
        ImmutableList<FileDelta> fileDeltas = ResourceDeltaVisitor.getFileDeltas(delta, project);

        if (!fileDeltas.isEmpty()) {
            this.buildFiles(fileDeltas, monitor);
        }
    }

    private void fullBuild(IProgressMonitor monitor) throws CoreException {
        ImmutableList<FileDelta> fileDeltas = this.getAllTypeScriptFiles();

        this.buildFiles(fileDeltas, monitor);
    }

    private ImmutableList<FileDelta> getAllTypeScriptFiles() throws CoreException {
        final ImmutableList.Builder<FileDelta> files = ImmutableList.builder();

        this.getProject().accept(new IResourceVisitor() {
            @Override
            public boolean visit(IResource resource) throws CoreException {
                if (resource.getType() == IResource.FILE && resource.getName().endsWith(".ts")) {
                    String fileName = resource.getRawLocation().toOSString();

                    files.add(new FileDelta(Delta.ADDED, fileName));
                }

                return true;
            }
        });

        return files.build();
    }

    private void buildFiles(List<FileDelta> fileDeltas, IProgressMonitor monitor) throws CoreException {
        // HACKHACK: create a new language service for each build since it seems to have some incorrect caching behavior
        LanguageService languageService = new LanguageService(this.getProject());
        try {
            this.updateMarkers(languageService);

            IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();
            if (preferenceStore.getBoolean(IPreferenceConstants.COMPILER_COMPILE_ON_SAVE)) {
                for (FileDelta fileDelta : fileDeltas) {
                    String fileName = fileDelta.getFileName();
                    Delta delta = fileDelta.getDelta();

                    this.removeBuiltFiles(fileName, monitor);

                    if (delta == Delta.ADDED || delta == Delta.CHANGED) {
                        try {
                            if (!fileName.endsWith("d.ts")) {
                                this.compileFile(fileName, languageService, monitor);
                            }
                        } catch (RuntimeException e) {
                            String errorMessage = "Could not compile " + fileName;
                            Status status = new Status(IStatus.ERROR, TypeScriptPlugin.ID, errorMessage, e);

                            TypeScriptPlugin.getDefault().getLog().log(status);
                        }
                    }
                }
            }
        } finally {
            languageService.dispose();
        }
    }

    private void compileFile(String fileName, LanguageService languageService, IProgressMonitor monitor) throws CoreException {
        for (String outputFileName : languageService.getEmitOutput(fileName)) {
            Path path = new Path(outputFileName);
            IFile file = ResourcesPlugin.getWorkspace().getRoot().getFileForLocation(path);

            file.refreshLocal(IResource.DEPTH_ZERO, monitor);
        }
    }

    private void removeBuiltFiles(String fileName, IProgressMonitor monitor) throws CoreException {
        for (String builtFile : this.getBuiltFiles(fileName)) {
            Path path = new Path(builtFile);
            IFile file = ResourcesPlugin.getWorkspace().getRoot().getFileForLocation(path);

            file.refreshLocal(IResource.DEPTH_ZERO, monitor);
            if (file.exists()) {
                file.delete(false, monitor);
            }
        }
    }

    private ImmutableList<String> getBuiltFiles(String fileName) {
        ImmutableList.Builder<String> builtFiles = ImmutableList.builder();

        builtFiles.add(fileName.replaceFirst(".ts$", ".js"));
        builtFiles.add(fileName.replaceFirst(".ts$", ".js.map"));

        return builtFiles.build();
    }

    private void updateMarkers(LanguageService languageService) throws CoreException {
        this.getProject().deleteMarkers(MARKER_TYPE, true, IResource.DEPTH_INFINITE);

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
    }
}
