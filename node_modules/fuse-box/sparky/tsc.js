"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsc = void 0;
const child_process_1 = require("child_process");
const env_1 = require("../env");
async function tsc(opts, target) {
    let tscOptions = [];
    for (const key in opts) {
        if (opts[key] !== undefined) {
            if (key === 'watch') {
                tscOptions.push(`--${key}`);
            }
            else {
                tscOptions.push(`--${key}`, String(opts[key]));
            }
        }
    }
    if (target) {
        const files = [].concat(target);
        for (const f of files)
            tscOptions.push(f);
    }
    return new Promise((resolve, reject) => {
        const proc = child_process_1.spawn('tsc' + (/^win/.test(process.platform) ? '.cmd' : ''), tscOptions, {
            cwd: env_1.env.SCRIPT_PATH,
            stdio: 'ignore',
        });
        proc.on('close', function (code) {
            if (code === 8) {
                return reject('Error detected');
            }
            return resolve();
        });
    });
}
exports.tsc = tsc;
