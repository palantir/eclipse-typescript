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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;

/**
 * Corresponds to the class with the same name in languageService.ts.
 *
 * @author dcicerone
 */
public final class ActualSignatureInfo {

    private final int parameterMinChar;
    private final int parameterLimChar;
    private final boolean currentParameterIsTypeParameter;
    private final int currentParameter;

    public ActualSignatureInfo(
            @JsonProperty("parameterMinChar") int parameterMinChar,
            @JsonProperty("parameterLimChar") int parameterLimChar,
            @JsonProperty("currentParameterIsTypeParameter") boolean currentParameterIsTypeParameter,
            @JsonProperty("currentParameter") int currentParameter) {
        checkArgument(parameterMinChar >= 0);
        checkArgument(parameterLimChar >= 0);
        checkArgument(currentParameter >= 0);

        this.parameterMinChar = parameterMinChar;
        this.parameterLimChar = parameterLimChar;
        this.currentParameterIsTypeParameter = currentParameterIsTypeParameter;
        this.currentParameter = currentParameter;
    }

    public int getParameterMinChar() {
        return this.parameterMinChar;
    }

    public int getParameterLimChar() {
        return this.parameterLimChar;
    }

    public boolean getCurrentParameterIsTypeParameter() {
        return this.currentParameterIsTypeParameter;
    }

    public int getCurrentParameter() {
        return this.currentParameter;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("parameterMinChar", this.parameterMinChar)
            .add("parameterLimChar", this.parameterLimChar)
            .add("currentParameterIsTypeParameter", this.currentParameterIsTypeParameter)
            .add("currentParameter", this.currentParameter)
            .toString();
    }
}
