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

package com.palantir.typescript.bridge.filemanager;

import java.util.List;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.palantir.typescript.bridge.IRequest;

/**
 * Makes a updateFile request from the language service from TypeScript.
 *
 * @author tyleradams
 */
public final class UpdateFileRequest implements IRequest {

    private static final String COMMAND = "updateFile";
    private static final String SERVICE = "language service";
    private final List<String> args;

    public UpdateFileRequest(String file, String content) {
        Preconditions.checkNotNull(file);
        Preconditions.checkNotNull(content);

        this.args = ImmutableList.of(file, content);
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
