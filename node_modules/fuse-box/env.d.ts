export declare const env: {
    APP_ROOT: any;
    CACHE: {
        PACKAGES: string;
        PROJET_FILES: string;
        ROOT: string;
    };
    FUSE_MODULES: string;
    FUSE_ROOT: any;
    SCRIPT_FILE: string;
    SCRIPT_PATH: string;
    VERSION: any;
    WORKER_THREAD: string;
    isTest: boolean;
};
export declare function getPackageManagerData(): {
    name: string;
    installCmd: string;
    installDevCmd: string;
};
export declare function getDevelopmentApi(): string;
export declare function openDevelopmentApi(): string;
export declare function closeDevelopmentApi(): string;
