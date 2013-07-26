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

        public editFile(fileName: string, offset: number, length: number, text: string) {
            this.languageServiceHost.editFile(fileName, offset, length, text);
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
                // get the details for each entry
                var entries = completions.entries.map((completion) => {
                    return this.languageService.getCompletionEntryDetails(fileName, position, completion.name);
                });

                return {
                    entries: entries,
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

        public getScriptLexicalStructure(fileName: string): Services.NavigateToItem[] {
            return this.languageService.getScriptLexicalStructure(fileName);
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
}
