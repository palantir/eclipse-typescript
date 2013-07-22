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
///<reference path='map.ts'/>
///<reference path='snapshot.ts'/>

module Bridge {

    export class LanguageServiceHost implements Services.ILanguageServiceHost {

        private compilationSettings: TypeScript.CompilationSettings;
        private diagnostics: Services.ILanguageServicesDiagnostics;
        private fileInfos: Map<string, FileInfo>;

        constructor() {
            this.compilationSettings = new TypeScript.CompilationSettings();
            this.diagnostics = new LanguageServicesDiagnostics();
            this.fileInfos = new Map();
        }

        public addDefaultLibrary(libraryContents: string) {
            var fileInfo = new FileInfo(libraryContents, false);

            this.fileInfos.set("lib.d.ts", fileInfo);
        }

        public editFile(fileName: string, offset: number, length: number, text: string) {
            var fileInfo = this.fileInfos.get(fileName).editContents(offset, length, text);
        }

        public updateFileContents(fileName: string, contents: string) {
            var fileInfo = this.fileInfos.get(fileName);

            if (fileInfo != null) {
                fileInfo.updateContents(contents);
            } else {
                var fileInfo = new FileInfo(contents, true);

                // save the new file info
                this.fileInfos.set(fileName, fileInfo);

                this.addReferencedFiles(fileName);
            }
        }

        private addReferencedFiles(fileName: string) {
            var fileInfo = this.fileInfos.get(fileName);
            var lastSlash = fileName.lastIndexOf("/");
            var rootPath = fileName.substring(0, lastSlash);
            var snapshot = fileInfo.getScriptSnapshot();
            var referencedFiles = TypeScript.getReferencedFiles(fileName, snapshot);

            for (var i = 0; i < referencedFiles.length; i++) {
                var referencedFilePath = referencedFiles[i].path;
                var resolvedFile = IO.findFile(rootPath, referencedFilePath);

                if (resolvedFile != null) {
                    var referencedFileContents = resolvedFile.fileInformation.contents();
                    var referencedFileInfo = new FileInfo(referencedFileContents, false);
                    var referencedFileName = IO.resolvePath(resolvedFile.path);

                    if (!this.fileInfos.has(referencedFileName)) {
                        this.fileInfos.set(referencedFileName, referencedFileInfo);

                        this.addReferencedFiles(referencedFileName);
                    }
                }
            }
        }

        public updateFiles(deltas: IFileDelta[]) {
            for (var i = 0; i < deltas.length; i++) {
                var fileName = deltas[i].fileName;

                switch (deltas[i].delta) {
                    case "CHANGED":
                        var fileInfo = this.fileInfos.get(fileName);

                        if (fileInfo !== undefined) {
                            var contents = IO.readFile(fileName).contents();

                            fileInfo.updateContents(contents);
                        }
                        break;
                    case "REMOVED":
                        this.fileInfos.delete(fileName);
                        break;
                }
            }
        }

        public getCompilationSettings(): TypeScript.CompilationSettings {
            return this.compilationSettings;
        }

        public getScriptFileNames(): string[] {
            return this.fileInfos.keys();
        }

        public getScriptVersion(fileName: string): number {
            return this.fileInfos.get(fileName).getVersion();
        }

        public getScriptIsOpen(fileName: string): boolean {
            return this.fileInfos.get(fileName).getOpen();
        }

        public getScriptSnapshot(fileName: string): TypeScript.IScriptSnapshot {
            return this.fileInfos.get(fileName).getScriptSnapshot();
        }

        public getDiagnosticsObject(): Services.ILanguageServicesDiagnostics {
            return this.diagnostics;
        }

        public information(): boolean {
            return false;
        }

        public debug(): boolean {
            return false;
        }

        public warning(): boolean {
            return false;
        }

        public error(): boolean {
            return false;
        }

        public fatal(): boolean {
            return false;
        }

        public log(message: string): void {
        }
    }

    export interface IFileDelta {
        delta: string;
        fileName: string;
    }

    class LanguageServicesDiagnostics implements Services.ILanguageServicesDiagnostics {

        public log(message: string): void {
        }
    }

    class FileInfo {

        private changes: TypeScript.TextChangeRange[];
        private contents: string;
        private open: boolean;
        private version: number;

        constructor(contents: string, open: boolean) {
            this.changes = [];
            this.contents = contents;
            this.open = open;
            this.version = 0;
        }

        public getVersion(): number {
            return this.version;
        }

        public getOpen(): boolean {
            return this.open;
        }

        public getScriptSnapshot(): TypeScript.IScriptSnapshot {
            return new ScriptSnapshot(this.changes.slice(0), this.contents, this.version);
        }

        public editContents(offset: number, length: number, text: string): void {
            var prefix = this.contents.substring(0, offset);
            var suffix = this.contents.substring(offset + length);
            var newContents = prefix + text + suffix;

            var span = TypeScript.TextSpan.fromBounds(offset, offset + length);
            var change = new TypeScript.TextChangeRange(span, text.length);

            this.setContents(newContents, change);
        }

        public updateContents(contents: string) {
            var span = TypeScript.TextSpan.fromBounds(0, this.contents.length);
            var change = new TypeScript.TextChangeRange(span, contents.length);

            this.setContents(contents, change);
        }

        private setContents(contents: string, change: TypeScript.TextChangeRange) {
            if (this.contents !== contents) {
                this.changes.push(change);
                this.contents = contents;
                this.version++;
            }
        }
    }
}
