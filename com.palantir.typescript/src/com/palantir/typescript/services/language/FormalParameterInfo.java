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
public final class FormalParameterInfo {

    private final String name;
    private final boolean isVariable;
    private final String docComment;
    private final int minChar;
    private final int limChar;

    public FormalParameterInfo(
            @JsonProperty("name") String name,
            @JsonProperty("isVariable") boolean isVariable,
            @JsonProperty("docComment") String docComment,
            @JsonProperty("minChar") int minChar,
            @JsonProperty("limChar") int limChar) {
        checkNotNull(name);
        checkNotNull(docComment);
        checkArgument(minChar >= 0);
        checkArgument(limChar >= 0);

        this.name = name;
        this.isVariable = isVariable;
        this.docComment = docComment;
        this.minChar = minChar;
        this.limChar = limChar;
    }

    public String getName() {
        return this.name;
    }

    public boolean getIsVariable() {
        return this.isVariable;
    }

    public String getDocComment() {
        return this.docComment;
    }

    public int getMinChar() {
        return this.minChar;
    }

    public int getLimChar() {
        return this.limChar;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("name", this.name)
            .add("isVariable", this.isVariable)
            .add("docComment", this.docComment)
            .add("minChar", this.minChar)
            .add("limChar", this.limChar)
            .toString();
    }
}
