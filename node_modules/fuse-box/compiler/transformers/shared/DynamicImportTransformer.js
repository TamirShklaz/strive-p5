"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicImportTransformer = void 0;
const importHelpers_1 = require("../../helpers/importHelpers");
const ImportType_1 = require("../../interfaces/ImportType");
function DynamicImportTransformer() {
    return {
        commonVisitors: props => {
            return {
                onEach: (schema) => {
                    const { node } = schema;
                    const dynamicImport = importHelpers_1.getDynamicImport(node);
                    if (dynamicImport) {
                        if (dynamicImport.error)
                            return;
                        const requireCallExpression = {
                            arguments: [
                                {
                                    type: 'Literal',
                                    value: dynamicImport.source,
                                },
                            ],
                            callee: {
                                name: 'require',
                                type: 'Identifier',
                            },
                            type: 'CallExpression',
                        };
                        if (props.onRequireCallExpression) {
                            props.onRequireCallExpression(ImportType_1.ImportType.DYNAMIC, requireCallExpression);
                        }
                        const callExpression = {
                            arguments: [
                                {
                                    async: false,
                                    body: requireCallExpression,
                                    expression: true,
                                    params: [],
                                    type: 'ArrowFunctionExpression',
                                },
                            ],
                            callee: {
                                computed: false,
                                object: {
                                    arguments: [],
                                    callee: {
                                        computed: false,
                                        object: {
                                            name: 'Promise',
                                            type: 'Identifier',
                                        },
                                        property: {
                                            name: 'resolve',
                                            type: 'Identifier',
                                        },
                                        type: 'MemberExpression',
                                    },
                                    type: 'CallExpression',
                                },
                                property: {
                                    name: 'then',
                                    type: 'Identifier',
                                },
                                type: 'MemberExpression',
                            },
                            type: 'CallExpression',
                        };
                        return schema.replace(callExpression);
                    }
                },
            };
        },
    };
}
exports.DynamicImportTransformer = DynamicImportTransformer;
