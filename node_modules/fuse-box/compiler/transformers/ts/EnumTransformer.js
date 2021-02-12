"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumTransformer = void 0;
const AST_1 = require("../../interfaces/AST");
const computeBinaryExpression_1 = require("../../static_compute/computeBinaryExpression");
function enumStringValueExpression(enumName, property, value) {
    return {
        expression: {
            left: {
                computed: true,
                object: {
                    name: enumName,
                    type: 'Identifier',
                },
                property: {
                    type: 'Literal',
                    value: property,
                },
                type: 'MemberExpression',
            },
            operator: '=',
            right: {
                type: 'Literal',
                value: value,
            },
            type: 'AssignmentExpression',
        },
        type: 'ExpressionStatement',
    };
}
function EnumTransformer() {
    return {
        target: { type: 'ts' },
        commonVisitors: props => {
            return {
                onEach: (schema) => {
                    const { node } = schema;
                    if (node.type === AST_1.ASTType.EnumDeclaration) {
                        const enumName = node.id.name;
                        const Declaration = {
                            declarations: [
                                {
                                    id: {
                                        name: enumName,
                                        type: 'Identifier',
                                    },
                                    init: null,
                                    type: 'VariableDeclarator',
                                },
                            ],
                            kind: 'var',
                            type: 'VariableDeclaration',
                        };
                        const enumBody = [];
                        const EnumWrapper = {
                            arguments: [
                                {
                                    left: {
                                        name: enumName,
                                        type: 'Identifier',
                                    },
                                    operator: '||',
                                    right: {
                                        left: {
                                            name: enumName,
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
                                    body: enumBody,
                                    type: 'BlockStatement',
                                },
                                generator: false,
                                id: null,
                                params: [
                                    {
                                        name: enumName,
                                        type: 'Identifier',
                                    },
                                ],
                                type: 'FunctionExpression',
                            },
                            type: 'CallExpression',
                        };
                        let index = 0;
                        const computedValues = {};
                        const members = {};
                        for (const member of node.members) {
                            const prop = member.id;
                            //members[memberName] = 1;
                            let rightValue;
                            let memberName;
                            if (prop.type === 'Literal')
                                memberName = prop.value;
                            else
                                memberName = prop.name;
                            members[memberName] = 1;
                            if (member.initializer) {
                                if (member.initializer.type === 'Literal' && typeof member.initializer.value === 'string') {
                                    enumBody.push(enumStringValueExpression(enumName, memberName, member.initializer.value));
                                }
                                else {
                                    const computed = computeBinaryExpression_1.computeBinaryExpression(member.initializer, computedValues);
                                    if (!computed.value) {
                                        // if we couldn't compute a value for the property
                                        // we still need to check if it has references to our enum
                                        // an convert it to a member expression
                                        for (const key in computed.collected) {
                                            if (members[key]) {
                                                const n = computed.collected[key];
                                                // since we don't know the parent (speed wise)
                                                // we replace the object directly
                                                n.type = 'MemberExpression';
                                                n.object = {
                                                    name: enumName,
                                                    type: 'Identifier',
                                                };
                                                n.property = {
                                                    name: key,
                                                    type: 'Identifier',
                                                };
                                            }
                                        }
                                        rightValue = member.initializer;
                                    }
                                    else {
                                        // value has been computed correctlu
                                        // we can replace it with just a value now
                                        computedValues[memberName] = computed.value;
                                        rightValue = { type: 'Literal', value: computed.value };
                                    }
                                }
                            }
                            else
                                rightValue = { type: 'Literal', value: index++ };
                            if (rightValue) {
                                enumBody.push({
                                    left: {
                                        computed: true,
                                        object: {
                                            name: enumName,
                                            type: 'Identifier',
                                        },
                                        property: {
                                            left: {
                                                computed: true,
                                                object: {
                                                    name: enumName,
                                                    type: 'Identifier',
                                                },
                                                property: {
                                                    type: 'Literal',
                                                    value: memberName,
                                                },
                                                type: 'MemberExpression',
                                            },
                                            operator: '=',
                                            right: rightValue,
                                            type: 'AssignmentExpression',
                                        },
                                        type: 'MemberExpression',
                                    },
                                    operator: '=',
                                    right: {
                                        type: 'Literal',
                                        value: memberName,
                                    },
                                    type: 'AssignmentExpression',
                                });
                            }
                        }
                        return schema.replace([Declaration, EnumWrapper]);
                    }
                },
            };
        },
    };
}
exports.EnumTransformer = EnumTransformer;
