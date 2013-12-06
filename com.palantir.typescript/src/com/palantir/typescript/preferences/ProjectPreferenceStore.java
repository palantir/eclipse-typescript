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

import static com.google.common.base.Preconditions.checkNotNull;

import java.io.IOException;
import java.io.OutputStream;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.ProjectScope;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.core.runtime.preferences.IScopeContext;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.preference.PreferenceStore;
import org.osgi.service.prefs.BackingStoreException;

import com.palantir.typescript.TypeScriptPlugin;

/**
 * An adapter for {@link PreferenceStore} to allow a preference page to be used as a property page.
 * <p>
 * Adapted from http://www.eclipse.org/articles/Article-Mutatis-mutandis/overlay-pages.html.
 *
 * @author dcicerone
 */
public final class ProjectPreferenceStore extends PreferenceStore {

    private final IProject project;
    private final IPreferenceStore preferenceStore;

    private boolean projectSpecificSettings;

    private transient boolean inserting;

    public ProjectPreferenceStore(IProject project, IPreferenceStore preferenceStore, String sentinelPropertyName) {
        checkNotNull(project);
        checkNotNull(preferenceStore);
        checkNotNull(sentinelPropertyName);

        this.project = project;
        this.preferenceStore = preferenceStore;

        IEclipsePreferences projectPreferences = this.getProjectPreferences();
        this.projectSpecificSettings = (projectPreferences.get(sentinelPropertyName, null) != null);
    }

    @Override
    public boolean contains(String name) {
        return this.preferenceStore.contains(name);
    }

    @Override
    public boolean getDefaultBoolean(String name) {
        return this.preferenceStore.getDefaultBoolean(name);
    }

    @Override
    public double getDefaultDouble(String name) {
        return this.preferenceStore.getDefaultDouble(name);
    }

    @Override
    public float getDefaultFloat(String name) {
        return this.preferenceStore.getDefaultFloat(name);
    }

    @Override
    public int getDefaultInt(String name) {
        return this.preferenceStore.getDefaultInt(name);
    }

    @Override
    public long getDefaultLong(String name) {
        return this.preferenceStore.getDefaultLong(name);
    }

    @Override
    public String getDefaultString(String name) {
        return this.preferenceStore.getDefaultString(name);
    }

    @Override
    public boolean getBoolean(String name) {
        this.insertValue(name);

        return super.getBoolean(name);
    }

    @Override
    public double getDouble(String name) {
        this.insertValue(name);

        return super.getDouble(name);
    }

    @Override
    public float getFloat(String name) {
        this.insertValue(name);

        return super.getFloat(name);
    }

    @Override
    public int getInt(String name) {
        this.insertValue(name);

        return super.getInt(name);
    }

    @Override
    public long getLong(String name) {
        this.insertValue(name);

        return super.getLong(name);
    }

    @Override
    public String getString(String name) {
        this.insertValue(name);

        return super.getString(name);
    }

    @Override
    public boolean isDefault(String name) {
        String defaultValue = this.getDefaultString(name);
        if (defaultValue == null) {
            return false;
        }

        return defaultValue.equals(this.getString(name));
    }

    public boolean getProjectSpecificSettings() {
        return this.projectSpecificSettings;
    }

    public void setProjectSpecificSettings(boolean projectSpecificSettings) {
        this.projectSpecificSettings = projectSpecificSettings;
    }

    @Override
    public void save() throws IOException {
        this.writeProperties();
    }

    @Override
    public void save(OutputStream out, String header) throws IOException {
        this.writeProperties();
    }

    @Override
    public void setToDefault(String name) {
        String defaultValue = this.getDefaultString(name);

        this.setValue(name, defaultValue);
    }

    private synchronized void insertValue(String name) {
        // check if an insertion is already in-progress
        if (this.inserting) {
            return;
        }

        if (this.projectSpecificSettings && super.contains(name)) {
            return;
        }

        this.inserting = true;
        try {
            IEclipsePreferences projectPreferences = this.getProjectPreferences();
            String value = projectPreferences.get(name, null);

            if (value == null) {
                value = this.preferenceStore.getString(name);
            }

            if (value != null) {
                this.setValue(name, value);
            }
        } finally {
            this.inserting = false;
        }
    }

    private void writeProperties() throws IOException {
        IEclipsePreferences projectPreferences = this.getProjectPreferences();

        for (String name : super.preferenceNames()) {
            if (this.projectSpecificSettings) {
                String value = this.getString(name);

                projectPreferences.put(name, value);
            } else {
                projectPreferences.remove(name);
            }
        }

        try {
            projectPreferences.flush();
        } catch (BackingStoreException e) {
            throw new IOException(e);
        }
    }

    private IEclipsePreferences getProjectPreferences() {
        IScopeContext projectScope = new ProjectScope(this.project);

        return projectScope.getNode(TypeScriptPlugin.ID);
    }
}
