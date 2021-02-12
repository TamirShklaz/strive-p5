"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionalChaningTransformer = exports.chainDrill = void 0;
const astHelpers_1 = require("../../helpers/astHelpers");
const AST_1 = require("../../interfaces/AST");
const optionalChaningHelpers_1 = require("./optionalChaningHelpers");
const VALID_NODES = {
    [AST_1.ASTType.AwaitExpression]: 1,
    [AST_1.ASTType.ChainExpression]: 1,
    [AST_1.ASTType.OptionalCallExpression]: 1,
    [AST_1.ASTType.OptionalMemberExpression]: 1,
};
function createOptionalContext(schema) {
    const steps = [];
    const declaration = astHelpers_1.createVariableDeclaration();
    const self = {
        declaration,
        schema,
        steps,
        genId: () => {
            const nextVar = schema.context.getNextSystemVariable();
            declaration.declarations.push(astHelpers_1.createUndefinedVariable(nextVar));
            return nextVar;
        },
    };
    return self;
}
function createPartialExpression(props) {
    let expression;
    const { flatExpression, nodes, shouldExtractThis } = props;
    const firstNode = nodes[0];
    let thisVariable;
    if (nodes.length === 1) {
        if (shouldExtractThis) {
            if (firstNode.expression.type === 'MemberExpression') {
                thisVariable = flatExpression.context.genId();
                firstNode.expression.object = {
                    left: { name: thisVariable, type: 'Identifier' },
                    operator: '=',
                    right: firstNode.expression.object,
                    type: 'AssignmentExpression',
                };
                return { expression: firstNode.expression, thisVariable };
            }
        }
        return { expression: firstNode.expression };
    }
    const total = nodes.length;
    let index = 0;
    while (index < total) {
        const item = nodes[index];
        const isLast = index === total - 1;
        const computed = item.computed || (item.expression && item.expression.type === AST_1.ASTType.Literal);
        // call expression
        if (item.callArguments) {
            if (index === 1) {
                expression = createOptionalCall(flatExpression, item.callArguments);
            }
            else {
                expression = {
                    arguments: item.callArguments,
                    callee: expression,
                    type: 'CallExpression',
                };
            }
        }
        else {
            if (!expression) {
                expression = {
                    object: item.expression,
                    property: null,
                    type: 'MemberExpression',
                };
            }
            else {
                // if we see a next property while having an existing CallExpression, we must
                // converte to a MemberExpression with an object as the current CallExpression
                if (expression.type === 'CallExpression')
                    expression = { object: expression, property: null, type: 'MemberExpression' };
                if (!expression.property) {
                    expression.property = item.expression;
                    expression.computed = computed;
                }
                else {
                    expression = {
                        computed: computed,
                        object: expression,
                        property: item.expression,
                        type: 'MemberExpression',
                    };
                }
            }
        }
        if (isLast && shouldExtractThis) {
            // adding an expression statement
            // E.g a statement like a?.b.c.d.e.f?.();
            // The second part b.c.d.e.f, gets converted into
            // (_new_variable = _1_.b.c.d.e).f)
            if (expression.object) {
                thisVariable = flatExpression.context.genId();
                expression.object = {
                    left: { name: thisVariable, type: 'Identifier' },
                    operator: '=',
                    right: expression.object,
                    type: 'AssignmentExpression',
                };
            }
            else {
            }
        }
        index++;
    }
    return { expression, thisVariable };
}
function createOptionalCall(expression, callArguments) {
    let args = [];
    if (expression.thisVariable) {
        args.push({
            name: expression.thisVariable,
            type: 'Identifier',
        });
    }
    else {
        return {
            arguments: callArguments,
            callee: {
                computed: false,
                name: expression.id,
                type: 'Identifier',
            },
            type: 'CallExpression',
        };
    }
    args = args.concat(callArguments);
    return {
        arguments: args,
        callee: {
            computed: false,
            object: {
                name: expression.id,
                type: 'Identifier',
            },
            property: {
                name: 'call',
                type: 'Identifier',
            },
            type: 'MemberExpression',
        },
        type: 'CallExpression',
    };
}
function createFlatExpression(context) {
    const self = {
        context,
        collect: () => {
            let initialLeft;
            if (self.conditionSteps) {
                initialLeft = createPartialExpression({
                    flatExpression: self,
                    nodes: self.conditionSteps,
                    shouldExtractThis: !!self.alternate[0].callArguments,
                });
            }
            self.id = context.genId();
            const targets = self.alternate;
            let expression = optionalChaningHelpers_1.createOptionalChaningExpression(self.id);
            if (self.conditionSteps) {
                expression.setLeft(initialLeft.expression);
                if (initialLeft.thisVariable) {
                    self.thisVariable = initialLeft.thisVariable;
                }
            }
            // inserting the current identifier
            targets.unshift({ expression: { name: self.id, type: 'Identifier' } });
            const dataRight = createPartialExpression({
                flatExpression: self,
                nodes: targets,
                shouldExtractThis: self.shouldExtractThis,
            });
            expression.setRight(dataRight.expression);
            // should notify the following call expression to use "this" variable
            if (self.nextFlatExpression && dataRight.thisVariable)
                self.nextFlatExpression.thisVariable = dataRight.thisVariable;
            return expression;
        },
        generate: () => {
            let expression = self.collect();
            let next = self.nextFlatExpression;
            while (next) {
                const data = next.collect();
                data.setLeft(expression.statement);
                expression = data;
                next = next.nextFlatExpression;
            }
            return expression;
        },
    };
    return self;
}
function createStatement(context) {
    const { steps } = context;
    const flatCollection = [];
    let index;
    let current;
    const amount = steps.length;
    index = amount - 1;
    while (index >= 0) {
        const step = steps[index];
        const prev = flatCollection[flatCollection.length - 1];
        if (!step.optional && prev)
            prev.items.push(step);
        else
            flatCollection.push({ items: [step] });
        index--;
    }
    index = flatCollection.length - 1;
    while (index >= 0) {
        const item = flatCollection[index];
        if (index > 0) {
            let flatExpression = createFlatExpression(context);
            flatExpression.alternate = item.items;
            if (current) {
                flatExpression.shouldExtractThis = !!current.alternate[0].callArguments;
                flatExpression.nextFlatExpression = current;
            }
            current = flatExpression;
        }
        else {
            current.conditionSteps = item.items;
        }
        index--;
    }
    const { statement } = current.generate();
    return statement;
}
/**
 * Drill every single property on the OptionalChain
 * Split it into steps and prepare for flattening
 * @param node
 * @param context
 */
function chainDrill(node, context) {
    let optional = node.optional === true;
    if (node.type === AST_1.ASTType.ThisExpression) {
        context.steps.push({ computed: false, expression: { name: 'this', type: 'Identifier' }, optional });
    }
    if (node.type === AST_1.ASTType.ChainExpression) {
        return chainDrill(node.expression, context);
    }
    if (node.type === AST_1.ASTType.MemberExpression) {
        if (node.property) {
            context.steps.push({ computed: node.computed, expression: node.property, optional });
        }
        if (node.object)
            chainDrill(node.object, context);
        return;
    }
    if (node.type === AST_1.ASTType.CallExpression) {
        if (node.callee) {
            context.steps.push({
                callArguments: node.arguments,
                optional,
            });
            return chainDrill(node.callee, context);
        }
    }
    if (node.type == AST_1.ASTType.Identifier) {
        context.steps.push({ computed: node.computed, expression: node });
        return;
    }
    if ((node.type === AST_1.ASTType.AsExpression || node.type == AST_1.ASTType.NonNullExpression) && node.expression) {
        return chainDrill(node.expression, context);
    }
}
exports.chainDrill = chainDrill;
function OptionalChaningTransformer() {
    return {
        commonVisitors: props => {
            return {
                onEach: (schema) => {
                    const { node } = schema;
                    if (!VALID_NODES[node.type])
                        return;
                    let expressionNode = node;
                    let isAwaitExpression = false;
                    if (node.type === AST_1.ASTType.AwaitExpression) {
                        // swap the node for await argument
                        // since that needs to replace with an expression call
                        if (node.argument && VALID_NODES[node.argument.type]) {
                            expressionNode = node.argument;
                            isAwaitExpression = true;
                        }
                        else
                            return;
                    }
                    const context = createOptionalContext(schema);
                    chainDrill(expressionNode, context);
                    let statement = createStatement(context);
                    if (isAwaitExpression) {
                        statement = {
                            arguments: [statement],
                            callee: { name: 'await', type: 'Identifier' },
                            type: 'CallExpression',
                        };
                    }
                    return schema.bodyPrepend([context.declaration]).replace(statement);
                },
            };
        },
    };
}
exports.OptionalChaningTransformer = OptionalChaningTransformer;
