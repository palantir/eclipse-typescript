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
 * Corresponds to the enum with the same name in typescriptServices.d.ts.
 *
 * @author tyleradams
 */
public final class CompilerOptions {

    @JsonProperty("allowJs")
    private Boolean allowJs;

    @JsonProperty("allowNonTsExtensions")
    private Boolean allowNonTsExtensions;

    @JsonProperty("allowSyntheticDefaultImports")
    private Boolean allowSyntheticDefaultImports;

    @JsonProperty("allowUnreachableCode")
    private Boolean allowUnreachableCode;

    @JsonProperty("allowUnusedLabels")
    private Boolean allowUnusedLabels;

    @JsonProperty("charset")
    private String charset;

    @JsonProperty("declaration")
    private Boolean declaration;

    @JsonProperty("diagnostics")
    private Boolean diagnostics;

    @JsonProperty("emitBOM")
    private Boolean emitBOM;

    @JsonProperty("emitDecoratorMetadata")
    private Boolean emitDecoratorMetadata;

    @JsonProperty("experimentalAsyncFunctions")
    private Boolean experimentalAsyncFunctions;

    @JsonProperty("experimentalDecorators")
    private Boolean experimentalDecorators;

    @JsonProperty("forceConsistentCasingInFileNames")
    private Boolean forceConsistentCasingInFileNames;

    @JsonProperty("help")
    private Boolean help;

    @JsonProperty("init")
    private Boolean init;

    @JsonProperty("inlineSourceMap")
    private Boolean inlineSourceMap;

    @JsonProperty("inlineSources")
    private Boolean inlineSources;

    @JsonProperty("isolatedModules")
    private Boolean isolatedModules;

    @JsonProperty("jsx")
    private JsxEmit jsx;

    @JsonProperty("listFiles")
    private Boolean listFiles;

    @JsonProperty("locale")
    private String locale;

    @JsonProperty("mapRoot")
    private String mapRoot;

    @JsonProperty("module")
    private ModuleKind module;

    @JsonProperty("moduleResolution")
    private ModuleResolutionKind moduleResolution;

    @JsonProperty("newLine")
    private NewLineKind newLine;

    @JsonProperty("noEmit")
    private Boolean noEmit;

    @JsonProperty("noEmitHelpers")
    private Boolean noEmitHelpers;

    @JsonProperty("noEmitOnError")
    private Boolean noEmitOnError;

    @JsonProperty("noErrorTruncation")
    private Boolean noErrorTruncation;

    @JsonProperty("noFallthroughCasesInSwitch")
    private Boolean noFallthroughCasesInSwitch;

    @JsonProperty("noImplicitAny")
    private Boolean noImplicitAny;

    @JsonProperty("noImplicitReturns")
    private Boolean noImplicitReturns;

    @JsonProperty("noLib")
    private Boolean noLib;

    @JsonProperty("noResolve")
    private Boolean noResolve;

    @JsonProperty("out")
    private String out;

    @JsonProperty("outDir")
    private String outDir;

    @JsonProperty("outFile")
    private String outFile;

    @JsonProperty("preserveConstEnums")
    private Boolean preserveConstEnums;

    @JsonProperty("project")
    private String project;

    @JsonProperty("reactNamespace")
    private String reactNamespace;

    @JsonProperty("removeComments")
    private Boolean removeComments;

    @JsonProperty("rootDir")
    private String rootDir;

    @JsonProperty("sourceMap")
    private Boolean sourceMap;

    @JsonProperty("sourceRoot")
    private String sourceRoot;

    @JsonProperty("suppressExcessPropertyErrors")
    private Boolean suppressExcessPropertyErrors;

    @JsonProperty("suppressImplicitAnyIndexErrors")
    private Boolean suppressImplicitAnyIndexErrors;

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

        // create the compiler options from the preferences
        CompilerOptions compilerOptions = new CompilerOptions();
        compilerOptions.declaration = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_DECLARATION);
        compilerOptions.experimentalDecorators = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_EXPERIMENTAL_DECORATORS);
        compilerOptions.inlineSourceMap = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_INLINE_SOURCE_MAP);
        compilerOptions.inlineSources = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_INLINE_SOURCES);
        compilerOptions.jsx = JsxEmit.valueOf(preferenceStore.getString(IPreferenceConstants.COMPILER_JSX));
        compilerOptions.module = ModuleKind.parse(preferenceStore.getString(IPreferenceConstants.COMPILER_MODULE));
        compilerOptions.moduleResolution = ModuleResolutionKind.CLASSIC;
        compilerOptions.noEmitOnError = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_NO_EMIT_ON_ERROR);
        compilerOptions.noFallthroughCasesInSwitch = preferenceStore
            .getBoolean(IPreferenceConstants.COMPILER_NO_FALLTHROUGH_CASES_IN_SWITCH);
        compilerOptions.noImplicitAny = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_NO_IMPLICIT_ANY);
        compilerOptions.noImplicitReturns = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_NO_IMPLICIT_RETURNS);
        compilerOptions.noLib = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_NO_LIB);
        compilerOptions.removeComments = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_REMOVE_COMMENTS);
        compilerOptions.sourceMap = preferenceStore.getBoolean(IPreferenceConstants.COMPILER_SOURCE_MAP);
        compilerOptions.suppressExcessPropertyErrors = preferenceStore
            .getBoolean(IPreferenceConstants.COMPILER_SUPPRESS_EXCESS_PROPERTY_ERRORS);
        compilerOptions.suppressImplicitAnyIndexErrors = preferenceStore
            .getBoolean(IPreferenceConstants.COMPILER_SUPPRESS_IMPLICIT_ANY_INDEX_ERRORS);
        compilerOptions.target = ScriptTarget.valueOf(preferenceStore.getString(IPreferenceConstants.COMPILER_TARGET));

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

            compilerOptions.out = outputFolderName + outFile;
        } else if (outputFolderName != null) {
            compilerOptions.outDir = outputFolderName;
        }

        return compilerOptions;
    }
}
