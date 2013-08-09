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

    private BooleanFieldEditor compileOnSaveField;
    private BooleanFieldEditor sourceMapField;
    private BooleanFieldEditor removeCommentsField;

    public CompilerPreferencePage() {
        super(FieldEditorPreferencePage.GRID);

        this.setPreferenceStore(TypeScriptPlugin.getDefault().getPreferenceStore());
    }

    @Override
    public void init(IWorkbench workbench) {
    }

    @Override
    public void propertyChange(PropertyChangeEvent event) {
        super.propertyChange(event);

        if (event.getSource().equals(this.compileOnSaveField) && event.getProperty().equals(FieldEditor.VALUE)) {
            synchronizeCompileOnSave();
        }
    }

    @Override
    protected void createFieldEditors() {
        this.addField(new ComboFieldEditor(
            IPreferenceConstants.COMPILER_CODE_GEN_TARGET,
            getResource("code.gen.target"),
            this.createComboFieldValues(LanguageVersion.values()),
            getFieldEditorParent()));

        this.addField(new ComboFieldEditor(
            IPreferenceConstants.COMPILER_MODULE_GEN_TARGET,
            getResource("module.gen.target"),
            this.createComboFieldValues(ModuleGenTarget.values()),
            getFieldEditorParent()));

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
