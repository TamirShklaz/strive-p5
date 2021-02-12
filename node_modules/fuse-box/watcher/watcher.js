"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWatcher = exports.WatcherReaction = void 0;
const chokidar_1 = require("chokidar");
const path = require("path");
const env_1 = require("../env");
const utils_1 = require("../utils/utils");
const bindWatcherReactions_1 = require("./bindWatcherReactions");
var WatcherReaction;
(function (WatcherReaction) {
    WatcherReaction[WatcherReaction["UNMATCHED"] = 0] = "UNMATCHED";
    WatcherReaction[WatcherReaction["TS_CONFIG_CHANGED"] = 1] = "TS_CONFIG_CHANGED";
    WatcherReaction[WatcherReaction["FUSE_CONFIG_CHANGED"] = 2] = "FUSE_CONFIG_CHANGED";
    WatcherReaction[WatcherReaction["PACKAGE_LOCK_CHANGED"] = 3] = "PACKAGE_LOCK_CHANGED";
    WatcherReaction[WatcherReaction["PROJECT_FILE_CHANGED"] = 4] = "PROJECT_FILE_CHANGED";
})(WatcherReaction = exports.WatcherReaction || (exports.WatcherReaction = {}));
const Reactions = [
    { clearCache: true, reaction: WatcherReaction.TS_CONFIG_CHANGED, test: /tsconfig\.json$/ },
    { reaction: WatcherReaction.PACKAGE_LOCK_CHANGED, test: /(package|yarn)-lock\.json$/ },
    { clearCache: true, reaction: WatcherReaction.FUSE_CONFIG_CHANGED, test: /fuse\.(js|ts)$/ },
];
function createWatcher(ctx) {
    const config = ctx.config;
    if (!config.watcher.enabled)
        return;
    const props = config.watcher;
    const ict = ctx.ict;
    bindWatcherReactions_1.bindWatcherReactions(ctx);
    let includePaths = [];
    let ignorePaths = [];
    const { root } = props;
    // ensure root is string[]
    const roots = typeof root === "string" ? [root] : root;
    // ensure roots are absolute paths
    const absRoots = roots && roots.map(r => utils_1.ensureScriptRoot(r));
    if (!props.include) {
        if (absRoots) {
            includePaths = absRoots.map(utils_1.path2RegexPattern);
        }
        else {
            // taking an assumption that the watch directory should be next to the entry point
            const entryPath = path.dirname(ctx.config.entries[0]);
            includePaths.push(utils_1.path2RegexPattern(entryPath));
        }
    }
    else {
        for (const prop of props.include) {
            if (typeof prop === 'string') {
                includePaths.push(utils_1.path2RegexPattern(utils_1.ensureScriptRoot(prop)));
            }
            else
                includePaths.push(prop);
        }
    }
    if (props.ignore) {
        for (const ignore of props.ignore) {
            ignorePaths.push(utils_1.path2RegexPattern(ignore));
        }
    }
    else {
        // default ignored paths
        ignorePaths.push(/node_modules/, /(\/|\\)\./, utils_1.path2RegexPattern('/dist/'), utils_1.path2RegexPattern('/build/'), /flycheck_/, /~$/, /\#.*\#$/, utils_1.path2RegexPattern(ctx.writer.outputDirectory));
    }
    let reactionStack = [];
    async function waitForContextReady(props, cb) {
        function awaitContext(resolve) {
            if (ctx.isWorking) {
                setTimeout(() => {
                    awaitContext(resolve);
                }, 10);
            }
            else
                !props.cancelled && cb();
        }
        awaitContext(cb);
    }
    const awaitProps = { cancelled: false };
    function acceptEvents() {
        ict.sync('watcher_reaction', { reactionStack });
        reactionStack = [];
    }
    let tm;
    function dispatchEvent(event, absPath) {
        clearTimeout(tm);
        let projectFilesChanged = false;
        for (const userPath of includePaths) {
            if (userPath.test(absPath)) {
                projectFilesChanged = true;
                break;
            }
        }
        if (projectFilesChanged) {
            //ctx.log.clearConsole();
            ctx.log.line();
        }
        if (projectFilesChanged)
            reactionStack.push({ absPath, event, reaction: WatcherReaction.PROJECT_FILE_CHANGED });
        for (const x of Reactions) {
            if (x.test.test(absPath))
                reactionStack.push({ absPath, reaction: x.reaction });
        }
        awaitProps.cancelled = true;
        // throttle events
        tm = setTimeout(() => {
            awaitProps.cancelled = false;
            waitForContextReady(awaitProps, () => {
                acceptEvents();
            });
        }, 10);
    }
    const self = {
        // initialize the watcher
        init: () => {
            const defaultOpts = {
                awaitWriteFinish: {
                    pollInterval: 100,
                    stabilityThreshold: 100,
                },
                ignoreInitial: true,
                ignored: ignorePaths,
                interval: 100,
                persistent: true,
            };
            const userOptions = props.chokidarOptions || {};
            const finalOptions = Object.assign(Object.assign({}, defaultOpts), userOptions);
            // if no user-roots are specified, use APP_ROOT
            // ensure that SCRIPT_PATH gets watched
            // and remove any redundant paths
            const watchRoots = utils_1.excludeRedundantFolders([...(absRoots || [env_1.env.APP_ROOT]), env_1.env.SCRIPT_PATH]);
            const watcher = chokidar_1.watch(watchRoots, finalOptions);
            watcher.on('all', dispatchEvent);
        },
    };
    ict.on('init', self.init);
    return self;
}
exports.createWatcher = createWatcher;
