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

import org.eclipse.jface.preference.BooleanFieldEditor;
import org.eclipse.jface.preference.FieldEditorPreferencePage;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPreferencePage;

import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.Resources;
import com.palantir.typescript.TypeScriptPlugin;

/**
 * The typing preference page.
 *
 * @author dcicerone
 */
public final class TypingPreferencePage extends FieldEditorPreferencePage implements IWorkbenchPreferencePage {

    public TypingPreferencePage() {
        super(FieldEditorPreferencePage.GRID);

        this.setPreferenceStore(TypeScriptPlugin.getDefault().getPreferenceStore());
    }

    @Override
    public void init(IWorkbench workbench) {
    }

    @Override
    protected void createFieldEditors() {
        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.EDITOR_CLOSE_BRACES,
            getResource("preferences.editor.close.braces"),
            this.getFieldEditorParent()));

        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.EDITOR_CLOSE_JSDOCS,
            getResource("preferences.editor.close.jsdocs"),
            this.getFieldEditorParent()));
    }

    private static String getResource(String key) {
        return Resources.BUNDLE.getString(key);
    }
}
