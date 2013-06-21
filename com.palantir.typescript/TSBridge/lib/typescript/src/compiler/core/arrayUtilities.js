var TypeScript;
(function (TypeScript) {
    var ArrayUtilities = (function () {
        function ArrayUtilities() {
        }
        ArrayUtilities.isArray = function (value) {
            return Object.prototype.toString.apply(value, []) === '[object Array]';
        };

        ArrayUtilities.sequenceEquals = function (array1, array2, equals) {
            if (array1 === array2) {
                return true;
            }

            if (array1 === null || array2 === null) {
                return false;
            }

            if (array1.length !== array2.length) {
                return false;
            }

            for (var i = 0, n = array1.length; i < n; i++) {
                if (!equals(array1[i], array2[i])) {
                    return false;
                }
            }

            return true;
        };

        ArrayUtilities.contains = function (array, value) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === value) {
                    return true;
                }
            }

            return false;
        };

        ArrayUtilities.groupBy = function (array, func) {
            var result = {};

            for (var i = 0, n = array.length; i < n; i++) {
                var v = array[i];
                var k = func(v);

                var list = result[k] || [];
                list.push(v);
                result[k] = list;
            }

            return result;
        };

        ArrayUtilities.min = function (array, func) {
            var min = func(array[0]);

            for (var i = 1; i < array.length; i++) {
                var next = func(array[i]);
                if (next < min) {
                    min = next;
                }
            }

            return min;
        };

        ArrayUtilities.max = function (array, func) {
            var max = func(array[0]);

            for (var i = 1; i < array.length; i++) {
                var next = func(array[i]);
                if (next > max) {
                    max = next;
                }
            }

            return max;
        };

        ArrayUtilities.last = function (array) {
            if (array.length === 0) {
                throw TypeScript.Errors.argumentOutOfRange('array');
            }

            return array[array.length - 1];
        };

        ArrayUtilities.firstOrDefault = function (array, func) {
            for (var i = 0, n = array.length; i < n; i++) {
                var value = array[i];
                if (func(value)) {
                    return value;
                }
            }

            return null;
        };

        ArrayUtilities.sum = function (array, func) {
            var result = 0;

            for (var i = 0, n = array.length; i < n; i++) {
                result += func(array[i]);
            }

            return result;
        };

        ArrayUtilities.whereNotNull = function (array) {
            var result = [];
            for (var i = 0; i < array.length; i++) {
                var value = array[i];
                if (value !== null) {
                    result.push(value);
                }
            }

            return result;
        };

        ArrayUtilities.select = function (values, func) {
            var result = [];

            for (var i = 0; i < values.length; i++) {
                result.push(func(values[i]));
            }

            return result;
        };

        ArrayUtilities.where = function (values, func) {
            var result = [];

            for (var i = 0; i < values.length; i++) {
                if (func(values[i])) {
                    result.push(values[i]);
                }
            }

            return result;
        };

        ArrayUtilities.any = function (array, func) {
            for (var i = 0, n = array.length; i < n; i++) {
                if (func(array[i])) {
                    return true;
                }
            }

            return false;
        };

        ArrayUtilities.all = function (array, func) {
            for (var i = 0, n = array.length; i < n; i++) {
                if (!func(array[i])) {
                    return false;
                }
            }

            return true;
        };

        ArrayUtilities.binarySearch = function (array, value) {
            var low = 0;
            var high = array.length - 1;

            while (low <= high) {
                var middle = low + ((high - low) >> 1);
                var midValue = array[middle];

                if (midValue === value) {
                    return middle;
                } else if (midValue > value) {
                    high = middle - 1;
                } else {
                    low = middle + 1;
                }
            }

            return ~low;
        };

        ArrayUtilities.createArray = function (length, defaultvalue) {
            var result = [];
            for (var i = 0; i < length; i++) {
                result.push(defaultvalue);
            }

            return result;
        };

        ArrayUtilities.grow = function (array, length, defaultValue) {
            var count = length - array.length;
            for (var i = 0; i < count; i++) {
                array.push(defaultValue);
            }
        };

        ArrayUtilities.copy = function (sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
            for (var i = 0; i < length; i++) {
                destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
            }
        };
        return ArrayUtilities;
    })();
    TypeScript.ArrayUtilities = ArrayUtilities;
})(TypeScript || (TypeScript = {}));
