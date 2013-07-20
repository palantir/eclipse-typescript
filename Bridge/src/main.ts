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

///<reference path='classifier.ts' />
///<reference path='languageService.ts' />
///<reference path='map.ts' />

/**
  * This module provides an interface between stdin, stdout and many of the TypeScript services.
  *
  * @author tyleradams
  */
module Bridge {

    export class Main {

        private services: Map<string, any>;

        constructor() {
            this.services = new Map();
            this.services.set("classifier", new ClassifierService());
            this.services.set("language", new LanguageService());
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
                var request = JSON.parse(requestJson);

                // invoke the service method with the supplied arguments
                var service = this.services.get(request.service);
                var method = service[request.command];
                var result = method.apply(service, request.args);

                // convert undefined to null (its basically the Java equivalent of void)
                if (result === undefined) {
                    result = null;
                }

                // convert the result to JSON and write it to stdout
                var resultJson = JSON.stringify(result);
                console.log(resultJson);
            } catch (e) {
                console.log("ERROR: " + e.stack.replace(/\n/g, "\\n"));
            }
        }
    }
}

var main = new Bridge.Main();
main.run();
