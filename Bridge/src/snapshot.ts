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

module Bridge {

    export class ScriptSnapshot implements TypeScript.IScriptSnapshot {

        private changes: TypeScript.TextChangeRange[];
        private contents: string;
        private lineStartPositions: number[];
        private version: number;

        constructor(changes: TypeScript.TextChangeRange[], contents: string, version: number) {
            this.changes = changes;
            this.contents = contents;
            this.lineStartPositions = TypeScript.TextUtilities.parseLineStarts(this.contents);
            this.version = version;
        }

        public getText(start: number, end: number): string {
            return this.contents.substring(start, end);
        }

        public getLength(): number {
            return this.contents.length;
        }

        public getLineStartPositions(): number[] {
            return this.lineStartPositions;
        }

        public getTextChangeRangeSinceVersion(version: number): TypeScript.TextChangeRange {
            if (this.version === version) {
                return TypeScript.TextChangeRange.unchanged;
            } else if (this.version - version <= this.changes.length) {
                var start = this.changes.length - (this.version - version);
                var changes = this.changes.slice(start);

                return TypeScript.TextChangeRange.collapseChangesAcrossMultipleVersions(changes);
            } else {
                return null;
            }
        }
    }
}
