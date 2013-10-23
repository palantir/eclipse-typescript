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

import org.eclipse.core.resources.IProject;
import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.jface.preference.FieldEditor;
import org.eclipse.jface.preference.FieldEditorPreferencePage;
import org.eclipse.jface.preference.IPreferenceNode;
import org.eclipse.jface.preference.IPreferencePage;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.preference.PreferenceDialog;
import org.eclipse.jface.preference.PreferenceManager;
import org.eclipse.jface.preference.PreferenceNode;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.BusyIndicator;
import org.eclipse.swt.events.SelectionAdapter;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Link;
import org.eclipse.ui.IWorkbenchPropertyPage;

import com.google.common.collect.Lists;

/**
 * A field editor preference page that can also be used as a property page.
 * <p>
 * Adapted from http://www.eclipse.org/articles/Article-Mutatis-mutandis/overlay-pages.html.
 *
 * @author dcicerone
 */
abstract class FieldEditorProjectPreferencePage extends FieldEditorPreferencePage implements IWorkbenchPropertyPage {

    private final List<FieldEditor> fields = Lists.newArrayList();

    private Link configureWorkspaceLink;
    private IAdaptable element;
    private ProjectPreferenceStore projectPreferenceStore;
    private Button projectSpecificCheckbox;

    protected FieldEditorProjectPreferencePage(int style) {
        super(style);
    }

    @Override
    public IAdaptable getElement() {
        return this.element;
    }

    @Override
    public void setElement(IAdaptable element) {
        this.element = element;
    }

    protected abstract String getPreferenceNodeId();

    protected abstract String getSentinelPropertyName();

    @Override
    protected Control createContents(Composite parent) {
        if (this.isPropertyPage()) { // properties page
            Composite composite = new Composite(parent, SWT.NONE);
            GridLayout layout = new GridLayout(2, false);
            layout.marginWidth = 0;
            layout.marginHeight = 0;
            composite.setLayout(layout);
            composite.setLayoutData(new GridData(SWT.FILL, SWT.TOP, true, false));

            // enable project specific settings
            this.projectSpecificCheckbox = new Button(composite, SWT.CHECK);
            this.projectSpecificCheckbox.setFont(parent.getFont());
            this.projectSpecificCheckbox.setSelection(this.projectPreferenceStore.getProjectSpecificSettings());
            this.projectSpecificCheckbox.setText("Enable project specific settings");
            this.projectSpecificCheckbox.addSelectionListener(new SelectionAdapter() {
                @Override
                public void widgetSelected(SelectionEvent e) {
                    boolean projectSpecific = isProjectSpecific();

                    FieldEditorProjectPreferencePage.this.projectPreferenceStore.setProjectSpecificSettings(projectSpecific);
                    FieldEditorProjectPreferencePage.this.configureWorkspaceLink.setEnabled(!projectSpecific);
                    updateFieldEditors();
                }
            });

            // configure workspace settings
            this.configureWorkspaceLink = new Link(composite, SWT.NONE);
            this.configureWorkspaceLink.setLayoutData(new GridData(SWT.RIGHT, SWT.CENTER, false, false));
            this.configureWorkspaceLink.setText("<a>Configure Workspace Settings...</a>");
            this.configureWorkspaceLink.addSelectionListener(new SelectionAdapter() {
                @Override
                public void widgetSelected(SelectionEvent e) {
                    configureWorkspaceSettings();
                }
            });

            // horizontal separator
            Label horizontalSeparator = new Label(composite, SWT.SEPARATOR | SWT.HORIZONTAL);
            horizontalSeparator.setLayoutData(new GridData(GridData.FILL, SWT.TOP, true, false, 2, 1));
        }

        return super.createContents(parent);
    }

    @Override
    public void createControl(Composite parent) {
        if (this.isPropertyPage()) {
            IProject project = (IProject) this.element.getAdapter(IProject.class);
            String sentinelPropertyName = this.getSentinelPropertyName();

            this.projectPreferenceStore = new ProjectPreferenceStore(project, super.getPreferenceStore(), sentinelPropertyName);
        }

        super.createControl(parent);

        if (this.isPropertyPage()) {
            this.updateFieldEditors();
        }
    }

    @Override
    public IPreferenceStore getPreferenceStore() {
        if (this.projectPreferenceStore != null) {
            return this.projectPreferenceStore;
        }

        return super.getPreferenceStore();
    }

    @Override
    protected void addField(FieldEditor editor) {
        this.fields.add(editor);

        super.addField(editor);
    }

    protected final boolean isPageEnabled() {
        return !this.isPropertyPage() || this.isProjectSpecific();
    }

    protected final boolean isPropertyPage() {
        return this.element != null;
    }

    protected final boolean isProjectSpecific() {
        return this.isPropertyPage() && this.projectSpecificCheckbox.getSelection();
    }

    @Override
    protected void performDefaults() {
        if (this.isPropertyPage()) {
            this.projectSpecificCheckbox.setSelection(false);
            this.configureWorkspaceLink.setEnabled(false);
            this.updateFieldEditors();
        }

        super.performDefaults();
    }

    protected void updateFieldEditors() {
        boolean pageEnabled = this.isPageEnabled();
        Composite parent = this.getFieldEditorParent();

        for (FieldEditor field : this.fields) {
            field.setEnabled(pageEnabled, parent);
        }
    }

    private void configureWorkspaceSettings() {
        String preferenceNodeId = this.getPreferenceNodeId();
        IPreferencePage preferencePage = newPreferencePage();
        final IPreferenceNode preferenceNode = new PreferenceNode(preferenceNodeId, preferencePage);

        PreferenceManager manager = new PreferenceManager();
        manager.addToRoot(preferenceNode);

        final PreferenceDialog dialog = new PreferenceDialog(this.getControl().getShell(), manager);
        BusyIndicator.showWhile(this.getControl().getDisplay(), new Runnable() {
            @Override
            public void run() {
                dialog.create();
                dialog.setMessage(preferenceNode.getLabelText());
                dialog.open();
            }
        });
    }

    private IPreferencePage newPreferencePage() {
        try {
            IPreferencePage preferencePage = this.getClass().newInstance();
            preferencePage.setTitle(this.getTitle());

            return preferencePage;
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        } catch (InstantiationException e) {
            throw new RuntimeException(e);
        }
    }
}
