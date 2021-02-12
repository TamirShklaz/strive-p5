import { ICompilerOptionTransformer } from '../../compilerOptions/interfaces';
import { ITransformer } from '../interfaces/ITransformer';
export declare function createCoreTransformerOption(name: string, opts: any): ICompilerOptionTransformer;
export declare function getCoreTransformer(props: ICompilerOptionTransformer): ITransformer;
