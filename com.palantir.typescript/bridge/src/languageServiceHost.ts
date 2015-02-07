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

/// <reference path="fileInfo.ts" />
/// <reference path="logger.ts" />
/// <reference path="snapshot.ts" />

module Bridge {

    export var LIB_FILE_NAME = "lib.d.ts";
    export var LIB_ES6_FILE_NAME = "lib.es6.d.ts";

    export class LanguageServiceHost extends Logger implements ts.LanguageServiceHost {

        private compilationSettings: ts.CompilerOptions;
        private fileFilter: (fileName: string) => boolean;
        private fileInfos: { [fileName: string]: FileInfo };

        constructor(
                compilationSettings: ts.CompilerOptions,
                fileFilter: (fileName: string) => boolean,
                fileInfos: { [fileName: string]: FileInfo }) {
            super();

            this.compilationSettings = compilationSettings;
            this.fileFilter = fileFilter;
            this.fileInfos = fileInfos;
        }

        public getCompilationSettings() {
            return this.compilationSettings;
        }

        public getScriptFileNames() {
            return Object.getOwnPropertyNames(this.fileInfos).filter((fileName) => {
                // include the default library definition file if its enabled
                if (fileName === LIB_FILE_NAME || fileName === LIB_ES6_FILE_NAME) {
                    return !this.compilationSettings.noLib;
                }

                return this.fileFilter(fileName);
            });
        }

        public getScriptVersion(fileName: string) {
            return this.fileInfos[fileName].getVersion();
        }

        public getScriptIsOpen(fileName: string) {
            return this.fileInfos[fileName].getOpen();
        }

        public getScriptSnapshot(fileName: string) {
            return this.fileInfos[fileName].getSnapshot();
        }

        public getCurrentDirectory() {
            return "";
        }

        public getDefaultLibFilename(options: ts.CompilerOptions) {
            return (options.target === ts.ScriptTarget.ES6 ? LIB_ES6_FILE_NAME : LIB_FILE_NAME);
        }
    }
}
