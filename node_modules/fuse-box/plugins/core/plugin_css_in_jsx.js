"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginCSSInJSX = void 0;
const optional_1 = require("../../compiler/transformers/optional");
function pluginCSSInJSX(options) {
    return function (ctx) {
        const plugin = optional_1.createCoreTransformerOption('css_in_jsx', options);
        ctx.compilerOptions.transformers.push(plugin);
    };
}
exports.pluginCSSInJSX = pluginCSSInJSX;
