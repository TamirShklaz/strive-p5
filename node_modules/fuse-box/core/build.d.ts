import { IBundleContext } from '../moduleResolver/bundleContext';
import { IModule } from '../moduleResolver/module';
import { ISplitEntries } from '../production/module/SplitEntries';
import { IRunResponse } from './IRunResponse';
import { Context } from './context';
interface IBuildProps {
    bundleContext: IBundleContext;
    ctx: Context;
    entries: Array<IModule>;
    modules: Array<IModule>;
    rebundle?: boolean;
    splitEntries?: ISplitEntries;
}
export declare const createBuild: (props: IBuildProps) => Promise<IRunResponse>;
export {};
