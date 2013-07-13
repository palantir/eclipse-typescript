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

///<reference path='../typescript/src/compiler/io.ts'/>
///<reference path='../typescript/src/services/classifier.ts' />
///<reference path='../typescript/src/services/languageService.ts' />

///<reference path='map.ts' />

/**
  * This module provides an interface between stdin, stdout and many of the TypeScript services.
  *
  * @author tyleradams
  */
module Bridge {

    function readFileContents(filePath: string): string {
        return IO.readFile(filePath).contents();
    }

    interface AutoCompletionInfo {
        entries: Services.CompletionEntry[];
    }

    interface DetailedAutoCompletionInfo { // correponds to the Java Class of the same name.
        pruningPrefix: string;
        entries: Services.CompletionEntryDetails[];
    }

   class ScriptSnapshot implements TypeScript.IScriptSnapshot {

        private version: number;
        private Open: boolean;
        private content: string;

        constructor(private file: string) {
            this.version = 0;
            this.Open = true;
            this.content = readFileContents(file);
        }

        public updateContent(content: string) {
            this.content = content;
            this.version++;
            return true;
        }

        public getVersion(): number {
            return this.version;
        }

        public isOpen(): boolean {
            return this.Open;
        }

        public setOpen() {
            this.Open = true;
        }

        public setClosed() {
            this.Open = false;
        }

        public getText(start: number, end: number): string {
            return this.content.substring(start, end);
        }

        public getLength(): number {
            return this.content.length;
        }

        public getLineStartPositions(): number[] {
            return TypeScript.TextUtilities.parseLineStarts(TypeScript.SimpleText.fromString(this.content));
        }

        public getTextChangeRangeSinceVersion(version: number): TypeScript.TextChangeRange {
            if (this.version === version) {
                return TypeScript.TextChangeRange.unchanged;
            } else {
                return null;
            }
        }
    }

    class LanguageServicesDiagnostics implements Services.ILanguageServicesDiagnostics {

        public log(message: string): void {

        }

    }

    class LanguageServiceHostService {

        private languageServiceHost: LanguageServiceHost;

        constructor() {
            this.languageServiceHost = new LanguageServiceHost();
        }

        public loadFiles(files: string[]): boolean {
            for (var i = 0; i < files.length; i++) {
                this.languageServiceHost.loadFile(files[i]);
            }
            return true;
        }

        public removeFiles(files: string[]): boolean {
            for (var i = 0; i < files.length; i++) {
                this.languageServiceHost.removeFile(files[i]);
            }
            return true;
        }

        public updateFile(file: string, content: string): boolean {
            return this.languageServiceHost.updateFile(file, content);
        }

        public updateSavedFile(file: string): boolean {
            return this.languageServiceHost.updateSavedFile(file);
        }

        public getCompletionsAtPosition(file: string, position: number, contents: string): DetailedAutoCompletionInfo {
            return this.languageServiceHost.getCompletionsAtPosition(file, position, contents);
        }

    }

    class LanguageServiceHost implements Services.ILanguageServiceHost {

        private languageService: Services.LanguageService;
        private compilationSettings: TypeScript.CompilationSettings;
        private fileMap: Map<string, ScriptSnapshot>;
        private diagnostics: Services.ILanguageServicesDiagnostics;

        constructor() {
            this.languageService = new Services.LanguageService(this);
            this.compilationSettings = new TypeScript.CompilationSettings();
            this.fileMap = new Map();
            this.diagnostics = new LanguageServicesDiagnostics();
        }

        public loadFile(file: string): boolean {
            this.fileMap.set(file, new ScriptSnapshot(file));
            return true;
        }

        public removeFile(file: string): boolean {
            return this.fileMap.delete(file);
        }

        public updateFile(file: string, content: string): boolean {
            return this.fileMap.get(file).updateContent(content);
        }

        public updateSavedFile(file: string): boolean {
            return this.updateFile(file, readFileContents(file));
        }

        public getCompletionsAtPosition(file: string, position: number, contents: string): DetailedAutoCompletionInfo {
            this.updateFile(file, contents);
            return this.getDetailedImplicitlyPrunedCompletionsAtPosition(file, position);
        }

        public getCompilationSettings(): TypeScript.CompilationSettings {
            return this.compilationSettings;
        }

        public getScriptFileNames(): string[] {
            return <string[]> this.fileMap.keys();
        }

        public getScriptVersion(file: string): number {
            return this.fileMap.get(file).getVersion();
        }

        public getScriptIsOpen(file: string): boolean {
            return this.fileMap.get(file).isOpen();
        }

        public getScriptSnapshot(file: string): TypeScript.IScriptSnapshot {
            return this.fileMap.get(file);
        }

        public getDiagnosticsObject(): Services.ILanguageServicesDiagnostics {
            return this.diagnostics;
        }

        public information(): boolean {
            return false;
        }

        public debug(): boolean {
            return true;
        }

        public warning(): boolean {
            return true;
        }

        public error(): boolean {
            return true;
        }

        public fatal(): boolean {
            return true;
        }

        public log(s: string): void {
        }

        private validPosition(fileName: string, position: number): boolean {
            if (position === 0) {
                return false;
            }

            var start: number = position - 2;
            var end: number = position;
            var snapshot: string = this.getScriptSnapshot(fileName).getText(start, end);

            if (snapshot[1] === ".") {
                if (!this.validMethodChar(snapshot[0])) {
                    return false;
                } else {
                    return true;
                }
            }

            if (!this.validMethodChar(snapshot[1])) {
                return false;
            }

            return true;
        }

        private getPrefix(fileName: string, position: number): string {
            var start: number = 0;
            var end: number = position;
            var snapshot: string = this.getScriptSnapshot(fileName).getText(start, end); // HACKHACK: gets file up to this point and works backwards.  Performance probably sucks.

            for (var index = snapshot.length - 1; this.validMethodChar(snapshot.charAt(index)); index--);

            if (snapshot.charAt(index) === "." || snapshot.charAt(index) === " " || snapshot.charAt(index) === "\n") {
                index++;
                return snapshot.substring(index, snapshot.length);
            } else {
                return "";
            }
        }

        private validMethodChar(orig_c: string): boolean { // is the character a valid character for a method.
            var c: string = orig_c.toUpperCase();

            if ("A" <= c && c <= "Z") { // letters
                return true;
            } else if (c === "(" || c === ")") { // parens
                return true;
            } else if ("0" <= c && c <= "9") { // numbers
                return true;
            } else if (c === "$" || c === "_") { //$ and _
                return true;
            } else {
                return false;
            }
        }

        private getDetailedImplicitlyPrunedCompletionsAtPosition(fileName: string, position: number): DetailedAutoCompletionInfo {
            if (this.validPosition(fileName, position)) {
                var pruningPrefix: string = this.getPrefix(fileName, position);
                return this.getDetailedExplicitPrunedCompletionsAtPosition(fileName, position, pruningPrefix);
            } else {
                return {"pruningPrefix": "", "entries": []};
            }
        }

        private getDetailedExplicitPrunedCompletionsAtPosition(fileName: string, position: number, pruningPrefix: string): DetailedAutoCompletionInfo {
            var abbreviatedCompletionInfo: AutoCompletionInfo  = this.getExplicitPrunedCompletionsAtPosition(fileName, position, pruningPrefix);

            if (abbreviatedCompletionInfo.entries === null) {
                return {"pruningPrefix": "", "entries": []};
            }

            var abbreviatedEntry: Services.CompletionEntry;
            var detailedEntry: Services.CompletionEntryDetails;
            var detailedEntries: Services.CompletionEntryDetails[] = [];

            for (var i = 0; i < abbreviatedCompletionInfo.entries.length; i++) {
                abbreviatedEntry = abbreviatedCompletionInfo.entries[i];
                detailedEntry = this.languageService.getCompletionEntryDetails(fileName, position, abbreviatedEntry.name);
                detailedEntries.push(detailedEntry);
            }

            return {"pruningPrefix": pruningPrefix, "entries": detailedEntries};
        }

        private getExplicitPrunedCompletionsAtPosition(fileName: string, position: number, pruningPrefix: string): AutoCompletionInfo {
            var isMemberCompletion: boolean = false;
            var rawCompletionInfo: Services.CompletionInfo = this.languageService.getCompletionsAtPosition(fileName, position, isMemberCompletion);

            if (rawCompletionInfo === null) {
                return {"entries": []};
            }

            var prunedEntries: Services.CompletionEntry[] = [];
            var rawEntries: Services.CompletionEntry[] = rawCompletionInfo.entries;

            for (var i = 0; i < rawEntries.length; i++) {
                if (this.prefixMatch(pruningPrefix, rawEntries[i].name)) {
                        prunedEntries.push(rawEntries[i]);
                }
            }

            return {"entries": prunedEntries};
        }

        private prefixMatch(_prefix: string, str: string): boolean {
            return str.indexOf(_prefix) === 0;
        }
    }

    class ClassifierService {

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

    interface ClassificationResults {
        results: Services.ClassificationResult[];
    }

    /**
     * All incoming objects must be IRequest objects.
     */
    interface IRequest {
        command: string; // the command
        service: string; // determines which service this message is for.
        args: any[]; // arguments
    }

    export class TSServiceBridge {

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

        private invalidJSON() {
            return TSServiceBridge.invalidResult("invalid json");
        }

        private invalidService() {
            return TSServiceBridge.invalidResult("invalid command");
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

var TSSB: Bridge.TSServiceBridge = new Bridge.TSServiceBridge();
TSSB.run();
