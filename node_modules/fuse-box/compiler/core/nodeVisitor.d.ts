import { ASTNode } from '../interfaces/AST';
import { ISchema } from './nodeSchema';
import { INodeScope } from './scopeTracker';
import { SharedContext, ISharedContextOverrides } from './sharedContext';
import { ITransformModuleProps } from './transformModule';
export interface INodeVisitorProps {
    ast: ASTNode;
    contextOverrides?: ISharedContextOverrides;
    visitorProps: ITransformModuleProps;
    fn: (schema: ISchema) => any;
    programBodyFn?: (schema: ISchema) => any;
}
export interface IVisitNodeProps {
    avoidReVisit?: boolean;
    avoidScope?: boolean;
    id?: number;
    ignoreChildren?: boolean;
    node?: ASTNode;
    parent?: ASTNode;
    property?: string;
    scope?: INodeScope;
    skipPreact?: boolean;
    userFunc?: (schema: ISchema) => any;
}
export declare function nodeVisitor(rootProps: INodeVisitorProps): SharedContext;
