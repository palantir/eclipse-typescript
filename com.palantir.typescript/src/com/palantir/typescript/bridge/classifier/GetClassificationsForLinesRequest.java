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

package com.palantir.typescript.bridge.classifier;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;

import com.google.common.collect.ImmutableList;
import com.palantir.typescript.bridge.IRequest;

/**
 * Request object for getClassificationsForLines from the classifier.
 *
 * @author tyleradams
 */
public final class GetClassificationsForLinesRequest implements IRequest {

    private final ImmutableList<?> args;

    public GetClassificationsForLinesRequest(List<String> lines, EndOfLineState lexState) {
        checkNotNull(lines);
        checkNotNull(lexState);

        this.args = ImmutableList.of(lines, lexState.ordinal());
    }

    @Override
    public String getService() {
        return "classifier";
    }

    @Override
    public String getCommand() {
        return "getClassificationsForLines";
    }

    @Override
    public ImmutableList<?> getArgs() {
        return this.args;
    }
}
