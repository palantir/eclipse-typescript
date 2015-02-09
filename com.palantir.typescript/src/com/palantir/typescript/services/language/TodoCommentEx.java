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
import static com.google.common.base.Preconditions.checkNotNull;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;

/**
 * Corresponds to the class with the same name in languageService.ts.
 *
 * @author tony.benbrahim <tony.benbrahim@10xdev.com>
 */
public final class TodoCommentEx {

    private final int start;
    private final int line;
    private final int priority;
    private final String text;

    public TodoCommentEx(
            @JsonProperty("start") int start,
            @JsonProperty("line") int line,
            @JsonProperty("priority") int priority,
            @JsonProperty("text") String text) {
        checkArgument(line >= 0);
        checkArgument(start >= 0);
        checkArgument(priority >= 0 && priority <= 2);
        checkNotNull(text);

        this.start = start;
        this.line = line;
        this.priority = priority;
        this.text = text;
    }

    public int getStart() {
        return this.start;
    }

    public int getLine() {
        return this.line;
    }

    public int getPriority() {
        return this.priority;
    }

    public String getText() {
        return this.text;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("start", this.start)
            .add("line", this.line)
            .add("priority", this.priority)
            .add("text", this.text)
            .toString();
    }
}
