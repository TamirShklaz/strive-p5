"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamespaceTransformer = void 0;
const helpers_1 = require("../../helpers/helpers");
const AST_1 = require("../../interfaces/AST");
function NamespaceTransformer() {
    return {
        target: { type: 'ts' },
        commonVisitors: props => {
            return {
                onEach: (schema) => {
                    const { node } = schema;
                    if (node.type === AST_1.ASTType.ModuleDeclaration) {
                        return schema.ignore();
                    }
                },
                onProgramBody: (schema) => {
                    let { context, node } = schema;
                    if (node.declare) {
                        return schema.remove().ignore();
                    }
                    let withExport = false;
                    if (node.type === 'ExportNamedDeclaration') {
                        if (node.declaration && node.declaration.type === AST_1.ASTType.ModuleDeclaration) {
                            node = node.declaration;
                            withExport = true;
                        }
                    }
                    if (node.type === AST_1.ASTType.ModuleDeclaration) {
                        const nm = node.body;
                        const mameSpaceName = node.id.name;
                        // launch custom transpilation for that namespace
                        // we skip children in onEachNode
                        context.fork({ contextOverrides: { moduleExportsName: mameSpaceName }, root: nm });
                        //node.body.context =
                        const Declaration = {
                            declarations: [
                                {
                                    id: {
                                        name: node.id.name,
                                        type: 'Identifier',
                                    },
                                    init: null,
                                    type: 'VariableDeclarator',
                                },
                            ],
                            kind: 'var',
                            type: 'VariableDeclaration',
                        };
                        const FunctionBody = {
                            expression: {
                                arguments: [
                                    {
                                        left: {
                                            name: mameSpaceName,
                                            type: 'Identifier',
                                        },
                                        operator: '||',
                                        right: {
                                            left: {
                                                name: mameSpaceName,
                                                type: 'Identifier',
                                            },
                                            operator: '=',
                                            right: {
                                                properties: [],
                                                type: 'ObjectExpression',
                                            },
                                            type: 'AssignmentExpression',
                                        },
                                        type: 'LogicalExpression',
                                    },
                                ],
                                callee: {
                                    async: false,
                                    body: {
                                        body: node.body.body,
                                        type: 'BlockStatement',
                                    },
                                    generator: false,
                                    id: null,
                                    params: [
                                        {
                                            name: mameSpaceName,
                                            type: 'Identifier',
                                        },
                                    ],
                                    type: 'FunctionExpression',
                                },
                                type: 'CallExpression',
                            },
                            type: 'ExpressionStatement',
                        };
                        const nodes = [Declaration, FunctionBody];
                        if (withExport) {
                            const exportDeclaration = helpers_1.createExports({
                                exportsKey: context.moduleExportsName,
                                exportsVariableName: mameSpaceName,
                                property: {
                                    name: mameSpaceName,
                                    type: 'Identifier',
                                },
                                useModule: false,
                            });
                            nodes.push(exportDeclaration);
                        }
                        // replace it with a new node
                        return schema.replace(nodes);
                    }
                },
            };
        },
    };
}
exports.NamespaceTransformer = NamespaceTransformer;
