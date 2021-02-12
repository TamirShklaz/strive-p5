import { ITarget } from '../config/ITarget';
export declare const BUNDLE_RUNTIME_NAMES: {
    ARG_REQUIRE_FUNCTION: string;
    BUNDLE_FUNCTION: string;
    CACHE_MODULES: string;
    GLOBAL_OBJ: string;
    INTEROP_REQUIRE_DEFAULT_FUNCTION: string;
    MODULE_COLLECTION: string;
    REQUIRE_FUNCTION: string;
};
export declare function createGlobalModuleCall(moduleId: number): string;
export declare type ICodeSplittingMap = {
    b: Record<number, {
        p: string;
        s?: string;
    }>;
};
export interface IBundleRuntimeCore {
    codeSplittingMap?: ICodeSplittingMap;
    includeHMR?: boolean;
    interopRequireDefault?: boolean;
    isIsolated?: boolean;
    target: ITarget;
    typescriptHelpersPath?: string;
}
export declare function bundleRuntimeCore(props: IBundleRuntimeCore): string;
