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

/**
 * Corresponds to the enum with the same name in typescriptServices.d.ts.
 *
 * @author tyleradams
 */
public enum ModuleKind {

    NONE(0),
    // TODO : remove incorrect naming
    COMMONSJS(1),
    COMMONJS(1),
    AMD(2),
    UMD(3),
    SYSTEM(4),
    ES6(5),
    ES2015(5);

    private final int value;

    ModuleKind(int value) {
        this.value = value;
    }

    @JsonValue
    public int getValue() {
        return this.value;
    }

    /**
     * Parses legacy module kinds for backward-compatibility.
     */
    public static ModuleKind parse(String moduleKind) {
        checkNotNull(moduleKind);

        moduleKind = moduleKind.toUpperCase();

        if (moduleKind.equals("ASYNCHRONOUS")) {
            return AMD;
        } else if (moduleKind.equals("SYNCHRONOUS")) {
            return COMMONSJS;
        } else if (moduleKind.equals("UNSPECIFIED")) {
            return NONE;
        } else {
            return valueOf(moduleKind);
        }
    }
}
