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

import java.util.Collection;

import com.google.common.collect.ImmutableList;

/**
 * A single line containing matches.
 *
 * @author dcicerone
 */
public final class LineResult {

    private final ImmutableList<FindReferenceMatch> matches;

    public LineResult(Collection<FindReferenceMatch> matches) {
        checkNotNull(matches);

        this.matches = ImmutableList.copyOf(matches);
    }

    public ImmutableList<FindReferenceMatch> getMatches() {
        return this.matches;
    }
}
