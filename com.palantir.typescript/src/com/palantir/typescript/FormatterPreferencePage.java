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

import org.eclipse.jface.preference.BooleanFieldEditor;
import org.eclipse.jface.preference.FieldEditorPreferencePage;
import org.eclipse.jface.preference.IntegerFieldEditor;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPreferencePage;

/**
 * The formatter preference page.
 *
 * @author dcicerone
 */
public final class FormatterPreferencePage extends FieldEditorPreferencePage implements IWorkbenchPreferencePage {

    public FormatterPreferencePage() {
        super(FieldEditorPreferencePage.GRID);

        this.setPreferenceStore(TypeScriptPlugin.getDefault().getPreferenceStore());
    }

    @Override
    public void init(IWorkbench workbench) {
    }

    @Override
    protected void createFieldEditors() {
        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.EDITOR_CONVERT_TABS_TO_SPACES,
            getResource("preferences.editor.convert.tabs.to.spaces"),
            getFieldEditorParent()));

        this.addField(new IntegerFieldEditor(
            IPreferenceConstants.EDITOR_INDENT_SIZE,
            getResource("preferences.editor.indent.size"),
            getFieldEditorParent(),
            1));

        this.addField(new IntegerFieldEditor(
            IPreferenceConstants.EDITOR_TAB_SIZE,
            getResource("preferences.editor.tab.size"),
            getFieldEditorParent(),
            1));

        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.FORMATTER_INSERT_SPACE_AFTER_COMMA_DELIMITER,
            getResource("preferences.formatter.insert.space.after.comma.delimiter"),
            getFieldEditorParent()));

        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.FORMATTER_INSERT_SPACE_AFTER_SEMICOLON_IN_FOR_STATEMENTS,
            getResource("preferences.formatter.insert.space.after.semicolon.in.for.statements"),
            getFieldEditorParent()));

        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.FORMATTER_INSERT_SPACE_BEFORE_AND_AFTER_BINARY_OPERATORS,
            getResource("preferences.formatter.insert.space.before.and.after.binary.operators"),
            getFieldEditorParent()));

        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.FORMATTER_INSERT_SPACE_AFTER_KEYWORDS_IN_CONTROL_FLOW_STATEMENTS,
            getResource("preferences.formatter.insert.space.after.keywords.in.control.flow.statements"),
            getFieldEditorParent()));

        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.FORMATTER_INSERT_SPACE_AFTER_FUNCTION_KEYWORD_FOR_ANONYMOUS_FUNCTIONS,
            getResource("preferences.formatter.insert.space.after.function.keyword.for.anonymous.functions"),
            getFieldEditorParent()));

        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.FORMATTER_INSERT_SPACE_AFTER_OPENING_AND_BEFORE_CLOSING_NONEMPTY_PARENTHESIS,
            getResource("preferences.formatter.insert.space.after.opening.and.before.closing.nonempty.parenthesis"),
            getFieldEditorParent()));

        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.FORMATTER_PLACE_OPEN_BRACE_ON_NEW_LINE_FOR_FUNCTIONS,
            getResource("preferences.formatter.place.open.brace.on.new.line.for.functions"),
            getFieldEditorParent()));

        this.addField(new BooleanFieldEditor(
            IPreferenceConstants.FORMATTER_PLACE_OPEN_BRACE_ON_NEW_LINE_FOR_CONTROL_BLOCKS,
            getResource("preferences.formatter.place.open.brace.on.new.line.for.control.blocks"),
            getFieldEditorParent()));
    }

    private static String getResource(String key) {
        return Resources.BUNDLE.getString(key);
    }
}
