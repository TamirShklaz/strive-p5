"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTsConfig = void 0;
const path = require("path");
const utils_1 = require("../utils/utils");
const MAX_ITERATIONS = 20;
function findTsConfig(props) {
    let current = props.fileName ? path.dirname(props.fileName) : props.directory;
    let iterations = 0;
    while (true) {
        let filePath = path.join(current, 'tsconfig.json');
        if (utils_1.fileExists(filePath)) {
            return filePath;
        }
        if (props.root === current)
            return;
        // going backwards
        current = path.join(current, '..');
        // Making sure we won't have any perpetual loops here
        iterations = iterations + 1;
        if (iterations >= MAX_ITERATIONS)
            return;
    }
}
exports.findTsConfig = findTsConfig;
