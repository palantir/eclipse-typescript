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

import com.fasterxml.jackson.annotation.JsonValue;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;

/**
 * Corresponds to the class with the same name in the TypeScript language services.
 *
 * @author dcicerone
 */
public enum ScriptElementKindModifier {

    PUBLIC_MEMBER_MODIFIER("public"),
    PRIVATE_MEMBER_MODIFIER("private"),
    PROTECTED_MEMBER_MODIFIER("protected"),
    EXPORTED_MODIFIER("export"),
    AMBIENT_MODIFIER("declare"),
    STATIC_MODIFIER("static");

    private final String value;

    private ScriptElementKindModifier(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return this.value;
    }

    public static ImmutableList<ScriptElementKindModifier> parseList(String kindModifiers) {
        ImmutableList.Builder<ScriptElementKindModifier> kindModifiersBuilder = ImmutableList.builder();

        if (kindModifiers.length() > 0) {
            for (String kindModifier : Splitter.on(',').split(kindModifiers)) {
                kindModifiersBuilder.add(fromString(kindModifier));
            }
        }

        return kindModifiersBuilder.build();
    }

    private static ScriptElementKindModifier fromString(String modifierKind) {
        checkNotNull(modifierKind);

        for (ScriptElementKindModifier kind : ScriptElementKindModifier.values()) {
            if (kind.value.equals(modifierKind)) {
                return kind;
            }
        }

        throw new IllegalArgumentException();
    }
}
