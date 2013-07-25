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

            if (completions.entries != null) {
                var spanText = "";
                var span = this.languageService.getNameOrDottedNameSpan(fileName, position, position);

                // get the name up to the position
                if (span !== null) {
                    var end = Math.min(span.limChar, position);
                    var text = this.languageServiceHost.getFileText(fileName, span.minChar, end);
                    var periodIndex = text.lastIndexOf(".");

                    if (periodIndex >= 0) {
                        spanText = text.substring(periodIndex + 1);
                    } else {
                        spanText = text;
                    }
                }

                // filter out the entries that don't correspond to the currently typed text
                var entries = [];
                for (var i = 0; i < completions.entries.length; i++) {
                    var completion = completions.entries[i];

                    // get the details for entries that passed the filter
                    if (spanText.length == 0 || completion.name.indexOf(spanText) == 0) {
                        var entryDetails = this.languageService.getCompletionEntryDetails(fileName, position, completion.name);

                        entries.push(entryDetails);
                    }
                }

                return {
                    entries: entries,
                    text: spanText
                };
            }

            return null;
        }

        public getDefinitionAtPosition(fileName: string, position: number): Services.DefinitionInfo[] {
            return this.languageService.getDefinitionAtPosition(fileName, position);
        }

        public getDiagnostics(fileName: string): Diagnostic[] {
            var diagnostics = this.languageService.getSyntacticDiagnostics(fileName);

            // get the semantic diagnostics only if there were no syntax errors
            if (diagnostics.length === 0) {
                diagnostics = diagnostics.concat(this.languageService.getSemanticDiagnostics(fileName));
            }

            return diagnostics.map((diagnostic) => {
                return {
                    start: diagnostic.start(),
                    length: diagnostic.length(),
                    text: diagnostic.text()
                }
            });
        }

        public getEmitOutput(fileName: string): Services.EmitOutput {
            return this.languageService.getEmitOutput(fileName);
        }

        public getFormattingEditsForRange(fileName: string, minChar: number, limChar: number, options: Services.FormatCodeOptions): Services.TextEdit[] {
            return this.languageService.getFormattingEditsForRange(fileName, minChar, limChar, options);
        }

        public getScriptLexicalStructure(fileName: string): Services.NavigateToItem[] {
            return this.languageService.getScriptLexicalStructure(fileName);
        }
    }

    export interface CompletionInfo {
        entries: Services.CompletionEntryDetails[];
        text: string;
    }

    export interface Diagnostic {
        start: number;
        length: number;
        text: string;
    }
}
