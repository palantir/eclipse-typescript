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
///<reference path='SyntaxHighlight.ts' />
///<reference path='AutoComplete.ts' />


/**
  * This module serves as a bridge between the Java eclipse plugin and the TypeScript Services that are available.
  * An example diagram of what files talk to what looks like this.
  * Java Eclipse <-> TypeScriptBridge.java <-> TypeScriptServiceBridge.ts <-> SyntaxHighlight.ts <-> classifier.ts
  * The modularness allows us to change the java-typescript protocall just by changing each side of the bridge WITHOUT changing anything else.
  * @author tyleradams
*/
module TypeScriptServiceBridge {

    export interface IRequest {
        command: string; //the command
        serviceType: string; //determines which service this message is for.
    }

    export interface IResult {
        resultValid: boolean;
        resultType: string; //this should be the same as the command for the corresponding IResult.
    }

    export interface IError extends IResult{
        errorMessage: string;
    }

    export interface IService {
        /*
           The Service  is a wrapper around the built in typescript services to provide the functionality we want and respond to the right commands.
        */
        getServiceType(): string;
        processRequest(request: IRequest) : IResult;
    }

    export class TSServiceBridge {
        private typeScriptServiceBridge: TSServiceBridge;
        //For every service you want to call, you have to provide a server for it here.
        private services: IService[] = [];

        constructor() {
            this.typeScriptServiceBridge = this; //needed for a stupid hack.
            this.populateservices();
        }

        public static invalidResult(error: string) {
            var result = { "resultValid" : false, "resultType" : "error", "errorMessage": error};
            return result;
        }

        private populateservices() { //This is how you add new Services.  Just push a new service onto this.services and it will be used.
            this.services.push(new SyntaxHighlight.Service());
            this.services.push(new AutoComplete.Service());
        }
        private invalidJSON() {
            return TSServiceBridge.invalidResult("invalid json");
        }
        private invalidCommand() {
            return TSServiceBridge.invalidResult("invalid command");
        }
        private processRequest(request) { //hands off the request to the appropriaate IService
            var serviceType = request.serviceType;
            var result: IResult;
            result = this.invalidCommand(); //default value of result is invalid.
            for(var i=0;i<this.services.length;i++) {
                if(serviceType === this.services[i].getServiceType()) {
                    result = this.services[i].processRequest(request);
                    break;
                }
            }
            return this.sendResult(result);

        }
        private sendResult(result: IResult) {
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
                return this.processRequest(request);
        }

        //   The one and ONLY external method
        public run() {
            process.stdin.resume();
            process.stdin.on('data', (request) => {this.processRawRequest(request); }); //callback every time a request is made!

        }

    }
}

var TSSB = new TypeScriptServiceBridge.TSServiceBridge();
TSSB.run();

/*
   SO, now this is becoming the final TS.
   For now I just want something that can read and write.
   I think I need to define a callback and just leave it.
*/


