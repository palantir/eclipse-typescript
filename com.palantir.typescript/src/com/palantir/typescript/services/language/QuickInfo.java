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
    private final List<ScriptElementModifierKind> kindModifiers;
    private final TextSpan textSpan;
    private final List<SymbolDisplayPart> displayParts;
    private final List<SymbolDisplayPart> documentation;

    public QuickInfo(
            @JsonProperty("kind") ScriptElementKind kind,
            @JsonProperty("kindModifiers") String kindModifiers,
            @JsonProperty("textSpan") TextSpan textSpan,
            @JsonProperty("displayParts") List<SymbolDisplayPart> displayParts,
            @JsonProperty("documentation") List<SymbolDisplayPart> documentation) {
        checkNotNull(kind);
        checkNotNull(kindModifiers);
        checkNotNull(textSpan);
        checkNotNull(displayParts);
        checkNotNull(documentation);

        this.kind = kind;
        this.kindModifiers = ScriptElementModifierKind.parseList(kindModifiers);
        this.textSpan = textSpan;
        this.displayParts = ImmutableList.copyOf(displayParts);
        this.documentation = ImmutableList.copyOf(documentation);
    }

    public ScriptElementKind getKind() {
        return this.kind;
    }

    public List<ScriptElementModifierKind> getKindModifiers() {
        return this.kindModifiers;
    }

    public TextSpan getTextSpan() {
        return this.textSpan;
    }

    public List<SymbolDisplayPart> getDisplayParts() {
        return this.displayParts;
    }

    public String getDisplayText() {
        return getText(this.displayParts);
    }

    public List<SymbolDisplayPart> getDocumentation() {
        return this.documentation;
    }

    public String getDocumentationText() {
        return getText(this.documentation);
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("kind", this.kind)
            .add("kindModifiers", this.kindModifiers)
            .add("textSpan", this.textSpan)
            .add("displayParts", this.displayParts)
            .add("documentation", this.documentation)
            .toString();
    }

    private static String getText(List<SymbolDisplayPart> parts) {
        StringBuilder displayText = new StringBuilder();

        for (SymbolDisplayPart part : parts) {
            displayText.append(part.getText());
        }

        return displayText.toString();
    }
}
