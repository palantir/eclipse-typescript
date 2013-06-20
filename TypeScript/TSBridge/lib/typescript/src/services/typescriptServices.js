var Services;
(function (Services) {
    function copyDataObject(dst, src) {
        for (var e in dst) {
            if (typeof dst[e] == "object") {
                copyDataObject(dst[e], src[e]);
            } else if (typeof dst[e] != "function") {
                dst[e] = src[e];
            }
        }
        return dst;
    }
    Services.copyDataObject = copyDataObject;

    function compareDataObjects(dst, src) {
        for (var e in dst) {
            if (typeof dst[e] == "object") {
                if (!compareDataObjects(dst[e], src[e]))
                    return false;
            } else if (typeof dst[e] != "function") {
                if (dst[e] !== src[e])
                    return false;
            }
        }
        return true;
    }
    Services.compareDataObjects = compareDataObjects;

    var TypeScriptServicesFactory = (function () {
        function TypeScriptServicesFactory() {
            this._shims = [];
        }
        TypeScriptServicesFactory.prototype.createPullLanguageService = function (host) {
            try  {
                return new Services.LanguageService(host);
            } catch (err) {
                Services.logInternalError(host, err);
                throw err;
            }
        };

        TypeScriptServicesFactory.prototype.createLanguageServiceShim = function (host) {
            try  {
                var hostAdapter = new Services.LanguageServiceShimHostAdapter(host);
                var pullLanguageService = this.createPullLanguageService(hostAdapter);
                return new Services.LanguageServiceShim(this, host, pullLanguageService);
            } catch (err) {
                Services.logInternalError(host, err);
                throw err;
            }
        };

        TypeScriptServicesFactory.prototype.createClassifier = function (host) {
            try  {
                return new Services.Classifier(host);
            } catch (err) {
                Services.logInternalError(host, err);
                throw err;
            }
        };

        TypeScriptServicesFactory.prototype.createClassifierShim = function (host) {
            try  {
                return new Services.ClassifierShim(this, host);
            } catch (err) {
                Services.logInternalError(host, err);
                throw err;
            }
        };

        TypeScriptServicesFactory.prototype.createCoreServices = function (host) {
            try  {
                return new Services.CoreServices(host);
            } catch (err) {
                Services.logInternalError(host.logger, err);
                throw err;
            }
        };

        TypeScriptServicesFactory.prototype.createCoreServicesShim = function (host) {
            try  {
                return new Services.CoreServicesShim(this, host);
            } catch (err) {
                Services.logInternalError(host.logger, err);
                throw err;
            }
        };

        TypeScriptServicesFactory.prototype.close = function () {
            this._shims = [];
        };

        TypeScriptServicesFactory.prototype.registerShim = function (shim) {
            this._shims.push(shim);
        };

        TypeScriptServicesFactory.prototype.unregisterShim = function (shim) {
            for (var i = 0, n = this._shims.length; i < n; i++) {
                if (this._shims[i] === shim) {
                    delete this._shims[i];
                    return;
                }
            }

            throw TypeScript.Errors.invalidOperation();
        };
        return TypeScriptServicesFactory;
    })();
    Services.TypeScriptServicesFactory = TypeScriptServicesFactory;
})(Services || (Services = {}));
