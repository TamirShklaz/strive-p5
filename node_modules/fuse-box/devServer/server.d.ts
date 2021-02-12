/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { IBundleWriteResponse } from '../bundle/bundle';
import { Context } from '../core/context';
export interface IServerStartProps {
    argsAfter?: Array<string>;
    argsBefore?: Array<string>;
    options?: Record<string, any>;
    processName?: string;
}
export interface IServerProcess {
    start: (props?: IServerStartProps) => ChildProcess;
    stop: () => void;
}
export declare const createServerProcess: (props: {
    bundles: Array<IBundleWriteResponse>;
    ctx: Context;
    processName: string;
}) => IServerProcess;
