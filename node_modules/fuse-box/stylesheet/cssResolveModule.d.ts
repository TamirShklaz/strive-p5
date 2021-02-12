import { IStyleSheetProps } from '../config/IStylesheetProps';
export interface IResolveCSSModuleProps {
    extensions: Array<string>;
    options: IStyleSheetProps;
    paths: Array<string>;
    target: string;
    tryUnderscore: boolean;
}
export declare function replaceCSSMacros(target: string, macros: {
    [key: string]: string;
}): string;
export interface IResolveCSSModuleResult {
    path?: string;
    success: boolean;
}
export declare function cssResolveModule(props: IResolveCSSModuleProps): IResolveCSSModuleResult;
