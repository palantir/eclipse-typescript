var TypeScript;
(function (TypeScript) {
    (function (Collections) {
        Collections.DefaultStringTableCapacity = 256;

        var StringTableEntry = (function () {
            function StringTableEntry(Text, HashCode, Next) {
                this.Text = Text;
                this.HashCode = HashCode;
                this.Next = Next;
            }
            return StringTableEntry;
        })();

        var StringTable = (function () {
            function StringTable(capacity) {
                this.entries = [];
                this.count = 0;
                var size = TypeScript.Hash.getPrime(capacity);
                this.entries = TypeScript.ArrayUtilities.createArray(size, null);
            }
            StringTable.prototype.addCharArray = function (key, start, len) {
                var hashCode = TypeScript.Hash.computeSimple31BitCharArrayHashCode(key, start, len) & 0x7FFFFFFF;

                var entry = this.findCharArrayEntry(key, start, len, hashCode);
                if (entry !== null) {
                    return entry.Text;
                }

                var slice = key.slice(start, start + len);
                return this.addEntry(TypeScript.StringUtilities.fromCharCodeArray(slice), hashCode);
            };

            StringTable.prototype.findCharArrayEntry = function (key, start, len, hashCode) {
                for (var e = this.entries[hashCode % this.entries.length]; e !== null; e = e.Next) {
                    if (e.HashCode === hashCode && StringTable.textCharArrayEquals(e.Text, key, start, len)) {
                        return e;
                    }
                }

                return null;
            };

            StringTable.prototype.addEntry = function (text, hashCode) {
                var index = hashCode % this.entries.length;

                var e = new StringTableEntry(text, hashCode, this.entries[index]);

                this.entries[index] = e;

                if (this.count === this.entries.length) {
                    this.grow();
                }

                this.count++;
                return e.Text;
            };

            StringTable.prototype.grow = function () {
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

            StringTable.textCharArrayEquals = function (text, array, start, length) {
                if (text.length !== length) {
                    return false;
                }

                var s = start;
                for (var i = 0; i < length; i++) {
                    if (text.charCodeAt(i) !== array[s]) {
                        return false;
                    }

                    s++;
                }

                return true;
            };
            return StringTable;
        })();
        Collections.StringTable = StringTable;

        Collections.DefaultStringTable = new StringTable(Collections.DefaultStringTableCapacity);
    })(TypeScript.Collections || (TypeScript.Collections = {}));
    var Collections = TypeScript.Collections;
})(TypeScript || (TypeScript = {}));
