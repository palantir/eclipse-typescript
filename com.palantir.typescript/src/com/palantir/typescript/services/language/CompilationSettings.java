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

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Corresponds to the class with the same name in compiler/precompile.ts.
 *
 * @author tyleradams
 */
public final class CompilationSettings {

    @JsonProperty("propagateEnumConstants")
    private final boolean propagateEnumConstants;

    @JsonProperty("removeComments")
    private final boolean removeComments;

    @JsonProperty("watch")
    private final boolean watch;

    @JsonProperty("noResolve")
    private final boolean noResolve;

    @JsonProperty("allowAutomaticSemicolonInsertion")
    private final boolean allowAutomaticSemicolonInsertion;

    @JsonProperty("noImplicitAny")
    private final boolean noImplicitAny;

    @JsonProperty("noLib")
    private final boolean noLib;

    @JsonProperty("codeGenTarget")
    private final LanguageVersion codeGenTarget;

    @JsonProperty("moduleGenTarget")
    private final ModuleGenTarget moduleGenTarget;

    @JsonProperty("outFileOption")
    private final String outFileOption;

    @JsonProperty("outDirOption")
    private final String outDirOption;

    @JsonProperty("mapSourceFiles")
    private final boolean mapSourceFiles;

    @JsonProperty("mapRoot")
    private final String mapRoot;

    @JsonProperty("sourceRoot")
    private final String sourceRoot;

    @JsonProperty("generateDeclarationFiles")
    private final boolean generateDeclarationFiles;

    @JsonProperty("useCaseSensitiveFileResolution")
    private final boolean useCaseSensitiveFileResolution;

    @JsonProperty("gatherDiagnostics")
    private final boolean gatherDiagnostics;

    @JsonProperty("updateTC")
    private final boolean updateTC;

    @JsonProperty("codepage")
    private final Integer codepage;

    public CompilationSettings(
            boolean noLib,
            LanguageVersion codeGenTarget,
            ModuleGenTarget moduleGenTarget,
            boolean mapSourceFiles,
            boolean removeComments) {
        checkNotNull(codeGenTarget);
        checkNotNull(moduleGenTarget);

        this.propagateEnumConstants = false;
        this.removeComments = removeComments;
        this.watch = false;
        this.noResolve = false;
        this.allowAutomaticSemicolonInsertion = true;
        this.noImplicitAny = false;

        this.noLib = noLib;

        this.codeGenTarget = codeGenTarget;
        this.moduleGenTarget = moduleGenTarget;

        this.outFileOption = "";
        this.outDirOption = "";
        this.mapSourceFiles = mapSourceFiles;
        this.mapRoot = "";
        this.sourceRoot = "";
        this.generateDeclarationFiles = false;

        this.useCaseSensitiveFileResolution = false;
        this.gatherDiagnostics = false;

        this.updateTC = false;

        this.codepage = null;
    }
}
