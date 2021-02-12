"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginLess = exports.pluginLessCapture = void 0;
const createStylesheetProps_1 = require("../../config/createStylesheetProps");
const lessHandler_1 = require("../../stylesheet/less/lessHandler");
const utils_1 = require("../../utils/utils");
const pluginUtils_1 = require("../pluginUtils");
const shared_1 = require("./shared");
const env_1 = require("../../env");
function pluginLessCapture(props) {
    const { ctx, module, opts } = props;
    if (!utils_1.isNodeModuleInstalled('less')) {
        ctx.fatal(`Fatal error when capturing ${module.absPath}`, [
            'Module "less" is required, Please install it using the following command',
            `${env_1.getPackageManagerData().installDevCmd} less`,
        ]);
        return;
    }
    ctx.log.info('less', module.absPath);
    props.module.read();
    props.module.captured = true;
    const postCSS = lessHandler_1.lessHandler({ ctx: ctx, module, options: opts.stylesheet });
    if (!postCSS)
        return;
    // A shared handler that takes care of development/production render
    // as well as setting according flags
    // It also accepts extra properties (like asText) to handle text rendering
    shared_1.cssContextHandler({
        ctx,
        fuseCSSModule: ctx.meta['fuseCSSModule'],
        module: module,
        options: opts.stylesheet,
        processor: postCSS,
        shared: opts,
    });
}
exports.pluginLessCapture = pluginLessCapture;
function pluginLess(a, b) {
    return (ctx) => {
        let [opts, matcher] = pluginUtils_1.parsePluginOptions(a, b, {});
        if (!matcher)
            matcher = /\.(less)$/;
        opts.stylesheet = createStylesheetProps_1.createStylesheetProps({ ctx, stylesheet: opts.stylesheet || {} });
        ctx.ict.on('bundle_resolve_module', props => {
            const { module } = props;
            if (props.module.captured || !matcher) {
                return;
            }
            if (matcher.test(module.absPath)) {
                pluginLessCapture({ ctx, module, opts: opts });
            }
            return props;
        });
    };
}
exports.pluginLess = pluginLess;
