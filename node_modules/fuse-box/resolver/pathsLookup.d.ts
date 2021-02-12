import { ILookupResult } from './fileLookup';
export declare type ITypescriptPaths = {
    [key: string]: Array<string>;
};
interface IPathsLookupProps {
    baseURL: string;
    cachePaths?: boolean;
    configLocation?: string;
    isDev?: boolean;
    paths?: ITypescriptPaths;
    target: string;
}
export declare function pathsLookup(props: IPathsLookupProps): ILookupResult;
export {};
