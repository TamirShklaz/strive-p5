"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssHandleResources = void 0;
const cssResolveURL_1 = require("./cssResolveURL");
function cssHandleResources(opts, props) {
    const urlResolver = cssResolveURL_1.cssResolveURL({
        contents: opts.contents,
        ctx: props.ctx,
        filePath: opts.path,
        options: props.options,
    });
    return { contents: urlResolver.contents, file: opts.path };
}
exports.cssHandleResources = cssHandleResources;
