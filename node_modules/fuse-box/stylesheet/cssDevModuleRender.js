"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssDevModuleRender = void 0;
const bundleRuntimeCore_1 = require("../bundleRuntime/bundleRuntimeCore");
const constants_1 = require("../bundleRuntime/constants");
const pluginStrings_1 = require("../plugins/pluginStrings");
const utils_1 = require("../utils/utils");
function cssDevModuleRender(props) {
    const { ctx, data, module } = props;
    const filePath = module.publicPath;
    // let the context know
    let cssData = data.css;
    if (ctx.config.sourceMap.css && data.map) {
        const resourceConfig = ctx.config.getResourceConfig(props.options);
        // generating a new name for our sourcemap
        const name = `${utils_1.fastHash(module.absPath)}.css.map`;
        // defining a public path (that browser will be able to reach)
        const publicPath = utils_1.joinFuseBoxPath(resourceConfig.resourcePublicRoot, 'css', name);
        // replace existing sourceMappingURL
        if (/sourceMappingURL/.test(cssData)) {
            cssData = cssData.replace(/(sourceMappingURL=)([^\s]+)/, `$1${publicPath}`);
        }
        else {
            cssData += constants_1.sourceMapsCSSURL(publicPath);
        }
        // figuring out where to write that css
        //const targetSourceMapPath = path.join(resourceConfig.resourceFolder, 'css', name);
        // ctx.log.info('css', 'Writing css sourcemap to $file', { file: targetSourceMapPath });
        // ctx.writer.write(targetSourceMapPath, data.map);
    }
    const fuseCSSModule = props.fuseCSSModule;
    if (fuseCSSModule) {
        const methodString = bundleRuntimeCore_1.BUNDLE_RUNTIME_NAMES.ARG_REQUIRE_FUNCTION + '(' + fuseCSSModule.id + ')';
        let contents = `${methodString}(${JSON.stringify(filePath)},${JSON.stringify(cssData)})`;
        if (props.data.json) {
            contents += '\n' + pluginStrings_1.wrapContents(JSON.stringify(props.data.json), props.useDefault);
        }
        module.contents = contents;
    }
    else {
        ctx.fatal('Error with fuse-box-css', [
            'System module "fuse-box-css" was not found in the context meta',
            'You should report this bug',
        ]);
    }
}
exports.cssDevModuleRender = cssDevModuleRender;
