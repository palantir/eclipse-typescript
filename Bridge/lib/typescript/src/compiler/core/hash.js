var TypeScript;
(function (TypeScript) {
    var Hash = (function () {
        function Hash() {
        }
        Hash.computeFnv1aCharArrayHashCode = function (text, start, len) {
            var hashCode = Hash.FNV_BASE;
            var end = start + len;

            for (var i = start; i < end; i++) {
                hashCode = (hashCode ^ text[i]) * Hash.FNV_PRIME;
            }

            return hashCode;
        };

        Hash.computeSimple31BitCharArrayHashCode = function (key, start, len) {
            var hash = 0;

            for (var i = 0; i < len; i++) {
                var ch = key[start + i];

                hash = (((hash << 5) + hash) + ch) | 0;
            }

            return hash & 0x7FFFFFFF;
        };

        Hash.computeSimple31BitStringHashCode = function (key) {
            var hash = 0;

            var start = 0;
            var len = key.length;

            for (var i = 0; i < len; i++) {
                var ch = key.charCodeAt(start + i);

                hash = (((hash << 5) + hash) + ch) | 0;
            }

            return hash & 0x7FFFFFFF;
        };

        Hash.computeMurmur2CharArrayHashCode = function (key, start, len) {
            var m = 0x5bd1e995;
            var r = 24;

            var numberOfCharsLeft = len;
            var h = (0 ^ numberOfCharsLeft);

            var index = start;
            while (numberOfCharsLeft >= 2) {
                var c1 = key[index];
                var c2 = key[index + 1];

                var k = c1 | (c2 << 16);

                k *= m;
                k ^= k >> r;
                k *= m;

                h *= m;
                h ^= k;

                index += 2;
                numberOfCharsLeft -= 2;
            }

            if (numberOfCharsLeft === 1) {
                h ^= key[index];
                h *= m;
            }

            h ^= h >> 13;
            h *= m;
            h ^= h >> 15;

            return h;
        };

        Hash.computeMurmur2StringHashCode = function (key) {
            var m = 0x5bd1e995;
            var r = 24;

            var start = 0;
            var len = key.length;
            var numberOfCharsLeft = len;

            var h = (0 ^ numberOfCharsLeft);

            var index = start;
            while (numberOfCharsLeft >= 2) {
                var c1 = key.charCodeAt(index);
                var c2 = key.charCodeAt(index + 1);

                var k = c1 | (c2 << 16);

                k *= m;
                k ^= k >> r;
                k *= m;

                h *= m;
                h ^= k;

                index += 2;
                numberOfCharsLeft -= 2;
            }

            if (numberOfCharsLeft === 1) {
                h ^= key.charCodeAt(index);
                h *= m;
            }

            h ^= h >> 13;
            h *= m;
            h ^= h >> 15;

            return h;
        };

        Hash.getPrime = function (min) {
            for (var i = 0; i < Hash.primes.length; i++) {
                var num = Hash.primes[i];
                if (num >= min) {
                    return num;
                }
            }

            throw TypeScript.Errors.notYetImplemented();
        };

        Hash.expandPrime = function (oldSize) {
            var num = oldSize << 1;
            if (num > 2146435069 && 2146435069 > oldSize) {
                return 2146435069;
            }
            return Hash.getPrime(num);
        };

        Hash.combine = function (value, currentHash) {
            return (((currentHash << 5) + currentHash) + value) & 0x7FFFFFFF;
        };
        Hash.FNV_BASE = 2166136261;
        Hash.FNV_PRIME = 16777619;

        Hash.primes = [
            3,
            7,
            11,
            17,
            23,
            29,
            37,
            47,
            59,
            71,
            89,
            107,
            131,
            163,
            197,
            239,
            293,
            353,
            431,
            521,
            631,
            761,
            919,
            1103,
            1327,
            1597,
            1931,
            2333,
            2801,
            3371,
            4049,
            4861,
            5839,
            7013,
            8419,
            10103,
            12143,
            14591,
            17519,
            21023,
            25229,
            30293,
            36353,
            43627,
            52361,
            62851,
            75431,
            90523,
            108631,
            130363,
            156437,
            187751,
            225307,
            270371,
            324449,
            389357,
            467237,
            560689,
            672827,
            807403,
            968897,
            1162687,
            1395263,
            1674319,
            2009191,
            2411033,
            2893249,
            3471899,
            4166287,
            4999559,
            5999471,
            7199369
        ];
        return Hash;
    })();
    TypeScript.Hash = Hash;
})(TypeScript || (TypeScript = {}));
