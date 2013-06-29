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

package com.palantir.typescript.tsbridge;

/**
 * This is the default implementation of an IResult.
 *
 * @author tyleradams
 */
public final class SimpleResult implements IResult {
    private String resultType;
    private boolean resultValid;

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

}
