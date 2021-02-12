import { ASTNode } from '../interfaces/AST';
declare type ComputedIdentfiers = {
    [key: string]: any;
};
export declare function computeBinaryExpression(node: ASTNode, ce?: ComputedIdentfiers): {
    value: any;
    collected: {};
};
export {};
