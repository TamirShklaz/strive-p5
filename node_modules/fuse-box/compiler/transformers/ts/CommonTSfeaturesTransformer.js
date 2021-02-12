"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonTSfeaturesTransformer = void 0;
const AST_1 = require("../../interfaces/AST");
const FUNC_EXPRESSIONS = { FunctionDeclaration: 1, FunctionExpression: 1 };
// to test: function maybeUnwrapEmpty<T>(value: T[]): T[];
// to test: (oi as any).foo
function CommonTSfeaturesTransformer() {
    return {
        target: { type: 'ts' },
        commonVisitors: props => {
            return {
                onEach: (schema) => {
                    const { node, parent, property } = schema;
                    // handle "this" typings
                    // e.g function hey(this: number, a) {}
                    if (parent &&
                        property === 'params' &&
                        FUNC_EXPRESSIONS[parent.type] &&
                        node.type === 'Identifier' &&
                        node.name === 'this') {
                        return schema.remove();
                    }
                    if (node.declare) {
                        return schema.remove();
                    }
                    if (node.type === AST_1.ASTType.TypeAssertion || node.type === AST_1.ASTType.NonNullExpression) {
                        return schema.replace([node.expression]);
                    }
                    // EmptyBodyFunctionExpression is a specific buntis key
                    if (node.type === 'MethodDefinition' &&
                        node.value &&
                        (node.value.type === 'EmptyBodyFunctionExpression' || !node.value.body)) {
                        return schema.remove();
                    }
                    switch (node.type) {
                        case 'ClassProperty':
                        case AST_1.ASTType.AbstractClassProperty:
                        case AST_1.ASTType.AbstractMethodDefinition:
                        case AST_1.ASTType.DeclareFunction:
                        case AST_1.ASTType.IndexSignature:
                        case AST_1.ASTType.InterfaceDeclaration:
                        case AST_1.ASTType.TypeAliasDeclaration:
                            return schema.remove();
                        case 'ExportNamedDeclaration':
                            const decl = node.declaration;
                            if (decl) {
                                if (decl.declare || decl.type === AST_1.ASTType.InterfaceDeclaration) {
                                    return schema.remove();
                                }
                            }
                            break;
                        case AST_1.ASTType.AsExpression:
                            return schema.replace([node.expression]);
                        case AST_1.ASTType.ParameterProperty:
                            return schema.replace([node.parameter]);
                    }
                },
                onProgramBody: (schema) => {
                    if (schema.node.declare) {
                        return schema.remove();
                    }
                },
            };
        },
    };
}
exports.CommonTSfeaturesTransformer = CommonTSfeaturesTransformer;
