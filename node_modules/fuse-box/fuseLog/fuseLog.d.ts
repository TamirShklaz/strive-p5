export declare abstract class FuseLog {
    indent: string;
    abstract log(type: string, message: string): any;
    getString(message: string, vars?: any): string;
    echo(message: string, vars?: any): void;
    info(group: string, message: string, vars?: any): void;
    warn(message: string, vars?: any): void;
    success(message: string, vars?: any): void;
    meta(group: string, message: string, vars?: any): void;
    error(message: string, vars?: any): void;
}
