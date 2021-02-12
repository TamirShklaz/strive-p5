"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUp = exports.FIND_UP_GLOBAL_CONFIG = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
exports.FIND_UP_GLOBAL_CONFIG = {
    maxStepsBack: 10,
};
function findUp(start, target, boundaryArg) {
    let currentDir = start;
    try {
        const stat = fs_1.statSync(start);
        currentDir = stat.isDirectory() ? start : path_1.dirname(start);
    }
    catch (err) { }
    let lastTry = false;
    let backSteps = 0;
    while (backSteps++ <= exports.FIND_UP_GLOBAL_CONFIG.maxStepsBack) {
        if (boundaryArg && boundaryArg.boundary.includes(currentDir)) {
            if (boundaryArg.inclusive && lastTry === false) {
                lastTry = true;
            }
            else {
                return null;
            }
        }
        const targetTestPath = path_1.join(currentDir, target);
        if (fs_1.existsSync(targetTestPath)) {
            return targetTestPath;
        }
        currentDir = path_1.join(currentDir, '../');
    }
    console.error(`Too many back steps, starting from "${start}"`);
    return null;
}
exports.findUp = findUp;
