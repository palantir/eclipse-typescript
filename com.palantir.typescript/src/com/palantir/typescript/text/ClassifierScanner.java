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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;

import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.TextAttribute;
import org.eclipse.jface.text.rules.IToken;
import org.eclipse.jface.text.rules.ITokenScanner;
import org.eclipse.jface.text.rules.Token;
import org.eclipse.swt.SWT;

import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.palantir.typescript.Activator;
import com.palantir.typescript.bridge.classifier.ClassificationInfo;
import com.palantir.typescript.bridge.classifier.ClassificationResult;
import com.palantir.typescript.bridge.classifier.TokenClass;

/**
 * This class handles tokenizing and properly highlighting sections of typescript. It does so by
 * calling the TypeScript language services via the TypeScript Bridge.
 *
 * @author tyleradams
 */
public final class ClassifierScanner implements ITokenScanner {

    private static final Splitter LINE_SPLITTER = Splitter.on('\n');

    private final ImmutableList<IToken> tokens;

    private List<OffsetClassificationInfo> infos;
    private int currentIndex;

    public ClassifierScanner(ColorManager manager) {
        checkNotNull(manager);

        this.tokens = createTokens(manager);
    }

    @Override
    public void setRange(IDocument document, int offset, int length) {
        checkNotNull(document);
        checkArgument(offset >= 0);
        checkArgument(length >= 0);

        // reset the state
        this.infos = Lists.newArrayList();
        this.currentIndex = -1;

        // get the document text in the specified range
        String documentText = document.get();
        String rangeText = documentText.substring(offset, offset + length);

        // break the text up into lines (keeping track of the offset for each line)
        int currentOffset = offset;
        List<String> lines = Lists.newArrayList();
        List<Integer> lineOffsets = Lists.newArrayList();
        for (String line : LINE_SPLITTER.split(rangeText)) {
            lineOffsets.add(currentOffset);
            currentOffset += line.length() + 1; // add 1 for the newline character

            if (line.endsWith("\r")) {
                line = line.substring(0, line.length() - 1);
            }
            lines.add(line);
        }

        // classify the lines
        List<ClassificationResult> results = Activator.getBridge().getClassifier().getClassificationsForLines(lines);
        for (int i = 0; i < results.size(); i++) {
            int tokenOffset = lineOffsets.get(i);
            ClassificationResult result = results.get(i);

            for (ClassificationInfo entry : result.getEntries()) {
                OffsetClassificationInfo tokenWrapper = new OffsetClassificationInfo(entry, tokenOffset);

                this.infos.add(tokenWrapper);
                tokenOffset += entry.getLength();
            }
        }
    }

    @Override
    public IToken nextToken() {
        this.currentIndex++;

        if (this.currentIndex == this.infos.size()) {
            return Token.EOF;
        } else {
            OffsetClassificationInfo info = this.getCurrentInfo();
            int classificationIndex = info.entry.getClassification().ordinal();

            return this.tokens.get(classificationIndex);
        }
    }

    @Override
    public int getTokenOffset() {
        return this.getCurrentInfo().offset;
    }

    @Override
    public int getTokenLength() {
        return this.getCurrentInfo().entry.getLength();
    }

    private OffsetClassificationInfo getCurrentInfo() {
        return this.infos.get(this.currentIndex);
    }

    /**
     * Creates the tokens (in the same order as the {@link TokenClass} enum).
     */
    private static ImmutableList<IToken> createTokens(ColorManager manager) {
        ImmutableList.Builder<IToken> tokens = ImmutableList.builder();

        tokens.add(new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.PUNCTUATION))));
        tokens.add(new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.KEYWORD), null, SWT.BOLD)));
        tokens.add(new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.OPERATOR))));
        tokens.add(new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.COMMENT))));
        tokens.add(new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.WHITESPACE))));
        tokens.add(new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.IDENTIFIER))));
        tokens.add(new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.NUMBER_LITERAL))));
        tokens.add(new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.STRING_LITERAL))));
        tokens.add(new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.REG_EXP_LITERAL))));

        return tokens.build();
    }

    public static final class OffsetClassificationInfo {

        private final ClassificationInfo entry;
        private final int offset;

        public OffsetClassificationInfo(ClassificationInfo entry, int offset) {
            this.entry = entry;
            this.offset = offset;
        }
    }
}
