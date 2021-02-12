"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundleFastConditionUnwrapper = void 0;
const computeBoolean_1 = require("../../static_compute/computeBoolean");
function BundleFastConditionUnwrapper() {
    return {
        commonVisitors: props => {
            const transformationContext = props.transformationContext;
            const compilerOptions = transformationContext.compilerOptions;
            const env = compilerOptions.processEnv;
            const isBrowser = compilerOptions.buildTarget === 'browser';
            const isServer = compilerOptions.buildTarget === 'server';
            return {
                onEach: (schema) => {
                    const { node } = schema;
                    if (node.type === 'IfStatement') {
                        let operator = node.test.operator;
                        let rightValue;
                        let target;
                        if (node.test) {
                            if (node.test.type === 'MemberExpression') {
                                target = node.test;
                            }
                            const left = node.test.left;
                            const right = node.test.right;
                            if (right && right.type === 'Literal') {
                                rightValue = right.value;
                            }
                            if (left) {
                                if (left.type == 'MemberExpression')
                                    target = left;
                            }
                        }
                        let replacement;
                        let result;
                        let shouldTranspile = false;
                        if (target) {
                            // process.env.*
                            if (target.object.type === 'MemberExpression' &&
                                target.object.object.name === 'process' &&
                                target.object.property.name === 'env') {
                                if (rightValue && operator) {
                                    shouldTranspile = true;
                                    result = computeBoolean_1.computeBoolean(env[target.property.name], operator, rightValue);
                                    if (result)
                                        replacement = node.consequent;
                                    else
                                        replacement = node.alternate;
                                }
                            }
                            if (target.object.name === 'FuseBox') {
                                if (target.property.name === 'isBrowser') {
                                    shouldTranspile = true;
                                    if (isBrowser)
                                        replacement = node.consequent;
                                    else
                                        replacement = node.alternate;
                                }
                                if (target.property.name === 'isServer') {
                                    shouldTranspile = true;
                                    if (isServer)
                                        replacement = node.consequent;
                                    else
                                        replacement = node.alternate;
                                }
                            }
                        }
                        if (shouldTranspile) {
                            if (replacement) {
                                if (replacement.body) {
                                    return schema.replace(replacement.body);
                                }
                                else if (replacement.type === 'ExpressionStatement')
                                    return schema.replace(replacement);
                            }
                            else {
                                return schema.remove();
                            }
                        }
                    }
                    return;
                },
            };
        },
    };
}
exports.BundleFastConditionUnwrapper = BundleFastConditionUnwrapper;
