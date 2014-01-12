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

module Bridge {

    export class FileInfo {

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

        public getByteOrderMark(): TypeScript.ByteOrderMark {
            return this.byteOrderMark;
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
