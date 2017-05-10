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
import static com.palantir.typescript.TypeScriptPlugin.logError;
import static com.palantir.typescript.TypeScriptPlugin.logInfo;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;

import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.ProjectScope;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.core.runtime.preferences.IScopeContext;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Joiner;
import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import com.google.common.hash.Hashing;
import com.google.common.io.CharStreams;
import com.google.common.io.Files;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.TypeScriptProjectSources;

/**
 * tsconfig file reader which holds mapping with TypeScript plugin preferences.
 *
 * @author lgrignon
 */
public final class TsConfigPreferences {

    private static final BiMap<String, String> PREFERENCE_TO_TSCONFIG_PATH = createPreferenceToTsConfigPathMap();

    private static final Map<String, String> TSCONFIG_PATH_TO_PREFERENCE = PREFERENCE_TO_TSCONFIG_PATH.inverse();

    private static final Map<String, String> TSCONFIG_TARGET_MAPPING = ImmutableMap.of(
        "ES3", "ECMASCRIPT3", "ES5", "ECMASCRIPT5", "ES6", "ECMASCRIPT6", "ES2015", "ECMASCRIPT6");

    private static final Map<String, String> TSCONFIG_MODULE_KIND_MAPPING = ImmutableMap.of(
        "COMMONJS", "COMMONSJS", "ES2015", "ES6");

    private static final Map<String, String> TSCONFIG_MODULE_RESOLUTION_MAPPING = ImmutableMap.of(
        "NODE", "NODE_JS");

    private final IProject project;
    private Map<String, Object> preferenceValues;

    public TsConfigPreferences(IProject project) {
        checkNotNull(project);

        this.project = project;
    }

    public synchronized Map<String, Object> getPreferenceValues() {
        if (preferenceValues == null || didTsConfigFileChanged()) {
            reloadTsConfigFile();
        }

        return Collections.unmodifiableMap(preferenceValues);
    }

    public Object getValue(String preferenceName) {
        return getPreferenceValues().get(preferenceName);
    }

    public boolean reloadTsConfigFile() {
        logInfo("reload tsconfig file");

        this.preferenceValues = Maps.newHashMap();

        IFile tsConfigFile = null;
        InputStream tsConfigStream = null;
        boolean loaded = false;
        try {
            tsConfigFile = getTsConfigFile();
            if (tsConfigFile.exists()) {

                if (!tsConfigFile.isSynchronized(IResource.DEPTH_ZERO)) {
                    tsConfigFile.refreshLocal(IResource.DEPTH_ZERO, null);
                }

                // refresh tsconfig cache infos
                IEclipsePreferences projectPreferences = this.getProjectPreferences();
                projectPreferences.put(IPreferenceConstants.PREFERENCE_STORE_TS_CONFIG_HASH,
                    getFileSHA1(tsConfigFile));
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

                // resets preferences to default
                resetTsConfigDefaultPreferences();

                // reads preferences from tsconfig
                decodeTsConfigEntries("", tsConfigEntries);

                loaded = true;
            }

        } catch (Exception e) {
            logError("Cannot reload ts config file '" + tsConfigFile + "'", e);
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

    public boolean isTsConfigPreference(String preferenceName) {
        return PREFERENCE_TO_TSCONFIG_PATH.containsKey(preferenceName);
    }

    private String getFileSHA1(IFile tsConfigFile) throws IOException {
        return Files.hash(tsConfigFile.getRawLocation().toFile(), Hashing.sha1()).toString();
    }

    private void resetTsConfigDefaultPreferences() {
        preferenceValues.clear();
        for (String preferenceKey : PREFERENCE_TO_TSCONFIG_PATH.keySet()) {
            preferenceValues.put(preferenceKey, null);
        }
        System.out.println("tsconfig preferences reset: " + this);
    }

    private void decodeTsConfigEntries(String jsonTreePath, Map<String, Object> entries) {

        for (Map.Entry<String, Object> tsConfigEntry : entries.entrySet()) {
            if (isSupportedTsConfigPath(jsonTreePath + tsConfigEntry.getKey())) {

                String matchingPreference = TSCONFIG_PATH_TO_PREFERENCE.get(jsonTreePath + tsConfigEntry.getKey());

                if(tsConfigEntry.getValue() instanceof Map) {
                    this.preferenceValues.put(matchingPreference, tsConfigEntry.getValue());
                } else {
                    String value = tsConfigValueToPreferenceValue(tsConfigEntry.getValue(), matchingPreference);

                    this.preferenceValues.put(matchingPreference, value);
                }
            } else if (tsConfigEntry.getValue() instanceof Map) {
                decodeTsConfigEntries(jsonTreePath + tsConfigEntry.getKey() + ".", (Map) tsConfigEntry.getValue());
            }
        }
    }

    private String tsConfigValueToPreferenceValue(Object tsConfigValue, String matchingPreference) {
        String value = null;
        if (tsConfigValue != null) {

            if (tsConfigValue instanceof Collection) {
                value = Joiner.on(TypeScriptProjectSources.BUILD_PATH_SPEC_SEPARATOR).join((Collection) tsConfigValue);
            } else {
                value = tsConfigValue.toString();
            }

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

    private boolean isSupportedTsConfigPath(String tsConfigJsonPath) {
        return TSCONFIG_PATH_TO_PREFERENCE.containsKey(tsConfigJsonPath);
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
                logError("Cannot tell if tsconfig file changed '" + tsConfigFile + "'", e);
            }
        }

        return changed;
    }

    private IFile getTsConfigFile() {
        IFile tsConfigFile = this.project.getFile("tsconfig.json");
        return tsConfigFile;
    }

    private IEclipsePreferences getProjectPreferences() {
        IScopeContext projectScope = new ProjectScope(this.project);
        return projectScope.getNode(TypeScriptPlugin.ID);
    }

    private static BiMap<String, String> createPreferenceToTsConfigPathMap() {
        BiMap<String, String> map = HashBiMap.<String, String> create();

        map.put(IPreferenceConstants.BUILD_PATH_FILES, "files");
        map.put(IPreferenceConstants.BUILD_PATH_INCLUDE, "include");
        map.put(IPreferenceConstants.BUILD_PATH_EXCLUDE, "exclude");

        map.put(IPreferenceConstants.COMPILER_COMPILE_ON_SAVE, "compileOnSave");
        map.put(IPreferenceConstants.COMPILER_DECLARATION, "compilerOptions.declaration");
        map.put(IPreferenceConstants.COMPILER_EXPERIMENTAL_DECORATORS, "compilerOptions.experimentalDecorators");
        map.put(IPreferenceConstants.COMPILER_EMIT_DECORATOR_METADATA, "compilerOptions.emitDecoratorMetadata");
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
        map.put(IPreferenceConstants.COMPILER_TYPES, "compilerOptions.types");
        map.put(IPreferenceConstants.COMPILER_TYPE_ROOTS, "compilerOptions.typeRoots");
        map.put(IPreferenceConstants.COMPILER_BASE_URL, "compilerOptions.baseUrl");
        map.put(IPreferenceConstants.COMPILER_PATHS, "compilerOptions.paths");

        return map;
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + ": " + getPreferenceValues();
    }
}
