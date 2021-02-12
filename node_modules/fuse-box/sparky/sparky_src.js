"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sparky_src = void 0;
const glob = require("glob");
const path_1 = require("path");
const env_1 = require("../env");
const utils_1 = require("../utils/utils");
async function sparky_src(rule) {
    return new Promise((resolve, reject) => {
        glob(rule, { cwd: env_1.env.SCRIPT_PATH }, function (err, files) {
            if (err)
                return reject(err);
            files = files.map(file => {
                if (!path_1.isAbsolute(file)) {
                    return utils_1.ensureAbsolutePath(file, env_1.env.SCRIPT_PATH);
                }
                return file;
            });
            return resolve(files);
        });
    });
}
exports.sparky_src = sparky_src;
