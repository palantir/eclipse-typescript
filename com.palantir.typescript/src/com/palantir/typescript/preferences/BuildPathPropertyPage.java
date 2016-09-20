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
import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.jface.dialogs.IDialogConstants;
import org.eclipse.jface.dialogs.MessageDialog;
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

import com.google.common.collect.Lists;
import com.palantir.typescript.Builders;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.Resources;
import com.palantir.typescript.TypeScriptPlugin;

/**
 * The build path property page.
 *
 * @author dcicerone
 * @author lgrignon
 */
public final class BuildPathPropertyPage extends PropertyPage {

    private Button useTsConfigCheckButton;
    private Text exportFolderField;
    private Text outputFileField;
    private Text outputFolderField;
    private Text sourceFolderField;

    private ProjectPreferenceStore projectPreferenceStore;

    @Override
    public boolean performOk() {
        String oldSourceFolder = projectPreferenceStore.getString(IPreferenceConstants.BUILD_PATH_SOURCE_FOLDER);
        String oldExportedFolder = projectPreferenceStore.getString(IPreferenceConstants.BUILD_PATH_EXPORTED_FOLDER);
        String oldOutputFile = projectPreferenceStore.getString(IPreferenceConstants.COMPILER_OUT_FILE);
        String oldOutputFolder = projectPreferenceStore.getString(IPreferenceConstants.COMPILER_OUT_DIR);
        String newExportedFolder = this.exportFolderField.getText();
        String newSourceFolder = this.sourceFolderField.getText();
        String newOutputFile = this.outputFileField.getText();
        String newOutputFolder = this.outputFolderField.getText();

        if (!oldSourceFolder.equals(newSourceFolder)
                || !oldExportedFolder.equals(newExportedFolder)
                || !oldOutputFile.equals(newOutputFile)
                || !oldOutputFolder.equals(newOutputFolder)) {
            projectPreferenceStore.setValue(IPreferenceConstants.BUILD_PATH_SOURCE_FOLDER, newSourceFolder);
            projectPreferenceStore.setValue(IPreferenceConstants.BUILD_PATH_EXPORTED_FOLDER, newExportedFolder);
            projectPreferenceStore.setValue(IPreferenceConstants.COMPILER_OUT_DIR, newOutputFolder);
            projectPreferenceStore.setValue(IPreferenceConstants.COMPILER_OUT_FILE, newOutputFile);

            // save the preferences
            try {
                projectPreferenceStore.save();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }

            // rebuild the project
            Builders.rebuildProject(getProject());
        }

        return true;
    }

    @Override
    protected Control createContents(Composite parent) {
        Composite composite = new Composite(parent, SWT.NONE);
        composite.setLayout(new GridLayout(3, false));
        composite.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, true));
        composite.setFont(parent.getFont());

        this.projectPreferenceStore = new ProjectPreferenceStore(getProject());

        this.useTsConfigCheckButton = this.createUseTsConfigField(composite);
        this.sourceFolderField = this.createFolderField(composite, SWT.NONE, "Source folder(s):");
        this.exportFolderField = this.createFolderField(composite, SWT.NONE, "Exported folder(s):");
        this.outputFolderField = this.createFolderField(composite, SWT.PUSH, "Output folder:");
        this.outputFileField = this.createFileField(composite, SWT.PUSH, "Output file name:");

        updateFieldStates();
        updateFieldValues();

        return composite;
    }

    private Button createUseTsConfigField(final Composite composite) {
        Label label = new Label(composite, SWT.NONE);
        label.setLayoutData(new GridData(GridData.BEGINNING, SWT.CENTER, false, false));
        label.setText("Use tsconfig");

        final Button button = new Button(composite, SWT.CHECK);
        button.setLayoutData(new GridData(GridData.BEGINNING, SWT.CENTER, false, false));
        button.addListener(SWT.Selection, new Listener() {
            @Override
            public void handleEvent(Event e) {
                projectPreferenceStore.setUsingTsConfigFile(button.getSelection());
                if (button.getSelection()) {
                    Builders.promptRecompile(getShell(), getProject());
                }
                updateFieldStates();
                updateFieldValues();
            }
        });
        button.setSelection(projectPreferenceStore.isUsingTsConfigFile());

        Button forceReloadButton = new Button(composite, SWT.NONE);
        forceReloadButton.setLayoutData(new GridData(GridData.CENTER, SWT.CENTER, false, false));
        forceReloadButton.setText("Force reload");
        forceReloadButton.addListener(SWT.Selection, new Listener() {
            @Override
            public void handleEvent(Event e) {
                boolean loaded = projectPreferenceStore.getTsConfigPreferences().reloadTsConfigFile();
                if (!loaded) {
                    String title = Resources.BUNDLE.getString("title.error");
                    String message = Resources.BUNDLE.getString("preferences.tsconfig.loadError");
                    String[] buttonLabels = new String[] { IDialogConstants.OK_LABEL };
                    MessageDialog dialog = new MessageDialog(getShell(), title, null, message, MessageDialog.ERROR, buttonLabels, 1);
                    dialog.open();
                    return;
                }
                projectPreferenceStore.setUsingTsConfigFile(true);
                Builders.promptRecompile(getShell(), getProject());
                updateFieldStates();
                updateFieldValues();
            }
        });

        return button;
    }

    private void updateFieldStates() {
        sourceFolderField.setEnabled(!useTsConfigCheckButton.getSelection());
        outputFileField.setEnabled(!useTsConfigCheckButton.getSelection());
        outputFolderField.setEnabled(!useTsConfigCheckButton.getSelection());
    }

    private void updateFieldValues() {
        sourceFolderField.setText(projectPreferenceStore.getString(IPreferenceConstants.BUILD_PATH_SOURCE_FOLDER));
        exportFolderField.setText(projectPreferenceStore.getString(IPreferenceConstants.BUILD_PATH_EXPORTED_FOLDER));
        outputFolderField.setText(projectPreferenceStore.getString(IPreferenceConstants.COMPILER_OUT_DIR));
        outputFileField.setText(projectPreferenceStore.getString(IPreferenceConstants.COMPILER_OUT_FILE));
    }

    private Text createFileField(Composite composite, int style, String labelText) {
        Label label = new Label(composite, style);
        label.setLayoutData(new GridData(GridData.BEGINNING, SWT.CENTER, false, false));
        label.setText(labelText);

        Text text = new Text(composite, SWT.BORDER);
        text.setFont(composite.getFont());
        text.setLayoutData(new GridData(GridData.FILL, SWT.CENTER, true, false));

        return text;
    }

    private Text createFolderField(Composite composite, int style, String labelText) {
        Label label = new Label(composite, style);
        label.setLayoutData(new GridData(GridData.BEGINNING, SWT.CENTER, false, false));
        label.setText(labelText);

        Text text = new Text(composite, SWT.BORDER);
        text.setFont(composite.getFont());
        text.setLayoutData(new GridData(GridData.FILL, SWT.CENTER, true, false));

        Button button = new Button(composite, SWT.NONE);
        button.setLayoutData(new GridData(GridData.CENTER, SWT.CENTER, false, false));
        button.setText("Browse...");
        button.addListener(SWT.Selection, new MyListener(text));

        return text;
    }

    private IProject getProject() {
        IAdaptable element = this.getElement();
        IProject project = (IProject) element.getAdapter(IProject.class);

        return project;
    }

    private final class MyListener implements Listener {

        private final Text field;

        MyListener(Text folderField) {
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

        MyTreeContentProvider() {
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
