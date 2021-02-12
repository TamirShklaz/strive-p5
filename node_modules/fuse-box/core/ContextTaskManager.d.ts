import { Context } from './context';
export declare class ContextTaskManager {
    private ctx;
    private copyFilesTask;
    constructor(ctx: Context);
    copyFile(original: string, target: string): void;
    private perform;
    private flush;
}
export declare function createContextTaskManager(ctx: Context): ContextTaskManager;
