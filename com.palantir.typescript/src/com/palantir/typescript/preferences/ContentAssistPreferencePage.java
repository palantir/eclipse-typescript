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

import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.preference.PreferencePage;
import org.eclipse.swt.SWT;
import org.eclipse.swt.events.SelectionAdapter;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Group;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPreferencePage;

import com.google.common.collect.Lists;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.Resources;
import com.palantir.typescript.TypeScriptPlugin;

/**
 * The content assist preference page.
 *
 * @author dcicerone
 */
public final class ContentAssistPreferencePage extends PreferencePage implements IWorkbenchPreferencePage {

    private Button autoActivationEnabledButton;
    private List<Control> controls;

    public ContentAssistPreferencePage() {
        this.controls = Lists.newArrayList();
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

        Group autoActivationGroup = new Group(composite, SWT.NONE);
        autoActivationGroup.setLayout(new GridLayout(2, true));
        autoActivationGroup.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, false));
        autoActivationGroup.setText(getResource("auto.activation.group"));

        this.autoActivationEnabledButton = new Button(autoActivationGroup, SWT.CHECK);
        GridData gridData = new GridData();
        gridData.horizontalSpan = 2;
        this.autoActivationEnabledButton.setLayoutData(gridData);
        this.autoActivationEnabledButton.setText(getResource("auto.activation.enabled"));
        this.autoActivationEnabledButton.addSelectionListener(new SelectionAdapter() {
            @Override
            public void widgetSelected(SelectionEvent e) {
                synchronizeAutoActivationEnabled();
            }
        });

        this.createTextField(autoActivationGroup, "auto.activation.delay", IPreferenceConstants.CONTENT_ASSIST_AUTO_ACTIVATION_DELAY, 4);
        this.createTextField(autoActivationGroup, "auto.activation.triggers", IPreferenceConstants.CONTENT_ASSIST_AUTO_ACTIVATION_TRIGGERS, 100);

        this.synchronizeAutoActivation();

        return composite;
    }

    @Override
    protected void performDefaults() {
        super.performDefaults();

        IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();

        boolean autoActivationEnabled = preferenceStore.getDefaultBoolean(IPreferenceConstants.CONTENT_ASSIST_AUTO_ACTIVATION_ENABLED);
        this.autoActivationEnabledButton.setSelection(autoActivationEnabled);

        for (Control control : this.controls) {
            String preferenceName = (String) control.getData();

            if (preferenceName != null) {
                if (control instanceof Text) {
                    String value = preferenceStore.getDefaultString(preferenceName);

                    ((Text) control).setText(value);
                }
            }
        }

        synchronizeAutoActivation();
    }

    @Override
    public boolean performOk() {
        IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();

        boolean autoActivationEnabled = this.autoActivationEnabledButton.getSelection();
        preferenceStore.setValue(IPreferenceConstants.CONTENT_ASSIST_AUTO_ACTIVATION_ENABLED, autoActivationEnabled);

        for (Control control : this.controls) {
            String preferenceName = (String) control.getData();

            if (preferenceName != null) {
                if (control instanceof Text) {
                    String value = ((Text) control).getText();

                    preferenceStore.setValue(preferenceName, value);
                }
            }
        }

        return true;
    }

    private void createTextField(Composite parent, String textKey, Object data, int textLimit) {
        GridData gridData = new GridData();

        Label label = new Label(parent, SWT.NONE);
        label.setText(getResource(textKey));
        gridData = new GridData();
        gridData.horizontalIndent = 20;
        label.setLayoutData(gridData);

        Text text = new Text(parent, SWT.BORDER | SWT.SINGLE);
        text.setData(data);
        text.setTextLimit(textLimit);
        gridData = new GridData();
        gridData.widthHint = 30;
        text.setLayoutData(gridData);

        this.controls.add(label);
        this.controls.add(text);
    }

    private void setControlEnabled(Object controlData, boolean enabled) {
        for (Control control : this.controls) {
            if (controlData.equals(control.getData())) {
                control.setEnabled(enabled);
            }
        }
    }

    private void synchronizeAutoActivation() {
        IPreferenceStore preferenceStore = TypeScriptPlugin.getDefault().getPreferenceStore();

        boolean autoActivationEnabled = preferenceStore.getBoolean(IPreferenceConstants.CONTENT_ASSIST_AUTO_ACTIVATION_ENABLED);
        this.autoActivationEnabledButton.setSelection(autoActivationEnabled);

        for (Control control : this.controls) {
            String preferenceName = (String) control.getData();

            if (preferenceName != null) {
                if (control instanceof Text) {
                    String value = preferenceStore.getString(preferenceName);

                    ((Text) control).setText(value);
                }
            }
        }

        this.synchronizeAutoActivationEnabled();
    }

    private void synchronizeAutoActivationEnabled() {
        boolean autoActivationEnabled = this.autoActivationEnabledButton.getSelection();

        this.setControlEnabled(IPreferenceConstants.CONTENT_ASSIST_AUTO_ACTIVATION_DELAY, autoActivationEnabled);
        this.setControlEnabled(IPreferenceConstants.CONTENT_ASSIST_AUTO_ACTIVATION_TRIGGERS, autoActivationEnabled);
    }

    private static String getResource(String key) {
        return Resources.BUNDLE.getString("preferences.content.assist." + key);
    }
}
