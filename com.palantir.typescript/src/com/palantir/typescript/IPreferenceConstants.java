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


/**
 * The preference constants used for handling preferences.
 *
 * @author tyleradams
 */
public interface IPreferenceConstants {

    String BUILD_PATH_EXCLUDE = "build.path.exclude";
    String BUILD_PATH_EXPORTED_FOLDER = "build.path.exportedFolder";
    String BUILD_PATH_FILES = "build.path.files";
    String BUILD_PATH_INCLUDE = "build.path.include";
    String BUILD_PATH_SOURCE_FOLDER = "build.path.sourceFolder";

    String COMPILER_TARGET = "compiler.codeGenTarget";
    String COMPILER_COMPILE_ON_SAVE = "compiler.compileOnSave";
    String COMPILER_DECLARATION = "compiler.generateDeclarationFiles";
    String COMPILER_EXPERIMENTAL_DECORATORS = "compiler.experimentalDecorators";
    String COMPILER_INLINE_SOURCE_MAP = "compiler.inlineSourceMap";
    String COMPILER_INLINE_SOURCES = "compiler.inlineSources";
    String COMPILER_JSX = "compiler.jsx";
    String COMPILER_SOURCE_MAP = "compiler.mapSourceFiles";
    String COMPILER_MODULE = "compiler.moduleGenTarget";
    String COMPILER_MODULE_RESOLUTION = "compiler.moduleResolution";
    String COMPILER_NO_EMIT_ON_ERROR = "compiler.noEmitOnError";
    String COMPILER_NO_FALLTHROUGH_CASES_IN_SWITCH = "compiler.noFallthroughCasesInSwitch";
    String COMPILER_NO_IMPLICIT_ANY = "compiler.noImplicitAny";
    String COMPILER_NO_IMPLICIT_RETURNS = "compiler.noImplicitReturns";
    String COMPILER_NO_LIB = "compiler.noLib";
    String COMPILER_OUT_DIR = "compiler.outputDirOption";
    String COMPILER_OUT_FILE = "compiler.outputFileOption";
    String COMPILER_REMOVE_COMMENTS = "compiler.removeComments";
    String COMPILER_EMIT_DECORATOR_METADATA = "compiler.emitDecoratorMetadata";
    String COMPILER_SUPPRESS_EXCESS_PROPERTY_ERRORS = "compiler.suppressExcessPropertyErrors";
    String COMPILER_SUPPRESS_IMPLICIT_ANY_INDEX_ERRORS = "compiler.suppressImplicitAnyIndexErrors";
    String COMPILER_TYPES = "compiler.types";
    String COMPILER_TYPE_ROOTS = "compiler.typeRoots";
    String COMPILER_BASE_URL = "compiler.baseUrl";
    String COMPILER_PATHS = "compiler.paths";
    String COMPILER_ALLOW_SYNTHETIC = "compiler.allowSyntheticDefaultImports";


    String CONTENT_ASSIST_AUTO_ACTIVATION_DELAY = "contentAssist.autoActivationDelay";
    String CONTENT_ASSIST_AUTO_ACTIVATION_ENABLED = "contentAssist.autoActivationEnabled";
    String CONTENT_ASSIST_AUTO_ACTIVATION_TRIGGERS = "contentAssist.autoActivationTriggers";

    String EDITOR_CLOSE_BRACES = "editor.closeBraces";
    String EDITOR_CLOSE_JSDOCS = "editor.closeJSDocs";
    String EDITOR_INDENT_SIZE = "editor.indentSize";
    String EDITOR_INDENT_STYLE = "editor.indentStyle";
    String EDITOR_MATCHING_BRACKETS = "editor.matchingBrackets";
    String EDITOR_MATCHING_BRACKETS_COLOR = "editor.matchingBracketsColor";

    String FORMATTER_INSERT_SPACE_AFTER_COMMA_DELIMITER = "formatter.insertSpaceAfterCommaDelimiter";
    String FORMATTER_INSERT_SPACE_AFTER_FUNCTION_KEYWORD_FOR_ANONYMOUS_FUNCTIONS = "formatter.insertSpaceAfterFunctionKeywordForAnonymousFunctions";
    String FORMATTER_INSERT_SPACE_AFTER_KEYWORDS_IN_CONTROL_FLOW_STATEMENTS = "formatter.insertSpaceAfterKeywordsInControlFlowStatements";
    String FORMATTER_INSERT_SPACE_AFTER_OPENING_AND_BEFORE_CLOSING_NONEMPTY_PARENTHESIS = "formatter.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis";
    String FORMATTER_INSERT_SPACE_AFTER_OPENING_AND_BEFORE_CLOSING_TEMPLATE_STRING_BRACES = "formatter.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces";
    String FORMATTER_INSERT_SPACE_AFTER_SEMICOLON_IN_FOR_STATEMENTS = "formatter.insertSpaceAfterSemicolonInForStatements";
    String FORMATTER_INSERT_SPACE_BEFORE_AND_AFTER_BINARY_OPERATORS = "formatter.insertSpaceBeforeAndAfterBinaryOperators";
    String FORMATTER_PLACE_OPEN_BRACE_ON_NEW_LINE_FOR_CONTROL_BLOCKS = "formatter.placeOpenBraceOnNewLineForControlBlocks";
    String FORMATTER_PLACE_OPEN_BRACE_ON_NEW_LINE_FOR_FUNCTIONS = "formatter.placeOpenBraceOnNewLineForFunctions";

    String GENERAL_NODE_PATH = "general.nodePath";
    String GENERAL_USE_TSCONFIG_FILE = "general.useTsConfigFile";

    String SYNTAX_COLORING_COMMENT_COLOR = "syntaxColoring.comment.color";
    String SYNTAX_COLORING_IDENTIFIER_COLOR = "syntaxColoring.identifier.color";
    String SYNTAX_COLORING_KEYWORD_COLOR = "syntaxColoring.keyword.color";
    String SYNTAX_COLORING_NUMBER_LITERAL_COLOR = "syntaxColoring.numberLiteral.color";
    String SYNTAX_COLORING_OPERATOR_COLOR = "syntaxColoring.operator.color";
    String SYNTAX_COLORING_PUNCTUATION_COLOR = "syntaxColoring.punctuation.color";
    String SYNTAX_COLORING_REG_EXP_LITERAL_COLOR = "syntaxColoring.regExpLiteral.color";
    String SYNTAX_COLORING_STRING_LITERAL_COLOR = "syntaxColoring.stringLiteral.color";

    String PREFERENCE_STORE_TS_CONFIG_LAST_MODIFICATION_TIME = "preferenceStore.tsConfigLastModTime";
    String PREFERENCE_STORE_TS_CONFIG_HASH = "preferenceStore.tsConfigHash";
}
