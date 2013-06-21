var global = Function("return this").call(null);

var TypeScript;
(function (TypeScript) {
    var Clock;
    (function (Clock) {
        Clock.now;
        Clock.resolution;

        if (typeof WScript !== "undefined" && typeof global['WScript'].InitializeProjection !== "undefined") {
            global['WScript'].InitializeProjection();

            Clock.now = function () {
                return TestUtilities.QueryPerformanceCounter();
            };

            Clock.resolution = TestUtilities.QueryPerformanceFrequency();
        } else {
            Clock.now = function () {
                return Date.now();
            };

            Clock.resolution = 1000;
        }
    })(Clock || (Clock = {}));

    var Timer = (function () {
        function Timer() {
            this.time = 0;
        }
        Timer.prototype.start = function () {
            this.time = 0;
            this.startTime = Clock.now();
        };

        Timer.prototype.end = function () {
            this.time = (Clock.now() - this.startTime);
        };
        return Timer;
    })();
    TypeScript.Timer = Timer;
})(TypeScript || (TypeScript = {}));
