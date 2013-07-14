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

package com.palantir.typescript.bridge.language;

import java.util.List;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.palantir.typescript.bridge.IRequest;

/**
 * Makes a loadFiles request from the language service from TypeScript.
 *
 * @author tyleradams
 */
public final class LoadFilesRequest implements IRequest {

    private static final String COMMAND = "loadFiles";
    private static final String SERVICE = "language service";
    private final ImmutableList<String[]> args;

    public LoadFilesRequest(List<String> files) {
        Preconditions.checkNotNull(files);

        String[] filesArray = files.toArray(new String[0]);

        this.args = ImmutableList.of(filesArray);
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
    public List<?> getArgs() {
        return this.args;
    }
}
