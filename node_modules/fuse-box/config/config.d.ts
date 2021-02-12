import { Context } from '../core/context';
import { EnvironmentType } from './EnvironmentType';
import { IConfig, IPublicConfig } from './IConfig';
import { IRunProps } from './IRunProps';
export declare function Configuration(ctx: Context): IConfig;
export declare function createConfig(props: {
    ctx: Context;
    envType?: EnvironmentType;
    publicConfig: IPublicConfig;
    runProps: IRunProps;
}): IConfig;
