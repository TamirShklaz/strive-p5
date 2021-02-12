import { ICompilerOptions } from '../compilerOptions/interfaces';
import { ITransformer } from './interfaces/ITransformer';
import { ITransformerRequireStatementCollection } from './interfaces/ITransformerRequireStatements';
import { ISerializableTransformationContext } from './transformer';
export declare function initCommonTransform(props: {
    code: string;
    compilerOptions?: ICompilerOptions;
    jsx?: boolean;
    props?: ISerializableTransformationContext;
    transformers: Array<ITransformer>;
}): {
    code: any;
    requireStatementCollection: ITransformerRequireStatementCollection;
};
