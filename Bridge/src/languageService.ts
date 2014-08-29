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

module Bridge {

    export class LanguageService extends TypeScript.Services.LanguageService {

        private diagnosticFilter: (fileName: string) => boolean;

        constructor(host: TypeScript.Services.ILanguageServiceHost, diagnosticFilter: (fileName: string) => boolean) {
            super(host);
            this.diagnosticFilter = diagnosticFilter;
        }

        public getAllDiagnostics() {
            var diagnostics: { [fileName: string]: DiagnosticEx[] } = {};

            this.host.getScriptFileNames()
                .filter(this.diagnosticFilter)
                .forEach((fileName: string) => {
                    diagnostics[fileName] = this.getDiagnostics(fileName, true);
                });
            return diagnostics;
        }

        public getCompletionsAtPositionEx(fileName: string, position: number) {
            var completions = super.getCompletionsAtPosition(fileName, position, true);

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
                    return super.getCompletionEntryDetails(fileName, position, entry.name);
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

        public getDiagnostics(fileName: string, semantic: boolean) {
            var diagnostics = super.getSyntacticDiagnostics(fileName);

            if (semantic && diagnostics.length === 0) {
                diagnostics = super.getSemanticDiagnostics(fileName);
            }

            return diagnostics.map((diagnostic) => {
                return {
                    start: diagnostic.start(),
                    length: diagnostic.length(),
                    line: diagnostic.line(),
                    text: diagnostic.text()
                };
            });
        }

        public getEmitOutputFiles(fileName: string) {
            return super.getEmitOutput(fileName).outputFiles;
        }

        public getReferencesAtPositionEx(fileName: string, position: number) {
            var references = this.getReferencesAtPosition(fileName, position);

            return references.map((reference) => {
                var snapshot = this.host.getScriptSnapshot(reference.fileName);
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

        public getTypeAtPositionEx(fileName: string, position: number) {
            var type = super.getTypeAtPosition(fileName, position);

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

    export interface DiagnosticEx {
        length: number;
        line: number;
        start: number;
        text: string;
    }
}
