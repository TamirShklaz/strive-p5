import { ASTNode } from '../../../interfaces/AST';
export declare const __DECORATE__: {
    type: string;
    object: {
        type: string;
        name: string;
    };
    computed: boolean;
    property: {
        type: string;
        name: string;
    };
};
export declare const FUSEBOX_DECORATOR_META: ASTNode;
export declare function createPropertyDecorator(props: {
    helperModule: string;
    className: ASTNode;
    propertyName: string;
    decorators: Array<ASTNode>;
}): ASTNode;
export declare function createDecoratorRequireHelperStatement(moduleName: string, params: Array<string>): {
    type: string;
    kind: string;
    declare: boolean;
    declarations: {
        type: string;
        init: {
            type: string;
            callee: {
                type: string;
                name: string;
            };
            arguments: {
                type: string;
                value: string;
            }[];
        };
        id: {
            type: string;
            properties: any[];
        };
    }[];
};
export interface IClassDecorator {
    expressionStatement: ASTNode;
    arrayExpression: ASTNode;
}
export declare function createClassDecorators(props: {
    className: string;
    helperModule: string;
    decorators: Array<ASTNode>;
}): IClassDecorator;
export declare function createMethodMetadata(props: {
    node?: ASTNode;
}): {
    designType: ASTNode;
    returnType: ASTNode;
    paramTypes: ASTNode;
};
export declare function createMethodDecorator(props: {
    helperModule: string;
    className: ASTNode;
    isStatic?: boolean;
    methodName: string;
    decorators: Array<ASTNode>;
}): ASTNode;
export declare function collectDecorators(opts: {
    helperModule: string;
    expressions: Array<ASTNode>;
    params: Array<ASTNode>;
}): Array<ASTNode>;
export declare function createMethodArgumentParam(props: {
    index?: number;
    decorator: ASTNode;
    helperModule: string;
}): ASTNode;
export declare function createMethodPropertyDecorator(props: {
    index?: number;
    helperModule: string;
    className: ASTNode;
    isStatic: boolean;
    methodName: string;
    elements: Array<ASTNode>;
}): ASTNode;
