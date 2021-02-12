import { IPublicConfig } from '../../config/IConfig';
import { IWebWorkerProcessProps } from './interfaces';
export declare class WebWorkerProcess {
    props: IWebWorkerProcessProps;
    bundleName: string;
    isRunning: boolean;
    constructor(props: IWebWorkerProcessProps);
    resolveWebWorkerBundlePath(): string;
    run(customConfig?: IPublicConfig): Promise<void>;
}
export declare function registerWebWorkerProcess(props: IWebWorkerProcessProps): WebWorkerProcess;
