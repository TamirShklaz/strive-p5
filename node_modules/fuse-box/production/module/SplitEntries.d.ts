import { IModule } from '../../moduleResolver/module';
import { IProductionContext } from '../ProductionContext';
import { IImport } from './ImportReference';
export interface ISplitEntry {
    entry: IModule;
    modules: Array<IModule>;
    references: Array<IImport>;
}
export interface ISplitEntryProps {
    module: IModule;
    productionContext: IProductionContext;
    subModules: Array<IModule>;
}
export declare function createSplitEntry(props: ISplitEntryProps): ISplitEntry;
export interface ISplitEntries {
    entries: Array<ISplitEntry>;
    ids: Record<number, boolean>;
    register: (splitEntry: ISplitEntry) => void;
}
export declare function createSplitEntries(): ISplitEntries;
