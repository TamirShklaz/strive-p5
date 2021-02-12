"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOptionalChaningExpression = exports.convertToCallExpression = exports.ensureExpressionConsistency = void 0;
const AST_1 = require("../../interfaces/AST");
function ensureExpressionConsistency(expression, node) {
    if (node.type == AST_1.ASTType.Literal) {
        expression.computed = true;
    }
}
exports.ensureExpressionConsistency = ensureExpressionConsistency;
function convertToCallExpression(alternate, id, args) {
    return {
        arguments: args,
        callee: { object: { name: id, type: 'Identifier' }, property: alternate, type: 'MemberExpression' },
        type: 'CallExpression',
    };
}
exports.convertToCallExpression = convertToCallExpression;
function createOptionalChaningExpression(userId) {
    // prevMember.test.left.left.right
    // prevMement.alternate.property
    const AST_NODE = {
        alternate: null,
        consequent: {
            argument: {
                type: 'Literal',
                value: 0,
            },
            operator: 'void',
            prefix: true,
            type: 'UnaryExpression',
        },
        test: {
            left: {
                left: {
                    left: {
                        name: userId,
                        type: 'Identifier',
                    },
                    operator: '=',
                    right: null,
                    type: 'AssignmentExpression',
                },
                operator: '===',
                right: {
                    type: 'Literal',
                    value: null,
                },
                type: 'BinaryExpression',
            },
            operator: '||',
            right: {
                left: {
                    name: userId,
                    type: 'Identifier',
                },
                operator: '===',
                right: {
                    argument: {
                        type: 'Literal',
                        value: 0,
                    },
                    operator: 'void',
                    prefix: true,
                    type: 'UnaryExpression',
                },
                type: 'BinaryExpression',
            },
            type: 'LogicalExpression',
        },
        type: 'ConditionalExpression',
    };
    return {
        id: userId,
        statement: AST_NODE,
        setLeft: (item) => {
            AST_NODE.test.left.left.right = item;
        },
        setRight: (item) => {
            AST_NODE.alternate = item;
        },
    };
}
exports.createOptionalChaningExpression = createOptionalChaningExpression;
