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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;

/**
 * Corresponds to the class with the same name in classifier.ts.
 *
 * @author tyleradams
 */
public final class ClassificationInfo {

    private final int length;
    private final TokenClass classification;

    @JsonCreator
    public ClassificationInfo(@JsonProperty("length") int length, @JsonProperty("classification") TokenClass classification) {
        checkArgument(length >= 0);
        checkNotNull(classification);

        this.length = length;
        this.classification = classification;
    }

    public int getLength() {
        return this.length;
    }

    public TokenClass getClassification() {
        return this.classification;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("classification", this.classification)
            .add("length", this.length)
            .toString();
    }
}
