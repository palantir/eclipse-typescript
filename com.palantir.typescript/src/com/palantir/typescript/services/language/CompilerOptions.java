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

package com.palantir.typescript.services.language;

import static com.google.common.base.Preconditions.checkNotNull;

import org.eclipse.core.resources.IFolder;
import org.eclipse.core.resources.IProject;
import org.eclipse.jface.preference.IPreferenceStore;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Strings;
import com.palantir.typescript.EclipseResources;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.preferences.ProjectPreferenceStore;

/**
 * Corresponds to the class with the same name in compiler/precompile.ts.
 *
 * @author tyleradams
 */
public final class CompilerOptions {

    @JsonProperty("allowNonTsExtensions")
    private Boolean allowNonTsExtensions;

    @JsonProperty("charset")
    private String charset;

    @JsonProperty("codepage")
    private Integer codepage;

    @JsonProperty("declaration")
    private Boolean declaration;

    @JsonProperty("diagnostics")
    private Boolean diagnostics;

    @JsonProperty("emitBOM")
    private Boolean emitBOM;

    @JsonProperty("help")
    private Boolean help;

    @JsonProperty("locale")
    private String locale;

    @JsonProperty("mapRoot")
    private String mapRoot;

    @JsonProperty("module")
    private ModuleKind module;

    @JsonProperty("noEmitOnError")
    private Boolean noEmitOnError;

    @JsonProperty("noErrorTruncation")
    private Boolean noErrorTruncation;

    @JsonProperty("noImplicitAny")
    private Boolean noImplicitAny;

    @JsonProperty("noLib")
    private Boolean noLib;

    @JsonProperty("noLibCheck")
    private Boolean noLibCheck;

    @JsonProperty("noResolve")
    private Boolean noResolve;

    @JsonProperty("out")
    private String out;

    @JsonProperty("outDir")
    private String outDir;

    @JsonProperty("preserveConstEnums")
    private Boolean preserveConstEnums;

    @JsonProperty("removeComments")
    private Boolean removeComments;

    @JsonProperty("sourceMap")
    private Boolean sourceMap;

    @JsonProperty("sourceRoot")
    private String sourceRoot;

    @JsonProperty("target")
    private ScriptTarget target;

    @JsonProperty("version")
    private Boolean version;

    @JsonProperty("watch")
    private Boolean watch;

    private CompilerOptions() {
    }

    public static CompilerOptions fromProject(IProject project) {
        checkNotNull(project);

        IPreferenceStore preferenceStore = new ProjectPreferenceStore(project);

        // create the compilation settings from the preferences
        CompilerOptions compilationSettings = new CompilerOptions();
        compilationSettings.declaration = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_DECLARATION);
        compilationSettings.module = ModuleKind.valueOf(preferenceStore.getString(IPreferenceConstants.COMPILER_MODULE));
        compilationSettings.noEmitOnError = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_NO_EMIT_ON_ERROR);
        compilationSettings.noImplicitAny = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_NO_IMPLICIT_ANY);
        compilationSettings.noLib = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_NO_LIB);
        compilationSettings.removeComments = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_REMOVE_COMMENTS);
        compilationSettings.sourceMap = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_SOURCE_MAP);
        compilationSettings.target = ScriptTarget.valueOf(preferenceStore.getString(IPreferenceConstants.COMPILER_TARGET));

        // set the output directory or file if it was specified
        String outDir = preferenceStore.getString(IPreferenceConstants.COMPILER_OUT_DIR);
        String outFile = preferenceStore.getString(IPreferenceConstants.COMPILER_OUT_FILE);

        // get the eclipse name for the output directory
        String outputFolderName = null;
        if (!Strings.isNullOrEmpty(outDir)) {
            IFolder outputFolder = project.getFolder(outDir);

            outputFolderName = EclipseResources.getContainerName(outputFolder);
        }

        if (!Strings.isNullOrEmpty(outFile)) {
            if (outputFolderName == null) {
                outputFolderName = EclipseResources.getContainerName(project);
            }

            compilationSettings.out = outputFolderName + outFile;
        } else if (outputFolderName != null) {
            compilationSettings.outDir = outputFolderName;
        }

        return compilationSettings;
    }
}
