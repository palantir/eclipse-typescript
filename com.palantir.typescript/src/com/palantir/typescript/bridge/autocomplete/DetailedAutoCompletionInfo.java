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

package com.palantir.typescript.bridge.autocomplete;

import com.google.common.base.Preconditions;

/**
 * Corresponds to matching object from TypeScript.
 *
 * @author tyleradams
 */
public final class DetailedAutoCompletionInfo {

    private String pruningPrefix;
    private CompletionEntryDetails[] entries;

    public String getPruningPrefix() {
        return this.pruningPrefix;
    }

    public void setPruningPrefix(String pruningPrefix) {
        Preconditions.checkNotNull(pruningPrefix);

        this.pruningPrefix = pruningPrefix;
    }

    public CompletionEntryDetails[] getEntries() {
        return this.entries;
    }

    public void setEntries(CompletionEntryDetails[] entries) {
        Preconditions.checkNotNull(entries);

        this.entries = entries;
    }

}
