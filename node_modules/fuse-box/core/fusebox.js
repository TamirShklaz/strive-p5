"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fusebox = void 0;
const EnvironmentType_1 = require("../config/EnvironmentType");
const bundleDev_1 = require("../development/bundleDev");
const bundleProd_1 = require("../production/bundleProd");
const context_1 = require("./context");
const preflightFusebox_1 = require("./helpers/preflightFusebox");
function fusebox(publicConfig) {
    async function execute(props) {
        let response;
        const ctx = context_1.createContext(props);
        ctx.isWorking = true;
        ctx.ict.sync('init', { ctx: ctx });
        preflightFusebox_1.preflightFusebox(ctx);
        switch (props.envType) {
            case EnvironmentType_1.EnvironmentType.DEVELOPMENT:
                try {
                    response = await bundleDev_1.bundleDev({ ctx, rebundle: false });
                }
                catch (e) {
                    ctx.fatal('Error during development build', [e.stack]);
                }
                break;
            case EnvironmentType_1.EnvironmentType.PRODUCTION:
                try {
                    response = await bundleProd_1.bundleProd(ctx);
                }
                catch (e) {
                    ctx.fatal('Error during production build', [e.stack]);
                }
                break;
        }
        ctx.isWorking = false;
        return response;
    }
    return {
        runDev: (runProps) => execute({ envType: EnvironmentType_1.EnvironmentType.DEVELOPMENT, publicConfig, runProps }),
        runProd: (runProps) => execute({ envType: EnvironmentType_1.EnvironmentType.PRODUCTION, publicConfig, runProps }),
    };
}
exports.fusebox = fusebox;
