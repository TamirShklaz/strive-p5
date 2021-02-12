import { IStylesheetModuleResponse } from '../interfaces';
export interface IStylusRenderer {
    contents: string;
    filePath: string;
    paths?: Array<string>;
    sourceRoot?: string;
    withSourceMaps?: boolean;
    onImportString?: (str: string) => string | void;
    onImportFile?: (props: {
        value: string;
        isExternal?: boolean;
    }) => void;
    onStyle?: (handler?: any) => void;
    onURL?: (filePath: string, value: string) => string | void;
}
export declare function stylusRender(props: IStylusRenderer): Promise<IStylesheetModuleResponse>;
