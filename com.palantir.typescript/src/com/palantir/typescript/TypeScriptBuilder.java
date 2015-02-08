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
import java.util.Set;

import org.eclipse.core.resources.ICommand;
import org.eclipse.core.resources.IContainer;
import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IFolder;
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
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.jface.preference.IPreferenceStore;

import com.google.common.base.Charsets;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;
import com.google.common.io.Files;
import com.palantir.typescript.TypeScriptProjects.Folders;
import com.palantir.typescript.preferences.ProjectPreferenceStore;
import com.palantir.typescript.services.language.DiagnosticEx;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.FileDelta.Delta;
import com.palantir.typescript.services.language.LanguageEndpoint;
import com.palantir.typescript.services.language.OutputFile;
import com.palantir.typescript.services.language.TodoCommentEx;

/**
 * The TypeScript builder transpiles TypeScript files into JavaScript.
 *
 * @author dcicerone
 */
public final class TypeScriptBuilder extends IncrementalProjectBuilder {

    public static final String ID = "com.palantir.typescript.typeScriptBuilder";

    private static final String PROBLEM_MARKER_TYPE = "com.palantir.typescript.typeScriptProblem";
    private static final String TASK_MARKER_TYPE = "com.palantir.typescript.typeScriptTask";

    private final LanguageEndpoint languageEndpoint;

    public TypeScriptBuilder() {
        this.languageEndpoint = TypeScriptPlugin.getDefault().getBuilderLanguageEndpoint();
    }

    @Override
    protected IProject[] build(int kind, Map<String, String> args, IProgressMonitor monitor) throws CoreException {
        checkNotNull(monitor);

        // incremental or full build
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

        // delete built files if compile-on-save is enabled
        IPreferenceStore projectPreferenceStore = new ProjectPreferenceStore(this.getProject());
        if (projectPreferenceStore.getBoolean(IPreferenceConstants.COMPILER_COMPILE_ON_SAVE) && !isOutputFileSpecified()) {
            Set<FileDelta> fileDeltas = getAllSourceFiles(Delta.REMOVED);

            this.clean(fileDeltas, monitor);
        }

        // clean the language service in case it is out-of-sync
        this.languageEndpoint.cleanProject(this.getProject());

        // clear the problem markers
        this.getProject().deleteMarkers(PROBLEM_MARKER_TYPE, true, IResource.DEPTH_INFINITE);
        this.getProject().deleteMarkers(TASK_MARKER_TYPE, true, IResource.DEPTH_INFINITE);
    }

    @Override
    protected void startupOnInitialize() {
        super.startupOnInitialize();

        this.languageEndpoint.initializeProject(this.getProject());
    }

    private void fullBuild(IProgressMonitor monitor) throws CoreException {
        Set<FileDelta> fileDeltas = this.getAllSourceFiles(Delta.ADDED);

        // initialize the project in the language service to ensure it is up-to-date
        this.languageEndpoint.initializeProject(this.getProject());

        this.build(fileDeltas, monitor);
    }

    private void incrementalBuild(IProgressMonitor monitor) throws CoreException {
        IProject project = this.getProject();
        IResourceDelta delta = this.getDelta(project);

        // update all source and exported files in the language service
        Set<FileDelta> allFileDeltas = TypeScriptProjects.getFileDeltas(project, Folders.SOURCE_AND_EXPORTED, delta);
        if (!allFileDeltas.isEmpty()) {
            this.languageEndpoint.updateFiles(allFileDeltas);
        }

        // build the modified source files
        Set<FileDelta> sourceFileDeltas = TypeScriptProjects.getFileDeltas(project, Folders.SOURCE, delta);
        if (!sourceFileDeltas.isEmpty()) {
            // replace the file deltas with all the source files if an output file is specified
            if (this.isOutputFileSpecified()) {
                sourceFileDeltas = this.getAllSourceFiles(Delta.ADDED);
            }

            this.build(sourceFileDeltas, monitor);
        }

        // re-create the markers for projects which reference this one
        for (IProject referencingProject : this.getProject().getReferencingProjects()) {
            if (!this.languageEndpoint.isProjectInitialized(referencingProject)) {
                this.languageEndpoint.initializeProject(referencingProject);
            }

            referencingProject.deleteMarkers(PROBLEM_MARKER_TYPE, true, IResource.DEPTH_INFINITE);
            referencingProject.deleteMarkers(TASK_MARKER_TYPE, true, IResource.DEPTH_INFINITE);
            this.createMarkers(referencingProject, monitor);
        }
    }

    private void build(Set<FileDelta> fileDeltas, IProgressMonitor monitor) throws CoreException {
        IPreferenceStore projectPreferenceStore = new ProjectPreferenceStore(this.getProject());

        // clear the problem and task markers
        this.getProject().deleteMarkers(PROBLEM_MARKER_TYPE, true, IResource.DEPTH_INFINITE);
        this.getProject().deleteMarkers(TASK_MARKER_TYPE, true, IResource.DEPTH_INFINITE);

        // compile the source files if compile-on-save is enabled
        if (projectPreferenceStore.getBoolean(IPreferenceConstants.COMPILER_COMPILE_ON_SAVE)) {
            this.ensureOutputFolderExists(monitor);

            if (isOutputFileSpecified()) {
                // pick the first file as the one to "compile" (like a full build)
                if (!fileDeltas.isEmpty()) {
                    String fileName = fileDeltas.iterator().next().getFileName();

                    this.compile(fileName, monitor);
                }
            } else {
                this.clean(fileDeltas, monitor);
                this.compile(fileDeltas, monitor);
            }
        }

        // create the problem markers
        this.createMarkers(this.getProject(), monitor);
    }

    private void ensureOutputFolderExists(IProgressMonitor monitor) throws CoreException {
        IPreferenceStore projectPreferenceStore = new ProjectPreferenceStore(this.getProject());

        // ensure the output directory exists if it was specified
        String outputFolderName = projectPreferenceStore.getString(IPreferenceConstants.COMPILER_OUT_DIR);
        if (!Strings.isNullOrEmpty(outputFolderName)) {
            IFolder outputFolder = this.getProject().getFolder(outputFolderName);

            if (!outputFolder.exists()) {
                EclipseResources.createParentDirs(outputFolder, monitor);

                // mark the folder as derived so built resources don't show up in file searches
                outputFolder.setDerived(true, monitor);
            }
        }
    }

    private Set<FileDelta> getAllSourceFiles(Delta withDelta) {
        ImmutableSet.Builder<FileDelta> fileDeltas = ImmutableSet.builder();

        IProject project = this.getProject();
        Set<IFile> files = TypeScriptProjects.getFiles(project, Folders.SOURCE);
        for (IFile file : files) {
            fileDeltas.add(new FileDelta(withDelta, file));
        }

        return fileDeltas.build();
    }

    private void clean(Set<FileDelta> fileDeltas, IProgressMonitor monitor) {
        IPath commonSourcePath = TypeScriptProjects.getCommonSourcePath(this.getProject());
        IContainer outputFolder = TypeScriptProjects.getOutputFolder(this.getProject());

        Set<FileDelta> deletedEmittedOutputToSend = Sets.newHashSet();
        for (FileDelta fileDelta : fileDeltas) {
            Delta delta = fileDelta.getDelta();

            if (delta == Delta.REMOVED) {
                String removedFileName = fileDelta.getFileName();
                IPath removedFilePath = EclipseResources.getFile(removedFileName).getFullPath();

                // skip ambient declaration files
                if (removedFileName.endsWith(".d.ts")) {
                    continue;
                }

                IFile definitionFile = deleteEmittedFile(removedFilePath, "d.ts", commonSourcePath, outputFolder, monitor);
                deleteEmittedFile(removedFilePath, "js", commonSourcePath, outputFolder, monitor);
                deleteEmittedFile(removedFilePath, "js.map", commonSourcePath, outputFolder, monitor);

                if (definitionFile != null) {
                    deletedEmittedOutputToSend.add(new FileDelta(Delta.REMOVED, definitionFile));
                }
            }
        }

        this.languageEndpoint.updateFiles(deletedEmittedOutputToSend);
    }

    private void compile(Set<FileDelta> fileDeltas, IProgressMonitor monitor) throws CoreException {
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
        IProject project = this.getProject();
        boolean isProjectReferenced = project.getReferencingProjects().length > 0;

        Set<FileDelta> emittedOutputToSend = Sets.newHashSet();
        for (OutputFile outputFile : this.languageEndpoint.getEmitOutput(project, fileName)) {
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

            // if this output file is going to be referenced by anything, the LanguageEndpoint needs
            // to know about it. we send it back over the bridge because the node side doesn't
            // know the filesystem path of the file and so can't create the FileInfo without this call.
            if (isProjectReferenced && TypeScriptProjects.isContainedInFolders(project, Folders.EXPORTED, eclipseFile)
                    && outputFileName.endsWith(".d.ts")) {
                emittedOutputToSend.add(new FileDelta(Delta.ADDED, eclipseFile));
            }
        }

        this.languageEndpoint.updateFiles(emittedOutputToSend);
    }

    private boolean isOutputFileSpecified() {
        IPreferenceStore projectPreferenceStore = new ProjectPreferenceStore(this.getProject());

        return !Strings.isNullOrEmpty(projectPreferenceStore.getString(IPreferenceConstants.COMPILER_OUT_FILE));
    }

    private void createMarkers(IProject project, IProgressMonitor monitor) throws CoreException {
        final Map<String, List<DiagnosticEx>> diagnostics = this.languageEndpoint.getAllDiagnostics(project);
        final Map<String, List<TodoCommentEx>> todos=this.languageEndpoint.getAllTodos(project);

        // create the markers within a workspace runnable for greater efficiency
        IWorkspaceRunnable runnable = new IWorkspaceRunnable() {
            @Override
            public void run(IProgressMonitor runnableMonitor) throws CoreException {
                createMarkers(diagnostics, todos);
            }
        };
        ResourcesPlugin.getWorkspace().run(runnable, project, IWorkspace.AVOID_UPDATE, monitor);
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

    private static void createMarkers(final Map<String, List<DiagnosticEx>> diagnostics,
            final Map<String, List<TodoCommentEx>> todoComments) throws CoreException {
        for (Map.Entry<String, List<DiagnosticEx>> entry : diagnostics.entrySet()) {
            String fileName = entry.getKey();

            // create the problem markers for this file
            IFile file = EclipseResources.getFile(fileName);
            List<DiagnosticEx> fileDiagnostics = entry.getValue();
            for (DiagnosticEx diagnostic : fileDiagnostics) {
                IMarker marker = file.createMarker(PROBLEM_MARKER_TYPE);
                Map<String, Object> attributes = createProblemMarkerAttributes(diagnostic);

                marker.setAttributes(attributes);
            }
        }
        for (Map.Entry<String, List<TodoCommentEx>> entry : todoComments.entrySet()) {
            String fileName = entry.getKey();

            // create the task markers for this file
            IFile file = EclipseResources.getFile(fileName);
            List<TodoCommentEx> todos= entry.getValue();
            for (TodoCommentEx todo : todos) {
                IMarker marker = file.createMarker(TASK_MARKER_TYPE);
                Map<String, Object> attributes = createTaskMarkerAttributes(todo);

                marker.setAttributes(attributes);
            }
        }
    }

    private static Map<String, Object> createProblemMarkerAttributes(DiagnosticEx diagnostic) {
        ImmutableMap.Builder<String, Object> attributes = ImmutableMap.builder();

        attributes.put(IMarker.CHAR_START, diagnostic.getStart());
        attributes.put(IMarker.CHAR_END, diagnostic.getStart() + diagnostic.getLength());
        attributes.put(IMarker.LINE_NUMBER, diagnostic.getLine() + 1);
        attributes.put(IMarker.MESSAGE, diagnostic.getText());
        attributes.put(IMarker.PRIORITY, IMarker.PRIORITY_NORMAL);
        attributes.put(IMarker.SEVERITY, IMarker.SEVERITY_ERROR);

        return attributes.build();
    }

    private static Map<String, Object> createTaskMarkerAttributes(TodoCommentEx todo) {
        ImmutableMap.Builder<String, Object> attributes = ImmutableMap.builder();

        attributes.put(IMarker.CHAR_START, todo.getStart());
        attributes.put(IMarker.CHAR_END, todo.getStart() + todo.getText().length());
        attributes.put(IMarker.LINE_NUMBER, todo.getLine() + 1);
        attributes.put(IMarker.MESSAGE, todo.getText());
        attributes.put(IMarker.PRIORITY, todo.getPriority());
        attributes.put(IMarker.SEVERITY, IMarker.SEVERITY_INFO);

        return attributes.build();
    }

    private static IFile deleteEmittedFile(
            IPath sourceFilePath,
            String extension,
            IPath commonSourcePath,
            IContainer outputFolder,
            IProgressMonitor monitor) {

        IPath emittedPath = null;
        if (outputFolder == null || commonSourcePath == null) {
            emittedPath = sourceFilePath.removeFileExtension().addFileExtension(extension);
        } else {
            emittedPath = outputFolder.getFullPath().append(
                sourceFilePath
                    .makeRelativeTo(commonSourcePath)
                    .removeFileExtension()
                    .addFileExtension(extension));
        }

        IFile emittedFile = ResourcesPlugin.getWorkspace().getRoot().getFile(emittedPath);
        try {
            emittedFile.delete(true, monitor);
        } catch (CoreException e) {
            // indicate that nothing was deleted
            return null;
        }
        return emittedFile;
    }
}
