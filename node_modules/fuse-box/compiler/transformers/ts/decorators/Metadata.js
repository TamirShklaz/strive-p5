"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParamTypes = exports.getMethodPropertiesMetadata = exports.getPropertyMetadata = exports.metatadataAST = void 0;
const AST_1 = require("../../../interfaces/AST");
const Annotations_1 = require("./Annotations");
const decorator_helpers_1 = require("./decorator_helpers");
// constructors have:
// ONLY: design:paramtypes
// methods:
// design:type  Function
// design:paramtypes and Array OR params [  ]
// design:returntype
function metatadataAST(type, arg) {
    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: {
                type: 'Identifier',
                name: '__fuse_decorate',
            },
            computed: false,
            property: {
                type: 'Identifier',
                name: 'm',
            },
        },
        arguments: [
            {
                type: 'Literal',
                value: type,
            },
            arg,
        ],
    };
}
exports.metatadataAST = metatadataAST;
function getPropertyMetadata(annotation) {
    return {
        type: 'CallExpression',
        callee: decorator_helpers_1.FUSEBOX_DECORATOR_META,
        arguments: [
            {
                type: 'Literal',
                value: 'design:type',
            },
            Annotations_1.convertTypeAnnotation(annotation),
        ],
    };
}
exports.getPropertyMetadata = getPropertyMetadata;
function getMethodPropertiesMetadata(node) {
    const expressions = [];
    for (const item of node.value.params) {
        expressions.push(Annotations_1.convertTypeAnnotation(item.typeAnnotation));
    }
    return expressions;
}
exports.getMethodPropertiesMetadata = getMethodPropertiesMetadata;
function getParamTypes(node) {
    const arrayExpression = {
        type: 'ArrayExpression',
        elements: [],
    };
    for (const p of node.params) {
        let target = p;
        if (p.type === AST_1.ASTType.ParameterProperty) {
            target = target.parameter;
        }
        arrayExpression.elements.push(Annotations_1.convertTypeAnnotation(target.typeAnnotation));
    }
    return metatadataAST('design:paramtypes', arrayExpression);
}
exports.getParamTypes = getParamTypes;
