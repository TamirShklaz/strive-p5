import { Context } from '../../core/context';
/**
 * See https://github.com/asyncLiz/minify-html-literals after source input
 */
interface IPluginMinifyHtmlLiterals {
}
/**
 * Simple plugin to use npm module minify-html-literals
 * @param options
 */
export declare function pluginMinifyHtmlLiterals(...options: IPluginMinifyHtmlLiterals[]): (ctx: Context) => void;
export {};
