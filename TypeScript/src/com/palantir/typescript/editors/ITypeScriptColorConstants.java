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

package com.palantir.typescript.editors;

import org.eclipse.swt.graphics.RGB;

/**
 * This is a way for allowing clean calls to color constants; the actual colors are defined here.
 *
 * @author tyleradams
 */
public interface ITypeScriptColorConstants {
    RGB BLACK = new RGB(0, 0, 0);
    RGB RED = new RGB(219, 0, 0);
    RGB COMMENT_GREEN = new RGB(63, 127, 95);
    RGB KEYWORD_PURPLE = new RGB(127, 0, 85);
    RGB STRING_BLUE = new RGB(42, 0, 255);
    RGB JAVA_DOC_DARK_BLUE = new RGB(63, 63, 191);
    RGB JAVA_DOC_LIGHT_BLUE = new RGB(63, 95, 191);
    RGB JAVA_DOC_BLUE_GRAY = new RGB(127, 127, 159);

    RGB PUNCTUATION = BLACK;
    RGB KEYWORD = KEYWORD_PURPLE;
    RGB OPERATOR = BLACK;
    RGB COMMENT = COMMENT_GREEN;
    RGB WHITESPACE = BLACK;
    RGB IDENTIFIER = BLACK;
    RGB NUMBER_LITERAL = BLACK;
    RGB STRING_LITERAL = STRING_BLUE;
    RGB REGEXP_LITERAL = RED;

    RGB JS_DEFAULT = JAVA_DOC_LIGHT_BLUE;
    RGB JSDOC_TAG = new RGB(127, 159, 191);
    RGB JSDOC_MARKUP = JAVA_DOC_BLUE_GRAY;
    RGB JSDOC_LINK = JAVA_DOC_DARK_BLUE;
}
