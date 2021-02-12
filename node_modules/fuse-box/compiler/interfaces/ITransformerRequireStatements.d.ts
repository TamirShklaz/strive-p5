import { ASTNode } from './AST';
import { IRequireStatementModuleOptions } from './ITransformer';
import { ImportType } from './ImportType';
export interface ITransformerRequireStatement {
    importType: ImportType;
    moduleOptions?: IRequireStatementModuleOptions;
    statement: ASTNode;
    value?: string;
}
export declare type ITransformerRequireStatementCollection = Array<ITransformerRequireStatement>;
