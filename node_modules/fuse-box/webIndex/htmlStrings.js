"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlStrings = void 0;
exports.htmlStrings = {
    scriptTag: (path) => {
        return `<script type="text/javascript" src="${path}"></script>`;
    },
    embedScriptTag: (contents) => {
        return `<script type="text/javascript">\n${contents}\n</script>`;
    },
    cssTag: (path) => {
        return `<link href="${path}" rel="stylesheet"/>`;
    },
    cssTagScript: (content) => {
        return `<style>\n${content}\n</style>`;
    },
};
