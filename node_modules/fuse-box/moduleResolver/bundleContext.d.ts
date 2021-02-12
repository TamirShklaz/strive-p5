import { ICache } from '../cache/cache';
import { Context } from '../core/context';
import { IPackageMeta } from '../resolver/resolver';
import { IModule } from './module';
import { IPackage } from './package';
export declare type IBundleContext = ReturnType<typeof createBundleContext>;
export declare function createBundleContext(ctx: Context): {
    cache: ICache;
    currentId: number;
    injectedDependencies: Record<string, IModule>;
    modules: Record<string, IModule>;
    packages: Record<string, IPackage>;
    getIdFor: (absPath: string) => number;
    getModule: (absPath: string) => IModule;
    getPackage: (meta: IPackageMeta) => IPackage;
    setModule: (module: IModule) => void;
    setPackage: (pkg: IPackage) => void;
    tryCache: (absPath: any) => import("../cache/cache").IModuleRestoreResponse;
};
