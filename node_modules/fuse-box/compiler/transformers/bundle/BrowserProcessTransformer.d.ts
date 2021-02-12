import { ITransformer } from '../../interfaces/ITransformer';
import { ITransformerSharedOptions } from '../../interfaces/ITransformerSharedOptions';
interface BrowserProcessTransformProps {
    env?: {
        [key: string]: string;
    };
}
export declare type IBrowserProcessTransform = BrowserProcessTransformProps & ITransformerSharedOptions;
export declare function BrowserProcessTransformer(): ITransformer;
export {};
