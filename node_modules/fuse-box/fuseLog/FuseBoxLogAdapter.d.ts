import { IFuseLoggerProps } from '../config/IFuseLoggerProps';
import { FuseLog } from './fuseLog';
export declare class FuseBoxLogAdapter extends FuseLog {
    props: IFuseLoggerProps;
    private _warnings;
    private _errors;
    private streaming;
    private startTime;
    ignoreStatementErrors: Array<RegExp>;
    constructor(props: IFuseLoggerProps);
    startStreaming(): void;
    stopStreaming(): void;
    startTimeMeasure(): void;
    clearLine(): void;
    flush(): void;
    verbose(group: string, message: string, vars?: any): void;
    clearConsole(): void;
    log(type: string, message: string): number | void;
    css(group: string, message: string): void;
    processing(group: string, message: string): void;
    line(): void;
    heading(message: string, vars?: any): void;
    fuseReloadHeader(): void;
    fuseHeader(props: {
        version: string;
        FTL?: boolean;
        mode: 'development' | 'production';
        entry: string;
        cacheFolder?: string;
    }): void;
    fuseFatal(header: string, messages?: Array<string>): void;
    printBottomMessages(): void;
    getTime(): any;
    fuseFinalise(): void;
}
export declare function createFuseLogger(props: IFuseLoggerProps): FuseBoxLogAdapter;
