import { IStyleSheetProps } from '../config/IStylesheetProps';
import { Context } from '../core/context';
import { IModule } from '../moduleResolver/module';
import { IStylesheetModuleResponse } from './interfaces';
export interface ICSSModuleRender {
    ctx: Context;
    data: IStylesheetModuleResponse;
    fuseCSSModule: IModule;
    module: IModule;
    options: IStyleSheetProps;
    useDefault?: boolean;
}
export declare function cssDevModuleRender(props: ICSSModuleRender): void;
