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

import com.google.common.primitives.Ints;
import com.palantir.typescript.services.language.ReferenceEntryEx;

/**
 * A find references match.
 *
 * @author dcicerone
 */
public final class FindReferenceMatch extends Match implements Comparable {

    private final ReferenceEntryEx reference;

    public FindReferenceMatch(Object element, int offset, int length, ReferenceEntryEx reference) {
        super(element, offset, length);

        this.reference = checkNotNull(reference);
    }

    public ReferenceEntryEx getReference() {
        return this.reference;
    }

    @Override
    public int compareTo(Object o) {
        if (o instanceof Match) {
            Match other = (Match) o;

            return Ints.compare(this.getOffset(), other.getOffset());
        }

        throw new IllegalStateException();
    }

    @Override
    public String toString() {
        return this.reference.toString();
    }
}
