import { ASTNode } from '../../compiler/interfaces/AST';
import { ImportType } from '../../compiler/interfaces/ImportType';
import { ISerializableTransformationContext } from '../../compiler/transformer';
export interface IOnReadyResponse {
    contents?: string;
    sourceMap?: string;
}
export interface IModuleCompilerProps {
    absPath?: string;
    ast?: ASTNode;
    contents?: string;
    context?: ISerializableTransformationContext;
    generateCode?: boolean;
    onError: (message: string) => void;
    onFatal?: (message: any) => void;
    onReady: (reponse: IOnReadyResponse) => void;
    onResolve: (props: {
        importType: ImportType;
        source: string;
    }) => Promise<{
        id?: number;
    }>;
}
export declare function moduleCompiler(props: IModuleCompilerProps): Promise<void>;
