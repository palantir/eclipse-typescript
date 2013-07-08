//
// Copyright (c) Microsoft Corporation.  All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
/*
* This code was forked from src/harness/harness.ts file from TypeScript v0.9
* src/harness/harness.ts was a testing module that provided an example for using the
* LanguageService class and therefore unlikely to remain supported.
* I forked the TypeScriptLS class (below called manager) and any implementations
* of interfaces that it used so as to be able to leverage the LanguageService class.
*/
///<reference path='map.ts'/>
///<reference path='../lib/typescript/src/compiler/io.ts'/>
///<reference path='../lib/typescript/src/compiler/typescript.ts'/>
///<reference path='../lib/typescript/src/services/languageService.ts' />
///<reference path='../lib/typescript/src/services/shims.ts' />
///<reference path='../lib/typescript/src/services/typescriptServices.ts' />
///<reference path='../lib/typescript/src/services/diagnosticServices.ts' />
module AutoCompleteLibrary {
    export interface IDetailedAutoCompletionInfo {
        pruningPrefix: string;
        entries: Services.CompletionEntryDetails[];
    }

    export interface IAutoCompletionInfo { //extends CompletionInfo but interfaces can't extends classes.
        pruningPrefix: string;
        entries: Services.CompletionEntry[];
    }

    export class Manager {
        private languageServiceShim: Services.ILanguageServiceShim = null;
        private languageService: Services.ILanguageService = null;

        private fileNameToScript: DataStructures.Map = new DataStructures.Map();

        constructor() {
            this.createLS();
        }

        //////////////////////////////////////////////////////////////////////
        //  Raw Language Services as per ILanguageService.
        //  These are all just straight up feeds into the languageService object.
        public refresh(): void {
            return this.languageService.refresh();
        }

        public getCompletionsAtPosition(fileName: string, position: number, isMemberCompletion: boolean): Services.CompletionInfo{
            return this.languageService.getCompletionsAtPosition(fileName,position,isMemberCompletion);
        }

        //////////////////////////////////////////////////////////////////////
        //  Some helper methods wrapping around the completions to handle prefix filtering.
        public getImplicitPrunedCompletionsAtPosition(fileName: string, position: number, isMemberCompletion: boolean): IAutoCompletionInfo {
            var pruningPrefix: string = this.getPrefix(fileName,position);
            return this.getExplicitPrunedCompletionsAtPosition(fileName,position,pruningPrefix,isMemberCompletion);
        }

        private getPrefix(fileName: string, position: number) {
            var start: number= 0; // just get the entire file up to this point.  PERFORMANCE may suffer but it works in all cases and is simple.
            var end: number= position;
            var snapShot = this.getScriptSnapshot(fileName).getText(start,end);
            var index: number;
            for (index = snapShot.length-1; this.validMethodChar(snapShot.charAt(index)); index--);
            if (snapShot.charAt(index) === '.' || snapShot.charAt(index) === ' ') {
                index++;
                var stringToRight: string = snapShot.substring(index,snapShot.length);
                return stringToRight;
            } else {
                return "";
            }
        }

        private validMethodChar(orig_c) { // is the character a valid character for a method.
            var c = orig_c.toUpperCase();
            if ("A" <= c && c <= "Z") { // letters
                return true;
            } else if (c === "(" || c === ")") { // parens
                return true;
            } else if ("0" <= c && c <= "9") { // numbers
                return true;
            } else if (c === "$" || c === "_") { // Special characters
                return true;
            } else {
                return false;
            }
        }

        public getExplicitPrunedCompletionsAtPosition(fileName: string, position: number, pruningPrefix: string, isMemberCompletion: boolean): IAutoCompletionInfo{
            var rawCompletionInfo: Services.CompletionInfo = this.getCompletionsAtPosition(fileName,position,isMemberCompletion);
            if (rawCompletionInfo === null) {
                var autoCompletionInfo: IAutoCompletionInfo = {"pruningPrefix": pruningPrefix, "entries": null};
                return autoCompletionInfo;
            }
            var prunedEntries: Services.CompletionEntry[] = [];
            var rawEntries: Services.CompletionEntry[] = rawCompletionInfo.entries;
            for (var i=0;i<rawEntries.length;i++) {
                if (this.prefixMatch(pruningPrefix,rawEntries[i].name)) {
                        prunedEntries.push(rawEntries[i]);
                }
            }

            var autoCompletionInfo: IAutoCompletionInfo = {"pruningPrefix": pruningPrefix, "entries": prunedEntries};
            return autoCompletionInfo;
        }

        private prefixMatch(_prefix: string, str: string) {
            var index: number = str.indexOf(_prefix);
            var matches: boolean = (index === 0);
            return matches;
        }

        public getDetailedImplicitPrunedCompletionsAtPosition(fileName: string, position: number, isMemberCompletion: boolean): IDetailedAutoCompletionInfo {
            var pruningPrefix: string = this.getPrefix(fileName,position);
            return this.getDetailedExplicitPrunedCompletionsAtPosition(fileName,position,pruningPrefix,isMemberCompletion);
        }

        public getDetailedExplicitPrunedCompletionsAtPosition(fileName: string, position: number, pruningPrefix: string, isMemberCompletion: boolean): IDetailedAutoCompletionInfo {
            var abbreviatedCompletionInfo: IAutoCompletionInfo = this.getExplicitPrunedCompletionsAtPosition(fileName, position, pruningPrefix, isMemberCompletion);
            if (abbreviatedCompletionInfo.entries === null) {
                return null;
            }
            var abbreviatedEntry: Services.CompletionEntry;

            var detailedEntry: Services.CompletionEntryDetails;
            var detailedEntries: Services.CompletionEntryDetails[] = [];

            for (var i=0;i<abbreviatedCompletionInfo.entries.length;i++) {
                abbreviatedEntry = abbreviatedCompletionInfo.entries[i];
                detailedEntry = this.getCompletionEntryDetails(fileName,position,abbreviatedEntry.name);
                detailedEntries.push(detailedEntry);
            }
            var detailedCompletionInfo: IDetailedAutoCompletionInfo = {"pruningPrefix": pruningPrefix, "entries": detailedEntries};
            return detailedCompletionInfo;
        }
        ///////End of helper methods.

        public getCompletionEntryDetails(fileName: string, position: number, entryName: string): Services.CompletionEntryDetails {
            return this.languageService.getCompletionEntryDetails(fileName,position,entryName);
        }

        public getTypeAtPosition(fileName: string, position: number): Services.TypeInfo {
            return this.languageService.getTypeAtPosition(fileName,position);
        }

        public getBreakpointStatementAtPosition(fileName: string, position: number): Services.SpanInfo {
            return this.languageService.getBreakpointStatementAtPosition(fileName,position);
        }

        public getSignatureAtPosition(fileName: string, position: number): Services.SignatureInfo {
            return this.languageService.getSignatureAtPosition(fileName,position);
        }

        public getDefinitionAtPosition(fileName: string, position: number): Services.DefinitionInfo[] {
            return this.languageService.getDefinitionAtPosition(fileName,position);
        }

        public getReferencesAtPosition(fileName: string, position: number): Services.ReferenceEntry[] {
            return this.languageService.getReferencesAtPosition(fileName,position);
        }

        public getOccurrencesAtPosition(fileName: string, position: number): Services.ReferenceEntry[] {
            return this.languageService.getOccurrencesAtPosition(fileName,position);
        }

        public getImplementorsAtPosition(fileName: string, position: number): Services.ReferenceEntry[] {
            return this.languageService.getImplementorsAtPosition(fileName,position);
        }

        public getNavigateToItems(searchValue: string): Services.NavigateToItem[] {
            return this.languageService.getNavigateToItems(searchValue);
        }

        public getScriptLexicalStructure(fileName: string): Services.NavigateToItem[] {
            return this.languageService.getScriptLexicalStructure(fileName);
        }

        public getOutliningRegions(fileName: string): TypeScript.TextSpan[] {
            return this.languageService.getOutliningRegions(fileName);
        }

        public getBraceMatchingAtPosition(fileName: string, position: number): TypeScript.TextSpan[] {
            return this.languageService.getBraceMatchingAtPosition(fileName,position);
        }

        public getIndentationAtPosition(fileName: string, position: number, options: Services.EditorOptions): number {
            return this.languageService.getIndentationAtPosition(fileName,position,options);
        }

        public getFormattingEditsForRange(fileName: string, minChar: number, limChar: number, options: Services.FormatCodeOptions): Services.TextEdit[] {
            return this.languageService.getFormattingEditsForRange(fileName,minChar,limChar,options);
        }

        public getFormattingEditsForDocument(fileName: string, minChar: number, limChar: number, options: Services.FormatCodeOptions): Services.TextEdit[] {
            return this.languageService.getFormattingEditsForDocument(fileName,minChar,limChar,options);
        }

        public getFormattingEditsOnPaste(fileName: string, minChar: number, limChar: number, options: Services.FormatCodeOptions): Services.TextEdit[] {
            return this.languageService.getFormattingEditsOnPaste(fileName,minChar,limChar,options);
        }

        public getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: Services.FormatCodeOptions): Services.TextEdit[] {
            return this.languageService.getFormattingEditsAfterKeystroke(fileName,position,key,options);
        }

        public getEmitOutput(fileName: string): Services.EmitOutput {
            return this.languageService.getEmitOutput(fileName);
        }

        public getSyntaxTree(fileName: string): TypeScript.SyntaxTree {
            return this.languageService.getSyntaxTree(fileName);
        }
        //////////////////////////////////////////////////////////////////////
        //  File managing
        //

        public addFile(fileName: string, rootPath: string): boolean {
            var filePath = rootPath + fileName;
            var code = this.readFileContents(filePath);
            return this.addScript(fileName, code);
        }

        public removeFile(fileName: string): boolean {
            var result = this.fileNameToScript.delete(fileName);
            return result;
        }

        public updateFile(fileName: string, rootPath: string): boolean {
            var filePath = rootPath + fileName;
            var code = this.readFileContents(filePath);
            return this.updateScript(fileName, code);
        }

        public checkFile(fileName: string): boolean {
            var fileContents = this.fileNameToScript.get(fileName);
            var fileLoaded: boolean = (fileContents !== null);
            return fileLoaded;
        }

        private getScriptInfo(fileName: string): ScriptInfo {
            return this.fileNameToScript.get(fileName);
        }

        public addScript(fileName: string, content: string): boolean {
            var script = new ScriptInfo(fileName, content);
            this.fileNameToScript.set(fileName, script);
            return true;
        }

        public updateScript(fileName: string, content: string): boolean { //better aptly named update or add.
            var script = this.getScriptInfo(fileName);
            if (script !== undefined) {
                script.updateContent(content);
                return true;
            }

            return this.addScript(fileName, content);
        }

        //////////////////////////////////////////////////////////////////////
        // ILogger implementation
        //
        public information(): boolean { return false; }
        public debug(): boolean { return true; }
        public warning(): boolean { return true; }
        public error(): boolean { return true; }
        public fatal(): boolean { return true; }

        public log(s: string): void {
            // For debugging...
            //IO.printLine("TypeScriptLS:" + s);
        }

        //////////////////////////////////////////////////////////////////////
        // ILanguageServiceShimHost implementation
        //

        public getCompilationSettings(): string/*json for Tools.CompilationSettings*/ {
            return ""; // i.e. default settings
        }

        public getScriptFileNames(): string {
            return JSON.stringify(this.fileNameToScript.keys());
        }

        public getScriptSnapshot(fileName: string): Services.IScriptSnapshotShim {
            return new ScriptSnapshotShim(this.getScriptInfo(fileName));
        }

        public getScriptVersion(fileName: string): number {
            return this.getScriptInfo(fileName).version;
        }

        public getScriptIsOpen(fileName: string): boolean {
            return this.getScriptInfo(fileName).isOpen;
        }

        public getDiagnosticsObject(): Services.ILanguageServicesDiagnostics {
            return new LanguageServicesDiagnostics("");
        }

        /*
            Random methods that have no home yet.
        */
        public addDefaultLibrary(): boolean {
            var root = "";
            return this.addFile("lib.d.ts",root);
        }

        private readFileContents(filePath: string): string {
            return IO.readFile(filePath).contents();
        }

        public createLS(): void {
            var languageServiceShim = new Services.TypeScriptServicesFactory().createLanguageServiceShim(this);
            languageServiceShim.refresh(true);
            this.languageServiceShim = languageServiceShim;
            this.languageService = this.languageServiceShim.languageService;
            return;
        }

    }
    /**
      Naive implementation of ILanguageServicesDiagnostics.
    */
    export class LanguageServicesDiagnostics implements Services.ILanguageServicesDiagnostics {

        constructor(private destination: string) { }

        public log(content: string): void {
            //Imitates the LanguageServicesDiagnostics object when not in Visual Studio
        }
    }
    /**
      Script info class which helps out the manager.  NOT for public API
    */
    class ScriptInfo {
        public version: number = 1;
        public editRanges: { length: number; textChangeRange: TypeScript.TextChangeRange; }[] = [];
        public lineMap: TypeScript.LineMap = null;

        constructor(public fileName: string, public content: string, public isOpen = true) {
            this.setContent(content);
        }

        private setContent(content: string): void {
            this.content = content;
            this.lineMap = TypeScript.LineMap.fromString(content);
        }

        public updateContent(content: string): void {
            this.editRanges = [];
            this.setContent(content);
            this.version++;
        }

        public editContent(minChar: number, limChar: number, newText: string): void {
            // Apply edits
            var prefix = this.content.substring(0, minChar);
            var middle = newText;
            var suffix = this.content.substring(limChar);
            this.setContent(prefix + middle + suffix);

            // Store edit range + new length of script
            this.editRanges.push({
                length: this.content.length,
                textChangeRange: new TypeScript.TextChangeRange(
                    TypeScript.TextSpan.fromBounds(minChar, limChar), newText.length)
            });

            // Update version #
            this.version++;
        }

        public getTextChangeRangeBetweenVersions(startVersion: number, endVersion: number): TypeScript.TextChangeRange {
            if (startVersion === endVersion) {
                // No edits!
                return TypeScript.TextChangeRange.unchanged;
            }

            var initialEditRangeIndex = this.editRanges.length - (this.version - startVersion);
            var lastEditRangeIndex = this.editRanges.length - (this.version - endVersion);

            var entries = this.editRanges.slice(initialEditRangeIndex, lastEditRangeIndex);
            return TypeScript.TextChangeRange.collapseChangesAcrossMultipleVersions(entries.map(e => e.textChangeRange));
        }
    }
    /**
      Another simple implementation of the ScriptSnapshotShim.  Currently only for private use, but could be made public
      */
    class ScriptSnapshotShim implements Services.IScriptSnapshotShim {
        private lineMap: TypeScript.LineMap = null;
        private textSnapshot: string;
        private version: number;

        constructor(private scriptInfo: ScriptInfo) {
            this.textSnapshot = scriptInfo.content;
            this.version = scriptInfo.version;
        }

        public getText(start: number, end: number): string {
            return this.textSnapshot.substring(start, end);
        }

        public getLength(): number {
            return this.textSnapshot.length;
        }

        public getLineStartPositions(): string {
            if (this.lineMap === null) {
                this.lineMap = TypeScript.LineMap.fromString(this.textSnapshot);
            }

            return JSON.stringify(this.lineMap.lineStarts()); //originally this was JSON2 but I don't have JSON2 so I used regular JSON.  May introduce bugs
        }

        public getTextChangeRangeSinceVersion(scriptVersion: number): string {
            var range = this.scriptInfo.getTextChangeRangeBetweenVersions(scriptVersion, this.version);
            if (range === null || range === TypeScript.TextChangeRange.unchanged) {
                return null;
            }

            return JSON.stringify({ span: { start: range.span().start(), length: range.span().length() }, newLength: range.newLength() }); //originally this was JSON2 but I don't have JSON2 so I used regular JSON.  May introduce bugs
        }
    }
}
