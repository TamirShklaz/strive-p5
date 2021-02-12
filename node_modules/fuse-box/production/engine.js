"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const BundlePhase_1 = require("./phases/BundlePhase");
const CodeSplittingPhase_1 = require("./phases/CodeSplittingPhase");
const WarmupPhase_1 = require("./phases/WarmupPhase");
function Engine(productionContext) {
    const defaultPhases = [WarmupPhase_1.WarmupPhase, CodeSplittingPhase_1.CodeSplittingPhase, BundlePhase_1.BundlePhase];
    return {
        start: async (phases) => {
            phases = phases || defaultPhases;
            for (const phase of phases) {
                const name = phase.toString().match(/function (\w+)/i)[1];
                productionContext.log.info('phase', `Running ${name}`);
                await phase(productionContext);
            }
        },
    };
}
exports.Engine = Engine;
