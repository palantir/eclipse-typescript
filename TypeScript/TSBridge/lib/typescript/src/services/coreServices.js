var debugObjectHost = (this);

var Services;
(function (Services) {
    var CoreServices = (function () {
        function CoreServices(host) {
            this.host = host;
        }
        CoreServices.prototype.getPreProcessedFileInfo = function (fileName, sourceText) {
            var settings = new TypeScript.CompilationSettings();
            settings.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;
            var result = TypeScript.preProcessFile(fileName, sourceText, settings);
            return result;
        };

        CoreServices.prototype.getDefaultCompilationSettings = function () {
            var settings = new TypeScript.CompilationSettings();
            settings.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;
            return settings;
        };

        CoreServices.prototype.dumpMemory = function () {
            if (!debugObjectHost || !debugObjectHost.Debug || !debugObjectHost.Debug.dumpHeap) {
                throw new Error("This version of the Javascript runtime doesn't support the 'Debug.dumpHeap()' function.");
            }

            var objects = debugObjectHost.Debug.dumpHeap(2);
            var totalSize = 0;
            for (var i = 0; i < objects.length; i++) {
                totalSize += objects[i].size;
            }

            return "There are " + objects.length + " object(s) accessible from 'global', for a total of " + totalSize + " byte(s).";
        };

        CoreServices.prototype.getMemoryInfo = function () {
            if (!debugObjectHost || !debugObjectHost.Debug || !debugObjectHost.Debug.getMemoryInfo) {
                throw new Error("This version of the Javascript runtime doesn't support the 'Debug.getMemoryInfo()' function.");
            }

            return debugObjectHost.Debug.getMemoryInfo();
        };

        CoreServices.prototype.collectGarbage = function () {
            if (!debugObjectHost || !debugObjectHost.CollectGarbage) {
                throw new Error("This version of the Javascript runtime doesn't support the 'CollectGarbage()' function.");
            }

            debugObjectHost.CollectGarbage();
        };
        return CoreServices;
    })();
    Services.CoreServices = CoreServices;
})(Services || (Services = {}));
