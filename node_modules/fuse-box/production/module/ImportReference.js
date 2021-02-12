"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportReferences = exports.ImportSpecifierType = exports.ImportType = void 0;
const importHelpers_1 = require("../../compiler/helpers/importHelpers");
const AST_1 = require("../../compiler/interfaces/AST");
var ImportType;
(function (ImportType) {
    ImportType[ImportType["SIDE_EFFECT_IMPORT"] = 0] = "SIDE_EFFECT_IMPORT";
    ImportType[ImportType["IMPORT_SPECIFIERS"] = 1] = "IMPORT_SPECIFIERS";
    ImportType[ImportType["DYNAMIC_IMPORT"] = 2] = "DYNAMIC_IMPORT";
    ImportType[ImportType["EXPORT_FROM"] = 3] = "EXPORT_FROM";
})(ImportType = exports.ImportType || (exports.ImportType = {}));
var ImportSpecifierType;
(function (ImportSpecifierType) {
    ImportSpecifierType[ImportSpecifierType["OBJECT_SPECIFIER"] = 0] = "OBJECT_SPECIFIER";
    ImportSpecifierType[ImportSpecifierType["NAMESPACE_SPECIFIER"] = 1] = "NAMESPACE_SPECIFIER";
})(ImportSpecifierType = exports.ImportSpecifierType || (exports.ImportSpecifierType = {}));
function Import(props) {
    const target = props.module.moduleSourceRefs[props.source];
    const importReference = {
        module: props.module,
        remove: function () {
            importReference.removed = true;
            // @todo finish this
            if (props.schema.property && props.schema.parent) {
                if (props.schema.parent[props.schema.property] instanceof Array) {
                    const index = props.schema.parent[props.schema.property].indexOf(props.schema.node);
                    if (index > -1) {
                        props.schema.parent[props.schema.property].splice(index, 1);
                    }
                }
            }
        },
        removed: false,
        schema: props.schema,
        source: props.source,
        specifiers: props.specifiers,
        target,
        type: props.type,
    };
    target.moduleTree.dependants.push(importReference);
    return importReference;
}
function ImportSpecifier(schema, specifier) {
    let local;
    let name;
    let type = ImportSpecifierType.OBJECT_SPECIFIER;
    if (specifier.type === AST_1.ASTType.ImportNamespaceSpecifier) {
        // import * as React from 'react'
        local = specifier.local.name;
        type = ImportSpecifierType.NAMESPACE_SPECIFIER;
    }
    else if (specifier.type === AST_1.ASTType.ImportDefaultSpecifier) {
        // import styled from '@emotion/styled'
        local = specifier.local.name;
        name = 'default';
    }
    else if (specifier.type === AST_1.ASTType.ImportSpecifier) {
        // import { something } from 'some-module'
        local = specifier.local.name;
        name = specifier.imported.name;
    }
    else if (specifier.type === AST_1.ASTType.ExportSpecifier) {
        // export { something } from 'some-module'
        local = specifier.local.name;
        name = specifier.exported.name;
    }
    const importSpecifier = {
        local,
        name,
        remove: function () {
            importSpecifier.removed = true;
            // @todo finish this
            if (schema.node.specifiers instanceof Array) {
                const index = schema.node.specifiers.indexOf(specifier);
                if (index > -1) {
                    schema.node.specifiers.splice(index, 1);
                }
            }
        },
        removed: false,
        schema,
        type,
    };
    return importSpecifier;
}
// import './foo';
function sideEffectImport(props, scope) {
    const { node } = props.schema;
    scope.references.push(Import({
        module: props.module,
        schema: props.schema,
        source: node.source.value,
        type: ImportType.SIDE_EFFECT_IMPORT,
    }));
}
// import xx from 'xx';
// import { yy, bb as cc } from 'yy';
// import zz as aa from 'zz'
function regularImport(props, scope) {
    let specifiers = [];
    const { node } = props.schema;
    for (const specifier of node.specifiers) {
        specifiers.push(ImportSpecifier(props.schema, specifier));
    }
    scope.references.push(Import({
        module: props.module,
        schema: props.schema,
        source: node.source.value,
        specifiers,
        type: ImportType.IMPORT_SPECIFIERS,
    }));
}
// const bar = require('foo');
function regularRequire(props, scope) {
    const { node } = props.schema;
    scope.references.push(Import({
        module: props.module,
        schema: props.schema,
        source: node.arguments[0].value,
        type: ImportType.SIDE_EFFECT_IMPORT,
    }));
}
// import _ = require('foo');
function sideEffectImportRequire(props, scope) {
    const { node } = props.schema;
    scope.references.push(Import({
        module: props.module,
        schema: props.schema,
        source: node.moduleReference.expression.value,
        type: ImportType.SIDE_EFFECT_IMPORT,
    }));
}
// import('./module');
function dynamicImport(props, scope) {
    const { node } = props.schema;
    const { source } = importHelpers_1.getDynamicImport(node);
    scope.references.push(Import({
        module: props.module,
        schema: props.schema,
        source,
        type: ImportType.DYNAMIC_IMPORT,
    }));
}
// export * from 'module';
function exportAllImport(props, scope) {
    const { node } = props.schema;
    scope.references.push(Import({
        module: props.module,
        schema: props.schema,
        source: node.source.value,
        type: ImportType.EXPORT_FROM,
    }));
}
// export { foo, bar as baz } from 'module';
function exportSpecifierImport(props, scope) {
    let specifiers = [];
    const { node } = props.schema;
    for (const specifier of node.specifiers) {
        specifiers.push(ImportSpecifier(props.schema, specifier));
    }
    scope.references.push(Import({
        module: props.module,
        schema: props.schema,
        source: node.source.value,
        specifiers,
        type: ImportType.EXPORT_FROM,
    }));
}
function ImportReferences(productionContext, module) {
    const scope = {
        references: [],
        register: (props) => {
            const { node } = props.schema;
            if (node.type === AST_1.ASTType.ImportDeclaration) {
                if (node.specifiers.length === 0) {
                    // import './foo';
                    sideEffectImport(props, scope);
                }
                else {
                    // import xx from 'xx';
                    // import { yy, bb as cc } from 'yy';
                    // import zz as aa from 'zz'
                    regularImport(props, scope);
                }
            }
            else if (node.type === AST_1.ASTType.CallExpression && node.callee && node.callee.name === 'require') {
                // const bar = require('foo');
                regularRequire(props, scope);
            }
            else if (node.type === AST_1.ASTType.ImportEqualsDeclaration) {
                // import _ = require('foo');
                sideEffectImportRequire(props, scope);
            }
            else if (
            // meriyah
            node.type === AST_1.ASTType.ImportExpression ||
                // ts-parser
                (node.type === AST_1.ASTType.CallExpression && node.callee && node.callee.type === 'Import')) {
                // import('./module');
                dynamicImport(props, scope);
            }
            else if (node.type === AST_1.ASTType.ExportAllDeclaration) {
                // export * from 'module';
                exportAllImport(props, scope);
            }
            else if (node.type === AST_1.ASTType.ExportNamedDeclaration) {
                // export { foo, bar as baz } from 'module';
                exportSpecifierImport(props, scope);
            }
        },
    };
    return scope;
}
exports.ImportReferences = ImportReferences;
