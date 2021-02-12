import { IStyleSheetProps } from '../config/IStylesheetProps';
import { Context } from '../core/context';
import { IModule } from '../moduleResolver/module';
import { ICSSHandleResourcesProps } from './cssHandleResources';
import { IStyleSheetProcessor, IStylesheetModuleResponse } from './interfaces';
export interface ISassProps {
    macros?: {
        [key: string]: string;
    };
}
export interface ISassHandlerProps {
    ctx: Context;
    module: IModule;
    options: IStyleSheetProps;
}
interface IRenderModuleProps {
    ctx: Context;
    module: IModule;
    nodeSass: any;
    options?: IStyleSheetProps;
}
export declare function sassImporter(props: ICSSHandleResourcesProps): {
    contents: string;
    file: string;
};
export declare function renderModule(props: IRenderModuleProps): Promise<IStylesheetModuleResponse>;
export declare function sassHandler(props: ISassHandlerProps): IStyleSheetProcessor;
export {};
