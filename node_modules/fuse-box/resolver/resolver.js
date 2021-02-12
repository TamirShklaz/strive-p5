"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveModule = void 0;
const path = require("path");
const utils_1 = require("../utils/utils");
const browserField_1 = require("./browserField");
const built_inModules_1 = require("./built-inModules");
const fileLookup_1 = require("./fileLookup");
const nodeModuleLookup_1 = require("./nodeModuleLookup");
const pathsLookup_1 = require("./pathsLookup");
function isExternalModule(props) {
    if (/^https?:/.test(props.target)) {
        return {
            isExternal: true,
        };
    }
}
function replaceAliases(props) {
    let forceReplacement = false;
    let target = props.target;
    for (const key in props.alias) {
        const regex = utils_1.path2Regex(key);
        const value = props.alias[key];
        if (regex.test(target)) {
            target = target.replace(regex, value);
            return { forceReplacement: true, target };
        }
    }
    return { forceReplacement, target };
}
function resolveModule(props) {
    if (path.isAbsolute(props.target))
        return {
            absPath: props.target,
        };
    const external = isExternalModule(props);
    if (external) {
        return external;
    }
    const isBrowserBuild = props.buildTarget === 'browser';
    const isServerBuild = props.buildTarget === 'server';
    const isElectronBuild = props.buildTarget === 'electron';
    let target = props.target;
    let lookupResult;
    // replace aliaes
    // props.target will be updated
    if (props.alias) {
        const res = replaceAliases(props);
        target = res.target;
    }
    // handle typescript paths
    // in this cases it should always send a forceStatement
    if (props.typescriptPaths) {
        lookupResult = pathsLookup_1.pathsLookup({
            baseURL: props.typescriptPaths.baseURL,
            cachePaths: props.cachePaths,
            configLocation: props.typescriptPaths.tsconfigPath,
            isDev: props.isDev,
            paths: props.typescriptPaths.paths,
            target: target,
        });
    }
    const browserFieldLookup = props.packageMeta && isBrowserBuild && props.packageMeta.browser && typeof props.packageMeta.browser === 'object';
    // continue looking for the file
    if (!lookupResult) {
        let moduleParsed = target && nodeModuleLookup_1.isNodeModule(target);
        if (moduleParsed) {
            // first check if we need to bundle it at all;
            if ((isServerBuild || (isElectronBuild && props.electronNodeIntegration)) &&
                built_inModules_1.NODE_BUILTIN_MODULES.includes(moduleParsed.name)) {
                return { skip: true };
            }
            if (browserFieldLookup) {
                if (props.packageMeta.browser[moduleParsed.name] === false) {
                    moduleParsed = { name: 'fuse-empty-package' };
                }
            }
            const pkg = nodeModuleLookup_1.nodeModuleLookup(props, moduleParsed);
            if ('error' in pkg) {
                return pkg;
            }
            return {
                package: pkg,
            };
        }
        else {
            lookupResult = fileLookup_1.fileLookup({
                filePath: props.filePath,
                isDev: props.isDev,
                javascriptFirst: props.javascriptFirst,
                target: target,
            });
        }
    }
    if (!lookupResult.fileExists) {
        return;
    }
    if (props.packageMeta) {
        if (isBrowserBuild && props.packageMeta.browser && typeof props.packageMeta.browser === 'object') {
            // a match should direct according to the specs
            const override = browserField_1.handleBrowserField(props.packageMeta, lookupResult.absPath);
            if (override) {
                lookupResult.absPath = override;
            }
        }
    }
    const extension = lookupResult.extension;
    const absPath = lookupResult.absPath;
    return {
        absPath,
        extension,
        monorepoModulesPath: lookupResult.monorepoModulesPaths,
        tsConfigAtPath: lookupResult.tsConfigAtPath,
    };
}
exports.resolveModule = resolveModule;
