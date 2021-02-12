"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPackage = exports.createPackageFromCache = exports.PackageType = exports.Package = void 0;
function Package() {
    const self = {
        init: () => {
            self.isUserPackage = self.type === PackageType.USER_PACKAGE;
            self.isExternalPackage = self.type === PackageType.EXTERNAL_PACKAGE;
        },
    };
    return self;
}
exports.Package = Package;
var PackageType;
(function (PackageType) {
    PackageType[PackageType["USER_PACKAGE"] = 0] = "USER_PACKAGE";
    PackageType[PackageType["EXTERNAL_PACKAGE"] = 1] = "EXTERNAL_PACKAGE";
})(PackageType = exports.PackageType || (exports.PackageType = {}));
function createPackageFromCache(data) {
    const pkg = Package();
    for (const key in data)
        pkg[key] = data[key];
    pkg.init();
    return pkg;
}
exports.createPackageFromCache = createPackageFromCache;
function createPackage(props) {
    const pkg = Package();
    pkg.type = props.type;
    pkg.meta = props.meta;
    pkg.publicName = pkg.meta ? pkg.meta.name + '@' + pkg.meta.version : 'default';
    pkg.init();
    return pkg;
}
exports.createPackage = createPackage;
