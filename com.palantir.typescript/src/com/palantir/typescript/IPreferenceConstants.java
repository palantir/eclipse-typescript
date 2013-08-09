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

package com.palantir.typescript;

import com.google.common.collect.ImmutableList;

/**
 * The preference constants used for handling preferences.
 *
 * @author tyleradams
 */
public interface IPreferenceConstants {
    String COMPILER_CODE_GEN_TARGET = "compiler.codeGenTarget";
    String COMPILER_COMPILE_ON_SAVE = "compiler.compileOnSave";
    String COMPILER_MAP_SOURCE_FILES = "compiler.mapSourceFiles";
    String COMPILER_MODULE_GEN_TARGET = "compiler.moduleGenTarget";
    String COMPILER_NO_LIB = "compiler.noLib";
    String COMPILER_REMOVE_COMMENTS = "compiler.removeComments";

    ImmutableList<String> COMPILER_PREFERENCES = ImmutableList.of(
        COMPILER_CODE_GEN_TARGET,
        COMPILER_COMPILE_ON_SAVE,
        COMPILER_MAP_SOURCE_FILES,
        COMPILER_MODULE_GEN_TARGET,
        COMPILER_NO_LIB,
        COMPILER_REMOVE_COMMENTS);
}
