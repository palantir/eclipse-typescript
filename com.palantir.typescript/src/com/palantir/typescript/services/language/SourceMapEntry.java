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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;

/**
 * Corresponds to the class with the same name in sourceMapping.ts.
 *
 * @author dcicerone
 */
public final class SourceMapEntry {

    private final String emittedFile;
    private final int emittedLine;
    private final int emittedColumn;
    private final String sourceFile;
    private final int sourceLine;
    private final int sourceColumn;
    private final String sourceName;

    public SourceMapEntry(
            @JsonProperty("emittedFile") String emittedFile,
            @JsonProperty("emittedLine") int emittedLine,
            @JsonProperty("emittedColumn") int emittedColumn,
            @JsonProperty("sourceFile") String sourceFile,
            @JsonProperty("sourceLine") int sourceLine,
            @JsonProperty("sourceColumn") int sourceColumn,
            @JsonProperty("sourceName") String sourceName) {
        this.emittedFile = emittedFile;
        this.emittedLine = emittedLine;
        this.emittedColumn = emittedColumn;
        this.sourceFile = sourceFile;
        this.sourceLine = sourceLine;
        this.sourceColumn = sourceColumn;
        this.sourceName = sourceName;
    }

    public String getEmittedFile() {
        return this.emittedFile;
    }

    public int getEmittedLine() {
        return this.emittedLine;
    }

    public int getEmittedColumn() {
        return this.emittedColumn;
    }

    public String getSourceFile() {
        return this.sourceFile;
    }

    public int getSourceLine() {
        return this.sourceLine;
    }

    public int getSourceColumn() {
        return this.sourceColumn;
    }

    public String getSourceName() {
        return this.sourceName;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("emittedFile", this.emittedFile)
            .add("emittedLine", this.emittedLine)
            .add("emittedColumn", this.emittedColumn)
            .add("sourceFile", this.sourceFile)
            .add("sourceLine", this.sourceLine)
            .add("sourceColumn", this.sourceColumn)
            .add("sourceName", this.sourceName)
            .toString();
    }
}
