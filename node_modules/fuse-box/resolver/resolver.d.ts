import { ImportType } from '../compiler/interfaces/ImportType';
import { ITarget } from '../config/ITarget';
import { TargetResolver, TsConfigAtPath } from './fileLookup';
import { INodeModuleLookup } from './nodeModuleLookup';
export interface ITypescriptPathsConfig {
    baseURL: string;
    tsconfigPath?: string;
    paths?: {
        [key: string]: Array<string>;
    };
}
export interface IResolverProps {
    buildTarget?: ITarget;
    cachePaths?: boolean;
    electronNodeIntegration?: boolean;
    filePath?: string;
    importType?: ImportType;
    isDev?: boolean;
    javascriptFirst?: boolean;
    modules?: Array<string>;
    packageMeta?: IPackageMeta;
    target: string;
    tsTargetResolver?: TargetResolver;
    typescriptPaths?: ITypescriptPathsConfig;
    alias?: {
        [key: string]: string;
    };
}
export interface IPackageMeta {
    browser?: string | {
        [key: string]: string | boolean;
    };
    entryAbsPath?: string;
    entryFuseBoxPath?: string;
    name: string;
    packageAltRoots?: Array<string>;
    packageJSONLocation?: string;
    packageRoot?: string;
    version?: string;
    fusebox?: {
        dev?: boolean;
        polyfill?: boolean;
        system?: boolean;
    };
}
export interface IResolver {
    error?: string;
    extension?: string;
    isExternal?: boolean;
    skip?: boolean;
    package?: INodeModuleLookup;
    absPath?: string;
    monorepoModulesPath?: string;
    tsConfigAtPath?: TsConfigAtPath;
}
export declare function resolveModule(props: IResolverProps): IResolver;
