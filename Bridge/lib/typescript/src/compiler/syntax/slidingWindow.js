var TypeScript;
(function (TypeScript) {
    var SlidingWindow = (function () {
        function SlidingWindow(source, window, defaultValue, sourceLength) {
            if (typeof sourceLength === "undefined") { sourceLength = -1; }
            this.source = source;
            this.window = window;
            this.defaultValue = defaultValue;
            this.sourceLength = sourceLength;
            this.windowCount = 0;
            this.windowAbsoluteStartIndex = 0;
            this.currentRelativeItemIndex = 0;
            this._pinCount = 0;
            this.firstPinnedAbsoluteIndex = -1;
        }
        SlidingWindow.prototype.windowAbsoluteEndIndex = function () {
            return this.windowAbsoluteStartIndex + this.windowCount;
        };

        SlidingWindow.prototype.addMoreItemsToWindow = function (argument) {
            if (this.sourceLength >= 0 && this.absoluteIndex() >= this.sourceLength) {
                return false;
            }

            if (this.windowCount >= this.window.length) {
                this.tryShiftOrGrowWindow();
            }

            var spaceAvailable = this.window.length - this.windowCount;
            var amountFetched = this.source.fetchMoreItems(argument, this.windowAbsoluteEndIndex(), this.window, this.windowCount, spaceAvailable);

            this.windowCount += amountFetched;
            return amountFetched > 0;
        };

        SlidingWindow.prototype.tryShiftOrGrowWindow = function () {
            var currentIndexIsPastWindowHalfwayPoint = this.currentRelativeItemIndex > (this.window.length >>> 1);

            var isAllowedToShift = this.firstPinnedAbsoluteIndex === -1 || this.firstPinnedAbsoluteIndex > this.windowAbsoluteStartIndex;

            if (currentIndexIsPastWindowHalfwayPoint && isAllowedToShift) {
                var shiftStartIndex = this.firstPinnedAbsoluteIndex === -1 ? this.currentRelativeItemIndex : this.firstPinnedAbsoluteIndex - this.windowAbsoluteStartIndex;

                var shiftCount = this.windowCount - shiftStartIndex;

                if (shiftCount > 0) {
                    TypeScript.ArrayUtilities.copy(this.window, shiftStartIndex, this.window, 0, shiftCount);
                }

                this.windowAbsoluteStartIndex += shiftStartIndex;

                this.windowCount -= shiftStartIndex;

                this.currentRelativeItemIndex -= shiftStartIndex;
            } else {
                TypeScript.ArrayUtilities.grow(this.window, this.window.length * 2, this.defaultValue);
            }
        };

        SlidingWindow.prototype.absoluteIndex = function () {
            return this.windowAbsoluteStartIndex + this.currentRelativeItemIndex;
        };

        SlidingWindow.prototype.isAtEndOfSource = function () {
            return this.absoluteIndex() >= this.sourceLength;
        };

        SlidingWindow.prototype.getAndPinAbsoluteIndex = function () {
            var absoluteIndex = this.absoluteIndex();
            var pinCount = this._pinCount++;
            if (pinCount === 0) {
                this.firstPinnedAbsoluteIndex = absoluteIndex;
            }

            return absoluteIndex;
        };

        SlidingWindow.prototype.releaseAndUnpinAbsoluteIndex = function (absoluteIndex) {
            this._pinCount--;
            if (this._pinCount === 0) {
                this.firstPinnedAbsoluteIndex = -1;
            }
        };

        SlidingWindow.prototype.rewindToPinnedIndex = function (absoluteIndex) {
            var relativeIndex = absoluteIndex - this.windowAbsoluteStartIndex;

            this.currentRelativeItemIndex = relativeIndex;
        };

        SlidingWindow.prototype.currentItem = function (argument) {
            if (this.currentRelativeItemIndex >= this.windowCount) {
                if (!this.addMoreItemsToWindow(argument)) {
                    return this.defaultValue;
                }
            }

            return this.window[this.currentRelativeItemIndex];
        };

        SlidingWindow.prototype.peekItemN = function (n) {
            while (this.currentRelativeItemIndex + n >= this.windowCount) {
                if (!this.addMoreItemsToWindow(null)) {
                    return this.defaultValue;
                }
            }

            return this.window[this.currentRelativeItemIndex + n];
        };

        SlidingWindow.prototype.moveToNextItem = function () {
            this.currentRelativeItemIndex++;
        };

        SlidingWindow.prototype.disgardAllItemsFromCurrentIndexOnwards = function () {
            this.windowCount = this.currentRelativeItemIndex;
        };

        SlidingWindow.prototype.setAbsoluteIndex = function (absoluteIndex) {
            if (this.absoluteIndex() === absoluteIndex) {
                return;
            }

            if (this._pinCount > 0) {
            }

            if (absoluteIndex >= this.windowAbsoluteStartIndex && absoluteIndex < this.windowAbsoluteEndIndex()) {
                this.currentRelativeItemIndex = (absoluteIndex - this.windowAbsoluteStartIndex);
            } else {
                this.windowAbsoluteStartIndex = absoluteIndex;

                this.windowCount = 0;

                this.currentRelativeItemIndex = 0;
            }
        };

        SlidingWindow.prototype.pinCount = function () {
            return this._pinCount;
        };
        return SlidingWindow;
    })();
    TypeScript.SlidingWindow = SlidingWindow;
})(TypeScript || (TypeScript = {}));
