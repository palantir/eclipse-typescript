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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;
import com.google.common.collect.ImmutableList;

/**
 * Corresponds to the class with the same name in languageService.ts.
 *
 * @author dcicerone
 */
public final class CompletionInfo {

    private final ImmutableList<CompletionEntryDetails> entries;
    private final boolean memberCompletion;

    public CompletionInfo(
            @JsonProperty("entries") List<CompletionEntryDetails> entries,
            @JsonProperty("isMemberCompletion") boolean memberCompletion) {
        checkNotNull(entries);

        this.entries = ImmutableList.copyOf(entries);
        this.memberCompletion = memberCompletion;
    }

    public ImmutableList<CompletionEntryDetails> getEntries() {
        return this.entries;
    }

    public boolean isMemberCompletion() {
        return this.memberCompletion;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("entries", this.entries)
            .add("memberCompletion", this.memberCompletion)
            .toString();
    }
}
