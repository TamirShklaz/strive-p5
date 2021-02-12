"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeModuleLookup = exports.findTargetFolder = exports.parseExistingModulePaths = exports.parseAllModulePaths = exports.isNodeModule = void 0;
const fs_1 = require("fs");
const path = require("path");
const findUp_1 = require("../utils/findUp");
const utils_1 = require("../utils/utils");
const browserField_1 = require("./browserField");
const fileLookup_1 = require("./fileLookup");
const NODE_MODULE_REGEX = /^(([^\.][\.a-z0-9@\-_]*)(\/)?([_a-z0-9.@-]+)?(\/)?(.*))$/i;
function isNodeModule(path) {
    const matched = path.match(NODE_MODULE_REGEX);
    if (!matched)
        return;
    let [name, b, c] = [matched[2], matched[4], matched[6]];
    const result = { name };
    if (name[0] === '@') {
        result.name = name + '/' + b;
        if (c) {
            result.target = c;
        }
    }
    else {
        if (b) {
            result.target = c ? b + '/' + c : b;
        }
    }
    return result;
}
exports.isNodeModule = isNodeModule;
function parentDir(normalizedPath) {
    const parent = path.dirname(normalizedPath);
    if (parent === normalizedPath)
        return undefined;
    return parent;
}
function parseAllModulePaths(fileAbsPath) {
    const start = path.normalize(fileAbsPath);
    const paths = [];
    for (let dir = parentDir(start); dir !== undefined; dir = parentDir(dir)) {
        const name = path.basename(dir);
        if (name === 'node_modules')
            continue;
        paths.unshift(path.join(dir, 'node_modules'));
    }
    return paths;
}
exports.parseAllModulePaths = parseAllModulePaths;
const pathExists = new Map();
function memoizedExists(absPath) {
    let exists = pathExists.get(absPath);
    if (exists === undefined) {
        exists = utils_1.fileExists(absPath);
        pathExists.set(absPath, exists);
    }
    return exists;
}
function parseExistingModulePaths(fileAbsPath) {
    const all = parseAllModulePaths(fileAbsPath);
    const existing = [];
    for (let i = 0; i < all.length; i++) {
        memoizedExists(all[i]) && existing.push(all[i]);
    }
    return existing;
}
exports.parseExistingModulePaths = parseExistingModulePaths;
function isDirectory(path) {
    return utils_1.fileExists(path) && fs_1.lstatSync(path).isDirectory();
}
const pnp = process.versions.pnp ? require('pnpapi') : undefined;
function isFolderUserOwned(realpath) {
    if (pnp) {
        // in a pnp environment, anything that is not in an archive is probably user-owned
        // this should support, workspaces, portals, and unplugged correctly
        const physical = (pnp.resolveVirtual && pnp.resolveVirtual(realpath)) || realpath;
        return isDirectory(physical);
    }
    else {
        // in a node_modules environment, anything that is really inside node_modules is *not* user-owned
        return !/node_modules/.test(realpath);
    }
}
const CACHED_LOCAL_MODULES = {};
function findTargetFolder(props, name) {
    // handle custom modules here
    if (props.modules) {
        for (const i in props.modules) {
            const f = path.join(props.modules[i], name);
            if (utils_1.fileExists(f)) {
                const folder = fs_1.realpathSync(f);
                const isUserOwned = isFolderUserOwned(folder);
                return { folder, isUserOwned };
            }
        }
    }
    // Support for Yarn v2 PnP
    if (pnp) {
        try {
            const folder = pnp.resolveToUnqualified(name, props.filePath, { considerBuiltins: false });
            const isUserOwned = isFolderUserOwned(folder);
            return { folder, isUserOwned };
        }
        catch (e) {
            // If this is PnP and PnP says it doesn't exist,
            // don't continue trying the rest of the node_modules stuff
            return { error: e.message };
        }
    }
    const paths = parseExistingModulePaths(props.filePath);
    for (let i = paths.length - 1; i >= 0; i--) {
        const attempted = path.join(paths[i], name);
        if (utils_1.fileExists(path.join(attempted, 'package.json'))) {
            const folder = fs_1.realpathSync(attempted);
            const isUserOwned = isFolderUserOwned(folder);
            return { folder, isUserOwned };
        }
    }
    let localModuleRoot = CACHED_LOCAL_MODULES[props.filePath];
    if (localModuleRoot === undefined) {
        localModuleRoot = CACHED_LOCAL_MODULES[props.filePath] = findUp_1.findUp(props.filePath, 'node_modules');
    }
    if (!!localModuleRoot && paths.indexOf(localModuleRoot) === -1) {
        const attempted = path.join(localModuleRoot, name);
        if (utils_1.fileExists(path.join(attempted, 'package.json'))) {
            const folder = fs_1.realpathSync(attempted);
            const isUserOwned = isFolderUserOwned(folder);
            return { folder, isUserOwned };
        }
    }
    return { error: `Cannot resolve "${name}"` };
}
exports.findTargetFolder = findTargetFolder;
function nodeModuleLookup(props, parsed) {
    const { name: moduleName, target } = parsed;
    // Resolve the module name to a folder
    const result = findTargetFolder(props, moduleName);
    if ('error' in result) {
        return result;
    }
    const { folder, isUserOwned } = result;
    if (!folder) {
        return { error: `Cannot resolve "${moduleName}"` };
    }
    const packageJSONFile = path.join(folder, 'package.json');
    if (!utils_1.fileExists(packageJSONFile)) {
        return { error: `Failed to find package.json in ${folder} when resolving module ${moduleName}` };
    }
    const json = JSON.parse(utils_1.readFile(packageJSONFile));
    // Prepare the package metadata structure and copy a bunch of stuff into it
    const pkg = {
        browser: json.browser,
        fusebox: json['fuse-box'] || undefined,
        name: moduleName,
        packageJSONLocation: packageJSONFile,
        packageRoot: folder,
        version: json.version || '0.0.0',
    };
    const isBrowser = props.buildTarget === 'browser';
    const isEntry = !target;
    let targetResolver = fileLookup_1.fileLookup;
    if (isUserOwned && props.tsTargetResolver)
        targetResolver = props.tsTargetResolver;
    const resolved = targetResolver({ fileDir: folder, isBrowserBuild: isBrowser, target: target || '' });
    if (!resolved || !resolved.fileExists) {
        const spec = target ? `"${target}"` : 'an entry point';
        return { error: `Failed to resolve ${spec} in package "${moduleName}"` };
    }
    let targetAbsPath = resolved.absPath;
    const checkBrowserOverride = isBrowser && json.browser && typeof json.browser === 'object';
    if (checkBrowserOverride) {
        const override = browserField_1.handleBrowserField(pkg, resolved.absPath);
        if (override) {
            targetAbsPath = override;
        }
    }
    const targetFuseBoxPath = utils_1.makeFuseBoxPath(folder, targetAbsPath);
    if (isEntry) {
        pkg.entryAbsPath = targetAbsPath;
        pkg.entryFuseBoxPath = targetFuseBoxPath;
    }
    const targetExtension = path.extname(targetAbsPath);
    return {
        isEntry,
        isUserOwned: isUserOwned,
        meta: pkg,
        targetAbsPath,
        targetExtension,
        targetFuseBoxPath,
    };
}
exports.nodeModuleLookup = nodeModuleLookup;
