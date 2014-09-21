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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;

/**
 * Corresponds to the class with the same name in languageService.ts.
 *
 * @author dcicerone
 */
public final class ReferenceEntry {

    private final String fileName;
    private final boolean isWriteAccess;
    private final TextSpan textSpan;

    public ReferenceEntry(
            @JsonProperty("fileName") String fileName,
            @JsonProperty("isWriteAccess") boolean isWriteAccess,
            @JsonProperty("textSpan") TextSpan textSpan) {
        checkNotNull(fileName);
        checkNotNull(textSpan);

        this.fileName = fileName;
        this.isWriteAccess = isWriteAccess;
        this.textSpan = textSpan;
    }

    public String getFileName() {
        return this.fileName;
    }

    public boolean isWriteAccess() {
        return this.isWriteAccess;
    }

    public TextSpan getTextSpan() {
        return this.textSpan;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("fileName", this.fileName)
            .add("isWriteAccess", this.isWriteAccess)
            .add("textSpan", this.textSpan)
            .toString();
    }
}
