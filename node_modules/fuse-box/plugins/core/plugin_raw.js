"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginRaw = exports.pluginRawHandler = void 0;
const pluginStrings_1 = require("../pluginStrings");
const pluginUtils_1 = require("../pluginUtils");
function pluginRawHandler(props) {
    if (!props.module.captured) {
        const module = props.module;
        // read the contents
        module.read();
        module.contents = pluginStrings_1.wrapContents(JSON.stringify(module.contents), props.opts.useDefault);
    }
}
exports.pluginRawHandler = pluginRawHandler;
function pluginRaw(a, b) {
    let [opts, matcher] = pluginUtils_1.parsePluginOptions(a, b, {
        useDefault: false,
    });
    return (ctx) => {
        ctx.ict.on('bundle_resolve_module', props => {
            if (!matcher || (matcher && matcher.test(props.module.absPath))) {
                pluginRawHandler({ ctx, module: props.module, opts });
                return;
            }
            return props;
        });
    };
}
exports.pluginRaw = pluginRaw;
