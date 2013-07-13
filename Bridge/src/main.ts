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

    /**
     * All incoming objects must be IRequest objects.
     */
    interface IRequest {
        command: string; // the command
        service: string; // determines which service this message is for.
        args: any[]; // arguments
    }

    export class Main {

        private services: Map<string, any>;

        constructor() {
            this.populateservices();
        }

        public static invalidResult(error: string) {
            var result: any = {"error" : error};
            return result;
        }

        private populateservices() { // Add the services here.
            this.services = new Map();
            this.services.set("classifier", new ClassifierService());
            this.services.set("language service", new LanguageServiceHostService());
        }

        private invalidJSON(message: string) {
            return Main.invalidResult("invalid json: " + message);
        }

        private invalidService() {
            return Main.invalidResult("invalid command");
        }

        private preProcessRequest(request: IRequest) { // hands off the request to the appropriate IService
            var service: string = request.service;
            var result;
            result = this.processRequest(request, this.services.get(service));
            return this.sendResult(result);
        }

        private processRequest(request: IRequest, service: any) {
            var command: string = request.command;
            var args: any[] = request.args;
            var methodInstance: any = service[command];
            return methodInstance.apply(service, args);
        }

        private sendResult(result) {
            var rawResult: string = JSON.stringify(result);
            console.log(rawResult);
        }

        private processRawRequest(rawRequest: string) {
            var request;
            var result;
            try {
                request = JSON.parse(rawRequest);
            } catch (e) {
                result = this.invalidJSON(e.message);
                return this.sendResult(result);
            }
            return this.preProcessRequest(request);
        }

        public run() {
            var myProcess: any = process; // workaround for multiple definitions of the process global variable

            myProcess.stdin.resume();
            myProcess.stdin.on('data', (request) => {this.processRawRequest(request); });
        }
    }
}

var main = new Bridge.Main();
main.run();
