"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginSass = void 0;
const createStylesheetProps_1 = require("../../config/createStylesheetProps");
const sassHandler_1 = require("../../stylesheet/sassHandler");
const utils_1 = require("../../utils/utils");
const pluginUtils_1 = require("../pluginUtils");
const shared_1 = require("./shared");
const env_1 = require("../../env");
function pluginSass(a, b) {
    let [opts, matcher] = pluginUtils_1.parsePluginOptions(a, b, {});
    return (ctx) => {
        opts.stylesheet = createStylesheetProps_1.createStylesheetProps({ ctx, stylesheet: opts.stylesheet || {} });
        if (!matcher)
            matcher = /\.(scss|sass)$/;
        ctx.ict.on('bundle_resolve_module', props => {
            const { module } = props;
            if (props.module.captured || !matcher.test(module.absPath)) {
                return;
            }
            if (!utils_1.isNodeModuleInstalled('node-sass')) {
                ctx.fatal(`Fatal error when capturing ${module.absPath}`, [
                    'Module "sass" is required, Please install it using the following command',
                    `${env_1.getPackageManagerData().installDevCmd} node-sass`,
                ]);
                return;
            }
            ctx.log.info('sass', module.absPath);
            props.module.read();
            props.module.captured = true;
            const sass = sassHandler_1.sassHandler({ ctx: ctx, module, options: opts.stylesheet });
            if (!sass)
                return;
            // A shared handler that takes care of development/production render
            // as well as setting according flags
            // It also accepts extra properties (like asText) to handle text rendering
            // Accepts postCSS Processor as well
            shared_1.cssContextHandler({
                ctx,
                fuseCSSModule: ctx.meta['fuseCSSModule'],
                module: module,
                options: opts.stylesheet,
                processor: sass,
                shared: opts,
            });
            return props;
        });
    };
}
exports.pluginSass = pluginSass;
