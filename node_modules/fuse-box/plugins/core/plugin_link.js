"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginLink = exports.pluginLinkHandler = void 0;
const path = require("path");
const cssResolveURL_1 = require("../../stylesheet/cssResolveURL");
const utils_1 = require("../../utils/utils");
const pluginStrings_1 = require("../pluginStrings");
function pluginLinkHandler(module, options) {
    const ctx = module.ctx;
    const resourceConfig = ctx.config.getResourceConfig();
    const resourcePublicRoot = ctx.config.getPublicRoot(options.resourcePublicRoot ? options.resourcePublicRoot : ctx.config.link.resourcePublicRoot);
    const target = module.absPath;
    let fileGroup;
    if (ctx.config.stylesheet.groupResourcesFilesByType) {
        fileGroup = cssResolveURL_1.defineResourceGroup(path.extname(target).toLowerCase());
    }
    let name = utils_1.fastHash(target) + path.extname(target);
    if (fileGroup) {
        name = fileGroup + '/' + name;
    }
    const publicPath = utils_1.joinFuseBoxPath(resourcePublicRoot, name);
    const destination = path.join(resourceConfig.resourceFolder, name);
    module.captured = true;
    ctx.log.info('link', 'Captured $file with <bold>pluginLink</bold>', {
        file: module.absPath,
    });
    if (!utils_1.fileExists(destination)) {
        ctx.taskManager.copyFile(module.absPath, destination);
    }
    module.contents = pluginStrings_1.wrapContents(JSON.stringify(publicPath), options.useDefault !== undefined ? options.useDefault : ctx.config.link.useDefault);
}
exports.pluginLinkHandler = pluginLinkHandler;
function pluginLink(target, options) {
    let matcher;
    if (typeof target === 'string') {
        matcher = utils_1.path2RegexPattern(target);
    }
    else
        matcher = target;
    options = options || {};
    return (ctx) => {
        ctx.ict.on('bundle_resolve_module', props => {
            if (!props.module.captured) {
                // filter out options
                if (!matcher.test(props.module.absPath)) {
                    return;
                }
                pluginLinkHandler(props.module, options);
            }
            return props;
        });
    };
}
exports.pluginLink = pluginLink;
