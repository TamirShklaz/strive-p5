import { ISchema } from '../../compiler/core/nodeSchema';
import { ASTNode } from '../../compiler/interfaces/AST';
import { IModule } from '../../moduleResolver/module';
import { IProductionContext } from '../ProductionContext';
export interface ExportReferenceProps {
    module: IModule;
    productionContext: IProductionContext;
    schema: ISchema;
}
export declare enum ExportReferenceType {
    FUNCTION = 0,
    CLASS = 1,
    LOCAL_REFERENCE = 2
}
export interface IExportReferenceProps {
    local?: string;
    name: string;
    schema?: ISchema;
    scope: IExportReferences;
    targetObjectAst?: ASTNode;
    type: ExportReferenceType;
}
export declare function ExportReference(props: IExportReferenceProps): {
    local: string;
    name: string;
    targetObjectAst: ASTNode;
    type: ExportReferenceType;
    remove: () => void;
};
export declare type IExportReference = ReturnType<typeof ExportReference>;
export declare function HandleExportReferences(props: ExportReferenceProps, scope: IExportReferences): void;
export declare function ExportReferences(productionContext: IProductionContext, module: IModule): {
    references: {
        local: string;
        name: string;
        targetObjectAst: ASTNode;
        type: ExportReferenceType;
        remove: () => void;
    }[];
    register: (props: ExportReferenceProps) => void;
};
export declare type IExportReferences = ReturnType<typeof ExportReferences>;
