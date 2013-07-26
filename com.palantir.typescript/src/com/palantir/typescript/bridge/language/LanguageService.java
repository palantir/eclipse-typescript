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

import java.io.IOException;
import java.util.List;

import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.google.common.base.Charsets;
import com.google.common.io.Resources;
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

    public LanguageService(Bridge bridge) {
        checkNotNull(bridge);

        this.bridge = bridge;
    }

    public CompletionInfo getCompletionsAtPosition(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getCompletionsAtPosition", fileName, position);
        return this.bridge.call(request, CompletionInfo.class);
    }

    public List<DefinitionInfo> getDefinitionAtPosition(String fileName, int position) {
        checkNotNull(fileName);
        checkArgument(position >= 0);

        Request request = new Request(SERVICE, "getDefinitionAtPosition", fileName, position);
        CollectionType resultType = TypeFactory.defaultInstance().constructCollectionType(List.class, DefinitionInfo.class);
        return this.bridge.call(request, resultType);
    }

    public List<Diagnostic> getDiagnostics(String fileName) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getDiagnostics", fileName);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, Diagnostic.class);
        return this.bridge.call(request, returnType);
    }

    public EmitOutput getEmitOutput(String fileName) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getEmitOutput", fileName);
        return this.bridge.call(request, EmitOutput.class);
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

    public SpanInfo getNameOrDottedNameSpan(String fileName, int startPos, int endPos) {
        checkNotNull(fileName);
        checkArgument(startPos >= 0);
        checkArgument(endPos >= 0);

        Request request = new Request(SERVICE, "getNameOrDottedNameSpan", fileName, startPos, endPos);
        return this.bridge.call(request, SpanInfo.class);
    }

    public List<NavigateToItem> getScriptLexicalStructure(String fileName) {
        checkNotNull(fileName);

        Request request = new Request(SERVICE, "getScriptLexicalStructure", fileName);
        CollectionType returnType = TypeFactory.defaultInstance().constructCollectionType(List.class, NavigateToItem.class);
        return this.bridge.call(request, returnType);
    }

    public void addDefaultLibrary() {
        String libraryContents;
        try {
            libraryContents = Resources.toString(LanguageService.class.getResource("lib.d.ts"), Charsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        Request request = new Request(SERVICE, "addDefaultLibrary", libraryContents);
        this.bridge.call(request, Void.class);
    }

    public void editFile(String fileName, int offset, int length, String replacementText) {
        checkNotNull(fileName);
        checkArgument(offset >= 0);
        checkArgument(length >= 0);
        checkNotNull(replacementText);

        Request request = new Request(SERVICE, "editFile", fileName, offset, length, replacementText);
        this.bridge.call(request, Void.class);
    }

    public void updateFileContents(String fileName, String contents) {
        checkNotNull(fileName);
        checkNotNull(contents);

        Request request = new Request(SERVICE, "updateFileContents", fileName, contents);
        this.bridge.call(request, Void.class);
    }

    public void updateFiles(List<FileDelta> deltas) {
        checkNotNull(deltas);

        Request request = new Request(SERVICE, "updateFiles", deltas);
        this.bridge.call(request, Void.class);
    }
}
