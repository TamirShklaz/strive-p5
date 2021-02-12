"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductionContext = void 0;
const asyncModuleResolver_1 = require("../moduleResolver/asyncModuleResolver");
const ModuleTree_1 = require("./module/ModuleTree");
const SplitEntries_1 = require("./module/SplitEntries");
async function createProductionContext(ctx) {
    const { bundleContext, entries, modules } = await asyncModuleResolver_1.asyncModuleResolver(ctx, ctx.config.entries);
    const productionContext = {
        bundleContext,
        ctx,
        entries,
        log: ctx.log,
        modules,
        splitEntries: SplitEntries_1.createSplitEntries(),
    };
    for (const module of modules) {
        if (module.isExecutable) {
            // reset the contents
            if (module.contents === undefined)
                module.read();
            module.parse();
        }
        module.moduleTree = ModuleTree_1.ModuleTree({ module, productionContext });
    }
    return productionContext;
}
exports.createProductionContext = createProductionContext;
