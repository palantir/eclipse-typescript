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

package com.palantir.typescript.preferences;

import static com.google.common.base.Preconditions.checkNotNull;

import org.eclipse.core.resources.IProject;
import org.eclipse.jface.dialogs.IDialogConstants;
import org.eclipse.jface.dialogs.MessageDialog;
import org.eclipse.jface.preference.BooleanFieldEditor;
import org.eclipse.jface.preference.ComboFieldEditor;
import org.eclipse.jface.preference.FieldEditor;
import org.eclipse.jface.preference.FieldEditorPreferencePage;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.util.PropertyChangeEvent;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPreferencePage;

import com.google.common.base.Ascii;
import com.palantir.typescript.Builders;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.Resources;
import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.services.language.JsxEmit;
import com.palantir.typescript.services.language.ModuleKind;
import com.palantir.typescript.services.language.ModuleResolutionKind;
import com.palantir.typescript.services.language.ScriptTarget;

/**
 * The compiler preference page.
 *
 * @author tyleradams
 */
public final class CompilerPreferencePage extends FieldEditorProjectPreferencePage implements IWorkbenchPreferencePage {

    private boolean compilerPreferencesModified;

    private BooleanFieldEditor compileOnSaveField;
    private BooleanFieldEditor declarationField;
    private BooleanFieldEditor experimentalDecoratorsField;
    private BooleanFieldEditor inlineSourceMapField;
    private BooleanFieldEditor inlineSourcesField;
    private ComboFieldEditor jsxField;
    private ComboFieldEditor moduleField;
    private ComboFieldEditor moduleResolutionField;
    private BooleanFieldEditor noEmitOnErrorField;
    private BooleanFieldEditor noFallthroughCasesInSwitchField;
    private BooleanFieldEditor noImplicitAnyField;
    private BooleanFieldEditor noImplicitReturnsField;
    private BooleanFieldEditor noLibField;
    private BooleanFieldEditor removeCommentsField;
    private BooleanFieldEditor sourceMapField;
    private BooleanFieldEditor suppressExcessPropertyErrorsField;
    private BooleanFieldEditor suppressImplicitAnyIndexErrorsField;
    private ComboFieldEditor targetField;

    public CompilerPreferencePage() {
        super(FieldEditorPreferencePage.GRID);
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
            MessageDialog dialog = new MessageDialog(this.getShell(), title, null, message, MessageDialog.QUESTION, buttonLabels, 2);
            int result = dialog.open();

            if (result == 1) { // cancel
                process = false;
            } else {
                // yes/no
                process = super.performOk();

                // rebuild the workspace
                if (result == 2) {
                    if (this.isPropertyPage()) {
                        IProject project = (IProject) this.getElement().getAdapter(IProject.class);

                        Builders.rebuildProject(project);
                    } else {
                        Builders.rebuildWorkspace();
                    }
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

        if (event.getProperty().equals(FieldEditor.VALUE)) {
            if (source.equals(this.compileOnSaveField)
                    || source.equals(this.inlineSourceMapField)
                    || source.equals(this.noImplicitAnyField)
                    || source.equals(this.sourceMapField)) {
                this.updateFieldEditors();
            }
        }

        if (source.equals(this.compileOnSaveField)
                || source.equals(this.declarationField)
                || source.equals(this.experimentalDecoratorsField)
                || source.equals(this.inlineSourceMapField)
                || source.equals(this.inlineSourcesField)
                || source.equals(this.jsxField)
                || source.equals(this.moduleField)
                || source.equals(this.moduleResolutionField)
                || source.equals(this.noEmitOnErrorField)
                || source.equals(this.noFallthroughCasesInSwitchField)
                || source.equals(this.noImplicitAnyField)
                || source.equals(this.noImplicitReturnsField)
                || source.equals(this.noLibField)
                || source.equals(this.removeCommentsField)
                || source.equals(this.sourceMapField)
                || source.equals(this.suppressExcessPropertyErrorsField)
                || source.equals(this.suppressImplicitAnyIndexErrorsField)
                || source.equals(this.targetField)) {
            this.compilerPreferencesModified = true;
        }
    }

    @Override
    protected void createFieldEditors() {
        this.targetField = new ComboFieldEditor(
            IPreferenceConstants.COMPILER_TARGET,
            getResource("target"),
            this.createComboFieldValues(ScriptTarget.values()),
            this.getFieldEditorParent());
        this.addField(this.targetField);

        this.jsxField = new ComboFieldEditor(
            IPreferenceConstants.COMPILER_JSX,
            getResource("jsx"),
            this.createComboFieldValues(JsxEmit.values()),
            this.getFieldEditorParent());
        this.addField(this.jsxField);

        this.moduleField = new ComboFieldEditor(
            IPreferenceConstants.COMPILER_MODULE,
            getResource("module"),
            this.createComboFieldValues(ModuleKind.values()),
            this.getFieldEditorParent());
        this.addField(this.moduleField);

        this.moduleResolutionField = new ComboFieldEditor(
            IPreferenceConstants.COMPILER_MODULE_RESOLUTION,
            getResource("module.resolution"),
            this.createComboFieldValues(ModuleResolutionKind.values()),
            this.getFieldEditorParent());
        this.addField(this.moduleResolutionField);

        this.noEmitOnErrorField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_NO_EMIT_ON_ERROR,
            getResource("no.emit.on.error"),
            this.getFieldEditorParent());
        this.addField(this.noEmitOnErrorField);

        this.noFallthroughCasesInSwitchField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_NO_FALLTHROUGH_CASES_IN_SWITCH,
            getResource("no.fallthrough.cases.in.switch"),
            this.getFieldEditorParent());
        this.addField(this.noFallthroughCasesInSwitchField);

        this.noImplicitAnyField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_NO_IMPLICIT_ANY,
            getResource("no.implicit.any"),
            this.getFieldEditorParent());
        this.addField(this.noImplicitAnyField);

        this.noImplicitReturnsField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_NO_IMPLICIT_RETURNS,
            getResource("no.implicit.returns"),
            this.getFieldEditorParent());
        this.addField(this.noImplicitReturnsField);

        this.suppressExcessPropertyErrorsField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_SUPPRESS_EXCESS_PROPERTY_ERRORS,
            getResource("suppress.excess.property.errors"),
            this.getFieldEditorParent());
        this.addField(this.suppressExcessPropertyErrorsField);

        this.suppressImplicitAnyIndexErrorsField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_SUPPRESS_IMPLICIT_ANY_INDEX_ERRORS,
            getResource("suppress.implicit.any.index.errors"),
            this.getFieldEditorParent());
        this.addField(this.suppressImplicitAnyIndexErrorsField);

        this.noLibField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_NO_LIB,
            getResource("no.lib"),
            this.getFieldEditorParent());
        this.addField(this.noLibField);

        this.experimentalDecoratorsField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_EXPERIMENTAL_DECORATORS,
            getResource("experimental.decorators"),
            this.getFieldEditorParent());
        this.addField(this.experimentalDecoratorsField);

        this.compileOnSaveField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_COMPILE_ON_SAVE,
            getResource("compile.on.save"),
            this.getFieldEditorParent());
        this.addField(this.compileOnSaveField);

        this.sourceMapField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_SOURCE_MAP,
            getResource("source.map"),
            this.getFieldEditorParent());
        this.addField(this.sourceMapField);

        this.inlineSourceMapField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_INLINE_SOURCE_MAP,
            getResource("inline.source.map"),
            this.getFieldEditorParent());
        this.addField(this.inlineSourceMapField);

        this.inlineSourcesField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_INLINE_SOURCES,
            getResource("inline.sources"),
            this.getFieldEditorParent());
        this.addField(this.inlineSourcesField);

        this.declarationField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_DECLARATION,
            getResource("declaration"),
            this.getFieldEditorParent());
        this.addField(this.declarationField);

        this.removeCommentsField = new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_REMOVE_COMMENTS,
            getResource("remove.comments"),
            this.getFieldEditorParent());
        this.addField(this.removeCommentsField);
    }

    @Override
    protected IPreferenceStore doGetPreferenceStore() {
        return TypeScriptPlugin.getDefault().getPreferenceStore();
    }

    @Override
    protected String getPreferenceNodeId() {
        return "com.palantir.typescript.compilerPreferencePage";
    }

    @Override
    protected String getSentinelPropertyName() {
        return IPreferenceConstants.COMPILER_TARGET;
    }

    @Override
    protected void initialize() {
        super.initialize();

        this.updateFieldEditors();
    }

    @Override
    protected void performDefaults() {
        super.performDefaults();

        this.updateFieldEditors();
    }

    @Override
    protected void updateFieldEditors() {
        super.updateFieldEditors();

        Composite parent = this.getFieldEditorParent();

        boolean compileOnSaveEnabled = this.compileOnSaveField.getBooleanValue() && this.isPageEnabled();
        boolean sourceMapEnabled = this.sourceMapField.getBooleanValue() && compileOnSaveEnabled;
        boolean inlineSourceMapEnabled = this.inlineSourceMapField.getBooleanValue() && compileOnSaveEnabled;

        this.declarationField.setEnabled(compileOnSaveEnabled, parent);
        this.removeCommentsField.setEnabled(compileOnSaveEnabled, parent);
        this.sourceMapField.setEnabled(compileOnSaveEnabled && !inlineSourceMapEnabled, parent);
        this.inlineSourceMapField.setEnabled(compileOnSaveEnabled && !sourceMapEnabled, parent);
        this.inlineSourcesField.setEnabled(compileOnSaveEnabled && inlineSourceMapEnabled, parent);

        boolean noImplicitAnyEnabled = this.noImplicitAnyField.getBooleanValue() && this.isPageEnabled();
        this.suppressImplicitAnyIndexErrorsField.setEnabled(noImplicitAnyEnabled, parent);
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

    private static String getResource(String key) {
        return Resources.BUNDLE.getString("preferences.compiler." + key);
    }
}
