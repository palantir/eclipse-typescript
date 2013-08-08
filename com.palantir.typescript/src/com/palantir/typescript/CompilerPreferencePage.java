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

import org.eclipse.jface.preference.BooleanFieldEditor;
import org.eclipse.jface.preference.ComboFieldEditor;
import org.eclipse.jface.preference.FieldEditorPreferencePage;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPreferencePage;

import com.google.common.base.Ascii;
import com.google.common.collect.ImmutableList;
import com.palantir.typescript.services.language.LanguageVersion;
import com.palantir.typescript.services.language.ModuleGenTarget;

/**
 * The compiler preference page.
 *
 * @author tyleradams
 */
public final class CompilerPreferencePage extends FieldEditorPreferencePage implements IWorkbenchPreferencePage {

    public CompilerPreferencePage() {
        super(FieldEditorPreferencePage.GRID);

        IPreferenceStore store = TypeScriptPlugin.getDefault().getPreferenceStore();
        this.setPreferenceStore(store);
    }

    @Override
    public void init(IWorkbench workbench) {
    }

    @Override
    protected void createFieldEditors() {
        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_COMPILE_ON_SAVE,
            getResource("compile.on.save"),
            getFieldEditorParent()));

        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_NO_LIB,
            getResource("no.lib"),
            getFieldEditorParent()));

        ImmutableList.Builder<LanguageVersion> languageVersionKeys = ImmutableList.builder();
        languageVersionKeys.add(LanguageVersion.ECMASCRIPT3);
        languageVersionKeys.add(LanguageVersion.ECMASCRIPT5);

        this.addField(new ComboFieldEditor(
            IPreferenceConstants.COMPILER_CODE_GEN_TARGET,
            getResource("code.gen.target"),
            this.createComboFieldValues(languageVersionKeys.build()),
            getFieldEditorParent()));

        ImmutableList.Builder<ModuleGenTarget> moduleGenTargetKeys = ImmutableList.builder();
        moduleGenTargetKeys.add(ModuleGenTarget.UNSPECIFIED);
        moduleGenTargetKeys.add(ModuleGenTarget.SYNCHRONOUS);
        moduleGenTargetKeys.add(ModuleGenTarget.ASYNCHRONOUS);

        this.addField(new ComboFieldEditor(
            IPreferenceConstants.COMPILER_MODULE_GEN_TARGET,
            getResource("module.gen.target"),
            this.createComboFieldValues(moduleGenTargetKeys.build()),
            getFieldEditorParent()));

        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.COMPILER_MAP_SOURCE_FILES,
            getResource("map.source.files"),
            getFieldEditorParent()));

        this.addField(new BooleanFieldEditor(IPreferenceConstants.COMPILER_REMOVE_COMMENTS,
            getResource("remove.comments"),
            getFieldEditorParent()));
    }

    private String[][] createComboFieldValues(List<? extends Enum> keys) {
        checkNotNull(keys);

        String[][] fieldValues = new String[keys.size()][2];

        for (int i = 0; i < keys.size(); i++) {
            String key = keys.get(i).name();
            fieldValues[i][0] = getResource(Ascii.toLowerCase(key).replace("_", "."));
            fieldValues[i][1] = key;
        }
        return fieldValues;
    }

    private static String getResource(String key) {
        checkNotNull(key);

        return Resources.BUNDLE.getString("preferences.compiler." + key);
    }
}
