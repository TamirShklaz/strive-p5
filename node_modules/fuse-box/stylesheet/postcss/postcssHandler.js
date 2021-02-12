"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCSSHandler = exports.renderModule = void 0;
const path = require("path");
const postcss_1 = require("postcss");
const atImport = require("postcss-import");
const utils_1 = require("../../utils/utils");
const cssHandleResources_1 = require("../cssHandleResources");
const cssResolveModule_1 = require("../cssResolveModule");
const cssSourceMap_1 = require("../cssSourceMap");
async function callPostCSS(plugins, css, options, logger) {
    return new Promise((resolve, reject) => {
        postcss_1.default(plugins)
            .process(css, options)
            .then(resolve)
            .catch(reject);
    });
}
async function renderModule(props) {
    function loader(url, opts) {
        const data = cssHandleResources_1.cssHandleResources({ contents: utils_1.readFile(url), path: url }, {
            ctx: props.ctx,
            fileRoot: path.dirname(url),
            module: props.module,
            options: props.options,
            url: url,
        });
        return data.contents;
    }
    function resolver(url, root, importOptions) {
        const userPaths = props.options.paths || [];
        const paths = [root].concat(userPaths);
        const resolved = cssResolveModule_1.cssResolveModule({
            extensions: ['.css', '.scss', '.sass'],
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
            return resolved.path;
        }
    }
    const requireSourceMap = props.module.isCSSSourceMapRequired;
    // handle root resources
    const processed = cssHandleResources_1.cssHandleResources({ contents: props.module.contents, path: props.module.absPath }, { ctx: props.ctx, module: props.module, options: props.options });
    let pluginList = [atImport({ load: loader, resolve: resolver })];
    if (props.options.postCSS) {
        if (props.options.postCSS.plugins) {
            pluginList = pluginList.concat(props.options.postCSS.plugins);
        }
    }
    const data = await callPostCSS(pluginList, processed.contents, {
        from: props.module.absPath,
        to: props.module.absPath,
        map: requireSourceMap && { inline: false },
    }, props.ctx.log);
    let sourceMap;
    if (data.map) {
        sourceMap = cssSourceMap_1.alignCSSSourceMap({ ctx: props.ctx, module: props.module, sourceMap: data.map });
    }
    return { css: data.css && data.css.toString(), map: sourceMap };
}
exports.renderModule = renderModule;
function postCSSHandler(props) {
    const { ctx, module } = props;
    return {
        render: async () => renderModule({ ctx, module, options: props.options }),
    };
}
exports.postCSSHandler = postCSSHandler;
