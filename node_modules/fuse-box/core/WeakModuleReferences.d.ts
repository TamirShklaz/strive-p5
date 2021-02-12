import { Context } from './context';
/**
 * This module is used to store "weak" references for non-js modules
 * For example a scss file can have multiple import, none of those imports actually belong to the project
 * hence won't be matched by the wather. In order to solve this sutation we map those references to corresponding modules
 */
export declare class WeakModuleReferences {
    ctx: Context;
    collection: {
        [key: string]: Array<string>;
    };
    constructor(ctx: Context);
    add(absPath: string, filePath: string): void;
    flush(): void;
    find(absPath: string): Array<string>;
}
export declare function createWeakModuleReferences(ctx: Context): WeakModuleReferences;
