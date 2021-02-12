"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportReferences = exports.HandleExportReferences = exports.ExportReference = exports.ExportReferenceType = void 0;
var ExportReferenceType;
(function (ExportReferenceType) {
    ExportReferenceType[ExportReferenceType["FUNCTION"] = 0] = "FUNCTION";
    ExportReferenceType[ExportReferenceType["CLASS"] = 1] = "CLASS";
    ExportReferenceType[ExportReferenceType["LOCAL_REFERENCE"] = 2] = "LOCAL_REFERENCE";
})(ExportReferenceType = exports.ExportReferenceType || (exports.ExportReferenceType = {}));
function ExportReference(props) {
    const exposed = {
        local: props.local,
        name: props.name,
        targetObjectAst: props.targetObjectAst,
        type: props.type,
        remove: () => { },
    };
    return exposed;
}
exports.ExportReference = ExportReference;
/**
 * Register simple exports
 * export function foo(){}
 * export class Foo {}
 * @param props
 */
function SingeObjectExport(props, scope) {
    const { node } = props.schema;
    let type;
    const declaration = node.declaration;
    if (declaration.type === 'FunctionDeclaration')
        type = ExportReferenceType.FUNCTION;
    else if (declaration.type === 'ClassDeclaration')
        type = ExportReferenceType.CLASS;
    if (type === undefined)
        return;
    const name = declaration.id.name;
    scope.references.push(ExportReference({ local: name, name, schema: props.schema, scope, targetObjectAst: node.declaration, type: type }));
}
/**
 * Register simple exports
 * export default function foo(){}
 * export default class Foo {}
 * @param props
 */
function SingeDefaultExport(props, scope) {
    const { node } = props.schema;
    let type;
    const declaration = node.declaration;
    if (declaration.type === 'FunctionDeclaration')
        type = ExportReferenceType.FUNCTION;
    else if (declaration.type === 'ClassDeclaration')
        type = ExportReferenceType.CLASS;
    if (type === undefined)
        return;
    scope.references.push(ExportReference({
        local: declaration.id ? declaration.id.name : undefined,
        name: 'default',
        schema: props.schema,
        scope,
        targetObjectAst: node.declaration,
        type: type,
    }));
}
// export {foo, bar }
function HandleExportReferences(props, scope) {
    const { node } = props.schema;
    for (const specifier of node.specifiers) {
        if (specifier.local.name && specifier.exported.name) {
            scope.references.push(ExportReference({
                local: specifier.local.name,
                name: specifier.exported.name,
                schema: props.schema,
                scope,
                type: ExportReferenceType.LOCAL_REFERENCE,
            }));
        }
    }
}
exports.HandleExportReferences = HandleExportReferences;
function ExportReferences(productionContext, module) {
    const references = [];
    const scope = {
        references,
        register: (props) => {
            const { node } = props.schema;
            if (node.type === 'ExportNamedDeclaration') {
                if (!node.source) {
                    if (!node.specifiers.length && node.declaration) {
                        // export function foo{}
                        // export class Foo {}
                        SingeObjectExport(props, scope);
                    }
                    else {
                        // export {foo, bar}
                        HandleExportReferences(props, scope);
                    }
                }
            }
            else if (node.type === 'ExportDefaultDeclaration') {
                // export default function a
                // export default class A
                if (node.declaration) {
                    SingeDefaultExport(props, scope);
                }
            }
        },
    };
    return scope;
}
exports.ExportReferences = ExportReferences;
