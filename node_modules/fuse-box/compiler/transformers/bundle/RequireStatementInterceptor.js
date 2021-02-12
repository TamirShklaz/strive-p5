"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireStatementInterceptor = void 0;
const bundleRuntimeCore_1 = require("../../../bundleRuntime/bundleRuntimeCore");
const AST_1 = require("../../interfaces/AST");
const ImportType_1 = require("../../interfaces/ImportType");
function RequireStatementInterceptor() {
    return {
        commonVisitors: props => {
            return {
                onEach: (schema) => {
                    const { getLocal, localIdentifier, node, parent, replace } = schema;
                    if (localIdentifier) {
                        if (node.name === 'require' && parent.type !== AST_1.ASTType.CallExpression) {
                            if (getLocal(node.name))
                                return;
                            return replace({ name: bundleRuntimeCore_1.BUNDLE_RUNTIME_NAMES.ARG_REQUIRE_FUNCTION, type: 'Identifier' });
                        }
                    }
                    // handle typeof
                    if (node.operator === 'typeof' && node.type === AST_1.ASTType.UnaryExpression) {
                        if (node.argument && node.argument.name) {
                            const name = node.argument.name;
                            // we must preserve local variable
                            if (name === 'require') {
                                if (getLocal(name))
                                    return;
                                return replace({ type: 'Literal', value: 'function' });
                            }
                        }
                    }
                    if (!props.onRequireCallExpression)
                        return;
                    if (node.type === 'CallExpression' && node.callee.name === 'require' && !node['emitted']) {
                        if (!getLocal('require'))
                            props.onRequireCallExpression(ImportType_1.ImportType.REQUIRE, node);
                    }
                    return;
                },
            };
        },
    };
}
exports.RequireStatementInterceptor = RequireStatementInterceptor;
