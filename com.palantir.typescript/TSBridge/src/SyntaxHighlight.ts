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

/// <reference path='../lib/typescript/src/services/classifier.ts' />
/// <reference path='../lib/typescript/src/compiler/typescript.ts' />
/// <reference path='TypeScriptServiceBridge.ts' />

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

