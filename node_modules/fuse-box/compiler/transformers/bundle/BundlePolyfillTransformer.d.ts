import { ITransformer } from '../../interfaces/ITransformer';
import { ITransformerSharedOptions } from '../../interfaces/ITransformerSharedOptions';
export declare type IBundleEssntialTransformerOptions = ITransformerSharedOptions;
export declare const PolyfillEssentialConfig: {
    Buffer: string;
    __dirname: string;
    __filename: string;
    buffer: string;
    global: string;
    http: string;
    https: string;
    process: string;
    stream: string;
};
export declare function BundlePolyfillTransformer(): ITransformer;
