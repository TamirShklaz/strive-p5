import { ASTNode } from './interfaces/AST';
export interface IParserOptions {
    jsx?: boolean;
    locations?: boolean;
}
export declare type ICodeParser = (code: string, props?: IParserOptions) => ASTNode;
export declare function parseTypeScript(code: string, props?: IParserOptions): ASTNode;
export declare function parseJavascript(code: string, props?: IParserOptions): ASTNode;
