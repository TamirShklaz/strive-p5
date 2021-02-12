import { ISchema } from '../../compiler/core/nodeSchema';
import { IModule } from '../../moduleResolver/module';
import { IProductionContext } from '../ProductionContext';
export declare enum ImportType {
    SIDE_EFFECT_IMPORT = 0,
    IMPORT_SPECIFIERS = 1,
    DYNAMIC_IMPORT = 2,
    EXPORT_FROM = 3
}
export declare enum ImportSpecifierType {
    OBJECT_SPECIFIER = 0,
    NAMESPACE_SPECIFIER = 1
}
export interface IImportReferencesProps {
    module: IModule;
    productionContext: IProductionContext;
    schema: ISchema;
}
export interface IImportProps {
    module: IModule;
    schema: ISchema;
    source: string;
    specifiers?: Array<IImportSpecifier>;
    type: ImportType;
}
export interface IImport {
    module: IModule;
    removed: boolean;
    schema: ISchema;
    source: string;
    specifiers: Array<IImportSpecifier>;
    target: IModule;
    type: ImportType;
    remove: () => void;
}
export interface IImportSpecifier {
    local: string;
    name: string;
    removed: boolean;
    schema: ISchema;
    type: ImportSpecifierType;
    remove: () => void;
}
export interface IImportReferences {
    references: Array<IImport>;
    register: (props: IImportReferencesProps) => void;
}
export declare function ImportReferences(productionContext: IProductionContext, module: IModule): IImportReferences;
