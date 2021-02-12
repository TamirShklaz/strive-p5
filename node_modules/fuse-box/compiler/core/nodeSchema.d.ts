import { ICompilerOptions } from '../../compilerOptions/interfaces';
import { ASTNode } from '../interfaces/AST';
import { IVisitNodeProps } from './nodeVisitor';
import { INodeScope, ISchemaRecord } from './scopeTracker';
import { SharedContext } from './sharedContext';
export interface ILocalIdentifier {
    isShorthand: boolean;
    name: string;
}
interface IRevisitOptions {
    forceRevisit?: boolean;
    stopPropagation?: boolean;
}
export interface ISchema {
    _childrenIgnored?: boolean;
    id?: number;
    ignoreChildren?: boolean;
    node?: ASTNode;
    parent?: ASTNode;
    property?: string;
    scope?: INodeScope;
    context: SharedContext;
    localIdentifier?: ILocalIdentifier;
    nodeScope?: INodeScope;
    state: IControllerTempState;
    bodyAppend: (nodes: Array<ASTNode>) => ISchema;
    bodyPrepend: (nodes: Array<ASTNode>) => ISchema;
    ensureESModuleStatement: (compilerOptions: ICompilerOptions) => any;
    getLocal?: (name: string) => ISchemaRecord;
    ignore?: () => ISchema;
    insertAfter: (nodes: Array<ASTNode>) => ISchema;
    remove: () => ISchema;
    replace: (nodes: ASTNode | Array<ASTNode>, options?: IRevisitOptions) => ISchema;
}
interface IControllerTempState {
    replace?: Array<ASTNode>;
}
export declare function createSchema(props: IVisitNodeProps, context: SharedContext): ISchema;
export {};
