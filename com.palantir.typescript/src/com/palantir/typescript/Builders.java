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
import org.eclipse.core.resources.IWorkspace;
import org.eclipse.core.resources.IncrementalProjectBuilder;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.core.runtime.jobs.Job;
import org.eclipse.jface.dialogs.IDialogConstants;
import org.eclipse.jface.dialogs.MessageDialog;
import org.eclipse.swt.widgets.Shell;

import com.google.common.collect.ImmutableList;

/**
 * Utility class to invoke common build activities.
 *
 * @author rserafin
 */
public final class Builders {

    /**
     * Prompts user to rebuild either the project or the whole workspace.
     *
     * @param shell
     *            parent shell
     * @param onlyProject
     *            the project to be rebuilt or null if the whole workpsace has to be rebuilt
     * @return true if user accepted the recompilation
     */
    public static boolean promptRecompile(Shell shell, IProject onlyProject) {
        String title = Resources.BUNDLE.getString("preferences.compiler.rebuild.dialog.title");
        String message = Resources.BUNDLE.getString("preferences.compiler.rebuild.dialog.message");
        String[] buttonLabels = new String[] { IDialogConstants.NO_LABEL, IDialogConstants.CANCEL_LABEL, IDialogConstants.YES_LABEL };
        MessageDialog dialog = new MessageDialog(shell, title, null, message, MessageDialog.QUESTION, buttonLabels, 2);
        int result = dialog.open();

        boolean process = false;
        if (result != 1) { // cancel
            process = true;

            // rebuild the workspace
            if (result == 2) {
                if (onlyProject != null) {
                    Builders.rebuildProject(onlyProject);
                } else {
                    Builders.rebuildWorkspace();
                }
            }
        }
        return process;
    }

    /**
     * Forces a full clean/rebuild of all the workspace project that have the TypeScript nature.
     */
    public static void rebuildWorkspace() {
        IWorkspace workspace = ResourcesPlugin.getWorkspace();

        rebuildProjects(ImmutableList.copyOf(workspace.getRoot().getProjects()));
    }

    /**
     * Forces a full clean rebuild of the given TypeScript project.
     *
     * @param project
     *            the project
     */
    public static void rebuildProject(IProject project) {
        rebuildProjects(ImmutableList.of(project));
    }

    private static void rebuildProjects(final List<IProject> projects) {
        String name = Resources.BUNDLE.getString("preferences.compiler.rebuild.job.name");
        Job job = new Job(name) {
            @Override
            protected IStatus run(IProgressMonitor monitor) {
                try {
                    for (IProject project : projects) {
                        if (project.isOpen() && project.hasNature(ProjectNature.ID)) {
                            project.build(IncrementalProjectBuilder.CLEAN_BUILD, TypeScriptBuilder.ID, null, monitor);
                            project.build(IncrementalProjectBuilder.FULL_BUILD, TypeScriptBuilder.ID, null, monitor);
                        }
                    }

                    return Status.OK_STATUS;
                } catch (CoreException e) {
                    return e.getStatus();
                }
            }
        };
        job.setRule(ResourcesPlugin.getWorkspace().getRuleFactory().buildRule());
        job.schedule();
    }

    private Builders() {
        // prevent instantiation
    }
}
