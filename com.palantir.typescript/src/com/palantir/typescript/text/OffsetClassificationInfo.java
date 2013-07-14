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

package com.palantir.typescript.text;

import java.util.Map;

import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.StyleRange;
import org.eclipse.swt.graphics.Color;

import com.google.common.collect.Maps;
import com.palantir.typescript.bridge.classifier.ClassificationInfo;
import com.palantir.typescript.bridge.classifier.TokenClass;

/**
 * @author tadams
 */
public final class OffsetClassificationInfo {

    private final ClassificationInfo entry;
    private final int offset;
    private final StyleRange styleRange;
    private static final Map<TokenClass, Color> CLASS_TO_COLOR;
    private static final Map<TokenClass, Integer> CLASS_TO_STYLE;

    static {
        ColorManager manager = new ColorManager();
        CLASS_TO_COLOR = Maps.newHashMap();
        CLASS_TO_STYLE = Maps.newHashMap();

        TokenClass tokenClass;
        Color color;

        tokenClass = TokenClass.PUNCTUATION;
        color = manager.getColor(TypeScriptColorConstants.PUNCTUATION);
        CLASS_TO_COLOR.put(tokenClass, color);
        CLASS_TO_STYLE.put(tokenClass, 0);

        tokenClass = TokenClass.KEYWORD;
        color = manager.getColor(TypeScriptColorConstants.KEYWORD);
        CLASS_TO_COLOR.put(tokenClass, color);
        CLASS_TO_STYLE.put(tokenClass, SWT.BOLD);

        tokenClass = TokenClass.OPERATOR;
        color = manager.getColor(TypeScriptColorConstants.OPERATOR);
        CLASS_TO_COLOR.put(tokenClass, color);
        CLASS_TO_STYLE.put(tokenClass, 0);

        tokenClass = TokenClass.COMMENT;
        color = manager.getColor(TypeScriptColorConstants.COMMENT);
        CLASS_TO_COLOR.put(tokenClass, color);
        CLASS_TO_STYLE.put(tokenClass, 0);

        tokenClass = TokenClass.WHITESPACE;
        color = manager.getColor(TypeScriptColorConstants.WHITESPACE);
        CLASS_TO_COLOR.put(tokenClass, color);
        CLASS_TO_STYLE.put(tokenClass, 0);

        tokenClass = TokenClass.IDENTIFIER;
        color = manager.getColor(TypeScriptColorConstants.IDENTIFIER);
        CLASS_TO_COLOR.put(tokenClass, color);
        CLASS_TO_STYLE.put(tokenClass, 0);

        tokenClass = TokenClass.NUMBER_LITERAL;
        color = manager.getColor(TypeScriptColorConstants.NUMBER_LITERAL);
        CLASS_TO_COLOR.put(tokenClass, color);
        CLASS_TO_STYLE.put(tokenClass, 0);

        tokenClass = TokenClass.STRING_LITERAL;
        color = manager.getColor(TypeScriptColorConstants.STRING_LITERAL);
        CLASS_TO_COLOR.put(tokenClass, color);
        CLASS_TO_STYLE.put(tokenClass, 0);

        tokenClass = TokenClass.REG_EXP_LITERAL;
        color = manager.getColor(TypeScriptColorConstants.REG_EXP_LITERAL);
        CLASS_TO_COLOR.put(tokenClass, color);
        CLASS_TO_STYLE.put(tokenClass, 0);

    }

    public OffsetClassificationInfo(ClassificationInfo entry, int offset) {
        this.entry = entry;
        this.offset = offset;

        // prepare the style range.
        int length = entry.getLength();

        TokenClass tokenClass = entry.getClassification();
        Color foregroundColor = CLASS_TO_COLOR.get(tokenClass);
        int fontStyle = CLASS_TO_STYLE.get(tokenClass);
        this.styleRange = new StyleRange(offset, length, foregroundColor, null, fontStyle);
    }

    public ClassificationInfo getEntry() {
        return this.entry;
    }

    public int getOffset() {
        return this.offset;
    }

    public StyleRange getStyleRange() {
        return this.styleRange;
    }
}
