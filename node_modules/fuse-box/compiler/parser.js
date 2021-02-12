"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJavascript = exports.parseTypeScript = void 0;
const parser = require("@typescript-eslint/typescript-estree");
const meriyah = require("meriyah");
function parseTypeScript(code, props) {
    props = props || {};
    return parser.parse(code, {
        range: props.locations,
        useJSXTextNode: true,
        loc: props.locations,
        jsx: props.jsx,
    });
}
exports.parseTypeScript = parseTypeScript;
function parseJavascript(code, props) {
    props = props || {};
    return meriyah.parse(code, { jsx: props.jsx, loc: props.locations, module: true, raw: true });
}
exports.parseJavascript = parseJavascript;
