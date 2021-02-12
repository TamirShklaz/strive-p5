"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phase_1_ImportLink = void 0;
const importHelpers_1 = require("../../compiler/helpers/importHelpers");
const AST_1 = require("../../compiler/interfaces/AST");
const NODES_OF_INTEREST = {
    [AST_1.ASTType.ExportAllDeclaration]: 1,
    [AST_1.ASTType.ExportNamedDeclaration]: 1,
    [AST_1.ASTType.ImportDeclaration]: 1,
    [AST_1.ASTType.ImportEqualsDeclaration]: 1,
};
function Phase_1_ImportLink() {
    return {
        productionWarmupPhase: ({ module, productionContext }) => {
            const tree = module.moduleTree;
            const refs = module.moduleSourceRefs || {};
            function isEligibleRequire(node) {
                return (node.type === AST_1.ASTType.CallExpression &&
                    node.callee.name === 'require' &&
                    node.arguments.length === 1 &&
                    node.arguments[0].type === 'Literal' &&
                    !!refs[node.arguments[0].value]);
            }
            function isEligibleImportOrExport(node) {
                return (!!NODES_OF_INTEREST[node.type] &&
                    ((!!node.source && !!refs[node.source.value]) ||
                        (!!node.moduleReference &&
                            node.moduleReference.expression &&
                            !!refs[node.moduleReference.expression.value])));
            }
            function isEligibleDynamicImport(node) {
                const dynamicImport = importHelpers_1.getDynamicImport(node);
                return !!dynamicImport && !!dynamicImport.source && !!refs[dynamicImport.source];
            }
            function shouldStyleImportRemove(node, parent) {
                if (node.type === AST_1.ASTType.ExpressionStatement) {
                    if (node.expression && node.expression.type === AST_1.ASTType.CallExpression) {
                        if (node.expression.callee && node.expression.callee.name === 'require') {
                            const source = node.expression.arguments[0];
                            return source && refs[source.value] && refs[source.value].isStylesheet;
                        }
                    }
                }
                if (node.arguments && node.arguments[0]) {
                    const target = refs[node.arguments[0].value];
                    if (target && target.isStylesheet && parent.type !== AST_1.ASTType.VariableDeclarator) {
                        return true;
                    }
                }
                if (node.type === AST_1.ASTType.ImportDeclaration && node.specifiers.length === 0) {
                    const target = refs[node.source.value];
                    return target && target.isStylesheet;
                }
            }
            return {
                onEach: (schema) => {
                    const { node, parent } = schema;
                    if (!parent || parent.type === AST_1.ASTType.Program) {
                        return;
                    }
                    if (isEligibleDynamicImport(node) || isEligibleRequire(node)) {
                        tree.importReferences.register({ module, productionContext, schema });
                    }
                    if (shouldStyleImportRemove(node, parent)) {
                        return schema.remove();
                    }
                },
                onProgramBody: (schema) => {
                    const { node, parent } = schema;
                    if (isEligibleImportOrExport(node) || isEligibleRequire(node)) {
                        tree.importReferences.register({ module, productionContext, schema });
                    }
                    // we don't need the references in the code
                    // those will become real css files
                    // however, tracking should happen above (for css code splitting)
                    if (shouldStyleImportRemove(node, parent)) {
                        return schema.remove();
                    }
                },
            };
        },
    };
}
exports.Phase_1_ImportLink = Phase_1_ImportLink;
