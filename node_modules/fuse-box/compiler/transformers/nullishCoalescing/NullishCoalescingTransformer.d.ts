import { ISchema } from '../../core/nodeSchema';
import { ASTNode } from '../../interfaces/AST';
import { ITransformer } from '../../interfaces/ITransformer';
export declare function createNullishStatement(props: ILocalContext): {
    expression: ASTNode;
    setCondition: (node: ASTNode) => void;
    setRight: (node: ASTNode) => void;
};
interface ILocalContext {
    schema: ISchema;
    genId?: () => string;
}
export declare function NullishCoalescingTransformer(): ITransformer;
export {};
