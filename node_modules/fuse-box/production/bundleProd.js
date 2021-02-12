"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundleProd = void 0;
const ProductionContext_1 = require("./ProductionContext");
const engine_1 = require("./engine");
async function bundleProd(ctx) {
    ctx.log.startStreaming();
    const context = await ProductionContext_1.createProductionContext(ctx);
    await engine_1.Engine(context).start();
    ctx.log.stopStreaming();
    return context.runResponse;
}
exports.bundleProd = bundleProd;
