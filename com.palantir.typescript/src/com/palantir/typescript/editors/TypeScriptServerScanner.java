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
public final class TypeScriptServerScanner implements ITokenScanner {

    private static final Splitter LINE_SPLITTER = Splitter.on('\n');

    private final ImmutableList<TextAttribute> textAttributes;

    private List<OffsetClassificationInfo> infos;
    private int currentIndex;

    public TypeScriptServerScanner(ColorManager manager) {
        checkNotNull(manager);

        this.textAttributes = getTextAttributes(manager);
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
            OffsetClassificationInfo info = getCurrentInfo();
            int classificationIndex = info.entry.getClassification().ordinal();
            TextAttribute data = this.textAttributes.get(classificationIndex);

            return new Token(data);
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
     * Returns a list of text attributes stored in the same order as the {@link TokenClass} enum.
     */
    private static ImmutableList<TextAttribute> getTextAttributes(ColorManager manager) {
        ImmutableList.Builder<TextAttribute> textAttributes = ImmutableList.builder();

        textAttributes.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.PUNCTUATION)));
        textAttributes.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.KEYWORD), null, SWT.BOLD));
        textAttributes.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.OPERATOR)));
        textAttributes.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.COMMENT)));
        textAttributes.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.WHITESPACE)));
        textAttributes.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.IDENTIFIER)));
        textAttributes.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.NUMBER_LITERAL)));
        textAttributes.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.STRING_LITERAL)));
        textAttributes.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.REG_EXP_LITERAL)));

        return textAttributes.build();
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
