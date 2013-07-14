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

package com.palantir.typescript.bridge.classifier;

import java.util.List;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

/**
 * This class packs up the results of a syntax highlight request into a clean object.
 *
 * @author tyleradams
 */
public final class SyntaxHighlightResult {

    private final List<TokenWrapper> tokenWrappers;

    public SyntaxHighlightResult(List<ClassificationInfo> entries, List<Integer> offsets) {
        Preconditions.checkNotNull(entries);
        Preconditions.checkNotNull(offsets);
        Preconditions.checkArgument(entries.size() == offsets.size());

        this.tokenWrappers = Lists.newArrayList();
        for (int i = 0; i < entries.size(); i++) {
            this.tokenWrappers.add(new TokenWrapper(entries.get(i), offsets.get(i)));
        }
    }

    public TokenWrapper[] getTokenWrappers() {
        return this.tokenWrappers.toArray(new TokenWrapper[0]);
    }

}
