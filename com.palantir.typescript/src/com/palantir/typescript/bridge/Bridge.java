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

import static com.google.common.base.Preconditions.checkNotNull;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.google.common.base.Charsets;

/**
 * This handles all requests that need to be handled by TypeScript's built in language services.
 *
 * @author tyleradams
 */
public final class Bridge {

    private static final String LINE_SEPARATOR = System.getProperty("line.separator");

    private Process nodeProcess;
    private BufferedReader nodeStdout;
    private PrintWriter nodeStdin;

    private final ObjectMapper mapper;

    public Bridge() {
        this.mapper = new ObjectMapper();

        // start the node process
        this.start();
    }

    public <T> T call(Request request, Class<T> resultType) {
        checkNotNull(request);
        checkNotNull(resultType);

        JavaType type = TypeFactory.defaultInstance().uncheckedSimpleType(resultType);

        return this.call(request, type);
    }

    public <T> T call(Request request, JavaType resultType) {
        checkNotNull(request);
        checkNotNull(resultType);

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

    private synchronized String processRequest(String requestJson) throws IOException {
        checkNotNull(requestJson);

        // write the request JSON to the bridge's stdin
        this.nodeStdin.println(requestJson);

        // read the response JSON from the bridge's stdout
        String resultJson = null;
        do {
            String line = this.nodeStdout.readLine();

            // process errors and logger statements
            if (line == null) {
                throw new IllegalStateException("The node process has crashed.");
            } else if (line.startsWith("ERROR: ")) {
                line = line.substring(7, line.length()); // remove "ERROR: "
                line = line.replaceAll("\\\\n", LINE_SEPARATOR); // put newlines back
                line = line.replaceAll("    ", "\t"); // replace spaces with tabs (to match Java stack traces)

                throw new RuntimeException("The following request caused an error to be thrown:" + LINE_SEPARATOR
                        + requestJson + LINE_SEPARATOR
                        + line);
            } else if (line.startsWith("RESULT: ")) {
                resultJson = line.substring(8);
            } else { // log statement
                System.out.println(line);
            }
        } while (resultJson == null);

        return resultJson;
    }

    private void start() {
        // get the path to node
        File nodeFile = new File("/usr/local/bin/node");
        String nodePath = nodeFile.getAbsolutePath();
        if (!nodeFile.exists()) {
            throw new RuntimeException("Could not find node at " + nodePath);
        }

        // get the path to the bridge.js file
        String pluginRoot = this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
        File bridgeFile = new File(pluginRoot, "bin/bridge.js");
        String bridgePath = bridgeFile.getAbsolutePath();

        // start the node process and create a reader/writer for its stdin/stdout
        ProcessBuilder processBuilder = new ProcessBuilder(nodePath, bridgePath);
        try {
            this.nodeProcess = processBuilder.start();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        this.nodeStdout = new BufferedReader(new InputStreamReader(this.nodeProcess.getInputStream(), Charsets.UTF_8));
        this.nodeStdin = new PrintWriter(new OutputStreamWriter(this.nodeProcess.getOutputStream(), Charsets.UTF_8), true);
    }

    public void dispose() {
        this.nodeStdin.close();

        try {
            this.nodeStdout.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
