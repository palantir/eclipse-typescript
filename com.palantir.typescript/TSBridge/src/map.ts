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

module DataStructures {

    export class Map {

      private entries: any;
      private headEntry: Entry;

      constructor() {
        this.entries = {};

        // initialize a circular doubly linked list that allows quick access to the first or last entry
        this.headEntry = new Entry();
        this.headEntry.prev = this.headEntry;
        this.headEntry.next = this.headEntry;
      }

      public delete(key: any): bool {
        var stringKey = this.stringify(key);
        var entry = this.entries[stringKey];

        if (entry !== undefined) {
          // remove the entry from the linked list
          entry.prev.next = entry.next;
          entry.next.prev = entry.prev;

          // remove the entry from the map
          delete this.entries[stringKey];

          return true;
        }

        return false;
      }

      public get(key: any): any {
        var stringKey = this.stringify(key);
        var entry = this.entries[stringKey];

        if (entry !== undefined) {
          return entry.value;
        }

        return undefined;
      }

      public has(key: any): bool {
        var stringKey = this.stringify(key);
        var entry = this.entries[stringKey];

        return entry !== undefined;
      }

      public keys(): any[] {
        return this.array((entry) => entry.key);
      }

      public set(key: any, value: any): void {
        var stringKey = this.stringify(key);
        var entry = this.entries[stringKey];

        if (entry !== undefined) {
          entry.value = value;
        } else {
          entry = new Entry();
          entry.key = key;
          entry.value = value;

          // insert the entry into the linked list
          entry.prev = this.headEntry.prev;
          entry.next = this.headEntry;
          this.headEntry.prev.next = entry;
          this.headEntry.prev = entry;

          // insert the entry into the map
          this.entries[stringKey] = entry;
        }
      }

      public size() {
        return Object.keys(this.entries).length;
      }

      public values(): any[] {
        return this.array((entry) => entry.value);
      }

      private array(transform: (Entry) => any): any[] {
        var array = [];

        var entry = this.headEntry.next;
        while (entry !== this.headEntry) {
          array.push(transform(entry));

          entry = entry.next;
        }

        return array;
      }

      private stringify(key: any): string {
        var suffix = key;

        // use the key directly if it's already a string
        if (typeof suffix !== "string") {
          suffix = JSON.stringify(key);
        }

        return "key:" + suffix;
      }
    }

    class Entry {
      key: any;
      value: any;

      prev: Entry;
      next: Entry;
    }
}
