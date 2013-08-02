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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;

/**
 * Represents a request which will be sent to the bridge.
 *
 * @author dcicerone
 */
public final class Request {

    @JsonProperty("service")
    private final String service;

    @JsonProperty("method")
    private final String method;

    @JsonProperty("arguments")
    private final List<Object> arguments;

    public Request(String service, String method, Object... arguments) {
        checkNotNull(service);
        checkNotNull(method);
        checkNotNull(arguments);

        this.service = service;
        this.method = method;
        this.arguments = Collections.unmodifiableList(Arrays.asList(arguments));
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("service", this.service)
            .add("method", this.method)
            .add("arguments", this.arguments)
            .toString();
    }
}
