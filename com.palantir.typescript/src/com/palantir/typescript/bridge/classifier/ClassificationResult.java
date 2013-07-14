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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;
import com.google.common.collect.ImmutableList;

/**
 * Corresponds to the class with the same name in classifier.ts.
 *
 * @author tyleradams
 */
public final class ClassificationResult {

    private final ImmutableList<ClassificationInfo> entries;
    private final EndOfLineState finalLexState;

    @JsonCreator
    public ClassificationResult(@JsonProperty("entries") List<ClassificationInfo> entries,
            @JsonProperty("finalLexState") EndOfLineState finalLexState) {
        checkNotNull(finalLexState);

        this.entries = ImmutableList.copyOf(entries);
        this.finalLexState = finalLexState;
    }

    public EndOfLineState getFinalLexState() {
        return this.finalLexState;
    }

    public ImmutableList<ClassificationInfo> getEntries() {
        return this.entries;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("entries", this.entries)
            .add("finalLexState", this.finalLexState)
            .toString();
    }
}
