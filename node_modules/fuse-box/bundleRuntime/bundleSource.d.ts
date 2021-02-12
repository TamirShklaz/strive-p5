import { ITarget } from '../config/ITarget';
import { IModule } from '../moduleResolver/module';
import { Concat } from '../utils/utils';
import { ICodeSplittingMap } from './bundleRuntimeCore';
export interface IBundleSourceProps {
    isCSS?: boolean;
    isProduction?: boolean;
    target: ITarget;
    withSourcemaps?: boolean;
}
export interface IBundleGenerateProps {
    isIsolated?: boolean;
    runtimeCore: string;
}
export declare type BundleSource = {
    codeSplittingMap?: ICodeSplittingMap;
    containsMaps?: boolean;
    entries: Array<IModule>;
    exported?: boolean;
    injection?: Array<string>;
    modules: Array<IModule>;
    generate: (opts: IBundleGenerateProps) => Concat;
    generateHash: () => string;
};
export declare function createBundleSource(props: IBundleSourceProps): BundleSource;
