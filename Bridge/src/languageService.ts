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

        public setFileOpen(fileName: string, open: boolean) {
            this.languageServiceHost.setFileOpen(fileName, open);
        }

        public updateFileContents(fileName: string, contents: string) {
            this.languageServiceHost.updateFileContents(fileName, contents);
        }

        public updateFiles(deltas: IFileDelta[]) {
            this.languageServiceHost.updateFiles(deltas);
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

        public getEmitOutput(fileName: string): Services.EmitOutput {
            return this.languageService.getEmitOutput(fileName);
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

        public getScriptLexicalStructure(fileName: string): Services.NavigateToItem[] {
            return this.languageService.getScriptLexicalStructure(fileName);
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
    }

    export interface CompletionInfo {
        entries: Services.CompletionEntryDetails[];
        memberCompletion: boolean;
    }

    export interface Diagnostic {
        start: number;
        length: number;
        text: string;
    }

    export interface TypeInfo {
        memberName: string;
        docComment: string;
        fullSymbolName: string;
        kind: string;
        minChar: number;
        limChar: number;
    }
}
