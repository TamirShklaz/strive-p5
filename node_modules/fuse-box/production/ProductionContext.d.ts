import { IRunResponse } from '../core/IRunResponse';
import { Context } from '../core/context';
import { FuseBoxLogAdapter } from '../fuseLog/FuseBoxLogAdapter';
import { IBundleContext } from '../moduleResolver/bundleContext';
import { IModule } from '../moduleResolver/module';
import { ISplitEntries } from './module/SplitEntries';
export interface IProductionContext {
    bundleContext?: IBundleContext;
    ctx: Context;
    entries?: Array<IModule>;
    log?: FuseBoxLogAdapter;
    modules?: Array<IModule>;
    runResponse?: IRunResponse;
    splitEntries?: ISplitEntries;
}
export declare function createProductionContext(ctx: any): Promise<IProductionContext>;
