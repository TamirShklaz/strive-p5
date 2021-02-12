import { ASTNode } from '../interfaces/AST';
export declare enum expressionValueTypes {
    SINGLE_ASTERISK = 0,
    DOUBLE_ASTERISK = 1
}
/**
 * get the source of an dynamic import
 * @param node
 */
export declare function getDynamicImport(node: ASTNode): {
    error?: string;
    source?: string;
};
export interface IComputedStatementPaths {
    error?: string;
    paths?: Array<string>;
}
/**
 * This function tries to generate a glob pattern based on the input
 * Valid inputs are a BinaryExpression or TemplateLiteral
 *
 * import('./atoms/' + b);
 * import('./atoms/' + b + '/' + c);
 * import(`./atoms/${a}`);
 *
 * @param node
 */
export declare function computedStatementToPath(node: ASTNode): IComputedStatementPaths;
