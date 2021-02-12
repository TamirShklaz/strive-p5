import { IPublicConfig } from '../../config/IConfig';
import { Context } from '../../core/context';
export declare function pluginWebWorker(opts?: {
    config?: IPublicConfig;
}): (ctx: Context) => void;
