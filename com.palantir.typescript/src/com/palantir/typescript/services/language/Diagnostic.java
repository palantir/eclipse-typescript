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

import static com.google.common.base.Preconditions.checkArgument;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;

/**
 * Corresponds to the class with the same name in diagnostic.ts.
 *
 * @author dcicerone
 */
public final class Diagnostic {

    private final int start;
    private final int length;
    private final int line;
    private final String text;

    public Diagnostic(
            @JsonProperty("start") int start,
            @JsonProperty("length") int length,
            @JsonProperty("line") int line,
            @JsonProperty("text") String text) {
        checkArgument(start >= 0);
        checkArgument(length >= 0);
        checkArgument(line >= 0);

        this.start = start;
        this.length = length;
        this.line = line;
        this.text = text;
    }

    public int getStart() {
        return this.start;
    }

    public int getLength() {
        return this.length;
    }

    public int getLine() {
        return this.line;
    }

    public String getText() {
        return this.text;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("start", this.start)
            .add("length", this.length)
            .add("text", this.text)
            .toString();
    }
}
