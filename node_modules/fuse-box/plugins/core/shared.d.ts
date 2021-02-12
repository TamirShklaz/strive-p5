import { IStyleSheetProps } from '../../config/IStylesheetProps';
import { Context } from '../../core/context';
import { IModule } from '../../moduleResolver/module';
import { IStyleSheetProcessor } from '../../stylesheet/interfaces';
import { IPluginCommon } from '../interfaces';
export interface ICSSContextHandler {
    ctx: Context;
    fuseCSSModule: IModule;
    module: IModule;
    options: IStyleSheetProps;
    processor: IStyleSheetProcessor;
    shared: IPluginCommon;
}
export declare function setEmpty(): void;
export interface ICreateCSSModule {
    css?: string;
    module: IModule;
    shared: IPluginCommon;
}
export declare function cssContextHandler(props: ICSSContextHandler): void;
