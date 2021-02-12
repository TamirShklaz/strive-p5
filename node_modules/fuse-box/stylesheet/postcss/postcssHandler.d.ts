import { IStyleSheetProps } from '../../config/IStylesheetProps';
import { Context } from '../../core/context';
import { IModule } from '../../moduleResolver/module';
import { IStyleSheetProcessor, IStylesheetModuleResponse } from '../interfaces';
interface IRenderModuleProps {
    ctx: Context;
    module: IModule;
    options?: IStyleSheetProps;
}
export declare function renderModule(props: IRenderModuleProps): Promise<IStylesheetModuleResponse>;
export interface IPostCSSHandlerProps {
    ctx: Context;
    module: IModule;
    options: IStyleSheetProps;
}
export declare function postCSSHandler(props: IPostCSSHandlerProps): IStyleSheetProcessor;
export {};
