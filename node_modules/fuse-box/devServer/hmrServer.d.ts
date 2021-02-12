import { Context } from '../core/context';
import { IHMRServerProps } from './devServerProps';
export interface ISocketClientInterface {
    getClient(): WebSocket;
    onMessage?: (fn: (name: string, payload: any) => void) => void;
    sendEvent(name: string, payload?: any, ws_instance?: WebSocket): any;
}
export declare function createClient(client: any): ISocketClientInterface;
export declare type HMRServerMethods = ISocketClientInterface & {};
export interface ICreateHMRServerProps {
    ctx: Context;
    internalServer?: any;
    opts: IHMRServerProps;
}
export declare function createHMRServer(props: ICreateHMRServerProps): HMRServerMethods;
