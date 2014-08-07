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

package com.palantir.typescript.services.classifier;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;

import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.palantir.typescript.services.Bridge;
import com.palantir.typescript.services.Request;

/**
 * The classifier service.
 * <p>
 * This service provides the information necessary to perform syntax highlighting.
 *
 * @author dcicerone
 */
public final class Classifier {

    private final Bridge bridge;

    public Classifier() {
        this.bridge = new Bridge();
    }

    public List<ClassificationResult> getClassificationsForLines(List<String> lines, EndOfLineState lexState) {
        checkNotNull(lines);
        checkNotNull(lexState);

        Request request = new Request("classifier", "getClassificationsForLines", lines, lexState.ordinal());
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, ClassificationResult.class);

        return this.bridge.call(request, resultType);
    }

    public void dispose() {
        this.bridge.dispose();
    }
}
