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
/// <reference path="snapshot.ts" />

namespace Bridge {

    export const LIB_FILE_NAME = "lib.d.ts";
    export const LIB_ES6_FILE_NAME = "lib.es6.d.ts";

    const EOL = require("os").EOL;

    export class LanguageServiceHost implements ts.LanguageServiceHost {

        private compilationSettings: ts.CompilerOptions;
        private fileFilter: (fileName: string) => boolean;
        private fileInfos: { [fileName: string]: FileInfo };

        constructor(
                compilationSettings: ts.CompilerOptions,
                fileFilter: (fileName: string) => boolean,
                fileInfos: { [fileName: string]: FileInfo }) {

            this.compilationSettings = compilationSettings;
            this.fileFilter = fileFilter;
            this.fileInfos = fileInfos;
        }

        public getCompilationSettings() {
            return this.compilationSettings;
        }

        public getCurrentDirectory() {
            return "";
        }

        public getDefaultLibFileName(options: ts.CompilerOptions) {
            return ts.getDefaultLibFileName(options);
        }

        public getNewLine() {
            return EOL;
        }

        public getScriptFileNames() {
            return Object.getOwnPropertyNames(this.fileInfos).filter(this.fileFilter);
        }

        public getScriptSnapshot(fileName: string) {
            var fileInfo = this.fileInfos[fileName];

            // return undefined if the file is not found to indicate it does not exist
            // for more info, please see https://github.com/Microsoft/TypeScript/commit/9628191a1476bc0dbdb28bfd30b840656ffc26a3
            if (fileInfo == null) {
                return undefined;
            }

            return fileInfo.getSnapshot();
        }

        public getScriptVersion(fileName: string) {
            return this.fileInfos[fileName].getVersion();
        }
    }
}
