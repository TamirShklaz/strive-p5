"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTypescriptConfig = void 0;
const comment_json_1 = require("comment-json");
const utils_1 = require("../utils/utils");
function parseTypescriptConfig(target) {
    let contents, json;
    try {
        contents = utils_1.readFile(target);
        json = comment_json_1.parse(contents);
    }
    catch (e) {
        return {
            error: {
                message: e.message,
            },
        };
    }
    return { config: json };
}
exports.parseTypescriptConfig = parseTypescriptConfig;
