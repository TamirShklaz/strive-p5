"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundlePhase = void 0;
const build_1 = require("../../core/build");
const moduleCompiler_1 = require("../../threading/compile/moduleCompiler");
async function BundlePhase(productionContext) {
    const { ctx, entries, modules } = productionContext;
    function compile(module) {
        return new Promise((resolve, reject) => {
            moduleCompiler_1.moduleCompiler({
                ast: module.ast,
                context: module.getTransformationContext(),
                generateCode: true,
                onFatal: reject,
                onError: message => {
                    module.errored = true;
                    ctx.log.warn(message);
                },
                onReady: response => {
                    module.contents = response.contents;
                    module.sourceMap = response.sourceMap;
                    if (ctx.config.productionBuildTarget) {
                        ctx.log.info('downTranspile', module.publicPath);
                        module.transpileDown(ctx.config.productionBuildTarget);
                    }
                    return resolve();
                },
                onResolve: async (data) => {
                    if (module.moduleSourceRefs[data.source]) {
                        return { id: module.moduleSourceRefs[data.source].id };
                    }
                    return {};
                },
            });
        });
    }
    const promises = [];
    for (const module of modules) {
        if (module.isExecutable) {
            productionContext.log.info('generate', module.publicPath);
            promises.push(compile(module));
        }
        else {
            productionContext.log.info('add', module.publicPath);
        }
    }
    await Promise.all(promises);
    if (modules) {
        productionContext.runResponse = await build_1.createBuild({
            bundleContext: productionContext.bundleContext,
            entries,
            modules: productionContext.modules,
            splitEntries: productionContext.splitEntries,
            ctx,
        });
    }
}
exports.BundlePhase = BundlePhase;
