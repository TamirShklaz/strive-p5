"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCache = void 0;
const fs_1 = require("fs");
const path = require("path");
const module_1 = require("../moduleResolver/module");
const package_1 = require("../moduleResolver/package");
const utils_1 = require("../utils/utils");
const watcher_1 = require("../watcher/watcher");
const META_MODULES_CACHE = {};
const META_JSON_CACHE = {};
function createCache(ctx, bundleContext) {
    const prefix = utils_1.fastHash(ctx.config.entries.toString());
    const CACHE_ROOT = path.join(ctx.config.cache.root, prefix);
    const isFileStrategy = ctx.config.cache.strategy === 'fs';
    const META_FILE = path.join(CACHE_ROOT, 'meta.json');
    const CACHE_MODULES_FOLDER = path.join(CACHE_ROOT, 'files');
    function moduleMetaCache() {
        const moduleWriters = [];
        const self = {
            getMeta: () => {
                let meta;
                if (META_JSON_CACHE[META_FILE])
                    meta = META_JSON_CACHE[META_FILE];
                else if (isFileStrategy && fs_1.existsSync(META_FILE)) {
                    try {
                        meta = utils_1.readJSONFile(META_FILE);
                    }
                    catch (e) { }
                }
                if (!meta) {
                    META_JSON_CACHE[META_FILE] = meta = { currentId: 0, modules: {}, packages: {} };
                }
                bundleContext.currentId = meta.currentId;
                return meta;
            },
            persist: async (metaChanged, meta) => {
                await Promise.all(moduleWriters);
                if (isFileStrategy && metaChanged) {
                    await utils_1.writeFile(META_FILE, JSON.stringify(meta, null, 2));
                }
            },
            read: (meta) => {
                const cachedFile = path.join(CACHE_MODULES_FOLDER, meta.id + '.json');
                if (META_MODULES_CACHE[cachedFile])
                    return META_MODULES_CACHE[cachedFile];
                if (!isFileStrategy)
                    return;
                if (!fs_1.existsSync(cachedFile))
                    return;
                const data = utils_1.readJSONFile(cachedFile);
                META_MODULES_CACHE[cachedFile] = data;
                return data;
            },
            write: (module) => {
                const cachedFile = path.join(CACHE_MODULES_FOLDER, `${module.id}.json`);
                const data = { contents: module.contents, sourceMap: module.sourceMap };
                META_MODULES_CACHE[cachedFile] = data;
                if (!isFileStrategy)
                    return;
                const contents = JSON.stringify(data);
                moduleWriters.push(utils_1.writeFile(cachedFile, contents));
            },
        };
        return self;
    }
    const metaCache = moduleMetaCache();
    const meta = metaCache.getMeta();
    const modules = meta.modules;
    const packages = meta.packages;
    const verifiedPackages = {};
    const verifiedModules = {};
    // restore context cachable
    if (meta.ctx) {
        for (const key in meta.ctx)
            ctx[key] = meta.ctx[key];
    }
    function verifyLinkedReferences() {
        for (const absPath in ctx.linkedReferences) {
            const item = ctx.linkedReferences[absPath];
            if (!utils_1.fileExists(absPath)) {
                // cleaning up
                ctx.linkedReferences[absPath] = undefined;
            }
            else {
                const mtime = utils_1.getFileModificationTime(absPath);
                if (mtime !== item.mtime) {
                    // the referenced file was modified, so
                    // force all modules that depend on this file to be detected as modified
                    for (const depId of item.deps) {
                        if (modules[depId])
                            modules[depId].mtime = -1;
                    }
                    // our work here is done until the next time it is modified
                    item.mtime = mtime;
                }
            }
        }
    }
    // first thing we need to verify linked referneces
    // if dependant files have changed we need to break cache on targeted modules
    verifyLinkedReferences();
    /**
     *
     * Restoring module
     * If module cache data is present we can safely restore
     * the modules. This function should be called on a verified module (mtime matches)
     * @param meta
     * @param cachedPackage
     */
    function restoreModule(meta, cachedPackage) {
        if (!cachedPackage)
            return;
        const moduleCacheData = metaCache.read(meta);
        if (!moduleCacheData)
            return;
        const module = module_1.createModule({ absPath: meta.absPath, ctx: ctx });
        module.initFromCache(meta, moduleCacheData);
        if (bundleContext.packages[cachedPackage.publicName]) {
            module.pkg = bundleContext.packages[cachedPackage.publicName];
        }
        else {
            // restore package and assign it to module
            const pkg = package_1.createPackageFromCache(cachedPackage);
            bundleContext.packages[cachedPackage.publicName] = pkg;
            module.pkg = pkg;
        }
        return module;
    }
    /**
     * FInding a module in meta
     * @param absPath
     */
    function findModuleMeta(absPath) {
        for (const moduleId in modules) {
            if (modules[moduleId].absPath === absPath)
                return modules[moduleId];
        }
    }
    /**
     * Veifying module
     * @param meta
     * @param mrc
     */
    function restoreModuleDependencies(meta, mrc) {
        if (verifiedModules[meta.absPath])
            return true;
        verifiedModules[meta.absPath] = true;
        const pkg = packages[meta.packageId];
        if (!pkg)
            return;
        if (pkg.meta)
            if (!restorePackage(pkg, mrc))
                return;
        for (const dependencyId of meta.dependencies) {
            const target = modules[dependencyId];
            if (!target)
                return;
            if (!restoreModuleDependencies(target, mrc))
                return;
        }
        return true;
    }
    function restorePackage(pkg, mrc) {
        if (verifiedPackages[pkg.publicName]) {
            return true;
        }
        verifiedPackages[pkg.publicName] = true;
        const packageJSONLocation = pkg.meta.packageJSONLocation;
        if (!utils_1.fileExists(packageJSONLocation)) {
            // flush the package if package.json doesn't exist anymore
            packages[pkg.publicName] = undefined;
            return false;
        }
        // version changed or anything else. Drop the package from meta
        // but leave the files to preserved assigned IDS (required for the HMR)
        if (utils_1.getFileModificationTime(packageJSONLocation) !== pkg.mtime) {
            // here we reset the cache of that entry point
            const bustedPackage = packages[pkg.publicName];
            const pkgName = bustedPackage.publicName;
            //bundleContext.packages[pkgName] = undefined;
            verifiedPackages[pkgName] = undefined;
            packages[pkgName] = undefined;
            return false;
        }
        const collection = [];
        // package is in tact pulling out all the files
        for (const moduleId of pkg.deps) {
            const meta = modules[moduleId];
            if (meta.mtime === -1)
                return false;
            const depPackage = packages[meta.packageId];
            // a required dependency is missing
            // verifying and external package of the current package
            if (!depPackage)
                return false;
            // meta might be missing ?!
            const target = restoreModule(meta, pkg);
            // cache might be missing?
            if (!target)
                return false;
            if (!restoreModuleDependencies(meta, mrc))
                return;
            collection.push(target);
        }
        // finally populating the bundle context
        for (const restored of collection) {
            bundleContext.modules[restored.absPath] = restored;
        }
        return true;
    }
    function restoreModuleSafely(absPath, mrc) {
        if (verifiedModules[absPath])
            return bundleContext.modules[absPath];
        verifiedModules[absPath] = true;
        const meta = findModuleMeta(absPath);
        const metaPackage = packages[meta.packageId];
        // file was removed
        if (!utils_1.fileExists(meta.absPath)) {
            // need to break dependants cache
            //return shouldResolve(absPath, metaPackage);
            for (const id in modules) {
                const x = modules[id];
                // package is no longer verified
                if (x.dependencies.includes(meta.id)) {
                    verifiedModules[x.absPath] = false;
                    x.mtime = -1;
                    if (!restoreModuleSafely(x.absPath, mrc))
                        return;
                }
            }
        }
        // check if that module depends on some other dependencies that need to be consistent
        let shouldBreakCachedModule = utils_1.getFileModificationTime(meta.absPath) !== meta.mtime;
        if (meta.v) {
            for (const id of meta.v) {
                const target = modules[id];
                const restored = restoreModuleSafely(target.absPath, mrc);
                if (!target || !restored) {
                    shouldBreakCachedModule = true;
                    break;
                }
            }
        }
        // if any of our dependencies relied on the "main" field of a package.json
        // and that package.json has changed,
        // then the absPath of that dependency is possibly no longer valid and so we have to re-resolve everything
        for (const depId of meta.dependencies) {
            const target = modules[depId];
            const pkg = target && packages[target.packageId];
            if (pkg &&
                !pkg.isExternalPackage &&
                pkg.mtime &&
                pkg.meta &&
                pkg.meta.packageJSONLocation &&
                pkg.mtime !== utils_1.getFileModificationTime(pkg.meta.packageJSONLocation)) {
                shouldBreakCachedModule = true;
                break;
            }
        }
        if (shouldBreakCachedModule) {
            // should be resolved
            bundleContext.modules[absPath] = undefined;
            mrc.modulesRequireResolution.push({ absPath, pkg: metaPackage });
            return;
        }
        for (const depId of meta.dependencies) {
            const target = modules[depId];
            if (!target)
                return;
            const pkg = packages[target.packageId];
            if (pkg && pkg.isExternalPackage) {
                if (!restorePackage(pkg, mrc)) {
                    // package has failed
                    // interrupt everything
                    mrc.modulesRequireResolution.push({ absPath, pkg: metaPackage });
                    return;
                }
            }
            else
                restoreModuleSafely(target.absPath, mrc);
        }
        const module = restoreModule(meta, metaPackage);
        if (module)
            bundleContext.modules[module.absPath] = module;
        return module;
    }
    function getModuleByPath(absPath) {
        const moduleMeta = findModuleMeta(absPath);
        const mrc = {
            modulesRequireResolution: [],
        };
        const busted = { mrc };
        // if a module was not found in cache we do nothing
        if (!moduleMeta)
            return busted;
        const targetPackageId = moduleMeta.packageId;
        const modulePackage = packages[targetPackageId];
        if (!modulePackage)
            return busted;
        if (modulePackage.isExternalPackage) {
            if (!restorePackage(modulePackage, mrc))
                return busted;
        }
        else {
            // restore local files (check the modification time on each)
            return { module: restoreModuleSafely(absPath, mrc), mrc };
        }
    }
    async function write() {
        let shouldWriteMeta = false;
        meta.currentId = bundleContext.currentId;
        for (const packageId in bundleContext.packages) {
            const pkg = bundleContext.packages[packageId];
            if (!packages[pkg.publicName]) {
                shouldWriteMeta = true;
                if (pkg.meta) {
                    pkg.deps = [];
                    pkg.mtime = utils_1.getFileModificationTime(pkg.meta.packageJSONLocation);
                }
                packages[pkg.publicName] = pkg;
            }
        }
        const breakingCacheIds = [];
        for (const absPath in bundleContext.modules) {
            const module = bundleContext.modules[absPath];
            if (!module.isCached && !module.errored) {
                shouldWriteMeta = true;
                const fileMeta = module.getMeta();
                modules[module.id] = fileMeta;
                const pkg = packages[module.pkg.publicName];
                if (pkg.meta)
                    if (!pkg.deps.includes(module.id))
                        pkg.deps.push(module.id);
                if (module.breakDependantsCache) {
                    breakingCacheIds.push(module.id);
                }
                metaCache.write(module);
            }
        }
        for (const breakId of breakingCacheIds) {
            for (const id in meta.modules) {
                const target = meta.modules[id];
                if (target.dependencies.includes(breakId)) {
                    if (!target.v)
                        target.v = [];
                    target.v.push(breakId);
                    modules[id] = target;
                }
            }
        }
        // fast and ugly check if cache context needs to be written
        const cachable = ctx.getCachable();
        if (isFileStrategy) {
            if (JSON.stringify(meta.ctx) !== JSON.stringify(cachable)) {
                shouldWriteMeta = true;
                meta.ctx = cachable;
            }
        }
        else
            meta.ctx = cachable;
        if (!isFileStrategy)
            shouldWriteMeta = false;
        await metaCache.persist(shouldWriteMeta, meta);
    }
    const self = {
        meta,
        write,
        nuke: () => utils_1.removeFolder(CACHE_ROOT),
        restore: (absPath) => getModuleByPath(absPath),
    };
    if (isFileStrategy) {
        // destroying the cache folder only in case of a file staregy
        // memory strategy should not be affected since the process is closed
        const nukableReactions = [watcher_1.WatcherReaction.TS_CONFIG_CHANGED, watcher_1.WatcherReaction.FUSE_CONFIG_CHANGED];
        ctx.ict.on('watcher_reaction', ({ reactionStack }) => {
            for (const item of reactionStack) {
                if (nukableReactions.includes(item.reaction)) {
                    self.nuke();
                    break;
                }
            }
        });
    }
    return self;
}
exports.createCache = createCache;
