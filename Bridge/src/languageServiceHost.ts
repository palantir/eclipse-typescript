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
///<reference path='../typescript/src/compiler/precompile.ts'/>
///<reference path='../typescript/src/services/languageService.ts'/>
///<reference path='snapshot.ts'/>

module Bridge {

    export class LanguageServiceHost implements Services.ILanguageServiceHost {

        private compilationSettings: TypeScript.CompilationSettings;
        private diagnostics: Services.ILanguageServicesDiagnostics;
        private snapshots: Map<string, ScriptSnapshot>;

        constructor() {
            this.compilationSettings = new TypeScript.CompilationSettings();
            this.diagnostics = new LanguageServicesDiagnostics();
            this.snapshots = new Map();
        }

        public editFile(fileName: string, offset: number, length: number, replacementText: string) {
            var snapshot = this.snapshots.get(fileName);

            if (snapshot != null) {
                snapshot.addEdit(offset, length, replacementText);
            } else {
                var contents = replacementText;
                var snapshot = new ScriptSnapshot(contents);

                // save a snapshot of the contents
                snapshot.setOpen(true);
                this.snapshots.set(fileName, snapshot);

                // also add the files referenced from the one being added
                var lastSlash = fileName.lastIndexOf("/");
                var rootPath = fileName.substring(0, lastSlash);
                var referencedFiles = TypeScript.getReferencedFiles(fileName, snapshot);
                for (var i = 0; i < referencedFiles.length; i++) {
                    var referencedFilePath = referencedFiles[i].path;
                    var resolvedFile = IO.findFile(rootPath, referencedFilePath);

                    if (resolvedFile != null) {
                        var referencedSnapshot = new ScriptSnapshot(resolvedFile.fileInformation.contents());
                        var resolvedFilePath = IO.resolvePath(resolvedFile.path);

                        this.snapshots.set(resolvedFilePath, referencedSnapshot);
                    }
                }
            }
        }

        public updateFiles(deltas: IFileDelta[]) {
            for (var i = 0; i < deltas.length; i++) {
                var fileName = deltas[i].fileName;

                switch (deltas[i].delta) {
                    case "CHANGED":
                        var snapshot = this.snapshots.get(fileName);

                        if (snapshot !== undefined) {
                            var contents = readFileContents(fileName);

                            snapshot.updateContents(contents);
                        }
                        break;
                    case "REMOVED":
                        this.snapshots.delete(fileName);
                        break;
                }
            }
        }

        public getCompilationSettings(): TypeScript.CompilationSettings {
            return this.compilationSettings;
        }

        public getScriptFileNames(): string[] {
            return <string[]> this.snapshots.keys();
        }

        public getScriptVersion(fileName: string): number {
            return this.snapshots.get(fileName).getVersion();
        }

        public getScriptIsOpen(fileName: string): boolean {
            return this.snapshots.get(fileName).isOpen();
        }

        public getScriptSnapshot(fileName: string): TypeScript.IScriptSnapshot {
            return this.snapshots.get(fileName);
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
            // does nothing
        }
    }

    function readFileContents(filePath: string): string {
        return IO.readFile(filePath).contents();
    }

    class LanguageServicesDiagnostics implements Services.ILanguageServicesDiagnostics {

        public log(message: string): void {
            // does nothing
        }
    }

    export interface IFileDelta {
        delta: string;
        fileName: string;
    }
}
