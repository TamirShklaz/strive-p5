"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginCSS = void 0;
const createStylesheetProps_1 = require("../../config/createStylesheetProps");
const cssResolveURL_1 = require("../../stylesheet/cssResolveURL");
const pluginUtils_1 = require("../pluginUtils");
const shared_1 = require("./shared");
function pluginCSS(a, b) {
    let [opts, matcher] = pluginUtils_1.parsePluginOptions(a, b, {});
    if (!matcher)
        matcher = /\.(css)$/;
    return (ctx) => {
        opts.stylesheet = createStylesheetProps_1.createStylesheetProps({ ctx, stylesheet: opts.stylesheet || {} });
        if (!ctx.config.isProduction && ctx.config.supportsStylesheet()) {
            ctx.ict.on('module_init', props => {
                const { module } = props;
                if (!module.isStylesheet)
                    return;
                module.resolve({ statement: 'fuse-box-css' }).then(result => {
                    ctx.meta['fuseCSSModule'] = result.module;
                    return result;
                });
                return props;
            });
        }
        ctx.ict.on('bundle_resolve_module', props => {
            const { module } = props;
            if (!matcher.test(module.absPath) || props.module.captured)
                return;
            ctx.log.info('css', module.absPath);
            module.read();
            props.module.captured = true;
            shared_1.cssContextHandler({
                ctx,
                fuseCSSModule: ctx.meta['fuseCSSModule'],
                module: module,
                options: opts.stylesheet,
                processor: {
                    render: async () => {
                        const urlResolver = cssResolveURL_1.cssResolveURL({
                            contents: module.contents,
                            ctx: ctx,
                            filePath: module.absPath,
                            options: ctx.config.stylesheet,
                        });
                        return { css: urlResolver.contents };
                    },
                },
                shared: { asText: opts.asText },
            });
            return props;
        });
    };
}
exports.pluginCSS = pluginCSS;
