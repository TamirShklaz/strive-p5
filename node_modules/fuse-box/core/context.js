"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
const path = require("path");
const compilerOptions_1 = require("../compilerOptions/compilerOptions");
const typescriptReferences_1 = require("../compilerOptions/typescriptReferences");
const EnvironmentType_1 = require("../config/EnvironmentType");
const config_1 = require("../config/config");
const devServer_1 = require("../devServer/devServer");
const env_1 = require("../env");
const FuseBoxLogAdapter_1 = require("../fuseLog/FuseBoxLogAdapter");
const hmr_1 = require("../hmr/hmr");
const interceptor_1 = require("../interceptor/interceptor");
const OutputConfigConverter_1 = require("../output/OutputConfigConverter");
const distWriter_1 = require("../output/distWriter");
const compilerHub_1 = require("../threading/worker_threads/compilerHub");
const utils_1 = require("../utils/utils");
const watcher_1 = require("../watcher/watcher");
const webIndex_1 = require("../webIndex/webIndex");
const ContextTaskManager_1 = require("./ContextTaskManager");
function createContext(props) {
    const self = {
        linkedReferences: {},
        systemDependencies: {},
        fatal: (header, messages) => {
            self.log.fuseFatal(header, messages);
            process.exit(1);
        },
        getCachable: () => {
            return {
                linkedReferences: self.linkedReferences,
                systemDependencies: self.systemDependencies,
                tsConfigAtPaths: self.tsConfigAtPaths,
            };
        },
        sendPageReload: (reason) => {
            if (self.devServer) {
                //self.log.line();
                setTimeout(() => {
                    self.log.info('hmr', 'Reloading your browser.' + (reason ? ` Reason: ${reason}` : ''));
                }, 10);
                self.devServer.clientSend('reload', {});
            }
        },
        setLinkedReference: (absPath, module) => {
            let ref = self.linkedReferences[absPath];
            if (!ref) {
                ref = self.linkedReferences[absPath] = { deps: [], mtime: utils_1.getFileModificationTime(absPath) };
            }
            if (!ref.deps.includes(module.id))
                ref.deps.push(module.id);
        },
    };
    self.meta = {};
    const runProps = props.runProps || {};
    let publicConfig = props.publicConfig;
    let publicPath;
    if (typeof publicConfig.webIndex === 'object' && publicConfig.webIndex.publicPath)
        publicPath = publicConfig.webIndex.publicPath;
    self.outputConfig = OutputConfigConverter_1.outputConfigConverter({
        defaultPublicPath: publicPath,
        defaultRoot: path.join(props.scriptRoot || env_1.env.SCRIPT_PATH, 'dist'),
        publicConfig: runProps.bundles,
    });
    self.writer = distWriter_1.distWriter({
        hashEnabled: props.envType === EnvironmentType_1.EnvironmentType.PRODUCTION,
        root: self.outputConfig.distRoot,
    });
    // configuration must be iniialised after the dist writer
    self.config = config_1.createConfig({
        ctx: self,
        envType: props.envType,
        publicConfig: publicConfig,
        runProps: props.runProps,
    });
    self.log = FuseBoxLogAdapter_1.createFuseLogger(self.config.logging);
    //self.weakReferences = createWeakModuleReferences(self);
    self.ict = interceptor_1.createInterceptor();
    self.webIndex = webIndex_1.createWebIndex(self);
    self.taskManager = ContextTaskManager_1.createContextTaskManager(self);
    self.compilerOptions = compilerOptions_1.createCompilerOptions(self);
    // Resolver that can calculate typescript output->input mappings from references
    self.tsTargetResolver =
        self.compilerOptions.tsReferences &&
            typescriptReferences_1.createTsTargetResolver(self.compilerOptions.tsReferences, self.compilerOptions.tsConfig || path.dirname(path.join(env_1.env.SCRIPT_FILE)));
    // custom transformers
    self.userTransformers = [];
    if (!env_1.env.isTest) {
        self.devServer = devServer_1.createDevServer(self);
    }
    watcher_1.createWatcher(self);
    // custom ts configs at path
    self.tsConfigAtPaths = [];
    if (self.config.hmr.enabled)
        hmr_1.createHMR(self);
    self.compilerHub = compilerHub_1.createCompilerHub(self);
    return self;
}
exports.createContext = createContext;
