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

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.google.common.base.Objects;

/**
 * Represents a request which will be sent to the bridge.
 *
 * @author dcicerone
 */
public final class Request {

    private final String service;
    private final String command;
    private final List<Object> args;

    public Request(String service, String command, Object... args) {
        checkNotNull(service);
        checkNotNull(command);
        checkNotNull(args);

        this.service = service;
        this.command = command;
        this.args = Arrays.asList(args);
    }

    public String getService() {
        return this.service;
    }

    public String getCommand() {
        return this.command;
    }

    public List<Object> getArgs() {
        return Collections.unmodifiableList(this.args);
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("service", this.service)
            .add("command", this.command)
            .add("args", this.args)
            .toString();
    }
}
