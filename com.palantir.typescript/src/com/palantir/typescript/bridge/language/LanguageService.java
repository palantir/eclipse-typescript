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
import com.palantir.typescript.bridge.Request;
import com.palantir.typescript.bridge.TypeScriptBridge;

/**
 * The language service.
 * <p>
 * This service provides autocompletion, formatting, compiling, etc...
 *
 * @author tyleradams
 */
public final class LanguageService {

    private static final String SERVICE = "language";

    private final TypeScriptBridge bridge;

    public LanguageService(TypeScriptBridge typeScriptBridge) {
        Preconditions.checkNotNull(typeScriptBridge);

        this.bridge = typeScriptBridge;
    }

    public AutoCompleteResult getCompletionsAtPosition(String file, int offset, String contents) {
        Preconditions.checkNotNull(file);
        Preconditions.checkArgument(offset >= 0);
        Preconditions.checkNotNull(contents);

        Request request = new Request(SERVICE, "getCompletionsAtPosition", file, offset, contents);
        DetailedAutoCompletionInfo autoCompletionInfo = this.bridge.sendRequest(request, DetailedAutoCompletionInfo.class);
        return new AutoCompleteResult(autoCompletionInfo);
    }

    public void addFile(String file) {
        Preconditions.checkNotNull(file);

        this.addFiles(ImmutableList.of(file));
    }

    public void addFiles(List<String> files) {
        Preconditions.checkNotNull(files);

        if (!files.isEmpty()) {
            Request request = new Request(SERVICE, "addFiles", files);

            this.bridge.sendRequest(request, Boolean.class);
        }
    }

    public void removeFile(String file) {
        Preconditions.checkNotNull(file);

        this.removeFiles(ImmutableList.of(file));
    }

    public void removeFiles(List<String> files) {
        Preconditions.checkNotNull(files);

        if (!files.isEmpty()) {
            Request request = new Request(SERVICE, "removeFiles", files);

            this.bridge.sendRequest(request, Boolean.class);
        }
    }

    public void updateFile(String file) {
        Preconditions.checkNotNull(file);

        Request request = new Request(SERVICE, "updateFile", file);

        this.bridge.sendRequest(request, Boolean.class);
    }
}
