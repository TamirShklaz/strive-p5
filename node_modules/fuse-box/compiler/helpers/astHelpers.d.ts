import { ASTNode } from '../interfaces/AST';
export declare function generateModuleNameFromSource(source: string, sourceReferences: any): string;
export declare function generateVariableFromSource(source: string, index: number): string;
export declare function createUndefinedVariable(name: string): ASTNode;
export declare function createVariableDeclaration(): ASTNode;
