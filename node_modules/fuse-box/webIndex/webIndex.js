"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebIndex = exports.getEssentialWebIndexParams = exports.replaceWebIndexStrings = void 0;
const path_1 = require("path");
const bundle_1 = require("../bundle/bundle");
const env_1 = require("../env");
const cssResolveURL_1 = require("../stylesheet/cssResolveURL");
const utils_1 = require("../utils/utils");
const htmlStrings_1 = require("./htmlStrings");
function replaceWebIndexStrings(str, keys) {
    return str.replace(/\$([a-z_-]+)/gi, (_var, name) => {
        return keys[name] !== undefined ? (typeof keys[name] === 'object' ? JSON.stringify(keys[name]) : keys[name]) : '';
    });
}
exports.replaceWebIndexStrings = replaceWebIndexStrings;
function getEssentialWebIndexParams(config, log) {
    let templatePath = path_1.join(env_1.env.FUSE_MODULES, 'web-index-default-template/template.html');
    let publicPath = '/';
    let distFileName = 'index.html';
    let templateContent = utils_1.readFile(templatePath);
    if (typeof config === 'object') {
        if (config.template) {
            templatePath = utils_1.ensureAbsolutePath(config.template, env_1.env.SCRIPT_PATH);
        }
        if (config.publicPath) {
            publicPath = config.publicPath;
        }
        if (config.distFileName) {
            distFileName = config.distFileName;
        }
    }
    if (utils_1.fileExists(templatePath)) {
        templateContent = utils_1.readFile(templatePath);
    }
    else {
        log.warn('No webIndex template found, using default HTML template instead.');
    }
    return {
        distFileName,
        publicPath,
        templateContent,
        templatePath,
    };
}
exports.getEssentialWebIndexParams = getEssentialWebIndexParams;
function createWebIndex(ctx) {
    const config = ctx.config.webIndex;
    const isDisabled = config.enabled === false;
    const logger = ctx.log;
    if (isDisabled) {
        return { isDisabled };
    }
    let lateBundles;
    let opts;
    const self = {
        generate: async (bundles) => {
            opts = getEssentialWebIndexParams(config, ctx.log);
            // memorize those to re-generate webIndex is needed
            lateBundles = bundles;
            const scriptTags = [];
            const cssTags = [];
            bundles.sort((a, b) => a.bundle.priority - b.bundle.priority);
            bundles.forEach(item => {
                const isCSS = item.bundle.type === bundle_1.BundleType.CSS_APP;
                if (item.bundle.webIndexed) {
                    if (isCSS) {
                        cssTags.push(htmlStrings_1.htmlStrings.cssTag(item.browserPath));
                    }
                    else {
                        scriptTags.push(htmlStrings_1.htmlStrings.scriptTag(item.browserPath));
                    }
                }
            });
            let fileContents = opts.templateContent;
            fileContents = fileContents.replace(/\$import\('(.+?)'\)/g, (_, relPath) => {
                const result = cssResolveURL_1.resolveCSSResource(relPath, {
                    contents: '',
                    ctx,
                    filePath: opts.templatePath,
                    options: ctx.config.stylesheet,
                });
                if (result) {
                    return result.publicPath;
                }
                else {
                    ctx.log.warn(`Unable to resolve ${result.original}`);
                    return '';
                }
            });
            const scriptOpts = {
                bundles: scriptTags.join('\n'),
                css: cssTags.join('\n'),
            };
            fileContents = replaceWebIndexStrings(fileContents, scriptOpts);
            logger.info('webindex', '<dim>writing to $name</dim>', {
                name: opts.distFileName,
            });
            await ctx.writer.write(opts.distFileName, fileContents);
        },
        resolve: (userPath) => {
            return utils_1.joinFuseBoxPath(opts.publicPath, userPath);
        },
    };
    ctx.ict.on('watcher_reaction', ({ reactionStack }) => {
        for (const item of reactionStack) {
            if (opts && item.absPath === opts.templatePath && lateBundles) {
                logger.info('webindex', '<magenta><bold>Detected changes to webIndex source. Will regenerate now</bold></magenta>', {
                    name: opts.distFileName,
                });
                self.generate(lateBundles).then(() => {
                    ctx.sendPageReload('webindex change');
                });
            }
        }
    });
    ctx.ict.on('complete', ({ bundles }) => self.generate(bundles));
    return self;
}
exports.createWebIndex = createWebIndex;
