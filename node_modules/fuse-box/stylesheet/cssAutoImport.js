"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssAutoImport = void 0;
const path = require("path");
function cssAutoImport(props) {
    let contents = props.contents;
    let extraHeaders = [];
    for (const autoImport of props.stylesheet.autoImport) {
        if (autoImport.file !== props.url) {
            if (!autoImport.capture || (autoImport.capture && autoImport.capture['test'](props.url))) {
                const relativePath = path.relative(path.dirname(props.url), autoImport.file);
                extraHeaders.push(`@import ${JSON.stringify(relativePath)};`);
            }
        }
    }
    if (extraHeaders.length) {
        contents = extraHeaders.join('\n') + '\n' + contents;
    }
    return contents;
}
exports.cssAutoImport = cssAutoImport;
