"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputConfigConverter = void 0;
const env_1 = require("../env");
const utils_1 = require("../utils/utils");
const DEFAULT_APP_PATH = 'app.$hash.js';
const DEFAULT_VENDOR_PATH = 'vendor.$hash.js';
const DEFAULT_MAX_BUNDLE_SIZE = 100000; // 100kb
function ensureBundleConfig(input, defaultPublicPath) {
    if (typeof input === 'string')
        return {
            path: input,
            publicPath: defaultPublicPath,
        };
    if (!input.publicPath) {
        input.publicPath = defaultPublicPath;
    }
    return input;
}
function outputConfigConverter(props) {
    const userConfig = props.publicConfig;
    const config = {};
    const defaultPublicPath = props.defaultPublicPath || '/';
    if (userConfig) {
        if (userConfig.distRoot)
            config.distRoot = userConfig.distRoot;
        config.app = userConfig.app
            ? ensureBundleConfig(userConfig.app, defaultPublicPath)
            : { path: DEFAULT_APP_PATH, publicPath: defaultPublicPath };
        if (userConfig.vendor)
            config.vendor = ensureBundleConfig(userConfig.vendor, defaultPublicPath);
        if (userConfig.codeSplitting)
            config.codeSplitting = userConfig.codeSplitting;
        if (userConfig.serverEntry)
            config.serverEntry = userConfig.serverEntry;
        if (userConfig.styles)
            config.styles = ensureBundleConfig(userConfig.styles, defaultPublicPath);
        if (userConfig.exported)
            config.exported = userConfig.exported;
        if (userConfig.mapping) {
            config.mapping = [];
            for (const item of userConfig.mapping) {
                config.mapping.push({
                    matching: item.matching,
                    target: ensureBundleConfig(item.target, defaultPublicPath),
                });
            }
        }
        if (userConfig.cssSplitting !== undefined)
            config.cssSplitting = userConfig.cssSplitting;
    }
    else {
        // creating default config
        config.app = { path: DEFAULT_APP_PATH, publicPath: defaultPublicPath };
        config.vendor = {
            maxBundleSize: DEFAULT_MAX_BUNDLE_SIZE,
            path: DEFAULT_VENDOR_PATH,
            publicPath: defaultPublicPath,
        };
    }
    if (!config.distRoot)
        config.distRoot = props.defaultRoot;
    config.distRoot = utils_1.ensureAbsolutePath(config.distRoot, env_1.env.SCRIPT_PATH);
    if (!config.codeSplitting)
        config.codeSplitting = {};
    if (!config.codeSplitting.path)
        config.codeSplitting.path = 'dynamic/$name.$hash.js';
    if (config.codeSplitting.publicPath === undefined)
        config.codeSplitting.publicPath = defaultPublicPath;
    const DEFAULT_STYLES_DIR = 'styles';
    // styles configuration
    if (!config.styles) {
        config.styles = {
            path: DEFAULT_STYLES_DIR + '/styles.$hash.css',
        };
    }
    if (!config.styles.publicPath)
        config.styles.publicPath = defaultPublicPath;
    if (!config.styles.codeSplitting)
        config.styles.codeSplitting = {};
    if (!config.styles.codeSplitting.path)
        config.styles.codeSplitting.path = 'dynamic/$name.$hash.css';
    if (!config.styles.codeSplitting.publicPath)
        config.styles.codeSplitting.publicPath = defaultPublicPath;
    return config;
}
exports.outputConfigConverter = outputConfigConverter;
