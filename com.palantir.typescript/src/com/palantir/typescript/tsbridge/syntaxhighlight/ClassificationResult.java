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

package com.palantir.typescript.tsbridge.syntaxhighlight;

import com.google.common.base.Preconditions;

/**
 * Corresponds to matching object from TypeScript.
 *
 * @author tyleradams
 */
public final class ClassificationResult {

    private ClassificationInfo[] entries;
    private int finalLexState;

    public int getFinalLexState() {
        return this.finalLexState;
    }

    public void setFinalLexState(int lexState) {
        Preconditions.checkArgument(lexState >= 0);

        this.finalLexState = lexState;
    }

    public void setEntries(ClassificationInfo[] entries) {
        Preconditions.checkNotNull(entries);

        this.entries = entries;
    }

    public ClassificationInfo[] getEntries() {
        return this.entries;
    }

}
