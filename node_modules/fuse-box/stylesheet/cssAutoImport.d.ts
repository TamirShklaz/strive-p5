import { IStyleSheetProps } from '../config/IStylesheetProps';
export interface ICSSAutoImportProps {
    contents: string;
    stylesheet: IStyleSheetProps;
    url: string;
}
export declare function cssAutoImport(props: ICSSAutoImportProps): string;
