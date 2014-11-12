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

/**
 * Corresponds to the class with the same name in languageService.ts.
 *
 * @author dcicerone
 */
public final class DefinitionInfo {

    private final String fileName;
    private final TextSpan textSpan;
    private final ScriptElementKind kind;
    private final String name;
    private final ScriptElementKind containerKind;
    private final String containerName;

    public DefinitionInfo(
            @JsonProperty("fileName") String fileName,
            @JsonProperty("textSpan") TextSpan textSpan,
            @JsonProperty("kind") ScriptElementKind kind,
            @JsonProperty("name") String name,
            @JsonProperty("containerKind") ScriptElementKind containerKind,
            @JsonProperty("containerName") String containerName) {
        checkNotNull(fileName);
        checkNotNull(textSpan);
        checkNotNull(kind);
        checkNotNull(name);

        this.fileName = fileName;
        this.textSpan = textSpan;
        this.kind = kind;
        this.name = name;
        this.containerKind = containerKind;
        this.containerName = containerName;
    }

    public String getFileName() {
        return this.fileName;
    }

    public TextSpan getTextSpan() {
        return this.textSpan;
    }

    public ScriptElementKind getKind() {
        return this.kind;
    }

    public String getName() {
        return this.name;
    }

    public ScriptElementKind getContainerKind() {
        return this.containerKind;
    }

    public String getContainerName() {
        return this.containerName;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("fileName", this.fileName)
            .add("textSpan", this.textSpan)
            .add("kind", this.kind)
            .add("name", this.name)
            .add("containerKind", this.containerKind)
            .add("containerName", this.containerName)
            .toString();
    }
}
