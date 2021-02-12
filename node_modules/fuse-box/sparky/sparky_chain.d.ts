import { FuseBoxLogAdapter } from '../fuseLog/FuseBoxLogAdapter';
import { IBumpVersion } from './bumpVersion';
import { TscOptions } from './tsc';
export interface ISparkyChain {
    bumpVersion: (mask: RegExp | string, opts: IBumpVersion) => ISparkyChain;
    clean: () => ISparkyChain;
    contentsOf: (mask: RegExp | string, fn: (contents: string) => string) => ISparkyChain;
    dest: (target: string, base: string) => ISparkyChain;
    exec: () => Promise<Array<string>>;
    filter: (a: ((file: string) => any) | RegExp) => ISparkyChain;
    src: (glob: string) => ISparkyChain;
    tsc: (opts: TscOptions) => ISparkyChain;
    write: () => ISparkyChain;
}
export declare function sparkyChain(log: FuseBoxLogAdapter): ISparkyChain;
