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

package com.palantir.typescript.bridge.classifier;

import java.util.List;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.palantir.typescript.bridge.TypeScriptBridge;

/**
 * Through this object one makes syntax highlight requests. It needs a bridge to send requests.
 *
 * @author tyleradams
 */
public final class SyntaxHighlightService {

    private static final int START = 0; // This corresponds to the Start enum in Services.EndOfLineState.
    private final TypeScriptBridge typeScriptBridge;

    public SyntaxHighlightService(TypeScriptBridge typeScriptBridge) {
        Preconditions.checkNotNull(typeScriptBridge);

        this.typeScriptBridge = typeScriptBridge;
    }

    public SyntaxHighlightResult getTokenInformation(String text, int offset) {
        Preconditions.checkNotNull(text);
        Preconditions.checkArgument(offset >= 0);

        List<String> lines = Lists.newArrayList(text.split("\n"));
        int[] lineSpacing = new int[lines.size()];
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            if (line.endsWith("\r")) {
                line = line.substring(0, line.length() - 1);
                lines.set(i, line);
                lineSpacing[i] = 2;
            } else {
                lineSpacing[i] = 1;
            }
        }

        int beginningLexState = START;
        List<ClassificationInfo> entries = Lists.newArrayList();
        List<Integer> offsets = Lists.newArrayList();
        List<String> firstLines;
        Class<ClassificationResults> resultType = ClassificationResults.class;
        int lineBunchSize = 100;
        int lineNumber = 0;

        while (lines.size() > 0) {
            if (lines.size() > lineBunchSize) {
                firstLines = lines.subList(0, lineBunchSize);
                lines = lines.subList(lineBunchSize, lines.size());
            } else {
                firstLines = lines;
                lines = lines.subList(lines.size(), lines.size());
            }
            GetClassificationsForLinesRequest request = new GetClassificationsForLinesRequest(firstLines, beginningLexState);
            ClassificationResults classificationResults = this.typeScriptBridge.sendRequest(request, resultType);

            // process classificationResults
            for (ClassificationResult classificationResult : classificationResults.getResults()) {
                for (ClassificationInfo entry : classificationResult.getEntries()) {
                    offsets.add(offset);
                    entries.add(entry);
                    offset += entry.getLength();
                }
                offset += lineSpacing[lineNumber]; // end of line offset compensating for \r\n or \n.  Each classificationResult is a line.
                lineNumber++;
            }

            beginningLexState = classificationResults.getFinalLexState();
        }
        return new SyntaxHighlightResult(entries, offsets);
    }
}
