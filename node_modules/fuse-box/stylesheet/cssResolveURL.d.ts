import { IStyleSheetProps } from '../config/IStylesheetProps';
import { Context } from '../core/context';
export interface ICSSResolveURLProps {
    contents: string;
    ctx: Context;
    filePath: string;
    options: IStyleSheetProps;
}
export interface IURLReplaced {
    destination: string;
    original: string;
    publicPath: string;
}
export declare function defineResourceGroup(extension: any): "images" | "fonts" | "svg" | "ico" | "documents";
export declare function resolveCSSResource(target: any, props: ICSSResolveURLProps): IURLReplaced;
export interface ICSSResolveURLResult {
    contents: string;
    replaced: Array<IURLReplaced>;
}
export declare function mapErrorLine(contents: string, offset: number): string;
export declare function cssResolveURL(props: ICSSResolveURLProps): ICSSResolveURLResult;
