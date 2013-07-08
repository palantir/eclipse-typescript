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
///<reference path='manager.ts' />
///<reference path='../lib/typescript/src/services/classifier.ts' />
///<reference path='../lib/typescript/src/compiler/typescript.ts' />
///<reference path='../lib/typescript/src/services/classifier.ts' />
///<reference path='../lib/typescript/src/compiler/typescript.ts' />
///<reference path='../lib/typescript/src/compiler/io.ts'/>
///<reference path='../lib/typescript/src/compiler/typescript.ts'/>
///<reference path='../lib/typescript/src/services/languageService.ts' />
///<reference path='../lib/typescript/src/services/shims.ts' />
///<reference path='../lib/typescript/src/services/typescriptServices.ts' />
///<reference path='../lib/typescript/src/services/diagnosticServices.ts' />


/**
  * This module handles everything related to syntax highlighting.  SyntaxHighlight.Service is the actual IService and it also comes with its own set of requests and results.
  *
  * @author tyleradams
  */
module SyntaxHighlight {

    interface TokenWrapper {
        tokenID: number;
        offset: number;
        length: number;
    }

    interface ISyntaxHighlightRequest extends TypeScriptServiceBridge.IRequest {
        offset: number;
        documentText: string;
    }

    interface ISyntaxHighlightResult extends TypeScriptServiceBridge.IResult {
        tokenWrappers: TokenWrapper[];
    }


    /**
      * This class handles syntax highlighting typed requests.  Currently it only handles the command syntax highlight.
      */
    export class Service implements TypeScriptServiceBridge.IService {
        constructor() {
        }
        public getServiceType() : string {
            return "syntax highlight";
        }
        public processRequest(request: TypeScriptServiceBridge.IRequest) : TypeScriptServiceBridge.IResult {
            if(request.command === "syntax highlight") {
                return this.syntaxHighlight(<ISyntaxHighlightRequest> request);
            } else {
                return this.invalidCommand();
            }
        }
        /*
          Private methods
        */
        private syntaxHighlight(request: ISyntaxHighlightRequest) : ISyntaxHighlightResult {
            var result : ISyntaxHighlightResult;
            result = {"resultValid" : true, "resultType" : request.command, "tokenWrappers" : []}
            var token : TokenWrapper;
            var tokenArray : TokenWrapper[] = [];
            var newline = "\r\n";
            var classHost = new TypeScript.NullLogger();
            var classifier = new Services.Classifier(classHost);
            var contentsByLine = request.documentText.split(newline);
            var lineState = Services.EndOfLineState.Start
            var classResults : Services.ClassificationResult[] = [];
            var currentResult: Services.ClassificationResult;
            var currentEntry : Services.ClassificationInfo;
            var offset = request.offset;
            for(var i=0;i<contentsByLine.length;i++) {
                currentResult = classifier.getClassificationsForLine(contentsByLine[i],lineState);
                for(var j=0;j<currentResult.entries.length;j++) {
                    currentEntry = currentResult.entries[j];
                    token = {"tokenID" : currentEntry.classification, "offset" : offset, "length" : currentEntry.length};
                    tokenArray.push(token);
                    offset += currentEntry.length;
                    lineState = currentResult.finalLexState;
                }
                offset+=2; //Eclipse counts the \r\n even though this method doesn't.  Here we compensate for that discrepency.
            }
            result.tokenWrappers = tokenArray;
            return result;
        }
        private invalidCommand() : TypeScriptServiceBridge.IResult{
            return TypeScriptServiceBridge.TSServiceBridge.invalidResult("A Request was made to Syntax Highlight, but it was bad.");
        }
    }
}

/**
  * This module handles everything related to syntax highlighting.  SyntaxHighlight.Service is the actual IService and it also comes with its own set of requests and results.
  *
  * @author tyleradams
  */
module AutoComplete {

    interface IAddFileRequest extends TypeScriptServiceBridge.IRequest{
        fileName: string;
        userRoot: string;
    }
    interface IAddFileWithReferencesRequest extends IAddFileRequest {
    }
    interface ICheckFileRequest extends TypeScriptServiceBridge.IRequest{
        fileName: string;
    }
    interface IRemoveFileRequest extends TypeScriptServiceBridge.IRequest{
        fileName: string;
    }
    interface IUpdateFileRequest extends TypeScriptServiceBridge.IRequest{
        fileName: string;
        content: string;
    }

    interface IAutoCompleteRequest extends TypeScriptServiceBridge.IRequest {
        fileName: string;
        offset: number;
        isMemberCompletion: boolean;
    }




    interface ICheckFileResult extends TypeScriptServiceBridge.IResult {
        fileLoaded : boolean;
    }
    interface IAutoCompleteResult extends TypeScriptServiceBridge.IResult {
        autoCompletionInfo : AutoCompleteLibrary.IAutoCompletionInfo;
    }
    interface IDetailedAutoCompleteResult extends TypeScriptServiceBridge.IResult {
        autoCompletionInfo : AutoCompleteLibrary.IDetailedAutoCompletionInfo;
    }



    /**
      This is the AutoComplete Service class.  It provides methods which are necessary for mananging autocompletion.
    */
    export class Service implements TypeScriptServiceBridge.IService {
        private manager: AutoCompleteLibrary.Manager;
        constructor() {
            this.manager = new AutoCompleteLibrary.Manager();
        }
        public getServiceType() : string {
            return "Auto Complete";
        }
        public processRequest(request: TypeScriptServiceBridge.IRequest) : TypeScriptServiceBridge.IResult {
            if(request.command === "auto complete") {
                return this.autoComplete(<IAutoCompleteRequest> request);
            } else if (request.command === "add file") {
                return this.addFile(<IAddFileRequest> request);
            } else if (request.command === "add file with references") {
                return this.addFileWithReferences(<IAddFileWithReferencesRequest> request);
            } else if (request.command === "check file") {
                return this.checkFile(<ICheckFileRequest> request);
            } else if (request.command === "remove file") {
                return this.removeFile(<IRemoveFileRequest> request);
            } else if (request.command === "update file") {
                return this.updateFile(<IUpdateFileRequest> request);
            } else {
                return this.invalidCommand(request);
            }
        }
        private autoComplete(request: IAutoCompleteRequest) : IAutoCompleteResult {
            var file = request.fileName;
            var position = request.offset;
            var isMemberCompletion = request.isMemberCompletion;
            var rawResult : AutoCompleteLibrary.IDetailedAutoCompletionInfo = this.manager.getDetailedImplicitPrunedCompletionsAtPosition(file,position,isMemberCompletion);
            var result = {"resultType" : request.command, "resultValid" : true, autoCompletionInfo: rawResult};
            return result;
        }
        private addFile(request: IAddFileRequest) : TypeScriptServiceBridge.IResult {
            var file = request.fileName;
            var root = request.userRoot;
            var rawResult : boolean = this.manager.addFile(file,root);
            var result = {"resultType" : request.command, "resultValid" : rawResult};
            if(result.resultValid === false) {
                var eResult : TypeScriptServiceBridge.IError = {"resultType" : request.command, "resultValid" : rawResult, "errorMessage" : "File cannot be added (probably because it has already been added)"};
                return eResult;
            }
            return result;
        }
        private addFileWithReferences(request: IAddFileWithReferencesRequest) : TypeScriptServiceBridge.IResult {
            var fileName = request.fileName;
            var root = request.userRoot;
            this.manager.updateFile(fileName,root);
            var filePath = request.userRoot + request.fileName;
            var rawSource : string = IO.readFile(filePath).contents();
            var fileSource: TypeScript.IScriptSnapshot = TypeScript.ScriptSnapshot.fromString(rawSource);
            var referencedFilesRaw = TypeScript.getReferencedFiles(fileName,fileSource);
            var numOfReferences : number = referencedFilesRaw.length;
            var referencedFile: string;
            var localRoot : string;
            for(var i=0;i<numOfReferences;i++) {
                    referencedFile = referencedFilesRaw[i].path;
                    if(referencedFile.indexOf('/') === 0) { //absolute path
                        localRoot = "";
                    } else { //local path
                        localRoot = root;
                    }

                    this.manager.updateFile(referencedFile,localRoot);
            }
            var result = {"resultValid" : true, "resultType" : request.command};
            return result;
        }
        private checkFile(request: ICheckFileRequest) : ICheckFileResult {
            var file : string = request.fileName;
            var fileLoaded: boolean = this.manager.checkFile(file);
            var result = {"resultType" : request.command, "resultValid" : true, "fileLoaded" : fileLoaded};
            return result;
        }
        private updateFile(request: IUpdateFileRequest) : TypeScriptServiceBridge.IResult {
            var file = request.fileName;
            var content = request.content;
            var rawResult : boolean = this.manager.updateScript(file,content);
            var result = {"resultType" : request.command, "resultValid" : rawResult};
            return result;
        }
        private removeFile(request: IRemoveFileRequest) : TypeScriptServiceBridge.IResult {
            var file = request.fileName;
            var rawResult : boolean = this.manager.removeFile(file);
            var result = {"resultType" : request.command, "resultValid" : rawResult};
            if(result.resultValid === false) {
                var eResult : TypeScriptServiceBridge.IError = {"resultType" : request.command, "resultValid" : rawResult, "errorMessage" : "File cannot be removed (probably because it already has been removed or was never added)"};
                return eResult;
            }
            return result;
        }
        private invalidCommand(request: TypeScriptServiceBridge.IRequest) : TypeScriptServiceBridge.IResult{
            return TypeScriptServiceBridge.TSServiceBridge.invalidResult("It turns out the command: \"" + request.command + "\" is a Bad Auto Complete Request"); //TODO: Figure out a better error message.
        }
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
            var myProcess: any = process; // workaround for multiple definitions of the process global variable

            myProcess.stdin.resume();
            myProcess.stdin.on('data', (request) => {this.processRawRequest(request); }); //callback every time a request is made!
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


