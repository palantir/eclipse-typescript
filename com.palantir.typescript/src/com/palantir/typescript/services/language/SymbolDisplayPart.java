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
import com.google.common.base.StandardSystemProperty;

/**
 * Corresponds to the class with the same name in TypeScript.
 *
 * @author dcicerone
 */
public final class SymbolDisplayPart {

    private final SymbolDisplayPartKind kind;
    private final String text;

    public SymbolDisplayPart(
            @JsonProperty("kind") SymbolDisplayPartKind kind,
            @JsonProperty("text") String text) {
        checkNotNull(kind);
        checkNotNull(text);

        this.kind = kind;
        this.text = text;
    }

    public SymbolDisplayPartKind getKind() {
        return this.kind;
    }

    public String getText() {
        return this.text;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("kind", this.kind)
            .add("text", this.text)
            .toString();
    }

    public static String getText(List<SymbolDisplayPart> parts) {
        checkNotNull(parts);

        StringBuilder displayText = new StringBuilder();

        for (SymbolDisplayPart part : parts) {
            if (part.getKind().equals(SymbolDisplayPartKind.LINE_BREAK)) {
                displayText.append(StandardSystemProperty.LINE_SEPARATOR.value());
            } else {
                displayText.append(part.getText());
            }
        }

        return displayText.toString();
    }
}
