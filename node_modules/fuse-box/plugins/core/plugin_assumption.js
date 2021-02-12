"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginAssumption = void 0;
const createStylesheetProps_1 = require("../../config/createStylesheetProps");
const extensions_1 = require("../../config/extensions");
const plugin_json_1 = require("./plugin_json");
const plugin_less_1 = require("./plugin_less");
const plugin_link_1 = require("./plugin_link");
const plugin_node_native_1 = require("./plugin_node_native");
const plugin_raw_1 = require("./plugin_raw");
const plugin_stylus_1 = require("./plugin_stylus");
function pluginAssumption() {
    return (ctx) => {
        ctx.ict.on('bundle_resolve_module', props => {
            if (!props.module.captured) {
                const ext = props.module.extension;
                if (ext === '.json') {
                    // json handler
                    plugin_json_1.pluginJSONHandler(props.module, {});
                }
                else if (extensions_1.LINK_ASSUMPTION_EXTENSIONS.indexOf(ext) > -1) {
                    // Copy files and give it a link.
                    // e.g import foo from "./foo.svg"
                    plugin_link_1.pluginLinkHandler(props.module, {});
                }
                else if (ext === '.less') {
                    // CSS: Less extension
                    plugin_less_1.pluginLessCapture({
                        ctx,
                        module: props.module,
                        opts: {
                            stylesheet: createStylesheetProps_1.createStylesheetProps({ ctx, stylesheet: {} }),
                        },
                    });
                }
                else if (ext === '.styl') {
                    // CSS: stylus
                    plugin_stylus_1.pluginStylusCapture({
                        ctx,
                        module: props.module,
                        opts: {
                            stylesheet: createStylesheetProps_1.createStylesheetProps({ ctx, stylesheet: {} }),
                        },
                    });
                }
                else if (extensions_1.TEXT_EXTENSIONS.indexOf(ext) > -1) {
                    // Text extensions (like .md or text)
                    plugin_raw_1.pluginRawHandler({ ctx, module: props.module, opts: {} });
                }
                else if (ext === '.node') {
                    // Node native
                    plugin_node_native_1.pluginNodeNativeHandler(props.module);
                }
            }
            return props;
        });
    };
}
exports.pluginAssumption = pluginAssumption;
