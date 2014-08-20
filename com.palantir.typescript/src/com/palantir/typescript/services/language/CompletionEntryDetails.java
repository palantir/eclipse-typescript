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
import com.google.common.collect.ImmutableList;

/**
 * Corresponds to the class with the same name in languageService.ts.
 *
 * @author tyleradams
 */
public final class CompletionEntryDetails {

    private String name;
    private ScriptElementKind kind;
    private ImmutableList<ScriptElementModifierKind> kindModifiers;
    private String type;
    private String fullSymbolName;
    private String docComment;

    public CompletionEntryDetails(
            @JsonProperty("name") String name,
            @JsonProperty("kind") ScriptElementKind kind,
            @JsonProperty("kindModifiers") String kindModifiers,
            @JsonProperty("type") String type,
            @JsonProperty("fullSymbolName") String fullSymbolName,
            @JsonProperty("docComment") String docComment) {
        checkNotNull(name);
        checkNotNull(kind);
        checkNotNull(kindModifiers);

        this.name = name;
        this.kind = kind;
        this.kindModifiers = ScriptElementModifierKind.parseList(kindModifiers);
        this.type = type;
        this.fullSymbolName = fullSymbolName;
        this.docComment = docComment;
    }

    public String getName() {
        return this.name;
    }

    public ScriptElementKind getKind() {
        return this.kind;
    }

    public ImmutableList<ScriptElementModifierKind> getKindModifiers() {
        return this.kindModifiers;
    }

    public String getType() {
        return this.type;
    }

    public String getFullSymbolName() {
        return this.fullSymbolName;
    }

    public String getDocComment() {
        return this.docComment;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("name", this.name)
            .add("kind", this.kind)
            .add("kindModifiers", this.kindModifiers)
            .add("type", this.type)
            .add("fullSymbolName", this.fullSymbolName)
            .add("docComment", this.docComment)
            .toString();
    }
}
