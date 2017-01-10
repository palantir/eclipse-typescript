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
 * Corresponds to the class with the same name in TypeScript.
 *
 * @author dcicerone
 */
public final class QuickInfo {

    private final ScriptElementKind kind;
    private final ImmutableList<ScriptElementKindModifier> kindModifiers;
    private final TextSpan textSpan;
    private final ImmutableList<SymbolDisplayPart> displayParts;
    private final ImmutableList<SymbolDisplayPart> documentation;
    private final ImmutableList<JSDocTagInfo> tags;

    public QuickInfo(
            @JsonProperty("kind") ScriptElementKind kind,
            @JsonProperty("kindModifiers") String kindModifiers,
            @JsonProperty("textSpan") TextSpan textSpan,
            @JsonProperty("displayParts") List<SymbolDisplayPart> displayParts,
            @JsonProperty("documentation") List<SymbolDisplayPart> documentation,
            @JsonProperty("tags") List<JSDocTagInfo> tags) {
        checkNotNull(kind);
        checkNotNull(kindModifiers);
        checkNotNull(textSpan);
        checkNotNull(displayParts);

        this.kind = kind;
        this.kindModifiers = ScriptElementKindModifier.parseList(kindModifiers);
        this.textSpan = textSpan;
        this.displayParts = ImmutableList.copyOf(displayParts);
        this.documentation = documentation != null ? ImmutableList.copyOf(documentation) : ImmutableList.<SymbolDisplayPart> of();
        this.tags = ImmutableList.copyOf(tags);
    }

    public ScriptElementKind getKind() {
        return this.kind;
    }

    public List<ScriptElementKindModifier> getKindModifiers() {
        return this.kindModifiers;
    }

    public TextSpan getTextSpan() {
        return this.textSpan;
    }

    public List<SymbolDisplayPart> getDisplayParts() {
        return this.displayParts;
    }

    public String getDisplayText() {
        return SymbolDisplayPart.getText(this.displayParts);
    }

    public List<SymbolDisplayPart> getDocumentation() {
        return this.documentation;
    }

    public List<JSDocTagInfo> getTags() {
        return this.tags;
    }

    public String getTagsText() {
        return JSDocTagInfo.getText(this.tags);
    }

    public String getDocumentationText() {
        return SymbolDisplayPart.getText(this.documentation);
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("kind", this.kind)
            .add("kindModifiers", this.kindModifiers)
            .add("textSpan", this.textSpan)
            .add("displayParts", this.displayParts)
            .add("documentation", this.documentation)
            .add("tags", this.tags)
            .toString();
    }
}
