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

import com.google.common.base.Preconditions;
import com.palantir.typescript.tsbridge.IResult;
import com.palantir.typescript.tsbridge.IService;
import com.palantir.typescript.tsbridge.TypeScriptBridge;
import com.palantir.typescript.tsbridge.ValidResult;

/**
 * @author tyleradams
 */
public final class AutoCompleteService implements IService {

    public static final String TYPE = "Auto Complete";
    private final TypeScriptBridge typeScriptBridge;

    public AutoCompleteService(TypeScriptBridge typeScriptBridge) {
        Preconditions.checkNotNull(typeScriptBridge);

        this.typeScriptBridge = typeScriptBridge;
    }

    @Override
    public String getServiceType() {
        return AutoCompleteService.TYPE;
    }

    @Override
    public TypeScriptBridge getBridge() {
        return this.typeScriptBridge;
    }

    public IResult safeAddFile(String fileName, String filePathRoot) {
        CheckFileRequest checkFileRequest = new CheckFileRequest(fileName);
        CheckFileResult checkFileResult = (CheckFileResult) this.typeScriptBridge.sendRequest(checkFileRequest);
        if (!checkFileResult.getFileLoaded()) {
            return addFile(fileName, filePathRoot);
        }
        AddFileRequest request = new AddFileRequest(fileName, filePathRoot);
        return new ValidResult(request.getCommand());
    }

    public IResult addFile(String fileName, String filePathRoot) {
        AddFileRequest request = new AddFileRequest(fileName, filePathRoot);
        return this.typeScriptBridge.sendRequest(request);
    }

    public IResult addFileWithReferences(String fileName, String filePathRoot) {
        AddFileWithReferencesRequest request = new AddFileWithReferencesRequest(fileName, filePathRoot);
        return this.typeScriptBridge.sendRequest(request);
    }

    public IResult safeRemoveFile(String fileName) {
        CheckFileRequest checkFileRequest = new CheckFileRequest(fileName);
        CheckFileResult checkFileResult = (CheckFileResult) this.typeScriptBridge.sendRequest(checkFileRequest);
        if (checkFileResult.getFileLoaded()) {
            return removeFile(fileName);
        }
        RemoveFileRequest request = new RemoveFileRequest(fileName);
        return new ValidResult(request.getCommand());
    }

    public IResult removeFile(String fileName) {
        RemoveFileRequest request = new RemoveFileRequest(fileName);
        return this.typeScriptBridge.sendRequest(request);
    }

    public IResult safeUpdateFile(String fileName, String fileContents) {
        CheckFileRequest checkFileRequest = new CheckFileRequest(fileName);
        CheckFileResult checkFileResult = (CheckFileResult) this.typeScriptBridge.sendRequest(checkFileRequest);
        if (checkFileResult.getFileLoaded()) {
            return updateFile(fileName, fileContents);
        }
        UpdateFileRequest request = new UpdateFileRequest(fileName, fileContents);
        return new ValidResult(request.getCommand());
    }

    public IResult updateFile(String fileName, String contents) {
        UpdateFileRequest request = new UpdateFileRequest(fileName, contents);
        return this.typeScriptBridge.sendRequest(request);
    }

    public AutoCompleteResult autoComplete(String fileName, int offset, boolean isMemberCompletion) {
        AutoCompleteRequest request = new AutoCompleteRequest(fileName, offset, isMemberCompletion);
        return (AutoCompleteResult) this.typeScriptBridge.sendRequest(request);
    }

    public AutoCompleteResult safeAutoComplete(String fileName, int offset, boolean isMemberCompletion, String filePathRoot,
            String fileContents) {
        //HUGE BURDEN ON PERFORMANCE.
        this.addFileWithReferences(fileName, filePathRoot);
        this.updateFile(fileName, fileContents);
        AutoCompleteRequest request = new AutoCompleteRequest(fileName, offset, isMemberCompletion);
        return (AutoCompleteResult) this.typeScriptBridge.sendRequest(request);
    }

}
