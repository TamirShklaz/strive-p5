import { ASTNode } from '../../interfaces/AST';
export declare function ensureExpressionConsistency(expression: ASTNode, node?: ASTNode): void;
export declare function convertToCallExpression(alternate: ASTNode, id: any, args: any): ASTNode;
export declare type OptionalChainHelper = ReturnType<typeof createOptionalChaningExpression>;
export declare function createOptionalChaningExpression(userId: string): {
    id: string;
    statement: ASTNode;
    setLeft: (item: ASTNode) => void;
    setRight: (item: ASTNode) => void;
};
