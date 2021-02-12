import { IThreadingConfig } from '../../config/IThreadingConfig';
import { IModuleCompilerProps } from '../compile/moduleCompiler';
export declare function createWorkerClients(config: IThreadingConfig): {
    compile: (props: IModuleCompilerProps) => void;
    launch: () => void;
    terminate: () => void;
};
