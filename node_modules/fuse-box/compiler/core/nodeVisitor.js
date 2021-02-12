"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeVisitor = void 0;
const nodeSchema_1 = require("./nodeSchema");
const sharedContext_1 = require("./sharedContext");
const IRNOGED_TYPES = {
    ClassImplements: 1,
    decorators: 1,
    superTypeParameters: 1,
    typeAnnotation: 1,
    typeParameters: 1,
};
const IGNORED_KEYS = {
    decorators: 1,
    returnType: 1,
    typeAnnotation: 1,
    typeParameters: 1,
};
function nodeVisitor(rootProps) {
    let userFunc = rootProps.fn;
    const sharedContext = sharedContext_1.createSharedContext({ root: rootProps.ast, rootProps, visitFn: visitNode });
    const contextOverrides = rootProps.contextOverrides;
    if (contextOverrides) {
        for (const key in contextOverrides)
            sharedContext[key] = contextOverrides[key];
    }
    const root = rootProps.ast;
    function visitNode(props) {
        let { node, scope } = props;
        if (!scope)
            scope = [];
        // define scope
        const schema = nodeSchema_1.createSchema(props, sharedContext);
        sharedContext.preAct(schema);
        userFunc(schema);
        if (props.ignoreChildren || schema._childrenIgnored)
            return;
        // deep iterations
        for (const property in node) {
            if (property[0] === '$' || IGNORED_KEYS[property] === 1) {
                continue;
            }
            const child = node[property];
            if (Array.isArray(child)) {
                let i = 0;
                while (i < child.length) {
                    const item = child[i];
                    if (item && item.type && !IRNOGED_TYPES[item.type]) {
                        visitNode({ id: i, node: item, parent: node, property, scope: schema.nodeScope });
                    }
                    i++;
                }
            }
            else {
                if (child && child.type && !IRNOGED_TYPES[child.type]) {
                    visitNode({ node: child, parent: node, property, scope: schema.nodeScope });
                }
            }
        }
    }
    if (rootProps.programBodyFn) {
        // program body traversal
        const body = root.body;
        for (const item of body) {
            const schema = nodeSchema_1.createSchema({ avoidReVisit: true, avoidScope: true, ignoreChildren: true, node: item, parent: root, property: 'body' }, sharedContext);
            rootProps.programBodyFn(schema);
        }
        sharedContext.transform();
    }
    visitNode({ node: root });
    sharedContext.finalize();
    sharedContext.transform();
    return sharedContext;
}
exports.nodeVisitor = nodeVisitor;
