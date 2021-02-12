"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssResolveURL = exports.mapErrorLine = exports.resolveCSSResource = exports.defineResourceGroup = void 0;
const path = require("path");
const extensions_1 = require("../config/extensions");
const utils_1 = require("../utils/utils");
const cssResolveModule_1 = require("./cssResolveModule");
const Expression = /url\(([^\)]+)\)/gm;
function extractValue(input) {
    const first = input.charCodeAt(0);
    const last = input.charCodeAt(input.length - 1);
    if (first === 39 || first === 34) {
        input = input.slice(1);
    }
    if (last === 39 || last === 34) {
        input = input.slice(0, -1);
    }
    if (/data:/.test(input)) {
        return;
    }
    return input;
}
function defineResourceGroup(extension) {
    if (extensions_1.IMAGE_EXTENSIONS.includes(extension)) {
        return 'images';
    }
    if (extensions_1.FONT_EXTENSIONS.includes(extension)) {
        return 'fonts';
    }
    if (extension === '.svg') {
        return 'svg';
    }
    if (extension === '.ico') {
        return 'ico';
    }
    if (extension === '.pdf') {
        return 'documents';
    }
}
exports.defineResourceGroup = defineResourceGroup;
function resolveCSSResource(target, props) {
    const root = path.dirname(props.filePath);
    // getting rid of url#something or url?time=12
    target = target.replace(/[?\#].*$/, '');
    if (props.options.macros) {
        target = cssResolveModule_1.replaceCSSMacros(target, props.options.macros);
    }
    if (!path.isAbsolute(target)) {
        target = path.join(root, target);
    }
    if (utils_1.fileExists(target)) {
        let fileGroup;
        // setting file group
        if (props.options.groupResourcesFilesByType) {
            fileGroup = defineResourceGroup(path.extname(target).toLowerCase());
        }
        let name = utils_1.fastHash(target) + path.extname(target);
        if (fileGroup) {
            name = fileGroup + '/' + name;
        }
        const resourceConfig = props.ctx.config.getResourceConfig(props.options);
        const resourcePublicRoot = resourceConfig.resourcePublicRoot;
        const publicPath = utils_1.joinFuseBoxPath(resourcePublicRoot, name);
        const destination = path.join(resourceConfig.resourceFolder, name);
        // we don't want to copy a file if that was copied before
        if (props.options.ignoreChecksForCopiedResources) {
            props.ctx.taskManager.copyFile(target, destination);
        }
        else {
            if (!utils_1.fileExists(destination)) {
                props.ctx.taskManager.copyFile(target, destination);
            }
        }
        return { destination, original: target, publicPath };
    }
}
exports.resolveCSSResource = resolveCSSResource;
function mapErrorLine(contents, offset) {
    let line = 1;
    let leftOffset = 0;
    for (let i = 0; i <= offset; i++) {
        if (contents[i] === '\n') {
            leftOffset = 0;
            line++;
        }
        else {
            leftOffset++;
        }
    }
    return `${line}:${leftOffset}`;
}
exports.mapErrorLine = mapErrorLine;
function cssResolveURL(props) {
    let contents = props.contents;
    const replaced = [];
    contents = contents.replace(Expression, (match, data, offset, input_string) => {
        let value = extractValue(data);
        if (typeof value === 'undefined') {
            return match;
        }
        // apply macros before checking for special words
        if (props.options.macros) {
            value = cssResolveModule_1.replaceCSSMacros(value, props.options.macros);
        }
        // preserving svg filters, http links, data:image (base64), sass and less variables
        if (/^#|data:|http|\$|@/.test(value)) {
            // return those as is
            return match;
        }
        const result = resolveCSSResource(value, props);
        if (result) {
            replaced.push(result);
            return `url("${result.publicPath}")`;
        }
        props.ctx.log.warn('Failed to resolve $value in $file:$line', {
            file: props.filePath,
            line: mapErrorLine(contents, offset),
            value: value,
        });
        return match;
    });
    return { contents, replaced };
}
exports.cssResolveURL = cssResolveURL;
