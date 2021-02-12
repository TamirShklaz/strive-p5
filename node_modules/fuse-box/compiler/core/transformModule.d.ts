import { ASTNode } from '../interfaces/AST';
import { ITransformerList } from '../interfaces/ITransformer';
import { ISharedContextOverrides } from './sharedContext';
export interface ITransformModuleProps {
    contextOverrides?: ISharedContextOverrides;
    root: ASTNode;
    transformers: ITransformerList;
}
export declare function transformModule(props: ITransformModuleProps): void;
