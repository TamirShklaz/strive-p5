import { IPublicConfig } from '../config/IConfig';
import { IRunProps } from '../config/IRunProps';
import { IRunResponse } from './IRunResponse';
export declare function fusebox(publicConfig: IPublicConfig): {
    runDev: (runProps?: IRunProps) => Promise<IRunResponse>;
    runProd: (runProps?: IRunProps) => Promise<IRunResponse>;
};
