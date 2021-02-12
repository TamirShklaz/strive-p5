"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullishCoalescingTransformer = exports.createNullishStatement = void 0;
const astHelpers_1 = require("../../helpers/astHelpers");
const AST_1 = require("../../interfaces/AST");
function createNullishStatement(props) {
    const { genId } = props;
    const expr = {
        expression: {
            alternate: undefined,
            consequent: undefined,
            test: {
                left: {
                    left: undefined,
                    operator: '!==',
                    right: {
                        type: 'Literal',
                        value: null,
                    },
                    type: 'BinaryExpression',
                },
                operator: '&&',
                right: {
                    left: undefined,
                    operator: '!==',
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
        },
        type: 'ExpressionStatement',
    };
    return {
        expression: expr,
        setCondition: (node) => {
            // simple identifiers
            if (node.type === AST_1.ASTType.Identifier) {
                expr.expression.consequent = node;
                expr.expression.test.left.left = node;
                expr.expression.test.right.left = node;
            }
            else {
                const sysVariable = genId();
                const target = { name: sysVariable, type: AST_1.ASTType.Identifier };
                expr.expression.test.left.left = {
                    left: target,
                    operator: '=',
                    right: node,
                    type: 'AssignmentExpression',
                };
                expr.expression.test.right.left = target;
                expr.expression.consequent = target;
            }
        },
        setRight: (node) => {
            expr.expression.alternate = node;
        },
    };
}
exports.createNullishStatement = createNullishStatement;
function isNullishCoalescing(node) {
    return node.type === AST_1.ASTType.LogicalExpression && node.operator === '??';
}
function drillExpressions(node, nodes) {
    if (!isNullishCoalescing(node))
        return;
    nodes.unshift(node);
    if (node.left)
        drillExpressions(node.left, nodes);
}
function NullishCoalescingTransformer() {
    return {
        commonVisitors: props => {
            return {
                onEach: (schema) => {
                    const { node } = schema;
                    const nodes = [];
                    if (!isNullishCoalescing(node))
                        return;
                    drillExpressions(node, nodes);
                    const startingNode = nodes[0];
                    const declaration = astHelpers_1.createVariableDeclaration();
                    const ctx = {
                        schema,
                        genId: () => {
                            const nextVar = schema.context.getNextSystemVariable();
                            declaration.declarations.push(astHelpers_1.createUndefinedVariable(nextVar));
                            return nextVar;
                        },
                    };
                    let pointer = createNullishStatement(ctx);
                    pointer.setRight(startingNode.right);
                    pointer.setCondition(startingNode.left);
                    let index = 1;
                    while (index < nodes.length) {
                        const item = nodes[index];
                        const newPointer = createNullishStatement(ctx);
                        newPointer.setRight(item.right);
                        newPointer.setCondition(pointer.expression.expression);
                        pointer = newPointer;
                        index++;
                    }
                    let prepend = [];
                    if (declaration.declarations.length)
                        prepend = [declaration];
                    return schema.bodyPrepend(prepend).replace(pointer.expression.expression);
                },
            };
        },
    };
}
exports.NullishCoalescingTransformer = NullishCoalescingTransformer;
