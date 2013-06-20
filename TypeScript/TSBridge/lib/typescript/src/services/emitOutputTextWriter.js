var Services;
(function (Services) {
    var EmitOutputTextWriter = (function () {
        function EmitOutputTextWriter(name, writeByteOrderMark) {
            this.name = name;
            this.writeByteOrderMark = writeByteOrderMark;
            this.useUTF8encoding = writeByteOrderMark;
            this.text = "";
        }
        EmitOutputTextWriter.prototype.Write = function (s) {
            this.text += s;
        };

        EmitOutputTextWriter.prototype.WriteLine = function (s) {
            this.text += s + '\n';
        };

        EmitOutputTextWriter.prototype.Close = function () {
        };
        return EmitOutputTextWriter;
    })();
    Services.EmitOutputTextWriter = EmitOutputTextWriter;
})(Services || (Services = {}));
