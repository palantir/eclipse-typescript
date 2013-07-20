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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;

import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.google.common.collect.ImmutableList;
import com.palantir.typescript.bridge.Bridge;
import com.palantir.typescript.bridge.Request;

/**
 * The language service.
 * <p>
 * This service provides autocompletion, formatting, compiling, etc...
 *
 * @author tyleradams
 */
public final class LanguageService {

    private static final String SERVICE = "language";

    private final Bridge bridge;

    public LanguageService(Bridge typeScriptBridge) {
        checkNotNull(typeScriptBridge);

        this.bridge = typeScriptBridge;
    }

    public List<TextEdit> getFormattingEditsForRange(String fileName, int minChar, int limChar, FormatCodeOptions options) {
        checkNotNull(fileName);
        checkArgument(minChar >= 0);
        checkArgument(limChar >= 0);
        checkNotNull(options);

        Request request = new Request(SERVICE, "getFormattingEditsForRange", fileName, minChar, limChar, options);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, TextEdit.class);
        return this.bridge.call(request, resultType);
    }

    public AutoCompleteResult getCompletionsAtPosition(String fileName, int offset) {
        checkNotNull(fileName);
        checkArgument(offset >= 0);

        Request request = new Request(SERVICE, "getCompletionsAtPosition", fileName, offset);
        DetailedAutoCompletionInfo autoCompletionInfo = this.bridge.call(request, DetailedAutoCompletionInfo.class);
        return new AutoCompleteResult(autoCompletionInfo);
    }

    public List<NavigateToItem> getScriptLexicalStructure(String fileName) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getScriptLexicalStructure", fileName);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, NavigateToItem.class);
        return this.bridge.call(request, returnType);
    }

    public void addFile(String fileName) {
        checkNotNull(fileName);

        this.addFiles(ImmutableList.of(fileName));
    }

    public void addFiles(List<String> fileNames) {
        checkNotNull(fileNames);

        if (!fileNames.isEmpty()) {
            Request request = new Request(SERVICE, "addFiles", fileNames);

            this.bridge.call(request, Boolean.class);
        }
    }

    public void editFile(String fileName, int offset, int length, String replacementText) {
        checkNotNull(fileName);
        checkArgument(offset >= 0);
        checkArgument(length >= 0);
        checkNotNull(replacementText);

        Request request = new Request(SERVICE, "editFile", fileName, offset, length, replacementText);

        this.bridge.call(request, Boolean.class);
    }

    public void removeFile(String fileName) {
        checkNotNull(fileName);

        this.removeFiles(ImmutableList.of(fileName));
    }

    public void removeFiles(List<String> fileNames) {
        checkNotNull(fileNames);

        if (!fileNames.isEmpty()) {
            Request request = new Request(SERVICE, "removeFiles", fileNames);

            this.bridge.call(request, Boolean.class);
        }
    }

    public void updateFile(String fileName) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "updateFile", fileName);

        this.bridge.call(request, Boolean.class);
    }
}
