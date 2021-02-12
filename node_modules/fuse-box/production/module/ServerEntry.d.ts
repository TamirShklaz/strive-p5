import { IBundleWriteResponse } from '../../bundle/bundle';
import { Context } from '../../core/context';
export declare function createServerEntry(ctx: Context, bundles: Array<IBundleWriteResponse>): Promise<IBundleWriteResponse>;
