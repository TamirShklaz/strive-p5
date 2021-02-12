"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginReplace = void 0;
const utils_1 = require("../../utils/utils");
const pluginUtils_1 = require("../pluginUtils");
function pluginReplace(a, b) {
    const [opts, matcher] = pluginUtils_1.parsePluginOptions(a, b, {});
    const expressions = [];
    for (let key in opts) {
        expressions.push([utils_1.safeRegex(key), opts[key]]);
    }
    return (ctx) => {
        ctx.ict.on('module_init', props => {
            // filter out options
            if (matcher && !matcher.test(props.module.absPath)) {
                return;
            }
            const { module } = props;
            ctx.log.info('pluginReplace', 'replacing in $file', {
                file: module.absPath,
            });
            module.read();
            for (const items of expressions) {
                module.contents = module.contents.replace(items[0], items[1]);
            }
            return props;
        });
    };
}
exports.pluginReplace = pluginReplace;
