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
public final class OutputFile {

    private final String name;
    private final boolean useUTF8encoding;
    private final boolean writeByteOrderMark;
    private final String text;

    public OutputFile(
            @JsonProperty("name") String name,
            @JsonProperty("useUTF8encoding") boolean useUTF8encoding,
            @JsonProperty("writeByteOrderMark") boolean writeByteOrderMark,
            @JsonProperty("text") String text) {
        checkNotNull(name);
        checkNotNull(text);

        this.name = name;
        this.useUTF8encoding = useUTF8encoding;
        this.writeByteOrderMark = writeByteOrderMark;
        this.text = text;
    }

    public String getName() {
        return this.name;
    }

    public boolean getUseUTF8encoding() {
        return this.useUTF8encoding;
    }

    public boolean getWriteByteOrderMark() {
        return this.writeByteOrderMark;
    }

    public String getText() {
        return this.text;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("name", this.name)
            .add("useUTF8encoding", this.useUTF8encoding)
            .add("writeByteOrderMark", this.writeByteOrderMark)
            .add("text", this.text)
            .toString();
    }
}
