import { IStyleSheetProps } from '../../config/IStylesheetProps';
import { Context } from '../../core/context';
import { IModule } from '../../moduleResolver/module';
import { IStyleSheetProcessor } from '../interfaces';
export interface ILessHandlerProps {
    ctx: Context;
    module: IModule;
    options: IStyleSheetProps;
}
export declare function renderModule(props: {
    ctx: Context;
    less: any;
    module: IModule;
    options: IStyleSheetProps;
}): Promise<{
    css: string;
    map: string;
}>;
export declare function lessHandler(props: ILessHandlerProps): IStyleSheetProcessor;
