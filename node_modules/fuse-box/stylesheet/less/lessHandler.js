"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessHandler = exports.renderModule = void 0;
const utils_1 = require("../../utils/utils");
const cssHandleResources_1 = require("../cssHandleResources");
const cssResolveModule_1 = require("../cssResolveModule");
const cssSourceMap_1 = require("../cssSourceMap");
async function renderWithLess(less, contents, options) {
    return new Promise((resolve, reject) => {
        less.render(contents, options).then(function (output) {
            return resolve({ css: output.css, map: output.map });
        }, function (error) {
            return reject(error);
        });
    });
}
async function renderModule(props) {
    const Importer = {
        install: (less, manager) => {
            manager.addFileManager(new (class extends less.FileManager {
                loadFile(url, root, options, environment) {
                    return new Promise((resolve, reject) => {
                        const userPaths = props.options.paths || [];
                        const paths = [root].concat(userPaths);
                        const resolved = cssResolveModule_1.cssResolveModule({
                            extensions: ['.less', '.css'],
                            options: props.options,
                            paths,
                            target: url,
                            tryUnderscore: true,
                        });
                        if (resolved.success) {
                            if (props.options.breakDependantsCache) {
                                props.module.breakDependantsCache = true;
                            }
                            props.module.ctx.setLinkedReference(resolved.path, props.module);
                            const contents = utils_1.readFile(resolved.path);
                            const processed = cssHandleResources_1.cssHandleResources({ contents: contents, path: resolved.path }, { ctx: props.ctx, module: props.module, options: props.options });
                            return resolve({ contents: processed.contents, environment, filename: resolved.path, options });
                        }
                        else {
                            reject(`Cannot find module ${url} at ${root}`);
                        }
                    });
                }
            })());
        },
    };
    const module = props.module;
    const requireSourceMap = props.module.isCSSSourceMapRequired;
    // handle root resources
    const processed = cssHandleResources_1.cssHandleResources({ contents: props.module.contents, path: props.module.absPath }, { ctx: props.ctx, module: props.module, options: props.options });
    let pluginList = [Importer];
    let compilerOptions = {};
    if (props.options.less) {
        if (props.options.less.plugins) {
            pluginList = pluginList.concat(props.options.less.plugins);
        }
        if (props.options.less.options) {
            compilerOptions = props.options.less.options;
        }
    }
    const data = await renderWithLess(props.less, processed.contents, Object.assign(Object.assign({}, compilerOptions), { sourceMap: requireSourceMap && { outputSourceFiles: true }, filename: module.absPath, plugins: pluginList }));
    let sourceMap;
    if (data.map) {
        sourceMap = cssSourceMap_1.alignCSSSourceMap({ ctx: props.ctx, module: props.module, sourceMap: data.map });
    }
    return { css: data.css, map: sourceMap };
}
exports.renderModule = renderModule;
function lessHandler(props) {
    const { ctx, module } = props;
    const less = require('less');
    return {
        render: async () => renderModule({ ctx, less, module, options: props.options }),
    };
}
exports.lessHandler = lessHandler;
