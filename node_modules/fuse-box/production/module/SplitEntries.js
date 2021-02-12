"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSplitEntries = exports.createSplitEntry = void 0;
const ModuleTree_1 = require("./ModuleTree");
function createSplitEntry(props) {
    const { module, subModules } = props;
    module.moduleTree.moduleType = ModuleTree_1.ModuleType.SPLIT_MODULE;
    return {
        entry: module,
        modules: subModules,
        references: module.moduleTree.dependants,
    };
}
exports.createSplitEntry = createSplitEntry;
function createSplitEntries() {
    const entries = [];
    const ids = {};
    return {
        entries,
        ids,
        register: function (splitEntry) {
            entries.push(splitEntry);
        },
    };
}
exports.createSplitEntries = createSplitEntries;
