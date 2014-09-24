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

import java.util.List;

import org.eclipse.jface.text.AbstractInformationControl;
import org.eclipse.jface.text.IInformationControl;
import org.eclipse.jface.text.IInformationControlCreator;
import org.eclipse.jface.text.IInformationControlExtension2;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.ScrolledComposite;
import org.eclipse.swt.custom.StyledText;
import org.eclipse.swt.graphics.Color;
import org.eclipse.swt.graphics.Font;
import org.eclipse.swt.graphics.FontData;
import org.eclipse.swt.graphics.Image;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Shell;

import com.palantir.typescript.Images;
import com.palantir.typescript.services.language.QuickInfo;
import com.palantir.typescript.services.language.ScriptElementKind;
import com.palantir.typescript.services.language.ScriptElementModifierKind;

/**
 * An information control for displaying quick info.
 *
 * @author dcicerone
 */
public final class QuickInfoInformationControl extends AbstractInformationControl implements IInformationControlExtension2 {

    private Composite composite;
    private StyledText documentationText;
    private Label displayLabel;
    private Label kindIconLabel;
    private ScrolledComposite scrolled;

    private final boolean scrollable;

    public QuickInfoInformationControl(Shell parentShell, boolean isResizable, boolean scrollable) {
        super(parentShell, isResizable);

        this.scrollable = scrollable;

        this.create();
    }

    @Override
    public boolean hasContents() {
        return true;
    }

    @Override
    protected void createContent(Composite parent) {
        if (this.scrollable) {
            this.scrolled = new ScrolledComposite(parent, SWT.H_SCROLL | SWT.V_SCROLL);
            this.scrolled.setBackground(parent.getBackground());
            this.scrolled.setForeground(parent.getForeground());

            this.composite = new Composite(this.scrolled, SWT.NONE);
            this.scrolled.setContent(this.composite);
        } else {
            this.composite = new Composite(parent, SWT.NONE);
        }

        this.composite.setBackground(parent.getBackground());
        this.composite.setForeground(parent.getForeground());
        GridLayout compositeLayout = new GridLayout(2, false);
        compositeLayout.verticalSpacing = 20;
        this.composite.setLayout(compositeLayout);

        // kind
        this.kindIconLabel = new Label(this.composite, SWT.NONE);
        this.kindIconLabel.setLayoutData(new GridData(GridData.BEGINNING, SWT.BEGINNING, false, false));

        // display
        this.displayLabel = new Label(this.composite, SWT.NONE);
        FontData fontData = parent.getFont().getFontData()[0];
        Font boldFont = new Font(Display.getCurrent(), new FontData(fontData.getName(), fontData.getHeight(), SWT.BOLD));
        this.displayLabel.setFont(boldFont);
        this.displayLabel.setLayoutData(new GridData(GridData.BEGINNING, SWT.BEGINNING, true, false));

        // documentation
        this.documentationText = new StyledText(this.composite, SWT.NONE);
        this.documentationText.setBackground(parent.getBackground());
        this.documentationText.setForeground(parent.getForeground());
        this.documentationText.setWordWrap(true);
        this.documentationText.setLayoutData(new GridData(GridData.BEGINNING, SWT.BEGINNING, true, true, 2, 1));
    }

    @Override
    public void setBackgroundColor(Color background) {
        super.setBackgroundColor(background);

        this.documentationText.setBackground(background);
    }

    @Override
    public void setForegroundColor(Color foreground) {
        super.setForegroundColor(foreground);

        this.documentationText.setForeground(foreground);
    }

    @Override
    public void setInput(Object input) {
        if (input instanceof QuickInfo) {
            QuickInfo quickInfo = (QuickInfo) input;

            // kind
            ScriptElementKind kind = quickInfo.getKind();
            List<ScriptElementModifierKind> kindModifiers = quickInfo.getKindModifiers();
            Image image = Images.getImage(kind, kindModifiers);
            this.kindIconLabel.setImage(image);

            // display
            this.displayLabel.setText(quickInfo.getDisplayText());

            // documentation
            this.documentationText.setText(quickInfo.getDocumentationText());

            if (this.scrollable) {
                int widthHint = Math.max(this.getSizeConstraints().x, this.displayLabel.computeSize(SWT.DEFAULT, SWT.DEFAULT).x + 40);

                this.composite.setSize(this.composite.computeSize(widthHint, SWT.DEFAULT));
            }
        }
    }

    @Override
    public IInformationControlCreator getInformationPresenterControlCreator() {
        return new IInformationControlCreator() {
            @Override
            public IInformationControl createInformationControl(Shell parent) {
                return new QuickInfoInformationControl(parent, true, true);
            }
        };
    }
}
