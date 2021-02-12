"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMethodPropertyDecorator = exports.createMethodArgumentParam = exports.collectDecorators = exports.createMethodDecorator = exports.createMethodMetadata = exports.createClassDecorators = exports.createDecoratorRequireHelperStatement = exports.createPropertyDecorator = exports.FUSEBOX_DECORATOR_META = exports.__DECORATE__ = void 0;
const Annotations_1 = require("./Annotations");
const Metadata_1 = require("./Metadata");
exports.__DECORATE__ = {
    type: 'MemberExpression',
    object: {
        type: 'Identifier',
        name: '__fuse_decorate',
    },
    computed: false,
    property: {
        type: 'Identifier',
        name: 'd',
    },
};
exports.FUSEBOX_DECORATOR_META = {
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
};
function createPropertyDecorator(props) {
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: 'Identifier',
                    name: props.helperModule,
                },
                computed: false,
                property: {
                    type: 'Identifier',
                    name: 'd',
                },
            },
            arguments: [
                {
                    type: 'ArrayExpression',
                    elements: props.decorators,
                    optional: false,
                },
                {
                    type: 'MemberExpression',
                    object: {
                        type: 'Identifier',
                        name: props.className,
                    },
                    computed: false,
                    property: {
                        type: 'Identifier',
                        name: 'prototype',
                    },
                },
                {
                    type: 'Literal',
                    value: props.propertyName,
                },
                Annotations_1.voidZero,
            ],
        },
    };
}
exports.createPropertyDecorator = createPropertyDecorator;
function createDecoratorRequireHelperStatement(moduleName, params) {
    const properties = [];
    for (const name of params) {
        properties.push({
            type: 'Property',
            key: {
                type: 'Identifier',
                name: name,
            },
            value: {
                type: 'Identifier',
                name: name,
            },
            kind: 'init',
            computed: false,
            method: false,
            shorthand: true,
        });
    }
    return {
        type: 'VariableDeclaration',
        kind: 'const',
        declare: false,
        declarations: [
            {
                type: 'VariableDeclarator',
                init: {
                    type: 'CallExpression',
                    callee: {
                        type: 'Identifier',
                        name: 'require',
                    },
                    arguments: [
                        {
                            type: 'Literal',
                            value: './hey',
                        },
                    ],
                },
                id: {
                    type: 'ObjectPattern',
                    properties: properties,
                },
            },
        ],
    };
}
exports.createDecoratorRequireHelperStatement = createDecoratorRequireHelperStatement;
function createClassDecorators(props) {
    const arrayExpression = {
        type: 'ArrayExpression',
        elements: props.decorators,
    };
    const expressionStatement = {
        type: 'ExpressionStatement',
        expression: {
            type: 'AssignmentExpression',
            left: {
                type: 'Identifier',
                name: props.className,
            },
            operator: '=',
            right: {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: {
                        type: 'Identifier',
                        name: props.helperModule,
                    },
                    computed: false,
                    property: {
                        type: 'Identifier',
                        name: 'd',
                    },
                },
                arguments: [
                    arrayExpression,
                    {
                        type: 'Identifier',
                        name: props.className,
                    },
                ],
            },
        },
    };
    return { expressionStatement, arrayExpression };
}
exports.createClassDecorators = createClassDecorators;
function createMethodMetadata(props) {
    const node = props.node;
    const designType = Metadata_1.metatadataAST('design:type', {
        type: 'Identifier',
        name: 'Function',
    });
    let returnTypeAnnotation;
    if (!node.value.returnType) {
        returnTypeAnnotation = Annotations_1.voidZero;
    }
    else {
        returnTypeAnnotation = Annotations_1.convertTypeAnnotation(node.value.returnType);
    }
    const returnType = Metadata_1.metatadataAST('design:returntype', returnTypeAnnotation);
    const paramTypes = Metadata_1.getParamTypes(node.value);
    return { designType, returnType, paramTypes };
}
exports.createMethodMetadata = createMethodMetadata;
function createMethodDecorator(props) {
    let id;
    if (props.isStatic) {
        id = {
            type: 'Identifier',
            name: props.className,
        };
    }
    else {
        id = {
            type: 'MemberExpression',
            object: {
                type: 'Identifier',
                name: props.className,
            },
            computed: false,
            property: {
                type: 'Identifier',
                name: 'prototype',
            },
        };
    }
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: 'Identifier',
                    name: props.helperModule,
                },
                computed: false,
                property: {
                    type: 'Identifier',
                    name: 'd',
                },
            },
            arguments: [
                {
                    type: 'ArrayExpression',
                    elements: props.decorators,
                    optional: false,
                },
                id,
                {
                    type: 'Literal',
                    value: props.methodName,
                },
                {
                    type: 'Identifier',
                    name: 'null',
                },
            ],
        },
    };
}
exports.createMethodDecorator = createMethodDecorator;
function collectDecorators(opts) {
    const params = opts.params;
    if (params && params.length) {
        let index = 0;
        while (index < params.length) {
            let p = params[index];
            if (p.decorators && p.decorators.length) {
                for (const dec of p.decorators) {
                    opts.expressions.push(createMethodArgumentParam({
                        helperModule: opts.helperModule,
                        decorator: dec.expression,
                        index: index,
                    }));
                }
            }
            index++;
        }
    }
    return opts.expressions;
}
exports.collectDecorators = collectDecorators;
function createMethodArgumentParam(props) {
    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: {
                type: 'Identifier',
                name: props.helperModule,
            },
            computed: false,
            property: {
                type: 'Identifier',
                name: 'p',
            },
        },
        arguments: [
            {
                type: 'Literal',
                value: props.index,
            },
            props.decorator,
        ],
    };
}
exports.createMethodArgumentParam = createMethodArgumentParam;
function createMethodPropertyDecorator(props) {
    let id;
    if (props.isStatic) {
        id = {
            type: 'Identifier',
            name: props.className,
        };
    }
    else {
        id = {
            type: 'MemberExpression',
            object: {
                type: 'Identifier',
                name: props.className,
            },
            computed: false,
            property: {
                type: 'Identifier',
                name: 'prototype',
            },
        };
    }
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: 'Identifier',
                    name: props.helperModule,
                },
                computed: false,
                property: {
                    type: 'Identifier',
                    name: 'd',
                },
            },
            arguments: [
                {
                    type: 'ArrayExpression',
                    elements: props.elements,
                    typeAnnotation: [],
                    optional: false,
                },
                id,
                {
                    type: 'Literal',
                    value: props.methodName,
                },
                {
                    type: 'Literal',
                    value: null,
                },
            ],
        },
    };
}
exports.createMethodPropertyDecorator = createMethodPropertyDecorator;
