"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWeakModuleReferences = exports.WeakModuleReferences = void 0;
/**
 * This module is used to store "weak" references for non-js modules
 * For example a scss file can have multiple import, none of those imports actually belong to the project
 * hence won't be matched by the wather. In order to solve this sutation we map those references to corresponding modules
 */
class WeakModuleReferences {
    constructor(ctx) {
        this.ctx = ctx;
        this.collection = {};
    }
    add(absPath, filePath) {
        if (!this.collection[absPath]) {
            this.collection[absPath] = [];
        }
        if (this.collection[absPath].indexOf(filePath) === -1) {
            this.collection[absPath].push(filePath);
        }
    }
    flush() {
        this.collection = {};
    }
    find(absPath) {
        return this.collection[absPath];
    }
}
exports.WeakModuleReferences = WeakModuleReferences;
function createWeakModuleReferences(ctx) {
    return new WeakModuleReferences(ctx);
}
exports.createWeakModuleReferences = createWeakModuleReferences;
