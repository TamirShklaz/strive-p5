import { Context } from '../core/context';
export declare type IWatcher = ReturnType<typeof createWatcher>;
export declare enum WatcherReaction {
    UNMATCHED = 0,
    TS_CONFIG_CHANGED = 1,
    FUSE_CONFIG_CHANGED = 2,
    PACKAGE_LOCK_CHANGED = 3,
    PROJECT_FILE_CHANGED = 4
}
export declare type ChokidarChangeEvent = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';
export interface Reaction {
    absPath: string;
    event?: ChokidarChangeEvent;
    reaction: WatcherReaction;
}
export declare type ReactionStack = Array<Reaction>;
export declare function createWatcher(ctx: Context): {
    init: () => void;
};
