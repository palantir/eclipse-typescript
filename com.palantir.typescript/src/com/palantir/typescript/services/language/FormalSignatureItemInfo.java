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
 * Corresponds to the class with the same name in languageService.ts.
 *
 * @author dcicerone
 */
public final class FormalSignatureItemInfo {

    private final String signatureInfo;
    private final ImmutableList<FormalTypeParameterInfo> typeParameters;
    private final ImmutableList<FormalParameterInfo> parameters;
    private final String docComment;

    public FormalSignatureItemInfo(
            @JsonProperty("signatureInfo") String signatureInfo,
            @JsonProperty("typeParameters") List<FormalTypeParameterInfo> typeParameters,
            @JsonProperty("parameters") List<FormalParameterInfo> parameters,
            @JsonProperty("docComment") String docComment) {
        checkNotNull(signatureInfo);
        checkNotNull(typeParameters);
        checkNotNull(parameters);
        checkNotNull(docComment);

        this.signatureInfo = signatureInfo;
        this.typeParameters = ImmutableList.copyOf(typeParameters);
        this.parameters = ImmutableList.copyOf(parameters);
        this.docComment = docComment;
    }

    public String getSignatureInfo() {
        return this.signatureInfo;
    }

    public ImmutableList<FormalTypeParameterInfo> getTypeParameters() {
        return this.typeParameters;
    }

    public ImmutableList<FormalParameterInfo> getParameters() {
        return this.parameters;
    }

    public String getDocComment() {
        return this.docComment;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("signatureInfo", this.signatureInfo)
            .add("typeParameters", this.typeParameters)
            .add("parameters", this.parameters)
            .add("docComments", this.docComment)
            .toString();
    }
}
