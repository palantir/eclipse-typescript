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

import java.util.List;

import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.ITypedRegion;
import org.eclipse.jface.text.TextPresentation;
import org.eclipse.jface.text.presentation.IPresentationRepairer;

import com.google.common.base.Preconditions;
import com.google.common.base.Splitter;
import com.google.common.collect.Lists;
import com.palantir.typescript.Activator;
import com.palantir.typescript.bridge.classifier.ClassificationInfo;
import com.palantir.typescript.bridge.classifier.ClassificationResult;
import com.palantir.typescript.bridge.classifier.TokenClass;

/**
 * @author tadams
 */
public final class TypeScriptRepairer implements IPresentationRepairer {

    private static final Splitter LINE_SPLITTER = Splitter.on('\n');

    private IDocument document;

    @Override
    public void setDocument(IDocument document) {
        this.document = document;
    }

    @Override
    public void createPresentation(TextPresentation presentation, ITypedRegion damage) {
        int offset = damage.getOffset();
        int length = damage.getLength();
        String text = this.document.get().substring(offset, offset + length);

        List<OffsetClassificationInfo> tokens = this.getTokens(text, offset);

        this.addTokens(presentation, tokens);
    }

    private List<OffsetClassificationInfo> getTokens(String text, int offset) {
        List<OffsetClassificationInfo> infos = Lists.newArrayList();
        List<String> lines = Lists.newArrayList();
        List<Integer> lineOffsets = Lists.newArrayList();
        int currentOffset = offset;
        for (String line : LINE_SPLITTER.split(text)) {
            lineOffsets.add(currentOffset);
            currentOffset += line.length() + 1; // add 1 for the newline character

            if (line.endsWith("\r")) {
                line = line.substring(0, line.length() - 1);
            }
            lines.add(line);
        }
        List<ClassificationResult> results = Activator.getBridge().getClassifier().getClassificationsForLines(lines);
        for (int i = 0; i < results.size(); i++) {
            int tokenOffset = lineOffsets.get(i);
            ClassificationResult result = results.get(i);

            // add an info for each entry
            for (ClassificationInfo entry : result.getEntries()) {
                OffsetClassificationInfo info = new OffsetClassificationInfo(entry, tokenOffset);

                infos.add(info);
                tokenOffset += entry.getLength();
            }

            // add a token for the newline character(s)
            if (i < results.size() - 1) {
                int newlineLength = lineOffsets.get(i + 1) - tokenOffset;
                ClassificationInfo entry = new ClassificationInfo(newlineLength, TokenClass.WHITESPACE);
                OffsetClassificationInfo info = new OffsetClassificationInfo(entry, tokenOffset);

                infos.add(info);
            }
        }
        return infos;
    }

    private void addTokens(TextPresentation presentation, List<OffsetClassificationInfo> infos) {
        Preconditions.checkNotNull(infos);

        for (OffsetClassificationInfo info : infos) {
            presentation.addStyleRange(info.getStyleRange());
        }
    }
}
