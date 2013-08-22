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

import java.util.ArrayList;
import java.util.Collection;
import java.util.StringTokenizer;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IWorkspace;
import org.eclipse.core.resources.IncrementalProjectBuilder;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Path;
import org.eclipse.core.runtime.Status;
import org.eclipse.core.runtime.jobs.Job;
import org.eclipse.jface.dialogs.IDialogConstants;
import org.eclipse.jface.dialogs.IInputValidator;
import org.eclipse.jface.dialogs.InputDialog;
import org.eclipse.jface.dialogs.MessageDialog;
import org.eclipse.jface.preference.FieldEditorPreferencePage;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.preference.ListEditor;
import org.eclipse.jface.util.PropertyChangeEvent;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPreferencePage;
import org.eclipse.ui.IWorkbenchPropertyPage;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;

/**
 * A preference/properties page that enable to specify inclusion and exclusion filters for the
 * resources to be considered for TypeScript related functionalities.
 * <p>
 * If used as a preference page, it will store the preferences in the plugin
 * {@link IPreferenceStore}. If used a property page, only available for project resources with the
 * {@link ProjectNature}, it will store the preferences in the project properties.
 * 
 * @author rserafin
 */
public final class ExclusionInclusionPatternsPage extends FieldEditorPreferencePage implements IWorkbenchPropertyPage,
        IWorkbenchPreferencePage {

    private IProject project;
    private IPreferenceStore projectPreferenceStore;

    private ExclusionPatternsListFieldEditor exclusionPatternsList;
    private ExclusionPatternsListFieldEditor inclusionPatternsList;

    private boolean needsRecompile;

    /**
     * Constructor.
     */
    public ExclusionInclusionPatternsPage() {
        super(FieldEditorPreferencePage.GRID);
    }

    /* (non-Javadoc)
     * @see org.eclipse.ui.IWorkbenchPropertyPage#getElement()
     */
    @Override
    public IAdaptable getElement() {
        return this.project;
    }

    /* (non-Javadoc)
     * @see org.eclipse.ui.IWorkbenchPropertyPage#setElement(org.eclipse.core.runtime.IAdaptable)
     */
    @Override
    public void setElement(final IAdaptable element) {
        this.project = (IProject) element.getAdapter(IProject.class);
        if (this.project != null) {
            this.projectPreferenceStore = BuildPathUtils.getBuildPathPreferenceStore(this.project);
        } else {
            this.projectPreferenceStore = null;
        }
    }

    @Override
    public IPreferenceStore getPreferenceStore() {
        if (this.projectPreferenceStore != null) {
            return this.projectPreferenceStore;
        } else {
            return TypeScriptPlugin.getDefault().getPreferenceStore();
        }
    }

    @Override
    protected void createFieldEditors() {
        this.inclusionPatternsList = new ExclusionPatternsListFieldEditor(
            IPreferenceConstants.COMPILER_INCLUSION_PATTERNS,
            getResource("filters.inclusion.patterns.list"),
            this.getFieldEditorParent());
        this.addField(this.inclusionPatternsList);

        this.exclusionPatternsList = new ExclusionPatternsListFieldEditor(
            IPreferenceConstants.COMPILER_EXCLUSION_PATTERNS,
            getResource("filters.exclusion.patterns.list"),
            this.getFieldEditorParent());
        this.exclusionPatternsList.setPropertyChangeListener(this);
        this.addField(this.exclusionPatternsList);
    }

    @Override
    public void propertyChange(final PropertyChangeEvent event) {
        super.propertyChange(event);
        final Object source = event.getSource();

        if (source.equals(this.inclusionPatternsList)
                || source.equals(this.exclusionPatternsList)) {
            this.needsRecompile = true;
        }
    }

    @Override
    public boolean performOk() {
        final boolean process;

        // offer to rebuild the workspace if the compiler preferences were modified
        if (this.needsRecompile) {
            final String title = Resources.BUNDLE.getString("preferences.compiler.rebuild.dialog.title");
            final String message = Resources.BUNDLE.getString("preferences.compiler.rebuild.dialog.message");
            final String[] buttonLabels = new String[] { IDialogConstants.NO_LABEL, IDialogConstants.CANCEL_LABEL,
                    IDialogConstants.YES_LABEL };
            final MessageDialog dialog = new MessageDialog(this.getShell(), title, null, message, MessageDialog.QUESTION, buttonLabels, 2);
            final int result = dialog.open();

            if (result == 1) { // cancel
                process = false;
            } else {
                // yes/no
                process = super.performOk();

                // rebuild the workspace
                if (result == 2) {
                    final String name = Resources.BUNDLE.getString("preferences.compiler.rebuild.job.name");
                    final Job job = new Job(name) {
                        @Override
                        protected IStatus run(final IProgressMonitor monitor) {
                            if (ExclusionInclusionPatternsPage.this.project != null) {
                                final IProject proj = ExclusionInclusionPatternsPage.this.project;

                                try {
                                    this.rebuildProject(proj, monitor);
                                } catch (final CoreException e) {
                                    return e.getStatus();
                                }

                                return Status.OK_STATUS;
                            } else {
                                final IWorkspace workspace = ResourcesPlugin.getWorkspace();

                                try {
                                    final IProject[] projects = workspace.getRoot().getProjects();
                                    for (final IProject proj : projects) {
                                        this.rebuildProject(proj, monitor);
                                    }
                                } catch (final CoreException e) {
                                    return e.getStatus();
                                }

                                return Status.OK_STATUS;
                            }
                        }

                        private void rebuildProject(final IProject proj, final IProgressMonitor monitor) throws CoreException {
                            if (proj.hasNature(ProjectNature.ID)) {
                                proj.build(IncrementalProjectBuilder.CLEAN_BUILD, monitor);
                                proj.build(IncrementalProjectBuilder.FULL_BUILD, monitor);
                            }
                        }
                    };
                    job.setRule(ResourcesPlugin.getWorkspace().getRuleFactory().buildRule());
                    job.schedule();
                }
            }

            this.needsRecompile = false;
        } else {
            process = super.performOk();
        }

        return process;
    }

    private static String getResource(final String key) {
        return Resources.BUNDLE.getString("preferences.compiler." + key);
    }

    private static class ExclusionPatternsListFieldEditor extends ListEditor {

        public ExclusionPatternsListFieldEditor(final String name, final String labelText, final Composite parent) {
            super(name, labelText, parent);
        }

        @Override
        protected String createList(final String[] items) {
            final StringBuffer path = new StringBuffer("");

            for (int i = 0; i < items.length; i++) {
                path.append(items[i]);
                path.append(",");
            }
            return path.toString();
        }

        @Override
        protected String getNewInputObject() {
            final InputDialog dialog = new InputDialog(this.getShell(),
                getResource("filters.dialog.newpattern.title"),
                getResource("filters.dialog.newpattern.message"),
                "",
                new ExclusionInclusionPatternValidator(Lists.newArrayList(this.getList().getItems())));
            if (dialog.open() == IStatus.OK) {
                final String value = dialog.getValue();
                if (!Strings.isNullOrEmpty(value)) {
                    return value;
                }
            }

            return null;
        }

        @Override
        protected String[] parseString(final String stringList) {
            final StringTokenizer st = new StringTokenizer(stringList, "," + "\n\r");

            final ArrayList v = Lists.newArrayList();
            while (st.hasMoreElements()) {
                v.add(st.nextElement());
            }
            return (String[]) v.toArray(new String[v.size()]);
        }

        @Override
        protected void selectionChanged() {
            super.selectionChanged();

            if (this.getPreferenceStore() != null && this.getList() != null) {
                final String originalValue = this.getPreferenceStore().getString(this.getPreferenceName());
                final String newValue = this.createList(this.getList().getItems());
                if (!newValue.equals(originalValue)) {
                    this.fireValueChanged(VALUE, originalValue, newValue);
                }
            }
        }

    }

    private static class ExclusionInclusionPatternValidator implements IInputValidator {

        private final Collection<String> patterns;

        ExclusionInclusionPatternValidator(final Collection<String> patterns) {
            this.patterns = patterns;

        }

        @Override
        public String isValid(final String pattern) {
            if (pattern.length() == 0) {
                return getResource("filters.dialog.emptyPatternError");
            }
            final IPath path = new Path(pattern);
            if (path.isAbsolute() || path.getDevice() != null) {
                return getResource("filters.dialog.nonRelativePatternError");
            }
            if (this.patterns.contains(pattern)) {
                return getResource("filters.dialog.duplicatePatternError");
            }

            return null;
        }

    }

    @Override
    public void init(final IWorkbench arg0) {
    }
}
