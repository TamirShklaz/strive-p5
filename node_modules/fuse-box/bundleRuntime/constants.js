"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceMapsCSSURL = exports.sourceMapsURL = void 0;
function sourceMapsURL(file) {
    return `//# sourceMappingURL=${file}`;
}
exports.sourceMapsURL = sourceMapsURL;
function sourceMapsCSSURL(file) {
    return `/*# sourceMappingURL=${file} */`;
}
exports.sourceMapsCSSURL = sourceMapsCSSURL;
