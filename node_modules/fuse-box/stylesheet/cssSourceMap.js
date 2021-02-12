"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alignCSSSourceMap = void 0;
const path = require("path");
const utils_1 = require("../utils/utils");
function alignCSSSourceMap(props) {
    const { module, sourceMap } = props;
    const json = sourceMap.file ? sourceMap : JSON.parse(sourceMap.toString());
    const rootPath = path.dirname(module.absPath);
    if (json.sources) {
        for (let i = 0; i < json.sources.length; i++) {
            const name = json.sources[i];
            const resolvedPath = path.resolve(rootPath, name);
            json.sources[i] = utils_1.makePublicPath(resolvedPath);
        }
    }
    return JSON.stringify(json);
}
exports.alignCSSSourceMap = alignCSSSourceMap;
