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
public final class ClassificationResults {

    private ClassificationResult[] results;

    public ClassificationResult[] getResults() {
        return this.results;
    }

    public void setResults(ClassificationResult[] results) {
        Preconditions.checkNotNull(results);

        this.results = results;
    }

    public int getFinalLexState() {
        int lastIndex = this.results.length - 1;
        Preconditions.checkElementIndex(lastIndex, this.results.length);

        return this.results[lastIndex].getFinalLexState();
    }

}
