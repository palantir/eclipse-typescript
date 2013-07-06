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

/// <reference path='../lib/autocomplete/manager.ts' />
/// <reference path='../lib/typescript/src/services/classifier.ts' />
/// <reference path='../lib/typescript/src/compiler/typescript.ts' />
/// <reference path='TypeScriptServiceBridge.ts' />

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
