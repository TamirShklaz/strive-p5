"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sparkyChain = void 0;
const path = require("path");
const env_1 = require("../env");
const utils_1 = require("../utils/utils");
const bumpVersion_1 = require("./bumpVersion");
const sparky_src_1 = require("./sparky_src");
const tsc_1 = require("./tsc");
function sparkyChain(log) {
    const activities = [];
    const readFiles = {};
    let newLocation, newLocationBase;
    const runActivities = async () => {
        let latest;
        for (const fn of activities) {
            latest = await fn(latest);
        }
        if (newLocation && newLocationBase) {
            const root = utils_1.ensureAbsolutePath(newLocation, env_1.env.SCRIPT_PATH);
            for (const i in latest) {
                const file = latest[i];
                readFiles[file] = readFiles[file] || utils_1.readFileAsBuffer(file);
                // normalize path so split works with windows path
                const s = path.normalize(utils_1.ensureFuseBoxPath(file)).split(newLocationBase);
                if (!s[1]) {
                    log.error(`Can't find base of ${newLocationBase} of ${file}`);
                    return;
                }
                else {
                    const newFileLocation = path.join(root, s[1]);
                    utils_1.ensureDir(path.dirname(newFileLocation));
                    await utils_1.writeFile(newFileLocation, readFiles[file]);
                }
            }
        }
        return latest;
    };
    const chain = {
        __scope: () => {
            return { readFiles };
        },
        // grabs the files by glob
        src: (glob) => {
            activities.push(() => sparky_src_1.sparky_src(glob));
            return chain;
        },
        bumpVersion: (mask, opts) => {
            const re = typeof mask === 'string' ? utils_1.path2RegexPattern(mask) : mask;
            activities.push(async (files) => {
                const target = files.find(file => re.test(file));
                if (target) {
                    readFiles[target] = readFiles[target] || utils_1.readFile(target);
                    readFiles[target] = bumpVersion_1.bumpVersion(readFiles[target], opts);
                }
                return files;
            });
            return chain;
        },
        clean: () => {
            activities.push(async (files) => {
                files.forEach(file => {
                    utils_1.removeFile(file);
                });
                return files;
            });
            return chain;
        },
        // can be used to replace the contents of a file
        contentsOf: (mask, fn) => {
            const re = typeof mask === 'string' ? utils_1.path2RegexPattern(mask) : mask;
            activities.push(async (files) => {
                const target = files.find(file => re.test(file));
                if (target) {
                    readFiles[target] = readFiles[target] || utils_1.readFile(target);
                    readFiles[target] = fn(readFiles[target]);
                }
                return files;
            });
            return chain;
        },
        dest: (target, base) => {
            newLocation = target;
            newLocationBase = base;
            return chain;
        },
        // runs all the activities (used mainly for testing)
        exec: async () => runActivities(),
        // filters out unwanted files
        // accepts function and a regexp
        filter: input => {
            activities.push((files) => {
                const filtered = files.filter(file => {
                    if (typeof input === 'function') {
                        return !!input(file);
                    }
                    else if (input && typeof input.test === 'function') {
                        return input.test(file);
                    }
                    return true;
                });
                return filtered;
            });
            return chain;
        },
        tsc: (options) => {
            activities.push(async (files) => {
                await tsc_1.tsc(Object.assign({ files: files }, options));
            });
            return chain;
        },
        write: () => {
            activities.push(async (files) => {
                const _ = [];
                for (const file in readFiles) {
                    _.push(utils_1.writeFile(file, readFiles[file]));
                }
                return Promise.all(_).then(() => {
                    return files;
                });
            });
            return chain;
        },
    };
    return chain;
}
exports.sparkyChain = sparkyChain;
