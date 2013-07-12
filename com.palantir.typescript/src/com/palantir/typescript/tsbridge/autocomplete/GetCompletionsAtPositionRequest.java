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

import java.util.List;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.palantir.typescript.tsbridge.IRequest;

/**
 * Request object for getCompletionsAtPosition from the language service.
 *
 * @author tyleradams
 */
public final class GetCompletionsAtPositionRequest implements IRequest {

    private static final String COMMAND = "getCompletionsAtPosition";
    private static final String SERVICE = "language service";

    private final List args;

    public GetCompletionsAtPositionRequest(String file, int offset, String contents) {
        Preconditions.checkNotNull(file);
        Preconditions.checkArgument(offset >= 0);
        Preconditions.checkNotNull(contents);

        this.args = ImmutableList.of(file, offset, contents);
    }

    @Override
    public String getCommand() {
        return COMMAND;
    }

    @Override
    public String getService() {
        return SERVICE;
    }

    @Override
    public Object[] getArgs() {
        return this.args.toArray();
    }

}
