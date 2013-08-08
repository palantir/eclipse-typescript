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
import com.palantir.typescript.services.language.CompilationSettings;
import com.palantir.typescript.services.language.Diagnostic;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.LanguageService;
import com.palantir.typescript.services.language.LanguageVersion;
import com.palantir.typescript.services.language.ModuleGenTarget;

/**
 * The TypeScript builder transpiles TypeScript files into JavaScript.
 *
 * @author dcicerone
 */
public final class TypeScriptBuilder extends IncrementalProjectBuilder {

    public static final String ID = "com.palantir.typescript.typeScriptBuilder";

    private static final String MARKER_TYPE = "com.palantir.typescript.typeScriptProblem";

    private LanguageService languageService;

    @Override
    protected void startupOnInitialize() {
        super.startupOnInitialize();

        this.languageService = new LanguageService(this.getProject());
    }

    @Override
    protected IProject[] build(int kind, Map args, IProgressMonitor monitor) throws CoreException {
        checkNotNull(monitor);

        IPreferenceStore store = TypeScriptPlugin.getDefault().getPreferenceStore();

        if (store.getBoolean(IPreferenceConstants.COMPILER_COMPILE_ON_SAVE)) {
            this.languageService.setCompilationSettings(this.getWorkspaceCompilationSettings(store));

            switch (kind) {
                case IncrementalProjectBuilder.AUTO_BUILD:
                case IncrementalProjectBuilder.INCREMENTAL_BUILD:
                    this.incrementalBuild(monitor);
                    break;
                case IncrementalProjectBuilder.FULL_BUILD:
                    this.fullBuild(monitor);
                    break;
            }
        } else {
            this.updateMarkers();
        }

        return null;
    }

    private CompilationSettings getWorkspaceCompilationSettings(IPreferenceStore store) {
        return new CompilationSettings(
            store.getBoolean(IPreferenceConstants.COMPILER_NO_LIB),
            LanguageVersion.valueOf(store.getString(IPreferenceConstants.COMPILER_CODE_GEN_TARGET)),
            ModuleGenTarget.valueOf(store.getString(IPreferenceConstants.COMPILER_MODULE_GEN_TARGET)),
            store.getBoolean(IPreferenceConstants.COMPILER_MAP_SOURCE_FILES),
            store.getBoolean(IPreferenceConstants.COMPILER_REMOVE_COMMENTS));
    }

    private void incrementalBuild(IProgressMonitor monitor)
            throws CoreException {
        checkNotNull(monitor);

        this.processFiles(this.getChangedTypeScriptFiles(this.getDelta(this.getProject())), monitor);
    }

    private void fullBuild(IProgressMonitor monitor)
            throws CoreException {
        checkNotNull(monitor);

        this.processFiles(this.getAllTypeScriptFiles(FileDelta.Delta.ADDED), monitor);
    }

    private List<FileDelta> getChangedTypeScriptFiles(IResourceDelta delta) throws CoreException {
        checkNotNull(delta);

        ResourceDeltaVisitor visitor = new ResourceDeltaVisitor(this.getProject());
        delta.accept(visitor);
        return visitor.getDeltas();
    }

    private ImmutableList<FileDelta> getAllTypeScriptFiles(final FileDelta.Delta delta) throws CoreException {
        final ImmutableList.Builder<FileDelta> files = ImmutableList.builder();
        this.getProject().accept(new IResourceVisitor() {
            @Override
            public boolean visit(IResource resource) throws CoreException {
                if (resource.getType() == IResource.FILE && resource.getName().endsWith(".ts")) {
                    String fileName = resource.getRawLocation().toOSString();
                    files.add(new FileDelta(delta, fileName));
                }
                return true;
            }
        });
        return files.build();
    }

    private void processFiles(List<FileDelta> fileDeltas, IProgressMonitor monitor)
            throws CoreException {
        checkNotNull(fileDeltas);
        checkNotNull(monitor);

        this.updateMarkers();

        for (FileDelta fileDelta : fileDeltas) {
            String fileName = fileDelta.getFileName();

            this.removeDerivedFiles(fileName, monitor);

            switch (fileDelta.getDelta()) {
                case ADDED:
                case CHANGED:
                    try {
                        this.compileFile(fileName, monitor);
                    } catch (RuntimeException e) {
                        String errorMessage = "Could not compile " + fileName;
                        Status status = new Status(IStatus.ERROR, TypeScriptPlugin.ID, errorMessage, e);

                        TypeScriptPlugin.getDefault().getLog().log(status);
                    }
                    break;
                default:
                    break;
            }
        }
    }

    private void compileFile(String fileName, IProgressMonitor monitor) throws CoreException {
        checkNotNull(fileName);
        checkNotNull(monitor);

        for (String outputFileName : this.languageService.getEmitOutput(fileName)) {
            Path path = new Path(outputFileName);
            IFile file = ResourcesPlugin.getWorkspace().getRoot().getFileForLocation(path);

            file.refreshLocal(IResource.DEPTH_ZERO, monitor);
        }
    }

    private void removeDerivedFiles(String fileName, IProgressMonitor monitor) throws CoreException {
        checkNotNull(fileName);
        checkNotNull(monitor);

        for (String derivedFile : this.getDerivedFiles(fileName)) {
            Path path = new Path(derivedFile);
            IFile file = ResourcesPlugin.getWorkspace().getRoot().getFileForLocation(path);
            file.refreshLocal(IResource.DEPTH_ZERO, monitor);
            if (file.exists()) {
                file.delete(false, monitor);
            }
        }

    }

    private ImmutableList<String> getDerivedFiles(String fileName) {
        checkNotNull(fileName);

        ImmutableList.Builder<String> derivedFiles = ImmutableList.builder();

        derivedFiles.add(fileName.replaceFirst(".ts$", ".js"));
        derivedFiles.add(fileName.replaceFirst(".ts$", ".js.map"));

        return derivedFiles.build();
    }

    private void updateMarkers() throws CoreException {

        this.getProject().deleteMarkers(MARKER_TYPE, true, IResource.DEPTH_INFINITE);

        Map<String, List<Diagnostic>> diagnostics = this.languageService.getAllDiagnostics();

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

    @Override
    protected void clean(IProgressMonitor monitor) throws CoreException {
        checkNotNull(monitor);

        this.getProject().deleteMarkers(MARKER_TYPE, true, IResource.DEPTH_INFINITE);

        for (FileDelta fileDelta : this.getAllTypeScriptFiles(FileDelta.Delta.REMOVED)) {
            this.removeDerivedFiles(fileDelta.getFileName(), monitor);
        }
    }
}
