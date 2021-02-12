"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssContextHandler = exports.setEmpty = void 0;
const postcss_1 = require("postcss");
const cssDevModuleRender_1 = require("../../stylesheet/cssDevModuleRender");
const utils_1 = require("../../utils/utils");
const pluginStrings_1 = require("../pluginStrings");
const env_1 = require("../../env");
function setEmpty() { }
exports.setEmpty = setEmpty;
async function createCSSModule(props) {
    let targetJSON;
    return new Promise((resolve, reject) => {
        postcss_1.default([
            require('postcss-modules')({
                getJSON: function (cssFileName, json, outputFileName) {
                    targetJSON = json;
                },
            }),
        ])
            .process(props.css, {
            from: props.module.absPath,
            map: props.module.isCSSSourceMapRequired && { inline: false },
            to: props.module.absPath,
        })
            .then(result => {
            return resolve({ css: result.css, json: targetJSON, map: result.map });
        });
    });
}
function cssContextHandler(props) {
    const { ctx, processor, shared } = props;
    const supported = props.ctx.config.supportsStylesheet() || shared.asText || shared.asModule;
    if (!supported) {
        props.module.contents = 'module.exports = {}';
        return;
    }
    if (shared.asModule) {
        if (!utils_1.isNodeModuleInstalled('postcss-modules')) {
            ctx.fatal(`Fatal error when capturing ${props.module.absPath}`, [
                'Module "postcss-modules" is required, Please install it using the following command',
                `${env_1.getPackageManagerData().installDevCmd} postcss-modules`,
            ]);
            return;
        }
    }
    ctx.ict.promise(async () => {
        try {
            // reset errored status
            props.module.errored = false;
            const data = await processor.render();
            const rendererProps = {
                ctx,
                data,
                fuseCSSModule: props.fuseCSSModule,
                module: props.module,
                options: props.options,
                useDefault: props.shared.useDefault,
            };
            if (shared.asModule) {
                const result = await createCSSModule({ css: data.css, module: props.module, shared: props.shared });
                data.json = result.json;
                data.map = undefined;
                data.css = result.css;
                props.module.isCSSModule = true;
                props.module.breakDependantsCache = true;
            }
            else if (shared.asText) {
                props.module.isCSSText = true;
                props.module.isStylesheet = false;
                props.module.contents = pluginStrings_1.wrapContents(JSON.stringify(data.css), props.shared.useDefault);
                return;
            }
            if (ctx.config.isProduction) {
                props.module.css = data;
                if (shared.asModule && data.json) {
                    props.module.contents = pluginStrings_1.wrapContents(JSON.stringify(data.json), props.shared.useDefault);
                }
            }
            else {
                cssDevModuleRender_1.cssDevModuleRender(Object.assign({}, rendererProps));
            }
        }
        catch (e) {
            // prevent module from being cached
            props.module.errored = true;
            let errMessage = e.message ? e.message : `Uknown error in file ${props.module.absPath}`;
            props.module.contents = `console.error(${JSON.stringify(errMessage)})`;
            ctx.log.error('$error in $file', {
                error: e.message,
                file: props.module.absPath,
            });
        }
    });
}
exports.cssContextHandler = cssContextHandler;
