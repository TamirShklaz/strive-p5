"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleTree = exports.ModuleType = void 0;
const ExportReference_1 = require("./ExportReference");
const ImportReference_1 = require("./ImportReference");
var ModuleType;
(function (ModuleType) {
    ModuleType[ModuleType["MAIN_MODULE"] = 0] = "MAIN_MODULE";
    ModuleType[ModuleType["SPLIT_MODULE"] = 1] = "SPLIT_MODULE";
})(ModuleType = exports.ModuleType || (exports.ModuleType = {}));
function ModuleTree({ module, productionContext }) {
    const exportReferences = ExportReference_1.ExportReferences(productionContext, module);
    const importReferences = ImportReference_1.ImportReferences(productionContext, module);
    return {
        dependants: [],
        exportReferences,
        importReferences,
        moduleType: ModuleType.MAIN_MODULE,
    };
}
exports.ModuleTree = ModuleTree;
