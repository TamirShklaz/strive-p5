import { Context } from '../core/context';
export interface IWatchablePathCacheCollection {
    indexFiles?: any;
}
export declare const WatchablePathCache: Record<string, IWatchablePathCacheCollection>;
export declare function bindWatcherReactions(ctx: Context): void;
