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

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.eclipse.core.resources.ICommand;
import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IMarker;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IProjectDescription;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.IWorkspace;
import org.eclipse.core.resources.IWorkspaceRunnable;
import org.eclipse.core.resources.IncrementalProjectBuilder;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.jface.preference.IPreferenceStore;

import com.google.common.base.Charsets;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.Files;
import com.palantir.typescript.preferences.ProjectPreferenceStore;
import com.palantir.typescript.services.language.DiagnosticEx;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.FileDelta.Delta;
import com.palantir.typescript.services.language.LanguageEndpoint;
import com.palantir.typescript.services.language.OutputFile;

/**
 * The TypeScript builder transpiles TypeScript files into JavaScript.
 *
 * @author dcicerone
 */
public final class TypeScriptBuilder extends IncrementalProjectBuilder {

    public static final String ID = "com.palantir.typescript.typeScriptBuilder";

    private static final String MARKER_TYPE = "com.palantir.typescript.typeScriptProblem";

    private final LanguageEndpoint languageEndpoint;

    public TypeScriptBuilder() {
        this.languageEndpoint = TypeScriptPlugin.getDefault().getBuilderLanguageEndpoint();
    }

    public static boolean isConfigured(IProject project) {
        checkNotNull(project);

        IProjectDescription description;
        try {
            description = project.getDescription();
        } catch (CoreException e) {
            throw new RuntimeException(e);
        }

        for (ICommand command : description.getBuildSpec()) {
            if (command.getBuilderName().equals(TypeScriptBuilder.ID)) {
                return true;
            }
        }

        return false;
    }

    @Override
    protected IProject[] build(int kind, Map<String, String> args, IProgressMonitor monitor) throws CoreException {
        checkNotNull(monitor);

        switch (kind) {
            case IncrementalProjectBuilder.AUTO_BUILD:
            case IncrementalProjectBuilder.INCREMENTAL_BUILD:
                this.incrementalBuild(monitor);

                // re-create the markers for the referencing projects
                for (IProject referencingProject : this.getProject().getReferencingProjects()) {
                    referencingProject.deleteMarkers(MARKER_TYPE, true, IResource.DEPTH_INFINITE);
                    createMarkers(referencingProject, monitor);
                }
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

        // clean the language service in case it is out-of-sync
        this.languageEndpoint.cleanProject(this.getProject());

        // clear the problem markers
        this.getProject().deleteMarkers(MARKER_TYPE, true, IResource.DEPTH_INFINITE);
    }

    @Override
    protected void startupOnInitialize() {
        super.startupOnInitialize();

        this.languageEndpoint.initializeProject(this.getProject());
    }

    private void build(List<FileDelta> fileDeltas, IProgressMonitor monitor) throws CoreException {
        IPreferenceStore projectPreferenceStore = new ProjectPreferenceStore(this.getProject());

        // compile the source files if compile-on-save is enabled
        if (projectPreferenceStore.getBoolean(IPreferenceConstants.COMPILER_COMPILE_ON_SAVE)) {
            if (isOutputFileSpecified()) {
                // pick the first file as the one to "compile" (like a clean build)
                if (!fileDeltas.isEmpty()) {
                    String fileName = fileDeltas.get(0).getFileName();

                    this.compile(fileName, monitor);
                }
            } else {
                clean(fileDeltas, monitor);
                compile(fileDeltas, monitor);
            }
        }

        createMarkers(this.getProject(), monitor);
    }

    private void fullBuild(IProgressMonitor monitor) throws CoreException {
        ImmutableList<FileDelta> fileDeltas = this.getAllSourceFiles();

        // initialize the project in the language service to ensure it is up-to-date
        this.languageEndpoint.initializeProject(this.getProject());

        this.build(fileDeltas, monitor);
    }

    private void incrementalBuild(IProgressMonitor monitor) throws CoreException {
        IProject project = this.getProject();
        IResourceDelta delta = this.getDelta(project);
        ImmutableList<FileDelta> fileDeltas = EclipseResources.getTypeScriptFileDeltas(delta, project);

        if (!fileDeltas.isEmpty()) {
            this.languageEndpoint.updateFiles(fileDeltas);

            // clear the problem markers
            this.getProject().deleteMarkers(MARKER_TYPE, true, IResource.DEPTH_INFINITE);

            // replace the file deltas with all the source files if an output file is specified
            if (isOutputFileSpecified()) {
                fileDeltas = this.getAllSourceFiles();
            }

            this.build(fileDeltas, monitor);
        }
    }

    private ImmutableList<FileDelta> getAllSourceFiles() {
        ImmutableList<IFile> files = EclipseResources.getTypeScriptFiles(this.getProject());
        ImmutableList.Builder<FileDelta> fileDeltas = ImmutableList.builder();

        for (IFile file : files) {
            fileDeltas.add(new FileDelta(Delta.ADDED, file));
        }

        return fileDeltas.build();
    }

    private void clean(List<FileDelta> fileDeltas, IProgressMonitor monitor) throws CoreException {
        for (FileDelta fileDelta : fileDeltas) {
            Delta delta = fileDelta.getDelta();

            if (delta == Delta.REMOVED) {
                String removedFileName = fileDelta.getFileName();

                // skip ambient declaration files
                if (removedFileName.endsWith(".d.ts")) {
                    continue;
                }

                cleanEmittedFile(removedFileName, ".d.ts", monitor);
                cleanEmittedFile(removedFileName, ".js", monitor);
                cleanEmittedFile(removedFileName, ".js.map", monitor);
            }
        }
    }

    private void compile(List<FileDelta> fileDeltas, IProgressMonitor monitor) throws CoreException {
        for (FileDelta fileDelta : fileDeltas) {
            Delta delta = fileDelta.getDelta();

            if (delta == Delta.ADDED || delta == Delta.CHANGED) {
                String fileName = fileDelta.getFileName();

                // skip ambient declaration files
                if (fileName.endsWith(".d.ts")) {
                    continue;
                }

                // compile the file
                try {
                    this.compile(fileName, monitor);
                } catch (RuntimeException e) {
                    String errorMessage = "Compilation of '" + fileName + "' failed.";
                    Status status = new Status(IStatus.ERROR, TypeScriptPlugin.ID, errorMessage, e);

                    TypeScriptPlugin.getDefault().getLog().log(status);
                }
            }
        }
    }

    private void compile(String fileName, IProgressMonitor monitor) throws CoreException {
        for (OutputFile outputFile : this.languageEndpoint.getEmitOutput(this.getProject(), fileName)) {
            String outputFileName = outputFile.getName();
            IFile eclipseFile = EclipseResources.getFile(outputFileName);
            String filePath = EclipseResources.getFilePath(eclipseFile);
            File file = new File(filePath);

            // write the file
            try {
                Files.createParentDirs(file);
                Files.write(outputFile.getText(), file, Charsets.UTF_8);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

            // refresh the file so that eclipse knows about it
            eclipseFile.refreshLocal(IResource.DEPTH_ZERO, monitor);
        }
    }

    private boolean isOutputFileSpecified() {
        IPreferenceStore projectPreferenceStore = new ProjectPreferenceStore(this.getProject());

        return !Strings.isNullOrEmpty(projectPreferenceStore.getString(IPreferenceConstants.COMPILER_OUTPUT_FILE_OPTION));
    }

    private static void createMarkers(IProject project, IProgressMonitor monitor) throws CoreException {
        final Map<String, List<DiagnosticEx>> diagnostics = TypeScriptPlugin.getDefault().getBuilderLanguageEndpoint().getAllDiagnostics(project);

        // create the markers within a workspace runnable for greater efficiency
        IWorkspaceRunnable runnable = new IWorkspaceRunnable() {
            @Override
            public void run(IProgressMonitor runnableMonitor) throws CoreException {
                createMarkers(diagnostics);
            }
        };
        ResourcesPlugin.getWorkspace().run(runnable, project, IWorkspace.AVOID_UPDATE, monitor);
    }

    private static void createMarkers(final Map<String, List<DiagnosticEx>> diagnostics) throws CoreException {
        for (Map.Entry<String, List<DiagnosticEx>> entry : diagnostics.entrySet()) {
            String fileName = entry.getKey();

            // create the markers for this file
            IFile file = EclipseResources.getFile(fileName);
            List<DiagnosticEx> fileDiagnostics = entry.getValue();
            for (DiagnosticEx diagnostic : fileDiagnostics) {
                IMarker marker = file.createMarker(MARKER_TYPE);
                Map<String, Object> attributes = createMarkerAttributes(diagnostic);

                marker.setAttributes(attributes);
            }
        }
    }

    private static Map<String, Object> createMarkerAttributes(DiagnosticEx diagnostic) {
        ImmutableMap.Builder<String, Object> attributes = ImmutableMap.builder();

        attributes.put(IMarker.CHAR_START, diagnostic.getStart());
        attributes.put(IMarker.CHAR_END, diagnostic.getStart() + diagnostic.getLength());
        attributes.put(IMarker.LINE_NUMBER, diagnostic.getLine() + 1);
        attributes.put(IMarker.MESSAGE, diagnostic.getText());
        attributes.put(IMarker.PRIORITY, IMarker.PRIORITY_NORMAL);
        attributes.put(IMarker.SEVERITY, IMarker.SEVERITY_ERROR);

        return attributes.build();
    }

    private static void cleanEmittedFile(String removedFileName, String extension, IProgressMonitor monitor) throws CoreException {
        String fileName = removedFileName.substring(0, removedFileName.length() - 3) + extension;
        IFile eclipseFile = EclipseResources.getFile(fileName);
        String filePath = EclipseResources.getFilePath(eclipseFile);
        File file = new File(filePath);

        // delete the file
        file.delete();

        // refresh the file so that eclipse knows about it
        eclipseFile.refreshLocal(IResource.DEPTH_ZERO, monitor);
    }
}
