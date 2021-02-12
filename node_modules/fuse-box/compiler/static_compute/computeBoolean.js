"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBoolean = void 0;
function computeBoolean(left, operator, right) {
    switch (operator) {
        case '!=':
            return left != right;
        case '!==':
            return left !== right;
        case '===':
            return left === right;
        case '==':
            return left === right;
        case '>':
            return left > right;
        case '>=':
            return left >= right;
        case '<':
            return left < right;
        case '<=':
            return left <= right;
    }
}
exports.computeBoolean = computeBoolean;
