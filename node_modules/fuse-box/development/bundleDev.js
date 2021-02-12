"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundleDev = void 0;
const build_1 = require("../core/build");
const asyncModuleResolver_1 = require("../moduleResolver/asyncModuleResolver");
async function bundleDev(props) {
    const { ctx, rebundle } = props;
    ctx.log.startStreaming();
    ctx.log.startTimeMeasure();
    ctx.log.flush();
    ctx.isWorking = true;
    const { bundleContext, entries, modules } = await asyncModuleResolver_1.asyncModuleResolver(ctx, ctx.config.entries);
    if (modules) {
        return await build_1.createBuild({
            bundleContext,
            ctx,
            entries,
            modules,
            rebundle,
        });
    }
}
exports.bundleDev = bundleDev;
