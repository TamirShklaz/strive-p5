import { IModule } from '../../moduleResolver/module';
import { IProductionContext } from '../ProductionContext';
import { IExportReferences } from './ExportReference';
import { IImport, IImportReferences } from './ImportReference';
export declare enum ModuleType {
    MAIN_MODULE = 0,
    SPLIT_MODULE = 1
}
export interface IModuleTree {
    dependants: Array<IImport>;
    exportReferences: IExportReferences;
    importReferences: IImportReferences;
    moduleType: ModuleType;
}
export interface IModuleTreeProps {
    module: IModule;
    productionContext: IProductionContext;
}
export declare function ModuleTree({ module, productionContext }: IModuleTreeProps): IModuleTree;
