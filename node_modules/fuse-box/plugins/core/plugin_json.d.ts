import { Context } from '../../core/context';
import { IModule } from '../../moduleResolver/module';
export interface IJSONPluginProps {
    path?: string;
    useDefault?: boolean;
}
export declare function pluginJSONHandler(module: IModule, opts: IJSONPluginProps): void;
export declare function pluginJSON(a?: IJSONPluginProps | RegExp | string, b?: IJSONPluginProps): (ctx: Context) => void;
