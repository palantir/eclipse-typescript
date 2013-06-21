var TypeScript;
(function (TypeScript) {
    var BloomFilter = (function () {
        function BloomFilter(expectedCount) {
            var m = Math.max(1, BloomFilter.computeM(expectedCount));
            var k = Math.max(1, BloomFilter.computeK(expectedCount));
            ;

            var sizeInEvenBytes = (m + 7) & ~7;

            this.bitArray = [];
            for (var i = 0, len = sizeInEvenBytes; i < len; i++) {
                this.bitArray[i] = false;
            }
            this.hashFunctionCount = k;
        }
        BloomFilter.computeM = function (expectedCount) {
            var p = BloomFilter.falsePositiveProbability;
            var n = expectedCount;

            var numerator = n * Math.log(p);
            var denominator = Math.log(1.0 / Math.pow(2.0, Math.log(2.0)));
            return Math.ceil(numerator / denominator);
        };

        BloomFilter.computeK = function (expectedCount) {
            var n = expectedCount;
            var m = BloomFilter.computeM(expectedCount);

            var temp = Math.log(2.0) * m / n;
            return Math.round(temp);
        };

        BloomFilter.prototype.computeHash = function (key, seed) {
            var m = 0x5bd1e995;
            var r = 24;

            var numberOfCharsLeft = key.length;
            var h = Math.abs(seed ^ numberOfCharsLeft);

            var index = 0;
            while (numberOfCharsLeft >= 2) {
                var c1 = this.getCharacter(key, index);
                var c2 = this.getCharacter(key, index + 1);

                var k = Math.abs(c1 | (c2 << 16));

                k = TypeScript.IntegerUtilities.integerMultiplyLow32Bits(k, m);
                k ^= k >> r;
                k = TypeScript.IntegerUtilities.integerMultiplyLow32Bits(k, m);

                h = TypeScript.IntegerUtilities.integerMultiplyLow32Bits(h, m);
                h ^= k;

                index += 2;
                numberOfCharsLeft -= 2;
            }

            if (numberOfCharsLeft == 1) {
                h ^= this.getCharacter(key, index);
                h = TypeScript.IntegerUtilities.integerMultiplyLow32Bits(h, m);
            }

            h ^= h >> 13;
            h = TypeScript.IntegerUtilities.integerMultiplyLow32Bits(h, m);
            h ^= h >> 15;

            return Math.round(h);
        };

        BloomFilter.prototype.getCharacter = function (key, index) {
            return key.charCodeAt(index);
        };

        BloomFilter.prototype.addKeys = function (keys) {
            for (var name in keys) {
                this.add(name);
            }
        };

        BloomFilter.prototype.add = function (value) {
            for (var i = 0; i < this.hashFunctionCount; i++) {
                var hash = this.computeHash(value, i);
                hash = hash % this.bitArray.length;
                this.bitArray[Math.abs(hash)] = true;
            }
        };

        BloomFilter.prototype.probablyContains = function (value) {
            for (var i = 0; i < this.hashFunctionCount; i++) {
                var hash = this.computeHash(value, i);
                hash = hash % this.bitArray.length;
                if (!this.bitArray[Math.abs(hash)]) {
                    return false;
                }
            }

            return true;
        };

        BloomFilter.prototype.isEquivalent = function (filter) {
            return BloomFilter.isEquivalent(this.bitArray, filter.bitArray) && this.hashFunctionCount == filter.hashFunctionCount;
        };

        BloomFilter.isEquivalent = function (array1, array2) {
            if (array1.length != array2.length) {
                return false;
            }

            for (var i = 0; i < array1.length; i++) {
                if (array1[i] != array2[i]) {
                    return false;
                }
            }

            return true;
        };
        BloomFilter.falsePositiveProbability = 0.0001;
        return BloomFilter;
    })();
    TypeScript.BloomFilter = BloomFilter;
})(TypeScript || (TypeScript = {}));
