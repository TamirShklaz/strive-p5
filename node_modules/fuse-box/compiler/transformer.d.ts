import { ICompilerOptions } from '../compilerOptions/interfaces';
import { PackageType } from '../moduleResolver/package';
import { ASTNode } from './interfaces/AST';
import { ITransformerResult } from './interfaces/ITranformerResult';
import { ITransformer } from './interfaces/ITransformer';
export declare const USER_CUSTOM_TRANSFORMERS: Record<string, ITransformer>;
/**
 * Order of those transformers MATTER!
 */
export declare const BASE_TRANSFORMERS: Array<ITransformer>;
export declare function isTransformerEligible(absPath: string, transformer: ITransformer): boolean;
export interface ISerializableTransformationContext {
    compilerOptions?: ICompilerOptions;
    config?: {
        electron?: {
            nodeIntegration?: boolean;
        };
    };
    module?: {
        absPath?: string;
        extension?: string;
        isSourceMapRequired?: boolean;
        publicPath?: string;
    };
    pkg?: {
        type: PackageType;
    };
}
export declare function registerTransformer(name: string, transformer: ITransformer): void;
export declare function transformCommonVisitors(props: ISerializableTransformationContext, ast: ASTNode): ITransformerResult;
