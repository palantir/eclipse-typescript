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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;
import com.google.common.collect.ImmutableList;

/**
 * Corresponds to the class with the same name in TypeScript.
 *
 * @author dcicerone
 */
public final class NavigationBarItem {

    private final String text;
    private final ScriptElementKind kind;
    private final List<ScriptElementKindModifier> kindModifiers;
    private final List<TextSpan> spans;
    private final List<NavigationBarItem> childItems;
    private final int indent;
    private final boolean bolded;
    private final boolean grayed;

    @JsonCreator
    public NavigationBarItem(
            @JsonProperty("text") String text,
            @JsonProperty("kind") ScriptElementKind kind,
            @JsonProperty("kindModifiers") String kindModifiers,
            @JsonProperty("spans") List<TextSpan> spans,
            @JsonProperty("childItems") List<NavigationBarItem> childItems,
            @JsonProperty("indent") int indent,
            @JsonProperty("bolded") boolean bolded,
            @JsonProperty("grayed") boolean grayed) {
        checkNotNull(text);
        checkNotNull(kind);
        checkNotNull(kindModifiers);
        checkNotNull(spans);
        checkArgument(indent >= 0);

        this.text = text;
        this.kind = kind;
        this.kindModifiers = ScriptElementKindModifier.parseList(kindModifiers);
        this.spans = ImmutableList.copyOf(spans);
        this.childItems = (childItems != null ? ImmutableList.copyOf(childItems) : ImmutableList.<NavigationBarItem> of());
        this.indent = indent;
        this.bolded = bolded;
        this.grayed = grayed;
    }

    public String getText() {
        return this.text;
    }

    public ScriptElementKind getKind() {
        return this.kind;
    }

    public List<ScriptElementKindModifier> getKindModifiers() {
        return this.kindModifiers;
    }

    public List<TextSpan> getSpans() {
        return this.spans;
    }

    public List<NavigationBarItem> getChildItems() {
        return this.childItems;
    }

    public int getIndent() {
        return this.indent;
    }

    public boolean getBolded() {
        return this.bolded;
    }

    public boolean getGrayed() {
        return this.grayed;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("text", this.text)
            .add("kind", this.kind)
            .add("kindModifiers", this.kindModifiers)
            .add("spans", this.spans)
            .add("childItems", this.childItems)
            .add("indent", this.indent)
            .add("bolded", this.bolded)
            .add("grayed", this.grayed)
            .toString();
    }
}
