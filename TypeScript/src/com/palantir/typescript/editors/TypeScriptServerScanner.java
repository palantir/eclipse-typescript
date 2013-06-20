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

import java.util.List;

import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.TextAttribute;
import org.eclipse.jface.text.rules.IToken;
import org.eclipse.jface.text.rules.ITokenScanner;
import org.eclipse.jface.text.rules.Token;
import org.eclipse.swt.SWT;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.palantir.typescript.tsbridge.TypeScriptBridge;
import com.palantir.typescript.tsbridge.syntaxhighlight.SyntaxHighlightResult;
import com.palantir.typescript.tsbridge.syntaxhighlight.TokenWrapper;

/**
 * This class handles tokenizing and properly highlighting sections of typescript. It does so by
 * calling the TypeScript language services via the TypeScript Bridge.
 *
 * @author tyleradams
 */
public final class TypeScriptServerScanner implements ITokenScanner {
    private final TextAttribute[] AttributeTable;

    private TokenWrapper[] tokenWrappers;
    private int tokenIndex;

    public TypeScriptServerScanner(ColorManager manager) {
        Preconditions.checkNotNull(manager);


        List<TextAttribute> attributePreTable = Lists.newArrayList();
        attributePreTable.add(new TextAttribute(manager.getColor(ITypeScriptColorConstants.PUNCTUATION)));
        attributePreTable.add(new TextAttribute(manager.getColor(ITypeScriptColorConstants.KEYWORD), null, SWT.BOLD));
        attributePreTable.add(new TextAttribute(manager.getColor(ITypeScriptColorConstants.OPERATOR)));
        attributePreTable.add(new TextAttribute(manager.getColor(ITypeScriptColorConstants.COMMENT)));
        attributePreTable.add(new TextAttribute(manager.getColor(ITypeScriptColorConstants.WHITESPACE)));
        attributePreTable.add(new TextAttribute(manager.getColor(ITypeScriptColorConstants.IDENTIFIER)));
        attributePreTable.add(new TextAttribute(manager.getColor(ITypeScriptColorConstants.NUMBER_LITERAL)));
        attributePreTable.add(new TextAttribute(manager.getColor(ITypeScriptColorConstants.STRING_LITERAL)));
        attributePreTable.add(new TextAttribute(manager.getColor(ITypeScriptColorConstants.REGEXP_LITERAL)));
        this.AttributeTable = new TextAttribute[attributePreTable.size()];
        attributePreTable.toArray(this.AttributeTable);
    }

    @Override
    public void setRange(IDocument document, int offset, int length) {
        Preconditions.checkNotNull(document);

        String text = document.get();
        String documentText = text.substring(offset, offset + length);
        SyntaxHighlightResult syntaxHighlightResult = TypeScriptBridge.getBridge().getSyntaxHighlightService().getTokenInformation(documentText, offset);
        this.tokenWrappers = syntaxHighlightResult.getTokenWrappers();
        IToken iToken;
        for (int i = 0; i < this.tokenWrappers.length; i++) {
            iToken = new Token(this.AttributeTable[this.tokenWrappers[i].getTokenID()]);
            this.tokenWrappers[i].setToken(iToken);
        }
        this.tokenIndex = -1;

    }

    @Override
    public IToken nextToken() {
        if (this.tokenIndex == this.tokenWrappers.length - 1) {
            return Token.EOF;
        }
        this.tokenIndex++;
        return this.tokenWrappers[this.tokenIndex].getToken();
    }

    @Override
    public int getTokenOffset() {
        return this.tokenWrappers[this.tokenIndex].getOffset();
    }

    @Override
    public int getTokenLength() {
        return this.tokenWrappers[this.tokenIndex].getLength();
    }

}
