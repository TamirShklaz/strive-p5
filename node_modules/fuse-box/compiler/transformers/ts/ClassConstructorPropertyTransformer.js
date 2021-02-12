"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassConstructorPropertyTransformer = void 0;
const helpers_1 = require("../../helpers/helpers");
const AST_1 = require("../../interfaces/AST");
const SUPER_WITH_ARGS = {
    expression: {
        arguments: [
            {
                argument: {
                    name: 'arguments',
                    type: 'Identifier',
                },
                type: 'SpreadElement',
            },
        ],
        callee: {
            type: 'Super',
        },
        type: 'CallExpression',
    },
    type: 'ExpressionStatement',
};
function ClassConstructorPropertyTransformer() {
    return {
        target: { type: 'ts' },
        commonVisitors: props => {
            let classIds = 0;
            return {
                onEach: (schema) => {
                    const { context, node, parent } = schema;
                    let StaticProps;
                    let ClassNode;
                    if (node.type === 'ClassDeclaration' ||
                        (node.type === 'ClassExpression' && !node.$fuse_class_declaration_visited)) {
                        if (node.body && node.body.type === 'ClassBody') {
                            const classBody = node.body;
                            if (classBody.type === 'ClassBody') {
                                const bodyInitializers = [];
                                let isConstructorFound = false;
                                let hasSuperClass = node.superClass;
                                let constructorNode;
                                ClassNode = node;
                                for (const bodyEl of classBody.body) {
                                    if (bodyEl.type === 'ClassProperty' && bodyEl.value) {
                                        if (bodyEl.static) {
                                            if (!StaticProps)
                                                StaticProps = [];
                                            StaticProps.push(bodyEl);
                                        }
                                        else {
                                            bodyInitializers.push({
                                                ast: bodyEl.value,
                                                computed: bodyEl.computed,
                                                param: bodyEl.key,
                                            });
                                        }
                                    }
                                    else if (helpers_1.isValidMethodDefinition(bodyEl) && bodyEl.kind === 'constructor') {
                                        isConstructorFound = true;
                                        constructorNode = bodyEl;
                                    }
                                }
                                if (bodyInitializers.length) {
                                    if (!isConstructorFound) {
                                        const bodyBlockStatement = [];
                                        if (hasSuperClass)
                                            bodyBlockStatement.push(SUPER_WITH_ARGS);
                                        // injecting constructor if none found
                                        classBody.body.splice(0, 0, {
                                            $fuse_classInitializers: bodyInitializers,
                                            key: {
                                                name: 'constructor',
                                                type: 'Identifier',
                                            },
                                            kind: 'constructor',
                                            type: 'MethodDefinition',
                                            value: {
                                                body: {
                                                    body: bodyBlockStatement,
                                                    type: 'BlockStatement',
                                                },
                                                params: [],
                                                type: 'FunctionExpression',
                                            },
                                        });
                                    }
                                    else
                                        constructorNode.$fuse_classInitializers = bodyInitializers;
                                }
                            }
                        }
                    }
                    if (helpers_1.isValidMethodDefinition(node) && node.kind === 'constructor') {
                        if (node.value.params) {
                            let index = 0;
                            let hasSomethingToAdd = false;
                            let thisParams = [];
                            while (index < node.value.params.length) {
                                const param = node.value.params[index];
                                if (param.type === AST_1.ASTType.ParameterProperty) {
                                    hasSomethingToAdd = true;
                                    let name;
                                    let obj;
                                    if (param.parameter.left) {
                                        obj = param.parameter.left;
                                        name = param.parameter.left.name;
                                    }
                                    else {
                                        obj = param.parameter;
                                        name = param.parameter.name;
                                    }
                                    thisParams.push({ ast: { name, type: 'Identifier' }, param: obj });
                                }
                                index++;
                            }
                            if (node.$fuse_classInitializers) {
                                hasSomethingToAdd = true;
                                thisParams = thisParams.concat(node.$fuse_classInitializers);
                            }
                            if (hasSomethingToAdd) {
                                const body = node.value.body.body;
                                const firstCallExpression = body[0];
                                let insertPosition = 0;
                                if (firstCallExpression &&
                                    firstCallExpression.expression &&
                                    firstCallExpression.expression.callee &&
                                    firstCallExpression.expression.callee.type === 'Super') {
                                    // start injecting initializations at pos. 1 because super() call
                                    // must always be the first call
                                    insertPosition = 1;
                                }
                                for (const item of thisParams) {
                                    body.splice(insertPosition, 0, {
                                        expression: {
                                            left: {
                                                computed: item.computed === true,
                                                object: { type: 'ThisExpression' },
                                                property: item.param,
                                                type: 'MemberExpression',
                                            },
                                            operator: '=',
                                            right: item.ast,
                                            type: 'AssignmentExpression',
                                        },
                                        type: 'ExpressionStatement',
                                    });
                                    insertPosition++;
                                }
                            }
                        }
                    }
                    // handle static props
                    if (StaticProps) {
                        if (!ClassNode.id)
                            ClassNode.id = { name: `_UnnamedClass_${++classIds}`, type: 'Identifier' };
                        const className = ClassNode.id.name;
                        const statements = [];
                        for (const prop of StaticProps) {
                            const statement = helpers_1.createExpressionStatement({
                                computed: prop.computed,
                                object: {
                                    name: className,
                                    type: 'Identifier',
                                },
                                property: prop.key,
                                type: 'MemberExpression',
                            }, prop.value);
                            statements.push(statement);
                        }
                        if (parent.body) {
                            // this is a simple case, where we have body to insert after
                            return schema.insertAfter(statements);
                        }
                        else {
                            if (ClassNode.$fuse_class_declaration_visited)
                                return;
                            // prevent the same transformer from visiting the same node
                            // Since we have done all the tranformers, but need to return exactly same CLASS
                            // due to a SequenceExpression transformation
                            ClassNode.$fuse_class_declaration_visited = true;
                            // we need to generate a new variable which will be appened to body
                            // e.g var _1_;
                            const NewSysVariableName = context.getNextSystemVariable();
                            const sequenceExpressions = { expressions: [], type: 'SequenceExpression' };
                            const classAssignment = {
                                left: { name: NewSysVariableName, type: 'Identifier' },
                                operator: '=',
                                right: ClassNode,
                                type: 'AssignmentExpression',
                            };
                            sequenceExpressions.expressions.push(classAssignment);
                            // convert expression statements to AssignmentExpression
                            // we also should modify the target object (it's a different variable now)
                            for (const oldStatement of statements) {
                                oldStatement.expression.left.object.name = NewSysVariableName;
                                const n = {
                                    left: oldStatement.expression.left,
                                    operator: '=',
                                    right: oldStatement.expression.right,
                                    type: 'AssignmentExpression',
                                };
                                sequenceExpressions.expressions.push(n);
                            }
                            sequenceExpressions.expressions.push({ name: NewSysVariableName, type: 'Identifier' });
                            // generate a declaration
                            const sysVariableDeclaration = {
                                declarations: [
                                    {
                                        id: {
                                            name: NewSysVariableName,
                                            type: 'Identifier',
                                        },
                                        init: null,
                                        type: 'VariableDeclarator',
                                    },
                                ],
                                kind: 'var',
                                type: 'VariableDeclaration',
                            };
                            return schema.bodyPrepend([sysVariableDeclaration]).replace(sequenceExpressions);
                        }
                    }
                },
            };
        },
    };
}
exports.ClassConstructorPropertyTransformer = ClassConstructorPropertyTransformer;
