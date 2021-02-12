import { Context } from '../../core/context';
import { IModule } from '../../moduleResolver/module';
export interface IPluginLinkOptions {
    resourcePublicRoot?: string;
    useDefault?: boolean;
}
export declare function pluginLinkHandler(module: IModule, options?: IPluginLinkOptions): void;
export declare function pluginLink(target: RegExp | string, options?: IPluginLinkOptions): (ctx: Context) => void;
