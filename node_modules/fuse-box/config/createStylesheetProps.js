"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStylesheetProps = void 0;
const env_1 = require("../env");
const utils_1 = require("../utils/utils");
function filterAutoImportProps(list) {
    return list.map(item => {
        if (item.capture) {
            if (typeof item.capture === 'string') {
                item.capture = utils_1.path2RegexPattern(item.capture);
            }
        }
        item.file = utils_1.ensureAbsolutePath(item.file, env_1.env.SCRIPT_PATH);
        return item;
    });
}
function createStylesheetProps(props) {
    const ctx = props.ctx;
    const options = {};
    // global configuration
    if (ctx.config.stylesheet) {
        options.paths = ctx.config.stylesheet.paths;
        // global post css config
        options.postCSS = ctx.config.stylesheet.postCSS;
        options.less = ctx.config.stylesheet.less;
        options.macros = ctx.config.stylesheet.macros;
        options.autoImport = ctx.config.stylesheet.autoImport;
    }
    if (props.stylesheet) {
        options.groupResourcesFilesByType = props.stylesheet.groupResourcesFilesByType;
        options.ignoreChecksForCopiedResources = props.stylesheet.ignoreChecksForCopiedResources;
        if (props.stylesheet.paths)
            options.paths = props.stylesheet.paths;
        if (props.stylesheet.postCSS !== undefined) {
            // local override of postcss
            options.postCSS = props.stylesheet.postCSS;
        }
        if (props.stylesheet.less !== undefined) {
            options.less = props.stylesheet.less;
        }
        if (props.stylesheet.macros) {
            options.macros = props.stylesheet.macros;
        }
        if (props.stylesheet.autoImport) {
            options.autoImport = props.stylesheet.autoImport;
        }
    }
    if (options.autoImport) {
        options.autoImport = filterAutoImportProps(options.autoImport);
    }
    if (options.groupResourcesFilesByType === undefined) {
        if (ctx.config.stylesheet) {
            options.groupResourcesFilesByType =
                ctx.config.stylesheet.groupResourcesFilesByType !== undefined
                    ? ctx.config.stylesheet.groupResourcesFilesByType
                    : true;
        }
        else {
            options.groupResourcesFilesByType = true;
        }
    }
    if (options.ignoreChecksForCopiedResources === undefined) {
        if (ctx.config.stylesheet) {
            options.ignoreChecksForCopiedResources =
                ctx.config.stylesheet.ignoreChecksForCopiedResources !== undefined
                    ? ctx.config.stylesheet.ignoreChecksForCopiedResources
                    : true;
        }
        else {
            options.groupResourcesFilesByType = true;
        }
    }
    return options;
}
exports.createStylesheetProps = createStylesheetProps;
