import { CustomTransformers } from 'typescript';
import { ITransformer } from '../compiler/interfaces/ITransformer';
import { ICompilerOptions } from '../compilerOptions/interfaces';
import { EnvironmentType } from '../config/EnvironmentType';
import { IConfig, IPublicConfig } from '../config/IConfig';
import { IRunProps } from '../config/IRunProps';
import { IDevServerActions } from '../devServer/devServer';
import { IServerProcess } from '../devServer/server';
import { FuseBoxLogAdapter } from '../fuseLog/FuseBoxLogAdapter';
import { MainInterceptor } from '../interceptor/interceptor';
import { IBundleContext } from '../moduleResolver/bundleContext';
import { IModule } from '../moduleResolver/module';
import { IOutputConfig } from '../output/OutputConfigInterface';
import { DistWriter } from '../output/distWriter';
import { TargetResolver, TsConfigAtPath } from '../resolver/fileLookup';
import { CompilerHub } from '../threading/worker_threads/compilerHub';
import { IWebIndexInterface } from '../webIndex/webIndex';
import { ContextTaskManager } from './ContextTaskManager';
import { WeakModuleReferences } from './WeakModuleReferences';
export interface ILinkedReference {
    deps: Array<number>;
    mtime: number;
}
export declare type LinkedReferences = Record<string, ILinkedReference>;
export interface Context {
    bundleContext?: IBundleContext;
    cache?: Cache;
    compilerHub?: CompilerHub;
    compilerOptions?: ICompilerOptions;
    config?: IConfig;
    customTransformers?: CustomTransformers;
    devServer?: IDevServerActions;
    ict?: MainInterceptor;
    interceptor?: MainInterceptor;
    isWorking?: boolean;
    /**
     * A list of of references that do not come naturally in form of javascript imports
     * for example css imports
     * This will be used by the watcher to determine if a file should be reloaded
     */
    linkedReferences?: LinkedReferences;
    log?: FuseBoxLogAdapter;
    meta?: Record<string, any>;
    outputConfig?: IOutputConfig;
    serverProcess?: IServerProcess;
    systemDependencies?: Record<string, number>;
    taskManager?: ContextTaskManager;
    tsConfigAtPaths?: Array<TsConfigAtPath>;
    /**
     * This is a resolver that can take an import of an output file (such as dist/foo.js)
     * and resolve it to its corresponding source file (e.g. src/foo.ts)
     * These are built from recursing the "references" fields in tsconfig.json files
     * see https://www.typescriptlang.org/docs/handbook/project-references.html
     */
    tsTargetResolver?: TargetResolver;
    userTransformers?: Array<ITransformer>;
    weakReferences?: WeakModuleReferences;
    webIndex?: IWebIndexInterface;
    writer?: DistWriter;
    fatal?: (header: string, messages?: Array<string>) => void;
    getCachable?: () => any;
    sendPageReload?: (reason?: string) => void;
    setLinkedReference?: (asbPath: string, module: IModule) => void;
}
export interface ICreateContextProps {
    envType: EnvironmentType;
    publicConfig: IPublicConfig;
    runProps?: IRunProps;
    scriptRoot?: string;
}
export declare function createContext(props: ICreateContextProps): Context;
