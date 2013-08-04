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
 * @author dcicerone
 */
public final class Reference {

    private final String fileName;
    private final int minChar;
    private final int limChar;
    private final String line;
    private final int lineNumber;
    private final int lineStart;

    public Reference(
            @JsonProperty("fileName") String fileName,
            @JsonProperty("minChar") int minChar,
            @JsonProperty("limChar") int limChar,
            @JsonProperty("line") String line,
            @JsonProperty("lineNumber") int lineNumber,
            @JsonProperty("lineStart") int lineStart) {
        checkNotNull(fileName);
        checkArgument(minChar >= 0);
        checkArgument(limChar >= 0);
        checkNotNull(line);
        checkArgument(lineNumber >= 0);
        checkArgument(lineStart >= 0);

        this.fileName = fileName;
        this.minChar = minChar;
        this.limChar = limChar;
        this.line = line;
        this.lineNumber = lineNumber;
        this.lineStart = lineStart;
    }

    public String getFileName() {
        return this.fileName;
    }

    public int getMinChar() {
        return this.minChar;
    }

    public int getLimChar() {
        return this.limChar;
    }

    public String getLine() {
        return this.line;
    }

    public int getLineNumber() {
        return this.lineNumber;
    }

    public int getLineStart() {
        return this.lineStart;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("fileName", this.fileName)
            .add("minChar", this.minChar)
            .add("limChar", this.limChar)
            .add("line", this.line)
            .add("lineNumber", this.lineNumber)
            .add("lineStart", this.lineStart)
            .toString();
    }
}
