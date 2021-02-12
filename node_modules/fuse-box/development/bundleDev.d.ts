import { IRunResponse } from '../core/IRunResponse';
import { Context } from '../core/context';
export declare function bundleDev(props: {
    ctx: Context;
    rebundle?: boolean;
}): Promise<IRunResponse>;
