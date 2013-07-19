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
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintStream;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.google.common.base.Preconditions;
import com.palantir.typescript.bridge.classifier.Classifier;
import com.palantir.typescript.bridge.language.LanguageService;

/**
 * This handles all requests that need to be handled by TypeScript's built in language services.
 *
 * @author tyleradams
 */
public final class Bridge {

    private static final String DEFAULT_NODE_LOCATION = "/usr/local/bin/node";
    private static final String DEFAULT_BRIDGE_LOCATION = "bin/bridge.js";

    private static final int MAX_MESSAGE_LOG_SIZE = 1000;

    private BufferedReader fromServer;
    private BufferedWriter toServer;
    private Process server;

    private PrintStream logger;

    private final String nodeLocation;
    private final String bridgeLocation;

    private final ObjectMapper mapper;

    private final Classifier classifier;
    private final LanguageService languageService;

    public Bridge() {
        this(DEFAULT_NODE_LOCATION, DEFAULT_BRIDGE_LOCATION);
    }

    public Bridge(String nodeLocation, String bridgeLocation) {
        Preconditions.checkNotNull(nodeLocation);
        Preconditions.checkNotNull(bridgeLocation);

        String pluginRoot = this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();

        this.nodeLocation = nodeLocation;
        this.bridgeLocation = pluginRoot + bridgeLocation;

        start();

        this.mapper = new ObjectMapper();

        this.classifier = new Classifier(this);
        this.languageService = new LanguageService(this);
    }

    public Classifier getClassifier() {
        return this.classifier;
    }

    public LanguageService getLanguageService() {
        return this.languageService;
    }

    /**
     * This method handles packaging the request from Java, sending it across the TypeScript bridge,
     * and packaging the result for usage.
     */
    public <T> T sendRequest(Request request, Class<T> resultType) {
        Preconditions.checkNotNull(request);
        Preconditions.checkNotNull(resultType);

        JavaType type = TypeFactory.defaultInstance().uncheckedSimpleType(resultType);

        return this.sendRequest(request, type);
    }

    /**
     * This method handles packaging the request from Java, sending it across the TypeScript bridge,
     * and packaging the result for usage.
     */
    public <T> T sendRequest(Request request, JavaType resultType) {
        Preconditions.checkNotNull(request);
        Preconditions.checkNotNull(resultType);

        // process the request
        String resultJson;
        try {
            String requestJson = this.mapper.writeValueAsString(request);

            resultJson = this.processRequest(requestJson);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        // convert the JSON result into a Java object
        try {
            return this.mapper.readValue(resultJson, resultType);
        } catch (IOException e) {
            throw new RuntimeException("Error parsing result: " + resultJson, e);
        }
    }

    private String processRequest(String rawRequest) throws IOException {
        Preconditions.checkNotNull(rawRequest);

        // write the request to the bridge's stdin
        this.toServer.write(rawRequest);
        this.toServer.write('\n');
        this.toServer.flush();

        // read the response from the bridge's stdout
        String resultJson = null;
        do {
            String line = this.fromServer.readLine();

            if (line.startsWith("DEBUG")) {
                this.log(line);
            } else if (line.startsWith("ERROR")) {
                line = line.substring(7, line.length()); // remove "ERROR: "
                line = line.replaceAll("\\\\n", "\n"); // put newlines back
                line = line.replaceAll("    ", "\t"); // replace spaces with tabs (to match Java stack traces)

                throw new RuntimeException("The following request caused an error to be thrown\n" + rawRequest
                        + "\n and it caused the following error\n" + line);
            } else {
                resultJson = line;
            }
        } while (resultJson == null);

        return resultJson;
    }

    private void log(String message) {
        Preconditions.checkNotNull(message);

        if (message.length() > MAX_MESSAGE_LOG_SIZE) {
            String etc = "...etc";
            log(message.substring(0, MAX_MESSAGE_LOG_SIZE - etc.length()) + etc); // etc.length() is guaranteed to be less than MAX_MESSAGE_LOG_SIZE
            return;
        }

        System.out.println(message);
        if (this.logger != null) {
            this.logger.println(message);
            this.logger.flush();
        }
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
        this.logger = initializeLogger();
    }

    private BufferedReader initializeReader() {
        return new BufferedReader(
            new InputStreamReader(this.server.getInputStream()));
    }

    private BufferedWriter initializeWriter() {
        return new BufferedWriter(
            new OutputStreamWriter(this.server.getOutputStream()));
    }

    private PrintStream initializeLogger() {
        long logNumber = System.currentTimeMillis();
        String logLocation = "/tmp/" + logNumber + "TS.log";
        File logFile = new File(logLocation);
        try {
            return new PrintStream(logFile);
        } catch (FileNotFoundException e) {
            return null; // uninitialized logger.
        }
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
}
