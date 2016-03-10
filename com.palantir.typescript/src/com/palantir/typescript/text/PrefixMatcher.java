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

import com.google.common.base.CharMatcher;

/**
 * This creates a string matcher which matches prefixes to strings using * and camel case.
 *
 * @author tyleradams
 */
public final class PrefixMatcher {

    private static final CharMatcher UPPER_CASE = CharMatcher.javaUpperCase();

    private final Pattern pattern;

    public PrefixMatcher(String prefix) {
        checkNotNull(prefix);

        this.pattern = createPattern(prefix);
    }

    public boolean matches(String text) {
        return this.pattern.matcher(text).matches();
    }

    private static Pattern createPattern(String prefix) {
        String regex = prefix;

        // escape non-alphanumeric characters
        regex = regex.replaceAll("([^\\p{Alnum}])", "\\\\$1");

        // convert the wildcard '*' to the regex equivalent
        regex = regex.replace("\\*", ".*");

        // use either camel case or case-insensitive matching
        if (UPPER_CASE.matchesAnyOf(regex)) {
            // the first character is treated special because we don't want to match lower
            // case characters before the first character if it is upper case
            // for example: ADL matches AddDefaultLibrary and NOT setAddDefaultLibrary
            // but aDL matches addDefaultLibrary
            regex = regex.substring(0, 1) + regex.substring(1).replaceAll("(\\p{javaUpperCase})", "[\\\\p{javaLowerCase}0-9_\\$]*$1");
        } else { // lower case means case-insensitive match
            regex = "(?i)" + regex;
        }

        // the match starts at the beginning of the string but doesn't need to go to the end
        regex = "^" + regex + ".*";

        return Pattern.compile(regex);
    }
}
