import { Context } from '../../core/context';
import { IModuleCompilerProps } from '../compile/moduleCompiler';
export declare type CompilerHub = ReturnType<typeof createCompilerHub>;
export declare function createCompilerHub(ctx: Context): {
    compile: (props: IModuleCompilerProps) => Promise<void>;
    launch: () => void;
    terminate: () => void;
};
