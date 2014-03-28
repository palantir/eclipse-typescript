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

import java.util.List;

import org.eclipse.core.resources.IFolder;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.ProjectScope;
import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.core.runtime.preferences.IScopeContext;
import org.eclipse.jface.window.Window;
import org.eclipse.swt.SWT;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Event;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Listener;
import org.eclipse.swt.widgets.Text;
import org.eclipse.ui.dialogs.ElementTreeSelectionDialog;
import org.eclipse.ui.dialogs.ISelectionStatusValidator;
import org.eclipse.ui.dialogs.PropertyPage;
import org.eclipse.ui.model.WorkbenchContentProvider;
import org.eclipse.ui.model.WorkbenchLabelProvider;
import org.osgi.service.prefs.BackingStoreException;

import com.google.common.collect.Lists;
import com.palantir.typescript.Builders;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.TypeScriptPlugin;

/**
 * The build path property page.
 *
 * @author dcicerone
 */
public final class BuildPathPropertyPage extends PropertyPage {

    private Text outputFileField;
    private Text outputFolderField;
    private Text sourceFolderField;

    @Override
    public boolean performOk() {
        IEclipsePreferences projectPreferences = this.getProjectPreferences();
        String oldSourceFolder = projectPreferences.get(IPreferenceConstants.BUILD_PATH_SOURCE_FOLDER, "");
        String oldOutputFile = projectPreferences.get(IPreferenceConstants.COMPILER_OUTPUT_FILE_OPTION, "");
        String oldOutputFolder = projectPreferences.get(IPreferenceConstants.COMPILER_OUTPUT_DIR_OPTION, "");
        String newSourceFolder = this.sourceFolderField.getText();
        String newOutputFile = this.outputFileField.getText();
        String newOutputFolder = this.outputFolderField.getText();

        if (!oldSourceFolder.equals(newSourceFolder) || !oldOutputFile.equals(newOutputFile) || !oldOutputFolder.equals(newOutputFolder)) {
            projectPreferences.put(IPreferenceConstants.BUILD_PATH_SOURCE_FOLDER, newSourceFolder);
            projectPreferences.put(IPreferenceConstants.COMPILER_OUTPUT_DIR_OPTION, newOutputFolder);
            projectPreferences.put(IPreferenceConstants.COMPILER_OUTPUT_FILE_OPTION, newOutputFile);

            // save the preferences
            try {
                projectPreferences.flush();
            } catch (BackingStoreException e) {
                throw new RuntimeException(e);
            }

            // rebuild the project
            IProject project = (IProject) this.getElement().getAdapter(IProject.class);
            Builders.rebuildProject(project);
        }

        return true;
    }

    @Override
    protected Control createContents(Composite parent) {
        Composite composite = new Composite(parent, SWT.NONE);
        composite.setLayout(new GridLayout(3, false));
        composite.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, true));
        composite.setFont(parent.getFont());

        this.sourceFolderField = this.createFolderField(composite, SWT.NONE, "Source folder:", IPreferenceConstants.BUILD_PATH_SOURCE_FOLDER);
        this.outputFolderField = this.createFolderField(composite, SWT.PUSH, "Output folder:", IPreferenceConstants.COMPILER_OUTPUT_DIR_OPTION);
        this.outputFileField = this.createFileField(composite, SWT.PUSH, "Output file name:", IPreferenceConstants.COMPILER_OUTPUT_FILE_OPTION);

        return composite;
    }

    private Text createFileField(Composite composite, int style, String labelText, String preferenceKey) {
        IEclipsePreferences projectPreferences = this.getProjectPreferences();

        Label label = new Label(composite, style);
        label.setLayoutData(new GridData(GridData.BEGINNING, SWT.CENTER, false, false));
        label.setText(labelText);

        Text text = new Text(composite, SWT.BORDER);
        text.setFont(composite.getFont());
        text.setLayoutData(new GridData(GridData.FILL, SWT.CENTER, true, false));
        text.setText(projectPreferences.get(preferenceKey, ""));

        return text;
    }

    private Text createFolderField(Composite composite, int style, String labelText, String preferenceKey) {
        IEclipsePreferences projectPreferences = this.getProjectPreferences();

        Label label = new Label(composite, style);
        label.setLayoutData(new GridData(GridData.BEGINNING, SWT.CENTER, false, false));
        label.setText(labelText);

        Text text = new Text(composite, SWT.BORDER);
        text.setFont(composite.getFont());
        text.setLayoutData(new GridData(GridData.FILL, SWT.CENTER, true, false));
        text.setText(projectPreferences.get(preferenceKey, ""));

        Button button = new Button(composite, SWT.NONE);
        button.setLayoutData(new GridData(GridData.END, SWT.CENTER, false, false));
        button.setText("Browse...");
        button.addListener(SWT.Selection, new MyListener(text));

        return text;
    }

    private IEclipsePreferences getProjectPreferences() {
        IAdaptable element = this.getElement();
        IProject project = (IProject) element.getAdapter(IProject.class);
        IScopeContext projectScope = new ProjectScope(project);

        return projectScope.getNode(TypeScriptPlugin.ID);
    }

    private final class MyListener implements Listener {

        private final Text field;

        public MyListener(Text folderField) {
            this.field = folderField;
        }

        @Override
        public void handleEvent(Event event) {
            WorkbenchLabelProvider labelProvider = new WorkbenchLabelProvider();
            MyTreeContentProvider contentProvider = new MyTreeContentProvider();
            ElementTreeSelectionDialog dialog = new ElementTreeSelectionDialog(getShell(), labelProvider, contentProvider);
            dialog.setAllowMultiple(false);
            dialog.setBlockOnOpen(true);
            dialog.setInput(getElement().getAdapter(IProject.class));
            dialog.setValidator(new MySelectionStatusValidator());

            // open the dialog and process the result
            if (dialog.open() == Window.OK) {
                Object[] result = dialog.getResult();
                Object selection = result[0];

                if (selection instanceof IAdaptable) {
                    IAdaptable adaptable = (IAdaptable) selection;
                    IResource resource = (IResource) adaptable.getAdapter(IResource.class);
                    IPath projectRelativePath = resource.getProjectRelativePath();

                    this.field.setText(projectRelativePath.toPortableString());
                }
            }
        }
    }

    private static final class MySelectionStatusValidator implements ISelectionStatusValidator {
        @Override
        public IStatus validate(Object[] selection) {
            if (selection.length != 1) {
                return new Status(IStatus.ERROR, TypeScriptPlugin.ID, "At least one item must be selected.");
            }

            Object selectedItem = selection[0];
            if (!(selectedItem instanceof IFolder)) {
                return new Status(IStatus.ERROR, TypeScriptPlugin.ID, "The selected item must be a folder.");
            }

            return new Status(IStatus.OK, TypeScriptPlugin.ID, "");
        }
    }

    private static final class MyTreeContentProvider extends ForwardingTreeContentProvider {

        public MyTreeContentProvider() {
            super(new WorkbenchContentProvider());
        }

        @Override
        public Object[] getChildren(Object parentElement) {
            Object[] children = super.getChildren(parentElement);

            return getFilteredElements(children);
        }

        @Override
        public Object[] getElements(Object inputElement) {
            Object[] elements = super.getElements(inputElement);

            return getFilteredElements(elements);
        }

        private static Object[] getFilteredElements(Object[] elements) {
            List<Object> filteredChildren = Lists.newArrayList();

            // filter the elements to only show folders
            for (Object child : elements) {
                if (child instanceof IFolder) {
                    filteredChildren.add(child);
                }
            }

            return filteredChildren.toArray();
        }
    }
}
