"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuseLog = void 0;
const colors_1 = require("./colors");
class FuseLog {
    constructor() {
        this.indent = '  ';
    }
    getString(message, vars) {
        return colors_1.codeLog(message, vars);
    }
    echo(message, vars) {
        this.log('echo', this.getString(message, vars));
    }
    info(group, message, vars) {
        let str = this.indent;
        if (group) {
            str += `<bold><cyan>${group}</cyan></bold> `;
        }
        str += `<dim>${message}</dim>`;
        this.log('info', colors_1.codeLog(str, vars));
    }
    warn(message, vars) {
        this.log('warn', colors_1.codeLog(`${this.indent}<bold>@warning <yellow>${message}</yellow></bold> `, vars));
    }
    success(message, vars) {
        this.log('success', colors_1.codeLog(`${this.indent}<bold>@success <green>${message}</green></bold> `, vars));
    }
    meta(group, message, vars) {
        this.log('meta', colors_1.codeLog(`${this.indent}<bold><dim><yellow>${group}</yellow> <cyan>${message}</cyan></dim></bold>`, vars));
    }
    error(message, vars) {
        this.log('error', colors_1.codeLog(`${this.indent}<bold>@error <red>${message}</red></bold> `, vars));
    }
}
exports.FuseLog = FuseLog;
