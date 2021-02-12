"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildEnvTransformer = exports.BUILD_ENV_NAME = void 0;
const AST_1 = require("../../interfaces/AST");
const parser_1 = require("../../parser");
exports.BUILD_ENV_NAME = '__build_env';
const CACHE_AST = {};
function getEnvAST(obj) {
    let str;
    if (typeof obj === 'string')
        str = obj;
    else
        str = JSON.stringify(obj);
    if (CACHE_AST[str])
        return CACHE_AST[str];
    let ast;
    if (typeof obj === 'object') {
        ast = parser_1.parseJavascript('var a = ' + str);
    }
    else {
        try {
            ast = parser_1.parseJavascript(str);
        }
        catch (e) {
            throw new Error(`Error while parsing string : "${str}".
Make sure you're passing a valid javascript string.
Otherwise pass a javascript object (it will be converting to AST automatically)
`);
        }
    }
    const body = ast.body;
    const firstItem = body[0];
    if (firstItem) {
        let expression;
        switch (firstItem.type) {
            case AST_1.ASTType.ExpressionStatement:
                expression = firstItem.expression;
                break;
            case AST_1.ASTType.VariableDeclaration:
                expression = firstItem.declarations[0].init;
                break;
            default:
                break;
        }
        if (expression)
            CACHE_AST[str] = expression;
        return expression;
    }
    return CACHE_AST[str];
}
function BuildEnvTransformer() {
    return {
        commonVisitors: props => {
            const compilerOptions = props.transformationContext.compilerOptions;
            const buildEnv = compilerOptions.buildEnv;
            return {
                onEach: (schema) => {
                    const { node } = schema;
                    if (node.type === AST_1.ASTType.MemberExpression && node.object.name === exports.BUILD_ENV_NAME) {
                        const propertyName = node.property.name;
                        if (buildEnv[propertyName] !== undefined) {
                            const ast = getEnvAST(buildEnv[propertyName]);
                            if (ast)
                                return schema.replace(ast);
                        }
                        return schema.replace({ name: 'undefined', type: AST_1.ASTType.Identifier });
                    }
                    return;
                },
            };
        },
    };
}
exports.BuildEnvTransformer = BuildEnvTransformer;
