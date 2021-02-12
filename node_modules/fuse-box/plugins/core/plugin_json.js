"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginJSON = exports.pluginJSONHandler = void 0;
const pluginStrings_1 = require("../pluginStrings");
const pluginUtils_1 = require("../pluginUtils");
function pluginJSONHandler(module, opts) {
    module.captured = true;
    module.ctx.log.info('json', ' Captured $file with pluginJSON', {
        file: module.absPath,
    });
    module.read();
    module.contents = pluginStrings_1.wrapContents(module.contents, opts.useDefault);
}
exports.pluginJSONHandler = pluginJSONHandler;
function pluginJSON(a, b) {
    return (ctx) => {
        ctx.ict.on('bundle_resolve_module', props => {
            if (!props.module.captured && props.module.extension === '.json') {
                // filter out options
                const [opts, matcher] = pluginUtils_1.parsePluginOptions(a, b, ctx.config.json);
                if (matcher && !matcher.test(props.module.absPath)) {
                    return;
                }
                pluginJSONHandler(props.module, opts);
            }
            return props;
        });
    };
}
exports.pluginJSON = pluginJSON;
