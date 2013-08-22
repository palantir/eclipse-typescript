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

package com.palantir.typescript.text;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.regex.Pattern;

import com.google.common.base.Ascii;

/**
 * This creates a string matcher which matches prefixes to strings using * and camel case.
 *
 * @author tyleradams
 */
public final class PrefixMatcher {

    private final Pattern pattern;
    private final Pattern lowerCasePattern;

    public PrefixMatcher(String prefix) {
        checkNotNull(prefix);

        // turn the * wildcard into the regex .*
        prefix = prefix.replaceAll("\\*", ".\\*");
        this.lowerCasePattern = Pattern.compile("^" + prefix + ".*");

        if (!prefix.isEmpty()) {
            // the first character is treated special because we don't want to match lower
            // case characters before the first character if it is upper case
            // for example: ADL matches AddDefaultLibrary and NOT setAddDefaultLibrary
            // but aDL matches addDefaultLibrary
            prefix = prefix.substring(0, 1) + prefix.substring(1).replaceAll("([A-Z])", "[a-z0-9]*$1");
        }

        // this match starts at the beginning of the string but doesn't need to go to the end
        prefix = "^" + prefix + ".*";

        this.pattern = Pattern.compile(prefix);
    }

    public boolean matches(String text) {
        return this.pattern.matcher(text).matches() || this.lowerCasePattern.matcher(Ascii.toLowerCase(text)).matches();
    }
}
