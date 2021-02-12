"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computedStatementToPath = exports.getDynamicImport = exports.expressionValueTypes = void 0;
const AST_1 = require("../interfaces/AST");
var expressionValueTypes;
(function (expressionValueTypes) {
    expressionValueTypes[expressionValueTypes["SINGLE_ASTERISK"] = 0] = "SINGLE_ASTERISK";
    expressionValueTypes[expressionValueTypes["DOUBLE_ASTERISK"] = 1] = "DOUBLE_ASTERISK";
})(expressionValueTypes = exports.expressionValueTypes || (exports.expressionValueTypes = {}));
/**
 * get the source of an dynamic import
 * @param node
 */
function getDynamicImport(node) {
    // meriyah case
    if (node.type === AST_1.ASTType.ImportExpression) {
        if (node.source) {
            return { source: node.source.value };
        }
        return { error: 'At this moment computed statements are not supported' };
    }
    // eslint parser case
    if (node.type === AST_1.ASTType.CallExpression) {
        if (node.callee && node.callee.type === 'Import') {
            if (node.arguments.length === 1 && !!node.arguments[0].value) {
                return { source: node.arguments[0].value };
            }
            return { error: 'At this moment computed statements are not supported' };
        }
    }
}
exports.getDynamicImport = getDynamicImport;
/**
 * Helper function to return the correct element to add to the path
 * @param expression
 * @param last
 */
function getExpressionValue(expression, last = false) {
    const asterisk = last ? expressionValueTypes.SINGLE_ASTERISK : expressionValueTypes.DOUBLE_ASTERISK;
    return expression.type === 'Literal' ? expression.value : asterisk;
}
function isSupportedNodeType(type) {
    return type === AST_1.ASTType.Identifier || type === AST_1.ASTType.Literal;
}
/**
 * Put in an expression and get the parsed paths
 * or an error in return
 * @param expression
 * @param strict
 * @param last
 */
function getPathFromExpression(expression, strict = false, last = true) {
    let paths = [];
    let errored = false;
    // if we have a nested BinaryExpression we got to traverse through it
    while (expression.left.left && !errored) {
        if (!isSupportedNodeType(expression.right.type)) {
            errored = true;
        }
        // the first hit will be the last element
        paths.unshift(getExpressionValue(expression.right, last));
        last = false;
        expression = expression.left;
    }
    // we errored or last expressions are unsupported
    if (errored || !isSupportedNodeType(expression.left.type) || !isSupportedNodeType(expression.right.type)) {
        return { error: `Unsupported type provided to computed statement import` };
    }
    // if we have strict enabled, the first element needs to be a string!
    if (strict && expression.left.type !== AST_1.ASTType.Literal) {
        return { error: `You're computed import needs to start with a string! i.e. './'` };
    }
    // if we didn't resolve the last element already, it means this is the last element
    paths.unshift(getExpressionValue(expression.left), getExpressionValue(expression.right, last));
    return { paths };
}
/**
 * Function that returns a valid paths object or error
 * @param template
 */
function getPathFromTemplate(template) {
    const { expressions, quasis } = template;
    const quasisLength = quasis.length;
    let paths = [];
    let i = 0;
    let error;
    let errored = false;
    /**
     * we loop over the quasis of the template string
     * and each item is a TemplateElement followed by
     * 1. BinaryExpression
     * 2. All the others (Identifier mostly)
     */
    while (i < quasisLength && !errored) {
        let skipExpression = false;
        if (quasis[i].value.cooked) {
            // add the string to the stack
            paths.push(quasis[i].value.cooked);
        }
        else {
            // we skip the following expression if we didn't had an value
            skipExpression = true;
        }
        // if we aren't at the end, tail is false, so we resolve the
        // expression that's followed by this TemplateElement
        if (!quasis[i].tail && expressions.length > 0) {
            const expression = expressions.shift();
            // if we don't skip, we got to resolve the expression correctly
            if (!skipExpression) {
                // we need to figure out of this expression is the last element
                // so no TemplateElements should follow
                let last = true;
                for (let offset = 1; offset < quasisLength - i; offset++) {
                    if (quasis[i + offset] && quasis[i + offset].value.cooked) {
                        last = false;
                        break;
                    }
                }
                if (expression.type === AST_1.ASTType.BinaryExpression) {
                    const result = getPathFromExpression(expression, false, last);
                    if (result.error) {
                        error = result.error;
                        errored = true;
                    }
                    paths = paths.concat(result.paths);
                }
                else if (isSupportedNodeType(expression.type)) {
                    paths.push(getExpressionValue(expression, last));
                }
                else {
                    error = `Unsupported type provided to computed statement import`;
                }
            }
        }
        i++;
    }
    return { error, paths };
}
/**
 * This function tries to generate a glob pattern based on the input
 * Valid inputs are a BinaryExpression or TemplateLiteral
 *
 * import('./atoms/' + b);
 * import('./atoms/' + b + '/' + c);
 * import(`./atoms/${a}`);
 *
 * @param node
 */
function computedStatementToPath(node) {
    if (node.type === AST_1.ASTType.BinaryExpression) {
        return getPathFromExpression(node, true);
    }
    else if (node.type === AST_1.ASTType.TemplateLiteral) {
        return getPathFromTemplate(node);
    }
    return { error: `Unsupported root node provided` };
}
exports.computedStatementToPath = computedStatementToPath;
