import { ASTNode } from '../interfaces/AST';
import { ISchema } from './nodeSchema';
import { INodeVisitorProps, IVisitNodeProps } from './nodeVisitor';
export interface ISharedContextProps {
    root: ASTNode;
    rootProps: INodeVisitorProps;
    visitFn: (x: IVisitNodeProps) => any;
}
interface INodeOperation {
    nodes: Array<ASTNode>;
    schema: ISchema;
}
declare type IRefInterceptor = (schema: ISchema) => any;
export declare type ISharedContextOverrides = Record<string, any>;
export interface IFork {
    contextOverrides?: ISharedContextOverrides;
    root: ASTNode;
}
export declare class SharedContext {
    props: ISharedContextProps;
    private localRefListeners;
    private onCompleteCallbacks;
    private variableCounter;
    constructor(props: ISharedContextProps);
    esModuleStatementInjected: boolean;
    moduleExportsName: string;
    jsxFactory?: string;
    visit: (x: IVisitNodeProps) => any;
    sourceReferences: {};
    fork: (props: IFork) => void;
    getModuleName(source: any): string;
    getNextSystemVariable: () => string;
    preAct(schema: ISchema): ISchema;
    coreReplacements: Record<string, {
        first: string;
        second?: string;
        inUse?: boolean;
    }>;
    _replace: Array<INodeOperation>;
    _insert: Array<INodeOperation>;
    _remove: Array<ISchema>;
    _prepend: Array<Array<ASTNode>>;
    _append: Array<Array<ASTNode>>;
    onRef: (name: string, fn: IRefInterceptor) => void;
    onComplete: (fn: () => any, priority?: number) => void;
    finalize: () => void;
    transform: () => void;
}
export declare function createSharedContext(props: ISharedContextProps): SharedContext;
export {};
