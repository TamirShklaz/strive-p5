"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginAngular = void 0;
const optional_1 = require("../../compiler/transformers/optional");
const utils_1 = require("../../utils/utils");
function pluginAngular(target) {
    return (ctx) => {
        const rex = utils_1.path2RegexPattern(target);
        const angularTransformerOption = optional_1.createCoreTransformerOption('angular', rex);
        ctx.compilerOptions.transformers.push(angularTransformerOption);
    };
}
exports.pluginAngular = pluginAngular;
