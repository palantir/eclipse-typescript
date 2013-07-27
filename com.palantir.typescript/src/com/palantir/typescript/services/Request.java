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

package com.palantir.typescript.services;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * Represents a request which will be sent to the bridge.
 *
 * @author dcicerone
 */
public final class Request {

    private final String service;
    private final String command;
    private final Object[] args;

    public Request(String service, String command, Object... args) {
        checkNotNull(service);
        checkNotNull(command);
        checkNotNull(args);

        this.service = service;
        this.command = command;
        this.args = args;
    }

    public String getService() {
        return this.service;
    }

    public String getCommand() {
        return this.command;
    }

    public Object[] getArgs() {
        return this.args;
    }
}
