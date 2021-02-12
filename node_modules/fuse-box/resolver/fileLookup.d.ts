import { IRawCompilerOptions } from '../compilerOptions/interfaces';
export interface ILookupProps {
    fileDir?: string;
    filePath?: string;
    isBrowserBuild?: boolean;
    isDev?: boolean;
    javascriptFirst?: boolean;
    subPathResolver?: SubPathResolver;
    target: string;
    typescriptFirst?: boolean;
}
export interface TsConfigAtPath {
    absPath: string;
    compilerOptions: IRawCompilerOptions;
    tsconfigPath: string;
}
export interface TargetResolver {
    (lookupArgs: ILookupProps): ILookupResult | undefined;
}
export interface SubPathResolver {
    (modulePath: string, subPath: string, type?: 'file' | 'dir' | 'exists', props?: Partial<ILookupResult>): ILookupResult | undefined;
}
export interface ILookupResult {
    absPath: string;
    customIndex?: boolean;
    extension?: string;
    fileExists: boolean;
    isDirectoryIndex?: boolean;
    monorepoModulesPaths?: string;
    tsConfigAtPath?: TsConfigAtPath;
}
export declare const resolveIfExists: SubPathResolver;
export declare function fileLookup(props: ILookupProps): ILookupResult;
