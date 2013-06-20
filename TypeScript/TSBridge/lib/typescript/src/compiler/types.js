var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var MemberName = (function () {
        function MemberName() {
            this.prefix = "";
            this.suffix = "";
        }
        MemberName.prototype.isString = function () {
            return false;
        };
        MemberName.prototype.isArray = function () {
            return false;
        };
        MemberName.prototype.isMarker = function () {
            return !this.isString() && !this.isArray();
        };

        MemberName.prototype.toString = function () {
            return MemberName.memberNameToString(this);
        };

        MemberName.memberNameToString = function (memberName, markerInfo, markerBaseLength) {
            if (typeof markerBaseLength === "undefined") { markerBaseLength = 0; }
            var result = memberName.prefix;

            if (memberName.isString()) {
                result += (memberName).text;
            } else if (memberName.isArray()) {
                var ar = memberName;
                for (var index = 0; index < ar.entries.length; index++) {
                    if (ar.entries[index].isMarker()) {
                        if (markerInfo) {
                            markerInfo.push(markerBaseLength + result.length);
                        }
                        continue;
                    }

                    result += MemberName.memberNameToString(ar.entries[index], markerInfo, markerBaseLength + result.length);
                    result += ar.delim;
                }
            }

            result += memberName.suffix;
            return result;
        };

        MemberName.create = function (arg1, arg2, arg3) {
            if (typeof arg1 === "string") {
                return new MemberNameString(arg1);
            } else {
                var result = new MemberNameArray();
                if (arg2)
                    result.prefix = arg2;
                if (arg3)
                    result.suffix = arg3;
                result.entries.push(arg1);
                return result;
            }
        };
        return MemberName;
    })();
    TypeScript.MemberName = MemberName;

    var MemberNameString = (function (_super) {
        __extends(MemberNameString, _super);
        function MemberNameString(text) {
            _super.call(this);
            this.text = text;
        }
        MemberNameString.prototype.isString = function () {
            return true;
        };
        return MemberNameString;
    })(MemberName);
    TypeScript.MemberNameString = MemberNameString;

    var MemberNameArray = (function (_super) {
        __extends(MemberNameArray, _super);
        function MemberNameArray() {
            _super.call(this);
            this.delim = "";
            this.entries = [];
        }
        MemberNameArray.prototype.isArray = function () {
            return true;
        };

        MemberNameArray.prototype.add = function (entry) {
            this.entries.push(entry);
        };

        MemberNameArray.prototype.addAll = function (entries) {
            for (var i = 0; i < entries.length; i++) {
                this.entries.push(entries[i]);
            }
        };
        return MemberNameArray;
    })(MemberName);
    TypeScript.MemberNameArray = MemberNameArray;
})(TypeScript || (TypeScript = {}));
