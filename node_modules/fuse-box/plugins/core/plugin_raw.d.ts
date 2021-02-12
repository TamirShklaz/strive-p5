import { Context } from '../../core/context';
import { IModule } from '../../moduleResolver/module';
export declare type IPluginRawProps = {
    useDefault?: boolean;
};
export declare function pluginRawHandler(props: {
    ctx: Context;
    module: IModule;
    opts: IPluginRawProps;
}): void;
export declare function pluginRaw(a?: IPluginRawProps | RegExp | string, b?: IPluginRawProps): (ctx: Context) => void;
