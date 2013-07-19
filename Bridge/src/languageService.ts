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

///<reference path='../typescript/src/services/languageService.ts'/>
///<reference path='snapshot.ts'/>

module Bridge {

    export class LanguageServiceHostService implements Services.ILanguageServiceHost {

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

        public addFiles(files: string[]) {
            for (var i = 0; i < files.length; i++) {
                this.addFile(files[i]);
            }
        }

        public removeFiles(files: string[]) {
            for (var i = 0; i < files.length; i++) {
                this.removeFile(files[i]);
            }
        }

        public addFile(file: string) {
            this.fileMap.set(file, new ScriptSnapshot(file));
        }

        public removeFile(file: string) {
            this.fileMap.delete(file);
        }

        public updateFileContents(file: string, content: string) {
            this.fileMap.get(file).updateContent(content);
        }

        public updateFile(file: string) {
            this.fileMap.get(file).updateFile(file);
        }

        public editFile(file: string, offset: number, length: number, replacementText: string) {
            this.fileMap.get(file).addEdit(offset, length, replacementText);
        }

        public getCompletionsAtPosition(file: string, position: number): DetailedAutoCompletionInfo {
            return this.getDetailedImplicitlyPrunedCompletionsAtPosition(file, position);
        }

        public getFormattingEditsForRange(fileName: string, minChar: number, limChar: number, options: Services.FormatCodeOptions): Services.TextEdit[] {
            return this.languageService.getFormattingEditsForRange(fileName, minChar, limChar, options);
        }

        public getScriptLexicalStructure(fileName: string): Services.NavigateToItem[] {
            return this.languageService.getScriptLexicalStructure(fileName);
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
                if (this.knownToBreak(pruningPrefix)) {
                    return { pruningPrefix: pruningPrefix, entries: [] };
                }
                return this.getDetailedExplicitPrunedCompletionsAtPosition(fileName, position, pruningPrefix);
            } else {
                return { "pruningPrefix": "", "entries": [] };
            }
        }

        private knownToBreak(prefix: string) {
            var badPrefix = [];
            badPrefix.push("$");
            for (var i = 0; i < badPrefix.length; i++) {
                if (badPrefix[i] === prefix) {
                    return true;
                }
            }
            return false;
        }

        private getDetailedExplicitPrunedCompletionsAtPosition(fileName: string, position: number, pruningPrefix: string): DetailedAutoCompletionInfo {
            var abbreviatedCompletionInfo: AutoCompletionInfo = this.getExplicitPrunedCompletionsAtPosition(fileName, position, pruningPrefix);

            if (abbreviatedCompletionInfo.entries === null) {
                return { "pruningPrefix": "", "entries": [] };
            }

            var abbreviatedEntry: Services.CompletionEntry;
            var detailedEntry: Services.CompletionEntryDetails;
            var detailedEntries: Services.CompletionEntryDetails[] = [];

            for (var i = 0; i < abbreviatedCompletionInfo.entries.length; i++) {
                abbreviatedEntry = abbreviatedCompletionInfo.entries[i];
                detailedEntry = this.languageService.getCompletionEntryDetails(fileName, position, abbreviatedEntry.name);
                detailedEntries.push(detailedEntry);
            }

            return { "pruningPrefix": pruningPrefix, "entries": detailedEntries };
        }

        private getExplicitPrunedCompletionsAtPosition(fileName: string, position: number, pruningPrefix: string): AutoCompletionInfo {
            var isMemberCompletion: boolean = false;
            var rawCompletionInfo: Services.CompletionInfo = this.languageService.getCompletionsAtPosition(fileName, position, isMemberCompletion);

            if (rawCompletionInfo === null) {
                return { "entries": [] };
            }

            var prunedEntries: Services.CompletionEntry[] = [];
            var rawEntries: Services.CompletionEntry[] = rawCompletionInfo.entries;

            for (var i = 0; i < rawEntries.length; i++) {
                if (this.prefixMatch(pruningPrefix, rawEntries[i].name)) {
                    prunedEntries.push(rawEntries[i]);
                }
            }

            return { "entries": prunedEntries };
        }

        private prefixMatch(_prefix: string, str: string): boolean {
            return str.indexOf(_prefix) === 0;
        }
    }

    export interface DetailedAutoCompletionInfo {
        pruningPrefix: string;
        entries: Services.CompletionEntryDetails[];
    }

    class LanguageServicesDiagnostics implements Services.ILanguageServicesDiagnostics {

        public log(message: string): void {

        }
    }

    interface AutoCompletionInfo {
        entries: Services.CompletionEntry[];
    }
}
