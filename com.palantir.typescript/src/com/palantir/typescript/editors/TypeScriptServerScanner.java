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
import com.google.common.base.Splitter;
import com.google.common.collect.Lists;
import com.palantir.typescript.bridge.TypeScriptBridge;
import com.palantir.typescript.bridge.classifier.ClassificationInfo;
import com.palantir.typescript.bridge.classifier.ClassificationResult;

/**
 * This class handles tokenizing and properly highlighting sections of typescript. It does so by
 * calling the TypeScript language services via the TypeScript Bridge.
 *
 * @author tyleradams
 */
public final class TypeScriptServerScanner implements ITokenScanner {

    private static final Splitter LINE_SPLITTER = Splitter.on('\n');

    private final TextAttribute[] AttributeTable;

    private List<OffsetClassificationInfo> infos;
    private int currentIndex;

    public TypeScriptServerScanner(ColorManager manager) {
        Preconditions.checkNotNull(manager);

        List<TextAttribute> attributePreTable = Lists.newArrayList();
        attributePreTable.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.PUNCTUATION)));
        attributePreTable.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.KEYWORD), null, SWT.BOLD));
        attributePreTable.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.OPERATOR)));
        attributePreTable.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.COMMENT)));
        attributePreTable.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.WHITESPACE)));
        attributePreTable.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.IDENTIFIER)));
        attributePreTable.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.NUMBER_LITERAL)));
        attributePreTable.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.STRING_LITERAL)));
        attributePreTable.add(new TextAttribute(manager.getColor(TypeScriptColorConstants.REGEXP_LITERAL)));
        this.AttributeTable = new TextAttribute[attributePreTable.size()];
        attributePreTable.toArray(this.AttributeTable);
    }

    @Override
    public void setRange(IDocument document, int offset, int length) {
        Preconditions.checkNotNull(document);

        int currentOffset = offset;

        // break the text up into lines (keeping track of the offset for each line)
        String documentText = document.get();
        String rangeText = documentText.substring(offset, offset + length);
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
        this.infos = Lists.newArrayList();
        List<ClassificationResult> results = TypeScriptBridge.getBridge().getClassifier().getClassificationsForLines(lines);
        for (int i = 0; i < results.size(); i++) {
            int tokenOffset = lineOffsets.get(i);
            ClassificationResult result = results.get(i);

            for (ClassificationInfo entry : result.getEntries()) {
                OffsetClassificationInfo tokenWrapper = new OffsetClassificationInfo(entry, tokenOffset);

                this.infos.add(tokenWrapper);
                tokenOffset += entry.getLength();
            }
        }
        this.currentIndex = -1;
    }

    @Override
    public IToken nextToken() {
        this.currentIndex++;

        if (this.currentIndex == this.infos.size()) {
            return Token.EOF;
        } else {
            OffsetClassificationInfo info = getInfo();
            int classificationIndex = info.entry.getClassification().ordinal();
            TextAttribute data = this.AttributeTable[classificationIndex];

            return new Token(data);
        }
    }

    @Override
    public int getTokenOffset() {
        return this.getInfo().offset;
    }

    @Override
    public int getTokenLength() {
        return this.getInfo().entry.getLength();
    }

    private OffsetClassificationInfo getInfo() {
        return this.infos.get(this.currentIndex);
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
