"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginConsolidate = void 0;
const utils_1 = require("../../utils/utils");
const env_1 = require("../../env");
function pluginConsolidate(engine, options) {
    return async (ctx) => {
        if (!utils_1.isNodeModuleInstalled('consolidate')) {
            ctx.fatal(`Fatal error when trying to use  pluginConsolidate`, [
                'Module "consolidate" is required, Please install it using the following command',
                `${env_1.getPackageManagerData().installDevCmd} consolidate`,
            ]);
        }
        const consolidate = require('consolidate');
        ctx.ict.waitFor('before_webindex_write', async (props) => {
            if (typeof consolidate[engine] !== 'function') {
                ctx.fatal(`The template engine you selected is not available in consolidate: ${engine}`);
            }
            try {
                const processedTemplate = await consolidate[engine](props.filePath, Object.assign(Object.assign({}, options), { bundles: props.bundles }));
                props.fileContents = processedTemplate;
            }
            catch (e) {
                ctx.fatal('Error processing the web-index template using consolidate.', [e.message]);
            }
            return props;
        });
    };
}
exports.pluginConsolidate = pluginConsolidate;
