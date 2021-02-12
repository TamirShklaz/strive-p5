import { IPackageMeta, IResolverProps } from './resolver';
export interface IModuleParsed {
    name: string;
    target?: string;
}
export declare function isNodeModule(path: string): undefined | IModuleParsed;
export declare function parseAllModulePaths(fileAbsPath: string): string[];
export declare function parseExistingModulePaths(fileAbsPath: string): string[];
export interface TargetFolder {
    folder: string;
    /**
     * True if this folder appears to be a user-owned folder (one that the user edits)
     * as opposed to something downloaded by a package manager
     */
    isUserOwned: boolean;
}
export declare function findTargetFolder(props: IResolverProps, name: string): TargetFolder | {
    error: string;
};
export interface INodeModuleLookup {
    isEntry: boolean;
    /**
     * True if this folder appears to be a user-owned folder (one that the user edits)
     * as opposed to something downloaded by a package manager
     */
    isUserOwned: boolean;
    meta: IPackageMeta;
    targetAbsPath: string;
    targetExtension?: string;
    targetFuseBoxPath?: string;
}
export declare function nodeModuleLookup(props: IResolverProps, parsed: IModuleParsed): INodeModuleLookup | {
    error: string;
};
