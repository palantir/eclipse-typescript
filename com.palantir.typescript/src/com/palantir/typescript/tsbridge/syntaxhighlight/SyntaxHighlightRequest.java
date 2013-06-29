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
import com.palantir.typescript.tsbridge.IRequest;

/**
 * All syntax highlight requests are made with this object.
 *
 * @author tyleradams
 */
public final class SyntaxHighlightRequest implements IRequest {

    public static final String COMMAND = "syntax highlight";
    private final String command;
    private final String serviceType;
    private final String documentText;
    private final int offset;

    public SyntaxHighlightRequest(String documentText, int offset) {
        Preconditions.checkNotNull(documentText);
        Preconditions.checkArgument(offset >= 0);

        this.documentText = documentText;
        this.command = SyntaxHighlightRequest.COMMAND;
        this.serviceType = SyntaxHighlightService.TYPE;
        this.offset = offset;
    }

    @Override
    public String getCommand() {
        return this.command;
    }

    public String getDocumentText() {
        return this.documentText;
    }

    public int getOffset() {
        return this.offset;
    }

    @Override
    public String getServiceType() {
        return this.serviceType;
    }

}
