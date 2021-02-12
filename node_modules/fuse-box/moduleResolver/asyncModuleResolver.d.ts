import { Context } from '../core/context';
import { IBundleContext } from './bundleContext';
import { IModule } from './module';
export interface IModuleResolver {
    bundleContext: IBundleContext;
    entries: Array<IModule>;
    modules: Array<IModule>;
}
export interface IRelativeResolve {
    errored?: boolean;
    ignore?: boolean;
    module?: IModule;
}
export declare function asyncModuleResolver(ctx: Context, entryFiles: Array<string>): Promise<IModuleResolver>;
