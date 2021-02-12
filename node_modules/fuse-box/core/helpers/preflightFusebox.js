"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preflightFusebox = void 0;
const env_1 = require("../../env");
const plugin_assumption_1 = require("../../plugins/core/plugin_assumption");
const plugin_css_1 = require("../../plugins/core/plugin_css");
const plugin_sass_1 = require("../../plugins/core/plugin_sass");
const utils_1 = require("../../utils/utils");
const ts = require("typescript");
const watcher_1 = require("../../watcher/watcher");
const finalizeFusebox_1 = require("./finalizeFusebox");
function preflightFusebox(ctx) {
    const log = ctx.log;
    checkVersion(log);
    log.fuseHeader({
        // cacheFolder: ctx.cache && ctx.cache.rootFolder,
        entry: ctx.config.entries[0],
        mode: ctx.config.isProduction ? 'production' : 'development',
        version: env_1.env.VERSION,
    });
    const plugins = [...ctx.config.plugins, plugin_assumption_1.pluginAssumption(), plugin_css_1.pluginCSS(), plugin_sass_1.pluginSass()];
    plugins.forEach(plugin => plugin && plugin(ctx));
    ctx.ict.on('complete', () => finalizeFusebox_1.finalizeFusebox(ctx));
    ctx.ict.on('rebundle', () => finalizeFusebox_1.finalizeFusebox(ctx));
    setTimeout(() => {
        // push this one down the stack to it's triggered the last one
        // letting other handlers to do their job (clearing the cache for example)
        const ExitableReactions = [watcher_1.WatcherReaction.TS_CONFIG_CHANGED, watcher_1.WatcherReaction.FUSE_CONFIG_CHANGED];
        ctx.ict.on('watcher_reaction', ({ reactionStack }) => {
            for (const item of reactionStack) {
                if (ExitableReactions.includes(item.reaction)) {
                    log.stopStreaming();
                    //log.clearConsole();
                    log.line();
                    log.echo(' <yellow><bold> @warning Your configuration has changed.</bold> </yellow>');
                    log.echo(' <yellow><bold> @warning Cache has been cleared</bold> </yellow>');
                    log.echo(' <yellow><bold> @warning Exiting the process</bold> </yellow>');
                    //process.kill(process.pid);
                    process.exit(0);
                }
            }
        });
    }, 0);
}
exports.preflightFusebox = preflightFusebox;
function checkVersion(log) {
    const nodeVersion = utils_1.parseVersion(process.version)[0];
    if (nodeVersion < 11) {
        log.warn('You are using an older version of Node.js $version. Upgrade to at least Node.js v11 to get the maximium speed out of FuseBox', { version: process.version });
    }
    const tsVersion = utils_1.parseVersion(ts.version);
    if (tsVersion[0] < 3) {
        log.warn('You are using an older version of TypeScript $version. FuseBox builds might not work properly', {
            version: tsVersion,
        });
    }
}
