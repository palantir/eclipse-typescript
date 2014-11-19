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
 * @author tyleradams
 */
public final class CompletionEntryDetails {

    private String name;
    private ScriptElementKind kind;
    private ImmutableList<ScriptElementKindModifier> kindModifiers;
    private ImmutableList<SymbolDisplayPart> displayParts;
    private ImmutableList<SymbolDisplayPart> documentation;

    public CompletionEntryDetails(
            @JsonProperty("name") String name,
            @JsonProperty("kind") ScriptElementKind kind,
            @JsonProperty("kindModifiers") String kindModifiers,
            @JsonProperty("displayParts") List<SymbolDisplayPart> displayParts,
            @JsonProperty("documentation") List<SymbolDisplayPart> documentation) {
        checkNotNull(name);
        checkNotNull(kind);
        checkNotNull(kindModifiers);

        this.name = name;
        this.kind = kind;
        this.kindModifiers = ScriptElementKindModifier.parseList(kindModifiers);
        this.displayParts = ImmutableList.copyOf(displayParts);
        this.documentation = ImmutableList.copyOf(documentation);
    }

    public String getName() {
        return this.name;
    }

    public ScriptElementKind getKind() {
        return this.kind;
    }

    public ImmutableList<ScriptElementKindModifier> getKindModifiers() {
        return this.kindModifiers;
    }

    public String getDisplayParts() {
        return SymbolDisplayPart.getText(this.displayParts);
    }

    public String getDocumentation() {
        return SymbolDisplayPart.getText(this.documentation);
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("name", this.name)
            .add("kind", this.kind)
            .add("kindModifiers", this.kindModifiers)
            .add("displayParts", this.displayParts)
            .add("documentation", this.documentation)
            .toString();
    }
}
