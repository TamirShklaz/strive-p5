"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapContents = void 0;
function wrapContents(contents, useDefault) {
    return `${useDefault
        ? 'Object.defineProperty(exports, "__esModule", { value: true });\nmodule.exports.default'
        : 'module.exports'} = ${contents};`;
}
exports.wrapContents = wrapContents;
