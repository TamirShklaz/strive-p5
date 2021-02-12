import { ITransformer } from '../../interfaces/ITransformer';
import { ITransformerSharedOptions } from '../../interfaces/ITransformerSharedOptions';
interface BrowserProcessTransformProps {
    env?: {
        [key: string]: string;
    };
}
export declare type IBrowserProcessTransform = BrowserProcessTransformProps & ITransformerSharedOptions;
export declare const BUILD_ENV_NAME = "__build_env";
export declare function BuildEnvTransformer(): ITransformer;
export {};
