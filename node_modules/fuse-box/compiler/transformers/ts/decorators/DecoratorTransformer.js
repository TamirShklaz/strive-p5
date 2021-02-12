"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecoratorTransformer = void 0;
const helpers_1 = require("../../../helpers/helpers");
const ImportType_1 = require("../../../interfaces/ImportType");
const Metadata_1 = require("./Metadata");
const decorator_helpers_1 = require("./decorator_helpers");
function DecoratorTransformer() {
    const helperModule = '__fuse_decorate';
    return {
        target: { type: 'ts' },
        commonVisitors: props => {
            let helperInserted = false;
            const { transformationContext: { compilerOptions }, } = props;
            if (!compilerOptions.experimentalDecorators)
                return;
            const emitDecoratorMetadata = compilerOptions.emitDecoratorMetadata;
            return {
                onEach: (schema) => {
                    const { node, replace } = schema;
                    let targetClassBody;
                    let className;
                    if (node.$fuse_decoratorsProcessed)
                        return;
                    if (node.$fuse_decoratorForClassIdentifier) {
                        node.$fuse_decoratorsProcessed = true;
                        className = node.$fuse_decoratorForClassIdentifier;
                        if (node.decorators && node.decorators.length) {
                            const assumedDeclaration = node.declarations[0];
                            if (assumedDeclaration.init && assumedDeclaration.init.type === 'ClassDeclaration') {
                                assumedDeclaration.init.$fuse_decoratorsCaptured = true;
                                targetClassBody = assumedDeclaration.init.body.body;
                            }
                        }
                    }
                    else if (node.type === 'ClassDeclaration' && !node.$fuse_decoratorsCaptured) {
                        node.$fuse_decoratorsProcessed = true;
                        className = node.id.name;
                        targetClassBody = node.body.body;
                    }
                    if (targetClassBody) {
                        let classDecoratorArrayExpression;
                        const statements = [];
                        /**
                         * Class Decorators
                         *  @sealed
                         *   export class Hello {
                         *    second: string;
                         *  }
                         *
                         */
                        let classDecorator;
                        if (node.decorators && node.decorators.length) {
                            const expressions = [];
                            for (const dec of node.decorators) {
                                expressions.push(dec.expression);
                            }
                            classDecorator = decorator_helpers_1.createClassDecorators({
                                className: className,
                                decorators: expressions,
                                helperModule: helperModule,
                            });
                            //statements.push(classDecorator.expressionStatement);
                            // check for metadata
                            if (emitDecoratorMetadata) {
                                classDecoratorArrayExpression = classDecorator.arrayExpression;
                            }
                        }
                        // decorate properties
                        for (const item of targetClassBody) {
                            if (item.kind === 'constructor' && helpers_1.isValidMethodDefinition(item)) {
                                const params = item.value.params;
                                // special treatment for constructor params
                                if (params && params.length) {
                                    let constructorDecorators = [];
                                    decorator_helpers_1.collectDecorators({
                                        expressions: constructorDecorators,
                                        helperModule: helperModule,
                                        params,
                                    });
                                    if (constructorDecorators.length) {
                                        if (!classDecoratorArrayExpression) {
                                            classDecorator = decorator_helpers_1.createClassDecorators({
                                                className: className,
                                                decorators: [],
                                                helperModule: helperModule,
                                            });
                                            //statements.push(classDecorator.expressionStatement);
                                            classDecoratorArrayExpression = classDecorator.arrayExpression;
                                        }
                                        for (const exp of constructorDecorators) {
                                            classDecoratorArrayExpression.elements.push(exp);
                                        }
                                    }
                                }
                                if (classDecoratorArrayExpression) {
                                    classDecoratorArrayExpression.elements.push(Metadata_1.getParamTypes(item.value));
                                }
                            }
                            if (item.decorators && item.decorators.length) {
                                const expressions = [];
                                for (const dec of item.decorators) {
                                    expressions.push(dec.expression);
                                }
                                if (item.type === 'ClassProperty') {
                                    expressions.push(Metadata_1.getPropertyMetadata(item.typeAnnotation));
                                    statements.push(decorator_helpers_1.createPropertyDecorator({
                                        className: className,
                                        decorators: expressions,
                                        helperModule: helperModule,
                                        propertyName: item.key.name,
                                    }));
                                }
                            }
                            if (helpers_1.isValidMethodDefinition(item)) {
                                const params = item.value.params;
                                if (item.value && item.value.type === 'FunctionExpression') {
                                    if (item.kind !== 'constructor') {
                                        const expressions = [];
                                        if (item.decorators && item.decorators.length) {
                                            for (const methodDecorator of item.decorators) {
                                                expressions.push(methodDecorator.expression);
                                            }
                                        }
                                        if (params && params.length) {
                                            decorator_helpers_1.collectDecorators({ expressions, helperModule: helperModule, params });
                                        }
                                        if (expressions.length) {
                                            // method decorators metadata
                                            if (emitDecoratorMetadata) {
                                                const medatadata = decorator_helpers_1.createMethodMetadata({ node: item });
                                                expressions.push(medatadata.designType);
                                                expressions.push(medatadata.paramTypes);
                                                expressions.push(medatadata.returnType);
                                            }
                                            statements.push(decorator_helpers_1.createMethodPropertyDecorator({
                                                className: className,
                                                helperModule: helperModule,
                                                isStatic: item.static,
                                                methodName: item.key.name,
                                                elements: expressions,
                                            }));
                                        }
                                    }
                                }
                            }
                        }
                        if (classDecorator) {
                            statements.push(classDecorator.expressionStatement);
                        }
                        if (statements.length) {
                            replace([node].concat(statements));
                            if (!helperInserted) {
                                helperInserted = true;
                                const helper = helpers_1.createRequireStatement('fuse_helpers_decorate', helperModule);
                                if (props.onRequireCallExpression)
                                    props.onRequireCallExpression(ImportType_1.ImportType.REQUIRE, helper.reqStatement);
                                schema.bodyPrepend([helper.statement]);
                            }
                            return schema;
                        }
                    }
                },
            };
        },
    };
}
exports.DecoratorTransformer = DecoratorTransformer;
