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

    String BUILD_PATH_SOURCE_FOLDER = "build.path.sourceFolder";

    String COMPILER_CODE_GEN_TARGET = "compiler.codeGenTarget";
    String COMPILER_COMPILE_ON_SAVE = "compiler.compileOnSave";
    String COMPILER_MAP_SOURCE_FILES = "compiler.mapSourceFiles";
    String COMPILER_MODULE_GEN_TARGET = "compiler.moduleGenTarget";
    String COMPILER_NO_LIB = "compiler.noLib";
    String COMPILER_OUTPUT_DIR_OPTION = "compiler.optionDirOption";
    String COMPILER_REMOVE_COMMENTS = "compiler.removeComments";

    ImmutableList<String> COMPILER_PREFERENCES = ImmutableList.of(
        COMPILER_CODE_GEN_TARGET,
        COMPILER_COMPILE_ON_SAVE,
        COMPILER_MAP_SOURCE_FILES,
        COMPILER_MODULE_GEN_TARGET,
        COMPILER_NO_LIB,
        COMPILER_OUTPUT_DIR_OPTION,
        COMPILER_REMOVE_COMMENTS);

    String EDITOR_CLOSE_BRACES = "editor.closeBraces";
    String EDITOR_INDENT_SIZE = "editor.indentSize";
    String EDITOR_MATCHING_BRACKETS = "editor.matchingBrackets";
    String EDITOR_MATCHING_BRACKETS_COLOR = "editor.matchingBracketsColor";

    String FORMATTER_INSERT_SPACE_AFTER_COMMA_DELIMITER = "formatter.insertSpaceAfterCommaDelimiter";
    String FORMATTER_INSERT_SPACE_AFTER_FUNCTION_KEYWORD_FOR_ANONYMOUS_FUNCTIONS = "formatter.insertSpaceAfterFunctionKeywordForAnonymousFunctions";
    String FORMATTER_INSERT_SPACE_AFTER_KEYWORDS_IN_CONTROL_FLOW_STATEMENTS = "formatter.insertSpaceAfterKeywordsInControlFlowStatements";
    String FORMATTER_INSERT_SPACE_AFTER_OPENING_AND_BEFORE_CLOSING_NONEMPTY_PARENTHESIS = "formatter.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis";
    String FORMATTER_INSERT_SPACE_AFTER_SEMICOLON_IN_FOR_STATEMENTS = "formatter.insertSpaceAfterSemicolonInForStatements";
    String FORMATTER_INSERT_SPACE_BEFORE_AND_AFTER_BINARY_OPERATORS = "formatter.insertSpaceBeforeAndAfterBinaryOperators";
    String FORMATTER_PLACE_OPEN_BRACE_ON_NEW_LINE_FOR_CONTROL_BLOCKS = "formatter.placeOpenBraceOnNewLineForControlBlocks";
    String FORMATTER_PLACE_OPEN_BRACE_ON_NEW_LINE_FOR_FUNCTIONS = "formatter.placeOpenBraceOnNewLineForFunctions";
}
