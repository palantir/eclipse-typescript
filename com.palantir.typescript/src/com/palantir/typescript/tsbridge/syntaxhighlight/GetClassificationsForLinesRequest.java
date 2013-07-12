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

import java.util.List;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.palantir.typescript.tsbridge.IRequest;

/**
 * Request object for getClassificationsForLines from the classifier.
 *
 * @author tyleradams
 */
public final class GetClassificationsForLinesRequest implements IRequest {

    private static final String COMMAND = "getClassificationsForLines";
    private static final String SERVICE = "classifier";

    private final List<String> lines;
    private final int beginningOfLineState;
    private final List args;

    public GetClassificationsForLinesRequest(List<String> lines, int beginningOfLineState) {
        Preconditions.checkNotNull(lines);
        Preconditions.checkArgument(beginningOfLineState >= 0);

        this.lines = lines;
        this.beginningOfLineState = beginningOfLineState;
        this.args = ImmutableList.of(this.lines, this.beginningOfLineState);
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
