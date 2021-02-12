"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginPostCSS = void 0;
const createStylesheetProps_1 = require("../../config/createStylesheetProps");
const postcssHandler_1 = require("../../stylesheet/postcss/postcssHandler");
const pluginUtils_1 = require("../pluginUtils");
const shared_1 = require("./shared");
function pluginPostCSS(a, b) {
    return (ctx) => {
        let [opts, matcher] = pluginUtils_1.parsePluginOptions(a, b, {});
        opts.stylesheet = createStylesheetProps_1.createStylesheetProps({ ctx, stylesheet: opts.stylesheet || {} });
        ctx.ict.on('bundle_resolve_module', props => {
            const { module } = props;
            if (props.module.captured || !matcher) {
                return;
            }
            if (matcher.test(module.absPath)) {
                ctx.log.info('PostCSS', module.absPath);
                props.module.read();
                props.module.captured = true;
                const postCSS = postcssHandler_1.postCSSHandler({ ctx: ctx, module, options: opts.stylesheet });
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
            return props;
        });
    };
}
exports.pluginPostCSS = pluginPostCSS;
