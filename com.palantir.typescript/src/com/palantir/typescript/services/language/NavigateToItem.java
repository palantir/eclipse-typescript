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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;
import com.google.common.collect.ImmutableList;

/**
 * Corresponds to the class with the same name in languageService.ts.
 *
 * @author dcicerone
 */
public final class NavigateToItem {

    private final String name;
    private final ScriptElementKind kind;
    private final ImmutableList<ScriptElementModifierKind> kindModifiers;
    private final String matchKind;
    private final String fileName;
    private final int minChar;
    private final int limChar;
    private final String containerName;
    private final ScriptElementKind containerKind;

    @JsonCreator
    public NavigateToItem(
            @JsonProperty("name") String name,
            @JsonProperty("kind") ScriptElementKind kind,
            @JsonProperty("kindModifiers") String kindModifiers,
            @JsonProperty("matchKind") String matchKind,
            @JsonProperty("fileName") String fileName,
            @JsonProperty("minChar") int minChar,
            @JsonProperty("limChar") int limChar,
            @JsonProperty("containerName") String containerName,
            @JsonProperty("containerKind") ScriptElementKind containerKind) {
        checkNotNull(name);
        checkNotNull(kind);
        checkNotNull(kindModifiers);
        checkNotNull(matchKind);
        checkNotNull(fileName);
        checkArgument(minChar >= 0);
        checkArgument(limChar > 0);
        checkNotNull(containerName);
        checkNotNull(containerKind);

        this.name = name;
        this.kind = kind;
        this.kindModifiers = ScriptElementModifierKind.parseList(kindModifiers);
        this.matchKind = matchKind;
        this.fileName = fileName;
        this.minChar = minChar;
        this.limChar = limChar;
        this.containerName = containerName;
        this.containerKind = containerKind;
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

    public String getMatchKind() {
        return this.matchKind;
    }

    public String getFileName() {
        return this.fileName;
    }

    public int getMinChar() {
        return this.minChar;
    }

    public int getLimChar() {
        return this.limChar;
    }

    public String getContainerName() {
        return this.containerName;
    }

    public ScriptElementKind getContainerKind() {
        return this.containerKind;
    }

    @Override
    public boolean equals(Object item) {
        if (item == this) {
            return true;
        } else if (item instanceof NavigateToItem) {
            NavigateToItem other = (NavigateToItem) item;

            return this.name.equals(other.name)
                    && this.kind.equals(other.kind)
                    && this.kindModifiers.equals(other.kindModifiers)
                    && this.matchKind.equals(other.matchKind)
                    && this.fileName.equals(other.fileName)
                    && this.minChar == other.minChar
                    && this.limChar == other.limChar
                    && this.containerName.equals(other.containerName);
        }

        return false;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(
            this.name,
            this.kind,
            this.kindModifiers,
            this.matchKind,
            this.fileName,
            this.minChar,
            this.limChar,
            this.containerName,
            this.containerKind);
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("name", this.name)
            .add("kind", this.kind)
            .add("kindModifiers", this.kindModifiers)
            .add("matchKind", this.matchKind)
            .add("fileName", this.fileName)
            .add("minChar", this.minChar)
            .add("limChar", this.limChar)
            .add("containerName", this.containerName)
            .add("containerKind", this.containerKind)
            .toString();
    }
}
