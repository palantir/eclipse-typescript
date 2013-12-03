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
 * Corresponds to the class with the same name in typescript.ts.
 *
 * @author dcicerone
 */
public final class OutputFile {

    private final String name;
    private final boolean writeByteOrderMark;
    private final String text;
    private final OutputFileType fileType;
    private final List<SourceMapEntry> sourceMapEntries;

    public OutputFile(
            @JsonProperty("name") String name,
            @JsonProperty("writeByteOrderMark") boolean writeByteOrderMark,
            @JsonProperty("text") String text,
            @JsonProperty("fileType") OutputFileType fileType,
            @JsonProperty("sourceMapEntries") List<SourceMapEntry> sourceMapEntries) {
        checkNotNull(name);
        checkNotNull(writeByteOrderMark);
        checkNotNull(text);
        checkNotNull(fileType);
        checkNotNull(sourceMapEntries);

        this.name = name;
        this.writeByteOrderMark = writeByteOrderMark;
        this.text = text;
        this.fileType = fileType;
        this.sourceMapEntries = ImmutableList.copyOf(sourceMapEntries);
    }

    public String getName() {
        return this.name;
    }

    public boolean getWriteByteOrderMark() {
        return this.writeByteOrderMark;
    }

    public String getText() {
        return this.text;
    }

    public OutputFileType getFileType() {
        return this.fileType;
    }

    public List<SourceMapEntry> getSourceMapEntries() {
        return this.sourceMapEntries;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("name", this.name)
            .add("writeByteOrderMark", this.writeByteOrderMark)
            .add("text", this.text)
            .add("fileType", this.fileType)
            .add("sourceMapEntries", this.sourceMapEntries)
            .toString();
    }
}
