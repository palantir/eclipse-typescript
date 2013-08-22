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
import java.util.StringTokenizer;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.ProjectScope;
import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.jface.preference.FieldEditorPreferencePage;
import org.eclipse.jface.preference.ListEditor;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.ui.IWorkbenchPropertyPage;
import org.eclipse.ui.preferences.ScopedPreferenceStore;

import com.google.common.collect.Lists;

/**
 * Project properties that enable to specify filters on the resources to be considered for
 * TypeScript related functionalities.
 *
 * @author rserafin
 */
public final class ProjectPropertiesPage extends FieldEditorPreferencePage implements IWorkbenchPropertyPage {

    private IProject project;

    private SourcePathPatternsListFieldEditor sourcePathPatternList;

    /**
     * Constructor.
     */
    public ProjectPropertiesPage() {
        super(FieldEditorPreferencePage.GRID);

        this.setPreferenceStore(TypeScriptPlugin.getDefault().getPreferenceStore());
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
    public  void setElement(IAdaptable element) {
        this.project = (IProject) element.getAdapter(IProject.class);
        if (this.project != null) {
            this.setPreferenceStore(new ScopedPreferenceStore(new ProjectScope(this.project), TypeScriptPlugin.ID));
        }
    }

    @Override
    protected void createFieldEditors() {
        this.sourcePathPatternList = new SourcePathPatternsListFieldEditor(
            IPreferenceConstants.COMPILER_SOURCE_PATH,
            getResource("classpath"),
            getFieldEditorParent());
        this.addField(this.sourcePathPatternList);
    }

    private static String getResource(String key) {
        return Resources.BUNDLE.getString("preferences.compiler." + key);
    }

    private static class SourcePathPatternsListFieldEditor extends ListEditor {

        public SourcePathPatternsListFieldEditor(String name, String labelText, Composite parent) {
            super(name, labelText, parent);
        }

        @Override
        protected String createList(String[] items) {
            StringBuffer path = new StringBuffer("");

            for (int i = 0; i < items.length; i++) {
                path.append(items[i]);
                path.append(",");
            }
            return path.toString();
        }

        @Override
        protected String getNewInputObject() {
            return "src/main/java";
        }

        @Override
        protected String[] parseString(String stringList) {
            StringTokenizer st = new StringTokenizer(stringList, "," + "\n\r");

            ArrayList v = Lists.newArrayList();
            while (st.hasMoreElements()) {
                v.add(st.nextElement());
            }
            return (String[]) v.toArray(new String[v.size()]);
        }

    }
}
