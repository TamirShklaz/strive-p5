import { IBundleWriteResponse } from '../bundle/bundle';
import { Context } from '../core/context';
import { FuseBoxLogAdapter } from '../fuseLog/FuseBoxLogAdapter';
export interface IWebIndexConfig {
    distFileName?: string;
    embedIndexedBundles?: boolean;
    enabled?: boolean;
    publicPath?: string;
    target?: string;
    template?: string;
}
export interface IWebIndexInterface {
    isDisabled?: boolean;
    addBundleContent?: (content: string) => void;
    generate?: (bundles: Array<IBundleWriteResponse>) => void;
    resolve?: (userPath: string) => string;
}
export declare function replaceWebIndexStrings(str: string, keys: Record<string, any>): string;
export declare function getEssentialWebIndexParams(config: IWebIndexConfig | boolean, log: FuseBoxLogAdapter): {
    distFileName: string;
    publicPath: string;
    templateContent: string;
    templatePath: string;
};
export declare function createWebIndex(ctx: Context): IWebIndexInterface;
