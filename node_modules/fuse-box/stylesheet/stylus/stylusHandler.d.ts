import { IStyleSheetProps } from '../../config/IStylesheetProps';
import { Context } from '../../core/context';
import { IModule } from '../../moduleResolver/module';
import { IStyleSheetProcessor } from '../interfaces';
export interface IPostCSSHandlerProps {
    ctx: Context;
    module: IModule;
    options: IStyleSheetProps;
}
export declare function stylusHandler(props: IPostCSSHandlerProps): IStyleSheetProcessor;
