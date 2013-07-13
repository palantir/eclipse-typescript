if (!String.prototype.trim) {
    (String.prototype.trim) = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

if (!Array.prototype.indexOf) {
    (Array.prototype.indexOf) = function (searchElement, fromIndex) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n != n) {
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}

if (!Array.prototype.filter) {
    (Array.prototype.filter) = function (fun, thisp) {
        "use strict";

        if (this == null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        var res = [];
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];
                if (fun.call(thisp, val, i, t))
                    res.push(val);
            }
        }

        return res;
    };
}

if (!Array.prototype.map) {
    (Array.prototype.map) = function (callback, thisArg) {
        var T = undefined, A, k;

        if (this == null) {
            throw new TypeError(" this is null or not defined");
        }

        var O = Object(this);

        var len = O.length >>> 0;

        if ({}.toString.call(callback) != "[object Function]") {
            throw new TypeError(callback + " is not a function");
        }

        if (thisArg) {
            T = thisArg;
        }

        A = new Array(len);

        k = 0;

        while (k < len) {
            var kValue, mappedValue;

            if (k in O) {
                kValue = O[k];

                mappedValue = callback.call(T, kValue, k, O);

                A[k] = mappedValue;
            }

            k++;
        }

        return A;
    };
}

if (!Array.prototype.reduce) {
    (Array.prototype.reduce) = function reduce(accumulator) {
        if (this === null || this === undefined)
            throw new TypeError("Object is null or undefined");
        var i = 0, l = this.length >> 0, curr;

        if (typeof accumulator !== "function")
            throw new TypeError("First argument is not callable");

        if (arguments.length < 2) {
            if (l === 0)
                throw new TypeError("Array length is 0 and no second argument");
            curr = this[0];
            i = 1;
        } else
            curr = arguments[1];

        while (i < l) {
            if (i in this)
                curr = accumulator.call(undefined, curr, this[i], i, this);
            ++i;
        }

        return curr;
    };
}

if (!Array.prototype.forEach) {
    (Array.prototype.forEach) = function (callback, thisArg) {
        var T, k;

        if (this == null) {
            throw new TypeError(" this is null or not defined");
        }

        var O = Object(this);

        var len = O.length >>> 0;

        if ({}.toString.call(callback) != "[object Function]") {
            throw new TypeError(callback + " is not a function");
        }

        if (thisArg) {
            T = thisArg;
        } else {
            T = undefined;
        }

        k = 0;

        while (k < len) {
            var kValue;

            if (k in O) {
                kValue = O[k];

                callback.call(T, kValue, k, O);
            }

            k++;
        }
    };
}

if (!Date.now) {
    (Date).now = function () {
        return (new Date()).getTime();
    };
}

if (!Array.prototype.some) {
    (Array.prototype.some) = function (fun) {
        "use strict";

        if (this == null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            var idx = i.toString();
            if (idx in t && fun.call(thisp, t[i], i, t))
                return true;
        }

        return false;
    };
}
