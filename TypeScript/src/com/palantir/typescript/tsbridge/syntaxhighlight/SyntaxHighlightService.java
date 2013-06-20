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
import com.palantir.typescript.tsbridge.IService;
import com.palantir.typescript.tsbridge.TypeScriptBridge;

/**
 * Through this object one makes syntax highlight requests. It must be associated with an actual
 * TypeScript Bridge.
 *
 * @author tyleradams
 */
public final class SyntaxHighlightService implements IService {

    private final String serviceType = "Syntax Highlight";
    private final TypeScriptBridge typeScriptBridge;

    public SyntaxHighlightService(TypeScriptBridge typeScriptBridge) {
        Preconditions.checkNotNull(typeScriptBridge);

        this.typeScriptBridge = typeScriptBridge;
    }

    @Override
    public String getServiceType() {
        return this.serviceType;
    }

    @Override
    public TypeScriptBridge getBridge() {
        return this.typeScriptBridge;
    }

    public SyntaxHighlightResult getTokenInformation(String text, int offset) {
        SyntaxHighlightRequest request = new SyntaxHighlightRequest(text, offset);
        return (SyntaxHighlightResult) this.typeScriptBridge.sendRequest(request);
    }

}
