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

package com.palantir.typescript.bridge.language;

import com.google.common.base.Preconditions;

/**
 * This is a container object which knows what kind of modifiers an object has.
 *
 * @author tyleradams
 */
public final class ExtendedKindModifiers {
    private final boolean isNone;
    private final boolean isPublic;
    private final boolean isPrivate;
    private final boolean isExport;
    private final boolean isAmbient;
    private final boolean isStatic;
    private final boolean isDeprecated;
    private final int hashCode;

    public ExtendedKindModifiers(String rawKindModifiers, String docComment) {
        Preconditions.checkNotNull(rawKindModifiers);
        Preconditions.checkNotNull(docComment);

        this.isNone = rawKindModifiers.equals("");
        this.isPublic = rawKindModifiers.contains("public");
        this.isPrivate = rawKindModifiers.contains("private");
        this.isExport = rawKindModifiers.contains("export");
        this.isAmbient = rawKindModifiers.contains("declare");
        this.isStatic = rawKindModifiers.contains("static");

        this.isDeprecated = docComment.contains("@deprecated");
        this.hashCode = this.computeHashCode();
    }

    private int computeHashCode() {
        int tempHashCode = 0;
        int digit = 1;
        int base = 10;
        if (this.isPublic)
            tempHashCode += digit;
        digit *= base;
        if (this.isPrivate)
            tempHashCode += digit;
        digit *= base;
        if (this.isExport)
            tempHashCode += digit;
        digit *= base;
        if (this.isAmbient)
            tempHashCode += digit;
        digit *= base;
        if (this.isStatic)
            tempHashCode += digit;
        digit *= base;
        if (this.isDeprecated)
            tempHashCode += digit;
        return tempHashCode;
    }

    public boolean isNone() {
        return this.isNone;
    }

    public boolean isPublic() {
        return this.isPublic;
    }

    public boolean isPrivate() {
        return this.isPrivate;
    }

    public boolean isExport() {
        return this.isExport;
    }

    public boolean isAmbient() {
        return this.isAmbient;
    }

    public boolean isStatic() {
        return this.isStatic;
    }

    public boolean isDeprecated() {
        return this.isDeprecated;
    }

    @Override
    public int hashCode() {
        return this.hashCode;
    }

}
