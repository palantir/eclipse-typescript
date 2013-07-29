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

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;
import com.google.common.collect.ImmutableList;

/**
 * Corresponds to the class with the same name in languageService.ts.
 *
 * @author dcicerone
 */
public final class SignatureInfo {

    private final ActualSignatureInfo actual;
    private final ImmutableList<FormalSignatureItemInfo> formal;
    private final int activeFormal;

    public SignatureInfo(
            @JsonProperty("actual") ActualSignatureInfo actual,
            @JsonProperty("formal") List<FormalSignatureItemInfo> formal,
            @JsonProperty("activeFormal") int activeFormal) {
        checkNotNull(actual);
        checkNotNull(formal);
        checkArgument(activeFormal >= 0);

        this.actual = actual;
        this.formal = ImmutableList.copyOf(formal);
        this.activeFormal = activeFormal;
    }

    public ActualSignatureInfo getActual() {
        return this.actual;
    }

    public ImmutableList<FormalSignatureItemInfo> getFormal() {
        return this.formal;
    }

    public int getActiveFormal() {
        return this.activeFormal;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("actual", this.actual)
            .add("formal", this.formal)
            .add("activeFormal", this.activeFormal)
            .toString();
    }
}
