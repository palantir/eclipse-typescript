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

/// <reference path="classifierEndpoint.ts" />
/// <reference path="languageEndpoint.ts" />
/// <reference path="workspaceLanguageEndpoint.ts" />

/**
  * This module provides an interface between stdin, stdout and many of the TypeScript services.
  *
  * @author tyleradams
  */
module Bridge {

    export class Main {

        private endpoints: { [endpoint: string]: any };

        constructor() {
            this.endpoints = Object.create(null);
            this.endpoints["classifier"] = new ClassifierEndpoint();
            this.endpoints["language"] = new LanguageEndpoint();
            this.endpoints["workspaceLanguage"] = new WorkspaceLanguageEndpoint();
        }

        public run() {
            var myProcess: any = process;
            var readline = require("readline");
            var rl = readline.createInterface(myProcess.stdin, myProcess.stdout);

            // process incoming requests from stdin
            rl.on("line", (line: string) => {
                this.processRequest(line);
            });

            // exit when stdin is closed
            rl.on("close", () => {
                myProcess.exit(0);
            });
        }

        private processRequest(requestJson: string) {
            try {
                var request: Request = JSON.parse(requestJson);

                // invoke the endpoint method with the supplied arguments
                var endpoint = this.endpoints[request.endpoint];
                var method = endpoint[request.method];
                var result = method.apply(endpoint, request.arguments);

                // convert undefined to null (its basically the Java equivalent of void)
                if (result === undefined) {
                    result = null;
                }

                // convert the result to JSON and write it to stdout
                var resultJson = JSON.stringify(result);
                console.log("RESULT: " + resultJson);
            } catch (e) {
                var error: string;

                if (e.stack != null) {
                    error = e.stack;
                } else if (e.message != null) {
                    error = e.message;
                } else {
                    error = "Error: No stack trace or error message was provided.";
                }

                console.log("ERROR: " + error.replace(/\n/g, "\\n"));
            }
        }
    }

    interface Request {
        endpoint: string;
        method: string;
        arguments: any[];
    }
}

var main = new Bridge.Main();
main.run();
