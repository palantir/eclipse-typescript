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

import com.palantir.typescript.tsbridge.IRequest;

/**
 * @author tyleradams
 */
public final class RemoveFileRequest implements IRequest {
    private final String command;
    private final String serviceType;
    private final String fileName;

    public RemoveFileRequest(String fileName) {
        this.fileName = fileName;
        this.command = "remove file";
        this.serviceType = AutoCompleteService.TYPE;
    }

    @Override
    public String getCommand() {
        return this.command;
    }

    public String getFileName() {
        return this.fileName;
    }

    @Override
    public String getServiceType() {
        return this.serviceType;
    }

}
