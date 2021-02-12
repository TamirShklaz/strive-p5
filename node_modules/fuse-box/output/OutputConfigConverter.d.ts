import { IOutputConfig, IPublicOutputConfig } from './OutputConfigInterface';
export interface IOutputConfigProps {
    defaultPublicPath?: string;
    defaultRoot?: string;
    publicConfig?: IPublicOutputConfig;
}
export declare function outputConfigConverter(props: IOutputConfigProps): IOutputConfig;
