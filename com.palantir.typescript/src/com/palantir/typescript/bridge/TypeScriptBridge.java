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

package com.palantir.typescript.bridge;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Preconditions;
import com.palantir.typescript.bridge.autocomplete.AutoCompleteService;
import com.palantir.typescript.bridge.classifier.Classifier;
import com.palantir.typescript.bridge.filemanager.FileManagerService;

/**
 * This handles all requests that need to be handled by TypeScript's built in language services.
 *
 * @author tyleradams
 */
public final class TypeScriptBridge {

    private static final String DEFAULT_NODE_LOCATION = "/usr/local/bin/node";
    private static final String DEFAULT_BRIDGE_LOCATION = "bin/bridge.js";

    private static final String UNITIALIZED = "Unitialized";

    private BufferedReader fromServer;
    private BufferedWriter toServer;
    private Process server;

    private final String nodeLocation;
    private final String bridgeLocation;

    private final ObjectMapper mapper;

    private final Classifier classifier;
    private final AutoCompleteService autoCompleteService;
    private final FileManagerService fileManagerService;

    public TypeScriptBridge() {
        this(DEFAULT_NODE_LOCATION, DEFAULT_BRIDGE_LOCATION);
    }

    public TypeScriptBridge(String nodeLocation, String bridgeLocation) {
        Preconditions.checkNotNull(nodeLocation);
        Preconditions.checkNotNull(bridgeLocation);

        String pluginRoot = this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();

        this.nodeLocation = nodeLocation;
        this.bridgeLocation = pluginRoot + bridgeLocation;

        start();

        this.mapper = new ObjectMapper();

        this.classifier = new Classifier(this);
        this.autoCompleteService = new AutoCompleteService(this);
        this.fileManagerService = new FileManagerService(this);

        this.fileManagerService.intializeWorkspace();
    }

    public Classifier getClassifier() {
        return this.classifier;
    }

    public AutoCompleteService getAutoCompleteService() {
        return this.autoCompleteService;
    }

    public FileManagerService getFileManagerService() {
        return this.fileManagerService;
    }

    /**
     * This method handles packaging the request from Java, sending it across the TypeScript bridge,
     * and packaging the result for usage.
     */
    public <T> T sendRequest(IRequest request, Class<T> resultType) {
        Preconditions.checkNotNull(request);
        Preconditions.checkNotNull(resultType);

        String rawRequest;

        try {
            rawRequest = this.mapper.writeValueAsString(request);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        String rawResult = this.sendRawRequestGetRawResult(rawRequest);
        if (invalid(rawResult)) {
            throw new RuntimeException("The following raw request caused an error to be thrown\n" + rawRequest
                    + "\n and it caused the following error\n" + rawResult);
        }

        T result;
        try {
            result = this.mapper.readValue(rawResult, resultType);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        if (result == null) {
            throw new RuntimeException("The result is null");
        }

        return result;
    }

    private static boolean invalid(String rawResult) {
        Preconditions.checkNotNull(rawResult);

        String invalidPrefix = "{\"error\":";
        return rawResult.startsWith(invalidPrefix);
    }

    private String sendRawRequestGetRawResult(String rawRequest) {
        Preconditions.checkNotNull(rawRequest);

        String rawResult = UNITIALIZED;
        try {
            this.toServer.write(rawRequest);
            this.toServer.write('\n');
            this.toServer.flush();
            rawResult = this.fromServer.readLine();
        } catch (IOException e) {
            restartServer();
        }

        if (rawResult == null) {
            restartServer();
        } else if (rawResult.equals(UNITIALIZED)) {
            throw new RuntimeException("The rawResult was never set");
        }
        return rawResult;
    }

    private void start() {
        ProcessBuilder pb = new ProcessBuilder(this.nodeLocation, this.bridgeLocation);
        try {
            this.server = pb.start();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        this.fromServer = initializeReader();
        this.toServer = initializeWriter();

    }

    private BufferedReader initializeReader() {
        return new BufferedReader(
            new InputStreamReader(this.server.getInputStream()));
    }

    private BufferedWriter initializeWriter() {
        return new BufferedWriter(
            new OutputStreamWriter(this.server.getOutputStream()));
    }

    public void stop() {
        try {
            this.fromServer.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        try {
            this.toServer.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void restartServer() {
        stop();
        start();
    }
}
