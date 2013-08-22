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

package com.palantir.typescript.text;

import org.eclipse.jface.wizard.IWizardPage;
import org.eclipse.ltk.core.refactoring.Refactoring;
import org.eclipse.ltk.ui.refactoring.RefactoringWizard;
import org.eclipse.ltk.ui.refactoring.UserInputWizardPage;
import org.eclipse.swt.SWT;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;

import com.google.common.base.CharMatcher;

/**
 * The refactoring wizard for renaming TypeScript elements.
 *
 * @author dcicerone
 */
public final class RenameRefactoringWizard extends RefactoringWizard {

    private static final String WINDOW_TITLE = "Rename TypeScript Element";

    public RenameRefactoringWizard(Refactoring refactoring) {
        super(refactoring, SWT.NONE);

        this.setWindowTitle(WINDOW_TITLE);
    }

    @Override
    protected void addUserInputPages() {
        TypeScriptRenameProcessor processor = (TypeScriptRenameProcessor) this.getRefactoring().getAdapter(TypeScriptRenameProcessor.class);
        MyUserInputWizardPage page = new MyUserInputWizardPage(processor);

        this.addPage(page);
    }

    private static final class MyUserInputWizardPage extends UserInputWizardPage {

        private Text nameField;

        private final TypeScriptRenameProcessor processor;

        public MyUserInputWizardPage(TypeScriptRenameProcessor processor) {
            super(MyUserInputWizardPage.class.getSimpleName());

            this.processor = processor;
        }

        @Override
        public void createControl(Composite parent) {
            Composite composite = new Composite(parent, SWT.NONE);
            composite.setLayout(new GridLayout(2, false));
            composite.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, true));
            composite.setFont(parent.getFont());

            Label label = new Label(composite, SWT.NONE);
            label.setLayoutData(new GridData());
            label.setText("New name:");

            this.nameField = new Text(composite, SWT.BORDER);
            this.nameField.setText(this.processor.getOldName());
            this.nameField.setFont(composite.getFont());
            this.nameField.setLayoutData(new GridData(GridData.FILL, GridData.BEGINNING, true, false));
            this.nameField.addModifyListener(new ModifyListener() {
                @Override
                public void modifyText(ModifyEvent e) {
                    // check that there is no whitespace in the new name
                    if (!CharMatcher.WHITESPACE.matchesAnyOf(MyUserInputWizardPage.this.nameField.getText())) {
                        setPageComplete(true);
                    }
                }
            });
            this.nameField.selectAll();

            this.setPageComplete(false);

            this.setControl(composite);
        }

        @Override
        public IWizardPage getNextPage() {
            this.setNewName();

            return super.getNextPage();
        }

        @Override
        public void setVisible(boolean visible) {
            // put the focus in the name field when the page is first displayed
            if (visible) {
                this.nameField.setFocus();
            }

            super.setVisible(visible);
        }

        @Override
        protected boolean performFinish() {
            this.setNewName();

            return super.performFinish();
        }

        private void setNewName() {
            this.processor.setNewName(this.nameField.getText());
        }
    }
}
