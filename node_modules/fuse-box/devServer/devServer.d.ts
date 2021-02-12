import { Context } from '../core/context';
import { IHTTPServerProps, IOpenProps, IProxyCollection } from './devServerProps';
export interface IDevServerActions {
    clientSend: (name: string, payload: any, ws_instance?: WebSocket) => void;
    onClientMessage: (fn: (name: string, payload: any) => void) => void;
}
interface ICreateReactAppExtraProps {
    openProps?: IOpenProps;
    proxyProps?: Array<IProxyCollection>;
}
export declare function createExpressApp(ctx: Context, props: IHTTPServerProps, extra?: ICreateReactAppExtraProps): any;
export declare function createDevServer(ctx: Context): IDevServerActions;
export {};
