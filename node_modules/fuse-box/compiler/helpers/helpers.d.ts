import { ASTNode } from '../interfaces/AST';
export declare function isLocalIdentifier(node: ASTNode, parent: ASTNode, propertyName: string): boolean;
export declare function isValidMethodDefinition(node: ASTNode): any;
export declare function isDefinedLocally(node: ASTNode): Array<{
    init: boolean;
    name: string;
}>;
export declare function createMemberExpression(obj: string, target: string): ASTNode;
export declare function createExpressionStatement(left: ASTNode, right: ASTNode): ASTNode;
export declare function defineVariable(name: string, right: ASTNode): ASTNode;
export declare function createVariableDeclaration(name: string, node: ASTNode): ASTNode;
export declare function createLiteral(value: any): ASTNode;
export declare function createExports(props: {
    exportsKey: string;
    exportsVariableName: string;
    property: ASTNode;
    useModule?: boolean;
}): ASTNode;
export declare function createRequireStatement(source: string, local?: string): {
    reqStatement: ASTNode;
    statement: ASTNode;
};
export declare const ES_MODULE_EXPRESSION: ASTNode;
export declare function createEsModuleDefaultInterop(props: {
    helperObjectName: string;
    helperObjectProperty: string;
    targetIdentifierName: string;
    variableName: string;
}): ASTNode;
export declare function createRequireCallExpression(elements: Array<ASTNode>): ASTNode;
export declare function createASTFromObject(obj: {
    [key: string]: any;
}): ASTNode;
export declare function isPropertyOrPropertyAccess(node: ASTNode, parent: ASTNode, propertyName: string): any[];
