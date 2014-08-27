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

    export var LIB_FILE_NAME = "lib.d.ts";

    export class LanguageServiceHost implements TypeScript.Services.ILanguageServiceHost {

        private compilationSettings: TypeScript.CompilationSettings;
        private fileFilter: (fileName: string) => boolean;
        private fileInfos: { [fileName: string]: FileInfo };

        constructor(
                compilationSettings: TypeScript.CompilationSettings,
                fileFilter: (fileName: string) => boolean,
                fileInfos: { [fileName: string]: FileInfo }) {

            this.compilationSettings = compilationSettings;
            this.fileFilter = fileFilter;
            this.fileInfos = fileInfos;
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
            return Object.getOwnPropertyNames(this.fileInfos).filter((fileName) => {
                // include the default library definition file if its enabled
                if (fileName === LIB_FILE_NAME) {
                    return !this.compilationSettings.noLib;
                }

                return this.fileFilter(fileName);
            });
        }

        public getScriptVersion(fileName: string): number {
            return this.fileInfos[fileName].getVersion();
        }

        public getScriptIsOpen(fileName: string): boolean {
            return this.fileInfos[fileName].getOpen();
        }

        public getDiagnosticsObject(): TypeScript.Services.ILanguageServicesDiagnostics {
            return {
                log: (message: string) => {
                    // does nothing
                }
            }
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
            var resolvedPath = path;

            if (!isEmpty(directory)) {
                while (path.indexOf("../") === 0) {
                    var index = directory.lastIndexOf("/");
                    directory = directory.substring(0, index);
                    path = path.substring(3, path.length);
                }

                resolvedPath = directory + "/" + path;
            }

            return resolvedPath;
        }

        public fileExists(path: string): boolean {
            return this.fileInfos[path] != null;
        }

        public directoryExists(path: string): boolean {
            return false;
        }

        public getParentDirectory(path: string): string {
            var index = path.lastIndexOf("/");

            return path.substring(0, index);
        }
    }

    function isEmpty(str: string) {
        return (str == null || str.length == 0);
    }
}
