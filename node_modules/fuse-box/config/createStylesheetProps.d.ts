import { Context } from '../core/context';
import { IStyleSheetProps } from './IStylesheetProps';
export interface ICreateStylesheetProps {
    ctx: Context;
    stylesheet?: IStyleSheetProps;
}
export declare function createStylesheetProps(props: ICreateStylesheetProps): IStyleSheetProps;
