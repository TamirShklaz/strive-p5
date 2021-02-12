"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommonTransform = void 0;
const transformModule_1 = require("./core/transformModule");
const generator_1 = require("./generator/generator");
const parser_1 = require("./parser");
function cleanupForTest(node) {
    delete node.loc;
    delete node.raw;
    delete node.range;
}
function initCommonTransform(props) {
    const requireStatementCollection = [];
    function onRequireCallExpression(importType, statement) {
        // making sure we have haven't emitted the same property twice
        if (!statement['emitted']) {
            Object.defineProperty(statement, 'emitted', { enumerable: false, value: true });
            cleanupForTest(statement.arguments[0]);
            cleanupForTest(statement);
            cleanupForTest(statement.callee);
            requireStatementCollection.push({ importType, statement });
        }
    }
    const ast = parser_1.parseTypeScript(props.code, { jsx: props.jsx });
    const userProps = props.props || {};
    userProps.compilerOptions = props.compilerOptions || {};
    const visitorProps = { onRequireCallExpression, transformationContext: userProps };
    const tranformers = [];
    for (const t of props.transformers) {
        if (t.commonVisitors) {
            tranformers.push(t.commonVisitors(visitorProps));
        }
    }
    transformModule_1.transformModule({ root: ast, transformers: tranformers });
    const res = generator_1.generate(ast, {});
    return { code: res, requireStatementCollection };
}
exports.initCommonTransform = initCommonTransform;
