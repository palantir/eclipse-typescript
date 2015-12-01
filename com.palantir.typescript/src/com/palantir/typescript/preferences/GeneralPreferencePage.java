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

import org.eclipse.jface.dialogs.IDialogConstants;
import org.eclipse.jface.dialogs.MessageDialog;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.preference.PreferencePage;
import org.eclipse.swt.SWT;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Event;
import org.eclipse.swt.widgets.FileDialog;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Listener;
import org.eclipse.swt.widgets.Text;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPreferencePage;

import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.Resources;
import com.palantir.typescript.TypeScriptPlugin;

/**
 * The general preference page.
 *
 * @author dcicerone
 */
public final class GeneralPreferencePage extends PreferencePage implements IWorkbenchPreferencePage {

    private Text nodePathText;

    public GeneralPreferencePage() {
        this.setPreferenceStore(TypeScriptPlugin.getDefault().getPreferenceStore());
    }

    @Override
    public void init(IWorkbench workbench) {
    }

    @Override
    protected Control createContents(Composite parent) {
        Composite composite = new Composite(parent, SWT.NONE);
        composite.setLayout(new GridLayout(3, false));
        composite.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, true));
        composite.setFont(parent.getFont());

        Label label = new Label(composite, SWT.NONE);
        label.setLayoutData(new GridData(GridData.BEGINNING, SWT.CENTER, false, false));
        label.setText(getResource("node.path"));

        this.nodePathText = new Text(composite, SWT.BORDER);
        this.nodePathText.setFont(composite.getFont());
        this.nodePathText.setLayoutData(new GridData(GridData.FILL, SWT.CENTER, true, false));
        this.nodePathText.setText(this.getPreferenceStore().getString(IPreferenceConstants.GENERAL_NODE_PATH));

        Button button = new Button(composite, SWT.NONE);
        button.setLayoutData(new GridData(GridData.END, SWT.CENTER, false, false));
        button.setText("Browse...");
        button.addListener(SWT.Selection, new MyListener(this.nodePathText));

        return composite;
    }

    @Override
    public boolean performOk() {
        String oldNodePath = this.getPreferenceStore().getString(IPreferenceConstants.GENERAL_NODE_PATH);
        String newNodePath = this.nodePathText.getText();

        if (!oldNodePath.equals(newNodePath)) {
            String title = Resources.BUNDLE.getString("preferences.general.node.path.dialog.title");
            String message = Resources.BUNDLE.getString("preferences.general.node.path.dialog.message");
            String[] buttonLabels = new String[] { IDialogConstants.OK_LABEL };
            MessageDialog dialog = new MessageDialog(this.getShell(), title, null, message, MessageDialog.QUESTION, buttonLabels, 2);
            dialog.open();

            this.getPreferenceStore().setValue(IPreferenceConstants.GENERAL_NODE_PATH, newNodePath);
        }

        return true;
    }

    @Override
    protected IPreferenceStore doGetPreferenceStore() {
        return TypeScriptPlugin.getDefault().getPreferenceStore();
    }

    private static String getResource(String key) {
        return Resources.BUNDLE.getString("preferences.general." + key);
    }

    private final class MyListener implements Listener {

        private final Text field;

        MyListener(Text folderField) {
            this.field = folderField;
        }

        @Override
        public void handleEvent(Event event) {
            FileDialog dialog = new FileDialog(getShell());
            dialog.setFileName(this.field.getText());

            // open the dialog and process the result
            String nodePath = dialog.open();
            if (nodePath != null) {
                this.field.setText(nodePath);
            }
        }
    }
}
