import { IStyleSheetProps } from '../../config/IStylesheetProps';
import { Context } from '../../core/context';
export interface ICSSPluginProps {
    asText?: boolean;
    stylesheet?: IStyleSheetProps;
}
export declare function pluginCSS(a?: ICSSPluginProps | RegExp | string, b?: ICSSPluginProps): (ctx: Context) => void;
