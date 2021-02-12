"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindWatcherReactions = exports.WatchablePathCache = void 0;
const path = require("path");
const bundleDev_1 = require("../development/bundleDev");
const env_1 = require("../env");
const utils_1 = require("../utils/utils");
const watcher_1 = require("./watcher");
exports.WatchablePathCache = {};
// reacting to those events
const WatchableCachePathEvents = ['addDir', 'unlinkDir', 'add'];
/**
 * If a directory is added or removed that affects tsconfig directory
 * Since it's indexed and cached we need to clear the cache
 * and let the resolver refresh it.
 * @see pathsLookup.ts
 * @param target
 */
function verifyWatchablePaths(target) {
    for (let storedPath in exports.WatchablePathCache) {
        const targetDir = path.extname(storedPath) ? path.dirname(storedPath) : storedPath;
        if (utils_1.isPathRelative(targetDir, target))
            exports.WatchablePathCache[storedPath] = undefined;
    }
}
function bindWatcherReactions(ctx) {
    const ict = ctx.ict;
    const RebundleReactions = [
        watcher_1.WatcherReaction.TS_CONFIG_CHANGED,
        watcher_1.WatcherReaction.PACKAGE_LOCK_CHANGED,
        watcher_1.WatcherReaction.FUSE_CONFIG_CHANGED,
        watcher_1.WatcherReaction.PROJECT_FILE_CHANGED,
    ];
    ict.on('watcher_reaction', ({ reactionStack }) => {
        let lastAbsPath;
        for (const item of reactionStack) {
            if (RebundleReactions.includes(item.reaction)) {
                // we're not interested in re-bunlding if user adds an empty directory
                let isEmpty = item.event === 'addDir' && utils_1.isDirectoryEmpty(item.absPath);
                if (!isEmpty)
                    lastAbsPath = item.absPath;
            }
            // checking for adding and removing directories
            // and verity cached paths
            // an empty folder is a valid reason for checking too
            if (WatchableCachePathEvents.includes(item.event))
                verifyWatchablePaths(item.absPath);
        }
        if (lastAbsPath) {
            ctx.log.info('changed', `$file`, {
                file: path.relative(env_1.env.APP_ROOT, lastAbsPath),
            });
            bundleDev_1.bundleDev({ ctx, rebundle: true });
        }
    });
}
exports.bindWatcherReactions = bindWatcherReactions;
