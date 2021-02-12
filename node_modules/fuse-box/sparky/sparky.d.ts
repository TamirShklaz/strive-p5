export declare function sparky<T>(Ctx: new () => T): {
    activities: any[];
    exec: (name: string) => Promise<void>;
    rm: (folder: string) => void;
    src: (glob: string) => import("./sparky_chain").ISparkyChain;
    task: (name: string | RegExp, fn: (ctx: T) => void) => void;
};
