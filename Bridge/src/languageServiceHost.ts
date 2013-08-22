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
            var fileInfo = new FileInfo(ByteOrderMark.None, libraryContents);

            this.fileInfos.set("lib.d.ts", fileInfo);
        }

        public addFiles(fileNames: string[]) {
            fileNames.forEach((fileName) => {
                try {
                    var fileInformation = IO.readFile(fileName, null);
                    var fileInfo = new FileInfo(fileInformation.byteOrderMark, fileInformation.contents);

                    this.fileInfos.set(fileName, fileInfo);
                } catch (e) {
                    // ignore failures (they are likely due to the workspace being out-of-sync)
                }
            });
        }

        public editFile(fileName: string, offset: number, length: number, text: string) {
            this.fileInfos.get(fileName).editContents(offset, length, text);
        }

        public setFileOpen(fileName: string, open: boolean) {
            this.fileInfos.get(fileName).setOpen(open);
        }

        public updateFiles(deltas: IFileDelta[]) {
            deltas.forEach((delta) => {
                var fileName = delta.fileName;

                switch (delta.delta) {
                    case "ADDED":
                    case "CHANGED":
                        var fileInfo = this.fileInfos.get(fileName);

                        if (fileInfo !== undefined) {
                            // only update files not currently open in an editor
                            if (!fileInfo.getOpen()) {
                                var fileInformation = IO.readFile(fileName, null);

                                fileInfo.updateFile(fileInformation);
                            }
                        } else {
                            var fileInformation = IO.readFile(fileName, null);

                            fileInfo = new FileInfo(fileInformation.byteOrderMark, fileInformation.contents);

                            this.fileInfos.set(fileName, fileInfo);
                        }
                        break;
                    case "REMOVED":
                        this.fileInfos.delete(fileName);
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

        public getScriptFileNames(): string[] {
            return this.fileInfos.keys();
        }

        public getScriptVersion(fileName: string): number {
            return this.fileInfos.get(fileName).getVersion();
        }

        public getScriptIsOpen(fileName: string): boolean {
            return this.fileInfos.get(fileName).getOpen();
        }

        public getScriptByteOrderMark(fileName: string): ByteOrderMark {
            return ByteOrderMark.None;
        }

        public getDiagnosticsObject(): Services.ILanguageServicesDiagnostics {
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
        }

        public getScriptSnapshot(fileName: string): TypeScript.IScriptSnapshot {
            return this.fileInfos.get(fileName).getScriptSnapshot();
        }

        public resolveRelativePath(path: string, directory: string): string {
            return IO.resolvePath(path);
        }

        public fileExists(path: string): boolean {
            return IO.fileExists(path);
        }

        public directoryExists(path: string): boolean {
            return IO.directoryExists(path);
        }

        public getParentDirectory(path: string): string {
            return IO.dirName(path);
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

        private byteOrderMark: ByteOrderMark;
        private changes: TypeScript.TextChangeRange[];
        private contents: string;
        private open: boolean;

        constructor(byteOrderMark: ByteOrderMark, contents: string) {
            this.byteOrderMark = byteOrderMark;
            this.changes = [];
            this.contents = contents;
            this.open = false;
        }

        public editContents(offset: number, length: number, text: string): void {
            var prefix = this.contents.substring(0, offset);
            var suffix = this.contents.substring(offset + length);
            var newContents = prefix + text + suffix;
            var span = new TypeScript.TextSpan(offset, length);
            var change = new TypeScript.TextChangeRange(span, text.length);

            this.contents = newContents;

            this.changes.push(change);
        }

        public getOpen(): boolean {
            return this.open;
        }

        public setOpen(open: boolean) {
            this.open = open;
        }

        public getScriptSnapshot(): TypeScript.IScriptSnapshot {
            return new ScriptSnapshot(this.changes.slice(0), this.contents, this.getVersion());
        }

        public getVersion(): number {
            return this.changes.length;
        }

        public updateFile(fileInformation: FileInformation) {
            var newContents = fileInformation.contents;
            var span = new TypeScript.TextSpan(0, this.contents.length);
            var change = new TypeScript.TextChangeRange(span, newContents.length);

            this.byteOrderMark = fileInformation.byteOrderMark;
            this.contents = newContents;

            this.changes.push(change);
        }
    }
}
