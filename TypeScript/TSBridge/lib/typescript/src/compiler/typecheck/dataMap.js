var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    var DataMap = (function () {
        function DataMap() {
            this.map = {};
        }
        DataMap.prototype.link = function (id, data) {
            this.map[id] = data;
        };

        DataMap.prototype.unlink = function (id) {
            this.map[id] = undefined;
        };

        DataMap.prototype.read = function (id) {
            return this.map[id];
        };

        DataMap.prototype.flush = function () {
            this.map = {};
        };

        DataMap.prototype.unpatch = function () {
            return null;
        };
        return DataMap;
    })();
    TypeScript.DataMap = DataMap;

    var PatchedDataMap = (function (_super) {
        __extends(PatchedDataMap, _super);
        function PatchedDataMap(parent) {
            _super.call(this);
            this.parent = parent;
            this.diffs = {};
        }
        PatchedDataMap.prototype.link = function (id, data) {
            this.diffs[id] = data;
        };

        PatchedDataMap.prototype.unlink = function (id) {
            this.diffs[id] = undefined;
        };

        PatchedDataMap.prototype.read = function (id) {
            var data = this.diffs[id];

            if (data) {
                return data;
            }

            return this.parent.read(id);
        };

        PatchedDataMap.prototype.flush = function () {
            this.diffs = {};
        };

        PatchedDataMap.prototype.unpatch = function () {
            this.flush();
            return this.parent;
        };
        return PatchedDataMap;
    })(DataMap);
    TypeScript.PatchedDataMap = PatchedDataMap;
})(TypeScript || (TypeScript = {}));
