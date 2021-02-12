"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarmupPhase = void 0;
const transformModule_1 = require("../../compiler/core/transformModule");
const transformer_1 = require("../../compiler/transformer");
const collection_1 = require("../transformers/collection");
function runWarmupPhase(productionContext, module) {
    const ctx = productionContext.ctx;
    const List = [
        ...productionContext.ctx.userTransformers,
        ...transformer_1.BASE_TRANSFORMERS,
        ...collection_1.PRODUCTION_TRANSFORMERS,
    ];
    const transformers = [];
    for (const transformer of List) {
        if (transformer.productionWarmupPhase && transformer_1.isTransformerEligible(module.absPath, transformer)) {
            transformers.push(transformer.productionWarmupPhase({ ctx: ctx, module: module, productionContext: productionContext }));
        }
    }
    transformModule_1.transformModule({
        root: module.ast,
        transformers: transformers,
    });
}
function WarmupPhase(productionContext) {
    for (const module of productionContext.modules) {
        if (module.isExecutable) {
            // flush the AST. We only need to do it once on warmup phase
            // laters on we will be working with the same AST
            module.parse();
            runWarmupPhase(productionContext, module);
        }
    }
}
exports.WarmupPhase = WarmupPhase;
