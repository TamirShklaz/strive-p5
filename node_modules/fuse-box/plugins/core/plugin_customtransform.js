"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginCustomTransform = void 0;
function pluginCustomTransform(customTransformers) {
    return (ctx) => {
        ctx.customTransformers = customTransformers;
    };
}
exports.pluginCustomTransform = pluginCustomTransform;
