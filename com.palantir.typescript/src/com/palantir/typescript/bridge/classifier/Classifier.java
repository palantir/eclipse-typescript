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

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;

import com.palantir.typescript.bridge.TypeScriptBridge;

/**
 * The classifier service.
 * <p>
 * This service provides the information necessary to perform syntax highlighting.
 *
 * @author dcicerone
 */
public final class Classifier {

    private final TypeScriptBridge bridge;

    public Classifier(TypeScriptBridge bridge) {
        checkNotNull(bridge);

        this.bridge = bridge;
    }

    public List<ClassificationResult> getClassificationsForLines(List<String> lines) {
        EndOfLineState lexState = EndOfLineState.START;
        GetClassificationsForLinesRequest request = new GetClassificationsForLinesRequest(lines, lexState);
        ClassificationResults response = this.bridge.sendRequest(request, ClassificationResults.class);

        return response.getResults();
    }
}
