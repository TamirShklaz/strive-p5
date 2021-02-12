import { Context } from '../core/context';
import { IBundleContext } from '../moduleResolver/bundleContext';
import { IModule, IModuleMeta } from '../moduleResolver/module';
import { IPackage } from '../moduleResolver/package';
export interface ICachePublicProps {
    FTL?: boolean;
    enabled: boolean;
    root?: string;
}
export interface IModuleRestoreResponse {
    module?: IModule;
    mrc: IModuleResolutionContext;
}
export interface ICache {
    meta: ICacheMeta;
    nuke: () => void;
    restore: (absPath: string) => IModuleRestoreResponse;
    write: () => void;
}
export interface IModuleResolutionContext {
    modulesRequireResolution: Array<{
        absPath: string;
        pkg: IPackage;
    }>;
}
export interface ICacheMeta {
    ctx?: Record<string, any>;
    currentId?: number;
    modules: Record<number, IModuleMeta>;
    packages: Record<string, IPackage>;
}
export declare function createCache(ctx: Context, bundleContext: IBundleContext): ICache;
