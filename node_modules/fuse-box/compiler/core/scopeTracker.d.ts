import { ASTNode } from '../interfaces/AST';
import { ISchema } from './nodeSchema';
export declare function extractDefinedVariables(schema: ISchema, node: ASTNode, names: Record<string, ISchemaRecord>): any;
export declare type INodeScope = Array<IBodyScope>;
export declare type ISchemaRecord = {
    node: ASTNode;
    schema: ISchema;
};
export declare type IBodyScope = Record<string, ISchemaRecord>;
export declare function scopeTracker(schema: ISchema): IBodyScope;
