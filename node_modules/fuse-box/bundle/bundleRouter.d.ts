import { Context } from '../core/context';
import { IBundleContext } from '../moduleResolver/bundleContext';
import { IModule } from '../moduleResolver/module';
import { ISplitEntry } from '../production/module/SplitEntries';
import { IBundleWriteResponse } from './bundle';
export interface IBundleRouter {
    generateBundles: (modules: Array<IModule>) => void;
    generateSplitBundles: (entries: Array<ISplitEntry>) => void;
    init: (modules: Array<IModule>) => void;
    writeBundles: () => Promise<Array<IBundleWriteResponse>>;
    writeManifest: (bundles: Array<IBundleWriteResponse>) => Promise<string>;
}
export interface IBundleRouteProps {
    bundleContext?: IBundleContext;
    ctx: Context;
    entries: Array<IModule>;
}
export declare function createBundleRouter(props: IBundleRouteProps): IBundleRouter;
