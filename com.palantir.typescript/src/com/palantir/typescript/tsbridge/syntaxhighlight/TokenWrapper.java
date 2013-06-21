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

import org.eclipse.jface.text.rules.IToken;

/**
 * This class handles the tokens which come back from the TypeScript bridge.
 *
 * @author tyleradams
 */
public final class TokenWrapper {
    private IToken token;
    private int tokenID;
    private int offset;
    private int length;

    public TokenWrapper() {
    }

    public IToken getToken() {
        return this.token;
    }

    public void setToken(IToken token) {
        this.token = token;
    }

    public int getOffset() {
        return this.offset;
    }

    public int getLength() {
        return this.length;
    }

    public int getTokenID() {
        return this.tokenID;
    }
}
