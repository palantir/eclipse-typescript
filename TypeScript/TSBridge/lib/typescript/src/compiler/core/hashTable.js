var TypeScript;
(function (TypeScript) {
    (function (Collections) {
        Collections.DefaultHashTableCapacity = 256;

        var HashTableEntry = (function () {
            function HashTableEntry(Key, Value, HashCode, Next) {
                this.Key = Key;
                this.Value = Value;
                this.HashCode = HashCode;
                this.Next = Next;
            }
            return HashTableEntry;
        })();

        var HashTable = (function () {
            function HashTable(capacity, hash, equals) {
                this.hash = hash;
                this.equals = equals;
                this.entries = [];
                this.count = 0;
                var size = TypeScript.Hash.getPrime(capacity);
                this.hash = hash;
                this.equals = equals;
                this.entries = TypeScript.ArrayUtilities.createArray(size, null);
            }
            HashTable.prototype.set = function (key, value) {
                this.addOrSet(key, value, false);
            };

            HashTable.prototype.add = function (key, value) {
                this.addOrSet(key, value, true);
            };

            HashTable.prototype.containsKey = function (key) {
                var hashCode = this.computeHashCode(key);
                var entry = this.findEntry(key, hashCode);
                return entry !== null;
            };

            HashTable.prototype.get = function (key) {
                var hashCode = this.computeHashCode(key);
                var entry = this.findEntry(key, hashCode);

                return entry === null ? null : entry.Value;
            };

            HashTable.prototype.computeHashCode = function (key) {
                var hashCode = this.hash === null ? key.hashCode() : this.hash(key);

                hashCode = hashCode & 0x7FFFFFFF;
                TypeScript.Debug.assert(hashCode > 0);

                return hashCode;
            };

            HashTable.prototype.addOrSet = function (key, value, throwOnExistingEntry) {
                var hashCode = this.computeHashCode(key);

                var entry = this.findEntry(key, hashCode);
                if (entry !== null) {
                    if (throwOnExistingEntry) {
                        throw TypeScript.Errors.argument('key', 'Key was already in table.');
                    }

                    entry.Key = key;
                    entry.Value = value;
                    return;
                }

                return this.addEntry(key, value, hashCode);
            };

            HashTable.prototype.findEntry = function (key, hashCode) {
                for (var e = this.entries[hashCode % this.entries.length]; e !== null; e = e.Next) {
                    if (e.HashCode === hashCode) {
                        var equals = this.equals === null ? key === e.Key : this.equals(key, e.Key);

                        if (equals) {
                            return e;
                        }
                    }
                }

                return null;
            };

            HashTable.prototype.addEntry = function (key, value, hashCode) {
                var index = hashCode % this.entries.length;

                var e = new HashTableEntry(key, value, hashCode, this.entries[index]);

                this.entries[index] = e;

                if (this.count === this.entries.length) {
                    this.grow();
                }

                this.count++;
                return e.Key;
            };

            HashTable.prototype.grow = function () {
                var newSize = TypeScript.Hash.expandPrime(this.entries.length);

                var oldEntries = this.entries;
                var newEntries = TypeScript.ArrayUtilities.createArray(newSize, null);

                this.entries = newEntries;

                for (var i = 0; i < oldEntries.length; i++) {
                    var e = oldEntries[i];

                    while (e !== null) {
                        var newIndex = e.HashCode % newSize;
                        var tmp = e.Next;
                        e.Next = newEntries[newIndex];
                        newEntries[newIndex] = e;
                        e = tmp;
                    }
                }
            };
            return HashTable;
        })();
        Collections.HashTable = HashTable;

        function createHashTable(capacity, hash, equals) {
            if (typeof capacity === "undefined") { capacity = Collections.DefaultHashTableCapacity; }
            if (typeof hash === "undefined") { hash = null; }
            if (typeof equals === "undefined") { equals = null; }
            return new HashTable(capacity, hash, equals);
        }
        Collections.createHashTable = createHashTable;

        var currentHashCode = 1;
        function identityHashCode(value) {
            if (value.__hash === undefined) {
                value.__hash = currentHashCode;
                currentHashCode++;
            }

            return value.__hash;
        }
        Collections.identityHashCode = identityHashCode;
    })(TypeScript.Collections || (TypeScript.Collections = {}));
    var Collections = TypeScript.Collections;
})(TypeScript || (TypeScript = {}));
