import { Context } from '../core/context';
import { IModule } from '../moduleResolver/module';
export interface IAlignCSSSourceMap {
    ctx: Context;
    module: IModule;
    sourceMap: any;
}
export declare function alignCSSSourceMap(props: IAlignCSSSourceMap): string;
