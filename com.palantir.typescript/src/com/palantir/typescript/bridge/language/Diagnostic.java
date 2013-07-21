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

package com.palantir.typescript.bridge.language;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;

/**
 * Corresponds to the class with the same name in diagnostic.ts.
 *
 * @author dcicerone
 */
public final class Diagnostic {

    private final String fileName;
    private final int start;
    private final int length;
    private final int diagnosticCode;
    private final String text;
    private final String message;

    public Diagnostic(
            @JsonProperty("fileName") String fileName,
            @JsonProperty("start") int start,
            @JsonProperty("length") int length,
            @JsonProperty("diagnosticCode") int diagnosticCode,
            @JsonProperty("text") String text,
            @JsonProperty("message") String message) {
        checkNotNull(fileName);
        checkArgument(start >= 0);
        checkArgument(length > 0);
        checkArgument(diagnosticCode >= 0);
        checkNotNull(text);
        checkNotNull(message);

        this.fileName = fileName;
        this.start = start;
        this.length = length;
        this.diagnosticCode = diagnosticCode;
        this.text = text;
        this.message = message;
    }

    public String getFileName() {
        return this.fileName;
    }

    public int getStart() {
        return this.start;
    }

    public int getLength() {
        return this.length;
    }

    public int getDiagnosticCode() {
        return this.diagnosticCode;
    }

    public String getText() {
        return this.text;
    }

    public String getMessage() {
        return this.message;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("fileName", this.fileName)
            .add("start", this.start)
            .add("length", this.length)
            .add("diagnosticCode", this.diagnosticCode)
            .add("text", this.text)
            .add("message", this.message)
            .toString();
    }
}
