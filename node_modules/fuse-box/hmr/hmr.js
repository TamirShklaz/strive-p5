"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHMR = void 0;
const convertSourceMap = require("convert-source-map");
const offsetLinesModule = require("offset-sourcemap-lines");
const bundle_1 = require("../bundle/bundle");
const bundleRuntimeCore_1 = require("../bundleRuntime/bundleRuntimeCore");
const utils_1 = require("../utils/utils");
function generateUpdateId() {
    return utils_1.fastHash(new Date().getTime().toString() + Math.random().toString());
}
function generateAppTree(bundleContext) {
    const tree = {};
    for (const id in bundleContext.modules) {
        const module = bundleContext.modules[id];
        tree[module.id] = {
            deps: module.dependencies,
            path: module.publicPath,
        };
    }
    return tree;
}
const DEFINE_MODULE = bundleRuntimeCore_1.BUNDLE_RUNTIME_NAMES.GLOBAL_OBJ + '.' + bundleRuntimeCore_1.BUNDLE_RUNTIME_NAMES.MODULE_COLLECTION;
function generateUpdateForModules(modules) {
    const response = [];
    for (const module of modules) {
        const concat = new utils_1.Concat(true, '', '\n');
        const opening = DEFINE_MODULE +
            '[' +
            module.id +
            ']' +
            ` = function(${bundleRuntimeCore_1.BUNDLE_RUNTIME_NAMES.ARG_REQUIRE_FUNCTION}, exports, module){`;
        concat.add(null, opening);
        concat.add(null, '// fuse-box-hmr-module-opening');
        concat.add(null, module.contents, module.isSourceMapRequired ? module.sourceMap : undefined);
        concat.add(null, '// fuse-box-hmr-module-closing');
        concat.add(null, '}');
        let stringContent = concat.content.toString();
        const rawSourceMap = concat.sourceMap;
        if (module.isSourceMapRequired) {
            if (rawSourceMap) {
                let json = JSON.parse(rawSourceMap);
                // since new Function wrapoer adds extra 2 lines we need to shift sourcemaps
                json = offsetLinesModule(json, 2);
                const sm = convertSourceMap.fromObject(json).toComment();
                stringContent += '\n' + sm;
            }
        }
        response.push({ content: stringContent, id: module.id, path: module.publicPath });
    }
    return response;
}
function createHMR(ctx) {
    const { ict } = ctx;
    if (!ctx.config.devServer.enabled)
        return;
    const devServer = ctx.devServer;
    const tasks = {};
    const config = ctx.config;
    ict.on('entry_resolve', async (props) => {
        const module = props.module;
        if (ctx.config.hmr.enabled) {
            if (config.hmr.plugin) {
                if (!utils_1.fileExists(config.hmr.plugin)) {
                    ctx.fatal('Failed to resolve HMR plugin file', [
                        config.hmr.plugin,
                        'Make sure to resolve it correctly',
                        'File name should absolute or relative to your fuse file',
                    ]);
                }
                const data = await module.resolve({ statement: config.hmr.plugin });
                ctx.compilerOptions.buildEnv.hmrModuleId = data.module.id;
            }
            await module.resolve({ statement: 'fuse-box-hot-reload' });
        }
    });
    ict.on('rebundle', props => {
        const id = generateUpdateId();
        tasks[id] = true;
        devServer.clientSend('get-summary', { id });
    });
    ctx.ict.on('watcher_reaction', props => {
        for (const r of props.reactionStack) {
            if (r.absPath === config.hmr.plugin) {
                // send a reload
                ctx.sendPageReload('HMR module plugin');
            }
        }
    });
    function sendUpdates(payload, ws_instance) {
        const moduleIds = payload.summary.modules;
        const moduleForUpdate = [];
        for (const absPath in ctx.bundleContext.modules) {
            const module = ctx.bundleContext.modules[absPath];
            //console.log(module.absPath, module.isCached);
            if (!moduleIds.includes(module.id) || !module.isCached) {
                moduleForUpdate.push(module);
            }
        }
        const bundle = bundle_1.createBundle({ ctx: ctx });
        bundle.source.modules = moduleForUpdate;
        const appModules = generateAppTree(ctx.bundleContext);
        const updates = generateUpdateForModules(moduleForUpdate);
        const moduleIdsForUpdate = moduleForUpdate.map(m => m.id);
        devServer.clientSend('hmr', { appModules, updates }, ws_instance);
        const amount = moduleIdsForUpdate.length;
        ctx.log.info('hmr', '<dim>Sending $amount $modules to the client</dim>', {
            amount,
            modules: amount !== 1 ? 'modules' : 'module',
        });
    }
    devServer.onClientMessage((event, payload, ws_instance) => {
        const task = tasks[payload.id];
        if (event === 'summary' && payload.id && task) {
            sendUpdates(payload, ws_instance);
        }
    });
}
exports.createHMR = createHMR;
