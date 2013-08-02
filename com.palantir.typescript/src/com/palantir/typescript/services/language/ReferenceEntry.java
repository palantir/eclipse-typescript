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
public final class ReferenceEntry {

    private final String fileName;
    private final int minChar;
    private final int limChar;
    private final boolean writeAccess;

    public ReferenceEntry(
            @JsonProperty("fileName") String fileName,
            @JsonProperty("minChar") int minChar,
            @JsonProperty("limChar") int limChar,
            @JsonProperty("isWriteAccess") boolean writeAccess) {
        checkNotNull(fileName);
        checkArgument(minChar >= 0);
        checkArgument(limChar >= 0);

        this.fileName = fileName;
        this.minChar = minChar;
        this.limChar = limChar;
        this.writeAccess = writeAccess;
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

    public boolean isWriteAccess() {
        return this.writeAccess;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("fileName", this.fileName)
            .add("minChar", this.minChar)
            .add("limChar", this.limChar)
            .add("isWriteAccess", this.writeAccess)
            .toString();
    }
}
