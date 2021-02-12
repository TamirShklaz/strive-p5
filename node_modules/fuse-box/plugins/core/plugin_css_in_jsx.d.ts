import { Context } from '../../core/context';
export interface PluginCSSInJSXOptions {
    autoInject?: boolean;
    autoLabel?: boolean;
    cssPropOptimization?: boolean;
    emotionCoreAlias?: string;
    jsxFactory?: string;
    labelFormat?: string;
    sourceMap?: boolean;
    test?: RegExp | string;
}
export declare function pluginCSSInJSX(options?: PluginCSSInJSXOptions): (ctx: Context) => void;
