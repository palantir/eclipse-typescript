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

package com.palantir.typescript.search;

import static com.google.common.base.Preconditions.checkNotNull;

import org.eclipse.search.ui.text.Match;

/**
 * A TypeScript search match.
 *
 * @author dcicerone
 */
public final class TypeScriptMatch extends Match {

    private final String line;
    private final MatchLine matchLine;

    public TypeScriptMatch(Object element, int offset, int length, String line) {
        super(element, offset, length);

        checkNotNull(line);

        this.line = line;
        this.matchLine = new MatchLine(this);
    }

    public String getLine() {
        return this.line;
    }

    public MatchLine getMatchLine() {
        return this.matchLine;
    }

    public static final class MatchLine {

        private final TypeScriptMatch match;

        public MatchLine(TypeScriptMatch match) {
            checkNotNull(match);

            this.match = match;
        }

        public TypeScriptMatch getMatch() {
            return this.match;
        }
    }
}
