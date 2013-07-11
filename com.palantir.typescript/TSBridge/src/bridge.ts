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

///<reference path='map.ts' />
///<reference path='../lib/typescript/src/services/classifier.ts' />
///<reference path='../lib/typescript/src/services/languageService.ts' />


module BridgeService {

    export class ClassifierService implements TypeScriptServiceBridge.IService {

        private Classifier: Classifier;

        constructor() {
            this.Classifier = new Classifier();
        }

        public getServiceName(): string {
            return "Classifier";
        }

        public getService() {
            return this.Classifier;
        }
    }

    export class Classifier {

        private classifier: Services.Classifier;

        constructor() {
            this.classifier = new Services.Classifier(new TypeScript.NullLogger());
        }

        public getClassificationsForLines(lines: string[], lexState: Services.EndOfLineState) {
            var line: string;
            var localLexState: Services.EndOfLineState = lexState;
            var classificationResult: Services.ClassificationResult;
            var results: Services.ClassificationResult[] = [];

            for (var i = 0; i < lines.length; i++) {
                line = lines[i];
                classificationResult = this.classifier.getClassificationsForLine(line, localLexState);
                results.push(classificationResult);
                localLexState = classificationResult.finalLexState;
            }
            var result: ClassificationResults = {"results" : results}; //ClassificationResults object.
            return result;
        }
    }

    export interface ClassificationResults {
        results: Services.ClassificationResult[];
    }
}
/**
  * This module serves as a bridge between the Java eclipse plugin and the TypeScript Services that are available.
  * An example diagram of what files talk to what looks like this.
  * Java Eclipse <-> TypeScriptBridge.java <-> TypeScriptServiceBridge.ts <-> SyntaxHighlight.ts <-> classifier.ts
  * The modularness allows us to change the java-typescript protocall just by changing each side of the bridge WITHOUT changing anything else.
  *
  * @author tyleradams
  */
module TypeScriptServiceBridge {

    /**
     * All incoming objects must be IRequest objects.
     */
    export interface IRequest {
        command: string; // the command
        service: string; // determines which service this message is for.
        args: any[]; // arguments
    }

    /**
     * All Services must implement IService.
     */
    export interface IService {
        getServiceName(): string;
        getService(): any;
    }

    export class TSServiceBridge {

        private services: IService[] = [];

        constructor() {
            this.populateservices();
        }

        public static invalidResult(error: string) {
            var result = {"error" : error};
            return result;
        }

        private populateservices() { // Add the services here.
            this.services.push(new BridgeService.ClassifierService());
        }

        private invalidJSON() {
            return TSServiceBridge.invalidResult("invalid json");
        }

        private invalidService() {
            return TSServiceBridge.invalidResult("invalid command");
        }

        private preProcessRequest(request) { // hands off the request to the appropriate IService
            var serviceName = request.service;
            var result;
            result = this.invalidService(); // default value of result is invalid.
            for (var i=0; i<this.services.length; i++) {
                if (serviceName === this.services[i].getServiceName()) {
                    result = this.processRequest(request,this.services[i].getService());
                    break;
                }
            }
            return this.sendResult(result);
        }

        private processRequest(request: IRequest, service: any) {
            var command: string = request.command;
            var args: any[] = request.args;
            var methodInstance: any = service[command];
            var rawResult: any = methodInstance.apply(service,args);
            var resultValid: boolean = true;
            var resultType: string = command;
            return rawResult;
        }

        private sendResult(result) {
            var rawResult = JSON.stringify(result);
            console.log(rawResult);
            return;
        }

        private processRawRequest(rawRequest: string) {
            var request;
            var result;
            try {
                request = JSON.parse(rawRequest);
            } catch (e) {
                result = this.invalidJSON();
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

var TSSB = new TypeScriptServiceBridge.TSServiceBridge();
TSSB.run();
