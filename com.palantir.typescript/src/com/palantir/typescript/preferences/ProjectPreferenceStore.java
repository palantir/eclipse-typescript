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
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.util.Map;
import java.util.Objects;

import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.ProjectScope;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.core.runtime.preferences.IScopeContext;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.preference.PreferenceStore;
import org.osgi.service.prefs.BackingStoreException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.CharStreams;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.TypeScriptPlugin;

/**
 * An adapter for {@link PreferenceStore} to allow a preference page to be used as a property page.
 * <p>
 * Adapted from http://www.eclipse.org/articles/Article-Mutatis-mutandis/overlay-pages.html.
 * </p>
 * <p>
 * In addition, this class is a proxy to project preferences by providing the ability to retrieve
 * values from the tsconfig.json file.
 * </p>
 *
 * @author dcicerone
 * @author lgrignon
 */
public final class ProjectPreferenceStore extends PreferenceStore {

    private static final BiMap<String, String> PREFERENCE_TO_TSCONFIG_PATH = createPreferenceToTsConfigPathMap();

    private static final Map<String, String> TSCONFIG_PATH_TO_PREFERENCE = PREFERENCE_TO_TSCONFIG_PATH.inverse();

    private static final Map<String, String> TSCONFIG_TARGET_MAPPING = ImmutableMap.of(
        "ES3", "ECMASCRIPT3", "ES5", "ECMASCRIPT5", "ES6", "ECMASCRIPT6", "ES2015", "ECMASCRIPT6");

    private static final Map<String, String> TSCONFIG_MODULE_KIND_MAPPING = ImmutableMap.of(
        "COMMONJS", "COMMONSJS", "ES2015", "ES6");

    private static final Map<String, String> TSCONFIG_MODULE_RESOLUTION_MAPPING = ImmutableMap.of(
        "NODEJS", "NODE_JS");

    private final IProject project;
    private final IPreferenceStore preferenceStore;

    private boolean projectSpecificSettings;

    private transient boolean inserting;

    public ProjectPreferenceStore(IProject project) {
        this(project, TypeScriptPlugin.getDefault().getPreferenceStore(), "");
    }

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

    public boolean isUsingTsConfigFile() {
        return getProjectPreferences().getBoolean(IPreferenceConstants.GENERAL_USE_TSCONFIG_FILE, false);
    }

    public void setUsingTsConfigFile(boolean useTsConfigFile) {
        getProjectPreferences().putBoolean(IPreferenceConstants.GENERAL_USE_TSCONFIG_FILE, useTsConfigFile);
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

        boolean useTsConfigFile = isUsingTsConfigFile();
        if (useTsConfigFile && isTsConfigPreference(name)) {
            if (didTsConfigFileChanged()) {
                reloadTsConfigFile();
            }
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

    public boolean reloadTsConfigFile() {
        Status status = new Status(IStatus.INFO, TypeScriptPlugin.ID, "reload tsconfig file");
        TypeScriptPlugin.getDefault().getLog().log(status);

        IFile tsConfigFile = null;
        InputStream tsConfigStream = null;
        boolean loaded = false;
        try {
            tsConfigFile = getTsConfigFile();
            if (tsConfigFile.exists()) {

                // refresh tsconfig cache infos
                IEclipsePreferences projectPreferences = this.getProjectPreferences();
                projectPreferences.put(IPreferenceConstants.PREFERENCE_STORE_TS_CONFIG_HASH, getFileSHA1(tsConfigFile));
                projectPreferences.putLong(IPreferenceConstants.PREFERENCE_STORE_TS_CONFIG_LAST_MODIFICATION_TIME,
                    tsConfigFile.getModificationStamp());

                // read tsconfig JSON content
                tsConfigStream = tsConfigFile.getContents();
                String tsConfigContent = CharStreams.toString(new InputStreamReader(tsConfigStream, tsConfigFile.getCharset()));

                // convert tsconfig JSON to Map
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> tsConfigEntries = mapper.readValue(tsConfigContent,
                    new TypeReference<Map<String, Object>>() {
                    });

                decodeTsConfigEntries("", tsConfigEntries);

                loaded = true;
            }

        } catch (Exception e) {
            String errorMessage = "Cannot reload ts config file '" + tsConfigFile + "'";
            Status errorStatus = new Status(IStatus.ERROR, TypeScriptPlugin.ID, errorMessage, e);
            TypeScriptPlugin.getDefault().getLog().log(errorStatus);
        } finally {
            if (tsConfigStream != null) {
                try {
                    tsConfigStream.close();
                } catch (IOException e) {
                    System.err.println("error while releasing tsconfig stream");
                }
            }
        }

        return loaded;
    }

    private void decodeTsConfigEntries(String jsonTreePath, Map<String, Object> entries) {

        IEclipsePreferences projectPreferences = this.getProjectPreferences();

        for (Map.Entry<String, Object> tsConfigEntry : entries.entrySet()) {
            if (tsConfigEntry.getValue() instanceof Map) {
                decodeTsConfigEntries(jsonTreePath + tsConfigEntry.getKey() + ".", (Map) tsConfigEntry.getValue());
            } else if (isSupportedTsConfigPath(jsonTreePath + tsConfigEntry.getKey())) {

                String matchingPreference = TSCONFIG_PATH_TO_PREFERENCE.get(jsonTreePath + tsConfigEntry.getKey());

                String value = tsConfigValueToPreferenceValue(tsConfigEntry.getValue(), matchingPreference);
                TypeScriptPlugin.getDefault().getLog().log(new Status(IStatus.INFO, TypeScriptPlugin.ID,
                    "setting preference " + matchingPreference + " to " + value));
                setValue(matchingPreference, value);
                projectPreferences.put(matchingPreference, value);
            }
        }
    }

    public String tsConfigValueToPreferenceValue(Object tsConfigValue, String matchingPreference) {
        String value = null;
        if (tsConfigValue != null) {
            value = tsConfigValue.toString();

            // TODO : awful mapping, we should rename our enums to match standard options / tsconfig values
            if (matchingPreference.equals(IPreferenceConstants.COMPILER_TARGET)) {
                value = value.toUpperCase();
                if (TSCONFIG_TARGET_MAPPING.containsKey(value)) {
                    value = TSCONFIG_TARGET_MAPPING.get(value);
                }
            } else if (matchingPreference.equals(IPreferenceConstants.COMPILER_MODULE)) {
                value = value.toUpperCase();
                if (TSCONFIG_MODULE_KIND_MAPPING.containsKey(value)) {
                    value = TSCONFIG_MODULE_KIND_MAPPING.get(value);
                }
            } else if (matchingPreference.equals(IPreferenceConstants.COMPILER_MODULE_RESOLUTION)) {
                value = value.toUpperCase();
                if (TSCONFIG_MODULE_RESOLUTION_MAPPING.containsKey(value)) {
                    value = TSCONFIG_MODULE_RESOLUTION_MAPPING.get(value);
                }
            } else if (matchingPreference.equals(IPreferenceConstants.COMPILER_JSX)) {
                value = value.toUpperCase();
            }
        }
        return value;
    }

    private boolean isTsConfigPreference(String name) {
        return PREFERENCE_TO_TSCONFIG_PATH.containsKey(name);
    }

    private boolean isSupportedTsConfigPath(String tsConfigJsonPath) {
        return TSCONFIG_PATH_TO_PREFERENCE.containsKey(tsConfigJsonPath);
    }

    private String getFileSHA1(IFile file) {

        if (!file.exists()) {
            return null;
        }

        InputStream fileInputStream = null;
        try {
            fileInputStream = file.getContents();
            MessageDigest md = MessageDigest.getInstance("SHA1");
            byte[] dataBytes = new byte[1024];

            int nread = 0;

            while ((nread = fileInputStream.read(dataBytes)) != -1) {
                md.update(dataBytes, 0, nread);
            }

            byte[] mdbytes = md.digest();
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < mdbytes.length; i++) {
                sb.append(Integer.toString((mdbytes[i] & 0xff) + 0x100, 16).substring(1));
            }
            return sb.toString();
        } catch (Exception e) {
            String errorMessage = "Cannot sha1 '" + file + "'";
            Status status = new Status(IStatus.ERROR, TypeScriptPlugin.ID, errorMessage, e);
            TypeScriptPlugin.getDefault().getLog().log(status);
            return null;
        } finally {
            try {
                if (fileInputStream != null) {
                    fileInputStream.close();
                }
            } catch (Exception e) {
            }
        }
    }

    private boolean didTsConfigFileChanged() {
        IEclipsePreferences projectPreferences = this.getProjectPreferences();

        IFile tsConfigFile = getTsConfigFile();
        boolean changed = true;
        if (tsConfigFile.exists()) {
            changed = false;
            try {
                long previousLastModTimestamp = projectPreferences
                    .getLong(IPreferenceConstants.PREFERENCE_STORE_TS_CONFIG_LAST_MODIFICATION_TIME, -1);
                long currentLastModTimestamp = tsConfigFile.getModificationStamp();
                if (previousLastModTimestamp != currentLastModTimestamp) {

                    // optimization: get hash only if mod timestamp changed
                    String previousHash = projectPreferences.get(IPreferenceConstants.PREFERENCE_STORE_TS_CONFIG_HASH, null);
                    String currentHash = getFileSHA1(tsConfigFile);
                    if (!Objects.equals(previousHash, currentHash)) {
                        changed = true;
                    }
                }

            } catch (Exception e) {
                String errorMessage = "Cannot tell if tsconfig file changed '" + tsConfigFile + "'";
                Status status = new Status(IStatus.ERROR, TypeScriptPlugin.ID, errorMessage, e);
                TypeScriptPlugin.getDefault().getLog().log(status);
            }
        }

        return changed;
    }

    public IFile getTsConfigFile() {
        IFile tsConfigFile = this.project.getFile("tsconfig.json");
        return tsConfigFile;
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

    private static BiMap<String, String> createPreferenceToTsConfigPathMap() {
        BiMap<String, String> map = HashBiMap.<String, String> create();
        map.put(IPreferenceConstants.COMPILER_COMPILE_ON_SAVE, "compileOnSave");
        map.put(IPreferenceConstants.COMPILER_DECLARATION, "compilerOptions.declaration");
        map.put(IPreferenceConstants.COMPILER_EXPERIMENTAL_DECORATORS, "compilerOptions.experimentalDecorators");
        map.put(IPreferenceConstants.COMPILER_INLINE_SOURCE_MAP, "compilerOptions.inlineSourceMap");
        map.put(IPreferenceConstants.COMPILER_INLINE_SOURCES, "compilerOptions.inlineSource");
        map.put(IPreferenceConstants.COMPILER_JSX, "compilerOptions.jsx");
        map.put(IPreferenceConstants.COMPILER_MODULE, "compilerOptions.module");
        map.put(IPreferenceConstants.COMPILER_MODULE_RESOLUTION, "compilerOptions.moduleResolution");
        map.put(IPreferenceConstants.COMPILER_NO_EMIT_ON_ERROR, "compilerOptions.noEmitOnError");
        map.put(IPreferenceConstants.COMPILER_NO_FALLTHROUGH_CASES_IN_SWITCH, "compilerOptions.noFallthroughCasesInSwitch");
        map.put(IPreferenceConstants.COMPILER_NO_IMPLICIT_ANY, "compilerOptions.noImplicitAny");
        map.put(IPreferenceConstants.COMPILER_NO_IMPLICIT_RETURNS, "compilerOptions.noImplicitReturns");
        map.put(IPreferenceConstants.COMPILER_NO_LIB, "compilerOptions.noLib");
        map.put(IPreferenceConstants.COMPILER_OUT_DIR, "compilerOptions.outDir");
        map.put(IPreferenceConstants.COMPILER_OUT_FILE, "compilerOptions.outFile");
        map.put(IPreferenceConstants.COMPILER_REMOVE_COMMENTS, "compilerOptions.removeComments");
        map.put(IPreferenceConstants.COMPILER_SOURCE_MAP, "compilerOptions.sourceMap");
        map.put(IPreferenceConstants.COMPILER_SUPPRESS_EXCESS_PROPERTY_ERRORS, "compilerOptions.suppressExcessPropertyErrors");
        map.put(IPreferenceConstants.COMPILER_SUPPRESS_IMPLICIT_ANY_INDEX_ERRORS, "compilerOptions.suppressImplicitAnyIndexErrors");
        map.put(IPreferenceConstants.COMPILER_TARGET, "compilerOptions.target");

        // TODO : handle files
        //        map.put(IPreferenceConstants.BUILD_PATH_SOURCE_FOLDER, "compilerOptions.target");

        return map;
    }
}
