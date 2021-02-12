import { IStyleSheetProps } from '../config/IStylesheetProps';
import { Context } from '../core/context';
import { IModule } from '../moduleResolver/module';
export interface ICSSHandleResourcesProps {
    ctx: Context;
    fileRoot?: string;
    module: IModule;
    options: IStyleSheetProps;
    url?: string;
}
export declare function cssHandleResources(opts: {
    contents: string;
    path: string;
}, props: ICSSHandleResourcesProps): {
    contents: string;
    file: string;
};
