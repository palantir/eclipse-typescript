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

        private static MAX_CHANGES = 100;

        private version: number;
        private open: boolean;
        private content: string;
        private changes: TypeScript.TextChangeRange[];
        private lineStartPositions: number[];

        constructor(private fileContent: string) {
            this.version = 0;
            this.open = true;
            this.updateContent(fileContent);
        }

        public updateContent(content: string, resetChanges: boolean = true): void {
            if (resetChanges) {
                this.changes = [];
            }
            this.content = content;
            this.lineStartPositions = TypeScript.TextUtilities.parseLineStarts(TypeScript.SimpleText.fromString(this.content));
            this.version++;
        }

        public getVersion(): number {
            return this.version;
        }

        public isOpen(): boolean {
            return this.open;
        }

        public setOpen(): void {
            this.open = true;
        }

        public setClosed(): void {
            this.open = false;
        }

        public addEdit(offset: number, length: number, replacementText: string): void {
            if (this.changes.length >= ScriptSnapshot.MAX_CHANGES) {
                this.changes = [];
            }
            var beforeEdit = this.content.substring(0, offset);
            var afterEdit = this.content.substring(offset + length, this.content.length);
            var newContent = beforeEdit + replacementText + afterEdit;
            var textChangeRange = new TypeScript.TextChangeRange(TypeScript.TextSpan.fromBounds(offset, offset + length), replacementText.length);
            this.changes.push(textChangeRange);
            this.updateContent(newContent, false);
        }

        public getText(start: number, end: number): string {
            return this.content.substring(start, end);
        }

        public getLength(): number {
            return this.content.length;
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