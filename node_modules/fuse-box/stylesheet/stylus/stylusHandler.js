"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stylusHandler = void 0;
const cssResolveModule_1 = require("../cssResolveModule");
const cssResolveURL_1 = require("../cssResolveURL");
const cssSourceMap_1 = require("../cssSourceMap");
const stylusRenderer_1 = require("./stylusRenderer");
async function renderModule(props) {
    const data = await stylusRenderer_1.stylusRender({
        contents: props.module.contents,
        withSourceMaps: props.module.isCSSSourceMapRequired,
        paths: props.options.paths,
        filePath: props.module.absPath,
        onImportString: str => {
            if (props.options.macros) {
                return cssResolveModule_1.replaceCSSMacros(str, props.options.macros);
            }
        },
        onURL: (filePath, value) => {
            const result = cssResolveURL_1.resolveCSSResource(value, {
                contents: '',
                ctx: props.ctx,
                filePath: filePath,
                options: props.options,
            });
            if (result) {
                return result.publicPath;
            }
            else {
                props.ctx.log.warn(`Unable to resolve ${value} in ${filePath}`);
            }
        },
        onImportFile: item => {
            if (!item.isExternal) {
                if (props.options.breakDependantsCache) {
                    props.module.breakDependantsCache = true;
                }
                props.module.ctx.setLinkedReference(item.value, props.module);
            }
        },
    });
    let sourceMap;
    if (data.map) {
        sourceMap = cssSourceMap_1.alignCSSSourceMap({ ctx: props.ctx, module: props.module, sourceMap: data.map });
    }
    return { css: data.css, map: sourceMap };
}
function stylusHandler(props) {
    const { ctx, module } = props;
    return {
        render: async () => renderModule({ ctx, module, options: props.options }),
    };
}
exports.stylusHandler = stylusHandler;
