"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginStylus = exports.pluginStylusCapture = void 0;
const createStylesheetProps_1 = require("../../config/createStylesheetProps");
const stylusHandler_1 = require("../../stylesheet/stylus/stylusHandler");
const utils_1 = require("../../utils/utils");
const pluginUtils_1 = require("../pluginUtils");
const shared_1 = require("./shared");
const env_1 = require("../../env");
function pluginStylusCapture(props) {
    const { ctx, module, opts } = props;
    if (!utils_1.isNodeModuleInstalled('stylus')) {
        ctx.fatal(`Fatal error when capturing ${module.absPath}`, [
            'Module "stylus" is required, Please install it using the following command',
            `${env_1.getPackageManagerData().installDevCmd} stylus`,
        ]);
        return;
    }
    ctx.log.info('stylus', module.absPath);
    props.module.read();
    props.module.captured = true;
    const stylusProcessor = stylusHandler_1.stylusHandler({ ctx: ctx, module, options: opts.stylesheet });
    if (!stylusProcessor)
        return;
    // A shared handler that takes care of development/production render
    // as well as setting according flags
    // It also accepts extra properties (like asText) to handle text rendering
    shared_1.cssContextHandler({
        ctx,
        fuseCSSModule: ctx.meta['fuseCSSModule'],
        module: module,
        options: opts.stylesheet,
        processor: stylusProcessor,
        shared: opts,
    });
}
exports.pluginStylusCapture = pluginStylusCapture;
function pluginStylus(a, b) {
    return (ctx) => {
        let [opts, matcher] = pluginUtils_1.parsePluginOptions(a, b, {});
        opts.stylesheet = createStylesheetProps_1.createStylesheetProps({ ctx, stylesheet: opts.stylesheet || {} });
        ctx.ict.on('bundle_resolve_module', props => {
            const { module } = props;
            if (props.module.captured || !matcher) {
                return;
            }
            if (matcher.test(module.absPath)) {
                pluginStylusCapture({ ctx, module, opts: opts });
            }
            return props;
        });
    };
}
exports.pluginStylus = pluginStylus;
