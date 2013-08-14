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

import org.eclipse.core.resources.IncrementalProjectBuilder;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.core.runtime.jobs.Job;
import org.eclipse.jface.dialogs.IDialogConstants;
import org.eclipse.jface.dialogs.MessageDialog;
import org.eclipse.jface.preference.BooleanFieldEditor;
import org.eclipse.jface.preference.ComboFieldEditor;
import org.eclipse.jface.preference.FieldEditor;
import org.eclipse.jface.preference.FieldEditorPreferencePage;
import org.eclipse.jface.util.PropertyChangeEvent;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPreferencePage;

import com.google.common.base.Ascii;
import com.palantir.typescript.services.language.LanguageVersion;
import com.palantir.typescript.services.language.ModuleGenTarget;

/**
 * The compiler preference page.
 *
 * @author tyleradams
 */
public final class CompilerPreferencePage extends FieldEditorPreferencePage implements IWorkbenchPreferencePage {

    private boolean compilerPreferencesModified;

    private BooleanFieldEditor compileOnSaveField;
    private ComboFieldEditor moduleGenTargetField;
    private BooleanFieldEditor removeCommentsField;
    private BooleanFieldEditor sourceMapField;

    public CompilerPreferencePage() {
        super(FieldEditorPreferencePage.GRID);

        this.setPreferenceStore(TypeScriptPlugin.getDefault().getPreferenceStore());
    }

    @Override
    public void init(IWorkbench workbench) {
    }

    @Override
    public boolean performOk() {
        final boolean process;

        // offer to rebuild the workspace if the compiler preferences were modified
        if (this.compilerPreferencesModified) {
            String title = Resources.BUNDLE.getString("preferences.compiler.rebuild.dialog.title");
            String message = Resources.BUNDLE.getString("preferences.compiler.rebuild.dialog.message");
            String[] buttonLabels = new String[] { IDialogConstants.NO_LABEL, IDialogConstants.CANCEL_LABEL, IDialogConstants.YES_LABEL };
            MessageDialog dialog = new MessageDialog(getShell(), title, null, message, MessageDialog.QUESTION, buttonLabels, 2);
            int result = dialog.open();

            if (result == 1) { // cancel
                process = false;
            } else {
                // yes/no
                process = super.performOk();

                // rebuild the workspace
                if (result == 2) {
                    String name = Resources.BUNDLE.getString("preferences.compiler.rebuild.job.name");
                    Job job = new Job(name) {
                        @Override
                        protected IStatus run(IProgressMonitor monitor) {
                            try {
                                ResourcesPlugin.getWorkspace().build(IncrementalProjectBuilder.FULL_BUILD, monitor);
                            } catch (CoreException e) {
                                return e.getStatus();
                            }

                            return Status.OK_STATUS;
                        }
                    };
                    job.setRule(ResourcesPlugin.getWorkspace().getRuleFactory().buildRule());
                    job.schedule();
                }
            }

            this.compilerPreferencesModified = false;
        } else {
            process = super.performOk();
        }

        return process;
    }

    @Override
    public void propertyChange(PropertyChangeEvent event) {
        super.propertyChange(event);

        Object source = event.getSource();

        if (source.equals(this.compileOnSaveField) && event.getProperty().equals(FieldEditor.VALUE)) {
            this.synchronizeCompileOnSave();
        }

        if (source.equals(this.compileOnSaveField)
                || source.equals(this.moduleGenTargetField)
                || source.equals(this.removeCommentsField)
                || source.equals(this.sourceMapField)) {
            this.compilerPreferencesModified = true;
        }
    }

    @Override
    protected void createFieldEditors() {
        this.addField(new ComboFieldEditor(
            IPreferenceConstants.COMPILER_CODE_GEN_TARGET,
            getResource("code.gen.target"),
            this.createComboFieldValues(LanguageVersion.values()),
            getFieldEditorParent()));

        this.moduleGenTargetField = new ComboFieldEditor(
            IPreferenceConstants.COMPILER_MODULE_GEN_TARGET,
            getResource("module.gen.target"),
            this.createComboFieldValues(ModuleGenTarget.values()),
            getFieldEditorParent());
        this.addField(this.moduleGenTargetField);

        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_NO_LIB,
            getResource("no.lib"),
            getFieldEditorParent()));

        this.compileOnSaveField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_COMPILE_ON_SAVE,
            getResource("compile.on.save"),
            getFieldEditorParent());
        this.addField(this.compileOnSaveField);

        this.sourceMapField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_MAP_SOURCE_FILES,
            getResource("map.source.files"),
            getFieldEditorParent());
        this.addField(this.sourceMapField);

        this.removeCommentsField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_REMOVE_COMMENTS,
            getResource("remove.comments"),
            getFieldEditorParent());
        this.addField(this.removeCommentsField);
    }

    @Override
    protected void initialize() {
        super.initialize();

        this.synchronizeCompileOnSave();
    }

    @Override
    protected void performDefaults() {
        super.performDefaults();

        this.synchronizeCompileOnSave();
    }

    private String[][] createComboFieldValues(Enum[] enums) {
        checkNotNull(enums);

        String[][] fieldValues = new String[enums.length][2];
        for (int i = 0; i < enums.length; i++) {
            String key = enums[i].name();
            String resourceKey = Ascii.toLowerCase(key).replace("_", ".");

            fieldValues[i][0] = getResource(resourceKey);
            fieldValues[i][1] = key;
        }

        return fieldValues;
    }

    private void synchronizeCompileOnSave() {
        boolean enabled = this.compileOnSaveField.getBooleanValue();
        Composite parent = this.getFieldEditorParent();

        this.removeCommentsField.setEnabled(enabled, parent);
        this.sourceMapField.setEnabled(enabled, parent);
    }

    private static String getResource(String key) {
        return Resources.BUNDLE.getString("preferences.compiler." + key);
    }
}
