import { ITransformer } from '../../interfaces/ITransformer';
export interface IBundleFastConditionTransformer {
    isBrowser?: boolean;
    isServer?: boolean;
    env: {
        [key: string]: any;
    };
}
export declare function BundleFastConditionUnwrapper(): ITransformer;
