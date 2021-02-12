"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePluginOptions = exports.testPath = void 0;
const utils_1 = require("../utils/utils");
const CACHED_PATHS = {};
function testPath(input, target) {
    if (typeof target === 'string') {
        if (!CACHED_PATHS[target]) {
            CACHED_PATHS[target] = utils_1.path2RegexPattern(target);
        }
        return CACHED_PATHS[target].test(input);
    }
    return target.test(input);
}
exports.testPath = testPath;
function parsePluginOptions(a, b, defaultValue) {
    const opts = b ? b : typeof a === 'object' ? a : defaultValue;
    const rex = b || typeof a === 'string' || utils_1.isRegExp(a) ? utils_1.path2RegexPattern(a) : undefined;
    return [opts, rex];
}
exports.parsePluginOptions = parsePluginOptions;
