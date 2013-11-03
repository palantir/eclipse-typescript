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

package com.palantir.typescript.navigate;

import java.util.Comparator;
import java.util.List;
import java.util.Set;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.jface.dialogs.IDialogSettings;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Shell;
import org.eclipse.ui.dialogs.FilteredItemsSelectionDialog;

import com.google.common.collect.ImmutableSet;
import com.palantir.typescript.ProjectNature;
import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.services.language.LanguageService;
import com.palantir.typescript.services.language.NavigateToItem;
import com.palantir.typescript.services.language.ScriptElementKind;

/**
 * The Open Type dialog.
 *
 * @author dcicerone
 */
public final class OpenTypeDialog extends FilteredItemsSelectionDialog {

    private static final Set<ScriptElementKind> TYPE_ELEMENT_KINDS = ImmutableSet.of(
        ScriptElementKind.CLASS_ELEMENT,
        ScriptElementKind.ENUM_ELEMENT,
        ScriptElementKind.INTERFACE_ELEMENT);

    private LanguageService languageService;

    public OpenTypeDialog(Shell shell) {
        super(shell);

        this.setDetailsLabelProvider(new NavigateToItemContainerLabelProvider());
        this.setListLabelProvider(new NavigateToItemLabelProvider());
        this.setTitle("Open TypeScript Type");
    }

    @Override
    protected Control createExtendedContentArea(Composite parent) {
        return null;
    }

    @Override
    protected IDialogSettings getDialogSettings() {
        String sectionName = OpenTypeDialog.class.getName();
        IDialogSettings dialogSettings = TypeScriptPlugin.getDefault().getDialogSettings();
        IDialogSettings settings = dialogSettings.getSection(sectionName);

        if (settings == null) {
            settings = dialogSettings.addNewSection(sectionName);
        }

        return settings;
    }

    @Override
    protected IStatus validateItem(Object item) {
        return Status.OK_STATUS;
    }

    @Override
    protected ItemsFilter createFilter() {
        return new ItemsFilter() {
            @Override
            public boolean matchItem(Object item) {
                NavigateToItem navigateToItem = (NavigateToItem) item;

                return matches(navigateToItem.getName());
            }

            @Override
            public boolean isConsistentItem(Object item) {
                return true;
            }
        };
    }

    @Override
    protected Comparator getItemsComparator() {
        return new Comparator<NavigateToItem>() {
            @Override
            public int compare(NavigateToItem o1, NavigateToItem o2) {
                return o1.getName().compareTo(o2.getName());
            }
        };
    }

    @Override
    protected void fillContentProvider(AbstractContentProvider contentProvider, ItemsFilter itemsFilter, IProgressMonitor progressMonitor)
            throws CoreException {
        progressMonitor.beginTask("Searching...", 1);

        // HACKHACK: just pick the first project with the TypeScript nature for now (until we support a global language service)
        if (this.languageService == null) {
            for (IProject project : ResourcesPlugin.getWorkspace().getRoot().getProjects()) {
                if (project.hasNature(ProjectNature.ID)) {
                    this.languageService = new LanguageService(project);
                    break;
                }
            }
        }

        List<NavigateToItem> navigateToItems = this.languageService.getNavigateToItems(itemsFilter.getPattern());
        for (NavigateToItem navigateToItem : navigateToItems) {
            if (TYPE_ELEMENT_KINDS.contains(navigateToItem.getKind())) {
                contentProvider.add(navigateToItem, itemsFilter);
            }
        }

        progressMonitor.done();
    }

    @Override
    public String getElementName(Object item) {
        NavigateToItem navigateToItem = (NavigateToItem) item;

        return navigateToItem.getName();
    }
}
