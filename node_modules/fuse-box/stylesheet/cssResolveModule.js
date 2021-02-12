"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssResolveModule = exports.replaceCSSMacros = void 0;
const path = require("path");
const utils_1 = require("../utils/utils");
function tryCSSModule(target, props) {
    if (utils_1.fileExists(target)) {
        return target;
    }
    let fname = path.basename(target);
    if (props.tryUnderscore && !/^_/.test(fname)) {
        const pathWithUnderScore = path.join(path.dirname(target), '_' + fname);
        if (utils_1.fileExists(pathWithUnderScore)) {
            return pathWithUnderScore;
        }
    }
}
function replaceCSSMacros(target, macros) {
    for (const key in macros) {
        target = target.replace(key, `${macros[key]}`);
    }
    return target;
}
exports.replaceCSSMacros = replaceCSSMacros;
function cssResolveModule(props) {
    let target = props.target;
    if (props.options.macros) {
        target = replaceCSSMacros(target, props.options.macros);
    }
    if (path.isAbsolute(target)) {
        // in case of an absolute path we don't need to iterate over paths,
        // saving the time here
        if (!path.extname(target)) {
            for (const extension of props.extensions) {
                const res = tryCSSModule(target + extension, props);
                if (res)
                    return { path: res, success: true };
            }
        }
        else {
            // direct try if an extension is specified
            const found = tryCSSModule(target, props);
            if (found) {
                return { path: target, success: true };
            }
        }
    }
    else {
        // in case of relative paths we need to try all paths that
        // user has specified
        if (!path.extname(target)) {
            for (let i = 0; i < props.paths.length; i++) {
                for (const extension of props.extensions) {
                    const res = tryCSSModule(path.join(props.paths[i], target + extension), props);
                    if (res)
                        return { path: res, success: true };
                }
            }
        }
        else {
            // with extensions we try only paths
            for (let i = 0; i < props.paths.length; i++) {
                const found = tryCSSModule(path.join(props.paths[i], target), props);
                if (found) {
                    return { path: found, success: true };
                }
            }
        }
    }
    return { success: false };
}
exports.cssResolveModule = cssResolveModule;
