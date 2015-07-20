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

namespace Bridge {

    export class ScriptSnapshot implements ts.IScriptSnapshot {

        private changes: ts.TextChangeRange[];
        private contents: string;
        private version: number;

        constructor(changes: ts.TextChangeRange[], contents: string, version: number) {
            this.changes = changes;
            this.contents = contents;
            this.version = version;
        }

        public getText(start: number, end: number) {
            return this.contents.substring(start, end);
        }

        public getLength() {
            return this.contents.length;
        }

        public getChangeRange(oldSnapshot: ts.IScriptSnapshot): ts.TextChangeRange {
            var oldSnapshot2 = <ScriptSnapshot> oldSnapshot;

            if (this.version === oldSnapshot2.version) {
                return ts.unchangedTextChangeRange;
            } else if (this.version - oldSnapshot2.version <= this.changes.length) {
                var start = this.changes.length - (this.version - oldSnapshot2.version);
                var changes = this.changes.slice(start);

                return ts.collapseTextChangeRangesAcrossMultipleVersions(changes);
            } else {
                return null;
            }
        }
    }
}
