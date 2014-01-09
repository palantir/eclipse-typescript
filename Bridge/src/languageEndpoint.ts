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

/// <reference path="../typescript/src/services/languageService.ts" />
/// <reference path="languageServiceHost.ts" />
/// <reference path="snapshot.ts" />

module Bridge {

    export class LanguageEndpoint {

        private languageService: TypeScript.Services.LanguageService;
        private languageServiceHost: LanguageServiceHost;

        constructor() {
            this.languageServiceHost = new LanguageServiceHost();
            this.languageService = new TypeScript.Services.LanguageService(this.languageServiceHost);
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
            var references = this.getReferencesAtPosition(fileName, position);

            return references.map((reference) => {
                var snapshot = this.languageServiceHost.getScriptSnapshot(reference.fileName);
                var lineStarts = snapshot.getLineStartPositions();
                var lineMap = new TypeScript.LineMap(() => lineStarts, snapshot.getLength());
                var lineNumber = lineMap.getLineNumberFromPosition(reference.minChar);
                var lineStart = lineMap.getLineStartPosition(lineNumber);
                var lineEnd = lineMap.getLineStartPosition(lineNumber + 1) - 1;
                var line = snapshot.getText(lineStart, lineEnd);

                return {
                    fileName: reference.fileName,
                    minChar: reference.minChar,
                    limChar: reference.limChar,
                    line: line,
                    lineNumber: lineNumber,
                    lineStart: lineStart
                };
            });
        }

        public getAllDiagnostics(): any {
            var diagnostics = {};

            this.languageServiceHost.getScriptFileNames().forEach((fileName) => {
                if (fileName !== "lib.d.ts") {
                    var resolvedDiagnostics = this.getDiagnostics(fileName);

                    diagnostics[fileName] = resolvedDiagnostics;
                }
            });

            return diagnostics;
        }

        public getBraceMatchingAtPosition(fileName: string, position: number): TypeScript.TextSpan[] {
            return this.languageService.getBraceMatchingAtPosition(fileName, position);
        }

        public getCompletionsAtPosition(fileName: string, position: number): CompletionInfo {
            var completions = this.languageService.getCompletionsAtPosition(fileName, position, true);

            if (completions != null) {
                // filter out the keyword & primitive entries
                var filteredEntries = completions.entries.filter((entry) => {
                    if (entry.kind === TypeScript.Services.ScriptElementKind.keyword
                        || entry.kind === TypeScript.Services.ScriptElementKind.primitiveType) {
                        return false;
                    }

                    return true;
                });

                // get the details for each entry
                var detailEntries = filteredEntries.map((entry) => {
                    return this.languageService.getCompletionEntryDetails(fileName, position, entry.name);
                });

                // remove null entries
                detailEntries = detailEntries.filter((detailEntry) => detailEntry != null);

                return {
                    entries: detailEntries,
                    memberCompletion: completions.isMemberCompletion
                };
            }

            return null;
        }

        public getDefinitionAtPosition(fileName: string, position: number): TypeScript.Services.DefinitionInfo[] {
            return this.languageService.getDefinitionAtPosition(fileName, position);
        }

        public getDiagnostics(fileName: string): CompleteDiagnostic[] {
            var diagnostics = this.languageService.getSyntacticDiagnostics(fileName);

            if (diagnostics.length === 0) {
                diagnostics = this.languageService.getSemanticDiagnostics(fileName);
            }

            var snapshot = this.languageServiceHost.getScriptSnapshot(fileName);
            var lineStarts = snapshot.getLineStartPositions();
            var length = snapshot.getLength();
            var resolvedDiagnostics = diagnostics.map((diagnostic) => {
                return {
                    start: diagnostic.start(),
                    length: diagnostic.length(),
                    line: diagnostic.line(),
                    text: diagnostic.text()
                };
            });

            return resolvedDiagnostics;
        }

        public getEmitOutput(fileName: string): TypeScript.OutputFile[] {
            return this.languageService.getEmitOutput(fileName).outputFiles;
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
            var type = this.languageService.getTypeAtPosition(fileName, position);

            if (type !== null) {
                return {
                    memberName: type.memberName.toString(),
                    docComment: type.docComment,
                    fullSymbolName: type.fullSymbolName,
                    kind: type.kind,
                    minChar: type.minChar,
                    limChar: type.limChar
                };
            }

            return null;
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

    export interface CompletionInfo {
        entries: TypeScript.Services.CompletionEntryDetails[];
        memberCompletion: boolean;
    }

    export interface CompleteDiagnostic {
        length: number;
        line: number;
        start: number;
        text: string;
    }

    export interface Reference {
        fileName: string;
        limChar: number;
        line: string;
        lineNumber: number;
        lineStart: number;
        minChar: number;
    }

    export interface TypeInfo {
        docComment: string;
        fullSymbolName: string;
        kind: string;
        limChar: number;
        memberName: string;
        minChar: number;
    }
}
