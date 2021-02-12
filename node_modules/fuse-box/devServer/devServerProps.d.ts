import { Context } from '../core/context';
export declare type IDevServerProxy = {
    [key: string]: {
        target?: string;
        changeOrigin?: boolean;
        pathRewrite?: {
            [key: string]: string;
        };
    };
};
export interface IHMRServerProps {
    connectionURL?: string;
    enabled?: boolean;
    port?: number;
    useCurrentURL?: boolean;
}
export interface IHTTPServerProps {
    enabled?: boolean;
    fallback?: string;
    port?: number;
    root?: string;
    express?: (app: any, express: any) => void;
}
export interface IOpenProps {
    app?: Array<string> | string;
    background?: boolean;
    target?: string;
    wait?: boolean;
}
export interface IProxyCollection {
    options: any;
    path: string;
}
export interface IDevServerProps {
    enabled?: boolean;
    hmrServer?: IHMRServerProps | boolean;
    httpServer?: IHTTPServerProps | boolean;
    open?: IOpenProps | boolean;
    proxy?: Array<IProxyCollection>;
}
export declare function createDevServerConfig(ctx: Context): IDevServerProps;
