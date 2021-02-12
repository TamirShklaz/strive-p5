"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBundleContext = void 0;
const cache_1 = require("../cache/cache");
function createBundleContext(ctx) {
    let currentId = 0;
    const injectedDependencies = {};
    const modules = {};
    const packages = {};
    let cache;
    const scope = {
        cache,
        currentId,
        injectedDependencies,
        modules,
        packages,
        getIdFor: (absPath) => {
            if (scope.cache) {
                const meta = scope.cache.meta;
                for (const id in meta.modules) {
                    if (meta.modules[id].absPath === absPath)
                        return meta.modules[id].id;
                }
            }
            return ++scope.currentId;
        },
        getModule: (absPath) => {
            return modules[absPath];
        },
        getPackage: (meta) => {
            const name = meta ? meta.name + '@' + meta.version : 'default';
            return packages[name];
        },
        setModule: (module) => {
            modules[module.absPath] = module;
        },
        setPackage: (pkg) => {
            const name = pkg.meta ? pkg.meta.name + '@' + pkg.meta.version : 'default';
            packages[name] = pkg;
        },
        tryCache: absPath => {
            if (!scope.cache)
                return;
            const data = scope.cache.restore(absPath);
            return data;
        },
    };
    if (ctx.config.cache.enabled)
        scope.cache = cache_1.createCache(ctx, scope);
    return scope;
}
exports.createBundleContext = createBundleContext;
