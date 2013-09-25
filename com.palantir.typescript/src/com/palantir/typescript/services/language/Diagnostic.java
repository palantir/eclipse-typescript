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

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;
import com.google.common.collect.ImmutableList;

/**
 * Corresponds to the class with the same name in compiler/core/diagnostic.ts.
 *
 * @author dcicerone
 */
public final class Diagnostic {

    private final int start;
    private final int length;
    private final String diagnosticCode;
    private final List<String> arguments;

    public Diagnostic(
            @JsonProperty("start") int start,
            @JsonProperty("length") int length,
            @JsonProperty("diagnosticCode") String diagnosticCode,
            @JsonProperty("arguments") List<String> arguments) {
        this.start = start;
        this.length = length;
        this.diagnosticCode = diagnosticCode;
        this.arguments = arguments != null ? ImmutableList.copyOf(arguments) : ImmutableList.<String> of();
    }

    public int getStart() {
        return this.start;
    }

    public int getLength() {
        return this.length;
    }

    public String getDiagnosticCode() {
        return this.diagnosticCode;
    }

    public List<String> getArguments() {
        return this.arguments;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("start", this.start)
            .add("length", this.length)
            .add("diagnosticCode", this.diagnosticCode)
            .add("arguments", this.arguments)
            .toString();
    }
}
