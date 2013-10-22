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
///<reference path='languageServiceHost.ts'/>
///<reference path='snapshot.ts'/>

module Bridge {

    export class LanguageService {

        private languageService: Services.LanguageService;
        private languageServiceHost: LanguageServiceHost;

        constructor() {
            this.languageServiceHost = new LanguageServiceHost();
            this.languageService = new Services.LanguageService(this.languageServiceHost);
        }

        public addDefaultLibrary(libraryContents: string) {
            this.languageServiceHost.addDefaultLibrary(libraryContents);
        }

        public addFiles(fileNames: string[]) {
            this.languageServiceHost.addFiles(fileNames);
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
                var line = snapshot.getText(lineStart, lineEnd).substring(0, 500); // truncate long lines

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
                var resolvedDiagnostics = this.getDiagnostics(fileName);

                diagnostics[fileName] = resolvedDiagnostics;
            });

            return diagnostics;
        }

        public getBraceMatchingAtPosition(fileName: string, position: number): TypeScript.TextSpan[] {
            return this.languageService.getBraceMatchingAtPosition(fileName, position);
        }

        public getCompletionsAtPosition(fileName: string, position: number): CompletionInfo {
            var completions = this.languageService.getCompletionsAtPosition(fileName, position, true);

            if (completions !== null) {
                // filter out the keyword & primitive entries
                var filteredEntries = completions.entries.filter((entry) => {
                    if (entry.kind === Services.ScriptElementKind.keyword
                        || entry.kind === Services.ScriptElementKind.primitiveType) {
                        return false;
                    }

                    return true;
                });

                // get the details for each entry
                var detailEntries = filteredEntries.map((entry) => {
                    return this.languageService.getCompletionEntryDetails(fileName, position, entry.name);
                });

                return {
                    entries: detailEntries,
                    memberCompletion: completions.isMemberCompletion
                };
            }

            return null;
        }

        public getDefinitionAtPosition(fileName: string, position: number): Services.DefinitionInfo[] {
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
                    text: diagnostic.text().substring(0, 500) // truncate ridiculously long error messages
                };
            });

            return resolvedDiagnostics;
        }

        public getEmitOutput(fileName: string): string[] {
            return this.languageService.getEmitOutput(fileName).outputFiles.map(function(outputFile) {
                IOUtils.writeFileAndFolderStructure(IO, outputFile.name, outputFile.text, outputFile.writeByteOrderMark);
                return outputFile.name;
            });
        }

        public getFormattingEditsForRange(fileName: string, minChar: number, limChar: number, options: Services.FormatCodeOptions):
            Services.TextEdit[] {

            return this.languageService.getFormattingEditsForRange(fileName, minChar, limChar, options);
        }

        public getIndentationAtPosition(fileName: string, position: number, options: Services.EditorOptions): number {
            return this.languageService.getIndentationAtPosition(fileName, position, options);
        }

        public getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): Services.SpanInfo {
            return this.languageService.getNameOrDottedNameSpan(fileName, startPos, endPos);
        }

        public getOccurrencesAtPosition(fileName: string, position: number): Services.ReferenceEntry[] {
            return this.languageService.getOccurrencesAtPosition(fileName, position);
        }

        public getReferencesAtPosition(fileName: string, position: number): Services.ReferenceEntry[] {
            return this.languageService.getReferencesAtPosition(fileName, position);
        }

        public getScriptLexicalStructure(fileName: string): Services.NavigateToItem[] {
            return this.languageService.getScriptLexicalStructure(fileName);
        }

        public getSignatureAtPosition(fileName: string, position: number): Services.SignatureInfo {
            return this.languageService.getSignatureAtPosition(fileName, position);
        }

        public getSyntacticDiagnostics(fileName: string): TypeScript.Diagnostic[] {
            return this.languageService.getSyntacticDiagnostics(fileName);
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
        entries: Services.CompletionEntryDetails[];
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
