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

import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.TextAttribute;
import org.eclipse.jface.text.rules.IToken;
import org.eclipse.jface.text.rules.ITokenScanner;
import org.eclipse.jface.text.rules.Token;

import com.google.common.base.Preconditions;

/**
 * The TypeScriptScanner parses TypeScript code into tokens and determines the proper text
 * formatting for each token.
 *
 * @author tyleradams
 */
public final class TypeScriptScanner implements ITokenScanner {
    @SuppressWarnings("unused")
    private final ColorManager manager; //will be used in nextToken in future commits.
    private final TextAttribute defaultAttribute;
    private final Token defaultToken;
    private int tokenIndex;
    private int offset;
    private int length;

    public TypeScriptScanner(ColorManager manager) {
        Preconditions.checkNotNull(manager);

        this.manager = manager;
        this.defaultAttribute = new TextAttribute(manager.getColor(ITypeScriptColorConstants.DEFAULT));
        this.defaultToken = new Token(this.defaultAttribute);
    }

    @Override
    public void setRange(IDocument document, int offset, int length) {
        this.offset = offset;
        this.length = length;
        this.tokenIndex = 0;
    }

    @Override
    public IToken nextToken() {
        if (this.tokenIndex == 0) {
            this.tokenIndex++;
            return this.defaultToken;
        } else {
            return Token.EOF;
        }
    }

    @Override
    public int getTokenOffset() {
        return this.offset;
    }

    @Override
    public int getTokenLength() {
        return this.length;
    }

}
