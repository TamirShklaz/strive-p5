import { ASTNode } from '../compiler/interfaces/AST';
import { ITransformerResult } from '../compiler/interfaces/ITranformerResult';
import { ImportType } from '../compiler/interfaces/ImportType';
import { ISerializableTransformationContext } from '../compiler/transformer';
import { Context } from '../core/context';
import { ITypescriptTarget } from '../interfaces/TypescriptInterfaces';
import { IModuleTree } from '../production/module/ModuleTree';
import { IStylesheetModuleResponse } from '../stylesheet/interfaces';
import { IRelativeResolve } from './asyncModuleResolver';
import { IPackage } from './package';
export declare function Module(): void;
export interface IModule {
    absPath?: string;
    ast?: ASTNode;
    breakDependantsCache?: boolean;
    captured?: boolean;
    contents?: string;
    css?: IStylesheetModuleResponse;
    ctx?: Context;
    dependencies?: Array<number>;
    errored?: boolean;
    extension?: string;
    id?: number;
    ignore?: boolean;
    isCSSModule?: boolean;
    isCSSSourceMapRequired?: boolean;
    isCSSText?: boolean;
    isCached?: boolean;
    isCommonsEligible?: boolean;
    isEntry?: boolean;
    isExecutable?: boolean;
    isJavaScript?: boolean;
    isSourceMapRequired?: boolean;
    isSplit?: boolean;
    isStylesheet?: boolean;
    isTypeScript?: boolean;
    moduleSourceRefs?: Record<string, IModule>;
    moduleTree?: IModuleTree;
    pending?: Array<Promise<any>>;
    pkg?: IPackage;
    publicPath?: string;
    sourceMap?: string;
    storage?: Record<string, any>;
    props?: {
        fuseBoxPath?: string;
    };
    generate?: () => void;
    getMeta?: () => any;
    getTransformationContext?: () => ISerializableTransformationContext;
    init?: () => void;
    initFromCache?: (meta: IModuleMeta, data: {
        contents: string;
        sourceMap: string;
    }) => void;
    parse?: () => ASTNode;
    read?: () => string;
    resolve?: (props: {
        importType?: ImportType;
        statement: string;
    }) => Promise<IRelativeResolve>;
    transpile?: () => ITransformerResult;
    transpileDown?(buildTarget: ITypescriptTarget): void;
}
export interface IModuleMeta {
    absPath: string;
    breakDependantsCache?: boolean;
    dependencies: Array<number>;
    id: number;
    mtime: number;
    packageId?: string;
    publicPath: string;
    v?: Array<number>;
}
export declare function createModule(props: {
    absPath?: string;
    ctx?: Context;
    pkg?: IPackage;
}): IModule;
