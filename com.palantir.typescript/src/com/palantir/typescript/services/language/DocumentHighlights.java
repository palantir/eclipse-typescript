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

package com.palantir.typescript.services.language;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;
import com.google.common.collect.ImmutableList;

/**
 * Corresponds to the class with the same name in languageService.ts.
 *
 * @author dcicerone
 */
public final class DocumentHighlights {

    private final String fileName;
    private final List<HighlightSpan> highlightSpans;

    @JsonCreator
    public DocumentHighlights(
            @JsonProperty("fileName") String fileName,
            @JsonProperty("highlightSpans") List<HighlightSpan> highlightSpans) {
        checkNotNull(fileName);
        checkNotNull(highlightSpans);

        this.fileName = fileName;
        this.highlightSpans = ImmutableList.copyOf(highlightSpans);
    }

    public String getFileName() {
        return this.fileName;
    }

    public List<HighlightSpan> getHighlightSpans() {
        return this.highlightSpans;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("fileName", this.fileName)
            .add("highlightSpans", this.highlightSpans)
            .toString();
    }
}
