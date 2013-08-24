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
import org.eclipse.core.resources.IWorkspace;
import org.eclipse.core.resources.IWorkspaceRunnable;
import org.eclipse.core.resources.IncrementalProjectBuilder;
import org.eclipse.core.resources.ProjectScope;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Path;
import org.eclipse.core.runtime.Status;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.core.runtime.preferences.IScopeContext;
import org.eclipse.jface.preference.IPreferenceStore;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
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

    private LanguageService cachedLanguageService;

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

        // dispose the language service in case it is out-of-sync
        if (this.cachedLanguageService != null) {
            this.cachedLanguageService.dispose();
            this.cachedLanguageService = null;
        }

        this.clean(this.getAllSourceFiles(), monitor);
    }

    private void build(List<FileDelta> fileDeltas, IProgressMonitor monitor) throws CoreException {
        // compile the source files if compile-on-save is enabled
        IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();
        if (preferenceStore.getBoolean(IPreferenceConstants.COMPILER_COMPILE_ON_SAVE)) {
            compile(fileDeltas, monitor);
        }

        // create the markers second to ensure the files are compiled as quickly as possible
        this.createMarkers(monitor);
    }

    private void clean(List<FileDelta> fileDeltas, IProgressMonitor monitor) throws CoreException {
        IProject project = this.getProject();
        IScopeContext projectScope = new ProjectScope(project);
        IEclipsePreferences projectPreferences = projectScope.getNode(TypeScriptPlugin.ID);

        // clear the problem markers
        project.deleteMarkers(MARKER_TYPE, true, IResource.DEPTH_INFINITE);

        // remove the built files if compile-on-save is enabled and an output directory is not specified
        IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();
        if (preferenceStore.getBoolean(IPreferenceConstants.COMPILER_COMPILE_ON_SAVE)
                && projectPreferences.get(IPreferenceConstants.COMPILER_OUTPUT_DIR_OPTION, null) != null) {
            for (FileDelta fileDelta : fileDeltas) {
                String fileName = fileDelta.getFileName();
                ImmutableList<String> builtFiles = getBuiltFiles(fileName);

                for (String builtFile : builtFiles) {
                    Path path = new Path(builtFile);
                    IFile file = ResourcesPlugin.getWorkspace().getRoot().getFileForLocation(path);

                    // refresh the resource for the file if it is within the workspace
                    if (file != null) {
                        file.refreshLocal(IResource.DEPTH_ZERO, monitor);

                        if (file.exists()) {
                            file.delete(false, monitor);
                        }
                    }
                }
            }
        }
    }

    private void fullBuild(IProgressMonitor monitor) throws CoreException {
        ImmutableList<FileDelta> fileDeltas = this.getAllSourceFiles();

        this.build(fileDeltas, monitor);
    }

    private void incrementalBuild(IProgressMonitor monitor) throws CoreException {
        IProject project = this.getProject();
        IResourceDelta delta = this.getDelta(project);
        ImmutableList<FileDelta> fileDeltas = ResourceDeltaVisitor.getFileDeltas(delta, project);

        if (!fileDeltas.isEmpty()) {
            this.getLanguageService().updateFiles(fileDeltas);

            this.clean(fileDeltas, monitor);
            this.build(fileDeltas, monitor);
        }
    }

    private ImmutableList<FileDelta> getAllSourceFiles() throws CoreException {
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

    private LanguageService getLanguageService() {
        if (this.cachedLanguageService == null) {
            this.cachedLanguageService = new LanguageService(this.getProject());
        }

        return this.cachedLanguageService;
    }

    private void compile(List<FileDelta> fileDeltas, IProgressMonitor monitor) throws CoreException {
        for (FileDelta fileDelta : fileDeltas) {
            Delta delta = fileDelta.getDelta();

            if (delta == Delta.ADDED || delta == Delta.CHANGED) {
                String fileName = fileDelta.getFileName();

                // skip ambient declaration files
                if (fileName.endsWith("d.ts")) {
                    continue;
                }

                // compile the file
                try {
                    compile(fileName, monitor);
                } catch (RuntimeException e) {
                    String errorMessage = "Compilation of '" + fileName + "' failed.";
                    Status status = new Status(IStatus.ERROR, TypeScriptPlugin.ID, errorMessage, e);

                    TypeScriptPlugin.getDefault().getLog().log(status);
                }
            }
        }
    }

    private void compile(String fileName, IProgressMonitor monitor) throws CoreException {
        LanguageService languageService = this.getLanguageService();
        for (String outputFileName : languageService.getEmitOutput(fileName)) {
            Path path = new Path(outputFileName);
            IFile file = ResourcesPlugin.getWorkspace().getRoot().getFileForLocation(path);

            // refresh the resource for the file if it is within the workspace
            if (file != null) {
                file.refreshLocal(IResource.DEPTH_ZERO, monitor);
            }
        }
    }

    private void createMarkers(IProgressMonitor monitor) throws CoreException {
        // HACKHACK: create a new language service for each build since it seems to have some incorrect caching behavior
        // fix is: https://typescript.codeplex.com/SourceControl/changeset/8b1915815ce48b5c17772de750a02a38bb309044
        LanguageService languageService = new LanguageService(this.getProject());
        try {
            final Map<String, List<Diagnostic>> diagnostics = languageService.getAllDiagnostics();

            // create the markers within a workspace runnable for greater efficiency
            IWorkspaceRunnable runnable = new IWorkspaceRunnable() {
                @Override
                public void run(IProgressMonitor runnableMonitor) throws CoreException {
                    createMarkers(diagnostics);
                }
            };
            ResourcesPlugin.getWorkspace().run(runnable, this.getProject(), IWorkspace.AVOID_UPDATE, monitor);
        } finally {
            languageService.dispose();
        }
    }

    private static void createMarkers(final Map<String, List<Diagnostic>> diagnostics) throws CoreException {
        for (Map.Entry<String, List<Diagnostic>> entry : diagnostics.entrySet()) {
            String fileName = entry.getKey();

            // ignore the default library
            if (fileName.equals("lib.d.ts")) {
                continue;
            }

            // create the markers for this file
            Path path = new Path(fileName);
            IFile file = ResourcesPlugin.getWorkspace().getRoot().getFileForLocation(path);
            List<Diagnostic> fileDiagnostics = entry.getValue();
            for (Diagnostic diagnostic : fileDiagnostics) {
                IMarker marker = file.createMarker(MARKER_TYPE);
                Map<String, Object> attributes = createMarkerAttributes(diagnostic);

                marker.setAttributes(attributes);
            }
        }
    }

    private static Map<String, Object> createMarkerAttributes(Diagnostic diagnostic) {
        ImmutableMap.Builder<String, Object> attributes = ImmutableMap.builder();

        attributes.put(IMarker.CHAR_START, diagnostic.getStart());
        attributes.put(IMarker.CHAR_END, diagnostic.getStart() + diagnostic.getLength());
        attributes.put(IMarker.LINE_NUMBER, diagnostic.getLine() + 1);
        attributes.put(IMarker.MESSAGE, diagnostic.getText());
        attributes.put(IMarker.PRIORITY, IMarker.PRIORITY_NORMAL);
        attributes.put(IMarker.SEVERITY, IMarker.SEVERITY_ERROR);

        return attributes.build();
    }

    private static ImmutableList<String> getBuiltFiles(String fileName) {
        ImmutableList.Builder<String> builtFiles = ImmutableList.builder();

        builtFiles.add(fileName.replaceFirst(".ts$", ".js"));
        builtFiles.add(fileName.replaceFirst(".ts$", ".js.map"));

        return builtFiles.build();
    }
}
