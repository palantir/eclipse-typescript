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

    export class LanguageServiceHost implements TypeScript.Services.ILanguageServiceHost {

        private compilationSettings: TypeScript.CompilationSettings;
        private diagnostics: TypeScript.Services.ILanguageServicesDiagnostics;
        private fileInfos: Map<string, FileInfo>;

        constructor() {
            this.compilationSettings = new TypeScript.CompilationSettings();
            this.diagnostics = new LanguageServicesDiagnostics();
            this.fileInfos = new Map<string, FileInfo>();
        }

        public addDefaultLibrary(libraryContents: string) {
            var fileInfo = new FileInfo(TypeScript.ByteOrderMark.None, libraryContents, null);

            this.fileInfos.set("lib.d.ts", fileInfo);
        }

        public removeDefaultLibrary() {
            this.fileInfos.delete("lib.d.ts");
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
                    this.fileInfos.set(fileName, fileInfo);
                }
            }
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
                                var fileInformation = TypeScript.IO.readFile(fileInfo.getPath(), null);

                                fileInfo.updateFile(fileInformation);
                            }
                        } else {
                            var filePath = delta.filePath;
                            var fileInformation = TypeScript.IO.readFile(filePath, null);

                            fileInfo = new FileInfo(fileInformation.byteOrderMark, fileInformation.contents, filePath);

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

        public getScriptByteOrderMark(fileName: string): TypeScript.ByteOrderMark {
            return TypeScript.ByteOrderMark.None;
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
            return this.fileInfos.get(fileName).getScriptSnapshot();
        }

        public resolveRelativePath(path: string, directory: string): string {
            return TypeScript.IO.resolvePath(path);
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

    class FileInfo {

        private byteOrderMark: TypeScript.ByteOrderMark;
        private changes: TypeScript.TextChangeRange[];
        private contents: string;
        private open: boolean;
        private path: string;

        constructor(byteOrderMark: TypeScript.ByteOrderMark, contents: string, path: string) {
            this.byteOrderMark = byteOrderMark;
            this.changes = [];
            this.contents = contents;
            this.open = false;
            this.path = path;
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

        public getPath() {
            return this.path;
        }

        public getScriptSnapshot(): TypeScript.IScriptSnapshot {
            return new ScriptSnapshot(this.changes.slice(0), this.contents, this.getVersion());
        }

        public getVersion(): number {
            return this.changes.length;
        }

        public updateFile(fileInformation: TypeScript.FileInformation) {
            var newContents = fileInformation.contents;
            var span = new TypeScript.TextSpan(0, this.contents.length);
            var change = new TypeScript.TextChangeRange(span, newContents.length);

            this.byteOrderMark = fileInformation.byteOrderMark;
            this.contents = newContents;

            this.changes.push(change);
        }
    }
}
