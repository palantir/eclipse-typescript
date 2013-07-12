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

import com.google.common.base.Preconditions;
import com.palantir.typescript.tsbridge.TypeScriptBridge;

/**
 * Through this object one makes auto complete related requests. It needs a bridge to send requests.
 * @author tyleradams
 */
public final class AutoCompleteService {

    private final TypeScriptBridge typeScriptBridge;
    private static final int MAX_CONTENT_SIZE = 30000;

    public AutoCompleteService(TypeScriptBridge typeScriptBridge) {
        Preconditions.checkNotNull(typeScriptBridge);

        this.typeScriptBridge = typeScriptBridge;
    }

    public AutoCompleteResult autoComplete(String file, int offset, String contents) {
        Preconditions.checkNotNull(file);
        Preconditions.checkArgument(offset >= 0);
        Preconditions.checkNotNull(contents);

        if(contents.length() > MAX_CONTENT_SIZE) {
            return null;
        }

        GetCompletionsAtPositionRequest request = new GetCompletionsAtPositionRequest(file, offset, contents);
        DetailedAutoCompletionInfo autoCompletionInfo = this.typeScriptBridge.sendRequest(request, DetailedAutoCompletionInfo.class);
        return new AutoCompleteResult(autoCompletionInfo);
    }

}
