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

/// <reference path="../typescript/src/compiler/io.ts" />
/// <reference path="../typescript/src/compiler/precompile.ts" />
/// <reference path="../typescript/src/services/languageService.ts" />
/// <reference path="fileInfo.ts" />
/// <reference path="snapshot.ts" />

module Bridge {

    export class LanguageServiceHost implements TypeScript.Services.ILanguageServiceHost {

        private compilationSettings: TypeScript.CompilationSettings;
        private diagnostics: TypeScript.Services.ILanguageServicesDiagnostics;
        private fileInfos: { [fileName: string]: FileInfo };

        constructor() {
            this.compilationSettings = new TypeScript.CompilationSettings();
            this.diagnostics = new LanguageServicesDiagnostics();
            this.fileInfos = Object.create(null);
        }

        public addDefaultLibrary(libraryContents: string) {
            var fileInfo = new FileInfo(TypeScript.ByteOrderMark.None, libraryContents, null);

            this.fileInfos["lib.d.ts"] = fileInfo;
        }

        public removeDefaultLibrary() {
            delete this.fileInfos["lib.d.ts"];
        }

        public addFiles(files: { [fileName: string]: string }) {
            for (var fileName in files) {
                if (files.hasOwnProperty(fileName)) {
                    var filePath = files[fileName];

                    // read the file
                    try {
                        var fileInformation = TypeScript.IO.readFile(filePath, null);
                    } catch (e) {
                        // ignore failures (they are likely due to the workspace being out-of-sync)
                        continue;
                    }

                    // cache the file
                    var fileInfo = new FileInfo(fileInformation.byteOrderMark, fileInformation.contents, filePath);
                    this.fileInfos[fileName] = fileInfo;
                }
            }
        }

        public editFile(fileName: string, offset: number, length: number, text: string) {
            this.fileInfos[fileName].editContents(offset, length, text);
        }

        public setFileOpen(fileName: string, open: boolean) {
            this.fileInfos[fileName].setOpen(open);
        }

        public updateFiles(deltas: IFileDelta[]) {
            deltas.forEach((delta) => {
                var fileName = delta.fileName;

                switch (delta.delta) {
                    case "ADDED":
                    case "CHANGED":
                        var fileInfo = this.fileInfos[fileName];

                        if (fileInfo !== undefined) {
                            // only update files not currently open in an editor
                            if (!fileInfo.getOpen()) {
                                var fileInformation = TypeScript.IO.readFile(fileInfo.getPath(), null);

                                fileInfo.updateFile(fileInformation);
                            }
                        } else {
                            var filePath = delta.filePath;
                            var fileInformation = TypeScript.IO.readFile(filePath, null);

                            fileInfo = new FileInfo(fileInformation.byteOrderMark, fileInformation.contents, filePath);

                            this.fileInfos[fileName] = fileInfo;
                        }
                        break;
                    case "REMOVED":
                        delete this.fileInfos[fileName];
                        break;
                }
            });
        }

        public getCompilationSettings(): TypeScript.CompilationSettings {
            return this.compilationSettings;
        }

        public setCompilationSettings(compilationSettings: TypeScript.CompilationSettings) {
            this.compilationSettings = compilationSettings;
        }

        public getScriptByteOrderMark(fileName: string): TypeScript.ByteOrderMark {
            return this.fileInfos[fileName].getByteOrderMark();
        }

        public getScriptFileNames(): string[] {
            return Object.getOwnPropertyNames(this.fileInfos);
        }

        public getScriptVersion(fileName: string): number {
            return this.fileInfos[fileName].getVersion();
        }

        public getScriptIsOpen(fileName: string): boolean {
            return this.fileInfos[fileName].getOpen();
        }

        public getDiagnosticsObject(): TypeScript.Services.ILanguageServicesDiagnostics {
            return this.diagnostics;
        }

        public getLocalizedDiagnosticMessages(): any {
            return null;
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
            // does nothing
        }

        public getScriptSnapshot(fileName: string): TypeScript.IScriptSnapshot {
            return this.fileInfos[fileName].getScriptSnapshot();
        }

        public resolveRelativePath(path: string, directory: string): string {
            return path;
        }

        public fileExists(path: string): boolean {
            return TypeScript.IO.fileExists(path);
        }

        public directoryExists(path: string): boolean {
            return TypeScript.IO.directoryExists(path);
        }

        public getParentDirectory(path: string): string {
            return TypeScript.IO.dirName(path);
        }
    }

    export interface IFileDelta {
        delta: string;
        fileName: string;
        filePath: string;
    }

    class LanguageServicesDiagnostics implements TypeScript.Services.ILanguageServicesDiagnostics {

        public log(message: string): void {
            // does nothing
        }
    }
}
