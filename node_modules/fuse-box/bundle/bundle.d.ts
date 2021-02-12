import { BundleSource } from '../bundleRuntime/bundleSource';
import { Context } from '../core/context';
import { IModule } from '../moduleResolver/module';
import { IOutputBundleConfigAdvanced } from '../output/OutputConfigInterface';
import { IWriterConfig } from '../output/distWriter';
import { Concat } from '../utils/utils';
export interface Bundle {
    config: IWriterConfig;
    containsAPI?: boolean;
    containsApplicationEntryCall?: boolean;
    contents: string;
    data: Concat;
    entries?: Array<IModule>;
    exported?: boolean;
    isCSSType?: boolean;
    priority: number;
    source: BundleSource;
    type: BundleType;
    webIndexed: boolean;
    createSourceMap: (sourceMap: string) => Promise<void>;
    generate: (opts?: {
        runtimeCore?: string;
    }) => Promise<IBundleWriteResponse>;
    generateHMRUpdate?: () => string;
    prepare: () => IWriterConfig;
    write: () => Promise<IBundleWriteResponse>;
    path?: string;
}
export declare enum BundleType {
    CSS_APP = 1,
    CSS_SPLIT = 2,
    JS_APP = 3,
    JS_SERVER_ENTRY = 4,
    JS_SPLIT = 5,
    JS_VENDOR = 6
}
export interface IBundleProps {
    bundleConfig?: IOutputBundleConfigAdvanced;
    ctx: Context;
    fileName?: string;
    priority?: number;
    type?: BundleType;
    webIndexed?: boolean;
}
export interface IBundleWriteResponse {
    absPath: string;
    browserPath: string;
    bundle?: Bundle;
    relativePath: string;
}
export declare function createBundle(props: IBundleProps): Bundle;
