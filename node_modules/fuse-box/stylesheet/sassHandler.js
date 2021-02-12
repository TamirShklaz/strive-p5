"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sassHandler = exports.renderModule = exports.sassImporter = void 0;
const path = require("path");
const utils_1 = require("../utils/utils");
const cssAutoImport_1 = require("./cssAutoImport");
const cssHandleResources_1 = require("./cssHandleResources");
const cssResolveModule_1 = require("./cssResolveModule");
const cssSourceMap_1 = require("./cssSourceMap");
function evaluateSass(sassModule, options) {
    return new Promise((resolve, reject) => {
        sassModule.render(options, (err, result) => {
            if (err)
                return reject(err);
            return resolve(result);
        });
    });
}
function sassImporter(props) {
    const userPaths = props.options.paths || [];
    const root = path.dirname(props.fileRoot);
    const paths = [root].concat(userPaths);
    const resolved = cssResolveModule_1.cssResolveModule({
        extensions: ['.scss', '.sass', '.css'],
        options: props.options,
        paths,
        target: props.url,
        tryUnderscore: true,
    });
    if (resolved.success) {
        let fileContents = utils_1.readFile(resolved.path);
        if (props.options.autoImport) {
            fileContents = cssAutoImport_1.cssAutoImport({ contents: fileContents, stylesheet: props.options, url: resolved.path });
        }
        return cssHandleResources_1.cssHandleResources({ contents: fileContents, path: resolved.path }, props);
    }
}
exports.sassImporter = sassImporter;
async function renderModule(props) {
    const { ctx, module, nodeSass } = props;
    const requireSourceMap = module.isCSSSourceMapRequired;
    // handle root resources
    const processed = cssHandleResources_1.cssHandleResources({ contents: module.contents, path: module.absPath }, { ctx: props.ctx, module: module, options: props.options });
    let contents = processed.contents;
    if (props.options.autoImport) {
        contents = cssAutoImport_1.cssAutoImport({ contents: contents, stylesheet: props.options, url: props.module.absPath });
    }
    //const processed = { contents: module.contents, file: module.props.absPath };
    const data = await evaluateSass(nodeSass, {
        data: contents,
        file: processed.file,
        sourceMap: requireSourceMap,
        includePaths: [path.dirname(module.absPath)],
        outFile: module.absPath,
        sourceMapContents: requireSourceMap,
        indentedSyntax: module.extension === ".sass",
        importer: function (url, prev) {
            // gathering imported dependencies in order to let the watcher pickup the right module
            const result = sassImporter({ options: props.options, ctx, module, url, fileRoot: prev });
            if (result && result.file) {
                ctx.setLinkedReference(result.file, props.module);
                return result;
            }
            return url;
        },
    });
    let sourceMap;
    if (data.map) {
        sourceMap = cssSourceMap_1.alignCSSSourceMap({ ctx: props.ctx, module: props.module, sourceMap: data.map });
    }
    return { css: data.css && data.css.toString(), map: sourceMap };
}
exports.renderModule = renderModule;
function sassHandler(props) {
    const { ctx, module } = props;
    const nodeSass = require('node-sass');
    if (!nodeSass) {
        return;
    }
    return {
        render: async () => renderModule({ ctx, module, nodeSass, options: props.options }),
    };
}
exports.sassHandler = sassHandler;
