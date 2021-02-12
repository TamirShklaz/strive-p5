import { ITransformer } from '../../../interfaces/ITransformer';
export interface IDecoratorTransformerOpts {
    emitDecoratorMetadata?: boolean;
    helperModule?: string;
}
export declare function DecoratorTransformer(): ITransformer;
