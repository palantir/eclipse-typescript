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

/// <reference path="languageService.ts" />
/// <reference path="languageServiceHost.ts" />

module Bridge {

    export class LanguageEndpoint {

        private languageService: LanguageService;
        private languageServiceHost: LanguageServiceHost;

        constructor() {
            this.languageServiceHost = new LanguageServiceHost();
            this.languageService = new LanguageService(this.languageServiceHost);
        }

        public addDefaultLibrary(libraryContents: string) {
            this.languageServiceHost.addDefaultLibrary(libraryContents);
        }

        public removeDefaultLibrary() {
            this.languageServiceHost.removeDefaultLibrary();
        }

        public addFiles(files: { [fileName: string]: string }) {
            this.languageServiceHost.addFiles(files);
        }

        public editFile(fileName: string, offset: number, length: number, text: string) {
            this.languageServiceHost.editFile(fileName, offset, length, text);
        }

        public findReferences(fileName: string, position: number): Reference[] {
            return this.languageService.findReferences(fileName, position);
        }

        public getAllDiagnostics(): any {
            return this.languageService.getAllDiagnostics();
        }

        public getBraceMatchingAtPosition(fileName: string, position: number): TypeScript.TextSpan[] {
            return this.languageService.getBraceMatchingAtPosition(fileName, position);
        }

        public getCompletionsAtPosition(fileName: string, position: number): CompletionInfo {
            return this.languageService.getCompletionsAtPositionEx(fileName, position);
        }

        public getDefinitionAtPosition(fileName: string, position: number): TypeScript.Services.DefinitionInfo[] {
            return this.languageService.getDefinitionAtPosition(fileName, position);
        }

        public getDiagnostics(fileName: string): CompleteDiagnostic[] {
            return this.languageService.getDiagnostics(fileName);
        }

        public getEmitOutput(fileName: string): TypeScript.OutputFile[] {
            return this.languageService.getEmitOutputFiles(fileName);
        }

        public getFormattingEditsForRange(fileName: string, minChar: number, limChar: number, options: TypeScript.Services.FormatCodeOptions):
            TypeScript.Services.TextEdit[] {

            return this.languageService.getFormattingEditsForRange(fileName, minChar, limChar, options);
        }

        public getIndentationAtPosition(fileName: string, position: number, options: TypeScript.Services.EditorOptions): number {
            return this.languageService.getIndentationAtPosition(fileName, position, options);
        }

        public getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): TypeScript.Services.SpanInfo {
            return this.languageService.getNameOrDottedNameSpan(fileName, startPos, endPos);
        }

        public getNavigateToItems(searchValue: string): TypeScript.Services.NavigateToItem[] {
            return this.languageService.getNavigateToItems(searchValue);
        }

        public getOccurrencesAtPosition(fileName: string, position: number): TypeScript.Services.ReferenceEntry[] {
            return this.languageService.getOccurrencesAtPosition(fileName, position);
        }

        public getReferencesAtPosition(fileName: string, position: number): TypeScript.Services.ReferenceEntry[] {
            return this.languageService.getReferencesAtPosition(fileName, position);
        }

        public getScriptLexicalStructure(fileName: string): TypeScript.Services.NavigateToItem[] {
            return this.languageService.getScriptLexicalStructure(fileName);
        }

        public getSignatureAtPosition(fileName: string, position: number): TypeScript.Services.SignatureInfo {
            return this.languageService.getSignatureAtPosition(fileName, position);
        }

        public getTypeAtPosition(fileName: string, position: number): TypeInfo {
            return this.languageService.getTypeAtPositionEx(fileName, position);
        }

        public setCompilationSettings(compilationSettings: TypeScript.CompilationSettings) {
            this.languageServiceHost.setCompilationSettings(compilationSettings);
        }

        public setFileOpen(fileName: string, open: boolean) {
            this.languageServiceHost.setFileOpen(fileName, open);
        }

        public updateFiles(deltas: IFileDelta[]) {
            this.languageServiceHost.updateFiles(deltas);
        }
    }
}
