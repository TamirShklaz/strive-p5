"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeLog = exports.COLOR_CODES = void 0;
function findReplace(str, re, fn) {
    return str.replace(re, (...args) => {
        return fn(args);
    });
}
exports.COLOR_CODES = {
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    grey: [90, 39],
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
};
const SYMBOLS = {
    warning: '⚠️ ',
    error: '❌',
    checkmark: `✔`,
    clock: `⏲`,
    success: `${wrapCodeString('✔', exports.COLOR_CODES.green)} `,
};
function wrapCodeString(str, codes) {
    return `\u001b[${codes[0]}m${str}\u001b[${codes[1]}m`;
}
function codeLog(input, vars) {
    return findReplace(input, /(<(\/)?([a-z]+)>)|(([@\$])([a-z0-9_]+))/gi, args => {
        const [, , closing, name, , type, variable] = args;
        if (type) {
            if (type === '$' && vars && vars[variable] !== undefined)
                return vars[variable];
            if (type === '@') {
                if (SYMBOLS[variable])
                    return SYMBOLS[variable];
                else
                    return `@` + variable;
            }
        }
        if (exports.COLOR_CODES[name]) {
            if (closing) {
                return `\u001b[${exports.COLOR_CODES[name][1]}m\u001b[0m`; //needs always to reset after closing, else you might get weird results
            }
            return `\u001b[${exports.COLOR_CODES[name][0]}m`;
        }
        return name;
    });
}
exports.codeLog = codeLog;
