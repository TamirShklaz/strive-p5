import { Context } from '../../core/context';
export declare type IPluginReplaceProps = {
    [key: string]: any;
};
export declare function pluginReplace(a?: IPluginReplaceProps | RegExp | string, b?: IPluginReplaceProps): (ctx: Context) => void;
