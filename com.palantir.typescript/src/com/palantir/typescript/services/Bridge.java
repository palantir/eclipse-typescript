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

package com.palantir.typescript.services;

import static com.google.common.base.Preconditions.checkNotNull;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.List;

import org.eclipse.core.runtime.FileLocator;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.google.common.base.Charsets;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.palantir.typescript.IPreferenceConstants;
import com.palantir.typescript.TypeScriptPlugin;

/**
 * This handles all requests that need to be handled by TypeScript's built in language services.
 *
 * @author tyleradams
 */
public final class Bridge {

    private static final String LINE_SEPARATOR = System.getProperty("line.separator");
    private static final String ERROR_PREFIX = "ERROR: ";
    private static final String RESULT_PREFIX = "RESULT: ";

    /*
     * Enables using node-inspector for debugging the Eclipse plugin. Make sure you
     * `npm install -g node-inspector` first, and set NODE_DEBUG_PATH properly
     * (found by running `which node-debug`).
     */
    private static final boolean NODE_DEBUG = false;
    private static final String NODE_DEBUG_PATH = "/usr/local/bin/node-debug";
    private static final boolean NODE_DEBUG_BREAK_ON_START = false;
    // not final so it can be incremented and each process can have its own port.
    private static int NODE_DEBUG_PORT = 5858;

    private String endpointName;
    private Process nodeProcess;
    private BufferedReader nodeStdout;
    private PrintWriter nodeStdin;

    private final ObjectMapper mapper;

    public Bridge(String endpointName) {
        this.endpointName = endpointName;
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

    public synchronized <T> T call(Request request, JavaType resultType) {
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

    public void dispose() {
        this.nodeStdin.close();

        try {
            this.nodeStdout.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        this.nodeProcess = null;
    }

    private String processRequest(String requestJson) throws IOException {
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
            } else if (line.startsWith(ERROR_PREFIX)) {
                // remove prefix
                line = line.substring(ERROR_PREFIX.length(), line.length());
                // put newlines back
                line = line.replaceAll("\\\\n", LINE_SEPARATOR); // put newlines back
                // replace soft tabs with hardtabs to match Java's error stack trace.
                line = line.replaceAll("    ", "\t");

                throw new RuntimeException("The following request caused an error to be thrown:" + LINE_SEPARATOR
                        + requestJson + LINE_SEPARATOR
                        + line);
            } else if (line.startsWith(RESULT_PREFIX)) {
                resultJson = line.substring(RESULT_PREFIX.length());
            } else { // log statement
                System.out.println(this.endpointName + ": " + line);
            }
        } while (resultJson == null);

        return resultJson;
    }

    private void start() {
        String nodePath = TypeScriptPlugin.getDefault().getPreferenceStore().getString(IPreferenceConstants.GENERAL_NODE_PATH);
        if (Strings.isNullOrEmpty(nodePath)) {
            throw new IllegalStateException(
                "Node.js could not be found.  If it is installed to a location not on the PATH, please specify the location in the TypeScript preferences.");
        }

        // get the path to the bridge.js file
        File bundleFile;
        try {
            bundleFile = FileLocator.getBundleFile(TypeScriptPlugin.getDefault().getBundle());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        File bridgeFile = new File(bundleFile, "bin/bridge.js");
        String bridgePath = bridgeFile.getAbsolutePath();

        // construct the arguments
        ImmutableList.Builder<String> argsBuilder = ImmutableList.builder();
        argsBuilder.add(nodePath);
        if (NODE_DEBUG) {
            argsBuilder.add(NODE_DEBUG_PATH);
            if (!NODE_DEBUG_BREAK_ON_START) {
                argsBuilder.add("--no-debug-brk");
            }
            argsBuilder.add("--web-port=" + Integer.toString(NODE_DEBUG_PORT++));
            argsBuilder.add("--debug-port=" + Integer.toString(NODE_DEBUG_PORT++));
        }
        argsBuilder.add(bridgePath);

        // start the node process and create a reader/writer for its stdin/stdout
        List<String> args = argsBuilder.build();
        ProcessBuilder processBuilder = new ProcessBuilder(args.toArray(new String[args.size()]));
        try {
            this.nodeProcess = processBuilder.start();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        this.nodeStdout = new BufferedReader(new InputStreamReader(this.nodeProcess.getInputStream(), Charsets.UTF_8));
        this.nodeStdin = new PrintWriter(new OutputStreamWriter(this.nodeProcess.getOutputStream(), Charsets.UTF_8), true);

        // add a shutdown hook to destroy the node process in case its not properly disposed
        Runtime.getRuntime().addShutdownHook(new ShutdownHookThread());
    }

    private class ShutdownHookThread extends Thread {
        @Override
        public void run() {
            Process process = Bridge.this.nodeProcess;

            if (process != null) {
                process.destroy();
            }
        }
    }

}
