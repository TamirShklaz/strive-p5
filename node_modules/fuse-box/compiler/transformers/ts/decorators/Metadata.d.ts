import { ASTNode } from '../../../interfaces/AST';
export declare function metatadataAST(type: string, arg: any): ASTNode;
export declare function getPropertyMetadata(annotation: ASTNode): ASTNode;
export declare function getMethodPropertiesMetadata(node: ASTNode): any[];
export declare function getParamTypes(node: ASTNode): ASTNode;
