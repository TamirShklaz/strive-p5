import { ISchema } from '../../core/nodeSchema';
import { ASTNode } from '../../interfaces/AST';
import { ITransformer } from '../../interfaces/ITransformer';
interface IChainingStep {
    callArguments?: Array<ASTNode>;
    computed?: boolean;
    expression?: ASTNode;
    optional?: boolean;
}
declare function createOptionalContext(schema: ISchema): {
    declaration: ASTNode;
    schema: ISchema;
    steps: IChainingStep[];
    genId: () => string;
};
declare type OptionalChainContext = ReturnType<typeof createOptionalContext>;
/**
 * Drill every single property on the OptionalChain
 * Split it into steps and prepare for flattening
 * @param node
 * @param context
 */
export declare function chainDrill(node: ASTNode, context: OptionalChainContext): any;
export declare function OptionalChaningTransformer(): ITransformer;
export {};
