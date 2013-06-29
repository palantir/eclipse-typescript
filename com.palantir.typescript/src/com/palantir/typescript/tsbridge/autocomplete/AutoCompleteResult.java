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

package com.palantir.typescript.tsbridge.autocomplete;

import com.palantir.typescript.tsbridge.IResult;

/**
 * @author tyleradams
 */
public final class AutoCompleteResult implements IResult {
    public static final String TYPE = "auto complete";
    private IDetailedAutoCompletionInfo autoCompletionInfo;
    private boolean resultValid;
    private String resultType;

    @Override
    public String getResultType() {
        return this.resultType;
    }

    public void setResultValid(boolean resultValid) {
        this.resultValid = resultValid;
    }

    @Override
    public boolean isResultNotValid() {
        return !this.resultValid;
    }

    public IDetailedAutoCompletionInfo getAutoCompletionInfo() {
        return this.autoCompletionInfo;
    }

    public void setAutoCompletionInfo(IDetailedAutoCompletionInfo autoCompletionInfo) {
        this.autoCompletionInfo = autoCompletionInfo;
    }

}
