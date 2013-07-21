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

    export class Map<K, V> {

        private entries: any;
        private headEntry: Entry<K, V>;

        // if true, the iteration is ordered from least recent access to most recent access
        private accessOrder: boolean;

        constructor(accessOrder: boolean = false) {
        	this.accessOrder = accessOrder;
            this.entries = {};

            // initialize a circular doubly linked list that allows quick access to the first or last entry
            // and also maintains order of entries
            this.headEntry = new Entry();
            this.headEntry.prev = this.headEntry;
            this.headEntry.next = this.headEntry;
        }

        public delete(key: K): boolean {
            var stringKey = this.stringify(key);
            var entry = this.entries[stringKey];

            if (entry !== undefined) {
                // remove the entry from the linked list
                this.removeFromList(entry);

                // remove the entry from the map
                delete this.entries[stringKey];

                return true;
            }

            return false;
        }

        public get(key: K): V {
            var stringKey = this.stringify(key);
            var entry = this.entries[stringKey];

            if (entry !== undefined) {

                if (this.accessOrder) {
                    this.recordAccess(entry);
                }

                return entry.value;
            }

            return undefined;
        }

        public has(key: K): boolean {
            var stringKey = this.stringify(key);
            var entry = this.entries[stringKey];

            return entry !== undefined;
        }

        public keys(): K[] {
            return this.array((entry) => entry.key);
        }

        public set(key: K, value: V): void {
            var stringKey = this.stringify(key);
            var entry = this.entries[stringKey];

            if (entry !== undefined) {
                entry.value = value;

                if (this.recordAccess) {
                    this.recordAccess(entry);
                }
            } else {
                entry = new Entry();
                entry.key = key;
                entry.value = value;

                // insert the entry at the end of the list and into the map
                this.pushIntoList(entry);
                this.entries[stringKey] = entry;
            }
        }

        public size() {
            return Object.keys(this.entries).length;
        }

        public values(): V[] {
            return this.array((entry) => entry.value);
        }

        private array<T>(transform: (Entry) => T): T[] {
            var array = [];

            var entry = this.headEntry.next;
            while (entry !== this.headEntry) {
                array.push(transform(entry));

                entry = entry.next;
            }

            return array;
        }

        private pushIntoList(entry: Entry<K, V>) {
            // insert the entry as the last entry of the linked list (just before head)
            entry.prev = this.headEntry.prev;
            entry.next = this.headEntry;
            this.headEntry.prev.next = entry;
            this.headEntry.prev = entry;
        }

        private removeFromList(entry: Entry<K, V>) {
            entry.prev.next = entry.next;
            entry.next.prev = entry.prev;
        }

        private recordAccess(entry: Entry<K, V>) {
            this.removeFromList(entry);
            this.pushIntoList(entry);
        }

        private stringify(key: K): string {
            var suffix;

            // use the key directly if it's already a string
            if (typeof suffix === "string") {
                suffix = key;
            } else {
                suffix = JSON.stringify(key);
            }

            return "key:" + suffix;
        }
    }

    class Entry<K, V> {
        key: K;
        value: V;

        prev: Entry<K, V>;
        next: Entry<K, V>;
    }
}