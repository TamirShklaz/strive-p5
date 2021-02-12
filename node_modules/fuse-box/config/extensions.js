"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FTL_ELIGIBLE_EXTENSIONS = exports.TEXT_EXTENSIONS = exports.LINK_ASSUMPTION_EXTENSIONS = exports.DOCUMENT_EXTENSIONS = exports.STYLESHEET_EXTENSIONS = exports.ICO_EXTENSIONS = exports.IMAGE_EXTENSIONS = exports.FONT_EXTENSIONS = exports.EXECUTABLE_EXTENSIONS = exports.TS_EXTENSIONS = exports.JS_EXTENSIONS = void 0;
exports.JS_EXTENSIONS = ['.js', '.jsx', '.mjs'];
exports.TS_EXTENSIONS = ['.ts', '.tsx'];
exports.EXECUTABLE_EXTENSIONS = [...exports.JS_EXTENSIONS, ...exports.TS_EXTENSIONS];
exports.FONT_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2', '.eot'];
exports.IMAGE_EXTENSIONS = ['.png', '.jpeg', '.jpg', '.gif', '.bmp', '.svg'];
exports.ICO_EXTENSIONS = ['.ico'];
exports.STYLESHEET_EXTENSIONS = ['.css', '.scss', '.sass', '.less', '.styl'];
exports.DOCUMENT_EXTENSIONS = ['.pdf'];
exports.LINK_ASSUMPTION_EXTENSIONS = [
    ...exports.FONT_EXTENSIONS,
    ...exports.IMAGE_EXTENSIONS,
    ...exports.ICO_EXTENSIONS,
    ...exports.DOCUMENT_EXTENSIONS,
];
exports.TEXT_EXTENSIONS = ['.md', '.txt', '.html', '.graphql'];
exports.FTL_ELIGIBLE_EXTENSIONS = [...exports.TEXT_EXTENSIONS, ...exports.STYLESHEET_EXTENSIONS];
