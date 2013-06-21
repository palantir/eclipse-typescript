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

package com.palantir.typescript.tsbridge;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Preconditions;
import com.palantir.typescript.tsbridge.syntaxhighlight.SyntaxHighlightResult;
import com.palantir.typescript.tsbridge.syntaxhighlight.SyntaxHighlightService;

/**
 * This handles all requests that need to be handled by TypeScript's built in language services.
 *
 * @author tyleradams
 */
public final class TypeScriptBridge {

    private static TypeScriptBridge BRIDGE = null;

    private static final String DEFAULT_NODE_LOCATION = "/usr/local/bin/node";
    private static final String DEFAULT_BRIDGE_LOCATION = "TSBridge/bin/bridge.js";

    private final BufferedReader fromServer;
    private final BufferedWriter toServer;
    private final Process server;

    private final String nodeLocation;
    private final String bridgeLocation;

    private final SyntaxHighlightService syntaxHighlightService;

    public TypeScriptBridge() {
        this(DEFAULT_NODE_LOCATION, DEFAULT_BRIDGE_LOCATION);
    }

    public TypeScriptBridge(String nodeLocation, String bridgeLocation) {

        Preconditions.checkNotNull(nodeLocation);
        Preconditions.checkNotNull(bridgeLocation);

        String pluginRoot = this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();

        this.nodeLocation = nodeLocation;
        this.bridgeLocation = pluginRoot + bridgeLocation;

        this.server = initializeServer();
        this.fromServer = initializeReader();
        this.toServer = initializeWriter();

        this.syntaxHighlightService = new SyntaxHighlightService(this);
    }

    public SyntaxHighlightService getSyntaxHighlightService() {
        return this.syntaxHighlightService;
    }

    /**
     * This method handles packaging the request from Java, sending it across the TypeScript bridge,
     * and packaging the result for usage.
     */
    public IResult sendRequest(IRequest request) {
        Preconditions.checkNotNull(request);

        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        String rawResult = sendRequestGetRawResult(request, mapper);

        try {
            IResult result = mapper.readValue(rawResult, SimpleResult.class);

            if (result.getResultType().equals(SyntaxHighlightResult.TYPE)) {
                result = mapper.readValue(rawResult, SyntaxHighlightResult.class);
            } else if (result.isResultNotValid()) {
                ErrorResult eResult = mapper.readValue(rawResult, ErrorResult.class);
                throw new RuntimeException("The result is not valid, the error message is: " + eResult.getErrorMessage());
            }
            return result;

        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    public static TypeScriptBridge startBridge() {
        if (BRIDGE != null) {
            throw new RuntimeException("We already started the Bridge, you cannot start it again");
        }
        BRIDGE = new TypeScriptBridge();
        return BRIDGE;
    }

    public static TypeScriptBridge getBridge() {
        if (BRIDGE == null) {
            throw new RuntimeException("The Bridge has not been started");
        }
        return BRIDGE;
    }

    public static void stopBridge() {
        if (BRIDGE == null) {
            throw new RuntimeException("The Bridge has not been started, you cannot stop it");
        }
        BRIDGE.killServer();
        BRIDGE = null;
        return;
    }

    private String sendRequestGetRawResult(IRequest request, ObjectMapper mapper) {
        String rawResult = "";
        String rawRequest;
        try {
            rawRequest = mapper.writeValueAsString(request);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        try {
            this.toServer.write(rawRequest);
            this.toServer.flush();
            rawResult = this.fromServer.readLine();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        if (rawResult == null) {
            throw new RuntimeException("We got back a null object from the Server.  The corresponding request was: " + rawRequest);
        }
        return rawResult;
    }

    private Process initializeServer() {
        ProcessBuilder pb = new ProcessBuilder(this.nodeLocation, this.bridgeLocation);
        try {
            return pb.start();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private BufferedReader initializeReader() {
        return new BufferedReader(
            new InputStreamReader(this.server.getInputStream()));
    }

    private BufferedWriter initializeWriter() {
        return new BufferedWriter(
            new OutputStreamWriter(this.server.getOutputStream()));
    }

    private void killServer() {
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
}
