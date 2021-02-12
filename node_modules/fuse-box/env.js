"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDevelopmentApi = exports.openDevelopmentApi = exports.getDevelopmentApi = exports.getPackageManagerData = exports.env = void 0;
const appRoot = require("app-root-path");
const path = require("path");
const fs = require("fs");
const utils_1 = require("./utils/utils");
const VERSION = '4.0.0';
const FUSE_ROOT = __dirname;;
const WORKER_THREAD = path.resolve(__dirname, 'threading/worker_threads/ProcessThread.js');
exports.env = {
    APP_ROOT: appRoot.path,
    CACHE: {
        PACKAGES: 'packages',
        PROJET_FILES: 'project-files',
        ROOT: path.join(appRoot.path, 'node_modules/.fusebox', VERSION),
    },
    FUSE_MODULES: path.join(FUSE_ROOT, 'modules'),
    FUSE_ROOT: FUSE_ROOT,
    SCRIPT_FILE: require.main.filename,
    SCRIPT_PATH: path.dirname(require.main.filename),
    VERSION: VERSION,
    WORKER_THREAD,
    isTest: !!process.env.JEST_TEST,
};
function getPackageManagerData() {
    if (fs.existsSync(path.join(FUSE_ROOT, './.yarnrc'))
        || fs.existsSync(path.join(FUSE_ROOT, './yarn.lock'))) {
        return { name: 'yarn', installCmd: 'yarn add', installDevCmd: 'yarn add --dev' };
    }
    else if (fs.existsSync(path.join(FUSE_ROOT, './pnpm-lock.yaml'))) {
        return { name: 'pnpm', installCmd: 'pnpm add', installDevCmd: 'pnpm add --save-dev' };
    }
    else {
        // package-lock.json
        return { name: 'npm', installCmd: 'npm install', installDevCmd: 'npm install --save-dev' };
    }
}
exports.getPackageManagerData = getPackageManagerData;
function getDevelopmentApi() {
    const contents = utils_1.readFile(path.join(exports.env.FUSE_MODULES, 'fuse-loader/index.js'));
    return `(function(){
    ${contents}
})();`;
}
exports.getDevelopmentApi = getDevelopmentApi;
function openDevelopmentApi() {
    const contents = utils_1.readFile(path.join(exports.env.FUSE_MODULES, 'fuse-loader/index.js'));
    return `(function(){
    var FuseBox = (function(){
      ${contents}
      return FuseBox;
    })()
`;
}
exports.openDevelopmentApi = openDevelopmentApi;
function closeDevelopmentApi() {
    return `\n})();`;
}
exports.closeDevelopmentApi = closeDevelopmentApi;
