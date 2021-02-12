"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBrowserField = void 0;
const path = require("path");
const utils_1 = require("../utils/utils");
function handleBrowserField(packageMeta, absPath) {
    if (typeof packageMeta.browser !== 'object') {
        return;
    }
    for (const key in packageMeta.browser) {
        const targetValue = packageMeta.browser[key];
        if (typeof targetValue === 'string') {
            if (path.extname(key) === '.js') {
                const targetAbsPath = path.join(packageMeta.packageRoot, key);
                if (utils_1.fileExists(targetAbsPath) && absPath === targetAbsPath) {
                    return path.join(path.join(packageMeta.packageRoot, targetValue));
                }
            }
        }
    }
}
exports.handleBrowserField = handleBrowserField;
